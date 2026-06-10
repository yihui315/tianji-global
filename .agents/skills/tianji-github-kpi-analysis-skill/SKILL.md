---
name: tianji-github-kpi-analysis-skill
description: Analyze manually entered TianJi Love marketing KPI CSV files and generate optimization reports. Use after real KPI values are entered for love-test daily content, funnel metrics, hook performance, and next-day content direction.
---

# TianJi GitHub KPI Analysis Skill

## Purpose

Analyze manually entered TianJi Love KPI CSV files and generate a grounded optimization report without fabricating metrics or running paid, production, or platform actions.

## Allowed Actions

- Read `data/love-test-day-XXX-kpi-entry.csv`.
- Read `data/love-test-marketing-kpi.csv`.
- Read related non-secret marketing KPI files under `data/**`.
- Create `.ai/reports/love-test-growth-report-YYYY-MM-DD.md`.
- Create `assets/marketing/daily/day-XXX-optimization-notes.md`.
- Recommend the next content direction based only on entered metrics.

## Forbidden Actions

- Do not fake, infer, or invent metrics, conversions, sales, users, testimonials, or attribution.
- Do not overwrite manually entered KPI rows unless the user explicitly asks.
- Do not run paid smoke, Stripe, checkout, webhook replay, or billing actions.
- Do not deploy production or mutate server state.
- Do not read, print, copy, diff, or infer `.env` files or secrets.

## Inputs

- A manually filled `data/love-test-day-XXX-kpi-entry.csv`.
- Optional aggregate `data/love-test-marketing-kpi.csv`.
- Content assets that correspond to the KPI day.
- Current gate status from `.ai` evidence or user instructions.

## Outputs

- `.ai/reports/love-test-growth-report-YYYY-MM-DD.md`
- `assets/marketing/daily/day-XXX-optimization-notes.md`
- `.ai/CHANGELOG_AI.md`
- `.ai/REVIEW_PACKET.md`

## Workflow

1. Confirm the KPI source file exists and contains real, non-placeholder values.
2. If all metrics are empty, zero, or placeholder-only, skip analysis and report that real KPI data is required.
3. Parse metrics from the CSV fields only.
4. Compare impressions, clicks, `love_test_starts`, `ask_next_clicks`, and available conversion fields.
5. Identify the strongest hook, weakest topic, and practical next-day optimization.
6. Record assumptions, skipped analysis, and data gaps explicitly.
7. Write the report and optimization notes with no fabricated performance claims.

## Validation Commands

Use the narrowest commands that match the actual changes:

```bash
npm run typecheck
npm run lint
git diff --check
```

Also run a targeted secret-shape scan over:

```text
.ai/
assets/marketing/
data/
```

## Commit Rules

- Commit only analysis reports, optimization notes, and AI records created by this skill.
- Use explicit path staging when unrelated changes exist.
- Suggested commit shape: `chore(marketing): add love-test KPI analysis for day XXX`.
- Do not commit raw analytics exports containing user PII, secrets, or unrelated source changes.

## Gate Status Format

```text
KPI source file: Go | No-Go - missing real metrics
KPI analysis report: Go | Not run
Optimization notes: Go | Not run
Fake metrics: No-Go
Stripe checkout execution: Not run
Paid smoke: No-Go - awaiting explicit approval
Production deploy: No-Go
```
