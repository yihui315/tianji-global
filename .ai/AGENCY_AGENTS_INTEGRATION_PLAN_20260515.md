# TianJi Love Agency Agents Integration Plan - 2026-05-15

## Goal

Adapt selected workflow ideas from `msitarzewski/agency-agents` into TianJi Love project-local Codex skills.

This is a documentation and workflow integration only. It does not install `agency-agents`, does not add an app runtime dependency, does not deploy, does not run paid smoke, and does not read or print secrets.

## What agency-agents is

`agency-agents` is a repository of specialized AI agent Markdown templates. Its README describes agents as specialized, personality-driven, deliverable-focused workflows with missions, process guidance, deliverables, and success metrics.

The repository is organized by operating disciplines such as engineering, design, product, project management, strategy, finance, marketing, sales, support, and testing. It also includes scripts for converting or installing agents into several AI coding tools.

## Why not install it into runtime

TianJi Love must not depend on `agency-agents` at application runtime because:

- The app launch state is still blocked.
- The repository is a workflow and prompt template library, not a product feature dependency.
- Full import would increase Codex context pressure.
- Generic agents could weaken current launch-gate discipline.
- Runtime install would create irrelevant dependency, audit, and maintenance surface.

The safe integration path is to adapt selected ideas into project-local skills under `.agents/skills/`.

## Useful concepts for TianJi Love

- Specialized operating roles with clear missions.
- Workflow-based execution rather than generic prompting.
- Deliverable-focused output.
- Explicit success metrics and gate criteria.
- Separate perspectives for engineering, SRE, product, revenue safety, launch control, and QA.

## Unsafe concepts right now

- Full repository import.
- Runtime package installation.
- Automatic deployment.
- Automatic paid smoke execution.
- Live Stripe API calls.
- Secret-reading workflows.
- Growth or creative agents before launch safety gates are proven.
- Copying large generic prompt libraries into every task context.

## Selected TianJi-specific skills

| Skill | Purpose |
| --- | --- |
| `tianji-launch-director` | Own the launch gate and return Go, Conditional Go, or No-Go only from evidence. |
| `tianji-env-remediation-sre` | Review masked staging env readiness and server/source evidence without printing secrets. |
| `tianji-nextjs-engineer` | Perform safe Next.js code work within launch-gate constraints. |
| `tianji-product-ux-reviewer` | Review premium mystical UX, Western clarity, mobile quality, and accessibility. |
| `tianji-revenue-safety-reviewer` | Review Stripe, price IDs, webhooks, and paid-smoke eligibility without live calls. |
| `tianji-evidence-qa` | Verify evidence packets, secret hygiene, recorded commands, and unsupported claims. |

## Integration phases

### Phase 1 - Local workflow layer

Create project-local Codex skills and integration records only.

Allowed:

- Create `.agents/skills/tianji-*/SKILL.md`.
- Create `.ai/AGENCY_AGENTS_INTEGRATION_PLAN_20260515.md`.
- Create `.ai/AGENCY_AGENTS_TIANJI_ADAPTATION_REVIEW_20260515.md`.
- Update `.ai/CHANGELOG_AI.md`.
- Update `.ai/REVIEW_PACKET.md`.
- Run targeted secret-pattern scans over the new and updated docs.

### Phase 2 - Evidence-gated usage

Use the skills in TianJi Love planning and review tasks:

- Launch director before launch/deploy claims.
- Env remediation SRE before staging env approval.
- Revenue safety reviewer before paid-smoke approval.
- Evidence QA before handing packets to the Brain thread.

### Phase 3 - Optional broader import later

Only after staging readiness and non-paid smoke are Go, consider adapting growth or marketing concepts such as product marketer, Reddit community builder, conversion copywriter, or growth strategist.

## No-Go boundaries

Current gate state:

```text
Launch: No-Go
Deploy: No-Go
Paid smoke: No-Go
Next safe milestone: masked staging env remediation
```

This integration does not approve:

- Public launch.
- Non-paid clean RC deploy.
- Paid smoke.
- Stripe live usage.
- Runtime dependency changes.
- Production env edits.
- Secret access.
- App source changes.

## Decision

Proceed with a small, TianJi-specific skill layer. Treat `agency-agents` as a reference for role design and deliverable discipline, not as a code dependency or runtime feature.
