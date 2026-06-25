# 2026-06-25 - TianJi Love Day 013 publishing pack (calm is a feature, not a side effect)

## What changed

- Created `assets/marketing/daily/day-013-publishing-pack.md` for publishing date 2026-06-30. Theme: "Calm is a feature, not a side effect." Channel mix: 1 TikTok, 1 YouTube Shorts, 1 Instagram Reels, 1 reflection carousel, 1 trust note. All hooks stay grounded; no fake metrics, no guaranteed outcomes, no chase framing, no mind-reading, no dependency-loop / "check again tomorrow" tone.
- Created `assets/marketing/daily/day-013-review-checklist.md` matching the Day 011 / Day 012 pattern: Content Safety, Publishing Gate, KPI And Revenue Gate, and pack-specific risk reminders. Manual review is the only path to publication.
- Created `data/love-test-day-013-kpi-entry.csv` with the same 18-column schema as Day 012, five rows (one per content piece), every numeric field zero, paid_smoke_result set to `not_run`, notes flagging "manual entry after publish". No real metrics are invented.
- Theme source: `assets/marketing/content-calendar-7day.md` row for Day 013 (2026-06-30) and `assets/marketing/love-test-next-30-hooks.md` T5 — "A useful love test should make you calmer, not more dependent." Hook pool anchor documented inside the pack under "Hook Source".
- No source code, no API route, no auth, no billing, no production deploy, no env, no secret, no platform account, no credentials touched. No posting, no automation, no scheduling, no Stripe call.

## Validation

```text
git status before write: clean worktree (one prior commit already pushed to chore/marketing-content-calendar-refresh-20260623)
git diff --check: Pass
Targeted secret-shape scan over .agents/skills/ .github/workflows/ .ai/ assets/marketing/ data/:
  - searched for sk_live, sk_test, pk_live, pk_test, AKIA, ghp_, xox[baprs]-, bearer , access_token, api_key, client_secret
  - 0 hits in new files; existing AI records contain only detection-pattern references
CSV column count check (Day 013 vs Day 012): 18 columns, identical order
CSV row count check: 6 lines (1 header + 5 items), matches the 5 content rows in the pack
npm run typecheck: not run (docs/assets/data-only change, no TS source touched)
npm run lint: not run (no .ts/.tsx/.js source touched)
Auto-posting: Not run
Live Stripe call: Not run
Production deploy: Not run
Supabase mutation: Not run
.env read/print: No
```

## Gate status

```text
Daily growth publishing pack: Go
Manual review checklist: Go
KPI entry scaffold: Go
Social auto-posting: No-Go - manual publishing only
Stripe checkout execution: Not run
Paid smoke: No-Go - awaiting explicit approval
Production deploy: No-Go
```

# 2026-06-24 - TianJi Love safe publisher bridge export (Phase 1, credential-free, manual-review only)

## What changed

- Created the aggregate credential-free publisher bridge at `assets/marketing/publishing-queue.json` and `assets/marketing/publishing-queue.csv` (top-level of `assets/marketing/`). The bridge consolidates the 11 per-day queue files (day-002-overseas through day-012) into a single 55-item export that future automation tools (n8n / Postiz / Mixpost) can later consume — but only after an explicit human approval that is outside the scope of this skill.
- Generated the missing per-day queue files for Day 011 (`day-011-publishing-queue.{json,csv}`) and Day 012 (`day-012-publishing-queue.{json,csv}`) so the bridge has a complete source for the calendar's current 7-day window. Each day queue follows the same schema as Day 010 (publish_date, publish_window, channel, content_id, content_type, title, hook, body_or_script, caption, hashtags, cta_url, asset_note, review_status, publish_status, published_url, metrics, notes). Day 011 theme: "Understanding is not the same as acting". Day 012 theme: "Repair over replay". All copy stays grounded: no fake metrics, no guaranteed outcomes, no chase framing, no mind-reading, no identifying details.
- Created `.ai/TIANJI_LOVE_SAFE_PUBLISHER_BRIDGE.md` documenting the bridge contract (per-item shape, file layout), how to inspect the bridge without executing it, how to quarantine the bridge if needed, the explicit allow/forbid lists for the skill, the five-step gate any future platform-safe adapter must pass, the current state, and the gate status block.
- Every item in the aggregate bridge carries `manual_review_required: true`. The bridge declares `credential_free: true` and `auto_posting_enabled: false`. The credential-related fields (access_token, api_key, client_id, client_secret, cookie, session, bearer, password, username) are explicitly listed as intentionally absent — not blank placeholders.
- No source code, no API route, no auth, no billing, no production deploy, no env, no secret, no platform account, no credentials touched. No posting, no automation, no scheduling, no Stripe call.

## Validation

```text
git status: clean worktree before write, 7 new files staged explicitly
git diff --check: Pass
Targeted secret-shape scan over .ai/ assets/marketing/ data/:
  - searched for sk_live, sk_test, pk_live, pk_test, AKIA, ghp_, xox[baprs]-, bearer , access_token, api_key, client_secret
  - 0 hits in new files; existing AI records contain only detection-pattern references
JSON parse check on aggregate bridge: Pass (valid JSON, 55 items, 11 days)
CSV row count check: 56 lines (1 header + 55 items), matches JSON
Per-day queue schema check (Day 010 vs Day 011 vs Day 012): same fields, same status values
npm run typecheck: not run (docs/assets/data-only change, no TS source touched)
npm run lint: not run (no .ts/.tsx/.js source touched)
Auto-posting: Not run
Live Stripe call: Not run
Production deploy: Not run
Supabase mutation: Not run
.env read/print: No
```

## Gate status

```text
Publisher bridge export: Go
Publishing queue JSON: Go (55 items, 11 days)
Publishing queue CSV: Go (55 rows, 1 header)
Per-day queue files: Go (Day 011 + Day 012 added; Day 002–010 unchanged)
Credentials: No-Go - not used or stored
Social auto-posting: No-Go - manual publishing only
Stripe checkout execution: Not run
Paid smoke: No-Go - awaiting explicit approval
Production deploy: No-Go
```

## Follow-up

- A human operator must inspect `assets/marketing/publishing-queue.json` and any day-XXX queue before posting. The bridge is intentionally inert.
- A future platform-safe adapter (n8n / Postiz / Mixpost) requires a separate, named, auditable approval and must keep credentials outside the repo. The bridge file is the contract that adapter would read from; this skill does not enable the adapter.
- Next scheduled run will refresh the bridge if the underlying daily queues or calendar change.

# 2026-06-24 - TianJi Love 7-day content calendar refresh + hook/script/caption pool rotation (docs/assets-only)

## What changed

