-- Production database inverse. Restores legacy definitions and mirror grants.
-- Public booking stays paused because those definitions lack the cutoff.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '120s';
set local search_path = pg_catalog, public;

-- Quiesce settings and reservation writers in the same order as Phase 3.
lock table public.app_settings in share mode;
lock table public.schedule_events in share mode;
lock table public.reservations in share row exclusive mode;

do $preflight$
begin
  if current_user <> 'postgres' then
    raise exception 'Run with the reviewed database owner';
  end if;
  if not exists (
    select 1 from pg_proc
    where oid = 'public.create_public_reservation(jsonb)'::regprocedure
      and pg_get_userbyid(proowner) = 'postgres'
      and prosecdef and proconfig = array['search_path=public']
      and md5(replace(prosrc, chr(13), '')) = '2959a372b678726fe7bec996c0598051'
  ) then
    raise exception 'Unexpected create_public_reservation definition or privileges context';
  end if;

  if not exists (
    select 1 from pg_proc
    where oid = 'public.create_public_team_reservation(jsonb)'::regprocedure
      and pg_get_userbyid(proowner) = 'postgres'
      and prosecdef and proconfig = array['search_path=""']
      and md5(replace(prosrc, chr(13), '')) = '2b4c63f57f61efe9abd3d7d9f4674126'
  ) then
    raise exception 'Unexpected create_public_team_reservation definition or privileges context';
  end if;

  if not exists (
    select 1 from pg_proc
    where oid = 'public.refresh_public_app_settings(text)'::regprocedure
      and pg_get_userbyid(proowner) = 'postgres'
      and prosecdef and proconfig = array['search_path=public']
      and md5(replace(prosrc, chr(13), '')) = '65ffbf247ac8d0da961f6d59c4f3ead6'
  ) then
    raise exception 'Unexpected refresh_public_app_settings definition or privileges context';
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'public_app_settings'
      and policyname = 'Admins insert public multi-day event'
  ) or not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'public_app_settings'
      and policyname = 'Admins update public multi-day event'
  ) then
    raise exception 'Public mirror policies changed after the forward migration';
  end if;
end;
$preflight$;

