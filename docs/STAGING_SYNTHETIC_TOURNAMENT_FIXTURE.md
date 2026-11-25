# Staging Synthetic Tournament Fixture

## Purpose and safety boundary

This fixture is for an explicitly approved staging-only browser test. It must
never reuse a real person, reservation, email address, or tournament record.
Every record must carry the run tag `bb-synth-20261124-v1` and use an
`example.invalid` email address. The fixture is not to be created until a
separate approval allows persistent staging writes.

Before creating it, make a local run manifest containing every generated ID.
Cleanup must use that manifest's exact IDs; it must never use broad name, date,
or email-pattern deletes.

## Tournament set

Create four isolated, unpublished staging drafts with unmistakable names:

| Fixture ID | Format | Purpose |
| --- | --- | --- |
| `bb-synth-singles-20261124-v1` | `TEST ONLY - BB SYNTH Singles 20261124` | Singles, scratch and handicap |
| `bb-synth-doubles-20261124-v1` | `TEST ONLY - BB SYNTH Doubles 20261124` | Handicap doubles |
| `bb-synth-trios-20261124-v1` | `TEST ONLY - BB SYNTH Trios 20261124` | Trios with champion limits on |
| `bb-synth-strikefest-20261124-v1` | `TEST ONLY - BB SYNTH Strikefest 20261124` | Multi-event / Strikefest |

Keep each draft private, unpublished, and marked `TEST ONLY - DO NOT ARCHIVE`.
Set its series to `TEST ONLY`, not KWT or any title-bearing series. Do not create
an archive, publish results, or use any existing schedule item. Leave all email
actions unused.

## Active-workspace approval gate

The application has one shared active-tournament snapshot. Opening a saved test
draft for score entry temporarily replaces that snapshot; it does not alter
archives, statistics, KWT standings, or reservations, but it is still a change
to an existing staging record. Therefore, do not open a fixture draft until the
owner separately approves a temporary active-workspace replacement and confirms
that a current exported backup can be restored afterwards.

Without that approval, the only safe persistent fixture preparation is creating
the clearly labeled saved drafts and their separate reservation/schedule IDs.

## Fabricated roster

Use twelve synthetic bowlers named `Test Bowler 01` through `Test Bowler 12`.
Use unique synthetic USBC identifiers such as `BB-SYN-001` through
`BB-SYN-012` and addresses in the form `bowler-01@example.invalid`.

Assign averages across a deliberately broad range: 120, 135, 148, 156, 164,
171, 179, 187, 195, 203, 211, and 220. Mark `Test Bowler 03` and `Test Bowler
04` as youth. Use the first six for doubles, three complete trios, and repeat
selected bowlers in Strikefest events to exercise All Events first-appearance
selection.

## Scores and outcomes

Use deterministic scores recorded in the local manifest:

- Singles: include a scratch tie, a handicap-order change, one incomplete game,
  and a youth scratch/handicap split.
- Doubles: use three complete entries; include a tie that requires the current
  tie-break behavior and one handicap-driven change in rank.
- Trios: use one eligible two-champion team, one rejected three-champion team,
  and one rejected two-multi-time-champion team. The rejected attempts must not
  be retained as entries.
- Strikefest: use at least two squads and Singles, Doubles, and Team entries.
  Include a bowler with repeated entries so All Events selects the first scored
  appearance, a youth award, and a configured 8 AM daily series bonus. Do not
  archive this fixture; its archive/statistics/KWT behavior remains covered by
  automated calculation tests rather than persistent browser data.
- Finals: exercise bracket, single-game stepladder, best-of-three stepladder,
  roll-off, matchplay, eliminator, and Baker scoring in separate disposable
  fixture states. Record expected final places in the manifest before entry.
- Side action: one bracket, high game, and payout view with only fabricated
  names. Do not charge or contact anyone.

## Browser workflow order

1. Confirm password login and that the email guard reports blocked delivery.
2. Enter fabricated registrations, then check public roster/mirror output.
3. Check in teams and singles; assign lanes; print lane sheets and scoresheets.
4. Enter scores, verify scratch/handicap standings, then run each finals state.
5. Verify payouts, brackets, and side action. Do not archive or publish the
   fixture, and do not create KWT/history/statistics data from it.
6. Upload one non-sensitive synthetic image, verify public read/admin-only
   management, then delete that exact object before cleanup.

## Cleanup procedure

1. Stop testing and export the completed local manifest plus screenshots/print
   artifacts to a run folder outside Git.
2. Verify the manifest lists only IDs beginning with `bb-synth-20261124-v1` and
   Storage keys under `bb-synth-20261124-v1/`.
3. Remove exactly the manifest-listed Storage object, reservations, side-action
   rows, drafts, and fixture schedule records in dependency order. The manifest
   must contain no archive IDs because fixtures must never be archived. Do not
   use wildcard deletes.
4. Re-query each exact ID and key; each must be absent. Confirm all pre-existing
   staging counts and records are unchanged.
5. Save the cleanup report beside the manifest. If any exact-ID cleanup fails,
   stop and preserve the report for review rather than widening the deletion.

The database-specific cleanup runner is intentionally deferred until fixture
creation is separately approved and the exact generated IDs are known.
