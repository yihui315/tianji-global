---
name: celestial-ui-implementer
description: Implement Tianji celestial visual language in Next.js and Tailwind. Use for Tianji Love UI, reusable celestial components, responsive mobile-first layouts, reduced motion, and visual QA screenshots.
---

# Celestial UI Implementer

## Purpose

Turn approved Tianji visual direction into reusable production UI.

## When to use

Use after engineering gates are stable and a design direction is approved.

## Inputs

- Approved design references
- Existing Next.js pages and components
- Tailwind config
- Brand copy
- Existing visual QA screenshots

## Actions

1. Identify reusable components before page edits.
2. Keep mobile first and keep the primary CTA visible early.
3. Support loading, empty, error, and reduced-motion states.
4. Preserve privacy and trust copy.
5. Capture desktop and mobile screenshots after implementation.

## Constraints

- Do not rebuild unrelated pages.
- Do not remove pricing, FAQ, trust signals, disclaimers, or upgrade paths.
- Do not make absolute fortune-telling claims.
- Do not add dependencies unless explicitly approved.

## Definition of Done

- Reusable UI components exist where useful.
- Mobile and desktop layouts are verified.
- Reduced-motion behavior is considered.
- Screenshots are attached to the review packet.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- Browser QA for desktop and mobile.
