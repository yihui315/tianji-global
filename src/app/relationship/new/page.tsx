import { Metadata } from 'next';
import { Suspense } from 'react';
import RelationshipNewClient from './client';

export const metadata: Metadata = {
  title: 'Relationship Analysis | TianJi Global',
  description: 'Analyze relationship compatibility with AI-powered astrology',
};

export default function RelationshipNewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#03040a]" />}>
      <RelationshipNewClient />
    </Suspense>
  );
}
