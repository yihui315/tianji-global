---
name: env-contract-normalizer
description: Normalize Tianji Global environment variable contracts. Use to align .env.example, runtime env usage, Vercel, Supabase, Stripe, auth, AI provider, and local development environment documentation.
---

# Env Contract Normalizer

## Purpose

Make required environment variables explicit, accurate, and safe.

## When to use

Use after repo-truth audit, before deployment, before billing/auth changes, or when runtime env errors appear.

## Inputs

- `.env.example`
- `src/**`
- `scripts/**`
- `supabase/**`
- `.github/workflows/*`
- README and deployment docs
- Vercel, Supabase, Stripe, auth, and AI provider integration code

## Actions

1. Search code and scripts for environment variable reads.
2. Compare runtime usage against `.env.example`.
3. Classify env vars as required, optional, local-only, CI-only, or production-only.
4. Add placeholders and comments to `.env.example` only; never add real secrets.
5. Align docs with npm commands and deployment expectations.
6. Flag missing validation logic for a later task.

## Constraints

- Do not edit `.env`, `.env.local`, real secrets, credentials, or production configuration.
- Do not rotate keys.
- Do not change app behavior unless explicitly requested.
- Do not add dependencies.
- Do not expose secret values in logs, docs, changelog, or review packets.

## Definition of Done

- `.env.example` lists required runtime variables with safe placeholders.
- Docs explain local setup without leaking secrets.
- Missing or ambiguous env requirements are listed for Brain review.
- CI and release guidance reference the same env contract.

## Validation

- Re-run env usage search after changes.
- Confirm no real secret-looking values were added.
- Run targeted checks only if env changes affect validation.
