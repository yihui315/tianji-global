'use client';

import { useCallback, useState } from 'react';
import SharePanel from '@/components/SharePanel';
import PDFDownloadButton from '@/components/PDFDownloadButton';
import { saveReading } from '@/lib/save-reading';
import AnimatedShareButton from '@/components/AnimatedShareButton';
import TarotCardAnimation from '@/components/animations/TarotCardAnimation';
import { spreadLayouts, type DrawnCard, type SpreadLayout } from '@/lib/tarot';
import { useSyncedLanguage } from '@/hooks/useSyncedLanguage';
import { moduleLandingCopy } from '@/lib/language-routing';
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
import { GlassCard } from '@/components/ui';

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
  const [language, setLanguage] = useSyncedLanguage();
  const [reading, setReading] = useState<TarotReadingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCard, setShowCard] = useState<number | null>(null);
  const copy = moduleLandingCopy.tarot[language];

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
        eyebrow={copy.hero.eyebrow}
        title={copy.hero.title}
        subtitle={copy.hero.subtitle}
        description={copy.hero.description}
        videoSrc="/assets/videos/hero/tarot-hero-loop-6s-1080p.mp4"
        posterSrc="/assets/images/posters/tarot-hero-poster-16x9.jpg"
        imageSrc="/assets/images/hero/tarot-hero-master-16x9.jpg"
        ctaLabel={isLoading ? (language === 'zh' ? '抽牌中' : 'Drawing...') : copy.primaryCta}
        ctaHref="#tarot-form"
        secondaryCtaLabel={copy.secondaryCta}
        secondaryCtaHref="#tarot-narrative"
        stats={[
          { label: language === 'zh' ? '牌组' : 'Deck', value: '78' },
          { label: language === 'zh' ? '牌阵' : 'Spreads', value: '3' },
          { label: language === 'zh' ? 'AI 层' : 'AI layer', value: language === 'zh' ? '开启' : 'On' },
        ]}
      />

      <TrustStrip
        items={[...copy.trustItems]}
      />

      <LandingSection
        id="tarot-form"
        eyebrow={copy.form.eyebrow}
        title={copy.form.title}
        description={copy.form.description}
      >
        <ModuleInputShell
          eyebrow={copy.form.eyebrow}
          title={language === 'zh' ? '清楚提问' : 'Ask with precision'}
          description={currentSpread?.description ?? 'Pick a spread and draw your cards.'}
          footer={language === 'zh' ? '点击返回的卡牌即可展开解读。' : 'Click any returned card to expand its interpretation.'}
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
                <span className="mt-2 block text-sm leading-6 text-white/48">
                  {language === 'zh' ? spread.description : spread.description}
                </span>
              </button>
            ))}
          </div>

          {currentSpread && (
            <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4 text-sm leading-6 text-white/58">
              {language === 'zh' ? currentSpread.descriptionChinese : currentSpread.description}
            </div>
          )}

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.22em] text-white/45">
              {language === 'zh' ? '问题（可选）' : 'Question optional'}
            </span>
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder={language === 'zh' ? '你想让牌面澄清什么？' : 'What do you need the cards to clarify?'}
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
              {isLoading ? (language === 'zh' ? '正在抽牌' : 'Drawing cards...') : copy.primaryCta}
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
            body: 'Take a moment first — ask one clear thing, then let the deck respond. Sharper questions lead to sharper readings.',
            align: 'left',
          },
          {
            label: '02',
            heading: 'The spread becomes a structure.',
            body: 'Single card for a quick check, three-card for past-present-future, Celtic Cross for the deeper map. Each position carries its own meaning.',
            align: 'center',
          },
          {
            label: '03',
            heading: 'The reveal stays shareable.',
            body: 'When you are ready, your reading becomes a card you can share, an animated story, or a PDF you can keep.',
            align: 'right',
          },
        ]}
      />

      {reading ? (
        <LandingSection
          eyebrow="Generated result"
          title={reading.spread.name}
          description={question ? `Question: ${question}` : 'Your spread is laid out — open each card for its position-level meaning.'}
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
        <>
          <LandingSection
            eyebrow={language === 'zh' ? '抽牌之前' : 'Before you draw'}
            title={
              language === 'zh'
                ? '你怎么问，牌就怎么照见你。'
                : 'The cards reflect the question you bring to them.'
            }
            subtitle={
              language === 'zh'
                ? '塔罗最擅长照见情绪、关系与处境，而不是替你预测「会不会发生」。先把心里的问题写得清楚，再把牌翻开。'
                : 'Tarot mirrors emotions, relationships, and situations — it doesn’t forecast whether something will happen. Write the question that is actually on your mind, then turn the cards.'
            }
          >
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
              <GlassCard
                level="card"
                className="rounded-[1.75rem] border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8"
              >
                <div className="mb-5 text-[0.68rem] uppercase tracking-[0.28em] text-[rgba(212,175,119,0.62)]">
                  {language === 'zh' ? '三个原则' : 'Three principles'}
                </div>
                <ol className="space-y-5 text-sm leading-7 text-white/70">
                  <li className="flex gap-4">
                    <span className="mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full border border-[rgba(212,175,119,0.32)] text-[0.7rem] font-semibold tracking-[0.18em] text-[rgba(212,175,119,0.85)]">
                      01
                    </span>
                    <div>
                      <div className="mb-1 font-medium text-white/90">
                        {language === 'zh' ? '一次只问一件事' : 'Ask one thing at a time'}
                      </div>
                      <p className="text-white/55">
                        {language === 'zh'
                          ? '一次牌阵聚焦一个主题，几张牌之间的关系才会清晰。'
                          : 'One theme per spread — the conversation between the cards only becomes clear when the question is singular.'}
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full border border-[rgba(212,175,119,0.32)] text-[0.7rem] font-semibold tracking-[0.18em] text-[rgba(212,175,119,0.85)]">
                      02
                    </span>
                    <div>
                      <div className="mb-1 font-medium text-white/90">
                        {language === 'zh' ? '问内在,不问命运' : 'Ask the inside, not the outcome'}
                      </div>
                      <p className="text-white/55">
                        {language === 'zh'
                          ? '与其问「他会不会回来」，不如问「我现在真正在意的是什么」。'
                          : 'Instead of "will they come back", ask "what am I really holding on to right now".'}
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full border border-[rgba(212,175,119,0.32)] text-[0.7rem] font-semibold tracking-[0.18em] text-[rgba(212,175,119,0.85)]">
                      03
                    </span>
                    <div>
                      <div className="mb-1 font-medium text-white/90">
                        {language === 'zh' ? '把场景说具体' : 'Anchor in a concrete situation'}
                      </div>
                      <p className="text-white/55">
                        {language === 'zh'
                          ? '说出关系对象、时间段、当下的感受，牌面才能落到你这件事上。'
                          : 'Name the person, the timeframe, and what you are currently feeling — the cards land more precisely on something specific.'}
                      </p>
                    </div>
                  </li>
                </ol>
              </GlassCard>

              <GlassCard
                level="strong"
                className="rounded-[1.75rem] border border-white/[0.08] bg-black/25 p-6 sm:p-8"
              >
                <div className="mb-5 text-[0.68rem] uppercase tracking-[0.28em] text-[rgba(212,175,119,0.62)]">
                  {language === 'zh' ? '可借鉴的提问' : 'Questions worth drawing'}
                </div>
                <div className="space-y-4 text-sm leading-7 text-white/72">
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] px-5 py-4">
                    {language === 'zh'
                      ? '“在这段关系里，我此刻最需要看见自己的什么部分？”'
                      : '“In this relationship, what part of myself most needs to be seen right now?”'}
                  </div>
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] px-5 py-4">
                    {language === 'zh'
                      ? '“面对眼下这个决定，我还没说出口的犹豫是什么？”'
                      : '“About this decision, what hesitation am I still holding back?”'}
                  </div>
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] px-5 py-4">
                    {language === 'zh'
                      ? '“接下来一个月,我可以怎样回应这个处境会更轻盈?”'
                      : '“Over the next month, how can I respond to this situation with more ease?”'}
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-[rgba(212,175,119,0.18)] bg-[rgba(212,175,119,0.04)] px-5 py-4 text-xs leading-6 text-white/55">
                  <span className="mr-2 font-semibold uppercase tracking-[0.2em] text-[rgba(212,175,119,0.78)]">
                    {language === 'zh' ? '尽量避免' : 'Avoid'}
                  </span>
                  {language === 'zh'
                    ? '“他会不会回来？”——是非题让牌面没有空间展开。换成「这段关系现在还在教我什么」。'
                    : '“Will they come back?” — yes/no questions leave the cards no room. Try "what is this relationship still teaching me" instead.'}
                </div>
              </GlassCard>
            </div>
          </LandingSection>

          <LandingSection
            eyebrow="Preview"
            title="The cards are waiting below the surface."
            description="Draw a spread above and the deck will open into its full reading."
          >
            <InsightGrid
              title="Inside every reading"
              subtitle="Spread · cards · interpretation · share"
              items={[
                { label: 'Spread choice', value: 'Single card, three-card, or Celtic Cross' },
                { label: 'Your question', value: 'Asked once, carried through the whole reading' },
                { label: 'Card reveal', value: 'Tap any card to open its position-level meaning' },
                { label: 'Save it', value: 'Share card, animated story, or full PDF export' },
              ]}
            />
          </LandingSection>
        </>
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
