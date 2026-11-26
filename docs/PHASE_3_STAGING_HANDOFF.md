# Phase 3 staging acceptance and handoff

**Staging acceptance closed on Preview `017ec5d` on November 25, 2026.**

## Director workflow

- In Schedule or Tournament Setup, expand **Remembered bowling centers** to add a center and select it. Use the same editor to rename it or change its address or active status. The catalog starts with Bayside Bowl, Just-In-Time Recreation, and Interstate Bowling Center. Case and whitespace normalize for duplicate detection. Historical events retain their saved name and address, even if a catalog entry changes.
- In **Scoresheets → Emergency Blank Scoresheets**, set event metadata, singles/doubles/trios, 1–12 games, lane ranges such as `1-4, 7, 9-10`, and up to 12 bowler positions per lane in complete teams. Add average and handicap fields when needed. The PDF uses one landscape US Letter page per lane.
- In **Tournament Setup → Reservation eligibility**, select the event and set its existing championship rules. For handicap doubles, enter or clear **Maximum combined team average**. Use **Save Tournament**, then **Save Setup Now**, to publish the selected event's rules.
- On the public reservation page, a capped event displays the maximum and explains director verification. A missing or excessive average does not affect acceptance, confirmation, capacity, or waitlisting. The public form requires no membership number or previous identity.
- In **Reservations → Reservation average review**, open a team and enter each verified average. Optionally select USBC, Bayside Bowl league sheet, or another director-approved source and enter the verification date. The display follows the sum of the two verified values. The director resolves discrepancies and handles any changes to the reservation using the existing workflow.
- Verification is scoped to the specific saved reservation member. It stays private, does not transfer by matching names, and is not used for scoring. Changing the saved member name or nickname requires re-verification when it identifies a different person. Clear an existing verification before substituting a different person with identical saved name and nickname.

| Maximum | Director inputs | Expected review |
| --- | --- | --- |
| 340 | 140 and 200 | **Verified within limit**, combined 340 |
| 340 | 150 and 180 | **Verified within limit**, combined 330 |
| 340 | 141 and 200 | **Exceeds limit**, combined 341 |
| 340 | 140 and blank | **Verification incomplete** |
| Disabled | 141 and 200 | Combined 341 with no limit warning |

## Migration prerequisites and order

1. After separate staging authorization, verify the Preview configuration and database connection both identify staging project **`evgyzbgixhaiykxznqez`**. Use the existing staging connection and CA verification pinned by the operations tooling. Keep the deployed email guard on and verify its diagnostics for the actual Preview and shared guarded endpoints before any browser submission. Use `@example.invalid` contacts.
2. Create a fresh verified read-only preflight and a readable logical backup using the existing staging tools under `C:\Projects\bowler-builders-db-operations-prep` and `C:\Users\coryl\Tools\BowlerBuilders`. Compare the eleven inventories with the approved `C:\Users\coryl\BowlerBuilders-StagingActiveWorkspacePreflights\2026-11-25_162527-ACTIVE-WORKSPACE-PREFLIGHT-VERIFIED` using `scripts/acceptance/Test-StagingDoublesBaseline.ps1`. The active MIST snapshot must retain its $100 fee and explicit legacy `payoutState.entryFeeBasis = "entry"`. Keep both approved preflights and the new exports untouched.
3. Compare live definitions and permissions read-only against the five already applied 2026-11-23 staging migrations in the database operations repository's proposed-migrations directory, especially `202611230003_public_reservation_capacity.sql` and `202611230004_public_team_reservations.sql`. Verify `public.is_admin()`, the text primary key on `public.reservations(id)`, administrator-only writes on `schedule_events`, and the existing public reservation mirrors. Record the exact output of `pg_get_functiondef` for both reservation RPCs and their effective grants. The local SQL candidate checks the deployed function bodies and execution settings before creating either table.
4. Apply **`supabase/phase3/phase3_reservations_and_centers.sql`** through the approved migration mechanism. It is one transaction, seeds the three centers with stable IDs, creates `bowling_centers` and `reservation_average_verifications`, and adds server-side champion validation to the existing RPCs. The public RPCs never consult verification records. Refresh the Data API schema cache if the two new tables are absent from the API.
5. Run **`supabase/phase3/test_phase3_reservations.sql`** with `psql -X -v ON_ERROR_STOP=1 -f`. This script uses the existing anonymous endpoints and exercises independent rules, prior and multi-time champions, full-team checks, registrations, waitlists, duplicates, source updates, same-name isolation, and permission checks. It rolls back its synthetic rows and deliberately sends no mail. A failure must exit the psql connection so the transaction rolls back.
6. Capture the first post-migration baseline before browser tests. Repeat the eleven existing inventories and export both new tables with fixed columns and sort order. Expect three center seeds and zero verified-average rows on the first installation. If the migration is reinstalled after a rollback, keep previously saved directory and verification rows and compare them by exact ID and contents. These deterministic queries can be saved as CSV with `psql -X --csv -c`:

   ```sql
   select id, name, name_key, address, active
   from public.bowling_centers order by id;
   select reservation_id, bowler_name, bowler_nickname, average, source, verified_on
   from public.reservation_average_verifications order by reservation_id;
   ```

