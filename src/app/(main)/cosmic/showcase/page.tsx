'use client';

import dynamic from 'next/dynamic';

const CosmicShowcase = dynamic(() => import('@/components/three-d/CosmicShowcase'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-[#1C1533]" />,
});

export default function CosmicShowcasePage() {
  return <CosmicShowcase />;
}
