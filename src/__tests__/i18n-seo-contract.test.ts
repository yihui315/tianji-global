import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function exists(relativePath: string) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

describe('localized SEO routing contract', () => {
  it('defines en and zh-CN locale helpers with hreflang alternates', async () => {
    const i18n = await import('../lib/i18n');

    expect(i18n.locales).toEqual(['en', 'zh-CN']);
    expect(i18n.defaultLocale).toBe('en');
    expect(i18n.isSupportedLocale('en')).toBe(true);
    expect(i18n.isSupportedLocale('zh-CN')).toBe(true);
    expect(i18n.isSupportedLocale('fr')).toBe(false);
    expect(i18n.getLocalizedPath('zh-CN', '/pricing')).toBe('/zh-CN/pricing');
    expect(i18n.localizedAlternates('/privacy')).toEqual({
      en: '/en/privacy',
      'zh-CN': '/zh-CN/privacy',
      'x-default': '/en/privacy',
    });
  });

  it('adds the required localized routes and page metadata', () => {
    [
      'src/app/[locale]/page.tsx',
      'src/app/[locale]/love-reading/result/[id]/page.tsx',
      'src/app/[locale]/pricing/page.tsx',
      'src/app/[locale]/privacy/page.tsx',
      'src/app/[locale]/terms/page.tsx',
    ].forEach((routeFile) => expect(exists(routeFile), `${routeFile} should exist`).toBe(true));

    const localeLayout = read('src/app/[locale]/layout.tsx');
    const metadataHelper = read('src/lib/i18n-metadata.ts');
    expect(localeLayout).toContain('generateMetadata');
    expect(localeLayout).toContain('buildLocalizedMetadata');
    expect(metadataHelper).toContain('alternates');
    expect(metadataHelper).toContain('languages');
    expect(metadataHelper).toContain('openGraph');
    expect(metadataHelper).toContain('/api/og?title=TianJi+Love');
  });

  it('localizes the public sitemap around locale subpaths', () => {
    const sitemap = read('src/app/sitemap.ts');
    const i18n = read('src/lib/i18n.ts');

    expect(sitemap).toContain('localizedPublicRoutes');
    expect(i18n).toContain('/pricing');
    expect(i18n).toContain('/privacy');
    expect(i18n).toContain('/terms');
    expect(sitemap).toContain('getLocalizedPath(locale, route.path)');
  });

  it('uses safer love-reading copy in both locales without mojibake', () => {
    const pages = [
      read('src/app/[locale]/page.tsx'),
      read('src/app/[locale]/pricing/page.tsx'),
      read('src/app/[locale]/privacy/page.tsx'),
      read('src/app/[locale]/terms/page.tsx'),
    ].join('\n');

    expect(pages).toContain('Discover patterns.');
    expect(pages).toContain('Make clearer relationship choices.');
    expect(pages).toContain('爱，是唯一能改变命运的变量。');
    expect(pages).toContain('个人爱情报告');
    expect(pages).not.toContain('TianJi Plus monthly');
    expect(pages).not.toMatch(/涓|鐖|绉|鍏崇郴|瑙ｈ/);
    expect(pages).not.toMatch(/We predict your future|Find your soulmate|Know exactly when love will arrive/i);
  });
});
