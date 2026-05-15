# Brain Review Packet

## Background

The target project is TianJi Love. The user explicitly approved direct server deployment, but the previous direct deploy stopped before mutation because the available SSH identity did not have deploy permissions.

Follow-up recheck confirmed the blocker remains: `deploy` and `root` SSH still reject the current key, while `tianji-prod` can only perform read-only checks and cannot write `/var/www/tianji-global` or sudo.

## Task Goal

Record the server deploy permission blocker truthfully and preserve the correct gate state before any future redeploy attempt.

## Files Changed

- `.ai/TIANJI_LOVE_DIRECT_SERVER_DEPLOY_EVIDENCE_20260515.md`
- `.ai/TIANJI_LOVE_DIRECT_SERVER_DEPLOY_REVIEW_20260515.md`
- `.ai/CHANGELOG_AI.md`
- `.ai/REVIEW_PACKET.md`

## Related Evidence Links

- `.ai/TIANJI_LOVE_DIRECT_SERVER_DEPLOY_EVIDENCE_20260515.md`
- `.ai/TIANJI_LOVE_DIRECT_SERVER_DEPLOY_REVIEW_20260515.md`

## Core Judgment

```text
Launch: No-Go
Deploy: No-Go
Paid smoke: No-Go
Next safe milestone: restore deploy user SSH and /var/www/tianji-global write permission
```

This is not a code/build blocker. It is a server deployment permission blocker.

## Gate Matrix Summary

| Gate | Verdict | Reason |
| --- | --- | --- |
| Local clean RC | Go | Prior local clean RC build/lint/test evidence passed. |
| Current public non-paid access | Go | Prior current-site checks showed non-paid routes reachable and protected routes redirect same-origin. |
| `deploy` SSH | No-Go | Current key returns `Permission denied (publickey,password)`. |
| `root` SSH | No-Go | Current key returns `Permission denied (publickey,password)`. |
| `tianji-prod` deployability | No-Go | User can log in, but app path is `root:root` and passwordless sudo is unavailable. |
| Actual new-version deploy | No-Go | No release files were written, no symlink changed, no process restarted. |
| Paid smoke | No-Go | Explicitly forbidden and still unsafe. |
| Secret hygiene | Go | Targeted scan over updated direct deploy docs and review packet had no hits. |

## Commands Run

- Git for Windows SSH probe for `deploy@186.244.244.81`
- Git for Windows SSH probe for `root@186.244.244.81`
- Git for Windows SSH read-only probe for `tianji-prod@186.244.244.81`
- Checked `/var/www/tianji-global`, `current`, `releases`, and `shared` ownership
- Checked `sudo -n` availability for `tianji-prod`
- Ran targeted secret-pattern scan over updated direct deploy docs and review packet

## Result

No deployment was performed after the access recheck.

No `git fetch/pull`, `npm install`, `npm run build`, PM2 restart, `pm2 save`, `nginx -t`, Nginx reload, env write, paid smoke, Stripe live API call, or secret output was performed.

## Required Next Action

Restore `deploy` user SSH with the current public key and make `/var/www/tianji-global` deploy-owned, or grant a tightly scoped `tianji-prod` sudo path to deploy as `deploy`.

## Suggested Commit Message

```text
ops(staging): record tianji deploy permission blocker
```
