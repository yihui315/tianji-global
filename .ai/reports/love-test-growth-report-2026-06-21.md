# TianJi Love — Growth Report — 2026-06-21

## Status

**SKIPPED — Real KPI data required.** All available KPI sources under `data/` still contain only placeholder zero rows. No real per-content metrics, funnel conversions, or paid-intent events are present. Per the `tianji-github-kpi-analysis` skill workflow step 2, when every metric is empty / zero / placeholder-only, analysis must be skipped and this report must explicitly record the data gap rather than fabricate a hook ranking, conversion commentary, or next-day plan.

## KPI Source Files Inspected

```text
data/love-test-day-001-kpi-entry.csv      — all 16 rows: 0 impressions / 0 clicks / 0 love_test_starts
                                              paid_smoke_result=not_run, note: "manual entry after publish"
data/love-test-day-002-kpi-entry.csv      — all 16 rows: 0 impressions / 0 clicks / 0 love_test_starts
                                              paid_smoke_result=not_run, note: "manual entry after publish"
data/love-test-marketing-kpi.csv          — template rows only (xiaohongshu / douyin / videohao)
                                              notes: "template row"
data/love-test-funnel-metrics.csv         — one row, every funnel rate = 0
                                              notes: "template baseline; paid conversion remains not measured
                                              until approved smoke/live gate"
data/love-test-kpi-tracking.csv           — 2026-05 period row, every metric = 0
data/love-test-event-tracking.csv         — event contract only, no observed counts
```

Across these six files, **zero rows** contain real impressions, clicks, `love_test_starts`, `result_views`, `share_card_clicks`, `ask_next_clicks`, `paid_intent_views`, `preview_submits`, `unlock_clicks`, `checkout_ready`, or paid-smoke verdicts. Every numeric field is `0` and every `paid_smoke_result` field is `not_run`. The notes columns are all instructional (e.g. `manual entry after publish`, `template row`, `outline only`, `manual entry if used`, `manual entry after outreach`).

## Gate Status

```text
KPI source file:           No-Go - missing real metrics
KPI analysis report:       Not run - blocked by source No-Go
Optimization notes:        Not run - blocked by source No-Go
Fake metrics:              No-Go - none invented in this run
Stripe checkout execution: Not run
Paid smoke:                No-Go - awaiting explicit approval
Production deploy:         No-Go
```

## Skipped Analyses

The following comparisons and rankings would normally be produced by this skill, but are explicitly **deferred** until real KPI rows exist for at least one of the Day 001 / Day 002 publishing packs:

1. Impressions-vs-clicks comparison per channel (xiaohongshu / douyin / videohao).
2. `homepage_to_love_test_ctr` and `love_test_start_rate` per day.
3. Strongest hook identification across Day 001 vs Day 002 copy variants.
4. Weakest topic identification across the six Xiaohongshu posts.
5. Share-card caption performance ranking (Day 001 has 5 candidates, Day 002 has 5 candidates).
6. `ask_next_clicks` → `paid_intent_views` → `unlock_clicks` funnel drop-off for `/love-test`.
7. Hook-format comparison (post vs short_video vs caption vs dm_template vs keyword_outline).

## Data Gaps That Block Analysis

| Gap | Impact | Required Action |
|-----|--------|-----------------|
| Day 001 KPI rows are still zero / `not_run` | Cannot baseline against the Day 001 theme ("他现在到底在想什么 / 暧昧期要不要主动") | Operator must fill `impressions`, `clicks`, `love_test_starts`, `result_views`, `share_card_clicks`, `ask_next_clicks` from platform dashboards for each `day001-xhs-*`, `day001-dy-*`, `day001-vh-*`, `day001-share-*`, `day001-kol-*`, `day001-seo-*` row. |
| Day 002 KPI rows are still zero / `not_run` | Cannot evaluate the "waiting posture" theme at all | Operator must fill the same fields for each `day002-*` row once manual publishing completes. |
| `love-test-marketing-kpi.csv` is template-only | No aggregate channel roll-up exists | Replace template rows with the day's real per-channel numbers; do not delete the schema. |
| `love-test-funnel-metrics.csv` baseline row is zero | No CTR / start / view / share / paid-intent funnel rates to compute | Either compute rates from the filled per-row CSVs or replace the baseline row with computed values. |
| `love-test-kpi-tracking.csv` 2026-05 period is zero | No month-over-month baseline | Fill from the periodic Love-Test funnel dashboard once it is wired up. |
| Paid smoke results | `paid_smoke_result` is `not_run` for every row; checkout readiness, unlock clicks, and paid conversions are zero | Requires the `paid_smoke` and `production` gates to flip Source Go before any value can be safely observed. |
| Day 001 vs Day 002 share-card captions overlap | Cannot compare share-card click-through between themes until Day 002 captions are actually used | Operator must mark which Day 002 share-card captions were posted and where. |

## Assumptions Recorded

- None on performance. No hook, topic, format, channel, or funnel assumption is recorded because the data required to derive one does not exist.
- Operational assumption only: Day 001 manual publishing and Day 002 manual publishing were prepared on this branch (`infra/tianji-love-production-baseline-20260531`) via the prior `tianji-github-daily-growth` run, and the operator still needs to publish the assets and fill the KPI rows manually.

## Out-of-Scope Confirmations

- No `.env`, secrets, Stripe Price IDs, webhook secrets, or production configuration values were read, printed, copied, diffed, or inferred in this run.
- No Stripe checkout was executed.
- No paid smoke was executed.
- No production deploy, Vercel deploy, or production Supabase mutation was attempted.
- No social auto-posting or account credential use occurred.
- No KPI row in `data/love-test-day-001-kpi-entry.csv` or `data/love-test-day-002-kpi-entry.csv` was overwritten. The zero placeholders were left intact for operator entry.

## Recommended Operator Action Before Next Cron Run

1. Publish Day 001 and Day 002 assets according to `assets/marketing/daily/day-001-publishing-pack.md`, `assets/marketing/daily/day-001-review-checklist.md`, `assets/marketing/daily/day-002-publishing-pack.md`, and `assets/marketing/daily/day-002-review-checklist.md`.
2. Fill real values into every numeric column of `data/love-test-day-001-kpi-entry.csv` and `data/love-test-day-002-kpi-entry.csv` from the platform dashboards. Update `paid_smoke_result` to `pass`, `fail`, or leave `not_run` depending on the actual outcome.
3. Update `data/love-test-marketing-kpi.csv` and `data/love-test-funnel-metrics.csv` with the same data.
4. Re-run this cron skill only after at least one of the day-level CSVs contains a non-zero row, so the analysis step has grounded numbers to work with.