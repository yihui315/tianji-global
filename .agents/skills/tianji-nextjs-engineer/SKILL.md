---
name: tianji-nextjs-engineer
description: Use for safe TianJi Love Next.js engineering work, including App Router pages, API routes, Ask/Draw/Relationship/Auth flows, language propagation, server/client boundaries, route protection, and build/test readiness under launch-gate constraints.
---

# Name

tianji-nextjs-engineer

# When to use

Use this skill for approved TianJi Love code work in `tianji-global`, especially Next.js App Router routes, API routes, auth redirects, Ask/Draw/Relationship flows, language behavior, route protection, and validation.

# Mission

Make the smallest safe Next.js change that improves TianJi Love while respecting current launch gates and the existing dirty worktree.

# TianJi Love context

Current fixed gate state:

```text
Launch: No-Go
Deploy: No-Go
Paid smoke: No-Go
Next safe milestone: masked staging env remediation
```

`tianji-global` uses Next.js App Router, React, TypeScript, Tailwind CSS, npm with `package-lock.json`, Supabase, Stripe, Resend, AI providers, and Vitest.

# Hard safety rules

- Do not introduce new product features during launch gate unless explicitly approved.
- Do not add dependencies unless explicitly approved.
- Do not modify secrets, real env files, credentials, production config, deployment keys, Stripe live settings, Supabase production data, database migrations, or billing behavior without explicit approval.
- Do not deploy.
- Do not run paid smoke.
- Do not revert unrelated dirty worktree changes.
- Preserve existing architecture, naming, and folder conventions.
- Prefer npm scripts because `tianji-global` uses `package-lock.json`.

# Required inputs

- Exact implementation goal.
- Relevant routes, components, API handlers, tests, and docs.
- Current git status.
- Package scripts.
- Existing gate constraints.
- Required validation command.

# Workflow

1. Restate the task and risk level.
2. Read relevant files before editing.
3. Identify current behavior from source and tests.
4. Propose the smallest implementation plan.
5. Wait for confirmation if risk is medium or high.
6. Update focused tests first when behavior changes.
7. Edit the smallest set of source files.
8. Validate with targeted npm scripts.
9. Record changed files, commands, results, and remaining risks.
10. Update `.ai/CHANGELOG_AI.md` and `.ai/REVIEW_PACKET.md` after meaningful work.

# Deliverables

- Focused source or test diff.
- Validation result.
- Clear explanation of behavior impact.
- Gate impact statement.
- Updated changelog and review packet when meaningful.

# Go / Conditional Go / No-Go standard

- Go: Targeted tests and relevant checks pass, behavior is scoped, and no gate is weakened.
- Conditional Go: Code is likely correct but a documented validation or environment item remains pending.
- No-Go: Tests fail, safety scope is unclear, production/env/payment risk is introduced, or unrelated user work would need to be reverted.

# Output format

1. What changed
2. Files changed
3. Commands run
4. Test/build result
5. Gate impact
6. Risks and follow-up
7. Suggested commit message
