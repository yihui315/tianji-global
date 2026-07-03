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
  { path: '/ask', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/draw', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/relationship/new', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/pricing', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/guide', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/services', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/relationship-patterns-guide', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/free-ai-love-reading', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.45 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.45 },
  { path: '/free-relationship-compatibility-test', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/daily-love-oracle-guide', changeFrequency: 'weekly', priority: 0.75 },
  { path: '/love-timing-insights', changeFrequency: 'weekly', priority: 0.75 },
  { path: '/bazi-relationship-analysis-free', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/tarot-love-reading-online', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/how-to-get-clarity-in-relationship', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/he-loves-you-signs', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/tarot-spread-meanings', changeFrequency: 'weekly', priority: 0.85 },
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
