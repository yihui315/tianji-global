# Tianji Release Checklist

Use this prompt context for `release-captain`, `preview-qa-runner`, and final merge readiness reviews.

## Required Checks

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run audit:routes`
- `npm run audit:copy`
- `npm run audit:share`
- `npm run audit:upgrade`

If `npm run release:check` exists, use it as the blocking release command.

## Release Review

Confirm:

- CI is green.
- Vercel preview renders changed routes.
- Mobile critical paths work.
- No horizontal overflow appears on key pages.
- Stripe test flow works when billing changed.
- Supabase migration and RLS status are documented when database changed.
- Privacy pages, disclaimers, sitemap, and hreflang are updated when relevant.
- Rollback plan is written.
- Known issues are listed.

## Go/No-Go Rule

Do not recommend release when validation fails, privacy safeguards regress, billing entitlements are unverified, migrations lack rollback notes, or production actions require approval that has not been granted.
