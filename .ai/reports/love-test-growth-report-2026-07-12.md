# TianJi Love Test Growth Report — 2026-07-12

> Skill: `tianji-github-kpi-analysis` (weekly cron `0 2 * * 0`).
> Date of run (UTC): 2026-07-12 02:00 UTC.
> Day 024 KPI entry: `data/love-test-day-024-kpi-entry.csv` (publishing date 2026-07-17, scaffold markers, every numeric field empty, notes column = `manual entry after publish`).
> Day 019 KPI entry: `data/love-test-day-019-kpi-entry.csv` (publishing date 2026-07-12, scaffold markers, every numeric field empty, notes column = `manual entry after publish`).
> Bridge refresh (`python3 ~/.hermes/scripts/run_revenue_funnel.py`) wrote a new row to `data/love-test-funnel-metrics.csv` for 2026-07-12 with `notes=real_db_pipeline`; all ten funnel-rate columns are `0` / `0.0` and `revenue_cny=0`.
> Aggregate `data/love-test-marketing-kpi.csv`: 2 template rows dated 2026-05-24 (`xhs-001`, `dy-001`, `vh-001`), `notes=template row`, every numeric field `0`, `paid_smoke_result=not_run`.

## Verdict: Real KPI Data Required — Analysis Skipped

Per the skill workflow step 2, the most recent KPI source files contain only placeholder / zero values with `manual entry after publish` scaffold markers on the per-day CSV rows and `real_db_pipeline` zeros on the funnel CSV. There is no real, manually-entered engagement number, no real funnel rate, and no real revenue number to analyze. Writing hook, topic, channel, or conversion rankings would violate the skill's "Forbidden Actions" rule against fabricating metrics, conversions, sales, users, testimonials, or attribution.

Cross-check across the freshest day-level KPI files (which are the ones a manual publisher could have back-filled):

```text
day-015 (2026-07-10): impressions=__ clicks=__ love_test_starts=__ result_views=__  (empty)
day-016 (2026-07-10): impressions=__ clicks=__ love_test_starts=__ result_views=__  (empty)
day-019 (2026-07-12): impressions=__ clicks=__ love_test_starts=__ result_views=__  (empty)
day-023 (2026-07-10): impressions=__ clicks=__ love_test_starts=__ result_views=__  (empty)
day-024 (2026-07-17): impressions=__ clicks=__ love_test_starts=__ result_views=__  (empty)
```

Every numeric column (`impressions`, `clicks`, `leads_captured`, `revenue_usd`) is blank on every day-row of the most recent publish cycles. The 2026-07-12 funnel CSV row also shows `home→test=0.0`, `test→result=0.0`, `result→unlock=0.0`, `unlock→checkout=0.0`, `checkout→paid=0.0`, and `revenue_cny=0`. There is no signal to rank, no hook to declare strongest, no topic to declare weakest, no channel to declare best, and no conversion rate to compare.

## Metrics

- Today's lead count: no real data yet (per-day CSV is empty; funnel CSV is all zero)
- Clicks: no real data yet
- Love-test starts: no real data yet
- Result views: no real data yet
- Share card clicks / downloads: no real data yet
- Ask-next clicks: no real data yet
- Paid intent views / unlock clicks / checkout events: no real data yet
- Revenue: `revenue_cny=0` on the 2026-07-12 funnel row; `revenue_usd` blank on every per-day row

## Hooks

- Top hooks: no real data yet — cannot rank from empty rows
- Weak hooks: no real data yet — cannot rank from empty rows
- Note: Day 024 publishing pack ships 5 Xiaohongshu posts, 5 Reels, 5 X posts, 3 Reddit/Quora answers, 2 KOL DMs, 3 SEO outlines, and share-card captions under the theme "the small question is no longer 'will they come back', it's 'what does my week look like that isn't about them'." Day 019 ships a similar pack under the "naming the rhythm is not deciding what to do with it" theme. These copy assets exist, but no publish-time engagement data is available to score any of them.

## Channel

