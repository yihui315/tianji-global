'use client';

import dynamic from 'next/dynamic';

const AnimationShowcaseClient = dynamic(
  () => import('./_AnimationShowcaseClient'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-purple-400">Loading...</div>
      </div>
    ),
  }
);

export default function AnimationShowcasePage() {
  return <AnimationShowcaseClient />;
}
