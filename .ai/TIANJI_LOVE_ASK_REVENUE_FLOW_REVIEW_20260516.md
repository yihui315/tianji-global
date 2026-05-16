# TianJi Love Ask Revenue Flow Review - 2026-05-16

## Scope

This review maps the current Ask pay-per-question revenue flow before Phase 2 code edits. It is based on source inspection only.

No `.env`, `.env.local`, real secrets, live Stripe API calls, paid smoke, deploy, production database mutation, or provider live calls were performed.

## 1. Ask Entry Page Path

- Page: `src/app/(main)/ask/page.tsx`
- Public route: `/ask`
- User flow:
  - User writes one love question.
  - Client POSTs to `/api/ask/preview`.
  - Client stores the returned encrypted `id` and short `preview` in `sessionStorage`.
  - Unlock button POSTs to `/api/ask/unlock`.
  - After Stripe success redirect, page reads `session_id` and `id` from query params, then GETs `/api/ask/unlock`.

## 2. Ask Submit API Path

- Route: `src/app/api/ask/preview/route.ts`
- Current behavior:
  - Validates `{ question, language }` with `askQuestionInputSchema`.
  - Calls `generateReport` directly with `preferredProvider: 'packy'`.
  - Wraps provider call in `resolvePreviewWithin`.
  - On timeout/error, returns local fallback copy.
  - Builds `fullAnswer`, derives short preview via `buildAskPreview`, then encrypts the full answer into `id` with `encodeAskQuestionId`.
- Current model path:
  - Preview currently generates the full answer before payment.
  - The full answer is encrypted in the token and later returned after payment.

## 3. Payment Creation Path

- Route: `src/app/api/ask/unlock/route.ts`
- Method: `POST`
- Current behavior:
  - Validates `{ id, language }`.
  - Decodes the Ask token to confirm it is valid.
  - Calls `getStripe().checkout.sessions.create`.
  - Uses inline one-time `price_data` for `$1.99`.
  - Stores non-raw `askQuestionRef` as a SHA-256 token reference in Stripe metadata.
  - Redirects success to `/ask?lang=...&id=...&session_id={CHECKOUT_SESSION_ID}`.
- Current risk:
  - This route is not guarded by `requirePayPerUseEnabled`, unlike several other paid routes.
  - Running it against real env would call Stripe, so tests must mock `getStripe`.

## 4. Unlock / Entitlement Check Path

- Route: `src/app/api/ask/unlock/route.ts`
- Method: `GET`
- Current behavior:
  - Requires `session_id`.
  - Retrieves Stripe checkout session.
  - Treats `payment_status === 'paid'` or `status === 'complete'` as paid.
  - Requires `session.metadata.flow === 'ask-question'`.
  - Reads `id` from query or `session.metadata.askQuestionId`.
  - Decodes token and returns `fullAnswer`, `question`, `language`, `model`, and `provider`.
- Current risk:
  - Paid answer is not generated at unlock time.
  - Paid answer does not call `generateTianjiModelResponse`.
  - `session.metadata.askQuestionId` is referenced, but POST metadata stores `askQuestionRef`, not raw `askQuestionId`; the query `id` path is required for current success redirects.

## 5. Webhook Path

- General Stripe webhook: `src/app/api/stripe/webhook/route.ts`
- Current Ask status:
  - Webhook handles Love/Relationship checkout metadata and report jobs.
  - It does not appear to process Ask `flow: 'ask-question'` metadata.
  - Ask unlock is currently verified synchronously by GET `/api/ask/unlock` after redirect.

## 6. Result Rendering Path

- Page: `src/app/(main)/ask/page.tsx`
- Current behavior:
  - Preview panel renders `preview.preview`.
  - Unlocked panel renders `unlocked.fullAnswer`.
  - No separate persistent Ask result route exists.
  - Full answer display is tied to the redirect verification response.

## 7. Current Model Call Path

- Current preview path:
  - `/api/ask/preview` -> `generateReport` -> preferred provider `packy`.
  - Fallback: local template answer on timeout/error.
- Current paid path:
  - `/api/ask/unlock` GET -> Stripe session retrieve -> decrypt token -> return existing token `fullAnswer`.
  - No paid-time model call.
