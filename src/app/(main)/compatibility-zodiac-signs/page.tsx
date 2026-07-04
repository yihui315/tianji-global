'use client';

import { TianjiLoveShell } from '@/components/layout/TianjiLoveShell';
import { TianjiLoveHeader } from '@/components/layout/TianjiLoveHeader';
import { TianjiLoveFooter } from '@/components/layout/TianjiLoveFooter';
import { AdSenseSlot } from '@/components/ads/AdSenseSlot';
import { AffiliateProductGrid } from '@/components/affiliate/AffiliateProductGrid';

export async function generateMetadata() {
  return {
    title: 'Complete Zodiac Compatibility Guide — All 12 Signs Love Match Chart',
    description: 'Full zodiac compatibility guide for all 12 signs. Element patterns, love styles, challenges, and growth edges for every zodiac archetype — Aries to Pisces.',
    alternates: {
      languages: {
        'en': '/compatibility-zodiac-signs',
        'zh-CN': '/zh-CN/compatibility-zodiac-signs',
        'x-default': '/compatibility-zodiac-signs',
      },
    },
  };
}

const AFFILIATE_PRODUCTS = [
  {
    nameEn: 'Love Horoscope 2025 — Annual Forecast',
    nameZh: '2025爱情星座运势',
    link: 'https://www.amazon.com/s?k=love+horoscope+2025&tag=tianjilove-20',
    imageUrl: 'https://m.media-amazon.com/images/I/41Qv-Nb5S8L._AC_SY200_.jpg',
    tag: 'amazon' as const,
    price: '$9.99',
    rating: 4.4,
    reviews: 3891,
  },
  {
    nameEn: 'Rose Quartz Crystal Set — Love & Healing',
    nameZh: '玫瑰石英水晶套装',
    link: 'https://www.amazon.com/s?k=rose+quartz+crystal+set+love&tag=tianjilove-20',
    imageUrl: 'https://m.media-amazon.com/images/I/51p5xkV5p7L._AC_SY200_.jpg',
    tag: 'crystal' as const,
    price: '$22.95',
    rating: 4.7,
    reviews: 2103,
  },
  {
    nameEn: 'Chinese Astrology & Love Compatibility Guide',
    nameZh: '中国星座与爱情兼容性指南',
    link: 'https://www.amazon.com/s?k=chinese+astrology+love+compatibility&tag=tianjilove-20',
    imageUrl: 'https://m.media-amazon.com/images/I/51v8dFZbNyL._AC_SY200_.jpg',
    tag: 'book' as const,
    price: '$15.99',
    rating: 4.6,
    reviews: 876,
  },
];

const DISCLAIMER_EN = (
  <p className="mt-8 text-xs italic text-[#f4d7a3]/36">
    Zodiac compatibility is for entertainment and self-reflection. Our free AI love test
    provides personalized insights based on your birth chart.
  </p>
);

