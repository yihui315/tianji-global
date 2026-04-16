'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import SharePanel from '@/components/SharePanel';
import PDFDownloadButton from '@/components/PDFDownloadButton';
import { saveReading } from '@/lib/save-reading';
import BaziWheelAnimation from '@/components/animations/BaziWheelAnimation';
import AnimatedShareButton from '@/components/AnimatedShareButton';
import { GlassCard, MysticButton, LanguageSwitch, SectionHeader } from '@/components/ui';
import { colors } from '@/design-system';
import BaZiChat from '@/components/chat/BaZiChat';
import FortuneWheel from '@/components/widgets/FortuneWheel';

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

const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ELEMENTS = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];
const ELEMENT_COLORS: Record<string, string> = {
  '木': 'text-green-500',
  '火': 'text-red-500',
  '土': 'text-yellow-600',
  '金': 'text-gray-400',
  '水': 'text-blue-500',
};

const TIME_PERIODS = [
  { value: 0, label: '子时 (23:00-00:59)', labelEn: 'Zi (23:00-00:59)' },
  { value: 1, label: '丑时 (01:00-02:59)', labelEn: 'Chou (01:00-02:59)' },
  { value: 2, label: '寅时 (03:00-04:59)', labelEn: 'Yin (03:00-04:59)' },
  { value: 3, label: '卯时 (05:00-06:59)', labelEn: 'Mao (05:00-06:59)' },
  { value: 4, label: '辰时 (07:00-08:59)', labelEn: 'Chen (07:00-08:59)' },
  { value: 5, label: '巳时 (09:00-10:59)', labelEn: 'Si (09:00-10:59)' },
  { value: 6, label: '午时 (11:00-12:59)', labelEn: 'Wu (11:00-12:59)' },
  { value: 7, label: '未时 (13:00-14:59)', labelEn: 'Wei (13:00-14:59)' },
  { value: 8, label: '申时 (15:00-16:59)', labelEn: 'Shen (15:00-16:59)' },
  { value: 9, label: '酉时 (17:00-18:59)', labelEn: 'You (17:00-18:59)' },
  { value: 10, label: '戌时 (19:00-20:59)', labelEn: 'Xu (19:00-20:59)' },
  { value: 11, label: '亥时 (21:00-22:59)', labelEn: 'Hai (21:00-22:59)' },
];

const ELEMENT_LABELS: Record<string, Record<string, string>> = {
  'zh': { '木': '木', '火': '火', '土': '土', '金': '金', '水': '水' },
  'en': { '木': 'Wood', '火': 'Fire', '土': 'Earth', '金': 'Metal', '水': 'Water' },
};

function yearStemIndex(year: number): number {
  return ((year - 4) % 10 + 10) % 10;
}

function yearBranchIndex(year: number): number {
  return ((year - 4) % 12 + 12) % 12;
}

function hourBranchIndex(hour: number): number {
  return Math.floor(((hour + 1) % 24) / 2);
}

function julianDayNumber(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yr = y + 4800 - a;
  const mo = m + 12 * a - 3;
  return d + Math.floor((153 * mo + 2) / 5) + 365 * yr +
    Math.floor(yr / 4) - Math.floor(yr / 100) + Math.floor(yr / 400) - 32045;
}

function buildPillar(stemIdx: number, branchIdx: number) {
  return {
    heavenlyStem: HEAVENLY_STEMS[stemIdx % 10],
    earthlyBranch: EARTHLY_BRANCHES[branchIdx % 12],
    element: ELEMENTS[stemIdx % 10],
  };
}

