import type { Metadata } from 'next';
import { JsonLd, SITE, buildBreadcrumb } from '@/components/seo/JsonLd';

const TITLE = 'About TianJi | 关于天机 — Premium AI Divination, Without the Anxiety Sales';
const DESCRIPTION =
  'TianJi is a divination service for people who want a practice, not a one-time curiosity. Read our four commitments, how we handle your data, and how to delete it in 14 days.';
const OG_URL = '/api/og?title=About+TianJi&subtitle=No+outcome+sales+%C2%B7+No+anxiety+sales&module=tianji';
const PAGE_URL = `${SITE.url}/about`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'About TianJi Global' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_URL],
  },
};

const breadcrumbLd = buildBreadcrumb([
  { name: 'TianJi · 首页', path: '/' },
  { name: 'About · 关于', path: '/about' },
]);

const aboutPageLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${PAGE_URL}#aboutpage`,
  url: PAGE_URL,
  name: 'About TianJi',
  description: DESCRIPTION,
  inLanguage: ['zh', 'en'],
  isPartOf: { '@id': `${SITE.url}#website` },
  about: { '@id': `${SITE.url}#organization` },
  mainEntity: { '@id': `${SITE.url}#organization` },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={aboutPageLd} />
      {children}
    </>
  );
}
