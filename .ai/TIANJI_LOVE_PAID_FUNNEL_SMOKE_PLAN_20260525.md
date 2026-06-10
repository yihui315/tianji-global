# TianJi Love Paid Funnel Smoke Plan 20260525

## Manual Stripe test-mode steps

1. Confirm branch contains the readiness script and latest evidence layer.
2. Supply only test-mode/local or staging env. Do not use live keys.
3. Run `npm run smoke:stripe:test-readiness -- --strict`.
4. Start a local or staging server with the same masked test env.
5. If testing Relationship, confirm Supabase staging writes are enabled and `relationship_readings.id` is a UUID.
6. Start Stripe CLI webhook forwarding to `/api/stripe/webhook` for the same app origin.
7. Use `/ask?lang=en`, submit a non-sensitive test question, click unlock, verify the Checkout Session is test-mode, complete with a Stripe test card, and confirm unlocked content returns.
8. Use `/draw?lang=en`, submit a non-sensitive test question, click unlock, verify the Checkout Session is test-mode, complete with a Stripe test card, and confirm unlocked content returns.
9. Use `/relationship/new?lang=en`, create a free result, confirm the reading id is a UUID, click unlock, verify Checkout Session is test-mode, complete with a Stripe test card, confirm webhook receipt, and confirm the result unlocks.
10. Save only masked evidence and Go/No-Go results.

## Required env names

Required for strict readiness:

- `STRIPE_SECRET_KEY` - must be test-shaped.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - must be test-shaped.
- `STRIPE_WEBHOOK_SECRET` - must be present; mode is not inferable from prefix.
- `ENABLE_PAY_PER_USE=true` - required for `/api/checkout` Relationship path.
- `NEXT_PUBLIC_APP_URL` - must match the local/staging callback origin.

Required for Relationship completion:

- Supabase staging URL/key/service-role configuration as already expected by the app.
- `DATABASE_URL` if order/webhook persistence is being verified through database-backed helpers.

Optional/currently not used by the three one-time flows:

- `STRIPE_PRO_MONTHLY_PRICE_ID`
- `STRIPE_PRO_YEARLY_PRICE_ID`

## Expected checkout behavior

Ask:

- Preview renders free evidence.
- Unlock CTA posts to `/api/ask/unlock`.
- Checkout Session is created with `mode: payment`.
- Checkout URL is test-mode.
- Success returns to `/ask?...&session_id=...`.
- `GET /api/ask/unlock` verifies paid/complete session and returns full answer.

Draw:

- Preview renders free evidence.
- Unlock CTA posts to `/api/draw/unlock`.
- Checkout Session is created with `mode: payment`.
- Checkout URL is test-mode.
- Success returns to `/draw?...&session_id=...`.
- `GET /api/draw/unlock` verifies paid/complete session and returns full reading.

Relationship:

- Free result renders evidence.
- Reading id is a UUID from Supabase staging persistence.
- Unlock CTA posts `compatibility_report` to `/api/checkout`.
- Checkout Session is created with `mode: payment`.
- Checkout URL is test-mode.
- Success returns to `/relationship/result/<uuid>?checkout=success`.

## Expected webhook behavior

- `/api/stripe/webhook` requires `STRIPE_WEBHOOK_SECRET`.
- Stripe signature verification succeeds.
- `checkout.session.completed` is recorded idempotently.
- Relationship checkout calls `markRelationshipReadingPremium`.
- Love report/session checkout paths continue to create report jobs as applicable.
- Refund events remain non-destructive and only mark order status.

## Expected entitlement behavior

Ask:

- No stored entitlement expected.
- Paid completion is direct Checkout Session verification.

Draw:

- No stored entitlement expected.
- Paid completion is direct Checkout Session verification.

Relationship:

- Webhook updates `relationship_readings.is_premium=true`.
- Result page reload reads the premium state and shows full content.

## Expected analytics events

Expected current events:

- `divination_evidence_viewed`
- `paid_unlock_from_evidence_clicked`
- `ask_preview_started`
- `ask_preview_completed`
- `draw_preview_started`
- `draw_preview_completed`
- `unlock_click`
- `relationship_free_completed`
- `relationship_unlock_click`
- `relationship_checkout_start`
- `relationship_checkout_success`
- `love_checkout_created`
- `love_checkout_success`

Current gap:

- Exact event name `checkout_start_from_free_preview` is not implemented. Use the current events above for smoke evidence, or add a narrow analytics mapping before dashboarding requires that exact name.

Privacy expectation:

- Analytics must not include raw question, raw report, names, birth date, birth time, birth location, timezone, payment details, Stripe keys, webhook secrets, provider prompts, or model output.

## Rollback plan

- Stop local/staging server.
- Stop Stripe CLI webhook forwarding.
- Disable `ENABLE_PAY_PER_USE`.
- Remove test-only env from the local/staging shell session.
- Do not roll back production because production is not touched.
- If a narrow code fix was introduced, revert only that branch/PR before merge.

## No-Go conditions

- Any `sk_live_`, `rk_live_`, or `pk_live_` shape appears.
- Raw secrets, token fragments, cookies, or `.env` values are printed or committed.
- Checkout URL is not test-mode.
- Webhook cannot verify signature.
- Relationship reading id is not a UUID before checkout.
- Relationship webhook does not mark premium.
- Ask/Draw session verification fails after test-card payment.
- Analytics payload includes raw private question/name/birth/payment/report data.
- Any production deploy, Nginx/PM2/DNS mutation, live Supabase data mutation, or live Stripe mutation is required.
