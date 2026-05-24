# TianJi Love Divination Evidence Layer - Review Packet

## What changed

Implemented a safe evidence and accuracy-feeling layer across Ask, Draw, and Relationship.

- Ask preview and paid unlock now return structured evidence.
- Draw preview and paid unlock now return structured tarot/timing evidence.
- Relationship readings now attach or derive structured evidence from score, dimensions, summary, and timeline.
- Added shared evidence UI with confidence, signals, timing, verification points, action advice, feedback, and paid unlock CTA.
- Added privacy-safe analytics events for evidence viewed, expanded, feedback submitted, and unlock clicked from evidence.

## Files changed

```text
.ai/CHANGELOG_AI.md
.ai/REVIEW_PACKET.md
.ai/TIANJI_LOVE_DIVINATION_EVIDENCE_LAYER_20260525.md
.ai/TIANJI_LOVE_SKILL_MATCH_MATRIX_20260525.md
src/__tests__/api/ask-paid-gateway.test.ts
src/__tests__/api/draw-gateway.test.ts
src/__tests__/lib/divination-evidence.test.ts
src/__tests__/relationship-flow-contract.test.ts
src/__tests__/revenue-funnel-polish-contract.test.ts
src/app/(main)/ask/page.tsx
src/app/(main)/draw/page.tsx
src/app/api/analytics/track/route.ts
src/app/api/ask/preview/route.ts
src/app/api/ask/unlock/route.ts
src/app/api/draw/preview/route.ts
src/app/api/draw/unlock/route.ts
src/app/api/relationship/analyze/route.ts
src/app/relationship/result/[id]/page.tsx
src/components/divination/DivinationEvidenceCard.tsx
src/components/relationship/RelationshipResult.tsx
src/lib/analytics/client.ts
src/lib/analytics/divination-events.ts
src/lib/divination/evidence.ts
src/lib/relationship-engine.ts
src/lib/trust-copy-guard.ts
src/types/divination.ts
src/types/relationship.ts
```

## Safety review

- No secrets, env files, private keys, tokens, cookies, or production logs were read or staged.
- No production deploy, server mutation, DNS, Nginx, PM2, live DB mutation, live Stripe payment, or paid smoke was performed.
- Analytics payloads are restricted to safe fields: `route`, `paid`, `confidence`, `evidenceSignalCount`, `sourceTypes`, and optional feedback.
- Evidence builders redact private values and deterministic/professional/fear-based claims.
- The feature is additive and does not remove existing divination safety disclaimers.

## Validation

```text
npm run test -- --run src/__tests__/lib/divination-evidence.test.ts
Pass: 1 file, 7 tests.

npm run test -- --run src/__tests__/lib/divination-evidence.test.ts src/__tests__/api/ask-paid-gateway.test.ts src/__tests__/api/draw-gateway.test.ts src/__tests__/relationship-flow-contract.test.ts src/__tests__/revenue-funnel-polish-contract.test.ts
Pass: 5 files, 41 tests.

npm run typecheck
Pass.

npm run lint
Pass.

npm run test
Pass: 74 files, 595 tests.

npm run build
Pass with existing jose Edge Runtime warnings.

npm run audit:routes
Pass.

npm run audit:copy
Pass.

npm run audit:share
Pass.

npm run audit:upgrade
Pass.

npm run audit:ask-revenue-contract
Conditional Go.

npm run audit:draw-revenue-contract
Conditional Go.

git diff --check
Pass with existing CRLF warnings only.

Chrome headless local route QA
Pass: /ask?lang=en, /draw?lang=en, /relationship/new?lang=en.
```

## Gate status

| Gate | Status |
|---|---|
| Skill matching | Go |
| Implementation | Go |
| Typecheck | Go |
| Lint | Go |
| Tests | Go |
| Build | Go |
| Non-paid local QA | Go |
| Paid smoke | No-Go unless explicitly tested in safe Stripe test mode |
| Production deploy | No-Go |

## Reviewer focus

- Confirm free preview depth is compelling but not over-generous.
- Confirm the evidence card CTA is not too aggressive for relationship/divination safety.
- Confirm analytics payloads remain non-sensitive if future builders add fields.
- Confirm Relationship full unlock should show more evidence after an approved paid smoke.

## Suggested commit message

```text
feat(tianji-love): add divination evidence layer
```
