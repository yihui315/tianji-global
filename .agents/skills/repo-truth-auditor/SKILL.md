---
name: repo-truth-auditor
description: Audit Tianji Global repository truth before feature or release work. Use to compare package scripts, GitHub Actions, AGENTS.md, docs, and environment examples against actual runnable commands and runtime requirements.
---

# Repo Truth Auditor

## Purpose

Find drift between what the repository says, what CI runs, and what the app actually needs.

## When to use

Use before feature work, before release work, after workflow changes, or when CI/docs/package scripts disagree.

## Inputs

- `package.json`
- `package-lock.json`
- `.github/workflows/*`
- `AGENTS.md`
- `README.md`
- `docs/**`
- `.env.example`
- `src/**`
- `scripts/**`

## Actions

1. Confirm package manager truth from lockfiles. For this repository, default to npm unless lockfiles change.
2. Compare all commands referenced by docs and workflows against `package.json` scripts.
3. Identify workflow steps that call missing scripts or bypass failures.
4. Identify environment variables used in code or scripts but missing from `.env.example`.
5. Identify documented commands that no longer match the repository.
6. Run available validation commands only after explaining likely runtime cost.
7. Propose the smallest drift-only fix. Do not bundle product changes.

## Constraints

- Do not change UI, product behavior, copy, billing logic, database schema, or migrations.
- Do not add dependencies.
- Do not introduce pnpm unless the repository migrates package managers.
- Do not silence failures with `continue-on-error`, `|| true`, skipped tests, or deleted tests.
- Do not edit secrets, `.env`, deployment credentials, or production configuration.

## Definition of Done

- Missing or stale command references are listed.
- Missing env contract entries are listed.
- CI/doc/package mismatches are listed with file paths.
- Any proposed patch is drift-only and minimal.
- If implemented later, `npm run release:check` should be truthful and blocking.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run audit:routes`
- `npm run audit:copy`
- `npm run audit:share`
- `npm run audit:upgrade`
