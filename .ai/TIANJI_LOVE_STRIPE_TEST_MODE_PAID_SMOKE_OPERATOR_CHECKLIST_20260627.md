# TianJi Love Stripe Test-Mode Paid Smoke Operator Checklist - 2026-06-27

This checklist is for a future human operator. Codex must not execute these steps in this task.

## Safety Boundary

- Test mode only.
- No Stripe live mode.
- No production paid launch.
- No `.env*` reads by Codex.
- No webhook replay by Codex.
- No Supabase production mutation.
- No deploy, PM2, Nginx, DNS, or server mutation.
- No social auto-posting.

## Preflight

1. Confirm the approved target URL.
2. Confirm masked Stripe test-mode key evidence exists.
3. Confirm masked webhook signing-secret evidence exists for the same target.
4. Confirm the Love premium test Price ID maps to:
   - product: `love_premium_report`
   - amount: `1990`
   - currency: `cny`
   - display: `¥19.9`
5. Confirm `ENABLE_PAY_PER_USE=true` only for the approved smoke window.
6. Run source/readiness checks before any payment attempt:

```powershell
npm run smoke:stripe:test-readiness
npm run test -- src/__tests__/stripe-checkout-contract.test.ts src/__tests__/api/stripe-webhook-degraded-guard.test.ts
```

## Test Card Steps

Use Stripe test mode only.

1. Start from an approved Love Reading or Relationship result on the approved target.
2. Click the Love premium unlock CTA.
3. Confirm the browser opens a Stripe test-mode Checkout page.
4. Use the Stripe test card:
   - card: `4242 4242 4242 4242`
   - expiry: any future date
   - CVC: any three digits
   - ZIP/postal: any valid value
5. Complete Checkout only if no live-mode marker appears.

## Expected Checkout Session

| Field | Expected |
| --- | --- |
| ID | Masked `cs_test_...` |
| mode | `payment` |
| product | `love_premium_report` |
| currency | `cny` |
| amount | `1990` |
| target | Approved test target only |
| live marker | none |

## Expected Success Page

- Love Reading success returns to `/{locale}/love-reading/result/{id}?checkout=success`.
- Relationship success returns to `/relationship/result/{id}?lang={en|zh}&checkout=success`.
- Private inputs remain redacted from evidence screenshots.
- The page should show paid/unlocked state only after test-mode payment and webhook/order handling have completed.

## Expected Webhook Behavior

- Stripe sends `checkout.session.completed` in test mode.
- App returns 2xx for a valid signed event.
- Duplicate event handling remains idempotent.
- Evidence stores only masked `evt_...`, `cs_test_...`, and status labels.
- No raw webhook payload containing private data is stored in `.ai`.

## Expected Order / Report Unlock Behavior

- Order row transitions from pending to paid on the approved test target.
- Relationship result grants premium access when source is `relationship`.
- Love Reading result creates or unlocks the report job when source is `love_reading`.
- If report generation or entitlement is missing, Revenue Execution remains No-Go and a source-fix PR is opened.

## Failure Rollback

1. Stop on any live marker, missing evidence, 4xx/5xx Checkout error, webhook signature error, missing entitlement, or raw secret exposure.
2. Restore the pre-smoke gate state:

```text
ENABLE_PAY_PER_USE=<pre-smoke state>
LOVE_TEST_PAID_SMOKE_APPROVED=false or absent, if used
```

3. Disable or remove the test webhook endpoint if it was created only for the smoke.
4. Record No-Go with masked evidence.
5. Do not retry without a new explicit approval if the failure is safety, evidence, approval, live-mode, or secret related.

## Evidence Format

```text
operator=<masked human label>
approved_at=<ISO timestamp>
target_url=<approved target>
checkout_session=cs_test_...masked
payment_intent=pi_...masked
webhook_event=evt_...masked
stripe_mode=test
product=love_premium_report
amount=1990
currency=cny
success_page=<masked screenshot or text summary>
order_unlock=<paid/unlocked/missing>
secretHitCount=0
production_excluded=true
verdict=go|no_go
```

## Final Human Approval Phrase

```text
Approved: execute TianJi Love Stripe test-mode paid smoke only on <approved target>, with Stripe test keys and Stripe test card only; no live mode, no production paid launch, no webhook replay by Codex, no Supabase production mutation, no deploy, no social posting.
```
