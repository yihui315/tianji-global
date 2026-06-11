import { redirect } from 'next/navigation';
import { isSupportedLocale, type Locale } from '@/lib/i18n';

type PageParams = { params: Promise<{ locale: string }> };

export default async function RelationshipPage({ params }: PageParams) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    redirect('/en/relationship/new');
  }
  redirect(`/${locale}/relationship/new`);
}