import type { Metadata } from 'next';
import { JsonLd, SITE, buildBreadcrumb } from '@/components/seo/JsonLd';

const TITLE = 'Tianji Love Reading | Ask A Private Relationship Question';
const DESCRIPTION =
  'Ask one private love or relationship question and receive a thoughtful preview before unlocking the complete Tianji Love reading.';
const OG_URL = '/api/og?title=Tianji+Love+Reading&subtitle=Private+relationship+question&module=tianji';
const PAGE_URL = `${SITE.url}/ask`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'love reading',
    'relationship question',
    'AI love reading',
    'pay per question',
    'Tianji Love',
    '爱情解读',
    '关系问题',
    '感情咨询',
    'AI 感情解读',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'Tianji Love Reading' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_URL],
  },
};

const breadcrumbLd = buildBreadcrumb([
  { name: 'Tianji Love Home', path: '/' },
  { name: 'Love Reading', path: '/ask' },
]);

const serviceLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${PAGE_URL}#service`,
  name: 'Tianji Love Reading',
  alternateName: '爱情问题解读',
  serviceType: 'Private relationship question reading',
  description: DESCRIPTION,
  url: PAGE_URL,
  provider: { '@id': `${SITE.url}#organization` },
  areaServed: 'Worldwide',
  availableLanguage: ['zh', 'en'],
  category: 'Relationship reading',
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