- Best channel: no real data yet — no channel has a non-zero engagement cell
- Channel coverage attempted in Day 024: xiaohongshu, reels, x, reddit, kol, seo. No engagement signal to rank them.
- Channel coverage attempted in Day 019: xiaohongshu, reels, x, reddit, kol, seo. No engagement signal to rank them.

## Conversion Funnel

- Preview-submit → unlock-click → checkout-ready → paid-smoke chain: no real data yet
- The 2026-07-12 bridge row in `data/love-test-funnel-metrics.csv` shows all stage rates as `0` / `0.0` and `revenue_cny=0`. Funnel-stage comparison is not possible without inventing numbers.

## Strongest Hook / Weakest Topic

- Strongest hook: **Not identified** — no engagement data exists.
- Weakest topic: **Not identified** — no engagement data exists.

## Tomorrow (Day 025) Recommendation

The skill cannot recommend a next-day content direction grounded in the entered metrics. Until at least one publish cycle produces real impressions, clicks, and love-test starts, the correct action is:

1. Manually publish Day 024 copy on the planned channels and record real numbers into `data/love-test-day-024-kpi-entry.csv` (replace the empty placeholders in the row for the publish you actually did, or append a new row for any additional publish).
2. When at least one row has a non-zero `impressions` value plus a non-zero `clicks` or `love_test_starts` value, re-run the `tianji-github-kpi-analysis` skill. The Day 024 publishing pack and Day 024 review checklist already define the surface mix to publish; this skill run only needs the resulting numbers, not new copy.
3. Do not change the content calendar direction in response to this run — there is no signal to justify a direction change.

If a manual publisher needs a working direction in the meantime, the existing Day 025 row in `data/love-test-content-calendar.csv` (or the rotation pool) should be used as-is; the next-day optimization notes file is intentionally not created this run because it would have to be invented.

## Assumptions

- The empty numeric cells in `data/love-test-day-019-kpi-entry.csv` and `data/love-test-day-024-kpi-entry.csv` are placeholder / scaffold values, not real zeros from a published post. This is supported by the `notes` column on every row containing the literal string `manual entry after publish`, by the absence of any row with a real publish-time context, and by the absence of any row with a non-zero numeric value.
- The `0` values in `data/love-test-funnel-metrics.csv` for 2026-07-12 are real bridge-output zeros, not placeholder text. This is supported by the `notes` column on that row containing the literal string `real_db_pipeline`, by the bridge script's stdout confirming `home_view: 0`, `test_start: 0`, `result_view: 0`, `unlock_click: 0`, `checkout_created: 0`, `checkout_success: 0`, and `paid_orders: 0`, and by the absence of any DB-side event rows that the bridge script would have surfaced as non-zero rates. Real zero is a valid measurement when the production DB has no matching event rows; in this run it just means no engagement has been recorded yet.
- Day 019 KPI entry was created at 2026-07-12 01:23 UTC and Day 024 KPI entry at 2026-07-11 01:19 UTC, both ahead of this skill's 02:00 UTC cron window. Manual publishing has not been observed as complete for either day.
- Day 019 publishing pack commit `a989cd9` was created ahead of the day-019 KPI entry file; this is consistent with the established workflow where the publishing pack ships first and the KPI entry is back-filled after the manual publish. The pack exists, but the publish event has not been back-filled.
- The aggregate `data/love-test-marketing-kpi.csv` is still in its 2-row template state (`xhs-001`, `dy-001`, `vh-001`) dated 2026-05-24 with the literal `notes` value `template row`; it carries no per-day rollup yet.
- The bridge script `python3 ~/.hermes/scripts/run_revenue_funnel.py` ran successfully during this skill run (exit 0) and wrote a new 2026-07-12 row with `notes=real_db_pipeline`. The DB-side funnel is genuinely empty, not a bridge outage.

## Skipped Analysis

The following skill workflow steps were skipped because their inputs are zero / placeholder / empty:

