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
];

const DISCLAIMER_EN = (
  <p className="mt-8 text-xs italic text-[#f4d7a3]/36">
    Tarot is a tool for self-reflection and entertainment. It does not predict the future with
    certainty. For a personalized reading, try our free AI tarot love reading.
  </p>
);

const CARD_SECTIONS = [
  {
    title: 'Major Arcana — The 22 Life Themes',
    description:
      'The Major Arcana are the big moments — the archetypal experiences every human navigates. They read like a hero\'s journey: from The Fool\'s first step, through crises and transformations (Death, The Tower), to The World\'s completion. In love readings, Major Arcana cards usually signal significant turning points rather than everyday dynamics.',
    cards: [
      { name: 'The Fool', meaning: 'New beginnings, innocence, spontaneity, free spirit. In love: a new chapter or leap of faith.' },
      { name: 'The Magician', meaning: 'Manifestation, resourcefulness, power, inspired action. In love: taking intentional action toward what you want.' },
      { name: 'The High Priestess', meaning: 'Intuition, sacred knowledge, divine feminine, the subconscious mind. In love: trust your gut feeling.' },
      { name: 'The Empress', meaning: 'Femininity, beauty, nature, nurturing, abundance. In love: a stable, nurturing period or need for self-care.' },
      { name: 'The Emperor', meaning: 'Authority, structure, a solid foundation, dominance, leadership. In love: need for boundaries or clearer structure.' },
      { name: 'Death', meaning: 'Endings, transformation, transition, change. In love: almost always points to an ending that creates space for something new — rarely literal death.' },
      { name: 'The Tower', meaning: 'Sudden change, upheaval, revelation, awakening. In love: a dramatic but ultimately clarifying rupture.' },
      { name: 'The Star', meaning: 'Hope, renewal, serenity, healing, inspiration. In love: a calm period of renewal after turbulence.' },
      { name: 'The Lovers', meaning: 'Union, choices between two paths, alignment, values. In love: a significant relationship decision or deep connection.' },
      { name: 'The Moon', meaning: 'Illusion, fear, anxiety, subconscious, uncertainty. In love: things are not what they seem — proceed with caution and intuition.' },
    ],
  },
  {
    title: 'Wands — Fire Energy: Passion, Ambition, Creativity',
    description:
      'Wands correspond to the element Fire — the element of will, passion, inspiration, and forward motion. Wands questions are about what drives you, what you want to create, and where your energy is pointed. In love readings, Wands often describe the energetic quality of a relationship: is there spark? Direction? Ambition together?',
    cards: [
      { name: 'Ace of Wands', meaning: 'New inspiration, awakening, unlimited potential. In love: a new romantic possibility or renewed passion.' },
      { name: 'Page of Wands', meaning: 'Exploration, discovery, free spirit, a messenger. In love: exciting news about a connection, someone who sparks curiosity.' },
      { name: 'Knight of Wands', meaning: 'Energy, passion, adventure, fearless, action. In love: a bold romantic move or a period of decisive action.' },
      { name: 'Queen of Wands', meaning: 'Courage, confidence, warmth, vibrancy, social butterfly. In love: a confident, warm presence or need to embody these qualities.' },
      { name: 'King of Wands', meaning: 'Natural leader, vision, entrepreneur, honor. In love: a commanding presence or need to lead with vision rather than control.' },
    ],
  },
  {
    title: 'Cups — Water Energy: Emotion, Intuition, Relationships',
    description:
      'Cups correspond to Water — the element of feeling, intuition, relationship, and the inner world. Cups cards are almost always about emotional states, relationships (platonic and romantic), attachments, and what the heart wants versus what the mind thinks. In love readings, Cups are the primary suit.',
    cards: [
      { name: 'Ace of Cups', meaning: 'New feelings, spirituality, intuition, love. In love: the beginning of deep feeling or an overflow of emotional connection.' },
      { name: 'Three of Cups', meaning: 'Celebration, friendship, creativity, collaborations. In love: joy within a relationship or a social connection that may deepen.' },
      { name: 'Five of Cups', meaning: 'Regret, failure, disappointment, pessimism. In love: dwelling on what went wrong while missing what remains.' },
      { name: 'Ten of Cups', meaning: 'Contentment, satisfaction, alignment, family. In love: emotional fulfillment and lasting happiness in partnership.' },
      { name: 'The Lovers (Cups)', meaning: 'Deep connection, alignment, choices in love. In love: the classic relationship card — a meaningful choice between two paths.' },
    ],
  },
  {
    title: 'Swords — Air Energy: Intellect, Conflict, Truth',
    description:
      'Swords correspond to Air — the element of thought, communication, truth, and conflict. Swords cards often appear when there is mental tension, difficult truths, sharp decisions, or communication breakdowns. In love readings, Swords usually indicate friction — sometimes necessary friction that clears the air.',
    cards: [
      { name: 'Ace of Swords', meaning: 'Breakthroughs, clarity, sharp mind, truth. In love: a moment of clear seeing or a breakthrough in understanding.' },
      { name: 'Two of Swords', meaning: 'Difficult choices, stalemate, blocked emotions, inaction. In love: avoidance of a decision that needs to be made.' },
      { name: 'Three of Swords', meaning: 'Heartbreak, sorrow, grief, rejection. In love: the pain of a separation or difficult truth — but pain that passes.' },
      { name: 'Eight of Swords', meaning: 'Imprisonment, self-victimization, restricted freedom. In love: feeling trapped, but often more in the mind than in reality.' },
      { name: 'Ten of Swords', meaning: 'Painful endings, deep wounds, betrayal, loss. In love: the absolute worst moment, which paradoxically means recovery can begin.' },
    ],
  },
  {
    title: 'Pentacles — Earth Energy: Material World, Work, Security',
    description:
      'Pentacles correspond to Earth — the element of material reality, physical world, work, money, and long-term security. Pentacles questions are about practical matters: Is this sustainable? Is there stability? Is there a solid foundation? In love readings, Pentacles usually describe the material or practical dimensions of a relationship.',
    cards: [
      { name: 'Ace of Pentacles', meaning: 'New financial or career opportunity, manifestation, abundance. In love: a stable foundation being built or a practical romantic gesture.' },
      { name: 'Six of Pentacles', meaning: 'Generosity, charity, sharing, giving and receiving. In love: balance in give-and-take within the relationship.' },
      { name: 'Ten of Pentacles', meaning: 'Legacy, inheritance, family, long-term success,终身大事. In love: a marriage-level commitment or a relationship with deep roots.' },
      { name: 'Five of Pentacles', meaning: 'Financial loss, isolation, worry, loneliness. In love: a rough patch that tests the relationship — and whether you reach for help.' },
      { name: 'Seven of Pentacles', meaning: 'Long-term view, sustainable results, perseverance, investment. In love: whether the effort you are putting in is worth it — the patience card.' },
    ],
  },
];

