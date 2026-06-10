# TianJi Love Paid Funnel Test Readiness 20260525

## 1. What changed

- PR #62 was merged first through the GitHub connector.
- Added `scripts/smoke-stripe-test-readiness.mjs`.
- Added `npm run smoke:stripe:test-readiness`.
- Verified Ask, Draw, and Relationship free-to-paid readiness in static/source mode.
- Ran local non-paid browser QA for `/ask?lang=en`, `/draw?lang=en`, and `/relationship/new?lang=en`.
- No Stripe live mode, production deploy, real secret read, real `.env` read, or paid checkout was run.

## 2. Scope

Included:

- `/ask -> evidence view -> unlock CTA -> checkout start`
- `/draw -> evidence view -> unlock CTA -> checkout start`
- `/relationship/new -> evidence view -> unlock CTA -> checkout start`
- Masked env readiness from current process env only.
- Static checkout/webhook/entitlement path review.
- Browser QA for free preview/result states and unlock-click payload privacy.

Excluded:

- Live Stripe.
- Production deploy.
- Real `.env` files.
- Paid test-card completion.
- Webhook replay.
- Supabase staging mutation.

## 3. Env readiness, masked

Current local process env used by `npm run smoke:stripe:test-readiness`:

| Name | Status | Value |
|---|---|---|
| `STRIPE_SECRET_KEY` | missing | redacted |
| `STRIPE_WEBHOOK_SECRET` | missing | redacted |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | missing | redacted |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | missing | redacted |
| `STRIPE_PRO_YEARLY_PRICE_ID` | missing | redacted |
| `ENABLE_PAY_PER_USE` | missing | redacted |
| `NEXT_PUBLIC_APP_URL` | missing | redacted |
| `LOVE_TEST_PAID_INTENT_TEST_MODE_READY` | missing | redacted |
| `LOVE_TEST_PAID_SMOKE_APPROVED` | missing | redacted |
| Ask/Draw/Relationship price config | inline `price_data` | no price value secret |

Interpretation:

- Stripe test-mode paid smoke is Blocked because required test-mode env is missing.
- Price IDs are not used by the current Ask/Draw/Relationship one-time checkout paths; these paths use inline `price_data`.
- Test/live account mode cannot be proven from source code. It must be proven by masked env classification before paid smoke.

## 4. Funnel verification

| Funnel | Evidence View | Unlock CTA | Checkout Start | Analytics Safe | Paid Completion |
|---|---|---|---|---|---|
| Ask | Go | Go | Go - `/api/ask/unlock` creates Stripe payment Checkout Session | Go | Blocked - missing Stripe test env; completion verifies Checkout Session directly |
| Draw | Go | Go | Go - `/api/draw/unlock` creates Stripe payment Checkout Session | Go | Blocked - missing Stripe test env; completion verifies Checkout Session directly |
| Relationship | Go | Go | Go - UI posts `compatibility_report` to `/api/checkout` | Go | Blocked - missing Stripe test env, webhook secret, Supabase staging persistence, and proven UUID reading |

Additional local QA evidence:

| Route | Evidence card | Unlock CTA | Accuracy feedback | Mobile overflow | Forbidden guarantee language | Payload private leak |
|---|---|---|---|---|---|---|
| `/ask?lang=en` | Go | Go | Go | Go | 0 detected | 0 detected |
| `/draw?lang=en` | Go | Go | Go | Go | 0 detected | 0 detected |
| `/relationship/new?lang=en` | Go | Go | Go | Go | 0 detected | 0 detected |

Captured unlock/checkout/analytics requests did not include the raw Ask question, Draw question, relationship names, or relationship birth dates used as QA sentinels.

## 5. Stripe test-mode result

```text
Stripe test-mode paid smoke: Blocked - missing test env
Checkout session created: Not run
Checkout URL test-mode: Not run
Webhook simulated or received: Not run
Entitlement recorded: Not run
Return to app unlocks paid content: Not run
Analytics checkout_start_from_free_preview: Not run
Stripe live mode: Not run
```

Exact blockers:

- `STRIPE_SECRET_KEY` is missing from current process env.
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is missing from current process env.
- `STRIPE_WEBHOOK_SECRET` is missing from current process env.
- `ENABLE_PAY_PER_USE` is missing, so `/api/checkout` remains disabled for Relationship.
- `NEXT_PUBLIC_APP_URL` is missing, so callback origin is not proven.
- Supabase staging persistence is not proven, so Relationship cannot prove a persisted UUID reading for checkout/webhook completion.

## 6. Entitlement/webhook result

Ask:

