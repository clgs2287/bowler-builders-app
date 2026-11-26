-- Restore the approved Phase 2 reservation functions. Keep the center and verification tables, their data and RLS.
begin;
create or replace function public.create_public_reservation(payload jsonb)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  next_id text := coalesce(nullif(payload->>'id', ''), gen_random_uuid()::text);
  next_tournament_id text := coalesce(nullif(payload->>'tournamentKey', ''), nullif(payload->>'tournament', ''), '');
  next_name text := lower(trim(coalesce(payload->>'name', '')));
  next_nickname text := lower(trim(coalesce(payload->>'nickname', '')));
  settings jsonb;
  reservation_bucket jsonb;
  schedule_data jsonb;
  current_max_number integer := 0;
  next_number integer := 1;
  registered_count integer := 0;
  reservation_limit integer := 48;
  next_status text := 'Registered';
  next_data jsonb;
begin
  if next_tournament_id = '' then raise exception 'Tournament is required.'; end if;
  if next_name = '' and next_nickname = '' and lower(trim(coalesce(payload->>'email', ''))) = '' then
    raise exception 'Reservation name or email is required.';
  end if;

  -- Serializes public single/team inserts and prevents configuration changes from
  -- racing the entry-open or capacity decision.
  lock table public.app_settings in share mode;
  lock table public.schedule_events in share mode;
  lock table public.reservations in share row exclusive mode;
  select value into settings from public.app_settings where id = 'reservation_state';
  reservation_bucket := settings->'reservationsByTournament'->next_tournament_id;
  select data into schedule_data from public.schedule_events
  where id = next_tournament_id or data->>'eventId' = next_tournament_id
  limit 1;
  if coalesce(
    schedule_data->'reservationSettings'->>'entriesOpen',
    reservation_bucket->>'entriesOpen',
    case when settings->>'tournamentKey' = next_tournament_id then settings->>'entriesOpen' end,
    'false'
  ) <> 'true' then
    raise exception 'Entries are closed for this tournament.';
  end if;

  if exists (select 1 from public.reservations where tournament_id = next_tournament_id and (
    (next_name <> '' and next_name in (lower(trim(coalesce(name, ''))), lower(trim(coalesce(data->>'name', ''))), lower(trim(coalesce(data->>'nickname', ''))))) or
    (next_nickname <> '' and next_nickname in (lower(trim(coalesce(name, ''))), lower(trim(coalesce(data->>'name', ''))), lower(trim(coalesce(data->>'nickname', '')))))
  )) then
    raise exception 'This bowler is already on the reservation list.';
  end if;

  select coalesce(max(greatest(
    case when coalesce(data->>'registrationNumber', '') ~ '^[0-9]+$' then (data->>'registrationNumber')::integer else 0 end,
    case when coalesce(data->>'confirmationNumber', '') ~ '^[0-9]+$' then (data->>'confirmationNumber')::integer else 0 end
  )), 0) into current_max_number
  from public.reservations where tournament_id = next_tournament_id;
  next_number := greatest(current_max_number + 1, 1);

  select coalesce(
    case when coalesce(schedule_data->'reservationSettings'->>'reservationLimit', '') ~ '^[0-9]+$' then (schedule_data->'reservationSettings'->>'reservationLimit')::integer end,
    case when coalesce(settings->'reservationsByTournament'->next_tournament_id->>'reservationLimit', '') ~ '^[0-9]+$' then (settings->'reservationsByTournament'->next_tournament_id->>'reservationLimit')::integer end,
    case when settings->>'tournamentKey' = next_tournament_id and coalesce(settings->>'reservationLimit', '') ~ '^[0-9]+$' then (settings->>'reservationLimit')::integer end,
    48
  ) into reservation_limit;
  reservation_limit := coalesce(reservation_limit, 48);

  select count(distinct coalesce(nullif(data->>'reservationGroupId', ''), id))::integer into registered_count from public.reservations
  where tournament_id = next_tournament_id
    and coalesce(nullif(trim(data->>'status'), ''), 'Registered') = 'Registered';
  next_status := case
    when lower(coalesce(payload->>'status', '')) like 'wait%' then 'Waitlisted'
    when reservation_limit > 0 and registered_count >= reservation_limit then 'Waitlisted'
    else 'Registered'
  end;

  next_data := payload || jsonb_build_object(
    'id', next_id, 'tournamentKey', next_tournament_id, 'status', next_status,
    'registrationNumber', next_number, 'confirmationNumber', next_number
  );
  insert into public.reservations (id, data, tournament_id, name, email, phone, added_to_roster)
  values (
    next_id, next_data, next_tournament_id,
    coalesce(nullif(payload->>'nickname', ''), nullif(payload->>'name', ''), ''),
    coalesce(payload->>'email', ''), coalesce(payload->>'phone', ''), false
  );
  return next_data;
