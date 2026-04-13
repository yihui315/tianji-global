'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import SharePanel from '@/components/SharePanel';
import PDFDownloadButton from '@/components/PDFDownloadButton';
import { saveReading } from '@/lib/save-reading';
import AnimatedShareButton from '@/components/AnimatedShareButton';
import TarotCardAnimation from '@/components/animations/TarotCardAnimation';
import { spreadLayouts, type TarotCard, type SpreadLayout, type DrawnCard } from '@/lib/tarot';
import { GlassCard, MysticButton, LanguageSwitch, SectionHeader } from '@/components/ui';
import { colors } from '@/design-system';

// ─── Fade-In Motion ───────────────────────────────────────────────────────────
function FadeInWhenVisible({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

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
        title: `${language === 'zh' ? '塔罗' : 'Tarot'} — ${data.spread.name}`,
        summary: data.aiInterpretation?.slice(0, 120) ?? '',
        reading_data: data as unknown as Record<string, unknown>,
      });
    } catch {
      setError(language === 'zh' ? '抽卡失败，请重试' : 'Failed to draw cards. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [spreadType, question, language]);

  const handleCardClick = (index: number) => {
    setShowCard(showCard === index ? null : index);
  };

  return (
    <div className="mystic-page text-white min-h-screen" style={{ background: colors.bgPrimary }}>
      {/* Multi-layer Cosmic Background */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 0%, ${colors.bgNebula} 0%, transparent 55%)`, zIndex: 0 }} />
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 20% 20%, rgba(59,20,75,0.35) 0%, transparent 50%)', zIndex: 0 }} />
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 80% 80%, rgba(6,30,60,0.45) 0%, transparent 50%)', zIndex: 0 }} />
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(80,40,100,0.2) 0%, transparent 40%)', zIndex: 0 }} />

      <div className="fixed top-4 right-4 z-50"><LanguageSwitch /></div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-12 w-full">
        <SectionHeader
          title="Tarot Reading"
          subtitle="塔罗牌占卜 · TianJi Global"
          badge="🃏"
        />

        {/* Spread Selection */}
        <FadeInWhenVisible delay={0.1}>
        <GlassCard level="card" className="p-6 mb-6 border border-white/[0.06] bg-white/[0.015] rounded-2xl">
          <h2 className="text-sm font-serif text-white/40 tracking-widest uppercase mb-4">
            {language === 'zh' ? '选择牌阵' : 'Choose Your Spread'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {([
              { id: 'single', name: 'Single Card', nameChinese: '单牌抽' },
              { id: 'three-card', name: 'Three Card', nameChinese: '三牌抽' },
              { id: 'celtic-cross', name: 'Celtic Cross', nameChinese: '凯尔特十字' },
            ] as const).map((spread) => (
              <button
                key={spread.id}
                onClick={() => setSpreadType(spread.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  spreadType === spread.id
                    ? 'border-purple-500 bg-purple-600/30'
                    : 'border-slate-600 bg-slate-700/50 hover:border-purple-400'
                }`}
              >
                <div className="font-semibold">{spread.name}</div>
                <div className="text-sm text-purple-300">{spread.nameChinese}</div>
              </button>
            ))}
          </div>

          {/* Spread Description */}
          {currentSpread && (
            <div className="bg-slate-700/30 rounded-lg p-4 mb-6">
              <p className="text-slate-300">
                {language === 'zh' ? currentSpread.descriptionChinese : currentSpread.description}
              </p>
            </div>
          )}

          {/* Question Input */}
          <div className="mb-6">
            <label className="block text-purple-300 mb-2">
              {language === 'zh' ? '你的问题（可选）' : 'Your Question (optional)'}
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={language === 'zh' ? '输入你想问的问题...' : 'Enter your question...'}
              className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none resize-none"
              rows={2}
            />
          </div>

          {/* Language Toggle */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-purple-300">
              {language === 'zh' ? '语言' : 'Language'}:
            </span>
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-lg ${
                language === 'en' ? 'bg-purple-600' : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('zh')}
              className={`px-4 py-2 rounded-lg ${
                language === 'zh' ? 'bg-purple-600' : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              中文
            </button>
          </div>

          {/* Draw Button */}
          <MysticButton
            variant="solid"
            size="lg"
            className="w-full"
            onClick={drawCards}
            disabled={isLoading}
          >
            {isLoading
              ? (language === 'zh' ? '正在抽牌...' : 'Drawing cards...')
              : (language === 'zh' ? '抽取你的牌' : 'Draw Your Cards')}
          </MysticButton>
        </GlassCard>
        </FadeInWhenVisible>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6 text-red-200">
            {error}
          </div>
        )}

        {/* Reading Results */}
        {reading && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-purple-300">
                {language === 'zh' ? '你的塔罗牌解读' : 'Your Tarot Reading'}
              </h2>
              {question && (
                <p className="text-slate-400 mt-2">
                  {language === 'zh' ? '问题: ' : 'Question: '}{question}
                </p>
              )}
            </div>

            {/* Celtic Cross Special Layout */}
            {spreadType === 'celtic-cross' ? (
              <CelticCrossLayout reading={reading} language={language} showCard={showCard} onCardClick={handleCardClick} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {reading.drawnCards.map((drawnCard, index) => (
                  <CardDisplay
                    key={index}
                    drawnCard={drawnCard}
                    language={language}
                    isExpanded={showCard === index}
                    onClick={() => handleCardClick(index)}
                  />
                ))}
              </div>
            )}

            {/* AI Interpretation */}
            {reading.aiInterpretation && (
              <div className="bg-gradient-to-br from-purple-900/50 to-slate-800/50 rounded-xl p-6 border border-purple-500/30 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                    AI
                  </div>
                  <h3 className="text-xl font-bold text-purple-300">
                    {language === 'zh' ? 'AI 智能解读' : 'AI Interpretation'}
                  </h3>
                </div>
                <div className="prose prose-invert prose-purple max-w-none">
                  <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {reading.aiInterpretation}
                  </p>
                </div>
                {reading.disclaimer && (
                  <p className="text-slate-500 text-xs mt-4 italic">
                    {reading.disclaimer}
                  </p>
                )}
                {reading.aiMeta && (
                  <p className="text-slate-600 text-xs mt-2">
                    {reading.aiMeta.provider} · {reading.aiMeta.model} · {reading.aiMeta.latencyMs}ms
                  </p>
                )}
              </div>
            )}

            {reading.aiError && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 text-red-300 text-sm">
                {language === 'zh' ? 'AI 解读失败' : 'AI Interpretation Failed'}: {reading.aiError}
              </div>
            )}

            {/* Share Panel */}
            <SharePanel
              serviceType="tarot"
              resultId={`${reading.spread.name}-${Date.now()}`}
              shareUrl={`https://tianji.global/tarot?spread=${reading.spread.name}`}
            />

            {/* Animated Tarot Card Display */}
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-bold text-purple-300 mb-4 text-center">
                ✨ Animated Tarot Cards
              </h3>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <TarotCardAnimation
                  drawnCards={reading.drawnCards}
                  spread={reading.spread}
                  language={language}
                  spreadType={spreadType}
                  playing={true}
                  width={spreadType === 'celtic-cross' ? 700 : 600}
                  height={400}
                />
              </div>
              <div className="flex justify-center">
                <AnimatedShareButton
                  type="tarot"
                  resultData={reading as unknown as Record<string, unknown>}
                  format="webp"
                  language={language}
                  variant="secondary"
                />
              </div>
            </div>

            {/* PDF Download */}
            <PDFDownloadButton
              serviceType="tarot"
              resultData={reading as unknown as Record<string, unknown>}
              language={language}
            />
          </div>
        )}

        {/* Card Back Decoration */}
        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>© 2024 TianJi Global · 天机全球</p>
          <p className="mt-1">78 Cards · {language === 'zh' ? '大阿卡纳与小子阿卡纳' : 'Major & Minor Arcana'}</p>
        </div>
      </div>
    </div>
  );
}

