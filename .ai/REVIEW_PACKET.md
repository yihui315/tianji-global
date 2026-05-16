# Brain Review Packet

## Task Goal

Complete Revenue Gate Phase 3: connect the Draw/Tarot revenue path to the TianJi model gateway and define the free vs paid/pro output boundary without running live payment/provider smoke.

## Decision Summary

```text
Draw gateway integration: Go
Draw paid smoke: No-Go
Draw revenue contract: Conditional Go
Ask revenue contract: Conditional Go
Production deploy: No-Go
```

## What Changed

- Created the Phase 3 task record and Draw/Tarot revenue flow review before code edits.
- Added `tarot_draw` as a gateway route with Ollama `gemma4:31b` default and DeepSeek Flash fallback.
- Extended deterministic safety rewrite coverage for Draw/Tarot certainty-risk and private-profile terms.
- Free Draw preview now returns a locked, useful limited reading, card summaries, preview text, and encrypted token.
- Free Draw no longer stores or returns a paid/pro full reading before checkout.
- Paid/pro Draw unlock verifies Stripe session status and `quick-draw` metadata before generation.
- Paid/pro Draw calls `generateTianjiModelResponse` with `tarot_draw` only after payment verification.
- Enhanced `/api/tarot` interpretations now route through `tarot_draw`.
- Added non-sensitive Draw/Tarot `aiMeta`.
- Added static `audit:draw-revenue-contract` script and package script.
- Updated gateway runbook, rollback docs, changelog, and evidence packet.

## Files Changed

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

## Commands Run

| Command | Result |
| --- | --- |
| `npm run test -- src/__tests__/api/draw-gateway.test.ts` before implementation | Failed as expected on missing Draw gateway contract fields |
| `npm run test -- src/__tests__/api/draw-gateway.test.ts` | Pass, 1 file / 3 tests |
| `npm run audit:draw-revenue-contract` initial | Pass, all fields `go`, overall `conditional-go` |
| `npm run typecheck` | Pass |
| `npm run test -- src/__tests__/api/paywall-preview-timeout.test.ts src/__tests__/api/paywall-preview-copy.test.ts src/__tests__/api/tarot.test.ts` first run | Failed on Chinese Draw preview head contract only |
| `npm run test -- src/__tests__/api/paywall-preview-timeout.test.ts src/__tests__/api/paywall-preview-copy.test.ts src/__tests__/api/tarot.test.ts` rerun | Pass, 3 files / 23 tests |
| `npm run lint` | Pass, no ESLint warnings or errors |
| `npm run test -- src/__tests__/api/draw-gateway.test.ts src/__tests__/lib/tianji-model-gateway.test.ts` | Pass, 2 files / 10 tests |
| `npm run test` | Pass, 55 files / 508 tests |
| `npm run build` | Pass, 106 static pages generated |
| `npm run audit:routes` | Pass |
| `npm run audit:copy` | Pass |
| `npm run audit:share` | Pass |
| `npm run audit:upgrade` | Pass |
| `npm run audit:ask-revenue-contract` | Pass, all fields `go`, overall `conditional-go` |
| `npm run audit:draw-revenue-contract` final | Pass, all fields `go`, overall `conditional-go` |
| `git diff --check` | Pass; LF/CRLF working-copy warnings only |

## Safety Notes

- No real `.env` values were read or printed.
- No real Stripe payment API call was made.
- No live DeepSeek, MiniMax, Ollama, or email smoke was run.
- No production database, production config, deployment setting, or secret was changed.
- MiniMax remains internal/non-public and is not a public production default.
- `aiMeta` excludes API keys, raw prompts, raw question text, provider request bodies, birth date/time/location, timezone, and full sensitive profiles.
- Existing unrelated dirty/untracked worktree files were preserved.

## Remaining Risks

1. Draw paid smoke is still No-Go because no Stripe test checkout/webhook smoke was run.
2. DeepSeek live smoke is still No-Go because provider keys/readiness were not supplied or approved.
3. MiniMax quota live check is still No-Go because no token-plan key was configured or used.
4. Draw paid/pro is source-contract ready but still not staging-smoke proven.
5. Production deploy remains No-Go until Phase 4 masked staging/live smoke evidence is explicitly approved and passed.

## Suggested Next Gate

Phase 4: Staging Live Smoke Readiness with masked env inventory, non-paid Ask smoke, non-paid Draw smoke, relationship analyze smoke, Stripe test checkout and webhook smoke, DeepSeek test-key live call, and MiniMax quota live check.

## Suggested Commit Message

```text
feat: connect draw route to tianji model gateway
```