7. Only after SQL verification, deploy the separately approved Preview build and check its guard. Any failure in migration or compatibility checks holds the Preview rollout. When a rollback is needed, first close affected synthetic entries and save a fresh backup. Run **`supabase/phase3/rollback_phase3_reservations.sql`** to restore the captured Phase 2 definitions, use the prior Preview build, and compare RPC definitions, grants, and the thirteen inventories. The rollback retains both new tables, their data, RLS, and saved event rules. Verification rows follow the lifespan of their parent reservation only when the director uses the existing delete workflow. Keep the tables and their data for a later reinstall.

## Staging database integration review

The read-only staging check on November 25, 2026 verified project
\`evgyzbgixhaiykxznqez\`, PostgreSQL 17, the reservation ID primary key,
the administrator policy helper, and the required existing tables. Phase 3
tables were absent. Exact canonical CSV SHA-256 values matched all eleven
approved inventory exports. MIST retained its $100 fee and explicit
\`entry\` basis. The Strikefest 26 settings matched the approved hash.

The live single and team RPC bodies matched the database operations copies
of \`202611230003\` and \`202611230004\`. The older application copies missed
the live configuration locks, protected search path, and capacity precedence.
The revised forward and rollback files are based on the operations copies.
The forward candidate preserves all three reservation locks and schedules'
capacity precedence. The rollback restores the live bodies and preserves the
directory and verification data. The integration suite now exercises the
single RPC's schedule capacity and duplicate prevention, and tests the new
policies as both an administrator and a non-administrator. The transaction-local
administrator subject is taken from the existing profile without exporting it.


The fresh backup completed at 7:00:07 p.m. Eastern and the fresh preflight at
7:00:27 p.m. Eastern. Both manifests verified. All eleven exports matched the
approved 4:25 p.m. preflight and the live staging hashes immediately before
application.

Migration `20261126000903` (`phase3_advisory_average_review_and_bowling_centers`)
committed on staging. The authorized migration applied the reviewed SQL,
ran the synthetic integration suite under a savepoint, and rehearsed the
rollback under a separate savepoint before committing. The rollback rehearsal
restored both original function bodies, owner, ACLs and execution settings
while retaining the seeded tables. The savepoint was then rolled back so
the Phase 3 definitions stayed installed.

- The integration suite passed administrator and non-administrator policy
  checks, normalized center duplicates, historical address preservation,
  independent event rules, both champion validation paths, duplicate and
  waitlist handling, and per-reservation average isolation. Registration
  remained in place with missing, within-limit, and above-limit averages.
- The deployed RPCs retain `pg_catalog, public` search paths, share locks on
  settings and schedule data, the share row exclusive reservation lock, and
  schedule-first capacity. The reservation functions do not query the
  private verification table when making entry decisions.
- The connector serialized its initial two calls. A second test issued two
  direct public RPC requests with 360 ms of overlap against a one-slot event.
  Both succeeded with two members each. Confirmations 1 and 3 corresponded
  to Registered and Waitlisted. A repeat of the registered team was rejected
  with HTTP 400 and PostgreSQL code `P0001`.
- Cleanup removed both marked events by exact ID and their eight exact
  reservation-member IDs. The events were `phase3-race-20261125-91e3805967` and `phase3-race-20261125-91e3805967-parallel`.
  Their four accepted group IDs were `phase3-race-20261125-91e3805967-a`, `phase3-race-20261125-91e3805967-b`, `phase3-race-20261125-91e3805967-parallel-a`, `phase3-race-20261125-91e3805967-parallel-b`.
  The duplicate group `phase3-race-20261125-91e3805967-parallel-duplicate` saved no rows.
- The verified post-migration baseline was captured at 7:40:21 p.m. Eastern
  in `C:\Users\coryl\BowlerBuilders-StagingActiveWorkspacePreflights\2026-11-25_194021-PHASE3-POST-MIGRATION-BASELINE-VERIFIED`. The thirteen-export manifest lists the exact cleanup IDs
  and canonical hashes. All eleven protected inventories matched the approved
  baseline, including MIST's $100 fee and `entry` basis and Strikefest 26.
  The new inventories contain exactly three active seeded centers and zero
  verified averages.

Use this post-migration baseline as the comparison target for the consolidated
Preview run below. Phase 3 is ready for the separately authorized Preview
deployment and deployed browser acceptance.

## Final consolidated Preview acceptance

Run **bb-final-26dfd0e-b3e74966** used immutable Preview commit **26dfd0e**
on staging project **evgyzbgixhaiykxznqez**. Vercel showed Ready. Chrome
confirmed the staging host, and the example.invalid email probe returned HTTP
200, sent false, skipped true, and provider blocked before submissions.

| Check | Deployed result |
| --- | --- |
| Bowling centers | Passed. The three seeds appeared. Added a synthetic center in Tournament Setup, confirmed Schedule and a separately loaded authorized tab displayed it, rejected a normalized duplicate, then renamed and deactivated it. The synthetic schedule event kept its saved center and address. |
| Emergency blank PDF | Passed for singles and doubles with one page each and trios across two lanes and pages. Verified landscape letter, event metadata, game fields, blank roster, series and signature fields, and optional average and handicap columns in generated files. The existing prefilled trios Blank-Lane Score Entry PDF control remained available. |
| Reservation eligibility | Passed for two independent events through the public browser. The champions-only event accepted the synthetic champion and rejected the novice. Previous-champion and multi-time-champion enforcement were verified on the unchanged staging RPCs in the recorded SQL integration suite. |
| Combined-average advisory | Passed. Three teams booked without averages and the fourth waitlisted with normal confirmations #1, #3, #5 and #7. The duplicate attempt was rejected. The director UI showed 340 and 330 within limit, 341 over the limit, and incomplete verification. It saved both source types and the date, and a second authorized tab loaded the 341 result. The team stayed Registered. With the synthetic cap disabled, the warning disappeared while the total remained visible. A separate event with the same name had zero linked verification rows by exact database association; that cross-event browser check did not confirm independently. Anonymous modification was rejected in the prior staging RLS suite. |
| Team brackets, trios side action | Passed in deployed Chrome using isolated synthetic workspace data. Six handicap teams had two split byes and $15/$10; eight teams had no byes and $25/$10. The trios draw passed, and scratch/handicap high-game pools used separate entrant sets. |
| Multi-page cash sheet | Passed. Chrome preview rendered 90 teams on four pages with team prize and paid column labels. Print preview was canceled. |
| Strikefest missing scores | Passed with an isolated synthetic import and database writes blocked in that test tab. A blank held the first match and its feeder; an entered zero counted and advanced the scored opponent in the second match. |
| Strikefest payouts and All Events standings | **Blocked.** The populated synthetic Leaderboards route hit a ReferenceError before rendering. The deployed expression reads scratchPayoutPlan and handicapPayoutPlan before their declarations in the non-youth callback. Local calculation coverage remains valid; deployed acceptance of both results requires a corrected Preview. |
| Existing data and navigation | Passed for the reviewed smoke paths. MIST displayed the $100 fee; the final manifest confirmed its explicit entry basis and the unchanged historical records. Existing Strikefest 26 and KWT BOY Points loaded. Public event navigation worked. |

Cleanup ran after both synthetic browser tabs closed. It removed seven exact
synthetic schedule IDs, eleven reservation members, seven cascading
verifications, one center, and one title. The final read-only database check
matched all thirteen approved inventories, including three active seeded
centers and zero average verification records. No active workspace or shared
settings restoration write was required because their hashes were unchanged.

Final verified cleanup directory: `C:\Users\coryl\BowlerBuilders-StagingActiveWorkspacePreflights\2026-11-25_203252-PHASE3-FINAL-CLEANUP-VERIFIED`.
Its phase3-final-cleanup-manifest.json lists every deleted ID and all thirteen
verified files. The local file bytes were rechecked against the final live
read-only hashes.

Production release remains **blocked**. See
[production release readiness](PRODUCTION_RELEASE_READINESS.md).

## Consolidated browser and concurrency checks

Before saving, use **TEST ONLY — PHASE 3** and a unique run suffix. Record the returned schedule ID, draft and snapshot IDs, reservation group and member IDs, new center IDs, verification member IDs, and any storage or ancillary IDs in a manifest kept outside Git. Record exact IDs as each save returns. Use the existing conditional active-workspace tooling and avoid edits to MIST or Strikefest 26.

1. **Centers.** Add a synthetic center from Schedule and select it for the synthetic event. In a second authorized session, find it in Tournament Setup and add a second center there. Refresh the first session and verify persistence. Try normalized duplicates with mixed case and whitespace. Rename then deactivate the first center and check a saved event still displays its old name and address. Use a non-admin session to confirm the directory and verification rows remain private.
2. **Doubles.** Publish one handicap doubles fixture with a 340 cap and at least four available team places. Reserve teams with fictional names and no identity records. Confirm accepted status and normal confirmations with the email guard blocking delivery. Record 140 and 200, 150 and 180, 141 and 200, and 140 plus a missing average in the four teams. Confirm the statuses in the table above and that accepted reservations remain intact. Save at least one USBC and one league-sheet source, refresh another administrator session, and check the sources and dates persist. Reuse a name in a separate synthetic event and verify its record stays unverified. Clear and republish the cap to check the warning disappears. Verify handicap scoring still follows the original inputs.
3. **Champion rules.** Use separate synthetic test fixtures for champions-only, non-champions-only, one-previous-champion doubles, and multi-time champion trios. Pair a synthetic recorded champion with a non-champion. Verify the public requirements and the expected server rejection via the appropriate public endpoints. Use the rollback-only SQL suite for aliases, archived winners, HOF exclusion, and the rules that differ between individual and team limits.
4. **Capacity race.** Use a separate open cap-340 doubles event with capacity **1** and no reservations. In two parallel psql sessions using the authorized staging connection, `SET ROLE anon` and call `public.create_public_team_reservation` with the same event key, distinct group IDs, and two distinct names per team. Commit both. Expect one Registered team and one Waitlisted team with nonoverlapping confirmation numbers and exactly four member rows. Submit the Registered team's same names again with a third group ID and expect duplicate rejection with no new rows. Track both committed group/member IDs for cleanup. Use the public RPC directly so this test has no email side effects.
5. **Scoresheets and Phase 2.** Download roster-free singles, doubles, and trios PDFs. Use trios, 12 games, lanes 7–8, and 12 positions for the dense two-page case. Spot-check the existing prefilled and Strikefest sheets. Replay only the targeted Phase 2 gaps on synthetic copies. Generate six- and eight-entrant handicap doubles draws at $5 and verify two separated byes and $15/$10 or no byes and $25/$10. Verify the trios scratch and handicap pools remain separate. Verify a multi-page cash sheet retains repeated column headings, whole rows, totals and the printable paid column. In a synthetic Strikefest event, use a blank, a scored zero, an explicit forfeit, and an incomplete feeder. Verify the higher eligible Scratch or Handicap payout and redistribution. For All Events, exercise a blank first attempt, an incomplete series, a complete series containing a zero and a higher repeat. Only the first complete series should count in each competition.
6. **Restore and compare.** Remove only tracked synthetic rows and keys. Delete synthetic reservation members before the schedule records; their verification rows cascade. Delete only synthetic centers by their manifest IDs and leave the migration's seeds in place. Follow `docs/STAGING_ACTIVE_WORKSPACE_EXECUTION_PLAN.md` for the conditional workspace restore. Repeat the eleven original inventories with the existing checker, and compare canonical sorted exports and SHA-256 hashes of the two new tables against the post-migration baseline. Verify MIST, Strikefest 26, and all protected records by exact ID and data. Stop for review if there is any unexplained difference.

## Strikefest correction and focused Preview retest

### Local correction

The populated Leaderboards render computes projected payouts before it
displays any tab. After obtaining the Scratch and Handicap payout counts,
its non-youth branch passed the two payout plans to division selection
before their `const` declarations ran. Move both calls to
`multiDayFinalPayoutPlan` immediately after the no-cashers return and before
the division split. The archive path already initializes them in that
order. The youth path, regular tournament payout calculation, React hooks,
financial settings, and Phase 3 logic retain their existing behavior.

The loopback browser test runs the actual app's admin Leaderboards page.
It checks empty standings and payouts, populated Singles, Doubles, three-
person Team and All Events standings, both Singles payout divisions, vacated
places, a tied Doubles payout, and the first complete series in each event.
The All Events fixture includes unbowled and incomplete starts, an entered
zero, and higher repeats. Against the previous code the renderer threw
`Cannot access 'scratchPayoutPlan' before initialization`; the fixed browser
run passed all assertions. The entered zero completes a 410-pin series
even though the detail cell uses the existing dash display.

Local verification passed all 71 regression tests, the stepladder checks,
the isolated browser run, and Git whitespace validation. Lint reported
zero errors and 71 warnings. The build passed with the bundle-size warning.
The local thirteen-file cleanup manifest also verified. The correction
requires no database migration.

### Focused deployed retest

After separate Preview approval, confirm its immutable corrected commit,
the Preview environment, and staging project `evgyzbgixhaiykxznqez`. Compare
live canonical counts and hashes with the thirteen files in the latest
verified cleanup baseline,
`C:\Users\coryl\BowlerBuilders-StagingActiveWorkspacePreflights\2026-11-25_203252-PHASE3-FINAL-CLEANUP-VERIFIED`.
Reuse the existing backup and exact synthetic cleanup procedures.

1. Run the approved email guard probe in the signed-in Preview before any
   reservation. Use only an `example.invalid` address. Require HTTP 200,
   `sent: false`, `skipped: true`, and nested provider `blocked`.
2. Use the same synthetic browser fixture as the local regression. Export
   the import file locally using the commands below. In the authorized
   Chrome test tab, intercept staging Supabase REST writes before importing
   the Strikefest fixture. The existing Import Backup flow autosaves the
   multi-event workspace, so keep writes to both `app_settings` and
   `public_app_settings` blocked in the test tab until it is closed.
3. Open Leaderboards and verify the populated view renders. In Singles
   Payouts expect Alex Scratch $240, Casey Scratch $200, Blair Handicap
   $270, and Devon Handicap $100. Each bowler appears once. In Doubles
   Scratch expect the tied teams paid at #1T for $90 each. In All Events
   Scratch expand SYN First Series. Expect Singles 410, Doubles 585 and
   Team 630, for 1,625 scratch and 1,715 handicap. The counted Singles
   series is 200, entered zero, 210. The earlier unbowled or incomplete
   attempts and higher later repeats do not replace these totals.
4. In two distinct synthetic handicap doubles events capped at 340,
   reserve one team in each using the same exact display name for one
   member and different synthetic partners. Record both event IDs,
   reservation groups and member IDs. In the admin browser select event A
   and confirm the review displays its partner before saving USBC 140
   and league sheet 200. Verify 340 within limit. Open event B in a
   freshly loaded authorized tab. Wait for its event heading and different
   partner to appear. Verify the same-name member is unverified and
   the team shows Verification incomplete. Switch back to event A and
   confirm its verification is still present.
5. Close both synthetic editing sessions before cleanup. Remove only
   manifest-listed records from this run. Compare the thirteen live
   inventories with the approved cleanup baseline and record zero
   remaining synthetic IDs. Verify Strikefest 26, seeded centers,
   historical finance and MIST's $100 fee and legacy `entry` basis.
   Production remains blocked until these focused checks pass.

Create the reusable synthetic Strikefest import file on the local machine:

```powershell
Set-Location 'C:\Projects\bowler-builders-phase1c'
@'
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { populatedStrikefest } from "./scripts/acceptance/strikefest-leaderboards.browser.mjs";
const file = join(tmpdir(), "bb-strikefest-focused-acceptance.json");
const event = populatedStrikefest();
writeFileSync(file, JSON.stringify({ type: "bowler-builders-multi-event-backup", version: 1, event }));
console.log(file);
'@ | node --input-type=module
```

Run the local rendering regression with
`node scripts/acceptance/handicap-doubles.browser.mjs --strikefest-leaderboards`.
The existing acceptance harness keeps the browser on loopback with an
isolated profile and Supabase disabled.

### November 25 focused Preview retest

Vercel showed immutable Preview commit `017ec5d66c388ca55a3b82bcaf2173b89d486399`
on `phase1c-staging-readiness`. The signed-in Chrome tab contacted staging
project `evgyzbgixhaiykxznqez`. Before fixture creation the deployed email
guard returned HTTP 200, `sent: false`, `skipped: true`, provider `blocked`.
The thirteen live counts and canonical SHA-256 hashes matched the approved
cleanup baseline before testing.

The two tracked handicap doubles fixtures registered through the staging RPC.
The deployed administrator review displayed event A with the same-name member
and partner A, both unverified, and an enabled verification form. Computer Use
stopped during submission because it could not verify the Chrome URL. No
verification row persisted. Event B isolation and the populated Strikefest
rendering, payout and All Events checks remain open. The Strikefest fixture
was never imported.

Cleanup removed the two exact Schedule IDs and four exact reservation member
IDs. Both groups were tracked. The 9:05 p.m. Eastern read-only comparison
matched all thirteen approved counts and SHA-256 hashes. Zero run IDs
remained, and the active snapshot, shared settings, MIST's $100 fee and legacy
`entry` basis, Strikefest 26, and all three seeded centers were preserved.
No workspace restore write was needed. Exact IDs and inventory hashes are in
`C:\Users\coryl\BowlerBuilders-StagingActiveWorkspacePreflights\2026-11-25_210511-PHASE3-FOCUSED-RETEST-CLEANUP-VERIFIED\phase3-focused-retest-cleanup-manifest.json`.

Resume only the outstanding browser checks on this immutable Preview in a
Chrome tab whose URL Computer Use can verify. Use fresh run IDs and the same
fixtures and expected values above. Repeat the per-run guard and inventory
safeguards. Production remains on hold.

### November 25 resumed Preview retest

The thirteen staging inventories matched before fixture creation. The
deployed email guard confirmed HTTP 200, `sent: false`, `skipped: true`
and provider `blocked` on the immutable Preview connected to
`evgyzbgixhaiykxznqez`.

Populated Strikefest Leaderboards passed on `017ec5d`. Singles, Doubles,
Trios and All Events rendered. Singles paid Alex Scratch $240, Casey
Scratch $200, Blair Handicap $270 and Devon Handicap $100, once each.
The tied Doubles Scratch teams split the first two positions at $90
each. All Events counted the first valid Singles (410, including the
entered zero), Doubles (585), and Trios (630) series for 1,625 scratch
and 1,715 handicap. Earlier incomplete series and later repeats did
not displace the counted series. The browser intercepted writes to the
shared settings and discarded the synthetic Strikefest workspace.

The administrator interface loaded the new event A and displayed both
unverified members. Windows Computer Use stopped on URL verification
during the save interaction. No verification row persisted. Same-name
isolation is the only outstanding staging acceptance check. Perform
it manually following step 4 above after the two tracked fixtures are
prepared once for the manual session.

At 9:22 p.m. Eastern, all thirteen inventories matched by count and
SHA-256. Two exact Schedule rows and four exact reservation members were
removed, and no run rows remained. MIST still showed $100 and legacy
`entry`. Strikefest 26 and the three seeded centers matched.
The exact IDs and hashes are in
`C:\Users\coryl\BowlerBuilders-StagingActiveWorkspacePreflights\2026-11-25_212212-PHASE3-FOCUSED-RETEST-CLEANUP-VERIFIED\phase3-focused-retest-cleanup-manifest.json`.

### November 25 staging acceptance closure

Staging acceptance closed on immutable Preview `017ec5d66c388ca55a3b82bcaf2173b89d486399`.
The administrator verified event A at 140 (USBC) and 200 (Bayside Bowl league
sheet), both dated November 25, 2026. After refresh, both sources and values
persisted and the team displayed 340 and Verified within limit. Both event B
members stayed unverified and the team displayed Verification incomplete.
All four members remained Registered. The database confirmed both
verification rows belonged to event A's exact reservation IDs. The deployed
email guard passed before fixture creation.

Cleanup removed the two exact Schedule rows and four reservation members in
run `bb-focused-017ec5d-manual-64ea95c1`. The two verification rows followed their parent
reservations. The browser had autosaved the synthetic active workspace and
reservation state. Cleanup restored the MIST snapshot and reservation state
from the verified baseline. The existing trigger refreshed the public
reservation mirror.

At 9:54 p.m. Eastern, all thirteen approved counts and SHA-256 hashes
matched and zero synthetic records remained. MIST's $100 fee and legacy
`entry` basis, Strikefest 26, historical records and all three seeded
centers were preserved. The earlier Strikefest pass and this manual check
close staging acceptance with no application-level release blockers.
Production execution requires separate approval and the safeguards in the
[release readiness report](PRODUCTION_RELEASE_READINESS.md).

The local closure manifest records the exact IDs and final hashes.
`C:\Users\coryl\BowlerBuilders-StagingActiveWorkspacePreflights\2026-11-25_215441-PHASE3-STAGING-ACCEPTANCE-CLOSED-VERIFIED\phase3-staging-acceptance-closure-manifest.json`

## Local verification

```powershell
Set-Location 'C:\Projects\bowler-builders-phase1c'
npm.cmd test
node scripts/acceptance/handicap-doubles.browser.mjs --phase3
node scripts/acceptance/handicap-doubles.browser.mjs --remaining-phase2
npm.cmd run lint
npm.cmd run build
git diff --check
```

The Phase 3 browser uses an isolated profile and loopback-only networking. Its director-review test uses mock storage, so live permissions and cross-session persistence remain staging checks. The Phase 2 browser mode targets remaining bracket and print gaps only. The regular regression suite covers synthetic Strikefest payout redistribution, missing-score advancement, and first completed All Events series. A deployed synthetic Strikefest exercise remains pending. The machine has PostgreSQL client tools and no PostgreSQL server executable or local listener. The local application tests do not exercise SQL runtime, rollback, concurrency, or live promotion.

## Exact local Git handoff

The paths below are the Phase 3 implementation and acceptance package. Review the staged diff before committing.

```powershell
Set-Location 'C:\Projects\bowler-builders-phase1c'
git add -- `
  'docs/PHASE_3_STAGING_HANDOFF.md' `
  'docs/TOURNAMENT_TESTING_DEVELOPMENT_BACKLOG.md' `
  'package.json' `
  'scripts/acceptance/handicap-doubles.browser.mjs' `
  'scripts/acceptance/phase3-average-review.jsx' `
  'src/App.jsx' `
  'src/EmergencyScoresheetPanel.jsx' `
  'src/PhaseThreeAdmin.jsx' `
  'src/ReservationAverageReview.jsx' `
  'src/emergencyScoresheetPdf.js' `
  'src/phaseThree.test.js' `
  'src/reservationEligibility.js' `
  'src/usePhaseThreeDirectory.js' `
  'supabase/phase3/phase3_reservations_and_centers.sql' `
  'supabase/phase3/rollback_phase3_reservations.sql' `
  'supabase/phase3/test_phase3_reservations.sql'
git diff --cached --check
git diff --cached --stat
git commit -m 'Implement Phase 3 director-reviewed reservations and acceptance coverage'
```
