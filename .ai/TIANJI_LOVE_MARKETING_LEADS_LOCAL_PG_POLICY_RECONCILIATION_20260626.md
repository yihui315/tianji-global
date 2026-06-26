# TianJi Love Marketing Leads Local PostgreSQL Policy Reconciliation - 2026-06-26

## Scope

Create a source-only PR that reconciles `marketing_leads` migration policy source with the actual self-hosted local PostgreSQL production role model.

This task did not execute a production database mutation, did not read `.env*`, did not deploy, did not run Stripe/payment, did not replay webhooks, and did not auto-post to social platforms.

## Background

Hermes already completed the production schema drift repair through the B1-localized path:

- Production command surface: `sudo -u postgres psql -d tianji_global`.
- Transaction mode: one atomic transaction.
- Row count before: `4`.
- Row count after: `5`, including one smoke test row.
- Original four real leads preserved with `legacy_id` mappings `1-4`.
- Live write smoke returned `HTTP 201 Created` with `{"success":true}`.

The repository migration still used a Supabase hosted `service_role` policy. The self-hosted local PostgreSQL production cluster uses `tianji_app` and does not define `service_role`.

## Source Changes

- Updated `supabase/migrations/20260624_marketing_leads.sql` so policy creation is role-aware:
  - Creates hosted `service_role` policy only if the role exists.
  - Creates local PostgreSQL `tianji_app` policy only if the role exists.
  - Does not fail when neither backend role exists; it raises a notice.
- Added `supabase/migrations/20260626_marketing_leads_local_pg_policy.sql` as a no-data-loss follow-up migration:
  - Checks that `public.marketing_leads` exists.
  - Enables RLS.
  - Adds `"Backend app can manage marketing leads"` for `tianji_app` if the role exists.
  - Does not depend on `service_role`.
  - Does not drop the table.
  - Does not delete or update rows.
- Added `docs/marketing-leads-local-postgres-policy.md` to document Supabase hosted versus local PostgreSQL backend-role differences.
- Added `src/__tests__/marketing-leads-migration-policy.test.ts` to lock the migration and docs contract.

## Gate Table

| Gate | Status |
|---|---|
| Source reconciliation | Go |
| Local PostgreSQL/tianji_app compatibility | Go |
| Supabase hosted/service_role compatibility | Go |
| Production DB mutation by Codex | No-Go |
| Stripe/payment | No-Go |
| Revenue Execution | No-Go |
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

## Notes

- The new follow-up migration is for source reconciliation and future reproducibility.
- Production has already been repaired manually by Hermes; this PR does not require or authorize re-running production SQL.
- If a fresh local PostgreSQL database is migrated, create the `tianji_app` backend role before applying migrations to receive the local app policy.
