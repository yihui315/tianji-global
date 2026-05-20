# TianJi Love Post-Canary UX Staging Evidence - 2026-05-20

## Goal

Publish the post-canary UX polish to a dedicated Git branch and prepare the staging deployment path, without executing production deploy or enabling paid/live side effects.

## Current Gate

```text
Production free canary: Go
UX polish local validation: Go
Dedicated branch push: Go
Staging deploy by Codex: Not-run
Hosted non-paid smoke after staging deploy: Not-run
Production deploy: Not-run
Paid launch: No-Go
```

## What Changed

- Committed the post-canary love funnel UX polish.
- Created and pushed the dedicated branch `post-canary-ux-polish-20260520`.
- Kept production untouched.
- Kept paid/live systems untouched.

## Git Evidence

```text
commit: 3aa044a35a5644e4baae32547569bd2135a00f28
branch: post-canary-ux-polish-20260520
remote: origin/post-canary-ux-polish-20260520
push: completed
GitHub PR URL: https://github.com/yihui315/tianji-global/pull/new/post-canary-ux-polish-20260520
```

## Local Validation Basis

```text
npm run typecheck: Go
npm run lint: Go
npm run test: Go, 67 files / 556 tests
npm run build: Go
npm run audit:copy: Go
npm run audit:share: Go
npm run audit:upgrade: Go
npm run audit:routes: Go
local browser smoke: Go, desktop/mobile / /draw /pricing /login all 200
git diff --check: Go
secret-shape scan: Go, 0 hits
```

## Staging Deploy Status

Codex did not have an active server root shell or SSH session for `/var/www/tianji-global-staging` in this local run. The staging deployment and hosted non-paid smoke were therefore not executed by Codex.

Required server-side commands remain:

```bash
sudo -iu deploy bash <<'EOF'
set -e

cd /var/www/tianji-global-staging

git fetch origin
git checkout post-canary-ux-polish-20260520
git pull --ff-only

git log --oneline -5
npm ci --legacy-peer-deps
npm run build:staging:degraded
pm2 restart tianji-staging --update-env

STAGING_BASE_URL=http://staging.tianji.love npm run smoke:staging:nonpaid
EOF
```

## Production Deploy Status

```text
production deploy: not-run
production current symlink: not touched by Codex
production PM2 restart: not-run
production env: not read or modified
```

## Paid/Live Status

```text
Stripe live: not enabled
webhook: not run
Ask paid unlock: not enabled
Draw paid unlock: not enabled
Vedic paid public: disabled / not enabled
email send: not run
Supabase mutation: not run
provider live scaling: not run
```

## Next Approval Needed

After staging deploy and hosted non-paid smoke pass, production update still requires a separate explicit approval:

```text
Approved: execute production free canary for post-canary UX polish, free routes only, paid/live side effects locked.
```
