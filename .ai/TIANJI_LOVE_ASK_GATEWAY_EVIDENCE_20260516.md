# TianJi Love Ask Gateway Evidence - 2026-05-16

## 1. What changed

- Ask preview now returns a locked local teaser only.
- Ask preview token carries the question and an empty `fullAnswer`; the paid answer is generated after Stripe session verification.
- Paid Ask unlock now calls `generateTianjiModelResponse` with intent `paid_ask`.
- Gateway routes now include `paid_ask`, `ask_preview`, and `safety_rewrite`.
- Public paid Ask output passes the gateway deterministic safety rewrite before response.
- Paid Ask response includes non-sensitive `aiMeta`.
- Added a static Ask revenue contract audit.

## 2. Files changed

- `.ai/TASK_TIANJI_LOVE_REVENUE_GATE_PHASE2_20260516.md`
- `.ai/TIANJI_LOVE_ASK_REVENUE_FLOW_REVIEW_20260516.md`
- `.ai/TIANJI_LOVE_ASK_GATEWAY_EVIDENCE_20260516.md`
- `.ai/CHANGELOG_AI.md`
- `.ai/REVIEW_PACKET.md`
- `.env.example`
- `package.json`
- `docs/tianji-love-model-gateway-runbook.md`
- `docs/tianji-love-model-gateway-rollback.md`
- `scripts/audit-ask-revenue-contract.ts`
- `src/app/api/ask/preview/route.ts`
- `src/app/api/ask/unlock/route.ts`
- `src/lib/ask-question.ts`
- `src/lib/tianji-model-gateway.ts`
- `src/__tests__/api/ask-paid-gateway.test.ts`
- `src/__tests__/api/paywall-preview-timeout.test.ts`

## 3. Commands run

- RED: `npm run test -- src/__tests__/api/ask-paid-gateway.test.ts` failed as expected before implementation because unpaid/paid Ask gateway fields were missing.
- `npm run test -- src/__tests__/api/ask-paid-gateway.test.ts src/__tests__/api/paywall-preview-timeout.test.ts src/__tests__/api/paywall-preview-copy.test.ts src/__tests__/lib/paywall-chinese-copy.test.ts`
- `npm run audit:ask-revenue-contract`
- `npm run typecheck`
- `npm run lint`
- `npm run test -- src/__tests__/api/ask-paid-gateway.test.ts src/__tests__/lib/tianji-model-gateway.test.ts`
- `npm run test`
- `npm run build`
- `npm run audit:routes`
- `npm run audit:copy`
- `npm run audit:share`
- `npm run audit:upgrade`
- `npm run audit:ask-revenue-contract`
- `git diff --check`

## 4. Tests added

- `src/__tests__/api/ask-paid-gateway.test.ts`
  - unpaid Ask returns `locked=true`
  - unpaid Ask returns `answer=null`
  - unpaid Ask does not return `fullAnswer`
  - unpaid Ask does not call the AI generation path
  - unpaid Ask does not expose provider/model metadata
  - paid Ask calls DeepSeek Flash through the gateway
  - paid Ask returns `locked=false`, `answer`, `fullAnswer`, and `aiMeta`
  - paid Ask rewrites certainty/fear-based phrases
  - paid Ask `aiMeta` excludes raw prompt/question and sensitive fields

## 5. Ask unpaid behavior

Unpaid Ask users receive only:

- encrypted question token
- local teaser preview
- `locked=true`
- `answer=null`
- price display
- non-provider local preview metadata

They do not receive a full answer, provider, model, raw provider metadata, or `aiMeta`.

## 6. Ask paid behavior

Paid/unlocked Ask requests must pass:

- Stripe session retrieval
- paid/complete status check
- `metadata.flow === 'ask-question'`
- valid encrypted question token decode

Only then the route calls `paid_ask` through the TianJi model gateway. The default route is `deepseek/deepseek-v4-flash`, with fallback to `deepseek/deepseek-v4-pro` then `ollama/gemma4:31b`.

## 7. aiMeta privacy check

Returned `aiMeta` contains only:

- provider
- model
- fallbackUsed
- safetyRewritten
- latencyMs
- route

It does not contain API keys, provider request bodies, raw prompts, raw question text, birth date/time/location, timezone, or full relationship profile data.

## 8. Stripe live call status

Not run. Stripe checks were mocked in tests and static in `audit:ask-revenue-contract`.

## 9. DeepSeek live call status

Not run. DeepSeek was mocked through `generateReport` in route tests. No live provider smoke was executed.

## 10. Launch gate decision

```text
Ask gateway integration: Go
Ask paid smoke: No-Go
Ask revenue contract: Conditional Go
Production deploy: No-Go
```

Local verification passed, but live Stripe/DeepSeek smoke and production deploy were intentionally not run.
