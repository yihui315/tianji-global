import type { Metadata } from 'next';
import { LanguageProvider } from '@/hooks/useLanguage';
import { JsonLd, SITE } from '@/components/seo/JsonLd';

/**
 * Tianji Love metadata for the primary customer path.
 */
export const metadata: Metadata = {
  title: 'Tianji Love | AI Relationship Reading',
  description:
    'Tianji Love offers AI relationship reading for compatibility, love timing, one-question clarity, and three-card relationship insight.',
  keywords: [
    'Tianji Love', 'AI relationship reading', 'compatibility', 'love timing',
    'ask one question', 'three-card relationship insight', 'relationship astrology',
    'love reading', 'relationship patterns', '爱情解读', '关系解读', '关系合盘',
  ],
  openGraph: {
    title: 'Tianji Love | AI Relationship Reading',
    description:
      'Compatibility, love timing, one-question clarity, and three-card relationship insight under one Tianji Love path.',
    type: 'website',
    locale: 'en_US',
    url: 'https://tianji.love',
    siteName: 'Tianji Love',
    images: [
      {
        url: '/api/og?title=Tianji+Love&subtitle=AI+Relationship+Reading',
        width: 1200,
        height: 630,
        alt: 'Tianji Love — AI relationship reading',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tianji Love | AI Relationship Reading',
    description:
      'Compatibility, love timing, one-question clarity, and three-card relationship insight.',
    images: ['/api/og?title=Tianji+Love&subtitle=AI+Relationship+Reading'],
  },
  alternates: {
    canonical: 'https://tianji.love',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE.url}#organization`,
  name: SITE.name,
  alternateName: SITE.altName,
  url: SITE.url,
  logo: SITE.logo,
  description: SITE.description,
  sameAs: SITE.sameAs,
  contactPoint: [
    {
      '@type': 'ContactPoint',
      email: SITE.contactEmail,
      contactType: 'customer support',
      availableLanguage: ['zh', 'en'],
    },
    {
      '@type': 'ContactPoint',
      email: SITE.privacyEmail,
      contactType: 'privacy',
      availableLanguage: ['zh', 'en'],
    },
  ],
};

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE.url}#website`,
  url: SITE.url,
  name: SITE.name,
  alternateName: SITE.altName,
  description: SITE.description,
  inLanguage: ['zh', 'en'],
  publisher: { '@id': `${SITE.url}#organization` },
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="tj-love-app-surface bg-[#03040a] overflow-x-hidden min-h-screen">
      <a href="#main-content" className="tj-skip-link">
        Skip to main content · 跳至主内容
      </a>
      <div className="star-field" aria-hidden="true" />
      <JsonLd data={organizationLd} />
      <JsonLd data={websiteLd} />
      <LanguageProvider>{children}</LanguageProvider>
    </div>
  );
}
