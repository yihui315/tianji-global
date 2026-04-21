'use client';

import { useCallback, useState } from 'react';
import SharePanel from '@/components/SharePanel';
import PDFDownloadButton from '@/components/PDFDownloadButton';
import { saveReading } from '@/lib/save-reading';
import AnimatedShareButton from '@/components/AnimatedShareButton';
import TarotCardAnimation from '@/components/animations/TarotCardAnimation';
import { spreadLayouts, type DrawnCard, type SpreadLayout } from '@/lib/tarot';
import {
  BackgroundVideoHero,
  InsightGrid,
  LandingSection,
  ModuleInputShell,
  ResultScaffold,
  ScrollNarrativeSection,
  ShareSection,
  TrustStrip,
} from '@/components/landing';

type SpreadType = 'single' | 'three-card' | 'celtic-cross';
type Language = 'en' | 'zh';

interface AiMeta {
  provider: string;
  model: string;
  latencyMs: number;
  costUSD: number;
}

interface TarotReadingResponse {
  spread: SpreadLayout;
  question?: string;
  drawnCards: DrawnCard[];
  totalCards: number;
  language: Language;
  aiInterpretation?: string;
  disclaimer?: string;
  aiMeta?: AiMeta;
  aiError?: string;
}

const spreadOptions = [
  { id: 'single', name: 'Single Card', description: 'A fast signal for one decision.' },
  { id: 'three-card', name: 'Three Card', description: 'Past, present, and emerging direction.' },
  { id: 'celtic-cross', name: 'Celtic Cross', description: 'A full ten-card situation map.' },
] as const;

