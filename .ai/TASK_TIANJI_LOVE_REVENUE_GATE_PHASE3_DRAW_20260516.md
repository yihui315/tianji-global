# TianJi Love Revenue Gate Phase 3 - Draw / Tarot Gateway + Paid Boundary

## Current state

Phase 1 complete:

- TianJi mixed model gateway exists.
- Relationship analyze route uses gateway safety layer.
- Fallback execution works.
- Non-sensitive aiMeta exists.
- MiniMax quota gate exists.

Phase 2 complete:

- Ask unpaid preview returns locked preview only.
- Ask paid unlock uses paid_ask route through TianJi model gateway.
- Paid Ask defaults to DeepSeek Flash, fallback to DeepSeek Pro / Ollama.
- Ask answer passes safety rewrite.
- Ask aiMeta is non-sensitive.
- Ask revenue contract audit exists and passes locally as conditional-go.
- No live Stripe / DeepSeek / MiniMax / production deploy was run.

Do not redo Phase 1 or Phase 2.

## Phase 3 objective

Connect Draw / Tarot revenue path to TianJi model gateway and define free vs paid/pro output boundaries.

Draw / Tarot should become a low-friction conversion entry:

- Free user gets useful but limited three-card interpretation.
- Paid/pro user gets deeper relationship-specific interpretation.
- Output must never claim guaranteed future prediction.
- Output must pass safety rewrite.
- Response must include non-sensitive aiMeta when model is called.
- No real Stripe payment.
- No live provider call.
- No production deploy.

## Strict constraints

- Do not read or print real .env secrets.
- Do not modify production database.
- Do not call real Stripe APIs.
- Do not run paid smoke.
- Do not deploy.
- Do not send real emails.
- Do not hardcode API keys.
- Do not expose birthDate, birthTime, birthLocation, timezone, raw question, or full relationship profile in logs.
- Do not make MiniMax a public production default.
- Keep changes small and test-driven.

## Required steps

1. Inspect current Draw / Tarot flow before editing.
2. Write `.ai/TIANJI_LOVE_DRAW_REVENUE_FLOW_REVIEW_20260516.md` before code edits.
3. Add RED tests in `src/__tests__/api/draw-gateway.test.ts`.
4. Connect Draw / Tarot output to gateway route `tarot_draw`.
5. Define free vs paid/pro output boundaries without adding a new payment product unless one already exists.
6. Add `scripts/audit-draw-revenue-contract.ts` and package script `audit:draw-revenue-contract`.
7. Update runbook, rollback, changelog, review packet, and evidence.
8. Run the full requested verification set.

## Expected decision after Phase 3

```text
Draw gateway integration: Go
Draw paid smoke: No-Go
Draw revenue contract: Conditional Go
Ask revenue contract: Conditional Go
Production deploy: No-Go
```

Suggested commit message:

```text
feat: connect draw route to tianji model gateway
```
