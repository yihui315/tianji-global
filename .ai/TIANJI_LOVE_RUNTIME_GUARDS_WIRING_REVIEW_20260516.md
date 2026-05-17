# TianJi Love Runtime Guards Wiring Review - 2026-05-16

## Scope

Lane C: Runtime Guards Wiring on branch `feat/runtime-guards-wiring`.

Goal: wire staging degraded mode into critical runtime paths so currently unknown guard statuses become explicit Go or Conditional Go.

No secrets read confirmation: real `.env`, `.env.local`, credentials, deployment keys, Stripe live data, Supabase production data, and provider secrets were not read or printed.

## Current Guard Status

Initial source review before wiring:

| Runtime path | Initial status | Initial reason |
| --- | --- | --- |
| Ask unlock guard | Unknown | `src/app/api/ask/unlock/route.ts` calls `getStripe()` directly in POST/GET. Missing Stripe env throws and falls through as a generic 500 rather than explicit staging locked/503. |
| Draw unlock guard | Unknown | `src/app/api/draw/unlock/route.ts` calls `getStripe()` directly in POST/GET. Missing Stripe env throws and falls through as a generic 500 rather than explicit staging locked/503. |
| Stripe webhook guard | Unknown | `src/app/api/stripe/webhook/route.ts` validates secret/signature and records/mutates events without an explicit degraded-mode payment-disabled short-circuit. |
| Provider live-disabled guard | Unknown | `src/lib/tianji-model-gateway.ts` always attempts configured provider/fallback model calls and does not honor `AI_PROVIDER_LIVE_DISABLED=true`. |
| Email send-disabled guard | Unknown | `src/lib/love-report-email.ts` skips only when `RESEND_API_KEY` is missing; `EMAIL_SEND_DISABLED=true` is not honored before order lookup or Resend construction. |
| Supabase mutation-disabled guard | Unknown | Supabase mutation helpers such as `src/lib/relationship-reading-store.ts` do not yet honor `SUPABASE_MUTATION_DISABLED=true` before insert/update paths. |
| Production deploy guard | Go | `isProductionDeployBlocked()` blocks when `NODE_ENV=production` or staging degraded mode is enabled unless `PRODUCTION_DEPLOY_ALLOWED=true`. |

Post-wiring verification target:

| Runtime path | Target status |
| --- | --- |
| Ask unlock guard | Go |
| Draw unlock guard | Go |
| Stripe webhook guard | Go |
| Provider live-disabled guard | Go |
| Email send-disabled guard | Go |
| Supabase mutation-disabled guard | Go |
| Production deploy guard | Go |

## Minimal Plan

1. Add tests for degraded-mode guard behavior in Ask unlock, Draw unlock, model gateway, email helper, and Supabase mutation helper.
2. Add small guard helpers/reuse existing degraded-mode primitives without changing route/model policy.
3. Short-circuit payment unlock and webhook paths with safe locked/skipped responses when staging degraded mode disables Stripe.
4. Short-circuit AI provider generation when `AI_PROVIDER_LIVE_DISABLED=true`.
5. Short-circuit email sending when `EMAIL_SEND_DISABLED=true`.
6. Short-circuit Supabase mutation helper writes when `SUPABASE_MUTATION_DISABLED=true`.
7. Update `scripts/audit-staging-degraded-mode.ts` so wired guards report Go or Conditional Go.
8. Run the requested npm validations and record evidence.

## Risk

Risk level: medium, because payment, provider, email, and mutation runtime paths are touched. Scope is constrained to degraded-mode safety guards only; no route/model policy, payment product meaning, UI/copy, secrets, live calls, deploy, or production configuration changes are planned.
