# Brain Review Packet

## Task Goal

Implement Lane S: a minimal privacy-safe free-to-paid funnel analytics contract for TianJi Love, without enabling paid launch or live side effects.

## Status

```text
Production UX polish canary: Go from prior server evidence
Lane S local analytics contract: Go
Production deploy: Not-run
Staging deploy: Not-run for this new Lane S diff
Paid launch: No-Go
Stripe/webhook/email/Supabase paid mutation/provider live: Not enabled
Vedic paid public exposure: Disabled / No-Go
```

## What Changed

- Added canonical free-to-paid funnel event names:
  `home_cta_click`, `relationship_started`, `relationship_free_completed`, `ask_preview_started`, `ask_preview_completed`, `draw_preview_started`, `draw_preview_completed`, `pricing_viewed`, `unlock_click`, and `login_started`.
- Kept legacy revenue-funnel event names in the allowlist for compatibility.
- Updated homepage, Ask, Draw, Pricing, Login, Relationship form, and Relationship result funnel calls to use the canonical event names.
- Expanded analytics sanitization to strip raw questions, prompts, answers, full report/result text, and model/provider responses.
- Added `SUPABASE_MUTATION_DISABLED` guards to generic and relationship analytics API routes so degraded/canary mode can skip analytics writes safely.

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

| Command | Result |
| --- | --- |
| `npm run test -- src/__tests__/revenue-funnel-polish-contract.test.ts` | Pass, 10/10 |
| `npm run test -- src/__tests__/trust-privacy-contract.test.ts` | Pass, 4/4 after sequential rerun |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run audit:share` | Pass |
| `npm run audit:copy` | Pass |
| `npm run test` | Pass, 67 files / 557 tests |
| first `npm run build` | Failed on stale local `.next` manifest: `/horary` PageNotFoundError |
| clear generated `.next` cache with path verification | Pass |
| second `npm run build` | Pass, 106 static pages; existing jose/NextAuth Edge warning only |
| `npm run audit:routes` | Pass |
| `npm run audit:upgrade` | Pass |
| `git diff --check` | Pass with LF/CRLF warnings only |
| targeted secret-shape scan | Pass, 0 hits |

## Safety Notes

- No production deploy, staging deploy, symlink switch, PM2 restart, certbot, server command, Stripe call, webhook replay, email send, Supabase paid mutation, provider live call, paid unlock enablement, or Vedic paid public exposure was performed.
- No `.env`, `.env.local`, secret value, credential, production config, Stripe dashboard data, Supabase data, or provider key value was read or printed.
- The analytics routes still attempt normal writes only when Supabase is configured and `SUPABASE_MUTATION_DISABLED` is not true; degraded/canary flags can skip writes with 202.

## Gate Matrix

| Gate | Verdict | Reason |
| --- | --- | --- |
| Lane S local implementation | Go | Tests, typecheck, lint, build, and audits passed |
| Analytics privacy contract | Go | Client and server sanitizers strip sensitive/high-content fields |
| Degraded analytics write guard | Go | Generic and relationship routes honor `SUPABASE_MUTATION_DISABLED` |
| Production update | No-Go | Needs staging smoke and explicit canary approval |
| Paid smoke | No-Go | Not part of Lane S and not approved |
| Production paid launch | No-Go | Stripe/webhook/entitlement/provider/email/Supabase smoke remains not-run |

## Risks And Follow-Up

1. Stage this diff on `staging.tianji.love` under degraded flags before any production canary.
2. Use the established 3068 preflight production free-canary path only after explicit approval.
3. Confirm analytics writes are either safely skipped in degraded mode or pointed at approved staging/test storage before treating funnel metrics as real.
4. Keep rollback releases and production observation in place.

## Suggested Commit Message

```text
feat: add tianji love funnel analytics contract
```
