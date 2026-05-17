# TianJi Love Vedic Paid Report Integration Evidence

## 1. What changed

- Added a feature-flagged Vedic paid relationship report adapter.
- Kept Vedic disabled by default through `NEXT_PUBLIC_TIANJI_VEDIC_ENABLED=false` / missing env and `TIANJI_VEDIC_REPORT_MODE=disabled`.
- Added explicit `disabled`, `preview`, and `paid` mode behavior.
- Added paid/pro entitlement gating for full Vedic report generation.
- Added safe preview behavior that can generate an internal preview while keeping the public full report locked.
- Added follow-up sections that route users toward Ask and Draw as optional next steps without changing Ask/Draw backend behavior.
- Did not wire Vedic into a live route yet because the current Relationship paid report job input does not carry structured Vedic chart data.

## 2. Files changed

- `src/lib/astro/vedic/config.ts`
- `src/lib/astro/vedic/index.ts`
- `src/lib/astro/vedic/relationship-paid-adapter.ts`
- `src/__tests__/vedic-paid-report-integration.test.ts`
- `.ai/TIANJI_LOVE_VEDIC_PAID_REPORT_INTEGRATION_EVIDENCE_20260516.md`
- `.ai/CHANGELOG_AI.md`
- `.ai/REVIEW_PACKET.md`

## 3. Commands run

| Command | Result |
| --- | --- |
| `git status --short` | Clean tracked worktree before Lane H edits |
| `git log --oneline -8` | Confirmed Lane H started after Vedic V1 commit |
| Read Vedic V1 files, `love-report-generator`, `report-jobs`, report-job API, billing, and Ask/Draw gateway tests | Complete |
| RED `npm run test -- src/__tests__/vedic-paid-report-integration.test.ts` | Failed as expected because `relationship-paid-adapter` did not exist |
| `npm run test -- src/__tests__/vedic-paid-report-integration.test.ts` | Pass, 1 file / 6 tests |
| `npm run test -- src/__tests__/vedic-astro-types.test.ts src/__tests__/vedic-prompt-safety.test.ts src/__tests__/vedic-report-generator.test.ts src/__tests__/vedic-kundli-parser.test.ts src/__tests__/vedic-paid-report-integration.test.ts` | Pass, 5 files / 13 tests |
| `npm run typecheck` | Pass |
| `npm run test -- src/__tests__/api/ask-paid-gateway.test.ts src/__tests__/api/draw-gateway.test.ts src/__tests__/vedic-paid-report-integration.test.ts` | Pass, 3 files / 13 tests |
| `npm run lint` | Pass |
| `npm run test` | Pass, 66 files / 545 tests |
| `npm run build` | Pass, 106 static pages; existing NextAuth/jose Edge runtime warnings |
| `npm run audit:routes` | Pass |
| `npm run audit:copy` | Pass |
| `npm run audit:share` | Pass |
| `npm run audit:upgrade` | Pass |
| `npm run audit:ask-revenue-contract` | Pass, `overall: conditional-go` |
| `npm run audit:draw-revenue-contract` | Pass, `overall: conditional-go` |
| `npm run audit:staging:degraded` | Pass, `overall: go` |
| `npm run build:staging:degraded` | Pass, 106 static pages; existing NextAuth/jose Edge runtime warnings |
| `git diff --check` | Pass with LF/CRLF working-copy warnings only |
| Targeted secret-shape scan over Lane H diff | Pass, `SECRET_SCAN_HITS=0` |

## 4. Test results

- New Vedic paid integration tests pass.
- Existing Vedic V1 tests pass.
- Ask paid gateway and Draw gateway tests pass with the new adapter present.
- Full suite passes: 66 files / 545 tests.
- Diff check and targeted secret-shape scan passed.

## 5. Vedic paid integration decision

```text
Vedic paid adapter: Go
Vedic disabled default: Go
Vedic preview mode: Go
Vedic paid/pro entitlement guard: Go
Relationship runtime route wiring: Conditional Go / adapter-ready only
Vedic production exposure: No-Go
Vedic paid live smoke: No-Go
Production deploy: No-Go
```

## 6. Feature flag status

- `NEXT_PUBLIC_TIANJI_VEDIC_ENABLED` defaults to disabled when absent.
- `TIANJI_VEDIC_REPORT_MODE` supports `disabled`, `preview`, and `paid`.
- `paid` mode still requires explicit paid/pro entitlement input.
- No env values were printed.

## 7. Production exposure status

- Vedic is not exposed to production users by this task.
- No API route was changed.
- No Stripe, Supabase, Resend, provider, webhook, or deployment path was called.
- Full Vedic report generation remains behind flags and entitlement input.

## 8. Safety and privacy status

- Adapter returns safe `aiMeta` only: engine, route, mode, live-call status, and generated status.
- Adapter does not return raw chart input, raw prompts, provider request bodies, or provider responses.
- Public summary tests verify `birthTime`, `birthLocation`, and `timezone` style values are not exposed.
- Report output is checked against certainty-risk language.
- No guaranteed prediction, fear-based upsell, medical, legal, or financial advice is introduced.

## 9. Known limitations

1. The adapter is ready for a Relationship paid report route, but the current paid report job input only has `sessionId` and `readingMode`; it does not yet supply structured `VedicChartData`.
2. No chart calculation engine was added.
3. No PDF/OCR expansion was added.
4. No live model/provider call was added.
5. No paid smoke, webhook smoke, or production deploy was run.

## 10. Next step

Add a feature-flagged Relationship report data path that can safely assemble or fetch `VedicChartData` without exposing raw birth data, then call `buildVedicRelationshipPaidReport` only for paid/pro entitlements.
