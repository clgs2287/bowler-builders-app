# Bowler Builders Phase 1B - Tournament Logic Regression Tests

Date: 2026-11-23

## Safety and branch

- Branch: `phase1b-tournament-logic-tests`
- Baseline: Phase 1A commit `1b8b9a9` (`phase1a-safe-testing-origin-main`)
- Phase 1B changes remain uncommitted for review. During final Git hygiene checks, this workspace's `git status`, `git diff`, and `git add` commands returned `this operation must be run in a work tree` despite `git rev-parse --is-inside-work-tree` reporting `true`. No staging, commit, merge, or reset was attempted after that discrepancy.
- No merge to `main`, deployment, Supabase access, database write, migration, email, or external-service call was performed.
- Existing untracked `backups/` material was preserved and not read, changed, staged, or deleted.
- The local repository has multiple worktrees. `origin/main` remains the likely production-source branch based on the prior Phase 1A review, but the Vercel production-branch mapping remains unverified because deployment configuration was intentionally not accessed or changed.

## Test result

`npm test` passed:

- 31 Node test cases passed.
- 0 test cases failed.
- The standalone `stepladder-logic-check.mjs` also passed.
- The Phase 1A baseline had 17 Node test cases; Phase 1B adds 14 focused regression cases.

## Added coverage

### Scoring and handicap

- Scratch totals ignore missing or zero scores.
- Completed-game counts exclude zero, blank, and negative values.
- Handicap precedence is `registrationHandicap`, then `handicap`, then `handicapPerGame`.
- Handicap totals apply only to completed games.
- Qualifying handicap totals use the existing four-game fallback when the game count is zero or missing.
- Doubles/team aggregation combines member games, scratch totals, and per-game handicap correctly.
- Standings ties are ordered by total, then low game, then numeric seed.

### Finals and advancement

- Single-game finals reject missing, zero, and tied scores until resolved.
- Finals handicap is applied only when selected.
- Best-of-three matches advance after two wins.
- A 1-1-1 best-of-three result resolves through the entered roll-off score.
- Stepladder order starts with 4 versus 3, advances through seed 2, then seed 1.
- Stepladder roll-offs and the three/four-team cut bounds are covered.
- Existing coverage continues to verify stepladder final placements and single-game versus best-of-three lineage estimates.

### Financial calculations

- Gross revenue, manual lineage games, lineage owed, net entries, added money, prize overrides, and casher overrides.
- Standard payout rows preserve the calculated prize fund before manual changes.
- Tied third/fourth payout rows use two paid players.
- Manual payout amounts override their exact row amount.
- Finals lineage estimates cover bracket, eliminator, stepladder, best-of-three stepladder, and lane-draw matchplay.
- Existing bracket payout tests still cover $5/$10/$15 brackets and byes.

### Multi-event calculations

- Current-year average replaces last season only when it is at least 10 pins higher; lower averages do not replace it.
- Configured handicap percent and handicap cap.
- All Events includes only a bowler's first scored Singles, Doubles, and Team appearance.
- Daily bonus evaluates the configured squad time and separate scratch/handicap leaders.
- Youth scratch and handicap winners are distinct.
- Preset and weighted multi-event payout-plan behavior.

## Files changed

- `package.json` - expands the existing `npm test` command only.
- `src/appLogicTestHarness.js` - test-only source harness. It reads existing functions from `App.jsx`; it is not imported by the application.
- `src/tournamentLogic.test.js` - scoring, ranking, finance, payout, and lineage tests.
- `src/finalsLogic.test.js` - bracket/stepladder/best-of-three/roll-off tests.
- `src/multiEventLogic.test.js` - multi-event average, handicap, All Events, daily bonus, youth, and payout-plan tests.
- `PHASE_1B_TOURNAMENT_LOGIC_TEST_REPORT.md` - this report.

## Confirmed behavior requiring an owner decision

- A manual payout amount can make the sum of payouts exceed or fall below the calculated prize fund. The code applies the manual row amount directly and does not rebalance first place or block an over-allocation. This may be intentional for a director-controlled adjustment, but a future change should clarify whether the UI should warn, rebalance, or permit it silently.
- A `qualifyingGames` value of zero falls back to four games for qualifying handicap. The test protects this existing behavior; whether zero should instead mean zero is a business-rule decision.

## Important untested or partially tested areas

- Full bracket construction, byes, manual player overrides, average-advantage matches, and bracket placement ordering beyond the existing stepladder check.
- Full matchplay and eliminator-tournament progression; these paths are highly coupled to `App.jsx` state.
- Lane-pair eliminator progression.
- End-to-end side-action pot settlement across UI state, although bracket payout utility coverage remains in place.
- Finance UI state, publishing gates, archive snapshots, reservation-to-registration transfer, and Supabase persistence remain integration-test work.
- Multi-event calculations are verified with source-driven unit harnesses, but not with rendered React component integration tests.

## Test architecture note

Most critical rules currently live in the monolithic `src/App.jsx`. Phase 1B deliberately uses test-only source harnesses rather than extracting or refactoring production logic. This avoids changing live behavior, but the harnesses should be replaced gradually with direct imports once small, approved pure-module extractions are planned.

## Recommended next step

Phase 1C should add safe integration-style tests around reservation validation, archive snapshot masking, and a small set of bracket/matchplay edge cases. Before any refactor, retain this test suite as the regression baseline and decide the intended manual-payout balancing rule.

## Production impact

None. No production-facing application code, database record, environment setting, authentication configuration, deployment configuration, or infrastructure was changed.
