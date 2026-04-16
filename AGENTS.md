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

**Relationship module is the active experimental focus.**
No other module may be modified during an experiment run.

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
