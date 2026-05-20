# Brain Review Packet

## Task Goal

Polish the TianJi Love post-free-canary user journey so ordinary users can more quickly understand the free product, optional one-time unlocks, and trust boundaries, without changing payment backend behavior or enabling paid launch.

## Status

```text
Production free canary: Go
Production free routes: Go from prior hosted smoke
UX conversion polish: Go locally
Staging HTTPS runbook: Go / not executed
Production deploy from Codex: Not-run
Paid launch: No-Go
Stripe/webhook/provider live/email/Supabase mutation: Not-run
Vedic paid public exposure: Disabled
```

## What Changed

- Homepage hero copy now explains the value proposition more directly: private free relationship reading, Ask, Draw Timing, and optional deeper unlock only after preview value is clear.
- Homepage now includes a sample reading CTA to the existing demo route.
- English Draw/Timing naming is unified around `Draw Timing`.
- Pricing now includes one-time unlocks for Ask, Draw Timing, and the currently blocked Relationship Destiny Report.
- Pricing now explains what users receive after unlocking.
- Chinese default-route Pricing copy now has localized one-time unlock and after-unlock sections instead of falling back to English.
- Chinese nav labels now use `时机抽牌` for the Draw Timing surface.
- Login loading state now has meaningful static fallback copy instead of only `Loading...`.
- Testimonials/copy contracts were tightened away from guaranteed accuracy, healing, or life-changing promise language.
- Added a staging HTTPS runbook for fixing `https://staging.tianji.love` separately from production.

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

| Command | Result |
| --- | --- |
| `npm run test -- src/__tests__/revenue-funnel-polish-contract.test.ts` | Pass, 9/9 after sequential rerun. |
| `npm run test -- src/__tests__/landing-design-contract.test.ts src/__tests__/tianji-love-p0-pages-contract.test.ts` | Pass, 24/24 after updating expected copy. |
| `npm run typecheck` | Pass. |
| `npm run lint` | Pass. |
| `npm run test` | Pass, 67 files / 556 tests. |
| `npm run build` | Pass with existing NextAuth/jose Edge runtime warnings. |
| `npm run audit:copy` | Pass. |
| `npm run audit:share` | Pass. |
| `npm run audit:upgrade` | Pass. |
| `npm run audit:routes` | Pass. |
| `npm run start -- -p 3059` | Pass, local preview returned 200. |
| Puppeteer browser smoke for `/`, `/draw`, `/pricing`, `/login` on desktop/mobile | Pass, all 8 page loads returned 200 with required copy present and no page errors. |
| `git diff --check` | Pass with LF/CRLF working-copy warnings only. |

## Safety Notes

- No `.env`, `.env.local`, production env, or secret value was read or printed.
- No production deploy, PM2 restart, symlink switch, Nginx reload, Stripe live call, webhook smoke, paid unlock enablement, provider live scaling, email send, or Supabase mutation was run.
- The staging HTTPS runbook is documentation only; certbot was not run by Codex.
- Paid launch remains No-Go.

## Risks And Follow-Up

1. Run visual/browser QA against a local preview and staging before any production rollout of this polish.
2. Execute the staging HTTPS runbook only with server-operator approval, and verify production guard smoke afterward.
3. Pricing now explains paid value better, but actual paid launch remains blocked until Lane N Stripe/webhook/entitlement/provider/email/Supabase smoke passes.
4. Keep the old production rollback release preserved during the 24-hour free canary observation window.

## Suggested Commit Message

```text
feat: polish post-canary love funnel UX
```