// Card Display Component
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
    <div
      onClick={onClick}
      className={`cursor-pointer transition-all duration-300 ${
        isExpanded ? 'scale-105' : 'hover:scale-102'
      }`}
    >
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-600 shadow-xl">
        {/* Position Label */}
        <div className="text-center mb-3">
          <span className="text-purple-400 text-sm">
            {language === 'zh' ? `位置 ${position}` : `Position ${position}`}
          </span>
          <h3 className="font-bold text-lg">
            {language === 'zh' ? positionNameChinese : positionName}
          </h3>
        </div>

        {/* Card Visual */}
        <div
          className={`relative aspect-[2/3] rounded-lg mb-3 flex items-center justify-center overflow-hidden ${
            isReversed ? 'rotate-180' : ''
          }`}
          style={{
            background: isReversed
              ? 'linear-gradient(135deg, #7c2d12 0%, #991b1b 100%)'
              : 'linear-gradient(135deg, #581c87 0%, #7c3aed 100%)',
          }}
        >
          <div className="text-center p-4">
            <div className="text-3xl mb-2">{getCardSymbol(card.arcana, card.suit)}</div>
            <div className="font-bold text-sm">
              {language === 'zh' ? card.nameChinese : card.name}
            </div>
            {card.arcana === 'minor' && (
              <div className="text-xs opacity-75">
                {language === 'zh' ? card.suitChinese : card.suit}
              </div>
            )}
          </div>
          {isReversed && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded">
              {language === 'zh' ? '逆位' : 'Reversed'}
            </div>
          )}
        </div>

        {/* Interpretation (shown when expanded) */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-600">
            <p className="text-slate-300 text-sm leading-relaxed">{interpretation}</p>
          </div>
        )}

        {!isExpanded && (
          <p className="text-slate-400 text-xs text-center mt-2">
            {language === 'zh' ? '点击查看解读' : 'Click to reveal interpretation'}
          </p>
        )}
      </div>
    </div>
  );
}

