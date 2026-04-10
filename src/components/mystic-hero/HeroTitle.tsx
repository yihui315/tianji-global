'use client';

/**
 * Skill: /full-screen-mystic-hero  (title sub-component)
 *
 * Bilingual hero title with silk-glow + pulse effect:
 *   ZH: "预知未来 · 命运已书写"
 *   EN: "Foresee the Future · Destiny is Written"
 *   Subtitle: "世界级占卜 · 星座 · 塔罗 · 命运指引"
 */

export default function HeroTitle() {
  return (
    <div className="text-center relative z-10">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/[0.06] backdrop-blur-md rounded-full mb-8 border border-amber-300/20 animate-pulse-subtle">
        <span className="text-amber-300 text-lg">✦</span>
        <span className="text-amber-200/80 text-xs tracking-[3px] font-medium uppercase">
          Mystic · Astrology · Tarot
        </span>
      </div>

      {/* Main title */}
      <h1 className="mystic-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif leading-[1.05] tracking-tighter text-white mb-3">
        <span className="block">预知未来</span>
        <span className="block mt-1 bg-gradient-to-r from-amber-300 via-purple-300 to-amber-300 bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_auto]">
          命运已书写
        </span>
      </h1>

      {/* English title */}
      <p className="text-base sm:text-lg md:text-xl text-white/40 font-serif italic tracking-wide mb-6">
        Foresee the Future · Destiny is Written
      </p>

      {/* Subtitle */}
      <p className="text-sm sm:text-base md:text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
        世界级占卜 · 星座 · 塔罗 · 命运指引
        <br />
        <span className="text-white/30 text-xs sm:text-sm">
          World-Class Divination · Astrology · Tarot · Destiny Guidance
        </span>
      </p>
    </div>
  );
}
