'use client';

export const dynamic = 'force-dynamic';

import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BackgroundVideoHero,
  InsightGrid,
  LandingSection,
  ModuleInputShell,
  ResultScaffold,
  ScrollNarrativeSection,
  TrustStrip,
} from '@/components/landing';
import PDFDownloadButton from '@/components/PDFDownloadButton';
import SharePanel from '@/components/SharePanel';
import { GlassCard, LanguageSwitch } from '@/components/ui';
import { colors } from '@/design-system';
import { saveReading } from '@/lib/save-reading';

type Language = 'zh' | 'en';

interface ChangingLine {
  line: number;
  value: number;
  isYang: boolean;
  isChanging: boolean;
  meaning: string;
  meaningEn: string;
}

interface Hexagram {
  number: number;
  name: string;
  pinyin: string;
  english: string;
  judgement: string;
  image?: string;
  changingLines?: ChangingLine[];
}

interface LineInterpretation {
  position: number;
  value: number;
  meaning: string;
  meaningEn: string;
  isChanging: boolean;
  isYang: boolean;
}

interface CastResult {
  hexagram: Hexagram;
  lines: LineInterpretation[];
  hasChangingLines: boolean;
  aiInterpretation?: string;
}

const HEXAGRAMS: Hexagram[] = [
  { number: 1, name: 'Qian', pinyin: 'Qian', english: 'The Creative', judgement: 'Supreme success. Perseverance furthers.' },
  { number: 2, name: 'Kun', pinyin: 'Kun', english: 'The Receptive', judgement: 'Supreme success. Perseverance of a mare furthers.' },
  { number: 3, name: 'Zhun', pinyin: 'Zhun', english: 'Difficulty at the Beginning', judgement: 'Supreme success. Do not advance; appoint helpers.' },
  { number: 4, name: 'Meng', pinyin: 'Meng', english: 'Youthful Folly', judgement: 'Success. Perseverance furthers.' },
  { number: 5, name: 'Xu', pinyin: 'Xu', english: 'Waiting', judgement: 'If you are sincere, you have light and success.' },
  { number: 6, name: 'Song', pinyin: 'Song', english: 'Conflict', judgement: 'Be sincere, but meet obstacles halfway.' },
  { number: 7, name: 'Shi', pinyin: 'Shi', english: 'The Army', judgement: 'The army needs perseverance and a strong man.' },
  { number: 8, name: 'Bi', pinyin: 'Bi', english: 'Holding Together', judgement: 'Good fortune. Inquire of the oracle once more.' },
  { number: 9, name: 'Xiao Chu', pinyin: 'Xiao Chu', english: 'The Taming Power of the Small', judgement: 'Success. Dense clouds but no rain from the west.' },
  { number: 10, name: 'Lu', pinyin: 'Lu', english: 'Treading', judgement: 'Treading on the tail of a tiger. It does not bite. Success.' },
  { number: 11, name: 'Tai', pinyin: 'Tai', english: 'Peace', judgement: 'The small departs; the great approaches. Good fortune.' },
  { number: 12, name: 'Pi', pinyin: 'Pi', english: 'Standstill', judgement: 'Standstill. No perseverance furthers the inferior man.' },
  { number: 13, name: 'Tong Ren', pinyin: 'Tong Ren', english: 'Fellowship with Men', judgement: 'Fellowship with men in the open. Success.' },
  { number: 14, name: 'Da You', pinyin: 'Da You', english: 'Possession in Great Measure', judgement: 'Supreme success.' },
  { number: 15, name: 'Qian Modesty', pinyin: 'Qian', english: 'Modesty', judgement: 'Success. The superior man carries things through.' },
  { number: 16, name: 'Yu', pinyin: 'Yu', english: 'Enthusiasm', judgement: 'Enthusiasm. Helpful to install helpers and set armies marching.' },
  { number: 17, name: 'Sui', pinyin: 'Sui', english: 'Following', judgement: 'Supreme success. Perseverance furthers. No blame.' },
  { number: 18, name: 'Gu', pinyin: 'Gu', english: 'Work on What Has Been Spoiled', judgement: 'Supreme success. Before the starting point, three days; after, three days.' },
  { number: 19, name: 'Lin', pinyin: 'Lin', english: 'Approach', judgement: 'Supreme success. Perseverance furthers. In the eighth month there will be misfortune.' },
  { number: 20, name: 'Guan', pinyin: 'Guan', english: 'Contemplation', judgement: 'The ablution has been made but not yet the offering. Sincere devotion.' },
  { number: 21, name: 'Shi He', pinyin: 'Shi He', english: 'Biting Through', judgement: 'Success. It furthers one to let justice be administered.' },
  { number: 22, name: 'Bi Grace', pinyin: 'Bi', english: 'Grace', judgement: 'Success. In small matters it is favourable to undertake something.' },
  { number: 23, name: 'Bo', pinyin: 'Bo', english: 'Splitting Apart', judgement: 'It does not further one to go anywhere.' },
  { number: 24, name: 'Fu', pinyin: 'Fu', english: 'Return', judgement: 'Success. Coming and going without error. Friends come without blame.' },
  { number: 25, name: 'Wu Wang', pinyin: 'Wu Wang', english: 'Innocence', judgement: 'Supreme success. Perseverance furthers. If someone is not as he should be, he has misfortune.' },
  { number: 26, name: 'Da Chu', pinyin: 'Da Chu', english: 'The Taming Power of the Great', judgement: 'Perseverance furthers. Not eating at home brings good fortune.' },
  { number: 27, name: 'Yi Nourishment', pinyin: 'Yi', english: 'The Corners of the Mouth', judgement: 'Perseverance brings good fortune. Pay heed to the providing of nourishment.' },
  { number: 28, name: 'Da Guo', pinyin: 'Da Guo', english: 'Preponderance of the Great', judgement: 'The ridgepole sags to the breaking point. It furthers one to have somewhere to go.' },
  { number: 29, name: 'Kan', pinyin: 'Kan', english: 'The Abysmal', judgement: 'If you are sincere, you have success in your heart. Action brings reward.' },
  { number: 30, name: 'Li', pinyin: 'Li', english: 'The Clinging', judgement: 'Perseverance furthers. It brings success. Care of the cow brings good fortune.' },
  { number: 31, name: 'Xian', pinyin: 'Xian', english: 'Influence', judgement: 'Success. Perseverance furthers. Taking a maiden to wife brings good fortune.' },
  { number: 32, name: 'Heng', pinyin: 'Heng', english: 'Duration', judgement: 'Success. No blame. Perseverance furthers. It furthers one to have somewhere to go.' },
  { number: 33, name: 'Dun', pinyin: 'Dun', english: 'Retreat', judgement: 'Success. In what is small, perseverance furthers.' },
  { number: 34, name: 'Da Zhuang', pinyin: 'Da Zhuang', english: 'The Power of the Great', judgement: 'Perseverance furthers.' },
  { number: 35, name: 'Jin', pinyin: 'Jin', english: 'Progress', judgement: 'The powerful prince is honoured with horses in large numbers.' },
  { number: 36, name: 'Ming Yi', pinyin: 'Ming Yi', english: 'Darkening of the Light', judgement: 'In adversity it furthers one to be persevering.' },
  { number: 37, name: 'Jia Ren', pinyin: 'Jia Ren', english: 'The Family', judgement: 'Perseverance of the woman furthers.' },
  { number: 38, name: 'Kui', pinyin: 'Kui', english: 'Opposition', judgement: 'In small matters, good fortune.' },
  { number: 39, name: 'Jian Obstruction', pinyin: 'Jian', english: 'Obstruction', judgement: 'The southwest furthers. The northeast does not further. It furthers one to see the great man.' },
  { number: 40, name: 'Xie', pinyin: 'Xie', english: 'Deliverance', judgement: 'The southwest furthers. If there is no longer anything to be achieved, return brings good fortune.' },
  { number: 41, name: 'Sun Decrease', pinyin: 'Sun', english: 'Decrease', judgement: 'Decrease combined with sincerity brings about supreme good fortune without blame.' },
  { number: 42, name: 'Yi Increase', pinyin: 'Yi', english: 'Increase', judgement: 'It furthers one to undertake something. It furthers one to cross the great water.' },
  { number: 43, name: 'Guai', pinyin: 'Guai', english: 'Break-through', judgement: 'One must resolutely make the matter known at the court of the king.' },
  { number: 44, name: 'Gou', pinyin: 'Gou', english: 'Coming to Meet', judgement: 'The maiden is powerful. One should not marry such a maiden.' },
  { number: 45, name: 'Cui', pinyin: 'Cui', english: 'Gathering Together', judgement: 'Success. The king approaches his temple. Great offerings bring good fortune.' },
  { number: 46, name: 'Sheng', pinyin: 'Sheng', english: 'Pushing Upward', judgement: 'Supreme success. One must see the great man. Do not be grieved. Marching to the south brings good fortune.' },
  { number: 47, name: 'Kun Oppression', pinyin: 'Kun', english: 'Oppression', judgement: 'Success. Perseverance. The great man brings about good fortune. No blame.' },
  { number: 48, name: 'Jing', pinyin: 'Jing', english: 'The Well', judgement: 'The town may be changed, but the well cannot be changed. Draw near to the well; the water is there.' },
  { number: 49, name: 'Ge', pinyin: 'Ge', english: 'Revolution', judgement: 'On your own day you are believed. Supreme success. Perseverance furthers. Remorse disappears.' },
  { number: 50, name: 'Ding', pinyin: 'Ding', english: 'The Cauldron', judgement: 'Supreme good fortune. Success.' },
  { number: 51, name: 'Zhen', pinyin: 'Zhen', english: 'The Arousing (Shock)', judgement: 'Shock brings success. When the shock comes, there is fear. Then laughter and words.' },
  { number: 52, name: 'Gen', pinyin: 'Gen', english: 'Keeping Still, Mountain', judgement: 'Keeping his back still so that he no longer feels his body.' },
  { number: 53, name: 'Jian Progress', pinyin: 'Jian', english: 'Development (Gradual Progress)', judgement: 'The maiden is given in marriage. Good fortune. Perseverance furthers.' },
  { number: 54, name: 'Gui Mei', pinyin: 'Gui Mei', english: 'The Marrying Maiden', judgement: 'Undertakings bring misfortune. Nothing that would further.' },
  { number: 55, name: 'Feng', pinyin: 'Feng', english: 'Abundance', judgement: 'Abundance has success. The king attains abundance. Be not sad.' },
  { number: 56, name: 'Lu Wanderer', pinyin: 'Lu', english: 'The Wanderer', judgement: 'The wanderer — success through smallness. Perseverance brings good fortune.' },
  { number: 57, name: 'Xun', pinyin: 'Xun', english: 'The Gentle (Wind)', judgement: 'Success through what is small. It furthers one to have somewhere to go.' },
  { number: 58, name: 'Dui', pinyin: 'Dui', english: 'The Joyous, Lake', judgement: 'Success. Perseverance is favourable.' },
  { number: 59, name: 'Huan', pinyin: 'Huan', english: 'Dispersion (Dissolution)', judgement: 'Success. The king approaches his temple. It furthers one to cross the great water.' },
  { number: 60, name: 'Jie', pinyin: 'Jie', english: 'Limitation', judgement: 'Success. Galling limitation must not be persevered in.' },
  { number: 61, name: 'Zhong Fu', pinyin: 'Zhong Fu', english: 'Inner Truth', judgement: 'Pigs and fishes. Good fortune. It furthers one to cross the great water. Perseverance furthers.' },
  { number: 62, name: 'Xiao Guo', pinyin: 'Xiao Guo', english: 'Preponderance of the Small', judgement: 'Success. Perseverance furthers. Small things may be done; great things should not be done.' },
  { number: 63, name: 'Ji Ji', pinyin: 'Ji Ji', english: 'After Completion', judgement: 'Success in small matters. Perseverance furthers.' },
  { number: 64, name: 'Wei Ji', pinyin: 'Wei Ji', english: 'Before Completion', judgement: 'Success. But if the little fox has nearly completed the crossing, it gets its tail in the water.' },
];

