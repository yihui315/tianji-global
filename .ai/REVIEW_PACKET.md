# Brain Review Packet

## Task Goal

Continue the TianJi Love post-canary sequence after Lane S by recording whether the analytics-contract branch is ready for staging deployment, without executing production deploy or paid smoke.

## Status

```text
Production free + UX polish: Go from existing canary evidence
Production public route sample: Go
Staging homepage HTTP/HTTPS sample: Go
Lane S source branch: Go
Codex direct staging deploy: No-Go, SSH denied
Manual staging deploy: Ready for operator
Production Lane S canary: No-Go until staging smoke + explicit approval
Paid launch: No-Go
```

## Current Behavior

- `origin/post-canary-ux-polish-20260520` points to `432517b feat: add tianji love funnel analytics contract`.
- Public production route sample from this workstation returned 200 for `/`, `/pricing`, `/ask`, `/draw`, and `/login`.
- Staging homepage returned 200 over `http://staging.tianji.love/` and `https://staging.tianji.love/`.
- Direct server deployment from this Codex environment is blocked: both `root@186.244.244.81` and `deploy@186.244.244.81` reject SSH batch-mode auth.

## What Changed

- Added a Lane S staging deploy readiness evidence packet.
- Updated the changelog and review packet with the current gate state.
- Prepared the exact server root-shell staging deployment command for the operator.

## Files Changed

```text
.ai/TIANJI_LOVE_LANE_S_STAGING_DEPLOY_READY_20260521.md
.ai/CHANGELOG_AI.md
.ai/REVIEW_PACKET.md
```

## Commands Run

| Command | Result |
| --- | --- |
| `git -c safe.directory=* status --short --branch` | Local branch is `post-canary-ux-polish-20260520`; unrelated user/other-process changes are present and were not staged |
| `git -c safe.directory=* log --oneline -5` | Latest commit is `432517b feat: add tianji love funnel analytics contract` |
| `git -c safe.directory=* ls-remote --heads origin post-canary-ux-polish-20260520` | Remote branch points to `432517bdede94ab4f1bac08ffaf99fc7c1c19d5c` |
| `curl.exe ... https://tianji.love/` | `prod_home=200` |
| `curl.exe ... https://tianji.love/pricing` | `prod_pricing=200` |
| `curl.exe ... https://tianji.love/ask` | `prod_ask=200` |
| `curl.exe ... https://tianji.love/draw` | `prod_draw=200` |
| `curl.exe ... https://tianji.love/login` | `prod_login=200` |
| `curl.exe ... http://staging.tianji.love/` | `staging_http_home=200` |
| `curl.exe ... https://staging.tianji.love/` | `staging_https_home=200` |
| `ssh -o BatchMode=yes -o ConnectTimeout=8 root@186.244.244.81 "echo root_ssh_ok"` | Failed, permission denied |
| `ssh -o BatchMode=yes -o ConnectTimeout=8 deploy@186.244.244.81 "echo deploy_ssh_ok"` | Failed, permission denied |
| `git diff --check -- .ai/TIANJI_LOVE_LANE_S_STAGING_DEPLOY_READY_20260521.md .ai/CHANGELOG_AI.md .ai/REVIEW_PACKET.md` | Pass with LF/CRLF working-copy warnings only |
| `Test-Path` for the three updated docs | Pass |
| targeted secret-shape scan over the three updated docs | Pass, 0 hits for Stripe/API/private-key/secret assignment patterns |

## Safety Notes

- No production deploy, current symlink switch, PM2 restart, certbot, Nginx reload, server build, server env read, Stripe call, webhook replay, email send, Supabase mutation, provider live call, paid unlock, or Vedic paid public exposure was performed.
- No `.env`, `.env.local`, secret value, credential, production config, Stripe dashboard data, Supabase data, or provider key value was read or printed.
- Existing local uncommitted source/auth changes were treated as external work and left untouched.

## Gate Matrix

| Gate | Verdict | Reason |
| --- | --- | --- |
| Lane S source branch | Go | Remote branch exists at `432517b` |
| Production current free route sample | Go | Public curl sample returned 200 for five free routes |
| Staging host homepage sample | Go | HTTP and HTTPS homepage returned 200 |
| Codex direct staging deploy | No-Go | root/deploy SSH denied |
| Manual staging deploy | Conditional Go | Exact command prepared; operator must run on server |
| Hosted non-paid smoke for Lane S | Not-run | Requires manual staging deploy first |
| Production Lane S canary | No-Go | Requires staging smoke and explicit approval |
| Paid smoke / paid launch | No-Go | Not approved and not run |

## Next Operator Command

Run in the server root shell:

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

## Explicitly Not Approved

- Production Lane S canary.
- `CANARY_EXECUTE=true`.
- Stripe live.
- Stripe webhook mutation.
- Ask/Draw paid unlock.
- Email automation.
- Supabase production mutation.
- Provider live scaling.
- Vedic paid public exposure.
- Rollback release deletion.

## Suggested Commit Message

```text
docs(ops): record Lane S staging deploy gate
```