- Gateway status:
  - `src/lib/tianji-model-gateway.ts` has `ask-unlock` routed to `deepseek/deepseek-v4-flash`, with fallback to `deepseek/deepseek-v4-pro` then `ollama/gemma4:31b`.
  - This gateway route is tested but not wired into Ask unlock.

## 8. Current Safety Layer Status

- Preview prompt asks the model not to predict with certainty.
- Local fallback copy is reflective and avoids deterministic promises.
- Gateway deterministic rewrite exists in `rewriteDeterministicPrediction`.
- Current Ask preview and unlock routes do not call the gateway safety rewrite directly.
- Existing `aiMeta` is not present on Ask responses.

## 9. Current Test Coverage

Relevant current tests:

- `src/__tests__/ask-love-reading-design-contract.test.ts`
  - Confirms page uses `/api/ask/preview` and `/api/ask/unlock`.
- `src/__tests__/api/paywall-preview-copy.test.ts`
  - Confirms fallback preview copy is structured/readable.
- `src/__tests__/api/paywall-preview-timeout.test.ts`
  - Confirms preview timeout falls back.
- `src/__tests__/lib/paywall-chinese-copy.test.ts`
  - Confirms preview copy builder/localized CTA copy.
- `src/__tests__/lib/tianji-model-gateway.test.ts`
  - Confirms `ask-unlock` gateway route and fallback execution.
- `src/__tests__/stripe-checkout-contract.test.ts`
  - Covers general Stripe checkout/webhook safety, but not Ask-specific paid gateway behavior.

Missing Phase 2 coverage:

- Unpaid Ask locked response contract.
- Paid Ask unlock calls gateway contract.
- Paid Ask `aiMeta` privacy contract.
- Ask safety rewrite contract for certainty-risk phrases.
- Ask-specific revenue contract audit script.

## 10. Current No-Go Risks

```text
Ask paid route: No-Go / not integrated with gateway
Ask paid smoke: No-Go / not run
Stripe live call status: No-Go / no live call allowed
DeepSeek live call status: No-Go / no live call allowed
Production deploy: No-Go
```

Specific risks:

- Preview currently generates and encrypts the full answer before payment, so the paid route is not the generation boundary.
- The paid unlock GET verifies Stripe but returns token content without DeepSeek/gateway generation.
- Ask-specific checkout creation route performs a Stripe session create and must remain mocked in tests.
- Ask webhook path is not Ask-specific; unlock relies on redirect verification.
- `aiMeta` is absent from Ask.
- `DEEPSEEK_API_KEY` and `DEEPSEEK_BASE_URL` are documented in the gateway runbook but not yet present in `.env.example`.
- `MINIMAX_TOKEN_PLAN_KEY` is documented in the runbook but not yet present in `.env.example`.
- Existing dirty worktree contains unrelated relationship revenue-gate and untracked artifact files; Phase 2 must avoid `git add .`.

## Phase 2 Minimal Plan

Risk level: medium, because this touches a revenue path. User supplied explicit Phase 2 approval and constraints.

Smallest implementation plan:

1. Add Ask route metadata/types to the gateway without changing public MiniMax defaults.
2. Add RED tests in `src/__tests__/api/ask-paid-gateway.test.ts` for unpaid gating, paid gateway generation, safety rewrite, and `aiMeta` privacy.
3. Change `/api/ask/preview` so unpaid users receive a short preview and locked response metadata without exposing provider/model if no model was called.
4. Change `/api/ask/unlock` GET so verified paid sessions call `generateTianjiModelResponse` with the paid Ask route instead of returning a pre-generated full answer from token.
5. Keep Stripe calls mocked in tests; do not run live Stripe or live DeepSeek.
6. Add `scripts/audit-ask-revenue-contract.ts` and package script `audit:ask-revenue-contract`.
7. Update docs and `.ai` evidence after validation.

## Commit Scope Note

The user suggested committing Phase 1 before Phase 2. That commit is currently deferred because the dirty worktree shows `src/app/api/relationship/analyze/route.ts` depending on untracked `src/lib/relationship-reading-store.ts`; committing only the Phase 1 whitelist could produce an incomplete commit, while adding the dependency would mix earlier relationship revenue-gate work into the gateway commit. Preserve this boundary until a clean staging plan is chosen.
