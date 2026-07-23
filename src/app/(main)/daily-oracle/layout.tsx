import type { Metadata } from 'next';
import { JsonLd, SITE, buildBreadcrumb } from '@/components/seo/JsonLd';

const TITLE = 'Tianji Love Daily Oracle | Quiet Daily Reflection on Love Energy';
const DESCRIPTION =
  'A daily, private oracle for your love energy: choose today\'s mood and receive a soft reflection before making the next move. Bilingual (zh / en), no guaranteed outcomes.';
const OG_URL =
  '/api/og?title=Tianji+Love+Daily+Oracle&subtitle=Quiet+Daily+Reflection+on+Love+Energy&module=tianji';
const PAGE_URL = `${SITE.url}/daily-oracle`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'Tianji Love Daily Oracle' }],
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
  { name: 'Daily Oracle', path: '/daily-oracle' },
]);

const webAppLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  '@id': `${PAGE_URL}#webapp`,
  name: 'Tianji Love Daily Oracle',
  description: DESCRIPTION,
  url: PAGE_URL,
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Any modern browser',
  inLanguage: ['en', 'zh-CN'],
  isAccessibleForFree: true,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
  provider: {
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
  },
};

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': `${PAGE_URL}#faq`,
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is the Daily Oracle free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The daily oracle is free and private. You can draw one reflection per day and optionally share the result with a privacy-safe share link.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does the Daily Oracle guarantee outcomes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. The Daily Oracle is for reflection and tone-setting, not prediction. It does not promise certain or guaranteed relationship outcomes.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does the Daily Oracle do after I draw?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'It points you to the free Love Test or the private Relationship Reading if you want a fuller signal. Both are optional, and your data stays private by default.',
      },
    },
  ],
};

export default function DailyOracleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={webAppLd} />
      <JsonLd data={faqLd} />
      {children}
    </>
  );
}