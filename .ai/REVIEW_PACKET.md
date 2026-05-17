# Brain Review Packet

## Task Goal

Wire the Vedic paid relationship report adapter into the Relationship paid report generation path behind feature flags, while keeping default production exposure off and preserving free Relationship, Ask, Draw, staging degraded, Stripe, Supabase, Resend, and provider behavior.

## Status

```text
Staging degraded baseline: Go / unchanged
Ask revenue contract: Conditional Go
Draw revenue contract: Conditional Go
Vedic internal layer: Go
Vedic paid adapter: Go
Vedic relationship route extension: Go
Relationship paid report wiring: Go
Free relationship analyze impact: unchanged
Vedic production exposure: No-Go
Vedic public route exposure: Conditional Go / chart data path not added
Provider live calls: Not-run
Stripe test/live calls: Not-run
Webhook smoke: Not-run
Supabase mutations: Not-run
Resend sends: Not-run
Production deploy: No-Go / not-run
Real secrets read/printed: No
```

## What Changed

- Added `src/lib/astro/vedic/relationship-route-extension.ts`.
- Exported the route extension from the Vedic module index.
- Extended `LoveReportInput` with optional `vedicChartData` and `vedicEntitlement`.
- Extended `LoveReport` metadata to carry safe `generationMeta.vedic` and optional public `vedicReport`.
- Applied the Vedic route extension inside `generateLoveReport` after base report generation.
- Passed safe paid/pro entitlement metadata from paid report creation, result-page generation, and Stripe webhook-created report jobs.
- Added `timezone`, `rawKundliText`, and `kundliPdfText` to the relationship share privacy stripping guard.
- Added tests proving disabled mode is unchanged, preview mode is metadata-only, paid mode requires entitlement and chart data, unpaid users do not receive a full Vedic report, the free analyze route is unchanged, and public/share output strips Vedic-sensitive fields.

## Files Changed

- `.ai/TIANJI_LOVE_VEDIC_RELATIONSHIP_ROUTE_WIRING_REVIEW_20260516.md`
- `.ai/TIANJI_LOVE_VEDIC_RELATIONSHIP_ROUTE_WIRING_EVIDENCE_20260516.md`
- `.ai/CHANGELOG_AI.md`
- `.ai/REVIEW_PACKET.md`
- `src/app/[locale]/love-reading/result/[id]/page.tsx`
- `src/app/api/report-jobs/create/route.ts`
- `src/app/api/stripe/webhook/route.ts`
- `src/lib/astro/vedic/index.ts`
- `src/lib/astro/vedic/relationship-route-extension.ts`
- `src/lib/love-report-generator.ts`
- `src/lib/trust-copy-guard.ts`
- `src/__tests__/vedic-relationship-route-wiring.test.ts`

## Commands Run

| Command | Result |
| --- | --- |
| Main `git status --short` / `git log --oneline -8` | Baseline reviewed before Lane H merge |
| Lane H `git fetch` / `git rebase redesign-home-landing-20260420` | Up to date |
| Main `git merge feat/vedic-paid-report-integration` | Fast-forward to `cd372d3` |
| Post-merge `npm run typecheck` | Pass |
| Post-merge `npm run lint` | Pass |
| Post-merge `npm run test` | Pass, 66 files / 545 tests |
| Post-merge `npm run build` | Pass, 106 static pages; existing NextAuth/jose Edge runtime warnings |
| Post-merge `npm run build:staging:degraded` | Pass, 106 static pages; existing warnings |
| Post-merge route/copy/share/upgrade audits | Pass |
| Post-merge Ask/Draw revenue contract audits | Pass, both `overall: conditional-go` |
| Post-merge `npm run audit:staging:degraded` | Pass, `overall: go` |
| Post-merge `git diff --check` | Pass |
| `git worktree add ..\tianji-global-lane-i -b feat/wire-vedic-relationship-paid-route` | Created Lane I |
| RED `npm run test -- src/__tests__/vedic-relationship-route-wiring.test.ts` | Failed as expected before route extension existed |
| `npm run test -- src/__tests__/vedic-relationship-route-wiring.test.ts` | Pass, 1 file / 8 tests |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run test -- src/__tests__/api/ask-paid-gateway.test.ts src/__tests__/api/draw-gateway.test.ts src/__tests__/vedic-relationship-route-wiring.test.ts` | Pass, 3 files / 15 tests |
| `npm run test -- src/__tests__/report-generator-contract.test.ts src/__tests__/trust-privacy-contract.test.ts src/__tests__/vedic-paid-report-integration.test.ts` | Pass, 3 files / 12 tests |
| `npm run test` | Pass, 67 files / 553 tests |
| `npm run build` | Pass, 106 static pages; existing warnings |
| `npm run build:staging:degraded` | Pass, 106 static pages; existing warnings |
| `npm run audit:routes` | Pass |
| `npm run audit:copy` | Pass |
| `npm run audit:share` | Pass |
| `npm run audit:upgrade` | Pass |
| `npm run audit:ask-revenue-contract` | Pass, `overall: conditional-go` |
| `npm run audit:draw-revenue-contract` | Pass, `overall: conditional-go` |
| `npm run audit:staging:degraded` | Pass, `overall: go` |
| `git diff --check` | Pass with LF/CRLF working-copy warnings only |

## Safety Notes

- No `.env`, `.env.local`, production config, credentials, private keys, deployment keys, or provider secret values were read or printed.
- No real secret values were written to docs, tests, fixtures, or `.ai` evidence.
- No Stripe live/test-live call, webhook smoke, paid smoke, DeepSeek/Ollama/MiniMax live provider call, Supabase production mutation, Resend send, or production deploy was run.
- Free Relationship analyze remains unchanged and is explicitly covered by tests with Vedic flags enabled.
- Full Vedic public report output requires explicit flags, paid/pro entitlement, and structured chart data.

## Risks And Follow-Up

1. `LoveReportInput` now supports `vedicChartData`, but no public route safely assembles or fetches that chart data yet.
2. Relationship route exposure is Conditional Go because disabled/default behavior is safe and paid-mode wiring exists, but full runtime generation still needs a later chart-data path.
3. Lane E staging degraded deploy should continue independently; this work remains default-off and should not block staging.
4. Vedic production exposure, paid live smoke, webhook smoke, provider live smoke, and production deploy remain No-Go.

## Suggested Commit Message

```text
feat: wire vedic relationship paid route behind flags
```
