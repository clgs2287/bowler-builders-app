# Staging Website Readiness

## Verified locally

- The isolated application worktree is on `phase1c-staging-readiness` at
  `cbe4bb984c2e1735838399f658ee2b822cbeacce`, with the local email-safety
  changes still uncommitted for review.
- `npm ci` recreated dependencies solely from `package-lock.json`.
- `npm test` passed 35 tests and the standalone stepladder check passed.
- `npm run build` completed successfully. Vite reported a non-blocking bundle
  size warning for the main client chunk.
- The client uses the applied `tournament-images` bucket, uploads JPEG images
  with `upsert: false`, and obtains public URLs. The staged bucket permits this
  behavior and also permits PNG, WebP, and GIF uploads within a 5 MiB limit.
- The client calls the applied `create_public_reservation` and
  `create_public_team_reservation` RPCs and reads the replacement public mirror
  tables.

## Email safety release gate

The centralized sender blocks provider calls unless all are true:

1. `VERCEL_ENV=production`.
2. `EMAIL_DELIVERY_ENABLED=true`.
3. The configured Supabase URL matches
   `BOWLER_BUILDERS_PRODUCTION_SUPABASE_PROJECT_REF`.

Local tests exercise the reservation, announcement, and admin-request routes
with synthetic provider credentials and prove no provider request occurs in
Preview. This guard is not active remotely until an approved deployment includes
the application change.

For a Preview deployment, set only staging-safe values:

- `VITE_SUPABASE_URL`: the URL for `evgyzbgixhaiykxznqez`.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: the staging publishable key.
- Do not define Mailjet, Resend, sender, recipient, `EMAIL_DELIVERY_ENABLED`, or
  `BOWLER_BUILDERS_PRODUCTION_SUPABASE_PROJECT_REF` in Preview or Development.

Before browser testing, manually confirm Supabase Auth email behavior is disabled
or limited to pre-created synthetic test users, and retire old Preview deployments
that were built before email secrets were production-only.

## Proposed Preview deployment procedure

1. Review and commit only the email guard, its tests, and this readiness document
   on `phase1c-staging-readiness`.
2. Push that branch only after owner approval. Do not merge into `main`.
3. In Vercel, confirm the branch creates a Preview deployment and that its two
   Supabase variables resolve to `evgyzbgixhaiykxznqez`.
4. Confirm Preview has no email-provider, sender, recipient, or production-enable
   variables. Confirm no Preview deployment can use production email credentials.
5. Build the Preview; inspect build logs for the staging project reference only.
6. Run the synthetic workflow checklist below. Do not use stored reservations or
   real email addresses.
7. Record results, then obtain a separate approval before any production merge or
   deployment.

## Synthetic workflow checklist

Use `*.example.invalid` email addresses and invented people, teams, scores, and
images. Never modify existing staging reservations.

- Public reservation: closed/open, capacity reached, duplicate, waitlist, and
  entries-closed responses.
- Team reservation: doubles and trios validation, complete team requirement,
  duplicate protection, capacity edge, champion limits, and multi-time champion
  limit.
- Multi-event: packet and entry workflow, current-average rule, all-events first
  appearance, youth awards, daily bonuses, roster, lane assignments, scores,
  payouts, and archive views.
- Standard tournament: registration, check-in, scratch/handicap scoring, ranking,
  brackets, stepladder, best-of-three, matchplay, eliminator, roll-offs, finals
  placements, finance/payout overrides, and side action.
- Public/admin separation: anonymous public mirrors and image reads work; private
  reservation contact data and admin actions remain inaccessible.
- Printing: runner score entry, lane-pair sheets, bracket, payout, and score-sheet
  exports render correctly in the browser.
- Statistics: public leaderboard, archive filtering, bowler expansion, title and
  Hall of Fame views on desktop and mobile.
- Storage: one synthetic image upload and deletion by a staging admin only, after
  a separate approval; confirm anonymous public read and non-admin write denial.

Do not begin synthetic writes, image uploads, browser-based Auth flows, or any
deployment without explicit approval.
