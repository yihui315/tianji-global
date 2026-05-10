import type { Metadata } from 'next';
import { JsonLd, SITE, buildBreadcrumb } from '@/components/seo/JsonLd';

const TITLE = 'Horary Astrology | 卜卦占星 — Ask a Specific Question, Read the Moment';
const DESCRIPTION =
  'Ask one specific question and read the chart of the moment you asked. Classical horary methodology with AI-assisted interpretation. Bilingual zh / en.';
const OG_URL = '/api/og?title=Horary+Astrology&subtitle=Ask+a+question+%C2%B7+Read+the+moment&module=tianji';
const PAGE_URL = `${SITE.url}/horary`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'TianJi Horary Astrology' }],
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
  { name: 'Horary · 卜辰占星', path: '/horary' },
]);

const serviceLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${PAGE_URL}#service`,
  name: 'TianJi Horary Astrology',
  alternateName: '天机卜卦占星',
  serviceType: 'Horary astrology question reading',
  description: DESCRIPTION,
  url: PAGE_URL,
  provider: { '@id': `${SITE.url}#organization` },
  areaServed: 'Worldwide',
  availableLanguage: ['zh', 'en'],
  category: 'Divination',
};

export default function HoraryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={serviceLd} />
      {children}
    </>
  );
}
