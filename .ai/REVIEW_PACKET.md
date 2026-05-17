# Brain Review Packet

## Task Goal

Implement Lane A from `.ai/TASK_TIANJI_LOVE_DUAL_TRACK_WORKFLOW_20260516.md`: implementation-first staging degraded mode, while keeping the write set disjoint from Lane B and avoiding forbidden shared files.

## Decision Summary

```text
Degraded-mode helper: Go
Degraded-mode audit script: Go
Non-paid smoke route/status logging: Go
Public/free source contract: Conditional Go
Paid unlock runtime guard: Blocked / Unknown in this lane
Provider live-call runtime guard: Blocked / Unknown in this lane
Email runtime guard: Blocked / Unknown in this lane
Production deploy: No-Go
Commit: Ready
```

## What Changed

- Added `src/lib/staging-degraded-mode.ts` for the requested degraded-mode flags and secret-safe helper decisions.
- Added `scripts/audit-staging-degraded-mode.ts` with the exact JSON fields from the workflow.
- Added `audit:staging-degraded-mode` to `package.json`.
- Updated `scripts/smoke-staging-nonpaid.ts` so it does not call unlock routes and logs route/status/pass plus safe `aiMeta` only.
- Added focused degraded-mode tests.
- Stabilized existing landing/report contract tests for Windows CRLF and no-live-provider execution.
- Recorded the dual-track workflow task file in this lane.

## Files Changed

- `package.json`
- `scripts/audit-staging-degraded-mode.ts`
- `scripts/smoke-staging-nonpaid.ts`
- `src/lib/staging-degraded-mode.ts`
- `src/__tests__/scripts/staging-degraded-mode.test.ts`
- `src/__tests__/landing-design-contract.test.ts`
- `src/__tests__/report-generator-contract.test.ts`
- `.ai/TASK_TIANJI_LOVE_DUAL_TRACK_WORKFLOW_20260516.md`
- `.ai/TIANJI_LOVE_IMPLEMENTATION_FIRST_STAGING_EVIDENCE_20260516.md`
- `.ai/CHANGELOG_AI.md`
- `.ai/REVIEW_PACKET.md`

## Commands Run

| Command | Result |
| --- | --- |
| `npm ci --ignore-scripts --no-audit --no-fund --loglevel=error` | Pass; restored local JS tooling without lifecycle scripts |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run test -- src/__tests__/scripts/staging-degraded-mode.test.ts` | Pass, 1 file / 7 tests |
| `npm run test` | Pass, 57 files / 519 tests |
| `npm run build` | Pass, 106 static pages |
| `npm run audit:routes` | Pass |
| `npm run audit:copy` | Pass |
| `npm run audit:share` | Pass |
| `npm run audit:upgrade` | Pass |
| `npm run audit:ask-revenue-contract` | Pass, `overall: conditional-go` |
| `npm run audit:draw-revenue-contract` | Pass, `overall: conditional-go` |
| `npm run audit:staging-degraded-mode` | Pass command, expected safe default `overall: no-go` |
| degraded flags + `npm run audit:staging-degraded-mode` | Pass command, `overall: conditional-go` |
| `git diff --check` | Pass; LF/CRLF warnings only |

## Safety Notes

- No `.env`, secret, credential, production config, Stripe live API, Supabase production mutation, Resend send, provider live call, paid smoke, or production deploy was run.
- Initial forbidden-file edits were reverted before validation and are not in the current diff.
- Current changed source files are within the adjusted Lane A scope.
- Runtime paid unlock/provider/email enforcement remains intentionally unwired because those files are in the parallel boundary.

## Remaining Risks

1. Runtime paid route locking is not implemented in this lane because `src/app/api/ask/unlock/route.ts` and `src/app/api/draw/unlock/route.ts` are off-limits.
2. Runtime provider live-call disabling is not implemented in this lane because `src/lib/tianji-model-gateway.ts` is off-limits.
3. Runtime email send disabling is only represented by helper/audit support because existing email runtime code is outside this lane.
4. Staging env readiness and live smoke remain No-Go until configured and explicitly approved.

## Suggested Next Gate

Merge Lane A first, then rebase Lane B. After both lanes are merged, schedule a serial backend safety task only if runtime paid unlock/provider/email enforcement is still required.

## Suggested Commit Message

```text
feat: add implementation-first staging degraded mode
```
