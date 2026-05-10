---
name: tianji-cinematic
description: |
  Project-specific design law for TianJi Global (天机). Cinematic / Apple Vision / Cosmos
  aesthetic on a deep-space-black canvas. Use this skill any time you build, edit, or
  review ANY page or component under tianji-global/. It defines: palette, typography,
  page chrome, layout primitives, motion, density, banned patterns, and a per-page-type
  recipe. Trigger words: "tianji UI", "新页面", "重排页面", "页面太乱", "美观", "cinematic",
  "Apple Vision style", "redesign a page", "make it cinematic". This skill OVERRIDES any
  generic frontend advice when working in this repo.
---

# TianJi Cinematic Design Skill

> 北极星 / North Star
> 进入任何一个 TianJi 页面，应当像走进一座电影院的开场镜头——
> 漆黑、冷静、深紫与暗金作主光，一束 spotlight 落在内容中央。
> 不是一个网页，是一帧未上映的电影海报。
> Walk into any TianJi page like the opening shot of a film:
> deep dark, cold and still, purple-and-gold key light, one spotlight on the content.
> Not a web page — a still frame from a film not yet released.

This skill is the **single design law** for the entire `tianji-global` codebase. When
in doubt, this file beats Tailwind defaults, beats screenshots from other sites, beats
"the previous page already does it that way." Old pages are wrong; align them, don't
inherit from them.

---

## 0. How to use this skill

When you're doing any of the below, **re-read this file first**, then execute:

| Trigger                                              | What to do                                                       |
|------------------------------------------------------|------------------------------------------------------------------|
| Building a new page under `src/app/(main)/...`       | Pick a recipe in §7 and follow it line by line.                  |
| Editing an existing page that breaks rules in §1–§6  | Refactor to use the approved primitives in §5. Do not patch.     |
| Reviewing a PR / a screenshot                        | Run the §8 checklist. Any failure blocks the change.             |
| User says "页面乱 / make it cinematic / 美观一些"     | Re-skin per §1–§7; explicitly call out which §X rules you applied.|

**Hard rule:** If a request conflicts with this skill, ask the user before deviating.
Do not silently introduce a second design language.

---

## 1. Palette law

### 1.1 The only palette

There are **four** color families allowed on any TianJi surface, period. Everything
else is illegal.

| Role           | Token                              | Hex                              | Use                                       |
|----------------|------------------------------------|----------------------------------|-------------------------------------------|
| Bg base        | `colors.bgPrimary`                 | `#0a0a0a`                        | Page background. Always.                  |
| Bg nebula      | `colors.bgNebula`                  | `rgba(42,10,58,0.5)`             | Top-corner spotlight only.                |
| Key accent     | `colors.gold` / `colors.goldLight` | `#D4AF37` / `#F5C542`            | Primary CTA, divider, key highlight.      |
| Key accent     | `colors.purple` / `purpleLight`    | `#7C3AED` / `#A78BFA`            | Glow, secondary highlight, narrative aura.|
| Text           | `textPrimary..textMuted`           | `rgba(255,255,255, 0.9..0.25)`   | Four steps of opacity, no other whites.   |
| Functional     | `riskRed / successGreen / dataCyan`| `#EF4444 / #10B981 / #06B6D4`    | Only inside data charts and result deltas.|

Source of truth: `src/design-system/design-tokens.ts`. **Always import the token,
never hand-type a hex.**

```tsx
// ✅ correct
import { colors } from '@/design-system';
<p style={{ color: colors.textSecondary }}>...</p>

// ❌ wrong
<p className="text-amber-400">...</p>
<p style={{ color: '#A78BFA' }}>...</p>
```

### 1.2 Banned colors

Any of the following appearing anywhere outside `__tests__/` is a violation:

- Tailwind candy palettes: `amber-{200..600}`, `pink-*`, `rose-*`, `orange-*`,
  `cyan-* (outside data charts)`, `emerald-* (outside data charts)`, `violet-*`,
  `indigo-*`, `yellow-* (except in data charts)`, `blue-* (outside data charts)`,
  `red-* (outside risk indicators)`.
