# AdSense Baseline Test Results — 2026-07-16

## Environment
- Node: v20.20.2
- npm: 10.8.2
- SHA: b15b4ce4c97696487184e953208287283b3b9f6c
- Worktree: /root/tianji-adsense-final-audit

## Results

### npm ci / npm install
- **npm install --legacy-peer-deps**: ✅ SUCCESS (174 packages changed, 947 audited)
- npm ci: TIMEOUT (300s)

### typecheck
- **EXIT 2 — FAILED**
- Files with TypeScript errors:
  - `src/app/(main)/daily-love-oracle-guide/page.tsx` — multiple prop mismatches
  - `src/app/(main)/free-ai-love-reading/page.tsx` — Button `size` prop not valid
  - `src/app/(main)/free-relationship-compatibility-test/page.tsx` — same prop mismatches as guide page
  - `src/app/(main)/services/page.tsx` — `lang` doesn't exist on useSyncedLanguage hook return; implicit any
  - `src/app/(main)/tarot-love-reading-online/page.tsx` — duplicate object property; Button size prop; undefined param
  - `src/app/api/stripe/webhook/route.ts` — missing @types/stripe
  - `src/lib/billing.ts` — missing @types/stripe
  - `src/lib/report-generator.ts` — missing @types/jspdf
  - `src/lib/stripe.ts` — missing @types/stripe
- **Production blocking**: YES — typecheck must pass without ignoreBuildErrors

### lint
- **EXIT 0 — PASS**

### test
- **EXIT 0 — PASS** (vitest coverage report shown)

### build
- **SIGBUS — BUILD WORKER CRASHED**
- Environment issue: Next.js build worker receives SIGBUS (not OOM/SIGKILL)
- NOT a code error — infrastructure/resource issue
- Build bypasses TypeScript errors via `ignoreBuildErrors: true` currently

## Known Build Bypass Config
```js
// next.config.js
typescript: { ignoreBuildErrors: true }  // P0 — must fix
eslint: { ignoreDuringBuilds: true }    // lint passes anyway — low priority
```

## Next Steps
1. Fix TypeScript errors (P0 — blocks removal of ignoreBuildErrors)
2. Remove ignoreBuildErrors (P0)
3. Verify build passes (target: verify after TS fixes)
4. Note: build SIGBUS is environment issue, code itself may be buildable on production hardware
