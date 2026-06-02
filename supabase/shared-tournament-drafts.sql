create table if not exists public.tournament_drafts (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  name text,
  saved_at timestamptz,
  event_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_tournament_drafts_updated_at on public.tournament_drafts;
create trigger set_tournament_drafts_updated_at
before update on public.tournament_drafts
for each row execute function public.set_updated_at();

alter table public.tournament_drafts enable row level security;

revoke select on public.tournament_drafts from anon;
grant select on public.tournament_drafts to authenticated;
grant insert, update, delete on public.tournament_drafts to authenticated;

drop policy if exists "Admins read tournament drafts" on public.tournament_drafts;
create policy "Admins read tournament drafts"
on public.tournament_drafts for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins write tournament drafts" on public.tournament_drafts;
create policy "Admins write tournament drafts"
on public.tournament_drafts for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
