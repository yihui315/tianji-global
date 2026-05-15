# TianJi Love Staging Env Remediation Evidence - 2026-05-15

## Scope And Safety Boundary

This evidence pack is local, read-only, and masked. It inspected source contracts and local runtime metadata only.

Forbidden actions were not performed:

- No deploy.
- No paid smoke.
- No live Stripe API call.
- No real env file read.
- No secret print.
- No production env mutation.
- No credential rotation.
- No dependency installation.
- No remote service mutation.

## Source And Runtime Baseline

| Item | Evidence | Classification | Risk |
| --- | --- | --- | --- |
| Repository root | `D:\BrainSystem\...\ai占卜\tianji-global` | present | Local source only |
| Branch | `redesign-home-landing-20260420` | present | Not clean RC branch |
| Commit | `4551488` | present | This is the docs skill commit |
| Remote | `origin` points to GitHub repository | present | Local branch is ahead |
| Dirty worktree | Many pre-existing modified and untracked files remain | present | Deployment source remains ambiguous |
| Node | `v24.14.0` | present | Satisfies `>=18`, but server Node not proven |
| npm | `11.9.0` | present | Local only |
| Next.js | `^15.5.14` in `package.json` | present | Build not rerun in this docs task |
| React | `^18.3.1` in `package.json` | present | Package currently pairs React 18 with React type packages 19 |
| Runtime config | `next.config.js` ignores TypeScript and ESLint errors during build | present | Build can hide quality failures |
| PM2 evidence | No repo-local PM2 config found | missing | Server process readiness unproven |
| Nginx evidence | No repo-local Nginx config found | missing | Server routing readiness unproven |
| Vercel metadata | `.vercel` absent; `vercel.json` present | unknown | Vercel project linkage not proven |

Runtime readiness: Conditional Go for local Node/package compatibility only. No-Go for staging server readiness because PM2/Nginx/server env/source evidence was not collected in this session.

## Package Scripts

Available scripts from `package.json`:

- `dev`
- `build`
- `start`
- `serve`
- `typecheck`
- `test`
- `lint`
- `audit:routes`
- `audit:copy`
- `audit:share`
- `audit:upgrade`
- `audit:release-gate`
- `release:check`
- `upgrade:plan`

Package manager truth: npm with `package-lock.json`.

## Masked Env Inventory

| Env Name | Status | Classification | Risk | Evidence Source | Action |
| --- | --- | --- | --- | --- | --- |
| `NEXTAUTH_URL` | present as key name | unknown | Must match deployed origin | `.env.example` | Provide masked staging value classification |
| `NEXT_PUBLIC_SITE_URL` | missing | unknown | User requested category, repo uses `NEXT_PUBLIC_APP_URL` instead | Source search | Decide whether alias is required |
| `NEXT_PUBLIC_APP_URL` | present as key name | unknown | Checkout and email URLs depend on it | `.env.example`, source | Provide masked staging value classification |
| Auth origin | present in source | unknown | Header-derived redirects look safer, provider origin still unproven | `src/lib/auth-origin.ts`, middleware | Verify hosted origin and provider callback |
| Stripe publishable key | present as key name | unknown | Test/live not proven | `.env.example` | Provide test-mode masked evidence |
| Stripe secret key | present as key name | unknown | Test/live not proven; paid smoke blocked | `.env.example`, `src/lib/stripe.ts` | Provide test-mode masked evidence |
| Stripe webhook secret | present as key name | unknown | Required for webhook; paid smoke blocked without it | `.env.example`, webhook route | Provide masked presence and endpoint evidence |
| Stripe price IDs | present as key names | unknown | Subscription mapping depends on price IDs, but subscription checkout currently bypasses them | `.env.example`, Stripe source | Provide test-mode price IDs or waive Pro |
| Inline price construction | present | production-risk | Ask, Draw, Destiny, and subscription checkout use inline `price_data`; subscription path bypasses intended env price mapping | Checkout routes | Keep paid smoke No-Go |
| Supabase URL | present as key name | unknown | Staging separation not proven | `.env.example`, `src/lib/supabase.ts` | Provide staging classification |
| Supabase anon key | present as key name | unknown | Client/staging separation not proven | `.env.example` | Provide masked presence |
| Supabase service role key | present as key name | unknown | Service-role key is high-risk; do not print | `.env.example`, `src/lib/supabase.ts` | Provide masked presence and staging classification |
| Database URL | present as key name | unknown | Webhook uses direct PostgreSQL pool | `.env.example`, webhook route | Provide masked staging DB evidence |
| Resend API key | present as key name | unknown | Email smoke blocked without provider evidence | `.env.example`, daily digest route | Provide masked presence |
| `FROM_EMAIL` | missing in `.env.example` key list | missing | Daily digest uses it, but example lists `EMAIL_FROM` instead | Source and env example | Normalize key name evidence |
| `EMAIL_FROM` | present as key name | unknown | Auth comment references email-from style naming; live email provider still unproven | `.env.example`, auth comment | Decide canonical sender key |
| AI provider keys | present as key names | unknown | Hosted AI not proven | `.env.example`, `src/lib/ai-orchestrator.ts` | Provide provider and model classification |
| AI model/provider config | present as key names | unknown | Hosted fallback not proven | `.env.example`, orchestrator | Provide staging model evidence |
| `DESTINY_SCAN_SECRET` | present as key name | unknown | Fallback secret exists in code, but staging-specific secret not proven | `.env.example`, destiny source | Provide masked presence |
| Vercel metadata | `.vercel` absent | missing | Project linkage not proven | Local file check | Provide Vercel linkage evidence if used |
| Server env source | not collected | missing | No SSH or server env inventory approved | Task boundary | Provide masked server inventory in a separate approved step |

