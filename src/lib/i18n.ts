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

export const localizedPublicRoutes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}> = [
  // Homepage (no locale prefix — served by (main) route group)
  { path: '/', changeFrequency: 'daily', priority: 1 },
  // Core tools (no locale prefix — served by (main) route group)
  { path: '/love-test', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/ask', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/draw', changeFrequency: 'weekly', priority: 0.85 },
  // love-reading — served by [locale] route group (has /en and /zh-CN)
  { path: '/love-reading', changeFrequency: 'weekly', priority: 0.9 },
  // Pricing (no locale prefix)
  { path: '/pricing', changeFrequency: 'weekly', priority: 0.9 },
  // Privacy center (no locale prefix)
  { path: '/privacy-center', changeFrequency: 'yearly', priority: 0.5 },
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
