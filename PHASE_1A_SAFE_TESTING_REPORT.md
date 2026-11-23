# Phase 1A: Safe Testing Foundation

Date: 2026-11-23

## Scope and Production Protection

This task added testing support only. It did not deploy, contact Supabase, run migrations, send email, alter Vercel settings, or change tournament behavior.

## Git Baseline

- Task branch: `phase1a-safe-testing-origin-main`
- Baseline: `origin/main` at `eded639` (`Add multi event bowler stat highlights`)
- The local `main` branch was found to be behind `origin/main`, so it was not used as the task baseline.
- An earlier empty branch created from local `main` was left untouched.
- The pre-existing untracked `backups/` directory was preserved.

`origin/main` is the strongest available production-branch candidate because it is the tracked remote default branch. The repository does not prove Vercel's configured production branch, so that deployment mapping is not independently verified.

## Staging Isolation Finding

The repository supports separate local Supabase configuration through ignored `.env.local` values for `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Environment values were not read or displayed.

True isolation of Vercel preview/staging deployments is **not verified** from repository configuration alone. Vercel environment-variable scope, Supabase project identity, Auth, Storage, serverless API configuration, and email provider settings must be verified in the relevant service dashboards before any staging workflow writes data or sends email.

## Test Baseline

Added `npm test` in `package.json`. It runs:

1. `src/bracketPayouts.test.js`
2. `src/bracketFillSuggestions.test.js`
3. `src/teamReservations.test.js`
4. `src/triosScoresheetPdf.test.js`
5. `stepladder-logic-check.mjs`

Results:

- Existing Node tests: 17 passed, 0 failed.
- Stepladder regression check: passed.

## Stepladder Verification Repair

The prior check failed because it evaluated `getFinalPlacementRows` without including its required `buildStepladderMatches` helper. The application finals implementation was not changed.

The test harness now extracts that helper along with the existing finals helpers. It verifies top-four placement ordering, stepladder cut behavior, eliminator cut behavior, and single-game/best-of-three lineage estimates.

## Files Modified

- `package.json` — added the standard `npm test` command.
- `stepladder-logic-check.mjs` — corrected the test harness dependency list.
- `PHASE_1A_SAFE_TESTING_REPORT.md` — this report.

## Remaining Test Failures and Defects

- Remaining automated test failures: none.
- Confirmed application defects discovered: none.
- The repaired stepladder failure was a test-harness defect, not evidence of a production finals defect.

## Recommended Next Step

Review and approve this testing baseline. The next narrowly scoped reliability task should be adding direct automated regression tests for one additional pure rules area, preferably handicap/ranking or finance/lineage, without changing production behavior.

