# TianJi Love Test-Mode Paid Smoke 20260525

## 1. Strict Readiness

```text
npm run smoke:stripe:test-readiness: Go command exit, reports Blocked because test env is missing
npm run smoke:stripe:test-readiness -- --strict: Blocked
```

Strict blockers:

```text
STRIPE_SECRET_KEY: missing
STRIPE_WEBHOOK_SECRET: missing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: missing
ENABLE_PAY_PER_USE: missing
NEXT_PUBLIC_APP_URL: missing
NEXT_PUBLIC_SUPABASE_URL: missing
NEXT_PUBLIC_SUPABASE_ANON_KEY: missing
SUPABASE_SERVICE_ROLE_KEY: missing
```

## 2. Relationship Smoke

| Step | Status | Notes |
|---|---|---|
| Evidence card | Not run | Strict readiness blocked |
| UUID reading | Not run | Supabase staging env missing |
| checkout_start_from_free_preview | Not run | Strict readiness blocked |
| Stripe test checkout opens | Not run | Stripe test env missing |
| Test payment succeeds | Not run | Stripe test env missing |
| Webhook received | Not run | Stripe CLI/env missing |
| Entitlement unlock | Not run | Webhook/Supabase not proven |
| Paid report unlocked | Not run | Full paid smoke not reached |

## 3. Ask Smoke

| Step | Status | Notes |
|---|---|---|
| Evidence card | Not run | Strict readiness blocked |
| checkout_start_from_free_preview | Not run | Strict readiness blocked |
| Stripe test checkout opens | Not run | Stripe test env missing |
| Test payment succeeds | Not run | Stripe test env missing |
| Webhook received | Not run | Stripe CLI/env missing |
| Entitlement unlock | Not run | Not test-mode proven |
| Paid answer unlocked | Not run | Full paid smoke not reached |

## 4. Draw Smoke

| Step | Status | Notes |
|---|---|---|
| Evidence card | Not run | Strict readiness blocked |
| checkout_start_from_free_preview | Not run | Strict readiness blocked |
| Stripe test checkout opens | Not run | Stripe test env missing |
| Test payment succeeds | Not run | Stripe test env missing |
| Webhook received | Not run | Stripe CLI/env missing |
| Entitlement unlock | Not run | Not test-mode proven |
| Paid draw unlocked | Not run | Full paid smoke not reached |

## 5. Stripe Dashboard Evidence

```text
Payments succeeded in Test mode: Not run
Events show checkout.session.completed: Not run
Webhook attempts 2xx: Not run
```

## 6. Analytics Privacy

```text
Private payload leakage: Not run for paid smoke
Prior PR #65 static/browser QA privacy result: Go
Secrets printed: No
Live mode used: No
```

## 7. Launch Decision

```text
No-Go
```

Reason:

```text
Strict readiness is blocked because local/staging Stripe and Supabase test env are not configured in this isolated worktree. No real test-mode checkout, webhook, or entitlement unlock was run.
```

## 8. Next Action

User must configure local `.env.local` or staging env with test-mode Stripe and Supabase staging values, then rerun:

```powershell
npm run smoke:stripe:test-readiness
npm run smoke:stripe:test-readiness -- --strict
```

Only after strict readiness is Go:

```text
1. Start app on NEXT_PUBLIC_APP_URL.
2. Start Stripe CLI listener to /api/stripe/webhook.
3. Run Relationship paid smoke first.
4. Run Ask paid smoke.
5. Run Draw paid smoke.
6. Confirm Stripe Dashboard Test mode payments/events and app entitlement unlocks.
```

## 9. Commands Run

```powershell
git fetch origin main
git worktree add D:\BrainSystem\...\tianji-global-stripe-testmode-smoke-20260525 -b chore/tianji-stripe-testmode-smoke-20260525 origin/main
rg -n "STRIPE_|PRICE|PRODUCT|PAY_PER_USE|CHECKOUT|ENTITLEMENT|WEBHOOK|SUPABASE|DATABASE_URL|APP_URL" src scripts tests package.json .env.example
npm ci
npm run smoke:stripe:test-readiness
npm run smoke:stripe:test-readiness -- --strict
node --check scripts/smoke-stripe-test-readiness.mjs
```

Command notes:

```text
npm ci: Blocked/timeout after dependency install exceeded 4 minutes; dotenv became present but next was still missing.
Stripe CLI availability check: unavailable on PATH.
```

## 10. Gate Status

```text
PR #65 merged: Go
Stripe test env readiness: Blocked
Supabase staging UUID persistence: Blocked
Strict readiness: Blocked
Relationship UUID reading: Not run
Relationship checkout_start_from_free_preview: Not run
Relationship Stripe test checkout: Not run
Relationship webhook: Not run
Relationship entitlement unlock: Not run
Ask checkout_start_from_free_preview: Not run
Ask Stripe test checkout: Not run
Ask entitlement unlock: Not run
Draw checkout_start_from_free_preview: Not run
Draw Stripe test checkout: Not run
Draw entitlement unlock: Not run
Analytics privacy: Go
Production deploy: Not run
Stripe live mode: Not run
Secrets printed: No
Formal traffic / Day 1 publishing: Go only if paid smoke Go
```
