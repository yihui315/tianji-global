# TianJi Love Revenue Funnel Runbook

## Scope

This runbook covers the frontend-only Lane B funnel:

1. Homepage free relationship entry.
2. Ask one-question preview and one-time unlock CTA.
3. Draw three-card relationship preview and one-time unlock CTA.
4. Pricing clarity for free, one-time, monthly, and yearly paths.
5. Privacy-safe funnel analytics.

Backend payment behavior, Stripe webhook behavior, unlock API core logic, model gateways, provider smoke, Supabase production, Resend, and deployment are outside this runbook.

## Funnel Map

| Surface | Free action | Upgrade action | Analytics event |
| --- | --- | --- | --- |
| Homepage | Start Free Love Reading | Link to pricing/subscription education | `relationship_start_click` |
| Relationship result | View free first signal | Click relationship upgrade | `relationship_free_result_view`, `relationship_upgrade_click` |
| Ask | Generate private preview | One-time Ask unlock | `ask_preview_view`, `ask_unlock_click` |
| Draw | Generate three-card preview | One-time Draw unlock | `draw_preview_view`, `draw_unlock_click` |
| Pricing | View plan and unlock choices | Click Monthly or Yearly | `pricing_view`, `pricing_plan_click` |
| Login redirect | Start auth from pricing | Existing auth flow | `login_start` |

## Copy Boundaries

- Say readings are reflection, timing, pattern language, and practical next-step guidance.
- Do not claim guaranteed predictions, guaranteed outcomes, exact future certainty, medical advice, legal advice, financial advice, crisis advice, or fear-based urgency.
- Do not imply paid unlocks make the answer certain.
- Subscription copy may describe history and report-ready output only where implemented.

## Analytics Privacy Contract

Client funnel payloads must exclude:

- `birthDate`
- `birthTime`
- `birthLocation`
- `timezone`
- raw question text
- full answer text
- full result text

Use `trackRevenueFunnelEvent()` from `src/lib/analytics/funnel-events.ts`. It routes through `trackClientEvent()`, which strips sensitive payload keys before sending to `/api/analytics/track`.

## Validation

Run these before merging Lane B:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run audit:routes
npm run audit:copy
npm run audit:share
npm run audit:upgrade
npm run audit:ask-revenue-contract
npm run audit:draw-revenue-contract
git diff --check
```

If local dependencies are missing, restore from the existing lockfile only. Do not add dependencies for this funnel polish.

## Safe Rollback

Revert only the Lane B frontend, docs, tests, and analytics-helper files from the revenue funnel polish commit. Do not touch Lane A degraded staging files, backend payment routes, Stripe webhook logic, unlock API core logic, model gateway files, staging smoke scripts, or production deployment files.
