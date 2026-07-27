# TianJi Love Production Rescue Intake — 2026-07-27

## Purpose

Start a controlled Production Rescue workflow without touching the live service.

This branch is an intake and recovery branch for source that currently exists in the live production worktree but is not fully represented in GitHub `main`.

## Authoritative production baseline

```text
PRODUCTION_IP=154.217.241.238
HOSTNAME=ser8221021417
ACTIVE_RUNTIME=PM2_ROOT_TIANJI
ACTIVE_PORT=3103
PRODUCTION_CWD=/opt/tianji-global
PRODUCTION_COMMIT=490d450655fde0fe43e864225904091468072855
PRODUCTION_BRANCH=main
PRODUCTION_WORKTREE=DIRTY
TARGET_MAIN_COMMIT=42eae7c4af4859fd579721591093eb14f530bc13
PRODUCTION_DEPLOY=HOLD
```

## Confirmed live-only worktree paths

```text
M  src/lib/ai-orchestrator.ts
?? src/app/api/subscribe/route.ts
?? src/app/api/subscribers/count/route.ts
```

The two subscription routes are compiled into the currently active `.next` build and are reachable through the production runtime:

```text
GET /api/subscribers/count => HTTP 200
GET /api/subscribe         => HTTP 405
```

The 405 result is consistent with a write endpoint that does not accept GET, but the route contract must be reviewed before rescue integration.

## Preserved evidence

```text
PRESERVATION_ARCHIVE=/root/tianji-production-preserve-20260727-025136.tar.gz
ARCHIVE_SHA256=244e1b3afc422e6a8e15c03495904453518b8a6a2ffc24d59bf3b678960defb6
ARCHIVE_SIZE=62762
SECRET_SHAPE_HIT_COUNT=0
LIVE_ONLY_SOURCE_PRESERVED=YES
PRODUCTION_APP_CHANGED=NO
PRODUCTION_RESTARTED=NO
```

### Preserved source hashes

```text
src/app/api/subscribe/route.ts
sha256=1fc4c2d30188f71ff07eae5cfd0585a7d1318d4f5afcb349e5f3dbf28b8528c7

src/app/api/subscribers/count/route.ts
sha256=a8fefa18d9c57a246310f8c7ab77dba0e45b523493665f6aeb14768415e26e4d

src/lib/ai-orchestrator.ts (production)
sha256=810048466b27f63b6cba5736808e64325edb639b720449ee76b345ea56e2692a

src/lib/ai-orchestrator.ts (production HEAD baseline)
sha256=501966a5827f15e55a5cffbd01270fc8b5d8fccc79c0cace437f7a846a2b44a4
```

## Current health facts

```text
GET /                  => HTTP 200
GET /api/health        => HTTP 200
GET /api/version       => HTTP 500
VERSION_ERROR=SERVICE_VERSION_BUILT_AT is not set in production
```

The running process environment contains `NODE_ENV`, `PORT`, and `NEXT_PUBLIC_APP_URL`, but does not expose the following names in the process environment snapshot:

```text
SERVICE_VERSION_COMMIT
SERVICE_VERSION_BUILT_AT
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_APP_ENV
DATABASE_URL
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

Absence from the process environment snapshot does not prove that a dependency is unused; route implementation and build-time injection must be reviewed.

## Rollback status

Existing historical release directories are not yet a validated rollback anchor:

- recent July release directories lack a complete `.next` build and/or `node_modules`
- one June release has a build and `node_modules`, but its source commit is not traceable from the directory
- no rollback rehearsal has been completed

```text
ROLLBACK_ANCHOR_READY=NO
```

## Rescue implementation sequence

1. Import the exact preserved source files from the verified archive.
2. Verify every imported file against the recorded SHA-256 value.
3. Review subscription data handling, validation, rate limiting, privacy, and storage behavior.
4. Compare the production `ai-orchestrator.ts` patch with current `main`; retain only behavior that is still required and safe.
5. Add contract tests for:
   - subscription POST validation
   - duplicate handling
   - subscriber count privacy and error behavior
   - unsubscribe compatibility if applicable
   - AI provider routing/fallback behavior affected by the production patch
6. Run typecheck, lint, targeted tests, full tests, security-shape scan, and degraded staging build.
7. Deploy only to staging using a clean release directory.
8. Run browser/API UAT and clean-log validation.
9. Design and validate a real rollback release.
10. Keep production deployment on HOLD until explicit human approval.

## Hard safety boundaries

- No changes to `/opt/tianji-global`.
- No production PM2 restart or reload.
- No Nginx reload.
- No production Git pull, reset, checkout, or clean.
- No live Stripe action.
- No production Supabase mutation.
- No real email send.
- No self-merge.
- No production deployment from this intake commit.

## Intake gate

```text
RESCUE_BRANCH_CREATED=YES
LIVE_SOURCE_IMPORTED=NO
SOURCE_REVIEW=BLOCKED_PENDING_ARCHIVE_CONTENT
TESTS=NOT_RUN
STAGING_DEPLOY=HOLD
PRODUCTION_READINESS=NO_GO
PRODUCTION_DEPLOY=HOLD
```
