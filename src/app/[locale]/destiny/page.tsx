import { redirect } from 'next/navigation';
import { isSupportedLocale } from '@/lib/i18n';

type PageParams = { params: Promise<{ locale: string }> };

export default async function DestinyPage({ params }: PageParams) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    redirect('/en/destiny/scan');
  }
  redirect(`/${locale}/destiny/scan`);
}