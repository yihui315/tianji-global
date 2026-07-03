'use client';

import { TianjiLoveShell } from '@/components/layout/TianjiLoveShell';
import { TianjiLoveHeader } from '@/components/layout/TianjiLoveHeader';
import { TianjiLoveFooter } from '@/components/layout/TianjiLoveFooter';
import { AdSenseSlot } from '@/components/ads/AdSenseSlot';
import { AffiliateProductGrid } from '@/components/affiliate/AffiliateProductGrid';

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
    nameEn: 'Chinese Astrology: The Maison de l\'Astrologie Guide',
    nameZh: '中国星座：八字命理入门指南',
    link: 'https://www.amazon.com/s?k=chinese+astrology+bazi+book&tag=tianjilove-20',
    imageUrl: 'https://m.media-amazon.com/images/I/51Qgz9bS5QL._AC_SY200_.jpg',
    tag: 'book' as const,
    price: '$18.95',
    rating: 4.5,
    reviews: 1240,
  },
];

const DISCLAIMER_EN = (
  <p className="mt-8 text-xs italic text-[#f4d7a3]/36">
    Love calculators are for entertainment and self-reflection. Relationship success depends on
    communication, mutual respect, and effort — not on any score. Use these tools as conversation
    starters, not verdicts.
  </p>
);

// Love calculator types with explanations
const CALCULATOR_TYPES = [
  {
    name: 'Name Compatibility Test',
    tagline: 'Numerological love math',
    emoji: '✨',
    description:
      'Based on the idea that the letters in two names carry specific numerical vibrations, name compatibility tests assign values to each letter and reduce them to a single "love number." The theory: names are not random — they reflect the energy we carry into relationships.',
    howItWorks: [
      'Assign each letter a value (A=1, B=2, C=3 ... Z=26)',
      'Add the values for both names and reduce to single digits',
      'Calculate the difference between the two numbers',
      'Interpret the difference: 0-2 = strong resonance, 3-5 = developing, 6+ = growth opportunity',
    ],
    accuracyNote:
      'Pure numerology — not scientifically validated. But many users find the self-reflection prompts surprisingly relevant.',
    cta: 'Try the AI Love Test →',
    ctaHref: '/love-test',
  },
  {
    name: 'Zodiac Compatibility Score',
    tagline: 'Element + sign matching',
    emoji: '🌙',
    description:
      'Combines two layers of Western astrology: (1) the elemental compatibility of the two Sun signs, and (2) the specific sign-to-sign dynamic between those two particular signs. A Cancer-Capricorn pairing scores differently from Cancer-Aquarius, even though both involve Cancer.',
    howItWorks: [
      'Identify both partners Sun signs (birth month determines this)',
      'Map each sign to its element (Fire, Earth, Air, Water)',
      'Score element affinity (Fire+Air = high, Fire+Earth = tension)',
      'Apply sign-specific modifiers (some signs have natural harmony regardless of element)',
    ],
    accuracyNote:
      'Astrology is a symbolic language, not a science. It works best as a mirror for self-reflection, not a prediction.',
    cta: 'Get Free Zodiac Compatibility →',
    ctaHref: '/love-test',
  },
  {
    name: 'BaZi Love Compatibility',
    tagline: 'Four-pillar Chinese astrology',
    emoji: '🎴',
    description:
      'The most comprehensive love calculator we offer. BaZi (Chinese八字) reads your full four-pillar chart — Year pillar, Month pillar, Day pillar, and Hour pillar — each with its own heavenly stem and earthly branch. Each pillar represents a dimension of your personality and destiny. Compatibility is measured across all eight characters.',
    howItWorks: [
      'Day Master: your core self — the most important pillar for relationships',
      'Year pillar: your family background and how you show up in long-term partnerships',
      'Month pillar: your work self and how you communicate',
      'Hour pillar: your children, legacy, and private self',
      'Score each pillar pair, then aggregate for an overall compatibility rating',
    ],
    accuracyNote:
      'BaZi is deterministic — it requires exact birth date AND time to calculate. Without accurate birth time, results are approximations.',
    cta: 'Try BaZi Love Compatibility →',
    ctaHref: '/love-test',
  },
  {
    name: 'Tarot Love Spread',
    tagline: 'Symbolic card reading',
    emoji: '🃏',
    description:
      'A tarot love reading draws from 78 cards — 56 Minor Arcana (daily life situations) and 22 Major Arcana (life-altering themes). Each card has dozens of possible interpretations depending on its position in the spread and the question asked. A tarot love calculator typically uses a simplified three-card spread: past, present, future.',
    howItWorks: [
      'Focus on your question — the more specific, the more useful the reading',
      'Three cards are drawn: positions vary by calculator type',
      'Each card\'s meaning is read in context of its position and the surrounding cards',
      'The overall narrative — not any single card — is the actual reading',
    ],
    accuracyNote:
      'Tarot readings are的心理投射测试 — the symbols are universal, but interpretation is deeply personal. A skilled reader (human or AI) spots patterns the querent recognizes immediately.',
    cta: 'Get Free Tarot Love Reading →',
    ctaHref: '/love-test',
  },
];

