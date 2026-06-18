create or replace view public.reservation_public_roster as
select
  id,
  tournament_id,
  case
    when lower(trim(coalesce(data->>'nickname', ''))) in ('', 'na', 'n/a', 'none', 'unknown', 'tbd', '-') then coalesce(nullif(trim(name), ''), 'Reserved Bowler')
    else trim(data->>'nickname')
  end as display_name,
  coalesce(nullif(trim(data->>'status'), ''), 'Registered') as status,
  coalesce(nullif(trim(data->>'registrationNumber'), ''), nullif(trim(data->>'confirmationNumber'), '')) as registration_number
from public.reservations;

grant select on public.reservation_public_roster to anon, authenticated;
