# Love V1 Staging Environment Checklist

Use names only in PR and staging setup. Do not paste secret values into docs, PR comments, tickets, logs, or chat.

## Required For Love V1 Staging

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

## Staging QA Gate

- Run `npm run release:check` before requesting staging QA.
- Confirm Stripe is in test mode.
- Confirm Stripe webhook target points to the staging URL.
- Confirm Resend is configured for staging or fails gracefully when absent.
- Confirm no raw birth data appears in URLs, email bodies, share pages, or client logs.
