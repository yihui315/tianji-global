# TianJi Love Post-Canary UX Conversion Polish Evidence - 2026-05-20

## Goal

Improve ordinary-user understanding and conversion after the successful production free canary, without changing payment backends, paid unlock behavior, production env, or live side-effect systems.

## Scope

```text
Production free canary: Go
Free routes live: Go
Paid launch: No-Go
Stripe/webhook/provider live/email/Supabase mutation: not-run
Vedic paid public exposure: disabled
Production deploy from Codex: not-run
```

## What Changed

- Rewrote the homepage hero to explain the product path more directly: free relationship reading, Ask, Draw Timing, and optional deeper unlock.
- Unified English Draw/Timing naming around `Draw Timing`.
- Added a homepage sample reading CTA that points to the existing demo report route.
- Added Pricing one-time unlock sections for Ask, Draw Timing, and Relationship Destiny Report status.
- Added Pricing `What happens after unlocking` trust/value explanation.
- Added Chinese copy for the new Pricing one-time unlock and after-unlock sections to avoid mixed-language default-route rendering.
- Added login loading fallback copy so users do not only see `Loading...`.
- Weakened conversion copy/tests away from guaranteed accuracy or life-changing/healing claims.
- Added a staging HTTPS runbook for the observed `https://staging.tianji.love` 502 path.
- Updated copy/contracts tests to protect the new funnel language and safety boundary.

## Files Changed

```text
src/components/home/TianjiLoveHome.tsx
src/components/tianji-love/TianjiLovePrimitives.tsx
src/app/(main)/about/page.tsx
src/app/(main)/ask/page.tsx
src/app/(main)/draw/layout.tsx
src/app/(main)/draw/page.tsx
src/app/(main)/pricing/layout.tsx
src/app/(main)/pricing/page.tsx
src/app/(main)/readings/page.tsx
src/app/login/page.tsx
src/app/relationship/new/client.tsx
src/__tests__/landing-design-contract.test.ts
src/__tests__/revenue-funnel-polish-contract.test.ts
src/__tests__/tianji-love-p0-pages-contract.test.ts
docs/tianji-love-staging-https-runbook.md
.ai/TIANJI_LOVE_STAGING_HTTPS_RUNBOOK_EVIDENCE_20260520.md
.ai/TIANJI_LOVE_POST_CANARY_UX_CONVERSION_POLISH_20260520.md
.ai/CHANGELOG_AI.md
.ai/REVIEW_PACKET.md
```

## Commands Run

```text
npm run test -- src/__tests__/revenue-funnel-polish-contract.test.ts
npm run test -- src/__tests__/landing-design-contract.test.ts src/__tests__/tianji-love-p0-pages-contract.test.ts
npm run typecheck
npm run lint
npm run test
npm run build
npm run audit:copy
npm run audit:share
npm run audit:upgrade
npm run audit:routes
npm run start -- -p 3059
Puppeteer browser smoke for /, /draw, /pricing, /login on desktop and mobile
git diff --check
```

## Validation Result

```text
targeted revenue funnel tests: Go, 9/9 passed
targeted landing/P0 tests: Go, 24/24 passed
typecheck: Go
lint: Go
full tests: Go, 67 files / 556 tests
build: Go
copy audit: Go
share audit: Go
upgrade audit: Go
route audit: Go
local browser smoke: Go, desktop/mobile / /draw /pricing /login all 200 with no page errors
diff check: Go, LF/CRLF warnings only
```

Note: the first parallel targeted test attempt hit a Vitest coverage temporary directory race after tests passed. Sequential reruns passed. An early browser smoke check also exposed mixed-language Pricing rendering on the default Chinese route; Chinese copy was added and the final browser smoke passed.

## Safety Decision

```text
UX conversion polish: Go locally
production deploy: not-run
paid launch: No-Go
Stripe live: not enabled
webhook mutation: not run
email automation: not enabled
Supabase mutation: not run
provider live scaling: not run
Vedic paid public exposure: disabled
```

## Follow-Up

- Execute the staging HTTPS runbook separately on the server if approved.
- Run visual/browser QA on the polished pages before the next production canary.
- Keep paid smoke in Lane N only; do not open real payment until Stripe/webhook/entitlement smoke is approved and passed.
