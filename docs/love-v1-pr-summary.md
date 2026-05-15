# PR Summary

Title: Integrate Tianji Love V1 paid funnel foundation

## Scope

- Integrated Tianji Love homepage session flow.
- Connected homepage form to the real reading session API.
- Unified localized result route to `/[locale]/love-reading/result/[id]`.
- Added free teaser and paid unlock foundation.
- Added Stripe one-time checkout foundation for Love reports.
- Added async report job foundation.
- Added privacy, i18n, preview, QA, and monitoring safeguards.

## Key Decisions

- Removed the duplicate `[sessionId]` localized result route.
- Kept `[id]` as the only localized result route.
- Replaced internal `<a>` links with `next/link` where lint required it.
- Started Love V1 monetization with one-time purchases, not subscriptions.
- Removed the build-time Google Fonts dependency so release builds do not depend on external font fetches.

## Route Changes

- Only localized result route: `/[locale]/love-reading/result/[id]`.
- Session API redirects to the localized result route.
- Private result pages set `noindex, nofollow`.

## Payment Flow

- Checkout products:
  - `solo_love_report`: USD 4.99.
  - `compatibility_report`: USD 12.99.
- Server creates Stripe Checkout sessions through `/api/checkout`.
- Webhook verifies Stripe signatures and processes `checkout.session.completed`.
- Paid access is granted only after webhook-confirmed paid Checkout completion.
- Stripe event IDs are persisted for idempotency.

## Privacy Safeguards

- Birth data is not included in result URLs, checkout metadata, or report recovery email.
- Report recovery email contains only a report title and private report link.
- Result pages are noindexed.
- Share/privacy QA is documented in `docs/love-v1-integration-qa.md`.

## Validation

- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run build`
- [x] `npm run release:check`

## Manual QA

See `docs/love-v1-integration-qa.md`.

## Known Risks

- Stripe sandbox needs final manual payment and webhook verification.
- Email provider needs staging environment verification.
- Supabase migrations need staging application before end-to-end paid unlock QA.
- Staging QA needs a self-hosted preview URL or a temporary server route.
- Legacy Pro subscription routes remain outside the Love V1 checkout path and need product-scope confirmation.

## Rollback

Revert this PR as one unit and redeploy the previous known-good production branch. Re-run `npm run release:check` and smoke test `/en`, `/zh-CN`, pricing, privacy, terms, and existing core reading pages.
