# TianJi Love Test Growth Report — 2026-07-05

> Skill: `tianji-github-kpi-analysis` (weekly cron `0 2 * * 0`).
> Date of run (UTC): 2026-07-05 02:00 UTC.
> Most recent manual publishing loop: Day 017 (publishing-pack dated 2026-07-04; KPI entry `data/love-test-day-017-kpi-entry.csv`, 22 rows, all numeric columns empty, `notes="manual entry after publish"` everywhere).
> Next publishing-pack scaffold on disk: Day 018 (`data/love-test-day-018-kpi-entry.csv`, 22 rows, all numeric columns empty, scheduled publish 2026-07-11, `notes="manual entry after publish"` everywhere).
> Aggregate `data/love-test-marketing-kpi.csv`: still in 3-row template state (`xhs-001`, `dy-001`, `vh-001`, dated 2026-05-24, all numeric fields = 0, `paid_smoke_result=not_run`, `notes="template row"`).
> Bridge: re-ran `python3 ~/.hermes/scripts/run_revenue_funnel.py` at 2026-07-05 02:01 UTC; appended a `real_db_pipeline` row to `data/love-test-funnel-metrics.csv` with `home→test`, `test→result`, `result→unlock`, `unlock→checkout`, `checkout→paid` all at `0.0` and the funnel stage counts (`home_view`, `test_start`, `result_view`, `unlock_click`) all at `0` (only `checkout_created=1` was observed, with `checkout_success=0` and `revenue_cny=0`). The bridge itself worked and produced real DB-derived numbers, but the underlying production events for this observation window are zero.

## Verdict: Real KPI Data Required — Analysis Skipped

Per skill workflow step 2, no row across the day-level KPI files, the aggregate KPI file, or the freshly-bridged funnel metrics file carries a non-zero, non-placeholder engagement value for any of the columns the skill is required to compare (`impressions`, `clicks`, `love_test_starts`, `result_views`, `share_card_clicks`, `share_card_downloads`, `ask_next_clicks`, `paid_intent_views`, `preview_submits`, `unlock_clicks`, `checkout_blocked`, `checkout_ready`). `paid_smoke_result` is `not_run` on every row. The funnel row from the bridge is now explicitly marked `real_db_pipeline`, which confirms the bridge path is alive, but the values themselves are still zeros — so there is still no engagement signal to rank.

Cross-check of day-level KPI files (columns `impressions`, `clicks`, `leads_captured`, `revenue_usd` for Days 011–018; columns `impressions`, `clicks`, `love_test_starts`, `result_views`, `share_card_clicks`, `share_card_downloads`, `ask_next_clicks`, `paid_intent_views`, `preview_submits`, `unlock_clicks`, `checkout_blocked`, `checkout_ready` for Days 001–010):

```text
day-011: numeric engagement columns = empty (all rows)
day-012: numeric engagement columns = empty (all rows)
day-013: numeric engagement columns = empty (all rows)
day-014: numeric engagement columns = empty (all rows)
day-015: numeric engagement columns = empty (all rows)
day-016: numeric engagement columns = empty (all rows)
day-017: numeric engagement columns = empty (all rows) — most recent manual publishing loop
day-018: numeric engagement columns = empty (all rows) — scaffold for next publish
days 001–010: numeric engagement columns = 0 (scaffold markers, paid_smoke_result=not_run)
```

There is no real signal to rank, no hook to declare strongest, no topic to declare weakest, no channel to declare best, and no conversion rate to compare. Writing such claims would violate the skill's "Forbidden Actions" rule against fabricating metrics, conversions, sales, users, testimonials, or attribution. The bridge path itself did execute and write a verifiable row, but the values it carried were real zeros, not invented ones — they are reported as-is below.

## Metrics