- Multi-stop "candy" gradients like
  `bg-gradient-to-r from-amber-400 via-purple-400 to-pink-400`. The TianJi gradient
  is **black → nebula purple → black**, full stop.
- Pure white `#fff` as text color. Use `colors.textPrimary` (rgba 0.9 white) so the
  cinematic dimming holds.
- Any flat saturated background larger than 64×64px (e.g. `bg-amber-600`,
  `bg-purple-700`). The base is always `bgPrimary`; accents arrive only as
  *glows*, *gradients*, or *thin strokes*.

If a designer or older page uses a banned color, treat it as a bug.

### 1.3 The two legal gradients

Only these gradients exist in TianJi:

```tsx
// (a) Page chrome — vertical cinematic descent.
background: 'linear-gradient(180deg, #050508 0%, #0a0a0a 18%, #130814 56%, #07070a 100%)'

// (b) Hero overlay — dim the video/image so text reads.
background: 'linear-gradient(180deg, rgba(10,10,10,0.22) 0%, rgba(10,10,10,0.52) 58%, rgba(10,10,10,0.9) 100%)'
```

Anything else is a violation. **Glows are radial-gradients, not linear-gradients;
they belong on z-index 0–2, never on text.**

### 1.4 Glow law

Glows are how cinematic light shows up on TianJi. Every "wow moment" on the page is
exactly one of these:

```tsx
// purple aura — for narrative / mystic moments
boxShadow: '0 0 60px rgba(167,139,250,0.18)'
// gold aura — for primary CTA / keynote highlight
boxShadow: '0 0 36px rgba(245, 197, 66, 0.16)'
// page-corner spotlight (z-index 0..2, behind content)
background: 'radial-gradient(circle at 50% 28%, rgba(124,58,237,0.18) 0%, transparent 44%)'
```

Never apply both auras to the same element — pick one.

---

## 2. Typography law

### 2.1 Three voices, no fourth

| Voice          | Token                       | Where it appears                                  |
|----------------|-----------------------------|---------------------------------------------------|
| **Hero**       | `typography.hero`           | Once per page, in the hero or page-opener H1.     |
| **Section**    | `typography.sectionTitle`   | Each `<LandingSection title>`'s H2.               |
| **Body**       | `typography.insightText`    | Paragraphs, card body, descriptions.              |
| Cards/labels   | `cardTitle / finePrint / badge` | Internal card text, eyebrows, micro-labels.   |

`Hero` and `sectionTitle` are **Instrument Serif italic**. They are the soul of the
brand. Never replace them with `font-bold sans-serif`. Never apply a candy gradient
text-clip on top of them.

### 2.2 Title rules

- Always go through `<SmartTitle>` for any title that holds Chinese + Latin
  tokens. It handles balance + line break + script switching. Don't hand-roll.
- Eyebrow text (`tracking-[0.28em]`, uppercase, `textTertiary`) sits **above** every
  section title — it's how the user knows "we're entering a new beat." If a section
  has no eyebrow, you are skipping a beat; ask whether that is intentional.
- A page has **at most one H1**. If you find a second H1, demote it to H2 + section
  scaffold. (Many old pages have 2–3 H1s. That is a bug.)
- Do **not** apply `bg-clip-text text-transparent` to titles. The cinematic look
  rejects rainbow text. Color comes from the glow / underline divider, not the
  letters themselves.

### 2.3 Bilingual rule

This site is bilingual. The rule is:

- **Title line:** primary language only (chosen via `useSyncedLanguage`). Don't
  jam English + Chinese into the same H1.
- **Eyebrow line:** English caps tag (e.g. `EXPLORE · TIANJI`).
- **Sub-line / body:** primary language. Use a separate paragraph if a translation
  is needed; never inline-mix mid-sentence.
- ❌ `Name Numerology · 姓名数字命理 · TianJi Global` (current numerology page) — this
  is three voices crammed into one row.
- ✅ Eyebrow: `NUMEROLOGY · 数字命理` — title: `Name Numerology` — sub: `Letters and
  birth dates revealed as recurring patterns.`

