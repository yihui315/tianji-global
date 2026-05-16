# TianJi Love Draw Gateway Evidence - 2026-05-16

## 1. What changed

- Added the `tarot_draw` TianJi model gateway route for Draw/Tarot with Ollama `gemma4:31b` as default and DeepSeek Flash fallback.
- Wired `/api/draw/preview` to return a locked, limited free three-card reading with local fallback preserved.
- Changed `/api/draw/preview` so it stores only card/question context in the unlock token, not a paid/pro full reading.
- Wired `/api/draw/unlock` to generate paid/pro Draw readings only after Stripe session verification.
- Routed enhanced `/api/tarot` interpretations through `tarot_draw`.
- Added non-sensitive Draw/Tarot `aiMeta` and deterministic certainty-risk safety rewrite coverage.
- Added a static Draw revenue contract audit.

## 2. Files changed

- `.ai/TASK_TIANJI_LOVE_REVENUE_GATE_PHASE3_DRAW_20260516.md`
- `.ai/TIANJI_LOVE_DRAW_REVENUE_FLOW_REVIEW_20260516.md`
- `.ai/TIANJI_LOVE_DRAW_GATEWAY_EVIDENCE_20260516.md`
- `.ai/CHANGELOG_AI.md`
- `.ai/REVIEW_PACKET.md`
- `docs/tianji-love-model-gateway-runbook.md`
- `docs/tianji-love-model-gateway-rollback.md`
- `package.json`
- `scripts/audit-draw-revenue-contract.ts`
- `src/__tests__/api/draw-gateway.test.ts`
- `src/app/api/draw/preview/route.ts`
- `src/app/api/draw/unlock/route.ts`
- `src/app/api/tarot/route.ts`
- `src/lib/quick-draw.ts`
- `src/lib/tianji-model-gateway.ts`

## 3. Commands run

- `npm run test -- src/__tests__/api/draw-gateway.test.ts` before implementation: failed as expected on missing Draw gateway contract fields.
- `npm run test -- src/__tests__/api/draw-gateway.test.ts`: passed.
- `npm run audit:draw-revenue-contract`: passed with all contract fields `go`, overall `conditional-go`.
- `npm run typecheck`: passed.
- `npm run test -- src/__tests__/api/paywall-preview-timeout.test.ts src/__tests__/api/paywall-preview-copy.test.ts src/__tests__/api/tarot.test.ts`: first run found the Chinese Draw preview head regression; second run passed after the copy fix.
- `npm run lint`: passed.
- `npm run test -- src/__tests__/api/draw-gateway.test.ts src/__tests__/lib/tianji-model-gateway.test.ts`: passed, 2 files / 10 tests.
- `npm run test`: passed, 55 files / 508 tests.
- `npm run build`: passed, 106 static pages generated.
- `npm run audit:routes`: passed.
- `npm run audit:copy`: passed.
- `npm run audit:share`: passed.
- `npm run audit:upgrade`: passed.
- `npm run audit:ask-revenue-contract`: passed with overall `conditional-go`.
- `npm run audit:draw-revenue-contract`: passed with overall `conditional-go`.
- `git diff --check`: passed with LF/CRLF working-copy warnings only.

## 4. Tests added

- `src/__tests__/api/draw-gateway.test.ts`
  - Free Draw locked/limited behavior and `tarot_draw` route use.
  - Paid/pro Draw generation after payment verification.
  - Non-sensitive `aiMeta`.
  - Deterministic safety rewrite for guaranteed/fear-based claims.
  - Enhanced Tarot API safety/gateway routing.

## 5. Draw free behavior

Free Draw returns three cards, a limited `reading`, a short `preview`, `locked: true`, card summaries, and an encrypted unlock token. It does not return a paid/pro `fullReading`. If the gateway times out or fails, the existing local fallback preview still returns.

## 6. Draw paid/pro behavior

Paid/pro Draw verifies Stripe session status and `quick-draw` metadata before generation. Only after that verification does it call `tarot_draw` and return the deeper relationship-specific reading with `locked: false`, `fullReading`, card summaries, and `aiMeta`.

## 7. aiMeta privacy check

Draw/Tarot `aiMeta` includes only provider, model, fallbackUsed, safetyRewritten, latencyMs, and route. It does not include API keys, raw prompt, raw question text, birthDate, birthTime, birthLocation, timezone, or provider request bodies.

## 8. Live provider call status

No live DeepSeek, MiniMax, Ollama, or external AI provider smoke was run. Provider behavior was tested with mocks/static contracts only.

## 9. Payment smoke status

No real Stripe payment, Stripe test checkout, webhook smoke, production database mutation, email send, or deploy was run.

## 10. Launch gate decision

```text
Draw gateway integration: Go
Draw paid smoke: No-Go
Draw revenue contract: Conditional Go
Ask revenue contract: Conditional Go
Production deploy: No-Go
```