- Extended `assets/marketing/content-calendar-7day.md` by adding Day 013 (2026-06-30, "Calm is a feature, not a side effect"). The calendar now has 7 future days from today (2026-06-24 through 2026-06-30).
- Updated the "Theme Rotation Notes" block to record Day 013 alongside Day 004–Day 012.
- Refreshed `assets/marketing/love-test-next-30-hooks.md` rotation date to 2026-06-24 and rotated 4 hooks in-place (entries 17, 24, 30, plus header normalization). Pool count stays at 30; theme distribution across T1–T5 stays balanced; no hook promises reunion, prediction accuracy, "act tonight", or "send this exact text" framing.
- Refreshed `assets/marketing/love-test-next-20-video-scripts.md` rotation date to 2026-06-24 and rotated 2 scripts (S10 "Calm is a feature, not a side effect"; S19 "Awkward Tuesday") to keep the next 7-day window distinct from Days 004–011. Pool count stays at 20; each script still ends on `/love-test`.
- Refreshed `assets/marketing/love-test-next-20-share-captions.md` rotation date to 2026-06-24 and rotated 2 captions (entries 9 and 18) to match the script/calendar rotation. Pool count stays at 20; each caption still ends on `/love-test`.
- All copy stays grounded: no fake testimonials, fake numbers, fake revenue, fake accuracy, guaranteed outcomes, reunion promises, mind-reading claims, "act tonight" framing, "send this exact text" patterns, or identifying detail.
- No source code, no API route, no auth, no billing, no production deploy, no env, no secret, no platform account, no credentials touched.

## Validation

```text
git diff --check: Pass
git diff --stat: 4 files changed, 28 insertions(+), 26 deletions(-)
  assets/marketing/content-calendar-7day.md
  assets/marketing/love-test-next-20-share-captions.md
  assets/marketing/love-test-next-20-video-scripts.md
  assets/marketing/love-test-next-30-hooks.md
npm run typecheck: Not runnable in this partial-install environment (lib.dom.d.ts missing); changes are docs/assets-only (markdown), no TS source modified
npm run lint: Not runnable in this partial-install environment (next not on PATH); changes are docs/assets-only, no JS/TS source modified
Targeted secret-shape scan over changed files (.ai/, assets/marketing/, data/): Pass (only detection-pattern references appear inside existing AI records; no real sk_, pk_, AKIA, ghp_, xox, private-key, or password-shape matches)
Live Stripe call: Not run
Production deploy: Not run
Supabase mutation: Not run
.env read/print: No
```

## Gate status

```text
Seven-day content calendar: Go - 7 future days (2026-06-24 to 2026-06-30)
Hook pool: Go - 30 hooks, 4 rotated on 2026-06-24, rotation across 4 themes + baseline safety
Video script pool: Go - 20 scripts, 2 rotated on 2026-06-24, all end on /love-test
Share caption pool: Go - 20 captions, 2 rotated on 2026-06-24, rotation across 4 themes + baseline safety
Social auto-posting: No-Go - manual publishing only
Stripe checkout execution: Not run
Paid smoke: No-Go - awaiting explicit approval
Production deploy: No-Go
Production Supabase / API mutation: No-Go
Secret / .env / token / credential access: No-Go - not performed
```

## Follow-up

- Manual operator selects one hook, one script, and one caption per publishing day from the pools, then clears the matching review checklist before publishing.
- Replace used entries from each pool rather than re-using to keep rotation fresh.
- Real KPI metrics are entered by the human operator after publish; analysis stays blocked until non-placeholder rows exist.
- Next content calendar refresh scheduled by the recurring `tianji-github-content-calendar` cron.

# 2026-06-23 - TianJi Love auto gate status (paid funnel, test-mode only)

## What changed

- Ran the `tianji-github-paid-gate` skill in AUTO mode against `origin/main` 4d2f6d8 on branch `chore/marketing-content-calendar-refresh-20260623`.
- Inspected checkout-readiness evidence at the source level only (no live Stripe, no `.env`, no secrets).
- Re-ran `node scripts/smoke-stripe-test-readiness.mjs` (non-strict). Exit 0; reports `Blocked` because masked Stripe test-mode env and Supabase staging env are still not supplied to this scheduled run.
- Classified Stripe / Supabase env presence without printing values; verified no `sk_live_` / `rk_live_` / `pk_live_` shape appears in `.ai/`, `.agents/skills/`, `.github/workflows/`, or `scripts/`.
- Generated `.ai/TIANJI_LOVE_GATE_STATUS_20260623.md` (NO-GO, with narrow test-mode smoke task draft prepared but not executed).
- No production deploy, no live Stripe call, no webhook replay, no Supabase mutation, no secret value printed.

## Validation

```text
git diff --check: Pass
node --check scripts/smoke-stripe-test-readiness.mjs: Pass
node scripts/smoke-stripe-test-readiness.mjs (non-strict): Pass, exit 0, Blocked
Targeted secret-shape scan over .ai/ .agents/skills/ .github/workflows/ scripts/: 0 hits (detection patterns only)
Live Stripe call: Not run
Production deploy: Not run
Supabase mutation: Not run
.env read/print: No
```

## Gate status

```text
Checkout readiness audit: Conditional Go
Test-mode smoke readiness: No-Go
Stripe test-mode boundary: Verified
Gate status: NO-GO
Next scheduled run: 2026-06-24 06:00 UTC
```

# 2026-06-23 - TianJi Love 7-day content calendar refresh + hook/script/caption pools (docs/assets-only)

## What changed

- Extended `assets/marketing/content-calendar-7day.md` from 5 future days (Jun 23–Jun 27) to 7 future days (Jun 23–Jun 29). Added Day 011 (Jun 28, "Understanding is not the same as acting", derived from the existing Day 011 publishing pack) and Day 012 (Jun 29, "Repair over replay", a fresh angle distinct from the Day 004–Day 011 series).
- Added a "Theme Rotation Notes" block to the calendar documenting how rotation avoids repeating one emotional angle (anxiety, urgency, chase) more than twice in any five-day window.
- Created `assets/marketing/love-test-next-30-hooks.md` (30 fresh hooks) covering the four core themes (what is he thinking, initiative in ambiguity, no-contact return, is it worth continuing) plus baseline safety (reflection, privacy, repair, calmer-not-dependent).
- Created `assets/marketing/love-test-next-20-video-scripts.md` (20 short-form video scripts, 15–45s each) using a shared template (Hook, Beat 1, Beat 2, CTA, Caption, Risk note) and ending on `/love-test`.
- Created `assets/marketing/love-test-next-20-share-captions.md` (20 share captions, ≤280 chars when trimmed) covering the same rotation.
- All copy stays grounded: no fake testimonials, fake numbers, fake revenue, fake accuracy, guaranteed outcomes, reunion promises, mind-reading claims, "act tonight" framing, "send this exact text" patterns, or identifying detail.
- No source code, no API route, no auth, no billing, no production deploy, no env, no secret, no platform account, no credentials touched.

## Validation

