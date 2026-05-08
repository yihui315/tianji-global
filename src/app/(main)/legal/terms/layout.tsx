import type { Metadata } from 'next';

const TITLE = 'Terms of Service | 服务条款 — Conditions for Using TianJi';
const DESCRIPTION =
  'The terms governing your use of TianJi services — service description, entertainment disclaimer, user responsibilities, intellectual property, and limitations of liability.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: 'https://tianji.global/legal/terms' },
  robots: { index: true, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://tianji.global/legal/terms',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
