import type { Metadata } from 'next';
import './globals.css';
import { SessionProvider } from 'next-auth/react';

export const metadata: Metadata = {
  title: 'Tianji Love | Private Cosmic Relationship Reading',
  description: 'Discover romantic patterns, emotional timing, and relationship compatibility through a private Tianji Love reading.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://tianji.love'),
  openGraph: {
    title: 'Tianji Love | Private Relationship & Fortune Insights',
    description: 'Private, calm relationship guidance and fortune readings — designed for reflection, not predictions.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['zh_CN'],
    siteName: 'Tianji Love',
    images: ['/api/og?title=Tianji+Love&subtitle=Private+Relationship+Insights'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tianji Love | Private Relationship & Fortune Insights',
    description: 'Relationship guidance and fortune readings — designed for reflection, not predictions.',
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
      <body className="min-h-screen bg-[#1C1533] text-[#F7F1E8] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
