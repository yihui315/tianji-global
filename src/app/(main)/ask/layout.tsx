import type { Metadata } from 'next';
import { JsonLd, SITE, buildBreadcrumb } from '@/components/seo/JsonLd';

const TITLE = 'Ask the Oracle | 问天机 — Pay-per-Question AI Divination';
const DESCRIPTION =
  'Ask one question that matters. Get a thoughtful AI divination answer in three short paragraphs and a reflection prompt. Pay-per-question · No subscription. Bilingual zh / en.';
const OG_URL = '/api/og?title=Ask+the+Oracle&subtitle=Pay-per-question+AI+divination&module=fortune';
const PAGE_URL = `${SITE.url}/ask`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'ask the oracle',
    'AI tarot question',
    'AI divination',
    'pay per question',
    'oracle reading',
    '问天机',
    'AI 占卜',
    '塔罗问答',
    '占卜问答',
    '一题占卜',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'TianJi · Ask the Oracle' }],
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
  { name: 'Ask the Oracle · 问天机', path: '/ask' },
]);

const serviceLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${PAGE_URL}#service`,
  name: 'TianJi · Ask the Oracle',
  alternateName: '天机问答',
  serviceType: 'Pay-per-question AI divination Q&A',
  description: DESCRIPTION,
  url: PAGE_URL,
  provider: { '@id': `${SITE.url}#organization` },
  areaServed: 'Worldwide',
  availableLanguage: ['zh', 'en'],
  category: 'Divination',
  offers: {
    '@type': 'Offer',
    price: '1.99',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url: PAGE_URL,
  },
};

export default function AskLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={serviceLd} />
      {children}
    </>
  );
}
