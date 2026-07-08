import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Services | TianJi Love',
  description:
    'Professional astrology and AI-powered relationship services. Love test, compatibility reading, timing insights, and more.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