CREATE OR REPLACE FUNCTION public.create_public_reservation(payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  next_id text := coalesce(nullif(payload->>'id', ''), gen_random_uuid()::text);
  next_tournament_id text := coalesce(nullif(payload->>'tournamentKey', ''), nullif(payload->>'tournament', ''), '');
  next_name text := lower(trim(coalesce(payload->>'name', '')));
  next_nickname text := lower(trim(coalesce(payload->>'nickname', '')));
  next_email text := lower(trim(coalesce(payload->>'email', '')));
  current_max_number integer := 0;
  next_number integer := 1;
  registered_count integer := 0;
  reservation_limit integer := 48;
  next_status text := 'Registered';
  next_data jsonb;
begin
  if next_tournament_id = '' then
    raise exception 'Tournament is required.';
  end if;

  if next_name = '' and next_nickname = '' and next_email = '' then
    raise exception 'Reservation name or email is required.';
  end if;

  if exists (
    select 1
    from public.reservations
    where tournament_id = next_tournament_id
      and (
        (next_name <> '' and lower(trim(coalesce(name, ''))) = next_name)
        or (next_name <> '' and lower(trim(coalesce(data->>'name', ''))) = next_name)
        or (next_nickname <> '' and lower(trim(coalesce(data->>'nickname', ''))) = next_nickname)
      )
  ) then
    raise exception 'This bowler is already on the reservation list.';
  end if;

  select coalesce(max(greatest(
    case when coalesce(data->>'registrationNumber', '') ~ '^[0-9]+$' then (data->>'registrationNumber')::integer else 0 end,
    case when coalesce(data->>'confirmationNumber', '') ~ '^[0-9]+$' then (data->>'confirmationNumber')::integer else 0 end
  )), 0)
  into current_max_number
  from public.reservations
  where tournament_id = next_tournament_id;

  next_number := greatest(current_max_number + 1, 1);

  select coalesce(
    case
      when coalesce(value->'reservationsByTournament'->next_tournament_id->>'reservationLimit', '') ~ '^[0-9]+$'
        then (value->'reservationsByTournament'->next_tournament_id->>'reservationLimit')::integer
      else null
    end,
    case
      when coalesce(value->>'reservationLimit', '') ~ '^[0-9]+$'
        then (value->>'reservationLimit')::integer
      else null
    end,
    case
      when coalesce(payload->>'reservationLimit', '') ~ '^[0-9]+$'
        then (payload->>'reservationLimit')::integer
      else null
    end,
    48
  )
  into reservation_limit
  from public.app_settings
  where id = 'reservation_state';

  reservation_limit := coalesce(reservation_limit, 48);

  select count(*)::integer
  into registered_count
  from public.reservations
  where tournament_id = next_tournament_id
    and coalesce(nullif(trim(data->>'status'), ''), 'Registered') = 'Registered';

  next_status := case
    when lower(coalesce(payload->>'status', '')) like 'wait%' then 'Waitlisted'
    when reservation_limit > 0 and registered_count >= reservation_limit then 'Waitlisted'
    else 'Registered'
  end;

  next_data := payload || jsonb_build_object(
    'id', next_id,
    'tournamentKey', next_tournament_id,
    'status', next_status,
    'registrationNumber', next_number,
    'confirmationNumber', next_number
  );

  insert into public.reservations (id, data, tournament_id, name, email, phone, added_to_roster)
  values (
    next_id,
    next_data,
    next_tournament_id,
    coalesce(nullif(payload->>'nickname', ''), nullif(payload->>'name', ''), ''),
    coalesce(payload->>'email', ''),
    coalesce(payload->>'phone', ''),
    false
  );

  return next_data;
end;
$function$;
revoke execute on function public.create_public_reservation(jsonb) from public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_public_team_reservation(payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
    if coalesce(member->>'tbd', 'false') = 'true' or lower(member_name) in ('', 'tbd', 'unknown', 'pending', 'n/a', '-') then
      raise exception 'A full team is required. Enter every bowler name before submitting.';
    end if;
    if coalesce(member->>'tbd', 'false') <> 'true' then
      if lower(member_name) in ('', 'tbd') then raise exception 'Enter a bowler name or select TBD.'; end if;
      if exists (select 1 from public.reservations r where r.tournament_id = tournament_key
        and (lower(member_name) in (lower(trim(r.name)), lower(trim(r.data->>'name')), lower(trim(r.data->>'nickname')))
          or (member_nickname <> '' and lower(member_nickname) in (lower(trim(r.name)), lower(trim(r.data->>'name')), lower(trim(r.data->>'nickname')))))) then
        raise exception '% is already on the reservation list.', member_name;
      end if;
    end if;
  end loop;

  if ((event_style = 'trios' and event_info->>'maxPreviousChampions' = '2')
      or (event_style = 'doubles' and event_info->>'maxPreviousChampions' = '1')) then
    select count(*) into previous_champion_count
    from jsonb_array_elements(members) as submitted(submitted_member)
    where coalesce(submitted_member->>'tbd', 'false') <> 'true' and exists (
      with submitted_names as (
        select lower(trim(value)) as name
        from jsonb_array_elements_text(jsonb_build_array(submitted_member->>'name', submitted_member->>'nickname'))
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
    if previous_champion_count > (case when event_style = 'doubles' then 1 else 2 end) then
      raise exception 'This tournament requires at least one non-champion on every team.';
    end if;
  end if;

  select count(distinct coalesce(nullif(data->>'reservationGroupId', ''), id)) filter (where coalesce(nullif(data->>'status', ''), 'Registered') = 'Registered'),
    coalesce(max(case when coalesce(data->>'registrationNumber', '') ~ '^[0-9]+$'
      then (data->>'registrationNumber')::integer else 0 end), 0) + 1
    into registered_count, first_number from public.reservations where tournament_id = tournament_key;
  next_status := case when payload->>'status' = 'Waitlisted' or registered_count + 1 > capacity
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
$function$;
revoke execute on function public.create_public_team_reservation(jsonb) from public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.refresh_public_app_settings(target_id text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  delete from public.public_app_settings
  where target_id is null or id = target_id;

  insert into public.public_app_settings (id, value, updated_at)
  select
    app_settings.id,
    case
      when app_settings.id = 'reservation_state' then
        (app_settings.value - 'reservationsByTournament' - 'reservations' - 'publicReservations') ||
        jsonb_build_object(
          'reservations', '[]'::jsonb,
          'publicReservations', '[]'::jsonb,
          'reservationsByTournament',
          coalesce(
            (
              select jsonb_object_agg(
                tournament_key,
                jsonb_build_object(
                  'entriesOpen', coalesce(tournament_bucket->'entriesOpen', 'false'::jsonb),
                  'tournamentName', coalesce(tournament_bucket->'tournamentName', '""'::jsonb),
                  'tournamentDate', coalesce(tournament_bucket->'tournamentDate', '""'::jsonb),
                  'tournamentStartTime', coalesce(tournament_bucket->'tournamentStartTime', '""'::jsonb),
                  'tournamentCenter', coalesce(tournament_bucket->'tournamentCenter', '""'::jsonb),
                  'tournamentAddress', coalesce(tournament_bucket->'tournamentAddress', '""'::jsonb),
                  'reservationLimit', coalesce(tournament_bucket->'reservationLimit', '48'::jsonb),
                  'reservationCount', coalesce(tournament_bucket->'reservationCount', '0'::jsonb),
                  'publicTournamentInfo', coalesce(tournament_bucket->'publicTournamentInfo', 'null'::jsonb),
                  'reservations', '[]'::jsonb,
                  'publicReservations', '[]'::jsonb
                )
              )
              from jsonb_each(coalesce(app_settings.value->'reservationsByTournament', '{}'::jsonb)) as reservation_bucket(tournament_key, tournament_bucket)
            ),
            '{}'::jsonb
          )
        )
      else app_settings.value
    end,
    now()
  from public.app_settings
  where app_settings.id in ('schedule_locked', 'reservation_state')
    and (target_id is null or app_settings.id = target_id)
  on conflict (id) do update
  set value = excluded.value,
      updated_at = excluded.updated_at;
end;
$function$;
grant execute on function public.refresh_public_app_settings(text) to public;
revoke insert, update on public.public_app_settings from authenticated;
drop policy "Admins insert public multi-day event" on public.public_app_settings;
drop policy "Admins update public multi-day event" on public.public_app_settings;
create policy "Admins write public app settings" on public.public_app_settings
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop function public.assert_public_reservation_window(jsonb, date, jsonb, text, timestamptz);
drop function public.phase3_validate_individual_reservation(jsonb, jsonb);
drop function public.phase3_published_reservation_rules(text, jsonb, jsonb);
drop function public.phase3_reservation_identity_key(text);

do $verify$
begin
  if has_function_privilege('anon', 'public.create_public_reservation(jsonb)', 'EXECUTE')
      or has_function_privilege('authenticated', 'public.create_public_reservation(jsonb)', 'EXECUTE')
      or has_function_privilege('anon', 'public.create_public_team_reservation(jsonb)', 'EXECUTE')
      or has_function_privilege('authenticated', 'public.create_public_team_reservation(jsonb)', 'EXECUTE') then
    raise exception 'Public booking must remain paused after the database inverse';
  end if;
  if not exists (
    select 1 from pg_proc
    where oid = 'public.create_public_reservation(jsonb)'::regprocedure
      and pg_get_userbyid(proowner) = 'postgres'
      and prosecdef and proconfig = array['search_path=public']
      and md5(replace(prosrc, chr(13), '')) = '50dff4d895e1dbb550f8a74327f44ad2'
  ) then
    raise exception 'Unexpected create_public_reservation definition or privileges context';
  end if;

  if not exists (
    select 1 from pg_proc
    where oid = 'public.create_public_team_reservation(jsonb)'::regprocedure
      and pg_get_userbyid(proowner) = 'postgres'
      and prosecdef and proconfig = array['search_path=""']
      and md5(replace(prosrc, chr(13), '')) = '2f75f27e25685d671d8d2034e2a71d2a'
  ) then
    raise exception 'Unexpected create_public_team_reservation definition or privileges context';
  end if;

  if not exists (
    select 1 from pg_proc
    where oid = 'public.refresh_public_app_settings(text)'::regprocedure
      and pg_get_userbyid(proowner) = 'postgres'
      and prosecdef and proconfig = array['search_path=public']
      and md5(replace(prosrc, chr(13), '')) = '22010480a18425a428a343cf1f560656'
  ) then
    raise exception 'Unexpected refresh_public_app_settings definition or privileges context';
  end if;
end;
$verify$;
commit;
