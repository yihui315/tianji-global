---
name: share-card-og-builder
description: Build Tianji social share cards, OG images, and report share pages. Use for privacy-safe share payloads, dynamic OG routes, visual QA, and viral sharing flows.
---

# Share Card OG Builder

## Purpose

Create attractive share experiences without exposing private birth data.

## When to use

Use for OG image routes, share cards, share pages, and share copy.

## Inputs

- Share routes and components
- OG image generation code
- Report payloads
- Privacy rules
- Visual references

## Actions

1. Define what data is safe to share.
2. Build visual output from public-safe fields only.
3. Preserve upgrade and trust paths.
4. Add tests or audits for privacy-sensitive payloads.
5. Capture visual QA screenshots.

## Constraints

- Never expose birth date, birth time, birth location, or timezone by default.
- Do not include private report details unless explicitly shared.
- Do not make absolute prediction claims.

## Definition of Done

- Share payload is privacy-safe.
- OG image renders at expected dimensions.
- Share route has loading/error behavior.
- Audit or tests cover private data exclusion.

## Validation

- `npm run audit:share`
- `npm run typecheck`
- Browser or image route QA.
