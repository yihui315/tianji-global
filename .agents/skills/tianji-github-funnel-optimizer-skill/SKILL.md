---
name: tianji-github-funnel-optimizer-skill
description: Optimize TianJi Love /love-test and /ask funnel copy when KPI evidence shows weak conversion. Use for safe copy-only improvements to hero text, CTA text, paid-intent explanations, share-card captions, and tracking names with strict revenue and production guardrails.
---

# TianJi GitHub Funnel Optimizer Skill

## Purpose

Improve `/love-test` and `/ask` funnel copy only when KPI evidence shows weak conversion, while preserving Stripe, Supabase, provider, and production safety gates.

## Allowed Actions

Allowed files:

```text
src/app/(main)/love-test/page.tsx
src/app/(main)/ask/page.tsx
src/lib/love-test.ts
assets/love-test-copywriting.md
data/love-test-event-tracking.csv
data/love-test-kpi-tracking.csv
```

Allowed changes:

- CTA text.
- Hero copy.
- Paid-intent explanation copy.
- Share-card captions.
- Safe tracking names and docs.

## Forbidden Actions

- Do not execute Stripe, checkout, paid smoke, webhook replay, or billing actions.
- Do not bypass checkout, entitlement, auth, paywall, or price gates.
- Do not mutate Supabase or database state.
- Do not call live AI providers.
- Do not deploy production or mutate server state.
- Do not read, print, copy, diff, or infer `.env` files or secrets.
- Do not change files outside the allowed list without explicit approval.

## Inputs

- KPI analysis showing weak conversion.
- Existing funnel copy and tracking docs.
- Current tests for paid gateway, love-test MVP, revenue funnel polish, and share-card contracts.
- Current gate status from `.ai` evidence or user instructions.

## Outputs

- Minimal copy/tracking changes in allowed files only.
- `.ai/CHANGELOG_AI.md`.
- `.ai/REVIEW_PACKET.md`.
- Clear validation result and gate status.

## Workflow

1. Confirm KPI evidence and the exact weak funnel step.
2. Inspect the allowed files before editing.
3. Make the smallest copy-only change that addresses the weak step.
4. Preserve disclaimers, trust copy, pricing paths, paid-intent clarity, and privacy safeguards.
5. Run the required validation commands for source changes.
6. If validation fails, repair only within the allowed scope or stop and report the blocker.
7. Record the change, commands, gate status, and residual risks.

## Validation Commands

For source changes, run:

```bash
npm run test -- --run src/__tests__/api/ask-paid-gateway.test.ts src/__tests__/love-test-mvp-contract.test.ts src/__tests__/revenue-funnel-polish-contract.test.ts src/__tests__/relationship-share-card-contract.test.ts
npm run typecheck
npm run lint
npm run audit:routes
npm run audit:share
npm run build:staging:degraded
git diff --check
```

If `build:staging:degraded` is not available on the current branch, report that command as skipped and run the available closest safe build or audit command.

Run a targeted secret-shape scan over changed files and `.ai` records.

## Commit Rules

- Commit only the allowed funnel files and AI records changed by this skill.
- Use explicit path staging when unrelated changes exist.
- Suggested commit shape: `fix(marketing): optimize love-test funnel copy`.
- Do not include billing, provider, database, auth, deployment, workflow, env, or unrelated source changes.

## Gate Status Format

```text
Funnel copy optimization: Go | Not run
KPI evidence: Go | No-Go - missing real weak-conversion signal
Stripe checkout logic: Not changed
Supabase mutation: Not changed
Provider live call: Not run
Paid smoke: No-Go - awaiting explicit approval
Production deploy: No-Go
```
