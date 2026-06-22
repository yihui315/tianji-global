'use client';

import { useState, useEffect } from 'react';
import { LeadCaptureForm } from '@/components/marketing/LeadCaptureForm';

function LeadCaptureFormSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-[#b57248]/24 bg-[#1a0e0a]/60 p-6">
      <div className="h-4 w-32 rounded bg-[#b57248]/20" />
      <div className="mt-3 h-10 rounded bg-[#b57248]/16" />
      <div className="mt-2 h-10 rounded bg-[#b57248]/16" />
    </div>
  );
}

export function LeadCaptureFormWrapper({
  sourcePage,
  variant,
}: {
  sourcePage: string;
  variant?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LeadCaptureFormSkeleton />;
  }

  return <LeadCaptureForm sourcePage={sourcePage} variant={variant} />;
}