```text
git diff --check: Pass
git diff --cached --name-only: assets/marketing/content-calendar-7day.md, assets/marketing/love-test-next-30-hooks.md, assets/marketing/love-test-next-20-video-scripts.md, assets/marketing/love-test-next-20-share-captions.md
npm run typecheck: Not runnable in this partial-install environment (tsc not on PATH); changes are docs/assets-only (markdown), no TS source modified
npm run lint: Not runnable in this partial-install environment (next not on PATH); changes are docs/assets-only, no JS/TS source modified
Targeted secret-shape scan over changed files (.ai/, assets/marketing/, data/): Pass (no sk_, pk_, AKIA, ghp_, xox, private key, or password-shape matches)
```

## Gate status

```text
Seven-day content calendar: Go - 7 future days (Jun 23 - Jun 29)
Hook pool: Go - 30 hooks, rotation across 4 themes + baseline safety
Video script pool: Go - 20 scripts, 15-45s each, all end on /love-test
Share caption pool: Go - 20 captions, rotation across 4 themes + baseline safety
Social auto-posting: No-Go - manual publishing only
Stripe checkout execution: Not run
Paid smoke: No-Go - awaiting explicit approval
Production deploy: No-Go
Production Supabase / API mutation: No-Go
Secret / .env / token / credential access: No-Go - not performed
```

## Follow-up

- Manual operator selects one hook, one script, and one caption per publishing day from the pools, then clears the matching review checklist before publishing.
- Replace used entries from each pool rather than re-using to keep rotation fresh.
- Real KPI metrics are entered by the human operator after publish; analysis stays blocked until non-placeholder rows exist.

# 2026-06-23 - TianJi Love Day 011 marketing publishing pack (docs/assets/data-only)

## What changed

- Added `assets/marketing/daily/day-011-publishing-pack.md` for publishing date 2026-06-28.
- Theme: "Understanding a pattern is not the same as acting on it tonight." This adds a fresh angle distinct from the Day 004-Day 010 series, separating pattern recognition from immediate action and reusing the AI-as-reflection positioning from the 2026-06-19 demand-mining brief.
- Added `assets/marketing/daily/day-011-review-checklist.md` covering content safety, publishing gate, and KPI/revenue gate, with extra reminders to reject "text them now", "act tonight", or pressure framing.
- Added `data/love-test-day-011-kpi-entry.csv` with placeholder zero rows for the five planned posts (TikTok, Instagram Reels, YouTube Shorts, reflection carousel, trust note).
- No source code, no API route, no auth, no billing, no production deploy, no env, no secret, no platform account, no credentials touched.

## Validation

```text
git diff --check: Pass
git diff --cached --name-only: assets/marketing/daily/day-011-publishing-pack.md, assets/marketing/daily/day-011-review-checklist.md, data/love-test-day-011-kpi-entry.csv
npm run typecheck: Not runnable in this partial-install environment; changes are docs/assets/data-only (markdown + CSV), no TS source modified
npm run lint: Not runnable in this partial-install environment; changes are docs/assets/data-only, no JS/TS source modified
Targeted secret-shape scan over new files: Pass (no sk_, pk_, AKIA, ghp_, xox, private key, or password-shape matches)
```

## Gate status

```text
Daily growth publishing pack: Go
Manual review checklist: Go
KPI entry scaffold: Go
Social auto-posting: No-Go - manual publishing only
Stripe checkout execution: Not run
Paid smoke: No-Go - awaiting explicit approval
Production deploy: No-Go
Production Supabase / API mutation: No-Go
Secret / .env / token / credential access: No-Go - not performed
```

## Follow-up

- Manual operator publishes Day 011 pack only after clearing the Day 011 review checklist.
- Real KPI metrics are entered by the human operator after publish; analysis stays blocked until non-placeholder rows exist.
- A publishing queue CSV/JSON for Day 011 can be added in a separate docs/assets-only commit if needed.

# 2026-06-08 - TianJi Love auth premium baseline mainline integration

## What changed

- Created clean mainline branch `feat/tianji-love-auth-premium-mainline-20260608` from `origin/main`.
- Integrated the auth-ready premium Love report baseline from `e45891a` without merging unrelated dirty workspace files.
- Preserved current mainline pricing/page structure while routing the pricing secondary CTA into `/relationship/new`.
- Restored launch-visible relationship result copy from mojibake to readable text.
- Updated `/relationship/new` to default to English for the Western funnel, preserve `?lang=zh`, and wrap the client search-param reader in `Suspense` for production build.
- Added `report-entitlement` helper required by the premium report generator.

## Validation

```text
npm run typecheck: Pass
npm run lint: Pass, Next lint deprecation warning only
npm run test -- --run love report/share/world-class contract tests: Pass, 6 files / 18 tests
npm run test: Pass, 60 files / 522 tests
npm run build: Pass, existing Edge runtime static-generation warning only
npm run audit:routes: Pass
npm run audit:copy: Pass
npm run audit:share: Pass
npm run audit:upgrade: Pass
npm run audit:auth-env-readiness: No-Go, required masked staging env evidence missing
```

## Gate status

```text
Source readiness: Go
Mainline PR readiness: Go
Static/build readiness: Go
Staging auth env readiness: No-Go until masked env presence is provided
Production deploy: Not run
Stripe checkout: Not run
Paid smoke: No-Go
Secrets printed: No
```

# 2026-05-27 - TianJi Love Auth Login System Cloud Readiness

## What changed

- Prepared an isolated Auth/login branch from `origin/main` for the cloud-server login failure where production exposed Google OAuth with an empty `client_id`.
- Moved NextAuth provider construction into `src/lib/auth-options.ts`, exposing Google only when both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are configured.
- Added optional Resend Magic Link provider readiness behind database, Resend, sender, and send-enabled guards.
- Replaced middleware's `auth()` wrapper with an Edge-safe `getToken` check so middleware does not import Node/Postgres auth adapter code.
- Added same-origin auth redirect helpers for proxy/local host handling.
- Updated `/login` to query `getProviders()` and only show configured sign-in methods.
- Added masked auth env readiness audit and focused Auth/middleware contract tests.

## Validation

```text
npm ci --ignore-scripts --no-audit --prefer-offline: Pass
npm run test -- --run src/__tests__/lib/auth-origin.test.ts src/__tests__/lib/auth-options.test.ts src/__tests__/middleware-edge-boundary.test.ts: Pass, 3 files / 10 tests
npm run typecheck -- --pretty false: Pass
npm run lint: Pass, Next lint deprecation warning only
npm run audit:auth-env-readiness with dummy masked staging values: Pass / Google OAuth readiness Go
npm run build: Pass, existing jose/NextAuth Edge runtime warnings only
npm run test: Pass, 52 files / 490 tests
npm run audit:routes: Pass
npm run audit:copy: Pass
npm run audit:share: Pass
npm run audit:upgrade: Pass
git diff --check: Pass, CRLF working-copy warnings only
local next start smoke with only AUTH_SECRET: /api/auth/providers returned {}
```

## Gate status