## Stripe Safety Evidence

| Area | Evidence | Classification | Gate Impact |
| --- | --- | --- | --- |
| Secret key initialization | `getStripe()` requires `STRIPE_SECRET_KEY` lazily | source present | Runtime fails on Stripe calls if missing |
| Test/live classification | No real env inspected | unknown | Paid smoke No-Go |
| Subscription checkout | `/api/stripe/checkout` creates subscription session using inline price construction | production-risk | Pro subscription smoke No-Go |
| Subscription price mapping | `PLANS` and webhook reference `STRIPE_PRO_MONTHLY_PRICE_ID` and `STRIPE_PRO_YEARLY_PRICE_ID` | source present | Mapping unproven because checkout bypasses env price IDs |
| Ask checkout | `/api/ask/unlock` creates one-time payment with inline price construction | source present | Candidate only after test-mode staging proof |
| Draw checkout | `/api/draw/unlock` creates one-time payment with inline price construction | source present | Candidate only after test-mode staging proof |
| Destiny checkout | `/api/destiny/unlock` creates one-time payment with inline price construction | source present | Not first smoke candidate |
| Webhook secret | Webhook requires `STRIPE_WEBHOOK_SECRET` | source present | Missing hosted proof blocks paid smoke |
| Webhook database | Webhook requires `DATABASE_URL` and creates/updates payment tables | source present | DB staging evidence required |
| Success/cancel URLs | Use `NEXT_PUBLIC_APP_URL` or request origin depending route | source present | Staging origin must be verified |

Stripe staging readiness: No-Go until key mode, webhook, endpoint, price IDs, callback origin, and staging DB evidence are proven.

Paid smoke eligibility: No-Go.

## Supabase And Auth Evidence

| Area | Evidence | Classification | Gate Impact |
| --- | --- | --- | --- |
| Supabase admin | `src/lib/supabase.ts` requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for admin client | source present | Staging Supabase not proven |
| Supabase anon key | Key name exists in env example | unknown | Client staging proof missing |
| Relationship persistence | `/api/relationship/analyze` writes to `relationship_readings` if Supabase is configured | source present | Can fall back in-memory if DB write fails |
| Auth provider | NextAuth uses Google provider and JWT sessions | source present | Google callback/provider env not proven |
| Auth origin | Middleware uses forwarded host/proto via `src/lib/auth-origin.ts` | source present | Safer redirect logic exists, but hosted callback not verified |
| Migrations | Migrations exist for readings, relationship tables, users, unified destiny, daily fortune, analytics, and pay-per-use purchases | source present | Applied staging schema not proven |

Supabase staging readiness: No-Go.

Auth readiness: Conditional Go from source structure, No-Go for hosted readiness until provider origin evidence exists.

## Resend And Email Evidence

| Area | Evidence | Classification | Gate Impact |
| --- | --- | --- | --- |
| Resend package | `resend` dependency present | source present | Provider package exists |
| Daily digest route | `/api/cron/daily-digest` requires `RESEND_API_KEY` and sender | source present | Real email smoke blocked without key and sender proof |
| Sender key drift | Source uses `FROM_EMAIL`; `.env.example` includes `EMAIL_FROM` | missing | Env contract mismatch |
| Auth email | Magic link provider is commented out pending domain verification | source present | Auth email not active |

