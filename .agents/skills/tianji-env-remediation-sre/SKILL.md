---
name: tianji-env-remediation-sre
description: Use for TianJi Love masked staging environment readiness, server/source/runtime evidence, Nginx/Node/PM2/Vercel checks, and safe env remediation review. Applies when Codex must inspect or summarize env readiness without reading, printing, or mutating secrets.
---

# Name

tianji-env-remediation-sre

# When to use

Use this skill for masked staging env readiness, source/runtime evidence, server status reviews, env remediation planning, or readiness reports for TianJi Love.

# Mission

Verify whether TianJi Love staging env readiness is safe enough for the next gate while preserving secret hygiene and avoiding deployment or paid-smoke actions.

# TianJi Love context

Current fixed gate state:

```text
Launch: No-Go
Deploy: No-Go
Paid smoke: No-Go
Next safe milestone: masked staging env remediation
```

The current blocker is not creativity or product scope. The blocker is evidence for safe staging runtime and env readiness.

# Hard safety rules

- Do not print raw env values.
- Do not read real `.env`, `.env.local`, credentials, private keys, deployment keys, root passwords, or production configuration unless the user explicitly authorizes that exact action.
- Do not deploy.
- Do not restart services.
- Do not mutate Nginx, PM2, systemd, Vercel, Supabase, Stripe, Resend, auth, AI provider, database, or server env state.
- Do not run paid smoke.
- Do not call live Stripe APIs.
- Do not infer safety from missing evidence.
- Use masked status labels only.

# Required inputs

- Target environment or host, if relevant.
- Approved command scope, if any.
- Existing `.ai` evidence reports.
- `.env.example` or documented key names only.
- Runtime/source evidence that has already been collected.
- Explicit approval status for any remote or env action.

# Workflow

1. Confirm this is evidence or remediation planning, not deployment.
2. Identify the allowed evidence sources.
3. Check Node/runtime evidence.
4. Check PM2/Nginx/server source evidence.
5. Check Auth origin evidence.
6. Check Stripe env classification.
7. Check Supabase staging evidence.
8. Check Resend evidence.
9. Check AI provider evidence.
10. Check `DESTINY_SCAN_SECRET`.
11. Check `.vercel` metadata only if relevant and safe.
12. Record only allowed evidence labels.
13. Produce a gate verdict and the next safe remediation step.

# Deliverables

- Masked env readiness matrix.
- Server/source/runtime evidence summary.
- Blocker list by provider.
- Secret-hygiene statement.
- No-Go or Conditional Go recommendation.
- Next safe action.

# Go / Conditional Go / No-Go standard

- Go: Required staging evidence exists and is classified safe without raw secrets.
- Conditional Go: Evidence is nearly complete and a narrow missing item is listed before execution.
- No-Go: Any required provider, origin, runtime, source, or secret guard evidence is missing, unknown, live-risk, production-risk, or unapproved.

Allowed evidence values:

- missing
- present
- masked prefix/suffix
- test
- live
- staging
- production-risk
- unknown
- source file
- command category

# Output format

1. Scope and safety boundary
2. Masked readiness matrix
3. Blocking env gaps
4. Conditional risks
5. Secret hygiene result
6. Gate verdict
7. Next safe step
