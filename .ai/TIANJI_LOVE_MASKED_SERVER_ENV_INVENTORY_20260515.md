# TianJi Love Masked Server/Env Inventory - 2026-05-15

## Scope And Approval

Approved scope:

```text
Approved: read-only masked staging server/env inventory
Forbidden: deploy, restart, env modification, secret printing, paid smoke, live Stripe API calls
```

This task used the TianJi skills committed in `4551488` and the evidence package committed in `e2602a2`.

No deploy, service restart, env modification, credential rotation, paid smoke, Stripe/Supabase/Resend/AI provider API call, or secret printing was performed.

## Local Git Baseline

| Item | Evidence |
| --- | --- |
| Repo root | `D:\BrainSystem\...\ai占卜\tianji-global` |
| Branch | `redesign-home-landing-20260420` |
| HEAD | `e2602a2` |
| Last commits | `e2602a2 docs(ai): add tianji staging env remediation evidence`; `4551488 docs(ai): add tianji agency agent skills`; `6999173 docs(claude): add autoskills index for the new skill bundles` |
| Branch state | Ahead of `origin/redesign-home-landing-20260420` by 7 commits |
| Dirty files | Many pre-existing modified and untracked app/source/assets/skills files remain; this task did not change them |
| Previous remediation evidence commit | Present at `e2602a2` |

## Server Access Scope Check

| Gate | Verdict | Evidence |
| --- | --- | --- |
| SSH/server access | Go | Git for Windows SSH channel returned `SSH_STATUS_OK` through `tianji-love-staging` |
| SSH user | Go | Remote user: `tianji-prod` |
| Hostname | Go | `ser8221021417` |
| Command class | Go | Read-only status and masked key classification only |

Stable command shape:

```text
C:\Program Files\Git\usr\bin\ssh.exe -T -o BatchMode=yes -o RequestTTY=no ...
```

Default Windows OpenSSH was not used because prior evidence showed it was unstable.

## Server Runtime Inventory

| Item | Evidence | Verdict |
| --- | --- | --- |
| OS/kernel | Ubuntu Linux kernel `6.8.0-111-generic` | Go |
| Server date | UTC timestamp returned | Go |
| Node | `v20.20.2` | Go |
| npm | `10.8.2` | Go |
| Nginx | `nginx/1.24.0 (Ubuntu)` | Go |
| Nginx service | `active`, `enabled` | Go |
| PM2 binary | present | Conditional Go |
| PM2 process list | Empty under `tianji-prod` | Conditional Go |
| App process visibility | Node/Next processes visible under `deploy` on port 3000 and `root` on port 3103 | Conditional Go |
| Process cwd | Unreadable from `tianji-prod` for visible app PIDs | Unknown |

Important side effect:

`pm2 list` spawned an empty PM2 daemon under `/home/tianji-prod/.pm2`. It did not list any app processes. No cleanup command was run because this task is read-only and service mutation was forbidden.

Server runtime readiness: Conditional Go for base runtime and Nginx presence; No-Go for deploy readiness because active app process ownership/source remains ambiguous.

## Nginx Evidence

| Item | Evidence | Verdict |
| --- | --- | --- |
| Server names | `tianji.love`, `www.tianji.love`, server IP, wildcard/default | Go |
| HTTPS listen | 443 IPv4/IPv6 with Certbot-managed config | Go |
| HTTP listen | 80 IPv4/IPv6 default server | Go |
| Proxy target | `127.0.0.1:PORT_MASKED` | Go |

Nginx target is present, but app source/env readiness still blocks deploy.

## Server Source Inventory

| Item | Evidence | Verdict |
| --- | --- | --- |
| `/var/www` contents | `html`, `tianji-global` | Go |
| App root | `/var/www/tianji-global` exists | Go |
| Current symlink | `/var/www/tianji-global/current -> /var/www/tianji-global/releases/20260502-155434` | No-Go for clean RC |
| Current package | `package.json`, `package-lock.json`, and `.next` build are present | Conditional Go |
| Git worktree under `/var/www` | none found up to searched depth | No-Go for source provenance |
| `/home/tianji-prod/tianji-global` | missing | No-Go for alternate source |
| Server source matches local HEAD `e2602a2` | not proven; current release is older by path date | No-Go |

Server source readiness: No-Go.

## Masked Environment Inventory

Evidence source:

```text
/var/www/tianji-global/shared/.env.production
/var/www/tianji-global/current/.env.production
```

Both paths were readable by `tianji-prod`; values were not printed.

