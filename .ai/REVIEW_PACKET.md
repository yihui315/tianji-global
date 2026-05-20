# Brain Review Packet

## Task Goal

Make the production free canary script able to deploy the post-canary UX branch explicitly, and document the missing paid-smoke env slots without enabling any paid/live behavior.

## Status

```text
Production free canary: Go from prior evidence
UX polish branch: post-canary-ux-polish-20260520
Staging UX deploy: Not-run by Codex
Canary source branch config: Go locally
Production deploy: Not-run
CANARY_EXECUTE=true: Not-run
Paid launch: No-Go
Vedic paid public exposure: Disabled / No-Go
```

## What Changed

- `ops/tianji-love-production-free-canary.sh` now uses `CANARY_SOURCE_BRANCH` with default `staging-degraded-20260518`.
- Dry-run output now shows `Effective source branch`.
- Clone and rollback metadata now use the effective source branch.
- `docs/tianji-love-production-canary-runbook.md` documents `CANARY_SOURCE_BRANCH=post-canary-ux-polish-20260520` for the UX canary path.
- `.env.example` now includes names-only slots for `STRIPE_ASK_PRICE_ID`, `STRIPE_DRAW_PRICE_ID`, `DEEPSEEK_MODEL_FLASH`, and `DEEPSEEK_MODEL_PRO`.
- Updated paid-smoke inventory to mark those slots as documented but still unproven in real staging env.

## Files Changed

```text
ops/tianji-love-production-free-canary.sh
docs/tianji-love-production-canary-runbook.md
.env.example
.ai/TIANJI_LOVE_LANE_P2_CANARY_SOURCE_BRANCH_CONFIG_20260520.md
.ai/TIANJI_LOVE_PAID_SMOKE_ENV_INVENTORY_20260520.md
.ai/CHANGELOG_AI.md
.ai/REVIEW_PACKET.md
```

## Commands Run

| Command | Result |
| --- | --- |
| Git Bash `bash -n ops/tianji-love-production-free-canary.sh` | Pass. |
| Git Bash `CANARY_SOURCE_BRANCH=post-canary-ux-polish-20260520 bash ops/tianji-love-production-free-canary.sh` | Pass dry-run; no mutation. |
| Names-only `.env.example` slot check | Pass; required slots now present. |
| `git diff --check` | Pass with LF/CRLF working-copy warnings only. |
| Targeted secret-shape scan over updated docs/script/env template | Pass, 0 hits for live/test secret-shaped values. |

## Dry-Run Result

```text
DRY RUN ONLY
CANARY_EXECUTE is not true
Effective source branch:
  post-canary-ux-polish-20260520
Candidate preflight:
  port: 3068
  PM2 app: tianji-canary-preflight
No current symlink switch, production PM2 restart, production env write, paid smoke, or live side effect
```

## Safety Notes

- No `.env`, `.env.local`, production env, or secret value was read or printed.
- No production deploy, symlink switch, PM2 restart, Nginx reload, certbot, Stripe live call, webhook smoke, paid unlock enablement, provider live scaling, email send, or Supabase mutation was run.
- Paid-smoke values remain missing/unproven in real staging env. Adding `.env.example` slots is documentation only.
- Production UX canary remains No-Go until staging hosted non-paid smoke passes and the user explicitly approves the production free canary.

## Next Step

Run the staging deployment first:

```bash
sudo -iu deploy bash <<'EOF'
set -e
cd /var/www/tianji-global-staging
git fetch origin
git checkout post-canary-ux-polish-20260520
git pull --ff-only
npm ci --legacy-peer-deps
npm run build:staging:degraded
pm2 restart tianji-staging --update-env
STAGING_BASE_URL=http://staging.tianji.love npm run smoke:staging:nonpaid
EOF
```

Then dry-run the production script on the server before requesting approval:

```bash
CANARY_SOURCE_BRANCH=post-canary-ux-polish-20260520 bash ops/tianji-love-production-free-canary.sh
```

## Suggested Commit Message

```text
fix(ops): allow configurable production canary source branch
```
