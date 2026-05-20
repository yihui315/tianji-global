# TianJi Love Lane S Funnel Analytics Contract - 2026-05-20

## Goal

Implement the minimal free-to-paid funnel analytics contract for TianJi Love without enabling paid launch, Stripe live, webhook mutation, provider live expansion, email automation, Vedic paid public exposure, or production Supabase writes.

## Current Gate

```text
Production free + UX polish: Go
Lane S local implementation: Go
Production deploy: Not-run
Paid launch: No-Go
Stripe/webhook/email/Supabase paid mutation/provider live: Not enabled
```

## What Changed

Implemented a small privacy-safe analytics contract:

```text
home_cta_click
relationship_started
relationship_free_completed
ask_preview_started
ask_preview_completed
draw_preview_started
draw_preview_completed
pricing_viewed
unlock_click
login_started
```

Legacy revenue-funnel event names remain in the allowlist for compatibility, but the active homepage, Ask, Draw, Pricing, Login, and Relationship funnel calls now use the new canonical event names.

## Privacy Constraints

Client and server sanitizers now strip sensitive/high-content analytics keys, including:

```text
birthDate
birthTime
birthLocation
birthPlace
timezone
question
rawQuestion
prompt
answer
response
fullAnswer
fullReading
fullReport
fullResult
rawResult
readingText
modelOutput
modelResponse
providerOutput
providerResponse
providerRaw
rawProviderResponse
relationshipAnswers
rawRelationshipAnswers
rawKundliText
kundliPdfText
```

Allowed analytics payload values remain primitive-only on the server route.

## Degraded Guard

Both analytics write routes now respect:

```text
SUPABASE_MUTATION_DISABLED=true
```

When enabled, they return a skipped 202 response instead of writing analytics rows:

```text
reason=supabase_mutation_disabled
```

This preserves production free-canary degraded side-effect boundaries.

## Files Changed

```text
src/lib/analytics/funnel-events.ts
src/lib/analytics/client.ts
src/lib/trust-copy-guard.ts
src/app/api/analytics/track/route.ts
src/app/api/analytics/relationship/route.ts
src/components/home/TianjiLoveHome.tsx
src/app/(main)/ask/page.tsx
src/app/(main)/draw/page.tsx
src/app/(main)/pricing/page.tsx
src/app/login/page.tsx
src/app/relationship/new/client.tsx
src/components/relationship/RelationshipResult.tsx
src/__tests__/revenue-funnel-polish-contract.test.ts
src/__tests__/trust-privacy-contract.test.ts
.ai/TIANJI_LOVE_LANE_S_FUNNEL_ANALYTICS_CONTRACT_20260520.md
.ai/CHANGELOG_AI.md
.ai/REVIEW_PACKET.md
```

## Commands Run

```text
npm run test -- src/__tests__/revenue-funnel-polish-contract.test.ts
npm run test -- src/__tests__/trust-privacy-contract.test.ts
npm run typecheck
npm run lint
npm run audit:share
npm run audit:copy
npm run test
npm run build
npm run audit:routes
npm run audit:upgrade
git diff --check
targeted secret-shape scan
```

## Validation Result

```text
targeted revenue funnel contract: Go, 10/10 passed
targeted trust/privacy contract: Go, 4/4 passed after sequential rerun
typecheck: Go
lint: Go
audit:share: Go
audit:copy: Go
full test: Go, 67 files / 557 tests
audit:routes: Go
audit:upgrade: Go
git diff --check: Go with LF/CRLF warnings only
targeted secret-shape scan: 0 hits
```

Build note:

```text
first npm run build: No-Go due stale local .next page manifest, PageNotFoundError for /horary
action: cleared generated .next cache after path verification
second npm run build: Go, 106 static pages generated
remaining build warning: existing jose/NextAuth Edge runtime warning
```

## Not Changed

```text
No Stripe live
No webhook smoke
No paid unlock enablement
No Vedic paid public exposure
No email automation
No production Supabase mutation
No provider live scaling
No production deploy
No server command
No env file read
No secret printed
```

## Gate Verdict

```text
Lane S local analytics contract: Go
Production canary deployment of Lane S: No-Go until staging smoke and explicit approval
Paid launch: No-Go
```

## Next Step

Deploy this analytics-contract branch to staging degraded mode, run hosted non-paid smoke, then use the established 3068 preflight production free-canary path only after explicit approval.