```text
Auth code readiness: Go
Provider readiness gating: Go
Middleware Edge boundary: Go
Build/test/audits: Go
Cloud env readiness: Conditional Go - server must provide real OAuth/env values
Cloud deploy: Not run
Paid smoke: No-Go / Not in scope
Payment/Stripe/Supabase changes: Not in scope
Secrets printed: No
```

## Follow-up

- Cloud server still needs real `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET` or `NEXTAUTH_SECRET`, `NEXTAUTH_URL=https://tianji.love`, `AUTH_URL=https://tianji.love`, and `NEXT_PUBLIC_APP_URL=https://tianji.love`.
- Google Console must allow `https://tianji.love/api/auth/callback/google`.
- Deploy requires GitHub Actions `Deploy US Server` or working SSH access; local SSH to `deploy@186.244.244.81` is still denied.

# AI Changelog

## 2026-05-26 - TianJi Love relationship Pretext layout merge readiness

### What changed

Prepared the Relationship result Pretext layout stabilization as a narrow merge-ready slice. The client hook observes rendered text width, measures headline, summary, next move, locked body, and dimension summaries with `@chenglou/pretext`, and applies stable `minHeight` values with a safe fallback when measurement is unavailable.

### Scope control

Kept the PR line separate from payment closed-loop work. Ask, Draw, payment routes, Auth, API behavior, Supabase, Stripe, env files, deployment config, social workflows, and public share privacy behavior were not changed for this task.

### Validation

On the isolated PR branch from `origin/main`, `npm run test -- --run src/__tests__/relationship-flow-contract.test.ts` passed 4/4. `npm run typecheck -- --pretty false`, `npm run lint`, `npm run build`, full `npm run test` (49 files / 480 tests), `npm run audit:routes`, `npm run audit:copy`, `npm run audit:share`, `npm run audit:upgrade`, `python -m json.tool .ai/AUTOPILOT_STATUS.json`, `yihui_validate_light`, and `git diff --check` passed. Earlier pre-isolation validation on the source branch passed 74 files / 596 tests.

### Visual QA

Desktop `scrollWidth=1365`, `clientWidth=1365`, no horizontal overflow. Mobile `scrollWidth=390`, `clientWidth=390`, no horizontal overflow. Mobile measured min-heights were headline `140px`, summary `112px`, next move `56px`, locked body `112px`.

### Known noise

Existing `/api/analytics/relationship` 503 appeared during local smoke. No pageerror was observed and this does not point to Pretext.

## 2026-05-25 - TianJi Love prelaunch paid funnel hardening

### What changed

Created a clean worktree from latest `origin/main` after confirming PR #63 content is already present in repository truth. Added the exact checkout-start analytics event, Relationship UUID checkout guard, safe blocked relationship analytics, webhook metadata validation, readiness-script app-side checks, focused tests, and final prelaunch Go/No-Go evidence docs.

### Files changed

```text
src/lib/analytics/funnel-events.ts
src/lib/analytics/client.ts
src/lib/analytics/relationship-events.ts
src/lib/trust-copy-guard.ts
src/lib/reading-id.ts
src/lib/stripe-checkout-metadata.ts
src/lib/relationship-reading-store.ts
src/components/divination/DivinationEvidenceCard.tsx
src/components/relationship/RelationshipResult.tsx
src/app/(main)/ask/page.tsx
src/app/(main)/draw/page.tsx
src/app/api/analytics/relationship/route.ts
src/app/api/checkout/route.ts
src/app/api/stripe/webhook/route.ts
scripts/smoke-stripe-test-readiness.mjs
src/__tests__/prelaunch-paid-funnel-contract.test.ts
.ai/TIANJI_LOVE_PRELAUNCH_PAID_FUNNEL_FIX_20260525.md
.ai/TIANJI_LOVE_PRELAUNCH_GO_NO_GO_20260525.md
.ai/CHANGELOG_AI.md
.ai/REVIEW_PACKET.md
```

### Validation

```text
gh pr view 63: Blocked locally - gh unauthenticated
Repository truth for PR #63: Go - origin/main contains 6bbcc22 via 3b8be51
npm ci --ignore-scripts --no-audit --prefer-offline: Pass
Targeted tests: Pass, 4 files / 19 tests
npm run typecheck: Pass
npm run lint: Pass, Next.js lint deprecation warning only
npm run test: Pass, 49 files / 479 tests
npm run build: Pass, existing jose Edge Runtime warnings only
npm run audit:routes: Pass
npm run audit:copy: Pass
npm run audit:share: Pass
npm run audit:upgrade: Pass
npm run smoke:stripe:test-readiness: Pass command exit, reports Blocked because test env is missing
npm run smoke:stripe:test-readiness -- --strict: Blocked as expected because Stripe/Supabase test env is missing
Puppeteer Browser QA on /ask, /draw, /tarot, /relationship/new: Pass
```

### Gate status

```text
PR #63 merged: Go
checkout_start_from_free_preview implemented: Go
Ask checkout-start analytics: Go
Draw checkout-start analytics: Go
Relationship checkout-start analytics: Go
Relationship UUID guard: Go
Relationship rel_* fallback blocked: Go
Webhook metadata validation: Go
Entitlement readiness: Partial
Stripe test env readiness: Blocked
Supabase staging UUID persistence: Blocked
Strict readiness: Blocked
Typecheck: Go
Lint: Go
Tests: Go
Build: Go
Audits: Go
Browser QA: Go
Production deploy: Not run
Stripe live mode: Not run
Paid smoke: No-Go unless test-mode checkout actually ran
Secrets printed: No
Formal traffic / Day 1 publishing: No-Go unless paid smoke Go
```

### Follow-up

- Configure masked Stripe test-mode env.
- Configure Supabase staging persistence and prove Relationship UUID readings.
- Run strict readiness and real test-mode paid smoke for Relationship, Ask, and Draw.
- Keep production deploy and Day 1 formal traffic blocked until paid smoke is Go.

## 2026-05-25 - TianJi Love paid funnel test readiness after evidence layer

### What changed

Merged PR #62 first, then created an isolated readiness worktree from latest `origin/main`. Added a safe Stripe test-readiness script and evidence docs for Ask, Draw, and Relationship paid funnel readiness without running live Stripe, production deploy, real `.env` reads, paid checkout, or webhook replay.

### Files changed

```text
package.json
scripts/smoke-stripe-test-readiness.mjs
.ai/TIANJI_LOVE_PAID_FUNNEL_TEST_READINESS_20260525.md
.ai/TIANJI_LOVE_PAID_FUNNEL_SMOKE_PLAN_20260525.md
.ai/CHANGELOG_AI.md
.ai/REVIEW_PACKET.md
```

### Validation

```text
GitHub connector merge PR #62: Pass, merged sha 271dcd84bbed5b47ecea40b628685a66d34bd954
node --check scripts/smoke-stripe-test-readiness.mjs: Pass
npm run smoke:stripe:test-readiness: Pass, reports Blocked because test env is missing
npm ci --ignore-scripts --no-audit --no-fund: Pass
npm run typecheck: Pass
npm run lint: Pass, Next.js lint deprecation warning only
npm run test: Pass, 48 files / 473 tests
npm run build: Pass, jose Edge Runtime warnings only
npm run audit:routes: Pass
npm run audit:copy: Pass
npm run audit:share: Pass
npm run audit:upgrade: Pass
Puppeteer non-paid browser QA on /ask, /draw, /relationship/new: Pass
```

