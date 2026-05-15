---
name: agents-md-curator
description: Maintain Tianji Global AGENTS.md instructions. Use when updating repository or subdirectory agent rules for billing, privacy, database, content, UI, testing, screenshots, and safe Codex execution.
---

# AGENTS.md Curator

## Purpose

Keep Codex instructions accurate, scoped, and enforceable.

## When to use

Use after repo-truth audit, before enabling new agent workflows, or when a subsystem needs specific safety rules.

## Inputs

- Root `AGENTS.md`
- Existing subdirectory `AGENTS.md` files
- `package.json`
- `.github/workflows/*`
- `README.md`
- `docs/**`
- `supabase/**`
- Relevant source directories

## Actions

1. Read existing AGENTS instructions before editing.
2. Remove contradictions or stale commands.
3. Keep the root file focused on universal rules.
4. Add subdirectory AGENTS files only when local rules prevent concrete mistakes.
5. Capture non-negotiables for privacy, billing, auth, database, UI QA, tests, and copy safety.
6. Preserve existing relationship experiment rules unless Brain explicitly changes priority.

## Constraints

- Do not turn AGENTS.md into a long project spec.
- Do not add broad product strategy unrelated to agent behavior.
- Do not weaken privacy rules about birth date, birth time, birth location, or timezone.
- Do not change source code, CI, env files, or migrations in the same task.

## Definition of Done

- Instructions match actual npm scripts and repository structure.
- Payment, privacy, database, auth, UI, and copy safety rules are clear.
- Subdirectory AGENTS files exist only where they reduce execution risk.
- Future agents can identify validation commands without guessing.

## Validation

- Read the final AGENTS files for contradictions.
- Confirm referenced commands exist in `package.json`.
- Confirm no source or secret files changed.
