# TianJi Love Evidence Layer + Analytics 20260525

## 1. What changed

Implemented the P0 TianJi Love evidence layer and non-sensitive conversion analytics for Ask, Draw, and Relationship surfaces.

- Added reusable divination evidence builders for Ask, Draw/Tarot, and Relationship.
- Added a premium evidence card and accuracy feedback component.
- Added a new `/ask` page backed by the existing `/api/ask` endpoint.
- Added `/draw` as a safe alias to the evidence-enhanced `/tarot` draw experience.
- Added relationship evidence to `/relationship/new` result output.
- Added safe analytics events for evidence view, expand, feedback, unlock click, and checkout start from free preview.

## 2. Why this improves real divination quality

The layer explains why a result leans a certain way without pretending certainty. It surfaces:

- Core judgment.
- Evidence signals.
- Confidence level.
- Timing window.
- User-verifiable points.
- Next-step advice.

This makes the reading feel more grounded and "准" because users can compare the output against concrete relationship behaviors instead of only reading generic emotional advice.

## 3. Revenue impact

This supports the first monetization loop:

```text
social post -> /relationship/new or /ask -> free preview -> evidence trust -> unlock click -> checkout start
```

The implementation does not change Stripe pricing or live payment behavior. It creates the trust and measurement layer needed before serious paid-intent traffic is sent to the product.

## 4. Safety design

```text
No production deploy.
No live Stripe checkout.
No paid smoke.
No secret access.
No guaranteed prediction language.
No fear-based copy.
No raw question/name/birth/partner/report/email/phone/IP fields in divination analytics payloads.
```

Analytics payloads are restricted to:

```ts
{
  route,
  paid,
  confidence,
  evidenceSignalCount,
  sourceTypes
}
```

Accuracy feedback payloads are restricted to:

```ts
{
  route,
  paid,
  confidence,
  rating
}
```

## 5. Files changed

```text
src/lib/divination/evidence.ts
src/lib/analytics/divination.ts
src/lib/analytics/client.ts
src/lib/trust-copy-guard.ts
src/app/api/analytics/track/route.ts
src/components/divination/DivinationEvidenceCard.tsx
src/components/divination/AccuracyFeedback.tsx
src/app/(main)/ask/page.tsx
src/app/(main)/draw/page.tsx
src/app/(main)/tarot/page.tsx
src/components/relationship/RelationshipResult.tsx
src/components/love-reading/LoveReportCheckoutButton.tsx
src/__tests__/lib/divination-evidence.test.ts
src/__tests__/divination-components-contract.test.ts
.ai/TIANJI_LOVE_EVIDENCE_LAYER_ANALYTICS_20260525.md
.ai/CHANGELOG_AI.md
.ai/REVIEW_PACKET.md
```

## 6. Commands run

```text
git fetch origin main
git pull origin main
git switch -c feat/tianji-evidence-layer-analytics-20260525
rg source inspection commands for ask/draw/relationship/analytics/checkout
npm run typecheck
npm run test -- --run src/__tests__/lib/divination-evidence.test.ts src/__tests__/divination-components-contract.test.ts
npm run lint
git diff --check
npm run test
npm run build
npm run audit:routes
npm run audit:copy
npm run audit:share
npm run audit:upgrade
targeted forbidden-copy and analytics-sensitive-key scans
```

## 7. Test results

```text
Typecheck: Pass
Lint: Pass
Targeted tests: Pass - 2 files / 6 tests
Full tests: Pass - 45 files / 455 tests
Build: Pass
audit:routes: Pass
audit:copy: Pass
audit:share: Pass
audit:upgrade: Pass
git diff --check: Pass
Forbidden prediction-copy scan: Pass
Divination analytics sensitive-key scan: Pass
```

Build completed with existing Edge Runtime warnings from `jose` / `next-auth`; these are not introduced by this branch.

## 8. Gate status

```text
Evidence layer implementation: Go
Ask integration: Go
Draw integration: Go
Relationship integration: Go
Analytics safety: Go
Typecheck: Go
Lint: Go
Tests: Go
Build: Go
Production deploy: Not run
Stripe live checkout: Not run
Paid smoke: No-Go
Secrets printed: No
```

## 9. Remaining risks

- Relationship paid unlock still routes toward pricing/evidence intent rather than a verified relationship-specific checkout path.
- `/draw` is a redirect alias to `/tarot`; a dedicated `/draw` product page can come later if KPI data supports it.
- The new `/ask` page is functional but still needs product copy and pricing-package refinement after Day 1 traffic.
- Full checkout verification remains blocked until test/staging paid smoke is explicitly approved.

## 10. Next recommendation

Next task should verify the free preview -> unlock click -> checkout start funnel in staging/test mode, without live payment, then tune the `/relationship/new` first-screen CTA based on Day 1 publishing traffic.
