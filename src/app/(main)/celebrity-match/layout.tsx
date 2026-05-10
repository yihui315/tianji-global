import type { Metadata } from 'next';
import { JsonLd, SITE, buildBreadcrumb } from '@/components/seo/JsonLd';

const TITLE = 'Celebrity Compatibility | 名人合盘 — Compare Your Chart With a Public Figure';
const DESCRIPTION =
  'Run a compatibility analysis between your chart and a public figure from our verified celebrity database. BaZi five-element + Western synastry overlays.';
const OG_URL = '/api/og?title=Celebrity+Compatibility&subtitle=BaZi+%2B+Synastry+overlay&module=love';
const PAGE_URL = `${SITE.url}/celebrity-match`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'TianJi Celebrity Compatibility' }],
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
  { name: 'Celebrity Match · 名人配对', path: '/celebrity-match' },
]);

const serviceLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${PAGE_URL}#service`,
  name: 'TianJi Celebrity Compatibility',
  alternateName: '天机名人合盘',
  serviceType: 'Compatibility analysis with verified celebrity charts',
  description: DESCRIPTION,
  url: PAGE_URL,
  provider: { '@id': `${SITE.url}#organization` },
  areaServed: 'Worldwide',
  availableLanguage: ['zh', 'en'],
  category: 'Divination',
};

export default function CelebrityMatchLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={serviceLd} />
      {children}
    </>
  );
}
