# TianJi Love Paid Smoke Runbook

## 1. Scope

This runbook prepares TianJi Love paid smoke for test/staging only.

It does not approve:

```text
Stripe live
production paid smoke
production webhook mutation
production Supabase mutation
real user email
Ask paid production launch
Draw paid production launch
Vedic paid public exposure
paid launch
```

Current gate:

```text
Production free canary: Go
Paid launch: No-Go
```

## 2. Safety Rules

Do not print secrets. Do not commit `.env`. Do not copy staging secrets into Git.

Allowed before explicit approval:

```text
readiness checks
source contract audits
masked env classification
runbook review
```

Blocked before explicit approval:

```text
actual checkout session creation
webhook replay
entitlement mutation
provider live call
email send
Supabase staging mutation
Vedic paid report smoke
```

## 3. Existing Commands

Readiness/static commands:

```bash
npm run audit:staging-env-readiness
npm run smoke:stripe:test-readiness
npm run audit:ask-revenue-contract
npm run audit:draw-revenue-contract
npm run smoke:ai-providers
```

Notes:

```text
smoke:stripe:test-readiness classifies readiness and key mode without printing secrets.
smoke:ai-providers defaults to dry-run unless AI_PROVIDER_SMOKE_MODE=live is set.
Do not set live smoke modes without explicit approval.
```

## 4. Required Test/Staging Env Evidence

Record only key names and masked status labels.

Stripe test mode:

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_PRO_MONTHLY_PRICE_ID
STRIPE_PRO_YEARLY_PRICE_ID
STRIPE_ASK_PRICE_ID
STRIPE_DRAW_PRICE_ID
```

Supabase staging:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Email:

```text
RESEND_API_KEY
EMAIL_FROM
```

AI providers:

```text
OLLAMA_BASE_URL
DEEPSEEK_API_KEY
DEEPSEEK_BASE_URL
DEEPSEEK_MODEL_FLASH
DEEPSEEK_MODEL_PRO
MINIMAX_API_KEY
MINIMAX_BASE_URL
MINIMAX_MODEL
MINIMAX_TOKEN_PLAN_KEY
```

Vedic flags:

```text
NEXT_PUBLIC_TIANJI_VEDIC_ENABLED
TIANJI_VEDIC_REPORT_MODE
```

## 5. Stripe Test Checkout Readiness

Run:

```bash
npm run smoke:stripe:test-readiness
```

Required before checkout smoke:

```text
Stripe keys classified test mode
Ask checkout route ready
Draw checkout route ready
webhook route ready
entitlement path identified
success/cancel URLs use staging/test origin
no live key evidence
```

## 6. Webhook Test Readiness

Use test/staging only.

Checklist:

```text
checkout.session.completed event only
staging webhook endpoint only
masked webhook secret evidence present
duplicate event behavior reviewed
entitlement mutation target is staging/test storage
no production DB write
```

## 7. Ask Paid Unlock Smoke

Prerequisites:

```bash
npm run audit:ask-revenue-contract
npm run smoke:stripe:test-readiness
```

Expected smoke path after approval:

```text
create free Ask preview
start Stripe test checkout
complete test payment
deliver checkout.session.completed to staging webhook
verify Ask entitlement
verify paid Ask unlock output
confirm aiMeta excludes secrets/private payloads
```

## 8. Draw Paid Unlock Smoke

Prerequisites:

```bash
npm run audit:draw-revenue-contract
npm run smoke:stripe:test-readiness
```

Expected smoke path after approval:

```text
create free Draw preview
start Stripe test checkout
complete test payment
deliver checkout.session.completed to staging webhook
verify Draw entitlement
verify paid Draw unlock output
confirm aiMeta excludes secrets/private payloads
```

## 9. AI Provider Smoke

Preparation:

```bash
npm run smoke:ai-providers
```

This is dry-run unless explicitly configured for live mode.

Live provider smoke remains blocked until approval:

```text
AI_PROVIDER_SMOKE_MODE=live
AI_PROVIDER_SMOKE_ALLOW_LIVE=true
```

Do not use provider smoke as production load testing.

## 10. Supabase Staging Mutation Smoke

Allowed only after staging storage is proven.

Checklist:

```text
staging Supabase project identified
production Supabase is not used
test user/session is disposable
row writes are scoped and reversible
test rows cleaned up if required
no private payloads recorded
```

## 11. Resend / Email Smoke

Allowed only after approval.

Checklist:

```text
test sender approved
owned test recipient only
no production user email
no email automation
record status labels only
```

## 12. Vedic Paid Smoke Behind Flags

Checklist:

```text
public production Vedic paid remains disabled
staging/test flag state recorded
missing entitlement blocks full report
paid/pro entitlement enables report only in staging/test
Vedic safety assertions pass
no public paid report exposure
```

## 13. Go / No-Go

| Gate | Go Criteria | Current Status |
| --- | --- | --- |
| Stripe test readiness | Test mode keys, routes, webhook, entitlement path proven | No-Go / needs evidence |
| Ask paid smoke | Test checkout + webhook + entitlement + unlock pass | No-Go / not-run |
| Draw paid smoke | Test checkout + webhook + entitlement + unlock pass | No-Go / not-run |
| Provider smoke | Approved staging/test provider smoke passes | No-Go / not-run |
| Supabase staging mutation | Staging-only mutation proven and reversible | No-Go / not-run |
| Email smoke | Test sender/recipient only | No-Go / not-run |
| Vedic paid smoke | Behind flags, entitlement-gated, safe output | No-Go / not-run |
| Production paid launch | All above pass and separate approval exists | No-Go |

## 14. Approval Boundary

Approval needed before Lane N execution:

```text
Approved: execute Lane N paid smoke in staging/test mode only, with Stripe test mode, staging storage, no production paid launch, no live user email, and no public Vedic paid exposure.
```

Separate approval needed before future production paid launch:

```text
Approved: launch TianJi Love paid flows in production after Stripe/webhook/entitlement/provider/email/Supabase smoke gates pass.
```
