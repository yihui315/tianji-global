import type { Metadata } from 'next';
import { JsonLd, SITE, buildBreadcrumb } from '@/components/seo/JsonLd';

const TITLE = 'TianJi Pro Pricing | 会员方案 — Unlimited Readings, Deeper AI, 7-Day Refund';
const DESCRIPTION =
  'TianJi Pro unlocks unlimited readings across BaZi, Zi Wei, I Ching, Western astrology, and Tarot, with deeper AI interpretation, PDF export, and 30-day history. Cancel anytime, 7-day refund window.';
const OG_URL = '/api/og?title=TianJi+Pro&subtitle=Unlimited+%C2%B7+Deeper+AI+%C2%B7+7-day+refund&module=tianji';
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
    images: [{ url: OG_URL, width: 1200, height: 630, alt: 'TianJi Pro Pricing' }],
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
  { name: 'Pricing · 定价', path: '/pricing' },
]);

const productLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  '@id': `${PAGE_URL}#product`,
  name: 'TianJi Pro',
  description:
    'Unlimited readings across BaZi, Zi Wei Dou Shu, I Ching, Western astrology, and Tarot, with deeper AI interpretation, PDF export, and 30-day reading history.',
  brand: { '@type': 'Brand', name: SITE.name },
  url: PAGE_URL,
  offers: [
    {
      '@type': 'Offer',
      name: 'TianJi Pro Monthly',
      price: '9.99',
      priceCurrency: 'USD',
      url: PAGE_URL,
      availability: 'https://schema.org/InStock',
      category: 'subscription',
      eligibleDuration: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' },
    },
    {
      '@type': 'Offer',
      name: 'TianJi Pro Yearly',
      price: '99.99',
      priceCurrency: 'USD',
      url: PAGE_URL,
      availability: 'https://schema.org/InStock',
      category: 'subscription',
      eligibleDuration: { '@type': 'QuantitativeValue', value: 1, unitCode: 'ANN' },
    },
  ],
};

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': `${PAGE_URL}#faq`,
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is the free tier still usable after Pro launches?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — and we will keep it that way. The free tier always finishes a complete reading across all five traditions. Pro only unlocks frequency, depth, and exports.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I cancel my plan anytime?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. You can cancel directly from your account. The plan stays active until the end of the current billing period, then stops renewing — no further charges.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you offer refunds?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Within seven days of purchase, we issue a full refund without asking questions. Email billing@tianji.global with your purchase email and we will handle it.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does the AI interpretation actually work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Each reading combines deterministic divination logic — hexagram casting, chart calculation, card drawing — with a language model layer for natural-language interpretation. The traditional source and AI portion are clearly distinguished in the result.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where does my data live? Can I delete it?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Birth time, question text, and reading history are stored in our encrypted database, never sold or shared with third parties. You can request full deletion anytime — see the data deletion section on our about page.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I switch between monthly and yearly?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Switching to yearly applies the prorated difference; switching to monthly takes effect at the end of the current yearly term. No service interruption either way.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which divination traditions does TianJi cover?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'TianJi covers BaZi (Four Pillars of Destiny), Zi Wei Dou Shu (Purple Star astrology), I Ching (易经 hexagram divination), Tarot, and Western astrology — including transit, synastry, solar return, horary, electional, and live sky chart. Each tradition keeps its own classical methodology; AI only handles natural-language interpretation.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is the AI deep reading different from a generic horoscope?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Every AI reading is grounded in your actual chart — your pillars, your stars, your hexagram, your spread. The model receives your specific elemental balance, palace structure, or planetary aspects as context, then writes interpretation against that. There is no shared generic text across users.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I save multiple birth charts under one account?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Pro users can save up to 30 days of reading history across multiple birth charts — useful for tracking your own chart over time, or for casting readings for partners and family. Free tier saves your most recent reading.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is TianJi available in both Chinese and English?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The interface, AI interpretation, and PDF exports are all bilingual (zh / en). You can switch language per reading, and shared images render correctly in either language. Cantonese-language interpretation is on the roadmap.',
      },
    },
  ],
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={productLd} />
      <JsonLd data={faqLd} />
      {children}
    </>
  );
}
