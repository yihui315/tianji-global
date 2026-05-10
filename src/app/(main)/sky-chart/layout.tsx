import type { Metadata } from 'next';
import { JsonLd, SITE, buildBreadcrumb } from '@/components/seo/JsonLd';

const TITLE = 'Live Sky Chart | 实时天象 — Planets, Aspects, and Moon Phase Right Now';
const DESCRIPTION =
  'See the live sky for any moment: planet positions, aspect grid, moon phase, retrogrades, and ingresses. Powered by Swiss Ephemeris.';
const OG_URL = '/api/og?title=Live+Sky+Chart&subtitle=Planets+%C2%B7+Aspects+%C2%B7+Moon&module=western';
const PAGE_URL = `${SITE.url}/sky-chart`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'TianJi Live Sky Chart' }],
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
  { name: 'Live Sky Chart · 实时天象', path: '/sky-chart' },
]);

const serviceLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${PAGE_URL}#service`,
  name: 'TianJi Live Sky Chart',
  alternateName: '天机实时天象',
  serviceType: 'Real-time astrology sky chart',
  description: DESCRIPTION,
  url: PAGE_URL,
  provider: { '@id': `${SITE.url}#organization` },
  areaServed: 'Worldwide',
  availableLanguage: ['zh', 'en'],
  category: 'Astrology',
};

export default function SkyChartLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={serviceLd} />
      {children}
    </>
  );
}
