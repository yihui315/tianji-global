# Brain Review Packet

## Background

The user requested the latest TianJi Love version be committed and the website updated. The working tree contained a broad mix of application changes, generated screenshots, logs, deployment archives, external skill references, and local environment/build artifacts.

The safe commit scope was narrowed to application/runtime source, tests, public TianJi Love assets, scripts, project-local skills, masked `.ai` evidence docs, public `.env.example`, CI, and package script updates.

## Task Goal

Publish the latest safe TianJi Love candidate to GitHub and identify the production update path without committing secrets or generated deployment artifacts.

## Files Changed

Staged for commit:

- TianJi Love app and route source under `src/`
- Focused tests under `src/__tests__/`
- Public TianJi Love media under `public/assets/images/`
- `scripts/audit-release-gate.ts`
- `scripts/smoke-ask-draw-auth.mjs`
- `.env.example`
- `.github/workflows/ci.yml`
- `package.json`
- `tailwind.config.js`
- Project-local `.agents/skills/*`
- Project-local `.codex/prompts/*`
- Project-local `.ai` masked server/env evidence docs
- `.ai/CHANGELOG_AI.md`
- `.ai/REVIEW_PACKET.md`

Explicitly not staged:

- `.env.local`
- deployment tarballs
- screenshots and browser QA image artifacts
- logs
- `.next`, `coverage`, `node_modules`
- `tsconfig.tsbuildinfo`
- external `.claude/skills` reference bundle
- untracked ops notes

## Core Judgment

```text
Commit readiness: Go
GitHub push: Go after commit
Production deploy: Blocked unless main/approved deploy path is used
Paid smoke: No-Go
```

The code candidate validates locally. The production update path is separate from the commit because repo automation deploys `main`, while the current working branch is `redesign-home-landing-20260420`.

## Validation

| Check | Result |
| --- | --- |
| Staged unsafe path check | Pass; no env-local, archive, log, build cache, coverage, node_modules, or tsbuildinfo files staged |
| Staged secret-shape scan | Pass with expected `.env.example` placeholder-only match |
| `git diff --cached --check` | Pass |
| `npm run release:check` | Pass |
| Typecheck | Pass |
| Lint | Pass |
| Tests | Pass, 46 files / 473 tests |
| Build | Pass |
| Route/copy/share/upgrade audits | Pass |

## Commands Run

- `git status --short --branch`
- `git diff --stat`
- `git diff --cached --stat`
- `git diff --cached --check`
- `git diff --cached -G ... --name-only`
- `npm run release:check`
- `gh workflow view 'Deploy US Server' --yaml`
- `gh workflow view 'CI/CD' --yaml`

## Result

The staged candidate is validated and ready to commit/push. The live website cannot be truthfully marked updated from this branch alone unless one of these happens:

1. Merge the branch to `main`, allowing the documented production automation to run.
2. Run an approved deploy workflow that deploys this exact commit/ref.
3. Restore the direct server deploy permission path and deploy this commit there.

## Risks

- Current branch is not `main`.
- Manual `Deploy US Server` workflow deploys `main` and includes a `npm run smoke:production` step; local package scripts do not currently show that script in this working tree.
- Previous direct server deploy was blocked by SSH/permission ownership.
- Supabase migrations are committed as source files only; applying them to any hosted database remains a separate approval gate.

## Suggested Commit Message

```text
feat: publish latest tianji love candidate
```
