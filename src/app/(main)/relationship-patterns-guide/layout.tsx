export async function generateMetadata() {
  return {
    title: 'Relationship Patterns Guide — Recognize Attachment Styles & Healing Cycles | Tianji Love',
    description: 'Discover the repeating patterns shaping your love life. Learn to identify attachment styles, communication loops, and timing cycles through astrology.',
    alternates: {
      languages: {
        'en': '/relationship-patterns-guide',
        'zh-CN': '/zh-CN/relationship-patterns-guide',
        'x-default': '/relationship-patterns-guide',
      },
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
