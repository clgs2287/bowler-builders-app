# Staging Active Workspace Test Execution Plan

## Scope

This is a future, owner-approved staging-only procedure. It does not authorize a
production connection, a deployment, an email, an archive, or a permanent
change to tournament rules. The fixture is intentionally excluded from archived
tournaments, title history, KWT, and public publication.

## Why this plan has a strict gate

The application has one `active_tournament_snapshots` row with ID `active`.
Opening a test draft for scoring replaces that row. Its normal full-save path
also reconciles the following shared collections and can delete remote rows that
are missing from local state:

- `schedule_events`;
- `manual_titles`;
- `bowler_identities`;
- `tournament_drafts`.

It also updates `app_settings` (`schedule_locked`, `reservation_state`), writes
the active snapshot, and may add fixture reservations. `archived_tournaments`
must not be touched, and the fixture must never be archived. Multi-event state
is a separate app-setting workspace and must be captured before testing.

## Phase A: read-only preflight and export

1. Confirm the Preview candidate is built from application commit `fb9a946` on
   `phase1c-staging-readiness`, targets staging project
   `evgyzbgixhaiykxznqez`, and has no production email credentials.
2. Create a fresh staging logical backup using the previously verified backup
   procedure. Keep it outside Git and cloud-synced folders. Verify its manifest,
   SHA-256 hashes, custom-archive table of contents, and offline readability.
3. Export the active workspace from the administrator UI to a dated local JSON
   file. Compute a SHA-256 hash and retain it with the logical backup manifest.
4. Capture a read-only exact-ID inventory of: `active_tournament_snapshots`
   (`active` only), every saved draft ID, schedule-event ID, manual-title ID,
   bowler-identity ID, reservation ID, relevant `app_settings` IDs, archive ID,
   and tournament-image Storage key. Record row counts and hashes where the
   existing inspection tooling supports them.
5. Compare the fresh inventory with the UI's fully loaded schedule, title,
   identity, reservation, draft, and archive counts. If any differs, stop: do
   not use the normal full-save path because it could treat unseen rows as stale.

Use the operations script below for the inventory. It creates only a local,
hashed report and runs all remote selects in one `BEGIN TRANSACTION READ ONLY`
session:

```powershell
& 'C:\Projects\bowler-builders-db-operations-prep\scripts\Get-StagingActiveWorkspacePreflight.ps1' `
  -SslRootCertPath 'C:/Users/coryl/Tools/BowlerBuilders/staging-supabase-ca.crt'
```

## Phase B: fixture preparation, after separate write approval

1. Create only the four saved drafts and schedule records documented in
   `STAGING_SYNTHETIC_TOURNAMENT_FIXTURE.md`. Each must be private, unpublished,
   named `TEST ONLY - BB SYNTH ...`, tagged `bb-synth-20261124-v1`, and set to
   series `TEST ONLY`.
2. Do not create a test archive, KWT event, manual title, identity record,
   public result, or production-like email address.
3. Do not persist champion title fixtures. Champion-limit behavior is already
   covered by the verified rollback-only database test.
4. Write a local manifest before the first save. It must contain every new draft,
   schedule, reservation, side-action, and Storage-object ID. It must contain no
   archive or manual-title IDs.
5. Re-run the full-load count check immediately before each normal save. Any
   missing pre-existing ID or count mismatch is a stop condition.

## Phase C: temporary active-workspace test

1. Record the active-workspace export hash in the test log.
2. Open one explicitly named fixture draft. Confirm the visible banner/name says
   `TEST ONLY` before entering any score.
3. Follow `STAGING_FUNCTIONAL_TEST_CHECKLIST.md` in order. Use fabricated names
   and `example.invalid` addresses only. Do not invoke an email workflow.
4. Exercise reservations, check-in, lane assignment, qualifying, handicap,
   finals, payouts, brackets, side action, printing, and private public-view
   display. Record each expected result before entering its score or outcome.
5. Test the multi-event fixture separately. Do not archive it, publish it, or
   mark it as a KWT/title event. Historical statistics and KWT are verified by
   the automated regression suite, not this persistent browser fixture.
6. Upload at most one non-sensitive image under
   `bb-synth-20261124-v1/`; delete it before restoring the active workspace.

## Phase D: cleanup and restoration

1. Export the completed fixture state and record the active-snapshot hash.
2. Delete only the exact manifest-listed synthetic Storage key, reservations,
   side-action rows, drafts, and schedule rows. Never use a name, date, or email
   wildcard. Do not delete archives, titles, identities, or any pre-existing row.
3. Restore the original active workspace from the Phase A administrator export.
   Use the Phase A preflight's `active-snapshot.csv` and `app-settings.csv` as
   the canonical remote source; the administrator export is the independent
   human-readable backup. The prepared restore runner changes only that active
   snapshot plus `schedule_locked`, `reservation_state`, and `multi_day_event`.
   It deletes nothing:

```powershell
& 'C:\Projects\bowler-builders-db-operations-prep\scripts\Restore-StagingActiveWorkspace.ps1' `
  -PreflightDirectory 'C:\Users\coryl\BowlerBuilders-StagingActiveWorkspacePreflights\<verified-preflight-folder>' `
  -ConfirmProjectRef 'evgyzbgixhaiykxznqez' `
  -SslRootCertPath 'C:/Users/coryl/Tools/BowlerBuilders/staging-supabase-ca.crt' `
  -Execute
```

   Run it only after exact-ID fixture cleanup and a separate restoration
   approval. Reload the staging page afterwards; do not press Save during the
   reload.
4. Run the read-only inventory again. Verify every preflight ID/count/hash is
   identical, the active export hash matches the Phase A source, no synthetic
   ID remains, and no `bb-synth-20261124-v1/` Storage key remains.
5. Confirm public history, statistics, KWT standings, reservation counts, and
   archives exactly match their preflight inventory. If any comparison fails,
   stop and preserve evidence. Restore from the fresh logical backup only under
   a separately approved recovery operation.

## Deployment gate for the KWT correction

After the plan is approved but before persistent fixture creation:

1. In normal PowerShell, push only `phase1c-staging-readiness` after reviewing
   `fb9a946`; do not merge or push `main`.
2. Wait for the Vercel Preview to report Ready and confirm its commit is
   `fb9a946`.
3. Confirm the Preview visibly uses staging data and the email guard remains
   blocked. Do not submit a reservation during this check.
4. Only then authorize Phase B.

No fixture creation or active-workspace replacement is authorized by this
document alone.
