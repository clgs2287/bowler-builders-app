# Bowler Builders production release readiness

**November 25, 2026 decision. Staging acceptance is closed. Production
execution is blocked pending a production-specific migration, rehearsal and
separate approval.** The application-level Strikefest and same-name average
checks passed on immutable Preview `017ec5d`. The review below used only
production catalog reads, counts, dashboard metadata and public asset GETs.

## November 26 finalization

The director approved **64** and closure for KWT #3, November 8, 2026
(`schedule-8`). Schedule publishes 64 and the legacy RPC falls back to
an unscoped 16. Zero entries are Registered or Waitlisted. The migration
checks the published 64 and changes only the exact Schedule open flag.
The global 16 and historical records stay intact.

The production read-only scan found no other conflict among the two
events marked open. FBET #3 was already past its date, with 16 teams in
both resolutions. Among closed future events, KWT #5 publishes 64 and
KWT BOY 32 against the old implicit 16. FBET #4 and KWT #4 have no
published cap and would use 48 if opened without a scoped fallback.
Recovery Doubles is closed with a published zero that remains unchanged.
Past closed records also have differences. No other event settings changed.
Confirm the listed future capacities before opening those events.

Online single-day reservations now close at **8:00 a.m. Eastern** on
the published date, in the UI and both public RPCs. Admin roster work and
multi-day mail-in remain independent. Seven focused tests, an isolated browser test, the build, and static SQL
and whitespace checks passed. Lint reported no errors and 71 existing warnings. The accepted `017ec5d`
baseline is retained as evidence. The cutoff requires a new application
commit and separate focused Preview acceptance.

The [migration and rehearsal runbook](PRODUCTION_MIGRATION_REHEARSAL.md)
contains the production SQL pair, staging-only cutoff script, focused
SQL test, backup steps and muted fallback. A disposable PostgreSQL server
or separately authorized existing isolated database is still needed for
SQL rehearsal. A muted Production artifact must be verified under separate
authorization before the release window.

## Verified environments

