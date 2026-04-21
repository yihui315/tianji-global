'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedShareButton from '@/components/AnimatedShareButton';
import BaziWheelAnimation from '@/components/animations/BaziWheelAnimation';
import BaZiChat from '@/components/chat/BaZiChat';
import PDFDownloadButton from '@/components/PDFDownloadButton';
import SharePanel from '@/components/SharePanel';
import FortuneWheel from '@/components/widgets/FortuneWheel';
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
import { GlassCard, LanguageSwitch } from '@/components/ui';
import { colors } from '@/design-system';
import { saveReading } from '@/lib/save-reading';

type Language = 'zh' | 'en';
type Gender = 'male' | 'female';

interface BaZiChart {
  year: { heavenlyStem: string; earthlyBranch: string; element: string };
  month: { heavenlyStem: string; earthlyBranch: string; element: string };
  day: { heavenlyStem: string; earthlyBranch: string; element: string };
  hour: { heavenlyStem: string; earthlyBranch: string; element: string };
  dayMasterElement: string;
}

interface AiMeta {
  provider: string;
  model: string;
  latencyMs: number;
  costUSD: number;
}

interface BaZiResponse {
  chart: BaZiChart;
  interpretation: string;
  aiInterpretation?: string;
  disclaimer?: string;
  aiMeta?: AiMeta;
  aiError?: string;
  birthDate?: string;
  gender?: Gender;
}

const TIME_PERIODS = [
  { value: 0, label: 'Zi (23:00-00:59)' },
  { value: 1, label: 'Chou (01:00-02:59)' },
  { value: 2, label: 'Yin (03:00-04:59)' },
  { value: 3, label: 'Mao (05:00-06:59)' },
  { value: 4, label: 'Chen (07:00-08:59)' },
  { value: 5, label: 'Si (09:00-10:59)' },
  { value: 6, label: 'Wu (11:00-12:59)' },
  { value: 7, label: 'Wei (13:00-14:59)' },
  { value: 8, label: 'Shen (15:00-16:59)' },
  { value: 9, label: 'You (17:00-18:59)' },
  { value: 10, label: 'Xu (19:00-20:59)' },
  { value: 11, label: 'Hai (21:00-22:59)' },
];

const ELEMENT_COLORS: Record<string, string> = {
  Wood: 'text-emerald-300',
  Fire: 'text-rose-300',
  Earth: 'text-amber-300',
  Metal: 'text-slate-200',
  Water: 'text-cyan-300',
};

const ELEMENT_BAR_COLORS: Record<string, string> = {
  Wood: '#34d399',
  Fire: '#fb7185',
  Earth: '#fbbf24',
  Metal: '#cbd5e1',
  Water: '#22d3ee',
};

const ELEMENT_LABELS: Record<Language, Record<string, string>> = {
  zh: {
    Wood: 'Wood',
    Fire: 'Fire',
    Earth: 'Earth',
    Metal: 'Metal',
    Water: 'Water',
  },
  en: {
    Wood: 'Wood',
    Fire: 'Fire',
    Earth: 'Earth',
    Metal: 'Metal',
    Water: 'Water',
  },
};

const PILLAR_LABELS: Record<Language, Record<'year' | 'month' | 'day' | 'hour', string>> = {
  zh: {
    year: 'Year Pillar',
    month: 'Month Pillar',
    day: 'Day Pillar',
    hour: 'Hour Pillar',
  },
  en: {
    year: 'Year Pillar',
    month: 'Month Pillar',
    day: 'Day Pillar',
    hour: 'Hour Pillar',
  },
};

const NARRATIVE_BLOCKS = [
  {
    label: '01 Four pillars',
    heading: 'The chart opens as a structural map, not a vague horoscope.',
    body: 'Ba Zi starts with four pillars, elemental balance, and the day master. The redesign keeps the same calculation flow but presents it with more hierarchy, more negative space, and stronger narrative pacing.',
  },
  {
    label: '02 Element rhythm',
    heading: 'Five-element balance becomes instantly readable.',
    body: 'Instead of burying the elemental signal inside dense cards, the new layout stages it as a luxury dashboard: overview first, then strengths, then the deeper AI reading and conversation layer.',
  },
  {
    label: '03 Guided depth',
    heading: 'From chart to action, the reading unfolds in layers.',
    body: 'Career, love, wealth, and health stay in the same product flow. What changes here is the visual shell around them, so the module feels premium without breaking the existing Ba Zi engine.',
  },
];

