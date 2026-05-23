'use client';

import { useParams } from 'next/navigation';
import { FileText, Lock, Sparkles } from 'lucide-react';

import {
  getTianjiLoveFooterNav,
  getTianjiLovePrimaryCta,
  getTianjiLovePrimaryNav,
  TianjiLoveButton,
  TianjiLoveFooter,
  TianjiLoveHeader,
  TianjiLovePanel,
  TianjiLoveShell,
  TianjiLoveTrustCard,
} from '@/components/tianji-love';

export default function ReportPage() {
  const params = useParams<{ id: string }>();

  return (
    <TianjiLoveShell className="tianji-love-report-placeholder" ariaLabel="Tianji Love report page">
      <TianjiLoveHeader
        homeHref="/"
        navItems={getTianjiLovePrimaryNav('en')}
        cta={getTianjiLovePrimaryCta('en')}
      />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-92px)] w-full max-w-5xl items-center px-5 py-14 sm:px-8">
        <TianjiLovePanel className="w-full p-7 text-center sm:p-10">
          <Sparkles className="mx-auto mb-5 h-8 w-8 text-[#d8b77b]" aria-hidden />
          <p className="text-xs uppercase tracking-[0.32em] text-[#d8b77b]/66">Tianji Love / Report</p>
          <h1 className="mx-auto mt-4 max-w-3xl font-serif text-4xl font-semibold leading-tight text-[#ffe3b4] sm:text-5xl">
            Your report surface is being prepared.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#f4d7a3]/72">
            Report ID <span className="font-mono text-[#ffe3b4]">{params.id}</span> will open here when the associated reading is available.
          </p>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            <TianjiLoveTrustCard icon={FileText} title="Report-ready" body="This route now uses the same Tianji Love report shell as the conversion flow." />
            <TianjiLoveTrustCard icon={Lock} title="Privacy-safe" body="Sensitive birth details are not displayed on placeholder or public report surfaces." />
            <TianjiLoveTrustCard icon={Sparkles} title="Next step" body="Start a private love reading or compatibility report while this report is unavailable." />
          </div>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <TianjiLoveButton href="/ask">Start Love Reading</TianjiLoveButton>
            <TianjiLoveButton href="/relationship/new" variant="secondary">Start Relationship Reading</TianjiLoveButton>
          </div>
        </TianjiLovePanel>
      </section>

      <TianjiLoveFooter
        homeHref="/"
        disclaimer="Reports are for self-reflection and relationship communication, not medical, legal, financial, or crisis advice."
        links={getTianjiLoveFooterNav('en')}
      />
    </TianjiLoveShell>
  );
}
