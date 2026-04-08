import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TianJi Global | 天机全球',
  description: 'AI-powered fortune platform combining Chinese metaphysics with modern psychology.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