- Today's lead count: no real data yet (Day 017 manual publishing has either not been back-filled or genuinely produced no leads; all `leads_captured` cells are empty)
- Clicks: no real data yet
- Love-test starts: no real data yet (no manual value; bridge `test_start` count from `love-test-funnel-metrics.csv` 2026-07-05 row = `0`)
- Result views: no real data yet (bridge `result_view` count for 2026-07-05 row = `0`)
- Share card clicks / downloads: no real data yet
- Ask-next clicks: no real data yet
- Paid intent views / unlock clicks / checkout events: only the bridge's raw counts exist (`checkout_created=1`, `checkout_success=0`, `checkout_blocked=0`, `checkout_ready=0`, `revenue_cny=0`, `paid_orders=0`); no engagement rows in any per-day KPI file yet
- Bridge funnel rates (2026-07-05 row, `real_db_pipeline` notes): `home→test=0.0`, `test→result=0.0`, `result→unlock=0.0`, `unlock→checkout=0.0`, `checkout→paid=0.0`
- Revenue: no real data yet (`revenue_cny=0` from bridge, `revenue_usd` empty in every day-level KPI file)

## Hooks

- Top hooks: no real data yet — cannot rank from empty/zero rows
- Weak hooks: no real data yet — cannot rank from empty/zero rows
- Note: Day 018 publishing pack (`assets/marketing/daily/day-018-publishing-pack.md`) ships 5 Xiaohongshu posts, 5 Reels, 5 X posts, 3 Reddit/Quora answers, 2 KOL DMs, 3 SEO outlines, plus 5 share-card captions under the theme "Worth continuing — worth is not only what you feel; it is also what the rhythm allows." These copy assets exist and have been reviewed for safety baseline, but no publish-time engagement data is available to score any of them. Day 017 (the most recent actual or attempted manual publish) carries the "Reading the room vs reading the person — pattern literacy is not prediction" theme; no engagement data is available for it either.

## Channel

- Best channel: no real data yet — all channels show empty / zero across all rows
- Channel coverage attempted in Day 017 / Day 018: xiaohongshu, reels, x, reddit/quora, kol, seo. No engagement signal to rank them.

## Conversion Funnel

- Preview-submit → unlock-click → checkout-ready → paid-smoke chain: no real data yet
- Bridge funnel rate row for 2026-07-05 carries `checkout_ready_rate=0.0` and `paid_conversion_rate=0.0` with the `real_db_pipeline` notes marker, which confirms the bridge is reading the correct production tables but the underlying event counts are zero.
- `paid_smoke_result=not_run` on every row of `love-test-marketing-kpi.csv`, consistent with the standing `tianji-github-paid-gate` status (`stripe_test_mode=pending_human_approval`, `paid smoke No-Go`).

## Strongest Hook / Weakest Topic

- Strongest hook: **Not identified** — no engagement data exists.
- Weakest topic: **Not identified** — no engagement data exists.

## Tomorrow (Day 018 / Day 019) Recommendation

The skill cannot recommend a next-day content direction grounded in the entered metrics. There is no signal to justify a direction change. The next content direction is therefore left to the existing publishing and calendar machinery:

1. Continue with the Day 018 publishing pack on its scheduled date (2026-07-11) and record real numbers into `data/love-test-day-018-kpi-entry.csv` after each post. Do not invent performance; leave any unposted row empty.
2. Day 019 and beyond are already covered in `assets/marketing/content-calendar-7day.md`. Continue manual review of the next publishing pack on the operator's schedule — the most recent calendar refresh extended the calendar through Day 55 (2026-08-17).
3. The `data/love-test-funnel-metrics.csv` bridge is now showing a `real_db_pipeline` row with non-template values, which is a useful readiness signal: the bridge can be re-run safely and its output can be used as the paid-side evidence source once the underlying production traffic returns. Until `home_view` or any upstream count is > 0 for the observation window, the funnel-rate columns remain non-actionable.
4. If a manual publisher needs a working direction in the meantime, the existing Day 018 / Day 019 row in `data/love-test-content-calendar.csv` (or the rotation pool) should be used as-is. The next-day optimization notes file is intentionally not created this run because it would have to be invented.

## Assumptions

- The empty / zero values in the per-day KPI CSVs are either scaffold `0` placeholders (Days 001–010) or genuine empty cells from manual entries that have not been back-filled (Days 011–018). This is supported by the `notes` column on every per-day row containing the literal string `manual entry after publish`, by `paid_smoke_result=not_run` on every aggregate row, and by the bridge's own output (`checkout_created=1` only, all upstream counts `0`) indicating no production user activity during the 2026-07-05 observation window.
- Day 018 publishing pack was created ahead of this skill's cron window for its scheduled 2026-07-11 publish, and its KPI entry file is a scaffold. Neither manual publishing nor real engagement is assumed to have happened yet.
- The bridge row in `data/love-test-funnel-metrics.csv` dated 2026-07-05 with `real_db_pipeline` notes is taken at face value as a real production-derived observation (not an estimate), but its numeric columns are reported here as zeros, not relabelled.
- The aggregate `data/love-test-marketing-kpi.csv` is still in its 3-row template state (`xhs-001`, `dy-001`, `vh-001`) dated 2026-05-24 with the literal `notes` value `template row`; it carries no per-day rollup yet.

