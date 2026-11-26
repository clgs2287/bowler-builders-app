-- Run only against an authorized isolated database or verified staging after the forward candidate.
-- Synthetic writes are transaction-scoped. ON_ERROR_STOP closes the connection and rolls back on failure.
\set ON_ERROR_STOP on
begin;

insert into public.manual_titles (id, data) values
  ('phase3-test-title', '{"bowler":"P3 Verification Alpha"}'),
  ('phase3-test-second-title', '{"bowler":"P3 Verification Alpha","tournament":"Second"}'),
  ('phase3-test-hof', '{"bowler":"P3 Verification Beta","hof":true}');
insert into public.bowler_identities (id, data) values
  ('phase3-test-identity', '{"realName":"P3 Verification Alpha","aliases":["P3 Alpha Alias"]}');
insert into public.archived_tournaments (id, data) values
  ('phase3-test-archive', '{"results":[{"name":"P3 Verification Gamma","tournamentWinner":true},{"name":"P3 Verification Beta","place":1}]}'),
  ('phase3-test-second-archive', '{"name":"Second Event","results":[{"name":"P3 Verification Gamma","tournamentWinner":true}]}');

with fixtures(event_id, style, mode, cap, capacity, previous_champions, multi_time) as (
  values
    ('phase3-test-average', 'doubles', 'open', 340, 2, null::int, false),
    ('phase3-test-repeat-name', 'doubles', 'open', 340, 48, null, false),
    ('phase3-test-disabled', 'doubles', 'open', null, 48, null, false),
    ('phase3-test-nonchampion', 'singles', 'nonChampions', null, 1, null, false),
    ('phase3-test-champions', 'singles', 'championsOnly', null, 48, null, false),
    ('phase3-test-team-champions', 'doubles', 'championsOnly', null, 48, null, false),
    ('phase3-test-previous-champions', 'doubles', 'open', null, 48, 1, false),
    ('phase3-test-multitime', 'trios', 'open', null, 48, 2, true)
)
insert into public.schedule_events (id, data)
select event_id, jsonb_build_object(
  'eventId', event_id, 'name', event_id, 'center', 'Bayside Bowl', 'address', '58 Alder St, Portland, ME 04101',
  'reservationSettings', jsonb_build_object('entriesOpen', true, 'reservationLimit', capacity),
  'publicInfo', '{"tournamentStyle":"singles","reservationEligibility":"open"}'::jsonb,
  'eventSetup', jsonb_build_object('reservationRules', jsonb_build_object(
    'tournamentStyle', style, 'reservationEligibility', mode, 'useHandicapScores', style = 'doubles',
    'maxCombinedTeamAverage', cap, 'maxPreviousChampions', previous_champions, 'limitMultiTimeChampions', multi_time
  ))
)
from fixtures;
insert into public.schedule_events (id, data) values ('phase3-test-legacy-eligibility', '{
  "eventId":"phase3-test-legacy-eligibility",
  "reservationSettings":{"entriesOpen":true},
  "publicInfo":{},
  "eventSetup":{"tournamentInfo":{"scheduleEventId":"phase3-test-legacy-eligibility","reservationEligibility":"championsOnly"}}
}');

do $$
begin
  if has_table_privilege('anon', 'public.bowling_centers', 'select')
    or has_table_privilege('anon', 'public.reservation_average_verifications', 'select,insert,update,delete')
    or has_function_privilege('anon', 'public.phase3_validate_individual_reservation(jsonb,jsonb)', 'execute') then
    raise exception 'The anonymous role can access private data or helpers.';
  end if;
  if (select count(*) from public.bowling_centers where name in ('Bayside Bowl', 'Just-In-Time Recreation', 'Interstate Bowling Center')) <> 3 then
    raise exception 'The three original center seeds are missing.';
  end if;
  begin
    insert into public.bowling_centers(name, address) values (E'  Bayside\t BOWL  ', 'Duplicate address');
    raise exception 'Duplicate normalized center name was accepted.';
  exception when unique_violation then null;
  end;
  insert into public.bowling_centers(name, address) values ('P3 Test Center', '1 Synthetic St');
  update public.bowling_centers set name = 'P3 Renamed Test Center', active = false where name = 'P3 Test Center';
  if not exists (select from public.bowling_centers where name = 'P3 Renamed Test Center' and not active) then
    raise exception 'Center rename/deactivation did not persist.';
  end if;
  if (select data->>'address' from public.schedule_events where id = 'phase3-test-average') <> '58 Alder St, Portland, ME 04101' then
    raise exception 'Directory changes modified an existing event address.';
  end if;
