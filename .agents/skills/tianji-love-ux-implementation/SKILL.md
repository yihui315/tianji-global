---
name: tianji-love-ux-implementation
description: Use this skill when implementing Tianji Love UX fixes, page shell alignment, navigation cleanup, CTA repair, language consistency, homepage fixes, legal copy cleanup, or auxiliary route cleanup. It combines Tianji product rules with gstack-careful, gstack-investigate, gstack-design-review, and gstack-qa.
---

# Tianji Love UX Implementation

## Purpose

Implement Tianji Love UX/customer-flow fixes safely.

Use for:

- homepage fixes
- navigation alignment
- secondary page shell alignment
- relationship/ask/draw visual consistency
- login/dashboard/profile/readings cleanup
- legal/privacy/terms brand cleanup
- English/Chinese route consistency
- CTA target repair

## Required GStack Skills

Use:

```text
gstack-careful
gstack-investigate
gstack-design-review
gstack-qa
gstack-review
```

## Product Rules

Tianji Love is the only active product direction.
TianJi Global as a broad tools product is cancelled or deprioritized.
Legacy routes may remain, but must not dominate the main customer path.
Primary customer path is Love Reading / relationship compatibility.
Secondary paths are Ask and Draw.
Pricing Pro payment logic remains known-risk until the price-ID contract is fixed.

## Hard Boundaries

Do not touch:

```text
production Stripe
production Supabase
.env or secrets
migrations
server deploy
live payment logic
Pro subscription price-ID contract
```

unless the user explicitly asks and the relevant gate is Go.

## Implementation Rules

1. Add or update contract tests first when behavior matters.
2. Keep changes scoped.
3. Preserve existing functional API contracts.
4. Preserve English/Chinese localization.
5. Do not delete legacy routes unless explicitly approved.
6. If old route remains, remove it from main customer path or wrap it in Tianji Love shell.
7. Keep `Love Reading / Ask / Draw / Pricing / About / Login` as main navigation.
8. Primary CTA should lead to `/relationship/new`.

## Required QA

For UI changes:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run audit:copy
npm run audit:share
```

Run browser QA on affected routes.

## Stop Conditions

Stop if:

- fix requires payment/database/env changes
- route language cannot be verified
- browser QA finds old-brand leakage
- tests reveal unrelated high-risk failures
- user work would require reset/stash/revert
- secrets would be printed
- production Stripe/Supabase could be touched
- protected routes redirect to localhost
- mobile overflow appears

## Output

Write a task-specific report under:

```text
.ai/TIANJI_LOVE_UX_IMPLEMENTATION_YYYYMMDD.md
```

or a more specific name such as:

```text
.ai/TIANJI_LOVE_HOMEPAGE_RENDER_LOOP_FIX_YYYYMMDD.md
.ai/TIANJI_LOVE_AUXILIARY_ROUTES_CLEANUP_YYYYMMDD.md
```
