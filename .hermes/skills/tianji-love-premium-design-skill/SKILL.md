# Tianji Love Premium Design Skill

## Purpose
Upgrade `tianji.love` into a premium, trustworthy, conversion-focused relationship divination product using the research-backed visual direction:

- Default theme: **Moonlit Goldline / 月夜金线**
- Brand promise: private, calm, explainable relationship insight
- Business goal: improve first payment conversion without increasing legal, privacy, performance, or trust risk

## Non-negotiable Safety and Launch Boundaries
Hermes must follow these boundaries unless the user explicitly overrides them with a new written instruction:

1. Do not touch live Stripe keys, live payment products, production Supabase data, or production deployment secrets.
2. Do not run a real paid smoke test.
3. Do not deploy to production automatically.
4. Do not invent user testimonials, fake user counts, fake media logos, fake advisor credentials, or guaranteed prediction claims.
5. All divination copy must be framed as reflective relationship guidance, not medical, legal, financial, mental-health, or guaranteed future prediction advice.
6. Keep performance budget: no new heavy video/3D/particle dependency in the first implementation pass.
7. Prefer static gradients, subtle texture, CSS-only glow, and lightweight SVG/icon motifs.

## Design Direction
Use Scheme A as default:

```json
{
  "theme_name": "moonlit_goldline",
  "background": "#1C1533",
  "background_deep": "#0E0A1F",
  "surface": "rgba(255,255,255,0.06)",
  "surface_strong": "rgba(255,255,255,0.10)",
  "text_primary": "#F7F1E8",
  "text_secondary": "#CDBFAD",
  "gold": "#D8B77B",
  "rose": "#D99B93",
  "border": "rgba(216,183,123,0.28)",
  "danger": "#F4A7A3",
  "success": "#9ED8C4"
}
```

Visual keywords: premium, private, cinematic but light, eastern mystery without cheap superstition, relationship insight, calm confidence, gold-line diagrams, red-thread motifs, moon-phase accents, evidence cards.

## Execution Strategy
Hermes should execute in small, reviewable phases. Each phase must create evidence files under `.ai/` and run checks before continuing.

### Phase 0 — Audit and Baseline
1. Detect framework and package manager.
2. Record current branch, dirty state, latest commit, key files, available scripts.
3. Locate files related to homepage, pricing, about/trust, Ask, Draw, Daily Oracle, design tokens, global CSS, analytics events, sitemap/metadata.
4. Write `.ai/TIANJI_LOVE_PREMIUM_DESIGN_BASELINE.md`.

Required commands when available:

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
find . -maxdepth 4 -type f | sort | sed -n '1,240p'
cat package.json
```

### Phase 1 — Brand and Metadata Consistency
Fix inconsistent brand/domain/email/metadata copy.

Targets:
- External brand: `Tianji Love`
- Canonical domain: `https://tianji.love`
- Support/privacy email: use a single `@tianji.love` address if code already supports it; otherwise make a TODO rather than inventing operational inbox behavior.
- Root metadata must not say `tianji.global` unless intentionally linking to parent brand.

Deliverables:
- `.ai/TIANJI_LOVE_BRAND_CONSISTENCY_REPORT.md`
- Tests/build output evidence.

### Phase 2 — Design Tokens and Global Theme
Implement Moonlit Goldline tokens without breaking existing pages.

Targets:
- Central token file if present, otherwise CSS variables in global stylesheet.
- Typography system: serif display heading + readable sans body.
- Buttons: primary gold filled, secondary translucent bordered, destructive/disabled states.
- Cards: dark translucent surface, gold hairline border, accessible text contrast.
- Reduced motion support must stay intact.

Deliverables:
- Token diff summary
- `.ai/TIANJI_LOVE_DESIGN_TOKEN_REPORT.md`

### Phase 3 — Homepage Information Architecture
Refactor homepage toward this order:

1. Hero: one primary promise + two CTA max.
2. Trust strip: Privacy, explainability, safe framing, refund/terms link if already real.
3. Intent selector: “understand their feelings”, “understand timing”, “ask one private question”.
4. Free preview entry.
5. What unlock gives you: evidence cards and next-step action, not vague claims.
6. How it works.
7. Anonymous scenario cards or method transparency; no fake testimonials.
8. Pricing snapshot.
9. FAQ and safety disclaimer.
10. Final CTA.

Rules:
- Do not add fake user count.
- Keep `Love Reading` as primary, `Ask` secondary, `Draw` tertiary.
- Mobile first; no CTA clutter.

Deliverables:
- `.ai/TIANJI_LOVE_HOMEPAGE_IA_REPORT.md`

### Phase 4 — Pricing and Conversion Clarity
Unify pricing presentation. If product contract or Stripe prices are unclear, do not change backend prices; only clarify UI copy and create TODOs.

Recommended product ladder:
- Free preview
- One private question
- Full love report
- Monthly pass
- Annual pass

Targets:
- Avoid mixed USD/CNY contradictions.
- Explain who each plan is for.
- Add “what you get” checklist.
- Add safe disclaimer and refund/terms links.

Deliverables:
- `.ai/TIANJI_LOVE_PRICING_CLARITY_REPORT.md`

### Phase 5 — Trust Center / Method Page
Upgrade About into Method/Trust content or add a Trust section if route structure is fixed.

Must include:
- What Tianji Love does
- What it does not do
- How private inputs are handled
- How readings are generated at a high level
- Why results are reflective guidance, not guaranteed outcomes
- Delete/export/contact path if already supported

Deliverables:
- `.ai/TIANJI_LOVE_TRUST_CENTER_REPORT.md`

### Phase 6 — Accessibility, Performance, and SEO Guardrails
Run and record checks.

Required checks if scripts exist:

```bash
npm run lint
npm run typecheck
npm run build
npm test -- --runInBand
```

Additional checks:
- Search for `tianji.global` leftovers.
- Search for fake claims: `12,000`, `guaranteed`, `100%`, `accurate prediction`, `medical`, `legal`, `financial`.
- Verify color contrast in critical text combinations manually or via a small script.
- Ensure no new heavy dependencies such as `three`, heavy particle libraries, or video hero unless already present and not expanded.

Deliverables:
- `.ai/TIANJI_LOVE_DESIGN_QA_GATE.md`

## Final Output Format
Hermes final response must include:

1. What changed
2. Files changed
3. Commands run
4. Test/build result
5. Screenshots or screenshot instructions if generated
6. Remaining risks / No-Go items
7. Next recommended Hermes task

## Acceptance Criteria
The task is complete only when:

- Brand/domain/metadata are consistent for Tianji Love.
- Homepage uses the Moonlit Goldline visual system.
- CTA hierarchy is reduced to two primary actions above the fold.
- Pricing copy no longer contradicts itself in obvious ways.
- Trust/method/safety copy is visible and clear.
- Lint/typecheck/build pass, or failures are documented with exact blockers.
- No fake claims or guaranteed prediction language added.
- A complete `.ai/` evidence report set exists.