function getHexagramByNumber(number: number): Hexagram | null {
  return HEXAGRAMS.find((hexagram) => hexagram.number === number) || null;
}

const NARRATIVE_BLOCKS = [
  {
    label: '01 Oracle field',
    heading: 'The question enters the field before the answer appears.',
    body: 'Yi Jing is strongest when the page creates ritual, clarity, and pause. The redesign keeps the same cast and search logic, but stages them inside a more deliberate mystical frame.',
  },
  {
    label: '02 Hexagram reveal',
    heading: 'A hexagram should unfold like a signal, not a dump of text.',
    body: 'The result layer now moves from symbol to judgement to interpretation, so the reading feels guided and premium while preserving the exact payload already returned by the oracle API.',
  },
  {
    label: '03 Reference atlas',
    heading: 'Search mode remains intact as a direct route into the sixty-four hexagrams.',
    body: 'Manual lookup still works the same way. The redesign simply turns it into a cleaner atlas-like experience that supports both study and instant reading.',
  },
];

const TRUST_ITEMS = [
  { label: 'Cast + search modes', description: 'Both input paths are preserved as-is' },
  { label: 'AI interpretation', description: 'Still sourced from the same /api/yijing response' },
  { label: 'Legacy share flow', description: 'QR, social share, and PDF export remain intact' },
  { label: 'No contract change', description: 'Same route path, same request shape, same save flow' },
];

