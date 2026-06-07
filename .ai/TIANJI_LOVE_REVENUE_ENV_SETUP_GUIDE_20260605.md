# TianJi Love Revenue Env Setup Guide - 20260605

Use this guide only for Vercel Preview/Staging. Do not send values to chat, do not commit them to git, and do not write them into reports.

## One Command

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .ai\setup-vercel-preview-env-safe.ps1
```

The script calls `npx vercel env add NAME preview` for each required variable. Vercel will prompt for values interactively.

## Required Preview Variables

| Variable | Source | Required Evidence |
|---|---|---|
| STRIPE_SECRET_KEY | Stripe test dashboard secret key | Must be test mode, masked only |
| STRIPE_WEBHOOK_SECRET | Stripe test webhook endpoint signing secret | Present, masked only |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | Stripe test dashboard publishable key | Must be test mode, masked only |
| STRIPE_LOVE_PREMIUM_REPORT_PRICE_ID | Stripe test dashboard Price for Love premium report | Test-mode Price for `love_premium_report`, CNY, unit_amount 1990 |
| ENABLE_PAY_PER_USE | Vercel Preview env | `true` only after test-mode Stripe evidence is ready |
| NEXT_PUBLIC_APP_URL | Hosted Vercel Preview URL | Preview/Staging URL, not production |
| NEXT_PUBLIC_SUPABASE_URL | Supabase staging/test project settings | Staging/test project only |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase staging/test project API settings | Present, masked only |
| SUPABASE_SERVICE_ROLE_KEY | Supabase staging/test project API settings | Server-side/test evidence only, masked only |
| AUTH_SECRET | Local node crypto generation | Present, masked only |
| NEXTAUTH_SECRET | Same secret class as AUTH_SECRET | Present, masked only |
| AUTH_URL | Hosted Vercel Preview URL | Preview/Staging URL, not production |
| NEXTAUTH_URL | Hosted Vercel Preview URL | Preview/Staging URL, not production |
| GOOGLE_CLIENT_ID | Google OAuth Web Client for staging callback | Web client ID present, masked only |
| GOOGLE_CLIENT_SECRET | Google OAuth Web Client secret | Present, masked only |
| RESEND_API_KEY | Resend sandbox or safe sender account | Present, masked only |
| FROM_EMAIL | Resend verified safe sender | Present, masked sender evidence only |
| LOVE_TEST_PAID_INTENT_TEST_MODE_READY | Vercel Preview env | `true` only after Stripe/Supabase test evidence is complete |
| LOVE_TEST_PAID_SMOKE_APPROVED | Vercel Preview env | Initial value must be `false` |

## AUTH Secret Generation

Generate locally, then paste only into the Vercel prompt:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Do not paste the generated value into chat or any repository file.

## Evidence Recording

After Vercel Preview values are added, record only masked evidence in `.ai/TIANJI_LOVE_REVENUE_EVIDENCE_TODO_20260605.md`.

Allowed examples:

```text
present=yes mode=test masked=****abcd
present=yes mode=staging target=preview
product=love_premium_report currency=cny unit_amount=1990
approved=no
```

Forbidden examples:

```text
raw secret values
raw webhook secret values
raw Stripe Price IDs
raw Supabase keys
production Supabase evidence
real user data
```
