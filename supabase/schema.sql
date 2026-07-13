create extension if not exists pgcrypto;

create table if not exists public.app_settings (
  id text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.schedule_events (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  sort_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.manual_titles (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  bowler text,
  season text,
  source text,
  is_hof boolean not null default false,
  is_major boolean not null default false,
  is_eligible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bowler_identities (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  nickname text,
  real_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.archived_tournaments (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  name text,
  season text,
  event_date date,
  center text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reservations (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  tournament_id text,
  name text,
  email text,
  phone text,
  added_to_roster boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.active_tournament_snapshots (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  name text,
  event_date date,
  tournament_style text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tournament_drafts (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  name text,
  saved_at timestamptz,
  event_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.public_app_settings (
  id text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.reservation_public_counts (
  tournament_id text primary key,
  reservation_count integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.reservation_public_roster (
  id text primary key,
  tournament_id text not null default '',
  display_name text not null default 'Reserved Bowler',
  status text not null default 'Registered',
  registration_number text,
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_app_settings_updated_at on public.app_settings;
create trigger set_app_settings_updated_at
before update on public.app_settings
for each row execute function public.set_updated_at();

drop trigger if exists set_schedule_events_updated_at on public.schedule_events;
create trigger set_schedule_events_updated_at
before update on public.schedule_events
for each row execute function public.set_updated_at();

drop trigger if exists set_manual_titles_updated_at on public.manual_titles;
create trigger set_manual_titles_updated_at
before update on public.manual_titles
for each row execute function public.set_updated_at();

drop trigger if exists set_bowler_identities_updated_at on public.bowler_identities;
create trigger set_bowler_identities_updated_at
before update on public.bowler_identities
for each row execute function public.set_updated_at();

drop trigger if exists set_archived_tournaments_updated_at on public.archived_tournaments;
create trigger set_archived_tournaments_updated_at
before update on public.archived_tournaments
for each row execute function public.set_updated_at();

drop trigger if exists set_reservations_updated_at on public.reservations;
create trigger set_reservations_updated_at
before update on public.reservations
for each row execute function public.set_updated_at();

drop trigger if exists set_active_tournament_snapshots_updated_at on public.active_tournament_snapshots;
create trigger set_active_tournament_snapshots_updated_at
before update on public.active_tournament_snapshots
for each row execute function public.set_updated_at();

drop trigger if exists set_tournament_drafts_updated_at on public.tournament_drafts;
create trigger set_tournament_drafts_updated_at
before update on public.tournament_drafts
for each row execute function public.set_updated_at();

drop trigger if exists set_admin_profiles_updated_at on public.admin_profiles;
create trigger set_admin_profiles_updated_at
before update on public.admin_profiles
for each row execute function public.set_updated_at();

alter table public.app_settings enable row level security;
alter table public.schedule_events enable row level security;
alter table public.manual_titles enable row level security;
alter table public.bowler_identities enable row level security;
alter table public.archived_tournaments enable row level security;
alter table public.reservations enable row level security;
alter table public.active_tournament_snapshots enable row level security;
alter table public.tournament_drafts enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.public_app_settings enable row level security;
alter table public.reservation_public_counts enable row level security;
alter table public.reservation_public_roster enable row level security;

grant usage on schema public to anon, authenticated;
revoke select on public.app_settings from anon;
grant select on public.app_settings to authenticated;
grant select on public.public_app_settings to anon, authenticated;
grant select on public.schedule_events to anon, authenticated;
grant select on public.manual_titles to anon, authenticated;
grant select on public.bowler_identities to anon, authenticated;
grant select on public.archived_tournaments to anon, authenticated;
grant select on public.active_tournament_snapshots to anon, authenticated;
grant select on public.reservation_public_counts to anon, authenticated;
grant select on public.reservation_public_roster to anon, authenticated;
revoke insert, update, delete on public.public_app_settings from anon, authenticated;
revoke insert, update, delete on public.reservation_public_counts from anon, authenticated;
revoke insert, update, delete on public.reservation_public_roster from anon, authenticated;
revoke select on public.tournament_drafts from anon;
grant select on public.tournament_drafts to authenticated;
revoke select on public.reservations from anon;
revoke insert on public.reservations from anon;
grant select, insert on public.reservations to authenticated;
grant select on public.admin_profiles to authenticated;
grant insert, update, delete on public.app_settings to authenticated;
grant insert, update, delete on public.schedule_events to authenticated;
grant insert, update, delete on public.manual_titles to authenticated;
grant insert, update, delete on public.bowler_identities to authenticated;
grant insert, update, delete on public.archived_tournaments to authenticated;
grant insert, update, delete on public.active_tournament_snapshots to authenticated;
grant insert, update, delete on public.tournament_drafts to authenticated;
grant update, delete on public.reservations to authenticated;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
  );
$$;

create or replace function public.my_admin_profile()
returns table(user_id uuid, email text, role text)
language sql
security definer
set search_path = public
as $$
  select admin_profiles.user_id, admin_profiles.email, admin_profiles.role
  from public.admin_profiles
  where admin_profiles.user_id = auth.uid()
  limit 1;
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.my_admin_profile() to authenticated;

create or replace function public.create_public_reservation(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
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
$$;

grant execute on function public.create_public_reservation(jsonb) to anon, authenticated;

create or replace function public.refresh_public_app_settings(target_id text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
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
$$;

create or replace function public.sync_public_app_settings_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_public_app_settings(coalesce(new.id, old.id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists sync_public_app_settings_after_change on public.app_settings;
create trigger sync_public_app_settings_after_change
after insert or update or delete on public.app_settings
for each row execute function public.sync_public_app_settings_trigger();

create or replace function public.refresh_reservation_public_mirrors(target_tournament_id text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.reservation_public_roster
  where target_tournament_id is null or tournament_id = target_tournament_id;

  insert into public.reservation_public_roster (id, tournament_id, display_name, status, registration_number, updated_at)
  select
    reservations.id,
    coalesce(reservations.tournament_id, ''),
    case
      when lower(trim(coalesce(reservations.data->>'nickname', ''))) in ('', 'na', 'n/a', 'none', 'unknown', 'tbd', '-') then coalesce(nullif(trim(reservations.name), ''), 'Reserved Bowler')
      else trim(reservations.data->>'nickname')
    end,
    coalesce(nullif(trim(reservations.data->>'status'), ''), 'Registered'),
    coalesce(nullif(trim(reservations.data->>'registrationNumber'), ''), nullif(trim(reservations.data->>'confirmationNumber'), '')),
    now()
  from public.reservations
  where target_tournament_id is null or reservations.tournament_id = target_tournament_id
  on conflict (id) do update
  set tournament_id = excluded.tournament_id,
      display_name = excluded.display_name,
      status = excluded.status,
      registration_number = excluded.registration_number,
      updated_at = excluded.updated_at;

  delete from public.reservation_public_counts
  where target_tournament_id is null or tournament_id = target_tournament_id;

  insert into public.reservation_public_counts (tournament_id, reservation_count, updated_at)
  select
    reservations.tournament_id,
    count(*)::integer,
    now()
  from public.reservations
  where coalesce(nullif(trim(reservations.data->>'status'), ''), 'Registered') = 'Registered'
    and reservations.tournament_id is not null
    and (target_tournament_id is null or reservations.tournament_id = target_tournament_id)
  group by reservations.tournament_id
  on conflict (tournament_id) do update
  set reservation_count = excluded.reservation_count,
      updated_at = excluded.updated_at;
end;
$$;

create or replace function public.sync_reservation_public_mirrors_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_reservation_public_mirrors(old.tournament_id);
    return old;
  end if;

  if tg_op = 'UPDATE' and coalesce(old.tournament_id, '') <> coalesce(new.tournament_id, '') then
    perform public.refresh_reservation_public_mirrors(old.tournament_id);
  end if;

  perform public.refresh_reservation_public_mirrors(new.tournament_id);
  return new;
end;
$$;

drop trigger if exists sync_reservation_public_mirrors_after_change on public.reservations;
create trigger sync_reservation_public_mirrors_after_change
after insert or update or delete on public.reservations
for each row execute function public.sync_reservation_public_mirrors_trigger();

select public.refresh_public_app_settings(null);
select public.refresh_reservation_public_mirrors(null);

drop policy if exists "Public read app settings" on public.app_settings;
drop policy if exists "Admins read app settings" on public.app_settings;
create policy "Admins read app settings"
on public.app_settings for select
to authenticated
using (public.is_admin());

drop policy if exists "Public read schedule events" on public.schedule_events;
create policy "Public read schedule events"
on public.schedule_events for select
using (true);

drop policy if exists "Public read manual titles" on public.manual_titles;
create policy "Public read manual titles"
on public.manual_titles for select
using (true);

drop policy if exists "Public read bowler identities" on public.bowler_identities;
create policy "Public read bowler identities"
on public.bowler_identities for select
using (true);

drop policy if exists "Public read archived tournaments" on public.archived_tournaments;
create policy "Public read archived tournaments"
on public.archived_tournaments for select
using (true);

drop policy if exists "Public read active tournament snapshots" on public.active_tournament_snapshots;
create policy "Public read active tournament snapshots"
on public.active_tournament_snapshots for select
using (true);

drop policy if exists "Public read public app settings" on public.public_app_settings;
create policy "Public read public app settings"
on public.public_app_settings for select
using (true);

drop policy if exists "Public read reservation public counts" on public.reservation_public_counts;
create policy "Public read reservation public counts"
on public.reservation_public_counts for select
using (true);

drop policy if exists "Public read reservation public roster" on public.reservation_public_roster;
create policy "Public read reservation public roster"
on public.reservation_public_roster for select
using (true);

drop policy if exists "Admins read tournament drafts" on public.tournament_drafts;
create policy "Admins read tournament drafts"
on public.tournament_drafts for select
to authenticated
using (public.is_admin());

drop policy if exists "Public read reservations" on public.reservations;

drop policy if exists "Public create reservations" on public.reservations;

drop policy if exists "Admins read reservations" on public.reservations;
create policy "Admins read reservations"
on public.reservations for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins read admin profiles" on public.admin_profiles;
create policy "Admins read admin profiles"
on public.admin_profiles for select
to authenticated
using (public.is_admin() or user_id = auth.uid());

drop policy if exists "Admins write app settings" on public.app_settings;
create policy "Admins write app settings"
on public.app_settings for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins write schedule events" on public.schedule_events;
create policy "Admins write schedule events"
on public.schedule_events for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins write manual titles" on public.manual_titles;
create policy "Admins write manual titles"
on public.manual_titles for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins write bowler identities" on public.bowler_identities;
create policy "Admins write bowler identities"
on public.bowler_identities for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins write archived tournaments" on public.archived_tournaments;
create policy "Admins write archived tournaments"
on public.archived_tournaments for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins write active tournament snapshots" on public.active_tournament_snapshots;
create policy "Admins write active tournament snapshots"
on public.active_tournament_snapshots for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins write tournament drafts" on public.tournament_drafts;
create policy "Admins write tournament drafts"
on public.tournament_drafts for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins write reservations" on public.reservations;
create policy "Admins write reservations"
on public.reservations for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
