import { permanentRedirect } from 'next/navigation';

type PageParams = {
  searchParams: Promise<{ lang?: string }>;
};

export default async function LegacyTermsPage({ searchParams }: PageParams) {
  const { lang } = await searchParams;
  const targetLang = lang && ['en', 'zh'].includes(lang) ? lang : 'en';
  permanentRedirect(`/legal/terms?lang=${targetLang}`);
}
