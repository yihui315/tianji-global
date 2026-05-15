import type { Metadata } from 'next';
import {
  absoluteLocalizedAlternates,
  getLocalizedPath,
  getSiteUrl,
  localeOpenGraph,
  type Locale,
} from '@/lib/i18n';

interface LocalizedMetadataInput {
  locale: Locale;
  path: string;
  title: string;
  description: string;
}

export function buildLocalizedMetadata({
  locale,
  path,
  title,
  description,
}: LocalizedMetadataInput): Metadata {
  const siteUrl = getSiteUrl();
  const pathname = getLocalizedPath(locale, path);
  const ogImage = `/api/og?title=TianJi+Love&subtitle=${encodeURIComponent(description)}`;

  return {
    title,
    description,
    alternates: {
      canonical: pathname,
      languages: absoluteLocalizedAlternates(path),
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${siteUrl}${pathname}`,
      siteName: 'TianJi Global',
      locale: localeOpenGraph[locale],
      alternateLocale: locale === 'en' ? ['zh_CN'] : ['en_US'],
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}