---

## 3. Page chrome law

Every page is built from exactly **one** of two chromes. No mixing.

### 3.1 Cinematic chrome (default)

For all reading pages, result pages, marketing pages, info pages. Use the
`<PageChrome>` primitive — it bakes the three-layer stack (base gradient,
star-field, top spotlight) so you never hand-roll it again.

```tsx
import { PageChrome } from '@/components/landing';

<main className="relative min-h-screen overflow-x-hidden text-white">
  <PageChrome />
  <div className="relative z-10">
    {/* sections go here */}
  </div>
</main>
```

For pages that open with `<BackgroundVideoHero>`, suppress the spotlight to
avoid double-lighting the hero:

```tsx
<PageChrome disableSpotlight />
```

That's it. **Never** add ad-hoc `bg-amber-600/15 rounded-full blur-[128px]` blobs.
**Never** stack three gradients in the same `<main>`. The cinematic chrome is
already "noisy enough" — adding more turns it into a fairground.

### 3.2 Hero chrome (homepage only)

For the homepage and landing-style hero sections only:

- Use `<BackgroundVideoHero>` from `@/components/landing` — it bakes the layer
  stack (`hero-layer-bg / video / stars / overlay / fade / vignette`) defined in
  `globals.css`.
- Outside the hero block, fall back to cinematic chrome (§3.1).

### 3.3 Banned chrome patterns

- ❌ `<main className="bg-gradient-to-br from-purple-900 via-black to-amber-900">` —
  reads as "kid's wallpaper."
- ❌ Three blurred blobs with `animate-pulse` and different colors — that's the
  mid-2010s fintech look. We are 2026 cinema.
- ❌ Putting the page background into `body { background: ...gradient... }` rather
  than the `<main>` element — cross-page layout shift, breaks the route-group
  layout.

---

## 4. Layout & density law

### 4.1 Width

Every page content goes through `landingTokens.section.maxWidth` (= `max-w-7xl`)
or `landingTokens.section.proseWidth` (= `max-w-3xl` for body copy). No other
width is allowed at the section level.

### 4.2 Vertical rhythm

Section gaps: `landingTokens.layout.sectionGap` (`clamp(4rem,10vw,8rem)`). Page
rhythm reads as a slow exhale, not a list.

- Hero → first section: `sectionGap`
- Section → section: `sectionGap`
- Inside a section: `space-y-8` (`2rem`); cards use `gap-6`.
- Inside a card: `space-y-5` for input rows, `space-y-3` for label/value pairs.

### 4.3 Density

A TianJi page never feels "full." The user should be able to **see only one idea
at a time** as they scroll. Practical:

- Each section presents **one** thought (one chart, one narrative, one CTA, one
  insight grid). If a section needs two thoughts, split the section.
- A grid never goes wider than 3 columns at desktop. 4-up grids are for footers.
- Inputs sit alone in `<ModuleInputShell>`, not next to results.

### 4.4 Banned layout patterns

- ❌ `max-w-5xl` ad-hoc on a page when sibling pages use `max-w-7xl`.
- ❌ `p-4` ad-hoc page padding when the route-group layout already gives it.
- ❌ Putting input form, computed result, share buttons, and FAQ in a single
  `<div>` with no section scaffolds — that's the exact symptom of "页面乱."

---

## 5. Approved primitives (use these, do not reinvent)

All under `@/components/landing` and `@/components/ui`.

