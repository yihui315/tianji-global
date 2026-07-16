import { MetadataRoute } from 'next';
import {
  absoluteLocalizedAlternates,
  defaultLocale,
  getLocalizedPath,
  getSiteUrl,
  localizedPublicRoutes,
  locales,
} from '@/lib/i18n';

type SitemapRoute = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
  hasLocaleVariant?: boolean;
};

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = [];

  for (const route of localizedPublicRoutes as SitemapRoute[]) {
    if (route.hasLocaleVariant) {
      // Generate /en and /zh-CN prefixed versions
      for (const locale of locales) {
        entries.push({
          url: `${baseUrl}${getLocalizedPath(locale, route.path)}`,
          lastModified,
          changeFrequency: route.changeFrequency,
          priority: locale === defaultLocale ? route.priority : Math.max(route.priority - 0.05, 0.1),
          alternates: {
            languages: absoluteLocalizedAlternates(route.path),
          },
        });
      }
    } else {
      // No locale prefix — just the bare path
      entries.push({
        url: `${baseUrl}${route.path}`,
        lastModified,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      });
    }
  }

  return entries;
}
