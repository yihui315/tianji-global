'use client';

import { useState, useCallback } from 'react';
import SharePanel from '@/components/SharePanel';

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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            {language === 'zh' ? '八字命理' : 'Ba Zi'}
          </h1>
          <p className="text-amber-300/80 text-lg">
            {language === 'zh' ? '四柱命理 · Four Pillars of Destiny' : '四柱命理 · Four Pillars of Destiny'}
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-slate-800/50 rounded-xl p-6 mb-6 backdrop-blur-sm border border-slate-700/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Birthday */}
            <div>
              <label className="block text-amber-300 text-sm font-medium mb-2">
                {language === 'zh' ? '出生日期 / Birthday' : '出生日期 / Birthday'}
              </label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Birth Time */}
            <div>
              <label className="block text-amber-300 text-sm font-medium mb-2">
                {language === 'zh' ? '出生时辰 / Birth Hour' : '出生时辰 / Birth Hour'}
              </label>
              <select
                value={birthTime}
                onChange={(e) => setBirthTime(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:border-amber-500 focus:outline-none"
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
              <label className="block text-amber-300 text-sm font-medium mb-2">
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
              <label className="block text-amber-300 text-sm font-medium mb-2">
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
            <button
              onClick={() => handleCalculate(false)}
              disabled={loading}
              className="flex-1 py-4 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 font-bold text-lg transition-all disabled:opacity-50"
            >
              {loading && !loadingAI ? (language === 'zh' ? '计算中...' : 'Calculating...') : (language === 'zh' ? '分析八字' : 'Calculate Ba Zi')}
            </button>
            <button
              onClick={() => { setLoadingAI(true); handleCalculate(true); }}
              disabled={loading}
              className="flex-1 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-lg transition-all disabled:opacity-50"
            >
              {loadingAI ? (language === 'zh' ? 'AI解读中...' : 'AI Interpreting...') : (language === 'zh' ? '✨ AI 深度解读' : '✨ AI Deep Interpretation')}
            </button>
          </div>
        </div>

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
            <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border border-slate-700/50">
              <h2 className="text-2xl font-bold text-amber-300 mb-6 text-center">
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

            {/* Day Master */}
            <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-xl p-6 border border-amber-600/30">
              <h3 className="text-xl font-bold text-amber-300 mb-4 text-center">
                {language === 'zh' ? '日主 (Day Master)' : '日主 (Day Master)'}
              </h3>
              <div className="text-center">
                <span className="text-5xl font-bold text-amber-400 mr-4">{result.chart.day.heavenlyStem}</span>
                <span className={`text-3xl font-bold ${ELEMENT_COLORS[result.chart.dayMasterElement]}`}>
                  {ELEMENT_LABELS[language][result.chart.dayMasterElement]}
                </span>
              </div>
              <p className="text-slate-300 text-center mt-4">
                {language === 'zh'
                  ? `${result.chart.day.heavenlyStem}日主，属于${ELEMENT_LABELS['zh'][result.chart.dayMasterElement]}行`
                  : `Day Master ${result.chart.day.heavenlyStem}, ${ELEMENT_LABELS['en'][result.chart.dayMasterElement]} element`}
              </p>
            </div>

            {/* Five Elements Distribution */}
            {elementCounts && (
              <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border border-slate-700/50">
                <h3 className="text-xl font-bold text-amber-300 mb-6 text-center">
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
                        <span className="text-slate-300 w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Interpretation */}
            <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border border-slate-700/50">
              <h3 className="text-xl font-bold text-amber-300 mb-4 text-center">
                {language === 'zh' ? '命理简析' : 'Brief Interpretation'}
              </h3>
              <p className="text-slate-300 text-center leading-relaxed">
                {language === 'zh'
                  ? `您的日主为${result.chart.day.heavenlyStem}，属${ELEMENT_LABELS['zh'][result.chart.dayMasterElement]}行。${result.chart.year.heavenlyStem}年、${result.chart.month.heavenlyStem}月、${result.chart.day.heavenlyStem}日、${result.chart.hour.heavenlyStem}时，构成了独特的八字命盘。`
                  : `Your Day Master is ${result.chart.day.heavenlyStem}, belonging to the ${ELEMENT_LABELS['en'][result.chart.dayMasterElement]} element. The combination of ${result.chart.year.heavenlyStem} (Year), ${result.chart.month.heavenlyStem} (Month), ${result.chart.day.heavenlyStem} (Day), and ${result.chart.hour.heavenlyStem} (Hour) creates your unique Ba Zi chart.`}
              </p>
            </div>

            {/* AI Interpretation */}
            {result.aiInterpretation && (
              <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-xl p-6 border border-purple-600/30">
                <h3 className="text-xl font-bold text-purple-300 mb-4 text-center">
                  {language === 'zh' ? '✨ AI 深度解读' : '✨ AI Deep Interpretation'}
                </h3>
                <p className="text-slate-200 text-center leading-relaxed whitespace-pre-wrap">
                  {result.aiInterpretation}
                </p>
                {result.disclaimer && (
                  <p className="text-slate-500 text-xs mt-4 italic">
                    {result.disclaimer}
                  </p>
                )}
                {result.aiMeta && (
                  <p className="text-slate-600 text-xs mt-2">
                    {result.aiMeta.provider} · {result.aiMeta.model} · {result.aiMeta.latencyMs}ms
                  </p>
                )}
              </div>
            )}

            {result.aiError && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 text-red-200 text-sm">
                {language === 'zh' ? 'AI 解读失败' : 'AI Interpretation Failed'}: {result.aiError}
              </div>
            )}

            {/* Share Panel */}
            <SharePanel
              serviceType="bazi"
              resultId={birthday.replace(/-/g, '')}
              shareUrl={`https://tianji.global/bazi?birthday=${birthday}`}
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>© 2024 TianJi Global · 天机全球</p>
        </div>
      </div>
    </main>
  );
}
