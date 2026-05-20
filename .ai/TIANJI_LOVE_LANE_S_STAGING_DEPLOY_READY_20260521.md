# TianJi Love Lane S Staging Deploy Ready Evidence - 2026-05-21

## Goal

Continue the post-canary operating sequence for TianJi Love after the Lane S funnel analytics contract landed, without production mutation and without paid/live side effects.

## Current Behavior

- Production free + UX polish canary is still publicly reachable from this workstation.
- Remote branch `post-canary-ux-polish-20260520` contains the latest Lane S analytics contract commit.
- Staging host homepage is reachable over both HTTP and HTTPS from this workstation.
- Direct server staging deployment from this Codex environment is blocked because both root and deploy SSH access are denied in batch mode.

## Source Evidence

```text
branch: post-canary-ux-polish-20260520
remote ref: 432517bdede94ab4f1bac08ffaf99fc7c1c19d5c
latest commit: 432517b feat: add tianji love funnel analytics contract
```

## Public Route Health Sample

Taken from the local Codex workstation on 2026-05-21.

```text
prod_home=200
prod_pricing=200
prod_ask=200
prod_draw=200
prod_login=200
staging_http_home=200
staging_https_home=200
```

This is a lightweight public availability sample only. It is not a replacement for the hosted non-paid smoke after deploying the Lane S branch to the staging checkout.

## Server Access Evidence

Direct staging deployment was not executed by Codex because SSH access is unavailable from this environment.

```text
ssh root@186.244.244.81: Permission denied (publickey,password)
ssh deploy@186.244.244.81: Permission denied (publickey,password)
```

No server command was run, no PM2 process was restarted, no symlink was switched, and no environment file was read or written.

## Required Manual Staging Command

Run this in the server root shell. This deploys only the staging checkout and restarts only `tianji-staging`.

```bash
sudo -iu deploy bash <<'EOF'
set -e

cd /var/www/tianji-global-staging

git fetch origin
git checkout post-canary-ux-polish-20260520
git pull --ff-only

echo "=== current staging branch ==="
git branch --show-current
git log --oneline -5

echo "=== install/build ==="
npm ci --legacy-peer-deps
npm run build:staging:degraded

echo "=== restart staging only ==="
pm2 restart tianji-staging --update-env

echo "=== staging smoke ==="
STAGING_BASE_URL=http://staging.tianji.love npm run smoke:staging:nonpaid
EOF
```

## Expected Staging Smoke Result

```text
home: go
askPage: go
drawPage: go
pricingPage: go
loginPage: go
relationshipNonPaid: go
askPreviewNonPaid: go
drawPreviewNonPaid: go
overall: go
```

## Gate Matrix

| Gate | Verdict | Evidence |
| --- | --- | --- |
| Production free routes current health | Go | Public curl sample returned 200 for `/`, `/pricing`, `/ask`, `/draw`, `/login` |
| Staging host homepage availability | Go | Public curl sample returned HTTP 200 and HTTPS 200 for `/` |
| Lane S source branch availability | Go | `origin/post-canary-ux-polish-20260520` points to `432517b` |
| Codex direct staging deploy | No-Go | root/deploy SSH denied from this environment |
| Manual staging deploy readiness | Conditional Go | Operator command is prepared; hosted smoke still required |
| Production Lane S canary | No-Go | Requires staging deploy smoke and explicit approval |
| Paid launch | No-Go | Stripe/webhook/entitlement/provider/email/Supabase paid smoke not approved or run |

## Production Canary Boundary

Do not run production canary from this step. If staging smoke passes, the next production step still requires explicit approval and must use the established release-directory canary script with 3068 preflight:

```bash
CANARY_SOURCE_BRANCH=post-canary-ux-polish-20260520 CANARY_EXECUTE=true PM2_APP=tianji-global bash ops/tianji-love-production-free-canary.sh
```

Required approval phrase before any production execution:

```text
Approved: execute production free canary for Lane S funnel analytics contract, free routes only, paid/live side effects locked.
```

## Explicit Non-Actions

- No production deploy.
- No `CANARY_EXECUTE=true`.
- No PM2 restart.
- No server-side staging build from Codex.
- No `.env` or secret read.
- No Stripe live key use.
- No webhook smoke.
- No Ask/Draw paid unlock.
- No email send.
- No Supabase production mutation.
- No provider live scaling.
- No Vedic paid public exposure.

## Next Step

Run the manual staging command in a server root shell, then provide the `npm run build:staging:degraded`, `pm2 restart tianji-staging`, and `smoke:staging:nonpaid` output. Production remains blocked until that staging evidence is Go and the production approval phrase is explicitly provided.
