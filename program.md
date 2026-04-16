# TianJi Autonomous Upgrade Program — A/B Evolution Mode

## Current focus
Run A/B evolution for Relationship module only.

## Experiment surfaces (ONE per run)
1. **Hero Summary** — headline, one-liner, CTA copy
2. **Relationship Pattern** — naming, one-liner, tags
3. **Dimension Card Explanations** — five dimension descriptions
4. **Premium Upgrade Section** — lock文案, premium收益, CTA强度

## A/B Rules
- Generate exactly 2 variants per experiment
- Variant A = emotional/qualitative framing
- Variant B = functional/conversion framing
- Compare both, keep ONLY the winner
- Discard the weaker variant permanently

## Allowed files (Relationship only)
- src/app/relationship/**
- src/components/relationship/**
- src/components/share/**
- src/lib/relationship-engine.ts
- src/lib/synastry-engine.ts

## Protected (NEVER touch)
- auth, billing, deployment config
- privacy policy, share privacy safeguards
- environment config, other modules

## Success criteria
A winning variant must:
- pass all audits
- improve relationship score
- improve at least one: clarity / emotional resonance / upgrade strength

## Failure policy
Discard if:
- both variants score below baseline
- audit fails
- privacy/share regression
- bilingual duplication increases

## Scoring
scripts/calculate-relationship-score.ts

## Output
- experiments/relationship/variant-a.json
- experiments/relationship/variant-b.json
- ab-result.json (winner)
- experiments/manifest.json (run history)
- codex-upgrade-report.md