const TRUST_ITEMS = [
  { label: 'Four-pillar chart', description: 'Same /api/bazi request and response shape' },
  { label: 'AI deep reading', description: 'Existing interpretation and meta stay intact' },
  { label: 'Chat + chart tools', description: 'BaZiChat, FortuneWheel, PDF, and share remain available' },
  { label: 'Save-ready', description: 'Still writes to the same reading history flow' },
];

function countElements(chart: BaZiChart): Record<string, number> {
  const counts: Record<string, number> = {
    Wood: 0,
    Fire: 0,
    Earth: 0,
    Metal: 0,
    Water: 0,
  };

  counts[chart.year.element] = (counts[chart.year.element] ?? 0) + 1;
  counts[chart.month.element] = (counts[chart.month.element] ?? 0) + 1;
  counts[chart.day.element] = (counts[chart.day.element] ?? 0) + 1;
  counts[chart.hour.element] = (counts[chart.hour.element] ?? 0) + 1;

  return counts;
}

function extractLead(result: BaZiResponse, language: Language) {
  const source = result.aiInterpretation || result.interpretation || '';
  const firstSentence = source
    .split(/[.!?\n。！？]/)
    .map((sentence) => sentence.trim())
    .find(Boolean);

  if (firstSentence) {
    return firstSentence;
  }

  return language === 'zh'
    ? 'Your Ba Zi chart is now arranged into a clear elemental structure.'
    : 'Your Ba Zi chart is now arranged into a clear elemental structure.';
}

