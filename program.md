# TianJi Evolution Program

## Current Phase

Phase 1 - Monetization First

The system is not optimizing for feature completeness.

The system is optimizing for:

- first revenue
- higher upgrade rate
- clear monetization funnel

---

## Active Goal

Maximize:

upgrade_click_rate

Secondary goals:

- share_click_rate
- result clarity
- emotional impact

---

## Active Funnel (Do NOT change)

AI Destiny Scan
-> partial result
-> lock point
-> unlock CTA
-> full reading
-> share

This funnel is fixed.

Only optimize parts of it.

---

## Active Domain

Focus only on:

Relationship module
and
Destiny result page

Allowed areas:

- src/app/destiny/**
- src/app/relationship/**
- src/components/relationship/**
- src/components/share/**
- src/lib/relationship-engine.ts
- src/lib/synastry-engine.ts
- src/lib/analytics/**
- experiments/**
- scripts/**

---

## Protected Areas (Do NOT modify)

- auth system
- Stripe / billing core logic
- Supabase schema (unless explicitly required)
- privacy policies
- environment configs
- deployment settings

---

## Current Bottleneck

Assume:

conversion is the weakest link

Unless data clearly shows otherwise.

---

## Experiment Rule (Strict)

Each cycle must:

- modify ONLY ONE surface
- produce EXACTLY ONE A/B comparison
- not mix multiple changes
- not refactor unrelated code

---

## Allowed Experiment Surfaces

Choose ONE:

- hero summary wording
- one-liner message
- relationship pattern explanation
- dimension card wording
- current window explanation
- premium lock section
- unlock CTA text
- share card text
- share card layout
- result page structure

---

## Disallowed Changes

Do NOT:

- introduce new modules
- redesign entire pages
- add multi-step flows
- change routing structure
- remove monetization elements
- add complex backend features

---

## Expected Output Per Run

Must generate:

1. code change
2. ab-result.json
3. codex-upgrade-report.md
4. update experiments/manifest.json

If any missing -> run is invalid

---

## A/B Evaluation Logic

Use:

1. clarity
2. emotional strength
3. perceived value
4. upgrade intent

If real user data exists, prioritize:

- upgrade_click_rate
- share_click_rate

---

## Keep / Discard Rule

KEEP if:

- passes all checks
- improves emotional clarity
- increases perceived value
- strengthens upgrade motivation

DISCARD if:

- neutral change
- weak emotional impact
- reduces clarity
- harms conversion path

---

## Multi-Strategy Mode (Optional)

If enabled:

- generate 3 strategies
- each strategy runs 1 A/B test
- keep top 30%
- discard others

Otherwise:
run single-strategy mode

---

## Strategy Types

Possible strategies:

- emotional_intense
- minimal_clean
- premium_psychology
- clarity_first
- visual_focus

---

## Writing Rules (Very Important)

All copy must:

- sound personal
- feel specific
- avoid generic astrology tone
- avoid over-technical explanation

Good:

"You don't struggle with connection - you struggle with timing."

Bad:

"You have communication challenges due to planetary alignment."

---

## Premium Lock Rule

Lock must:

- create curiosity
- imply missing critical insight
- not feel like paywall spam

Example pattern:

"You are entering a major relationship shift - but the turning point is hidden."

---

## Share Rule

All results must be:

- screenshot-friendly
- emotionally resonant
- short enough to share

---

## Iteration Loop

Each run must:

1. read manifest
2. identify pattern
3. select surface
4. generate A/B
5. compare
6. keep best
7. update manifest
8. write report

---

## Stop Conditions

Stop iteration if:

- no measurable improvement after 3 runs
- repeated pattern emerges
- structural issue detected

Then:
escalate to higher-level redesign

---

## Upgrade Path (Future Phases)

Do NOT implement yet, but keep compatible:

Phase 2:

- viral sharing system

Phase 3:

- retention dashboard

Phase 4:

- unified destiny profile

---

## Final Instruction

This system must behave like:

a revenue optimizer, not a feature builder

Every change must answer:

"Will this increase the chance the user pays?"

If not:
do not implement

---

End of Program
