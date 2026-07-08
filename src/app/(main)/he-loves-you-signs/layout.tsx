import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Signs He Loves You — Quiz & Behavioral Guide to Read His True Feelings',
    description:
      '22 behavioral and astrological signs to know if he truly loves you. Venus, Mars, Moon analysis plus actionable relationship quizzes for emotional clarity.',
    alternates: {
      languages: {
        en: '/he-loves-you-signs',
        'zh-CN': '/zh-CN/he-loves-you-signs',
        'x-default': '/he-loves-you-signs',
      },
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
