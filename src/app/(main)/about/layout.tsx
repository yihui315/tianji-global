import type { Metadata } from 'next';
import { JsonLd, SITE, buildBreadcrumb } from '@/components/seo/JsonLd';

const TITLE = 'About Tianji Love | Relationship Patterns, Timing, Privacy';
const DESCRIPTION =
  'How Tianji Love approaches relationship patterns, romantic timing, privacy, and AI-assisted clarity without guaranteed predictions.';
const OG_URL = '/api/og?title=About+Tianji+Love&subtitle=Patterns+%C2%B7+Timing+%C2%B7+Privacy&module=tianji';
const PAGE_URL = `${SITE.url}/about`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'About Tianji Love' }],
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
  { name: 'About', path: '/about' },
]);

const aboutPageLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${PAGE_URL}#aboutpage`,
  url: PAGE_URL,
  name: 'About Tianji Love',
  description: DESCRIPTION,
  inLanguage: ['zh', 'en'],
  isPartOf: { '@id': `${SITE.url}#website` },
  about: { '@id': `${SITE.url}#organization` },
  mainEntity: { '@id': `${SITE.url}#organization` },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={aboutPageLd} />
      {children}
    </>
  );
}
