import type { Metadata } from 'next';
import { JsonLd, SITE, buildBreadcrumb } from '@/components/seo/JsonLd';

const TITLE = 'Tianji Love Test | Free Private Compatibility Snapshot';
const DESCRIPTION =
  'A free, private love test for relationship clarity: nicknames, status, and one concern. Get a soft, non-predictive snapshot before deciding the next move. Bilingual (zh / en), no guaranteed outcomes.';
const OG_URL =
  '/api/og?title=Tianji+Love+Test&subtitle=Free+Private+Compatibility+Snapshot&module=tianji';
const PAGE_URL = `${SITE.url}/love-test`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'Tianji Love Test' }],
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
  { name: 'Love Test', path: '/love-test' },
]);

const webAppLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  '@id': `${PAGE_URL}#webapp`,
  name: 'Tianji Love Test',
  description: DESCRIPTION,
  url: PAGE_URL,
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Any modern browser',
  inLanguage: ['en', 'zh-CN'],
  isAccessibleForFree: true,
  // The love-test does not collect or store birth data. The only inputs
  // are nicknames, a relationship-status enum, and one free-text concern.
  // Public share output excludes the free-text concern by default.
  featureList: [
    'Free private compatibility snapshot',
    'No account required',
    'No birth date / time / location collected',
    'Privacy-safe share link',
    'Bilingual: English and 简体中文',
  ],
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
      name: 'Is the Love Test free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The Love Test is free and private. You do not need an account, an email, or any birth data. The result is a soft, non-predictive reflection — not a verdict.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does the Love Test actually do?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'It collects nicknames, a relationship-status label, and one free-text concern, then returns a structured snapshot that helps you decide whether to keep reflecting, talk it through, or move on. It does not predict outcomes.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does the Love Test guarantee any outcome?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. The Love Test is for self-reflection and entertainment, not prediction. It does not promise soulmate matches, marriage, breakup, reconciliation, or any other guaranteed outcome.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are my inputs private?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Nicknames and the free-text concern are not placed into public share links by default. Share cards omit the free-text concern and only show the high-level signal you choose to expose. You can contact privacy@tianji.love for any data request.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does the Love Test collect birth date, time, or location?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. The Love Test does not ask for or store birth date, birth time, birth location, or time zone. If you want a fuller reading, that is a separate, opt-in surface on the Relationship Reading page.',
      },
    },
  ],
};

export default function LoveTestLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={webAppLd} />
      <JsonLd data={faqLd} />
      {children}
    </>
  );
}