# TianJi Love Vedic Relationship Route Wiring Evidence

## 1. What Changed

- Merged Lane H into `redesign-home-landing-20260420` and validated the combined baseline before starting Lane I.
- Added a feature-flagged Vedic relationship route extension for paid relationship reports.
- Wired the extension into `generateLoveReport` so Vedic output remains skipped by default, preview-only in preview mode, and public only in paid mode with paid/pro entitlement plus explicit chart data.
- Passed safe paid/pro entitlement metadata from existing paid relationship report entry points.
- Expanded share/privacy stripping to include Vedic-sensitive keys: `timezone`, `rawKundliText`, and `kundliPdfText`.
- Added route wiring tests for disabled, preview, paid, unpaid, free-route unchanged, and public/share privacy behavior.

## 2. Files Changed

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

## 3. Commands Run

| Command | Result |
| --- | --- |
| Main worktree `git status --short` and `git log --oneline -8` | Confirmed tracked clean baseline before Lane H merge |
| Lane H `git fetch` and `git rebase redesign-home-landing-20260420` | Up to date |
| Main worktree `git merge feat/vedic-paid-report-integration` | Fast-forward to `cd372d3` |
| Post-merge `npm run typecheck` | Pass |
| Post-merge `npm run lint` | Pass |
| Post-merge `npm run test` | Pass, 66 files / 545 tests |
| Post-merge `npm run build` | Pass, 106 static pages; existing NextAuth/jose Edge runtime warnings |
| Post-merge `npm run build:staging:degraded` | Pass, 106 static pages; existing warnings |
| Post-merge route/copy/share/upgrade audits | Pass |
| Post-merge Ask/Draw revenue contract audits | Pass, both `overall: conditional-go` |
| Post-merge `npm run audit:staging:degraded` | Pass, `overall: go` |
| Post-merge `git diff --check` | Pass |
| `git worktree add ..\tianji-global-lane-i -b feat/wire-vedic-relationship-paid-route` | Created Lane I worktree |
| RED `npm run test -- src/__tests__/vedic-relationship-route-wiring.test.ts` | Failed as expected before route extension existed |
| `npm run test -- src/__tests__/vedic-relationship-route-wiring.test.ts` | Pass, 1 file / 8 tests |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| Targeted Ask/Draw/Vedic route tests | Pass, 3 files / 15 tests |
| Targeted report/trust/Vedic paid tests | Pass after sequential rerun, 3 files / 12 tests |
| `npm run test` | Pass, 67 files / 553 tests |
| `npm run build` | Pass, 106 static pages; existing NextAuth/jose Edge runtime warnings |
| `npm run build:staging:degraded` | Pass, 106 static pages; existing warnings |
| `npm run audit:routes` | Pass |
| `npm run audit:copy` | Pass |
| `npm run audit:share` | Pass |
| `npm run audit:upgrade` | Pass |
| `npm run audit:ask-revenue-contract` | Pass, `overall: conditional-go` |
| `npm run audit:draw-revenue-contract` | Pass, `overall: conditional-go` |
| `npm run audit:staging:degraded` | Pass, `overall: go` |
| `git diff --check` | Pass with LF/CRLF working-copy warnings only |

## 4. Route Integration Status

```text
Vedic relationship route extension: Go
Relationship paid report generator wiring: Go
Existing paid report job entry points pass entitlement metadata: Go
Structured Vedic chart data path from public route: Not added in this task
Relationship route runtime exposure: Conditional Go
```

The route extension is wired behind flags and requires explicit chart data. Existing public endpoints do not accept raw Vedic/Kundli data in this task.

## 5. Feature Flag Status

```text
NEXT_PUBLIC_TIANJI_VEDIC_ENABLED default: false
TIANJI_VEDIC_REPORT_MODE default: disabled
disabled mode: skipped, no response shape change
preview mode: metadata/internal preview only, no public full report
paid mode: requires paid/pro entitlement and chart data
```

## 6. Free Route Impact

Free relationship analyze remains unchanged. Tests explicitly enabled Vedic flags and verified `/api/relationship/analyze` did not attach `vedicReport` and did not expose birth time, birth location, timezone, or raw Kundli data.

## 7. Paid Route Behavior

- Paid relationship report generation can now attach a Vedic report only when:
  - Vedic is enabled,
  - mode is `paid`,
  - paid/pro entitlement is present,
  - structured Vedic chart data is provided.
- Unpaid or missing entitlement returns locked metadata and no full Vedic report.
- Preview mode records safe metadata and keeps the public result body free of a full Vedic report.

## 8. Production Exposure Status

```text
Vedic production exposure: No-Go
Provider live calls: Not-run
Stripe test/live calls: Not-run
Webhook smoke: Not-run
Supabase production mutation: Not-run
Email send: Not-run
Production deploy: No-Go / not-run
Secrets read or printed: No
```

## 9. Risks

- The current relationship report job API still does not accept or fetch structured `VedicChartData`; full Vedic paid output needs a later safe chart-data assembly path.
- Lane E staging degraded deploy can proceed independently because Vedic remains disabled by default.
- If Vedic is later enabled in paid mode without chart data, the extension will stay skipped/metadata-only rather than fabricating chart facts.

## 10. Next Step

Continue Lane E staging degraded deploy execution. A later Vedic V2 route task should add a safe, private chart-data assembly path behind the same flags before any public paid Vedic report launch.
