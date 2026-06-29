---
name: tianji-ads-optimizer
description: Use when analyzing and optimizing paid ads performance for TianJi Love. Reviews Google Ads and Meta Ads metrics (CTR, CPC, conversion rate, ROAS) from KPI CSV data, outputs optimization recommendations and A/B copy variants. No budget or bid changes without explicit human approval.
metadata:
  hermes:
    recipe:
      schedule: "0 11 * * 5"
      deliver: skill
      prompt: |
        Read KPI CSV data from /root/tianji-global/data/love-test-*.csv and generate an optimization report.
        Find the latest KPI CSV file, parse it, calculate metrics (CTR, CPC, ROAS, conversion rate),
        compare with previous week, identify top/bottom campaigns, generate 3 recommendations,
        generate 2 A/B copy variants, and write the report to ops/marketing-底座/reports/weekly-ads-report-YYYY-Wnn.md.
---

# TianJi Ads Optimizer Skill

## Purpose

Analyze paid ad performance for TianJi Love across Google Ads and Meta Ads platforms, identify improvement opportunities, and generate actionable recommendations and A/B copy variants.

## Allowed Actions

- Read `data/love-test-*.csv` KPI files.
- Read `ops/marketing-底座/reports/weekly-seo-report.md` if it exists.
- Write optimization report to `ops/marketing-底座/reports/weekly-ads-report-YYYY-Wnn.md`.
- Calculate metrics: CTR, CPC, ROAS, conversion rate.
- Compare current week performance with previous week.
- Identify top-performing and bottom-performing campaigns.
- Generate 3 specific optimization recommendations.
- Generate 2 A/B copy variants for testing.

## Forbidden Actions

- Do not modify ad budgets or bid amounts.
- Do not adjust bids or bidding strategies.
- Do not access account credentials, login cookies, or API tokens.
- Do not make live campaign changes or status changes.
- Do not execute or modify live Stripe transactions.
- Do not deploy or mutate production systems.

## Workflow

1. Find the latest KPI CSV file in `/root/tianji-global/data/` matching `love-test-*.csv`.
2. Parse the CSV with columns: date, impressions, clicks, cost, conversions, revenue.
3. Calculate metrics:
   - CTR = clicks / impressions
   - CPC = cost / clicks
   - ROAS = revenue / cost
   - conversion_rate = conversions / clicks
4. Compare with previous week's data if available.
5. Identify top 3 best-performing campaigns and bottom 3 underperforming campaigns.
6. Generate 3 specific, actionable optimization recommendations.
7. Generate 2 A/B copy variants for ad creative testing.
8. Write the report with a metrics table to `ops/marketing-底座/reports/weekly-ads-report-YYYY-Wnn.md`.

## Verification

- Report is written to the correct path with correct naming format (weekly-ads-report-YYYY-Wnn.md).
- Metrics table is present with CTR, CPC, ROAS, and conversion_rate columns.
- Recommendations are specific, actionable, and tied to data insights.
- A/B copy variants are provided and are contextually relevant to the campaign data.