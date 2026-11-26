# Phase 3 staging acceptance and handoff

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

## Consolidated browser and concurrency checks

Before saving, use **TEST ONLY — PHASE 3** and a unique run suffix. Record the returned schedule ID, draft and snapshot IDs, reservation group and member IDs, new center IDs, verification member IDs, and any storage or ancillary IDs in a manifest kept outside Git. Record exact IDs as each save returns. Use the existing conditional active-workspace tooling and avoid edits to MIST or Strikefest 26.

1. **Centers.** Add a synthetic center from Schedule and select it for the synthetic event. In a second authorized session, find it in Tournament Setup and add a second center there. Refresh the first session and verify persistence. Try normalized duplicates with mixed case and whitespace. Rename then deactivate the first center and check a saved event still displays its old name and address. Use a non-admin session to confirm the directory and verification rows remain private.
2. **Doubles.** Publish one handicap doubles fixture with a 340 cap and at least four available team places. Reserve teams with fictional names and no identity records. Confirm accepted status and normal confirmations with the email guard blocking delivery. Record 140 and 200, 150 and 180, 141 and 200, and 140 plus a missing average in the four teams. Confirm the statuses in the table above and that accepted reservations remain intact. Save at least one USBC and one league-sheet source, refresh another administrator session, and check the sources and dates persist. Reuse a name in a separate synthetic event and verify its record stays unverified. Clear and republish the cap to check the warning disappears. Verify handicap scoring still follows the original inputs.
3. **Champion rules.** Use separate synthetic test fixtures for champions-only, non-champions-only, one-previous-champion doubles, and multi-time champion trios. Pair a synthetic recorded champion with a non-champion. Verify the public requirements and the expected server rejection via the appropriate public endpoints. Use the rollback-only SQL suite for aliases, archived winners, HOF exclusion, and the rules that differ between individual and team limits.
4. **Capacity race.** Use a separate open cap-340 doubles event with capacity **1** and no reservations. In two parallel psql sessions using the authorized staging connection, `SET ROLE anon` and call `public.create_public_team_reservation` with the same event key, distinct group IDs, and two distinct names per team. Commit both. Expect one Registered team and one Waitlisted team with nonoverlapping confirmation numbers and exactly four member rows. Submit the Registered team's same names again with a third group ID and expect duplicate rejection with no new rows. Track both committed group/member IDs for cleanup. Use the public RPC directly so this test has no email side effects.
5. **Scoresheets and Phase 2.** Download roster-free singles, doubles, and trios PDFs. Use trios, 12 games, lanes 7–8, and 12 positions for the dense two-page case. Spot-check the existing prefilled and Strikefest sheets. Replay only the targeted Phase 2 gaps on synthetic copies. Generate six- and eight-entrant handicap doubles draws at $5 and verify two separated byes and $15/$10 or no byes and $25/$10. Verify the trios scratch and handicap pools remain separate. Verify a multi-page cash sheet retains repeated column headings, whole rows, totals and the printable paid column. In a synthetic Strikefest event, use a blank, a scored zero, an explicit forfeit, and an incomplete feeder. Verify the higher eligible Scratch or Handicap payout and redistribution. For All Events, exercise a blank first attempt, an incomplete series, a complete series containing a zero and a higher repeat. Only the first complete series should count in each competition.
6. **Restore and compare.** Remove only tracked synthetic rows and keys. Delete synthetic reservation members before the schedule records; their verification rows cascade. Delete only synthetic centers by their manifest IDs and leave the migration's seeds in place. Follow `docs/STAGING_ACTIVE_WORKSPACE_EXECUTION_PLAN.md` for the conditional workspace restore. Repeat the eleven original inventories with the existing checker, and compare canonical sorted exports and SHA-256 hashes of the two new tables against the post-migration baseline. Verify MIST, Strikefest 26, and all protected records by exact ID and data. Stop for review if there is any unexplained difference.

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
