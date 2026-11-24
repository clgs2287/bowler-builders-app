# Mandatory staging email safety

## Application guard

All application email routes use `api/email-provider.js`. Its centralized guard
blocks delivery before any Mailjet or Resend request unless all conditions are met:

1. `VERCEL_ENV` is exactly `production`.
2. `EMAIL_DELIVERY_ENABLED` is exactly `true`.
3. The project reference parsed from `SUPABASE_URL` or `VITE_SUPABASE_URL` exactly
   matches `BOWLER_BUILDERS_PRODUCTION_SUPABASE_PROJECT_REF`.

Any missing, staging, Preview, localhost, development, or unknown value returns a
simulated blocked result. Provider credentials alone cannot enable delivery.

Before a future production deployment, set the last two variables in the
**Production** Vercel scope only. Do not create them in Preview or Development.
The expected production project reference must be the actual production Supabase
project reference, not the staging reference.

## Staging tests

Use fabricated names, phone numbers, and addresses. Use only addresses ending in
`example.invalid` in test payloads. Do not invoke email endpoints as a delivery
test; their blocked response and the local regression tests are the test oracle.
Never load, edit, or contact stored reservation email addresses.

## Required remote read-only check

Before any staging website reservation test, run the approved read-only inspection
in normal Windows PowerShell:

```powershell
.\scripts\Inspect-StagingOutboundPaths.ps1 `
  -CaCertificatePath 'C:/Users/coryl/Tools/BowlerBuilders/staging-supabase-ca.crt'
```

It uses one interactive password prompt and writes a local report. It checks
outbound-capable extensions, related schemas/tables, function bodies, triggers,
event triggers, and the two reservation RPCs. It does not query reservation rows,
email addresses, or any customer data. Stop for review if it finds `pg_net`,
`http`, `pg_cron`, `dblink`, suspect function bodies, or suspect triggers.

## Manual hosting and Auth checks

1. In Vercel, confirm Mailjet, Resend, sender, reply-to, and notification-recipient
   variables exist only in Production. Remove or redeploy any historical Preview
   deployment created before this policy; Preview deployments retain the environment
   values from their deployment time.
2. In Vercel, confirm Preview and Development do not define
   `EMAIL_DELIVERY_ENABLED` or `BOWLER_BUILDERS_PRODUCTION_SUPABASE_PROJECT_REF`.
3. In the staging Supabase Dashboard, review **Authentication > Providers > Email**
   and Auth email templates. Disable the Email provider while staging login tests
   are unnecessary. If it must remain enabled, restrict tests to pre-created test
   users and never use sign-up, magic-link, password-reset, invite, or email-change
   flows. Supabase Auth delivery is independent of the website email provider.
4. Review staging Edge Functions, Database Webhooks, Cron, and integrations in the
   Supabase Dashboard. Disable any outbound function/job not required for the test.

No staging reservation test is approved until the local guard is deployed to the
staging/Preview environment and the remote inspection/manual checks are reviewed.
