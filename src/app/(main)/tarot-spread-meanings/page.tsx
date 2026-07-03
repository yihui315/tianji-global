'use client';

import { TianjiLoveShell } from '@/components/layout/TianjiLoveShell';
import { TianjiLoveHeader } from '@/components/layout/TianjiLoveHeader';
import { TianjiLoveFooter } from '@/components/layout/TianjiLoveFooter';
import { AdSenseSlot } from '@/components/ads/AdSenseSlot';
import { AffiliateProductGrid } from '@/components/affiliate/AffiliateProductGrid';

const AFFILIATE_PRODUCTS = [
  {
    nameEn: 'Classic Tarot Deck — Rider-Waite',
    nameZh: '经典韦特塔罗牌套',
    link: 'https://www.amazon.com/s?k=tarot+deck+rider+waite&tag=tianjilove-20',
    imageUrl: 'https://m.media-amazon.com/images/I/51ZB5pRyS8L._AC_SY200_.jpg',
    tag: 'amazon' as const,
    price: '$14.99',
    rating: 4.8,
    reviews: 8921,
  },
  {
    nameEn: "Chinese Astrology: The Maison de l'Astrologie Guide",
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
    This article is for entertainment purposes only. Tarot readings do not replace professional
    relationship advice. Your free AI love reading is available at any time.
  </p>
);

const TAROT_SPREADS = [
  {
    name: 'The Three-Card Spread',
    tagline: 'Past · Present · Future',
    description:
      'The simplest and most versatile spread. Draw three cards to understand how past events shape your current relationship and what path lies ahead. Perfect for beginners and quick insights alike.',
    bestFor: 'General relationship clarity, quick questions',
    positions: ['Past — What brought you here', 'Present — Current dynamics', 'Future — Potential outcomes'],
  },
  {
    name: 'The Celtic Cross',
    tagline: 'The comprehensive deep-dive',
    description:
      'A ten-card spread that maps the full landscape of a relationship — core issue, challenges, past foundations, possible futures, and your conscious hopes. This is the spread tarot readers reach for when depth is non-negotiable.',
    bestFor: 'Complex situations, major decisions, uncovering hidden dynamics',
    positions: [
      'Present — The current situation',
      'Challenge — What opposes you',
      'Basis — The foundation',
      'Past — Recent past',
      'Possible — Near-future possibilities',
      'Your hopes — What you want',
      'Other person — Their reality',
      'Environment — External factors',
      'Hopes/fears — Your inner truth',
      'Outcome — Final result',
    ],
  },
  {
    name: 'The Relationship Spread',
    tagline: 'For couples and partnerships',
    description:
      'Specifically designed for two people, this spread maps the energetic connection between partners. Each position represents a dimension of the relationship bond — communication, physical intimacy, emotional depth, shared values, and growth potential.',
    bestFor: 'Romantic partnerships, evaluating compatibility',
    positions: [
      'You — Your energy in the relationship',
      'Them — Their energy in the relationship',
      'Bond — The relationship itself',
      'Strengths — What works well',
      'Challenges — What needs attention',
      'Shared values — Common ground',
      'Physical connection',
      'Emotional connection',
      'Communication',
      'Outcome — Where this is heading',
    ],
  },
  {
    name: 'The Yes/No Spread',
    tagline: 'Direct answers to direct questions',
    description:
      'When you need clarity on a single question — Should I stay in this relationship? Is this person right for me? — draw three cards. Major Arcana cards leaning toward yes, Cups and Hearts toward yes, Swords and Wands requiring caution.',
    bestFor: 'Binary questions, single decisions',
    positions: ['Question — Reframe the inquiry', 'Obstacles — What stands in the way', 'Guidance — The path forward'],
  },
];

export default function TarotSpreadMeaningsPage() {
  return (
    <TianjiLoveShell>
      <TianjiLoveHeader />
      <main className="min-h-screen bg-[#0a0a14]">
        {/* Hero */}
        <section className="relative overflow-hidden px-6 py-24 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1038]/60 to-[#0a0a14]" />
          <div className="relative z-10 mx-auto max-w-2xl">
            <p className="mb-3 font-serif text-xs tracking-widest text-[#d8b77b] uppercase">Tarot Meanings</p>
            <h1 className="font-serif text-4xl font-bold leading-tight text-[#f4d7a3] md:text-5xl">
              Tarot Card Spreads Explained:{' '}
              <span className="text-[#d8b77b]">Find the Right Layout for Your Question</span>
            </h1>
            <p className="mt-5 text-base leading-relaxed text-[#f4d7a3]/72">
              A tarot spread is the architecture of a reading. The cards don&apos;t change — but where
              they fall does. Learn the four essential spreads and when to use each one for love,
              relationships, and personal clarity.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <a
                href="/love-test"
                className="rounded-full bg-[#d8b77b] px-6 py-2.5 text-sm font-semibold text-[#0a0a14] transition hover:bg-[#e8c98a]"
              >
                Try Free Love Reading →
              </a>
              <a
                href="/ask"
                className="rounded-full border border-[#d8b77b]/32 px-6 py-2.5 text-sm font-medium text-[#f4d7a3] transition hover:border-[#d8b77b]/64"
              >
                Ask the AI a Question
              </a>
            </div>
          </div>
        </section>

        {/* In-article Ad */}
        <div className="mx-auto max-w-2xl px-6 py-6">
          <AdSenseSlot
            slot="TAROT_SPREAD_MEANINGS_SLOT"
            format="in-article"
            page="tarot-spread-meanings"
            minHeight={280}
          />
        </div>

        {/* Introduction */}
        <section className="mx-auto max-w-2xl px-6 py-8">
          <h2 className="font-serif text-2xl font-bold text-[#f4d7a3]">
            Why the Spread Matters More Than the Cards
          </h2>
          <p className="mt-4 leading-relaxed text-[#f4d7a3]/72">
            Most beginners focus entirely on card meanings — and they should. But experienced tarot
            readers know that the <em>positions</em> within a spread are what transform a collection
            of symbols into a coherent story. A Three of Cups in &quot;Your hopes&quot; means something
            entirely different from a Three of Cups in &quot;Hidden challenges.&quot;
          </p>
          <p className="mt-4 leading-relaxed text-[#f4d7a3]/72">
            Choosing the right spread is the first act of a reading. It focuses your intention, guides
            the energy, and determines which questions get answered versus which remain unasked.
          </p>
        </section>

        {/* Spreads */}
        {TAROT_SPREADS.map((spread, i) => (
          <section key={spread.name} className="mx-auto max-w-2xl px-6 py-8">
            <div className="rounded-2xl border border-[#d8b77b]/12 bg-[#0f0f1e] p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#f4d7a3]">{spread.name}</h3>
                  <p className="mt-0.5 text-sm italic text-[#d8b77b]/72">{spread.tagline}</p>
                </div>
                <span className="rounded-full bg-[#d8b77b]/10 px-3 py-1 text-xs text-[#d8b77b]">
                  {i + 1} of {TAROT_SPREADS.length}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-[#f4d7a3]/72">{spread.description}</p>

              <div className="mt-5 rounded-xl bg-[#0a0a14]/60 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#d8b77b]/56">
                  Best for
                </p>
                <p className="text-sm text-[#f4d7a3]/72">{spread.bestFor}</p>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#d8b77b]/56">
                  Card positions
                </p>
                {spread.positions.map((pos, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d8b77b]/10 text-[10px] font-bold text-[#d8b77b]">
                      {j + 1}
                    </span>
                    <p className="text-sm text-[#f4d7a3]/72">{pos}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <a
                  href="/love-test"
                  className="rounded-full bg-[#d8b77b] px-5 py-2 text-xs font-semibold text-[#0a0a14] transition hover:bg-[#e8c98a]"
                >
                  Try This Spread Free
                </a>
                <a
                  href="/guide"
                  className="rounded-full border border-[#d8b77b]/32 px-5 py-2 text-xs text-[#f4d7a3]/72 transition hover:border-[#d8b77b]/64"
                >
                  Tarot Guide
                </a>
              </div>
            </div>

            {/* In-article ad after every 2 spreads */}
            {i === 1 && (
              <div className="mt-8">
                <AdSenseSlot
                  slot="TAROT_SPREAD_MEANINGS_BOTTOM_SLOT"
                  format="in-article"
                  page="tarot-spread-meanings"
                  minHeight={280}
                />
              </div>
            )}
          </section>
        ))}

        {/* Choosing Guide */}
        <section className="mx-auto max-w-2xl px-6 py-8">
          <h2 className="font-serif text-2xl font-bold text-[#f4d7a3]">
            How to Choose the Right Spread
          </h2>
          <div className="mt-5 space-y-4">
            {[
              { q: 'Is your question simple and single-focused?', a: 'Use the Yes/No Spread. Any more cards and you dilute the answer.' },
              { q: 'Do you need quick context — what happened and where you are now?', a: 'The Three-Card Spread gives you the full arc without overwhelming you.' },
              { q: 'Are you navigating a complex or long-standing relationship situation?', a: 'Go straight to the Celtic Cross. Its ten positions capture nuance that shorter spreads miss.' },
              { q: 'Are you reading for yourself and a partner together?', a: 'The Relationship Spread maps the bond itself — not just one side of it.' },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-[#d8b77b]/12 bg-[#0f0f1e] p-4">
                <p className="font-medium text-[#d8b77b]">→ {q}</p>
                <p className="mt-2 text-sm text-[#f4d7a3]/72">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* AI Reading CTA */}
        <section className="mx-auto max-w-2xl px-6 py-10">
          <div className="rounded-2xl border border-[#d8b77b]/24 bg-gradient-to-br from-[#1a1038]/80 to-[#0f0f1e] p-8 text-center">
            <span className="text-3xl">🔮</span>
            <h2 className="mt-4 font-serif text-2xl font-bold text-[#f4d7a3]">
              Not Sure Which Spread to Use?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#f4d7a3]/72">
              Our free AI love tarot reader asks you three questions, selects the optimal spread,
              and draws cards on your behalf. No card knowledge required — just an open question
              and a willingness to reflect.
            </p>
            <a
              href="/love-test"
              className="mt-6 inline-block rounded-full bg-[#d8b77b] px-8 py-3 font-semibold text-[#0a0a14] transition hover:bg-[#e8c98a]"
            >
              Get Your Free Love Reading →
            </a>
          </div>
        </section>

        {/* Bottom Ad */}
        <div className="mx-auto max-w-2xl px-6 py-6">
          <AdSenseSlot
            slot="TAROT_SPREAD_MEANINGS_DISPLAY_SLOT"
            format="display"
            page="tarot-spread-meanings"
            minHeight={280}
          />
        </div>

        {/* Affiliate Grid */}
        <section className="mx-auto max-w-2xl px-6 py-8">
          <AffiliateProductGrid
            page="tarot-spread-meanings"
            products={[
              AFFILIATE_PRODUCTS[0], // tarot deck
              AFFILIATE_PRODUCTS[1], // astrology book
              AFFILIATE_PRODUCTS[2], // amethyst
            ]}
          />
        </section>

        {/* Related Links */}
        <section className="mx-auto max-w-2xl px-6 py-8">
          <h3 className="mb-4 font-serif text-lg font-semibold text-[#f4d7a3]">Continue Reading</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { href: '/tarot-love-reading-online', label: 'Free AI Tarot Reading Online' },
              { href: '/he-loves-you-signs', label: 'Signs He Loves You Quiz' },
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

        {DISCALIMER_EN}
      </main>
      <TianjiLoveFooter />
    </TianjiLoveShell>
  );
}
