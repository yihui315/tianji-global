import type { Metadata } from 'next';
import { JsonLd, SITE, buildBreadcrumb } from '@/components/seo/JsonLd';

const TITLE = 'Celebrity Charts Database | 名人星盘库 — Verified Birth Data, BaZi + Western';
const DESCRIPTION =
  'Browse our curated database of public-figure birth charts. Each entry includes verified birth data and computed BaZi + Western chart highlights.';
const OG_URL = '/api/og?title=Celebrity+Charts&subtitle=Verified+birth+data&module=tianji';
const PAGE_URL = `${SITE.url}/celebrities`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'TianJi Celebrity Charts' }],
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
  { name: 'Celebrity Charts · 名人星盘库', path: '/celebrities' },
]);

const collectionLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${PAGE_URL}#collection`,
  url: PAGE_URL,
  name: 'TianJi Celebrity Charts Database',
  description: DESCRIPTION,
  inLanguage: ['zh', 'en'],
  isPartOf: { '@id': `${SITE.url}#website` },
  about: { '@id': `${SITE.url}#organization` },
};

export default function CelebritiesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={collectionLd} />
      {children}
    </>
  );
}
