# SIAS Task Classification — 2026-07-23

Source: `.ai/SIAS_PROBLEM_DISCOVERY_20260723.md`.

## A. autonomous_safe_now (10 issues)

| issue_id | title | impact | confidence | risk | effort | score |
|----------|-------|--------|------------|------|--------|-------|
| T0-001 | daily-oracle SEO metadata + sitemap inclusion + JsonLd | 4 | 5 | 1 | 2 | **6** |
| T0-002 | love-test SEO metadata + JsonLd | 4 | 5 | 1 | 2 | 6 |
| T0-003 | daily-oracle CTA hrefs → UTM propagation | 3 | 4 | 1 | 3 | 3 |
| T0-005 | orchestrator decision JSON lacks date stamp | 2 | 5 | 1 | 2 | 4 |
| T0-006 | data/kpi/ missing; widen KPI scanner | 3 | 5 | 1 | 2 | 5 |
| T0-007 | KPI CSV schema documentation | 2 | 4 | 1 | 3 | 2 |
| T0-008 | /relationship/new SEO metadata (layout-only) | 3 | 4 | 2 | 3 | 2 |
| T0-009 | API route contract test coverage | 2 | 4 | 1 | 4 | 1 |
| T0-010 | unified audit:all runner | 2 | 4 | 1 | 3 | 2 |
| T0-011 | AUTOPILOT_STATUS branch/worktree drift cleanup | 1 | 5 | 1 | 1 | 4 |

## B. needs_human_input (1)

| issue_id | title | resume_signal |
|----------|-------|---------------|
| T0-012 | Real KPI traffic data | "real visit / funnel event present in data/kpi/*.csv" |

## C. external_blocked (no new entries)

AdSense verdict, X / Reddit / blog public URLs, Google Search Console — already parked in BLOCKED-001..BLOCKED-006 from the L1 spec. No new discoveries this round.

## D. infra_blocked (1)

| issue_id | title | resume_signal |
|----------|-------|---------------|
| (BLOCKED-002) | 154.217.241.238 SSH dead / STAGING-004 not deployable | "SSH recovered through cloud console / VNC / provider reboot" |

## E. unsafe_for_autonomy (unchanged)

`production deploy`, `live Stripe`, `production Supabase mutation`, `real paid smoke`, `auto merge`, `connect to 154.217.241.238`, `touch STAGING-004`. None of these move from unsafe → safe in this round.

## Selection (this round)

Picking **T0-001** as the round-1 autonomous task:
- Highest impact *with* highest confidence and lowest risk.
- Daily-oracle is the *most-tracked funnel entry* in the repo (5 funnel events) yet has *zero* SEO surface.
- Pattern is established (`(main)/pricing/layout.tsx` already exports metadata + JsonLd).
- Pure additive change; no removal, no behavior shift, no infra touch.

T0-002 is the closest contender; it will be the natural follow-up round (or merged into the same PR if scope is small).