### Gate status

```text
PR #62 merged: Go
Ask evidence/CTA/checkout-start readiness: Go static, paid completion Blocked
Draw evidence/CTA/checkout-start readiness: Go static, paid completion Blocked
Relationship evidence/CTA/checkout-start readiness: Go static, paid completion Blocked
Stripe test env readiness: Blocked
Webhook/entitlement test-mode: Not run
Analytics privacy: Go
Production deploy: Not run
Stripe live mode: Not run
Secrets printed: No
```

### Follow-up

- Provide masked Stripe test-mode env and run `npm run smoke:stripe:test-readiness -- --strict`.
- Prove Relationship persists a UUID reading in Supabase staging before checkout.
- Run Stripe test-mode checkout/webhook/entitlement smoke in a narrow follow-up PR.
- Keep Day 1 formal traffic blocked until test-mode paid funnel passes.

## 2026-05-25 - TianJi Love Divination Evidence Layer clean narrow PR

### What changed

Recreated the TianJi Love Divination Evidence Layer from latest `origin/main` on a clean worktree branch, avoiding PR #60's broad 53-commit / 325-file diff. The clean branch reapplies only the Evidence Layer implementation, its direct Ask/Draw/Relationship dependencies, focused tests, local QA evidence, required docs, and four referenced Tianji Love visual assets.

### Branch

```text
Branch: feat/tianji-divination-evidence-layer-clean-20260525
Base: origin/main cb12208
Old PR #60: Not merged
Old source commit referenced: 7333e68fbd3e0891051deb8cd2b420d2557f4dda
Changed files before docs append: 47
Production deploy: Not run
Paid smoke: No-Go
```

### Validation

```text
npm run typecheck: Pass
npm run lint: Pass
focused Evidence/Ask/Draw/Relationship tests: Pass, 5 files / 24 tests
npm run test: Pass, 48 files / 473 tests
npm run build: Pass
npm run audit:routes: Pass
npm run audit:copy: Pass
npm run audit:share: Pass
npm run audit:upgrade: Pass
git diff --check: Pass, CRLF warnings only
targeted secret scan over changed files: Pass
```

### Local QA

```text
/ask?lang=en: Go
/draw?lang=en: Go
/relationship/new?lang=en: Go
Evidence card: Go
Feedback event trigger: Go
Analytics private sentinel leakage: 0 detected
Mobile horizontal overflow: 0 detected
```

### Gate status

```text
Divination Evidence Layer implementation: Go
Clean narrow PR recreation: Go
Non-paid local QA: Go
Paid smoke: No-Go - not approved / not run
Production deploy: No-Go
Secrets printed: No
```

## 2026-05-25 - TianJi Love post-merge artifact review and Day 1 publishing packet

### What changed

Completed the post-merge quality loop after PR #58. Verified the conversion suggestions workflow runtime on `main`, recorded artifact availability, reviewed the publishing/conversion assets, created a polished Day 1 manual publishing packet, and created the next conversion implementation backlog.

### Runtime status

```text
PR #58 merged: Go
Merge commit: 5b9a3e53fec905efe675b8f856c108e7263e9cec
Vercel: Go
Workflow present on main: Go
TianJi Love Conversion Suggestions: Go
Conversion Suggestions run: 26374543902
Conversion Suggestions artifact: tianji-love-conversion-suggestions / 7188891555
Artifact body download: Blocked locally - GitHub auth required
```

### Artifact quality

```text
KPI Analysis quality: C
Daily Growth quality: B
Content Calendar quality: B
Conversion Suggestions quality: B
```

Scores are conservative because artifact zip body download requires authenticated GitHub access in this shell. Review used verified metadata, merged prompt contracts, checked-in publishing assets, and local conversion backlog.

### Outputs

```text
.ai/TIANJI_LOVE_ARTIFACT_REVIEW_20260525.md: Created
.ai/TIANJI_LOVE_DAY1_PUBLISHING_PACKET_20260525.md: Created
.ai/TIANJI_LOVE_NEXT_CONVERSION_BACKLOG_20260525.md: Created
```

### Gate status

```text
MiniMax draft pipeline: Go
Manual publishing pack: Go
Conversion backlog: Go
Artifact review: Go
Day 1 publishing packet: Go
Social auto-posting: No-Go
Production deploy: Not run
Stripe checkout: Not run
Paid smoke: No-Go
Secrets printed: No
```

### Follow-up

- Manually publish the Day 1 Xiaohongshu post only after final human review in the platform editor.
- Track profile visits, website clicks, comments, and paid-intent signals in `.ai/publishing/publish-checklist.md`.
- Download artifact bodies with authenticated GitHub access and update scores if the actual generated content differs.
- Next implementation task should be the P0 evidence layer / 准感 system plus funnel analytics, not another workflow expansion.

## 2026-05-25 - TianJi Love publishing pack and conversion backlog

### What changed

Turned the verified MiniMax growth pipeline state into draft-only manual publishing assets and an implementation-ready conversion backlog. The publishing pack was created from the approved TianJi Love growth direction and safety rules because artifact body download is still blocked by unauthenticated GitHub artifact access in this local shell.

### Runtime state

```text
KPI Analysis workflow: Go
Daily Growth workflow: Go
Content Calendar workflow: Go
Conversion Suggestions workflow: Pending runtime after merge
Artifacts downloaded: No - artifact metadata verified, body download blocked by GitHub auth
```

### Artifact quality

```text
KPI Analysis quality: Pending artifact body review
Daily Growth quality: Pending artifact body review
Content Calendar quality: Pending artifact body review
Conversion Suggestions quality: Pending runtime and artifact body review
```

### Publishing pack

```text
Xiaohongshu posts: Created
Douyin scripts: Created
WeChat Video scripts: Created
Publish checklist: Created
Conversion backlog: Created
Source artifact status note: Created
```

### Gate status

```text
MiniMax draft pipeline: Go
Manual publishing pack: Go - draft only
Conversion backlog: Go - draft only
Social auto-posting: No-Go
Production deploy: Not run
Stripe checkout: Not run
Paid smoke: No-Go
Secrets printed: No
```

### Follow-up

- Merge `28e7aff feat(marketing): add TianJi Love conversion suggestions artifact` to `main`.
- Run `TianJi Love Conversion Suggestions` on `main`.
- Download four artifacts with authenticated GitHub access and replace the source-artifact status note with reviewed copies.
- Score each artifact A/B/C/D before posting.
- Manually publish one Xiaohongshu draft first, track clicks and paid intent, then choose one P0 CTA implementation task.

## 2026-05-25 - TianJi Love MiniMax growth pipeline verification and conversion suggestions

