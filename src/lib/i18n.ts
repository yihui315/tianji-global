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

// ─── Public sitemap routes ────────────────────────────────────────────────────
// High-priority SEO pages (top performers / conversion entry points)
const publicRoutes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}> = [
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/ask', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/draw', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/love-test', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/relationship/new', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/pricing', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/free-relationship-compatibility-test', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/love-compatibility', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/love-compatibility-zodiac-2024', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/compatibility-zodiac-signs', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/he-loves-you-signs', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/free-ai-love-reading', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/tarot-love-reading-online', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/tarot-spread-meanings', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/how-to-read-tarot-cards-for-beginners', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/bazi-relationship-analysis-free', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/love-timing-insights', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/love-reading', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/bazi', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/tarot', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/synastry', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/love-match', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/daily-oracle', changeFrequency: 'weekly', priority: 0.75 },
  { path: '/daily-love-oracle-guide', changeFrequency: 'weekly', priority: 0.75 },
  // Mid-priority content & tools
  { path: '/guide', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/services', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/relationship-patterns-guide', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/how-to-get-clarity-in-relationship', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/resources/love-calculator', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/fortune', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/fengshui', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/yijing', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/western', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/transit', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/numerology', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/celebrities', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/celebrity-match', changeFrequency: 'monthly', priority: 0.6 },
  // Blog & content hub
  { path: '/blog', changeFrequency: 'weekly', priority: 0.75 },
  // Trust & legal pages
  { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/legal/privacy', changeFrequency: 'yearly', priority: 0.45 },
  { path: '/legal/terms', changeFrequency: 'yearly', priority: 0.45 },
  { path: '/privacy-center', changeFrequency: 'yearly', priority: 0.3 },
];

export const localizedPublicRoutes = publicRoutes;

export function isSupportedLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export function getLocalizedPath(locale: Locale, path = '/') {
  const normalizedPath = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${normalizedPath}`;
}

export const localizedAlternates = (path = '/') => ({
  en: getLocalizedPath('en', path),
  'zh-CN': getLocalizedPath('zh-CN', path),
  'x-default': getLocalizedPath(defaultLocale, path),
});

export const getSiteUrl = () => process.env.NEXT_PUBLIC_APP_URL || 'https://tianji.love';

export const absoluteLocalizedAlternates = (path = '/') => {
  const siteUrl = getSiteUrl();
  return Object.fromEntries(
    Object.entries(localizedAlternates(path)).map(([locale, href]) => [locale, `${siteUrl}${href}`])
  );
};
