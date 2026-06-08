# TianJi Love Pretext Layout Merge Readiness - Review Packet

## 2026-05-26 relationship Pretext layout merge readiness

Prepared a small relationship-only Pretext integration for a narrow PR.

## Goal

Use `@chenglou/pretext` to make TianJi Love relationship result text more layout-stable without changing payment, Auth, API, privacy, Ask/Draw, deployment, Stripe, Supabase, or workflow surfaces.

## Changed Files

```text
package.json
package-lock.json
src/components/relationship/usePretextTextLayout.ts
src/components/relationship/RelationshipResult.tsx
src/components/relationship/RelationshipDimensionCard.tsx
src/__tests__/relationship-flow-contract.test.ts
.ai/TIANJI_LOVE_PRETEXT_LAYOUT_QA_20260526.md
.ai/CHANGELOG_AI.md
.ai/REVIEW_PACKET.md
```

## Key Diff Summary

- Added `@chenglou/pretext@0.0.7`.
- Added `usePretextTextLayout`, a client-only hook that observes element width, measures text with Pretext, and applies stable `minHeight`.
- Wired the hook into relationship result headline, summary, next move, locked report body, and dimension summaries.
- Kept the hook privacy-agnostic: it receives display text only and does not know about birth dates, birth times, locations, timezones, Stripe, Supabase, or analytics payloads.
- Kept payment closed-loop work out of this PR line.

## Validation

```text
npm run test -- --run src/__tests__/relationship-flow-contract.test.ts
Passed, 11/11.

npm run typecheck -- --pretty false
Passed.

npm run lint
Passed. Existing Next lint deprecation notice only.

npm run build
Passed.

npm run test
Passed, 74 files / 596 tests.

npm run audit:routes
Passed.

npm run audit:copy
Passed.

npm run audit:share
Passed.

npm run audit:upgrade
Passed.

git diff --check
Passed with existing LF/CRLF warnings only.
```

## Visual QA

```text
Desktop:
- scrollWidth: 1365
- clientWidth: 1365
- horizontal overflow: No
- min-height: headline 56px, summary 56px, next move 56px, locked body 56px

Mobile:
- scrollWidth: 390
- clientWidth: 390
- horizontal overflow: No
- min-height: headline 140px, summary 112px, next move 56px, locked body 112px

Known noise:
- Existing /api/analytics/relationship 503 appeared during local smoke.
- No pageerror was observed.
```

## Risks And Follow-Up

- Bundle size increases slightly on the relationship route.
- Analytics 503 is existing local noise and should remain a separate follow-up.
- Payment closed loop remains out of scope and should continue on a separate branch/PR.
- Production deploy and paid smoke remain No-Go.

## Suggested Commit Message

```text
feat(relationship): stabilize result text layout with pretext
```

## 2026-05-25 PR #60 merge and paid smoke gate

PR #60 remains open and should not be merged yet.

```text
PR: https://github.com/yihui315/tianji-global/pull/60
Branch: feat/tianji-divination-evidence-layer-20260525
Source commit: 7333e68fbd3e0891051deb8cd2b420d2557f4dda
Merge commit: N/A
```

Gate review:

```text
CI/CD: No-Go - no GitHub Actions workflow runs found for the source commit.
Vercel: Fail - GitHub combined status reports Vercel failure.
Conflicts: Blocked/unknown detail - GitHub reports mergeable=false.
Mergeable: No.
PR diff risk: No-Go - 53 commits / 325 files, broader than the evidence-layer scope.
PR merge: No-Go / Pending.
Production deploy: Not run.
```

Paid smoke readiness:

```text
npm run smoke:stripe:test-readiness
overall: conditional-go
stripeKeysLookTestMode: unknown

npm run audit:ask-revenue-contract
overall: conditional-go

npm run audit:draw-revenue-contract
overall: conditional-go
```

Paid checkout smoke was not run because safe Stripe test-mode env evidence is not available in the current shell and explicit test-mode paid-smoke approval remains required. Analytics privacy remains source/test verified, but the paid unlock and feedback events were not runtime-verified through checkout in this gate pass.

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
