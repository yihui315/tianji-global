# TianJi Cinematic — First-Wave Re-skin Roadmap

This roadmap maps every `(main)` page to a status bucket and an action.
Run waves in order. Don't jump ahead — fixing the candy-palette pages first
is what makes the rest of the work feel cinematic instead of inconsistent.

> Pre-flight (do once before any wave starts):
> 1. Read `.claude/skills/tianji-cinematic/SKILL.md` end to end.
> 2. Confirm `<PageChrome />` exists at `src/components/landing/PageChrome.tsx`.
> 3. Open one reference page (`bazi/page.tsx`) — it's the recipe template.

---

## Status legend

- ✅ **Aligned** — already follows recipe §7. Touch only for copy.
- ⚠️ **Drift** — uses primitives but has stylistic leaks.
- 🛑 **Carnival** — candy gradients / blob blurs / no scaffold. Rebuild required.
- ❓ **Triage** — needs a 5-min read before bucketing.

---

## Inventory

| Page              | Status        | Recipe              | Notes                                               |
|-------------------|---------------|---------------------|-----------------------------------------------------|
| `(main)/page.tsx` | ⚠️ Drift      | §7.1 hero variant   | Uses `BackgroundVideoHero`; verify §3.1 chrome.     |
| `about/`          | ✅ Aligned     | §7.3 marketing      | Reference example for info pages.                  |
| `bazi/`           | ✅ Aligned     | §7.1 reading-input  | Reference example. Use as the canonical template.  |
| `celebrities/`    | 🛑 Carnival   | §7.3 marketing      | Candy gradients. Rebuild as marketing recipe.      |
| `celebrity-match/`| 🛑 Carnival   | §7.1 reading-input  | Candy gradients on score chips. Rebuild.           |
| `electional/`     | ❓ Triage     | §7.1 reading-input  | Inspect for raw `<section>` + ad-hoc bg blobs.     |
| `embed/`          | ❓ Triage     | §7.4 embed          | Should be ultra-minimal, iframe-safe.              |
| `fengshui/`       | ❓ Triage     | §7.1 reading-input  | Inspect for primitive bypass.                      |
| `fortune/`        | ✅ Aligned     | §7.1 reading-input  | Reference example.                                 |
| `horary/`         | ❓ Triage     | §7.1 reading-input  | Inspect.                                           |
| `legal/`          | ❓ Triage     | §7.3 marketing      | Plain prose; align padding + width tokens.         |
| `love-match/`     | 🛑 Carnival   | §7.1 reading-input  | Candy gradients. Rebuild.                          |
| `numerology/`     | 🛑 Carnival   | §7.1 reading-input  | Worst offender. Used as the §11 before/after demo. |
| `pricing/`        | ✅ Aligned     | §7.3 marketing      | Reference example.                                 |
| `profile/`        | ❓ Triage     | §7.3 marketing      | Authed-only. Verify after sign-in works.           |
| `readings/`       | ❓ Triage     | §7.3 marketing      | List of saved readings. Card grid via `GlassCard`.  |
| `sky-chart/`      | ❓ Triage     | §7.1 reading-input  | Verify Three.js sphere lives inside `GlassCard`.   |
| `solar-return/`   | 🛑 Carnival   | §7.1 reading-input  | Candy gradients. Rebuild.                          |
| `synastry/`       | 🛑 Carnival   | §7.1 reading-input  | Candy gradients. Rebuild.                          |
| `tarot/`          | ✅ Aligned     | §7.1 reading-input  | Reference example.                                 |
| `transit/`        | 🛑 Carnival   | §7.1 reading-input  | Candy gradients. Rebuild.                          |
| `western/`        | ✅ Aligned     | §7.1 reading-input  | Reference example.                                 |
| `yijing/`         | ✅ Aligned     | §7.1 reading-input  | Reference example.                                 |
| `ziwei/`          | ✅ Aligned     | §7.1 reading-input  | Reference example.                                 |

Reference templates (do not modify these except to fix bugs):
`bazi`, `fortune`, `tarot`, `western`, `yijing`, `ziwei`, `about`, `pricing`.

---

## Wave 1 — Stop the bleeding (3–5 days)

Goal: **eliminate every candy-palette page**. Until this is done, the site
visually contradicts itself, and any new design effort gets discounted.

Order (worst → easiest):

1. **`numerology`** — full rebuild via §7.1.
   - Replace 3-blob chrome with `<PageChrome />`.
   - Delete `getNumberColor` rainbow map; render numbers in `colors.gold`/
     `colors.purple` against a `GlassCard` strong panel.
   - Move tabbed result UI into `<ResultScaffold>` (`overview / highlights /
     details / aside` slots).
   - Title: drop `bg-clip-text` gradient. Use `<SmartTitle>` + Instrument Serif italic.
2. **`love-match`** — same surgery as numerology.
3. **`celebrity-match`** — same surgery + inspect score chips.
4. **`synastry`** — same surgery + verify chart components live inside `GlassCard`.
5. **`solar-return`** — same surgery.
6. **`transit`** — same surgery.
7. **`celebrities`** — convert to §7.3 marketing recipe (no input form).

Acceptance per page: passes the 12-point checklist (SKILL.md §8).

---

## Wave 2 — Triage cleanup (2–3 days)

For each ❓ page, do the 12-point checklist read-through and:

- If everything passes → mark ✅ in this file. Done.
- If 1–3 items fail → patch in place.
- If 4+ items fail → bump to a Wave 3 rebuild.

Pages: `electional`, `embed`, `fengshui`, `horary`, `legal`, `profile`,
`readings`, `sky-chart`, plus the home `(main)/page.tsx`.

Special handling:

- **`embed/`** must use `<PageChrome disableStars />` — embed surfaces are tiny
  and the star field is wasted detail.
- **`legal/`** is text-only; verify `proseWidth` (`max-w-3xl`) and that no
  `<h1>` exists below the page-opener.
- **`profile/`** — verify `useSession()` boundary loads before hero. If profile
  shows skeleton-then-hero pop, add a `loading.tsx` segment file.

---

## Wave 3 — Final polish (1–2 days)

Once every page is ✅:

1. Read every page's hero sub-line. Apply §2.3 bilingual rule strictly
   (one language per line; eyebrow tag in English caps; no inline mixes).
2. Visit each page via `pnpm dev` with reduced-motion forced on
   (`localStorage.setItem('forceReducedMotion', '1')`) and confirm legibility.
3. Run `npm run lint && npm run typecheck` — must be clean.
4. Capture full-page screenshots at 1440×900 and 390×844 for visual diff.
5. Update `SKILL.md` if any new pattern emerged that should become law.

---

## Out-of-scope guardrails (for any wave)

While re-skinning, **do not**:

- Change API endpoints, request shapes, or fetch logic.
- Touch save-reading / share / PDF export contracts.
- Modify auth or middleware. Visual work only.
- Introduce new dependencies (we already have framer-motion + Tailwind).
- Add new keyframes without a matching `prefers-reduced-motion` entry.

If a re-skin requires touching these, **stop and ask**. The skill's job is to
re-light the cinema, not to rewire the projector.

---

## How to start

```bash
# Open the worst offender
code src/app/(main)/numerology/page.tsx

# Open the canonical template alongside it
code src/app/(main)/bazi/page.tsx

# Open the skill in a third pane
code .claude/skills/tianji-cinematic/SKILL.md
```

Replicate `bazi`'s structure into `numerology`, swap palette tokens, run the
12-point checklist, ship. Move to `love-match`. Repeat.

That's the whole job.
