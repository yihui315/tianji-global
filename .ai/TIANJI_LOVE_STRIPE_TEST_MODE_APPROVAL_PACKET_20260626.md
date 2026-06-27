# TianJi Love Stripe Test-Mode Paid Smoke Approval Packet - 2026-06-26

## Scope

This packet prepares a future Stripe test-mode paid smoke for TianJi Love. It is an approval packet only.

No payment, live-mode Stripe action, webhook replay, Supabase mutation, deploy, server mutation, or `.env*` read was performed by Codex for this packet.

## Current State

| Area | Status |
| --- | --- |
| Website deploy | Go, per operator report |
| Revenue OS source | Go |
| Supabase migration / schema drift repair | Go, per operator report |
| Lead Capture live write | Go, per operator report: `POST /api/marketing/leads` returned `HTTP 201 {"success":true}` |
| Stripe/payment | No-Go until explicit paid-smoke approval |
| Stripe live | No-Go |
| Revenue Execution | No-Go until Stripe test-mode paid smoke passes and a separate launch approval exists |

## Source Review

### 1. Checkout Routes

| Route | File | Review Result |
| --- | --- | --- |
| Love / Relationship one-time checkout | `src/app/api/checkout/route.ts` | Present. Requires `ENABLE_PAY_PER_USE=true`, validates `productId`, validates UUID reading reference, checks `STRIPE_LOVE_PREMIUM_REPORT_PRICE_ID`, creates Stripe Checkout `mode: payment`, creates a pending order, tracks checkout creation, and returns the Stripe Checkout URL. |
| Subscription pricing checkout | `src/app/api/stripe/checkout/route.ts` | Present. Requires authenticated user and `ENABLE_PAY_PER_USE=true`, creates Stripe Checkout `mode: subscription` from `PLANS`. This is a legacy/pricing-plan path, not the primary Love premium report smoke path. |
| Ask paid unlock | `src/app/api/ask/unlock/route.ts` | Present. Love-Test paid intents are blocked before Stripe unless `LOVE_TEST_PAID_INTENT_TEST_MODE_READY=true` and `LOVE_TEST_PAID_SMOKE_APPROVED=true`. |
| Draw paid unlock | `src/app/api/draw/unlock/route.ts` | Present. Creates one-time Stripe Checkout for quick-draw unlock when payment mode is enabled. |

Primary paid smoke recommendation: start with `/api/checkout` from a real Love Reading or Relationship result, because this is the current Love premium report path using the canonical `love_premium_report` product contract.

### 2. Pricing Config

| Product / Flow | Source | Price Mapping |
| --- | --- | --- |
| Love premium report | `src/lib/love-reading/revenue-contract.ts`, `src/lib/billing.ts` | Canonical product: `love_premium_report`; legacy aliases: `solo_love_report`, `compatibility_report`; currency: `cny`; amount minor: `1990`; Stripe Price ID env name: `STRIPE_LOVE_PREMIUM_REPORT_PRICE_ID`. |
| Ask one-question unlock | `src/lib/ask-question.ts`, `src/app/api/ask/unlock/route.ts` | Inline Stripe `price_data`, `usd`, `ASK_QUESTION_UNLOCK_PRICE_USD_CENTS=199`. |
| Draw timing unlock | `src/lib/quick-draw.ts`, `src/app/api/draw/unlock/route.ts` | Inline Stripe `price_data`, `usd`, `QUICK_DRAW_UNLOCK_PRICE_USD_CENTS=299`. |
| Subscription plans | `src/lib/stripe.ts`, `src/app/api/stripe/checkout/route.ts` | `PRO_MONTHLY` and `PRO_YEARLY` use inline Stripe subscription `price_data`; optional legacy price ID fields exist in `PLANS`, but the route creates inline prices. |

Source copy note: the current Love premium display contract and some Chinese pricing copy appear mojibake-style in source/tests instead of the intended customer-facing yen display. This does not block the Price-ID checkout path, but it should be fixed before broad customer-facing paid launch copy review.

### 3. Webhook Route

| Item | Result |
| --- | --- |
| File | `src/app/api/stripe/webhook/route.ts` |
| Runtime | Node.js, dynamic route |
| Signature verification | Uses raw request body, `stripe-signature`, `STRIPE_WEBHOOK_SECRET`, and `getStripe().webhooks.constructEvent(...)`. |
| Degraded guard | If staging degraded mode is active and Stripe is unavailable, returns `{ received: true, skipped: "payment_unavailable" }` before mutation. |
| Payment gate | If `ENABLE_PAY_PER_USE` is not true, returns `{ received: true, skipped: "pay_per_use_disabled" }`. |
| Idempotency | Calls `recordStripeEvent(event)` and returns duplicate success when already recorded. |
| Handled events | `checkout.session.completed`, `charge.refunded`, `refund.created`. |
| Checkout completion effects | Marks order paid, tracks `love_checkout_success`, marks relationship premium when source is relationship, otherwise ensures/runs report job and attempts report-ready email. |

Webhook replay remains No-Go for this packet.

### 4. Success / Cancel URLs

