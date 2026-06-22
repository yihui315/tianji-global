# TianJi Love Auto-Marketing Operation Index - 2026-06-19

Purpose: provide the current local source of truth for the safe self-marketing loop. This index coordinates local skills, artifacts, queues, KPI inputs, and gates. It does not authorize auto-posting, email sending, payment execution, provider access, deployment, or production actions.

## Operating Loop

```text
1. Public competitor learning
2. Demand mining
3. SEO/GEO planning
4. Content calendar
5. Daily publishing pack
6. Manual review checklist
7. Credential-free publishing queue
8. Human manual publishing
9. Real KPI entry
10. KPI analysis
11. Funnel suggestions
12. Revenue gate reminder
```

## Competitor Learning Layer

The competitor learning layer is a CEO-mode filter, not a copying workflow. It reviews public love divination, love test, tarot, astrology, and relationship-insight pages, then classifies each pattern as `learn`, `adapt`, `avoid`, or `blocked`.

Rules:

```text
Public pages only: Go
Account login, private scraping, advisor chats, checkout, app login, analytics, SEO tools, cookies, APIs: No-Go
Competitor idea without TianJi artifact and KPI field: No-Go
Fake proof, fake testimonials, fake rankings, fake revenue, guaranteed relationship outcomes: No-Go
```

Current CEO-mode learning source: `assets/marketing/research/competitor-love-divination-marketing-study-2026-06-19.md`.

## Local Skills

| Skill | Status | Role |
| --- | --- | --- |
| `tianji-github-demand-mining-skill` | Go | Public/user-provided demand signals into research and hook backlog. |
| `tianji-github-seo-geo-skill` | Go | Search-intent and AI-answer planning from local marketing assets. |
| `tianji-github-email-nurture-skill` | Go | Consent-first manual email planning, blocked from sending. |
| `tianji-github-content-calendar-skill` | Go | Seven-day calendar and hook/script/caption pools. |
| `tianji-github-daily-growth-skill` | Go | Daily publishing packs, checklists, and KPI scaffolds. |
| `tianji-github-safe-publisher-bridge-skill` | Go | Manual-review CSV/JSON queue exports. |
| `tianji-github-kpi-analysis-skill` | Conditional Go | Analyze only real, non-placeholder KPI rows. |
| `tianji-github-funnel-optimizer-skill` | Conditional Go | Suggest copy/funnel improvements only from real evidence. |
| `tianji-github-paid-gate-skill` | No-Go for execution | Keep payment/revenue actions blocked until real evidence and approvals pass. |

## Current Artifacts