| Primitive                  | Use for                                                                         |
|----------------------------|---------------------------------------------------------------------------------|
| `PageChrome`               | The mandatory page background. Drop into every `<main>` once.                   |
| `BackgroundVideoHero`      | Cinematic hero block on landing-style pages.                                    |
| `LandingSection`           | The mandatory wrapper for **every** content section. Provides eyebrow/title/sub.|
| `ModuleInputShell`         | The form container on every reading-input page.                                 |
| `ResultScaffold`           | The reading-output container — overview, highlights, details, aside slots.      |
| `InsightGrid`              | 3-up "what you get" grid. Replaces ad-hoc card grids.                           |
| `ScrollNarrativeSection`   | Cinematic 2–4-block storytelling between hero and inputs.                       |
| `TrustStrip`               | The thin "trusted by / privacy promise" bar above CTAs.                         |
| `ShareSection`             | Footer block with PDF + share buttons.                                          |
| `GlassCard`                | The only card primitive. `level={'soft' \| 'card' \| 'strong'}`.                |
| `MysticButton`             | The only button primitive for primary actions on reading pages.                 |
| `SmartTitle`               | Required for any title containing CJK + Latin.                                  |

**Rule:** if you find yourself writing `<div className="rounded-2xl bg-white/5
backdrop-blur ...">`, stop and use `<GlassCard>` instead.

If a primitive is missing the slot you need, **extend the primitive** in
`src/components/landing/` — don't fork its style inline.

---

## 6. Motion law

Reach for tokens in `src/design-system/motion-tokens.ts`. Never hand-write `ease`
or `duration` in JSX.

| When                                   | Use                                                |
|----------------------------------------|----------------------------------------------------|
| Section enters viewport                | `variants.fadeUp` + `viewport={scrollReveal}`      |
| Card appearing in a stagger            | `variants.fadeRight`, parent `variants.stagger`    |
| Hover on an interactive card           | `variants.hoverLift` (only if `hoverLift` makes sense — not on result-only cards) |
| SVG / line draw                        | `variants.lineDraw`                                |
| Looping ambient                        | `transitions.radarPulse`                           |

**Cap:** any single page may have at most **one** looping ambient animation in the
hero, and **zero** looping animations below the fold. We are cinema, not Vegas.

`prefers-reduced-motion: reduce` already disables `mystic-float / pulse-subtle /
gradient-shift / blur-word`. If you add a new keyframe to `globals.css`, you
**must** add it to the `@media (prefers-reduced-motion: reduce)` block as well.

---

## 7. Per-page-type recipes

When a user asks "build a page for X" or "rebuild the X page," pick the matching
recipe and follow the order strictly. Do not invent a fifth template.

### 7.1 Reading-input page (e.g. `bazi`, `numerology`, `western`, `fortune`)

```tsx
<main /* §3.1 cinematic chrome */>
  <BackgroundVideoHero
    eyebrow="BAZI · 八字"
    title="Read your four pillars."
    subtitle="..."
    primaryCta={{ label: 'Generate chart', href: '#input' }}
  />

  <ScrollNarrativeSection blocks={NARRATIVE_BLOCKS} /> {/* 3 blocks max */}

  <LandingSection
    id="input"
    eyebrow="ENTER YOUR DETAILS"
    title="Birth time, kept private."
    subtitle="Used once for the chart, then forgotten."
  >
    <ModuleInputShell title="Your details" footer={<PrivacyNote />}>
      {/* form fields */}
    </ModuleInputShell>
  </LandingSection>

  {reading && (
    <ResultScaffold
      eyebrow="YOUR CHART"
      title={...}
      summary={...}
      highlights={[...]}
      details={...}
      aside={<AnimatedShareButton />}
    />
  )}

  <LandingSection eyebrow="WHAT YOU GET" title="Inside every reading">
    <InsightGrid items={INSIGHTS} />
  </LandingSection>

  <ShareSection {...} />
  <TrustStrip />
</main>
```

Hard order: hero → narrative → input → result (conditional) → insight grid →
share → trust. Never swap.

### 7.2 Pure result page (linked-to from email / share)

Skip hero, skip narrative, skip input. Just `cinematic chrome` + `ResultScaffold`
+ `ShareSection`. The page should feel like a chapter of a book opened to the
right page.

### 7.3 Marketing / info page (`pricing`, `about`, `legal`)

`cinematic chrome` + `LandingSection`s only. No `ModuleInputShell`. No
`ResultScaffold`. Sections: hero (no video) → 2–3 `LandingSection`s with copy →
optional `InsightGrid` → CTA → footer.

