# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Reservation Emails

Reservation confirmation emails are sent through the Vercel API route at `/api/send-reservation-email`.
To enable delivery in production, add these environment variables in Vercel:

- `MAILJET_API_KEY`: API key from Mailjet.
- `MAILJET_SECRET_KEY`: Secret key from Mailjet.
- `RESERVATION_EMAIL_FROM`: Verified sender address, for example `Bowler Builders <reservations@bowlerbuildersproshop.com>`.
- `RESERVATION_REPLY_TO`: Optional reply address, for example `bowlerbuildersproshop@yahoo.com`.
- `RESERVATION_NOTIFICATION_EMAILS`: Optional comma-separated admin/director copy list.
- `ADMIN_APPROVAL_EMAILS`: Optional comma-separated list for admin account request notices.
- `RESEND_API_KEY`: Optional fallback while moving from Resend to Mailjet.

The Reservations admin page also has a "Confirmation Email Copies" box for tournament-specific copy recipients.

The owner-only Reservations admin page can also send announcement emails to de-duplicated past reservation emails. That route verifies the current Supabase admin session before sending. Optional:

- `OWNER_ADMIN_EMAILS`: Comma-separated owner email fallback list. Defaults to `cory.lagner@gmail.com`.
- `ANNOUNCEMENT_EMAIL_LIMIT`: Maximum recipients per announcement send. Defaults to `500`.

## Local Staging Supabase

Local development reads Supabase settings from `.env.local`. That file is ignored by Git, so it is safe to use a separate staging Supabase project locally without affecting the live Vercel site.

Recommended setup:

1. Create a second Supabase project for staging/testing.
2. In that staging project, run `supabase/schema.sql` in the Supabase SQL Editor.
3. Copy `.env.local.example` to `.env.local`.
4. Put the staging project's API URL and publishable key in `.env.local`.
5. Restart the local dev server with `npm run dev`.

Do not put production Supabase keys in local testing if you want localhost changes to stay away from the live site.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
