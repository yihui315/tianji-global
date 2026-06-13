# Tianji Love Premium Design — Phase 0: Baseline Audit

**Date:** 2026-06-12
**Branch:** `feat/tianji-love-premium-design-20260611`
**Commit:** `1554b817`
**Repository:** yihui315/tianji-global

---

## Git Status

- Clean working tree (no uncommitted changes)
- On branch: `feat/tianji-love-premium-design-20260611`
- Skill package committed: commit `1554b81` (docs(hermes): add Tianji Love premium design skill package)

---

## Package Manager & Scripts

- **Manager:** npm
- **Available scripts:** dev, build, release:check, start, smoke:production, serve, typecheck, test, lint, audit:routes, audit:copy, audit:share, audit:upgrade, audit:release-gate, upgrade:plan

---

## Key Files Found

### App Structure
- `src/app/(main)/page.tsx` — homepage
- `src/app/(main)/pricing/page.tsx` — pricing
- `src/app/(main)/about/page.tsx` — about / trust center
- `src/app/(main)/relationship/` — relationship reading flows
- `src/app/(main)/ask/` — ask a question
- `src/app/(main)/draw/` — three-card draw
- `src/app/(main)/legal/` — legal pages
- `src/app/layout.tsx` — ROOT layout (metadata lives here)
- `src/app/(main)/layout.tsx` — main layout (per-page metadata)

### Design & CSS
- `src/app/globals.css` — global styles + CSS custom properties
- `src/design-system/design-tokens.ts` — design tokens (referenced)
- No centralized CSS variable file for Moonlit Goldline yet

### SEO
- `src/components/seo/JsonLd.tsx` — SITE constant (JsonLd Organization data)

---

## Critical Issues Found

### 1. Root Layout Metadata — WRONG BRAND
`src/app/layout.tsx` still hardcodes `TianJi Global` and `tianji.global`:
- `metadataBase` fallback: `https://tianji.global`
- `title`: `TianJi Global | Premium AI Destiny Platform`
- `openGraph.siteName`: `TianJi Global`
- `openGraph.images`: `TianJi+Global` in OG image URL
- `twitter.title`: `TianJi Global | Premium AI Destiny Platform`

### 2. Current CSS Theme — OLD MYSTIC SYSTEM
`globals.css` still uses the **old nebula design system** (not Moonlit Goldline):
- `--mystic-bg-primary: #0a0a0a` (old deep black)
- `--mystic-accent-gold: #D4AF37` (old gold)
- `--mystic-accent-purple: #7C3AED` (old purple)
- No `--moonlit-bg: #1C1533` (Moonlit Goldline background)
- No `--gold: #D8B77B` / `--rose: #D99B93` tokens

### 3. (main)/layout.tsx — ALREADY CORRECT
Already updated with:
- `siteName: 'Tianji Love'`
- `url: 'https://tianji.love'`
- Correct OG image with Tianji Love branding
- ✅ No further brand action needed here

### 4. JsonLd SITE constant — needs checking
`src/components/seo/JsonLd.tsx` — need to verify SITE.name, SITE.url

---

## Phase 1 Targets

1. Fix `src/app/layout.tsx` — replace all `TianJi Global` → `Tianji Love`, `tianji.global` → `tianji.love`
2. Fix OG image URL pattern from `TianJi+Global` → `Tianji+Love`
3. Verify `src/components/seo/JsonLd.tsx` SITE constant

---

## Phase 2 Targets

1. Add Moonlit Goldline CSS variables to `globals.css`
2. Preserve existing utility classes (tailwind still active)
3. Don't break existing page layouts — incremental implementation
4. Add reduced motion support

---

## Evidence

- Command: `git status --short` → clean
- Command: `git rev-parse HEAD` → `1554b817`
- `src/app/layout.tsx` lines 6-20 contain wrong brand
- `globals.css` uses `--mystic-*` variables, not Moonlit Goldline
- `(main)/layout.tsx` already has correct `Tianji Love` metadata ✅

---

## No-Go Items Confirmed

- ❌ Live Stripe keys — not touched
- ❌ Production Supabase — not touched  
- ❌ Production deploy — not executed
- ❌ Fake testimonials — none present ✅
- ❌ Guaranteed prediction claims — none found in current audit ✅
