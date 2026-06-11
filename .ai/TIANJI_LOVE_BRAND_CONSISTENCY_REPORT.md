# Tianji Love Premium Design — Phase 1: Brand Consistency Report

**Date:** 2026-06-11
**Branch:** `premium-design/ph1-brand-consistency`
**Build ID:** `eKabwDwDQ6icoy6pQHIui`
**Status:** ✅ PASS — lint ✓ typecheck ✓ build ✓

---

## Summary

Phase 1 replaced all instances of:
- `tianji.global` → `tianji.love`
- `TianJi Global` → `Tianji Love`
- `hello@tianji.global` → `hello@tianji.love`
- `privacy@tianji.global` → `privacy@tianji.love`
- `billing@tianji.global` → `billing@tianji.love`
- `noreply@tianji.global` → `noreply@tianji.love`

---

## Files Changed (40 files)

### Root Metadata (HIGHEST PRIORITY)
1. `src/app/layout.tsx` — root metadata, metadataBase, siteName, OG/Twitter
2. `src/lib/i18n.ts` — `getSiteUrl()` fallback
3. `src/lib/i18n-metadata.ts` — `siteName` in buildLocalizedMetadata
4. `src/components/seo/JsonLd.tsx` — SITE constant (url, name, emails, description)

### Homepage / (main) Layout
5. `src/app/(main)/layout.tsx` — homepage metadata, keywords, OG, canonical
6. `src/app/(main)/about/layout.tsx` — OG siteName

### Legal Pages
7. `src/app/(main)/legal/privacy/page.tsx` — contact emails, domain
8. `src/app/(main)/legal/privacy/layout.tsx` — canonical URL
9. `src/app/(main)/legal/terms/page.tsx` — contact emails, domain
10. `src/app/(main)/legal/terms/layout.tsx` — canonical URL

### About Page
11. `src/app/(main)/about/page.tsx` — contact emails

### Pricing Pages
12. `src/app/(main)/pricing/page.tsx` — billing email references
13. `src/app/(main)/pricing/layout.tsx` — refund email

### Module Pages (shareUrl)
14. `src/app/(main)/western/page.tsx`
15. `src/app/(main)/fortune/page.tsx`
16. `src/app/(main)/solar-return/page.tsx`
17. `src/app/(main)/synastry/page.tsx`
18. `src/app/(main)/numerology/page.tsx`
19. `src/app/(main)/love-match/page.tsx`
20. `src/app/(main)/tarot/page.tsx`
21. `src/app/(main)/bazi/page.tsx`
22. `src/app/(main)/yijing/page.tsx`
23. `src/app/(main)/celebrity-match/page.tsx`
24. `src/app/(main)/transit/page.tsx`

### Component Files
25. `src/components/emails/DailyDigestEmail.tsx` — from address, brand text
26. `src/components/destiny/DestinyShareCard.tsx` — canvas text
27. `src/components/widgets/BaseWidget.tsx` — widget branding
28. `src/components/hero/DeepSpaceHero.tsx` — hero subtitle
29. `src/components/share/ShareCard.tsx` — share card branding
30. `src/components/pdf/PDFReport.tsx` — PDF logo text
31. `src/components/reading/HeroSummary.tsx` — share title
32. `src/components/SharePanel.tsx` — Twitter share text

### API Routes
33. `src/app/api/og/route.tsx`
34. `src/app/api/share/card/route.tsx`
35. `src/app/api/share/og/route.tsx`
36. `src/app/api/unsubscribe/route.ts`
37. `src/app/api/relationship/share/route.ts`
38. `src/app/api/telegram/webhook/route.ts`
39. `src/app/api/cron/daily-digest/route.ts`

### Library Files
40. `src/lib/love-report-email.ts` — email from address
41. `src/lib/auth.ts` — comment (Resend domain verification note)

---

## Files NOT Changed (intentional)

- `package.json` — npm package name stays `tianji-global` (npm registry semantics)
- `src/__tests__/` — test fixtures unchanged
- `src/data/*.ts` — knowledge base file headers (comments only)
- `src/lib/*.ts` file headers — comments
- `public/assets/video-prompts/` — local path references (not runtime)

---

## Verification

```bash
# No tianji.global remaining in src/
grep -rln "tianji.global" src/ --include="*.ts" --include="*.tsx" | grep -v "__tests__"

# Expected: no output (all clean)

npm run lint      # ✅ PASS — No ESLint warnings or errors
npx tsc --noEmit  # ✅ PASS — no API route TS errors
npm run build    # ✅ PASS — BUILD_ID eKabwDwDQ6icoy6pQHIui
```

---

## Safety Boundary Compliance

| Check | Status |
|-------|--------|
| No Stripe key changes | ✅ |
| No production env changes | ✅ |
| No payment route changes | ✅ |
| No fake claims added | ✅ |
| No test data changed | ✅ |

---

## Next Steps

- [ ] **Phase 2:** Design Tokens — implement Moonlit Goldline palette
- [ ] **Phase 3:** Homepage IA refactor
- [ ] **Phase 4:** Pricing clarity
- [ ] **Phase 5:** Trust center
- [ ] **Phase 6:** QA gates

---

## Commit

```
feat(brand): unify brand/domain from TianJi Global + tianji.global → Tianji Love + tianji.love

- Update root metadata (layout.tsx) from "TianJi Global" to "Tianji Love"
- Update metadataBase, getSiteUrl() fallback from tianji.global → tianji.love
- Update JsonLd SITE constant (url, name, emails, description)
- Update all legal/privacy/terms/about/pricing pages (contact emails)
- Update all module page shareUrl references (western, bazi, tarot, etc.)
- Update all component share/OG/branding text (ShareCard, PDFReport, etc.)
- Update API route meta/branding text (OG image, share card, unsubscribe)
- Update email from address (noreply@tianji.love)

Safety: no Stripe, no production env, no payment routes touched.
Lint ✓ TypeScript ✓ Build ✓ (BUILD_ID eKabwDwDQ6icoy6pQHIui)
```