### 7.4 Embed / share-card route (under `embed/`)

`cinematic chrome` constrained to the iframe size. **No** `BackgroundVideoHero`
(performance). One `LandingSection` with `proseWidth`. Single CTA back to the
parent page.

---

## 8. Reviewer checklist (run before claiming a page is "cinematic")

Run all 12 checks. Any failure → not done.

1. **Palette** — only black + nebula purple + gold + 4-step white opacity. No
   amber/pink/cyan/etc. outside data charts.
2. **Page chrome** — `landingTokens.section.pageBackground` + `star-field` +
   `landingTokens.section.spotlight`. No ad-hoc blobs.
3. **One H1** — exactly one, in the hero or page-opener.
4. **Section scaffold** — every section is a `<LandingSection>` (or
   `<ResultScaffold>`). No raw `<section>` with hand-rolled padding.
5. **Eyebrows** — every `<LandingSection>` has an `eyebrow`. Uppercase, tracked
   `0.28em`.
6. **Titles** — Instrument Serif italic. No `bg-clip-text` rainbow text.
7. **Cards** — every card is a `<GlassCard>`. No raw `bg-white/5 backdrop-blur` in
   page files.
8. **Width** — content goes through `max-w-7xl` or `max-w-3xl` (proseWidth). No
   `max-w-5xl` ad-hoc.
9. **Bilingual** — title line is single-language; English caps eyebrow;
   translated body lives in its own paragraph.
10. **Motion** — at most one looping animation per page; reduced-motion respected.
11. **Imports** — `colors / typography / landingTokens / variants / scrollReveal`
    all imported from `@/design-system`. No hex literals in JSX.
12. **Reduced motion** — page renders intelligibly with no animation.

---

## 9. The three failure modes you must learn to spot

When the user (or you) say "this page feels off," it is almost always one of:

1. **Candy palette leak** — the page has Tailwind `amber-* / pink-* / cyan-*`
   somewhere. Find it, swap to gold/purple/black.
2. **Primitive bypass** — the page uses raw `<div className="bg-white/5 ...">`
   where a `<GlassCard>` should be, or a raw `<section className="py-16">` where a
   `<LandingSection>` should be.
3. **Beat collision** — two ideas in one section, or no eyebrow between sections,
   so the user can't feel the rhythm. Split them.

The fix order is **always**: chrome (§3) → palette (§1) → typography (§2) →
primitives (§5) → density (§4). Never start from "let me tweak a margin."

---

## 10. Authoring & extension protocol

- When adding a new color, padding, or radius — **add it to `design-tokens.ts`
  first**, then consume the token. Don't shortcut.
- When adding a new motion preset — **add it to `motion-tokens.ts` first**, then
  consume. CSS keyframes go to `globals.css` with a matching reduced-motion entry.
- When adding a new layout primitive — put it under
  `src/components/landing/` and document the slots in its top-of-file comment.
- Update this `SKILL.md` whenever the system grows. **The skill is the law; the
  code follows it, not the other way around.**

---

## 11. Quick "before / after" reference

A worked example of the most common offender: the old numerology page header.

**Before** (violates §1, §2, §3):
```tsx
<main className="relative min-h-screen bg-[#0a0a0a] overflow-x-hidden text-white p-4">
  <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-600/15 rounded-full blur-[128px] animate-pulse" />
  <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-[128px] animate-pulse" />
  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
    Name Numerology
  </h1>
  <p className="text-purple-300/80 text-lg">姓名数字命理 · TianJi Global</p>
</main>
```

**After** (compliant):
```tsx
<main className="relative min-h-screen overflow-x-hidden text-white">
  <PageChrome disableSpotlight />
  <div className="relative z-10">
    <BackgroundVideoHero
      eyebrow="NUMEROLOGY · 数字命理"
      title="Name numerology"
      subtitle="Letters and birth dates as recurring patterns."
      primaryCta={{ label: 'Calculate', href: '#input' }}
    />
    {/* ... §7.1 reading-input recipe ... */}
  </div>
</main>
```

Same content. Cinematic vs. carnival.