end;
$$;

set local role anon;
do $$
declare
  trial record;
  result jsonb;
begin
  for trial in
    select *
    from (values
      ('average', 'at-cap', 'P3 At Alpha', 'P3 At Beta', 'Registered', null::text),
      ('average', 'over-cap', 'P3 Over Alpha', 'P3 Over Beta', 'Registered', null),
      ('average', 'missing', 'P3 Missing Alpha', 'P3 Missing Beta', 'Waitlisted', null),
      ('average', 'duplicate', 'P3 At Alpha', 'P3 New Partner', null, 'already on the reservation list'),
      ('repeat-name', 'repeat', 'P3 Over Alpha', 'P3 Over Beta', 'Registered', null),
      ('disabled', 'disabled', 'P3 Disabled Alpha', 'P3 Disabled Beta', 'Registered', null),
      ('team-champions', 'bad-champ', 'P3 Verification Alpha', 'P3 Verification Beta', null, 'no recorded tournament win'),
      ('team-champions', 'champ', 'P3 Verification Alpha', 'P3 Verification Gamma', 'Registered', null),
      ('previous-champions', 'prior-champ', 'P3 Verification Alpha', 'P3 Verification Gamma', null, 'one non-champion'),
      ('multitime', 'multi', 'P3 Verification Alpha', 'P3 Verification Gamma', null, 'multiple tournament wins')
    ) scenarios(event_suffix, group_suffix, first_name, second_name, expected_status, expected_message)
  loop
    begin
      result := public.create_public_team_reservation(jsonb_build_object(
        'id', 'phase3-test-' || trial.group_suffix,
        'tournamentKey', 'phase3-test-' || trial.event_suffix,
        'email', 'phase3@example.invalid',
        'members', jsonb_build_array(
          jsonb_build_object('name', trial.first_name, 'average', 141),
          jsonb_build_object('name', trial.second_name, 'average', 200)
        ) || case when trial.event_suffix = 'multitime' then '[{"name":"P3 Unrestricted Third"}]'::jsonb else '[]'::jsonb end
      ));
      if trial.expected_message is not null then
        raise exception 'Expected team rejection for %', trial.group_suffix;
      end if;
      if jsonb_array_length(result->'reservationRows') is distinct from 2 or result->>'status' is distinct from trial.expected_status then
        raise exception 'Unexpected reservation result for %: %', trial.group_suffix, result;
      end if;
    exception when raise_exception then
      if trial.expected_message is null or position(trial.expected_message in sqlerrm) = 0 then raise; end if;
    end;
  end loop;

  for trial in
    select *
    from (values
      ('nonchampion', 'P3 Alpha Alias', 'previous champion', null::text),
      ('nonchampion', 'P3 Verification Beta', null, 'Registered'),
      ('nonchampion', 'P3 Verification Delta', null, 'Waitlisted'),
      ('nonchampion', 'P3 Verification Beta', 'already on the reservation list', null),
      ('champions', 'P3 Verification Beta', 'no recorded tournament win', null),
      ('champions', 'P3 Verification Gamma', null, 'Registered'),
      ('legacy-eligibility', 'P3 Verification Beta', 'no recorded tournament win', null),
      ('average', 'P3 Solo', 'full team reservation', null)
    ) scenarios(event_suffix, bowler_name, expected_message, expected_status)
  loop
    begin
      result := public.create_public_reservation(jsonb_build_object(
        'tournamentKey', 'phase3-test-' || trial.event_suffix,
        'name', trial.bowler_name, 'email', 'phase3@example.invalid', 'reservationLimit', 48
      ));
      if trial.expected_message is not null then
        raise exception 'Expected single rejection for %, %', trial.event_suffix, trial.bowler_name;
      end if;
      if nullif(result->>'id', '') is null or result->>'status' is distinct from trial.expected_status
        or nullif(result->>'confirmationNumber', '') is null then
        raise exception 'Unexpected Singles reservation result.';
      end if;
    exception when raise_exception then
      if trial.expected_message is null or position(trial.expected_message in sqlerrm) = 0 then raise; end if;
    end;
  end loop;
