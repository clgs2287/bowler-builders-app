# Production migration preparation for Bowler Builders

**SQL finalized locally. Production execution is on hold.** The candidate
pairs a scoped settings-mirror change with the Phase 3 migration. Staging
acceptance on `017ec5d` remains closed.

## KWT #3 capacity decision

Read-only production evidence for `schedule-8` identifies **Karl's World
Tour #3**, dated **November 8, 2026**. The event still marks entries open.
Schedule sets 64, the global reservation setting is open with a limit of 16,
and the event has no reservation bucket or matching global tournament key.
The event is also absent from the global open-keys list. Zero reservations
exist for the event, including zero Registered and zero Waitlisted.
Each limit represents individual singles entries, one bowler per entry.

On its normal request path, the live RPC reads per-event reservation state
and then the global limit before considering the request and default.
This event has no bucket, and the live singles RPC does not read Schedule
for capacity. It falls back to the unscoped global 16. The Phase 3 RPC
prioritizes Schedule, uses a matching event-scoped global value only after
the per-event bucket, and resolves the published 64.

The director approved **64 bowlers** and closing reservations for KWT #3
during the release. The migration checks the exact ID, name, published
date and 64-entry cap, then sets only the Schedule
`reservationSettings.entriesOpen` flag to false. The cap, global 16,
reservations, and historical record stay intact. The automatic cutoff
also rejects submissions because the tournament has already passed.

## SQL and compatibility

1. Review
   [the forward draft](../supabase/production-release/phase3-production-forward.draft.sql).
   It checks captured live routine fingerprints, owners, paths and
   pre-existing privileges. A scoped refresh leaves `multi_day_event`
   alone. Authenticated admins can insert or update only that row.
   No client DELETE is granted. Anonymous and other authenticated users
   remain readers, and trigger-based private settings mirroring stays in
   place. Direct refresh execution is removed from client roles.
2. The same transaction introduces the tested Phase 3 table, seed, policy
   and RPC logic. It preserves the signatures, JSON response contracts,
   and anonymous and authenticated submission entry points. The new
   production RPCs retain the existing public and empty search paths, while
   the server rules resolve published settings, preserve legacy fallbacks,
   lock settings, schedule and reservations in one order, and keep
   verified-average review advisory. The single RPC's closed-event check,
   grouped capacity and Schedule precedence are intended release behavior
   changes. The previous build must be checked against them.
3. Both `eded639` and `017ec5d` upsert the public multi-day row with
   `id,value`, and both call the same reservation RPCs with a JSON payload.
   Verify both in rehearsal. The older build does not use the new tables.
   Keep the new application out of service if the database is reverted.
4. Review
   [the inverse draft](../supabase/production-release/phase3-production-rollback.draft.sql).
   It refuses unexpected forward routine definitions, reinstates the
   captured legacy bodies and paths. It keeps public RPC execution disabled
   after the inverse because the legacy code lacks the cutoff, and restores
   the old settings-mirror permission pattern without refreshing or
   overwriting the current public event. It leaves the center and verified
   average tables and rows intact, including records created during
   cutover. After a database rollback, the old mirror's historical
   publishing limitation returns. If only the app fails and the rehearsed
   old-build overlap passed, keep the compatible database and use the
   muted old build. A reapply after a database rollback needs a newly
   reviewed preflight for the retained Phase 3 tables.
5. Keep the original production backup and captures of functions, owners,
   grants and manifests. Hash the reviewed files and recheck the live
   preimages just before any future approved execution. The numbered
   staging files and the staging Auth email hook stay outside this release.

### Cutoff and isolation status

The existing browser cutoff used the device's local time and the tournament
start time minus one hour. The older cleanup SQL was a one-off settings update.
The release now checks the published date at 8:00 a.m. America/New_York in
both RPCs before insertion. The UI uses the same calendar policy and
refreshes at the minute boundary. Published multi-day markers and date
ranges keep those events out of online registration. Undefined or invalid
published dates do not admit online entries. There is no scheduled job.

Local verification passed seven time and policy tests under a non-Eastern
device time zone. The offline browser opened Singles, Doubles and Trios at
7:59 Eastern and removed the form at 8:00 in the same tab. The administrator
could add a walk-in afterward and the multi-day paper-entry instructions
still appeared. The application build and static SQL checks passed. Lint reported zero
errors and 71 existing warnings. The PostgreSQL SQL tests and
production-shaped compatibility rehearsal remain pending because the
workstation has only PostgreSQL client tools and no existing disposable
database has been authorized. Use a designated server or a cleared,
separately approved existing non-production database with a sanitized
production-shaped schema. Production and the accepted staging workspace
stay out of the rehearsal.

