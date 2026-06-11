# Tianji Love Premium Design — Phase 2: Design Token Report

**Date:** 2026-06-11
**Branch:** `premium-design/ph1-brand-consistency`
**Build ID:** `yBXoTnin8Sxpw4pvO5FuI`
**Status:** ✅ PASS — lint ✓ build ✓

---

## Summary

Implemented **Moonlit Goldline / 月夜金线** design token theme across:
- `src/app/globals.css` — CSS custom properties
- `src/design-system/design-tokens.ts` — TypeScript token exports
- `src/app/layout.tsx` — root body class

---

## Token Diff

### Color Palette

| Token | Before | After | Notes |
|-------|--------|-------|-------|
| `bgPrimary` | `#0a0a0a` (deep black) | `#1C1533` (deep violet) | Moonlit Goldline base |
| `bgNebula` | `rgba(42,10,58,0.4)` | `rgba(30,20,60,0.5)` | Softer purple haze |
| `gold` | `#D4AF37` | `#D8B77B` | Warm rose-gold (less saturated) |
| `goldLight` | `#F5C542` | `#E8CFA0` | Lighter warm gold |
| `purple` | `#7C3AED` | `#9B8DC8` | Muted lavender (softer) |
| `purpleLight` | `#A78BFA` | `#BDB0D8` | Light lavender |
| **NEW: `rose`** | — | `#D99B93` | Blush rose for love/relationship warmth |
| **NEW: `roseLight`** | — | `#E8C4B8` | Light blush |
| **NEW: `bgSurfaceStrong`** | — | `rgba(255,255,255,0.10)` | Stronger surface for cards |
| `textPrimary` | `#FFFFFF` | `#F7F1E8` | Warm ivory |
| `textSecondary` | `rgba(255,255,255,0.7)` | `#CDBFAD` | Warm sand |
| `borderSubtle` | `rgba(255,255,255,0.06)` | `rgba(216,183,123,0.12)` | Gold hairline |
| `borderMedium` | `rgba(255,255,255,0.12)` | `rgba(216,183,123,0.20)` | Gold medium border |
| `riskRed` | `#EF4444` | `#D99B93` | Rose-tinted (softer, consistent) |
| `successGreen` | `#10B981` | `#9ED8C4` | Muted sage green |

### Shadows

| Token | Before | After |
|-------|--------|-------|
| `softGlass` | white inset glow | warm gold-tinted inset |
| `strongGlass` | white inset | warm gold-tinted inset |
| `glow` default | purple | warm gold |
| `focusRing` | aggressive purple | muted lavender |

### Glass Cards

| Token | Before | After |
|-------|--------|-------|
| `glass.card.background` | `rgba(255,255,255,0.03)` | `rgba(255,255,255,0.06)` |
| `glass.soft.background` | `rgba(255,255,255,0.01)` | `rgba(255,255,255,0.03)` |
| `glass.strong.background` | `rgba(255,255,255,0.02)` | `rgba(255,255,255,0.05)` |

### CSS Star Field
- Star color `rgba(212,175,55,*)` → `rgba(216,183,123,*)` (consistent with new gold)

### `.mystic-page` Gradient
- `#2a0a3a` → `#2a1f4a` (violet tint)
- `#1a0a2e` → `#1C1533` (moonlit violet)
- `#0a0a0a` → `#0E0A1F` (deep violet-black)

---

## Files Changed

| File | Change |
|------|--------|
| `src/app/globals.css` | CSS vars updated, star field gold, mystic-page gradient |
| `src/design-system/design-tokens.ts` | Full color + shadow + glass token overhaul |
| `src/app/layout.tsx` | Body class: `#050508` → `#1C1533`, text → `#F7F1E8` |

---

## Verification

```bash
npm run lint   # ✅ No ESLint warnings or errors
npm run build  # ✅ BUILD_ID yBXoTnin8Sxpw4pvO5FuI
```

---

## Safety Boundary Compliance

| Check | Status |
|-------|--------|
| No Stripe/payment routes | ✅ |
| No production env | ✅ |
| No fake claims | ✅ |
| No new heavy dependencies | ✅ |
| Performance budget intact | ✅ |

---

## Next Steps

- [ ] **Phase 3:** Homepage IA Refactor (Hero → Trust Strip → Intent Selector → Evidence Cards → Pricing → FAQ)
- [ ] **Phase 4:** Pricing Clarity
- [ ] **Phase 5:** Trust Center / Method Page
