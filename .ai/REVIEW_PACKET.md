# Brain Review Packet

## Background

The user asked to continue deployment and upgrade the live TianJi Love site to the latest version. The production target remains the self-hosted server at `186.244.244.81` with app path `/opt/tianji-global`, PM2 app `tianji-global`, and public domain `https://tianji.love`.

Raw secret values were not read from server env files and are not recorded here.

## Task Goal

Compare the server runtime with the latest GitHub candidate, upgrade if needed, and verify the public site after the check.

## Files Changed

Local record-only changes:

- `.ai/CHANGELOG_AI.md`
- `.ai/REVIEW_PACKET.md`

No application runtime source was changed during this follow-up because the server was already on the latest candidate.

## Source Selection

Latest candidate selected:

```text
origin/redesign-home-landing-20260420
4113adcaf49851a0a3bbc256b308e0076cfceb57
```

Reason:

- It is the newest remote branch by commit date for the TianJi Love deployment candidate.
- PR #48 is mergeable.
- GitHub Actions `Build & Test` for PR #48 passed.
- `origin/main` is older at `f2f4068bf89524e30b29dd56f16740bb1d7ce13c`.

## Server State

Server source after explicit fetch:

```text
4113adcaf49851a0a3bbc256b308e0076cfceb57
branch: deploy/tianji-love-20260515
```

The server was already at the latest selected candidate, so no rebuild, reinstall, or PM2 restart was performed.

## Validation

| Check | Result |
| --- | --- |
| Local `git fetch --all --prune` | Pass |
| PR #48 mergeability | `MERGEABLE` |
| PR #48 GitHub `Build & Test` | Pass |
| Server explicit refspec fetch | Pass |
| Server HEAD equals latest candidate | Pass |
| Root `nginx -t` | Pass |
| PM2 `tianji-global` | Online under `deploy` |
| Production smoke `/en` | 200 |
| Production smoke `/zh-CN/pricing` | 200 |
| Production smoke `/en/love-reading/result/demo` | 200 |
| Production smoke `/api/checkout` invalid payload | 403 safe paid-unlock-disabled response |
| Public `https://tianji.love/` | 200 |
| Public homepage signals | `Tianji Love`, `Love is the one force that`, `Start Relationship Reading`, `Ask One Question`, `Draw Three Cards` |

## Commands Run

- `git fetch --all --prune`
- `git for-each-ref ... refs/remotes/origin`
- `gh pr view 48 --json ...`
- Remote `git fetch origin redesign-home-landing-20260420:refs/remotes/origin/redesign-home-landing-20260420 main:refs/remotes/origin/main`
- Remote `git rev-parse HEAD`
- Remote `git rev-parse refs/remotes/origin/redesign-home-landing-20260420`
- Root `nginx -t`
- Remote `SMOKE_BASE_URL=https://tianji.love npm run smoke:production`
- Remote `pm2 list`
- Public `curl` homepage checks

## Result

The live site is already upgraded to the latest selected candidate. No runtime deploy action was necessary in this follow-up.

Production remains available at:

```text
https://tianji.love/
```

## Risks

- Supabase migrations were not applied.
- Paid smoke was not run.
- Paid checkout remains disabled by the production safety gate.
- Server keeps untracked `.env.production` and backup env files, which is expected for production but should stay outside Git.
- PR #48 still has a canceled/failing Vercel preview status even though the self-hosted production path and GitHub `Build & Test` are good.

## Suggested Commit Message

```text
ops: record latest tianji server deploy check
```
