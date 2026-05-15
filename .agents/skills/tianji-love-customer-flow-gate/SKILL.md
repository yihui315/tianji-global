---
name: tianji-love-customer-flow-gate
description: Use this skill to run Tianji Love local customer-flow QA across homepage, relationship, ask, draw, pricing, about, login, dashboard, profile, readings, privacy, and terms. It combines Tianji route rules with gstack-qa-only, gstack-design-review, and gstack-review.
---

# Tianji Love Customer Flow Gate

## Purpose

Validate whether Tianji Love local customer experience is coherent before cloud deploy, paid smoke, or marketing.

## Required GStack Skills

Use:

```text
gstack-careful
gstack-qa-only
gstack-design-review
gstack-review
gstack-context-save
```

Use `gstack-investigate` only if QA fails and root cause analysis is needed.

## Product Rules

Tianji Love is the only active product direction.
TianJi Global as a broad tools product is cancelled or deprioritized.
Legacy routes may remain, but must not dominate the main customer path.
Primary customer path is Love Reading / relationship compatibility.
Secondary paths are Ask and Draw.
Marketing starts only after customer flow, staging, and revenue smoke pass.

## Non-Goals

Do not:

- Deploy
- Run paid checkout
- Touch Stripe
- Touch Supabase
- Touch `.env`
- Touch migrations
- Delete legacy routes

## Routes To Check

Desktop and mobile:

```text
/
/relationship/new?lang=en
/relationship/new?lang=zh
/ask?lang=en
/ask?lang=zh
/draw?lang=en
/draw?lang=zh
/pricing?lang=en
/about?lang=en
/login
/dashboard
/profile
/readings
/legal/privacy
/legal/terms
```

## Required Checks

- HTTP status
- console errors
- page errors
- failed requests
- broken images
- mobile overflow
- TianJi Global leakage
- `tianji.global` leakage
- wrong legacy navigation
- English route Chinese leakage
- Chinese route remains Chinese
- protected routes redirect same-origin
- no `localhost:3000` callback leakage
- CTA targets are current Tianji Love paths

## Required Commands

If local release gate is required:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run audit:copy
npm run audit:share
npm run audit:routes
npm run audit:upgrade
npm run audit:release-gate
node scripts/smoke-ask-draw-auth.mjs http://127.0.0.1:3057
```

## Evidence

Save screenshots and JSON under:

```text
.ai/artifacts/tianji-love-customer-flow-YYYYMMDD/
```

## Stop Conditions

Stop if:

- secrets would be printed
- production Stripe/Supabase could be touched
- a task would require reset/stash/revert
- a task would silently include env/CI/API/Stripe/Supabase/migration risk
- local customer flow has old TianJi Global leakage
- English routes leak Chinese core content
- protected routes redirect to localhost
- mobile overflow appears

## Output

Write a report to:

```text
.ai/TIANJI_LOVE_CUSTOMER_FLOW_GATE_YYYYMMDD.md
```

Must include:

```text
route matrix
browser QA results
artifact folder
P0 blockers
P1 issues
Go/No-Go for local customer experience
```

## Go Criteria

Go only if:

- no core old-brand leakage
- no `tianji.global` leakage
- no mobile overflow
- relationship EN/ZH works
- Ask/Draw preview works
- protected routes redirect same-origin
- local gate commands pass

## No-Go Criteria

No-Go if:

- homepage or core routes throw console errors
- `/dashboard` or `/profile` redirect to localhost
- English route leaks Chinese core content
- legal/privacy leaks old domain
- mobile overflow exists
- audit/share/copy/release gate fails
