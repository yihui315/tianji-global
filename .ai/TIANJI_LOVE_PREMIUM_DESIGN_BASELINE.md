# Tianji Love Premium Design — Phase 0 Audit Baseline

**Date:** 2026-06-11
**Branch:** `premium-design/ph1-brand-consistency` (from `origin/docs/hermes-tianji-love-premium-design-20260611`)
**Commit:** `73642ad` (docs: add Tianji Love premium design skill)
**Source commit on main:** `6716b7f`

---

## 1. Project Status

| Item | Value |
|------|-------|
| Package manager | npm |
| Framework | Next.js (App Router) |
| Build scripts | `dev`, `build`, `start`, `typecheck`, `lint`, `test`, `audit:routes`, `audit:copy`, `audit:share`, `audit:upgrade` |
| Design tokens | `src/design-system/design-tokens.ts` |
| Content tokens | `src/design-system/content-tokens.ts` |
| i18n / routing | `src/lib/i18n.ts` |
| Current theme | Deep space black + purple + gold (NOT Moonlit Goldline) |
| Branch state | Clean (no uncommitted changes) |

---

## 2. Brand Audit — Critical Findings

### CRITICAL: Brand/Domain Inconsistency (Phase 1 Target)

The product is at **tianji.love** but the codebase overwhelmingly uses **tianji.global** in:

- Root metadata (`src/app/layout.tsx` — metadataBase, siteName, title)
- `getSiteUrl()` fallback in `src/lib/i18n.ts`
- Organization JSON-LD (`src/components/seo/JsonLd.tsx`)
- Email templates
- Legal pages (privacy/terms/about)
- Share cards and OG images
- API meta responses
- Telegram bot messages
- PDF reports

**External brand** reads "TianJi Global" instead of "Tianji Love".
**Canonical domain** is `tianji.global` instead of `tianji.love`.

### Priority Files (Phase 1 — Brand Consistency)

1. `src/app/layout.tsx` — root metadata (HIGHEST — affects all pages)
2. `src/lib/i18n.ts` — `getSiteUrl()` fallback
3. `src/lib/i18n-metadata.ts` — siteName
4. `src/components/seo/JsonLd.tsx` — Organization structured data
5. `src/app/(main)/layout.tsx` — homepage metadata
6. `src/app/(main)/legal/privacy/page.tsx` — email + domain references
7. `src/app/(main)/legal/terms/page.tsx` — email + domain references
8. `src/app/(main)/about/page.tsx` — contact emails
9. `src/app/(main)/pricing/page.tsx` — billing email references
10. `src/components/emails/DailyDigestEmail.tsx` — email branding

### Secondary Files (Phase 1 — Share/OG/Meta)

11. `src/components/SharePanel.tsx` — Twitter share
12. `src/components/reading/HeroSummary.tsx` — share title
13. `src/components/destiny/DestinyShareCard.tsx` — canvas text
14. `src/components/widgets/BaseWidget.tsx` — widget branding
15. `src/components/hero/DeepSpaceHero.tsx` — hero subtitle
16. `src/components/share/ShareCard.tsx` — share card branding
17. `src/components/pdf/PDFReport.tsx` — PDF branding
18. `src/app/api/og/route.tsx` — OG image text
19. `src/app/api/share/card/route.tsx` — card text
20. `src/app/api/share/og/route.tsx` — OG text
21. `src/app/api/unsubscribe/route.ts` — unsubscribe page branding
22. `src/app/api/relationship/share/route.ts` — share URL
23. `src/app/api/telegram/webhook/route.ts` — bot messages

### Lower Priority (read-only/internal)

- `src/data/bazi-knowledge-base.ts`, `tarot-knowledge-base.ts`, `ziwei-knowledge-base.ts` — comments only
- `src/types/ai.ts`, `src/lib/*.ts` — file header comments
- `src/__tests__/` — test fixtures (don't change)
- `package.json` — npm package name (keep `tianji-global` for npm semantics)

---

## 3. Design Tokens Audit

**File:** `src/design-system/design-tokens.ts`

Current palette: deep black `#0a0a0a` + purple `#7C3AED` + gold `#D4AF37`
**NOT** the Moonlit Goldline palette from the skill spec.

Current tokens:
- `bgPrimary: '#0a0a0a'`
- `gold: '#D4AF37'`
- `purple: '#7C3AED'`
- `textPrimary: '#FFFFFF'`

Target tokens (Moonlit Goldline from skill spec):
- `background: '#1C1533'`
- `background_deep: '#0E0A1F'`
- `surface: 'rgba(255,255,255,0.06)'`
- `gold: '#D8B77B'` (warm, less saturated)
- `rose: '#D99B93'`
- `text_primary: '#F7F1E8'`
- `text_secondary: '#CDBFAD'`

**Phase 2** will update these tokens.

---

## 4. Homepage IA Audit

**Entry point:** `src/app/(main)/page.tsx` → `TianjiLoveHome.tsx`
**Pricing:** `src/app/(main)/pricing/page.tsx`
**Design tokens consumer:** `src/design-system/content-tokens.ts`

Key components:
- `TianjiLoveHome.tsx` — homepage (video hero, CTA modules)
- `PricingSection.tsx` — pricing display
- `EntryPathways.tsx` — user intent selector
- `DestinyPhilosophy.tsx` — philosophy section
- `AIBackend.tsx` — AI features
- `ToolsByCategory.tsx` — service grid

**Phase 3** will refactor homepage IA.

---

## 5. SEO / Metadata Audit

- `src/app/robots.ts` — uses `getSiteUrl()` ✓ (correct domain)
- `src/app/sitemap.ts` — uses `getSiteUrl()` ✓
- Root layout metadata uses hardcoded `tianji.global` ✗
- `JsonLd.tsx` hardcodes `tianji.global` ✗

---

## 6. Safety Boundary Reminder

**No changes permitted to:**
- Live Stripe keys (`.env.production`, Stripe dashboard)
- Production Supabase data
- `src/lib/entitlements.ts` (revenue-critical)
- `src/lib/stripe.ts` (payment logic)
- `src/app/api/checkout/` (payment routes)
- `src/app/api/stripe/` (webhook routes)
- `src/app/api/billing/` (billing routes)

---

## 7. Next Steps

- [ ] **Phase 1:** Brand/domain consistency — update all critical files from `tianji.global` → `tianji.love` and `TianJi Global` → `Tianji Love`
- [ ] **Phase 2:** Design tokens — implement Moonlit Goldline palette
- [ ] **Phase 3:** Homepage IA refactor
- [ ] **Phase 4:** Pricing clarity
- [ ] **Phase 5:** Trust center
- [ ] **Phase 6:** QA gates (lint, typecheck, build, audit scripts)

---

## 8. Evidence Commands

```bash
# Brand consistency check
grep -rln "tianji.global\|TianJi Global" src/ --include="*.tsx" --include="*.ts" | grep -v "__tests__" | grep -v "node_modules"

# Build baseline
cd /opt/tianji-global && npm run build

# Typecheck
npx tsc --noEmit 2>&1 | grep "^src/app/api/" | head -20
```