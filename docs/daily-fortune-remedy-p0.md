# Daily Fortune & Remedy P0

## Product Scope

Daily Fortune P0 provides one canonical daily report per user/profile/date/system/language/tier. The report includes an overall score, four dimension scores, a short headline, a summary, deterministic drivers, risk tags, low-risk remedy actions, feedback, and a disclaimer.

P0 is rule-based. AI/NLG is optional and disabled by default.

## Data Model

- `daily_fortune_reports`: canonical generated report, keyed by `cache_key`.
- `fortune_remedy_rules`: active remedy rule catalog.
- `fortune_remedy_actions`: rendered actions attached to a report.
- `push_delivery_logs`: email, Telegram, web push, and in-app delivery attempts.
- `fortune_feedback`: user feedback for reports/actions.

The migration reuses existing `users`, `user_profiles`, `destiny_profiles`, `module_results`, `entitlements`, `analytics_events`, and `handle_unified_updated_at()`.

## API

- `GET /api/daily-fortune/today`
- `POST /api/daily-fortune/generate`
- `GET /api/daily-fortune/history`
- `POST /api/remedies/feedback`

All report APIs require a logged-in user unless the generate route is called with the cron secret. User access is owner-scoped.

## Generator Logic

The generator is deterministic and does not call an LLM. It builds a stable seed from:

```text
daily_fortune:{user_id}:{profile_id_or_none}:{date}:{system_type}:{language}:{tier}
```

Scores are clamped to `0..100`. Missing profile data falls back to a generic daily context.

## Remedy Rule Logic

Rules are matched from `riskTags`, score thresholds, and tier. Free users receive up to two remedies. Premium and pro users receive up to five. If no rule matches, the engine returns a low-risk self-observation action.

## Safety Policy

Daily Fortune copy is for entertainment and self-observation. The rule layer avoids professional or deterministic claims. Wealth copy stays limited to delayed decisions, budgeting, and impulse control. Health copy stays limited to rest, hydration, and self-observation. Love copy stays limited to communication boundaries and emotional pacing.

## Email / Telegram Dispatch

`/api/cron/daily-digest` keeps the legacy digest path unless `DAILY_FORTUNE_DISPATCH_ENABLED=true`. When enabled, the cron reads or generates the canonical report and writes `push_delivery_logs`.

`DailyDigestEmail` accepts `dailyFortuneReport` while preserving legacy `sections`.

Telegram `/daily` uses the canonical report when `DAILY_FORTUNE_ENABLED=true` and a linked TianJi user exists. Unlinked Telegram users receive a binding prompt.

## Entitlement Behavior

Tier values are `free`, `premium`, and `pro`. Missing entitlements default to `free`.

Free responses include summary, scores, a reduced driver list, and up to two remedies. Premium/pro responses include more drivers and up to five remedies. Locked API content is marked with:

```json
{ "locked": true, "reason": "premium_required" }
```

## Rollout Plan

Default flags are conservative:

```text
DAILY_FORTUNE_ENABLED=false
DAILY_FORTUNE_DISPATCH_ENABLED=false
DAILY_FORTUNE_NLG_ENABLED=false
```

Enable API/page first for internal users, then enable dispatch after delivery logs are verified.

## Known Limitations

- No production database migration has been applied by this task.
- Optional premium NLG is scaffold-only until the env flag and provider configuration are explicitly enabled.
- Telegram canonical reports require a linked TianJi user id.
