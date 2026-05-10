import type { Metadata } from 'next';
import { JsonLd, SITE, buildBreadcrumb } from '@/components/seo/JsonLd';

const TITLE = 'Relationship Synastry | 关系合盘 — Aspects, Composite, Cross-tradition Analysis';
const DESCRIPTION =
  'Detailed synastry analysis: planet-to-planet aspects, composite chart, BaZi compatibility, and Zi Wei palace overlays. For partners, family, business — bilingual zh / en.';
const OG_URL = '/api/og?title=Relationship+Synastry&subtitle=Aspects+%C2%B7+Composite+%C2%B7+Cross-tradition&module=synastry';
const PAGE_URL = `${SITE.url}/synastry`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'TianJi Relationship Synastry' }],
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
  { name: 'Synastry · 关系合盘', path: '/synastry' },
]);

const serviceLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${PAGE_URL}#service`,
  name: 'TianJi Relationship Synastry',
  alternateName: '天机关系合盘',
  serviceType: 'Relationship synastry across Western and Chinese traditions',
  description: DESCRIPTION,
  url: PAGE_URL,
  provider: { '@id': `${SITE.url}#organization` },
  areaServed: 'Worldwide',
  availableLanguage: ['zh', 'en'],
  category: 'Divination',
};

export default function SynastryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={serviceLd} />
      {children}
    </>
  );
}
