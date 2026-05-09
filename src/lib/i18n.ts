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
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/pricing', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.45 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.45 },
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
  return process.env.NEXT_PUBLIC_APP_URL || 'https://tianji.global';
}

export function absoluteLocalizedAlternates(path = '/') {
  const siteUrl = getSiteUrl();
  return Object.fromEntries(
    Object.entries(localizedAlternates(path)).map(([locale, href]) => [locale, `${siteUrl}${href}`])
  );
}
