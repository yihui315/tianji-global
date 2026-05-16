# TianJi Love Relationship Revenue Gate Review - 2026-05-16

## Objective

Validate whether the English relationship sales loop is safe to move into staging Stripe test checkout review.

## Decision

| Gate | Decision | Reason |
| --- | --- | --- |
| Non-paid English relationship smoke | Go | Local browser smoke passed for `/relationship/new?lang=en`, free result, locked report CTA, disabled checkout message, and share link origin. |
| Revenue contract | Conditional Go | Local source now separates relationship checkout with `source=relationship`, returns to `/relationship/result/[id]`, and has webhook-side `relationship_readings.is_premium` unlock support. It still needs Stripe test checkout evidence. |
| Staging deploy for paid checkout | No-Go | No staging Stripe/Supabase/env evidence is available locally, so paid checkout cannot be reviewed safely yet. |
| Stripe test checkout smoke | No-Go | Not attempted. Local env has no Stripe test key evidence and `ENABLE_PAY_PER_USE` is not enabled. |
| Production sales launch | No-Go | Paid checkout, webhook, entitlement, return URL, and unlock behavior are not proven. |

## Files Reviewed

- `src/app/relationship/new/client.tsx`
- `src/components/relationship/RelationshipForm.tsx`
- `src/components/relationship/RelationshipResult.tsx`
- `src/app/api/relationship/analyze/route.ts`
- `src/app/api/relationship/share/route.ts`
- `src/app/api/checkout/route.ts`
- `src/app/api/stripe/webhook/route.ts`
- `src/app/relationship/result/[id]/page.tsx`
- `src/app/[locale]/love-reading/result/[id]/page.tsx`
- `src/lib/billing.ts`
- `src/lib/pay-per-use.ts`
- `src/lib/relationship-reading-store.ts`
- `src/lib/report-jobs.ts`
- `src/lib/love-report-generator.ts`
- `src/lib/analytics/relationship-events.ts`
- `src/app/api/analytics/relationship/route.ts`
- `supabase/migrations/001_relationship_tables.sql`
- `supabase/migrations/20260507_stripe_checkout.sql`

## Source Findings

### Passed

- `?lang=en` controls the page state and is passed to `RelationshipForm`, `RelationshipResult`, and `/api/relationship/analyze`.
- English hero copy, sample result card, free result naming, trust panel, and `$4.99` unlock CTA are present.
- Free form does not collect birth location as an input; it displays an advanced-report note instead.
- `compatibility_report` is stable and app-side amount is `499` cents.
- Relationship checkout metadata now carries `source=relationship` and `relationshipReadingId`.
- Relationship checkout success/cancel URLs now return to `/relationship/result/[id]`.
- Stripe webhook can mark `relationship_readings.is_premium=true` for paid relationship checkouts.
- The relationship result route reads server-side premium state before rendering full content.
- `/api/relationship/share` uses `NEXT_PUBLIC_APP_URL || req.nextUrl.origin` and no longer hardcodes `https://tianji.global`.
- `ENABLE_PAY_PER_USE=false` produces a visible disabled checkout message in the UI.
- Relationship funnel analytics allowlist includes the P0 events.

### Revenue Contract

1. `RelationshipResult` sends `/api/checkout`:

```text
productId=compatibility_report
source=relationship
relationshipReadingId=reading.id
locale=en|zh-CN
```

2. `/api/checkout` validates the relationship reading id as a UUID and builds success/cancel URLs under:

```text
/relationship/result/{relationshipReadingId}?lang=en|zh&checkout=success|cancelled
```

3. Stripe metadata includes both the stable product key and source-specific id:

```text
productId=compatibility_report
source=relationship
readingSessionId={relationshipReadingId}
relationshipReadingId={relationshipReadingId}
```

4. The Stripe webhook branches on `source=relationship` and marks the matching `relationship_readings` row premium after paid checkout completion.

5. `/relationship/result/[id]` loads the relationship reading from Supabase and renders full content only when server-side `is_premium=true`.

Remaining limitation: the current `relationship_checkout_success` client event means "checkout session URL created", not payment completed. Actual paid success remains the webhook action.

## Masked Local Env Readiness

Only local `.env.local` was inspected, with values masked. No staging or production env file was read.