| Layer | Current File | Status |
| --- | --- | --- |
| Content calendar | `assets/marketing/content-calendar-7day.md` | Go, refreshed 2026-06-21 through 2026-06-27 |
| Demand mining | `assets/marketing/research/demand-mining-2026-06-19.md` | Go |
| Hook backlog | `assets/marketing/research/content-hook-backlog-2026-06-19.md` | Go |
| Competitor learning | `assets/marketing/research/competitor-love-divination-marketing-study-2026-06-19.md` | Go, public-pages-only |
| SEO/GEO | `assets/marketing/research/seo-geo-operating-brief-2026-06-19.md` | Go |
| Email nurture | `assets/marketing/research/email-nurture-operating-brief-2026-06-19.md` | Go, draft-only |
| Day 003 pack | `assets/marketing/daily/day-003-publishing-pack.md` | Go |
| Day 003 checklist | `assets/marketing/daily/day-003-review-checklist.md` | Go |
| Day 003 queue | `assets/marketing/publishing-queue/day-003-demand-publishing-queue.csv` / `.json` | Go |
| Day 003 KPI scaffold | `data/love-test-day-003-kpi-entry.csv` | Go, placeholder zeros only |
| Day 004 pack | `assets/marketing/daily/day-004-publishing-pack.md` | Go |
| Day 004 checklist | `assets/marketing/daily/day-004-review-checklist.md` | Go |
| Day 004 queue | `assets/marketing/publishing-queue/day-004-competitor-learning-publishing-queue.csv` / `.json` | Go |
| Day 004 KPI scaffold | `data/love-test-day-004-kpi-entry.csv` | Go, placeholder zeros only |
| Day 005 pack | `assets/marketing/daily/day-005-publishing-pack.md` | Go |
| Day 005 checklist | `assets/marketing/daily/day-005-review-checklist.md` | Go |
| Day 005 queue | `assets/marketing/publishing-queue/day-005-publishing-queue.csv` / `.json` | Go |
| Day 005 KPI scaffold | `data/love-test-day-005-kpi-entry.csv` | Go, placeholder zeros only |
| Day 006 pack | `assets/marketing/daily/day-006-publishing-pack.md` | Go |
| Day 006 checklist | `assets/marketing/daily/day-006-review-checklist.md` | Go |
| Day 006 queue | `assets/marketing/publishing-queue/day-006-publishing-queue.csv` / `.json` | Go |
| Day 006 KPI scaffold | `data/love-test-day-006-kpi-entry.csv` | Go, placeholder zeros only |
| Day 007 pack | `assets/marketing/daily/day-007-publishing-pack.md` | Go |
| Day 007 checklist | `assets/marketing/daily/day-007-review-checklist.md` | Go |
| Day 007 queue | `assets/marketing/publishing-queue/day-007-publishing-queue.csv` / `.json` | Go |
| Day 007 KPI scaffold | `data/love-test-day-007-kpi-entry.csv` | Go, placeholder zeros only |
| Day 008 pack | `assets/marketing/daily/day-008-publishing-pack.md` | Go |
| Day 008 checklist | `assets/marketing/daily/day-008-review-checklist.md` | Go |
| Day 008 queue | `assets/marketing/publishing-queue/day-008-publishing-queue.csv` / `.json` | Go |
| Day 008 KPI scaffold | `data/love-test-day-008-kpi-entry.csv` | Go, placeholder zeros only |
| Day 009 pack | `assets/marketing/daily/day-009-publishing-pack.md` | Go |
| Day 009 checklist | `assets/marketing/daily/day-009-review-checklist.md` | Go |
| Day 009 queue | `assets/marketing/publishing-queue/day-009-publishing-queue.csv` / `.json` | Go |
| Day 009 KPI scaffold | `data/love-test-day-009-kpi-entry.csv` | Go, placeholder zeros only |
| Day 010 pack | `assets/marketing/daily/day-010-publishing-pack.md` | Go |
| Day 010 checklist | `assets/marketing/daily/day-010-review-checklist.md` | Go |
| Day 010 queue | `assets/marketing/publishing-queue/day-010-publishing-queue.csv` / `.json` | Go |
| Day 010 KPI scaffold | `data/love-test-day-010-kpi-entry.csv` | Go, placeholder zeros only |
| Manual-only remaining report | `../.ai/TIANJI_LOVE_AUTOMARKETING_MANUAL_ONLY_REMAINING_20260620.md` | Go |

## Machine Automation

| Automation | Status | Boundary |
| --- | --- | --- |
| `npm run tianji:content-calendar` | Conditional Go | Generates draft artifacts only; requires runtime env if MiniMax is used. |
| `npm run tianji:daily-growth` | Conditional Go | Generates draft artifacts only; no posting. |
| `npm run tianji:kpi-analysis` | Conditional Go | Requires real non-placeholder KPI rows. |
| `npm run tianji:conversion-suggestions` | Conditional Go | Suggestions only; no app source change without separate task. |
| GitHub workflows | Conditional Go | Read-only/artifact generation only; no account posting or payment. |
| YiHui Autopilot PlanOnly | Go on 2026-06-19 | Completed BrainPlan and ExecutorAnalyze; no ExecutorExecute. |

## Required Human Action

1. Review `assets/marketing/daily/day-003-review-checklist.md` through `assets/marketing/daily/day-010-review-checklist.md`.
2. Manually publish approved Day 003 through Day 010 queue items.
3. Paste published URLs into the matching queue files.
4. Enter real metrics in `data/love-test-day-003-kpi-entry.csv` through `data/love-test-day-010-kpi-entry.csv`.
5. Run KPI analysis only after real non-placeholder values exist.

## Blocked Claims And Actions

```text
Fake KPI, ranking, traffic, conversion, revenue, user, testimonial, or attribution claim: No-Go
Social auto-posting: No-Go
Email sending: No-Go
Account login, cookies, tokens, private APIs: No-Go
SEO tool or analytics account access: No-Go
Raw .env or secret access: No-Go
Stripe checkout execution: No-Go
Webhook replay: No-Go
Supabase mutation: No-Go
Production deploy: No-Go
Revenue execution: No-Go
```

## CEO Status

The safe operating system is now complete enough to run manually with selective CEO expansion:

```text
Competitor learning -> Research -> SEO/GEO -> Drafts -> Queue -> Human publish -> KPI -> Optimization
```

It is not yet a self-paying system because publishing, real traffic, KPI evidence, and revenue gates are still missing. The next value-producing step is manual publication plus real metric entry for Day 003 through Day 010, while the CEO layer keeps learning from public competitors without copying unsafe claims.
