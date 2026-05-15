---
name: supabase-rls-migration-builder
description: Build Tianji Supabase schema migrations and RLS policies. Use for reading_sessions, reports, relationship data, consent records, deletion requests, public shares, and policy tests.
---

# Supabase RLS Migration Builder

## Purpose

Protect user-owned data with explicit schema and row-level security.

## When to use

Use for database migrations, RLS policies, privacy tables, report storage, sharing, consent, and deletion flows.

## Inputs

- `supabase/**`
- Database access helpers
- Auth model
- Share payload code
- Tests and seed data

## Actions

1. Define schema and RLS expectations before editing migrations.
2. Ensure users can read/write only their own private data.
3. Ensure public share access is explicit and scoped.
4. Add rollback notes for migrations.
5. Add policy tests or clear manual verification steps.

## Constraints

- Do not disable RLS to make tests pass.
- Do not expose birth data in public share payloads.
- Do not add broad admin access without explicit role checks.
- Do not run production migrations from Codex without explicit approval.

## Definition of Done

- Migration and RLS policies are explicit.
- Rollback or mitigation notes are included.
- Tests or verification steps cover private and public access paths.

## Validation

- Migration dry-run or local Supabase verification when available.
- `npm run test`
- `npm run audit:share`
