-- Production release candidate. Rehearse against a synthetic production-like
-- database before approval. Use the TLS-pinned endpoint and the operator
-- inputs described in docs/PRODUCTION_MIGRATION_REHEARSAL.md.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '120s';
set local search_path = pg_catalog, public;

-- Quiesce settings and reservation writers in the same order as Phase 3.
lock table public.app_settings in share mode;
lock table public.schedule_events in share row exclusive mode;
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

  if (select proacl from pg_proc where oid = 'public.refresh_public_app_settings(text)'::regprocedure) is not null
      or not exists (
        select 1 from pg_proc where oid = 'public.create_public_reservation(jsonb)'::regprocedure
          and proacl @> '{=X/postgres,postgres=X/postgres,anon=X/postgres,authenticated=X/postgres}'::aclitem[]
          and proacl <@ '{=X/postgres,postgres=X/postgres,anon=X/postgres,authenticated=X/postgres}'::aclitem[]
      ) or not exists (
        select 1 from pg_proc where oid = 'public.create_public_team_reservation(jsonb)'::regprocedure
          and proacl @> '{postgres=X/postgres,anon=X/postgres,authenticated=X/postgres}'::aclitem[]
          and proacl <@ '{postgres=X/postgres,anon=X/postgres,authenticated=X/postgres}'::aclitem[]
      ) then
    raise exception 'Production routine grants changed after review';
  end if;

  if not exists (
    select 1
    from public.schedule_events where id = 'schedule-8'
      and coalesce(data->>'name', data #>> '{publicInfo,name}') = 'Karl''s World Tour #3'
      and coalesce(nullif(data->>'startDate', ''), data #>> '{publicInfo,date}', sort_date::text) = '2026-11-08'
      and data #>> '{reservationSettings,reservationLimit}' = '64'
      and data #>> '{reservationSettings,entriesOpen}' in ('true', 'false')
  ) then
    raise exception 'Expected the approved KWT #3 identity, 64-entry cap and entries flag';
  end if;

  if to_regclass('public.bowling_centers') is not null
      or to_regclass('public.reservation_average_verifications') is not null then
    raise exception 'Phase 3 tables already exist; review this target before applying';
  end if;

  if not exists (
    select 1 from pg_class where oid = 'public.public_app_settings'::regclass
      and relkind = 'r' and relrowsecurity and pg_get_userbyid(relowner) = 'postgres'
  ) or has_table_privilege('authenticated', 'public.public_app_settings', 'INSERT, UPDATE, DELETE')
    or has_table_privilege('anon', 'public.public_app_settings', 'INSERT, UPDATE, DELETE')
    or not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'public_app_settings'
        and policyname = 'Admins write public app settings' and cmd = 'ALL'
        and roles = array['authenticated']::name[] and qual = 'is_admin()' and with_check = 'is_admin()'
    ) or exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = 'public_app_settings'
        and cmd in ('ALL', 'INSERT', 'UPDATE', 'DELETE')
        and policyname <> 'Admins write public app settings'
    ) then
    raise exception 'Public settings relation, grants or write policies changed after review';
  end if;
end;
$preflight$;

-- Keep the public Strikefest row when refresh runs for one setting or every
-- setting. The application publishes its sanitized version separately.
CREATE OR REPLACE FUNCTION public.refresh_public_app_settings(target_id text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  delete from public.public_app_settings
  where id in ('schedule_locked', 'reservation_state')
    and (target_id is null or id = target_id);

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
revoke execute on function public.refresh_public_app_settings(text) from public, anon, authenticated;
drop policy "Admins write public app settings" on public.public_app_settings;
create policy "Admins insert public multi-day event" on public.public_app_settings
for insert to authenticated
with check (id = 'multi_day_event' and (select public.is_admin()));
create policy "Admins update public multi-day event" on public.public_app_settings
for update to authenticated
using (id = 'multi_day_event' and (select public.is_admin()))
with check (id = 'multi_day_event' and (select public.is_admin()));
grant insert, update on public.public_app_settings to authenticated;

create table if not exists public.bowling_centers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 150),
  name_key text generated always as (lower(btrim(regexp_replace(name, '[[:space:]]+', ' ', 'g')))) stored unique
    check (name_key <> ''),
  address text not null check (char_length(btrim(address)) between 1 and 300 and address ~ '[^[:space:]]'),
  active boolean not null default true
);