| Item | Evidence |
| --- | --- |
| Vercel project | `clgs2287s-projects/bowler-builders-app` in the [project dashboard](https://vercel.com/clgs2287s-projects/bowler-builders-app) |
| Live domain | [tournaments.bowlerbuildersproshop.com](https://tournaments.bowlerbuildersproshop.com/) |
| Live production | [Ready deployment DRWBVjBbLsywo5akAX3FWFuy73PE](https://vercel.com/clgs2287s-projects/bowler-builders-app/DRWBVjBbLsywo5akAX3FWFuy73PE) on `main`, commit `eded639b01c984f2b922046cb04445e3695992e4` |
| Rollback target | Prepare a muted Production build from exact `eded639` before the cutover. The current legacy deployment remains a reference for later authorized recovery that permits email. |
| Proposed release source | `017ec5d` is the accepted pre-cutoff baseline. Record the exact new cutoff commit after local review and focused Preview acceptance. |
| Backing database | The published production bundle embeds the Supabase host for `mrwyzfuutcvddaiqperp`, matching the active project `bowler_builders_hub`, PostgreSQL 17, region us-east-1. Preview used `evgyzbgixhaiykxznqez`. |

The [staging closure](PHASE_3_STAGING_HANDOFF.md#november-25-staging-acceptance-closure)
records populated Strikefest standings, payout initialization, redistribution,
ties and first valid All Events series, same-name average isolation and
email suppression. All 13 staging counts and SHA-256 hashes matched after
restoration. The previous complete suite passed 71 tests plus stepladder.
Lint had zero errors and 71 warnings. Build and whitespace checks passed.

## Production database findings

The common application relations have the same named column definitions
and constraints as staging. Physical column order differs in
`admin_activity_locks` and `reservation_public_roster`. Use explicit column
lists for exports and comparisons. Production's anonymous table grants are
narrower on private and admin relations. Preserve them. The reservation
primary key is `reservations(id)`, and the admin helper body matches
staging. All four administrator profiles link to existing Auth users.
The three public mirrors are physical RLS tables, with anonymous read
access and source-table synchronization triggers.

Production migration history records `20260907201844`,
`20260907203923`, `20261014165053`, `20261103160457`,
`20261103162338`, `20261103162353` and `20261103163957`.
The numbered Phase 1 migrations are absent from the ledger even when the
objects already exist. Staging's current ledger records
`20261126000903`. Assess dependencies by live definition.

The production singles function is `SECURITY DEFINER`, owned by
`postgres`, with `search_path=public`, explicit anonymous and
authenticated grants, and inherited `PUBLIC` execute. Body MD5 is
`bf0f620ba62464edf6bfe579eae1cf80`. It checks duplicates and assigns the
next number per tournament without a table lock. It counts registered
rows. Capacity is taken from the event bucket, global reservation setting,
request payload, then 48 when the corresponding settings query provides
a value. It does not check the entries-open flag. A public UI pause alone
therefore cannot guarantee the old singles RPC has stopped accepting
requests.

The production team function is also `SECURITY DEFINER`, owned by
`postgres`, with an empty search path and execute limited to its explicit
RPC roles and owner. Body MD5 is `a4e42ca77d8124b1962d92cdb88eaa9b`.
It serializes reservation inserts with a SHARE ROW EXCLUSIVE lock,
validates full team membership, prevents repeated names, groups capacity
by team, numbers members per tournament and applies the legacy previous
champion cap. Its entries-open and capacity order is Schedule, event
bucket, matching global state, then default. It lacks the later tournament
policy resolver and multi-time champion branch.

The Phase 3 candidate expects staging preimages
`d00a1731e3f49051526674c9ce5f4c36` and
`9a330ed5319df211ded16bb8b6b0beee`, with both search paths set to
`pg_catalog, public`. The guard would reject production's current
definitions. Review a production version with a new fixed preimage check for
both exact live bodies, owners, ACLs and paths. Preserve numbering, duplicate
checking, legacy eligibility fallback, team grouping and waitlist semantics.
Verify the tested shorter transaction and consistent lock order
`app_settings`, `schedule_events`, `reservations`, schema-qualified access,
and the intended restrictive execute grants. The 340 example remains
advisory and verifications attach to reservation IDs.

### Migration disposition and dependency order

| Item | Production disposition |
| --- | --- |
| `202611230001` support tables | Already represented. Both email support tables, the admin control lock and request columns, RLS, and the update trigger exist. Keep the existing grants and records. Skip the staging file. |
| `202611230002` mirrors | The three public RLS tables, grouped roster column and both sync triggers exist. Function bodies differ. A narrow production mirror compatibility change is required before or in the same release transaction as Phase 3. Skip the full staging rebuild. |
| `202611230003` singles and `202611230004` teams | The live RPCs differ from the staging versions. Port the approved server-side rules and compatible locking, counting, capacity and waitlist behavior into the guarded production Phase 3 migration. Skip the intermediate staging RPC replacements. |
| `202611230005` Storage | The public `tournament-images` bucket, 5 MiB limit, four image MIME types and four access policies exist. Production uses a direct admin-profile predicate and has 18 objects. Preserve that configuration. Skip the staging file. |
| `202611240001` staging Auth email hook | Exclude from the production package. Production has no configured Auth hooks and no staging hook function. |
| `20261126000903` Phase 3 | Production lacks `bowling_centers`, `reservation_average_verifications` and the Phase 3 reservation helpers. Create those dependencies, RLS and explicit grants, seed the three approved centers, then atomically replace both RPCs in the production-adapted version. Record the actual reviewed production version and SQL hash. No separate database migration is required for the Strikefest initialization fix. |

**Mirror release gate.** Production holds three public settings rows,
including `multi_day_event`. The current refresh function deletes a target
row before displaying only `schedule_locked` and `reservation_state` in the
derived output. Both old and new app sources subsequently try to upsert a
sanitized `multi_day_event` directly. Production has an admin RLS write
policy but authenticated has SELECT only at the table grant layer. The
two paths can remove the public event without publishing its replacement.
Rehearse a narrowly scoped compatibility change. Restrict any allowed direct
upsert to authenticated admins and the `multi_day_event` row, and ensure
a general refresh, including a full rebuild, preserves that row. Keep the
other mirrors read-only to clients and preserve all privacy filtering.
Verify that public Strikefest survives both ordinary settings saves and
authorized publishing on the old and new clients. Confirm equivalent
grants and reject unauthorized writes in rehearsal.

### Data preservation

The read-only production inventory found 17 Schedule events, 499
reservations, 499 public roster rows, 11 public count rows, one active
snapshot, 10 archives, 280 identities, 161 manual title rows, and zero
drafts. It also found two unsubscribe and four suppression rows, four
Auth users and four Auth identities, and 18 Storage objects. These are
review-time counts. Refresh the canonical inventories at cutover.

The proposed changes add Phase 3 relations and seeds and replace scoped
functions and grants. They require no rewrite or deletion of source
financial settings, tournament history, reservations, identities, titles,
drafts, email preferences, Auth accounts or Storage objects. Record exact
data inventories before and after on the rehearsal copy. Keep the private
`admin_write_check` setting and any existing production-only settings.
Allowlist intended new objects and mirror changes and reconcile live
activity by exact ID before treating an inventory delta as a defect.

## Email readiness

The [Vercel variable list](https://vercel.com/clgs2287s-projects/bowler-builders-app/settings/environment-variables)
shows separate Production and Preview Supabase URL and publishable-key
entries. Production-scoped names are present for
`MAILJET_API_KEY`, `MAILJET_SECRET_KEY`, `RESEND_API_KEY`,
`RESERVATION_EMAIL_FROM`, `RESERVATION_REPLY_TO` and
`RESERVATION_NOTIFICATION_EMAILS`. Provider values, approved identities,
routing and delivery were not verified by a send. Ask the release operator
to confirm the intended provider account, verified sender, reply-to and
notification destinations in the provider dashboard, privately.

`EMAIL_DELIVERY_ENABLED` and
`BOWLER_BUILDERS_PRODUCTION_SUPABASE_PROJECT_REF` were absent from the
project variable list. Confirm the platform injects
`VERCEL_ENV=production`. For the first new production build, set
`EMAIL_DELIVERY_ENABLED=false` and
`BOWLER_BUILDERS_PRODUCTION_SUPABASE_PROJECT_REF=mrwyzfuutcvddaiqperp`
in Production only. Keep `VITE_SUPABASE_URL` mapped to the verified
project and make any `SUPABASE_URL` override match because the guard
checks it first. The three conditions must all pass to send.
Also check optional `PUBLIC_SITE_URL`, `ADMIN_APPROVAL_EMAILS`,
`ANNOUNCEMENT_EMAIL_LIMIT`, and unsubscribe signing configuration.
Preserve effective unsubscribe signing material so previously sent links
remain valid. The unsubscribe table and anonymous RPC already exist.
Never run the unsubscribe flow as a live smoke test.

Changing environment variables applies to a new deployment. After
non-sending smoke passes and the operator separately approves enabling
email, set the flag to the literal `true`, redeploy the same reviewed
commit with the updated Production variables, verify the commit and
mapping again, and reopen reservations as approved. A live delivery check
requires separate authorization and a controlled test mailbox. The current
`eded639` build predates the guard. Instant Rollback restores its original
environment, so an independent, approved email control is required if
rollback must keep email muted. Rehearse an external provider-side pause
or an approved guard-equipped fallback before cutover. Do not assume
toggling the new flag will mute the old build.
[Vercel environment variables](https://vercel.com/docs/environment-variables/managing-environment-variables)
and [Instant Rollback](https://vercel.com/docs/instant-rollback).

Production [Auth Emails](https://supabase.com/dashboard/project/mrwyzfuutcvddaiqperp/auth/templates)
uses Supabase's built-in email service. [Auth Hooks](https://supabase.com/dashboard/project/mrwyzfuutcvddaiqperp/auth/hooks)
shows no hooks. Auth email is independent of the application guard.
Preserve the current Auth configuration. Smoke with an existing authorized
session and avoid signup, invite, OTP and password reset in this release.

## Production backup and rollback

[Scheduled backups](https://supabase.com/dashboard/project/mrwyzfuutcvddaiqperp/database/backups/scheduled)
listed a physical backup at 2026-11-25 10:59:21 UTC.
[Point-in-time recovery](https://supabase.com/dashboard/project/mrwyzfuutcvddaiqperp/database/backups/pitr)
is not enabled. A fresh release backup, Storage download and recovery
rehearsal are pending approval. Storage object bytes require a separate
copy. [Supabase backup documentation](https://supabase.com/docs/guides/platform/backups).

Under release backup approval, use the existing PostgreSQL 17 tooling
used for staging. Use a pinned production session-pooler or direct host,
TLS `sslmode=verify-full`, the trusted CA, and an interactive password
prompt. Record the project ref, server and client versions, timestamp
and manifest, keeping any credentials and private exports out of Git.
The connection string passed below contains host, user and TLS options
without a password. The backup path is a private local directory.

```powershell
& $pgDump --password "--dbname=$prodConn" --format=custom --schema=public "--file=$backupDir\production-public.dump"
if ($LASTEXITCODE -ne 0) { throw 'Public backup failed' }
& $pgRestore --list "$backupDir\production-public.dump"
if ($LASTEXITCODE -ne 0) { throw 'Public backup inventory failed' }
& $pgRestore "--file=$backupDir\production-public.offline.sql" "$backupDir\production-public.dump"
if ($LASTEXITCODE -ne 0) { throw 'Offline archive extraction failed' }
Get-FileHash -Algorithm SHA256 -LiteralPath "$backupDir\production-public.dump","$backupDir\production-public.offline.sql"
```

- Capture deterministic counts, primary IDs, hashes and consistent scope
  for the thirteen staging-equivalent inventories plus all production
  settings, snapshots, email tables, admin profiles/locks and public mirror
  keys. Capture exact function definitions, owners, ACL, configuration,
  relevant triggers and policies, schema versions and the pre-cutover
  release timestamp. Where practical use a shared read snapshot for the
  dump and inventories. If concurrent changes occur, reconcile the affected
  rows by audit window and exact IDs.
- Record Auth role/profile relationships, user and identity inventory, Auth
  config and recent scheduled backup. Use a separately authorized recovery
  copy to verify Auth dependencies. Keep exports containing Auth secrets
  restricted and encrypted. Export Storage bucket configuration and a key,
  size and checksum manifest, then download existing object bytes to
  protected storage through a supported existing read interface. Verify
  the 18 review-time objects against the fresh release inventory and
  hashes. Keep original object paths and content types.
- The production inverse uses the captured routine and permission preimages.
  It restores the mirror grants and legacy RPC bodies without refreshing
  the current public event. It retains reservations, center and verification
  rows, and the scoped KWT #3 closure. Both legacy public RPCs stay revoked
  after a full database rollback. Rehearse the inverse and old application's
  compatibility with the migrated database on the disposable copy.
- If a migration fails before commit, abort the transaction and verify the
  prior schema and inventories. If a migration commits but deployment
  fails, keep the current domain on the old build only if the rehearsal
  proved compatibility. Otherwise use the scoped inverse before reopening
  bookings. If the new app fails after cutover, confirm the email mute
  strategy and restore Vercel to the recorded prior build, then apply the
  scoped database inverse if the old-client compatibility check fails.
  Verify restored read paths, RPCs, grants and legitimate activity.
- A full database restore is disaster recovery and requires new explicit
  authorization. Recover to a separate destination when possible and
  reconcile legitimate reservations, edits, Auth changes and Storage
  activity since capture before considering a cutover. Never overwrite
  post-backup production records as part of routine release rollback.

## Proposed production sequence

Reserve a 30–45 minute low-traffic window as a planning estimate. Keep
read-only public pages online. Target a reservation pause only for the
schema and application switch if booking demand warrants it. Prefer a
window with no active public booking. If a pause is necessary, obtain
approval and rehearse a server-enforced pause for both RPCs. The existing
singles function ignores the UI entries-open flag. A short reservation
pause and zero planned site-wide downtime are targets, subject to the
rehearsal timings. Avoid active scoring or tournament administration.

1. **Approval to rehearse.** Verify the approved 64-entry KWT #3 closure.
   Prepare the guarded production SQL and inverse scripts, with the mirror
   change first and adapted Phase 3 second. Review the exact SQL and hashes,
   public mirror privacy, previous-build overlap, permissions, concurrency
   and rollback on an authorized disposable database. Time the
   transaction and run the established acceptance cases on that copy.
2. **Approval to back up.** Reconfirm target, live deployment and remote Git
   refs. Verify the target currently reports healthy, the approved window
   is quiet, backup and storage exports are readable, rollback access is
   available, and the baseline inventory is complete. Include every
   Storage object in the fresh inventory, including additions after the
   review count of 18.
3. **Approval to mute email and prepare fallback.** Verify the rollback-only
   Production artifact from exact `eded639` with all provider send keys
   absent, without changing the stored project credentials. Switch to the
   verified muted artifact at the start of the release-validation window
   or use the rehearsed independent mute for both providers.
4. **Approval for production database changes.** Use the rehearsed scoped
   pause if needed. Run the reviewed SQL with `psql -X --password
   -v ON_ERROR_STOP=1`, a short lock timeout and bounded statement timeout
   inside its transaction. Verify the KWT #3 closure and 64-entry cap,
   preserved global 16, grants, mirrors, local-date cutoff, data preservation
   and existing-client compatibility before deployment.
5. **Approval for deployment.** Set the two Production-only guard variables
   with delivery disabled, verify the Supabase mapping, and release only the
   approved cutoff commit through the confirmed `main` workflow. The
   proposed Git commands below require this approval. If branch protection
   requires a PR, verify the resulting tree against the accepted build and
   approve the actual SHA before triggering deployment.
6. Verify the immutable deployment, environment and mapped database.
   Use read-only smoke paths for Home, Schedule, MIST finance, KWT,
   Strikefest standings and payouts, PDFs and reservation eligibility.
   Verify cutoff display and preserve mail-in workflow. Perform a non-sending
   email-guard probe only after configuration proves fail-closed.
7. **Approval to reopen and enable delivery.** After the smoke gates pass,
   enable the flag and redeploy the approved source. Recheck host mapping
   and restore eligible paused windows to their approved state. Keep
   KWT #3 closed. A live test message requires separate approval.
8. Stop on capacity or schema drift, locked migration, failed email guard,
   lost mirror, unexplained inventory delta, SQL or smoke failure. Restore
   the muted prior application while keeping the migrated database if
   compatible. If SQL must also be reverted, use the reviewed scoped inverse
   and keep public RPCs paused until a cutoff-capable server is verified.

```powershell
$release = '<approved full cutoff commit SHA after focused Preview acceptance>'
$previous = 'eded639b01c984f2b922046cb04445e3695992e4'
Set-Location 'C:\Projects\bowler-builders-phase1c'
git fetch origin main phase1c-staging-readiness
if ($LASTEXITCODE -ne 0) { throw 'Fetch failed' }
if ((git rev-parse origin/main).Trim() -ne $previous) { throw 'Production base changed' }
if ((git rev-parse origin/phase1c-staging-readiness).Trim() -ne $release) { throw 'Candidate changed' }
git merge-base --is-ancestor $previous $release
if ($LASTEXITCODE -ne 0) { throw 'Release is not a fast-forward' }
git push origin "${release}:refs/heads/main"
```

## Local staging acceptance documentation commit

Run locally only. The three files include the final staging closure and
this read-only compatibility review. The proposed production SHA above
continues to identify the staging-tested application.

```powershell
Set-Location 'C:\Projects\bowler-builders-phase1c'
git status --short
git diff --check
git add -- docs/PHASE_3_STAGING_HANDOFF.md docs/TOURNAMENT_TESTING_DEVELOPMENT_BACKLOG.md docs/PRODUCTION_RELEASE_READINESS.md
git diff --cached --check
git diff --cached --stat
git commit -m 'Document Bowler Builders staging acceptance and production readiness'
```
