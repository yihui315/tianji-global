export async function generateMetadata() {
  return {
    title: 'Love Timing Insights: Planetary Cycles for Relationship Decisions | Tianji Love',
    description: 'Understand when love is likely to move forward. AI analyzes planetary transits through your 5th, 7th, 8th, and 10th houses for optimal relationship timing.',
    alternates: {
      languages: {
        'en': '/love-timing-insights',
        'zh-CN': '/zh-CN/love-timing-insights',
        'x-default': '/love-timing-insights',
      },
    },
  };
}

export default function LoveTimingInsightsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