insert into public.bowling_centers (id, name, address) values
  ('aeff797d-d707-4564-bf42-9bd4f9583b93', 'Bayside Bowl', '58 Alder St, Portland, ME 04101'),
  ('50a8aad1-861d-4a9b-a9a6-957625c064be', 'Just-In-Time Recreation', '24 Mollison Way, Lewiston, ME 04240'),
  ('529373d9-7b15-4689-b2f4-918b6650ad90', 'Interstate Bowling Center', '215 Whitten Rd, Hallowell, ME 04347')
on conflict do nothing;

-- Verification is attached explicitly to a reservation member, even when names match elsewhere.
create table if not exists public.reservation_average_verifications (
  reservation_id text primary key references public.reservations(id) on delete cascade,
  bowler_name text not null,
  bowler_nickname text not null default '',
  average numeric not null check (average between 0 and 300 and scale(average) <= 2),
  source text check (source in ('USBC', 'Bayside Bowl league sheet', 'Other director-approved source')),
  verified_on date
);

alter table public.bowling_centers enable row level security;
alter table public.reservation_average_verifications enable row level security;
revoke all on public.bowling_centers, public.reservation_average_verifications from public, anon, authenticated;
grant select, insert, update on public.bowling_centers to authenticated;
grant select, insert, update, delete on public.reservation_average_verifications to authenticated;
drop policy if exists "Admins manage bowling centers" on public.bowling_centers;
create policy "Admins manage bowling centers" on public.bowling_centers for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "Admins manage reservation average verifications" on public.reservation_average_verifications;
create policy "Admins manage reservation average verifications" on public.reservation_average_verifications for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create function public.phase3_reservation_identity_key(value text)
returns text language sql immutable strict set search_path = '' as $$
  select lower(btrim(regexp_replace(translate(value, '‘’‚‛“”„‟', repeat(chr(39), 4) || repeat(chr(34), 4)), '[[:space:]]+', ' ', 'g')));
$$;

