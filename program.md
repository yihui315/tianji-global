# TianJi Autonomous Upgrade Program

## Active module
**Relationship** — 增长引擎 · 转化 + 裂变核心

## Evolution faces (choose ONE per run)
| Face | Focus | Goal |
|------|-------|------|
| A | Hero Summary | Upgrade conversion |
| B | Five Dimension Cards | Clarity + human tone |
| C | Relationship Pattern | Shareability + virality |
| D | Current Window | Return-visit + urgency |
| E | Share Card | Growth + emotional punch |

## Allowed files
- src/app/relationship/**
- src/components/relationship/**
- src/components/share/**
- src/lib/relationship-engine.ts
- src/lib/synastry-engine.ts

## Protected files (NEVER touch)
- auth, billing, deployment config
- privacy policy, share privacy safeguards
- environment config, other modules

## Success criteria
Must ALL pass:
- pass all CI checks
- Relationship score improves by ≥ 2 points
- preserve privacy safety
- improve at least one: relationship clarity / share usability / upgrade conversion

## Failure policy
Discard if:
- score margin < 2 (prevents fake improvements)
- audit fails
- privacy regression
- bilingual duplication increases

## Scoring function
scripts/calculate-relationship-score.ts

## Iteration rules
- one module per run (Relationship ONLY)
- max 5 files changed
- max 1 retry on failure
- must produce codex-relationship-report.md
- record every run in experiments/manifest.json
