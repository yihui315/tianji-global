import type { Metadata } from 'next';
import { JsonLd, SITE, buildBreadcrumb } from '@/components/seo/JsonLd';

const TITLE = 'Composite Fortune | 综合运势 — Five-Tradition Reading, Stage Analysis';
const DESCRIPTION =
  'A composite reading that aligns BaZi, Zi Wei, I Ching, Western astrology, and Tarot to surface your current life stage and the windows of opportunity ahead.';
const OG_URL = '/api/og?title=Composite+Fortune&subtitle=Five+traditions+%C2%B7+One+narrative&module=fortune';
const PAGE_URL = `${SITE.url}/fortune`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'TianJi Composite Fortune Reading' }],
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
  { name: 'Composite Fortune · 综合命理', path: '/fortune' },
]);

const serviceLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${PAGE_URL}#service`,
  name: 'TianJi Composite Fortune Reading',
  alternateName: '天机综合运势',
  serviceType: 'Composite divination across BaZi, Zi Wei, I Ching, Western, and Tarot',
  description: DESCRIPTION,
  url: PAGE_URL,
  provider: { '@id': `${SITE.url}#organization` },
  areaServed: 'Worldwide',
  availableLanguage: ['zh', 'en'],
  category: 'Divination',
};

export default function FortuneLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={serviceLd} />
      {children}
    </>
  );
}
