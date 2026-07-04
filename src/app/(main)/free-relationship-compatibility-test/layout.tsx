export async function generateMetadata() {
  return {
    title: 'Free Relationship Compatibility Test — Instant AI Love Score | Tianji Love',
    description: 'Enter two birthdays for an instant AI-powered compatibility analysis across emotional, communication, timing, conflict, and long-term potential dimensions.',
    alternates: {
      languages: {
        'en': '/free-relationship-compatibility-test',
        'zh-CN': '/zh-CN/free-relationship-compatibility-test',
        'x-default': '/free-relationship-compatibility-test',
      },
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
