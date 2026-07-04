export async function generateMetadata() {
  return {
    title: 'Free AI Tarot Love Reading Online — Instant Card Interpretations | Tianji Love',
    description: 'Draw tarot cards for love guidance with AI. Single card, three-card, and Celtic Cross spreads available. Free instant reading with personalized interpretations.',
    alternates: {
      languages: {
        'en': '/tarot-love-reading-online',
        'zh-CN': '/zh-CN/tarot-love-reading-online',
        'x-default': '/tarot-love-reading-online',
      },
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
