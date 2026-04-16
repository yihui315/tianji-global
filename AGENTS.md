# AGENTS.md — TianJi Global Autonomous Upgrade System

> This file defines how all AI agents (Codex, Copilot, Claude, etc.) interact with
> the TianJi Global codebase. It is the authoritative agent instruction document.
> CLAUDE.md is the project lore; AGENTS.md is the operating system for autonomous upgrades.

---

## Mission

Improve TianJi Global through **small, measurable, reviewable experiments**.
Every change must be: intentional, scored, recorded, and reversible.

---

## System Overview

```
program.md
    ↓
relationship-ab-evolution.yml  (or codex-self-evolution.yml)
    ↓
┌─────────────────────────────────────────────┐
│  1. Baseline score (calculate-relationship-score.ts)  │
│  2. Codex generates A/B variants                          │
│  3. Compare variants (compare-ab-variants.ts)            │
│  4. Decide keep/discard (decide-keep-or-discard.ts)       │
│  5. Generate report (generate-upgrade-report.ts)         │
│  6. Record to manifest (record-experiment.ts)            │
│  7. Commit + PR                                           │
└─────────────────────────────────────────────┘
```

---

## Current Experimental Focus

**Relationship module only.**

No other module may be modified during an experiment run unless explicitly included
in `program.md`'s allowed-files list.

---

## Experiment Rules (Non-Negotiable)

### One surface per run
Pick ONE experiment surface per workflow run:
1. Hero Summary (headline, one-liner, CTA)
2. Pattern Naming (relationship archetype labels)
3. Dimension Cards (five dimension explanations)
4. Premium Upgrade Section (lock copy, CTA)

