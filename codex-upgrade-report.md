# Codex Upgrade Report — rel-ab-001

**Generated:** 2026-07-16T05:47:07.862Z
**Experiment ID:** rel-ab-001
**Module:** Relationship
**Focus:** hero_summary — Hero Summary

## Variant A — Emotional Framing

```
Variant A: Functional Hero Summary
Headline strength: 18/20 | Pattern clarity: 15/15 | Emotional resonance: 10/15 | Upgrade strength: 14/15
```

## Variant B — Functional Framing

```
Variant B: Functional Hero Summary
Headline strength: 16/20 | Pattern clarity: 18/15 | Emotional resonance: 10/15 | Upgrade strength: 14/15
```

## Winner

**✅ Variant A** — chosen

## Score Comparison

| Metric | Variant A | Variant B |
|--------|-----------|-----------|
| Score  | 128  | 129  |
| Margin | 37 pts | — |

**Before:** 91  **After:** 128  **Delta:** +37

## Decision

**❌ DISCARD** — margin < 2 pts, insufficient improvement

## Current Source Copy (as of this experiment)

**Hero Summary**
```
相互吸引，成长同步
```

## Checks

| Check | Status |
|-------|--------|
| npm run audit:routes | ✅ |
| npm run audit:copy | ✅ |
| npm run audit:share | ✅ |
| npm run audit:upgrade | ✅ |
| codex-upgrade-report.md generated | ✅ |

## Risks

- Score improvement is metric-based, not user-behavior validated
- Real A/B with live traffic needed for statistical significance
- Next experiment should target a different surface for breadth

## Next Focus (suggested)

- Pattern naming (relationship archetype copy)

---
*Report generated automatically by generate-upgrade-report.ts — 2026-07-16T05:47:07.862Z*
