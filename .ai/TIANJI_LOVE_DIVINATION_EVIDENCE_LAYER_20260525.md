# TianJi Love Divination Evidence Layer - 2026-05-25

## 1. What changed

- Added shared `DivinationEvidence` types and builder functions for Ask, Draw, and Relationship.
- Added a premium dark `DivinationEvidenceCard` with core insight, evidence signals, confidence, timing, verification points, action advice, feedback buttons, and unpaid unlock CTA.
- Wired Ask preview and paid unlock APIs to return evidence with free/full depth boundaries.
- Wired Draw preview and paid unlock APIs to return tarot/timing evidence with free/full depth boundaries.
- Wired Relationship analysis/result rendering to attach or derive relationship evidence from dimensions, score, summary, and timeline.
- Added privacy-safe divination analytics events for viewed, expanded, feedback, and paid-unlock-from-evidence clicks.
- Updated focused tests for builder safety, API evidence payloads, relationship UI contract, and analytics payload safety.

## 2. Why this improves real divination quality

The upgrade makes the reading feel less like generic AI advice because every result now exposes a visible evidence chain:

- Ask links the private question shape to timing pressure, safety boundaries, and a low-pressure verification path without echoing the raw question in analytics.
- Draw links the three card positions to timing and relationship dynamics while preserving the reflection-not-certainty boundary.
- Relationship links score dimensions, timing, repair pressure, and action advice into a measurable evidence layer.

This improves "accuracy feeling" by giving users observable signals they can verify, while also creating a safe paid unlock reason: deeper signals, fuller timing, and more action guidance.

## 3. Files changed

Core:

```text
src/types/divination.ts
src/lib/divination/evidence.ts
src/components/divination/DivinationEvidenceCard.tsx
src/lib/analytics/divination-events.ts
src/lib/analytics/client.ts
src/lib/trust-copy-guard.ts
```

Ask / Draw / Relationship wiring:

```text
src/app/(main)/ask/page.tsx
src/app/(main)/draw/page.tsx
src/app/api/ask/preview/route.ts
src/app/api/ask/unlock/route.ts
src/app/api/draw/preview/route.ts
src/app/api/draw/unlock/route.ts
src/app/api/relationship/analyze/route.ts
src/app/relationship/result/[id]/page.tsx
src/components/relationship/RelationshipResult.tsx
src/lib/relationship-engine.ts
src/types/relationship.ts
```

Tests and docs:

```text
src/__tests__/lib/divination-evidence.test.ts
src/__tests__/api/ask-paid-gateway.test.ts
src/__tests__/api/draw-gateway.test.ts
src/__tests__/relationship-flow-contract.test.ts
src/__tests__/revenue-funnel-polish-contract.test.ts
.ai/TIANJI_LOVE_SKILL_MATCH_MATRIX_20260525.md
.ai/TIANJI_LOVE_DIVINATION_EVIDENCE_LAYER_20260525.md
.ai/CHANGELOG_AI.md
.ai/REVIEW_PACKET.md
```

## 4. Commands run

```text
git status --short --branch
git branch --show-current
git fetch origin main
git checkout -b feat/tianji-divination-evidence-layer-20260525
Get-ChildItem -Force .agents -Recurse -ErrorAction SilentlyContinue
Get-ChildItem -Force C:\Users\Administrator\gstack\.agents\skills -ErrorAction SilentlyContinue
Get-ChildItem -Force .codex -Recurse -ErrorAction SilentlyContinue
rg -n "relationship|ask|draw|tarot|vedic|astrology|entitlement|paid|stripe|unlock|analytics|aiMeta|confidence|timing" src tests .ai package.json
npm run test -- --run src/__tests__/lib/divination-evidence.test.ts
npm run test -- --run src/__tests__/lib/divination-evidence.test.ts src/__tests__/api/ask-paid-gateway.test.ts src/__tests__/api/draw-gateway.test.ts src/__tests__/relationship-flow-contract.test.ts src/__tests__/revenue-funnel-polish-contract.test.ts
npm run typecheck
npm run lint
npm run test
npm run build
npm run audit:routes
npm run audit:copy
npm run audit:share
npm run audit:upgrade
npm run audit:ask-revenue-contract
npm run audit:draw-revenue-contract
git diff --check
Chrome headless local route QA for /ask?lang=en, /draw?lang=en, /relationship/new?lang=en
```

## 5. Test results

```text
npm run test -- --run src/__tests__/lib/divination-evidence.test.ts
Pass: 1 test file, 7 tests.

npm run test -- --run src/__tests__/lib/divination-evidence.test.ts src/__tests__/api/ask-paid-gateway.test.ts src/__tests__/api/draw-gateway.test.ts src/__tests__/relationship-flow-contract.test.ts src/__tests__/revenue-funnel-polish-contract.test.ts
Pass: 5 test files, 41 tests.

npm run typecheck
Pass.

npm run lint
Pass. No ESLint warnings or errors.

npm run test
Pass: 74 test files, 595 tests.

npm run build
Pass. Next.js production build completed. Existing jose Edge Runtime warnings remained.

npm run audit:routes
Pass: audit-routes OK.

npm run audit:copy
Pass: audit-copy OK.

npm run audit:share
Pass: audit-share OK.

npm run audit:upgrade
Pass: audit-upgrade OK.

npm run audit:ask-revenue-contract
Conditional Go: askCheckoutRoute, askWebhookRoute, askEntitlementCheck, askPaidGatewayRoute, askSafetyRewrite, askAiMetaPrivacy all go.

npm run audit:draw-revenue-contract
Conditional Go: drawEntryRoute, drawApiRoute, drawGatewayRoute, drawFreeBoundary, drawPaidBoundary, drawSafetyRewrite, drawAiMetaPrivacy all go.

git diff --check
Pass, with existing CRLF conversion warnings only.

Chrome headless local route QA
Pass: /ask?lang=en HTTP 200 screenshot 723240 bytes.
Pass: /draw?lang=en HTTP 200 screenshot 887127 bytes.
Pass: /relationship/new?lang=en HTTP 200 screenshot 921443 bytes.
```

## 6. Safety checks

- No real secrets were read, printed, copied, or committed.
- No `.env`, `.env.local`, private key, token, cookie, or log file was intentionally touched.
- No production deploy, DNS, Nginx, PM2, server state, or live database mutation was performed.
- No live Stripe payment or paid smoke was run.
- Analytics payloads contain only `route`, `paid`, `confidence`, `evidenceSignalCount`, `sourceTypes`, and optional feedback.
- Evidence builders redact private values and unsafe deterministic/professional/fear-based claims.
- Existing astrology/divination safety boundary copy is preserved.

## 7. Revenue impact

- Free preview now gives a concrete "why this feels accurate" chain without giving away full report depth.
- Paid unlock CTA is attached to evidence, turning accuracy feeling into a conversion trigger.
- Feedback events create a measurable accuracy-feeling KPI loop.
- Source-type counts and confidence let future funnel analysis compare Ask, Draw, and Relationship evidence performance.

## 8. Remaining risks

- Paid smoke remains untested because safe Stripe test-mode approval was not provided.
- Browser QA used Chrome headless route screenshots rather than a callable in-app Browser tool.
- Relationship full entitlement was not exercised through an end-to-end paid session.
- Several unrelated dirty files existed before this task and remain unstaged/user-owned.

## 9. Gate status

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
