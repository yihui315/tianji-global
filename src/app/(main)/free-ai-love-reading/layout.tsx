export async function generateMetadata() {
  return {
    title: 'Free AI Love Reading: Instant Astrology-Informed Relationship Insights | Tianji Love',
    description: 'Get a free AI-powered love reading in minutes. Astrology-based relationship analysis covering compatibility, timing signals, and reflection prompts.',
    alternates: {
      languages: {
        'en': '/free-ai-love-reading',
        'zh-CN': '/zh-CN/free-ai-love-reading',
        'x-default': '/free-ai-love-reading',
      },
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
