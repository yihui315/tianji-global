import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/i18n';

/**
 * robots.txt — allow public landing routes; disallow private,
 * authenticated, API, and dynamic per-user routes that should not
 * appear in search results.
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard',
          '/dashboard/',
          '/login',
          '/profile',
          '/profile/',
          '/reading/',
          '/readings/',
          '/report/',
          '/*/love-reading/result/',
          '/widget/',
          '/embed/preview',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