export default function TarotPage() {
  const [spreadType, setSpreadType] = useState<SpreadType>('three-card');
  const [question, setQuestion] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [reading, setReading] = useState<TarotReadingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCard, setShowCard] = useState<number | null>(null);

  const currentSpread = spreadLayouts.find((_, index) => {
    if (spreadType === 'single') return index === 0;
    if (spreadType === 'three-card') return index === 1;
    return index === 2;
  });

  const drawCards = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setReading(null);
    setShowCard(null);

    try {
      const response = await fetch('/api/tarot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spreadType, question, language, enhanceWithAI: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to draw cards');
      }

      const data: TarotReadingResponse = await response.json();
      setReading(data);
      saveReading({
        reading_type: 'tarot',
        title: `Tarot - ${data.spread.name}`,
        summary: data.aiInterpretation?.slice(0, 120) ?? '',
        reading_data: data as unknown as Record<string, unknown>,
      });
    } catch {
      setError(language === 'zh' ? 'Failed to draw cards. Please try again.' : 'Failed to draw cards. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [spreadType, question, language]);

  const handleCardClick = (index: number) => {
    setShowCard(showCard === index ? null : index);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050508] text-white">
      <BackgroundVideoHero
        eyebrow="Tarot oracle"
        title="A card spread should feel like a door opening."
        subtitle="Choose the spread, ask the question, and let the existing Tarot engine return the same cards through a calmer cinematic surface."
        videoSrc="/assets/videos/hero/tarot-hero-loop-6s-1080p.mp4"
        posterSrc="/assets/images/posters/tarot-hero-poster-16x9.jpg"
        ctaLabel={isLoading ? 'Drawing...' : 'Draw your cards'}
        ctaHref="#tarot-form"
        secondaryCtaLabel="See the ritual"
        secondaryCtaHref="#tarot-narrative"
        stats={[
          { label: 'Deck', value: '78' },
          { label: 'Spreads', value: '3' },
          { label: 'AI layer', value: 'On' },
        ]}
      />

      <TrustStrip
        items={[
          { label: 'Endpoint kept', value: '/api/tarot' },
          { label: 'State kept', value: 'spread + cards' },
          { label: 'Output kept', value: 'PDF + share' },
        ]}
      />

      <LandingSection
        id="tarot-form"
        eyebrow="Reading console"
        title="Select the spread before the first card moves."
        description="The visual shell is new. The spread selection, question input, card draw state, save flow, share flow, and PDF output are preserved."
      >
        <ModuleInputShell
          eyebrow="Card ritual"
          title="Ask with precision"
          description={currentSpread?.description ?? 'Select a spread and draw from the existing Tarot engine.'}
          footer="Click any returned card to expand its interpretation."
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {spreadOptions.map((spread) => (
              <button
                key={spread.id}
                onClick={() => setSpreadType(spread.id)}
                className={`rounded-[1.5rem] border p-4 text-left transition ${
                  spreadType === spread.id
                    ? 'border-amber-300/45 bg-amber-300/[0.08] text-amber-100'
                    : 'border-white/10 bg-white/[0.03] text-white/62 hover:border-violet-300/35'
                }`}
              >
                <span className="block text-xs uppercase tracking-[0.22em] text-white/35">{spread.id}</span>
                <span className="mt-2 block font-serif text-lg text-white/86">{spread.name}</span>
                <span className="mt-2 block text-sm leading-6 text-white/48">{spread.description}</span>
              </button>
            ))}
          </div>

          {currentSpread && (
            <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4 text-sm leading-6 text-white/58">
              {language === 'zh' ? currentSpread.descriptionChinese : currentSpread.description}
            </div>
          )}

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.22em] text-white/45">Question optional</span>
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="What do you need the cards to clarify?"
              className="min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-violet-300/50"
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as Language)}
              className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm uppercase tracking-[0.18em] text-white outline-none"
            >
              <option value="en">EN</option>
              <option value="zh">ZH</option>
            </select>
            <button
              onClick={drawCards}
              disabled={isLoading}
              className="flex-1 rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Drawing cards...' : 'Draw your cards'}
            </button>
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-400/25 bg-rose-500/10 p-4 text-sm text-rose-200">
              {error}
            </div>
          )}
        </ModuleInputShell>
      </LandingSection>

      <ScrollNarrativeSection
        blocks={[
          {
            label: '01',
            heading: 'A question narrows the field.',
            body: 'The page creates a quieter entry point so the user can ask one clear thing before the cards appear.',
            align: 'left',
          },
          {
            label: '02',
            heading: 'The spread becomes a structure.',
            body: 'Single, three-card, and Celtic Cross readings keep their original spread behavior while feeling more premium.',
            align: 'center',
          },
          {
            label: '03',
            heading: 'The reveal stays shareable.',
            body: 'The result resolves into cards, AI interpretation, share controls, and a PDF path without changing the flow.',
            align: 'right',
          },
        ]}
      />

      {reading ? (
        <LandingSection
          eyebrow="Generated result"
          title={reading.spread.name}
          description={question ? `Question: ${question}` : 'The spread has been drawn from the original Tarot endpoint.'}
        >
          <ResultScaffold
            eyebrow="Tarot result"
            title={reading.spread.name}
            summary={reading.aiInterpretation ?? 'Open each card to read the position-level interpretation.'}
            highlights={[
              { label: 'Cards', value: String(reading.totalCards) },
              { label: 'Spread', value: reading.spread.name },
              { label: 'AI status', value: reading.aiInterpretation ? 'Generated' : reading.aiError ? 'Unavailable' : 'Pending' },
            ]}
            details={
              <div className="space-y-8">
                {spreadType === 'celtic-cross' ? (
                  <CelticCrossLayout
                    reading={reading}
                    language={language}
                    showCard={showCard}
                    onCardClick={handleCardClick}
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    {reading.drawnCards.map((drawnCard, index) => (
                      <CardDisplay
                        key={`${drawnCard.card.name}-${index}`}
                        drawnCard={drawnCard}
                        language={language}
                        isExpanded={showCard === index}
                        onClick={() => handleCardClick(index)}
                      />
                    ))}
                  </div>
                )}

                {reading.aiInterpretation && (
                  <div className="rounded-[1.5rem] border border-violet-300/20 bg-violet-300/[0.06] p-5">
                    <h3 className="mb-3 text-xs uppercase tracking-[0.22em] text-violet-100/70">
                      AI interpretation
                    </h3>
                    <p className="whitespace-pre-wrap text-sm leading-7 text-white/72">{reading.aiInterpretation}</p>
                    {reading.disclaimer && <p className="mt-4 text-xs text-white/36">{reading.disclaimer}</p>}
                    {reading.aiMeta && (
                      <p className="mt-3 text-xs text-white/28">
                        {reading.aiMeta.provider} / {reading.aiMeta.model} / {reading.aiMeta.latencyMs}ms
                      </p>
                    )}
                  </div>
                )}

                {reading.aiError && (
                  <div className="rounded-2xl border border-rose-400/25 bg-rose-500/10 p-4 text-sm text-rose-200">
                    AI Interpretation Failed: {reading.aiError}
                  </div>
                )}

                <SharePanel
                  serviceType="tarot"
                  resultId={`${reading.spread.name}-${Date.now()}`}
                  shareUrl={`https://tianji.global/tarot?spread=${reading.spread.name}`}
                />

                <div className="rounded-[2rem] border border-white/10 bg-black/30 p-5">
                  <h3 className="mb-4 text-center text-xs uppercase tracking-[0.22em] text-white/36">
                    Animated card sequence
                  </h3>
                  <div className="flex justify-center">
                    <TarotCardAnimation
                      drawnCards={reading.drawnCards}
                      spread={reading.spread}
                      language={language}
                      spreadType={spreadType}
                      playing
                      width={spreadType === 'celtic-cross' ? 700 : 600}
                      height={400}
                    />
                  </div>
                  <div className="mt-5 flex justify-center">
                    <AnimatedShareButton
                      type="tarot"
                      resultData={reading as unknown as Record<string, unknown>}
                      format="webp"
                      language={language}
                      variant="secondary"
                    />
                  </div>
                </div>

                <PDFDownloadButton
                  serviceType="tarot"
                  resultData={reading as unknown as Record<string, unknown>}
                  language={language}
                />
              </div>
            }
            aside={
              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/35">Share line</p>
                  <p className="mt-3 text-lg font-serif text-white/82">
                    The card you resist is often the card doing the most work.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-amber-300/20 bg-amber-300/[0.06] p-5 text-sm leading-6 text-white/58">
                  Tap each card to reveal the position-level reading before exporting or sharing.
                </div>
              </div>
            }
          />

          <ShareSection
            type="tarot"
            resultData={reading as unknown as Record<string, unknown>}
            ogBgSrc="/assets/images/og/tarot-og-bg-1200x630.jpg"
          />
        </LandingSection>
      ) : (
        <LandingSection
          eyebrow="Preview"
          title="The cards are waiting below the surface."
          description="Draw a spread above to reveal the original Tarot result through the redesigned reading shell."
        >
          <InsightGrid
            title="What stays intact"
            subtitle="Spread state / drawCards / share / PDF"
            items={[
              { label: 'Spread selection', value: 'Single, three-card, and Celtic Cross remain available' },
              { label: 'Question input', value: 'The optional question still travels with the request' },
              { label: 'Card reveal', value: 'Expanded card interpretations remain interactive' },
              { label: 'Export', value: 'Share panel, animated share, and PDF download are preserved' },
            ]}
          />
        </LandingSection>
      )}
    </main>
  );
}