function buildInsightItems(result: BaZiResponse, language: Language) {
  const sentences = (result.aiInterpretation || result.interpretation || '')
    .split(/[.!?\n。！？]/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, 6);

  const icons = ['✦', '✧', '◌', '✺', '✦', '✧'];

  if (!sentences.length) {
    return [
      {
        icon: '✦',
        label: language === 'zh' ? 'Core signal' : 'Core signal',
        value: result.interpretation,
      },
    ];
  }

  return sentences.map((sentence, index) => ({
    icon: icons[index % icons.length],
    label: `${language === 'zh' ? 'Insight' : 'Insight'} ${index + 1}`,
    value: sentence.length > 110 ? `${sentence.slice(0, 110)}...` : sentence,
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

function BaZiInputForm({
  birthday,
  birthTime,
  gender,
  language,
  onBirthdayChange,
  onBirthTimeChange,
  onGenderChange,
  onLanguageChange,
  onSubmit,
  onAiSubmit,
  loading,
  loadingAI,
}: {
  birthday: string;
  birthTime: number;
  gender: Gender;
  language: Language;
  onBirthdayChange: (value: string) => void;
  onBirthTimeChange: (value: number) => void;
  onGenderChange: (value: Gender) => void;
  onLanguageChange: (value: Language) => void;
  onSubmit: () => void;
  onAiSubmit: () => void;
  loading: boolean;
  loadingAI: boolean;
}) {
  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1.5 block text-[10px] uppercase tracking-[0.28em] text-white/35">
          Birth date
        </label>
        <input
          type="date"
          value={birthday}
          onChange={(event) => onBirthdayChange(event.target.value)}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white/80 transition-all focus:border-purple-500/40 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-[10px] uppercase tracking-[0.28em] text-white/35">
          Birth hour
        </label>
        <select
          value={birthTime}
          onChange={(event) => onBirthTimeChange(Number(event.target.value))}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white/80 transition-all focus:border-purple-500/40 focus:outline-none"
        >
          {TIME_PERIODS.map((period) => (
            <option key={period.value} value={period.value}>
              {period.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[10px] uppercase tracking-[0.28em] text-white/35">
            Gender
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['male', 'female'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onGenderChange(value)}
                className={`rounded-xl border px-3 py-2.5 text-sm transition-all ${
                  gender === value
                    ? 'border-amber-400/50 bg-amber-400/12 text-amber-100'
                    : 'border-white/[0.08] bg-white/[0.03] text-white/60 hover:border-white/[0.16] hover:text-white/82'
                }`}
              >
                {value === 'male' ? 'Male' : 'Female'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] uppercase tracking-[0.28em] text-white/35">
            Output language
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['zh', 'en'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onLanguageChange(value)}
                className={`rounded-xl border px-3 py-2.5 text-sm transition-all ${
                  language === value
                    ? 'border-violet-400/45 bg-violet-400/12 text-violet-100'
                    : 'border-white/[0.08] bg-white/[0.03] text-white/60 hover:border-white/[0.16] hover:text-white/82'
                }`}
              >
                {value === 'zh' ? 'Chinese' : 'English'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 pt-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-white/78 transition-all hover:border-white/[0.18] hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading && !loadingAI ? 'Calculating...' : 'Chart only'}
        </button>
        <button
          type="button"
          onClick={onAiSubmit}
          disabled={loading}
          className="rounded-2xl px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-[#0a0a0a] transition-all disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #D4AF37 0%, #7c3aed 100%)',
            boxShadow:
              '0 4px 32px rgba(124,58,237,0.35), 0 0 60px rgba(212,175,55,0.15)',
          }}
        >
          {loadingAI ? 'AI reading...' : 'AI deep read'}
        </button>
      </div>
    </div>
  );
}

function ResultBlock({
  result,
  birthday,
  birthTime,
  gender,
  language,
  elementCounts,
}: {
  result: BaZiResponse;
  birthday: string;
  birthTime: number;
  gender: Gender;
  language: Language;
  elementCounts: Record<string, number>;
}) {
  const pillarLabels = PILLAR_LABELS[language];
  const elementLabels = ELEMENT_LABELS[language];
  const lead = extractLead(result, language);
  const insightItems = buildInsightItems(result, language);
  const selectedTimePeriod = TIME_PERIODS[birthTime] ?? TIME_PERIODS[2];
  const shareData = {
    chart: result.chart,
    birthday,
    birthTime: selectedTimePeriod.label,
    language,
  };

  const radarData = {
    career: 72,
    love: 68,
    wealth: 65,
    health: 78,
    date: birthday,
  };

  return (
    <>
      <ScrollNarrativeSection
        accentColor="#7c3aed"
        goldColor="#D4AF37"
        blocks={NARRATIVE_BLOCKS}
      />

      <ResultScaffold
        eyebrow="Ba Zi result"
        title="The chart is now staged like a premium reading room."
        subtitle="The same data contract remains intact. This redesign only changes how the pillars, elements, interpretation, and share tools are layered for readability."
        overview={
          <div className="space-y-6">
            <div>
              <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                Overview
              </div>
              <p className="mt-3 max-w-3xl font-serif text-2xl text-white/90 sm:text-3xl">
                {lead}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              {(
                [
                  ['year', result.chart.year],
                  ['month', result.chart.month],
                  ['day', result.chart.day],
                  ['hour', result.chart.hour],
                ] as const
              ).map(([key, pillar]) => (
                <div
                  key={key}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-center"
                >
                  <div className="text-[10px] uppercase tracking-[0.24em] text-white/35">
                    {pillarLabels[key]}
                  </div>
                  <div className="mt-4 text-3xl font-semibold text-white/90">
                    {pillar.heavenlyStem}
                  </div>
                  <div className="mt-1 text-2xl text-amber-200/85">{pillar.earthlyBranch}</div>
                  <div
                    className={`mt-3 text-xs uppercase tracking-[0.2em] ${
                      ELEMENT_COLORS[pillar.element] ?? 'text-white/65'
                    }`}
                  >
                    {elementLabels[pillar.element] ?? pillar.element}
                  </div>
                </div>
              ))}
            </div>
          </div>
        }
        highlights={
          <div className="space-y-4">
            <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
              Element balance
            </div>
            <div className="space-y-3">
              {Object.entries(elementCounts).map(([element, count]) => {
                const width = `${(count / 4) * 100}%`;
                return (
                  <div key={element} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className={ELEMENT_COLORS[element] ?? 'text-white/70'}>
                        {elementLabels[element] ?? element}
                      </span>
                      <span className="text-white/45">{count}/4</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width,
                          background: ELEMENT_BAR_COLORS[element] ?? '#a78bfa',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        }
        details={
          <div className="space-y-5">
            <div>
              <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                Interpretation
              </div>
              <p className="mt-3 text-sm leading-7 text-white/68 sm:text-base">
                {result.interpretation}
              </p>
            </div>

            {result.aiInterpretation && (
              <div className="border-t border-white/[0.06] pt-5">
                <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                  AI deep reading
                </div>
                <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/72 sm:text-base">
                  {result.aiInterpretation}
                </div>
              </div>
            )}

            {result.disclaimer && (
              <p className="border-t border-white/[0.06] pt-4 text-[11px] italic text-white/28">
                {result.disclaimer}
              </p>
            )}
          </div>
        }
        aside={
          <div className="space-y-5">
            <div>
              <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                Day master
              </div>
              <div className="mt-4 text-4xl font-serif text-amber-200/90">
                {result.chart.day.heavenlyStem}
              </div>
              <div
                className={`mt-2 text-sm uppercase tracking-[0.24em] ${
                  ELEMENT_COLORS[result.chart.dayMasterElement] ?? 'text-white/70'
                }`}
              >
                {elementLabels[result.chart.dayMasterElement] ?? result.chart.dayMasterElement}
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                Reading stack
              </div>
              <div className="mt-3 space-y-2 text-sm text-white/62">
                <p>Four-pillar layout</p>
                <p>Five-element balance</p>
                <p>Fortune radar + animated wheel</p>
                <p>Chat, PDF, save, and share tools</p>
              </div>
            </div>

            {result.aiMeta && (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                  AI meta
                </div>
                <div className="mt-3 space-y-2 text-sm text-white/60">
                  <p>Provider: {result.aiMeta.provider}</p>
                  <p>Model: {result.aiMeta.model}</p>
                  <p>Latency: {result.aiMeta.latencyMs} ms</p>
                </div>
              </div>
            )}
          </div>
        }
      />

      <InsightGrid
        title="Key insight layers"
        subtitle="A distilled reading surface generated from the same interpretation payload."
        items={insightItems}
        accentColor="#7c3aed"
        goldColor="#D4AF37"
      />

      <LandingSection
        eyebrow="Fortune radar"
        title="Four-dimensional signals stay inside the same flow."
        subtitle="Career, love, wealth, and health remain exactly where users expect them. The redesign upgrades the presentation, not the product contract."
      >
        <GlassCard
          level="card"
          className="mx-auto max-w-4xl rounded-[1.75rem] border border-white/[0.06] bg-black/20 p-6 sm:p-8"
        >
          <FortuneWheel data={radarData} language={language} />
        </GlassCard>
      </LandingSection>

      <LandingSection
        eyebrow="Animated chart"
        title="The wheel becomes a cinematic centerpiece, not a side utility."
        subtitle="The existing animation and export flow remain intact, now staged inside a richer luxury shell."
      >
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <GlassCard
            level="card"
            className="rounded-[1.75rem] border border-white/[0.06] bg-black/20 p-6 sm:p-8"
          >
            <div className="flex justify-center">
              <BaziWheelAnimation
                birthDate={birthday}
                birthTime={`${String((birthTime * 2 + 23) % 24).padStart(2, '0')}:00`}
                width={420}
                height={420}
                playing
              />
            </div>
          </GlassCard>

          <GlassCard
            level="strong"
            className="rounded-[1.75rem] border border-white/[0.08] bg-black/25 p-6 sm:p-8"
          >
            <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
              Export stack
            </div>
            <p className="mt-4 text-sm leading-7 text-white/62">
              The animated share card, PDF export, and history save flow are unchanged. This section only gives them stronger pacing and a cleaner hierarchy.
            </p>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <AnimatedShareButton
                type="bazi"
                resultData={shareData}
                format="webp"
                language={language}
                variant="primary"
              />
              <AnimatedShareButton
                type="bazi"
                resultData={shareData}
                format="png"
                language={language}
                variant="secondary"
              />
              <PDFDownloadButton
                serviceType="bazi"
                resultData={result as unknown as Record<string, unknown>}
                birthData={{
                  birthday,
                  birthTime: selectedTimePeriod.label,
                  gender,
                }}
                language={language}
                className="justify-center rounded-xl"
              />
            </div>
          </GlassCard>
        </div>
      </LandingSection>

      <LandingSection
        eyebrow="Multi-turn guidance"
        title="The Ba Zi chat remains intact, now framed as a premium continuation."
        subtitle="No endpoint changes, no auth changes, no request shape changes. It is the same chat tool inside a more intentional reading room."
      >
        <GlassCard
          level="card"
          className="rounded-[1.75rem] border border-white/[0.06] bg-black/20 p-4 sm:p-6"
        >
          <BaZiChat
            birthDate={birthday}
            birthTime={`${String((birthTime * 2 + 23) % 24).padStart(2, '0')}:00`}
            gender={gender}
            language={language}
            baziChart={{
              dayHeavenlyStem: result.chart.day.heavenlyStem,
              dayMasterElement: result.chart.dayMasterElement,
              year: result.chart.year.heavenlyStem,
              month: result.chart.month.heavenlyStem,
              day: result.chart.day.heavenlyStem,
              hour: result.chart.hour.heavenlyStem,
            }}
          />
        </GlassCard>
      </LandingSection>

      <LandingSection
        eyebrow="Share panel"
        title="Legacy share tools remain available."
        subtitle="The QR and social share overlay is preserved exactly as before, so no external share behavior changes."
      >
        <div className="mx-auto max-w-3xl">
          <SharePanel
            serviceType="bazi"
            resultId={birthday.replace(/-/g, '')}
            shareUrl={`https://tianji.global/bazi?birthday=${birthday}`}
          />
        </div>
      </LandingSection>

      <ShareSection
        type="bazi"
        resultData={shareData}
              ogBgSrc="/assets/images/og/bazi-og-bg-1200x630.jpg"
        accentColor="#7c3aed"
        goldColor="#D4AF37"
      />
    </>
  );
}

export default function BaZiPage() {
  const [birthday, setBirthday] = useState('2000-08-16');
  const [birthTime, setBirthTime] = useState(2);
  const [gender, setGender] = useState<Gender>('male');
  const [language, setLanguage] = useState<Language>('zh');
  const [result, setResult] = useState<BaZiResponse | null>(null);
  const [elementCounts, setElementCounts] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState('');

  const selectedTimePeriod = useMemo(
    () => TIME_PERIODS[birthTime] ?? TIME_PERIODS[2],
    [birthTime]
  );

  const handleCalculate = useCallback(
    async (withAI: boolean) => {
      setLoading(true);
      setError('');
      setResult(null);

      try {
        const hour = birthTime * 2 + 23;

        const response = await fetch('/api/bazi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            birthday,
            birthTime: `${String(hour % 24).padStart(2, '0')}:00`,
            gender,
            language,
            enhanceWithAI: withAI,
          }),
        });

        const json: BaZiResponse = await response.json();
        if (!response.ok) {
          throw new Error(json.aiError || json.interpretation || 'Calculation failed');
        }

        setResult(json);
        setElementCounts(countElements(json.chart));
        saveReading({
          reading_type: 'bazi',
          title: `${json.birthDate ?? birthday} ${json.gender === 'female' ? 'Female' : 'Male'} Ba Zi Reading`,
          summary: json.interpretation?.slice(0, 120) ?? '',
          reading_data: json as unknown as Record<string, unknown>,
        });
      } catch (value) {
        setError(value instanceof Error ? value.message : 'An error occurred');
      } finally {
        setLoading(false);
        setLoadingAI(false);
      }
    },
    [birthday, birthTime, gender, language]
  );

  return (
    <div className="min-h-screen text-white" style={{ background: colors.bgPrimary }}>
      <div className="fixed right-4 top-4 z-50">
        <LanguageSwitch />
      </div>

      <BackgroundVideoHero
        eyebrow="Four pillars of destiny"
        title={
          <>
            Ba Zi
            <br />
            <span className="text-white/78">Decode structure before interpretation.</span>
          </>
        }
        subtitle="Four pillars · five elements · AI reading"
        description="The form, endpoint, save flow, chat tool, PDF export, and share stack stay exactly the same. This redesign only upgrades the visual shell around the Ba Zi experience."
        videoSrc="/assets/videos/hero/bazi-hero-loop-6s-1080p.mp4"
        posterSrc="/assets/images/posters/bazi-hero-poster-16x9.jpg"
        imageSrc="/assets/images/hero/bazi-hero-master-16x9.jpg"
        meta={<TrustStrip items={TRUST_ITEMS} className="w-full max-w-3xl" />}
      >
        <ModuleInputShell
          eyebrow="Fast entry"
          title="Read your pillars in one pass"
          description="Keep the original /api/bazi submission and the same field set. The redesign only improves rhythm, readability, and motion."
          footer="After submit, the page still reveals the chart, AI interpretation, chat, share, and PDF actions."
        >
          <BaZiInputForm
            birthday={birthday}
            birthTime={birthTime}
            gender={gender}
            language={language}
            onBirthdayChange={setBirthday}
            onBirthTimeChange={setBirthTime}
            onGenderChange={setGender}
            onLanguageChange={setLanguage}
            onSubmit={() => handleCalculate(false)}
            onAiSubmit={() => {
              setLoadingAI(true);
              void handleCalculate(true);
            }}
            loading={loading}
            loadingAI={loadingAI}
          />
        </ModuleInputShell>
      </BackgroundVideoHero>

      {error && (
        <div className="mx-auto max-w-4xl px-6 py-8 sm:px-8">
          <GlassCard
            level="card"
            className="rounded-[1.5rem] border border-rose-500/30 bg-rose-500/10 p-4 text-rose-100"
          >
            {error}
          </GlassCard>
        </div>
      )}

      {loading && <LoadingSkeleton />}

      {result && elementCounts && !loading && (
        <ResultBlock
          result={result}
          birthday={birthday}
          birthTime={birthTime}
          gender={gender}
          language={language}
          elementCounts={elementCounts}
        />
      )}

      {!result && !loading && (
        <>
          <ScrollNarrativeSection
            accentColor="#7c3aed"
            goldColor="#D4AF37"
            blocks={NARRATIVE_BLOCKS}
          />

          <LandingSection
            eyebrow="Before the reading"
            title="A luxury Ba Zi page should clarify what unfolds after submit."
            subtitle="Before any result appears, the page should communicate that the system will reveal structure, elemental balance, a deep AI interpretation, and follow-up tools without changing the underlying product flow."
          >
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <GlassCard
                level="card"
                className="rounded-[1.75rem] border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8"
              >
                <div className="mb-4 text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                  What opens after submit
                </div>
                <div className="space-y-3 text-sm leading-7 text-white/65">
                  <p>Four pillars and element map</p>
                  <p>AI deep interpretation and disclaimer/meta</p>
                  <p>Fortune radar and animated export surface</p>
                  <p>Chat, save history, PDF, and share flow</p>
                </div>
              </GlassCard>

              <GlassCard
                level="strong"
                className="rounded-[1.75rem] border border-white/[0.08] bg-black/25 p-6 sm:p-8"
              >
                <div className="mb-4 text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                  Ready state
                </div>
                <p className="mb-6 text-sm leading-7 text-white/60">
                  Nothing in the backend flow changes here. When users submit the form above, they still hit the same endpoint with the same payload and receive the same result structure.
                </p>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/78 transition-all hover:border-white/[0.18] hover:bg-white/[0.06]"
                >
                  Return to the form
                </button>
              </GlassCard>
            </div>
          </LandingSection>
        </>
      )}

      {!loading && (
        <div className="pb-12 text-center text-sm text-white/30">
          <p>TianJi Global · Ba Zi module redesign template</p>
          <p className="mt-1">Current time slot: {selectedTimePeriod.label}</p>
        </div>
      )}
    </div>
  );
}
