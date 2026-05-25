# TianJi Love Stripe Env Mapping 20260525

## Required Env Names Detected

| Purpose | Env name | Required | Expected shape | Present locally | Notes |
|---|---|---|---|---|---|
| App URL | NEXT_PUBLIC_APP_URL | Yes | http://localhost:3000 or staging HTTPS URL | masked no | Must match checkout callback origin |
| Pay-per-use gate | ENABLE_PAY_PER_USE | Yes | true | masked no | Required before checkout routes create sessions |
| Stripe secret key | STRIPE_SECRET_KEY | Yes | sk_test_* or rk_test_* | masked no | Server only; live-shaped keys are blocked |
| Stripe publishable key | NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | Yes | pk_test_* | masked no | Public browser key; test mode only |
| Webhook secret | STRIPE_WEBHOOK_SECRET | Yes | whsec_* | masked no | Use Stripe CLI secret for local listener or Dashboard endpoint secret for staging |
| Ask price | Inline price_data | No separate env detected | inline cents in src/lib/ask-question.ts | n/a | Test/live mode depends on STRIPE_SECRET_KEY account mode |
| Draw price | Inline price_data | No separate env detected | inline cents in src/lib/quick-draw.ts | n/a | Test/live mode depends on STRIPE_SECRET_KEY account mode |
| Relationship price | Inline price_data | No separate env detected | inline cents in src/lib/billing.ts | n/a | compatibility_report uses inline price_data |
| Pro monthly price | STRIPE_PRO_MONTHLY_PRICE_ID | Optional for this smoke | price_* | masked no | Pricing/subscription path, not Relationship/Ask/Draw paid smoke |
| Pro yearly price | STRIPE_PRO_YEARLY_PRICE_ID | Optional for this smoke | price_* | masked no | Pricing/subscription path, not Relationship/Ask/Draw paid smoke |
| Supabase URL | NEXT_PUBLIC_SUPABASE_URL | Yes | https://*.supabase.co | masked no | Staging/test only |
| Supabase anon key | NEXT_PUBLIC_SUPABASE_ANON_KEY | Yes | present | masked no | Staging/test only |
| Supabase service role | SUPABASE_SERVICE_ROLE_KEY | Yes | present | masked no | Server only, staging/test only |
| Database URL | DATABASE_URL | Required for order/report persistence where used | PostgreSQL URL | masked no | Needed for order/event/report persistence paths |

## Source Findings

```text
Webhook route: /api/stripe/webhook
Webhook signature verification: getStripe().webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET)
Ask checkout route: /api/ask/unlock
Draw checkout route: /api/draw/unlock
Relationship checkout route: /api/checkout
Relationship webhook entitlement: markRelationshipReadingPremium(relationshipReadingId)
```

## Local Masked Presence Result

```text
.env.local: missing in this isolated worktree
NEXT_PUBLIC_APP_URL: masked no
ENABLE_PAY_PER_USE: masked no
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: masked no
STRIPE_SECRET_KEY: masked no
STRIPE_WEBHOOK_SECRET: masked no
NEXT_PUBLIC_SUPABASE_URL: masked no
NEXT_PUBLIC_SUPABASE_ANON_KEY: masked no
SUPABASE_SERVICE_ROLE_KEY: masked no
DATABASE_URL: masked no
Stripe CLI: unavailable on PATH
```

## Safe Local Template

Create this file locally only:

```text
.env.local
```

Use real values only in that local file, never in chat or committed docs:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENABLE_PAY_PER_USE=true

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
DATABASE_URL=postgresql://xxx
```

Ask, Draw, and Relationship currently use inline `price_data`, so the three Dashboard test products/prices are useful for operational verification but no separate Ask/Draw/Relationship price env names were detected in this code path.
