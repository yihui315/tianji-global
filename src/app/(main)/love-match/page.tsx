'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

type Language = 'zh' | 'en';
type Gender = 'male' | 'female';

interface BaZiChart {
  year: { heavenlyStem: string; earthlyBranch: string; element: string };
  month: { heavenlyStem: string; earthlyBranch: string; element: string };
  day: { heavenlyStem: string; earthlyBranch: string; element: string };
  hour: { heavenlyStem: string; earthlyBranch: string; element: string };
  dayMasterElement: string;
}

interface BaZiData {
  year: { heavenlyStem: string; earthlyBranch: string; element: string };
  month: { heavenlyStem: string; earthlyBranch: string; element: string };
  day: { heavenlyStem: string; earthlyBranch: string; element: string };
  hour: { heavenlyStem: string; earthlyBranch: string; element: string };
  dayMasterElement: string;
  gender?: string;
}

interface ElementAnalysis {
  score: number;
  conflicts: string[];
  harmonies: string[];
  details: string;
}

interface StemMatchResult {
  score: number;
  pairs: string[];
  details: string;
}

interface BranchMatchResult {
  score: number;
  liuHe: string[];
  sanHe: string[];
  chong: string[];
  details: string;
}

interface CompatibilityResult {
  score: number;
  elementAnalysis: ElementAnalysis;
  stemMatch: StemMatchResult;
  branchMatch: BranchMatchResult;
  advice: string;
}

interface LoveMatchResponse {
  person1: BaZiData;
  person2: BaZiData;
  compatibility: CompatibilityResult;
  aiInterpretation?: string;
  disclaimer?: string;
  aiMeta?: { provider: string; model: string; latencyMs: number; costUSD: number };
  aiError?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ELEMENT_COLORS: Record<string, string> = {
  '木': 'text-green-500',
  '火': 'text-red-500',
  '土': 'text-yellow-600',
  '金': 'text-gray-400',
  '水': 'text-blue-500',
};

const ELEMENT_BG: Record<string, string> = {
  '木': 'bg-green-500',
  '火': 'bg-red-500',
  '土': 'bg-yellow-600',
  '金': 'bg-gray-400',
  '水': 'bg-blue-500',
};

const ELEMENT_LABELS: Record<string, Record<string, string>> = {
  'zh': { '木': '木', '火': '火', '土': '土', '金': '金', '水': '水' },
  'en': { '木': 'Wood', '火': 'Fire', '土': 'Earth', '金': 'Metal', '水': 'Water' },
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

// ─── BaZi calculation (inline, mirrors bazi.js) ───────────────────────────────

const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ELEMENTS = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];

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

// ─── Person Form ─────────────────────────────────────────────────────────────

interface PersonFormData {
  name: string;
  birthday: string;
  birthTime: number;
  gender: Gender;
}

function PersonForm({
  title,
  titleEn,
  data,
  onChange,
  language,
}: {
  title: string;
  titleEn: string;
  data: PersonFormData;
  onChange: (d: PersonFormData) => void;
  language: Language;
}) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border border-slate-700/50">
      <h3 className="text-xl font-bold text-pink-300 mb-4 text-center">
        {title} / {titleEn}
      </h3>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-pink-300 text-sm font-medium mb-2">
            {language === 'zh' ? '姓名 / Name' : '姓名 / Name'}
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder={language === 'zh' ? '请输入姓名' : 'Enter name'}
            className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:border-pink-400 focus:outline-none"
          />
        </div>

