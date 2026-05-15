---
name: preview-qa-runner
description: QA Tianji Vercel preview or local preview builds. Use for route checks, forms, mobile layout, console errors, screenshots, share flows, and regression reporting.
---

# Preview QA Runner

## Purpose

Find user-visible issues before merge.

## When to use

Use after UI changes, before release, or when a preview deployment is available.

## Inputs

- Preview URL or local dev URL
- Changed routes
- Test accounts or safe fixtures
- Browser screenshots
- Console/network output

## Actions

1. Visit changed routes on desktop and mobile sizes.
2. Check forms, CTA paths, loading, empty, and error states.
3. Capture screenshots for visual changes.
4. Report console errors and route failures.
5. Separate blocking issues from polish.

## Constraints

- Do not use real payment methods.
- Do not submit real private data.
- Do not modify production data.

## Definition of Done

- Changed routes are checked.
- Screenshots are captured when UI changed.
- Blocking issues and residual risks are listed.

## Validation

- Browser QA
- `npm run build` when a local build is needed.
