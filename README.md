# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Reservation Emails

Reservation confirmation emails are sent through the Vercel API route at `/api/send-reservation-email`.
To enable delivery in production, add these environment variables in Vercel:

- `RESEND_API_KEY`: API key from Resend.
- `RESERVATION_EMAIL_FROM`: Verified sender address, for example `Bowler Builders <reservations@yourdomain.com>`.
- `RESERVATION_REPLY_TO`: Optional reply address, for example `bowlerbuildersproshop@yahoo.com`.
- `RESERVATION_NOTIFICATION_EMAILS`: Optional comma-separated admin/director copy list.

The Reservations admin page also has a "Confirmation Email Copies" box for tournament-specific copy recipients.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