        {/* Birthday */}
        <div>
          <label className="block text-pink-300 text-sm font-medium mb-2">
            {language === 'zh' ? '出生日期 / Birthday' : '出生日期 / Birthday'}
          </label>
          <input
            type="date"
            value={data.birthday}
            onChange={(e) => onChange({ ...data, birthday: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:border-pink-400 focus:outline-none"
          />
        </div>

        {/* Birth Time */}
        <div>
          <label className="block text-pink-300 text-sm font-medium mb-2">
            {language === 'zh' ? '出生时辰 / Birth Hour' : '出生时辰 / Birth Hour'}
          </label>
          <select
            value={data.birthTime}
            onChange={(e) => onChange({ ...data, birthTime: Number(e.target.value) })}
            className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:border-pink-400 focus:outline-none"
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
          <label className="block text-pink-300 text-sm font-medium mb-2">
            {language === 'zh' ? '性别 / Gender' : '性别 / Gender'}
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => onChange({ ...data, gender: 'male' })}
              className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                data.gender === 'male'
                  ? 'border-pink-400 bg-pink-400/20 text-pink-300'
                  : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500'
              }`}
            >
              {language === 'zh' ? '男 / Male' : '男 / Male'}
            </button>
            <button
              onClick={() => onChange({ ...data, gender: 'female' })}
              className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                data.gender === 'female'
                  ? 'border-pink-400 bg-pink-400/20 text-pink-300'
                  : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500'
              }`}
            >
              {language === 'zh' ? '女 / Female' : '女 / Female'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Score Circle ────────────────────────────────────────────────────────────

function ScoreCircle({ score, language }: { score: number; language: Language }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 60 ? '#EC4899' : score >= 40 ? '#F59E0B' : '#EF4444';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="#334155"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke={color}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold text-white">{score}</span>
          <span className="text-pink-300 text-sm">/ 100</span>
        </div>
      </div>
      <p className="mt-4 text-lg font-semibold text-pink-300">
        {score >= 70
          ? (language === 'zh' ? '❤️ 天作之合' : '❤️ Perfect Match')
          : score >= 50
          ? (language === 'zh' ? '💕 缘份上佳' : '💕 Great Chemistry')
          : score >= 30
          ? (language === 'zh' ? '💔 需要努力' : '💔 Needs Effort')
          : (language === 'zh' ? '⚠️ 挑战较大' : '⚠️ Significant Challenges')}
      </p>
    </div>
  );
}

// ─── Element Breakdown ────────────────────────────────────────────────────────

function ElementBreakdown({
  person1,
  person2,
  language,
}: {
  person1: BaZiData;
  person2: BaZiData;
  language: Language;
}) {
  const elements1 = [
    person1.year.element, person1.month.element, person1.day.element, person1.hour.element,
  ];
  const elements2 = [
    person2.year.element, person2.month.element, person2.day.element, person2.hour.element,
  ];

  const allElements = ['木', '火', '土', '金', '水'];

  const count1: Record<string, number> = {};
  const count2: Record<string, number> = {};
  allElements.forEach((e) => { count1[e] = 0; count2[e] = 0; });
  elements1.forEach((e) => count1[e]++);
  elements2.forEach((e) => count2[e]++);

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border border-slate-700/50">
      <h3 className="text-xl font-bold text-pink-300 mb-6 text-center">
        {language === 'zh' ? '🔮 五行对照' : '🔮 Element Comparison'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Person 1 */}
        <div>
          <p className="text-amber-300 font-semibold text-center mb-3">
            {language === 'zh' ? 'TA的信息' : "Partner's Info"}
          </p>
          <div className="space-y-2">
            {allElements.map((el) => {
              const count = count1[el];
              const pct = (count / 4) * 100;
              return (
                <div key={el} className="flex items-center gap-2">
                  <span className={`text-lg font-bold w-6 ${ELEMENT_COLORS[el]}`}>
                    {ELEMENT_LABELS[language][el]}
                  </span>
                  <div className="flex-1 bg-slate-700/50 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${ELEMENT_BG[el]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-slate-400 text-sm w-4">{count}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-center text-sm text-slate-400">
            {language === 'zh' ? '日主：' : 'Day Master: '}
            <span className={ELEMENT_COLORS[person1.dayMasterElement]}>
              {ELEMENT_LABELS[language][person1.dayMasterElement]}
            </span>
          </div>
        </div>

        {/* Person 2 */}
        <div>
          <p className="text-amber-300 font-semibold text-center mb-3">
            {language === 'zh' ? '你的信息' : 'Your Info'}
          </p>
          <div className="space-y-2">
            {allElements.map((el) => {
              const count = count2[el];
              const pct = (count / 4) * 100;
              return (
                <div key={el} className="flex items-center gap-2">
                  <span className={`text-lg font-bold w-6 ${ELEMENT_COLORS[el]}`}>
                    {ELEMENT_LABELS[language][el]}
                  </span>
                  <div className="flex-1 bg-slate-700/50 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${ELEMENT_BG[el]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-slate-400 text-sm w-4">{count}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-center text-sm text-slate-400">
            {language === 'zh' ? '日主：' : 'Day Master: '}
            <span className={ELEMENT_COLORS[person2.dayMasterElement]}>
              {ELEMENT_LABELS[language][person2.dayMasterElement]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LoveMatchPage() {
  const [language, setLanguage] = useState<Language>('zh');
  const [person1Data, setPerson1Data] = useState<PersonFormData>({
    name: '',
    birthday: '2000-08-16',
    birthTime: 2,
    gender: 'male',
  });
  const [person2Data, setPerson2Data] = useState<PersonFormData>({
    name: '',
    birthday: '1998-05-20',
    birthTime: 5,
    gender: 'female',
  });
  const [result, setResult] = useState<LoveMatchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  const handleCalculate = useCallback(async (withAI: boolean) => {
    setLoading(true);
    setError('');
    setResult(null);
    setShareUrl('');

    try {
      // Calculate BaZi for both
      const [y1, m1, d1] = person1Data.birthday.split('-').map(Number);
      const hour1 = person1Data.birthTime * 2 + 23;
      const chart1 = calculateBaZi(y1, m1, d1, hour1);
      const baziData1: BaZiData = {
        ...chart1,
        gender: person1Data.gender,
      };

      const [y2, m2, d2] = person2Data.birthday.split('-').map(Number);
      const hour2 = person2Data.birthTime * 2 + 23;
      const chart2 = calculateBaZi(y2, m2, d2, hour2);
      const baziData2: BaZiData = {
        ...chart2,
        gender: person2Data.gender,
      };

      const res = await fetch('/api/love-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person1: baziData1,
          person2: baziData2,
          language,
          enhanceWithAI: withAI,
        }),
      });

      const json: LoveMatchResponse = await res.json();
      if (!res.ok) throw new Error(json.aiError as string || 'Calculation failed');

      setResult(json);

      // Generate share URL
      const params = new URLSearchParams({
        p1: `${person1Data.name || 'A'},${person1Data.birthday},${person1Data.birthTime},${person1Data.gender}`,
        p2: `${person2Data.name || 'B'},${person2Data.birthday},${person2Data.birthTime},${person2Data.gender}`,
        score: String(json.compatibility.score),
      });
      setShareUrl(`${window.location.origin}/love-match?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setLoadingAI(false);
    }
  }, [person1Data, person2Data, language]);

  const handleShare = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert(language === 'zh' ? '链接已复制到剪贴板！' : 'Link copied to clipboard!');
    } catch {
      alert(language === 'zh' ? '复制失败，请手动复制' : 'Copy failed, please copy manually');
    }
  }, [shareUrl, language]);

  const COMPAT = result?.compatibility;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-pink-950 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center gap-4 mb-4">
            <Link
              href="/"
              className="px-4 py-2 bg-slate-800/50 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition"
            >
              {language === 'zh' ? '← 首页' : '← Home'}
            </Link>
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage('zh')}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  language === 'zh' ? 'bg-pink-600 text-white' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                中文
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  language === 'en' ? 'bg-pink-600 text-white' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                EN
              </button>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-pink-400 via-rose-400 to-amber-400 bg-clip-text text-transparent">
            {language === 'zh' ? '姻缘合盘' : 'Love Match'}
          </h1>
          <p className="text-pink-300/80 text-lg">
            {language === 'zh' ? '八字合婚 · 命理姻缘' : 'BaZi Marriage Compatibility'}
          </p>
        </div>

        {/* Input Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <PersonForm
            title="TA的信息"
            titleEn="Partner's Info"
            data={person1Data}
            onChange={setPerson1Data}
            language={language}
          />
          <PersonForm
            title="你的信息"
            titleEn="Your Info"
            data={person2Data}
            onChange={setPerson2Data}
            language={language}
          />
        </div>

        {/* Calculate Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => handleCalculate(false)}
            disabled={loading}
            className="flex-1 py-4 rounded-lg bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 font-bold text-lg transition-all disabled:opacity-50"
          >
            {loading && !loadingAI
              ? (language === 'zh' ? '计算中...' : 'Calculating...')
              : (language === 'zh' ? '💘 合婚分析' : '💘 Analyze Compatibility')}
          </button>
          <button
            onClick={() => { setLoadingAI(true); handleCalculate(true); }}
            disabled={loading}
            className="flex-1 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-lg transition-all disabled:opacity-50"
          >
            {loadingAI
              ? (language === 'zh' ? 'AI解读中...' : 'AI Interpreting...')
              : (language === 'zh' ? '✨ AI 深度解读' : '✨ AI Deep Interpretation')}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6 text-red-200">
            {error}
          </div>
        )}

        {/* Results */}
        {result && COMPAT && (
          <div className="space-y-6">
            {/* Score Circle */}
            <div className="bg-slate-800/50 rounded-xl p-8 backdrop-blur-sm border border-slate-700/50 flex flex-col items-center">
              <ScoreCircle score={COMPAT.score} language={language} />
              <p className="mt-4 text-slate-300 text-center leading-relaxed max-w-2xl">
                {COMPAT.advice}
              </p>
            </div>

            {/* Element Breakdown */}
            <ElementBreakdown
              person1={result.person1}
              person2={result.person2}
              language={language}
            />

            {/* Detailed Analysis */}
            <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border border-slate-700/50">
              <h3 className="text-xl font-bold text-pink-300 mb-6 text-center">
                {language === 'zh' ? '📊 详细分析' : '📊 Detailed Analysis'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Element */}
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="text-amber-300 font-semibold mb-2 text-center">
                    {language === 'zh' ? '五行关系' : 'Element Relations'}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">
                        {language === 'zh' ? '得分' : 'Score'}
                      </span>
                      <span className={COMPAT.elementAnalysis.score >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {COMPAT.elementAnalysis.score > 0 ? '+' : ''}{COMPAT.elementAnalysis.score}
                      </span>
                    </div>
                    {COMPAT.elementAnalysis.conflicts.map((c, i) => (
                      <p key={i} className="text-red-400 text-sm">❌ {c}</p>
                    ))}
                    {COMPAT.elementAnalysis.harmonies.map((h, i) => (
                      <p key={i} className="text-green-400 text-sm">✅ {h}</p>
                    ))}
                    {COMPAT.elementAnalysis.conflicts.length === 0 && COMPAT.elementAnalysis.harmonies.length === 0 && (
                      <p className="text-slate-500 text-sm">
                        {language === 'zh' ? '五行关系平和' : 'Balanced element relations'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stem */}
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="text-amber-300 font-semibold mb-2 text-center">
                    {language === 'zh' ? '天干合化' : 'Stem Combinations'}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">
                        {language === 'zh' ? '得分' : 'Score'}
                      </span>
                      <span className="text-green-400">+{COMPAT.stemMatch.score}</span>
                    </div>
                    {COMPAT.stemMatch.pairs.map((p, i) => (
                      <p key={i} className="text-green-400 text-sm">✅ {p}</p>
                    ))}
                    {COMPAT.stemMatch.pairs.length === 0 && (
                      <p className="text-slate-500 text-sm">
                        {language === 'zh' ? '无合化关系' : 'No stem combinations'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Branch */}
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="text-amber-300 font-semibold mb-2 text-center">
                    {language === 'zh' ? '地支关系' : 'Branch Relations'}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        {language === 'zh' ? '六合' : '6-Harmony'}
                      </span>
                      <span className="text-green-400">+{COMPAT.branchMatch.liuHe.length * 10}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        {language === 'zh' ? '三合' : '3-Combination'}
                      </span>
                      <span className="text-green-400">+{COMPAT.branchMatch.sanHe.length * 15}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        {language === 'zh' ? '六冲' : '6-Opposition'}
                      </span>
                      <span className="text-red-400">-{COMPAT.branchMatch.chong.length * 10}</span>
                    </div>
                    {COMPAT.branchMatch.chong.length > 0 && (
                      <p className="text-red-400 text-xs mt-1">
                        ⚠️ {language === 'zh' ? '注意六冲影响' : 'Watch for opposition effects'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Interpretation */}
            {result.aiInterpretation && (
              <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-xl p-6 border border-purple-600/30">
                <h3 className="text-xl font-bold text-purple-300 mb-4 text-center">
                  {language === 'zh' ? '✨ AI 深度解读' : '✨ AI Deep Interpretation'}
                </h3>
                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
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

            {/* Share */}
            {shareUrl && (
              <div className="flex gap-4 items-center justify-center">
                <button
                  onClick={handleShare}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 font-bold transition-all"
                >
                  {language === 'zh' ? '🔗 复制分享链接' : '🔗 Copy Share Link'}
                </button>
                <button
                  onClick={() => window.open(`/api/share/og?type=tianji&name=${encodeURIComponent(language === 'zh' ? '姻缘合盘' : 'Love Match')}&subtitle=${encodeURIComponent(`Score: ${COMPAT.score}/100`)}`, '_blank')}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 font-bold transition-all"
                >
                  {language === 'zh' ? '🖼️ 生成分享图' : '🖼️ Generate OG Image'}
                </button>
              </div>
            )}
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
