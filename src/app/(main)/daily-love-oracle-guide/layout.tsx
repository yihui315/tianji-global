import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daily Love Oracle Guide | TianJi Love',
  description:
    'Start each day with clarity and guidance. TianJi Love Daily Oracle draws from ancient wisdom — tarot, astrology, and human design — to illuminate your love path today.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
