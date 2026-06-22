'use client';

import { LeadCaptureForm } from '@/components/marketing/LeadCaptureForm';

export function LeadCaptureFormWrapper({
  sourcePage,
  variant,
}: {
  sourcePage: string;
  variant: 'inline' | 'section';
}) {
  return <LeadCaptureForm sourcePage={sourcePage} variant={variant} />;
}
