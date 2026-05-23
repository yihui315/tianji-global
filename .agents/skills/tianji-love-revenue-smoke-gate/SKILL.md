---
name: tianji-love-revenue-smoke-gate
description: Use this skill only after Tianji Love clean RC is deployed to staging and staging Stripe/Supabase evidence is Go. It validates Ask/Draw test-mode checkout, webhook, paid unlock restore, and same-origin auth. It must never run against live Stripe or production Supabase.
---

# Tianji Love Revenue Smoke Gate

## Purpose

Validate Ask/Draw paid smoke in staging only.

## Required Preconditions

Do not run unless:

```text
clean RC deployed to staging
Stripe is test mode
Supabase is staging/test
webhook endpoint is staging
Ask/Draw secrets exist
user explicitly requested paid smoke
```

## Product Rules

Tianji Love is the only active product direction.
Secondary paths are Ask and Draw.
Paid smoke requires staging Stripe/Supabase proof.
Marketing starts only after customer flow, staging, and revenue smoke pass.

## Scope

Only Ask/Draw.

`/pricing` Pro remains waived unless the Pro Price ID contract has been fixed separately.

## Hard Non-Goals

Do not:

- use live Stripe
- use production Supabase
- run production migrations
- touch real customer payments
- print secrets
- test Pro subscription unless explicitly fixed and in scope

## Required Checks

Ask:

```text
/ask preview
/ask checkout start
Stripe test checkout
staging webhook receives checkout.session.completed
paid unlock restored
refresh keeps unlock
```

Draw:

```text
/draw preview
/draw checkout start
Stripe test checkout
staging webhook receives checkout.session.completed
paid unlock restored
refresh keeps unlock
```

Auth:

```text
/dashboard same-origin login redirect
/profile same-origin login redirect
no localhost redirect
```

## Stop Immediately If

```text
Stripe mode is live or unknown
Supabase is production or unknown
webhook endpoint is production
payment would charge real customer
secret would be printed
unlock fails after payment
deploy source is dirty or ambiguous
a task would require reset/stash/revert
```

## Output

Write:

```text
.ai/TIANJI_LOVE_REVENUE_SMOKE_YYYYMMDD.md
```

## Decision

```text
Go for Ask/Draw staging paid smoke
No-Go for paid smoke
```
