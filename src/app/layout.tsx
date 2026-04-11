import type { Metadata } from 'next';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { Cinzel, Noto_Serif_SC } from 'next/font/google';

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

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-cinzel',
  display: 'swap',
});

const notoSerifSC = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-noto-serif-sc',
  display: 'swap',
});

function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={`${cinzel.variable} ${notoSerifSC.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
