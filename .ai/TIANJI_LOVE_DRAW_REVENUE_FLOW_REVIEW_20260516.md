# TianJi Love Draw / Tarot Revenue Flow Review - 2026-05-16

## 1. Draw / Tarot entry page path

- Primary revenue entry: `src/app/(main)/draw/page.tsx` served at `/draw`.
- Legacy/general tarot entry: `src/app/(main)/tarot/page.tsx` served at `/tarot`.

## 2. Draw submit API path

- `/draw` submits preview requests to `POST /api/draw/preview`.
- `/tarot` submits generated tarot readings to `POST /api/tarot` with `enhanceWithAI: true`.

## 3. Current model call path

- `src/app/api/draw/preview/route.ts` calls `generateReport` directly with `preferredProvider: 'packy'`.
- `src/app/api/tarot/route.ts` calls `interpretTarot`, which calls `generateReport` through `src/lib/ai-interpreter.ts`, also preferring Packy.
- Neither user-facing Draw/Tarot route currently calls `generateTianjiModelResponse`.

## 4. Current free output behavior

- `/api/draw/preview` draws three cards, builds mini readings, generates or falls back to a full reading, then returns a short `preview`.
- It also returns `previewDraw` with slot and arcana for the card backs.
- Current free preview is useful, but the server generates the full paid reading before payment.

## 5. Current paid/pro output behavior

- `/api/draw/unlock` creates a one-time Stripe Checkout session for `$2.99`.
- After payment verification, `GET /api/draw/unlock` decodes the encrypted token and returns `fullReading`, `draw`, provider, and model from the token.
- Paid/pro depth is not generated after entitlement; it is recovered from the pre-payment token.

## 6. Current unlock / entitlement logic

- Checkout route: `POST /api/draw/unlock`.
- Verification route: `GET /api/draw/unlock`.
- Entitlement check is Stripe session status plus `metadata.flow === 'quick-draw'`.
- There is no durable Draw entitlement record and no webhook-created Draw unlock state.
- Existing Stripe webhook route is not Draw-specific for quick-draw unlocks.

## 7. Current safety layer status

- Draw preview and unlock do not pass text through `rewriteDeterministicPrediction`.
- The gateway already has `tarot-draw`, but the requested snake_case `tarot_draw` task is not present.
- `/api/tarot` uses `filterSensitiveContent` on input and `addDisclaimer` on AI interpretation, but does not use the TianJi gateway safety rewrite.

## 8. Current test coverage

- `src/__tests__/api/paywall-preview-timeout.test.ts` covers Draw fallback timeout behavior.
- `src/__tests__/api/paywall-preview-copy.test.ts` covers readable Draw fallback copy.
- `src/__tests__/lib/paywall-chinese-copy.test.ts` covers `buildDrawPreview` Chinese readability.
- `src/__tests__/api/tarot.test.ts` covers tarot deck and spread helper logic, not gateway routing.
- `src/__tests__/tianji-love-p0-pages-contract.test.ts` checks `/draw` page contracts.
- No focused Draw gateway / aiMeta / paid boundary contract exists yet.

## 9. Current No-Go risks

- Paid Draw full reading is generated before payment and stored in the unlock token.
- Draw provider/model metadata can originate from a pre-payment generation path.
- User-facing Draw/Tarot AI output bypasses the TianJi gateway.
- Draw safety rewrite is not enforced.
- `/api/tarot` enhanced AI path still uses `interpretTarot` / Packy directly.
- Draw paid smoke is No-Go because no live Stripe/test-mode checkout or provider smoke was run.
- Draw paid/pro boundary is not explicitly audited.
- Production deploy remains No-Go.

## Minimal Phase 3 plan

1. Add RED tests for free Draw boundary, paid Draw gateway generation, safe `aiMeta`, and deterministic prediction rewrite.
2. Add `tarot_draw` as a gateway route alias with Ollama/gemma4 default and DeepSeek Flash fallback.
3. Change `/api/draw/preview` to return a useful locked local preview only, with no full paid/pro reading and no provider/model metadata.
4. Change paid `/api/draw/unlock` to generate the full relationship-specific reading through `tarot_draw` only after Stripe verification.
5. Keep `/api/tarot` static/free route behavior out of paid checkout, but add gateway for `enhanceWithAI` if scoped safely by tests.
6. Add static Draw revenue audit and update docs/evidence.
