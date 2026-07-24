import type { MetadataRoute } from 'next';

export const locales = ['en', 'zh-CN'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  'zh-CN': '简体中文',
};

export const localeOpenGraph: Record<Locale, string> = {
  en: 'en_US',
  'zh-CN': 'zh_CN',
};

export type SitemapRoute = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
  hasLocaleVariant?: boolean;
};

export const localizedPublicRoutes: SitemapRoute[] = [
  // Homepage — no locale prefix, served by (main)
  { path: '/', changeFrequency: 'daily', priority: 1 },
  // Core tools — no locale prefix, served by (main)
  { path: '/love-test', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/ask', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/draw', changeFrequency: 'weekly', priority: 0.85 },
  // love-reading — has [locale] variant: /en/love-reading and /zh-CN/love-reading
  { path: '/love-reading', changeFrequency: 'weekly', priority: 0.9, hasLocaleVariant: true },
  // Pricing has one canonical public route. Locale aliases permanently redirect here.
  { path: '/pricing', changeFrequency: 'weekly', priority: 0.9 },
  // Daily-oracle — entry funnel surface (5 funnel events tracked); now SEO-aware + sitemap-indexed.
  { path: '/daily-oracle', changeFrequency: 'daily', priority: 0.9 },
  // About — SEO + OG layout already shipped; H4 T0-014 (BLOCKED-014 resolution, decision A)
  // surfaces it in the public sitemap so crawlers reach the AboutPage JsonLd via
  // /sitemap.xml instead of relying on internal links alone.
  { path: '/about', changeFrequency: 'monthly', priority: 0.6 },
  // Legal pages use one canonical route each. Locale aliases permanently redirect here.
  { path: '/legal/privacy', changeFrequency: 'yearly', priority: 0.45 },
  { path: '/legal/terms', changeFrequency: 'yearly', priority: 0.45 },
];

export function isSupportedLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export function getLocalizedPath(locale: Locale, path = '/') {
  const normalizedPath = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${normalizedPath}`;
}

export function localizedAlternates(path = '/') {
  return {
    en: getLocalizedPath('en', path),
    'zh-CN': getLocalizedPath('zh-CN', path),
    'x-default': getLocalizedPath(defaultLocale, path),
  };
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://tianji.love';
}

export function absoluteLocalizedAlternates(path = '/') {
  const siteUrl = getSiteUrl();
  return Object.fromEntries(
    Object.entries(localizedAlternates(path)).map(([locale, href]) => [locale, `${siteUrl}${href}`])
  );
}
