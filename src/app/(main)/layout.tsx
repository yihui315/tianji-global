import type { Metadata } from 'next';
import { LanguageProvider } from '@/hooks/useLanguage';
import { JsonLd, SITE } from '@/components/seo/JsonLd';

/**
 * Premium Homepage Metadata — Tianji Love
 * Taste Rule: Moonlit Goldline dark + gold / rose accents
 */
export const metadata: Metadata = {
  title: 'Tianji Love | Private Relationship & Fortune Insights',
  description:
    'Private, calm relationship guidance and fortune readings — designed for reflection, not predictions. BaZi, Zi Wei, tarot, and compatibility analysis.',
  keywords: [
    'relationship guidance', 'love reading', 'BaZi', '八字命理', 'Zi Wei Dou Shu', '紫微斗数',
    'compatibility analysis', 'tarot reading', 'birth chart', '易经', 'Yi Jing',
    'synastry', 'fortune reading', 'tianji love', 'love fortune',
    'premium fortune telling', 'AI destiny reading', 'bilingual astrology report',
    'Chinese metaphysics', 'relationship advice',
  ],
  openGraph: {
    title: 'Tianji Love | Private Relationship & Fortune Insights',
    description:
      'Private, calm relationship guidance and fortune readings — designed for reflection, not predictions.',
    type: 'website',
    locale: 'en_US',
    url: 'https://tianji.love',
    siteName: 'Tianji Love',
    images: [
      {
        url: '/api/og?title=Tianji+Love&subtitle=Private+Relationship+Insights',
        width: 1200,
        height: 630,
        alt: 'Tianji Love — Private Relationship & Fortune Insights',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tianji Love | Private Relationship & Fortune Insights',
    description:
      'Relationship guidance and fortune readings — designed for reflection, not predictions.',
    images: ['/api/og?title=Tianji+Love&subtitle=Private+Relationship+Insights'],
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
    <div className="bg-[#1C1533] overflow-x-hidden min-h-screen">
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
