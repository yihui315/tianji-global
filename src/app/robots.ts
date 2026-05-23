import { MetadataRoute } from 'next';
import { SITE } from '@/components/seo/JsonLd';

/**
 * robots.txt — allow public landing routes; disallow private,
 * authenticated, API, and dynamic per-user routes that should not
 * appear in search results.
 */
export default function robots(): MetadataRoute.Robots {
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
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
