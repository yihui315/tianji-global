# TianJi Love Staging Env Remediation Plan - 2026-05-15

## Scope

This is a masked staging readiness remediation evidence task using the TianJi skills committed in `4551488`.

It is report-only. It does not deploy, run paid smoke, call Stripe live APIs, print secrets, modify production env, rotate credentials, install dependencies, restart services, or touch server state.

## Current Gate State

```text
Launch: No-Go
Deploy: No-Go
Paid smoke: No-Go
Next safe milestone: masked staging env remediation
```

## Evidence Sources Allowed

- Workspace and repository instructions.
- Repo-local TianJi skills:
  - `.agents/skills/tianji-launch-director/SKILL.md`
  - `.agents/skills/tianji-env-remediation-sre/SKILL.md`
  - `.agents/skills/tianji-revenue-safety-reviewer/SKILL.md`
  - `.agents/skills/tianji-evidence-qa/SKILL.md`
- `package.json`, `next.config.js`, route/source files, and migration filenames.
- `.env.example` key names only.
- Local read-only git/runtime commands.
- Existing `.ai` records.

## Evidence Sources Not Used

- Real `.env` or `.env.local` files.
- Remote server env.
- SSH status commands.
- Stripe, Supabase, Resend, Auth, or AI provider APIs.
- PM2/Nginx live service commands.
- Browser smoke or deployed smoke.
- Paid checkout.

## Work Plan

1. Capture source and runtime baseline with read-only local commands.
2. Inventory env categories from `.env.example` key names and source references.
3. Review Stripe checkout, webhook, callback URL, price ID, and inline price construction risk from source only.
4. Review Supabase and auth source dependencies from code and migrations.
5. Review Resend/email source dependencies.
6. Review AI provider, Ask, Draw, Relationship, Destiny Scan, timeout, and fallback behavior from source.
7. Decide later non-paid smoke eligibility by route using evidence only.
8. Produce plan, evidence, and executive review reports.
9. Update changelog and review packet.
10. Run targeted secret-pattern scan over new/updated `.ai` docs only.

## Non-Goals

- No staging deploy.
- No non-paid deployed smoke.
- No paid smoke.
- No live Stripe test.
- No production env modification.
- No credential rotation.
- No app source edit.
- No dependency change.

## Expected Decision Shape

Because no remote masked env inventory was approved or collected in this session, staging deploy and paid smoke should remain No-Go unless existing evidence proves otherwise. Source support can be marked Conditional Go only where code paths and local runtime are present, not where hosted env proof is missing.