| Flow | Success URL | Cancel URL |
| --- | --- | --- |
| Love Reading result | `/{locale}/love-reading/result/{readingSessionId}?checkout=success` | `/{locale}/love-reading/result/{readingSessionId}?checkout=cancelled` |
| Relationship result | `/relationship/result/{relationshipReadingId}?lang={zh|en}&checkout=success` | `/relationship/result/{relationshipReadingId}?lang={zh|en}&checkout=cancelled` |
| Ask unlock | `/ask?lang={lang}&source={source}&intent={intent}&id={encodedId}&session_id={CHECKOUT_SESSION_ID}` | `/ask?lang={lang}&source={source}&intent={intent}&cancelled=1` |
| Draw unlock | `/draw?lang={lang}&id={encodedId}&session_id={CHECKOUT_SESSION_ID}` | `/draw?lang={lang}&cancelled=1` |
| Subscription pricing | `/pricing/success?session_id={CHECKOUT_SESSION_ID}` | `/pricing/cancel` |

### 5. Test-Mode Env Readiness Checklist - Masked Only

Codex must not read `.env*`. A human operator must provide masked evidence only.

| Key / Flag | Required Evidence | Pass Criteria |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | `present`, masked prefix classification only | Test mode only: starts with `sk_test_`; any `sk_live_` is immediate No-Go. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `present`, masked prefix classification only | Test mode only: starts with `pk_test_`; any `pk_live_` is immediate No-Go. |
| `STRIPE_WEBHOOK_SECRET` | `present`, masked only | Matches the approved test-mode webhook endpoint; do not print the secret. |
| `STRIPE_LOVE_PREMIUM_REPORT_PRICE_ID` | `present`, masked or non-secret price ID classification | Test-mode Price ID for the Love premium report product. |
| `ENABLE_PAY_PER_USE` | masked boolean status | Must be `true` only for the approved test-mode smoke window. |
| `LOVE_TEST_PAID_INTENT_TEST_MODE_READY` | masked boolean status, Ask Love-Test only | Required before Love-Test Ask paid-intent smoke. |
| `LOVE_TEST_PAID_SMOKE_APPROVED` | masked boolean status, Ask Love-Test only | Required only after explicit approval. |
| `NEXT_PUBLIC_APP_URL` | target classification only | Must match the approved target URL for the smoke. |
| `STRIPE_LIVE_DISABLED` | masked boolean status for degraded/staging checks | Must not be used to mix live keys into a test smoke. |

Recommended safe pre-smoke command, after masked env evidence is prepared:

```powershell
npm run smoke:stripe:test-readiness
```

This is a readiness classifier only. It must not be treated as paid-smoke approval.

### 6. Webhook Test Readiness Checklist

| Check | Pass Criteria |
| --- | --- |
| Endpoint | Approved test target points to `/api/stripe/webhook`. |
| Mode | Stripe dashboard/CLI evidence shows test mode only. |
| Signing secret | Masked `whsec_...` evidence exists and is for the same endpoint. |
| Event type | `checkout.session.completed` enabled for the test endpoint. Refund events may be checked later, but are not required for first paid smoke. |
| Signature verification | Webhook delivery shows 2xx only after valid Stripe signature. |
| Idempotency | Duplicate event behavior is reviewed through source/tests; no manual replay by Codex. |
| Mutation target | Any order/report mutation target must be the approved test-mode smoke target. |
| Evidence hygiene | No raw secret, raw webhook payload containing private user data, or live-mode marker is stored in `.ai`. |

### 7. Exact Paid Smoke Steps - Pending Human Approval

Do not run these steps until a human explicitly approves Stripe test-mode paid smoke.

1. Record an approval line in the review packet or approval evidence file:

```text
Approved: execute TianJi Love Stripe test-mode paid smoke only, on approved target <target>, with Stripe test keys, no live mode, no webhook replay by Codex, no production paid launch, no social posting.
```

2. Record masked env readiness evidence:

```text
STRIPE_SECRET_KEY=present sk_test_...masked
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=present pk_test_...masked
STRIPE_WEBHOOK_SECRET=present whsec_...masked
STRIPE_LOVE_PREMIUM_REPORT_PRICE_ID=present price_...masked
ENABLE_PAY_PER_USE=true for smoke window
target_url=<approved target>
live_key_markers=0
```

3. Run static/readiness validation:

```powershell
npm run smoke:stripe:test-readiness
npm run audit:love-test-checkout-readiness
npm run test -- src/__tests__/stripe-checkout-contract.test.ts src/__tests__/api/stripe-webhook-degraded-guard.test.ts
```

4. Create a real Love Reading or Relationship test session on the approved target.

5. Click the unlock CTA and confirm the Checkout URL is a Stripe test-mode checkout URL. Do not continue if any live-mode marker appears.

6. Complete the payment using a Stripe test card only.

7. Verify the success redirect returns to the expected success URL and the app shows the expected paid/unlocked state.

8. Verify webhook delivery in Stripe test mode only. Record only masked IDs and status labels.

9. Record expected DB/order/report evidence with masked identifiers only, if DB evidence is approved for the smoke.

