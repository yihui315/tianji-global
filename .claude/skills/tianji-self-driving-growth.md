# TianJi Self-Driving Growth Skill

## Mission
Continuously evolve TianJi from a multi-tool divination site into a revenue-generating, unified destiny platform.

The system must optimize for:
1. conversion
2. virality
3. retention
4. unified user understanding
5. safe and premium product quality

---

## North Star
Every iteration must move TianJi closer to this business loop:

Entry Product
-> Emotional Result
-> Premium Unlock
-> Shareable Output
-> Repeat Usage
-> Unified Destiny Profile
-> Higher Lifetime Value

---

## Product Priorities
Always prioritize in this order:

1. Conversion
2. Virality
3. Retention
4. Unified profile coherence
5. New modules

Never optimize new features before the monetization path is clear.

---

## System Layers

### Layer 1 — Entry Product
Primary entry must be:
- AI Destiny Scan

It should:
- ask for minimal input
- feel fast
- create emotional anticipation
- produce a strong partial result
- lead naturally to unlock

### Layer 2 — Result Monetization
Result pages must:
- create emotional resonance
- show visual proof
- withhold the most valuable layer
- present a clear upgrade path

### Layer 3 — Unified Destiny Profile
All module outputs must feed one unified profile organized by these axes:
- identity
- relationship
- career
- wealth
- timing
- advice

### Layer 4 — Viral Units
The platform must generate shareable units:
- one-liner insight card
- destiny K-line chart
- relationship compatibility card

### Layer 5 — Retention
The platform must create a reason to return:
- current window
- today / week update
- evolving profile
- relationship changes
- timing changes

### Layer 6 — Self Evolution
The platform must:
- detect bottlenecks
- generate experiments
- compare variants
- keep winners
- discard losers
- record learning

---

## Active Experimental Domain
Current active evolution domain:
- Relationship module