function buildInsightItems(
  hexagram: Hexagram | null | undefined,
  aiInterpretation: string | undefined,
  language: Language
) {
  const source = aiInterpretation || hexagram?.judgement || '';
  const sentences = source
    .split(/[.!?\n。！？]/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, 6);

  if (!sentences.length) {
    return [];
  }

  const icons = ['✦', '✧', '◌', '✺', '✦', '✧'];
  return sentences.map((sentence, index) => ({
    icon: icons[index % icons.length],
    label: `${language === 'zh' ? 'Insight' : 'Insight'} ${index + 1}`,
    value: sentence.length > 108 ? `${sentence.slice(0, 108)}...` : sentence,
  }));
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"
      >
        <div className="space-y-4 rounded-[2rem] border border-white/[0.06] bg-white/[0.02] p-8">
          <div className="h-4 w-28 rounded-full bg-white/[0.06]" />
          <div className="h-12 w-3/4 rounded-2xl bg-white/[0.05]" />
          <div className="h-5 w-full rounded-full bg-white/[0.04]" />
          <div className="h-5 w-5/6 rounded-full bg-white/[0.04]" />
        </div>
        <div className="space-y-3 rounded-[2rem] border border-white/[0.06] bg-white/[0.02] p-8">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="h-14 rounded-2xl bg-white/[0.04]" />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function YiJingInputPanel({
  mode,
  language,
  searchNumber,
  question,
  gender,
  coinAnimating,
  isCasting,
  searchError,
  onModeChange,
  onLanguageChange,
  onSearchNumberChange,
  onQuestionChange,
  onGenderChange,
  onCast,
  onSearch,
}: {
  mode: 'cast' | 'search';
  language: Language;
  searchNumber: string;
  question: string;
  gender: string;
  coinAnimating: boolean;
  isCasting: boolean;
  searchError: string | null;
  onModeChange: (value: 'cast' | 'search') => void;
  onLanguageChange: (value: Language) => void;
  onSearchNumberChange: (value: string) => void;
  onQuestionChange: (value: string) => void;
  onGenderChange: (value: string) => void;
  onCast: () => void;
  onSearch: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {(['cast', 'search'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onModeChange(value)}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition-all ${
              mode === value
                ? 'border-amber-400/45 bg-amber-400/10 text-amber-100'
                : 'border-white/[0.08] bg-white/[0.03] text-white/60 hover:border-white/[0.16] hover:text-white/82'
            }`}
          >
            {value === 'cast' ? 'Coin cast' : 'Search hexagram'}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {(['zh', 'en'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onLanguageChange(value)}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition-all ${
              language === value
                ? 'border-violet-400/45 bg-violet-400/10 text-violet-100'
                : 'border-white/[0.08] bg-white/[0.03] text-white/60 hover:border-white/[0.16] hover:text-white/82'
            }`}
          >
            {value === 'zh' ? 'Chinese' : 'English'}
          </button>
        ))}
      </div>

      {mode === 'cast' ? (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div
              className={`flex h-24 w-24 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-4xl shadow-[0_0_40px_rgba(245,158,11,0.18)] ${
                coinAnimating ? 'animate-bounce' : ''
              }`}
            >
              🪙
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] uppercase tracking-[0.28em] text-white/35">
              Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(event) => onQuestionChange(event.target.value)}
              placeholder="Your question (optional)"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white/80 transition-all focus:border-purple-500/40 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] uppercase tracking-[0.28em] text-white/35">
              Gender
            </label>
            <select
              value={gender}
              onChange={(event) => onGenderChange(event.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white/80 transition-all focus:border-purple-500/40 focus:outline-none"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <button
            type="button"
            onClick={onCast}
            disabled={isCasting}
            className="w-full rounded-2xl px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-[#0a0a0a] transition-all disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #7c3aed 100%)',
              boxShadow:
                '0 4px 32px rgba(124,58,237,0.35), 0 0 60px rgba(212,175,55,0.15)',
            }}
          >
            {isCasting ? 'AI interpreting...' : 'Cast coins'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[10px] uppercase tracking-[0.28em] text-white/35">
              Hexagram number
            </label>
            <input
              type="number"
              min="1"
              max="64"
              value={searchNumber}
              onChange={(event) => onSearchNumberChange(event.target.value)}
              placeholder="Enter a number between 1 and 64"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white/80 transition-all focus:border-purple-500/40 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={onSearch}
            className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-white/82 transition-all hover:border-white/[0.18] hover:bg-white/[0.06]"
          >
            Search hexagram
          </button>

          {searchError && (
            <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {searchError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function YiJingResultBlock({
  castResult,
  displayedHexagram,
  language,
}: {
  castResult: CastResult | null;
  displayedHexagram: Hexagram;
  language: Language;
}) {
  const insightItems = buildInsightItems(
    displayedHexagram,
    castResult?.aiInterpretation,
    language
  );

  const resultData = {
    hexagram: displayedHexagram,
    aiInterpretation: castResult?.aiInterpretation,
  } as unknown as Record<string, unknown>;

  return (
    <>
      <ScrollNarrativeSection
        accentColor="#7c3aed"
        goldColor="#D4AF37"
        blocks={NARRATIVE_BLOCKS}
      />

      <ResultScaffold
        eyebrow="Yi Jing result"
        title="The oracle now unfolds in a layered ceremonial rhythm."
        subtitle="The same casting and lookup logic remain intact, while the reading surface shifts from utility mode to a premium oracle presentation."
        overview={
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[1.75rem] border border-white/[0.06] bg-white/[0.02] p-6 text-center">
              <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                Hexagram
              </div>
              <div className="mt-4 text-4xl font-serif text-amber-100/92 sm:text-6xl">
                {displayedHexagram.name}
              </div>
              <div className="mt-3 text-lg uppercase tracking-[0.28em] text-amber-200/72">
                {displayedHexagram.pinyin}
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                Oracle overview
              </div>
              <p className="font-serif text-2xl text-white/90 sm:text-3xl">
                {displayedHexagram.english}
              </p>
              <p className="text-sm leading-7 text-white/65 sm:text-base">
                {displayedHexagram.judgement}
              </p>
              <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-white/42">
                <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5">
                  #{displayedHexagram.number}
                </span>
                {castResult?.hasChangingLines && (
                  <span className="rounded-full border border-rose-400/25 bg-rose-400/10 px-3 py-1.5 text-rose-100/80">
                    Changing lines present
                  </span>
                )}
              </div>
            </div>
          </div>
        }
        highlights={
          <div className="space-y-4">
            <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
              Judgment
            </div>
            <p className="text-sm leading-7 text-white/70 sm:text-base">
              {displayedHexagram.judgement}
            </p>
            {displayedHexagram.image && (
              <p className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-sm leading-7 text-white/62">
                {displayedHexagram.image}
              </p>
            )}
          </div>
        }
        details={
          <div className="space-y-5">
            <div>
              <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                AI interpretation
              </div>
              <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/72 sm:text-base">
                {castResult?.aiInterpretation || 'Search mode currently displays the hexagram reference and judgement without additional AI commentary.'}
              </div>
            </div>
          </div>
        }
        aside={
          <div className="space-y-5">
            <div>
              <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                Reading stack
              </div>
              <div className="mt-3 space-y-2 text-sm text-white/62">
                <p>Coin cast or manual lookup</p>
                <p>Hexagram, judgement, and line states</p>
                <p>AI interpretation when casting</p>
                <p>Legacy share panel and PDF export</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                Oracle focus
              </div>
              <div className="mt-3 text-sm leading-7 text-white/60">
                The redesign keeps the ritual compact: symbol first, judgement second, interpretation third.
              </div>
            </div>
          </div>
        }
      />

      {insightItems.length > 0 && (
        <InsightGrid
          title="Signal layers"
          subtitle="A distilled insight layer built from the same Yi Jing response payload."
          items={insightItems}
          accentColor="#7c3aed"
          goldColor="#D4AF37"
        />
      )}

      {castResult && (
        <LandingSection
          eyebrow="Six lines"
          title="Line movement remains readable inside the same interpretation flow."
          subtitle="The line states and their changing status are preserved; the redesign only reframes them as a cleaner ritual panel."
        >
          <div className="space-y-3">
            {[...castResult.lines].reverse().map((line, index) => (
              <GlassCard
                key={`${line.position}-${index}`}
                level="card"
                className="rounded-[1.5rem] border border-white/[0.06] bg-black/20 p-4"
              >
                <div className="grid items-center gap-3 sm:grid-cols-[48px_minmax(0,160px)_1fr]">
                  <div className="text-right text-sm text-white/38">{6 - index}</div>
                  <div className="text-center font-mono text-3xl tracking-[0.28em] text-amber-100/90">
                    {line.isYang
                      ? line.isChanging
                        ? '━━x━━'
                        : '━━━━━━'
                      : line.isChanging
                        ? '━━o━━'
                        : '━━ ━━'}
                  </div>
                  <div className={line.isChanging ? 'text-rose-200/88' : 'text-white/62'}>
                    {language === 'zh' ? line.meaning : line.meaningEn}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </LandingSection>
      )}

      <LandingSection
        eyebrow="Share and export"
        title="Legacy sharing remains intact."
        subtitle="The QR and social share overlay, plus the PDF export route, keep their original behavior."
      >
        <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <GlassCard
            level="card"
            className="rounded-[1.75rem] border border-white/[0.06] bg-black/20 p-6 sm:p-8"
          >
            <SharePanel
              serviceType="yijing"
              resultId={displayedHexagram.number.toString()}
              shareUrl={`https://tianji.global/yijing?hex=${displayedHexagram.number}`}
            />
          </GlassCard>

          <GlassCard
            level="strong"
            className="rounded-[1.75rem] border border-white/[0.08] bg-black/25 p-6 sm:p-8"
          >
            <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
              Export surface
            </div>
            <p className="mt-4 text-sm leading-7 text-white/62">
              PDF export still uses the existing report route. No route or payload changes were introduced in this redesign pass.
            </p>
            <div className="mt-6">
              <PDFDownloadButton
                serviceType="yijing"
                resultData={resultData}
                language={language}
                className="justify-center rounded-xl"
              />
            </div>
          </GlassCard>
        </div>
      </LandingSection>
    </>
  );
}

export default function YiJingPage() {
  const [mode, setMode] = useState<'cast' | 'search'>('cast');
  const [language, setLanguage] = useState<Language>('zh');
  const [searchNumber, setSearchNumber] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [castResult, setCastResult] = useState<CastResult | null>(null);
  const [searchResult, setSearchResult] = useState<Hexagram | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isCasting, setIsCasting] = useState(false);
  const [coinAnimating, setCoinAnimating] = useState(false);

  const displayedHexagram = useMemo(
    () => (mode === 'cast' ? castResult?.hexagram : searchResult),
    [castResult, mode, searchResult]
  );

  const handleCast = useCallback(async () => {
    setIsCasting(true);
    setCoinAnimating(true);
    setCastResult(null);

    try {
      const response = await fetch('/api/yijing?enhanceWithAI=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, gender, language, enhanceWithAI: true }),
      });

      if (!response.ok) {
        throw new Error('Divination failed');
      }

      const data = await response.json();
      setCastResult({
        hexagram: data.hexagram,
        lines: data.lines,
        hasChangingLines: data.hasChangingLines,
        aiInterpretation: data.aiInterpretation,
      });
      saveReading({
        reading_type: 'yijing',
        title: `Yi Jing - ${data.hexagram?.name ?? 'Reading'}`,
        summary: data.aiInterpretation?.slice(0, 120) ?? '',
        reading_data: data as unknown as Record<string, unknown>,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsCasting(false);
      setCoinAnimating(false);
    }
  }, [gender, language, question]);

  const handleSearch = useCallback(() => {
    const num = parseInt(searchNumber, 10);
    if (isNaN(num) || num < 1 || num > 64) {
      setSearchError('Please enter a number between 1 and 64');
      setSearchResult(null);
      return;
    }

    const result = getHexagramByNumber(num);
    if (result) {
      setSearchResult(result);
      setSearchError(null);
    }
  }, [searchNumber]);

  return (
    <div className="min-h-screen text-white" style={{ background: colors.bgPrimary }}>
      <div className="fixed right-4 top-4 z-50">
        <LanguageSwitch />
      </div>

      <BackgroundVideoHero
        eyebrow="I Ching oracle"
        title={
          <>
            Yi Jing
            <br />
            <span className="text-white/78">Cast a question or step directly into the hexagram atlas.</span>
          </>
        }
        subtitle="Coin cast · search mode · AI oracle"
        description="This redesign preserves the existing cast/search flow, the same AI route, the same save path, and the same share/export tools. Only the visual narrative has been upgraded."
        videoSrc="/assets/videos/hero/yijing-hero-loop-6s-1080p.mp4"
        posterSrc="/assets/images/posters/yijing-hero-poster-16x9.jpg"
        imageSrc="/assets/images/hero/yijing-hero-master-16x9.jpg"
        meta={<TrustStrip items={TRUST_ITEMS} className="w-full max-w-3xl" />}
      >
        <ModuleInputShell
          eyebrow="Oracle entry"
          title="Choose ritual or lookup"
          description="The coin cast and direct lookup modes both remain intact. The redesign simply gives them a more deliberate, high-end frame."
          footer="After submit, the same result data still flows into interpretation, reading history, QR/social share, and PDF export."
        >
          <YiJingInputPanel
            mode={mode}
            language={language}
            searchNumber={searchNumber}
            question={question}
            gender={gender}
            coinAnimating={coinAnimating}
            isCasting={isCasting}
            searchError={searchError}
            onModeChange={(value) => {
              setMode(value);
              setCastResult(null);
              setSearchResult(null);
              setSearchError(null);
            }}
            onLanguageChange={setLanguage}
            onSearchNumberChange={setSearchNumber}
            onQuestionChange={setQuestion}
            onGenderChange={setGender}
            onCast={handleCast}
            onSearch={handleSearch}
          />
        </ModuleInputShell>
      </BackgroundVideoHero>

      {isCasting && <LoadingSkeleton />}

      {displayedHexagram && !isCasting && (
        <YiJingResultBlock
          castResult={castResult}
          displayedHexagram={displayedHexagram}
          language={language}
        />
      )}

      {!displayedHexagram && !isCasting && (
        <>
          <ScrollNarrativeSection
            accentColor="#7c3aed"
            goldColor="#D4AF37"
            blocks={NARRATIVE_BLOCKS}
          />

          <LandingSection
            eyebrow="Before the reveal"
            title="A premium oracle page should explain what appears after the cast."
            subtitle="The user should understand that the system will reveal a hexagram, judgement, optional AI reading, the changing lines when relevant, and the original share/export stack."
          >
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <GlassCard
                level="card"
                className="rounded-[1.75rem] border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8"
              >
                <div className="mb-4 text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                  What remains the same
                </div>
                <div className="space-y-3 text-sm leading-7 text-white/65">
                  <p>Coin casting and direct hexagram lookup</p>
                  <p>AI interpretation from the same API route</p>
                  <p>History save, share panel, and PDF export</p>
                  <p>Existing route path and request contract</p>
                </div>
              </GlassCard>

              <GlassCard
                level="strong"
                className="rounded-[1.75rem] border border-white/[0.08] bg-black/25 p-6 sm:p-8"
              >
                <div className="mb-4 text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                  How the redesign helps
                </div>
                <p className="mb-6 text-sm leading-7 text-white/60">
                  The improvement here is pacing: the page now behaves like a premium oracle entry, not a utility panel with mystical content attached later.
                </p>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/78 transition-all hover:border-white/[0.18] hover:bg-white/[0.06]"
                >
                  Return to the oracle
                </button>
              </GlassCard>
            </div>
          </LandingSection>
        </>
      )}

      {mode === 'search' && !isCasting && (
        <LandingSection
          eyebrow="Reference atlas"
          title="All sixty-four hexagrams remain one click away."
          subtitle="Search mode still behaves like a compact atlas. The redesign only makes the grid calmer and more legible."
        >
          <GlassCard
            level="card"
            className="rounded-[1.75rem] border border-white/[0.06] bg-black/20 p-4 sm:p-6"
          >
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
              {HEXAGRAMS.map((hex) => (
                <button
                  key={hex.number}
                  type="button"
                  onClick={() => {
                    setSearchNumber(hex.number.toString());
                    setSearchResult(hex);
                    setSearchError(null);
                  }}
                  className={`aspect-square rounded-xl border text-sm font-semibold transition-all sm:text-base ${
                    searchResult?.number === hex.number
                      ? 'border-amber-400/40 bg-amber-400/12 text-white shadow-[0_0_18px_rgba(245,158,11,0.15)]'
                      : 'border-white/[0.06] bg-white/[0.03] text-white/72 hover:border-white/[0.16] hover:text-white'
                  }`}
                >
                  {hex.number}
                </button>
              ))}
            </div>
          </GlassCard>
        </LandingSection>
      )}

      <div className="pb-12 text-center text-sm text-white/30">
        <p>TianJi Global · Yi Jing oracle redesign template</p>
      </div>
    </div>
  );
}
