import { TianjiLoveShell } from '@/components/layout/TianjiLoveShell';
import { TianjiLoveHeader } from '@/components/layout/TianjiLoveHeader';
import { TianjiLoveFooter } from '@/components/layout/TianjiLoveFooter';
import { AdSenseSlot } from '@/components/ads/AdSenseSlot';
import { AffiliateProductGrid } from '@/components/affiliate/AffiliateProductGrid';

export async function generateMetadata() {
  return {
    title: 'Love Compatibility by Zodiac Sign 2024 — Element Dynamics & Pairing Guide',
    description: 'Explore zodiac 2024 compatibility for all 12 signs. Fire, Earth, Air, Water element pairings, cross-element tension patterns, and relationship timing insights.',
    alternates: {
      languages: {
        'en': '/love-compatibility-zodiac-2024',
        'zh-CN': '/zh-CN/love-compatibility-zodiac-2024',
        'x-default': '/love-compatibility-zodiac-2024',
      },
    },
  };
}

const AFFILIATE_PRODUCTS = [
  {
    nameEn: 'Crystal Bracelet for Love & Attraction',
    nameZh: '爱情能量水晶手链',
    link: 'https://www.amazon.com/s?k=rose+quartz+bracelet+love&tag=tianjilove-20',
    imageUrl: 'https://m.media-amazon.com/images/I/41r6+JPJGXL._AC_SY200_.jpg',
    tag: 'crystal' as const,
    price: '$12.99',
    rating: 4.6,
    reviews: 3182,
  },
  {
    nameEn: 'Chinese Astrology: The Maison de l\'Astrologie Guide',
    nameZh: '中国星座：八字命理入门指南',
    link: 'https://www.amazon.com/s?k=chinese+astrology+bazi+book&tag=tianjilove-20',
    imageUrl: 'https://m.media-amazon.com/images/I/51Qgz9bS5QL._AC_SY200_.jpg',
    tag: 'book' as const,
    price: '$18.95',
    rating: 4.5,
    reviews: 1240,
  },
  {
    nameEn: 'Amethyst Crystal Points — Set of 3',
    nameZh: '紫水晶原石三件套',
    link: 'https://www.amazon.com/s?k=amethyst+crystal+points&tag=tianjilove-20',
    imageUrl: 'https://m.media-amazon.com/images/I/41vE4rW5QSL._AC_SY200_.jpg',
    tag: 'crystal' as const,
    price: '$19.99',
    rating: 4.7,
    reviews: 2045,
  },
];

const DISCLAIMER_EN = (
  <p className="mt-8 text-xs italic text-[#f4d7a3]/36">
    Zodiac compatibility is for entertainment and self-reflection only. Every relationship is unique.
    For personalized insights, try our free AI love compatibility reading.
  </p>
);

// Zodiac compatibility data — modern Western + Chinese astrology dual track
const COMPATIBILITY_PAIRS = [
  {
    signs: ['Aries', 'Leo', 'Sagittarius'],
    element: 'Fire',
    compatibleWith: ['Fire: Aries, Leo, Sagittarius', 'Air: Gemini, Libra, Aquarius'],
    tensionWith: ['Water: Cancer, Scorpio, Pisces'],
    dynamics:
      'Fire signs burn bright and fast. When two Fire signs connect, there is immediate chemistry, shared enthusiasm, and a natural understanding of each other\'s need for freedom and passion. The shadow side: ego clashes and impulse without reflection.',
    tip: 'Channel the heat into creative projects together rather than competitive arguments.',
  },
  {
    signs: ['Taurus', 'Virgo', 'Capricorn'],
    element: 'Earth',
    compatibleWith: ['Earth: Taurus, Virgo, Capricorn', 'Water: Cancer, Scorpio, Pisces'],
    tensionWith: ['Fire: Aries, Leo, Sagittarius', 'Air: Gemini, Libra, Aquarius'],
    dynamics:
      'Earth builds. Earth persists. Earth is patient. When Earth signs find each other, there is stability, shared values around material security, and an unspoken agreement that slow and steady wins the race. The shadow side: stubbornness and resistance to change.',
    tip: 'Build in regular rituals of novelty — try one new thing per week to counter complacency.',
  },
  {
    signs: ['Gemini', 'Libra', 'Aquarius'],
    element: 'Air',
    compatibleWith: ['Air: Gemini, Libra, Aquarius', 'Fire: Aries, Leo, Sagittarius'],
    tensionWith: ['Earth: Taurus, Virgo, Capricorn', 'Water: Cancer, Scorpio, Pisces'],
    dynamics:
      'Air signs intellectualize. They analyze, communicate, and adapt. Two Air signs together often become a "power couple" intellectually — lots of ideas, shared social networks, and conversation that never runs dry. The shadow side: emotional distance and difficulty being present.',
    tip: 'Ground your connection through shared physical activity — walks, dancing, cooking together.',
  },
  {
    signs: ['Cancer', 'Scorpio', 'Pisces'],
    element: 'Water',
    compatibleWith: ['Water: Cancer, Scorpio, Pisces', 'Earth: Taurus, Virgo, Capricorn'],
    tensionWith: ['Air: Gemini, Libra, Aquarius', 'Fire: Aries, Leo, Sagittarius'],
    dynamics:
      'Water signs feel first, then process. When Water meets Water, there is profound emotional intimacy — a sense of being fully seen and accepted. The bond can feel fated or telepathic. The shadow side: emotional overwhelm, co-dependency, and difficulty setting boundaries.',
    tip: 'Create gentle emotional boundaries — it is possible to be deeply connected without losing yourself.',
  },
];

