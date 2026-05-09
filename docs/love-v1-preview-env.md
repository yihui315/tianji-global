# Love V1 Preview Environment Checklist

Use names only in PR and preview setup. Do not paste secret values into docs, PR comments, tickets, logs, or chat.

## Required For Love V1 Preview

- `NEXT_PUBLIC_APP_URL`
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`

## Existing Names Confirmed In `.env.example`

- `NEXT_PUBLIC_APP_URL`
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`

## Preview QA Gate

- Run `npm run release:check` before requesting Vercel Preview QA.
- Confirm Stripe is in test mode.
- Confirm Stripe webhook target points to the Preview URL.
- Confirm Resend is configured for staging or fails gracefully when absent.
- Confirm no raw birth data appears in URLs, email bodies, share pages, or client logs.

