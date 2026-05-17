# Brain Review Packet

## Task Goal

Implement Lane C from `.ai/TASK_TIANJI_LOVE_DUAL_TRACK_WORKFLOW_20260516.md`: wire staging degraded runtime guards so paid unlock, provider, email, webhook, and Supabase mutation paths move from Unknown to explicit Go / Conditional Go states.

## Status

```text
Runtime guard wiring: Go
Ask paid unlock guard: Go
Draw paid unlock guard: Go
Stripe webhook degraded guard: Go
Provider live-disabled guard: Go
Email send-disabled guard: Go
Supabase mutation-disabled guard: Go
Default degraded audit: No-Go
Degraded flags audit: Go
Live calls: Not-run
Production deploy: No-Go
```

## What Changed

- Ask and Draw paid unlock endpoints now return safe locked `503` responses when staging degraded mode is enabled and Stripe is unavailable or disabled.
- Stripe webhook now returns a safe skipped receipt before signature verification, event construction, event recording, email, or Supabase mutation when Stripe is disabled in degraded mode.
- TianJi model gateway now honors `AI_PROVIDER_LIVE_DISABLED=true` by returning safe disabled content without calling the provider generation function.
- Report-ready email helper now honors `EMAIL_SEND_DISABLED=true` before order lookup or Resend construction.
- Relationship store write helpers now honor `SUPABASE_MUTATION_DISABLED=true` before insert/update paths.
- Degraded-mode audit now includes explicit webhook and Supabase mutation guard fields.
- Added/updated tests for Ask/Draw unlock guards, provider disabled guard, email skip guard, Supabase mutation skip guard, Stripe webhook skip guard, audit privacy, and production deploy block.

## Files Changed

- `src/app/api/ask/unlock/route.ts`
- `src/app/api/draw/unlock/route.ts`
- `src/app/api/stripe/webhook/route.ts`
- `src/lib/tianji-model-gateway.ts`
- `src/lib/love-report-email.ts`
- `src/lib/relationship-reading-store.ts`
- `scripts/audit-staging-degraded-mode.ts`
- `src/__tests__/api/ask-paid-gateway.test.ts`
- `src/__tests__/api/draw-gateway.test.ts`
- `src/__tests__/api/stripe-webhook-degraded-guard.test.ts`
- `src/__tests__/lib/tianji-model-gateway.test.ts`
- `src/__tests__/lib/love-report-email.test.ts`
- `src/__tests__/lib/relationship-reading-store-degraded.test.ts`
- `src/__tests__/scripts/staging-degraded-mode.test.ts`
- `.ai/TIANJI_LOVE_RUNTIME_GUARDS_WIRING_REVIEW_20260516.md`
- `.ai/TIANJI_LOVE_RUNTIME_GUARDS_WIRING_EVIDENCE_20260516.md`
- `.ai/CHANGELOG_AI.md`
- `.ai/REVIEW_PACKET.md`

## Commands Run

| Command | Result |
| --- | --- |
| `npm run test -- src/__tests__/api/stripe-webhook-degraded-guard.test.ts src/__tests__/api/ask-paid-gateway.test.ts src/__tests__/api/draw-gateway.test.ts src/__tests__/lib/tianji-model-gateway.test.ts src/__tests__/lib/love-report-email.test.ts src/__tests__/lib/relationship-reading-store-degraded.test.ts src/__tests__/scripts/staging-degraded-mode.test.ts` | Pass, 7 files / 26 tests |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run test` | Pass, 61 files / 532 tests |
| `npm run build` | Pass, 106 static pages |
| `npm run audit:routes` | Pass |
| `npm run audit:copy` | Pass |
| `npm run audit:share` | Pass |
| `npm run audit:upgrade` | Pass |
| `npm run audit:ask-revenue-contract` | Pass, `overall: conditional-go` |
| `npm run audit:draw-revenue-contract` | Pass, `overall: conditional-go` |
| `npm run audit:staging-degraded-mode` | Expected default No-Go without flags |
| Degraded flags plus `npm run audit:staging-degraded-mode` | Pass, `overall: go` |
| `git diff --check` | Pass with LF/CRLF warnings only |

## Safety Notes

- No `.env`, `.env.local`, secrets, credentials, provider keys, Stripe keys, webhook secrets, Supabase production data, Resend, or production config were read or printed.
- No live Stripe, live provider, Supabase production, Resend, paid smoke, webhook smoke, or deploy command was run.
- Guard responses and audit metadata exclude raw prompts, raw questions, birth date, birth time, birth location, timezone, provider request bodies, and secret-shaped values.

## Runtime Guard Decision

Go for degraded runtime guard wiring. Staging degraded deployment can now rely on explicit safe locked/skipped/disabled behavior when optional services are absent or disabled.

## Remaining Risks

1. Real staging env readiness is still separate from degraded-mode safety and may remain No-Go until env names are configured.
2. Live provider smoke, Stripe test-live checkout, webhook entitlement smoke, paid smoke, and production deploy remain blocked pending explicit approval and staging/test credentials.
3. Lane D should be rebased after Lane C so deploy docs reference the wired guard state.

## Suggested Commit Message

```text
feat: wire staging degraded runtime guards
```
