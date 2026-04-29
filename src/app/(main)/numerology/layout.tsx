import type { Metadata } from 'next';
import { JsonLd, SITE, buildBreadcrumb } from '@/components/seo/JsonLd';

const TITLE = 'Numerology | 数字命理 — Life Path, Expression, Soul Urge';
const DESCRIPTION =
  'Calculate your numerology profile: life path number, expression, soul urge, and personal year. AI-assisted reading, bilingual zh / en.';
const OG_URL = '/api/og?title=Numerology&subtitle=Life+Path+%C2%B7+Expression+%C2%B7+Soul+Urge&module=tianji';
const PAGE_URL = `${SITE.url}/numerology`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'TianJi Numerology' }],
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
  { name: 'Numerology · 数字命理', path: '/numerology' },
]);

const serviceLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${PAGE_URL}#service`,
  name: 'TianJi Numerology',
  alternateName: '天机数字命理',
  serviceType: 'Numerology calculation and interpretation',
  description: DESCRIPTION,
  url: PAGE_URL,
  provider: { '@id': `${SITE.url}#organization` },
  areaServed: 'Worldwide',
  availableLanguage: ['zh', 'en'],
  category: 'Divination',
};

export default function NumerologyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={serviceLd} />
      {children}
    </>
  );
}
