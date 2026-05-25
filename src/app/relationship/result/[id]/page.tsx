import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { RelationshipResult } from '@/components/relationship/RelationshipResult';
import {
  getTianjiLoveFooterNav,
  getTianjiLovePrimaryCta,
  getTianjiLovePrimaryNav,
  TianjiLoveFooter,
  TianjiLoveHeader,
  TianjiLovePanel,
  TianjiLoveShell,
} from '@/components/tianji-love';
import { withLanguageParam, type AppLanguage } from '@/lib/language-routing';
import { buildRelationshipEvidence } from '@/lib/divination/evidence';
import { getRelationshipReadingById } from '@/lib/relationship-reading-store';

type PageParams = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ checkout?: string; lang?: string }>;
};

export const metadata: Metadata = {
  title: 'Relationship Report | Tianji Love',
  description: 'View your private relationship compatibility report.',
  robots: {
    index: false,
    follow: false,
  },
};

function getLanguage(value?: string): AppLanguage {
  return value === 'zh' || value === 'zh-CN' ? 'zh' : 'en';
}

export default async function RelationshipResultPage({ params, searchParams }: PageParams) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const language = getLanguage(query.lang);
  const reading = await getRelationshipReadingById(id);

  if (!reading) notFound();

  const href = (path: string) => withLanguageParam(path, language);
  const isPaid = reading.accessLevel === 'full' || reading.isPremium;
  const evidence = reading.evidence ?? buildRelationshipEvidence({ reading, paid: isPaid, language });
  const readingWithEvidence = { ...reading, evidence };

  return (
    <TianjiLoveShell className="tianji-love-relationship-result-page" ariaLabel="Tianji Love relationship result">
      <TianjiLoveHeader
        homeHref={href('/')}
        navItems={getTianjiLovePrimaryNav(language, href)}
        cta={getTianjiLovePrimaryCta(language, href)}
      />

      <main className="relative z-10 mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
        <Link href={href('/relationship/new')} className="text-sm text-[#f4d7a3]/58 transition hover:text-[#ffe3b4]">
          Back to relationship reading
        </Link>

        {query.checkout === 'success' && reading.isPremium ? (
          <TianjiLovePanel className="mt-6 p-5">
            <p className="text-sm font-semibold text-[#ffe3b4]">
              Your full relationship report is unlocked.
            </p>
            <p className="mt-2 text-sm leading-6 text-[#f4d7a3]/62">
              This result is shown after server-side payment verification.
            </p>
          </TianjiLovePanel>
        ) : null}

        {query.checkout === 'cancelled' ? (
          <TianjiLovePanel className="mt-6 p-5">
            <p className="text-sm font-semibold text-[#ffe3b4]">
              Checkout was cancelled.
            </p>
            <p className="mt-2 text-sm leading-6 text-[#f4d7a3]/62">
              You can keep the free First Signal and unlock the full report later.
            </p>
          </TianjiLovePanel>
        ) : null}

        <section className="mt-6">
          <RelationshipResult reading={readingWithEvidence} lang={language} />
        </section>
      </main>

      <TianjiLoveFooter
        homeHref={href('/')}
        disclaimer={
          'Relationship reports are reflective guidance, not therapy, crisis support, legal advice, or medical advice.'
        }
        links={getTianjiLoveFooterNav(language, href)}
      />
    </TianjiLoveShell>
  );
}