Email readiness: No-Go for real email smoke.

## AI Provider And Module Evidence

| Flow | Source Evidence | Env Dependency | Classification | Readiness |
| --- | --- | --- | --- | --- |
| Ask preview | `/api/ask/preview` calls `generateReport` with Packy preference and local fallback on timeout/error | AI provider key or fallback | source present | Conditional Go locally; No-Go for hosted AI smoke without provider evidence |
| Draw preview | `/api/draw/preview` calls `generateReport` with Packy preference and local fallback on timeout/error | AI provider key or fallback | source present | Conditional Go locally; No-Go for hosted AI smoke without provider evidence |
| Relationship analysis | `/api/relationship/analyze` is rule-based and can persist if Supabase configured | Supabase optional for persistence | source present | Conditional Go for in-memory result; Supabase persistence unproven |
| Destiny Scan | `/api/destiny/scan` builds deterministic scan and optionally persists | `DESTINY_SCAN_SECRET`, Supabase optional | source present | No-Go until staging secret is proven |
| AI orchestrator | Supports OpenAI, Packy, Anthropic, Grok, Gemini, Ollama, MiniMax-style env names | Provider keys/model config | source present | Hosted provider readiness unknown |
| Timeout behavior | AI provider and Ollama timeouts have env-driven defaults | Timeout env optional | source present | Source supports bounded fallback |

AI provider readiness: No-Go for hosted smoke until provider/model evidence is supplied.

## Non-Paid Smoke Eligibility

| Route | Expected Behavior | Required Env | Current Evidence | Smoke Eligibility |
| --- | --- | --- | --- | --- |
| `/` | Landing page | None for static render | Route exists | Eligible only after clean staging deploy is approved |
| `/pricing` | Pricing page | None for page render; Stripe only for checkout | Route exists | Eligible for page-only smoke after deploy approval |
| `/ask` | Ask page and preview flow | AI provider or documented fallback; secret for unlock token stability | Route exists; preview API exists | Blocked for hosted smoke until env evidence |
| `/draw` | Draw page and preview flow | AI provider or documented fallback; secret for unlock token stability | Route exists; preview API exists | Blocked for hosted smoke until env evidence |
| `/relationship/new` | Relationship form and analysis | Supabase optional for persistence | Route and API exist | Eligible only for in-memory flow after deploy approval |
| `/dashboard` | Protected dashboard | Auth provider/session | Route exists; protected by middleware | Blocked until auth origin/provider evidence |
| `/profile` | Protected profile | Auth provider/session and Supabase for account data | Route exists | Blocked until auth and Supabase evidence |
| `/login` | Login page | Google provider env for real sign-in | Route exists | Page-only eligible; real login blocked |
| `/api/health` | Health endpoint | N/A | Route absent | Unknown/not available |

Non-paid smoke eligibility: Blocked for deployed smoke because staging env/server/source readiness is not proven. Some page-only checks become eligible only after non-paid clean RC deploy approval.

## Blocking Evidence Gaps

1. Server source/env readiness remains missing because no remote masked inventory was collected.
2. PM2/Nginx/live runtime evidence remains missing.
3. Stripe test/live classification remains unknown.
4. Stripe webhook secret, endpoint, and callback origin evidence remain unknown.
5. Supabase staging separation and service-role evidence remain unknown.
6. Resend key and canonical sender evidence remain incomplete.
7. AI provider/model evidence remains unknown.
8. `DESTINY_SCAN_SECRET` staging presence remains unknown.
9. Dirty source state makes deploy source ambiguous.
10. No deployed non-paid smoke was run or approved.

## Commands Run

- `pwd`
- `git -c safe.directory=* status --short --branch`
- `git -c safe.directory=* branch --show-current`
- `git -c safe.directory=* rev-parse --short HEAD`
- `git -c safe.directory=* remote -v`
- `git -c safe.directory=* log -1 --stat --oneline`
- `node -v`
- `npm -v`
- `Get-Content package.json`
- `Get-Content next.config.js`
- `rg` source/env dependency scans over `.env.example`, `src/app`, `src/lib`, `scripts`, and `supabase`
- Targeted reads of Stripe, Supabase, auth, Resend, AI, Ask, Draw, Relationship, and Destiny source files
- Route existence checks for primary smoke routes
- Local metadata checks for `.vercel`, `vercel.json`, PM2, Docker, and deployment config files
