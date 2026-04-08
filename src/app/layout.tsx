import type { Metadata } from 'next';
import './globals.css';
import { SessionProvider } from 'next-auth/react';

export const metadata: Metadata = {
  title: 'TianJi Global | 天机全球',
  description: 'AI-powered fortune platform combining Chinese metaphysics with modern psychology.',
  openGraph: {
    title: 'TianJi Global | 天机全球',
    description: 'AI-powered fortune platform combining Chinese metaphysics with modern psychology.',
    type: 'website',
    locale: 'en_US',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TianJi Global | 天机全球',
    description: 'AI-powered fortune platform combining Chinese metaphysics with modern psychology.',
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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