Allowed files:
- src/app/relationship/**
- src/components/relationship/**
- src/components/share/**
- src/lib/relationship-engine.ts
- src/lib/synastry-engine.ts
- src/lib/analytics/**
- scripts/** related to relationship experiments
- experiments/**

Protected files:
- auth
- billing
- deployment config
- privacy policy
- share privacy safeguards
- environment config
- payment security logic

Do not touch protected files unless explicitly instructed.

---

## Current Business Bottleneck Model

The system must always determine the weakest link among:

### Conversion
Signals:
- upgrade_click_rate
- payment_conversion_rate
- premium_section_open_rate

### Virality
Signals:
- share_click_rate
- share_success_rate
- relationship card share rate
- K-line chart share rate

### Retention
Signals:
- return_7d_rate
- repeat_reading_rate
- dashboard revisit rate

### Clarity
Signals:
- too many entry paths
- weak CTA hierarchy
- result confusion
- unclear premium value

The lowest-performing axis becomes the next focus.

---

## Decision Engine

### Step 1 — Scan
Read:
- program.md
- experiments/manifest.json
- codex-upgrade-report.md
- analytics summaries if available

### Step 2 — Diagnose
Score:
- conversion
- virality
- retention
- clarity

### Step 3 — Select Focus
Choose the single highest-impact bottleneck.

### Step 4 — Choose Surface
Select exactly ONE experiment surface for this cycle.

Allowed experiment surfaces:
- hero summary
- relationship pattern wording
- dimension card wording
- current window wording
- premium upgrade section
- share card wording
- share card layout
- result page lock structure
- CTA phrasing

Never run more than one experiment surface per cycle.

---

## Multi-Strategy Evolution Mode

When sufficient stability exists, run parallel strategy evolution.

### Strategy Generator
Generate 3 to 5 competing strategies.
Each strategy must differ in one or more of:
- emotional tone
- CTA style
- text vs visual emphasis
- clarity vs mystery
- soft vs intense framing

Example strategy families:
- emotional_intense
- minimal_clean
- premium_psychology
- visual_heavy
- clarity_first

### Parallel Rule
Each strategy may run one A/B experiment only.
No overlapping surfaces in the same cycle.

### Selection Rule
Keep only the top 20% to 30% of strategies by total score.
Discard the rest.

### Mutation Rule
Generate the next generation by mutating winners:
- rewrite headline
- alter CTA language
- reduce friction
- emphasize premium value
- strengthen shareability

---

## Relationship Module Evolution Standard

The Relationship module is considered premium-grade only if it includes:

1. Hero Summary
2. Top relationship pattern
3. Five dimensions:
   - attraction
   - communication
   - conflict
   - rhythm
   - longTerm
4. Current 30-day window
5. Practical guidance
6. Premium locked section
7. Share modes:
   - summary
   - graph
   - one_liner
8. Privacy-safe sharing defaults

If one of these is missing, prioritize closing that gap.

---

## Unified Backend Standard

All modules must eventually map into a unified destiny backend.

Unified axes:
- identity
- relationship
- career
- wealth
- timing
- advice

All new module work must preserve or improve compatibility with the unified profile model.

Never build isolated features that cannot be aggregated later.

---

## Evaluation Hierarchy

### Technical Gate
Must pass:
- npm run typecheck
- npm run lint
- npm run test
- npm run build
- npm run audit:routes
- npm run audit:copy
- npm run audit:share
- npm run audit:upgrade

### Structural Gate
Must preserve:
- premium gating
- route integrity
- privacy-safe sharing
- module compatibility
- no mirrored bilingual body copy

### Product Gate
Must improve one or more of:
- clarity
- emotional resonance
- upgrade intent
- shareability
- retention potential

### Business Gate
Highest priority:
- upgrade click lift
- share lift
- retention lift

---

## Scoring Rules

### Offline Score
Offline scoring may be used only as a pre-filter.
It may evaluate:
- structure completeness
- copy clarity
- pattern readability
- upgrade section strength

Offline score must NOT be treated as final winner.

### Real Winner
Final winner must be decided by user behavior when available.

Preferred metric priority:
1. upgrade_click_rate
2. payment_conversion_rate
3. share_click_rate
4. share_success_rate
5. dimension_expand_rate
6. return_7d_rate

If no live data exists yet:
- use offline scoring only as temporary gating
- mark the result as provisional

---

## Keep / Discard Rules

KEEP if:
- required checks pass
- no privacy regression exists
- no monetization path is weakened
- score improves or user behavior improves

DISCARD if:
- score does not improve above threshold
- conversion gets worse
- sharing gets weaker
- privacy defaults are weakened
- unnecessary scope creep appears

Low-signal experiments should be labeled:
- provisional_keep
rather than final keep

---

## Memory and Learning

Every cycle must update:
- experiments/manifest.json
- codex-upgrade-report.md

Manifest entries must include:
- id
- module
- surface
- timestamp
- variantA
- variantB
- winner
- decision
- delta
- trend
- checks
- notes
- metrics if available

Notes must capture:
- what worked
- what failed
- what pattern may be emerging

This system must learn patterns over time such as:
- emotional vs rational framing
- short vs long summaries
- soft vs hard CTA
- visual-first vs copy-first result sections

---

## Required Outputs Per Cycle

Every valid cycle must produce:
1. code changes
2. ab-result.json
3. codex-upgrade-report.md
4. updated experiments/manifest.json

If any of these are missing, the cycle is incomplete.

---

## Hard Constraints

Never:
- expose birthDate, birthTime, birthLocation, or timezone in public share outputs
- weaken premium gating
- remove pricing, FAQ, trust, or disclaimer sections
- create multiple competing main funnels
- modify unrelated modules in a focused cycle
- replace real A/B with self-confirming biased scoring logic

---

## Core Funnel Rule
There should be one dominant monetization funnel:

AI Destiny Scan
-> Emotional partial result
-> Strong lock point
-> Premium unlock
-> Shareable unit
-> Repeat use
-> Unified destiny profile

All product evolution must strengthen this funnel.

---

## Recommended Iteration Order

### Phase 1 — Monetization
Optimize:
- destiny scan
- result page lock
- upgrade CTA

### Phase 2 — Virality
Optimize:
- one-liner cards
- relationship share cards
- destiny K-line sharing

### Phase 3 — Retention
Optimize:
- dashboard current window
- evolving timeline
- recurring updates

### Phase 4 — Unification
Optimize:
- unified destiny profile
- cross-module coherence
- profile-level insights

### Phase 5 — Expansion
Only after phases 1–4 are working:
- advisor mode
- B2B exports
- additional modules

---

## Invocation Patterns

### Manual focused run
Run one evolution cycle for the current highest-value bottleneck.
Use one experiment surface only.
Preserve all hard constraints.

### Autonomous growth run
Scan current system state, identify the weakest axis,
select one experiment surface,
run one A/B cycle,
keep only the stronger result,
update manifest and report.

### Multi-strategy run
Generate 3–5 competing strategies,
run one experiment per strategy,
score and rank them,
keep top 20–30%,
discard the rest,
record learning.

---

## End Goal

The final product should behave like:
- a unified destiny platform
- a conversion engine
- a viral sharing system
- a retention system
- a self-improving product loop

The purpose is not to maximize “prediction correctness”.
The purpose is to maximize:
- perceived insight
- emotional resonance
- user belief
- useful guidance
- recurring engagement
- sustainable revenue

End of Skill
