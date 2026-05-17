# Brain Review Packet

## Task Goal

Codex F: create the TianJi Love staging env pack and credential rotation prep for branch `chore/staging-env-pack-and-credential-rotation`, limited to the approved docs and `.ai` files.

## Status

```text
Staging env pack: Conditional Go for human configuration
Credential rotation: Required before further staging/provider/paid smoke
Live provider calls: Not-run
Stripe live/test calls: Not-run
Supabase mutations: Not-run
Resend sends: Not-run
Deploy: Not-run
Real secrets read/printed: No
```

## What Changed

- Created `docs/tianji-love-staging-env-pack.md` with the required Minimal Degraded, Free-Flow, Provider Smoke, Paid Smoke, and Email env groups.
- Created `docs/tianji-love-credential-rotation-checklist.md` stating that any API/server credentials pasted into chat earlier must be rotated.
- Created `.ai/TIANJI_LOVE_STAGING_ENV_PACK_EVIDENCE_20260516.md` with the evidence summary, env-pack decision, credential-rotation decision, human next steps, Lane E conflict risk, and suggested commit message.
- Updated `.ai/CHANGELOG_AI.md` for this Lane F documentation package.

## Files Changed

- `docs/tianji-love-staging-env-pack.md`
- `docs/tianji-love-credential-rotation-checklist.md`
- `.ai/TIANJI_LOVE_STAGING_ENV_PACK_EVIDENCE_20260516.md`
- `.ai/CHANGELOG_AI.md`
- `.ai/REVIEW_PACKET.md`

## Commands Run

| Command | Result |
| --- | --- |
| `git status --short` | Clean before edits |
| `git log --oneline -8` | Confirmed latest commit context |
| `git branch --show-current` | `chore/staging-env-pack-and-credential-rotation` |
| Read `package.json` | Confirmed npm scripts and `audit:staging-env-readiness` |
| Read `docs/tianji-love-staging-deploy-runbook.md` | Confirmed degraded staging runbook boundary |
| Read `.env.example` | Key-name inspection only; no real env read |
| Read `.ai/CHANGELOG_AI.md` | Existing evidence context reviewed |
| Read `.ai/REVIEW_PACKET.md` | Existing review context reviewed |
| `npm run typecheck` | Initial failure because `tsc` was unavailable; pass after dependency install |
| `npm install --no-audit --no-fund --loglevel=error --legacy-peer-deps` | Failed on native `sweph` rebuild because Windows Visual Studio C++ build tools were unavailable |
| `npm install --ignore-scripts --no-audit --no-fund --loglevel=error --legacy-peer-deps` | Pass; installed validation dependencies without package scripts |
| `npm run lint` | Pass, no ESLint warnings or errors |
| `npm run test` | Pass, 61 files / 532 tests |
| `npm run build` | Pass, 106 static pages; existing Edge runtime warnings for `jose`/NextAuth |
| `npm run audit:staging-env-readiness` | Expected No-Go: all staging groups remain unconfigured in this shell; output contained missing names only |
| `git diff --check` | Pass with LF/CRLF working-copy warnings only |

## Decisions

Env pack decision: Conditional Go for human configuration only. The docs make required key names explicit, but do not clear provider, paid, webhook, email send, Supabase mutation, or deploy gates.

Credential rotation decision: Required. Any pasted API/server credentials must be rotated, including server SSH/password/API keys, Stripe, Supabase service role, Resend, DeepSeek, and MiniMax. Rotated values must live outside the repo and old keys must be verified disabled.

## Safety Notes

- No `.env`, `.env.local`, production config, credentials, private keys, or deployment keys were read.
- No real secret values were written to docs or `.ai` evidence.
- No Stripe, DeepSeek, MiniMax, Supabase, Resend, webhook, paid smoke, live provider smoke, or deploy action was run.
- This branch only changes the approved Lane F documentation and `.ai` files.
- Staging env readiness remains `overall: no-go` until humans configure staging/test values out-of-band.

## Risks And Follow-Up

1. Human operators still need to rotate exposed/pasted credentials out-of-band.
2. Human operators still need to configure staging/test env values in the approved secret store or server env.
3. Masked readiness must be rerun after configuration.
4. If Lane E also changes `.ai/CHANGELOG_AI.md` or `.ai/REVIEW_PACKET.md`, reconcile append-only evidence rather than overwriting their work.

## Suggested Commit Message

```text
docs: add staging env pack and credential rotation checklist
```
