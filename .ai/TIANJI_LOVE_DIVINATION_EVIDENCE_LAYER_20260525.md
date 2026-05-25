# TianJi Love Divination Evidence Layer - Clean Narrow PR - 2026-05-25

## 1. What changed

Recreated the Divination Evidence Layer from latest `origin/main` on a clean worktree branch instead of merging PR #60.

Implemented:

```text
DivinationEvidence public type
Ask / Draw / Relationship evidence builders
Evidence card UI with signals, confidence, timing, verification, action advice, feedback, and unlock CTA
Ask preview and paid unlock evidence payloads
Draw preview and paid unlock evidence payloads
Relationship analysis/result evidence payloads
Privacy-safe divination analytics events
Focused tests for evidence, API payloads, UI contracts, and analytics privacy
Tianji Love visual assets referenced by Ask/Draw UI
```

PR #60 remains No-Go and was not merged.

## 2. Why this improves real divination quality

The product now shows why a reading feels relevant instead of only returning a block of AI text. The evidence layer makes the reading inspectable through observable signals, timing windows, user-verifiable points, and gentle next actions. Free preview gives enough confidence to trust the product; paid unlock keeps deeper signals, action plan, and relationship detail as the conversion reason.

Safety remains explicit: no guaranteed outcome, no certain future, no medical/legal/financial certainty, no fear-based claims.

## 3. Files changed

Core evidence and analytics:

```text
src/types/divination.ts
src/lib/divination/evidence.ts
src/components/divination/DivinationEvidenceCard.tsx
src/lib/analytics/client.ts
src/lib/analytics/divination-events.ts
src/lib/analytics/funnel-events.ts
src/lib/analytics/relationship-events.ts
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
src/app/api/relationship/share/route.ts
src/app/api/checkout/route.ts
src/app/api/stripe/webhook/route.ts
src/app/relationship/result/[id]/page.tsx
src/components/relationship/RelationshipResult.tsx
```

Direct support files:

```text
src/components/tianji-love/TianjiLovePrimitives.tsx
src/components/tianji-love/index.ts
src/lib/ai-orchestrator.ts
src/lib/ai-preview-timeout.ts
src/lib/ask-question.ts
src/lib/love-report-generator.ts
src/lib/love-test.ts
src/lib/quick-draw.ts
src/lib/relationship-engine.ts
src/lib/relationship-reading-store.ts
src/lib/staging-degraded-mode.ts
src/lib/tianji-model-gateway.ts
src/types/ai.ts
src/types/relationship.ts
```

Tests, assets, and docs:

```text
src/__tests__/lib/divination-evidence.test.ts
src/__tests__/api/ask-paid-gateway.test.ts
src/__tests__/api/draw-gateway.test.ts
src/__tests__/relationship-flow-contract.test.ts
src/__tests__/revenue-funnel-polish-contract.test.ts
public/assets/images/brand/tianji-love-compass-mark.png
public/assets/images/brand/tianji-love-logo-mark.png
public/assets/images/hero/tianji-love-couple-red-thread-16x9.png
public/assets/images/hero/tianji-love-moon-pavilion-16x9.png
.ai/TIANJI_LOVE_SKILL_MATCH_MATRIX_20260525.md
.ai/TIANJI_LOVE_DIVINATION_EVIDENCE_LAYER_20260525.md
.ai/CHANGELOG_AI.md
.ai/REVIEW_PACKET.md
```

## 4. Commands run

```text
git fetch origin main
git worktree add -b feat/tianji-divination-evidence-layer-clean-20260525 C:\Users\Administrator\.config\superpowers\worktrees\tianji-global\feat-tianji-divination-evidence-layer-clean-20260525 origin/main
npm ci --ignore-scripts --no-audit --no-fund --loglevel=error
git cherry-pick --no-commit 7333e68fbd3e0891051deb8cd2b420d2557f4dda
git cherry-pick --abort
git checkout 7333e68fbd3e0891051deb8cd2b420d2557f4dda -- selected Evidence Layer files
npm run typecheck
npm run lint
npm run test -- --run src/__tests__/lib/divination-evidence.test.ts src/__tests__/api/ask-paid-gateway.test.ts src/__tests__/api/draw-gateway.test.ts src/__tests__/relationship-flow-contract.test.ts src/__tests__/revenue-funnel-polish-contract.test.ts
npm run test
npm run build
npm run audit:routes
npm run audit:copy
npm run audit:share
npm run audit:upgrade
npm run audit:ask-revenue-contract
npm run audit:draw-revenue-contract
npm run smoke:stripe:test-readiness
git diff --check
git diff --cached --check
targeted secret-shape scan over changed files
next start -p 3107 with local dummy auth secret
Puppeteer non-paid QA for /ask?lang=en, /draw?lang=en, /relationship/new?lang=en
```

## 5. Test results

```text
npm run typecheck: Pass
npm run lint: Pass, no ESLint warnings or errors
focused Evidence/Ask/Draw/Relationship tests: Pass, 5 files / 24 tests
npm run test: Pass, 48 files / 473 tests
npm run build: Pass
npm run audit:routes: Pass
npm run audit:copy: Pass
npm run audit:share: Pass
npm run audit:upgrade: Pass
npm run audit:ask-revenue-contract: Not available on clean main
npm run audit:draw-revenue-contract: Not available on clean main
npm run smoke:stripe:test-readiness: Not available on clean main
git diff --check: Pass, CRLF warnings only
targeted secret-shape scan: Pass
```

## 6. Safety checks

```text
No real secrets read or printed
No .env files read or committed
No Stripe live mode used
No production deploy
No DNS/Nginx/PM2/server production state changes
No live database mutation
No raw question/name/birth/payment data in analytics QA payloads
No guaranteed prediction language added
```

Local QA used synthetic sentinels only and checked analytics requests for those sentinel strings. Result: `0` analytics leaks detected.

## 7. Revenue impact

```text
Ask: preview evidence creates a natural unlock reason for deeper interpretation
Draw: timing/card evidence makes paid depth feel specific instead of generic
Relationship: compatibility evidence connects score, dimensions, and timing to full-report unlock
Analytics: feedback and evidence-click events create measurable accuracy-feeling KPIs
```

Recommended post-launch KPIs:

```text
paid_unlock_from_evidence_clicked / preview users
divination_accuracy_feedback_submitted / evidence views
positive feedback rate
preview to paid unlock conversion
Ask vs Draw vs Relationship evidence conversion
```

## 8. Remaining risks

```text
Remote GitHub checks still need to run after PR creation
Vercel status still needs remote verification on the clean PR
Paid smoke remains No-Go because Stripe test-mode approval/env were not used
Production deploy remains No-Go
Ask/Draw revenue audit scripts are not present on clean main
Stripe readiness smoke script is not present on clean main
```

## 9. Gate status

```text
Divination Evidence Layer idea: Go
Clean narrow implementation: Go
Ask preview / paid unlock wiring: Go
Draw preview / paid unlock wiring: Go
Relationship reading/result wiring: Go
Analytics privacy: Go
Typecheck: Go
Lint: Go
Tests: Go
Build: Go
Route/copy/share/upgrade audits: Go
Non-paid local QA: Go
PR #60 merge: No-Go
Paid smoke: No-Go
Production deploy: No-Go
Secrets printed: No
```
