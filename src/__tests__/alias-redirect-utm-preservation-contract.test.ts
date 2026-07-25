import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  REDIRECT_ALWAYS_DROPPED_KEYS,
  REDIRECT_QUERY_WHITELIST,
  buildRedirectHref,
  buildRedirectSearch,
  hasRedirectQuery,
  pickRedirectQuery,
} from '@/lib/analytics/redirect-query';

/**
 * T0-019 + T0-020 (SIAS High-Throughput H7, 2026-07-25).
 *
 * Source-side contract for every alias redirect in the project. Aliases
 * must preserve a strict UTM whitelist (`utm_source` / `utm_medium` /
 * `utm_campaign` / `utm_content` / `utm_term`) and must NOT forward
 * anything else — including `lang`, sensitive keys, or arbitrary user
 * input. Destination locale / path is fixed by the alias target; query
 * parameters cannot redirect elsewhere.
 *
 * Covered aliases:
 *   - src/app/(main)/love-reading/page.tsx                  (T0-018, H6)
 *   - src/app/(main)/love-reading/result/[id]/page.tsx      (T0-018, H6)
 *   - src/app/[locale]/pricing/page.tsx                     (T0-019, H7)
 *   - src/app/[locale]/privacy/page.tsx                     (T0-019, H7)
 *   - src/app/[locale]/terms/page.tsx                       (T0-019, H7)
 *   - src/app/(main)/love-compatibility/page.tsx            (T0-020, H7)
 *
 * No production URL is fetched; this contract only inspects source
 * files and the pure helper exported from `redirect-query.ts`.
 */