const SIGNS = [
  {
    sign: 'Aries ♈',
    element: 'Fire',
    rulling: 'Mars',
    traits: ['Bold', 'Direct', 'Passionate', 'Impatient', 'Competitive'],
    compatibleWith: ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'],
    incompatibleWith: ['Cancer', 'Capricorn', 'Libra'],
    loveStyle:
      'Aries falls fast and fiercely. They pursue what they want without hesitation, bringing electricity and excitement to relationships. They need a partner who can match their energy and give them space to lead.',
    challenge:
      'Impulsiveness and a need for dominance can create friction. Learning to slow down and truly listen — not just plan the next move — is their biggest relationship growth edge.',
    color: '#E63946',
    emoji: '♈',
  },
  {
    sign: 'Taurus ♉',
    element: 'Earth',
    rulling: 'Venus',
    traits: ['Patient', 'Devoted', 'Sensual', 'Stubborn', 'Materialistic'],
    compatibleWith: ['Virgo', 'Capricorn', 'Cancer', 'Pisces'],
    incompatibleWith: ['Aquarius', 'Leo', 'Aries'],
    loveStyle:
      'Taurus loves with unwavering loyalty and deep physical affection. They express devotion through touch, comfort, and showing up consistently. Once committed, they are in it for the long haul.',
    challenge:
      'Their resistance to change and tendency to equate love with security can keep them in relationships past their expiration date. Surrendering control is their lesson.',
    color: '#2A9D8F',
    emoji: '♉',
  },
  {
    sign: 'Gemini ♊',
    element: 'Air',
    rulling: 'Mercury',
    traits: ['Curious', 'Social', 'Witty', 'Inconsistent', 'Nervous'],
    compatibleWith: ['Libra', 'Aquarius', 'Aries', 'Leo'],
    incompatibleWith: ['Virgo', 'Pisces'],
    loveStyle:
      'Gemini loves with their mind first. They are drawn to stimulating conversation, playful banter, and variety. They need a partner who keeps them interested and allows them to express their many sides.',
    challenge:
      'Communicating their deeper feelings without retreating into wit and deflection is their primary growth area. Surface-level charm can mask a deeply sensitive core.',
    color: '#F4A261',
    emoji: '♊',
  },
  {
    sign: 'Cancer ♋',
    element: 'Water',
    rulling: 'Moon',
    traits: ['Nurturing', 'Intuitive', 'Protective', 'Moody', 'Clingy'],
    compatibleWith: ['Scorpio', 'Pisces', 'Virgo', 'Taurus'],
    incompatibleWith: ['Aries', 'Libra', 'Aquarius'],
    loveStyle:
      'Cancer loves with profound emotional depth and a protective instinct that runs bone-deep. They create homes wherever they go and need a partner who values emotional intimacy as much as they do.',
    challenge:
      'They can absorb their partner\'s moods too deeply and use emotional manipulation as a control mechanism. Learning to give space — and receive it — is essential.',
    color: '#A8DADC',
    emoji: '♋',
  },
  {
    sign: 'Leo ♌',
    element: 'Fire',
    rulling: 'Sun',
    traits: ['Confident', 'Generous', 'Dramatic', 'Proud', 'Self-centered'],
    compatibleWith: ['Aries', 'Sagittarius', 'Gemini', 'Libra'],
    incompatibleWith: ['Taurus', 'Scorpio', 'Capricorn'],
    loveStyle:
      'Leo loves like a grand performance — generous, warm, and meant to be seen. They bring sparkle, romance, and loyalty to relationships and need a partner who appreciates their drama without trying to outshine them.',
    challenge:
      'Seeking external validation and needing to always be the star can drain their partner. Learning that being loved does not require applause is their evolution.',
    color: '#F9C74F',
    emoji: '♌',
  },
  {
    sign: 'Virgo ♍',
    element: 'Earth',
    rulling: 'Mercury',
    traits: ['Analytical', 'Practical', 'Reliable', 'Critical', 'Anxious'],
    compatibleWith: ['Taurus', 'Capricorn', 'Cancer', 'Scorpio'],
    incompatibleWith: ['Sagittarius', 'Aries', 'Aquarius'],
    loveStyle:
      'Virgo shows love through acts of service and meticulous care. They notice every detail, remember every preference, and express affection by making life run smoother for their partner.',
    challenge:
      'Perfectionism and a tendency to fix what is not broken can make them critical partners. Accepting that love is messy — and that is okay — is their journey.',
    color: '#90BE6D',
    emoji: '♍',
  },
  {
    sign: 'Libra ♎',
    element: 'Air',
    rulling: 'Venus',
    traits: ['Charming', 'Diplomatic', 'Social', 'Indecisive', 'People-pleasing'],
    compatibleWith: ['Aquarius', 'Leo', 'Gemini', 'Sagittarius'],
    incompatibleWith: ['Capricorn', 'Virgo', 'Cancer'],
    loveStyle:
      'Libra loves with grace, fairness, and a deep appreciation for beauty and harmony. They are drawn to partnership as a life structure and need a companion who shares their love of connection and culture.',
    challenge:
      'Avoiding conflict at all costs and deferring decisions to keep the peace erodes their own voice. Speaking an uncomfortable truth is their growth edge.',
    color: '#F8961E',
    emoji: '♎',
  },
  {
    sign: 'Scorpio ♏',
    element: 'Water',
    rulling: 'Pluto',
    traits: ['Intense', 'Loyal', 'Passionate', 'Jealous', 'Secretive'],
    compatibleWith: ['Cancer', 'Pisces', 'Virgo', 'Capricorn'],
    incompatibleWith: ['Leo', 'Aquarius', 'Gemini'],
    loveStyle:
      'Scorpio loves with an all-or-nothing intensity that is both thrilling and terrifying. They are drawn to emotional depth, psychological truth, and transformations that strip away pretense.',
    challenge:
      'Control, jealousy, and a habit of keeping score in relationships undermines the intimacy they crave so desperately. Surrendering to trust is their lifelong practice.',
    color: '#6A4C93',
    emoji: '♏',
  },
  {
    sign: 'Sagittarius ♐',
    element: 'Fire',
    rulling: 'Jupiter',
    traits: ['Optimistic', 'Adventurous', 'Honest', 'Tactless', 'Commitment-averse'],
    compatibleWith: ['Aries', 'Leo', 'Libra', 'Aquarius'],
    incompatibleWith: ['Virgo', 'Pisces', 'Taurus'],
    loveStyle:
      'Sagittarius loves with freedom, laughter, and an infectious optimism. They are the adventurers of the zodiac, drawn to partners who share their curiosity and do not try to cage their restless spirit.',
    challenge:
      'Fear of commitment and a tendency to run when things get real or uncomfortable keeps them from deep intimacy. Staying present through difficulty is their growth.',
    color: '#FF6B6B',
    emoji: '♐',
  },
  {
    sign: 'Capricorn ♑',
    element: 'Earth',
    rulling: 'Saturn',
    traits: ['Ambitious', 'Disciplined', 'Responsible', 'Cold', 'Pessimistic'],
    compatibleWith: ['Taurus', 'Virgo', 'Scorpio', 'Pisces'],
    incompatibleWith: ['Aries', 'Cancer', 'Libra'],
    loveStyle:
      'Capricorn loves through long-term planning and steady presence. They may not wear their heart on their sleeve, but they show up, build, and protect what matters to them with quiet determination.',
    challenge:
      'Confusing security with emotional safety and prioritizing achievement over connection leads to loneliness despite success. Vulnerability is not weakness — it is the door.',
    color: '#8B5CF6',
    emoji: '♑',
  },
  {
    sign: 'Aquarius ♒',
    element: 'Air',
    rulling: 'Uranus',
    traits: ['Independent', 'Original', 'Humanitarian', 'Detached', 'Rebellious'],
    compatibleWith: ['Gemini', 'Libra', 'Aries', 'Sagittarius'],
    incompatibleWith: ['Taurus', 'Scorpio', 'Cancer'],
    loveStyle:
      'Aquarius loves with intellectual stimulation and a respect for individuality that few other signs offer. They support their partner\'s autonomy fiercely while maintaining a deep, unconventional bond.',
    challenge:
      'Emotional detachment disguised as progressiveness and a tendency to prefer ideas over feelings creates distance. Presence — not just participation — is what they need to learn.',
    color: '#00B4D8',
    emoji: '♒',
  },
  {
    sign: 'Pisces ♓',
    element: 'Water',
    rulling: 'Neptune',
    traits: ['Compassionate', 'Artistic', 'Intuitive', 'Escapist', 'Overly sensitive'],
    compatibleWith: ['Cancer', 'Scorpio', 'Taurus', 'Capricorn'],
    incompatibleWith: ['Sagittarius', 'Gemini', 'Virgo'],
    loveStyle:
      'Pisces loves with dreamy empathy, artistic expression, and a spiritual openness that dissolves boundaries. They feel everything — including what their partner feels — and respond with profound compassion.',
    challenge:
      'A tendency to lose themselves in their partner, escape into fantasy when reality is hard, and confuse martyrdom with love leads to suffering. Establishing healthy boundaries is their evolution.',
    color: '#48CAE4',
    emoji: '♓',
  },
];

