# Merge Train Final — 2026-07-24

## Status

All four Draft PRs from the 2026-07-23 / 2026-07-24 SIAS cadence are merged on `main`. Sync cleanup completed. The merge train is closed.

## Merged PRs

| PR | Title | Branch | Merge commit (squash) |
|----|-------|--------|----------------------|
| [#170](https://github.com/yihui315/tianji-global/pull/170) | feat(adsense): harden ads.txt surface and add App Router fallback (H2 PR 1) | `sias/h2-ads-txt-hardening-20260723` | `8b57ac76ceb3600d21a98c5e8e9a41fea2986f49` |
| [#168](https://github.com/yihui315/tianji-global/pull/168) | fix(seo): add love-test metadata and structured data | `sias/love-test-seo-20260723` | `7bc72b3c2d16b6dfad8e93479a34b40b3ac97092` |
| [#169](https://github.com/yihui315/tianji-global/pull/169) | feat(sias): improve revenue instrumentation and funnel readiness (H1) | `sias/high-throughput-h1-20260723` | `e8eb31eb38f2548f2a11551d9f9ab5818567bb72` |
| [#171](https://github.com/yihui315/tianji-global/pull/171) | feat(sias): add self-monitor discovery and blocked registry (H2 PR 2) | `sias/self-monitor-h2-20260723` | `e0c55529ec9d5f30d0ff34e9e05cf40fa314a918` |

## Main sync result

`main` HEAD = `e0c55529ec9d5f30d0ff34e9e05cf40fa314a918` after `git fetch origin && git reset --hard origin/main`.

The first six commits on `main` (top of log):

```
e0c5552 feat(sias): add self-monitor discovery and blocked registry (H2 PR 2) (#171)
e8eb31e feat(sias): improve revenue instrumentation and funnel readiness (H1) (#169)
7bc72b3 fix(seo): add love-test metadata and structured data (#168)
8b57ac7 feat(adsense): harden ads.txt surface and add App Router fallback (H2 PR 1) (#170)
f5c3a9b docs(ai): record sias l1 and l2 round 1 evidence (#167)
a5a9596 fix(seo): surface daily-oracle to crawlers and add structured data (#166)
```

Working tree clean (`git status --short` → empty).

## Files now on `main` from the four PRs

```
src/app/(main)/love-test/layout.tsx                       (PR #168)
src/__tests__/love-test-seo.test.ts                       (PR #168)
scripts/audit-adsense.ts                                  (PR #170: ads.txt formatCheck)
src/app/ads.txt/route.ts                                  (PR #170: App Router fallback)
src/__tests__/scripts/ads-txt-hardening.test.ts           (PR #170)
scripts/kpi-entry-scanner.mjs                             (PR #169: T0-006)
src/__tests__/scripts/kpi-entry-scanner.test.ts            (PR #169)
src/lib/analytics/utm-params.ts                           (PR #169: T0-003)
src/app/(main)/daily-oracle/page.tsx                      (PR #169: T0-003 — utm propagated)
src/__tests__/analytics/utm-params.test.ts                (PR #169)
src/app/(main)/pricing/layout.tsx                         (PR #169: T0-004 — SoftwareApplication + FAQ)
src/__tests__/pricing-seo.test.ts                         (PR #169)
scripts/sias-self-monitor.mjs                             (PR #171: H2 PR 2)
src/__tests__/scripts/sias-self-monitor.test.ts           (PR #171)
.ai/SIAS_BLOCKED_REGISTRY_20260723.md                     (PR #171: BLOCKED-011/012/013 appended)
.ai/SIAS_SELF_MONITOR_2026-07-24.md                       (PR #171)
.ai/reports/sias-self-monitor-2026-07-24.json             (PR #171)
```

`AUTOPILOT_STATUS.json` on `main` still has 21 keys (the H1 addendum `sias_high_throughput_h1` lives only in the H1 worktree — see "Evidence restored" below).

## Deleted stale branches

| Branch | Origin tip | Disposition |
|--------|------------|-------------|
| `sias/h2-ads-txt-hardening-20260723` | `f5c3a9b` (PR #170 had been force-pushed onto a stale reset) | deleted (`-d`) — origin tip was not merged; deletion safe |
| `sias/self-monitor-h2-20260723` | `e0c5552` | deleted (`-d`) — origin tip == main tip; deletion safe |
| `sias/love-test-seo-20260723` | `0bf4027` | deleted (`-D`) — squash-merged into `7bc72b3`; confirmed content identical at file level; no source loss |
| `sias/high-throughput-h1-20260723` | `ef86082` | deleted (`-D`) — squash-merged into `e8eb31e`; confirmed content identical at file level; no source loss |

The other branches (`fix/pilot-001-legal-aliases-20260720`, `hotfix/minimax-anthropic-endpoint-20260721`, `pr-162`, `pr-162-check`, `pr-162-scope`) were left untouched — they are outside the merge train scope and not the agent's call to delete.

The `h1` worktree at `/Users/yihui/tianji-global-h1` was removed via `git worktree remove --force` before the branch deletions so the branch pointers were not locked.

## Evidence restored

The following files were **preserved locally before** `git reset --hard origin/main` and re-staged as untracked in the working tree (committed in a follow-up docs-only PR — see "Next step" below). They are NOT part of this merge train's source-tree result, but they are the audit-trail evidence for the four PRs above.

| File | Source | Why staged, not committed in code PRs |
|------|--------|----------------------------------------|
| `.ai/REVENUE_OPS_H1_CONTENT_PACK_20260723.md` | H1 working tree | Per H1 rule: code PR carries source + tests only; evidence ships in daily docs PR |
| `.ai/SIAS_AUTONOMOUS_EVOLUTION_L2_ROUND_2_20260723.md` | stash before reset | Restored from H1 worktree backup before the merge train |
| `.ai/SIAS_HIGH_THROUGHPUT_H1_20260723.md` | H1 working tree | H1 round report; recovered from `/tmp/tianji-merge-train-evidence-20260724/.ai-current/` |
| `.ai/reports/kpi-entry-scan-2026-07-23.json` | kpi-entry-scanner product | Intentionally left untracked by the scanner; this file is the scanner's own output |
| `.ai/MERGE_TRAIN_HOLD_20260724.md` | merge train hold file | Audit-trail for the merge train pause |
| `.ai/SIAS_LEARNING_NOTE_20260723.md` (merge-train addendum) | written during merge train hold | Learning addendum on "agent never self-merges" |
| `.ai/MERGE_TRAIN_FINAL_20260724.md` | this file | Closes the merge train |

All backups live at `/tmp/tianji-merge-train-evidence-20260724/`:
- `.ai-current/` — full copy of the working tree's `.ai/` directory before the reset
- `ai-evidence.patch` — `git diff -- .ai` from before the reset
- `untracked-ai-files.txt` — `git ls-files --others --exclude-standard .ai` from before the reset

## Current blocked items (unchanged from `.ai/SIAS_BLOCKED_REGISTRY_20260723.md`)

```
BLOCKED-001  publish >= 3 posts with real URLs                  (human_required)
BLOCKED-002  154.217.241.238 SSH / STAGING-004                  (infra_blocked)
BLOCKED-003  Stripe test paid smoke approval                   (approval_required)
BLOCKED-004  non-author reviewer approvals for past PRs        (approval_required)
BLOCKED-005  real non-zero KPI traffic                          (external_required)
BLOCKED-006  production deploy                                  (unsafe_for_autonomy)
BLOCKED-007  live Stripe / production Supabase mutation          (unsafe_for_autonomy)
BLOCKED-008  AdSense verdict (CMP/TCF)                          (external_required)
BLOCKED-009  real visit data for /daily-oracle /love-test etc. (external_required)
BLOCKED-010  public social profiles for sameAs                  (human_required)
BLOCKED-011  public/apple-app-site-association                 (human_required, NEW, discovered by self-monitor)
BLOCKED-012  public/humans.txt                                   (human_required, NEW, discovered by self-monitor)
BLOCKED-013  public/.well-known/security.txt                    (human_required, NEW, discovered by self-monitor)
```

`self-monitor` (shipped in PR #171) continues to scan for new items and emit `.ai/reports/sias-self-monitor-<date>.json` + `.ai/SIAS_SELF_MONITOR_<date>.md`. Today's run produced `fresh_unclassified_count: 0` and `known_blocked_count: 6` (the three BLOCKED-011/012/013 entries each carry one `asset_missing` + one `app_route_fallback_missing` issue; total = 6).

## Production deploy status

**NOT DONE.** No change to `vercel.json`, `next.config.js`, `data/`, `.env*`, `.github/workflows/*`, or any production-side configuration. The merge train only moved code onto `main`. Production deployment requires a separate explicit user instruction (BLOCKED-006).

Vercel Preview checks showed `Canceled from the Vercel Dashboard` for all four PRs — those are user-cancelled deployment previews, NOT code-side failures. `Build & Test` was SUCCESS on all four. They were GitHub-mergeable.

## What this merge train did NOT touch

- production deploy
- live Stripe / production Supabase mutation
- real paid smoke
- `.env*` / secrets
- `.github/workflows/*`
- STAGING-004
- 154.217.241.238 SSH
- auto publish / fake URL / fake KPI / fake Contact / fake Team ID
- empty placeholder `public/*` files (BLOCKED-011/012/013 stay parked)

## Next recommended action

A daily docs-only PR carrying the audit-trail evidence listed under "Evidence restored" above. Branch name: `docs/sias-merge-train-evidence-20260724`. Title: `docs(ai): record merge train and H1 evidence`. Scope: `.ai/**` only. No source code change. No build/audit rerun needed because no production surface moved. The PR body should explicitly call out "Why docs-only", "Not touched", and "Next autonomous batch candidate" so a reviewer can scan it in under two minutes.

After the daily docs PR is merged, the next autonomous batch can run as H3:

```
T0-005  pricing CTA source=pricing UTM propagation       (mirror of T0-003 for pricing CTAs)
T0-007  privacy-safe OG image variant verification      (/love-test and /daily-oracle — verify no birth-data leak)
T0-008  localizedPublicRoutes audit contract             (currently a script-driven check; could become a vitest contract)
```

These three are autonomous-safe and were originally parked behind H2 PR 2.

Until the user explicitly authorises H3, SIAS holds.

## Agent behaviour recorded for the next round

The merge train demonstrated three disciplines that must persist:

1. **Agent never self-merges.** Draft → Ready for review is allowed (it is a metadata flip, not approval). Approve, Squash-and-merge, and Delete-branch are non-author-only.
2. **Permanent approval (if any) scopes only source-safe / test / docs / Draft PR operations.** Production deploy, live Stripe, production Supabase, secrets, `.github/workflows/*`, STAGING-004, `154.217.241.238`, auto merge, and self-approve/self-merge are explicitly excluded and require explicit, named, in-the-moment user approval each time.
3. **Merge train is a separate phase between rounds.** No new code while the train is running. After the train clears, sync once (`git fetch && git checkout main && git reset --hard origin/main`), delete local stale branches, write `MERGE_TRAIN_FINAL_<DATE>.md`, then resume on user authorisation only.