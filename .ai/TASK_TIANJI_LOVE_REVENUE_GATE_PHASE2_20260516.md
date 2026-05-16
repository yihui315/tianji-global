# TianJi Love Revenue Gate Phase 2 - Ask Paid Route + Revenue Smoke Readiness

## Current state

Phase 1 is complete:

- Mixed TianJi Love model gateway added.
- Relationship analyze route now uses gateway safety layer.
- aiMeta returns non-sensitive audit metadata.
- Fallback execution now tries configured fallbackModels in order.
- MiniMax quota check script exists and correctly blocks when MINIMAX_TOKEN_PLAN_KEY is missing.
- Runbook, rollback, CHANGELOG_AI, REVIEW_PACKET updated.
- Main gates passed:
  - typecheck
  - lint
  - full test suite
  - build
  - audit:routes
  - audit:copy
  - audit:share
  - audit:upgrade
  - git diff --check

Do not redo Phase 1.

## Phase 2 objective

Connect the Ask pay-per-question route to the TianJi model gateway without breaking payment gating.

Ask is the highest-priority revenue path.

Goal:

- Unpaid Ask users must not receive the full answer.
- Paid/unlocked Ask users should receive full answer through TianJi model gateway.
- Paid Ask should route to DeepSeek Flash by default.
- Fallback should support DeepSeek Pro, then configured safe fallback.
- Public output must pass certainty-risk safety rewrite.
- Response must include non-sensitive aiMeta.
- No real Stripe payment, no live DeepSeek call, no production deploy.

## Strict constraints

- Do not read or print real .env secrets.
- Do not modify production database.
- Do not call real Stripe payment APIs.
- Do not run paid smoke.
- Do not deploy.
- Do not send real emails.
- Do not hardcode any provider API keys.
- Do not expose birthDate, birthTime, birthLocation, timezone, raw user question, or full sensitive relationship profile in logs.
- Do not make MiniMax public production default.
- Keep all changes small and test-driven.

## Files to inspect first

Inspect only, then summarize current Ask flow before editing:

- src/app/ask/**
- src/app/api/ask/**
- src/app/api/stripe/**
- src/lib/tianji-model-gateway.ts
- src/lib/ai-orchestrator.ts
- src/types/ai.ts
- src/types/**
- src/__tests__/**ask**
- package.json
- .ai/REVIEW_PACKET.md
- docs/tianji-love-model-gateway-runbook.md

## Step 1 - Map current Ask revenue flow

Create or update:

.ai/TIANJI_LOVE_ASK_REVENUE_FLOW_REVIEW_20260516.md

Include:

1. Ask entry page path
2. Ask submit API path
3. Payment creation path
4. Unlock / entitlement check path
5. Webhook path
6. Result rendering path
7. Current model call path
8. Current safety layer status
9. Current test coverage
10. Current No-Go risks

Do not edit code until this review is written.

## Step 2 - Add Ask gateway contract

Add or extend types so Ask generation can call gateway with task:

- paid_ask
- ask_preview
- safety_rewrite

The Ask response must support:

```json
{
  "answer": "string|null",
  "preview": "string|null",
  "locked": true,
  "aiMeta": {
    "provider": "string",
    "model": "string",
    "fallbackUsed": false,
    "safetyRewritten": false,
    "latencyMs": 0,
    "route": "ask_preview|paid_ask"
  }
}
```

aiMeta must never include:

- API key
- full raw prompt
- birthDate
- birthTime
- birthLocation
- timezone
- raw user question text
- provider request body

## Step 3 - Preserve unpaid gating

Before editing the route, write failing tests:

- unpaid Ask returns locked=true
- unpaid Ask does not return full answer
- unpaid Ask can return short preview or question reflection only
- unpaid Ask does not call paid_ask gateway route
- unpaid Ask does not expose provider/model if no model was called

Suggested test file:

src/__tests__/api/ask-paid-gateway.test.ts

## Step 4 - Connect paid Ask to gateway

For paid/unlocked Ask only:

- Call TianJi model gateway with task paid_ask.
- Default provider/model should come from gateway config.
- Expected default: DeepSeek Flash.
- Fallback order must be respected.
- Run public-facing answer through safety rewrite.
- Return non-sensitive aiMeta.

Do not directly instantiate DeepSeek inside the API route if gateway already handles provider routing.

## Step 5 - Add safety tests

Tests must verify that paid Ask answer removes or rewrites phrases like:

- "100% will come back"
- "definitely marry"
- "destined to break up"
- "pay now or disaster will happen"
- "the cards guarantee"

Expected rewrite style:

- "This points to a possible pattern..."
- "A healthier way to read this is..."
- "Look for observable signals such as..."
- "This should be treated as reflection, not certainty."

## Step 6 - Add Stripe contract-only audit

Do not run real Stripe calls.

Add or update:

scripts/audit-ask-revenue-contract.ts

It should verify statically or with mocked env:

- Ask checkout route exists.
- Ask webhook handler exists.
- Ask entitlement/unlock check exists.
- Ask paid generation route exists.
- Required env names exist in env contract.
- No real secrets are printed.
- No live API call is made.

Expected output:

```json
{
  "askCheckoutRoute": "go|no-go|unknown",
  "askWebhookRoute": "go|no-go|unknown",
  "askEntitlementCheck": "go|no-go|unknown",
  "askPaidGatewayRoute": "go|no-go|unknown",
  "askSafetyRewrite": "go|no-go|unknown",
  "askAiMetaPrivacy": "go|no-go|unknown",
  "overall": "go|conditional-go|no-go"
}
```

Add package script:

```json
"audit:ask-revenue-contract": "tsx scripts/audit-ask-revenue-contract.ts"
```

Do not add it to production release gate until it passes locally.

## Step 7 - Update docs

Update:

- docs/tianji-love-model-gateway-runbook.md
- docs/tianji-love-model-gateway-rollback.md
- .ai/CHANGELOG_AI.md
- .ai/REVIEW_PACKET.md

Add:

.ai/TIANJI_LOVE_ASK_GATEWAY_EVIDENCE_20260516.md

Include:

1. What changed
2. Files changed
3. Commands run
4. Tests added
5. Ask unpaid behavior
6. Ask paid behavior
7. aiMeta privacy check
8. Stripe live call status
9. DeepSeek live call status
10. Launch gate decision

## Step 8 - Verification commands

Run:

```bash
npm run typecheck
npm run lint
npm run test -- src/__tests__/api/ask-paid-gateway.test.ts src/__tests__/lib/tianji-model-gateway.test.ts
npm run test
npm run build
npm run audit:routes
npm run audit:copy
npm run audit:share
npm run audit:upgrade
npm run audit:ask-revenue-contract
git diff --check
```

## Final output format

Return exactly:

1. What changed
2. Files changed
3. Commands run
4. Test/build result
5. Ask revenue gate decision
6. Risks and follow-up
7. Suggested commit message

## Expected decision after Phase 2

If all local mocked checks pass but no live Stripe/DeepSeek smoke was run:

```text
Ask gateway integration: Go
Ask paid smoke: No-Go
Ask revenue contract: Conditional Go
Production deploy: No-Go
```

Suggested commit message:

```text
feat: connect ask paid route to tianji model gateway
```
