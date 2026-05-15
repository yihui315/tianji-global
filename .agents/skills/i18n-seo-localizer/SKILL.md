---
name: i18n-seo-localizer
description: Localize Tianji Global for international SEO. Use for /en, /zh-CN, hreflang, sitemap, metadata, localized copy keys, locale routing, and market-specific wording.
---

# I18n SEO Localizer

## Purpose

Keep multilingual UX and SEO consistent across markets.

## When to use

Use for locale routing, metadata, sitemap, hreflang, translation keys, and localized landing or report copy.

## Inputs

- Locale routing code
- Translation files
- Metadata and sitemap code
- Existing page copy
- SEO docs

## Actions

1. Confirm existing locale architecture before editing.
2. Keep copy keys synchronized across supported locales.
3. Add hreflang and metadata changes consistently.
4. Avoid absolute fortune-telling claims in every locale.
5. Validate no route regressions.

## Constraints

- Do not hardcode one locale into shared components.
- Do not leave untranslated user-visible strings.
- Do not change product claims beyond the localization scope.

## Definition of Done

- Locale routes and metadata are consistent.
- Copy keys are complete.
- SEO changes are reflected in sitemap or metadata where needed.

## Validation

- `npm run typecheck`
- `npm run build`
- Route audit when relevant.