const CROSS_ELEMENT_PAIRS = [
  {
    pair: 'Fire + Air',
    verdict: 'High compatibility',
    color: '#d8b77b',
    description:
      'Fire inspires Air with vision. Air fuels Fire with oxygen. Both are outward-moving, action-oriented signs that resist stagnation. They energize each other naturally.',
  },
  {
    pair: 'Earth + Water',
    verdict: 'High compatibility',
    color: '#d8b77b',
    description:
      'Earth gives Water a container. Water gives Earth life. Both value depth over speed, security over novelty. They build something that lasts.',
  },
  {
    pair: 'Fire + Earth',
    verdict: 'Natural tension',
    color: '#f4a3a3',
    description:
      'Fire wants to expand and transform. Earth wants to conserve and maintain. Neither is wrong — they simply operate on different rhythms. With conscious effort, they balance each other well.',
  },
  {
    pair: 'Air + Water',
    verdict: 'Natural tension',
    color: '#f4a3a3',
    description:
      'Air wants to analyze feelings. Water wants to be in them. Air creates distance; Water seeks closeness. The friction is real but not insurmountable.',
  },
  {
    pair: 'Fire + Water',
    verdict: 'Deep contrast',
    color: '#f4a3a3',
    description:
      'Fire extinguishes Water. Water dampens Fire. These pairings require enormous mutual respect and conscious communication to thrive. The potential for transformation is high — so is the potential for conflict.',
  },
  {
    pair: 'Earth + Air',
    verdict: 'Deep contrast',
    color: '#f4a3a3',
    description:
      'Earth grounds Air\'s tendency to float away into abstraction. Air helps Earth see the bigger picture. But their pace and values can feel alien to each other.',
  },
];

