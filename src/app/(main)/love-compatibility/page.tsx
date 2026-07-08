import { redirect } from 'next/navigation';

export async function generateMetadata() {
  return {
    title: 'AI Relationship Compatibility Test — Love Synastry Report | Tianji Love',
    description: 'Get a personalized AI relationship compatibility analysis using BaZi and Western astrology. Includes emotional sync, communication, timing, and long-term potential.',
    alternates: {
      languages: {
        'en': '/love-compatibility',
        'zh-CN': '/zh-CN/love-compatibility',
        'x-default': '/love-compatibility',
      },
    },
  };
}

export default function LoveCompatibilityPage() {
  redirect('/relationship/new');
}
