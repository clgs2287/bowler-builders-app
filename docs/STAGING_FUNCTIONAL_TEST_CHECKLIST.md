# Staging Functional Test Checklist

Use only the private staging deployment and the fixture described in
`STAGING_SYNTHETIC_TOURNAMENT_FIXTURE.md`. Do not begin this checklist until the
fixture creation and exact-ID cleanup plan are separately approved.

## Automated before browser testing

- `npm test`: scoring totals, handicap, ranking/ties, payouts, bracket payouts,
  finals, stepladders, multi-event averages, All Events, youth, daily bonuses,
  team champion rules, printing layout helpers, KWT source scope, and email
  fail-closed behavior.
- rollback-only database workflow: capacity, waitlist, duplicate prevention,
  team completeness, two-champion acceptance, three-champion rejection,
  multi-time-champion rejection, public mirrors, and Storage policy contract.
- `npm run lint` and `npm run build` before every candidate Preview deployment.

## One-time manual staging pass

### 1. Access and email safety

1. Sign in with the existing staging administrator password.
   Expected: login succeeds without any email.
2. Do not use signup, reset password, invite, magic-link, or email-change flows.
3. In the admin UI, trigger only a guarded synthetic email preview/action if it
   exists. Expected: blocked/simulated result and no provider request.

### 2. Registration and lanes

1. Submit one synthetic single, a complete doubles team, and a complete trio.
   Expected: each shows the right event and group members.
2. Try a duplicate bowler, incomplete team, three-champion trio, and two-
   multi-time-champion trio. Expected: rejection with no retained entry.
3. Check in accepted fixture entries and assign lanes. Expected: team members
   remain grouped, lane reminders show prior lanes where applicable, and no
   existing staging entry changes.
4. Print a lane sheet and scoresheet. Expected: each opens with only fixture
   bowlers and correct group/lane details.

### 3. Scoring, finals, and money

1. Enter the manifest’s scores. Expected: scratch, handicap, ties, youth awards,
   daily bonuses, and All Events match the manifest.
2. Exercise bracket, matchplay, eliminator, single-game stepladder, best-of-three
   stepladder, Baker, and roll-off fixture states. Expected: advancement and
   places match the pre-recorded outcomes.
3. Check payouts, manual payout display, brackets, high game, and side action.
   Expected: fixture-only names and exact manifest totals.
4. Open KWT points. Expected: event count, points, leader, and expanded details
   render without console errors.

### 4. Public display, archive, and image management

1. View public tournament info, roster, standings, and payouts only while the
   fixture remains private and unpublished. Expected: no contact data; filters
   and mobile layout work.
2. Do not archive or publish the fixture. Archive, historical statistics, and
   KWT behavior are intentionally exercised by automated calculations so no
   synthetic data can appear beside real staging history.
3. Upload one harmless synthetic image under `bb-synth-20261124-v1/`, confirm
   public read and administrator management, then delete that exact image.

## Record and stop conditions

Record the fixture ID, screen, expected result, actual result, and screenshots.
Stop immediately if an email is attempted, an existing record appears selected,
an action targets a non-fixture ID, or a displayed total differs from the
manifest. Preserve the evidence; do not attempt broad cleanup or workaround.
