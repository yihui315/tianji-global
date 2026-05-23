---
name: ci-release-gate-builder
description: Build or repair Tianji Global release gates. Use when adding npm release:check, making GitHub Actions blocking, or ensuring lint, typecheck, test, build, audits, and env checks fail CI correctly.
---

# CI Release Gate Builder

## Purpose

Turn repository validation into a truthful blocking release gate.

## When to use

Use after `repo-truth-auditor` identifies script or CI drift, before releases, or when GitHub Actions do not block broken builds.

## Inputs

- `package.json`
- `package-lock.json`
- `.github/workflows/*`
- `scripts/**`
- `AGENTS.md`
- `.env.example`

## Actions

1. Read the repo-truth audit result before changing CI.
2. Add or repair `npm run release:check` using existing scripts.
3. Ensure workflows use `npm ci` for install.
4. Ensure CI runs `npm run release:check` as a blocking step.
5. Keep each check visible enough to diagnose failures.
6. Document any checks intentionally excluded and why.

## Constraints

- Do not use `continue-on-error` for lint, typecheck, test, build, env audit, or release checks.
- Do not use `|| true` to mask validation failures.
- Do not delete or weaken tests to make CI pass.
- Do not change product UI or feature behavior.
- Do not add dependencies unless explicitly approved.
- Do not migrate to pnpm during this skill.

## Definition of Done

- `npm run release:check` exists and reflects repository truth.
- GitHub Actions install with `npm ci`.
- GitHub Actions fail when release checks fail.
- The PR summary lists each command run and result.

## Validation

- `npm run release:check`
- Review GitHub workflow syntax for changed workflow files.
- If release check is newly added, also run the component scripts it calls when feasible.