end;
$$;
revoke all on function public.create_public_reservation(jsonb) from public;
grant execute on function public.create_public_reservation(jsonb) to anon, authenticated;

create or replace function public.create_public_team_reservation(payload jsonb)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  tournament_key text := trim(coalesce(payload->>'tournamentKey', ''));
  group_id text := coalesce(nullif(payload->>'id', ''), gen_random_uuid()::text);
  members jsonb := payload->'members'; member jsonb; member_name text; member_nickname text;
  member_index integer := 0; team_size integer; settings jsonb; bucket jsonb; schedule_data jsonb;
  event_info jsonb; event_style text; previous_champion_count integer := 0; multi_time_champion_count integer := 0; capacity integer;
  registered_count integer; first_number integer; next_status text; row_data jsonb; saved_rows jsonb := '[]'::jsonb;
begin
  if tournament_key = '' or jsonb_typeof(members) is distinct from 'array' then raise exception 'Tournament and bowlers are required.'; end if;
  team_size := jsonb_array_length(members);
  if team_size not in (2, 3) then raise exception 'Doubles needs two bowlers; trios needs three.'; end if;
  if trim(coalesce(members->0->>'name', '')) = '' or coalesce(members->0->>'tbd', 'false') = 'true' then raise exception 'The submitting bowler name is required.'; end if;
  if trim(coalesce(payload->>'email', '')) = '' then raise exception 'Contact email is required.'; end if;
  -- Serialize singles and teams together and lock configuration used for the
  -- entries-open, tournament-style, capacity, and champion-rule decision.
  lock table public.app_settings in share mode;
  lock table public.schedule_events in share mode;
  lock table public.reservations in share row exclusive mode;
  select value into settings from public.app_settings where id = 'reservation_state';
  bucket := settings->'reservationsByTournament'->tournament_key;
  select data into schedule_data from public.schedule_events where id = tournament_key or data->>'eventId' = tournament_key limit 1;
  event_info := coalesce(schedule_data->'publicInfo', bucket->'publicTournamentInfo', case when settings->>'tournamentKey' = tournament_key then settings->'publicTournamentInfo' end);
  event_style := event_info->>'tournamentStyle';
  if (team_size = 2 and event_style is distinct from 'doubles') or (team_size = 3 and event_style is distinct from 'trios') then raise exception 'The reservation size does not match the tournament format.'; end if;
  if coalesce(schedule_data->'reservationSettings'->>'entriesOpen', bucket->>'entriesOpen', case when settings->>'tournamentKey' = tournament_key then settings->>'entriesOpen' end, 'false') <> 'true' then raise exception 'Entries are closed for this tournament.'; end if;
  capacity := coalesce(
    case when coalesce(schedule_data->'reservationSettings'->>'reservationLimit', '') ~ '^[0-9]+$' then (schedule_data->'reservationSettings'->>'reservationLimit')::integer end,
    case when coalesce(bucket->>'reservationLimit', '') ~ '^[0-9]+$' then (bucket->>'reservationLimit')::integer end,
    case when settings->>'tournamentKey' = tournament_key and coalesce(settings->>'reservationLimit', '') ~ '^[0-9]+$' then (settings->>'reservationLimit')::integer end,
    48
  );
  if exists (select 1 from jsonb_array_elements(members) as m where coalesce(m->>'tbd', 'false') <> 'true' group by lower(trim(m->>'name')) having count(*) > 1) then raise exception 'Each bowler can only appear once in this entry.'; end if;
  for member in select value from jsonb_array_elements(members) loop
    member_name := trim(coalesce(member->>'name', '')); member_nickname := trim(coalesce(member->>'nickname', ''));
    if coalesce(member->>'tbd', 'false') = 'true' or lower(member_name) in ('', 'tbd', 'unknown', 'pending', 'n/a', '-') then raise exception 'A full team is required. Enter every bowler name before submitting.'; end if;
    if exists (select 1 from public.reservations r where r.tournament_id = tournament_key and (lower(member_name) in (lower(trim(r.name)), lower(trim(r.data->>'name')), lower(trim(r.data->>'nickname'))) or (member_nickname <> '' and lower(member_nickname) in (lower(trim(r.name)), lower(trim(r.data->>'name')), lower(trim(r.data->>'nickname')))))) then raise exception '% is already on the reservation list.', member_name; end if;
  end loop;
  if ((event_style = 'trios' and event_info->>'maxPreviousChampions' = '2') or (event_style = 'doubles' and event_info->>'maxPreviousChampions' = '1')) then
    select count(*) into previous_champion_count from jsonb_array_elements(members) as submitted(submitted_member)
    where coalesce(submitted_member->>'tbd', 'false') <> 'true' and exists (
      with submitted_names as (select lower(trim(value)) as name from jsonb_array_elements_text(jsonb_build_array(submitted_member->>'name', submitted_member->>'nickname')) where trim(coalesce(value, '')) <> ''),
      identity_names as (select aliases.name from public.bowler_identities i cross join lateral (select lower(trim(value)) as name from jsonb_array_elements_text(jsonb_build_array(i.data->>'realName', i.data->>'real_name', i.data->>'nickname') || coalesce(i.data->'aliases', '[]'::jsonb))) aliases where exists (select 1 from jsonb_array_elements_text(jsonb_build_array(i.data->>'realName', i.data->>'real_name', i.data->>'nickname') || coalesce(i.data->'aliases', '[]'::jsonb)) known join submitted_names n on n.name = lower(trim(known.value)))),
      winners as (select lower(trim(coalesce(t.data->>'bowler', t.data->>'name'))) as name from public.manual_titles t where coalesce(t.data->>'hof', 'false') <> 'true' union select lower(trim(result->>'name')) from public.archived_tournaments a cross join lateral jsonb_array_elements(coalesce(a.data->'results', '[]'::jsonb)) as results(result) where result->>'tournamentWinner' = 'true' or result->>'place' = '1')
      select 1 from winners w join (select name from submitted_names union select name from identity_names) n on n.name = w.name);
    if previous_champion_count > (case when event_style = 'doubles' then 1 else 2 end) then raise exception 'This tournament requires at least one non-champion on every team.'; end if;
  end if;
  if event_style = 'trios'
    and event_info->>'maxPreviousChampions' = '2'
    and event_info->>'limitMultiTimeChampions' = 'true' then
    select count(*) into multi_time_champion_count
    from jsonb_array_elements(members) with ordinality as submitted(submitted_member, member_ordinal)
    cross join lateral (
      with submitted_names as (
        select lower(trim(value)) as name
        from jsonb_array_elements_text(jsonb_build_array(submitted_member->>'name', submitted_member->>'nickname'))
        where trim(coalesce(value, '')) <> ''
      ), identity_names as (
        select aliases.name
        from public.bowler_identities i
        cross join lateral (
          select lower(trim(value)) as name
          from jsonb_array_elements_text(jsonb_build_array(i.data->>'realName', i.data->>'real_name', i.data->>'nickname') || coalesce(i.data->'aliases', '[]'::jsonb))
        ) aliases
        where exists (
          select 1
          from jsonb_array_elements_text(jsonb_build_array(i.data->>'realName', i.data->>'real_name', i.data->>'nickname') || coalesce(i.data->'aliases', '[]'::jsonb)) known
          join submitted_names n on n.name = lower(trim(known.value))
        )
      ), matched_names as (
        select name from submitted_names union select name from identity_names
      ), title_rows as (
        select lower(trim(coalesce(t.bowler, t.data->>'bowler', t.data->>'name', ''))) as title_bowler,
          lower(trim(coalesce(t.data->>'tournament', t.data->>'source', t.source, ''))) as title_tournament,
          lower(trim(coalesce(t.data->>'date', ''))) as title_date
        from public.manual_titles t
        where coalesce(t.data->>'hof', 'false') <> 'true'
        union all
        select lower(trim(result->>'name')),
          lower(trim(coalesce(a.name, a.data->>'name', ''))),
          lower(trim(coalesce(a.event_date::text, a.data->>'date', '')))
        from public.archived_tournaments a
        cross join lateral jsonb_array_elements(coalesce(a.data->'results', '[]'::jsonb)) as results(result)
        where result->>'tournamentWinner' = 'true' or result->>'place' = '1'
      )
      select count(distinct (title_bowler, title_tournament, title_date)) as title_count
      from title_rows
      join matched_names on matched_names.name = title_rows.title_bowler
    ) titles
    where titles.title_count >= 2;
    if multi_time_champion_count > 1 then
      raise exception 'Only one previous champion on a trio may have multiple tournament wins.';
    end if;
  end if;
  select count(distinct coalesce(nullif(data->>'reservationGroupId', ''), id)) filter (where coalesce(nullif(data->>'status', ''), 'Registered') = 'Registered'), coalesce(max(case when coalesce(data->>'registrationNumber', '') ~ '^[0-9]+$' then (data->>'registrationNumber')::integer else 0 end), 0) + 1 into registered_count, first_number from public.reservations where tournament_id = tournament_key;
  next_status := case when payload->>'status' = 'Waitlisted' or registered_count + 1 > capacity then 'Waitlisted' else 'Registered' end;
  for member in select value from jsonb_array_elements(members) loop
    member_name := trim(member->>'name'); member_nickname := trim(coalesce(member->>'nickname', ''));
    row_data := (payload - 'reservationRows') || jsonb_build_object('id', group_id || '-' || (member_index + 1)::text, 'name', member_name, 'nickname', member_nickname, 'tournamentKey', tournament_key, 'reservationGroupId', group_id, 'reservationGroupSize', team_size, 'reservationMemberIndex', member_index, 'submittedBy', trim(members->0->>'name'), 'status', next_status, 'registrationNumber', first_number + member_index, 'confirmationNumber', first_number);
    insert into public.reservations(id, data, tournament_id, name, email, phone, added_to_roster) values(row_data->>'id', row_data, tournament_key, coalesce(nullif(member_nickname, ''), member_name), payload->>'email', coalesce(payload->>'phone', ''), false);
    saved_rows := saved_rows || jsonb_build_array(row_data); member_index := member_index + 1;
  end loop;
  return payload || jsonb_build_object('id', group_id, 'status', next_status, 'registrationNumber', first_number, 'confirmationNumber', first_number, 'reservationRows', saved_rows);
end;
$$;
revoke all on function public.create_public_team_reservation(jsonb) from public;
grant execute on function public.create_public_team_reservation(jsonb) to anon, authenticated;

drop function public.phase3_validate_individual_reservation(jsonb, jsonb);
drop function public.phase3_published_reservation_rules(text, jsonb, jsonb);
drop function public.phase3_reservation_identity_key(text);
commit;
