import type { Metadata } from 'next';
import { JsonLd, SITE, buildBreadcrumb } from '@/components/seo/JsonLd';

const TITLE = 'Love Compatibility | 爱情合盘 — BaZi + Western Synastry';
const DESCRIPTION =
  'Compare two birth charts across BaZi five-element compatibility and Western synastry aspects. AI-assisted compatibility narrative, bilingual zh / en.';
const OG_URL = '/api/og?title=Love+Compatibility&subtitle=BaZi+%2B+Western+Synastry&module=love';
const PAGE_URL = `${SITE.url}/love-match`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'TianJi Love Compatibility' }],
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
  { name: 'Love Match · 爱情合盘', path: '/love-match' },
]);

const serviceLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${PAGE_URL}#service`,
  name: 'TianJi Love Compatibility',
  alternateName: '天机爱情合盘',
  serviceType: 'Cross-tradition relationship compatibility analysis',
  description: DESCRIPTION,
  url: PAGE_URL,
  provider: { '@id': `${SITE.url}#organization` },
  areaServed: 'Worldwide',
  availableLanguage: ['zh', 'en'],
  category: 'Divination',
};

export default function LoveMatchLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={serviceLd} />
      {children}
    </>
  );
}