export default function LoveCalculatorResourcesPage() {
  return (
    <TianjiLoveShell>
      <TianjiLoveHeader />
      <main className="min-h-screen bg-[#0a0a14]">
        {/* Hero */}
        <section className="relative overflow-hidden px-6 py-24 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1038]/60 to-[#0a0a14]" />
          <div className="relative z-10 mx-auto max-w-2xl">
            <p className="mb-3 font-serif text-xs tracking-widest text-[#d8b77b] uppercase">
              Free Tools
            </p>
            <h1 className="font-serif text-4xl font-bold leading-tight text-[#f4d7a3] md:text-5xl">
              Love Calculators Explained:{' '}
              <span className="text-[#d8b77b]">Which One Actually Works?</span>
            </h1>
            <p className="mt-5 text-base leading-relaxed text-[#f4d7a3]/72">
              There are dozens of love calculators online — name matching, zodiac scores, numerology,
              tarot spreads, BaZi charts. Most are superficial. This guide explains how each one works,
              what it actually measures, and when to use which.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <a
                href="/love-test"
                className="rounded-full bg-[#d8b77b] px-6 py-2.5 text-sm font-semibold text-[#0a0a14] transition hover:bg-[#e8c98a]"
              >
                Try the AI Love Test →
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
            slot="LOVE_CALC_RESOURCES_SLOT"
            format="in-article"
            page="love-calculator"
            minHeight={280}
          />
        </div>

        {/* Introduction */}
        <section className="mx-auto max-w-2xl px-6 py-8">
          <h2 className="font-serif text-2xl font-bold text-[#f4d7a3]">
            Why Love Calculators Feel Surprisingly Accurate (Even When They Shouldn't Be)
          </h2>
          <p className="mt-4 leading-relaxed text-[#f4d7a3]/72">
            The Barnum effect — also called the Forer effect — describes the human tendency to accept
            vague, general personality descriptions as highly accurate for ourselves. &quot;You
            sometimes feel insecure about your relationships, but you hide it well.&quot; Most people
            read that and think: <em>yes, that is exactly me.</em>
          </p>
          <p className="mt-4 leading-relaxed text-[#f4d7a3]/72">
            The best love calculators go beyond Barnum statements by anchoring to specific inputs —
            birth dates, names, exact birth times — and generating interpretations tied to those
            inputs. The more precise the input, the more specific and actionable the output.
          </p>
        </section>

        {/* Calculator Types */}
        {CALCULATOR_TYPES.map((calc, i) => (
          <section key={calc.name} className="mx-auto max-w-2xl px-6 py-8">
            <div className="rounded-2xl border border-[#d8b77b]/12 bg-[#0f0f1e] p-6">
              <div className="mb-4 flex items-start gap-3">
                <span className="text-3xl">{calc.emoji}</span>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#f4d7a3]">{calc.name}</h3>
                  <p className="mt-0.5 text-sm italic text-[#d8b77b]/72">{calc.tagline}</p>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-[#f4d7a3]/72">{calc.description}</p>

              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#d8b77b]/56">
                  How it works
                </p>
                <ol className="space-y-2">
                  {calc.howItWorks.map((step, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#d8b77b]/10 text-[10px] font-bold text-[#d8b77b]">
                        {j + 1}
                      </span>
                      <span className="text-xs text-[#f4d7a3]/72">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-4 rounded-xl border border-[#d8b77b]/10 bg-[#d8b77b]/5 p-3">
                <p className="text-xs font-medium text-[#d8b77b]">⚠ Accuracy note</p>
                <p className="mt-1 text-xs text-[#f4d7a3]/56">{calc.accuracyNote}</p>
              </div>

              <a
                href={calc.ctaHref}
                className="mt-5 inline-block rounded-full bg-[#d8b77b] px-5 py-2 text-xs font-semibold text-[#0a0a14] transition hover:bg-[#e8c98a]"
              >
                {calc.cta}
              </a>
            </div>

            {i === 1 && (
              <div className="mt-6">
                <AdSenseSlot
                  slot="LOVE_CALC_RESOURCES_BOTTOM_SLOT"
                  format="in-article"
                  page="love-calculator"
                  minHeight={280}
                />
              </div>
            )}
          </section>
        ))}

        {/* Which Calculator to Use */}
        <section className="mx-auto max-w-2xl px-6 py-8">
          <h2 className="font-serif text-2xl font-bold text-[#f4d7a3]">
            Which Love Calculator Should You Use?
          </h2>
          <div className="mt-5 space-y-3">
            {[
              { q: 'You only know your partner\'s first name', a: 'Name compatibility test — lowest friction, good conversation starter.' },
              { q: 'You know both birth months', a: 'Zodiac compatibility — more specific than name matching, captures element dynamics.' },
              { q: 'You have full birth date + approximate time', a: 'BaZi compatibility — the most comprehensive, reads four pillars not just one.' },
              { q: 'You have a specific immediate question', a: 'Tarot love spread — excels at present-moment clarity, not long-term prediction.' },
              { q: 'You want the most complete picture', a: 'Use all of them and look for convergence — patterns that appear across multiple systems are worth paying attention to.' },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-[#d8b77b]/12 bg-[#0f0f1e] p-4">
                <p className="font-medium text-[#d8b77b]">→ {q}</p>
                <p className="mt-2 text-sm text-[#f4d7a3]/72">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Ad */}
        <div className="mx-auto max-w-2xl px-6 py-6">
          <AdSenseSlot
            slot="LOVE_CALC_RESOURCES_DISPLAY_SLOT"
            format="display"
            page="love-calculator"
            minHeight={280}
          />
        </div>

        {/* Affiliate Grid */}
        <section className="mx-auto max-w-2xl px-6 py-8">
          <AffiliateProductGrid
            page="love-calculator"
            products={AFFILIATE_PRODUCTS}
          />
        </section>

        {/* Related Links */}
        <section className="mx-auto max-w-2xl px-6 py-8">
          <h3 className="mb-4 font-serif text-lg font-semibold text-[#f4d7a3]">Continue Reading</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { href: '/love-compatibility-zodiac-2024', label: 'Zodiac Compatibility Guide' },
              { href: '/tarot-spread-meanings', label: 'Tarot Card Spreads Explained' },
              { href: '/bazi-relationship-analysis-free', label: 'Free BaZi Analysis' },
              { href: '/love-test', label: 'AI Love Compatibility Test' },
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
