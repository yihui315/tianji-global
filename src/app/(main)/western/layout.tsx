import type { Metadata } from 'next';
import { JsonLd, SITE, buildBreadcrumb } from '@/components/seo/JsonLd';

const TITLE = 'Western Astrology | 西方星盘 — Birth Chart, Aspects, Houses, Swiss Ephemeris';
const DESCRIPTION =
  'Generate your Western natal chart with planet positions, aspects, and house placements computed via Swiss Ephemeris. AI-assisted interpretation. Bilingual zh / en.';
const OG_URL = '/api/og?title=Western+Astrology&subtitle=Birth+Chart+%C2%B7+Aspects+%C2%B7+Houses&module=western';
const PAGE_URL = `${SITE.url}/western`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'TianJi Western Astrology' }],
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
  { name: 'Western Astrology · 西洋占星', path: '/western' },
]);

const serviceLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${PAGE_URL}#service`,
  name: 'TianJi Western Astrology',
  alternateName: '天机西方星盘',
  serviceType: 'Western natal chart calculation and interpretation',
  description: DESCRIPTION,
  url: PAGE_URL,
  provider: { '@id': `${SITE.url}#organization` },
  areaServed: 'Worldwide',
  availableLanguage: ['zh', 'en'],
  category: 'Astrology',
};

export default function WesternLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={serviceLd} />
      {children}
    </>
  );
}
