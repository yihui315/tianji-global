# TianJi Love Staging Env Pack Evidence - 2026-05-16

## What Changed

Created a manual staging env pack and credential rotation checklist for TianJi Love Lane F. The pack lists the minimum degraded staging env, free-flow staging env, provider smoke env, paid smoke env, and email env needed to move staging/test readiness from undocumented No-Go to human configuration.

No real secret values were read, printed, written, or committed. No Stripe, DeepSeek, MiniMax, Supabase, Resend, webhook, paid smoke, live provider smoke, or deploy action was run.

## Files Changed

- `docs/tianji-love-staging-env-pack.md`
- `docs/tianji-love-credential-rotation-checklist.md`
- `.ai/TIANJI_LOVE_STAGING_ENV_PACK_EVIDENCE_20260516.md`
- `.ai/CHANGELOG_AI.md`
- `.ai/REVIEW_PACKET.md`

## Commands Run

Planned validation commands:

- `git status --short`
- `git log --oneline -8`
- `git branch --show-current`
- Read `package.json`
- Read `docs/tianji-love-staging-deploy-runbook.md`
- Read `.env.example`
- Read `.ai/CHANGELOG_AI.md`
- Read `.ai/REVIEW_PACKET.md`
- `npm run typecheck` - pass after dependency install
- `npm run lint` - pass
- `npm run test` - pass, 61 files / 532 tests
- `npm run build` - pass, 106 static pages, existing Edge runtime warnings for `jose`/NextAuth
- `npm run audit:staging-env-readiness` - expected `overall: no-go` with missing names only
- `git diff --check` - pass with LF/CRLF working-copy warnings only

Dependency note: initial `npm run typecheck` failed because `tsc` was not available in this lane. `npm install --no-audit --no-fund --loglevel=error --legacy-peer-deps` failed on native `sweph` because Windows Visual Studio C++ build tools were unavailable. `npm install --ignore-scripts --no-audit --no-fund --loglevel=error --legacy-peer-deps` then installed validation dependencies successfully without running package scripts.

## Env Pack Decision

Decision: Conditional Go for human configuration.

The env pack provides the exact key-name checklist for:

- Minimal degraded staging env
- Free-flow staging env
- Provider smoke env
- Paid smoke env
- Email env

This is not a Go for execution. Provider, paid, webhook, email send, Supabase mutation, and deploy gates remain No-Go until rotated values are configured out-of-band and masked readiness checks pass.

## Credential Rotation Decision

Decision: Required before further staging/provider/paid smoke.

Any API/server credentials pasted into chat earlier must be rotated. This includes server SSH/password/API keys, Stripe, Supabase service role, Resend, DeepSeek, and MiniMax credentials. Rotated secrets must not be stored in the repo, and old keys must be verified disabled.

## What Human Must Configure Next

1. Rotate any previously pasted API/server credentials.
2. Disable old keys in the relevant provider dashboards or server access layer.
3. Configure Minimal Degraded Staging Env in the staging secret store or server env.
4. Configure Free-Flow Staging Env only when non-paid staging smoke is approved.
5. Configure Provider Smoke Env only when provider smoke is explicitly approved.
6. Configure Paid Smoke Env only when Stripe/Supabase test-mode smoke is explicitly approved.
7. Configure Email Env only when Resend readiness/send smoke is explicitly approved.
8. Rerun `npm run audit:staging-env-readiness` and record masked status only.

## Conflict Risk With Lane E

Risk: Low.

Lane F only writes docs and `.ai` evidence/review files in the approved file scope. It does not edit source, package scripts, env examples, deploy configs, tests, runtime guards, staging smoke scripts, or business logic. If Lane E also updates `.ai/CHANGELOG_AI.md` or `.ai/REVIEW_PACKET.md`, reconcile append-only evidence rather than overwriting their conclusions.

## Suggested Commit Message

```text
docs: add staging env pack and credential rotation checklist
```
