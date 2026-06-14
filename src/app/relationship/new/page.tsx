import { Metadata } from 'next';
import { Suspense } from 'react';
import RelationshipNewClient from './client';

export const metadata: Metadata = {
  title: 'Relationship Analysis | Tianji Love',
  description: 'Analyze relationship compatibility with AI-powered astrology',
};

export default function RelationshipNewPage() {
  return (
    <Suspense fallback={null}>
      <RelationshipNewClient />
    </Suspense>
  );
}