## Skipped Analysis

The following skill workflow steps were skipped because their inputs are zero/placeholder/empty:

- Step 4 — Compare `impressions`, `clicks`, `love_test_starts`, `ask_next_clicks`, and conversion fields across rows. Skipped: every value is empty or `0`. The bridge's own funnel row is reported verbatim but cannot be compared against any historical row because all earlier rows are template baselines.
- Step 5 — Identify strongest hook, weakest topic, and practical next-day optimization. Skipped: ranking requires a non-zero ranking input.
- Day-specific output `assets/marketing/daily/day-018-optimization-notes.md` — **not created** this run. The skill rule "Do not fake, infer, or invent metrics, conversions, sales, users, testimonials, or attribution" extends to optimization recommendations derived from those metrics. A notes file will be created on the next run where at least one channel/content_id row has a non-zero engagement value.

## Data Gaps (Explicit)

1. `impressions`, `clicks`, `leads_captured`, `revenue_usd` are empty for every row of `data/love-test-day-017-kpi-entry.csv` and `data/love-test-day-018-kpi-entry.csv`.
2. For Days 001–010, the wider column set (`impressions`, `clicks`, `love_test_starts`, `result_views`, `share_card_clicks`, `share_card_downloads`, `ask_next_clicks`, `paid_intent_views`, `preview_submits`, `unlock_clicks`, `checkout_blocked`, `checkout_ready`) is `0` across every row, with `paid_smoke_result=not_run` and `notes="manual entry after publish"` indicating scaffold entries.
3. `paid_intent_views`, `preview_submits`, `unlock_clicks`, `checkout_blocked`, `checkout_ready` carry no engagement signal in any per-day file.
4. `paid_smoke_result` is `not_run` on every row of `love-test-marketing-kpi.csv`. No Stripe test-mode paid smoke has been executed; no checkout URL captured; no webhook fired. This is consistent with the standing `tianji-github-paid-gate` status.
5. `data/love-test-marketing-kpi.csv` is still in its 3-row template state. There is no per-day or per-channel rollup file to consult.
6. The bridge row in `data/love-test-funnel-metrics.csv` for 2026-07-05 reports only `checkout_created=1` (the one attempted checkout). No associated `checkout_success`, no revenue, no upstream funnel activity. The bridge script itself executed successfully and wrote the row — that execution evidence is preserved here, but it does not substitute for missing engagement data.

## Gate Status

```text
KPI source file: No-Go - missing real metrics (all day-level KPI entries are empty/zero/placeholder; aggregate is still a 3-row template; bridge funnel row carries real_db_pipeline marker but upstream counts are zero)
KPI analysis report: Go (this report documents the absence of real engagement data; no fabricated rankings; the bridge-produced zeros are reported verbatim)
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
- The only DB write was the bridge append to `data/love-test-funnel-metrics.csv`, which is the bridge's documented behavior and does not mutate production state — it reads the production tables over SSH and writes only to this local CSV.

## Validation

- `git status` before run: working tree clean on branch `feature/monetization-ads-affiliate`, local HEAD `cc1f0ed` (post Day 018 publishing-pack commit), in sync with origin.
- Files created in this run: `.ai/reports/love-test-growth-report-2026-07-05.md`, plus updates to `.ai/CHANGELOG_AI.md` and `.ai/REVIEW_PACKET.md`.
- `git diff --check`: pending; will be run before commit.
- `npm run typecheck` / `npm run lint`: not applicable to this change set (markdown + CSV only, no TypeScript/ESLint surface touched, no app source modified in this docs-only cron runner).
- Secret-shape scan over `.ai/`, `assets/marketing/`, `data/`: pending; will be run before commit.

## Suggested Commit Message

```text
chore(marketing): add love-test KPI analysis for day 018 (data required)
```
