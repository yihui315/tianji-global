import { Metadata } from 'next';
import { Suspense } from 'react';
import RelationshipNewClient from './client';

export const metadata: Metadata = {
  title: 'Tianji Love Compatibility | Relationship Pattern Report',
  description: 'Create a private Tianji Love compatibility report with relationship patterns, timing signals, and privacy-safe sharing.',
};

export default function RelationshipNewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#03040a]" />}>
      <RelationshipNewClient />
    </Suspense>
  );
}
