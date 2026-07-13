do $$
begin
  if exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'public_app_settings'
      and c.relkind = 'v'
  ) then
    execute 'drop view public.public_app_settings';
  end if;

  if exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'reservation_public_counts'
      and c.relkind = 'v'
  ) then
    execute 'drop view public.reservation_public_counts';
  end if;

  if exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'reservation_public_roster'
      and c.relkind = 'v'
  ) then
    execute 'drop view public.reservation_public_roster';
  end if;
end $$;

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

alter table public.public_app_settings enable row level security;
alter table public.reservation_public_counts enable row level security;
alter table public.reservation_public_roster enable row level security;

grant select on public.public_app_settings to anon, authenticated;
grant select on public.reservation_public_counts to anon, authenticated;
grant select on public.reservation_public_roster to anon, authenticated;
revoke insert, update, delete on public.public_app_settings from anon, authenticated;
revoke insert, update, delete on public.reservation_public_counts from anon, authenticated;
revoke insert, update, delete on public.reservation_public_roster from anon, authenticated;

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
