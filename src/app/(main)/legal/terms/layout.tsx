import type { Metadata } from 'next';

const TITLE = 'Terms of Service | Conditions for Using Tianji Love';
const DESCRIPTION =
  'The terms governing your use of Tianji Love services: service scope, reflection-only disclaimer, user responsibilities, intellectual property, and limitations of liability.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: 'https://tianji.love/legal/terms' },
  robots: { index: true, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://tianji.love/legal/terms',
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
