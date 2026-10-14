-- Staged only: apply after reviewing the local doubles/trios reservation flow.
-- Existing singles reservations continue using create_public_reservation.
create or replace function public.create_public_team_reservation(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  tournament_key text := trim(coalesce(payload->>'tournamentKey', ''));
  group_id text := coalesce(nullif(payload->>'id', ''), gen_random_uuid()::text);
  members jsonb := payload->'members';
  member jsonb;
  member_name text;
  member_nickname text;
  member_index integer := 0;
  team_size integer;
  settings jsonb;
  bucket jsonb;
  schedule_data jsonb;
  event_info jsonb;
  event_style text;
  previous_champion_count integer := 0;
  capacity integer;
  registered_count integer;
  first_number integer;
  next_status text;
  row_data jsonb;
  saved_rows jsonb := '[]'::jsonb;
begin
  if tournament_key = '' or jsonb_typeof(members) is distinct from 'array' then
    raise exception 'Tournament and bowlers are required.';
  end if;
  team_size := jsonb_array_length(members);
  if team_size not in (2, 3) then raise exception 'Doubles needs two bowlers; trios needs three.'; end if;
  if trim(coalesce(members->0->>'name', '')) = '' or coalesce(members->0->>'tbd', 'false') = 'true' then
    raise exception 'The submitting bowler name is required.';
  end if;
  if trim(coalesce(payload->>'email', '')) = '' then raise exception 'Contact email is required.'; end if;

  -- Serialize against other reservation inserts, including the existing singles RPC.
  lock table public.reservations in share row exclusive mode;
  select value into settings from public.app_settings where id = 'reservation_state';
  bucket := settings->'reservationsByTournament'->tournament_key;
  select data into schedule_data from public.schedule_events
  where id = tournament_key or data->>'eventId' = tournament_key limit 1;
  event_info := coalesce(schedule_data->'publicInfo', bucket->'publicTournamentInfo',
    case when settings->>'tournamentKey' = tournament_key then settings->'publicTournamentInfo' end);
  event_style := event_info->>'tournamentStyle';
  if (team_size = 2 and event_style is distinct from 'doubles') or
     (team_size = 3 and event_style is distinct from 'trios') then
    raise exception 'The reservation size does not match the tournament format.';
  end if;
  if coalesce(schedule_data->'reservationSettings'->>'entriesOpen', bucket->>'entriesOpen',
       case when settings->>'tournamentKey' = tournament_key then settings->>'entriesOpen' end, 'false') <> 'true' then
    raise exception 'Entries are closed for this tournament.';
  end if;
  capacity := coalesce(nullif(schedule_data->'reservationSettings'->>'reservationLimit', '')::integer,
    nullif(bucket->>'reservationLimit', '')::integer,
    case when settings->>'tournamentKey' = tournament_key then nullif(settings->>'reservationLimit', '')::integer end, 48);

  if exists (
    select 1 from jsonb_array_elements(members) as m
    where coalesce(m->>'tbd', 'false') <> 'true'
    group by lower(trim(m->>'name')) having count(*) > 1
  ) then raise exception 'Each bowler can only appear once in this entry.'; end if;
  for member in select value from jsonb_array_elements(members) loop
    member_name := trim(coalesce(member->>'name', ''));
    member_nickname := trim(coalesce(member->>'nickname', ''));
    if coalesce(member->>'tbd', 'false') <> 'true' then
      if lower(member_name) in ('', 'tbd') then raise exception 'Enter a bowler name or select TBD.'; end if;
      if exists (select 1 from public.reservations r where r.tournament_id = tournament_key
        and (lower(member_name) in (lower(trim(r.name)), lower(trim(r.data->>'name')), lower(trim(r.data->>'nickname')))
          or (member_nickname <> '' and lower(member_nickname) in (lower(trim(r.name)), lower(trim(r.data->>'name')), lower(trim(r.data->>'nickname')))))) then
        raise exception '% is already on the reservation list.', member_name;
      end if;
    end if;
  end loop;

  if event_style = 'trios' and event_info->>'maxPreviousChampions' = '2' then
    select count(*) into previous_champion_count
    from jsonb_array_elements(members) as submitted(member)
    where coalesce(member->>'tbd', 'false') <> 'true' and exists (
      with submitted_names as (
        select lower(trim(value)) as name
        from jsonb_array_elements_text(jsonb_build_array(member->>'name', member->>'nickname'))
        where trim(coalesce(value, '')) <> ''
      ), identity_names as (
        select aliases.name
        from public.bowler_identities i
        cross join lateral (
          select lower(trim(value)) as name from jsonb_array_elements_text(
            jsonb_build_array(i.data->>'realName', i.data->>'real_name', i.data->>'nickname') || coalesce(i.data->'aliases', '[]'::jsonb))
        ) aliases
        where exists (
          select 1 from jsonb_array_elements_text(
            jsonb_build_array(i.data->>'realName', i.data->>'real_name', i.data->>'nickname') || coalesce(i.data->'aliases', '[]'::jsonb)) known
          join submitted_names n on n.name = lower(trim(known.value))
        )
      ), winners as (
        select lower(trim(coalesce(t.data->>'bowler', t.data->>'name'))) as name
        from public.manual_titles t where coalesce(t.data->>'hof', 'false') <> 'true'
        union
        select lower(trim(result->>'name')) from public.archived_tournaments a
        cross join lateral jsonb_array_elements(coalesce(a.data->'results', '[]'::jsonb)) as results(result)
        where result->>'tournamentWinner' = 'true' or result->>'place' = '1'
      )
      select 1 from winners w join (select name from submitted_names union select name from identity_names) n on n.name = w.name
    );
    if previous_champion_count > 2 then
      raise exception 'This tournament allows at most two previous champions per trio. At least one bowler must not have won a tournament.';
    end if;
  end if;

  select count(*) filter (where coalesce(nullif(data->>'status', ''), 'Registered') = 'Registered'),
    coalesce(max(case when coalesce(data->>'registrationNumber', '') ~ '^[0-9]+$'
      then (data->>'registrationNumber')::integer else 0 end), 0) + 1
    into registered_count, first_number from public.reservations where tournament_id = tournament_key;
  next_status := case when payload->>'status' = 'Waitlisted' or registered_count + team_size > capacity
    then 'Waitlisted' else 'Registered' end;
  for member in select value from jsonb_array_elements(members) loop
    member_name := case when member->>'tbd' = 'true' then 'TBD' else trim(member->>'name') end;
    member_nickname := case when member->>'tbd' = 'true' then '' else trim(coalesce(member->>'nickname', '')) end;
    row_data := (payload - 'reservationRows') || jsonb_build_object(
      'id', group_id || '-' || (member_index + 1)::text, 'name', member_name, 'nickname', member_nickname,
      'tournamentKey', tournament_key, 'reservationGroupId', group_id,
      'reservationGroupSize', team_size, 'reservationMemberIndex', member_index,
      'submittedBy', trim(members->0->>'name'), 'status', next_status,
      'registrationNumber', first_number + member_index, 'confirmationNumber', first_number);
    insert into public.reservations(id, data, tournament_id, name, email, phone, added_to_roster)
    values(row_data->>'id', row_data, tournament_key, coalesce(nullif(member_nickname, ''), member_name), payload->>'email',
      coalesce(payload->>'phone', ''), false);
    saved_rows := saved_rows || jsonb_build_array(row_data);
    member_index := member_index + 1;
  end loop;
  return payload || jsonb_build_object('id', group_id, 'status', next_status,
    'registrationNumber', first_number, 'confirmationNumber', first_number, 'reservationRows', saved_rows);
end;
$$;
revoke all on function public.create_public_team_reservation(jsonb) from public;
grant execute on function public.create_public_team_reservation(jsonb) to anon, authenticated;
