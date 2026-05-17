# TianJi Love Runtime Guards Wiring Evidence - 2026-05-16

## 1. What changed

- Wired staging degraded mode into paid Ask and Draw unlock endpoints so missing/disabled Stripe returns a safe locked `503` instead of crashing.
- Wired Stripe webhook degraded guard so disabled/missing Stripe skips webhook processing before signature verification, event construction, database mutation, or email work.
- Wired TianJi model gateway `AI_PROVIDER_LIVE_DISABLED=true` guard so gateway returns safe disabled content without calling provider/fallback functions.
- Wired `EMAIL_SEND_DISABLED=true` guard before Resend construction and before paid-order lookup.
- Wired `SUPABASE_MUTATION_DISABLED=true` guard before relationship profile insert and premium update helpers.
- Updated degraded-mode audit/tests so previously unknown runtime guard checks resolve to Go when the degraded flags are explicitly enabled.

## 2. Files changed

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

## 3. Commands run

- `npm run test -- src/__tests__/api/stripe-webhook-degraded-guard.test.ts src/__tests__/api/ask-paid-gateway.test.ts src/__tests__/api/draw-gateway.test.ts src/__tests__/lib/tianji-model-gateway.test.ts src/__tests__/lib/love-report-email.test.ts src/__tests__/lib/relationship-reading-store-degraded.test.ts src/__tests__/scripts/staging-degraded-mode.test.ts`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run audit:routes`
- `npm run audit:copy`
- `npm run audit:share`
- `npm run audit:upgrade`
- `npm run audit:ask-revenue-contract`
- `npm run audit:draw-revenue-contract`
- `npm run audit:staging-degraded-mode`
- Degraded flags plus `npm run audit:staging-degraded-mode`
- `git diff --check`

## 4. Degraded-mode behavior

With all degraded flags enabled:

```text
STAGING_DEGRADED_MODE=true
AI_PROVIDER_LIVE_DISABLED=true
STRIPE_LIVE_DISABLED=true
EMAIL_SEND_DISABLED=true
SUPABASE_MUTATION_DISABLED=true
```

Runtime guards return safe locked/skipped/disabled outcomes and avoid external provider, Stripe, Resend, and Supabase mutation work.

The flagged audit result was:

```json
{
  "degradedModeEnv": "go",
  "publicPagesCanLoad": "go",
  "relationshipFreeCanRun": "go",
  "askPreviewCanRun": "go",
  "drawPreviewCanRun": "go",
  "paidRoutesLockedWhenStripeMissing": "go",
  "stripeWebhookGuarded": "go",
  "providerLiveCallsDisabled": "go",
  "emailSendDisabled": "go",
  "supabaseMutationDisabled": "go",
  "productionDeployBlocked": "go",
  "overall": "go"
}
```

## 5. Public/free flow readiness

Public pages, Ask preview, Draw preview, and relationship free analysis remain source-ready for degraded staging. Public/free flows do not require Stripe, email, or Supabase service-role mutation to be configured.

## 6. Paid flow behavior

Ask and Draw paid unlock endpoints return safe locked `503` responses when staging degraded mode is enabled and Stripe is unavailable or live-disabled. The responses do not include secret-shaped values, raw questions, birth data, provider request bodies, or prompts.

## 7. Live provider status

No live provider smoke was run. With `AI_PROVIDER_LIVE_DISABLED=true`, `generateTianjiModelResponse()` returns safe disabled content and does not call the injected generation function.

## 8. Stripe status

No Stripe live or test-live call was run. Checkout and webhook paths are guarded for degraded staging. Webhook degraded guard returns a skipped receipt before event construction or mutation.

## 9. Production deploy decision

Production deploy remains No-Go. This lane only wires degraded staging guards and source-contract tests.

## 10. Next step

Merge Lane C before Lane D so the staging deploy package can document the actual runtime guard behavior.

## 11. Test/build result

- Targeted runtime guard tests passed: 7 files / 26 tests.
- Full test suite passed: 61 files / 532 tests.
- Production build passed with 106 generated static pages.
- Route/copy/share/upgrade audits passed.
- Ask revenue contract: `overall: conditional-go`.
- Draw revenue contract: `overall: conditional-go`.
- Default degraded-mode audit: `overall: no-go`, as expected without flags.
- Degraded flags audit: `overall: go`.
- `git diff --check` passed with LF/CRLF working-copy warnings only.