### What changed

Verified the latest MiniMax-backed TianJi Love growth workflow runs on `main` through public GitHub Actions metadata, confirmed all three expected artifacts were uploaded, tightened growth prompts toward publishable Chinese short-form content and revenue CTAs, and added a draft-only conversion suggestions generator/workflow.

### Runtime verification

```text
MiniMax API Smoke: Go
TianJi Love KPI Analysis: Go
TianJi Love Daily Growth: Go
TianJi Love Content Calendar: Go
Artifacts uploaded: Yes

KPI Analysis run: 26361421145
Daily Growth run: 26361417380
Content Calendar run: 26361415667

KPI Analysis artifact: tianji-love-kpi-analysis / 7185793229
Daily Growth artifact: tianji-love-daily-growth / 7185824316
Content Calendar artifact: tianji-love-content-calendar / 7185823452
```

### Content quality review

```text
KPI Analysis artifact quality: Blocked - artifact zip download requires authenticated GitHub access in this local shell
Daily Growth artifact quality: Blocked - artifact zip download requires authenticated GitHub access in this local shell
Content Calendar artifact quality: Blocked - artifact zip download requires authenticated GitHub access in this local shell
```

Because artifact body download was blocked, prompts were proactively improved to require stronger CTA, clearer product entry, Chinese short-video hooks, less generic advice, no fake data, no guaranteed outcomes, and a direct monetization angle.

### Conversion suggestion artifact

```text
Added script: scripts/tianji-love/generate-conversion-suggestions.mjs
Added npm script: tianji:conversion-suggestions
Added workflow: .github/workflows/tianji-love-conversion-suggestions.yml
Output: .ai/generated/tianji-love-conversion-suggestions.md
Auto code changes: Not run
```

### Validation

```text
node --check scripts/ai/minimax-chat.mjs: Pass
node --check scripts/tianji-love/generate-content-calendar.mjs: Pass
node --check scripts/tianji-love/generate-daily-growth.mjs: Pass
node --check scripts/tianji-love/generate-kpi-analysis.mjs: Pass
node --check scripts/tianji-love/generate-conversion-suggestions.mjs: Pass
package.json parse: Pass
YAML parse for tianji-love workflows: Pass
git diff --check: Pass
Targeted secret-shape scan: Pass - only intentional redaction regex matched
```

### Gate status

```text
MiniMax API runtime: Go
TianJi Love draft pipeline: Go
OpenAI API runtime: Bypassed
Codex Action dependency in TianJi workflows: Removed
Production deploy: Not run
Stripe checkout: Not run
Paid smoke: No-Go
Social auto-posting: No-Go
Secrets printed: No
```

### Follow-up

- Authenticate GitHub CLI or use GitHub UI to download artifact zips and complete A/B/C/D body quality scoring.
- If all artifacts are A/B, begin manual content publishing.
- If artifacts are C/D, continue prompt tuning before publishing.
- After the conversion suggestions workflow is merged and run, turn the top 3 suggestions into implementation PRs.

## 2026-05-24 - TianJi Love GitHub automation skill stack

- Task ID: 20260524-tianji-github-marketing-automation-skills
- Files changed: `.agents/skills/tianji-github-daily-growth-skill/SKILL.md`, `.agents/skills/tianji-github-kpi-analysis-skill/SKILL.md`, `.agents/skills/tianji-github-content-calendar-skill/SKILL.md`, `.agents/skills/tianji-github-funnel-optimizer-skill/SKILL.md`, `.agents/skills/tianji-github-paid-gate-skill/SKILL.md`, `.agents/skills/tianji-github-safe-publisher-bridge-skill/SKILL.md`, `.github/workflows/tianji-love-daily-growth.yml`, `.github/workflows/tianji-love-kpi-analysis.yml`, `.github/workflows/tianji-love-content-calendar.yml`, `.github/workflows/tianji-love-safety-audit.yml`, `.ai/TIANJI_LOVE_GITHUB_AUTOMATION_SKILL_STACK.md`, `.ai/TIANJI_LOVE_GITHUB_ACTIONS_SECURITY_RULES.md`, `.ai/CHANGELOG_AI.md`, `.ai/REVIEW_PACKET.md`.
- Summary: Added a safe GitHub automation skill stack for TianJi Love marketing operations. The stack covers daily publishing packs, KPI analysis, seven-day calendar maintenance, funnel copy optimization, payment gate reminders, and credential-free publisher bridge preparation.
- Workflow summary: Added four GitHub workflow templates with minimal permissions, path guards, validation commands, and targeted secret-shape scans. Commit-capable workflows use `contents: write` only for generated docs/assets/data. The safety audit workflow uses `contents: read`.
- Gates: Social auto-posting remains No-Go. Stripe checkout execution was not run. Paid smoke remains No-Go pending exact approval phrase. Production deploy remains No-Go.
- Validation: `npm run typecheck` passed. `npm run lint` passed with the existing Next.js deprecation notice. `git diff --check` passed. Workflow YAML parsed with PyYAML. All six new skills passed `quick_validate.py`; the paid-gate skill required `PYTHONUTF8=1` because it includes the exact Chinese approval phrase. Refined targeted secret-shape scan over `.agents/skills/`, `.github/workflows/`, `.ai/`, `assets/marketing/`, and `data/` returned no matches. Workflow trigger/permission scan returned no forbidden YAML entries.

## TianJi Love GitHub Actions Codex Input Fix - 2026-05-24

### What changed

Fixed invalid Codex Action input from `openai_api_key` to `openai-api-key` in the TianJi Love Daily Growth, KPI Analysis, and Content Calendar workflows. Also fixed the same invalid input in the existing Codex self-evolution, self-upgrade, and relationship evolution workflows so the repository-wide workflow scan has zero `openai_api_key` matches.

### Failure reason

GitHub Actions failed because `openai/codex-action@v1` does not accept `openai_api_key`; the action expects `openai-api-key`.

### Validation result

`git status --short` showed only the intended workflow and AI evidence files. `rg -n "openai_api_key" .github/workflows` returned zero matches. `rg -n "openai-api-key" .github/workflows` returned the six Codex Action call sites. `git diff --check` passed. Workflow YAML parsed successfully for all 11 workflow files. Refined targeted secret-shape scan over changed workflow and AI evidence files passed.

### Gate status

```text
Content Calendar workflow input fix: Go
Daily Growth workflow input fix: Go
KPI Analysis workflow input fix: Go
Existing Codex workflow input fix: Go
Safety Audit workflow: Not changed - no Codex Action input
Secrets printed: No
Production deploy: Not run
Stripe checkout: Not run
Paid smoke: No-Go
```

### Follow-up

Re-run `TianJi Love Content Calendar` manually on branch `main` after this fix is merged.

## 2026-05-24 - GitHub Actions Codex input fix merge/runtime verification

### What changed

Merged and verified branch:

`fix/tianji-github-actions-codex-input-20260524`

