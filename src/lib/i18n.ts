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
  // Home
  { path: '/', changeFrequency: 'daily', priority: 1 },
  // Core relationship tools
  { path: '/love-test', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/ask', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/draw', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/relationship/new', changeFrequency: 'weekly', priority: 0.9 },
  // Astrology & divination tools
  { path: '/tarot', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/yijing', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/bazi', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/fortune', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/western', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/numerology', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/fengshui', changeFrequency: 'monthly', priority: 0.75 },
  { path: '/synastry', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/horary', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/electional', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/transit', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/solar-return', changeFrequency: 'monthly', priority: 0.75 },
  { path: '/sky-chart', changeFrequency: 'monthly', priority: 0.75 },
  { path: '/ziwei', changeFrequency: 'weekly', priority: 0.8 },
  // Love-specific pages
  { path: '/love-reading', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/love-compatibility', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/love-match', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/free-relationship-compatibility-test', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/free-ai-love-reading', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/tarot-love-reading-online', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/bazi-relationship-analysis-free', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/love-timing-insights', changeFrequency: 'weekly', priority: 0.75 },
  { path: '/daily-love-oracle-guide', changeFrequency: 'weekly', priority: 0.75 },
  { path: '/how-to-get-clarity-in-relationship', changeFrequency: 'monthly', priority: 0.7 },
  // Celebrity
  { path: '/celebrities', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/celebrity-match', changeFrequency: 'weekly', priority: 0.75 },
  // Info pages
  { path: '/pricing', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/guide', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/services', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/relationship-patterns-guide', changeFrequency: 'monthly', priority: 0.7 },
  // Legal
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.45 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.45 },
  // Embed (public widget page)
  { path: '/embed', changeFrequency: 'monthly', priority: 0.5 },
  // Daily oracle
  { path: '/daily-oracle', changeFrequency: 'daily', priority: 0.8 },
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
