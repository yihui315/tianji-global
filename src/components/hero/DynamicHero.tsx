'use client';

import dynamic from 'next/dynamic';

const HeroCanvas = dynamic(() => import('./HeroCanvas'), {
  ssr: false,
  loading: () => (
    <div className="hero-loading">
      <div className="hero-spinner" />
    </div>
  ),
});

export default function DynamicHero() {
  return <HeroCanvas />;
}