end;
$$;
reset role;

insert into public.reservation_average_verifications (reservation_id, bowler_name, average, source, verified_on) values
  ('phase3-test-at-cap-1', 'P3 At Alpha', 140, 'USBC', '2026-11-25'),
  ('phase3-test-at-cap-2', 'P3 At Beta', 200, 'Bayside Bowl league sheet', '2026-11-25'),
  ('phase3-test-over-cap-1', 'P3 Over Alpha', 140, 'Other director-approved source', null),
  ('phase3-test-over-cap-2', 'P3 Over Beta', 200, null, null),
  ('phase3-test-missing-1', 'P3 Missing Alpha', 140, null, null);
update public.reservation_average_verifications set average = 141 where reservation_id = 'phase3-test-over-cap-1';

do $$
begin
  if (select sum(average) from public.reservation_average_verifications where reservation_id like 'phase3-test-over-cap-%') <> 341
    or (select count(*) from public.reservations where id like 'phase3-test-over-cap-%' and data->>'status' = 'Registered') <> 2
    or exists (select from public.reservation_average_verifications where reservation_id like 'phase3-test-repeat-%') then
    raise exception 'Review should preserve accepted entries and keep same-name reservations independent.';
  end if;
end;
$$;

set local role authenticated;
do $$
begin
  if exists (select from public.bowling_centers) or exists (select from public.reservation_average_verifications) then
    raise exception 'A non-admin authenticated user can read private records.';
  end if;
  begin
    insert into public.bowling_centers(name, address) values ('P3 Unauthorized', 'Unauthorized address');
    raise exception 'A non-admin wrote a center.';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.reservation_average_verifications(reservation_id, bowler_name, average)
      values ('phase3-test-missing-2', 'P3 Missing Beta', 199);
    raise exception 'A non-admin created a verified average.';
  exception when insufficient_privilege then null;
  end;
  update public.reservation_average_verifications set average = 999 where reservation_id = 'phase3-test-at-cap-1';
  if found then raise exception 'A non-admin edited a verified average.'; end if;
  update public.schedule_events set data = '{}' where id = 'phase3-test-average';
  if found then raise exception 'A non-admin modified event eligibility.'; end if;
end;
$$;
reset role;

-- Reuse an existing administrator only as the transaction-local JWT subject.
-- The fixture cannot modify Auth users, and no subject or profile data is exported.
do $$
declare actor uuid;
begin
  select user_id into actor from public.admin_profiles order by user_id limit 1;
  if actor is null then raise exception 'The positive RLS test requires an existing administrator.'; end if;
  perform set_config('request.jwt.claim.sub', actor::text, true);
  perform set_config('request.jwt.claims', jsonb_build_object('sub', actor::text, 'role', 'authenticated')::text, true);
end;
$$;
set local role authenticated;
do $$
begin
  if not public.is_admin() then raise exception 'The existing administrator did not pass the policy.'; end if;
  insert into public.bowling_centers (name,address) values ('P3 Authorized Center', '1 Synthetic St');
  update public.bowling_centers set active = false where name = 'P3 Authorized Center';
  if not found then raise exception 'The administrator could not update the center.'; end if;
  insert into public.reservation_average_verifications(reservation_id, bowler_name, average, source, verified_on)
    values ('phase3-test-missing-2', 'P3 Missing Beta', 220, 'Bayside Bowl league sheet', '2026-11-25');
  update public.reservation_average_verifications set average = 221 where reservation_id = 'phase3-test-missing-2';
  if not found then raise exception 'The administrator could not update the verified average.'; end if;
  if not exists (select from public.reservation_average_verifications where reservation_id = 'phase3-test-missing-2' and average = 221) then
    raise exception 'The administrator could not read the updated verified average.';
  end if;
  update public.schedule_events
    set data=jsonb_set(data, '{eventSetup,reservationRules,reservationEligibility}', '"championsOnly"')
    where id = 'phase3-test-disabled';
  if not found then raise exception 'The administrator could not update the synthetic event eligibility.'; end if;
end;
$$;
reset role;

rollback;
