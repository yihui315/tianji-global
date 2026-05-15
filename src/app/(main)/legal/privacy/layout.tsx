import type { Metadata } from 'next';

const TITLE = 'Privacy Policy | How Tianji Love Handles Your Data';
const DESCRIPTION =
  'How Tianji Love collects, uses, stores, and deletes your data, including privacy-safe public sharing and data request contacts.';

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
