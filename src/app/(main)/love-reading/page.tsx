import { redirect } from 'next/navigation';

export async function generateMetadata() {
  return {
    title: 'Love Reading — Personalized Astrology Relationship Report | Tianji Love',
    description: 'Get a personalized love reading based on your birth chart. Explore compatibility, timing windows, and hidden dynamics with BaZi, I Ching, and Western astrology.',
    alternates: {
      languages: {
        'en': '/love-reading',
        'zh-CN': '/zh-CN/love-reading',
        'x-default': '/love-reading',
      },
    },
  };
}

export default function LoveReadingPage() {
  redirect('/en/love-reading');
}