function CardDisplay({
  drawnCard,
  language,
  isExpanded,
  onClick,
}: {
  drawnCard: DrawnCard;
  language: Language;
  isExpanded: boolean;
  onClick: () => void;
}) {
  const { card, isReversed, position, positionName, positionNameChinese, interpretation } = drawnCard;

  return (
    <button
      onClick={onClick}
      className={`group text-left transition duration-300 ${isExpanded ? 'scale-[1.02]' : 'hover:-translate-y-1'}`}
    >
      <div className="h-full rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <div className="mb-3 text-center">
          <span className="text-xs uppercase tracking-[0.18em] text-violet-200/60">Position {position}</span>
          <h3 className="mt-1 font-serif text-lg text-white/86">
            {language === 'zh' ? positionNameChinese : positionName}
          </h3>
        </div>

        <div
          className={`relative mb-4 flex aspect-[2/3] items-center justify-center overflow-hidden rounded-[1.25rem] border border-white/10 ${
            isReversed ? 'rotate-180' : ''
          }`}
          style={{
            background: isReversed
              ? 'linear-gradient(135deg, rgba(120,40,40,0.92), rgba(30,10,20,0.98))'
              : 'linear-gradient(135deg, rgba(76,29,149,0.92), rgba(10,10,10,0.98))',
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(212,175,55,0.22),transparent_45%)]" />
          <div className="relative px-4 text-center">
            <div className="mb-3 text-4xl font-serif text-amber-100">{getCardSymbol(card.arcana, card.suit)}</div>
            <div className="text-sm font-semibold text-white/88">
              {language === 'zh' ? card.nameChinese : card.name}
            </div>
            {card.arcana === 'minor' && (
              <div className="mt-1 text-xs uppercase tracking-[0.14em] text-white/42">
                {language === 'zh' ? card.suitChinese : card.suit}
              </div>
            )}
          </div>
          {isReversed && (
            <div className="absolute right-3 top-3 rounded-full bg-amber-200 px-2 py-1 text-[10px] font-semibold uppercase text-black">
              Reversed
            </div>
          )}
        </div>

        {isExpanded ? (
          <p className="border-t border-white/10 pt-3 text-sm leading-6 text-white/62">{interpretation}</p>
        ) : (
          <p className="text-center text-xs uppercase tracking-[0.16em] text-white/32">Tap to reveal</p>
        )}
      </div>
    </button>
  );
}

function CelticCrossLayout({
  reading,
  language,
  showCard,
  onCardClick,
}: {
  reading: TarotReadingResponse;
  language: Language;
  showCard: number | null;
  onCardClick: (index: number) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {reading.drawnCards.map((drawnCard, index) => (
        <CardDisplay
          key={`${drawnCard.card.name}-${index}`}
          drawnCard={drawnCard}
          language={language}
          isExpanded={showCard === index}
          onClick={() => onCardClick(index)}
        />
      ))}
    </div>
  );
}

function getCardSymbol(arcana: string, suit?: string): string {
  if (arcana === 'major') return 'MA';
  switch (suit) {
    case 'Wands':
      return 'W';
    case 'Cups':
      return 'C';
    case 'Swords':
      return 'S';
    case 'Pentacles':
      return 'P';
    default:
      return '?';
  }
}
