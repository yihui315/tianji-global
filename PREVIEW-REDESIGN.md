# TianJi Global · Redesign Preview Guide

This guide walks you through previewing the **tianji-cinematic** premium-landing redesign locally on your Windows machine. It is the most reliable way to view the redesigned pages — the Cowork sandbox cannot host a Next.js dev server consistently (memory limits, blocked Google Fonts egress, missing native binaries), so the preview is meant to run on your own machine where the project actually lives.

## Quick Start (one click)

Double-click `preview-redesign.cmd` in this folder. It will:

1. run `npm install` if `node_modules` is missing
2. start `next dev` on port **3050** with a 4 GB Node heap
3. wait for the line `✓ Ready in …`

Then open **http://localhost:3050/** in your browser.

> Port 3050 was picked to avoid clashing with any earlier dev server you may still have running on 3000 / 3041.

## Manual command (PowerShell or terminal)

```powershell
cd D:\BrainSystem\💼 工作专项\ai占卜\tianji-global
$env:NODE_OPTIONS="--max-old-space-size=4096"
npx next dev -p 3050
```

## What to look at — redesign checklist

The cinematic landing system now covers every public module page. Click through these routes to verify the redesign:

### Core readings
- `/` — Home: BackgroundVideoHero, ScrollNarrativeSection, InsightGrid, ShareSection, TrustStrip
- `/tarot` — Tarot reading hero + ModuleInputShell + ResultScaffold + SharePanel
- `/yijing` — I-Ching with cinematic chrome
- `/bazi` — Bazi (Four Pillars) with PageChrome
- `/ziwei` — Zi Wei Dou Shu with PageChrome
- `/western` — Western birth chart
- `/numerology` — Numerology
- `/fengshui` — Feng Shui
- `/horary` — Horary
- `/electional` — Electional astrology

### Advanced astrology (4 modules — the latest layer)
- `/transit` — Secondary progressions, transit + progression overlays
- `/solar-return` — Solar return chart
- `/synastry` — Two-chart synastry (overlay/composite/davison)
- `/celebrity-match` — Celebrity match (rainbow palette replaced with goldLight + riskRed for supportive vs. challenging aspects)

### Relationship + utility
- `/love-match` — Love match
- `/celebrities` — Celebrity directory
- `/sky-chart` — Sky chart visualization
- `/fortune` — Fortune
- `/about`, `/pricing`, `/legal/privacy`, `/legal/terms`

### Language toggle
Append `?lang=zh` to any URL to verify the Chinese localized landing copy (e.g. `http://localhost:3050/transit?lang=zh`). Hero/CTA/form/trust copy now lives in `moduleLandingCopy` inside `src/lib/language-routing.ts`.

## Visual acceptance criteria

- Hero plays the new Seedance-2 background loop (2–5 MB MP4) with poster fallback.
- No traffic-light / rainbow palettes — only goldLight + purpleLight, with riskRed reserved for chart-data status deltas.
- Every result surface is wrapped in a GlassCard inside `ResultScaffold`.
- SharePanel + saveReading() appears on every successful reading.
- `TrustStrip` renders below the hero with localized items.
- Per-route `layout.tsx` SEO metadata + JSON-LD shows up in `view-source:` for each page.

## Known harmless dev-time warnings

These appear in the dev log but do not affect the redesign:

- `Watchpack Error … D:\System Volume Information` — Windows-only watcher noise.
- `[api/analytics/track] skipped SyntaxError: Unexpected end of JSON input` — analytics ping with empty body during local dev.
- `⚠ Cross origin request detected from 127.0.0.1` — Next 15 dev-origin notice; not an error.

## Where the redesign lives in code

- `src/components/landing/` — `BackgroundVideoHero`, `LandingSection`, `ScrollNarrativeSection`, `ModuleInputShell`, `ResultScaffold`, `TrustStrip`, `PageChrome`, `InsightGrid`, `ModuleHero`, `ShareSection`
- `src/lib/language-routing.ts` — `moduleLandingCopy` (en + zh) for every module
- `src/hooks/useSyncedLanguage.ts` — language state sync
- `src/lib/normalizers/` — shared reading shape used by `saveReading()`
- `src/components/seo/JsonLd.tsx` + per-route `layout.tsx` — SEO metadata
- `.claude/skills/tianji-cinematic/` — the design skill that drives the system

## Branch + commits to inspect

Branch: `redesign-home-landing-20260420`

Most recent commits (run `git log --oneline -10`):

```
6999173 docs(claude): add autoskills index for the new skill bundles
b8e088b chore(skills): land tianji-cinematic skill + agent skill bundles
03014bf chore(media): refresh hero / poster / OG / card assets + relationship media
277aec8 feat: complete tianji-cinematic redesign across all module pages
64b75d4 feat: extend premium landing system to relationship/timing modules
eb6b410 feat: redesign premium landing system across core modules
```

The branch is **local-only** — it has not been pushed to origin. Push when you are happy with the preview.

## Why not preview from the sandbox

- Sandbox node has no AVX2-tuned SWC binary that matches Next 15.5.14 reliably; the JS webpack fallback hits V8 OOM during the first compile of `/`.
- Google Fonts (`fonts.googleapis.com`) egress is blocked from the sandbox, so `Noto_Sans_SC` warns and uses the system fallback.
- No Chromium binary exists in the sandbox, so Puppeteer screenshots aren't available.
- `next build` cannot complete inside the 2-minute Bash budget.

Running on your own machine sidesteps all four limits.
