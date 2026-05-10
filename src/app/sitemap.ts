import { MetadataRoute } from 'next';
import {
  absoluteLocalizedAlternates,
  defaultLocale,
  getLocalizedPath,
  getSiteUrl,
  localizedPublicRoutes,
  locales,
} from '@/lib/i18n';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const lastModified = new Date();

  return localizedPublicRoutes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${baseUrl}${getLocalizedPath(locale, route.path)}`,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: locale === defaultLocale ? route.priority : Math.max(route.priority - 0.05, 0.1),
      alternates: {
        languages: absoluteLocalizedAlternates(route.path),
      },
    }))
  );
}
