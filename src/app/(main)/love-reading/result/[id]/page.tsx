import { redirect } from 'next/navigation';

type PageParams = {
  params: Promise<{ id: string }>;
};

export default async function LoveReadingResultPage({ params }: PageParams) {
  const { id } = await params;
  redirect(`/en/love-reading/result/${id}`);
}
