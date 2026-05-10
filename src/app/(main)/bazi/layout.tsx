import type { Metadata } from 'next';
import { JsonLd, SITE, buildBreadcrumb } from '@/components/seo/JsonLd';

const TITLE = 'BaZi Reading | 八字命理 — Four Pillars, Five Elements, AI Interpretation';
const DESCRIPTION =
  'Calculate your BaZi (Four Pillars of Destiny) chart with classical pillar logic, five-element analysis, and AI-assisted interpretation. Bilingual zh / en. Save and export.';
const OG_URL = '/api/og?title=BaZi+Reading&subtitle=Four+Pillars+%C2%B7+Five+Elements&module=bazi';
const PAGE_URL = `${SITE.url}/bazi`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'TianJi BaZi Reading' }],
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
  { name: 'BaZi · 八字命理', path: '/bazi' },
]);

const serviceLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${PAGE_URL}#service`,
  name: 'TianJi BaZi Reading',
  alternateName: '天机八字命理',
  serviceType: 'BaZi (Four Pillars of Destiny) reading with AI interpretation',
  description: DESCRIPTION,
  url: PAGE_URL,
  provider: { '@id': `${SITE.url}#organization` },
  areaServed: 'Worldwide',
  availableLanguage: ['zh', 'en'],
  category: 'Divination',
};

export default function BaziLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={serviceLd} />
      {children}
    </>
  );
}
