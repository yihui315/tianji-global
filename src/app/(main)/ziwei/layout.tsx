import type { Metadata } from 'next';
import { JsonLd, SITE, buildBreadcrumb } from '@/components/seo/JsonLd';

const TITLE = 'Zi Wei Dou Shu | 紫微斗数 — Twelve Palaces, Main Stars, AI Interpretation';
const DESCRIPTION =
  'Cast your Zi Wei Dou Shu chart with twelve palaces, fourteen main stars, and four transformations. AI-assisted interpretation, bilingual zh / en, save and export.';
const OG_URL = '/api/og?title=Zi+Wei+Dou+Shu&subtitle=Twelve+Palaces+%C2%B7+Main+Stars&module=ziwei';
const PAGE_URL = `${SITE.url}/ziwei`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'TianJi Zi Wei Dou Shu' }],
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
  { name: 'Zi Wei Dou Shu · 紫微斗数', path: '/ziwei' },
]);

const serviceLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${PAGE_URL}#service`,
  name: 'TianJi Zi Wei Dou Shu',
  alternateName: '天机紫微斗数',
  serviceType: 'Zi Wei Dou Shu chart casting and interpretation',
  description: DESCRIPTION,
  url: PAGE_URL,
  provider: { '@id': `${SITE.url}#organization` },
  areaServed: 'Worldwide',
  availableLanguage: ['zh', 'en'],
  category: 'Divination',
};

export default function ZiweiLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={serviceLd} />
      {children}
    </>
  );
}