export default function CompatibilityZodiacSignsPage() {
  return (
    <TianjiLoveShell>
      <TianjiLoveHeader />
      <main className="min-h-screen bg-[#0a0a14]">
        {/* Hero */}
        <section className="relative overflow-hidden px-6 py-24 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1038]/60 to-[#0a0a14]" />
          <div className="relative z-10 mx-auto max-w-2xl">
            <p className="mb-3 text-xs tracking-widest text-[#d8b77b] uppercase font-serif">
              Zodiac Compatibility Guide
            </p>
            <h1 className="font-serif text-4xl font-bold leading-tight text-[#f4d7a3] md:text-5xl">
              Complete Zodiac Compatibility Guide:{' '}
              <span className="text-[#d8b77b]">All 12 Signs in Love</span>
            </h1>
            <p className="mt-5 text-base leading-relaxed text-[#f4d7a3]/72">
              Fire, Earth, Air, Water — the four elements create the fundamental grammar of
              astrological compatibility. This guide breaks down how each sign relates in love,
              who they click with naturally, where friction arises, and what growth looks like
              for every zodiac archetype.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <a
                href="/love-test"
                className="rounded-full bg-[#d8b77b] px-6 py-2.5 text-sm font-semibold text-[#0a0a14] transition hover:bg-[#e8c98a]"
              >
                Take the Free Love Test →
              </a>
              <a
                href="/ask"
                className="rounded-full border border-[#d8b77b]/32 px-6 py-2.5 text-sm font-medium text-[#f4d7a3] transition hover:border-[#d8b77b]/64"
              >
                Ask the AI About Your Match
              </a>
            </div>
          </div>
        </section>

        {/* In-article Ad */}
        <div className="mx-auto max-w-2xl px-6 py-6">
          <AdSenseSlot
            slot="ZODIAC_COMPAT_TOP_SLOT"
            format="in-article"
            page="compatibility-zodiac-signs"
            minHeight={280}
          />
        </div>

        {/* Element Quick Reference */}
        <section className="mx-auto max-w-2xl px-6 py-8">
          <h2 className="font-serif text-2xl font-bold text-[#f4d7a3]">
            The Element Grid: Your First Compatibility Shortcut
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#f4d7a3]/72">
            The fastest way to estimate zodiac compatibility is through the four elements. Signs
            within the same element share values, communication styles, and emotional needs — making
            them naturally comfortable with each other.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { element: '🔥 Fire', signs: 'Aries, Leo, Sagittarius', energy: 'Passionate, impulsive, direct', color: '#E63946' },
              { element: '🌍 Earth', signs: 'Taurus, Virgo, Capricorn', energy: 'Practical, steady, grounded', color: '#2A9D8F' },
              { element: '💨 Air', signs: 'Gemini, Libra, Aquarius', energy: 'Intellectual, social,的自由', color: '#00B4D8' },
              { element: '💧 Water', signs: 'Cancer, Scorpio, Pisces', energy: 'Emotional, intuitive, deep', color: '#6A4C93' },
            ].map(({ element, signs, energy, color }) => (
              <div
                key={element}
                className="rounded-xl border border-[#d8b77b]/12 bg-[#0f0f1e] p-4"
              >
                <p className="text-base font-semibold" style={{ color }}>{element}</p>
                <p className="mt-2 text-xs text-[#f4d7a3]">{signs}</p>
                <p className="mt-2 text-[10px] italic text-[#f4d7a3]/52">{energy}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sign Cards */}
        <section className="mx-auto max-w-2xl px-6 py-8">
          <h2 className="mb-6 font-serif text-2xl font-bold text-[#f4d7a3]">
            All 12 Signs: Love Style, Compatibility & Growth Edge
          </h2>
          <div className="space-y-4">
            {SIGNS.map((sign, index) => (
              <div
                key={sign.sign}
                className="rounded-2xl border border-[#d8b77b]/12 bg-[#0f0f1e] p-5"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{sign.emoji}</span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-serif text-lg font-bold text-[#f4d7a3]">{sign.sign}</h3>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                        style={{ backgroundColor: `${sign.color}22`, color: sign.color }}
                      >
                        {sign.element}
                      </span>
                      <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] text-white/52">
                        {sign.rulling}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {sign.traits.map((t) => (
                        <span
                          key={t}
                          className={`rounded-full px-2 py-0.5 text-[10px] ${
                            sign.traits.indexOf(t) < 3
                              ? 'bg-[#d8b77b]/12 text-[#d8b77b]'
                              : 'bg-white/6 text-white/40'
                          }`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-[#f4d7a3]/72">
                      <span className="font-semibold text-[#d8b77b]/80">Love style: </span>
                      {sign.loveStyle}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-[#f4d7a3]/56">
                      <span className="font-semibold text-[#f4a3a3]/80">Challenge: </span>
                      {sign.challenge}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="rounded-md bg-emerald-900/20 p-2">
                        <p className="text-[10px] font-semibold text-emerald-300">✓ Best With</p>
                        <p className="mt-1 text-[10px] text-[#f4d7a3]/72">{sign.compatibleWith.join(', ')}</p>
                      </div>
                      <div className="rounded-md bg-rose-900/20 p-2">
                        <p className="text-[10px] font-semibold text-rose-300">✗ Least With</p>
                        <p className="mt-1 text-[10px] text-[#f4d7a3]/72">{sign.incompatibleWith.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Middle Ad */}
        <div className="mx-auto max-w-2xl px-6 py-6">
          <AdSenseSlot
            slot="ZODIAC_COMPAT_MIDDLE_SLOT"
            format="in-article"
            page="compatibility-zodiac-signs"
            minHeight={280}
          />
        </div>

        {/* Cross-Element Compatibility Matrix */}
        <section className="mx-auto max-w-2xl px-6 py-8">
          <h2 className="font-serif text-2xl font-bold text-[#f4d7a3]">
            Cross-Element Compatibility Matrix
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#f4d7a3]/72">
            The most powerful zodiac insights come from understanding how different elements
            interact. Every element pairing has a characteristic rhythm — whether it clicks
            immediately, requires effort, or creates predictable friction.
          </p>
          <div className="mt-5 space-y-3">
            {[
              {
                pair: 'Fire + Fire',
                verdict: 'High passion, high conflict',
                desc: 'Two Fires together create incredible chemistry and excitement. But without an outside perspective to ground them, they can burn out fast — or burn each other. Works best when channeled into shared goals rather than just each other.',
                emoji: '🔥🔥',
                color: '#E63946',
              },
              {
                pair: 'Fire + Air',
                verdict: 'Natural excitement',
                desc: 'Fire and Air fuel each other beautifully. Air brings intellectual depth and social grace; Fire brings drive and enthusiasm. One of the most naturally harmonious cross-element pairings.',
                emoji: '🔥💨',
                color: '#F4A261',
              },
              {
                pair: 'Fire + Earth',
                verdict: 'Complementary but challenging',
                desc: 'Fire wants to move; Earth wants to stay. Fire inspires Earth to take risks; Earth teaches Fire to be patient. Works when Fire learns to respect Earth\'s pace and Earth allows itself to be led into new territory.',
                emoji: '🔥🌍',
                color: '#90BE6D',
              },
              {
                pair: 'Fire + Water',
                verdict: 'Opposites that can attract or repel',
                desc: 'Fire evaporates Water; Water extinguishes Fire. When these two meet, the emotional intensity can be overwhelming — or transformative. The key is whether both can adapt without losing themselves.',
                emoji: '🔥💧',
                color: '#6A4C93',
              },
              {
                pair: 'Earth + Earth',
                verdict: 'Stable and deeply comfortable',
                desc: 'Two Earths together create a steady, reliable bond built on shared values. The risk: stagnation and boredom if neither pushes the other to grow. Growth requires at least one partner willing to venture outside comfort.',
                emoji: '🌍🌍',
                color: '#2A9D8F',
              },
              {
                pair: 'Air + Water',
                verdict: 'Challenging — head vs heart',
                desc: 'Air lives in the realm of ideas; Water lives in feelings. Communication is easy; emotional depth is harder. For these two to work, Air must learn to value feelings as much as logic, and Water must give Air permission to not have all the answers.',
                emoji: '💨💧',
                color: '#00B4D8',
              },
            ].map(({ pair, verdict, desc, emoji, color }) => (
              <div
                key={pair}
                className="rounded-xl border border-[#d8b77b]/12 bg-[#0f0f1e] p-4"
              >
                <div className="flex items-center gap-2">
                  <span>{emoji}</span>
                  <p className="font-semibold text-[#f4d7a3]">{pair}</p>
                  <span
                    className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{ backgroundColor: `${color}22`, color }}
                  >
                    {verdict}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#f4d7a3]/72">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Ad */}
        <div className="mx-auto max-w-2xl px-6 py-6">
          <AdSenseSlot
            slot="ZODIAC_COMPAT_BOTTOM_SLOT"
            format="display"
            page="compatibility-zodiac-signs"
            minHeight={280}
          />
        </div>

        {/* CTA + Affiliate */}
        <section className="mx-auto max-w-2xl px-6 py-8">
          <div className="rounded-2xl border border-[#d8b77b]/16 bg-[#0f0f1e] p-6 text-center">
            <h3 className="font-serif text-xl font-bold text-[#f4d7a3]">
              Want a Deeper Compatibility Analysis?
            </h3>
            <p className="mt-3 text-sm text-[#f4d7a3]/72">
              Our AI love test analyzes your full birth chart — not just your sun sign — for
              personalized compatibility insights.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <a
                href="/love-test"
                className="rounded-full bg-[#d8b77b] px-6 py-2.5 text-sm font-semibold text-[#0a0a14] transition hover:bg-[#e8c98a]"
              >
                Take the Free Love Test →
              </a>
              <a
                href="/pricing"
                className="rounded-full border border-[#d8b77b]/32 px-6 py-2.5 text-sm font-medium text-[#f4d7a3] transition hover:border-[#d8b77b]/64"
              >
                Unlock Full Compatibility Report
              </a>
            </div>
          </div>

          <div className="mt-8">
            <AffiliateProductGrid
              page="compatibility-zodiac-signs"
              products={AFFILIATE_PRODUCTS}
            />
          </div>
        </section>

        {/* Related Links */}
        <section className="mx-auto max-w-2xl px-6 py-8">
          <h3 className="mb-4 font-serif text-lg font-semibold text-[#f4d7a3]">Continue Reading</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { href: '/love-compatibility-zodiac-2024', label: '2024 Zodiac Love Forecast' },
              { href: '/how-to-read-tarot-cards-for-beginners', label: 'Tarot for Beginners' },
              { href: '/tarot-spread-meanings', label: 'Tarot Spreads Explained' },
              { href: '/ask', label: 'Ask the AI Love Expert' },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="rounded-xl border border-[#d8b77b]/12 bg-[#0f0f1e] p-4 text-sm text-[#f4d7a3]/72 transition hover:border-[#d8b77b]/32 hover:bg-[#14142a]"
              >
                → {label}
              </a>
            ))}
          </div>
        </section>

        {DISCLAIMER_EN}
      </main>
      <TianjiLoveFooter />
    </TianjiLoveShell>
  );
}
