# Tournament Testing Development Backlog

This backlog consolidates synthetic singles, handicap doubles, scratch trios,
and read-only Strikefest review findings. It does not authorize a production
change, a formula change, or a redesign.

## Completed in Phase 2A

- Side-action brackets distinguish missing scores, entered zeroes, byes, and
  explicit forfeits. Later rounds wait for both feeder results.
- Regular tournaments use per-bowler rates and calculate team fees and
  collections. Historical fee bases are preserved, and team prizes are shown
  per team.
- Tournament setup, score entry, scoresheets, and finance share the qualifying
  game count. Fresh tournaments start with zero raffle and added money.
- Random lane assignment keeps teammates together. Registration keeps teams
  grouped when sorting and shares one list of lane options.
- Strikefest awards each entry its highest eligible Scratch or Handicap payout
  and re-ranks the vacated cashing positions.

## Completed in Phase 2B

- Regular individual, regular team, and Strikefest individual side-action
  brackets support six, seven, or eight distinct entrants. Two-bye brackets
  use the approved $5 entry price. Both draws preview ticket use, refunds,
  prizes, and retained fees.
- Regular doubles and trios have independent Scratch and Handicap bracket and
  high-game entries, prices, results, and payout details. Registration puts
  team controls above the roster and allows individual side action to be
  shown separately.
- Payout sheets distinguish winning bowlers and teams from payment status.
  Team payout rows show the members' current lanes.
- Regular cash sheets print a single event summary, repeat table headings,
  and keep team and individual payout terminology distinct.
- Strikefest All Events counts each bowler's first completed series in
  Singles, Doubles, and Trios. Unbowled and incomplete attempts leave the
  event eligible for a later completed series.

## Deferred

- Create emergency blank scoresheets without a roster as a separate feature.
- Add remembered custom bowling centers with administrator editing.
- Measure random lane-assignment response time in staging to compare it with
  the original 2.2-second observation.

## Protected behavior verified during testing

- Current-lane tracking in side-action payouts.
- Manual navigation to finals.
- Averages shown only for handicap formats and Strikefest.
- Team grouping, team cash sheets, lineage, existing payout allocation formula,
  and existing Blank-Lane PDF behavior.
- Strikefest packets, mixed squads, All Events roster, individual handicap,
  leaderboards, per-bowler fees, team prize display, youth awards, print views,
  and tied-placement display.


## Focused staging acceptance for Phases 2A and 2B

Use synthetic tournament data in an isolated staging test workspace.

1. In singles, doubles, and trios, change the qualifying-game count and
   compare setup, score entry, scoresheets, and finance. Verify per-bowler
   fees, derived team prices, collected fees, and a fresh raffle at $0.
   Reopen saved settings and a historical per-team-fee tournament and
   compare their fees, prize fund, and payout amounts with the baseline.
2. In doubles and trios, seed a manual lane position and randomly fill the
   remaining slots. Verify that teammates stay together and that lane sort
   keeps each team grouped. At desktop, tablet, and phone widths, enter
   Scratch only, Handicap only, and both. Verify four controls when handicap
   is enabled, two when it is disabled, and an independent individual roster
   toggle.
3. Generate $5 individual and team brackets with eight, seven, and six
   unique entrants. Expect $25/$10, $20/$10, and $15/$10 respectively, with
   $5 retained in each bracket. For six entrants check that each half has
   one bye. Try five unique entrants with repeat tickets and a non-$5
   six-entrant draw. Both should be blocked. Reconcile repeat purchases with
   used tickets and refunds, then confirm that saved draws stay locked.
4. Score a locked bracket with one blank opponent, then enter a zero and
   later an explicit forfeit. Verify advancement updates and a pending feeder
   prevents a premature later-round result. Repeat using team handicap and
   a Strikefest squad. Compare individual and team bracket results with the
   corresponding payout rows.
5. Give two teams different individual handicaps and configure distinct
   scratch and handicap side-action prices. Check the team totals, both
   high-game results and tied splits, per-team payout details, and current
   lanes. Mark a payout paid and verify the status separately from the winner
   count.
6. Print a singles cash sheet and a multi-page team cash sheet with a long
   tournament name. Compare standings and amounts with the CSV. Verify
   readable repeated headings, one event summary, and complete columns.
   Spot-check the prefilled Blank-Lane PDF and the Strikefest runner and
   lane-pair sheets.