// Celtic Cross Layout Component
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
  const positions = [
    { grid: 'col-span-2 row-span-2', layout: 'flex justify-center items-center' },
    { grid: 'col-span-2', layout: 'flex justify-center' },
    { grid: 'col-span-2 row-span-2', layout: 'flex justify-center items-center' },
    { grid: '', layout: 'flex justify-center items-center' },
    { grid: '', layout: 'flex justify-center items-center' },
    { grid: '', layout: 'flex justify-center items-center' },
    { grid: '', layout: 'flex justify-center items-center' },
    { grid: 'col-span-2', layout: 'flex justify-center' },
    { grid: 'col-span-2', layout: 'flex justify-center' },
    { grid: 'col-span-4', layout: 'flex justify-center' },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {reading.drawnCards.map((drawnCard, index) => (
        <div key={index} className={positions[index].grid}>
          <div
            onClick={() => onCardClick(index)}
            className={`cursor-pointer transition-all ${showCard === index ? 'scale-110' : 'hover:scale-105'}`}
          >
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-3 border border-slate-600 shadow-xl h-full">
              <div className="text-center mb-2">
                <span className="text-purple-400 text-xs">
                  {language === 'zh' ? `位${index + 1}` : `#${index + 1}`}
                </span>
                <h4 className="font-semibold text-sm">
                  {language === 'zh' ? drawnCard.positionNameChinese : drawnCard.positionName}
                </h4>
              </div>
              <div
                className={`aspect-[2/3] rounded-lg flex items-center justify-center mb-2 ${
                  drawnCard.isReversed ? 'rotate-180' : ''
                }`}
                style={{
                  background: drawnCard.isReversed
                    ? 'linear-gradient(135deg, #7c2d12 0%, #991b1b 100%)'
                    : 'linear-gradient(135deg, #581c87 0%, #7c3aed 100%)',
                }}
              >
                <div className="text-center p-2">
                  <div className="text-2xl">{getCardSymbol(drawnCard.card.arcana, drawnCard.card.suit)}</div>
                  <div className="font-bold text-xs">
                    {language === 'zh' ? drawnCard.card.nameChinese : drawnCard.card.name}
                  </div>
                </div>
              </div>
              {showCard === index && (
                <div className="mt-2 pt-2 border-t border-slate-600">
                  <p className="text-slate-300 text-xs leading-relaxed">{drawnCard.interpretation}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper to get card symbol
function getCardSymbol(arcana: string, suit?: string): string {
  if (arcana === 'major') return '★';
  switch (suit) {
    case 'Wands': return '🔥';
    case 'Cups': return '💧';
    case 'Swords': return '⚔️';
    case 'Pentacles': return '💰';
    default: return '?';
  }
}