| Variable | Present? | Mode | Masked evidence | Status |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | yes | url_present | configured URL, value masked | configured |
| `ENABLE_PAY_PER_USE` | no | missing | missing | missing |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | no | missing | missing | missing |
| `STRIPE_SECRET_KEY` | no | missing | missing | missing |
| `STRIPE_WEBHOOK_SECRET` | no | missing | missing | missing |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | no | missing | missing | missing |
| `STRIPE_PRO_YEARLY_PRICE_ID` | no | missing | missing | missing |
| `NEXT_PUBLIC_SUPABASE_URL` | no | missing | missing | missing |
| `SUPABASE_SERVICE_ROLE_KEY` | no | missing | missing | missing |
| `OPENAI_API_KEY` | no | missing | missing | missing |
| `ANTHROPIC_API_KEY` | no | missing | missing | missing |
| `GEMINI_API_KEY` | no | missing | missing | missing |
| `GOOGLE_API_KEY` | no | missing | missing | missing |
| `NEXT_PUBLIC_GA_ID` | no | missing | missing | missing |
| `NEXT_PUBLIC_POSTHOG_KEY` | no | missing | missing | missing |
| `POSTHOG_KEY` | no | missing | missing | missing |

## Local Smoke Evidence

The app was run locally with process-level `ENABLE_PAY_PER_USE=false`.

| Check | Result |
| --- | --- |
| `/relationship/new?lang=en` loads | Pass |
| English hero appears | Pass |
| Sample result card appears | Pass |
| Birth location input absent | Pass |
| Birth location advanced-report note appears | Pass |
| Free result appears after sample submission | Pass |
| Result copy is English | Pass |
| `$4.99` unlock CTA appears | Pass |
| Locked sections appear | Pass |
| Trust panel appears | Pass |
| Unlock click with gate disabled shows visible message | Pass |
| Share route uses local origin | Pass |
| Share success shows `Link copied` | Pass |
| Old `tianji.global` share domain absent | Pass |

Local analytics POSTs returned `503` because the local analytics persistence environment is not configured. This is acceptable for local smoke but must be fixed or explicitly verified in staging.

## Commands Run

- `git status --short`
- `git diff -- src/app/relationship/new/client.tsx`
- `git diff -- src/components/relationship/RelationshipForm.tsx`
- `git diff -- src/components/relationship/RelationshipResult.tsx`
- `git diff -- src/app/api/relationship/share/route.ts`
- `git diff -- src/lib/billing.ts`
- `git diff -- src/lib/relationship-engine.ts`
- `git diff -- src/lib/analytics/relationship-events.ts`
- `rg` source review for checkout, webhook, entitlement, relationship readings, analytics events, and env keys
- Local source fix for relationship checkout/webhook/result unlock contract
- `npm run typecheck`
- `npm run lint`
- `npx vitest run src/__tests__/relationship-flow-contract.test.ts src/__tests__/stripe-checkout-contract.test.ts src/__tests__/tianji-love-p0-pages-contract.test.ts --coverage=false`
- `npm run audit:share`
- `npm run audit:routes`
- `npm run audit:copy`
- `npm run audit:upgrade`
- `npm run build`
- `npm run test`
- Local `npm run dev -- --hostname 127.0.0.1 -p 3061` with `ENABLE_PAY_PER_USE=false`
- Puppeteer local smoke scripts for relationship submit, locked result, gated unlock, and share link
- Masked `.env.local` presence/mode classifier

## Validation Result

| Command | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| Targeted Vitest contract suite | Pass, 3 files / 24 tests |
| `npm run audit:share` | Pass |
| `npm run audit:routes` | Pass |
| `npm run audit:copy` | Pass |
| `npm run audit:upgrade` | Pass |
| `npm run build` | Pass, 106 static pages |
| `npm run test` | Pass, 52 files / 495 tests |

## Required Evidence Before Revenue Gate Can Pass

1. Masked staging env evidence must show Stripe test-mode keys, Supabase readiness, webhook secret presence, and staging `NEXT_PUBLIC_APP_URL`.
2. Staging must enable `ENABLE_PAY_PER_USE=true` only with test-mode Stripe keys.
3. A Stripe test checkout must complete for `compatibility_report`.
4. Webhook evidence must show paid session completion and `relationship_readings.is_premium=true`.
5. Returning to `/relationship/result/[id]?checkout=success` must show full content after server-side verification.

## Suggested Commit Message

```text
feat: gate english relationship report funnel
```