### Only touch allowed files
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
  - src/app/api/** (except relationship endpoints)
  - .env, .env.local, next.config.js
  - .github/workflows/ci.yml
  - Any module not listed above
```

### Do not weaken privacy defaults
- Share cards must NEVER expose birthDate, birthTime, birthLocation, timezone
- No biometric or precise birth data in share outputs
- Share defaults must be "off" for personal identifiers

### Do not degrade bilingual quality
- If you change English copy, check Chinese copy still renders
- If you change Chinese copy, check English copy still renders
- Every copy change requires bilingual mirror check

### No breaking changes
- All `npm run build` must pass
- All `npm run audit:*` must pass (or explicitly documented as ignored)
- No TypeScript errors introduced

---

## Experiment Lifecycle

### 1. Before experiment
```bash
npx tsx scripts/calculate-relationship-score.ts
# → relationship-score.json (BEFORE score)
```

### 2. Codex generates variants
- Write `experiments/relationship/variant-a.json` (emotional framing)
- Write `experiments/relationship/variant-b.json` (functional framing)
- Both JSONs must include a `metrics` object

### 3. Compare
```bash
npx tsx scripts/compare-ab-variants.ts
# → ab-result.json
```

### 4. Decide
```bash
npx tsx scripts/decide-keep-or-discard.ts
# → relationship-decision.json
# Exit code 0 = keep, Exit code 1 = discard
# Keep rule: after > before + 1 (margin ≥ 2)
```

### 5. Report
```bash
npx tsx scripts/generate-upgrade-report.ts
# → codex-upgrade-report.md (REQUIRED — workflow gate)
```

### 6. Record
```bash
npx tsx scripts/record-experiment.ts ab-result.json
# → experiments/manifest.json (runs[] grows)
```

### 7. Commit + PR
- Commit winning copy to `src/lib/relationship-engine.ts`
- Update `experiments/relationship/variant-*.json`
- Update `experiments/manifest.json`
- Open PR via `peter-evans/create-pull-request@v7`

---

## Required Checks

Every experiment run must pass these before committing:

```bash
npm run audit:routes    # No broken API routes
npm run audit:copy      # No copy degradation
npm run audit:share     # Share privacy safeguards intact
npm run audit:upgrade  # Premium upgrade section functional
```

If any check fails → experiment is **discarded**, no PR opened.

---

## Scoring System

### Relationship module score (max 140 pts)
```
Base:
  hasHeroSummary         = 10 pts
  hasPattern             = 10 pts
  hasFiveDimensions      = 15 pts
  hasCurrentWindow       = 10 pts
  hasPracticalGuidance   = 10 pts
  hasPremiumSection      = 10 pts
  shareModes (max 3×3)    =  9 pts
                         ─────────
  Base total             = 74 pts

Copy quality:
  headlineStrength       = 0–20 pts
  patternClarity         = 0–15 pts
  emotionalResonance     = 0–15 pts
  upgradeStrength        = 0–15 pts
                         ─────────
  Copy total             = 0–65 pts

Grand total              = 74–140 pts
```

### Winning criteria
- `after > before + 1` → **KEEP** (commit winning copy)
- `after ≤ before + 1` → **DISCARD** (abort, no PR)

---

## Privacy Rules (Non-Negotiable)

- `birthDate` is NEVER shown in share cards by default
- `birthTime` is NEVER shown in any user-facing output
- `birthLocation` is NEVER shown without explicit opt-in
- `timezone` is NEVER exposed in share metadata
- OG images must not contain readable birth data
- All share outputs must pass `npm run audit:share`

---

## Upgrade Report Requirements

Every experiment MUST produce `codex-upgrade-report.md` containing:

```markdown
# Codex Upgrade Report — rel-ab-XXX

## Variant A
(emotional copy description + metrics)

## Variant B
(functional copy description + metrics)

## Winner
A or B

## Score
Before: N | After: N | Delta: ±N

## Decision
KEEP or DISCARD

## Checks
- audit:routes ✅
- audit:copy ✅
- audit:share ✅
- audit:upgrade ✅
- codex-upgrade-report.md generated ✅

## Risks
(what's still unknown or needs real-user validation)

## Next Focus
(suggested next experiment surface)
```

If `codex-upgrade-report.md` does not exist after the experiment → **workflow fails**.

---

## File Map

```
TianJi Global
├── program.md                          ← Current focus + experiment surfaces
├── AGENTS.md                            ← THIS FILE (agent operating system)
├── CLAUDE.md                            ← Project lore + technical details
│
├── .github/workflows/
│   ├── ci.yml                           ← Build + type check gate
│   ├── codex-self-evolution.yml         ← Generic self-improvement (all modules)
│   ├── relationship-ab-evolution.yml    ← Relationship module A/B (PRIMARY)
│   └── guardrails.yml                   ← Daily privacy + security audit
│
├── experiments/
│   ├── manifest.json                    ← ALL experiment history (runs[])
│   └── relationship/
│       ├── variant-a.json               ← Latest Variant A
│       ├── variant-b.json               ← Latest Variant B
│       └── rel-ab-001-variant-a.json    ← Archived experiments
│
├── scripts/
│   ├── calculate-relationship-score.ts  ← Score the current module state
│   ├── compare-ab-variants.ts           ← Compare A vs B, output ab-result.json
│   ├── decide-keep-or-discard.ts        ← Keep rule: margin ≥ 2
│   ├── generate-upgrade-report.ts       ← Produce codex-upgrade-report.md
│   ├── record-experiment.ts             ← Append to manifest.json runs[]
│   ├── audit-routes.ts                  ← API route health check
│   ├── audit-copy.ts                    ← Copy quality check
│   ├── audit-share.ts                   ← Privacy safeguard check
│   └── audit-upgrade.ts                 ← Upgrade section check
│
└── codex-upgrade-report.md              ← Latest experiment report (auto-generated)
```

---

## Failure Modes (and what to do)

| Failure | Response |
|---------|----------|
| Both variants score below baseline | Discard experiment |
| Audit fails | Fix before proceeding |
| Privacy regression | Abort immediately, do not PR |
| TypeScript errors | Fix before proceeding |
| Margin < 2 | Discard, log in report |
| PR merge conflict | Re-base, retry once |

---

## Evolution Status

- **L1** ✅ Automated CI
- **L2** ✅ Audit scripts + rubric
- **L3** ✅ Auto-PR + report output
- **L4** ⏳ In progress — manifest accumulation + upgrade reports
- **L5** ❌ Real user signal feedback loop

Current target: **L4** — manifest runs must grow with each experiment.
