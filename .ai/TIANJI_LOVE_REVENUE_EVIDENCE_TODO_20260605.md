# TianJi Love Revenue Evidence TODO - 20260605

This file is for masked staging/test evidence only. Do not paste plaintext secrets, raw Stripe Price IDs, raw webhook secrets, Supabase keys, production URLs, or real user data here.

## Evidence Table

Allowed status values: `missing`, `present_masked`, `verified_test_mode`, `blocked`.

| Field | Status | Evidence |
|---|---|---|
| hosted_staging_url | missing | present=no mode=missing target=unknown source=human |
| supabase_staging_url | missing | present=no mode=missing target=unknown source=human |
| supabase_anon_key | missing | present=no mode=missing target=unknown source=human masked=none |
| supabase_service_role_key | missing | present=no mode=missing target=unknown source=human masked=none server_side_only=yes |
| stripe_publishable_key | missing | present=no mode=missing target=unknown source=human masked=none |
| stripe_secret_key | missing | present=no mode=missing target=unknown source=human masked=none |
| stripe_webhook_secret | missing | present=no mode=missing target=unknown source=human masked=none |
| stripe_love_premium_report_price_id | missing | present=no mode=missing target=unknown source=human masked=none |
| love_premium_price_contract | missing | present=no mode=missing product=love_premium_report currency=cny unit_amount=1990 source=human |
| resend_api_key | missing | present=no mode=missing target=unknown source=human masked=none |
| from_email | missing | present=no mode=missing target=unknown source=human masked=none |
| test_mode_checkout_webhook_dry_run_approval | blocked | present=no mode=missing target=test-dry-run source=human approved=no |

## Current Blockers

- Hosted Preview/Staging URL evidence is missing.
- Stripe test publishable key, test secret key, webhook secret, and Love premium test Price evidence are missing.
- Supabase staging/test URL, anon key, and service role key presence evidence is missing.
- Resend API key and FROM_EMAIL evidence is missing.
- Test-mode checkout/webhook dry-run approval remains blocked until all masked staging/test evidence is present.

## Safety

- Live Stripe is forbidden.
- Production Supabase is forbidden.
- Production deploy is forbidden.
- Real paid smoke is forbidden.
- Plaintext secrets are forbidden.
