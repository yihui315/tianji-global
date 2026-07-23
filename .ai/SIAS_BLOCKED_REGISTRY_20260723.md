# SIAS Blocked Registry — 2026-07-23

Source: `.ai/SIAS_PROBLEM_DISCOVERY_20260723.md` + cross-session context.

Each entry follows:

```
BLOCKED-<id>
title:
type:
status: parked
resume_signal:
next_check: manual only
autonomous_action: none
```

---

## BLOCKED-001

- title: Need ≥ 3 real public published URLs with UTM evidence
- type: human_required
- status: parked
- resume_signal: human pastes real `published_url` into `.ai/MANUAL_PUBLISH_EVIDENCE_<DATE>.md` for ≥ 3 rows
- next_check: manual only
- autonomous_action: none — SIAS must not auto-generate URLs

## BLOCKED-002

- title: 154.217.241.238 SSH dead / STAGING-004 not deployable
- type: infra_blocked
- status: parked
- resume_signal: SSH recovered through cloud console / VNC / provider reboot
- next_check: manual only
- autonomous_action: none — SIAS must not SSH-retry or connect to the server

## BLOCKED-003

- title: Stripe test paid smoke evidence
- type: approval_required
- status: parked
- resume_signal: explicit test-mode human approval recorded in a future evidence file
- next_check: manual only
- autonomous_action: none — orchestrator hard-locks `stripe_test_paid_smoke_go` to `false`

## BLOCKED-004

- title: Non-author reviewer approvals for open Draft PRs
- type: approval_required
- status: parked (PR #164 + PR #165 already merged; future PRs same pattern)
- resume_signal: GitHub UI shows an approving review from a non-author code owner
- next_check: manual only
- autonomous_action: none — agent never self-approves or self-merges

## BLOCKED-005

- title: Real non-zero KPI traffic data
- type: external_required
- status: parked
- resume_signal: real `impressions > 0` / `clicks > 0` / `visits > 0` row appears in `data/kpi/<file>.csv` with `notes` not containing `operator_smoke_visit`
- next_check: manual only
- autonomous_action: none — SIAS must not fabricate KPI rows; existing `data/love-test-day-*kpi-entry.csv` rows are zero-scaffolded per CHANGELOG_AI 2026-07-01 entry

## BLOCKED-006

- title: Production deploy
- type: unsafe_for_autonomy
- status: parked
- resume_signal: explicit user instruction "deploy to production"
- next_check: manual only
- autonomous_action: none — any deploy without explicit approval is forbidden

## BLOCKED-007

- title: Live Stripe / production Supabase mutation
- type: unsafe_for_autonomy
- status: parked
- resume_signal: explicit test-mode human approval for the specific action
- next_check: manual only
- autonomous_action: none — `stripe_live` and `supabase_production_mutation` in `.ai/AUTOPILOT_STATUS.json` remain `no-go`

## BLOCKED-008

- title: AdSense verdict (still NO-GO)
- type: external_required
- status: parked
- resume_signal: Google reports `ads.txt` as Authorized + certified CMP/TCF published
- next_check: manual only
- autonomous_action: none — AdSense readiness contract stays a source-gate-only artifact

## BLOCKED-009

- title: Real visit data for /daily-oracle, /love-test, /pricing, /relationship/new to validate T0-001 / T0-002 / T0-008 SEO impact
- type: external_required
- status: parked
- resume_signal: Google Search Console or analytics reports non-zero impressions / clicks for the canonical URLs
- next_check: manual only
- autonomous_action: none — SIAS cannot fabricate search-engine visits; the SEO metadata fix is shipped but its impact can only be observed externally

## BLOCKED-010

- title: Public-facing social profiles (LinkedIn / X / Reddit) for `sameAs` in JsonLd `Organization`
- type: human_required
- status: parked
- resume_signal: human confirms which URLs go into `SITE.sameAs` in `src/components/seo/JsonLd.tsx`
- next_check: manual only
- autonomous_action: none — leaving `sameAs: []` empty is correct until profiles exist; fabricating them would be a privacy / accuracy violation

---

## Round-1 autonomous actions completed (parked back to A)

- **T0-001 — Daily-oracle SEO + sitemap + JsonLd**: ✓ moved out of blocked. Now in active development (see Draft PR).