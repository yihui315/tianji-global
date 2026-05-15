# TianJi Love Direct Server Deploy Evidence - 2026-05-15

## Executive Summary

Direct deployment was attempted up to the safe permission boundary, but it was not completed.

Reason:

- The only working SSH user is `tianji-prod`.
- `tianji-prod` has no passwordless sudo.
- `/var/www/tianji-global` and the `current` symlink are owned by `root`.
- The public app process on port `3000` runs under `deploy`.
- `deploy@186.244.244.81` and `root@186.244.244.81` reject the current SSH key.

Therefore no release directory was written, no `current` symlink was changed, no public app process was restarted, and no Nginx reload was attempted.

## Deploy Access Recheck

After the follow-up request to fix deploy access first, deployment access was checked again.

| Check | Result | Evidence |
| --- | --- | --- |
| `deploy@186.244.244.81` SSH | failed | `Permission denied (publickey,password)` |
| `root@186.244.244.81` SSH | failed | `Permission denied (publickey,password)` |
| `tianji-prod@186.244.244.81` SSH | works for read-only checks | `whoami` returned `tianji-prod` |
| `/var/www/tianji-global` ownership | still not deployable by `tianji-prod` | app root, `current`, `releases`, and `shared` are `root:root` |
| `tianji-prod` sudo | unavailable | `SUDO_NOPASSWD_NO` |

Hard-stop result:

```text
Deploy access is still blocked.
No git fetch/pull, npm install/build, PM2 restart, pm2 save, nginx -t, or nginx reload was run in this recheck.
```

## Local Preflight

Current project worktree:

| Item | Evidence |
| --- | --- |
| Repo root | `D:\BrainSystem\...\tianji-global` |
| Branch | `redesign-home-landing-20260420` |
| Commit | `e2602a2` |
| Latest commits | `e2602a2`, `4551488`, `6999173` |
| Node | `v24.14.0` |
| npm | `11.9.0` |
| Dirty state | many pre-existing modified and untracked files |
| Latest docs commits | present |

Clean RC deploy candidate:

| Item | Evidence |
| --- | --- |
| Repo root | `D:\BrainSystem\...\tianji-global-rc-clean-20260513` |
| Branch | `rc/tianji-love-clean-local-20260513` |
| Commit | `8b099f1` |
| Latest commits | `8b099f1`, `6999173`, `b8e088b` |
| Dirty state | clean |

## Local Validation

Current project worktree:

| Command | Result | Notes |
| --- | --- | --- |
| `npm install` | passed | removed local packages from dependency tree |
| `npm run build` | passed | Next build completed |
| `npm run lint` | passed | Next lint deprecation warning only |
| `npm test -- --runInBand` | failed before tests | Vitest does not support Jest `--runInBand` |
| `npm test` | passed | 46 test files, 473 tests |

Clean RC worktree:

| Command | Result | Notes |
| --- | --- | --- |
| `npm install` | first run blocked, retry passed | first failure was local npm cache/permission; escalated retry completed |
| `npm run build` | passed | Next build completed with known Auth/Edge runtime warnings |
| `npm run lint` | passed | Next lint deprecation warning only |
| `npm test` | passed | 46 test files, 473 tests |

Local deploy eligibility:

```text
Build/lint/test: Go for clean RC
Deploy source: Go for clean RC
Dirty current worktree: do not deploy as source
```

## Server Access And Runtime

SSH channel:

```text
Git for Windows OpenSSH via tianji-prod@186.244.244.81
```

Read-only server evidence:

| Item | Evidence |
| --- | --- |
| Hostname | `ser8221021417` |
| User | `tianji-prod` |
| Kernel | Ubuntu Linux `6.8.0-111-generic` |
| Server date | 2026-05-15 UTC |
| Node | `v20.20.2` |
| npm | `10.8.2` |
| PM2 | present |
| Nginx | `nginx/1.24.0 (Ubuntu)` |

## Server App Directory

Observed:

| Item | Evidence |
| --- | --- |
| App root | `/var/www/tianji-global` |
| Current symlink | `/var/www/tianji-global/current -> /var/www/tianji-global/releases/20260502-155434` |
| Shared env | `/var/www/tianji-global/shared/.env.production` |
| Current env link | `/var/www/tianji-global/current/.env.production -> /var/www/tianji-global/shared/.env.production` |
| Git worktree under app path | none found |
| Current package | `tianji-global` |

Server source state:

