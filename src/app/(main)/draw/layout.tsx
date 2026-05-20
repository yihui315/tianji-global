import type { Metadata } from 'next';
import { JsonLd, SITE, buildBreadcrumb } from '@/components/seo/JsonLd';

const TITLE = 'Tianji Love Draw Timing Cards | Relationship Turning Point Reading';
const DESCRIPTION =
  'Ask about a relationship pause, reconnection, choice, or turning point. Draw three timing cards for what led here, the live signal, and the next opening.';
const OG_URL = '/api/og?title=Tianji+Love+Draw+Timing+Cards&subtitle=Relationship+turning+point+window&module=tianji';
const PAGE_URL = `${SITE.url}/draw`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'relationship timing',
    'love timing reading',
    'romantic turning point',
    'AI love reading',
    'Tianji Love',
    '关系时机',
    '爱情转折',
    '复合时机',
    '感情窗口',
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'Tianji Love Draw Timing Cards' }],
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
  { name: 'Draw Timing', path: '/draw' },
]);

const serviceLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${PAGE_URL}#service`,
  name: 'Tianji Love Draw Timing Cards',
  alternateName: '关系时机解读',
  serviceType: 'Relationship timing reading',
  description: DESCRIPTION,
  url: PAGE_URL,
  provider: { '@id': `${SITE.url}#organization` },
  areaServed: 'Worldwide',
  availableLanguage: ['zh', 'en'],
  category: 'Relationship reading',
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
