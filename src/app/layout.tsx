import type { Metadata } from 'next';
import './globals.css';
import { SessionProvider } from 'next-auth/react';

export const metadata: Metadata = {
  title: 'Tianji Love | AI Relationship Reading',
  description: 'AI relationship reading for compatibility, love timing, one-question clarity, and three-card relationship insight.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://tianji.love'),
  openGraph: {
    title: 'Tianji Love | AI Relationship Reading',
    description: 'Compatibility, love timing, one-question clarity, and three-card relationship insight.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['zh_CN'],
    siteName: 'Tianji Love',
    images: ['/api/og?title=Tianji+Love&subtitle=AI+Relationship+Reading'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tianji Love | AI Relationship Reading',
    description: 'Compatibility, love timing, one-question clarity, and three-card relationship insight.',
  },
  icons: {
    icon: [{ url: '/assets/favicon.svg', type: 'image/svg+xml' }],
    shortcut: '/assets/favicon.svg',
    apple: '/assets/favicon.svg',
  },
};

function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#050508] text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
