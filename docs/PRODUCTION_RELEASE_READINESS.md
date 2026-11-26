# Bowler Builders production release readiness

**Decision for November 25, 2026: Hold production release.** Preview commit
`26dfd0e9201b38addb61e1676b58353c680b6d70` passed most of the consolidated
browser acceptance. A populated Strikefest Leaderboards view failed to render.
This report uses staging evidence. Production schema, configuration, release
branch, prior deployment, and email provider state still require authorized
verification.

## Release blocker

The deployed browser threw `ReferenceError: Cannot access 'o' before initialization`
when the synthetic Strikefest fixture opened Leaderboards. In `src/App.jsx`,
the non-youth branch of `standardPaidWinnerRows` accessed both payout plans
before their declarations. The local correction initializes the two plans
after the payout-count guard and before the branch. The archive calculations
already followed this order. Formulas, eligibility, standings, tournament
settings, and hook ordering are preserved.

The actual-page browser regression reproduced the prior exception and passed
with the local correction. It checked empty and populated standings,
Singles payouts, tie splitting, vacated positions, and first completed
All Events series across Singles, Doubles and Trios. The full suite passed
71 tests plus stepladder. Lint passed with zero errors and 71 warnings.
The build and Git whitespace check passed. The correction adds no database
migration to the existing Phase 3 release requirements.

Hold production until the corrected immutable Preview passes the
[focused retest](PHASE_3_STAGING_HANDOFF.md#strikefest-correction-and-focused-preview-retest).
It covers the rendered Strikefest checks, browser same-name isolation, the
email guard, and the final thirteen-inventory comparison.

## Verified staging evidence

- Migration `20261126000903` passed on project `evgyzbgixhaiykxznqez`, including
  anonymous and administrator permissions, capacity, concurrent submissions,
  exact rollback rehearsal and synthetic cleanup.
- The reviewed Preview confirmed blocked email delivery and staged data.
- Emergency PDFs, center lifecycle, public bookings, advisory director
  review, six- and eight-team brackets, trios pools, four-page cash sheet
  printing, KWT, and Strikefest blank and entered-zero behavior passed.
- The final cleanup matched all thirteen live hashes. MIST retained the $100
  fee and explicit `entry` basis. Strikefest 26 remained unchanged.
- The release blocker and outstanding browser coverage are in the
  [staging handoff](PHASE_3_STAGING_HANDOFF.md).

Final verified cleanup manifest:
`C:\Users\coryl\BowlerBuilders-StagingActiveWorkspacePreflights\2026-11-25_203252-PHASE3-FINAL-CLEANUP-VERIFIED\phase3-final-cleanup-manifest.json`.

## Production migration order and prerequisites

1. After explicit authorization, identify the production project and the
   Production target from the configured Vercel project and Git repository.
   Record the current deployed commit and deployment ID.
2. Capture verified production schema definitions, role grants, triggers,
   migration history, and the exact bodies, owners, ACLs and search paths of
   both public reservation RPCs. Compare the tables and columns used by
   Phase 3, the `public.reservations(id)` key, the
   `public.is_admin()` policy helper, and the current public reservation
   mirrors against the reviewed prerequisites.
3. If prerequisites are missing, review the proposed migration chain from
   `202611230001` through `202611230005` in the database operations repository.
   Apply only the missing, production-reviewed changes in dependency order.
   The single and team reservation changes correspond to `202611230003`
   and `202611230004`. A staged file version alone is not proof of a production
   prerequisite.
4. Prepare one reviewed Production forward migration from
   `supabase/phase3/phase3_reservations_and_centers.sql`. Preserve the current
   production locks, capacity precedence, authorization, and reporting
   behavior. The staging RPC hash guard and seeded-directory starting state
   must be reconciled against the actual production definitions before execution.
   Record the reviewed SQL SHA-256 and the actual production migration version.
5. Run the scoped integration and rollback rehearsal first on a separately
   authorized disposable database or approved Preview. Review
   `supabase/phase3/test_phase3_reservations.sql` as the fixture scope.
   Apply the approved production schema before deploying the corrected app.
   Verify the center seed IDs, RLS policies, public RPC grants, and that the
   combined maximum remains advisory.

## Backup and rollback

Before schema changes, take a fresh verified production logical backup and
read-only record inventory. Keep those files private. Preserve the active
workspace, historical finance, Strikefest, reservation and roster data,
directory tables, and the production RPC definitions and grants. Confirm the
backup can be read and its manifest hashes match.

If rollback is needed, stop new feature activity and redeploy the recorded prior
production build. Use a production-specific rollback built from the captured
RPC definitions. Treat
`supabase/phase3/rollback_phase3_reservations.sql` as a reviewed pattern.
It keeps the center and average verification tables and their RLS. Restore
prior behavior under the existing transaction and recheck inventory hashes.
A full data restore requires its own reviewed recovery plan and approval.

## Production email and deployment sequence

Keep the website email guard fail-closed until the production project mapping
and provider configuration are verified. Delivery requires all three runtime
conditions: Vercel Production, `EMAIL_DELIVERY_ENABLED=true`, and an exact
match between the configured Supabase URL's project and
`BOWLER_BUILDERS_PRODUCTION_SUPABASE_PROJECT_REF`. Keep provider credentials
and sender/reply-to or notification overrides in Production scope. Verify
the selected sender identity and review Authentication and other outbound
paths separately. A live delivery smoke requires explicit authorization and
an approved test mailbox.

Proposed local verification and commit commands:

```powershell
Set-Location 'C:\Projects\bowler-builders-phase1c'
npm.cmd test
node scripts/acceptance/handicap-doubles.browser.mjs --strikefest-leaderboards
npm.cmd run lint
npm.cmd run build
git diff --check
git add -- src/App.jsx scripts/acceptance/handicap-doubles.browser.mjs `
  scripts/acceptance/strikefest-leaderboards.browser.mjs docs/PHASE_3_STAGING_HANDOFF.md `
  docs/TOURNAMENT_TESTING_DEVELOPMENT_BACKLOG.md docs/PRODUCTION_RELEASE_READINESS.md
git diff --cached --check
git diff --cached --stat
git commit -m 'Fix Strikefest Leaderboards payout plan initialization'
```

With separate Preview approval, push the reviewed staging commit through the
existing branch workflow. Then verify the immutable Preview and complete the
[focused retest](PHASE_3_STAGING_HANDOFF.md#strikefest-correction-and-focused-preview-retest).
Record the cleaned thirteen inventories before reconsidering release.

After the blocker clears and production execution is separately approved,
integrate the reviewed fix into the confirmed production Git branch through
its normal review workflow. Apply the approved production migration in the
order above. Then push the reviewed production ref to trigger its configured
Vercel Production deployment. The explicit commit and branch values must
come from that approval and configuration, as shown below.

```powershell
# Proposed only. Set these from the approved release record and verified Vercel target.
git switch $productionBranch
git diff --check
git push origin "${approvedReleaseCommit}:refs/heads/$productionBranch"
```

Confirm Vercel shows the approved source commit and Production environment.
Smoke-test home, schedule, historical MIST finance, KWT, Strikefest standings
and payouts, the emergency and prefilled PDFs, reservation rules, and the
email guard. Prefer read-only smoke paths. Track any separately approved
synthetic production inserts by exact ID and recheck the inventory after
cleanup.
