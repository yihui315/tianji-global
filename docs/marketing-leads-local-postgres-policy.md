# Marketing Leads Local PostgreSQL Policy

## Purpose

This document records the source-of-truth reconciliation after the production `marketing_leads` schema drift repair.

Production was repaired manually by Hermes through the approved B1-localized path. The repair used local PostgreSQL role `tianji_app`, not Supabase hosted role `service_role`, because the production local PostgreSQL cluster does not define `service_role`.

This source update is for future reproducibility only. It does not execute a production database mutation.

## Environment Difference

| Environment | Backend role | Expected policy |
|---|---|---|
| Supabase hosted | `service_role` | `"Service role can manage marketing leads"` |
| Tianji self-hosted local PostgreSQL | `tianji_app` | `"Backend app can manage marketing leads"` |

The original source migration now creates policies only when the target role exists. This prevents local PostgreSQL replays from failing when `service_role` is absent.

The follow-up migration `supabase/migrations/20260626_marketing_leads_local_pg_policy.sql` reconciles existing `marketing_leads` tables by adding the `tianji_app` policy when that role exists.

## Safety Properties

- The follow-up migration does not drop `public.marketing_leads`.
- The follow-up migration does not delete or update lead rows.
- The follow-up migration does not depend on `service_role`.
- If `tianji_app` does not exist, the follow-up migration records a notice and leaves existing policies unchanged.
- Row-level security remains enabled.

## Production State Already Reported

Hermes reported that production has already been repaired:

- Repair command surface: `sudo -u postgres psql -d tianji_global`.
- Transaction result: committed successfully.
- Row count before: `4`.
- Row count after: `5`, including one smoke test row.
- Original four leads preserved with `legacy_id` mappings `1-4`.
- API smoke: `POST /api/marketing/leads` returned `HTTP 201 Created` with `{"success":true}`.

## Gate Status

| Gate | Status |
|---|---|
| Source reconciliation | Go |
| Future local PostgreSQL replay | Go when `tianji_app` exists before migration execution |
| Production DB mutation by Codex | No-Go |
| Stripe/payment | No-Go |
| Revenue Execution | No-Go |
