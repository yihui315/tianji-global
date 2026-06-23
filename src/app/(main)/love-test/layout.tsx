import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Love Test | Fate-Match Snapshot — Tianji Love',
  description:
    'Use two names, a relationship status, and one question to get a private fate-match snapshot before any checkout. Free, no payment required.',
  keywords: [
    'free love test',
    'fate match',
    'compatibility test',
    'relationship snapshot',
    'love reading free',
    'AI love test',
  ],
  openGraph: {
    title: 'Free Love Test | Fate-Match Snapshot — Tianji Love',
    description:
      'Start with a free private fate-match. Two names, one question, no checkout.',
    type: 'website',
    locale: 'en_US',
    url: 'https://tianji.love/love-test',
    siteName: 'Tianji Love',
    images: [
      {
        url: '/api/og?title=Free+Love+Test&subtitle=Fate-Match+Snapshot&module=tianji',
        width: 1200,
        height: 630,
        alt: 'Free Love Test — Tianji Love',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Love Test | Fate-Match Snapshot — Tianji Love',
    description: 'Start with a free private fate-match. Two names, one question, no checkout.',
    images: ['/api/og?title=Free+Love+Test&subtitle=Fate-Match+Snapshot&module=tianji'],
  },
  alternates: {
    canonical: 'https://tianji.love/love-test',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LoveTestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
