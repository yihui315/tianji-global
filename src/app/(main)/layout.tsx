import type { Metadata } from 'next';

/**
 * SEO Metadata for the TianJi Global homepage.
 * Replace OG image URL and canonical with production domain when deploying.
 */
export const metadata: Metadata = {
  title: 'TianJi Global | 天机全球 — AI Fortune & Astrology Platform',
  description:
    'World-class AI-powered fortune telling platform combining Chinese metaphysics (紫微斗数, 八字, 易经) with Western astrology, tarot, and modern psychology. Discover your destiny today.',
  keywords: [
    'fortune telling',
    'astrology',
    'AI astrology',
    '紫微斗数',
    '八字',
    '易经',
    'tarot reading',
    'birth chart',
    'horoscope',
    '天机全球',
    'TianJi Global',
    'chinese metaphysics',
    'western astrology',
    'synastry',
    'feng shui',
  ],
  openGraph: {
    title: 'TianJi Global | 天机全球 — AI Fortune & Astrology Platform',
    description:
      'Precision astrology meets ancient wisdom. 12 divination paths, AI-powered insights, and professional chart analysis. Trusted by fortune seekers worldwide.',
    type: 'website',
    locale: 'en_US',
    url: 'https://tianji.global', // Replace with production URL
    siteName: 'TianJi Global',
    images: [
      {
        url: '/og-image.png', // Replace with production OG image
        width: 1200,
        height: 630,
        alt: 'TianJi Global — AI Fortune & Astrology Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TianJi Global | 天机全球 — AI Fortune & Astrology',
    description:
      'Precision astrology meets ancient wisdom. 12 divination paths, AI-powered insights.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://tianji.global', // Replace with production URL
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
