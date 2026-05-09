import type { Metadata } from 'next';
import './globals.css';
import { SessionProvider } from 'next-auth/react';

export const metadata: Metadata = {
  title: 'TianJi Global | Premium AI Destiny Platform',
  description: 'A premium AI destiny platform for timing, relationship insight, and shareable readings.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://tianji.global'),
  openGraph: {
    title: 'TianJi Global | Premium AI Destiny Platform',
    description: 'A premium AI destiny platform for timing, relationship insight, and shareable readings.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['zh_CN'],
    siteName: 'TianJi Global',
    images: ['/api/og?title=TianJi+Global&subtitle=Premium+AI+Destiny+Platform'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TianJi Global | Premium AI Destiny Platform',
    description: 'A premium AI destiny platform for timing, relationship insight, and shareable readings.',
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
