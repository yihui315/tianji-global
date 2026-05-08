import type { Metadata } from 'next';
import { JsonLd, SITE, buildBreadcrumb } from '@/components/seo/JsonLd';

const TITLE = 'I Ching Divination | 易经占卜 — 64 Hexagrams, AI Interpretation, PDF Export';
const DESCRIPTION =
  'Cast a hexagram or look one up directly. TianJi pairs classical I Ching judgements with explainable AI interpretation, changing-line analysis, save/share, and PDF export. Bilingual zh / en.';
const OG_URL = '/api/og?title=Yi+Jing+Oracle&subtitle=64+hexagrams+%C2%B7+Classical+%2B+AI&module=yijing';
const PAGE_URL = `${SITE.url}/yijing`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'TianJi I Ching Divination' }],
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
  { name: 'I Ching · 易经占筮', path: '/yijing' },
]);

const serviceLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${PAGE_URL}#service`,
  name: 'TianJi I Ching Divination',
  alternateName: '天机易经占卜',
  serviceType: 'I Ching divination with AI interpretation',
  description: DESCRIPTION,
  url: PAGE_URL,
  provider: { '@id': `${SITE.url}#organization` },
  areaServed: 'Worldwide',
  availableLanguage: ['zh', 'en'],
  category: 'Divination',
};

export default function YijingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={serviceLd} />
      {children}
    </>
  );
}
