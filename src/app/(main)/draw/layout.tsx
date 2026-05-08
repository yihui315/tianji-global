import type { Metadata } from 'next';
import { JsonLd, SITE, buildBreadcrumb } from '@/components/seo/JsonLd';

const TITLE = 'Three Cards | 三张牌 — Yesterday · Today · Tomorrow Tarot';
const DESCRIPTION =
  'Draw three tarot cards — yesterday, today, tomorrow — and unlock a thoughtful AI reading of how the day arc is forming. Pay-per-draw · No subscription. Bilingual zh / en.';
const OG_URL = '/api/og?title=Three+Cards&subtitle=Yesterday+Today+Tomorrow&module=tarot';
const PAGE_URL = `${SITE.url}/draw`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'three card tarot',
    'past present future',
    'pay per draw',
    'AI tarot reading',
    'daily tarot',
    '三张牌',
    'AI 塔罗',
    '昨天今天明天',
    '塔罗每日',
    '一次塔罗占卜',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'TianJi · Three Cards' }],
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
  { name: 'Three Cards · 三张牌', path: '/draw' },
]);

const serviceLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${PAGE_URL}#service`,
  name: 'TianJi · Three Cards',
  alternateName: '天机三张牌',
  serviceType: 'Pay-per-draw three-card tarot reading',
  description: DESCRIPTION,
  url: PAGE_URL,
  provider: { '@id': `${SITE.url}#organization` },
  areaServed: 'Worldwide',
  availableLanguage: ['zh', 'en'],
  category: 'Divination',
  offers: {
    '@type': 'Offer',
    price: '2.99',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url: PAGE_URL,
  },
};

export default function DrawLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={serviceLd} />
      {children}
    </>
  );
}
