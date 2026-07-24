# Merge Train Hold — 2026-07-24

## Status

SIAS has stopped writing new code. Four Draft PRs are queued and now marked **Ready for review**. The merge train is **HOLD** — waiting for the user (repo owner) to Approve + Squash merge each PR in the order below.

## Merge order (set by user 2026-07-24)

| Step | PR | Title | Branch | Files | Owner step |
|------|----|-------|--------|-------|------------|
| 1 | [#170](https://github.com/yihui315/tianji-global/pull/170) | feat(adsense): harden ads.txt surface and add App Router fallback (H2 PR 1) | `sias/h2-ads-txt-hardening-20260723` | 3 | Approve + Squash and merge + Delete branch |
| 2 | [#168](https://github.com/yihui315/tianji-global/pull/168) | fix(seo): add love-test metadata and structured data | `sias/love-test-seo-20260723` | 2 | Approve + Squash and merge + Delete branch |
| 3 | [#169](https://github.com/yihui315/tianji-global/pull/169) | feat(sias): improve revenue instrumentation and funnel readiness (H1) | `sias/high-throughput-h1-20260723` | 7 | Approve + Squash and merge + Delete branch |
| 4 | [#171](https://github.com/yihui315/tianji-global/pull/171) | feat(sias): add self-monitor discovery and blocked registry (H2 PR 2) | `sias/self-monitor-h2-20260723` | 5 | Approve + Squash and merge + Delete branch |

All four are `OPEN` + `isDraft=false` + `mergeable=MERGEABLE` + `Build & Test = SUCCESS` as of this file's write time. The Vercel Preview check is showing FAILURE for all four, but that is `Canceled from the Vercel Dashboard` (a human cancel of the deployment preview, not a code failure); it does not block GitHub-side merge — same pattern as PR #168 already cleared.

## SIAS hard rules while the merge train is running

```
no new H3 / H4 / Run
no new PR
no production deploy
no STAGING-004 touch
no SSH to 154.217.241.238
no self-approve
no self-merge
no auto-merge
no --admin branch protection bypass
no .env / secrets
no .github/workflows/* change
no live Stripe
no production Supabase mutation
no real paid smoke
no auto publish
no fake URL / fake KPI / fake Contact / fake Team ID
```

If SIAS is asked to do any of the above during the merge train, the answer is **park it for after the train clears**.

## "Approved permanently by yi" — scope limitation (set by user 2026-07-24)

Permanent approval applies **only** to source-safe / test / docs / Draft PR operations. It explicitly does **NOT** cover:

- production deploy
- live Stripe
- production Supabase mutation
- real paid smoke
- secrets / .env
- .github/workflows/*
- STAGING-004
- 154.217.241.238
- auto merge
- self-approve / self-merge

When a task touches any of the above, SIAS must escalate to the user for explicit, named, in-the-moment approval — even if a permanent approval exists for adjacent work.

## Per-PR merge checklist (for the user)

For each PR in the order above:

1. Open the URL above.
2. Confirm the CI panel shows `Build & Test = success` (the Vercel FAILURE is a known canceled-deployment signal — not blocking).
3. Review the file diff (5–10 minutes per PR; PR #170 is the smallest, PR #169 is the largest).
4. If approved, click **Approve** (the Approver must NOT be `sias-bot`; the branch protection requires a non-author reviewer).
5. Click **Squash and merge**.
6. Confirm **Delete branch** is checked.
7. Click **Confirm squash and merge**.

## Post-train sync cleanup (executed by SIAS AFTER the user confirms all four are merged)

```bash
git fetch origin
git checkout main
git reset --hard origin/main
git status
# delete the four local feature branches if they still exist (after the
# remote-side Squash-and-merge + Delete branch, origin no longer carries
# them; the local branches are now stale):
git branch -D sias/love-test-seo-20260723 \
             sias/high-throughput-h1-20260723 \
             sias/h2-ads-txt-hardening-20260723 \
             sias/self-monitor-h2-20260723 \
             2>/dev/null || true
# verify only `main` remains locally:
git branch --show-current
git status
```

Then write `.ai/MERGE_TRAIN_FINAL_20260724.md` with the post-merge main SHA, the four merged-in commit SHAs, and a confirmation that the four PR branches are gone from origin.

## What SIAS will NOT do during the merge train

- Will not start H3.
- Will not run any autonomous discovery / scanner / monitor (except at user request).
- Will not open new PRs.
- Will not modify `data/`, `.env*`, `.github/workflows/*`, `vercel.json`, `next.config.js`.
- Will not touch STAGING-004.
- Will not connect to `154.217.241.238`.
- Will not do any sync cleanup until the user explicitly says "all four are merged; sync now".

## Handoff back to SIAS after the train clears

When the user reports the train is cleared (or asks SIAS to "sync after merge"), SIAS will:

1. Run the post-train sync cleanup above.
2. Update `.ai/AUTOPILOT_STATUS.json` with a `merge_train_hold_20260724` block that records the four merged PRs.
3. Append a round addendum to `.ai/SIAS_LEARNING_NOTE_20260723.md` capturing: "Merging a queue of autonomous Draft PRs is a human step; the agent never self-merges; the merge train itself is a separate phase between rounds."
4. Wait for the user to authorise H3.

Until then, SIAS holds.