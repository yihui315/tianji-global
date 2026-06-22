'use client';

import { Suspense } from 'react';
import { LeadCaptureFormInner } from './LeadCaptureFormInner';

type LeadCaptureFormProps = {
  sourcePage: string;
  variant?: string;
};

function LeadCaptureFormSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-[#b57248]/24 bg-[#1a0e0a]/60 p-6">
      <div className="h-4 w-32 rounded bg-[#b57248]/20" />
      <div className="mt-3 h-10 rounded bg-[#b57248]/16" />
      <div className="mt-2 h-10 rounded bg-[#b57248]/16" />
    </div>
  );
}

export function LeadCaptureForm({ sourcePage, variant = 'default' }: LeadCaptureFormProps) {
  return (
    <Suspense fallback={<LeadCaptureFormSkeleton />}>
      <LeadCaptureFormInner sourcePage={sourcePage} variant={variant} />
    </Suspense>
  );
}
