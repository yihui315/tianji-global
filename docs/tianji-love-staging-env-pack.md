# TianJi Love Staging Env Pack

## Scope

This pack moves staging/test env readiness from undocumented No-Go to a manual configuration state. It lists required variable names only. Do not paste, commit, print, or store real secret values in the repository, chat, evidence files, or screenshots.

This document does not authorize production deploy, paid smoke, Stripe live calls, webhook smoke, live AI provider calls, Resend sends, Supabase mutations, or reading real `.env` files.

## A. Minimal Degraded Staging Env

Use this profile first when the goal is a controlled staging runtime with live provider/payment/email/database mutation paths disabled.

| Key | Required state | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_ENV` | `staging` | Public non-secret environment label. |
| `STAGING_DEGRADED_MODE` | `true` | Enables degraded staging behavior. |
| `AI_PROVIDER_LIVE_DISABLED` | `true` | Live AI provider calls must stay disabled. |
| `STRIPE_LIVE_DISABLED` | `true` | Payment/live Stripe behavior must stay disabled. |
| `EMAIL_SEND_DISABLED` | `true` | Resend/email sends must stay disabled. |
| `SUPABASE_MUTATION_DISABLED` | `true` | Supabase write paths must stay disabled. |
| `NEXT_PUBLIC_APP_URL` | staging origin | Must match the staged public origin. |
| `NEXTAUTH_URL` | staging origin | Must match auth callback origin. |
| `NEXTAUTH_SECRET` | rotated staging secret | Secret value must be configured outside the repo. |

## B. Free-Flow Staging Env

Use this profile after degraded staging is configured and the human operator is preparing non-paid/free-flow smoke.

| Key | Required state | Notes |
| --- | --- | --- |
| `STAGING_BASE_URL` | staging origin | Used by staging smoke commands. |
| `AI_RUNTIME_MODE` | staging-approved mode | Example class: local, hybrid, or provider-routed. |
| `AI_FREE_PREVIEW_PROVIDER` | staging-approved provider | Free preview provider only. |
| `AI_FREE_PREVIEW_MODEL` | staging-approved model | Free preview model only. |
| `AI_ROUTER_PROVIDER` | staging-approved provider | Router provider for staged model gateway. |
| `AI_ROUTER_MODEL` | staging-approved model | Router model for staged model gateway. |
| `AI_ENABLE_SAFETY_REWRITE` | explicit boolean | Keep enabled unless Brain approves otherwise. |
| `AI_ENABLE_COST_LOGGING` | explicit boolean | Required for staged cost observability. |
| `AI_ENABLE_FALLBACK_LOGGING` | explicit boolean | Required for fallback observability. |

## C. Provider Smoke Env

Use this profile only after explicit approval for provider smoke. Configure test/staging keys outside the repo and run readiness checks before any live provider call.

| Key | Required state | Notes |
| --- | --- | --- |
| `OLLAMA_BASE_URL` | staging/local endpoint | Non-secret URL only; do not expose internal credentials. |
| `DEEPSEEK_API_KEY` | rotated test/staging key | Must not be a pasted or production credential. |
| `DEEPSEEK_BASE_URL` | provider endpoint | Configure outside the repo. |
| `DEEPSEEK_MODEL_FLASH` | staging-approved model | Flash model for low-cost smoke. |
| `DEEPSEEK_MODEL_PRO` | staging-approved model | Pro model for approved paid/provider smoke only. |
| `MINIMAX_API_KEY` | rotated test/staging key | Must not be a pasted or production credential. |
| `MINIMAX_BASE_URL` | provider endpoint | Configure outside the repo. |
| `MINIMAX_MODEL` | staging-approved model | Model selected for smoke. |
| `MINIMAX_TOKEN_PLAN_KEY` | rotated test/staging key | Required for quota/readiness paths when approved. |

## D. Paid Smoke Env

Use this profile only after explicit approval for Stripe/Supabase test-mode smoke. All credentials must be test/staging scoped and rotated if previously pasted into chat.

| Key | Required state | Notes |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | rotated test key | Must be test mode; live-shaped keys are blocked. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | rotated test publishable key | Must match the same Stripe test account. |
| `STRIPE_WEBHOOK_SECRET` | rotated test webhook secret | Must match the staging webhook endpoint only. |
| `STRIPE_ASK_PRICE_ID` | test price ID | Ask one-time smoke price. |
| `STRIPE_DRAW_PRICE_ID` | test price ID | Draw one-time smoke price. |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | test price ID | Monthly subscription smoke price. |
| `STRIPE_PRO_YEARLY_PRICE_ID` | test price ID | Yearly subscription smoke price. |
| `NEXT_PUBLIC_SUPABASE_URL` | staging project URL | Must not point to production. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | staging anon key | Public key still belongs outside evidence logs. |
| `SUPABASE_SERVICE_ROLE_KEY` | rotated staging service role key | Server-only; never paste or commit. |

## E. Email Env

Use this profile only after explicit approval for email readiness or send smoke.

| Key | Required state | Notes |
| --- | --- | --- |
| `RESEND_API_KEY` | rotated test/staging key | Must not be a pasted or production credential. |
| `EMAIL_FROM` | verified staging sender | Must use a verified sender/domain for staging. |

## Manual Configuration Order

1. Configure Minimal Degraded Staging Env with rotated auth secret.
2. Run masked readiness only: `npm run audit:staging-env-readiness`.
3. Configure Free-Flow Staging Env if non-paid staging smoke is approved.
4. Configure Provider Smoke Env only after provider smoke approval.
5. Configure Paid Smoke Env only after Stripe/Supabase test-mode smoke approval.
6. Configure Email Env only after Resend readiness/send approval.

## Safety Decision

Staging env is ready for human configuration, not execution. Provider, paid, email, Supabase mutation, webhook, and deploy gates remain No-Go until rotated values are configured out-of-band and masked readiness evidence is rerun.