PR: `https://github.com/yihui315/tianji-global/pull/50`

Merge commit: `43a1ceac882b6bbb623d5cd6953593e4160fe65b`

Fixed Codex Action input from `openai_api_key` to `openai-api-key`.

### Files verified

- `.github/workflows/codex-self-evolution.yml`
- `.github/workflows/codex-self-upgrade.yml`
- `.github/workflows/relationship-ab-evolution.yml`
- `.github/workflows/tianji-love-content-calendar.yml`
- `.github/workflows/tianji-love-daily-growth.yml`
- `.github/workflows/tianji-love-kpi-analysis.yml`

### Validation

```text
PR check CI/CD: Pass
openai_api_key in .github/workflows: 0 matches
openai-api-key in .github/workflows: 6 matches
git diff --check: Pass
Workflow YAML parse: Pass
Secret-shape scan: Pass
Secrets printed: No
```

### Runtime verification

```text
OPENAI_API_KEY repo secret: Unknown by direct listing; prior failed runs showed masked input value, so likely present
Workflow dispatch permission from local gh/API: Blocked - gh CLI not authenticated and unauthenticated REST dispatch returned 401

TianJi Love Content Calendar: Blocked for new main rerun; previous pre-fix run failed on openai_api_key at 91d1049
TianJi Love Daily Growth: Blocked for new main rerun; previous pre-fix run failed on openai_api_key at 91d1049
TianJi Love KPI Analysis: Blocked for new main rerun; no main run found and dispatch auth is unavailable
```

### Gate status

```text
Codex Action input fix: Go
PR merge: Go
Content Calendar rerun: Blocked - workflow_dispatch requires authenticated GitHub CLI/API
Daily Growth rerun: Blocked - workflow_dispatch requires authenticated GitHub CLI/API
KPI Analysis rerun: Blocked - workflow_dispatch requires authenticated GitHub CLI/API
Production deploy: Not run
Stripe checkout: Not run
Paid smoke: No-Go
Social auto-posting: No-Go
Secrets printed: No
```

### Follow-up

- Revoke/rotate previously pasted GitHub token.
- Authenticate `gh` with `repo,workflow` scope or trigger the three workflows from the GitHub Actions UI on `main`.
- If `OPENAI_API_KEY` is missing or invalid after an authenticated rerun, configure the repo secret without printing it.
- If the Node.js 20 warning becomes blocking, upgrade affected action/runtime in a separate workflow maintenance task.

## 2026-05-24 - TianJi Love Actions runtime rerun after Codex input fix

### What changed

Triggered authenticated workflow_dispatch runs on `main` after the Codex Action input fix was merged.

Local `gh` authentication remained unavailable, so runtime dispatch was completed through the GitHub Actions UI. GitHub connector logs were then inspected without printing secret values.

### Main commits verified

```text
Input fix merge commit: 43a1cea
Runtime verification docs merge commit: 608c476
```

### Runs inspected

```text
TianJi Love Content Calendar run: 26357694312
TianJi Love Daily Growth run: 26357686684
TianJi Love KPI Analysis run: 26357691510
```

### Commands run

```text
gh auth status
gh auth login -h github.com --web --scopes repo,workflow
gh auth login -h github.com --web --clipboard --scopes repo,workflow
git -c safe.directory=* status --short --branch
git -c safe.directory=* log --oneline -5
rg -n "openai_api_key" .github/workflows
rg -n "openai-api-key" .github/workflows
GitHub Actions UI workflow_dispatch on main
GitHub connector fetch workflow job steps/logs
```

### Validation

```text
openai_api_key in .github/workflows: 0 matches
openai-api-key in .github/workflows: 6 matches
Secrets printed: No
```

### Runtime verification

```text
TianJi Love Content Calendar: Fail - Codex Action reached OpenAI runtime but received 401 invalid_api_key
TianJi Love Daily Growth: Fail - Codex Action reached OpenAI runtime but received 401 invalid_api_key
TianJi Love KPI Analysis: Fail - Codex Action reached OpenAI runtime but received 401 invalid_api_key
OPENAI_API_KEY repo secret: Present but invalid or unauthorized
Node.js 20 warning: Warning only
```

### Gate status

```text
Codex Action input fix: Go
Workflow templates on main: Go
Authenticated workflow_dispatch: Go via GitHub UI
Local gh workflow_dispatch: No-Go - gh CLI not authenticated
Content Calendar runtime: No-Go - invalid OpenAI API key
Daily Growth runtime: No-Go - invalid OpenAI API key
KPI Analysis runtime: No-Go - invalid OpenAI API key
Production deploy: Not run
Stripe checkout: Not run
Paid smoke: No-Go
Social auto-posting: No-Go
Secrets printed: No
GitHub token rotation: Owner action required
```

### Follow-up

- Revoke/rotate the previously pasted GitHub token.
- Replace or rotate the `OPENAI_API_KEY` repository secret without printing it.
- Re-run the three TianJi Love workflows on `main` after the secret is replaced.
- Treat the Node.js 20 warning as non-blocking unless it becomes the failing step.

## 2026-05-24 - TianJi Love workflows switched to MiniMax artifact generation

### What changed

Replaced the three TianJi Love growth/KPI workflows with project-local MiniMax Chat Completions scripts. The workflows no longer call `openai/codex-action@v1`, no longer read `OPENAI_API_KEY`, and now upload generated Markdown drafts as GitHub Actions artifacts instead of auto-committing generated content.

MiniMax API contract checked against the official compatible OpenAI text chat docs:

```text
Endpoint: POST /v1/chat/completions
Default base URL: https://api.minimaxi.com/v1
Token Plan URL source: MiniMax M2.7 OpenAI-compatible Token Plan docs
Default model: MiniMax-M2.7
Token limit field: max_completion_tokens
```

### Files changed

```text
.github/workflows/tianji-love-content-calendar.yml
.github/workflows/tianji-love-daily-growth.yml
.github/workflows/tianji-love-kpi-analysis.yml
package.json
scripts/ai/minimax-chat.mjs
scripts/tianji-love/generate-content-calendar.mjs
scripts/tianji-love/generate-daily-growth.mjs
scripts/tianji-love/generate-kpi-analysis.mjs
.ai/CHANGELOG_AI.md
.ai/REVIEW_PACKET.md
```

### Validation

```text
node --check scripts/ai/minimax-chat.mjs: Pass
node --check scripts/tianji-love/generate-content-calendar.mjs: Pass
node --check scripts/tianji-love/generate-daily-growth.mjs: Pass
node --check scripts/tianji-love/generate-kpi-analysis.mjs: Pass
package.json parse: Pass
npm ci: Timed out locally after 10 minutes
npm ci --ignore-scripts --no-audit --no-fund: Pass
npm run typecheck: Pass
npm run lint: Pass
git diff --check: Pass
TianJi Love workflow YAML parse: Pass
TianJi Love workflows openai/codex-action or OPENAI_API_KEY matches: 0
Targeted secret-shape scan: Pass
```