## Email suppression during application rollback

Use an immutable **muted fallback built from exactly `eded639`**, with
`MAILJET_API_KEY`, `MAILJET_SECRET_KEY` and `RESEND_API_KEY` absent from
its effective server environment. The legacy provider has no environment
guard. A local mock used both exact provider sources and observed zero
outbound calls with all three credentials absent on `eded639` and with the
guard disabled on `017ec5d`, even with dummy credentials present on the
latter. Non-sending validation of the actual future builds is still required.

Under separate approval, prepare the muted fallback in the existing Vercel
project with the verified Production database mapping and without assigning
the live domain. Use the existing operator workflow for a staged Production
build. If Vercel CLI is already available and approved, its documented
`--prod --skip-domain` option keeps the domain unassigned. Verify the
immutable SHA, environment, effective absence of all provider credentials
including shared variables, and Supabase host before accepting the fallback.
Keep fallback credentials and the production domain untouched during this
local preparation. [Vercel deployment options](https://vercel.com/docs/cli/deploy#skip-domain).

Record how the operator will promote that specific muted artifact if the
candidate fails. Confirm it can receive the Production domain under the
current Vercel plan and permissions. During the muted window, keep the
candidate's guard disabled and use the verified muted artifact as the
rollback target. The original deployed `eded639` artifact retains its
original environment and remains available for a later separately approved
recovery that permits email. If the muted artifact cannot be prepared or
assigned, hold the release until an independent, reversible provider-side
mute covering **both** providers has been verified. Preserve effective
unsubscribe signing material privately when preparing any muted artifact.
Supabase Auth mail is a separate path. Use existing sessions for validation.
[Vercel rollback environment behavior](https://vercel.com/docs/instant-rollback).

### Activation order for the muted fallback

Keep Production project credentials and routing intact. Prepare the fallback
with deployment-scoped absence or empty overrides of **all three** delivery
credentials and retain the effective unsubscribe signing secret privately.
Verify the specific artifact with non-sending checks before promotion.
If approved, switch traffic to that muted artifact before beginning the
muted release-validation window, then deploy the cutoff candidate with its
guard off. Keep the muted artifact available throughout that window and for
any application rollback. If approved tooling cannot prove the override or
domain assignment, stop and use the separately approved provider-side mute
alternative. No settings, deployments or live delivery were exercised.

## Logical and Storage backups

Use existing `psql.exe`, `pg_dump.exe` and `pg_restore.exe` from
`C:\Users\coryl\Tools\PostgreSQLClient17.12\pgsql\bin`. Use the previously
verified tooling as a template, with a separately validated production
pooler/direct endpoint, CA and `sslmode=verify-full`. Confirm database
project `mrwyzfuutcvddaiqperp`. Supply passwords interactively; keep
credentials, private SQL and exports outside Git. Review the commands in the
[release report](PRODUCTION_RELEASE_READINESS.md#production-backup-and-rollback).

- In an approved window, capture the public-schema custom archive and
  the production inventories from a consistent read snapshot where
  possible. Start a read-only repeatable-read session and retain it while
  `pg_dump --snapshot` and the matching exports consume the snapshot.
  Keep the transaction bounded. The same procedure works with a brief,
  approved freeze if this is unavailable. Include deterministic ID and
  data hashes for historical and active workspaces, financial settings,
  reservation sources and mirrors, drafts, identities, titles, emails
  and admin metadata. Record Auth relationships and the latest physical
  recovery point separately. List and extract the archive using
  `pg_restore`, verify SHA-256 and confirm it can be restored on an
  authorized recovery copy. Reconcile concurrent legitimate activity
  using exact IDs and a documented capture boundary.
- Export `tournament-images` bucket configuration and a private manifest
  of object keys, sizes, content types and available versions or ETags.
  Download each object by its exact key using the existing authorized
  Storage read interface. URL-encode path segments for public downloads.
  Store bytes with local safe filenames mapped to exact keys in the
  manifest. Verify each size and SHA-256, then re-list and compare object
  metadata to detect changes during download. Expect 18 objects based on
  the review and use the fresh count at cutover. Match objects to known
  application references. Keep metadata and bytes separately from the
  database archive. [Supabase backup scope](https://supabase.com/docs/guides/platform/backups).
- Rehearse recovery on a separate target. Routine rollback restores
  versioned definitions and grants in place. A full database restore
  would require separate authorization, an isolated recovery destination
  and a plan to reconcile post-backup legitimate records and objects.

## Isolated rehearsal

Use an existing operator-designated disposable PostgreSQL 17 instance or an
already available isolated Supabase environment with written authorization.
Verify its host/project and owner role separately, then load a sanitized
production-shaped schema and synthetic rows only. Mirror the captured
function bodies, ACLs, policies, trigger and relevant Auth roles in that
copy. The available workstation tooling includes clients only. No
disposable server has been confirmed, so the rehearsal remains pending.
Do not overwrite the accepted staging workspace, reuse a recovery project
without confirming its contents and purpose, or connect the rehearsal
clients to production.

1. Capture the baseline and hashes. Run the forward file in a single
   session with `psql -X --set ON_ERROR_STOP=1 --file`. The copy must contain
   the exact KWT #3 Schedule identity, date and cap and the captured legacy
   routines and policies. Tests with a wrong cap or routine preimage must
   abort without persistent changes.
2. Apply the forward draft on the copy. Check the preserved public event
   after a full refresh, an ordinary reservation settings save and a
   fixture multi-day publish. Confirm admin insert/update succeeds and
   verify other users and other rows are rejected. Check source and
   derived data inventories and confirm the three center seeds.
3. Use exact builds `eded639` and `017ec5d` against the isolated API.
   Verify the old clients and the new cutoff UI candidate. Check
   representative singles/team creation, duplicate rejection,
   champion fallback, a Schedule cap ahead of an event bucket, a scoped
global fallback, default capacity without a matching key, waitlist and concurrent seat
   allocation, plus advisory verified averages in the new UI. Verify
   stable JSON response fields and old-client public Strikefest
   publishing. Keep all provider calls suppressed.
4. Simulate an application failure after SQL commits. Verify the muted
   old-build fallback with the migrated schema. Record whether an app-only
   rollback suffices. Insert a synthetic reservation and allowed
   verification after the cutover to represent legitimate intervening
   activity, then exercise the inverse separately. Confirm both changes
   survive and the legacy routine bodies return. Verify that public
   execution remains revoked after the full inverse. Reopen online entries
   only with a tested cutoff-capable server and separate approval.
5. Recheck inventories by ID and SHA-256, record lock timings and
   unexpected failures, and remove only the disposable fixtures.
   Release work requires a passed rehearsal and a separate approval.

## Focused Preview acceptance after separate approval

1. Verify the isolated staging target, its current Phase 3 fingerprints,
   exact Preview commit, and the blocked email probe before any fixtures.
   Capture the verified backup and thirteen-inventory baseline.
2. Apply
   [the cutoff-only staging SQL](../supabase/phase3/public_reservation_cutoff.staging.sql)
   to the expressly approved staging target. It preserves the installed
   Phase 3 schema and changes no event flags. On the isolated target run
   [the rollback-only SQL checks](../supabase/phase3/test_public_reservation_cutoff.sql)
   with `psql -X -v ON_ERROR_STOP=1`. Those fixtures check both public RPCs
   and always roll back on success. Exit the session after an error so its
   transaction rolls back.
3. Use the proposed cutoff Preview with an isolated synthetic fixture to
   confirm the public form and waitlist close on the Eastern boundary, the
   admin can add a walk-in, and the multi-day paper entry instructions and
   payment workflow are preserved. Test both the browser clock and actual
   server request paths. Never move a remote clock or spoof client values
   for the server test.
4. Close synthetic sessions, remove only tracked fixture IDs and check the
   thirteen inventories. If the cutoff needs reverting on staging, restore
   the two preflight-captured Phase 3 RPC definitions and grants before
   dropping the cutoff helper under separate staging authorization.

## Local commit

Stage exactly the local package. The earlier staging closure is already
committed. Inspect the staged diff before committing.

```powershell
Set-Location 'C:\Projects\bowler-builders-phase1c'
git diff --check
git add -- src/App.jsx src/reservationCutoff.js src/reservationCutoff.test.js package.json
git add -- scripts/acceptance/handicap-doubles.browser.mjs docs/PRODUCTION_MIGRATION_REHEARSAL.md docs/PRODUCTION_RELEASE_READINESS.md
git add -- supabase/production-release/phase3-production-forward.draft.sql supabase/production-release/phase3-production-rollback.draft.sql
git add -- supabase/phase3/public_reservation_cutoff.staging.sql supabase/phase3/test_public_reservation_cutoff.sql
git diff --cached --check
git diff --cached --stat
git commit -m 'Enforce Eastern reservation cutoff and finalize production migration'
```