```text
Server app path: identified
Server source provenance: old release path, not clean RC commit
Git pull flow: not available because current release is not a Git worktree
```

## Process And Restart Target

| Runtime | Evidence | Risk |
| --- | --- | --- |
| Port `3000` | Next process runs under `deploy` | likely public Nginx target |
| Port `3103` | `tianji-global.service` runs `next start -p 3103 -H 127.0.0.1` | systemd service exists but not proven public target |
| PM2 under `tianji-prod` | empty list | not the public process manager |
| sudo | `tianji-prod` requires a password | cannot write/restart safely |
| `deploy` SSH | rejected current key | cannot restart deploy-owned PM2 |
| `root` SSH | rejected current key | cannot manage release path/systemd |

Conclusion:

```text
Deploy/restart: blocked by server permission and process ownership
```

## Masked Env Presence

Evidence source:

```text
/var/www/tianji-global/shared/.env.production
/var/www/tianji-global/current/.env.production
```

Only key names and classifications were printed.

| Key Category | Status |
| --- | --- |
| `NEXTAUTH_URL` | present |
| `NEXT_PUBLIC_SITE_URL` | missing |
| `NEXT_PUBLIC_APP_URL` | present |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | present |
| Stripe publishable key | present, appears live-shaped |
| Stripe secret key | present, appears live-shaped |
| Stripe webhook secret | present |
| Stripe price IDs | missing |
| Supabase URL/anon/service-role keys | missing |
| Resend/FROM_EMAIL | missing |
| Hosted AI provider keys | missing |
| `OLLAMA_BASE_URL` | present |
| AI model config | missing |
| `DESTINY_SCAN_SECRET` | missing |

Paid smoke remains blocked.

## Nginx Result

Plain `nginx -t` as `tianji-prod` failed because the user cannot read certificate files.

`sudo nginx -t` could not run because `tianji-prod` has no passwordless sudo.

No Nginx reload was attempted.

## Deployment Result

No deploy mutation was performed.

Not performed:

- No `git pull` on server, because app directory is a release directory without Git metadata.
- No new release directory was created, because `/var/www/tianji-global` is root-owned.
- No `npm install` or `npm run build` on server, because there is no writable deploy target.
- No PM2 restart, because public PM2 process is not owned by `tianji-prod`.
- No systemd restart, because sudo is unavailable.
- No Nginx reload, because config test could not be completed as a privileged user and reload was not needed for the blocked deploy.

## Server-Side Local HTTP Checks

Port `3000`:

| Route | Actual |
| --- | --- |
| `/` | `200` |
| `/pricing` | `200` |
| `/login` | `200` |

Port `3103`:

| Route | Actual |
| --- | --- |
| `/` | `200` |
| `/pricing` | `200` |
| `/login` | `200` |

## Public Effect Check

Public checks were run from the server against `https://tianji.love`.

| Route | Expected | Actual Status | Redirect Location | Verdict | Notes |
| --- | --- | --- | --- | --- | --- |
| `/` | `200` | `200` | none | Pass | Current public site loads |
| `/pricing` | `200` | `200` | none | Pass | Non-paid page reachable |
| `/login` | `200` | `200` | none | Pass | Login page reachable |
| `/relationship/new` | `200` | `200` | none | Pass | Relationship entry reachable |
| `/ask` | `200` or safe behavior | `200` | none | Pass | Non-paid page reachable |
| `/draw` | `200` or safe behavior | `200` | none | Pass | Non-paid page reachable |
| `/dashboard` | redirect to `/login` | `307` | `https://tianji.love/login?callbackUrl=%2Fdashboard` | Pass | Same-origin auth redirect |
| `/profile` | redirect to `/login` | `307` | `https://tianji.love/login?callbackUrl=%2Fprofile` | Pass | Same-origin auth redirect |

Local Windows `curl.exe` public HTTPS checks failed with a local Schannel credential error, so server-side curl evidence was used.

## Visual / UX Effect

Browser automation was not available in the current callable tool set.

HTML/web fetch evidence confirmed:

- Homepage loads.
- Tianji Love brand appears in nav/footer.
- Hero text and CTA are present.
- Relationship CTA is present.
- No localhost redirect was observed in public auth redirects.

Visual check:

```text
Partial
```

Reason:

```text
Public route and HTML evidence passed, but no browser screenshot automation was available.
```

## Secret Hygiene

No env values, private keys, API tokens, payment tokens, or full cookies should be copied into final reports.
