# TianJi Codex Instructions

## Mission
Improve TianJi by making small, high-confidence upgrades that strengthen:
- result pages
- relationship reading
- fortune timeline
- sharing systems
- conversion
- trust and privacy

## Rules
1. Never merge directly to main.
2. Always create or update a branch and prepare a PR summary.
3. Do not expose birth date, birth time, birth location, or timezone on public share pages by default.
4. Prefer rule-based scoring + AI explanations.
5. Keep premium dark visual style and CTA consistency.
6. Do not remove pricing, FAQ, trust, disclaimer, or premium upgrade paths.
7. Run required checks before claiming success.

## Required checks
- npm run typecheck
- npm run lint
- npm run test
- npm run build
- npm run audit:routes
- npm run audit:copy
- npm run audit:share
- npm run audit:upgrade
# AGENTS.md — TianJi Codex System Instructions

> This file defines how ALL AI agents (Codex, Copilot, Claude, etc.) operate within the
> TianJi Global codebase. It is the authoritative operating document for autonomous upgrades.
> CLAUDE.md provides project context; AGENTS.md governs agent behavior.

---

## Mission

Continuously improve TianJi through **small, measurable, reviewable experiments**.
Every change must be: intentional, scored, recorded, and reversible.

---

## Current Priority

**TianJi Love Relationship Revenue Loop Productionization**

Primary goal:
Ship a production-safe Love Reading funnel that converts users from free relationship preview to paid premium relationship report.

Execution order:
1. relationship-master Skill
2. canonical LoveReport schema
3. deterministic free preview report
4. privacy-safe share payload
5. paid premium report generation
6. Stripe test-mode one-time checkout and entitlement mapping
7. report job recovery
8. analytics and AB testing
9. staging QA
10. production launch review

Hard rules:
- Do not expose full birth date, birth time, birth place, private questions, payment state, or raw engine output in public share pages.
- Do not modify secrets, live Stripe settings, production Supabase, production env, or irreversible deployment settings without explicit approval.
- Prefer one-time paid Love Report before subscriptions.
- Every product change must include tests or QA evidence.
- Every revenue change must include a rollback path.
- Do not expand unrelated modules until the Love Reading revenue loop is production-ready.

Revenue safety gates:
- Before any TianJi Love revenue, launch, deploy, staging, smoke, payment, webhook, entitlement, or workflow-automation task, read the top-level workspace latest gate index `.ai/TIANJI_LOVE_LATEST_GATE_INDEX_20260602.md` first, or the newest dated replacement if one exists.
- Treat payment, checkout, webhook, entitlement, database, auth, billing, deployment, production configuration, and key/env tasks as high risk by default.
- High-risk TianJi Love tasks may proceed only in test mode, with masked evidence, and on local or staging targets unless the user gives explicit approval for a narrower action.
- Do not run live Stripe, production Supabase, production deploy, real paid smoke, production data mutation, or Managed Agent.
- Do not read, print, copy, diff, infer, or summarize raw `.env` values, secrets, credentials, tokens, webhook secrets, Stripe Price IDs, or production configuration values.
- Evidence packets must record presence, mode, target, and verdict only. Missing evidence is a blocker.
- Distinguish Source Go, Static/Readiness Conditional Go, and Execution Go. Source readiness never authorizes checkout execution, webhook replay, paid smoke, production deploy, or production data mutation.
- In mixed dirty worktrees, list exact task files before commit and avoid automatic staging unless explicitly approved.
- For local browser/GStack QA on Windows, prefer an ASCII-only path or documented junction if the non-ASCII workspace path affects Next.js route rendering.

---

## Core Principles

1. Only one experiment surface per run
2. Prefer small, high-confidence changes
3. Preserve privacy-safe defaults at all times
4. Preserve premium dark product aesthetic
5. AI must explain decisions — not invent internal calculations
6. Never expose birthDate, birthTime, birthLocation, or timezone in share outputs by default
7. Never remove pricing, FAQ, trust signals, disclaimers, or premium upgrade paths

---

## Allowed Experiment Areas

```
ALLOWED:
  - src/app/relationship/**
  - src/components/relationship/**
  - src/components/share/**
  - src/lib/relationship-engine.ts
  - src/lib/synastry-engine.ts

NEVER TOUCH:
  - src/app/auth/**
  - src/app/billing/**
  - deployment configs (.github/, vercel.json)
  - env files, .env, .env.local
  - privacy policy
  - share privacy safeguards
  - any API route not in relationship/
```

---

## Experiment Lifecycle (7 Steps)

```
1. calculate-relationship-score.ts → relationship-score-before.json
2. Codex generates variant-a.json + variant-b.json
3. compare-ab-variants.ts → ab-result.json
4. decide-keep-or-discard.ts → relationship-decision.json
5. apply-winning-copy.ts (only if decision=keep)
6. generate-upgrade-report.ts → codex-upgrade-report.md
7. record-experiment.ts → experiments/manifest.json (SINGLE SOURCE OF TRUTH)
```

