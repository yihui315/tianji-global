# TianJi Love Agency Agents Adaptation Review - 2026-05-15

## Files created

- `.ai/AGENCY_AGENTS_INTEGRATION_PLAN_20260515.md`
- `.agents/skills/tianji-launch-director/SKILL.md`
- `.agents/skills/tianji-env-remediation-sre/SKILL.md`
- `.agents/skills/tianji-nextjs-engineer/SKILL.md`
- `.agents/skills/tianji-product-ux-reviewer/SKILL.md`
- `.agents/skills/tianji-revenue-safety-reviewer/SKILL.md`
- `.agents/skills/tianji-evidence-qa/SKILL.md`
- `.ai/AGENCY_AGENTS_TIANJI_ADAPTATION_REVIEW_20260515.md`

## Concepts adapted

- Specialized agent role boundaries.
- Mission-driven workflow sections.
- Deliverable-focused outputs.
- Explicit success and gate criteria.
- Project-management, SRE, engineering, design, revenue safety, and QA review perspectives.

## Concepts intentionally not imported

- Full `agency-agents` repository contents.
- Conversion or install scripts.
- Generic creative, growth, marketing, sales, or community agents.
- Runtime app dependencies.
- Tool-specific installers for Claude Code, Cursor, Aider, Windsurf, Gemini CLI, Qwen Code, or similar tools.
- Any workflow that can deploy, run paid smoke, call live Stripe, mutate production env, or read secrets.

## Current safety verdict

```text
Launch: No-Go
Deploy: No-Go
Paid smoke: No-Go
Next safe milestone: masked staging env remediation
```

The adaptation is safe because it creates only local docs and skills. It does not modify `tianji-global` runtime source, dependencies, env files, deployment state, server state, Stripe, Supabase, Resend, AI providers, or production configuration.

## How to use each TianJi skill

### tianji-launch-director

Use before any launch, deploy, or smoke approval claim. It should produce an executive verdict, gate matrix, blockers, risks, one next task, and explicit non-approvals.

### tianji-env-remediation-sre

Use for masked staging env readiness. It should classify evidence as missing, present, masked prefix/suffix, test/live, and source category only.

### tianji-nextjs-engineer

Use for safe Next.js implementation tasks after gate scope is approved. It should focus on routes, API handlers, auth, Ask/Draw/Relationship flows, language propagation, and build/test readiness.

### tianji-product-ux-reviewer

Use for implementation-ready premium mystical UX review across Western audience clarity, mobile readability, WCAG 2.2, homepage CTA hierarchy, relationship analysis, and trust boundaries.

### tianji-revenue-safety-reviewer

Use before any Stripe or monetization gate change. It should verify test/live classification, price IDs, webhook evidence, callback URLs, and paid-smoke eligibility without calling live Stripe.

### tianji-evidence-qa

Use before Brain review handoff. It should verify report links, changelog/review packet updates, command records, secret-pattern scan results, evidence-based verdicts, and unsupported claim removal.

## Next safe task

Run masked staging env remediation evidence review only after the required secret-safe inputs and explicit approval phrase are available. Do not deploy and do not run paid smoke.
