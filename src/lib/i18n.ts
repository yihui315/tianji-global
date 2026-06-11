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
  { path: '/daily-oracle', changeFrequency: 'daily', priority: 0.8 },
  { path: '/love-reading', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/ask', changeFrequency: 'weekly', priority: 0.8 },
  // SEO pages — high priority relationship intent queries
  { path: '/does-my-ex-still-love-me', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/will-my-ex-come-back', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/does-he-miss-me', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/does-she-miss-me', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/should-i-text-my-ex', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/how-to-get-over-my-ex', changeFrequency: 'monthly', priority: 0.75 },
  { path: '/how-to-make-my-ex-miss-me', changeFrequency: 'monthly', priority: 0.75 },
  { path: '/is-my-ex-thinking-about-me', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/is-my-ex-playing-me', changeFrequency: 'monthly', priority: 0.75 },
  { path: '/how-to-manifest-my-ex-back', changeFrequency: 'monthly', priority: 0.75 },
  { path: '/signs-my-ex-regrets-leaving', changeFrequency: 'monthly', priority: 0.75 },
  { path: '/is-my-ex-narcissist', changeFrequency: 'monthly', priority: 0.75 },
  { path: '/why-my-ex-never-contacted-me', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/how-to-stop-thinking-about-my-ex', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/is-my-ex-moving-on', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/how-long-does-it-take-to-get-over-an-ex', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/twin-flame-separation-signs', changeFrequency: 'monthly', priority: 0.75 },
  { path: '/should-i-apologize-to-my-ex', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/why-do-i-keep-attracting-same-type', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/is-my-ex-my-karmic-partner', changeFrequency: 'monthly', priority: 0.75 },
  { path: '/how-to-heal-after-breakup', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/signs-twin-flame-reunion', changeFrequency: 'monthly', priority: 0.75 },
  { path: '/how-to-make-him-regret-losing-me', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/how-to-make-her-regret-leaving', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/will-we-work-out-long-distance', changeFrequency: 'monthly', priority: 0.75 },
  { path: '/is-my-relationship-fate-or-choice', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/signs-your-relationship-is-karmic', changeFrequency: 'monthly', priority: 0.75 },
  { path: '/how-to-let-go-of-someone-you-love', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/future-of-my-relationship', changeFrequency: 'weekly', priority: 0.85 },
  // P32 — 10 new long-tail SEO pages
  { path: '/can-astrology-predict-my-marriage-timeline', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/how-to-read-tarot-cards-for-relationship-advice', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/does-he-really-love-me-or-is-he-just-playing', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/my-husband-doesnt-understand-me-anymore', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/why-do-i-fall-for-unavailable-men', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/is-my-crush-flirting-or-just-being-nice', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/how-to-know-if-my-ex-is-over-me', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/signs-my-friend-is-secretly-in-love-with-me', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/how-to-deal-with-jealous-partner', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/love-forecast-this-week-june-2025', changeFrequency: 'weekly', priority: 0.75 },
  // Additional pages
  { path: '/trust', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/status', changeFrequency: 'daily', priority: 0.5 },
  { path: '/twin-flame-separation', changeFrequency: 'monthly', priority: 0.75 },
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
