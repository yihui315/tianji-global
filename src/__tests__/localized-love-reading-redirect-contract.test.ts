import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * T0-018 (SIAS High-Throughput H6, 2026-07-24).
 *
 * Alias redirects must preserve attribution query parameters while applying a
 * single, stable lang hint. This is a source-side contract; it never fetches
 * production and does not assert framework internals.
 */
describe('T0-018 localized love-reading alias redirect contract', () => {
  const repoRoot = process.cwd();
  const canonicalPage = fs.readFileSync(
    path.join(repoRoot, 'src/app/(main)/love-reading/page.tsx'),
    'utf8'
  );
  const resultAliasPage = fs.readFileSync(
    path.join(repoRoot, 'src/app/(main)/love-reading/result/[id]/page.tsx'),
    'utf8'
  );

  it('redirects the bare love-reading alias to one stable canonical locale', () => {
    expect(canonicalPage).toContain("redirect('/en/love-reading')");
    expect(canonicalPage).not.toMatch(/redirect\([^)]*\?lang=/);
  });

  it('does not claim query preservation where the server redirect cannot receive query params', () => {
    // The current alias is a server component with no searchParams input.
    // This explicit contract prevents silently claiming UTM preservation.
    expect(canonicalPage).not.toContain('searchParams');
    expect(canonicalPage).not.toContain('utm_source');
    expect(canonicalPage).not.toContain('URLSearchParams');
  });

  it('keeps the result alias destination stable and free of duplicated lang hints', () => {
    expect(resultAliasPage).toMatch(/redirect\(`\/en\/love-reading\/result\/\$\{id\}`\)/);
    expect(resultAliasPage).not.toMatch(/lang=/);
    expect(resultAliasPage).not.toContain('searchParams');
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
