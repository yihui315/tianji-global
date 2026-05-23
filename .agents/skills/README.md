# Tianji Agent Skill Catalog

This directory is the active repository-local Skill catalog for Tianji Global.

The proposal in the product plan mentioned `.codex/skills`, but the current workspace decision is to keep executable repository Skills in `.agents/skills/<skill-name>/SKILL.md`. The `.codex` directory remains available for Codex agent prompts and shared prompt material.

## Repository Truth

- Primary project: `tianji-global`
- Package manager: npm
- Lockfile: `package-lock.json`
- Do not introduce pnpm commands unless the repository explicitly migrates.
- Do not change UI, product behavior, env files, secrets, database migrations, Stripe, Supabase, auth, billing, or production configuration while working on governance Skills unless the task explicitly allows it.

## Active Skills

### P0 - Make Codex Trustworthy

1. `repo-truth-auditor`
2. `ci-release-gate-builder`
3. `agents-md-curator`
4. `pr-triage-deduplicator`

Use these before broad feature work. They keep scripts, CI, docs, env contracts, and agent rules aligned with what actually runs.

### P1 - Commercial And Compliance Foundation

5. `env-contract-normalizer`
6. `stripe-subscription-builder`
7. `supabase-rls-migration-builder`
8. `trust-copy-guard`

Use these before paid growth work. Payment, privacy, database, auth, and legal-risk surfaces require Brain and human review before merge.

### P2 - Product Experience

9. `celestial-ui-implementer`
10. `relationship-flow-builder`
11. `i18n-seo-localizer`
12. `share-card-og-builder`

Use these after the P0/P1 gates are stable. UI work must include mobile checks, reduced-motion consideration, privacy-safe copy, and screenshots when visual changes are made.

### P3 - Release And Growth Operations

13. `async-report-job-builder`
14. `analytics-instrumenter`
15. `preview-qa-runner`
16. `release-captain`

Use these for launch readiness, conversion instrumentation, preview QA, and release decisions.

## Shared Prompt Materials

Shared prompts live in `.codex/prompts`:

- `product-brief.md`
- `design-rules.md`
- `legal-copy-rules.md`
- `release-checklist.md`

Skill files should remain concise and operational. Put reusable product, copy, design, and release context in shared prompts instead of duplicating it across every Skill.

## Compare-Audit Implementation Notes

The source proposal contains a wider candidate pool than the active 16-Skill catalog. Keep candidate Skills out of this directory until Brain promotes them, otherwise agents will have too many overlapping workflows.

Deferred candidates:

- `test-generator`
- `security-privacy-auditor`
- `mobile-first-polisher`
- `privacy-center-builder`
- `legal-page-maintainer`
- `locale-market-adapter`
- `issue-to-pr-planner`
- `docs-sync-maintainer`

## Operating Rule

One Skill should solve one repeated workflow. One PR should complete one verifiable goal. One agent should own one worktree or clearly bounded file scope. Merge governance, env, payment, privacy, database, and release changes serially.
