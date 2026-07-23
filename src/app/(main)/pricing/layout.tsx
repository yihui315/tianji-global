import type { Metadata } from 'next';
import { JsonLd, SITE, buildBreadcrumb } from '@/components/seo/JsonLd';
import { PUBLICLY_AVAILABLE_PRODUCTS, minorAmountToMajor } from '@/config/products';

const TITLE = 'Tianji Love Pricing | Deeper Love Readings & Compatibility Reports';
const DESCRIPTION =
  'Tianji Love pricing explains free previews, one-time Ask and Draw Timing unlocks, subscription history, and private report-ready pages without promising guaranteed predictions.';
const OG_URL = '/api/og?title=Tianji+Love+Pricing&subtitle=Love+readings+%C2%B7+Compatibility+%C2%B7+Timing&module=tianji';
const PAGE_URL = `${SITE.url}/pricing`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'Tianji Love Pricing' }],
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
  { name: 'Pricing', path: '/pricing' },
]);

const productLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  '@id': `${PAGE_URL}#product`,
  name: 'Tianji Love',
  description: DESCRIPTION,
  brand: { '@type': 'Brand', name: SITE.name },
  url: PAGE_URL,
  offers: PUBLICLY_AVAILABLE_PRODUCTS.map((product) => ({
    '@type': 'Offer',
    name: product.name,
    price: minorAmountToMajor(product.amountMinor),
    priceCurrency: product.currency,
    url: PAGE_URL,
    availability: 'https://schema.org/InStock',
    category: product.billing === 'one_time' ? 'one-time' : 'subscription',
    ...(product.billing === 'month'
      ? { eligibleDuration: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' } }
      : {}),
    ...(product.billing === 'year'
      ? { eligibleDuration: { '@type': 'QuantitativeValue', value: 1, unitCode: 'ANN' } }
      : {}),
  })),
};

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': `${PAGE_URL}#faq`,
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can I start for free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The free path gives a usable first reading before any upgrade. Paid plans unlock depth, history, and report surfaces.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens after unlocking?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'After unlocking, you receive a deeper private reading with practical next steps and clearer structure. Birth data and private questions are not placed into public share links by default.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I cancel later?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. You can cancel from your account or Stripe portal where available. The plan stays active until the end of the current billing period.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Tianji Love guarantee outcomes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Tianji Love is for reflection, timing, and relationship communication. It does not promise certain or guaranteed future outcomes.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are my birth details public?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Public sharing excludes birth date, birth time, birth location, and time zone by default. You can contact privacy@tianji.love about data requests.',
      },
    },
    {
      '@type': 'Question',
      name: 'Should I start with a one-time unlock or a subscription?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'One-time Ask or Draw Timing unlocks are the cheapest path to a deeper private reading. Subscriptions add reading history, report-ready pages, and priority processing once those surfaces are enabled.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does the Draw Timing unlock add?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Draw Timing unlock reveals the full three-card timing reading as reflection, not certainty, with deeper interpretation and practical next steps.',
      },
    },
  ],
};

const softwareApplicationLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': `${PAGE_URL}#software-application`,
  name: SITE.name,
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
    category: 'freemium',
  },
  featureList: [
    'Free private relationship reading',
    'One-time Ask unlock',
    'One-time Draw Timing unlock',
    'Subscription history and report-ready pages',
    'Privacy-safe share links (no birth data, no payment state)',
    'Bilingual zh / en surface',
  ],
  provider: {
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={productLd} />
      <JsonLd data={softwareApplicationLd} />
      <JsonLd data={faqLd} />
      {children}
    </>
  );
}