7. In a synthetic Strikefest squad sequence, enter an unbowled Singles
   attempt, an incomplete attempt, a completed series containing a zero,
   and a higher repeat. Verify the first completed series counts and the
   repeat does not replace it. Repeat the eligibility check for Doubles and
   Trios, and verify the higher eligible division pays once with the vacated
   spot filled.


## Phase 3 reservation average review

The handicap doubles combined-average maximum is an advisory requirement for
public reservations. Standard registration, confirmation, capacity and
waitlist rules still apply when verified averages are unavailable or the sum
exceeds the maximum. The director reviews the two averages by reservation
member, with optional USBC, Bayside Bowl league sheet, or other approved source
and verification date. A matching name never copies an average to another
reservation. Champion restrictions still apply at both public endpoints.

The forward migration, transaction-scoped SQL tests, rollback, and focused
staging acceptance are in [Phase 3 staging acceptance and handoff](PHASE_3_STAGING_HANDOFF.md).
The public redesign remains deferred to approximately May or June 2027.

### Final Preview acceptance and release blocker

Preview 26dfd0e passed the deployed email guard, center lifecycle, emergency
PDFs, public reservation and advisory average workflows, focused team brackets
and trios side action, multi-page cash printing, and Strikefest blank/zero
advancement. Exact synthetic cleanup returned all thirteen inventories to the
approved baseline.

Populated Strikefest Leaderboards throws a ReferenceError. The non-youth
payout callback accesses the two payout plans before initialization. Correct
the declaration order and add a rendered populated-leaderboard regression,
then repeat payout redistribution and first-completed-series acceptance in an
approved Preview. The cross-event same-name browser check should be repeated
at that time. See [staging results](PHASE_3_STAGING_HANDOFF.md) and
[production release readiness](PRODUCTION_RELEASE_READINESS.md).

#### Correction implemented locally

The two payout plans now initialize after the payout-count guard and before
any division selection. The existing archive path already used this order.
The new actual-page browser regression reproduced the previous error and
passed after the fix. It covers empty and populated standings, lowest and
highest cashing rows in both divisions, tied payout splitting, and first
completed All Events series with a valid zero. All 71 tests and stepladder
checks passed. Lint reported 0 errors and 71 warnings, and the build and
whitespace check passed. No database migration is required.

The remaining deployed checks are scoped to Strikefest Leaderboards and
payouts, All Events and browser same-name isolation, with email-guard and
exact cleanup verification. See the focused retest in the
[staging handoff](PHASE_3_STAGING_HANDOFF.md#strikefest-correction-and-focused-preview-retest).

#### Corrected Preview retest interrupted

Preview `017ec5d` matched staging and passed the deployed email guard. The
administrator review opened the first synthetic team, but Computer Use stopped
when it could not verify Chrome's URL. No average verification persisted.
The same-name isolation check and populated Strikefest rendering, payouts,
redistribution, tie handling, and All Events checks remain open in Preview.
Cleanup matched all thirteen approved inventory counts and SHA-256 hashes,
with zero synthetic rows remaining. See the
[focused retest results](PHASE_3_STAGING_HANDOFF.md#november-25-focused-preview-retest).

#### Resumed Preview retest

Populated Strikefest rendering, payouts, redistribution, ties, and All
Events passed on Preview `017ec5d`. Same-name average isolation remains
open for a manual administrator session. Final cleanup matched all thirteen
inventories and removed all tracked rows. See the
[resumed retest](PHASE_3_STAGING_HANDOFF.md#november-25-resumed-preview-retest).

#### Staging acceptance closed

Preview `017ec5d` passed manual same-name average isolation. The 140 and
200 verifications persisted for event A only, with all four fixture
members still registered. Exact-ID cleanup and scoped workspace
restoration matched all thirteen baseline counts and SHA-256 hashes.
Zero synthetic records remained. No application-level release blocker
remains. See the [staging closure](PHASE_3_STAGING_HANDOFF.md#november-25-staging-acceptance-closure)
and the [production release sequence](PRODUCTION_RELEASE_READINESS.md#proposed-production-sequence).