- Step 4 — Compare impressions, clicks, `love_test_starts`, `ask_next_clicks`, and conversion fields across rows. Skipped: every per-day value is empty and every funnel-rate value is `0` / `0.0`.
- Step 5 — Identify strongest hook, weakest topic, and practical next-day optimization. Skipped: ranking requires a non-zero ranking input.
- Day-specific output `assets/marketing/daily/day-024-optimization-notes.md` — **not created** this run. The skill rule "Do not fake, infer, or invent metrics, conversions, sales, users, testimonials, or attribution" extends to optimization recommendations derived from those metrics. A notes file will be created on the next run where at least one channel/content_id row has a non-zero engagement value.

## Data Gaps (Explicit)

1. `impressions`, `clicks`, `leads_captured`, `revenue_usd` are empty (not `0`, not a number — literally blank) on every Day 019 and Day 024 row. No real exposure data for any platform/content_id on the two freshest publish cycles.
2. The aggregate `data/love-test-marketing-kpi.csv` is still in its 2-row template state. There is no per-day or per-channel rollup file to consult.
3. The 2026-07-12 row of `data/love-test-funnel-metrics.csv` shows `home→test=0.0`, `test→result=0.0`, `result→unlock=0.0`, `unlock→checkout=0.0`, `checkout→paid=0.0`, and `revenue_cny=0`. No conversion-funnel signal exists.
4. `paid_smoke_result` is `not_run` on every row of the aggregate marketing KPI CSV. No Stripe test-mode paid smoke has been executed; no checkout URL captured; no webhook fired. This is consistent with the standing `tianji-github-paid-gate` status (`stripe_test_mode=pending_human_approval`, `paid smoke No-Go`).
5. The earlier day-level KPI files (day-001 through day-014) were created with `0` placeholders and have never been back-filled with real engagement data. They are scaffolding only, not historical baselines.
6. The skill's `data/love-test-funnel-metrics.csv` was checked but not used as a substitute for the per-day KPI entries because the workflow specifies parsing from the day-level CSV fields only; the bridge row confirms the funnel is genuinely empty, not a measurement gap.

## Gate Status

```text
KPI source file: No-Go - missing real metrics (day-019 and day-024 entries are empty placeholders; aggregate is 2-row template; funnel row is all-zero; paid_smoke_result=not_run everywhere)
KPI analysis report: Go (this report documents the absence of real data, no fabricated rankings)
Optimization notes: Not run (cannot be grounded without non-zero input rows; per skill rule against fabricated optimization)
Fake metrics: No-Go (none invented)
Stripe checkout execution: Not run
Paid smoke: No-Go - awaiting explicit approval
Production deploy: No-Go
```

## Safety Boundary

- No `.env*` files were read, printed, copied, uploaded, or modified.
- No raw secret was printed.
- No production deploy was performed.
- No Stripe test/live paid smoke or real payment was performed.
- No webhook replay was performed.
- No Supabase production mutation was performed.
- No PM2/Nginx/certbot/server mutation was performed.
- No social account auto-posting was performed.
- No account credential, login cookie, browser session, or platform token was used.
- No KPI value, hook rank, channel rank, conversion rate, or guaranteed relationship outcome was invented.
- The bridge script `~/.hermes/scripts/run_revenue_funnel.py` was invoked once in read-only mode and only wrote a new zero-row to `data/love-test-funnel-metrics.csv`. No production DB row was inserted or mutated by the skill itself; the bridge script's own SSH query is read-only by design.

## Validation

- `git status` before report write: working tree had one pre-existing modified file (`data/love-test-funnel-metrics.csv`) from the bridge script run.
- Files created in this run: `.ai/reports/love-test-growth-report-2026-07-12.md`, plus updates to `.ai/CHANGELOG_AI.md` and `.ai/REVIEW_PACKET.md`.
- `git diff --check`: pending; will be run before commit.
- `npm run typecheck` / `npm run lint`: not applicable to this change set (markdown + CSV only, no TypeScript/ESLint surface touched, and this run only consumed the funnel CSV; no source file changed).
- Secret-shape scan over `.ai/`, `assets/marketing/`, `data/`: pending; will be run before commit.

## Suggested Commit Message

```text
chore(marketing): add love-test KPI analysis for day 024 (data required)
```