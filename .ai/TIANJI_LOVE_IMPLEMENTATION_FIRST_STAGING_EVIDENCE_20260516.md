# TianJi Love Implementation-First Staging Evidence - 2026-05-16

## 1. What changed

- Added a staging degraded-mode helper for the requested env flags.
- Added `scripts/audit-staging-degraded-mode.ts` with the workflow JSON fields.
- Added `audit:staging-degraded-mode` to `package.json`.
- Updated non-paid staging smoke output to include `/login`, route/status/pass records, and safe `aiMeta` only.
- Added focused script tests for degraded-mode audit/helper behavior.
- Stabilized two existing contract tests so they do not depend on CRLF line endings or live AI provider behavior.

## 2. Files changed

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

## 3. Commands run

- `npm ci --ignore-scripts --no-audit --no-fund --loglevel=error`
- `npm run typecheck`
- `npm run lint`
- `npm run test -- src/__tests__/scripts/staging-degraded-mode.test.ts`
- `npm run test`
- `npm run build`
- `npm run audit:routes`
- `npm run audit:copy`
- `npm run audit:share`
- `npm run audit:upgrade`
- `npm run audit:ask-revenue-contract`
- `npm run audit:draw-revenue-contract`
- `npm run audit:staging-degraded-mode`
- `STAGING_DEGRADED_MODE=true AI_PROVIDER_LIVE_DISABLED=true STRIPE_LIVE_DISABLED=true EMAIL_SEND_DISABLED=true SUPABASE_MUTATION_DISABLED=true npm run audit:staging-degraded-mode`
- `git diff --check`

## 4. Degraded-mode behavior

The helper supports:

- `STAGING_DEGRADED_MODE=true`
- `AI_PROVIDER_LIVE_DISABLED=true`
- `STRIPE_LIVE_DISABLED=true`
- `EMAIL_SEND_DISABLED=true`
- `SUPABASE_MUTATION_DISABLED=true`

Default behavior remains safe: with flags unset, `audit:staging-degraded-mode` returns `overall: "no-go"`.

With all degraded-mode flags set, the audit returns `overall: "conditional-go"`:

- Public pages: `go`
- Relationship free source contract: `go`
- Ask preview: `go`
- Draw preview: `go`
- Production deploy blocked: `go`
- Paid unlock/runtime provider/email guard status: `unknown`

The `unknown` statuses are intentional in this lane because wiring runtime enforcement would require editing forbidden shared files.

## 5. Public/free flow readiness

Conditional Go from source contract:

- Public page files are present.
- Relationship free analysis already avoids Supabase writes when Supabase is not configured.
- Ask preview is local and does not require Stripe/email/provider live calls.
- Draw preview has local fallback behavior and does not require Stripe.
- Non-paid smoke keeps response bodies redacted and logs only route/status/pass plus safe `aiMeta`.

## 6. Paid flow behavior

Conditional / blocked for this lane.

Paid unlock runtime guards would require editing:

- `src/app/api/ask/unlock/route.ts`
- `src/app/api/draw/unlock/route.ts`

Those files are in the parallel boundary / avoid-touch set, so this lane records `paidRoutesLockedWhenStripeMissing: "unknown"` instead of changing runtime behavior.

## 7. Live provider status

Conditional / blocked for this lane.

Runtime provider live-call disabling would require editing `src/lib/tianji-model-gateway.ts`, which is in the parallel boundary / avoid-touch set. The helper and audit support the flag, and the audit reports `providerLiveCallsDisabled: "unknown"` until a safe serial lane can wire the guard.

## 8. Stripe status

Stripe live execution remains disabled by policy. No live Stripe call, checkout creation, webhook smoke, or paid smoke was run.

## 9. Production deploy decision

Production deploy remains blocked. The audit helper treats degraded mode as production-deploy blocked unless `PRODUCTION_DEPLOY_ALLOWED=true`, which was not set or used.

## 10. Next step

Merge Lane A before Lane B, then rebase Lane B. If runtime paid unlock/provider/email enforcement is still required, schedule a serial backend safety lane after the parallel frontend work is merged.