- Checkout start path exists at `/api/ask/unlock`.
- Paid completion path exists through `GET /api/ask/unlock?session_id=...&id=...`.
- Completion uses Stripe Checkout Session retrieval and requires `payment_status === 'paid'` or `status === 'complete'`.
- No webhook entitlement is used for Ask.

Draw:

- Checkout start path exists at `/api/draw/unlock`.
- Paid completion path exists through `GET /api/draw/unlock?session_id=...&id=...`.
- Completion uses Stripe Checkout Session retrieval and requires `payment_status === 'paid'` or `status === 'complete'`.
- No webhook entitlement is used for Draw.

Relationship:

- Checkout start path exists at `/api/checkout`.
- `/api/checkout` is gated by `ENABLE_PAY_PER_USE === 'true'`.
- Webhook path exists at `/api/stripe/webhook`.
- `checkout.session.completed` calls `markRelationshipReadingPremium`.
- Local non-Supabase free result produced a non-UUID `rel_*` reading id, while `/api/checkout` requires UUID format. Staging/test smoke must prove Supabase insertion returns a UUID before Relationship checkout can be considered executable.

## 7. Analytics privacy result

```text
Divination evidence analytics payload: Go
Client analytics sanitizer: Go
Server analytics sanitizer for /api/analytics/track: Go
Relationship emitted unlock/checkout analytics payloads: Go in local QA
Private sentinel leakage in captured unlock/checkout/analytics requests: 0 detected
```

Notes:

- Evidence events send route, paid flag, confidence, signal count, source types, and feedback only.
- Ask/Draw free preview APIs necessarily receive the user question to create the preview; the no-leak check here covers unlock, checkout, and analytics requests.
- The exact event name `checkout_start_from_free_preview` is not present in current code. Existing equivalents are `unlock_click`, `relationship_checkout_start`, `love_checkout_created`, and divination evidence unlock events.

## 8. Commands run

```text
GitHub connector merge PR #62: Pass, merged sha 271dcd84bbed5b47ecea40b628685a66d34bd954
git fetch origin main: Pass
git worktree add -b chore/tianji-paid-funnel-test-readiness-20260525 ... origin/main: Pass
rg paid/Stripe/readiness terms: Pass, with expected missing tests directory warning on first broad command
node --check scripts/smoke-stripe-test-readiness.mjs: Pass
npm run smoke:stripe:test-readiness: Pass, exits 0 in non-strict mode and reports Blocked
npm ci --ignore-scripts --no-audit --no-fund: Pass, 936 packages installed
npm run typecheck: Pass
npm run lint: Pass, Next.js lint deprecation warning only
npm run test: Pass, 48 files / 473 tests
npm run build: Pass, jose Edge Runtime warnings only
npm run audit:routes: Pass
npm run audit:copy: Pass
npm run audit:share: Pass
npm run audit:upgrade: Pass
Local next start on port 3062 with dummy local auth secret and disabled live/provider flags: Pass
Puppeteer non-paid browser QA: Pass
Stop local server on port 3062: Pass
Verify port 3062 clear: Pass
```

## 9. Gate status

```text
PR #62 merged: Go
Ask paid funnel readiness: Blocked
Draw paid funnel readiness: Blocked
Relationship paid funnel readiness: Blocked
Stripe test env readiness: Blocked
Checkout session test-mode: Not run
Webhook/entitlement test-mode: Not run
Analytics privacy: Go
Typecheck: Go
Lint: Go
Tests: Go
Build: Go
Production deploy: Not run
Stripe live mode: Not run
Secrets printed: No
```

## 10. Blockers

1. Missing masked Stripe test-mode env evidence.
2. Missing test webhook secret evidence and webhook replay.
3. Missing `ENABLE_PAY_PER_USE=true` test/staging proof for Relationship checkout.
4. Missing test/staging `NEXT_PUBLIC_APP_URL` callback proof.
5. Missing Supabase staging persistence proof for Relationship UUID reading ids.
6. Ask/Draw can verify paid completion by Checkout Session retrieval, but no actual test-mode session was created.
7. The exact analytics event `checkout_start_from_free_preview` does not exist yet.

## 11. Recommended next fix

Run a narrow Stripe test-mode staging/local task after masked env is supplied:

1. Run `npm run smoke:stripe:test-readiness -- --strict`.
2. Prove Ask creates a `cs_test_*` checkout and returns unlocked content after test-card payment.
3. Prove Draw creates a `cs_test_*` checkout and returns unlocked content after test-card payment.
4. Prove Relationship persists a UUID reading, creates a `cs_test_*` checkout, receives webhook, marks the reading premium, and shows the full result.
5. Add or map the missing `checkout_start_from_free_preview` event if the growth dashboard needs that exact event name.
