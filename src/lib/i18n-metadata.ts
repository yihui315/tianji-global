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
  type?: 'website' | 'article';
  publishedTime?: string;
  authors?: string[];
}

export function buildLocalizedMetadata({
  locale,
  path,
  title,
  description,
  type = 'website',
  publishedTime,
  authors,
}: LocalizedMetadataInput): Metadata {
  const siteUrl = getSiteUrl();
  const pathname = getLocalizedPath(locale, path);
  const ogImage = `/api/og?title=TianJi+Love&subtitle=${encodeURIComponent(description)}`;

  const metadata: Metadata = {
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
      siteName: 'TianJi Love',
      locale: localeOpenGraph[locale],
      alternateLocale: locale === 'en' ? ['zh_CN'] : ['en_US'],
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };

  if (type === 'article' && publishedTime) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      publishedTime,
      authors: authors ?? ['TianJi Love'],
    };
    metadata.other = {
      'article:published_time': publishedTime,
    };
  }

  return metadata;
}

/**
 * JSON-LD Article schema for SEO blog/advice pages.
 * Add to page <head> via: <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: articleSchema(...) }} />
 */
export function articleSchema(opts: {
  title: string;
  description: string;
  url: string;
  publishedTime: string;
  modifiedTime?: string;
  locale: string;
}): string {
  const { title, description, url, publishedTime, modifiedTime, locale } = opts;
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    datePublished: publishedTime,
    dateModified: modifiedTime ?? publishedTime,
    author: { '@type': 'Organization', name: 'TianJi Love' },
    publisher: {
      '@type': 'Organization',
      name: 'TianJi Love',
      logo: { '@type': 'ImageObject', url: `${getSiteUrl()}/assets/favicon.svg` },
    },
    inLanguage: locale,
    isAccessibleForFree: true,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  });
}

/**
 * JSON-LD WebSite schema for home page.
 */
export function websiteSchema(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TianJi Love',
    url: getSiteUrl(),
    description: 'AI-powered love readings, relationship compatibility analysis, and tarot readings.',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${getSiteUrl()}/en/does-my-ex-still-love-me` },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'TianJi Love',
      logo: { '@type': 'ImageObject', url: `${getSiteUrl()}/assets/favicon.svg` },
    },
  });
}
