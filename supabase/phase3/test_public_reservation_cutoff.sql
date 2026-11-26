-- Run only on the authorized isolated or staging target after cutoff SQL.
-- ON_ERROR_STOP must be enabled. The synthetic rows are rolled back.
begin;

do $calendar$
declare
  item record;
begin
  for item in select * from (values
    ('2027-01-10', '2027-01-10 13:00:00+00'::timestamptz),
    ('2027-07-12', '2027-07-12 12:00:00+00'::timestamptz),
    ('2027-03-14', '2027-03-14 12:00:00+00'::timestamptz),
    ('2027-11-07', '2027-11-07 13:00:00+00'::timestamptz)
  ) as fixtures(event_day, cutoff)
  loop
    perform public.assert_public_reservation_window(
      jsonb_build_object('startDate', item.event_day), null, null, null, item.cutoff - interval '1 minute'
    );
    for offset_value in 0..1 loop
      begin
        perform public.assert_public_reservation_window(
          jsonb_build_object('startDate', item.event_day), null, null, null,
          item.cutoff + offset_value * interval '1 minute'
        );
        raise exception 'Expected cutoff rejection for %', item.event_day;
      exception when raise_exception then
        if sqlerrm <> 'Online reservations closed at 8:00 a.m. Eastern on the tournament date.' then raise; end if;
      end;
    end loop;
  end loop;
end;
$calendar$;

with eastern_today as (select (clock_timestamp() at time zone 'America/New_York')::date as today)
insert into public.schedule_events (id, sort_date, data)
select fixture.id, d.today + fixture.day_offset, jsonb_build_object(
  'startDate', (d.today + fixture.day_offset)::text,
  'name', fixture.id,
  'publicInfo', jsonb_build_object('tournamentStyle', fixture.style),
  'publicDetailsPage', case when fixture.id = 'cutoff-safe-test-mail' then 'multiDayInfo' else 'tournamentInfo' end,
  'reservationSettings', jsonb_build_object('entriesOpen', fixture.is_open, 'reservationLimit', 1)
)
from eastern_today d cross join (values
  ('cutoff-safe-test-single', 'singles', -1, true),
  ('cutoff-safe-test-double', 'doubles', -1, true),
  ('cutoff-safe-test-trio', 'trios', -1, true),
  ('cutoff-safe-test-close', 'singles', 1, false),
  ('cutoff-safe-test-mail', 'singles', 1, true),
  ('cutoff-safe-test-future', 'singles', 1, true)
) as fixture(id, style, day_offset, is_open);

set local role anon;
do $routes$
declare
  item record;
  desired_status text;
  result jsonb;
begin
  for item in select * from (values
    ('single', 1, 'Online reservations closed at 8:00 a.m. Eastern on the tournament date.'),
    ('double', 2, 'Online reservations closed at 8:00 a.m. Eastern on the tournament date.'),
    ('trio', 3, 'Online reservations closed at 8:00 a.m. Eastern on the tournament date.'),
    ('close', 1, 'Entries are closed for this tournament.'),
    ('mail', 1, 'Online reservations are unavailable for multi-day events.')
  ) as fixtures(key, members_count, expected)
  loop
    foreach desired_status in array array['Registered', 'Waitlisted'] loop
      begin
        if item.members_count = 1 then
          perform public.create_public_reservation(jsonb_build_object(
            'id', 'cutoff-safe-test-reject-' || item.key, 'name', 'Synthetic Cutoff Alpha',
            'tournamentKey', 'cutoff-safe-test-' || item.key, 'status', desired_status
          ));
        else
          perform public.create_public_team_reservation(jsonb_build_object(
            'id', 'cutoff-safe-test-reject-' || item.key, 'email', 'cutoff@example.invalid',
            'tournamentKey', 'cutoff-safe-test-' || item.key, 'status', desired_status,
            'members', case when item.members_count = 2
              then '[{"name":"Synthetic Alpha"},{"name":"Synthetic Beta"}]'::jsonb
              else '[{"name":"Synthetic Alpha"},{"name":"Synthetic Beta"},{"name":"Synthetic Gamma"}]'::jsonb end
          ));
        end if;
        raise exception 'Unexpected acceptance for % %', item.key, desired_status;
      exception when raise_exception then
        if sqlerrm <> item.expected then raise; end if;
      end;
    end loop;
  end loop;

  result := public.create_public_reservation('{"id":"cutoff-safe-test-first","tournamentKey":"cutoff-safe-test-future","name":"Synthetic First"}'::jsonb);
  if result->>'status' is distinct from 'Registered' then
    raise exception 'Expected an open online window before cutoff';
  end if;
  result := public.create_public_reservation('{"id":"cutoff-safe-test-next","tournamentKey":"cutoff-safe-test-future","name":"Synthetic Next"}'::jsonb);
  if result->>'status' is distinct from 'Waitlisted' then
    raise exception 'Expected the published one-entry capacity to preserve waitlisting';
  end if;
end;
$routes$;
reset role;

do $verify$
begin
  if exists (select 1 from public.reservations where id like 'cutoff-safe-test-reject-%') then
    raise exception 'A rejected reservation created a row';
  end if;
end;
$verify$;
rollback;
