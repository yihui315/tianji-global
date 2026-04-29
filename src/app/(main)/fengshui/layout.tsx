import type { Metadata } from 'next';
import { JsonLd, SITE, buildBreadcrumb } from '@/components/seo/JsonLd';

const TITLE = 'Feng Shui | 风水 — Direction, Layout, and Energy Flow Guidance';
const DESCRIPTION =
  'Personal Feng Shui guidance based on your BaZi profile and your space. Direction, layout, color, and timing recommendations. Bilingual zh / en.';
const OG_URL = '/api/og?title=Feng+Shui&subtitle=Direction+%C2%B7+Layout+%C2%B7+Energy&module=tianji';
const PAGE_URL = `${SITE.url}/fengshui`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'TianJi Feng Shui' }],
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
  { name: 'Feng Shui · 风水', path: '/fengshui' },
]);

const serviceLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${PAGE_URL}#service`,
  name: 'TianJi Feng Shui',
  alternateName: '天机风水',
  serviceType: 'Personal Feng Shui consultation',
  description: DESCRIPTION,
  url: PAGE_URL,
  provider: { '@id': `${SITE.url}#organization` },
  areaServed: 'Worldwide',
  availableLanguage: ['zh', 'en'],
  category: 'Chinese Metaphysics',
};

export default function FengShuiLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={serviceLd} />
      {children}
    </>
  );
}
