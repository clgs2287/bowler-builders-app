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

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace view public.reservation_public_counts as
select
  tournament_id,
  count(*)::integer as reservation_count
from public.reservations
group by tournament_id;

create or replace view public.public_app_settings as
select
  id,
  case
    when id = 'reservation_state' then
      (value - 'reservationsByTournament') ||
      jsonb_build_object('reservationsByTournament', '{}'::jsonb)
    else value
  end as value
from public.app_settings
where id in ('schedule_locked', 'reservation_state');

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
alter table public.admin_profiles enable row level security;

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
  requested_number integer := 0;
  next_number integer := 1;
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

  requested_number := greatest(
    case when coalesce(payload->>'registrationNumber', '') ~ '^[0-9]+$' then (payload->>'registrationNumber')::integer else 0 end,
    case when coalesce(payload->>'confirmationNumber', '') ~ '^[0-9]+$' then (payload->>'confirmationNumber')::integer else 0 end
  );
  next_number := greatest(current_max_number + 1, requested_number, 1);
  next_data := payload || jsonb_build_object(
    'id', next_id,
    'tournamentKey', next_tournament_id,
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

drop policy if exists "Admins write reservations" on public.reservations;
create policy "Admins write reservations"
on public.reservations for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
