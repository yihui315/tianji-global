# PILOT-001 P2 Recovery Review — 2026-07-23

## Scope

- Task ID: `20260723-pilot-001-p2-recovery`
- Mode: **Source-only** P2 sweep. No production deploy. No `.env`/secret touch.
- Working tree: branch `pilot-001-p2-recovery-20260723` from `origin/main@490d450`.
- Goal: close the two P2 items left over from the PILOT-001 quality audit (PR #162 era)
  without re-touching the US server (154.217.241.238), whose SSH is currently blocked
  on a manual cloud console / VNC restart.
- Source base: `origin/main@490d450 chore(model): all-in to MiniMax-M3 on minimax provider`.

## Diagnosis

### Item 1 — Sitemap

- Claim: "`/legal/privacy` and `/legal/terms` are not in sitemap".
- Finding: **The claim is outdated.** The sitemap source (`src/app/sitemap.ts`)
  iterates over `localizedPublicRoutes` from `src/lib/i18n.ts`, which currently
  registers both routes as canonical entries (no `hasLocaleVariant` flag):

  ```ts
  { path: '/legal/privacy', changeFrequency: 'yearly', priority: 0.45 },
  { path: '/legal/terms',   changeFrequency: 'yearly', priority: 0.45 },
  ```

- The legacy `/[locale]/privacy` and `/[locale]/terms` pages still exist but are
  `permanentRedirect` shims to `/legal/privacy?lang=…` and `/legal/terms?lang=…`.
  Excluding them from the sitemap is correct (one canonical URL per page; the
  locale param is query-string, not a path prefix).
- Verified the build artifact:
  `.next/server/app/sitemap.xml.body` produced by `npm run build:staging:degraded`
  contains `<loc>https://tianji.love/legal/privacy</loc>` and
  `<loc>https://tianji.love/legal/terms</loc>` along with the expected
  `/en/love-reading`, `/zh-CN/love-reading`, `/`, `/love-test`, `/ask`, `/draw`,
  and `/pricing` entries.
- No code change needed. A regression contract test was added anyway to lock the
  current composition and catch any future drift.

### Item 2 — US server `/api/version` returns 500 when `SERVICE_VERSION_BUILT_AT` is missing

- Claim: "Cloud server `SERVICE_VERSION_BUILT_AT` missing causes `/api/health`
  to return 500."
- Finding: **The endpoint is `/api/version`, not `/api/health`.** The repo
  contains `src/app/api/version/route.ts`; there was no `src/app/api/health/route.ts`
  before this patch.
- Root cause: the version route hard-coded
  `return NextResponse.json({ error: '…' }, { status: 500 })` whenever
  `NODE_ENV === 'production' && !builtAt`. This converts a build-metadata
  configuration gap into a fully-unreachable health probe, which makes
  monitoring indistinguishable from a broken service.
- Fix:
  1. `/api/version` now **always returns HTTP 200** and carries the verdict
     inside the body as `status: 'ok' | 'degraded'` with a typed
     `degradedReasons: string[]`. Malformed timestamps are treated as
     missing instead of propagated. The response adds `runtimeAt` so
     operators can confirm the handler actually ran.
  2. A new `/api/health` route was added as a stable diagnostic surface.
     It does not call external services (Supabase / Stripe / AI providers)
     so it stays green when downstream integrations are temporarily broken,
     isolating routing/build/version problems from real dependency outages.
  3. A contract assertion in `src/__tests__/adsense-readiness-contract.test.ts`
     forbids the literal `status: 500` shape from being reintroduced into the
     version route.

## What changed

```
M  src/app/api/version/route.ts
M  src/app/api/health/route.ts                              (new file)
M  src/__tests__/adsense-readiness-contract.test.ts        (added contract)
?? src/__tests__/api/version-health-route.test.ts          (new, 8 cases)
?? src/__tests__/sitemap-route-contract.test.ts            (new, 6 cases)
```

No other files touched. No `.env*`, no `.github/workflows/*`, no Vercel config,
no production deploy scripts, no Supabase migration, no Stripe change.

## Validation evidence

- `npm run typecheck` → exit 0 (`tsc -p tsconfig.typecheck.json --noEmit`).
- `npm run lint` → exit 0, "No ESLint warnings or errors".
- Targeted vitest run on the three affected suites:
  - `src/__tests__/sitemap-route-contract.test.ts` — 6/6 PASS
  - `src/__tests__/adsense-readiness-contract.test.ts` — 6/6 PASS
  - `src/__tests__/api/version-health-route.test.ts` — 8/8 PASS
  - Total: **20/20 PASS** in ~0.5s.
- `npm run build:staging:degraded` → exit 0; sitemap.xml emitted as static
  route; built artifacts contain the expected legal + locale-variant entries
  (verified via `.next/server/app/sitemap.xml.body`).
- `npm run audit:routes` → "audit-routes: OK".
- `npm run audit:adsense` → "RESULT: PASS (SOURCE GATE)". Live route audit
  intentionally skipped (per the existing workflow: it needs
  `ADSENSE_AUDIT_BASE_URL` + `ADSENSE_EXPECTED_COMMIT` together, which only
  exist post-deployment).
- Secret-shape scan over the diff (`grep -iE 'sk_live|sk_test_|password=|secret=|api_key=|token=|BEGIN PRIVATE|aws_access|stripe'`):
  0 raw-shape hits. The only matches were the word "Stripe" inside JSDoc
  comments in the new health route, which is acceptable narration.

## Behavioural contract after this patch

| Scenario                                          | Old behaviour        | New behaviour                                                  |
| ------------------------------------------------- | -------------------- | -------------------------------------------------------------- |
| Production, `SERVICE_VERSION_BUILT_AT` set        | 200, full body       | 200, `status='ok'`, full body, `runtimeAt` added              |
| Production, `SERVICE_VERSION_BUILT_AT` missing    | **500, hard error**  | 200, `status='degraded'`, `builtAt=null`, explicit reason     |
| Production, `SERVICE_VERSION_BUILT_AT` malformed  | 500, hard error      | 200, `status='degraded'`, `builtAt=null`, "not a valid ISO"   |
| Dev / staging, missing metadata                  | 200, fallback used   | 200, `status='degraded'`, dev-specific reason                  |
| Any environment, `/api/health` ping               | **404 (no route)**   | 200, `status` + `checks.version` + `degradedReasons`           |

## Gate decision and risks

- Source gate: **Go.** All four required checks pass; no privacy or
  consent surface touched; no production deployment executed.
- US server live verification: **Pending — not run by design.** The
  agent's manual SSH path (154.217.241.238) is blocked on cloud console
  restart. Re-run `npm run audit:adsense` after the next US deploy with
  `ADSENSE_AUDIT_BASE_URL` and `ADSENSE_EXPECTED_COMMIT` set together,
  then attach the `/api/version` and `/api/health` response bodies to
  this evidence packet.
- STAGING-004 admin wildcard RBAC patch: **Out of scope.** This packet
  only closes the two P2 items not requiring the US server.
- Future regression risk: the version/health contract is now codified
  by `src/__tests__/adsense-readiness-contract.test.ts`. Any future
  attempt to reintroduce `status: 500` into either route will fail CI.

## Reviewer focus

1. Confirm the new `/api/version` and `/api/health` response shape is
   acceptable for existing uptime monitors. If a monitor is hard-coded
   to interpret any non-500 as healthy, no action is needed; if it
   inspects `body.status`, this packet already includes that field.
2. Confirm the new `runtimeAt` and `degradedReasons` fields are safe
   to surface (no secrets, paths, or env-var values are echoed).
3. Confirm that pinning the contract in `adsense-readiness-contract.test.ts`
   is the right gate (alternatively: a dedicated release-gate test).
4. Once the US server is reachable again, re-run the live AdSense audit
   with `ADSENSE_AUDIT_BASE_URL` + `ADSENSE_EXPECTED_COMMIT` and append
   the response bodies to this packet.

## Suggested commit message

```
fix(health): /api/version and /api/health return degraded instead of 500

When SERVICE_VERSION_BUILT_AT is missing in production, the version
route previously returned HTTP 500. That converted a build-metadata
configuration gap into a fully-unreachable health probe, making it
impossible to distinguish "misconfigured build" from "service fully
broken" in monitoring.

The version route now always returns 200 and carries the verdict in
the body as status='ok' | 'degraded' with a typed degradedReasons[].
A new /api/health route provides a stable diagnostic surface that
stays green even when downstream integrations fail, isolating
routing/build/version problems from real dependency outages.

PILOT-001 P2 recovery (2026-07-23). No secrets touched. No
production deploy. No .env or workflow changes.
```