'use client';

import dynamic from 'next/dynamic';

const CosmicShowcase = dynamic(() => import('@/components/three-d/CosmicShowcase'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-[#0a0a0a]" />,
});

export default function CosmicShowcasePage() {
  return <CosmicShowcase />;
}
