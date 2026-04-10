'use client';

import MysticHero from '@/components/mystic-hero/MysticHero';

/**
 * TianJi Global — Mystic Fortune-Telling Homepage
 *
 * Features:
 * - Full-screen cosmic background with stardust & floating zodiac symbols
 * - Crystal-ball vignette overlay
 * - Perlin-noise breathing wobble on hero elements
 * - Decorative 3D tarot card flip
 * - Bilingual glowing title + CTA with mouse-trailing symbols
 * - Minimal navigation (mobile-responsive)
 * - Live config panel for parameter tuning
 */

const SERVICES = [
  { href: '/ziwei', icon: '🌟', title: '紫微斗数', desc: '14主星 · 12宫位 · 四化飞星' },
  { href: '/bazi', icon: '📊', title: '八字命理', desc: '日主 · 十神 · 大运流年' },
  { href: '/yijing', icon: '🔮', title: '易经占卜', desc: '64卦 · 爻辞 · 象数分析' },
  { href: '/western', icon: '⭐', title: '西方星盘', desc: 'SWEPH精确计算 · AstroChart专业星盘' },
  { href: '/synastry', icon: '💫', title: '合盘分析', desc: '叠盘 · 复合盘 · 戴维森盘' },
  { href: '/tarot', icon: '🃏', title: '塔罗占卜', desc: '78张牌 · AI智能解读' },
  { href: '/numerology', icon: '🔢', title: '姓名命理', desc: '三才五格 · 数理磁场' },
  { href: '/solar-return', icon: '☀️', title: '太阳返照', desc: '年度运势 · 生日星盘' },
  { href: '/transit', icon: '🔭', title: 'Transit推运', desc: '次限推进 · 顺逆行分析' },
  { href: '/fengshui', icon: '🏠', title: '风水布局', desc: '八宅 · 玄空飞星' },
  { href: '/electional', icon: '📅', title: '择日择吉', desc: '黄道吉日 · 最优时辰' },
  { href: '/horary', icon: '🌀', title: '卦占', desc: '时间卦 · 即时天机' },
];

export default function Home() {
  return (
    <div className="mystic-page bg-[#030014] text-white min-h-screen">
      {/* ═══════ Immersive Mystic Hero ═══════ */}
      <MysticHero />

      {/* ═══════ Services Section ═══════ */}
      <section id="services" className="relative z-10 py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <h2 className="text-4xl sm:text-5xl font-serif text-center text-white mb-4">十二天机法门</h2>
          <p className="text-center text-white/40 text-sm mb-12 sm:mb-16">Twelve Paths of Celestial Wisdom</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {SERVICES.map((s) => (
              <a
                key={s.href}
                href={s.href}
                className="group bg-gradient-to-br from-white/[0.03] to-white/[0.07] border border-white/[0.08] hover:border-amber-300/40 rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-300/[0.07]"
              >
                <div className="text-4xl sm:text-5xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
                <h3 className="text-xl sm:text-2xl font-serif text-white mb-2">{s.title}</h3>
                <p className="text-white/50 text-sm sm:text-base">{s.desc}</p>
                <div className="mt-6 sm:mt-8 text-amber-300/70 group-hover:text-amber-200 flex items-center gap-2 text-sm transition-colors">
                  开始排盘 <span className="text-base group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ How It Works ═══════ */}
      <section id="how" className="relative z-10 py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-serif text-white mb-4">天机如何运转</h2>
          <p className="text-white/40 text-sm mb-12 sm:mb-16">How TianJi Works</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12">
            {[
              { step: '01', title: '输入生辰', titleEn: 'Birth Data', desc: '提供你的出生日期、时间和地点' },
              { step: '02', title: 'AI解析', titleEn: 'AI Analysis', desc: '瑞士星历表+古籍算法，精准计算星体位置' },
              { step: '03', title: '深度解读', titleEn: 'Deep Reading', desc: '融合现代心理学与古典命理，给你专属分析' },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="text-6xl sm:text-7xl font-serif text-amber-300/15 mb-4">{item.step}</div>
                <h3 className="text-lg sm:text-xl font-serif text-white mb-1">{item.title}</h3>
                <p className="text-white/30 text-xs mb-2">{item.titleEn}</p>
                <p className="text-white/50 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ Final CTA ═══════ */}
      <section className="relative z-10 py-16 sm:py-20 text-center">
        <div className="inline-block bg-gradient-to-b from-transparent via-purple-900/20 to-transparent px-12 sm:px-20 py-12 sm:py-16">
          <p className="text-2xl sm:text-3xl font-serif text-amber-300/80">天机已为你准备好答案</p>
          <p className="text-white/30 text-xs mt-2 mb-6 sm:mb-8">Destiny Awaits Your Discovery</p>
          <a href="/western">
            <button className="px-10 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl bg-white/[0.08] border border-white/15 text-white rounded-full hover:bg-amber-300/10 hover:border-amber-300/40 hover:text-amber-200 transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(245,158,11,0.25)]">
              进入完整命盘
            </button>
          </a>
        </div>
      </section>

      {/* ═══════ Footer ═══════ */}
      <footer className="relative z-10 border-t border-white/[0.05] py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-amber-300/50 text-sm">☯︎</span>
            <span className="text-white/30 text-xs">TianJi Global · 天机全球</span>
          </div>
          <p className="text-white/20 text-xs">© 2024 TianJi Global. 娱乐参考 · Entertainment purposes only.</p>
        </div>
      </footer>
    </div>
  );
}
