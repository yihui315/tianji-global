export async function generateMetadata() {
  return {
    title: 'Daily Love Oracle — Free Daily Relationship Inspiration签 | Tianji Love',
    description: 'Draw a free daily love oracle based on your mood. Deterministic results tied to today\'s planetary energy — no login, no AI call, no database.',
    alternates: {
      languages: {
        'en': '/daily-oracle',
        'zh-CN': '/zh-CN/daily-oracle',
        'x-default': '/daily-oracle',
      },
    },
  };
}

export default function DailyOracleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
