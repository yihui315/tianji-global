# TianJi Love Staging Deploy Package Evidence - 2026-05-16

## Goal

Package the current implementation-first degraded mode into a staging-deployable, rollbackable, smoke-ready documentation and script layer without changing Ask, Draw, Stripe webhook, or model gateway runtime business logic.

## Current Deploy Packaging Plan

1. Keep runtime business logic unchanged.
2. Add a staging degraded build wrapper that sets only non-secret degraded flags and runs the existing Next.js build.
3. Add a staging degraded audit wrapper that sets the same flags and runs the existing degraded-mode audit.
4. Document the minimal staging env contract, disabled-service behavior, build/start/smoke commands, rollback steps, and decision table.
5. Point existing staging smoke and model gateway rollback docs to the degraded deploy package.
6. Record evidence, validation commands, and remaining blockers before claiming readiness.

## Files Changed

- `.env.example`
- `package.json`
- `scripts/local-phase5b-env-runner.mjs`
- `docs/tianji-love-staging-deploy-runbook.md`
- `docs/tianji-love-staging-smoke-runbook.md`
- `docs/tianji-love-model-gateway-rollback.md`
- `.ai/TIANJI_LOVE_STAGING_DEPLOY_PACKAGE_EVIDENCE_20260516.md`
- `.ai/CHANGELOG_AI.md`
- `.ai/REVIEW_PACKET.md`

## What Changed

- Added non-secret degraded staging flag names to `.env.example`:
  - `NEXT_PUBLIC_APP_ENV`
  - `STAGING_DEGRADED_MODE`
  - `AI_PROVIDER_LIVE_DISABLED`
  - `STRIPE_LIVE_DISABLED`
  - `EMAIL_SEND_DISABLED`
  - `SUPABASE_MUTATION_DISABLED`
- Added `npm run build:staging:degraded`.
- Added `npm run audit:staging:degraded`.
- Added degraded flag defaults to the existing local Phase 5B env runner.
- Created the staging degraded deploy runbook.
- Updated staging smoke and gateway rollback docs to reference the degraded deploy package.

## Commands Run

Initial inspection:

- `git status --short`
- `git log --oneline -5`
- `node -e "const p=require('./package.json'); console.log(JSON.stringify(p.scripts,null,2))"`
- `.env.example` key-name inventory only
- `rg --files docs .ai scripts | rg "(staging.*smoke|staging.*deploy|rollback|degraded|phase5b|smoke-staging|CHANGELOG_AI|REVIEW_PACKET|EVIDENCE)"`
- `Get-Content` reads of existing staging smoke, rollback, degraded audit, non-paid smoke, and local runner files

Validation:

- `node -e "require('./package.json'); console.log('package-json-ok')"`
- `node --check scripts/local-phase5b-env-runner.mjs`
- `npm run audit:staging:degraded`
- `npm ci --ignore-scripts --no-audit --no-fund --loglevel=error` in this isolated worktree because `node_modules` was absent
- `npm run audit:staging:degraded`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run build:staging:degraded`
- `npm run audit:staging-degraded-mode`
- `npm run audit:routes`
- `npm run audit:copy`
- `npm run audit:share`
- `npm run audit:upgrade`

## Test / Build Results

- Package JSON parse check passed.
- Local Phase 5B runner syntax check passed.
- Typecheck passed.
- Lint passed.
- Full test suite passed: 58 files / 525 tests.
- Normal production build passed with 106 static pages.
- `build:staging:degraded` passed with 106 static pages and no new dependency.
- Route/copy/share/upgrade audits passed.
- Default degraded audit returned `overall: no-go`, as expected without degraded flags.
- `audit:staging:degraded` returned `overall: conditional-go` in the Lane D-only worktree before Lane C rebase, then `overall: go` after Lane C runtime guards were rebased in.

## Degraded Mode Deployable Scope

Can be deployed to a controlled staging target with degraded flags when local validation passes:

- public page build/start surface
- Relationship non-paid path
- Ask preview locked non-paid path
- Draw preview locked non-paid path
- paid unlock routes locked/unavailable while Stripe is disabled
- model provider live calls disabled
- email sends disabled
- Supabase mutations disabled

## Remaining Blocked

- production deploy
- paid smoke
- Stripe test-live smoke
- Stripe webhook smoke
- live AI provider smoke
- Resend send smoke
- Supabase mutation smoke
- any claim that paid revenue flow is staging-ready

## No Live Calls / Deploy Status

No live provider calls, Stripe calls, webhook smoke, paid smoke, Supabase mutation smoke, Resend sends, or production deploy were run for this package.

## Final Validation Results

Staging deploy package: Go for controlled degraded staging package after Lane C rebase.

The package provides the degraded build wrapper, degraded audit wrapper, env flag template, runbook, rollback pointers, and local runner defaults. The final combined gate should still be rerun from the primary worktree after Lane D is merged.
