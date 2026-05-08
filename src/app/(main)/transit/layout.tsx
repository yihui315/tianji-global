import type { Metadata } from 'next';
import { JsonLd, SITE, buildBreadcrumb } from '@/components/seo/JsonLd';

const TITLE = 'Transit Forecast | 行运推算 — Current Planetary Influences on Your Chart';
const DESCRIPTION =
  'See which planets are currently transiting your natal chart and what each aspect typically activates. AI-assisted timing windows, bilingual zh / en.';
const OG_URL = '/api/og?title=Transit+Forecast&subtitle=Current+influences+%C2%B7+Timing+windows&module=western';
const PAGE_URL = `${SITE.url}/transit`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'TianJi Transit Forecast' }],
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
  { name: 'Transits · 行运推运', path: '/transit' },
]);

const serviceLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${PAGE_URL}#service`,
  name: 'TianJi Transit Forecast',
  alternateName: '天机行运推算',
  serviceType: 'Astrological transit forecasting',
  description: DESCRIPTION,
  url: PAGE_URL,
  provider: { '@id': `${SITE.url}#organization` },
  areaServed: 'Worldwide',
  availableLanguage: ['zh', 'en'],
  category: 'Astrology',
};

export default function TransitLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={serviceLd} />
      {children}
    </>
  );
}