describe('alias redirect UTM preservation contract (T0-018 + T0-019 + T0-020)', () => {
  const repoRoot = process.cwd();

  const ALIASES: ReadonlyArray<{ path: string; src: string; family: string }> = [
    {
      path: '/love-reading',
      src: 'src/app/(main)/love-reading/page.tsx',
      family: 'love-reading-canonical',
    },
    {
      path: '/love-reading/result/[id]',
      src: 'src/app/(main)/love-reading/result/[id]/page.tsx',
      family: 'love-reading-result',
    },
    {
      path: '/[locale]/pricing',
      src: 'src/app/[locale]/pricing/page.tsx',
      family: 'pricing-alias',
    },
    {
      path: '/[locale]/privacy',
      src: 'src/app/[locale]/privacy/page.tsx',
      family: 'privacy-alias',
    },
    {
      path: '/[locale]/terms',
      src: 'src/app/[locale]/terms/page.tsx',
      family: 'terms-alias',
    },
    {
      path: '/love-compatibility',
      src: 'src/app/(main)/love-compatibility/page.tsx',
      family: 'love-compatibility',
    },
  ];

  function readAlias(rel: string): string {
    return fs.readFileSync(path.join(repoRoot, rel), 'utf8');
  }

  it('locks the whitelist to the five approved UTM params', () => {
    expect([...REDIRECT_QUERY_WHITELIST].sort()).toEqual(
      ['utm_campaign', 'utm_content', 'utm_medium', 'utm_source', 'utm_term'].sort()
    );
  });

  it('every aliased page uses the shared redirect-query helper', () => {
    for (const alias of ALIASES) {
      const source = readAlias(alias.src);
      expect(source, `${alias.src} must import redirect-query`).toContain(
        "from '@/lib/analytics/redirect-query'"
      );
      expect(source, `${alias.src} must use buildRedirectHref`).toContain('buildRedirectHref');
    }
  });

  it('every alias accepts searchParams and forwards a stable destination', () => {
    for (const alias of ALIASES) {
      const source = readAlias(alias.src);
      expect(source, `${alias.src} must accept searchParams`).toContain('searchParams');
      expect(
        source,
        `${alias.src} must not hand-roll a query string outside the helper`
      ).not.toMatch(/redirect\([^)]*\?\w+=\$\{/);
    }
  });

  it('preserves every whitelisted UTM parameter when present', () => {
    const href = buildRedirectHref('/en/love-reading', {
      utm_source: 'tiktok',
      utm_medium: 'cpc',
      utm_campaign: 'summer_hook_01',
      utm_content: 'hero_cta',
      utm_term: 'first_date',
      lang: 'zh',
      token: 'secret',
      name: 'Alice',
      birthDate: '1990-01-01',
      anything: 'else',
    });
    expect(href).toContain('utm_source=tiktok');
    expect(href).toContain('utm_medium=cpc');
    expect(href).toContain('utm_campaign=summer_hook_01');
    expect(href).toContain('utm_content=hero_cta');
    expect(href).toContain('utm_term=first_date');
    expect(href).not.toContain('token=');
    expect(href).not.toContain('name=');
    expect(href).not.toContain('birthDate=');
    expect(href).not.toContain('anything=');
  });

  it('URL-encodes keys and values so spaces and reserved characters are safe', () => {
    // Next.js / WHATWG URLSearchParams use form-encoding by default:
    // spaces become "+" and "/" is percent-encoded. Both are valid and
    // decoded server-side identically. The contract asserts the safer
    // shape (no raw spaces, no raw "/") and the %2F for the path sep.
    const href = buildRedirectHref('/en/love-reading', {
      utm_source: 'tik tok',
      utm_campaign: 'spring/sale 2026',
    });
    expect(href).not.toMatch(/utm_source=tik tok/);
    expect(href).not.toMatch(/utm_campaign=spring\/sale/);
    expect(href).toContain('utm_source=tik+tok');
    expect(href).toContain('utm_campaign=spring%2Fsale+2026');
  });

  it('omits the trailing ? when no whitelisted params are present', () => {
    expect(buildRedirectSearch({ lang: 'zh', token: 'x', foo: 'bar' })).toBe('');
    expect(buildRedirectHref('/en/love-reading', { lang: 'zh' })).toBe('/en/love-reading');
    expect(hasRedirectQuery({ lang: 'zh' })).toBe(false);
  });

  it('handles array values deterministically (first non-empty wins)', () => {
    const picked = pickRedirectQuery({
      utm_source: ['tiktok', 'instagram'],
      utm_medium: ['', 'email'],
      utm_campaign: 'fall',
    });
    expect(picked.utm_source).toBe('tiktok');
    expect(picked.utm_medium).toBe('email');
    expect(picked.utm_campaign).toBe('fall');

    const href = buildRedirectHref('/en/love-reading', {
      utm_source: ['', 'instagram'],
      utm_campaign: 'fall',
    });
    expect(href).toContain('utm_source=instagram');
    expect(href).toContain('utm_campaign=fall');
  });

  it('always drops lang and sensitive / arbitrary keys', () => {
    expect(REDIRECT_ALWAYS_DROPPED_KEYS.has('lang')).toBe(true);
    for (const key of [
      'lang',
      'token',
      'userId',
      'name',
      'birthDate',
      'birthTime',
      'relationship',
      'session',
    ]) {
      const out = buildRedirectHref('/en/love-reading', { [key]: 'value' });
      expect(out, `${key} must be dropped`).toBe('/en/love-reading');
    }
  });

  it('alias destinations cannot be redirected elsewhere by query parameters', () => {
    // Each alias has a fixed destination; query must never flip it.
    const destinations = [
      { alias: 'love-reading-canonical', href: '/en/love-reading' },
      { alias: 'love-reading-result', href: '/en/love-reading/result/abc' },
      { alias: 'pricing-alias', href: '/pricing?lang=zh' },
      { alias: 'privacy-alias', href: '/legal/privacy?lang=zh' },
      { alias: 'terms-alias', href: '/legal/terms?lang=zh' },
      { alias: 'love-compatibility', href: '/relationship/new' },
    ];
    for (const { alias, href: basePath } of destinations) {
      const queryAttempts = [
        { utm_source: 'tiktok', path: '/admin' },
        { utm_source: 'tiktok', redirect: 'https://evil.example' },
        { utm_source: 'tiktok', dest: '/admin' },
      ];
      for (const q of queryAttempts) {
        const href = buildRedirectHref(basePath, q);
        expect(
          href.startsWith(basePath + (Object.values(q).some((v) => String(v).length > 0) ? '?' : '')) ||
            href === basePath,
          `${alias}: query must not change destination (got ${href})`
        ).toBe(true);
        expect(href, `${alias}: path= must be dropped`).not.toContain('path=');
        expect(href, `${alias}: redirect= must be dropped`).not.toContain('redirect=');
        expect(href, `${alias}: dest= must be dropped`).not.toContain('dest=');
        expect(href, `${alias}: external URL must be dropped`).not.toContain('evil.example');
      }
    }
  });

  it('love-reading result [id] stays in the path and cannot be overridden', () => {
    const href = buildRedirectHref('/en/love-reading/result/abc', {
      utm_source: 'tiktok',
      id: 'overridden-id',
      redirect: '/admin',
    });
    expect(href.startsWith('/en/love-reading/result/abc')).toBe(true);
    expect(href).not.toContain('redirect=');
    expect(href).not.toContain('id=');
    expect(href).not.toContain('lang=');
  });

  it('localized pricing / privacy / terms aliases keep their canonical lang hint', () => {
    // The canonical destination must always include the canonical lang=
    // query even when the caller passes only whitelisted UTM.
    const source = readAlias('src/app/[locale]/pricing/page.tsx');
    expect(source).toMatch(/permanentRedirect\(buildRedirectHref\(`\/pricing\?lang=/);
    for (const [file, basePath] of [
      ['src/app/[locale]/pricing/page.tsx', '/pricing?lang=en'],
      ['src/app/[locale]/privacy/page.tsx', '/legal/privacy?lang=en'],
      ['src/app/[locale]/terms/page.tsx', '/legal/terms?lang=en'],
    ] as const) {
      const href = buildRedirectHref(basePath, { utm_source: 'tiktok' });
      expect(href.startsWith(basePath + '?'), `${file}: lang hint must persist`).toBe(true);
      expect(href, `${file}: utm_source must be forwarded`).toContain('utm_source=tiktok');
    }
  });
});