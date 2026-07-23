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