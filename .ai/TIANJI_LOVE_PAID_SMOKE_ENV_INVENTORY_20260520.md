# TianJi Love Paid Smoke Env Inventory - 2026-05-20

## Goal

Prepare paid smoke environment readiness using names-only inventory. Do not read or print secret values, do not run paid smoke, and do not enable live payment behavior.

## Method

```text
process env check: Test-Path Env:<KEY>, values not read or printed
.env.example check: key-name slot presence only
real .env files read: no
server env read: no
Stripe/Supabase/Resend/provider API calls: no
```

## A. Stripe Test

| Key | Local process env | `.env.example` slot | Status |
| --- | --- | --- | --- |
| `STRIPE_SECRET_KEY` | missing | present | Blocked until staging masked test-mode evidence exists |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | missing | present | Blocked until staging masked test-mode evidence exists |
| `STRIPE_WEBHOOK_SECRET` | missing | present | Blocked until staging webhook test evidence exists |
| `STRIPE_ASK_PRICE_ID` | missing | present | Slot documented; still blocked until staging masked test price evidence exists |
| `STRIPE_DRAW_PRICE_ID` | missing | present | Slot documented; still blocked until staging masked test price evidence exists |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | missing | present | Blocked until staging masked test price evidence exists |
| `STRIPE_PRO_YEARLY_PRICE_ID` | missing | present | Blocked until staging masked test price evidence exists |

## B. Supabase Staging

| Key | Local process env | `.env.example` slot | Status |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | missing | present | Blocked until staging project evidence exists |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | missing | present | Blocked until staging masked evidence exists |
| `SUPABASE_SERVICE_ROLE_KEY` | missing | present | Blocked until staging masked service-role evidence exists |

## C. Provider

| Key | Local process env | `.env.example` slot | Status |
| --- | --- | --- | --- |
| `DEEPSEEK_API_KEY` | missing | present | Blocked until staging masked provider evidence exists |
| `DEEPSEEK_BASE_URL` | missing | present | Blocked until staging approved base URL evidence exists |
| `DEEPSEEK_MODEL_FLASH` | missing | present | Slot documented; still blocked until staging approved model evidence exists |
| `DEEPSEEK_MODEL_PRO` | missing | present | Slot documented; still blocked until staging approved model evidence exists |
| `OLLAMA_BASE_URL` | missing | present | Blocked until staging/runtime evidence exists |
| `MINIMAX_API_KEY` | missing | present | Blocked until staging masked provider evidence exists |
| `MINIMAX_TOKEN_PLAN_KEY` | missing | present | Blocked until quota/readiness smoke is approved |

## D. Email

| Key | Local process env | `.env.example` slot | Status |
| --- | --- | --- | --- |
| `RESEND_API_KEY` | missing | present | Blocked until staging masked sender evidence exists |
| `EMAIL_FROM` | missing | present | Blocked until staging verified sender evidence exists |

## E. Vedic Paid Flags

| Key | Local process env | `.env.example` slot | Status |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_TIANJI_VEDIC_ENABLED` | missing | present | Must remain false/disabled for public exposure |
| `TIANJI_VEDIC_REPORT_MODE` | missing | present | Must remain disabled until paid smoke approval |

## Env Readiness Verdict

```text
paid smoke env readiness: No-Go
Stripe test checkout readiness: No-Go
Stripe webhook readiness: No-Go
Ask entitlement smoke readiness: No-Go
Draw entitlement smoke readiness: No-Go
DeepSeek live provider smoke readiness: No-Go
MiniMax quota smoke readiness: No-Go
Resend/email smoke readiness: No-Go
Supabase staging mutation smoke readiness: No-Go
Vedic paid public exposure: No-Go / disabled
```

## Blockers

- Local process env still does not provide the paid smoke keys.
- Staging/server masked values are not proven for `STRIPE_ASK_PRICE_ID`, `STRIPE_DRAW_PRICE_ID`, `DEEPSEEK_MODEL_FLASH`, or `DEEPSEEK_MODEL_PRO`.
- No masked staging/server env inventory was collected in this run.
- No test-mode Stripe checkout, webhook, entitlement, Supabase staging mutation, provider live, or email smoke was run.

## Next Approval Needed

Provide masked staging env evidence with values hidden and explicit approval for test/staging paid smoke. Do not run production paid smoke.
