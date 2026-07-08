export async function generateMetadata() {
  return {
    title: 'Free BaZi Relationship Analysis: Chinese Astrology Love Insights | Tianji Love',
    description: 'Explore your BaZi (Eight Characters) for free relationship insights. Discover your birth pillars, element balance, and love style through Chinese astrology.',
    alternates: {
      languages: {
        'en': '/bazi-relationship-analysis-free',
        'zh-CN': '/zh-CN/bazi-relationship-analysis-free',
        'x-default': '/bazi-relationship-analysis-free',
      },
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
