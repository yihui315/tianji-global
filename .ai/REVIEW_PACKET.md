# Marketing Leads Local PostgreSQL Policy Reconciliation - 2026-06-26

## Current Task

Create a minimal source PR so `marketing_leads` migrations remain compatible with both Supabase hosted `service_role` and self-hosted local PostgreSQL `tianji_app`.

## What Changed

- Reviewed `supabase/migrations/20260624_marketing_leads.sql`.
- Updated the original migration policy block to be role-aware instead of unconditionally targeting `service_role`.
- Added `supabase/migrations/20260626_marketing_leads_local_pg_policy.sql` as a follow-up migration for existing `marketing_leads` tables.
- Added `docs/marketing-leads-local-postgres-policy.md` documenting hosted Supabase versus local PostgreSQL policy roles.
- Added `src/__tests__/marketing-leads-migration-policy.test.ts` to lock the source contract.
- Added `.ai/TIANJI_LOVE_MARKETING_LEADS_LOCAL_PG_POLICY_RECONCILIATION_20260626.md`.

## Production Context

Hermes already repaired production through the approved B1-localized path. That production repair preserved the original four leads, added `legacy_id`, switched `id` to UUID, added `variant`, created the five indexes, enabled RLS, scoped the backend policy to `tianji_app`, and proved API smoke with `HTTP 201 Created`.

This PR does not perform another production DB mutation. It reconciles repository source-of-truth for future reproducibility.

## Review Focus

- Confirm the follow-up migration does not drop `public.marketing_leads`.
- Confirm it does not delete or update lead rows.
- Confirm it does not depend on `service_role`.
- Confirm local PostgreSQL receives the `tianji_app` backend policy when that role exists.
- Confirm hosted Supabase compatibility remains available when `service_role` exists.

## Gate Status

| Gate | Status |
|---|---|
| Source reconciliation | Go |
| Local PostgreSQL/tianji_app compatibility | Go |
| Supabase hosted/service_role compatibility | Go |
| Production DB mutation | No-Go |
| Revenue Execution | No-Go |
| Stripe/payment | No-Go |
| Deploy/server mutation | No-Go |
| Social auto-posting | No-Go |

## Validation

```text
npm run test -- src/__tests__/marketing-leads-migration-policy.test.ts
Passed: 1 file / 3 tests.

npm run typecheck -- --pretty false
Passed.

npm run lint
Passed. Next lint deprecation notice only.

npm run test
Passed: 83 files / 638 tests.

npm run build:staging:degraded
Passed. Existing jose Edge Runtime warnings only.

git diff --check
Passed with LF/CRLF warnings only.

Targeted changed-file secret-shape scan
Passed: 0 hits across 8 changed files. No .env* files were read.
```

## Safety Boundary

No `.env*` file was read, printed, copied, uploaded, or modified. No production DB mutation, production deploy, Stripe/payment action, webhook replay, PM2/Nginx/certbot/server mutation, or social auto-posting was performed.

---

# TianJi Love Revenue OS v1 Final Review Packet

## Current Task

Close the source-only seven-day TianJi Love Revenue OS v1 loop on draft PR #114 and provide the final gate report. Revenue execution remains closed.

## Summary

- Added `.ai/TIANJI_LOVE_REVENUE_OS_V1_FINAL_GATE_REPORT_20260630.md`.
- Confirmed seven daily queues, publishing packs, review checklists, KPI scaffolds, and no-real-data growth reports exist for 2026-06-24 through 2026-06-30.
- Confirmed source-side lead capture readiness, email templates, growth event contract, CTA/source funnel work, and Stripe test-mode approval packet are present.
- Latest PR #114 observed head before this final report: `4f924e04142433730b5622467a8bd3c72c2742bf`.
- Latest observed GitHub Actions Build & Test: pass. External Vercel remains canceled/failing but Not Applicable because this project deploys to a cloud server.

## Latest Local Validation

```text
npm run typecheck -- --pretty false
Passed.

npm run lint
Passed.

npm run test
Passed: 82 files / 635 tests.

npm run build:staging:degraded
Passed.

git diff --check
Passed with LF/CRLF warnings only.

Targeted changed-file secret-shape scan
Passed: 0 hits; .env* files were not read.
```

## Safety Boundaries

```text
No .env or .env.* file was read, printed, copied, uploaded, or modified.
No raw secret was printed.
No production deploy was performed.
No Stripe test/live paid smoke or real payment was performed.
No webhook replay was performed.
No Supabase production mutation was performed.
No PM2/Nginx/certbot/server mutation was performed.
No social account auto-posting was performed.
No fake testimonials, fake user numbers, fake revenue, fake conversion rates, guaranteed relationship outcomes, or 100% accuracy claims were added.
```

## Gate Status

| Gate | Status |
|---|---|
| Source/Test Gate | Go |
| PR #114 Build & Test | Go at observed head `4f924e0`; rerun expected after this docs-only final report commit |
| Vercel | Not Applicable |
| PR review | Required |
| Draft status | Draft |
| Lead Capture Source | Go |
| Marketing Leads Migration | Source Go; production execution pending human approval |
| Lead Capture Production DB Write | No-Go until migration is human-applied |
| Daily Marketing Queues | Go for manual review only |
| Daily Growth Reports | Go; no fabricated metrics |
| Email Funnel Templates | Go for templates only |
| CTA Improvement PR | Go |
| Stripe Test-mode Gate | Pending Human Approval |
| Stripe Live Gate | No-Go |
| Revenue Execution | No-Go |
| Supabase production mutation | No-Go |
| Production deploy/server mutation | No-Go |
| Social auto-posting | No-Go |

## Suggested Commit Message

```text
docs(ai): add revenue os v1 final gate report
```