10. Restore/confirm the paid smoke gate state after the test window:

```text
ENABLE_PAY_PER_USE=<pre-smoke state>
LOVE_TEST_PAID_SMOKE_APPROVED=false or absent, if used
```

### 8. Expected Evidence

| Evidence | Required Format |
| --- | --- |
| Human approval | Dated statement with masked operator label and exact scope. |
| Target URL | Approved target URL, no secrets. |
| Stripe mode | Test-mode evidence, no live marker. |
| Checkout session | Masked `cs_test_...` ID and status. |
| Payment intent | Masked `pi_...` ID and status, test mode only. |
| Webhook event | Masked `evt_...` ID, event type, delivery status. |
| App result | Screenshot or text evidence of success/unlocked state, with private inputs redacted. |
| DB/order/report evidence | Masked row identifiers only, if approved. |
| Secret scan | `secretHitCount=0`; no `.env*` content copied into evidence. |
| Gate result | Go/No-Go table updated after smoke. |

### 9. Failure Handling

| Failure | Required Response |
| --- | --- |
| Any `sk_live_`, `pk_live_`, live Stripe dashboard marker, or live Price ID evidence | Stop immediately. Stripe test-mode paid smoke remains No-Go. Do not proceed. |
| Missing test-mode Stripe secret, publishable key, webhook secret, or Love premium Price ID | No-Go. Fix configuration outside Codex and resubmit masked evidence. |
| Checkout route returns 403 `Paid unlock is disabled` | No-Go for execution. Confirm `ENABLE_PAY_PER_USE` approval and target state. |
| Checkout route returns 503 `love_premium_report_price_id_missing` | No-Go. Configure test Price ID and rerun readiness. |
| Webhook signature failure | No-Go for webhook readiness. Do not replay without a separate explicit webhook test approval. |
| Webhook succeeds but unlock/entitlement/report is missing | No-Go for Revenue Execution. Record masked evidence and open a source fix PR. |
| Raw secret or private data appears in evidence | Stop, rotate/clean evidence as needed, and mark secret hygiene No-Go. |
| Customer-facing copy shows mojibake or misleading claims during smoke | Record as source/copy blocker before customer-facing paid launch. Do not claim full Revenue Execution Go. |

### 10. Rollback / Disable Plan

1. Keep or restore `ENABLE_PAY_PER_USE=false` or unset outside the approved test window.
2. Keep or restore `LOVE_TEST_PAID_SMOKE_APPROVED=false` or unset after Love-Test Ask smoke.
3. Remove/disable the test webhook endpoint if it is no longer needed.
4. Revoke/rotate any test webhook secret that was exposed to the wrong endpoint or evidence channel.
5. Remove test Price IDs from runtime config only if rollback requires disabling checkout.
6. Revert source changes by PR if a source regression is found. No production deploy is authorized by this packet.
7. Keep Stripe live mode, live paid smoke, and production paid launch No-Go until separate approval.

## Gate Table

| Gate | Status | Notes |
| --- | --- | --- |
| Stripe Test-mode Approval Packet | Go | Packet prepared from source/docs/tests review. |
| Ready for human approval | Go | Ready for human review/approval of a future test-mode smoke, not execution by Codex. |
| Stripe test-mode env evidence | No-Go | Masked human evidence not supplied in this task. |
| Love premium checkout source | Source Go | `/api/checkout` route and billing contract exist. |
| Webhook source | Source Go | Signature verification, idempotency, and checkout completion handling exist. |
| Ask Love-Test paid-intent gate | Source Go | Blocks before Stripe until readiness and approval flags are true. |
| Subscription pricing source | Conditional Go | Route exists; legacy plan/copy path should be reviewed before broad subscription smoke. |
| Stripe Test-mode Paid Smoke | No-Go | No payment executed; requires explicit future approval. |
| Stripe Live | No-Go | Not authorized. |
| Webhook replay | No-Go | Not authorized. |
| Supabase mutation | No-Go | Not authorized by this packet. |
| Revenue Execution | No-Go | Remains closed until Stripe test-mode paid smoke passes and a separate launch approval exists. |

## Final Conclusion

- Stripe Test-mode Approval Packet: Go.
- Ready for human approval: Go.
- Stripe Test-mode Paid Smoke: No-Go until explicit approval.
- Stripe Live: No-Go.
- Revenue Execution: No-Go until test-mode passes and a separate Revenue Execution approval exists.

## 2026-06-27 Source Follow-Up

This packet is being submitted with a source-only paid launch copy cleanup PR.

The PR updates customer-facing pricing and checkout copy to use the canonical Love Premium contract:

- Product: `love_premium_report`.
- Display price: `¥19.9`.
- Amount minor: `1990`.
- Currency: `cny`.

The PR also adds a paid-launch pricing copy contract test so old `$4.99` / `$12.99` Love report copy and known mojibake signatures do not re-enter the paid launch surfaces.

This follow-up does not approve Stripe test-mode paid smoke, Stripe live mode, webhook replay, Supabase mutation, deploy, server mutation, or Revenue Execution.
