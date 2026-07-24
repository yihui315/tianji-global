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
 * T0-018 (SIAS High-Throughput H6, 2026-07-24, post-review amendment).
 *
 * Source-side contract for the localized love-reading alias redirects.
 * Aliases must preserve a strict UTM whitelist (utm_source / utm_medium /
 * utm_campaign / utm_content / utm_term) and must NOT forward anything
 * else, including `lang`, sensitive keys, or arbitrary user input.
 *
 * No production URL is fetched; this contract only inspects source
 * files and the pure helper exported from `redirect-query.ts`.
 */
describe('T0-018 localized love-reading alias redirect contract', () => {
  const repoRoot = process.cwd();
  const canonicalAlias = fs.readFileSync(
    path.join(repoRoot, 'src/app/(main)/love-reading/page.tsx'),
    'utf8'
  );
  const resultAlias = fs.readFileSync(
    path.join(repoRoot, 'src/app/(main)/love-reading/result/[id]/page.tsx'),
    'utf8'
  );

  it('uses the shared redirect-query helper in both alias pages', () => {
    expect(canonicalAlias).toContain("from '@/lib/analytics/redirect-query'");
    expect(canonicalAlias).toContain('buildRedirectHref');
    expect(resultAlias).toContain("from '@/lib/analytics/redirect-query'");
    expect(resultAlias).toContain('buildRedirectHref');
  });

  it('locks the whitelist to the five approved UTM params', () => {
    expect([...REDIRECT_QUERY_WHITELIST].sort()).toEqual(
      ['utm_campaign', 'utm_content', 'utm_medium', 'utm_source', 'utm_term'].sort()
    );
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
    expect(href).not.toContain('lang=');
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
    // First non-empty entry wins. Leading empty strings (form-parser
    // sentinel) must NOT shadow the next real value.
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

  it('keeps the result [id] in the path and never lets query change the destination', () => {
    expect(resultAlias).toMatch(/redirect\(buildRedirectHref\(`\/en\/love-reading\/result\/\$\{id\}/);
    const queryAttempts = [
      { lang: 'zh', utm_source: 'tiktok' },
      { utm_source: 'tiktok', id: 'overridden-id' },
      { utm_source: 'tiktok', redirect: '/admin' },
    ];
    for (const q of queryAttempts) {
      const href = buildRedirectHref('/en/love-reading/result/abc', q);
      expect(href.startsWith('/en/love-reading/result/abc')).toBe(true);
      expect(href).not.toContain('redirect=');
      expect(href).not.toContain('id=');
      expect(href).not.toContain('lang=');
    }
  });

  it('does not allow query parameters to change the redirect destination', () => {
    const href = buildRedirectHref('/en/love-reading', {
      utm_source: 'tiktok',
      path: '/admin',
      dest: 'https://evil.example',
    });
    expect(href.startsWith('/en/love-reading?')).toBe(true);
    expect(href).not.toContain('path=');
    expect(href).not.toContain('dest=');
    expect(href).not.toContain('evil.example');
  });

  it('records the localized implementations as the only supported locale destinations', () => {
    const localizedPage = fs.readFileSync(
      path.join(repoRoot, 'src/app/[locale]/love-reading/page.tsx'),
      'utf8'
    );
    expect(localizedPage).toContain("locales.map((locale) => ({ locale }))");
    expect(localizedPage).toContain("'zh-CN'");
    expect(localizedPage).toContain("'en'");
  });
});