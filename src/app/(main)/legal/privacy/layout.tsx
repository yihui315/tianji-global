import type { Metadata } from 'next';

const TITLE = 'Privacy Policy | 隐私政策 — How TianJi Handles Your Data';
const DESCRIPTION =
  'How TianJi collects, uses, stores, and deletes your data. Your GDPR / CCPA rights, our 14-day deletion guarantee, and how to contact privacy@tianji.love.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: 'https://tianji.love/legal/privacy' },
  robots: { index: true, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://tianji.love/legal/privacy',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