export default function LoveCompatibilityZodiacPage() {
  return (
    <TianjiLoveShell>
      <TianjiLoveHeader />
      <main className="min-h-screen bg-[#0a0a14]">
        {/* Hero */}
        <section className="relative overflow-hidden px-6 py-24 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1038]/60 to-[#0a0a14]" />
          <div className="relative z-10 mx-auto max-w-2xl">
            <p className="mb-3 font-serif text-xs tracking-widest text-[#d8b77b] uppercase">
              Zodiac Compatibility Guide
            </p>
            <h1 className="font-serif text-4xl font-bold leading-tight text-[#f4d7a3] md:text-5xl">
              Love Compatibility by Zodiac Sign:{' '}
              <span className="text-[#d8b77b]">What the Stars Actually Say in 2024</span>
            </h1>
            <p className="mt-5 text-base leading-relaxed text-[#f4d7a3]/72">
              Forget the simplistic "Fire + Air = great" stereotypes. This guide goes deeper —
              examining element dynamics, cross-element tension patterns, and the specific
              psychological levers that make each zodiac pairing work or struggle.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <a
                href="/love-test"
                className="rounded-full bg-[#d8b77b] px-6 py-2.5 text-sm font-semibold text-[#0a0a14] transition hover:bg-[#e8c98a]"
              >
                Free Compatibility Reading →
              </a>
              <a
                href="/ask"
                className="rounded-full border border-[#d8b77b]/32 px-6 py-2.5 text-sm font-medium text-[#f4d7a3] transition hover:border-[#d8b77b]/64"
              >
                Ask the AI
              </a>
            </div>
          </div>
        </section>

        {/* In-article Ad */}
        <div className="mx-auto max-w-2xl px-6 py-6">
          <AdSenseSlot
            slot="ZODIAC_COMPAT_SLOT"
            format="in-article"
            page="love-compatibility-zodiac-2024"
            minHeight={280}
          />
        </div>

        {/* Element Overview */}
        <section className="mx-auto max-w-2xl px-6 py-8">
          <h2 className="font-serif text-2xl font-bold text-[#f4d7a3]">
            The Four Elements: The Foundation of All Astrological Compatibility
          </h2>
          <p className="mt-4 leading-relaxed text-[#f4d7a3]/72">
            Western astrology divides all twelve signs into four elements — Fire, Earth, Air, and
            Water. Each element has a core temperament that shapes how its signs approach love,
            conflict, communication, and intimacy. Understanding element dynamics is the single
            fastest way to read a relationship&apos;s natural rhythm.
          </p>
        </section>

        {/* Element Cards */}
        {COMPATIBILITY_PAIRS.map((element) => (
          <section key={element.element} className="mx-auto max-w-2xl px-6 py-6">
            <div className="rounded-2xl border border-[#d8b77b]/12 bg-[#0f0f1e] p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="text-2xl">
                  {element.element === 'Fire'
                    ? '🔥'
                    : element.element === 'Earth'
                      ? '🌍'
                      : element.element === 'Air'
                        ? '💨'
                        : '💧'}
                </span>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#f4d7a3]">
                    {element.element} Signs
                  </h3>
                  <p className="text-xs text-[#f4d7a3]/56">
                    {element.signs.join(' · ')}
                  </p>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-[#f4d7a3]/72">{element.dynamics}</p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#0a0a14]/60 p-3">
                  <p className="mb-1 text-xs font-semibold text-[#d8b77b]">✓ Natural affinity</p>
                  {element.compatibleWith.map((c) => (
                    <p key={c} className="text-xs text-[#f4d7a3]/56">
                      {c}
                    </p>
                  ))}
                </div>
                <div className="rounded-xl bg-[#0a0a14]/60 p-3">
                  <p className="mb-1 text-xs font-semibold text-[#f4a3a3]">⚡ Natural tension</p>
                  {element.tensionWith.map((t) => (
                    <p key={t} className="text-xs text-[#f4d7a3]/56">
                      {t}
                    </p>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[#d8b77b]/20 bg-[#d8b77b]/5 p-3">
                <p className="text-xs font-medium text-[#d8b77b]">💡 Relationship tip</p>
                <p className="mt-1 text-xs text-[#f4d7a3]/72">{element.tip}</p>
              </div>
            </div>
          </section>
        ))}

        {/* Cross-Element Pairs Table */}
        <section className="mx-auto max-w-2xl px-6 py-8">
          <h2 className="font-serif text-2xl font-bold text-[#f4d7a3]">
            Cross-Element Compatibility Matrix
          </h2>
          <p className="mt-3 text-sm text-[#f4d7a3]/72">
            Use this matrix to quickly assess the baseline compatibility between any two elements.
            Remember: element compatibility is a starting point, not a verdict.
          </p>
          <div className="mt-5 space-y-3">
            {CROSS_ELEMENT_PAIRS.map(({ pair, verdict, color, description }) => (
              <div
                key={pair}
                className="rounded-xl border border-[#d8b77b]/12 bg-[#0f0f1e] p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-[#f4d7a3]">{pair}</p>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ background: `${color}20`, color }}
                  >
                    {verdict}
                  </span>
                </div>
                <p className="mt-2 text-xs text-[#f4d7a3]/72">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Second Ad */}
        <div className="mx-auto max-w-2xl px-6 py-6">
          <AdSenseSlot
            slot="ZODIAC_COMPAT_BOTTOM_SLOT"
            format="display"
            page="love-compatibility-zodiac-2024"
            minHeight={280}
          />
        </div>

        {/* Chinese Astrology Note */}
        <section className="mx-auto max-w-2xl px-6 py-8">
          <h2 className="font-serif text-2xl font-bold text-[#f4d7a3]">
            Chinese Astrology Compatibility: The BaZi Dimension
          </h2>
          <p className="mt-4 leading-relaxed text-[#f4d7a3]/72">
            Western zodiac and Chinese BaZi astrology operate on entirely different systems. BaZi
            uses the Five Elements (Wood, Fire, Earth, Metal, Water) along with the heavenly stems
            and earthly branches derived from your exact birth date and time. Where Western
            astrology gives you two Sun signs, BaZi gives you a four-pillar chart that captures
            your full energetic profile.
          </p>
          <p className="mt-4 leading-relaxed text-[#f4d7a3]/72">
            For a truly comprehensive compatibility analysis — one that factors in both Western
            element dynamics and BaZi five-element interactions — our free AI love compatibility
            report draws from both systems simultaneously.
          </p>
          <a
            href="/love-test"
            className="mt-5 inline-block rounded-full bg-[#d8b77b] px-6 py-2.5 text-sm font-semibold text-[#0a0a14] transition hover:bg-[#e8c98a]"
          >
            Get Your Free Compatibility Report →
          </a>
        </section>

        {/* Affiliate Grid */}
        <section className="mx-auto max-w-2xl px-6 py-8">
          <AffiliateProductGrid
            page="love-compatibility-zodiac-2024"
            products={AFFILIATE_PRODUCTS}
          />
        </section>

        {/* Related Links */}
        <section className="mx-auto max-w-2xl px-6 py-8">
          <h3 className="mb-4 font-serif text-lg font-semibold text-[#f4d7a3]">Continue Reading</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { href: '/bazi-relationship-analysis-free', label: 'Free BaZi Relationship Analysis' },
              { href: '/tarot-spread-meanings', label: 'Tarot Card Spreads Explained' },
              { href: '/relationship-patterns-guide', label: 'Relationship Patterns Guide' },
              { href: '/ask', label: 'Ask the AI Anything' },
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
