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
    images: ['/api/og?title=TianJi+Global&subtitle=Premium+AI+Destiny+Platform'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TianJi Global | Premium AI Destiny Platform',
    description: 'A premium AI destiny platform for timing, relationship insight, and shareable readings.',
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