| Env Name | Status | Classification | Risk | Evidence Source | Required Action |
| --- | --- | --- | --- | --- | --- |
| `NEXTAUTH_URL` | present | present masked | Origin must match deployed app and provider callback | shared env masked classifier | Verify exact origin out-of-band without printing value |
| `AUTH_URL` | present | present masked | Origin must match deployed app | shared env masked classifier | Verify exact origin out-of-band |
| `NEXT_PUBLIC_SITE_URL` | missing | missing | Requested category absent; app mainly uses `NEXT_PUBLIC_APP_URL` | shared env masked classifier | Decide whether alias is required |
| `NEXT_PUBLIC_APP_URL` | present | present masked | Checkout/email/url origin depends on it | shared env masked classifier | Verify exact staging origin out-of-band |
| `AUTH_SECRET` | present | present masked | Required for auth/token behavior | shared env masked classifier | Keep masked only |
| `NEXTAUTH_SECRET` | present | present masked | Required by NextAuth compatibility | shared env masked classifier | Keep masked only |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | present | appears live key | No-Go for staging paid smoke | masked Stripe classifier | Replace or isolate with test-mode staging key before paid smoke |
| `STRIPE_SECRET_KEY` | present | appears live key | No-Go for staging paid smoke | masked Stripe classifier | Replace or isolate with test-mode staging key before paid smoke |
| `STRIPE_WEBHOOK_SECRET` | present | webhook secret present | Paid smoke still needs endpoint/test-mode proof | masked Stripe classifier | Verify test endpoint only after test keys |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | missing | missing | Subscription price mapping incomplete | shared env masked classifier | Add test price ID or waive Pro path |
| `STRIPE_PRO_YEARLY_PRICE_ID` | missing | missing | Subscription price mapping incomplete | shared env masked classifier | Add test price ID or waive Pro path |
| `NEXT_PUBLIC_SUPABASE_URL` | missing | missing | Supabase staging not configured | shared env masked classifier | Provide staging Supabase URL/key evidence |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | missing | missing | Supabase client not configured | shared env masked classifier | Provide staging anon key evidence |
| `SUPABASE_SERVICE_ROLE_KEY` | missing | missing | Server-side Supabase writes unavailable | shared env masked classifier | Provide staging service-role key evidence, masked only |
| `DATABASE_URL` | present | present masked | Webhook DB present but staging separation unknown | shared env masked classifier | Prove staging DB separation |
| `RESEND_API_KEY` | missing | missing | Real email smoke blocked | shared env masked classifier | Provide provider evidence or keep email smoke blocked |
| `FROM_EMAIL` | missing | missing | Source uses this sender key | shared env masked classifier | Add/normalize sender key |
| `EMAIL_FROM` | missing | missing | Alternate sender key absent | shared env masked classifier | Decide canonical sender key |
| `OPENAI_API_KEY` | missing | missing | Hosted OpenAI/Packy unavailable | shared env masked classifier | Provide AI provider evidence or scope out |
| `ANTHROPIC_API_KEY` | missing | missing | Hosted Anthropic unavailable | shared env masked classifier | Provide AI provider evidence or scope out |
| `GEMINI_API_KEY` | missing | missing | Gemini unavailable | shared env masked classifier | Provide AI provider evidence or scope out |
| `GOOGLE_API_KEY` | missing | missing | Gemini fallback unavailable | shared env masked classifier | Provide AI provider evidence or scope out |
| `MINIMAX_API_KEY` | missing | missing | MiniMax unavailable | shared env masked classifier | Provide AI provider evidence or scope out |
| `PACKY_API_ENDPOINT` | missing | missing | Packy endpoint unavailable | shared env masked classifier | Provide endpoint evidence if Packy is intended |
| `OLLAMA_BASE_URL` | present | present masked | Local fallback endpoint exists, but model/service health not proven | shared env masked classifier | Prove local Ollama health/model without secrets |
| `OLLAMA_MODEL` | missing | missing | Model not pinned | shared env masked classifier | Provide model evidence if fallback is intended |
| `DEFAULT_OLLAMA_MODEL` | missing | missing | Default model not pinned | shared env masked classifier | Provide model evidence if fallback is intended |
| `DESTINY_SCAN_SECRET` | missing | missing | Destiny/Ask/Draw fallback secret chain can fall back to auth secret but dedicated route secret unresolved | shared env masked classifier | Add dedicated staging secret |

Masked env readiness: No-Go.

## Stripe Safety Classification

| Area | Evidence | Verdict |
| --- | --- | --- |
| Secret key mode | `STRIPE_SECRET_KEY` appears live-key shaped | No-Go |
| Publishable key mode | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` appears live-key shaped | No-Go |
| Webhook secret | present | Conditional Go only after test-mode endpoint proof |
| Subscription price IDs | monthly/yearly missing | No-Go for Pro/subscription smoke |
| Inline price construction | Existing source uses inline price construction for Ask/Draw/Destiny and subscription checkout | Conditional/No-Go risk |
| Paid smoke eligibility | Live-key shaped env present and price IDs missing | No-Go |

Stripe staging safety: No-Go.

Paid smoke eligibility: No-Go.

## Supabase / Resend / AI / Destiny Classification

| Area | Evidence | Verdict |
| --- | --- | --- |
| Supabase staging readiness | Supabase URL, anon key, and service-role key missing | No-Go |
| Resend/email readiness | Resend key and sender keys missing | No-Go |
| AI provider readiness | Hosted provider keys missing; only `OLLAMA_BASE_URL` present | No-Go for hosted AI smoke; Conditional only if local Ollama health/model is proven |
| `DESTINY_SCAN_SECRET` readiness | dedicated key missing | No-Go |

## Gate Summary

```text
Launch: No-Go
Deploy: No-Go
Paid smoke: No-Go
Next safe milestone: remediate staging env to test/safe classifications, then rerun masked inventory
```

## Commands Run

- `git status --short --branch`
- `git rev-parse --short HEAD`
- `git log -3 --oneline`
- Git for Windows SSH read-only runtime command
- Git for Windows SSH source directory checks
- Git for Windows SSH Nginx route grep with port masked
- Git for Windows SSH process visibility checks with secret-like args masked
- Git for Windows SSH masked env key presence check
- Git for Windows SSH masked Stripe pattern classifier

## Secret Hygiene

No raw env values, API keys, webhook secrets, database URLs, private keys, SSH keys, or JWTs were intentionally printed into this file.