function calculateBaZi(year: number, month: number, day: number, hour: number): BaZiChart {
  const yearStem = yearStemIndex(year);
  const yearBranch = yearBranchIndex(year);

  const monthStem = ((yearStem % 5) * 2 + (month - 1)) % 10;
  const monthBranch = (month + 1) % 12;

  const jdn = julianDayNumber(year, month, day);
  const dayStem = ((jdn - 11) % 10 + 10) % 10;
  const dayBranch = ((jdn - 11) % 12 + 12) % 12;

  const hourBranch = hourBranchIndex(hour);
  const hourStem = ((dayStem % 5) * 2 + hourBranch) % 10;

  return {
    year: buildPillar(yearStem, yearBranch),
    month: buildPillar(monthStem, monthBranch),
    day: buildPillar(dayStem, dayBranch),
    hour: buildPillar(hourStem, hourBranch),
    dayMasterElement: ELEMENTS[dayStem % 10],
  };
}

function countElements(chart: BaZiChart): Record<string, number> {
  const counts: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  counts[chart.year.element]++;
  counts[chart.month.element]++;
  counts[chart.day.element]++;
  counts[chart.hour.element]++;
  return counts;
}

export default function BaZiPage() {
  const [birthday, setBirthday] = useState<string>('2000-08-16');
  const [birthTime, setBirthTime] = useState<number>(2);
  const [gender, setGender] = useState<Gender>('male');
  const [language, setLanguage] = useState<Language>('zh');
  const [result, setResult] = useState<BaZiResponse | null>(null);
  const [elementCounts, setElementCounts] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState('');

  const handleCalculate = useCallback(async (withAI: boolean) => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const [year, month, day] = birthday.split('-').map(Number);
      const hour = birthTime * 2 + 23;

      const res = await fetch('/api/bazi', {
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

      const json: BaZiResponse = await res.json();
      if (!res.ok) throw new Error(json.aiError || json.interpretation || 'Calculation failed');

      setResult(json);
      saveReading({
        reading_type: 'bazi',
        title: `${json.birthDate} ${json.gender === 'male' ? '男' : '女'} 八字命理`,
        summary: json.interpretation?.slice(0, 120) ?? '',
        reading_data: json as unknown as Record<string, unknown>,
      });
      setElementCounts(countElements(json.chart));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setLoadingAI(false);
    }
  }, [birthday, birthTime, gender, language]);

  const pillarLabels = {
    year: language === 'zh' ? '年柱' : 'Year',
    month: language === 'zh' ? '月柱' : 'Month',
    day: language === 'zh' ? '日柱' : 'Day',
    hour: language === 'zh' ? '时柱' : 'Hour',
  };

  return (
    <div className="mystic-page text-white min-h-screen" style={{ background: colors.bgPrimary }}>
      {/* Multi-layer Cosmic Background */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 0%, ${colors.bgNebula} 0%, transparent 55%)`, zIndex: 0 }} />
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 20% 20%, rgba(59,20,75,0.35) 0%, transparent 50%)', zIndex: 0 }} />
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 80% 80%, rgba(6,30,60,0.45) 0%, transparent 50%)', zIndex: 0 }} />
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(80,40,100,0.2) 0%, transparent 40%)', zIndex: 0 }} />

      <div className="fixed top-4 right-4 z-50"><LanguageSwitch /></div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-12 w-full">
        <SectionHeader
          title={language === 'zh' ? '八字命理' : 'Ba Zi'}
          subtitle={language === 'zh' ? '四柱命理 · Four Pillars of Destiny' : '四柱命理 · Four Pillars of Destiny'}
          badge="📊"
        />

        {/* Input Form */}
        <FadeInWhenVisible delay={0.1}>
        <GlassCard level="card" className="p-6 mb-6 border border-white/[0.06] bg-white/[0.015] rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Birthday */}
            <div>
              <label className="block text-xs font-serif text-white/40 mb-2 tracking-widest uppercase">
                {language === 'zh' ? '出生日期 / Birthday' : '出生日期 / Birthday'}
              </label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full rounded-xl px-3 py-3 text-sm text-white bg-white/[0.04] border border-white/[0.06] transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </div>

            {/* Birth Time */}
            <div>
              <label className="block text-xs font-serif text-white/40 mb-2 tracking-widest uppercase">
                {language === 'zh' ? '出生时辰 / Birth Hour' : '出生时辰 / Birth Hour'}
              </label>
              <select
                value={birthTime}
                onChange={(e) => setBirthTime(Number(e.target.value))}
                className="w-full rounded-xl px-3 py-3 text-sm text-white bg-white/[0.04] border border-white/[0.06] transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              >
                {TIME_PERIODS.map((period) => (
                  <option key={period.value} value={period.value}>
                    {language === 'zh' ? period.label : period.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-serif text-white/40 mb-2 tracking-widest uppercase">
                {language === 'zh' ? '性别 / Gender' : '性别 / Gender'}
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setGender('male')}
                  className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                    gender === 'male'
                      ? 'border-amber-500 bg-amber-500/20'
                      : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                  }`}
                >
                  {language === 'zh' ? '男 / Male' : '男 / Male'}
                </button>
                <button
                  onClick={() => setGender('female')}
                  className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                    gender === 'female'
                      ? 'border-amber-500 bg-amber-500/20'
                      : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                  }`}
                >
                  {language === 'zh' ? '女 / Female' : '女 / Female'}
                </button>
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-xs font-serif text-white/40 mb-2 tracking-widest uppercase">
                {language === 'zh' ? '显示语言 / Language' : '显示语言 / Language'}
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setLanguage('zh')}
                  className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                    language === 'zh'
                      ? 'border-amber-500 bg-amber-500/20'
                      : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                  }`}
                >
                  中文
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                    language === 'en'
                      ? 'border-amber-500 bg-amber-500/20'
                      : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <div className="flex gap-4">
            <MysticButton
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => handleCalculate(false)}
              disabled={loading}
            >
              {loading && !loadingAI ? (language === 'zh' ? '计算中...' : 'Calculating...') : (language === 'zh' ? '分析八字' : 'Calculate Ba Zi')}
            </MysticButton>
            <MysticButton
              variant="solid"
              size="lg"
              className="flex-1"
              onClick={() => { setLoadingAI(true); handleCalculate(true); }}
              disabled={loading}
            >
              {loadingAI ? (language === 'zh' ? 'AI解读中...' : 'AI Interpreting...') : (language === 'zh' ? '✨ AI 深度解读' : '✨ AI Deep Interpretation')}
            </MysticButton>
          </div>
        </GlassCard>
        </FadeInWhenVisible>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6 text-red-200">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Four Pillars Chart */}
            <FadeInWhenVisible delay={0.1}>
            <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.06]">
              <h2 className="text-lg font-serif font-bold mb-6 text-center text-amber-400/80">
                {language === 'zh' ? '四柱八字' : 'Four Pillars Chart'}
              </h2>

              {/* Pillar Headers */}
              <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                {(['year', 'month', 'day', 'hour'] as const).map((p) => (
                  <div key={p} className="text-amber-400 font-semibold text-sm">
                    {pillarLabels[p]}
                  </div>
                ))}
              </div>

              {/* Heavenly Stems */}
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[result.chart.year, result.chart.month, result.chart.day, result.chart.hour].map((pillar, i) => (
                  <div key={i} className="text-center bg-slate-700/30 rounded-lg py-3">
                    <span className="text-3xl font-bold text-amber-400">{pillar.heavenlyStem}</span>
                  </div>
                ))}
              </div>

              {/* Earthly Branches */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[result.chart.year, result.chart.month, result.chart.day, result.chart.hour].map((pillar, i) => (
                  <div key={i} className="text-center bg-slate-700/30 rounded-lg py-3">
                    <span className="text-3xl font-bold text-orange-400">{pillar.earthlyBranch}</span>
                  </div>
                ))}
              </div>

              {/* Elements Row */}
              <div className="grid grid-cols-4 gap-2">
                {[result.chart.year, result.chart.month, result.chart.day, result.chart.hour].map((pillar, i) => (
                  <div key={i} className="text-center bg-slate-700/30 rounded-lg py-2">
                    <span className={`text-lg font-semibold ${ELEMENT_COLORS[pillar.element]}`}>
                      {ELEMENT_LABELS[language][pillar.element]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            </FadeInWhenVisible>

            {/* Day Master */}
            <FadeInWhenVisible delay={0.15}>
            <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.06]">
              <h3 className="text-sm font-serif text-white/40 tracking-widest uppercase mb-4 text-center">
                {language === 'zh' ? '日主 (Day Master)' : '日主 (Day Master)'}
              </h3>
              <div className="text-center">
                <span className="text-5xl font-bold text-amber-400 mr-4">{result.chart.day.heavenlyStem}</span>
                <span className={`text-3xl font-bold ${ELEMENT_COLORS[result.chart.dayMasterElement]}`}>
                  {ELEMENT_LABELS[language][result.chart.dayMasterElement]}
                </span>
              </div>
              <p className="text-white/60 text-center mt-4">
                {language === 'zh'
                  ? `${result.chart.day.heavenlyStem}日主，属于${ELEMENT_LABELS['zh'][result.chart.dayMasterElement]}行`
                  : `Day Master ${result.chart.day.heavenlyStem}, ${ELEMENT_LABELS['en'][result.chart.dayMasterElement]} element`}
              </p>
            </div>
            </FadeInWhenVisible>

            {/* Five Elements Distribution */}
            {elementCounts && (
              <FadeInWhenVisible delay={0.2}>
              <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.06]">
                <h3 className="text-sm font-serif text-white/40 tracking-widest uppercase mb-6 text-center">
                  {language === 'zh' ? '五行分布' : 'Five Elements Distribution'}
                </h3>
                <div className="space-y-3">
                  {(['木', '火', '土', '金', '水'] as const).map((element) => {
                    const count = elementCounts[element];
                    const maxCount = 4;
                    const percentage = (count / maxCount) * 100;
                    return (
                      <div key={element} className="flex items-center gap-4">
                        <span className={`text-xl font-bold w-8 ${ELEMENT_COLORS[element]}`}>
                          {ELEMENT_LABELS[language][element]}
                        </span>
                        <div className="flex-1 bg-slate-700/50 rounded-full h-6 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              element === '木' ? 'bg-green-500' :
                              element === '火' ? 'bg-red-500' :
                              element === '土' ? 'bg-yellow-600' :
                              element === '金' ? 'bg-gray-400' :
                              'bg-blue-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-white/60 w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              </FadeInWhenVisible>
            )}

            {/* Interpretation */}
            <FadeInWhenVisible delay={0.25}>
            <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.06]">
              <h3 className="text-sm font-serif text-white/40 tracking-widest uppercase mb-4 text-center">
                {language === 'zh' ? '命理简析' : 'Brief Interpretation'}
              </h3>
              <p className="text-white/60 text-center leading-relaxed">
                {language === 'zh'
                  ? `您的日主为${result.chart.day.heavenlyStem}，属${ELEMENT_LABELS['zh'][result.chart.dayMasterElement]}行。${result.chart.year.heavenlyStem}年、${result.chart.month.heavenlyStem}月、${result.chart.day.heavenlyStem}日、${result.chart.hour.heavenlyStem}时，构成了独特的八字命盘。`
                  : `Your Day Master is ${result.chart.day.heavenlyStem}, belonging to the ${ELEMENT_LABELS['en'][result.chart.dayMasterElement]} element. The combination of ${result.chart.year.heavenlyStem} (Year), ${result.chart.month.heavenlyStem} (Month), ${result.chart.day.heavenlyStem} (Day), and ${result.chart.hour.heavenlyStem} (Hour) creates your unique Ba Zi chart.`}
              </p>
            </div>
            </FadeInWhenVisible>

            {/* AI Interpretation */}
            {result.aiInterpretation && (
              <FadeInWhenVisible delay={0.3}>
              <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.06]">
                <h3 className="text-sm font-serif text-white/40 tracking-widest uppercase mb-4 text-center">
                  {language === 'zh' ? '✨ AI 深度解读' : '✨ AI Deep Interpretation'}
                </h3>
                <p className="text-white/60 text-center leading-relaxed whitespace-pre-wrap">
                  {result.aiInterpretation}
                </p>
                {result.disclaimer && (
                  <p className="text-white/20 text-xs mt-4 italic">
                    {result.disclaimer}
                  </p>
                )}
                {result.aiMeta && (
                  <p className="text-white/15 text-xs mt-2">
                    {result.aiMeta.provider} · {result.aiMeta.model} · {result.aiMeta.latencyMs}ms
                  </p>
                )}
              </div>
              </FadeInWhenVisible>
            )}

            {result.aiError && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 text-red-200 text-sm">
                {language === 'zh' ? 'AI 解读失败' : 'AI Interpretation Failed'}: {result.aiError}
              </div>
            )}

            {/* Fortune Wheel - 四维图 */}
            <FadeInWhenVisible delay={0.32}>
            <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.06]">
              <h3 className="text-sm font-serif text-white/40 tracking-widest uppercase mb-4 text-center">
                {language === 'zh' ? '✨ 四维运势图' : '✨ Fortune Radar'}
              </h3>
              <FortuneWheel
                data={{
                  career: 72,
                  love: 68,
                  wealth: 65,
                  health: 78,
                  date: birthday
                }}
                language={language}
              />
            </div>
            </FadeInWhenVisible>

            {/* BaZiChat - 多轮对话 */}
            <FadeInWhenVisible delay={0.34}>
            <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.06]">
              <h3 className="text-sm font-serif text-white/40 tracking-widest uppercase mb-4 text-center">
                {language === 'zh' ? '🔮 AI 多轮对话占卜' : '🔮 AI Multi-Turn Chat'}
              </h3>
              <BaZiChat
                birthDate={birthday}
                birthTime={TIME_PERIODS[birthTime]?.labelEn?.split(' ')[0]
                  ? `${String(birthTime * 2 + 23).padStart(2, '0')}:00`
                  : '02:00'}
                gender={gender}
                language={language}
                baziChart={result ? {
                  dayHeavenlyStem: result.chart.day.heavenlyStem,
                  dayMasterElement: result.chart.dayMasterElement,
                  year: result.chart.year.heavenlyStem,
                  month: result.chart.month.heavenlyStem,
                  day: result.chart.day.heavenlyStem,
                  hour: result.chart.hour.heavenlyStem
                } : undefined}
              />
            </div>
            </FadeInWhenVisible>

            {/* Share Panel */}
            <SharePanel
              serviceType="bazi"
              resultId={birthday.replace(/-/g, '')}
              shareUrl={`https://tianji.global/bazi?birthday=${birthday}`}
            />

            {/* Animated BaZi Wheel */}
            <FadeInWhenVisible delay={0.35}>
            <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.06]">
              <h3 className="text-sm font-serif text-white/40 tracking-widest uppercase mb-4 text-center">
                ✨ Animated BaZi Wheel
              </h3>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <BaziWheelAnimation
                  birthDate={birthday}
                  birthTime={TIME_PERIODS[birthTime]?.labelEn?.split(' ')[0]
                    ? `${String(birthTime * 2 + 23).padStart(2, '0')}:00`
                    : '02:00'}
                  width={420}
                  height={420}
                  playing={true}
                />
              </div>
              <div className="flex justify-center">
                <AnimatedShareButton
                  type="bazi"
                  resultData={{ chart: result?.chart, birthday, birthTime: TIME_PERIODS[birthTime]?.label || '' }}
                  format="webp"
                  language={language}
                  variant="secondary"
                />
              </div>
            </div>
            </FadeInWhenVisible>

            {/* PDF Download */}
            <PDFDownloadButton
              serviceType="bazi"
              resultData={result as unknown as Record<string, unknown>}
              birthData={{ birthday, birthTime: TIME_PERIODS[birthTime]?.label || '', gender }}
              language={language}
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>© 2024 TianJi Global · 天机全球</p>
        </div>
      </div>
    </div>
  );
}
