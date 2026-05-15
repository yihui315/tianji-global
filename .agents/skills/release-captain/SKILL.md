---
name: release-captain
description: Run Tianji release readiness. Use before merge or deployment to check CI, preview, Stripe test payment, Supabase migration status, RLS, privacy pages, sitemap, hreflang, mobile QA, rollback plan, and go/no-go.
---

# Release Captain

## Purpose

Provide a final release readiness decision with risks and rollback plan.

## When to use

Use before merging high-impact PRs, before production deploys, and after coordinated release branches.

## Inputs

- Current diff
- CI status
- Vercel preview
- Release notes
- Migration notes
- Billing/privacy changes
- QA results

## Actions

1. Verify CI and release checks are green.
2. Check preview routes and mobile critical paths.
3. Verify billing, migration, privacy, and SEO readiness when relevant.
4. Write known issues and rollback plan.
5. Give a go/no-go recommendation.

## Constraints

- Do not deploy production without explicit approval.
- Do not run production migrations from Codex without explicit approval.
- Do not ignore failed validation.

## Definition of Done

- Release note is written.
- Risk list and rollback plan are included.
- Go/no-go recommendation is justified.

## Validation

- `npm run release:check`
- Preview QA
- Targeted smoke checks for changed areas.
