# Synthetic handicap doubles acceptance

- **Fixture** `bb-synth-20261125-doubles-01`
- **Preview** `01d0f22` on `phase1c-staging-readiness`
- **Staging project** `evgyzbgixhaiykxznqez`

This is one eight-team fixture. The local runner uses a disposable browser profile,
with Supabase disabled and the app served on loopback. The Vercel Preview remains
read-only during preparation. The fixture allocates zero remote IDs.

## Baseline and cleanup

Use the existing verified backup at
`C:/Users/coryl/BowlerBuilders-StagingBackups/evgyzbgixhaiykxznqez/2026-11-24_195500-VERIFIED`.
Keep all backup and preflight artifacts outside Git. The latest historical
reconciliation snapshot is `2026-11-25_131014-ACTIVE-WORKSPACE-PREFLIGHT-VERIFIED`.
Authenticate at the script’s local `psql` prompt to capture a fresh baseline.

```powershell
$started = [datetimeoffset]::Now
& 'C:\Projects\bowler-builders-db-operations-prep\scripts\Get-StagingActiveWorkspacePreflight.ps1' `
  -SslRootCertPath 'C:\Users\coryl\Tools\BowlerBuilders\staging-supabase-ca.crt'
$baseline = '<new -VERIFIED directory printed by the script>'
$backup = 'C:\Users\coryl\BowlerBuilders-StagingBackups\evgyzbgixhaiykxznqez\2026-11-24_195500-VERIFIED'
& .\scripts\acceptance\Test-StagingDoublesBaseline.ps1 -BaselineDirectory $baseline `
  -BackupDirectory $backup -CapturedAfter $started
```

The verifier checks the eleven export hashes, the exact `active` row ID, and
the protected `multi_day_event`, `reservation_state`, and `schedule_locked`
settings. Keep a fresh owner UI export alongside the baseline before any
separately approved persistent test.

The fixture manifest lists the 16 bowler seeds, eight derived team IDs, exact
bracket entrant sets, and empty sets for durable IDs. The local browser run
logs each generated bracket ID and its ordered entrant IDs, including byes.
If a later approval permits temporarily changing `active`, record the live IDs
before proceeding and use the existing `Restore-StagingActiveWorkspace.ps1`
with the canonical fresh preflight only after restoration is approved. The
old `Remove-SyntheticScheduleRows.ps1` is restricted to the previous run’s
three IDs. This fixture needs no schedule, draft, reservation, archive, title,
identity, or Storage row.

After any separately approved persistent run, repeat the read-only preflight
and pass its path as `-AfterDirectory` to `Test-StagingDoublesBaseline.ps1`.
The test passes only when all eleven inventories match exactly, including
Strikefest 26 and the original active workspace data. Stop and preserve evidence
if the check finds any difference.


## Approved staging baseline

The owner approved the 16:25:27 preflight on November 25, 2026 as the
acceptance and restoration baseline. Preserve both verified directories in
the local preflight root:

- 2026-11-25_131014-ACTIVE-WORKSPACE-PREFLIGHT-VERIFIED
- 2026-11-25_162527-ACTIVE-WORKSPACE-PREFLIGHT-VERIFIED

All eleven exact ID sets matched. Ten CSV exports matched byte for byte,
including the settings containing Strikefest 26. The only change was in
the MIST active snapshot. Phase 2A made its legacy fee basis explicit as
entry, replacing an absent payoutState.entryFeeBasis property. The saved
$100 fee, effective fee calculation, and financial totals matched when
both snapshots were run through the application functions. All other
active snapshot fields matched.

Compare the postflight with the approved 16:25:27 baseline exactly.

## Automated verification

From `C:\Projects\bowler-builders-phase1c`, run the fixture checks and save
the local browser’s synthetic ID log in the run folder.

```powershell
node .\scripts\acceptance\handicap-doubles.mjs
node .\scripts\acceptance\handicap-doubles.browser.mjs | Tee-Object -FilePath (Join-Path $env:TEMP "bb-doubles-acceptance-01d0f22.log")
npm test
```

The browser runner uses installed Edge. `BB_ACCEPTANCE_EDGE` can point to an
alternate installed Edge executable. The [fixture](../scripts/acceptance/handicap-doubles.fixture.json)
is the source for the exact roster, scores, and expected monetary amounts.

## Browser checklist

Use an isolated local browser for actions that modify state. On the Preview,
confirm the commit and workspace indicators without signing in or using any
save, reset, archive, publish, or email action unless separately authorized.