-- Resolve the event by its existing ID first, then an ID carried by an older
-- reservation bucket or the legacy name/date/center key.
create function public.phase3_published_reservation_rules(event_key text, current_event jsonb, fallback_info jsonb)
returns jsonb language sql stable set search_path = '' as $$
  select coalesce(
    current_event #> '{eventSetup,reservationRules}',
    (
      select e.data #> '{eventSetup,reservationRules}'
      from public.schedule_events e
      where current_event is null and (
        (fallback_info->>'scheduleEventId' <> '' and (e.id = fallback_info->>'scheduleEventId' or e.data->>'eventId' = fallback_info->>'scheduleEventId'))
        or event_key = lower(btrim(coalesce(e.data->>'name', ''))) || '|' ||
          lower(btrim(coalesce(e.data->>'startDate', ''))) || '|' || lower(btrim(coalesce(e.data->>'center', '')))
      )
      order by (e.data->>'eventId' = fallback_info->>'scheduleEventId') desc nulls last, e.id
      limit 1
    ),
    case
      when fallback_info->>'reservationEligibility' is null
        and current_event #>> '{eventSetup,tournamentInfo,reservationEligibility}' in ('nonChampions', 'championsOnly')
        and (
          current_event #>> '{eventSetup,tournamentInfo,scheduleEventId}' = coalesce(current_event->>'eventId', event_key)
          or (
            nullif(current_event #>> '{eventSetup,tournamentInfo,scheduleEventId}', '') is null
            and lower(trim(current_event #>> '{eventSetup,tournamentInfo,name}')) = lower(trim(current_event->>'name'))
            and left(current_event #>> '{eventSetup,tournamentInfo,date}', 10) = left(current_event->>'startDate', 10)
          )
        )
      then jsonb_build_object('reservationEligibility', current_event #>> '{eventSetup,tournamentInfo,reservationEligibility}')
    end,
    '{}'::jsonb
  );
$$;

create function public.phase3_validate_individual_reservation(info jsonb, member jsonb)
returns void language plpgsql stable set search_path = '' as $$
declare
  mode text := info->>'reservationEligibility';
  has_title boolean;
begin
  if mode is null or mode not in ('nonChampions', 'championsOnly') then return; end if;
  if coalesce(btrim(member->>'name'), '') = '' then raise exception 'Enter the bowler name to verify eligibility.'; end if;

  -- Individual eligibility has always used recorded winners and non-HOF manual
  -- titles. The team champion limits below retain their separate criteria.
  with submitted_names as (
    select public.phase3_reservation_identity_key(value) as key
    from jsonb_array_elements_text(jsonb_build_array(member->>'name', member->>'nickname'))
  ), identity_names as (
    select i.id, public.phase3_reservation_identity_key(a.value) as key
    from public.bowler_identities i
    cross join lateral jsonb_array_elements_text(
      jsonb_build_array(i.data->>'nickname', i.data->>'realName', i.data->>'real_name')
      || case when jsonb_typeof(i.data->'aliases') = 'array' then i.data->'aliases' else '[]'::jsonb end
    ) a
  ), matched_names as (
    select key from submitted_names
    union
    select aliases.key from identity_names aliases
    where exists (
      select 1 from identity_names known join submitted_names s on known.key = s.key
      where known.id = aliases.id and known.key <> ''
    )
  ), title_names as (
    select public.phase3_reservation_identity_key(coalesce(nullif(t.data->>'bowler', ''), t.data->>'name')) as key
    from public.manual_titles t
    where coalesce(t.data->>'hof', 'false') <> 'true'
    union all
    select public.phase3_reservation_identity_key(r.value->>'name')
    from public.archived_tournaments a
    cross join lateral jsonb_array_elements(
      case when jsonb_typeof(a.data->'results') = 'array' then a.data->'results' else '[]'::jsonb end
    ) r
    where r.value->'tournamentWinner' = 'true'::jsonb
  )
  select exists (select 1 from title_names t join matched_names n on t.key = n.key where t.key <> '')
  into has_title;

  if mode = 'nonChampions' and has_title then
    raise exception '% is a previous champion. This tournament is for non-champions only.', coalesce(nullif(btrim(member->>'name'), ''), 'This bowler');
  elsif mode = 'championsOnly' and not has_title then
    raise exception '% has no recorded tournament win. This tournament is for previous champions only.', coalesce(nullif(btrim(member->>'name'), ''), 'This bowler');
  end if;
end;
$$;

revoke all on function public.phase3_reservation_identity_key(text),
  public.phase3_published_reservation_rules(text, jsonb, jsonb), public.phase3_validate_individual_reservation(jsonb, jsonb) from public, anon, authenticated;

-- Enforce online reservations only. Administrator roster operations use
-- their existing direct paths. The supplied instant is server time in both RPCs.
create function public.assert_public_reservation_window(
  schedule_event jsonb, schedule_date date, public_info jsonb, fallback_date text, checked_at timestamptz
)
returns void language plpgsql set search_path = pg_catalog as $cutoff$
declare
  event_date text := coalesce(
    nullif(schedule_event->>'startDate', ''),
    schedule_date::text,
    nullif(schedule_event #>> '{publicInfo,date}', ''),
    nullif(fallback_date, ''),
    nullif(public_info->>'date', '')
  );
begin
  if schedule_event->>'publicDetailsPage' = 'multiDayInfo'
      or public_info->>'publicDetailsPage' = 'multiDayInfo'
      or (nullif(schedule_event->>'endDate', '') is not null
          and (schedule_event->>'endDate') is distinct from event_date) then
    raise exception 'Online reservations are unavailable for multi-day events.';
  end if;

  if event_date is null or event_date !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
      or not pg_input_is_valid(event_date, 'date') then
    raise exception 'Online reservations require a valid published tournament date.';
  end if;

  if checked_at at time zone 'America/New_York' >= event_date::date + time '08:00' then
    raise exception 'Online reservations closed at 8:00 a.m. Eastern on the tournament date.';
  end if;
end;
$cutoff$;
revoke all on function public.assert_public_reservation_window(jsonb, date, jsonb, text, timestamptz)
from public, anon, authenticated;

create or replace function public.create_public_reservation(payload jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  next_id text := coalesce(nullif(payload->>'id', ''), gen_random_uuid()::text);
  next_tournament_id text := coalesce(nullif(payload->>'tournamentKey', ''), nullif(payload->>'tournament', ''), '');
  next_name text := lower(trim(coalesce(payload->>'name', '')));
  next_nickname text := lower(trim(coalesce(payload->>'nickname', '')));
  settings jsonb;
  reservation_bucket jsonb;
  schedule_data jsonb;
  schedule_date date;
  event_info jsonb;
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
  select data, sort_date into schedule_data, schedule_date from public.schedule_events
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

  event_info := coalesce(schedule_data->'publicInfo', reservation_bucket->'publicTournamentInfo',
    case when settings->>'tournamentKey' = next_tournament_id then settings->'publicTournamentInfo' end, '{}'::jsonb);
  event_info := event_info || public.phase3_published_reservation_rules(next_tournament_id, schedule_data, event_info);
  if event_info->>'tournamentStyle' in ('doubles', 'trios') then
    raise exception 'This tournament requires a full team reservation.';
  end if;
  perform public.phase3_validate_individual_reservation(event_info, payload);

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

  perform public.assert_public_reservation_window(
    schedule_data, schedule_date, event_info,
    coalesce(nullif(reservation_bucket->>'tournamentDate', ''),
      case when settings->>'tournamentKey' = next_tournament_id then settings->>'tournamentDate' end),
    clock_timestamp()
  );

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
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  tournament_key text := trim(coalesce(payload->>'tournamentKey', ''));
  group_id text := coalesce(nullif(payload->>'id', ''), gen_random_uuid()::text);
  members jsonb := payload->'members'; member jsonb; member_name text; member_nickname text;
  member_index integer := 0; team_size integer; settings jsonb; bucket jsonb; schedule_data jsonb; schedule_date date;
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
  select data, sort_date into schedule_data, schedule_date from public.schedule_events where id = tournament_key or data->>'eventId' = tournament_key limit 1;
  event_info := coalesce(schedule_data->'publicInfo', bucket->'publicTournamentInfo', case when settings->>'tournamentKey' = tournament_key then settings->'publicTournamentInfo' end, '{}'::jsonb);
  event_info := event_info || public.phase3_published_reservation_rules(tournament_key, schedule_data, event_info);
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
    perform public.phase3_validate_individual_reservation(event_info, member);
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
  perform public.assert_public_reservation_window(
    schedule_data, schedule_date, event_info,
    coalesce(nullif(bucket->>'tournamentDate', ''),
      case when settings->>'tournamentKey' = tournament_key then settings->>'tournamentDate' end),
    clock_timestamp()
  );

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

-- The approved closure changes one Schedule flag. The 64-entry Schedule
-- cap, shared limit of 16, and reservation/history rows are preserved.
update public.schedule_events
set data = jsonb_set(data, '{reservationSettings,entriesOpen}', 'false'::jsonb, false)
where id = 'schedule-8' and data #>> '{reservationSettings,entriesOpen}' = 'true';

do $verify$
begin
  if not exists (
    select 1 from public.schedule_events where id = 'schedule-8'
      and data #>> '{reservationSettings,entriesOpen}' = 'false'
      and data #>> '{reservationSettings,reservationLimit}' = '64'
  ) then
    raise exception 'KWT #3 was not closed at its approved capacity';
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
end;
$verify$;
commit;
