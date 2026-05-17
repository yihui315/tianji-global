# TianJi Love Revenue Funnel Polish Evidence - Lane B

Date: 2026-05-16
Worktree: `tianji-global-lane-b`

## What Changed

- Polished homepage copy into a clearer free-to-paid relationship journey.
- Added explicit homepage CTAs: "Start Free Love Reading", "Ask One Question", and "Draw Three Cards".
- Reframed homepage cards as Love Reading, Ask One Question, and Draw Three Cards.
- Added trust strip copy for private-by-default, reflection-not-certainty, no fear-based selling, and secure unlocks.
- Reframed Ask preview unlock copy around a full relationship answer without exposing the paid answer.
- Reframed Draw preview unlock copy around a full three-card relationship reading and one practical next step.
- Added pricing clarity for Free preview, one-time Ask unlock, Draw unlock, Monthly, and Yearly.
- Added privacy-safe client funnel analytics events and tests.
- Stabilized two existing contract tests so Lane B validation does not depend on CRLF line endings or live AI provider behavior.

## Files Changed

- `src/components/home/TianjiLoveHome.tsx`
- `src/app/(main)/ask/page.tsx`
- `src/app/(main)/draw/page.tsx`
- `src/app/(main)/pricing/page.tsx`
- `src/components/relationship/RelationshipResult.tsx`
- `src/lib/analytics/client.ts`
- `src/lib/analytics/funnel-events.ts`
- `src/__tests__/landing-design-contract.test.ts`
- `src/__tests__/report-generator-contract.test.ts`
- `src/__tests__/revenue-funnel-polish-contract.test.ts`
- `docs/tianji-love-revenue-funnel-runbook.md`
- `.ai/TIANJI_LOVE_REVENUE_FUNNEL_REVIEW_20260516.md`
- `.ai/TIANJI_LOVE_REVENUE_FUNNEL_POLISH_EVIDENCE_20260516.md`
- `.ai/CHANGELOG_AI.md`
- `.ai/REVIEW_PACKET.md`

## Commands Run

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run audit:routes`
- `npm run audit:copy`
- `npm run audit:share`
- `npm run audit:upgrade`
- `npm run audit:ask-revenue-contract`
- `npm run audit:draw-revenue-contract`
- `git diff --check`

Validation results:

- `npm run typecheck`: Pass.
- `npm run lint`: Pass.
- `npm run test`: Pass, 57 files / 518 tests.
- `npm run build`: Pass, 106 static pages.
- `npm run audit:routes`: Pass.
- `npm run audit:copy`: Pass.
- `npm run audit:share`: Pass.
- `npm run audit:upgrade`: Pass.
- `npm run audit:ask-revenue-contract`: Pass with `overall: conditional-go`.
- `npm run audit:draw-revenue-contract`: Pass with `overall: conditional-go`.
- `git diff --check`: Pass with LF/CRLF working-copy warnings only.

Dependency note:

- Earlier validation attempts in this worktree were blocked by missing local JS tooling and a native `sweph` lifecycle build issue under Node 24 without the Visual Studio C++ workload.
- Local JS tooling is now present, and the required Lane B validation set passed.

## Funnel Changes

- Homepage now leads with a private free love reading instead of deterministic fate language.
- Homepage product cards map to the actual user choices: Love Reading, Ask One Question, Draw Three Cards.
- The pricing page explains one-time unlocks separately from subscriptions.

## CTA Changes

- Homepage primary CTA: "Start Free Love Reading".
- Homepage secondary CTA: "Ask One Question".
- Ask preview CTA: "Unlock the full relationship answer".
- Draw preview CTA: "Unlock the full three-card relationship reading".

## Analytics Changes

Added or verified:

- `relationship_start_click`
- `relationship_free_result_view`
- `relationship_upgrade_click`
- `ask_preview_view`
- `ask_unlock_click`
- `draw_preview_view`
- `draw_unlock_click`
- `pricing_view`
- `pricing_plan_click`
- `login_start`

Client payload sanitizer excludes birth date, birth time, birth location, timezone, raw question, full answer, full result, and result text fields.

## Safety Copy Status

- No guaranteed prediction copy was added.
- No fear-based urgency was added.
- No medical, legal, or financial claim was added.
- Pricing says paid unlocks add depth, not certainty.

## Backend Untouched Confirmation

No backend payment behavior was changed. The implementation did not edit:

- `src/lib/tianji-model-gateway.ts`
- `src/lib/ai-orchestrator.ts`
- `src/app/api/stripe/**`
- `src/app/api/ask/unlock/**`
- `src/app/api/draw/unlock/**`
- staging smoke scripts
- production deployment files

## Risks

- Analytics persistence still depends on existing backend/env configuration.
- Paid checkout smoke remains outside Lane B and was not run.
- Production deploy remains No-Go.

## Next Step

Merge Lane A first, rebase Lane B onto that result, then merge Lane B and run the combined validation gate.
