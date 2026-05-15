# Brain Review Packet

## Background

The user provided root SSH access for `186.244.244.81` and explicitly requested deployment there. The target production shape matches the repo docs: self-hosted Ubuntu server, `/opt/tianji-global`, Nginx, PM2 app `tianji-global`, and domain `https://tianji.love`.

Raw secret values were not read from server env files and are not recorded here.

## Task Goal

Deploy the latest validated TianJi Love website update to the self-hosted server and verify that the public site serves the new homepage.

## Files Changed

Local follow-up files changed after deployment:

- `scripts/smoke-production.mjs`
- `.ai/CHANGELOG_AI.md`
- `.ai/REVIEW_PACKET.md`

Server deployment target:

- `/opt/tianji-global`
- commit `93e294077fb3ad80e2a604e82a233f7afffbe30c`
- local server branch `deploy/tianji-love-20260515`

Explicitly not changed:

- Raw `.env.production` values
- Server database contents
- Supabase hosted migrations
- Stripe dashboard or live API state
- Nginx config files
- Paid smoke state

## Core Judgment

```text
Direct server deploy: Go, completed
Public homepage update: Go, verified
Release validation: Go
Paid smoke: No-Go / not run
Paid checkout: disabled by production safety gate
```

## Deployment Evidence

- Root SSH login succeeded.
- Server runtime present: Node `v20.20.2`, npm `10.8.2`, PM2 `7.0.1`, Nginx `1.24.0`.
- Existing app path: `/opt/tianji-global`.
- Existing PM2 process: `tianji-global`, running under `deploy`.
- Before deploy, server source was on old commit `231b014accbe2244f904c42f6a5b6db99e65120e`.
- After deploy, server source is `93e294077fb3ad80e2a604e82a233f7afffbe30c`.
- PM2 restarted successfully and saved the process list.
- Root `nginx -t` passed.

## Validation

| Check | Result |
| --- | --- |
| Remote `npm ci --legacy-peer-deps` | Pass |
| Remote `npm run release:check` | Pass |
| Remote typecheck | Pass |
| Remote lint | Pass |
| Remote tests | Pass; 52 files / 493 tests |
| Remote production build | Pass; 106 static pages |
| Remote route/copy/share/upgrade audits | Pass |
| Root `nginx -t` | Pass |
| Server-local `http://127.0.0.1:3000/` | 200 |
| Server-local HTTPS Host `tianji.love` | 200 |
| Public `https://tianji.love/` | 200 |
| Public `https://tianji.love/relationship/new` | 200 |
| Public homepage content | Contains `Tianji Love`, `Love is the one force that`, `Start Relationship Reading`, `Ask One Question`, `Draw Three Cards` |
| Production smoke | Pass after accepting safe `403` paid-unlock-disabled checkout response |

## Commands Run

- `git status --short --branch`
- `git rev-parse HEAD`
- Root SSH read-only runtime/source/PM2/Nginx checks
- Remote `git fetch origin redesign-home-landing-20260420 main`
- Remote `git checkout -B deploy/tianji-love-20260515 93e294077fb3ad80e2a604e82a233f7afffbe30c`
- Remote `npm ci --legacy-peer-deps`
- Remote `npm run release:check`
- Remote `pm2 restart tianji-global --update-env`
- Remote `pm2 save`
- Root `nginx -t`
- Public `curl` checks for `/` and `/relationship/new`
- `SMOKE_BASE_URL=https://tianji.love npm run smoke:production`

## Result

The website update is live on `https://tianji.love/`.

The deployed runtime code is commit:

```text
93e294077fb3ad80e2a604e82a233f7afffbe30c
```

`/api/checkout` returns `403 Paid unlock is disabled`, which is consistent with the current `ENABLE_PAY_PER_USE` safety gate. The smoke script was updated to treat that as a passing safe production state.

## Risks

- Supabase migrations are source-deployed only; they were not applied to hosted Supabase/Postgres.
- Paid smoke was not run.
- Paid checkout remains disabled until explicitly enabled and separately validated.
- The server still has untracked `.env.production` and backup env files, which is expected for production but should be governed outside Git.
- Root password access worked for this deployment, but repeatable deployment should use SSH key-based `deploy` access.
- PR #48 remains affected by a canceled Vercel status even though GitHub Actions `Build & Test` passed and the direct server deploy is complete.

## Suggested Commit Message

```text
ops: record tianji love server deploy
```