| Step | Exact input | Expected result |
| --- | --- | --- |
| Setup and reset | Use the fixture title and roster. Set Doubles, handicap 90% of 200, Sweeper, lanes `1-8`, $65 per bowler, $4 lineage per game and two cashing spots. Mark seeds 1–13 paid. In an isolated prior state use raffle $235, sponsor $75 and prize override $900, then start fresh. | 16 bowlers, eight teams, $130 per team, $1,040 total revenue and $845 collected. Fresh raffle, sponsor and prize override are all $0. Reopening the prior state restores its three saved amounts. |
| Lanes | Set `SYN 01A` to `1A` and leave the other 15 blank. Choose **Random Fill Blank Lanes**, then sort by **Lane**. | `1A` stays assigned to `SYN 01A`. All 16 positions are unique, partners share a lane number and all eight teams remain grouped. |
| Qualifying | Change **Qualifying Games** from 3 to 4 on Dashboard. Open Score Entry, Scoresheets, Payouts and Finance. | Four game columns or boxes, Finance count 4, $256 qualifying lineage and $0 finals lineage. Projected prize fund $784. Finance shows $589 after lineage using collected fees. |
| Brackets | At $5 per ticket give individual Scratch one ticket each for seeds 1–6, Team Handicap one each for Teams 1–7, and Team Scratch one each for Teams 1–8. Generate each set once. | One locked bracket per set. First/second/retained are respectively $15/$10/$5, $20/$10/$5 and $25/$10/$5. Zero refunds, unique entrants, and the two byes occupy opposite halves. |
| Missing scores | In the six-entrant draw select an actual Game 1 matchup with two named bowlers. Enter `200` for the first and leave the opponent blank, then enter `0` for the opponent. Clear the zero and mark that opponent’s **Bracket forfeit** for Game 1. | Blank leaves the match open, entered zero advances the `200`, and the marked forfeit advances the bowler who scored 200. The feeder remains pending when its opponent is missing. Clear the trial scores and flags before loading the fixture scores. |
| Team side action | Enter Team Scratch High Game at $12 for Teams 1 and 3. Enter Team Handicap High Game at $16 for Teams 2 and 3. Use the four scores per bowler in the fixture. Open High Game and Side Action Payouts. | Team 1 wins $6 per game from the $24 Scratch pot. Team 2 wins $8 per game from the $32 Handicap pot. Team 3 has entered both. Each winning team appears once with its lanes. Check winner and payment status independently, and confirm four team controls at phone width. |
| Cash sheet | Set manual payout values for first/second to $500/$284. Open the cash sheet and compare CSV with print preview. | Team 2 leads with 1,585 scratch / 1,801 handicap total and a $500 team payout. Team 1 follows with 1,663 / 1,663 and $284. One event summary, clear team headings, and no clipped columns or scrollbar. |

Record the fixture ID, exact actor and bracket IDs, expected and actual results,
and the print preview outcome together. Close the isolated profile after the run.

## Deployed acceptance results

The signed-in Chrome session ran the fixture on Preview commit `01d0f22`.
GitHub and Vercel identified the immutable deployment as Preview, and Chrome
observed staging project `evgyzbgixhaiykxznqez` as the app's Supabase host.
The HTTPS reservation email probe used only
`bb-synth-20261125-doubles-01@example.invalid`. Before fixture installation
the deployed endpoint returned HTTP 200 with `sent: false`, `skipped: true`,
and provider `blocked`.

| Check | Observed result |
| --- | --- |
| Fees and qualifying | $65 per bowler, $130 per team, $845 collected from 13 of 16 bowlers, and $589 net after $256 lineage. The projected $784 fund reconciled to $500 and $284 per team. Dashboard, Score Entry, Scoresheets, and Payouts used the changed four-game count. |
| Lane assignment | 155 ms for one Chrome sample from accepted confirmation through the local roster update and two animation frames. All 16 positions were unique, partners shared lanes and remained grouped, and seed 1 stayed at `1A`. |
| Six-, seven-, and eight-entrant draws | Locked draws with two, one, and zero byes. The two byes split across halves. At $5 per entry, first prizes were $15, $20, and $25, second prizes were $10, and there were no refunds. |
| Missing scores | Scratch match `3` vs `4` stayed pending at `200` versus blank. Seed `3` advanced against an entered `0` and against seed `4`'s explicit forfeit. |
| Team side action | Team 1 won $6 per game from the $24 Scratch high-game pot. Team 2 won $8 per game from the $32 Handicap high-game pot. Separate payout details and current lanes appeared on the team rows. |
| Cash sheet | Chrome rendered one page with one event summary, team and prize headings, all columns, and the $500 and $284 cashes. Print preview was canceled. |
| Financial reset | The synthetic $235 raffle, $75 sponsor amount, and $900 override each reset to $0 through the Browser UI. |

### Exact synthetic IDs

The only database row temporarily replaced was the existing active snapshot
`active`, marked `bb-synth-20261125-doubles-01`. The loaded fixture contained
bowler seeds `1` through `16` and derived team IDs `team-1` through `team-8`.
The generated IDs below existed in the guarded browser session. The browser
blocked outbound writes during the fixture actions, so the locked draws were
never saved to staging.

| Bracket set | Generated ID | Ordered entrants |
| --- | --- | --- |
| Individual Scratch | `side-bracket-1795643499487-1` | `3`, `4`, `5`, `BYE-0-1`, `1`, `6`, `2`, `BYE-0-0` |
| Team Handicap | `side-bracket-1795643499523-1` | `team-1`, `BYE-0-0`, `team-6`, `team-3`, `team-7`, `team-4`, `team-2`, `team-5` |
| Team Scratch | `side-bracket-1795643499549-1` | `team-8`, `team-3`, `team-6`, `team-7`, `team-5`, `team-4`, `team-2`, `team-1` |

### Restoration and postflight

The staging database connector restored only `active` from the approved
16:25:27 preflight. The restore was conditional on the exact fixture payload.
MIST returned with its $100 fee and explicit legacy `entry` basis. No new
durable schedule, draft, reservation, archive, title, identity, or Storage ID
was created.

A separate read-only transaction repeated the eleven inventory queries from
the verified preflight. Counts and SHA-256 hashes of canonical field values,
including IDs, matched the approved baseline in every export. Chrome then
loaded the restored MIST snapshot, and the test tab's local cache was returned
to MIST and Strikefest 26 before that tab was closed. Both original verified
preflight directories were preserved.
