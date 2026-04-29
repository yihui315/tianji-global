import type { Metadata } from 'next';
import { JsonLd, SITE, buildBreadcrumb } from '@/components/seo/JsonLd';

const TITLE = 'Solar Return | 太阳返照 — Your Annual Astrology Chart';
const DESCRIPTION =
  'Generate your annual Solar Return chart for the year ahead. See the themes, focus areas, and timing windows from your birthday onward. Bilingual zh / en.';
const OG_URL = '/api/og?title=Solar+Return&subtitle=Your+year-ahead+chart&module=western';
const PAGE_URL = `${SITE.url}/solar-return`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'TianJi Solar Return' }],
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
  { name: 'Solar Return · 太阳回归', path: '/solar-return' },
]);

const serviceLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${PAGE_URL}#service`,
  name: 'TianJi Solar Return',
  alternateName: '天机太阳返照',
  serviceType: 'Annual Solar Return chart calculation',
  description: DESCRIPTION,
  url: PAGE_URL,
  provider: { '@id': `${SITE.url}#organization` },
  areaServed: 'Worldwide',
  availableLanguage: ['zh', 'en'],
  category: 'Astrology',
};

export default function SolarReturnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={serviceLd} />
      {children}
    </>
  );
}
