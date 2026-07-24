# SIAS Learning Note — 2026-07-23 (Round 1)

## Pattern captured

**Server-component `layout.tsx` is the right place for SEO on a `'use client'` page in tianji-global.**

- A `page.tsx` that is `'use client'` cannot export `metadata` (Next.js disallows it).
- A sibling `layout.tsx` in the same directory **is** a server component by default and **can** export `metadata` + render `<JsonLd>` while still wrapping the client page.
- The pattern is already used at `src/app/(main)/pricing/layout.tsx` and works correctly for crawlers, OG, Twitter, and structured data.

## How to replicate (5 lines of net code per surface)

For each `'use client'` page that wants SEO + JsonLd:

```tsx
// src/app/(main)/<surface>/layout.tsx
import type { Metadata } from 'next';
import { JsonLd, SITE, buildBreadcrumb } from '@/components/seo/JsonLd';

const TITLE = '...';
const DESCRIPTION = '...';
const PAGE_URL = `${SITE.url}/<surface>`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PAGE_URL, type: 'website', images: [...] },
  twitter:   { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [...] },
};

const breadcrumbLd = buildBreadcrumb([{ name: 'Tianji Love Home', path: '/' }, { name: 'Surface', path: '/<surface>' }]);
const surfaceLd    = { '@context': 'https://schema.org', '@type': 'WebApplication', /* ... */ };

export default function SurfaceLayout({ children }: { children: React.ReactNode }) {
  return (<><JsonLd data={breadcrumbLd} /><JsonLd data={surfaceLd} />{children}</>);
}
```

## Side-by-side: pricing vs daily-oracle

| element | pricing/layout.tsx | daily-oracle/layout.tsx |
|---------|-------------------|-------------------------|
| `metadata` export | ✓ | ✓ |
| alternates.canonical | `${SITE.url}/pricing` | `${SITE.url}/daily-oracle` |
| OpenGraph + Twitter | ✓ | ✓ |
| Breadcrumb JsonLd | ✓ | ✓ |
| Schema.org `@type` | `Product` (paid offers) | `WebApplication` (free + bilingual + private) |
| FAQ JsonLd | 5 Qs | 3 Qs (lighter — daily oracle has fewer surfaces) |
| `isAccessibleForFree: true` | n/a | ✓ |

## Anti-patterns to avoid

- ❌ Don't add a `'use client'` `layout.tsx` — that disables the metadata export.
- ❌ Don't duplicate the breadcrumb / WebApplication / FAQ `@id` — each must be unique per page (e.g. `#faq`, `#webapp`).
- ❌ Don't promise outcomes in any copy or FAQ answer; mirror the existing disclaimer shape.
- ❌ Don't add the page to `localizedPublicRoutes` without verifying the path actually exists at build time (it should appear in `.next/server/app/sitemap.xml.body` after `npm run build:staging:degraded`).

## Discoverability side-effect

Adding a route to `localizedPublicRoutes` automatically registers it in `/sitemap.xml` because `src/app/sitemap.ts` iterates over that array. No separate sitemap registration is needed.

## What this lets future SIAS rounds do

- Replicate the pattern for any other `'use client'` funnel page (T0-002 = `/love-test`, T0-008 = `/relationship/new`).
- The validation gate is small and predictable: typecheck + lint + a tiny contract test + sitemap body grep.
- The risk surface is bounded to "metadata not picked up by Next" — easy to spot in the build output.
## Merge Train Hold — 2026-07-24

### Pattern

When a SIAS round opens multiple autonomous-safe Draft PRs in parallel, the next phase is NOT a new round. It is a **merge train hold** — a deliberate pause during which:

1. The agent does NOT write new code.
2. The agent does NOT start a new H3 / H4 / Run.
3. The agent marks each Draft PR Ready for review (Draft → Ready is not self-approval and does not bypass branch protection).
4. The agent writes `.ai/MERGE_TRAIN_HOLD_<DATE>.md` with the merge order, the per-PR checklist, and the scope of "permanent approval" if one exists.
5. The user Approves + Squash-merges + Deletes each branch in order.
6. Only AFTER the user confirms all merges are done, the agent runs `git fetch && git checkout main && git reset --hard origin/main`, deletes local stale branches, and writes `.ai/MERGE_TRAIN_FINAL_<DATE>.md`.

### Hard rule: agent never self-merges

This was already in the user-profile hard rule, but the merge train reinforces it concretely:

- `gh pr merge --admin` would bypass branch protection. NEVER.
- `gh pr merge --auto` with a self-supplied approval token is a self-merge. NEVER.
- The agent can mark a Draft PR Ready for review (this is not approval). It cannot Approve. It cannot merge.

### Permanent-approval scope (user ruling 2026-07-24)

A "permanent approval" — if any is ever granted by the user — applies ONLY to source-safe / test / docs / Draft PR operations. It does NOT cover:

- production deploy
- live Stripe
- production Supabase mutation
- real paid smoke
- secrets / .env
- .github/workflows/*
- STAGING-004
- 154.217.241.238
- auto merge
- self-approve / self-merge

When a task touches any of the above, escalate to the user for explicit, named, in-the-moment approval.

### Why this matters

A merge train can stack 4–10 PRs without conflict only if the agent refuses to write code while the train is running. The moment the agent starts a new round, the next round's `git fetch origin` will pull partial merges and the local working tree will drift. The discipline is: hold, wait for the user, sync once, then continue.
