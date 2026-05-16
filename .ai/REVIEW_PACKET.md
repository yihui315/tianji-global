# Brain Review Packet

## Task Goal

Complete Revenue Gate Phase 2: connect the Ask pay-per-question paid path to the TianJi model gateway without breaking unpaid gating, and prepare local staged-smoke readiness evidence.

## Decision Summary

```text
Ask gateway integration: Go
Ask paid smoke: No-Go
Ask revenue contract: Conditional Go
Production deploy: No-Go
```

## What Changed

- Created the Phase 2 task record and Ask revenue flow review before code edits.
- Ask preview now returns a locked local teaser and encrypted question token only.
- Ask preview no longer generates or stores the full paid answer before payment.
- Unpaid Ask responses return `locked=true`, `answer=null`, and no provider/model metadata.
- Paid Ask unlock verifies Stripe session status and `ask-question` metadata before generation.
- Paid Ask generation now calls `generateTianjiModelResponse` with intent `paid_ask`.
- Gateway route table now includes `paid_ask`, `ask_preview`, and `safety_rewrite`.
- Paid Ask public output receives deterministic certainty-risk/fear-urgency safety rewrite.
- Paid Ask response returns non-sensitive `aiMeta` with provider, model, fallback, safety, latency, and route only.
- Added a static `audit:ask-revenue-contract` script and package script.
- Updated gateway runbook, rollback docs, changelog, and evidence packet.

## Files Changed

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

## Commands Run

| Command | Result |
| --- | --- |
| `npm run test -- src/__tests__/api/ask-paid-gateway.test.ts` before implementation | Failed as expected on missing Ask paid/unpaid gateway fields |
| `npm run test -- src/__tests__/api/ask-paid-gateway.test.ts src/__tests__/api/paywall-preview-timeout.test.ts src/__tests__/api/paywall-preview-copy.test.ts src/__tests__/lib/paywall-chinese-copy.test.ts` | Pass, 4 files / 10 tests |
| `npm run audit:ask-revenue-contract` | Pass, all fields `go`, overall `conditional-go` |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass, no ESLint warnings or errors |
| `npm run test -- src/__tests__/api/ask-paid-gateway.test.ts src/__tests__/lib/tianji-model-gateway.test.ts` | Pass, 2 files / 9 tests |
| `npm run test` | Pass, 54 files / 505 tests |
| `npm run build` | Pass, 106 static pages generated |
| `npm run audit:routes` | Pass |
| `npm run audit:copy` | Pass |
| `npm run audit:share` | Pass |
| `npm run audit:upgrade` | Pass |
| `npm run audit:ask-revenue-contract` final run | Pass, all fields `go`, overall `conditional-go` |
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

1. Stripe Ask paid smoke is still No-Go because no test-mode checkout/webhook smoke was run.
2. DeepSeek live smoke is still No-Go because provider keys/readiness were not supplied or approved.
3. Draw paid route remains Unknown and should be mapped separately.
4. Ask webhook handling is contract-present through the existing Stripe webhook route, but Ask paid unlock currently relies on redirect/session verification rather than webhook-created entitlement storage.
5. Production deploy remains No-Go until masked staging evidence and staged paid smoke are explicitly approved.

## Suggested Next Gate

Collect masked staging/test evidence for Stripe key mode, webhook endpoint, app origin, DeepSeek provider readiness, and local/Ollama fallback readiness. Then run a staged Ask paid smoke only after explicit approval.

## Suggested Commit Message

```text
feat: connect ask paid route to tianji model gateway
```
