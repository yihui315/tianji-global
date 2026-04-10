'use client';

/**
 * Skill: /full-screen-mystic-hero
 *
 * Orchestrates ALL mystic sub-components into a single immersive hero section:
 *   CosmicBackground  → deep space + stardust + zodiac particles
 *   MysticVignette    → crystal-ball radial vignette
 *   CosmicBreathing   → Perlin noise breathing wrapper
 *   TarotCardFlip     → decorative tarot cards (desktop only)
 *   HeroTitle         → bilingual glowing title
 *   HeroCTA           → CTA buttons with mouse-trailing symbols
 *   MysticNav         → minimal navigation
 *   ConfigPanel       → live parameter tuning
 */

import CosmicBackground from './CosmicBackground';
import MysticVignette from './MysticVignette';
import CosmicBreathing from './CosmicBreathing';
import TarotCardFlip from './TarotCardFlip';
import HeroTitle from './HeroTitle';
import HeroCTA from './HeroCTA';
import MysticNav from './MysticNav';
import ConfigPanel from './ConfigPanel';

export default function MysticHero() {
  return (
    <>
      {/* Global layers */}
      <CosmicBackground />
      <MysticVignette />
      <MysticNav />
      <ConfigPanel />

      {/* Hero section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden z-[5]">
        {/* Decorative tarot cards — hidden on mobile */}
        <TarotCardFlip position="left" />
        <TarotCardFlip position="right" />

        {/* Breathing wrapper around all hero content */}
        <CosmicBreathing className="relative px-6 py-32 sm:py-36 md:py-40 max-w-4xl mx-auto">
          <HeroTitle />
          <HeroCTA />

          {/* Floating decorative elements */}
          <div className="hidden lg:block absolute -right-16 bottom-8 text-amber-300/15 text-7xl animate-mystic-float select-none">
            ☯︎
          </div>
          <div className="hidden lg:block absolute -left-12 top-24 text-purple-300/10 text-5xl animate-mystic-float-delay select-none">
            ★
          </div>

          {/* Disclaimer */}
          <p className="text-center text-white/20 text-[10px] mt-12 tracking-wider">
            ✦ 娱乐参考 · 非绝对预测 · Entertainment purposes only ✦
          </p>
        </CosmicBreathing>
      </section>
    </>
  );
}
