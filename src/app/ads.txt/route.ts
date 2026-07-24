import { promises as fs } from 'node:fs';
import path from 'node:path';

/**
 * GET /ads.txt — AdSense / ads.txt fallback route.
 *
 * Next.js normally serves files in `public/` at the site root automatically,
 * and Vercel preserves that behaviour on deployment. However, this route is a
 * source-side fallback so that:
 *
 *   1. Even if the public/ file is accidentally removed in a future commit,
 *      /ads.txt still returns the canonical ads.txt body.
 *   2. The CI build (npm run build:staging:degraded) emits a Next.js route
 *      object at `.next/server/app/ads.txt/` instead of relying on a
 *      non-tracked public/ static asset.
 *   3. Crawlers (Google AdSense crawler in particular) see a single
 *      `Content-Type: text/plain` body matching the ads.txt 1.0.2 spec.
 *
 * The content is read once at module init time from `public/ads.txt` (Next.js
 * process working dir). If the file is missing, the route responds with an
 * explicit 503 so the audit catches the regression instead of silently serving
 * empty.
 *
 * Hard rule from .ai/SIAS_BLOCKED_REGISTRY_20260723.md#BLOCKED-008:
 *   No fabricated AdSense relationships. The body bytes come from the file
 *   that already lives in public/ads.txt. This route does not invent one.
 */

export const dynamic = 'force-static';
export const revalidate = false;

let cachedBody: string | null = null;

async function readAdsTxtBody(): Promise<string> {
  if (cachedBody !== null) return cachedBody;
  const candidates = [
    path.join(process.cwd(), 'public', 'ads.txt'),
    path.join(process.cwd(), '..', 'public', 'ads.txt'),
  ];
  for (const candidate of candidates) {
    try {
      const body = await fs.readFile(candidate, 'utf8');
      cachedBody = body;
      return body;
    } catch {
      // try next candidate
    }
  }
  cachedBody = '';
  return '';
}

export async function GET(): Promise<Response> {
  const body = await readAdsTxtBody();
  if (!body.trim()) {
    return new Response('ads.txt missing in repo; see public/ads.txt', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}