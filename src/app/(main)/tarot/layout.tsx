import type { Metadata } from 'next';
import { JsonLd, SITE, buildBreadcrumb } from '@/components/seo/JsonLd';

const TITLE = 'Tarot Reading | 塔罗牌占卜 — Single, Three-Card, Celtic Cross, AI Interpretation';
const DESCRIPTION =
  'Three spreads (single, three-card, Celtic Cross) with classical card meanings and AI interpretation. Save, share, and export every reading. Bilingual zh / en. Optional question input.';
const OG_URL = '/api/og?title=Tarot+Reading&subtitle=Single+%C2%B7+Three-card+%C2%B7+Celtic+Cross&module=tarot';
const PAGE_URL = `${SITE.url}/tarot`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'TianJi Tarot Reading' }],
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
  { name: 'Tarot · 塔罗', path: '/tarot' },
]);

const serviceLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${PAGE_URL}#service`,
  name: 'TianJi Tarot Reading',
  alternateName: '天机塔罗牌占卜',
  serviceType: 'Tarot reading with AI interpretation',
  description: DESCRIPTION,
  url: PAGE_URL,
  provider: { '@id': `${SITE.url}#organization` },
  areaServed: 'Worldwide',
  availableLanguage: ['zh', 'en'],
  category: 'Divination',
};

export default function TarotLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={serviceLd} />
      {children}
    </>
  );
}
