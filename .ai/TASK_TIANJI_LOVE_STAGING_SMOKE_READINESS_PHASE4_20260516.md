# TianJi Love Phase 4 - Staging Live Smoke Readiness

## Current state

Phase 1 complete:
- TianJi mixed model gateway exists.
- Relationship analyze uses gateway safety layer.
- Fallback execution works.
- Non-sensitive aiMeta exists.
- MiniMax quota gate exists.

Phase 2 complete:
- Ask unpaid preview returns locked preview only.
- Ask paid unlock uses paid_ask route through TianJi model gateway.
- Paid Ask defaults to DeepSeek Flash.
- Fallback supports DeepSeek Pro / Ollama.
- Ask safety rewrite and non-sensitive aiMeta exist.
- Ask revenue contract audit passes locally as conditional-go.

Phase 3 complete:
- Draw/Tarot uses tarot_draw through TianJi model gateway.
- Free Draw returns locked limited reading.
- Paid/pro Draw generates full reading only after Stripe session verification.
- Tarot enhanced readings pass gateway safety rewrite and return safe aiMeta.
- Draw revenue contract audit passes locally as conditional-go.
- Commit: edff8f0 feat: connect draw route to tianji model gateway.

Do not redo Phase 1, Phase 2, or Phase 3.

## Phase 4 objective

Prepare and verify staging live smoke readiness without touching production.

This phase creates a controlled staging smoke gate for masked env inventory, non-paid smoke, Stripe test readiness, provider readiness, rollback, evidence, and Go/No-Go standards.

## Constraints

- Do not read or print real secrets.
- Do not print `.env` values.
- Do not modify production database.
- Do not call live Stripe payment APIs unless explicitly approved with test mode only.
- Do not send real emails.
- Do not deploy production.
- Do not mutate production Supabase.
- Do not use production Stripe keys or webhook secrets.
- Do not expose birthDate, birthTime, birthLocation, timezone, raw user question, or raw provider prompt in logs.
- Do not make MiniMax public production default.
- Keep all checks evidence-based and reversible.

## Implementation scope

- Clean worktree review and `tsconfig.tsbuildinfo` validation artifact handling.
- `scripts/audit-staging-env-readiness.ts`
- `scripts/smoke-staging-nonpaid.ts`
- `scripts/smoke-ai-providers.ts`
- `scripts/smoke-stripe-test-readiness.ts`
- `scripts/audit-staging-launch-gate.ts`
- Package scripts for the new readiness/smoke gates.
- Staging smoke runbook and evidence docs.
- Updates to README, gateway runbook, rollback, changelog, and review packet.

## Expected decision without live keys

```text
Staging env readiness: Conditional Go or No-Go
Ask revenue contract: Conditional Go
Draw revenue contract: Conditional Go
AI provider smoke: Conditional Go, dry-run only
Stripe test readiness: Conditional Go, readiness-only
Non-paid staging smoke: Not-run unless STAGING_BASE_URL exists
Paid smoke: No-Go
Production deploy: No-Go
```