export default function HowToReadTarotCardsPage() {
  return (
    <TianjiLoveShell>
      <TianjiLoveHeader />
      <main className="min-h-screen bg-[#0a0a14]">
        {/* Hero */}
        <section className="relative overflow-hidden px-6 py-24 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1038]/60 to-[#0a0a14]" />
          <div className="relative z-10 mx-auto max-w-2xl">
            <p className="mb-3 font-serif text-xs tracking-widest text-[#d8b77b] uppercase">
              Tarot Basics
            </p>
            <h1 className="font-serif text-4xl font-bold leading-tight text-[#f4d7a3] md:text-5xl">
              How to Read Tarot Cards for Beginners:{' '}
              <span className="text-[#d8b77b]">A Complete Visual Guide</span>
            </h1>
            <p className="mt-5 text-base leading-relaxed text-[#f4d7a3]/72">
              Seventy-eight cards. Five elements. Dozens of interpretations. Tarot can feel
              overwhelming at first — but it does not have to be. This guide breaks down every card
              you need to know, what it actually means in a love reading, and how the suits interact
              to tell a coherent story.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <a
                href="/love-test"
                className="rounded-full bg-[#d8b77b] px-6 py-2.5 text-sm font-semibold text-[#0a0a14] transition hover:bg-[#e8c98a]"
              >
                Try Free Tarot Love Reading →
              </a>
              <a
                href="/tarot-spread-meanings"
                className="rounded-full border border-[#d8b77b]/32 px-6 py-2.5 text-sm font-medium text-[#f4d7a3] transition hover:border-[#d8b77b]/64"
              >
                Tarot Spreads Guide
              </a>
            </div>
          </div>
        </section>

        {/* In-article Ad */}
        <div className="mx-auto max-w-2xl px-6 py-6">
          <AdSenseSlot
            slot="TAROT_BEGINNERS_SLOT"
            format="in-article"
            page="how-to-read-tarot-cards-for-beginners"
            minHeight={280}
          />
        </div>

        {/* Tarot Decks Overview */}
        <section className="mx-auto max-w-2xl px-6 py-8">
          <h2 className="font-serif text-2xl font-bold text-[#f4d7a3]">
            The Two Parts of Every Tarot Deck
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-4">
            {[
              {
                part: 'Major Arcana',
                count: '22 cards',
                desc: 'The archetypal life moments — big themes like death, love, power, and transformation. When a Major Arcana card appears, pay attention: something significant is in play.',
                emoji: '⚡',
              },
              {
                part: 'Minor Arcana',
                count: '56 cards',
                desc: 'The everyday stuff — feelings, conflicts, decisions, and practical matters. Four suits (Wands, Cups, Swords, Pentacles), numbered Ace through Ten, plus four court cards each.',
                emoji: '🃏',
              },
            ].map(({ part, count, desc, emoji }) => (
              <div
                key={part}
                className="rounded-2xl border border-[#d8b77b]/12 bg-[#0f0f1e] p-5 text-center"
              >
                <span className="text-3xl">{emoji}</span>
                <h3 className="mt-3 font-serif text-lg font-bold text-[#f4d7a3]">{part}</h3>
                <p className="mt-1 text-xs text-[#d8b77b]">{count}</p>
                <p className="mt-3 text-sm leading-relaxed text-[#f4d7a3]/72">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Suit Elements */}
        <section className="mx-auto max-w-2xl px-6 py-8">
          <h2 className="font-serif text-2xl font-bold text-[#f4d7a3]">
            The Four Elements: Your First Shortcut to Card Meanings
          </h2>
          <p className="mt-3 leading-relaxed text-[#f4d7a3]/72">
            Once you know what each element represents, you can intuit a card&apos;s meaning before
            you ever look it up. Every card in a Wands spread carries Fire energy — passion,
            direction, will. Every Cup card carries Water — feeling, relationship, intuition.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { element: '🔥 Fire', suit: 'Wands', keywords: 'Passion, will, action, ambition', context: 'What drives you forward' },
              { element: '💧 Water', suit: 'Cups', keywords: 'Feeling, love, intuition, inner life', context: 'What your heart wants' },
              { element: '💨 Air', suit: 'Swords', keywords: 'Thought, truth, conflict, communication', context: 'What your mind is grappling with' },
              { element: '🌍 Earth', suit: 'Pentacles', keywords: 'Stability, work, resources, security', context: 'What is materially real' },
            ].map(({ element, suit, keywords, context }) => (
              <div
                key={suit}
                className="rounded-xl border border-[#d8b77b]/12 bg-[#0f0f1e] p-3"
              >
                <p className="text-lg">{element}</p>
                <p className="mt-1 text-xs font-semibold text-[#d8b77b]">{suit}</p>
                <p className="mt-2 text-xs text-[#f4d7a3]/72">{keywords}</p>
                <p className="mt-1 text-[10px] italic text-[#f4d7a3]/40">{context}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Card Sections */}
        {CARD_SECTIONS.map((section, si) => (
          <section key={section.title} className="mx-auto max-w-2xl px-6 py-8">
            <div className="rounded-2xl border border-[#d8b77b]/12 bg-[#0f0f1e] p-6">
              <h3 className="font-serif text-xl font-bold text-[#f4d7a3]">{section.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#f4d7a3]/72">{section.description}</p>

              <div className="mt-5 space-y-3">
                {section.cards.map((card) => (
                  <div
                    key={card.name}
                    className="rounded-xl border border-[#d8b77b]/8 bg-[#0a0a14]/60 p-4"
                  >
                    <p className="font-medium text-[#d8b77b]">{card.name}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#f4d7a3]/72">
                      {card.meaning}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {si === 2 && (
              <div className="mt-6">
                <AdSenseSlot
                  slot="TAROT_BEGINNERS_BOTTOM_SLOT"
                  format="in-article"
                  page="how-to-read-tarot-cards-for-beginners"
                  minHeight={280}
                />
              </div>
            )}
          </section>
        ))}

        {/* Reading Tips */}
        <section className="mx-auto max-w-2xl px-6 py-8">
          <h2 className="font-serif text-2xl font-bold text-[#f4d7a3]">
            Three Mistakes New Tarot Readers Make
          </h2>
          <div className="mt-5 space-y-3">
            {[
              {
                mistake: 'Reading cards in isolation',
                fix: 'Every card gets its meaning from its neighbors. A Three of Cups next to Five of Cups tells a completely different story than Three of Cups next to Ten of Pentacles. Always read the whole spread.',
              },
              {
                mistake: 'Treating reversals as completely negative',
                fix: 'Reversed cards (upside-down in a spread) usually mean the energy is blocked, internalized, or less conscious — not necessarily bad. A reversed Ace of Cups might mean "new feelings you are not ready to acknowledge yet."',
              },
              {
                mistake: 'Asking vague questions',
                fix: 'Tarot responds to specific questions far better than general ones. "What should I know about my relationship?" is broad. "What is the biggest obstacle to trust in my relationship right now?" gives you something to work with.',
              },
            ].map(({ mistake, fix }) => (
              <div
                key={mistake}
                className="rounded-xl border border-[#d8b77b]/12 bg-[#0f0f1e] p-4"
              >
                <p className="font-medium text-[#f4a3a3]">✗ {mistake}</p>
                <p className="mt-2 text-sm text-[#f4d7a3]/72">✓ {fix}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Ad */}
        <div className="mx-auto max-w-2xl px-6 py-6">
          <AdSenseSlot
            slot="TAROT_BEGINNERS_DISPLAY_SLOT"
            format="display"
            page="how-to-read-tarot-cards-for-beginners"
            minHeight={280}
          />
        </div>

        {/* Affiliate Grid */}
        <section className="mx-auto max-w-2xl px-6 py-8">
          <AffiliateProductGrid
            page="how-to-read-tarot-cards-for-beginners"
            products={AFFILIATE_PRODUCTS}
          />
        </section>

        {/* Related Links */}
        <section className="mx-auto max-w-2xl px-6 py-8">
          <h3 className="mb-4 font-serif text-lg font-semibold text-[#f4d7a3]">Continue Reading</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { href: '/tarot-spread-meanings', label: 'Tarot Card Spreads Explained' },
              { href: '/tarot-love-reading-online', label: 'Free AI Tarot Love Reading' },
              { href: '/love-test', label: 'Try the Love Test' },
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
