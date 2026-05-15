# Brain Review Packet

## Background

The user requested the latest local TianJi Love website page updates be committed, pushed to GitHub, and used to update the website. The latest safe candidate was already pushed to `redesign-home-landing-20260420` and opened as PR #48, but the PR was conflicting with `origin/main`.

This packet records the follow-up merge synchronization and validation needed before the branch can be merged/deployed through the approved path.

## Task Goal

Synchronize the latest TianJi Love candidate with `origin/main`, keep the local homepage/visual updates, retain safer Love V1 backend/payment/deploy updates from `main`, validate the result, and prepare the branch for a GitHub push.

## Files Changed

Current intended commit scope includes:

- PR/main merge updates across `src/`, `scripts/`, docs, CI, package scripts, and Supabase migration source files
- TianJi Love homepage contract fixes in `src/components/home/TianjiLoveHome.tsx`
- Localized sitemap/i18n route support in `src/app/sitemap.ts` and `src/lib/i18n.ts`
- Hardened Love V1 API, checkout, report job, privacy, trust, and test files from `origin/main`
- `.ai/CHANGELOG_AI.md`
- `.ai/REVIEW_PACKET.md`

Explicitly not intended for staging:

- `.env.local`
- deployment tarballs
- screenshots and browser QA image artifacts
- logs
- `.next`, `coverage`, `node_modules`
- `tsconfig.tsbuildinfo`
- untracked external `.claude/skills` reference bundle
- untracked `ops/` notes

## Core Judgment

```text
Branch merge readiness: Go
GitHub push: Go after merge commit
Production deploy: Conditional; requires PR #48 merge to main and approved deploy automation
Paid smoke: No-Go unless separately approved
```

The local branch is now validated against `origin/main`. This does not by itself update production; it prepares the GitHub branch/PR for the approved website update path.

## Merge Resolution Notes

- Kept the local TianJi Love homepage and visual system candidate for page/component/style conflicts.
- Kept `origin/main`'s hardened `src/app/api/stripe/webhook/route.ts` implementation.
- Manually reconciled `package.json`, `.github/workflows/ci.yml`, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/lib/i18n.ts`, and `src/components/home/TianjiLoveHome.tsx`.
- Fixed the homepage funnel to create `/api/love-reading/session` when birth date data is present, with the existing `/ask` or `/relationship/new` fallback preserved.
- Fixed localized sitemap route coverage for `/ask`, `/draw`, `/relationship/new`, and `/about`.
- Normalized `TianjiLoveHome.tsx` line endings to LF for the fragile source-slice landing contract test.

## Validation

| Check | Result |
| --- | --- |
| Unmerged path check | Pass; no unmerged paths before validation |
| `npm run test -- --run src/__tests__/landing-design-contract.test.ts` | Pass; 15 tests |
| `npm run release:check` | Pass |
| Typecheck | Pass |
| Lint | Pass; no ESLint warnings/errors |
| Tests | Pass; 52 files / 493 tests |
| Build | Pass; 106 static pages generated |
| Route/copy/share/upgrade audits | Pass |

## Commands Run

- `git status --short --branch`
- `git merge origin/main --no-edit`
- `git diff --name-only --diff-filter=U`
- `git diff --cached --check`
- `git ls-files --eol src/components/home/TianjiLoveHome.tsx`
- `npm run test -- --run src/__tests__/landing-design-contract.test.ts`
- `npm run release:check`

## Result

The branch is ready to commit as a merge sync and push back to GitHub. After the push, PR #48 should be rechecked for mergeability and CI/deploy status.

The live website can only be marked updated after one of these completes:

1. PR #48 is merged to `main` and the configured production deployment succeeds.
2. An approved deploy workflow deploys this exact commit/ref.
3. A separately approved direct server deployment path is restored and used.

## Risks

- `tsconfig.tsbuildinfo` changed as a local build artifact and should remain unstaged.
- Untracked screenshots, tarballs, `.claude/skills`, and `ops/` artifacts remain local only.
- Supabase migration source files are part of the candidate; applying migrations to any hosted database remains a separate approval gate.
- Paid smoke remains outside this task.

## Suggested Commit Message

```text
merge: sync tianji love candidate with main
```
