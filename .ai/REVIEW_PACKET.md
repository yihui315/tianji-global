# Brain Review Packet

## Task Goal

Implement Lane B from `.ai/TASK_TIANJI_LOVE_DUAL_TRACK_WORKFLOW_20260516.md`: revenue funnel polish for Tianji Love frontend surfaces without touching backend payment behavior, gateways, Stripe webhook logic, unlock API core logic, staging smoke scripts, or production deployment files.

## Status

```text
Revenue funnel polish source: Go
Backend/payment behavior: Untouched
Lane A baseline: Rebased after Lane A
Lane A conflict risk: Resolved
Commit: Ready
Production deploy: No-Go
```

## What Changed

- Homepage copy now leads with "Start Free Love Reading", "Ask One Question", and "Draw Three Cards".
- Homepage product cards now map to Love Reading, Ask One Question, and Draw Three Cards.
- Homepage trust strip now says private by default, reflection not certainty, no fear-based selling, and secure unlocks.
- Ask preview CTA now says "Unlock the full relationship answer" and frames depth without leaking the paid answer.
- Draw preview CTA now says "Unlock the full three-card relationship reading" and includes a practical next step.
- Pricing now distinguishes Free preview, one-time Ask unlock, Draw unlock, Monthly, and Yearly.
- Client analytics now sanitize sensitive funnel payload fields before sending.
- Added Lane B funnel event helper and source-contract tests.
- Kept Lane A's test-stability fixes from the rebased baseline.

## Files Changed

- `src/components/home/TianjiLoveHome.tsx`
- `src/app/(main)/ask/page.tsx`
- `src/app/(main)/draw/page.tsx`
- `src/app/(main)/pricing/page.tsx`
- `src/components/relationship/RelationshipResult.tsx`
- `src/lib/analytics/client.ts`
- `src/lib/analytics/funnel-events.ts`
- `src/__tests__/landing-design-contract.test.ts`
- `src/__tests__/revenue-funnel-polish-contract.test.ts`
- `docs/tianji-love-revenue-funnel-runbook.md`
- `.ai/TIANJI_LOVE_REVENUE_FUNNEL_REVIEW_20260516.md`
- `.ai/TIANJI_LOVE_REVENUE_FUNNEL_POLISH_EVIDENCE_20260516.md`
- `.ai/CHANGELOG_AI.md`
- `.ai/REVIEW_PACKET.md`

## Commands Run

| Command | Result |
| --- | --- |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run test` | Pass, 57 files / 518 tests |
| `npm run build` | Pass, 106 static pages |
| `npm run audit:routes` | Pass |
| `npm run audit:copy` | Pass |
| `npm run audit:share` | Pass |
| `npm run audit:upgrade` | Pass |
| `npm run audit:ask-revenue-contract` | Pass, `overall: conditional-go` |
| `npm run audit:draw-revenue-contract` | Pass, `overall: conditional-go` |
| `git diff --check` | Pass with LF/CRLF warnings only |

## Safety Notes

- No `.env`, `.env.local`, secrets, credentials, provider keys, Stripe keys, webhook secrets, Supabase production data, Resend, or production config were read or printed.
- No live Stripe, live provider, Supabase production, Resend, paid smoke, webhook smoke, or deploy command was run.
- No backend payment behavior was changed.
- No gateway, AI orchestrator, Stripe webhook, Ask unlock API, Draw unlock API, staging smoke script, or deployment file was edited.
- Analytics payloads exclude birth date, birth time, birth location, timezone, raw question, full answer, and full result fields.

## Revenue Funnel Decision

Go for frontend/source funnel polish. Revenue contracts remain `conditional-go` because live Stripe/provider smoke was not run. Production deploy remains No-Go.

## Remaining Risks

1. Analytics persistence still depends on existing backend/environment configuration.
2. Paid checkout smoke remains outside Lane B and was not run.
3. Combined validation should run after Lane B is merged back into the primary worktree.

## Suggested Next Gate

Merge Lane B into the primary worktree and run the combined validation gate, including `audit:staging-degraded-mode`.

## Suggested Commit Message

```text
feat: polish tianji love revenue funnel
```
