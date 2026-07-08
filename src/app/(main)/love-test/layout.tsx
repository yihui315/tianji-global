export async function generateMetadata() {
  return {
    title: 'Free Love Test — Fate Match Snapshot | Tianji Love',
    description: 'Take the free TianJi fate-match test. Enter two nicknames and get a deterministic compatibility snapshot with archetype, score, and actionable insights.',
    alternates: {
      languages: {
        'en': '/love-test',
        'zh-CN': '/zh-CN/love-test',
        'x-default': '/love-test',
      },
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
