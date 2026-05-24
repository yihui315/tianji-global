# TianJi Love Stripe Test-Mode Paid Smoke Approval Packet - 2026-05-24

## Purpose

Prepare explicit approval for Stripe test-mode paid smoke of the `/love-test -> /ask` 9.9 one-question paid-intent funnel.

This packet is approval-only. It does not authorize or execute Stripe checkout, paid smoke, production deploy, webhook replay, Supabase mutation, provider live AI calls, or server mutation.

## Source refs

```text
Paid intent branch: feat/love-test-paid-intent-20260524
Paid intent commit: f97ab7a

Checkout readiness branch: chore/love-test-checkout-readiness-20260524
Readiness audit commit: 08a8178
Branch head: ea27f9a
```

## Current readiness

```text
Local paid-intent readiness: Go
Checkout code path review: Go
Checkout readiness audit: Go
Staging HTTP route smoke: Go
Paid-intent browser QA: Go
Checkout blocked-by-gate: Go
Share-card PNG regression: Go
Stripe checkout execution: Not run
Paid smoke: No-Go - awaiting explicit approval
Production deploy: No-Go
```
## Smoke scope after approval only

Allowed only after explicit user approval:

```text
1. Use staging/test-mode only.
2. Create one Stripe test-mode checkout session.
3. Verify checkout URL is test-mode.
4. Do not use live Stripe.
5. Do not run production deploy.
6. Do not replay webhook unless separately approved.
7. Do not mutate Supabase unless test-mode paid smoke scope explicitly requires it and is approval-gated.
8. Do not call provider live AI.
```

## Required approval phrase

The user must explicitly say:

```text
批准跑 Stripe test-mode paid smoke
```

Without this exact approval, paid smoke remains No-Go.

## Pre-smoke checks required

```text
- Confirm staging target only.
- Confirm test-mode only.
- Confirm no live Stripe key usage.
- Confirm no production URL.
- Confirm no webhook replay.
- Confirm no provider live AI call.
- Confirm no Supabase production mutation.
```

## Success criteria after future paid smoke

```text
Stripe checkout session created in test mode: Go
Checkout URL returned: Go
No live payment: Go
No production mutation: Go
Paid smoke evidence captured: Go
Production deploy: No-Go
```

## Stop conditions

Stop immediately if:

```text
- Live Stripe mode detected.
- Production URL detected.
- Missing approval.
- Env readiness unclear.
- Checkout attempts to use production callback.
- Webhook replay is required.
- Supabase mutation is required without approval.
```

## Current decision

```text
Checkout readiness source ref: Go
Checkout readiness audit: Go
Approval packet: Go
Stripe checkout execution: Not run
Paid smoke: No-Go - awaiting explicit approval
Production deploy: No-Go
```
