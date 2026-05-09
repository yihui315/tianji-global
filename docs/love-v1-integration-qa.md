# Love V1 Integration QA Checklist

Use this checklist against the staging or self-hosted preview URL before approving the `codex/integration-love-v1` branch. Do not use production credentials or real payment cards during QA.

## Environment Gate

- Confirm preview uses staging or test-mode environment variables only.
- Confirm required environment variables are present by name, without exposing values.
- Confirm no `.env` file changes are included in the branch.
- Confirm `npm run release:check` passes before manual QA starts.

## Manual QA Paths

| Area | Path or action | Expected result |
| --- | --- | --- |
| English homepage | `/en` | Page loads without console errors and primary love-reading CTA is visible. |
| Chinese homepage | `/zh-CN` | Page loads without console errors and localized navigation remains usable. |
| Solo Reading submit | Complete the solo reading form with valid birth year, month, day, and time. | Form posts to the real session API and redirects to `/[locale]/love-reading/result/[id]`. Birth data is not present in the URL. |
| Couple Reading behavior | Select Couple Reading and complete required partner fields if shown. | Validation is clear, safe, and no incomplete submission creates a broken result page. |
| Result teaser page | Open a newly created result page while unpaid. | Free teaser is visible; private birth details are not exposed. |
| Unlock full report | Click the unlock CTA from an unpaid result page. | Checkout opens in test mode or shows a safe staging fallback; no client-only unlock occurs. |
| Pricing page | Open the pricing route linked from the site. | Solo and compatibility report prices match the configured test checkout products. |
| Privacy page | Open the privacy page linked from the site. | Page loads and describes privacy handling for readings and purchases. |
| Terms page | Open the terms page linked from the site. | Page loads and includes service/payment terms. |
| Share privacy check | Open a share page for a reading or relationship link. | Shared URL does not include raw birth data, email, Stripe IDs, or private report content. |
| Mobile viewport | Test 375x812 and 390x844 viewports. | Forms, result teaser, checkout CTA, navigation, and legal links fit without overlap. |
| Reduced motion | Enable reduced motion in the browser/OS and reload. | Motion-heavy sections remain readable and do not block form submission. |
| Rollback steps | Review the rollback section below. | Reviewer can identify the revert path and validation needed after rollback. |

## Payment QA

- Use Stripe test mode only.
- Verify the checkout success URL returns to a localized result route.
- Verify the result remains locked before the webhook entitlement is processed.
- Verify a completed `checkout.session.completed` test webhook unlocks the full report.
- Replay the same webhook event and confirm it is idempotent.
- Send an invalid-signature webhook and confirm it is rejected.

## Privacy QA

- Inspect URLs after form submit, checkout return, and share flow.
- Confirm raw birth date, birth time, birth place, email, and provider secrets are not present in URLs, visible metadata, or client logs.
- Confirm result pages are private or noindexed when they contain user-specific content.

## Rollback Plan

1. Revert the integration PR or branch commits as a single rollback unit.
2. Redeploy the previous known-good production branch.
3. Run `npm run release:check` on the rollback commit.
4. Smoke test `/en`, `/zh-CN`, pricing, privacy, and terms pages.
5. Confirm payment webhooks are still pointed at the intended environment before resuming launch traffic.