### Runtime verification

```text
npm run tianji:content-calendar: Blocked locally - MINIMAX_API_KEY is missing
npm run tianji:daily-growth: Blocked locally - MINIMAX_API_KEY is missing
npm run tianji:kpi-analysis: Blocked locally - MINIMAX_API_KEY is missing
```

The missing-key behavior is fail-closed and did not print any secret value.

### Gate status

```text
OpenAI Codex Action dependency removed from TianJi Love workflows: Go
MiniMax artifact workflow templates: Go
Workflow permissions: contents: read
Auto-commit generated content: Removed
Runtime with MiniMax secret: Pending owner configuration
Social auto-posting: No-Go
Production deploy: Not run
Stripe checkout: Not run
Paid smoke: No-Go
Secrets printed: No
GitHub token rotation: Owner action required
```

### Follow-up

- Configure `MINIMAX_API_KEY`, `MINIMAX_BASE_URL`, and `MINIMAX_MODEL` as GitHub Actions repository secrets.
- Re-run the three TianJi Love workflows on `main` after merge and secret configuration.
- Revoke/rotate the previously pasted GitHub token.

## 2026-05-24 - TianJi Love MiniMax workflow runtime verification

### What changed

Verified the MiniMax-backed TianJi Love workflow runtime on `main` after PR #53 merged and MiniMax GitHub Actions secrets were configured.

### Main commit

```text
95f354a fix(actions): run TianJi growth workflows on MiniMax API
```

### Runtime verification

```text
TianJi Love Content Calendar run: 26361415667
TianJi Love Daily Growth run: 26361417380
TianJi Love KPI Analysis run: 26361421145

TianJi Love Content Calendar: Fail - MiniMax HTTP 429 rate_limit_error
TianJi Love Daily Growth: Fail - MiniMax HTTP 429 rate_limit_error
TianJi Love KPI Analysis: Fail - MiniMax HTTP 429 rate_limit_error
Expected artifacts uploaded: No
MiniMax API runtime: No-Go - quota/rate limit
```

The workflow reached the MiniMax API with masked `MINIMAX_*` values. The failure message reported a 5-hour Token Plan Plus usage limit and a reset at `2026-05-25T00:00:00+08:00`.

### Gate status

```text
MiniMax GitHub Secrets: Go
TianJi workflow MiniMax migration: Go
OpenAI API runtime: Bypassed
Codex Action dependency in TianJi workflows: Removed
Content Calendar runtime: No-Go - MiniMax quota/rate limit
Daily Growth runtime: No-Go - MiniMax quota/rate limit
KPI Analysis runtime: No-Go - MiniMax quota/rate limit
Production deploy: Not run
Stripe checkout: Not run
Paid smoke: No-Go
Social auto-posting: No-Go
Secrets printed: No
```

### Follow-up

- Retry after the MiniMax quota reset time.
- If 429 persists after reset, verify the MiniMax token plan or choose a model/plan with available quota.
- Keep generated marketing output in artifact review mode; do not enable social auto-posting.

## 2026-05-24 - TianJi Love MiniMax Token Plan default alignment

### What changed

Aligned the TianJi Love MiniMax growth script default Base URL with the MiniMax M2.7 Token Plan OpenAI-compatible docs.

```text
Default base URL: https://api.minimaxi.com/v1
Default model: MiniMax-M2.7
Endpoint: POST /v1/chat/completions
Token limit field: max_completion_tokens
```

### Runtime interpretation

The prior GitHub Actions failures reached the MiniMax Token Plan API and returned `HTTP 429 rate_limit_error`. This confirms the request path is past npm install, env mapping, and auth shape; the remaining runtime blocker is Token Plan quota/usage availability, not Node.js 20.

### Gate status

```text
MiniMax M2.7 Token Plan API config: Go
Default Base URL alignment: Go
MiniMax runtime: No-Go - prior run blocked by 429 quota/rate limit
Production deploy: Not run
Stripe checkout: Not run
Paid smoke: No-Go
Social auto-posting: No-Go
Secrets printed: No
```

## 2026-05-24 - MiniMax API smoke workflow

### What changed

Added a manual-only GitHub Actions workflow to verify the minimal MiniMax API path from GitHub Actions without running TianJi Love growth jobs.

```text
Workflow: MiniMax API Smoke
Trigger: workflow_dispatch only
Endpoint: POST /chat/completions under MINIMAX_BASE_URL
Prompt: Reply with exactly: OK
temperature: 0
max_completion_tokens: 20
```

### Validation

```text
node --check scripts/ai/minimax-chat.mjs: Pass
YAML parse: Pass
git diff --check: Pass
Targeted secret-shape scan: Pass
Live MiniMax API call: Not run locally
```

### Gate status

```text
MiniMax API smoke workflow: Prepared
Production deploy: Not run
Stripe checkout: Not run
Paid smoke: No-Go
Social auto-posting: No-Go
Secrets printed: No
```

### Follow-up

- Merge this workflow to `main`.
- Manually run `MiniMax API Smoke` on `main`.
- If smoke passes, run only `TianJi Love KPI Analysis` next.

# 2026-06-24 - TianJi Love Day 012 daily growth publishing pack

## What changed

Ran the `tianji-github-daily-growth` skill on branch `chore/marketing-content-calendar-refresh-20260623` to prepare Day 012 manual content assets only. No auto-posting, no live Stripe, no Supabase mutation, no production deploy, and no `.env` access.

```text
Pack: assets/marketing/daily/day-012-publishing-pack.md
Checklist: assets/marketing/daily/day-012-review-checklist.md
KPI scaffold: data/love-test-day-012-kpi-entry.csv
Theme: Repair over replay
Publishing date: 2026-06-29
Channel mix: 2 TikTok, 1 Instagram Reels, 1 reflection carousel, 1 SEO outline
Hook source: content-calendar-7day.md Day 012 row + love-test-next-30-hooks.md T3 #28
```

## Validation

```text
git status: clean worktree before write, 3 new files staged explicitly
git diff --check: Pass
Targeted secret-shape scan over .agents/skills/ .github/workflows/ .ai/ assets/marketing/ data/: 0 hits
npm run typecheck: not run (docs/assets/data-only change, no TS source touched)
npm run lint: not run (no .ts/.tsx/.js source touched)
Auto-posting: Not run
Live Stripe call: Not run
Production deploy: Not run
Supabase mutation: Not run
.env read/print: No
```

## Gate status

```text
Daily growth publishing pack: Go
Manual review checklist: Go
KPI entry scaffold: Go
Social auto-posting: No-Go - manual publishing only
Stripe checkout execution: Not run
Paid smoke: No-Go - awaiting explicit approval
Production deploy: No-Go
```

## Follow-up

- Human operator reviews `day-012-review-checklist.md` before posting.
- Real KPI rows are entered by the human after the publish window; analysis stays blocked until those exist.
- Next scheduled run will pick up Day 013 from the 7-day content calendar.
