# Love V1 Launch Monitoring

Monitor for 72 hours after launch using the existing analytics and support systems. Do not add a new analytics provider for this launch.

## Metrics

| Metric | Target | Source |
| --- | --- | --- |
| Homepage CTA click rate | 8%+ | Existing analytics events |
| Form completion rate | 35%+ | Session creation events and page views |
| Result page view rate | Track baseline | Result page views after session creation |
| Unlock click rate | 15%+ from free result page | Checkout CTA events or checkout API attempts |
| Checkout success rate | 8%+ from free result page | Stripe test/live dashboard and paid order rows |
| Payment failure rate | Investigate sustained spikes | Stripe dashboard |
| Report generation success rate | 95%+ | `report_jobs` status counts |
| Refund/support issue tracking | Under 5% complaint/refund rate | Support inbox and Stripe refunds |

## Rollback Triggers

- `npm run release:check` fails on the release commit.
- Session creation fails for a material share of users.
- Result pages expose raw birth data, emails, Stripe IDs, or private report content.
- Stripe webhook signature verification or idempotency fails.
- Paid orders do not unlock reports after webhook delivery.
- Report generation success rate drops below 95%.
- Refund or complaint rate exceeds 5%.
- Privacy, terms, or payment recovery pages become unavailable.

## Response Plan

1. Pause launch traffic or remove promotional links.
2. Revert the integration PR.
3. Redeploy the previous known-good production branch.
4. Verify `/en`, `/zh-CN`, pricing, privacy, terms, and existing core readings.
5. Reconcile any paid orders created during the incident before retrying launch.