---

## Scoring System (Relationship — max 140 pts)

```
Base (74 pts):
  hasHeroSummary          = 10
  hasPattern             = 10
  hasFiveDimensions       = 15
  hasCurrentWindow       = 10
  hasPracticalGuidance   = 10
  hasPremiumSection      = 10
  shareModes (3 max)      =  9

Copy Quality (66 pts):
  headlineStrength        = 0–20
  patternClarity          = 0–15
  emotionalResonance      = 0–15
  upgradeStrength         = 0–15

TOTAL                   = 74–140 pts
```

**Keeping rule:** Score delta ≥ 2 pts → keep | < 2 pts → discard

---

## Required Outputs (Every Run)

1. `ab-result.json` — unified experiment result
2. `codex-upgrade-report.md` — human-readable upgrade report
3. `experiments/manifest.json` — **SINGLE SOURCE OF TRUTH**, runs[] must grow

If any of these is missing after a run → **workflow fails**

---

## Required Checks (All Must Pass)

```bash
npm run typecheck     # TypeScript compiles without errors
npm run lint          # ESLint passes
npm run test          # Test suite passes
npm run build         # Next.js build succeeds
npm run audit:routes  # API routes healthy
npm run audit:copy    # Copy quality maintained
npm run audit:share   # Privacy safeguards intact
npm run audit:upgrade # Premium upgrade section functional
```

If any check fails → experiment is **discarded**

---

## Experiment Surfaces

| Surface | Description |
|---------|-------------|
| `hero_summary` | Headline, one-liner, CTA — upgrade conversion |
| `pattern_naming` | Relationship archetype labels, one-liner, tags |
| `dimension_cards` | Five dimension explanations — clarity and tone |
| `current_window` | Time expression, urgency, action guidance |
| `share_card` | One-liner for share output, emotional intensity |

One surface per run. Rotate surfaces across runs.

---

## Privacy Non-Negotiables

- `birthDate` — NEVER in share cards by default
- `birthTime` — NEVER in any user-facing output
- `birthLocation` — NEVER without explicit opt-in
- `timezone` — NEVER exposed in share metadata
- All share outputs must pass `npm run audit:share`

---

## Success vs Failure

### Keep (commit + PR)
- Checks pass
- Score delta ≥ 2 pts
- No privacy regression
- Experiment recorded in manifest

### Discard (abort, no PR)
- Any check fails
- Score delta < 2 pts
- Privacy regression detected
- Bilingual mirror quality decreased

---

## Analytics Schema (Future — Phase 2)

For real user behavior validation:

```
relationship_view           — user opened results page
relationship_share_click    — clicked share button
relationship_share_success — share completed
relationship_upgrade_click  — clicked premium unlock
relationship_upgrade_success — upgrade/payment completed
relationship_dimension_expand — expanded a dimension card
relationship_return_7d     — returned within 7 days
```

Primary metric: `upgrade_click_rate`
Secondary metric: `share_click_rate`

---

## File Map

```
tianji-global/
├── AGENTS.md                           ← THIS FILE (agent operating system)
├── CLAUDE.md                           ← Project lore + context
├── program.md                          ← Current focus + surfaces
│
├── .github/workflows/
│   ├── ci.yml                         ← Build gate
│   ├── codex-self-evolution.yml        ← Generic self-improvement
│   ├── relationship-ab-evolution.yml   ← PRIMARY experiment pipeline
│   └── guardrails.yml                  ← Daily privacy + quality audit
│
├── experiments/
│   ├── manifest.json                   ← SINGLE SOURCE OF TRUTH
│   ├── ab-test-results.json            ← [DEPRECATED — export only]
│   ├── all-modules-ab-results.json      ← [DEPRECATED — export only]
│   └── relationship/
│       ├── variant-a.json
│       ├── variant-b.json
│       └── rel-*-variant-a.json        ← Archived per-experiment
│
├── scripts/
│   ├── calculate-relationship-score.ts
│   ├── compare-ab-variants.ts          ← Produces ab-result.json
│   ├── decide-keep-or-discard.ts
│   ├── apply-winning-copy.ts
│   ├── generate-upgrade-report.ts       ← Produces codex-upgrade-report.md
│   ├── record-experiment.ts             ← Updates manifest.json
│   ├── create-pr.ts
│   ├── audit-routes.ts
│   ├── audit-copy.ts
│   ├── audit-share.ts
│   └── audit-upgrade.ts
│
└── codex-upgrade-report.md             ← Latest experiment report
```

---

## Evolution Status

| Level | Description | Status |
|-------|-------------|--------|
| L1 | Automated CI + tests | ✅ |
| L2 | Audit scripts + rubric | ✅ |
| L3 | Auto-PR + report output | ✅ |
| **L4** | **Single-source manifest + keep/discard + upgrade reports** | **⏳ In progress** |
| L5 | Real user signal feedback | ❌ |

**Current target:** L4 — manifest runs growing with each experiment.
