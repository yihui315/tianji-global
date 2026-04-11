import type { Metadata } from 'next';

/**
 * Premium Homepage Metadata — TianJi Global
 *
 * Positions TianJi as a world-class AI-powered destiny reading platform
 * combining BaZi, ZiWei Dou Shu, Western astrology, compatibility analysis,
 * and life path insights. Bilingual-friendly wording.
 *
 * Replace OG image URL and canonical with production domain when deploying.
 */
export const metadata: Metadata = {
  title: 'TianJi Global | 天机全球 — Premium AI Destiny & Astrology Platform',
  description:
    'Discover your life path with TianJi — the premium AI-powered platform uniting BaZi, Zi Wei Dou Shu, Western astrology, tarot, and compatibility analysis. Bilingual reports. Trusted worldwide.',
  keywords: [
    'AI astrology',
    'BaZi reading',
    '八字命理',
    'Zi Wei Dou Shu',
    '紫微斗数',
    'life path insights',
    'compatibility analysis',
    'astrology platform',
    'tarot reading',
    'birth chart',
    'horoscope',
    '易经',
    'Yi Jing',
    'synastry',
    'feng shui',
    'transit analysis',
    '天机全球',
    'TianJi Global',
    'premium fortune telling',
    'AI destiny reading',
    'bilingual astrology report',
    'Chinese metaphysics',
    'Western astrology',
  ],
  openGraph: {
    title: 'TianJi Global | 天机全球 — Premium AI Destiny & Astrology',
    description:
      'Uncover your destiny with precision. BaZi, Zi Wei Dou Shu, Western astrology, tarot & compatibility — all in one AI-powered platform. Bilingual. Trusted by seekers worldwide.',
    type: 'website',
    locale: 'en_US',
    url: 'https://tianji.global', // Replace with production URL
    siteName: 'TianJi Global',
    images: [
      {
        url: '/og-image.png', // Replace with production OG image
        width: 1200,
        height: 630,
        alt: 'TianJi Global — Premium AI Destiny & Astrology Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TianJi Global | 天机全球 — AI Destiny & Astrology',
    description:
      'BaZi, Zi Wei, astrology, tarot & compatibility — precision AI insights for your life path. Bilingual. Premium.',
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
