'use client';

import dynamic from 'next/dynamic';

const LeadCaptureFormInner = dynamic(
  () => import('./LeadCaptureFormInner').then((m) => m.LeadCaptureFormInner),
  {
    loading: () => (
      <div className="animate-pulse rounded-lg border border-[#b57248]/24 bg-[#1a0e0a]/60 p-6">
        <div className="h-4 w-32 rounded bg-[#b57248]/20" />
        <div className="mt-3 h-10 rounded bg-[#b57248]/16" />
        <div className="mt-2 h-10 rounded bg-[#b57248]/16" />
      </div>
    ),
    ssr: false,
  }
);

type LeadCaptureFormProps = {
  sourcePage: string;
  variant?: string;
};

export function LeadCaptureForm({ sourcePage, variant = 'default' }: LeadCaptureFormProps) {
  return <LeadCaptureFormInner sourcePage={sourcePage} variant={variant} />;
}
