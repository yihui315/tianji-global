# Marketing Leads Migration Preflight - 2026-06-24

## Scope

Source review only. No production Supabase mutation was performed by Codex.

## Reviewed File

`supabase/migrations/20260624_marketing_leads.sql`

## Review Result

- Creates `public.marketing_leads` if missing.
- Adds required lead capture fields: `email`, `name`, `source_page`, `locale`, `variant`, UTM fields, consent metadata, `status`, `ip_hash`, `user_agent`, timestamps.
- Enables row level security.
- Grants access only through a service-role policy.
- Uses `if not exists` for table and indexes, making repeat attempts lower risk.

## Production Execution Command

Pending human approval only. Do not run from Codex in this task.

```bash
psql "$DATABASE_URL" -f supabase/migrations/20260624_marketing_leads.sql
```

Alternative if the approved Supabase CLI project link is already configured by a human operator:

```bash
supabase db push
```

## Required Human Checks Before Execution

- Confirm target is the intended production Supabase/Postgres project.
- Confirm a current backup or PITR recovery window exists.
- Confirm operator has reviewed the SQL.
- Confirm service role access pattern is intended.
- Confirm no raw secrets are pasted into chat, docs, PR comments, or logs.

## Rollback Plan

Pending human approval only. If no real leads have been collected and rollback is approved:

```sql
begin;
drop policy if exists "Service role can manage marketing leads" on public.marketing_leads;
drop table if exists public.marketing_leads;
commit;
```

If real leads exist, do not drop the table until a human operator exports or archives the records according to the privacy/data retention policy.

## Gate Status

- Migration source readiness: Go.
- Supabase production execution: No-Go, pending human approval.
- Lead capture production verification: No-Go until migration is applied and smoke is explicitly approved.
