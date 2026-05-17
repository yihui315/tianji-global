# TianJi Love Staging Smoke Runbook

## 1. Preconditions

Use this runbook only for staging or local readiness checks. Production deploy, production Stripe keys, production webhook secrets, production Supabase mutations, real email sends, and paid live smoke remain No-Go until separately approved.

Before any live smoke:

- confirm the target is staging or local, not production
- use test-mode Stripe credentials only
- use synthetic test payloads only
- do not print `.env` values, API keys, webhook secrets, price IDs, prompts, or response bodies
- collect command output as JSON status evidence
- keep MiniMax as internal/research only, never a public production default

## 2. Masked Env Inventory

Presence-only readiness check:

```bash
npm run audit:staging-env-readiness
```

Expected output groups:

- `app`
- `supabase`
- `stripeTestMode`
- `email`
- `aiRuntime`
- `ollama`
- `deepseek`
- `minimax`
- `overall`
- `missingNamesOnly`

This command must print names only for missing variables. It must never print actual values.

## 3. Build Verification

Run the local build and contract gates before staging smoke:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run audit:routes
npm run audit:copy
npm run audit:share
npm run audit:upgrade
npm run audit:ask-revenue-contract
npm run audit:draw-revenue-contract
```

## 4. Non-Paid Relationship Smoke

Approval required when targeting a hosted staging URL.

```bash
STAGING_BASE_URL=https://staging.example.com STAGING_NONPAID_SMOKE_ALLOW_LIVE=true npm run smoke:staging:nonpaid
```

The smoke script sends only synthetic relationship input and logs route/status plus safe `aiMeta` fields. It does not log request bodies, raw responses, birth time, birth location, timezone, raw question text, provider prompts, or secrets.

## 5. Non-Paid Ask Preview Smoke

Covered by:

```bash
STAGING_BASE_URL=https://staging.example.com STAGING_NONPAID_SMOKE_ALLOW_LIVE=true npm run smoke:staging:nonpaid
```

Expected result: Ask preview returns locked preview behavior only. It must not unlock a full paid answer and must not call paid Ask generation directly.

## 6. Non-Paid Draw Smoke

Covered by:

```bash
STAGING_BASE_URL=https://staging.example.com STAGING_NONPAID_SMOKE_ALLOW_LIVE=true npm run smoke:staging:nonpaid
```

Expected result: Draw preview returns a limited locked reading. It must not unlock paid/pro reading text or call Stripe checkout.

## 7. Stripe Test Checkout Smoke

Readiness-only check, no checkout session is created:

```bash
npm run smoke:stripe:test-readiness
```

Approval required for test-live mode:

```bash
STRIPE_SMOKE_MODE=test-live STRIPE_SMOKE_ALLOW_LIVE=true npm run smoke:stripe:test-readiness
```

Test-live mode must confirm test-mode key shape and staging target safety before any live test-mode call. Do not use production Stripe keys or production webhook secrets.

## 8. Stripe Webhook Smoke

Readiness-only source check:

```bash
npm run smoke:stripe:test-readiness
```

Webhook event delivery tests require explicit approval, test-mode Stripe only, and a staging endpoint. Do not mutate production subscriptions, entitlements, or customer records.

## 9. DeepSeek Live Provider Smoke

Dry-run readiness:

```bash
npm run smoke:ai-providers
```

Approval required for live mode:

```bash
AI_PROVIDER_SMOKE_MODE=live AI_PROVIDER_SMOKE_ALLOW_LIVE=true npm run smoke:ai-providers
```

The live prompt is intentionally harmless and must not include relationship data. The script must not persist or print response bodies.

## 10. Ollama Live Provider Smoke

Dry-run readiness:

```bash
npm run smoke:ai-providers
```

Approval required for live mode:

```bash
AI_PROVIDER_SMOKE_MODE=live AI_PROVIDER_SMOKE_ALLOW_LIVE=true npm run smoke:ai-providers
```

Ollama may be local or staging-scoped. Confirm `OLLAMA_BASE_URL` points to the intended non-production target before live mode.

## 11. MiniMax Quota Smoke

Dry-run readiness:

```bash
npm run smoke:ai-providers
```

Direct quota check, approval required when a real token-plan key is present:

```bash
npx tsx scripts/check-minimax-quota.ts
```

MiniMax remains internal/research only. A successful quota check does not make MiniMax eligible as a public production default.

## 12. Evidence Collection

Collect and attach:

- `git status --short`
- latest commit hash
- command outputs from readiness and contract gates
- non-paid staging smoke JSON when approved and run
- provider smoke mode and result
- Stripe readiness mode and result
- explicit statement that no secrets or response bodies were printed
- explicit statement that production deploy was not run

## 13. Rollback

If staging smoke fails:

- stop running live smoke commands
- keep production deploy No-Go
- remove or disable staging-only env values in the hosting manager if they are suspected unsafe
- keep Ask/Draw unpaid gates intact
- keep provider calls behind gateway fallback and safety rewrite
- use `docs/tianji-love-model-gateway-rollback.md` for route-level fallback steps

## 14. Go / No-Go Decision Table

| Gate | Go condition | No-Go condition |
| --- | --- | --- |
| Env readiness | all required staging names present and classified safe | required names missing or production-shaped paid keys detected |
| Build verification | typecheck, lint, test, build, audits pass | any required local gate fails |
| Non-paid smoke | Relationship, Ask preview, Draw preview pass on staging | staging URL absent, approval absent, or any route returns unsafe behavior |
| Stripe test readiness | test-mode key shape and source routes pass readiness | production key shape, missing route, missing webhook, or missing entitlement path |
| Stripe test-live smoke | approved test-mode checkout/webhook evidence passes | not approved, not run, production-shaped key, webhook failure |
| AI provider dry-run | route mapping/config readiness is conditional or better | route mapping broken |
| AI provider live smoke | approved live staging calls pass without body/secrets logging | not approved, not run, or provider call fails |
| MiniMax quota | approved quota check returns safe quota status | token-plan key absent or quota check fails |
| Production deploy | only after all staging paid/live gates pass | default state for Phase 4 |

