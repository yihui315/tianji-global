---
name: async-report-job-builder
description: Build asynchronous Tianji report generation jobs. Use for queued AI reports, report_jobs, retries, idempotency, status polling, payment-safe generation, and avoiding duplicate charges or long waits.
---

# Async Report Job Builder

## Purpose

Move long AI report generation into reliable asynchronous jobs.

## When to use

Use when report generation blocks the user, repeats charges, times out, or needs retry/status behavior.

## Inputs

- Report generation routes
- AI provider code
- Billing and entitlement code
- Database schema and migrations
- Existing tests

## Actions

1. Define job states and idempotency keys before implementation.
2. Separate payment entitlement from report generation.
3. Add retry and failure visibility.
4. Avoid duplicate charges and duplicate report generation.
5. Add tests for job state transitions.

## Constraints

- Do not add queue infrastructure without Brain approval.
- Do not change payment semantics without billing review.
- Do not store private data in logs.

## Definition of Done

- Jobs are idempotent and observable.
- Users can see pending, complete, and failed states.
- Payment and generation are not coupled to frontend redirects.

## Validation

- `npm run test`
- `npm run typecheck`
- Targeted API tests.
