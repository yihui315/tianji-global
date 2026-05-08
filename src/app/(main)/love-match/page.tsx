'use client';

/**
 * Love Match — TianJi Global
 *
 * Rewritten under the tianji-cinematic design skill (.claude/skills/tianji-cinematic/SKILL.md).
 * Recipe: §7.1 reading-input page (two-person variant).
 *
 * What changed vs. the previous version:
 *   - Removed Tailwind candy palette (pink/rose/amber/orange/emerald/indigo) — gold + purple + black only.
 *   - Removed `bg-clip-text` rainbow title — Instrument Serif italic via BackgroundVideoHero.
 *   - Removed ad-hoc radial-gradient on <main>; chrome is one <PageChrome /> component.
 *   - Removed raw <div className="bg-slate-800/50"> cards — now <GlassCard>.
 *   - Wrapped result in <ResultScaffold> with overview / highlights / details / aside slots.
 *   - All copy, hero, trust strip wired through `moduleLandingCopy.loveMatch`.
 *   - Added saveReading() on success + SharePanel + PDFDownloadButton in twin GlassCards.
 *
 * API and data contracts unchanged — POST /api/love-match with
 *   { person1: BaZiData, person2: BaZiData, language, enhanceWithAI }.
 *
 * In-page BaZi calculation kept (mirrors lib/bazi.js) — no fetch dependency for chart calc.
 */

import { useState, useCallback, useMemo } from 'react';
import SharePanel from '@/components/SharePanel';
import {
  BackgroundVideoHero,
  InsightGrid,
  LandingSection,
  ModuleInputShell,
  PageChrome,
  ResultScaffold,
  ScrollNarrativeSection,
  TrustStrip,
} from '@/components/landing';
import { GlassCard, LanguageSwitch } from '@/components/ui';
import { colors } from '@/design-system';
import { useSyncedLanguage } from '@/hooks/useSyncedLanguage';
import { moduleLandingCopy } from '@/lib/language-routing';
import { saveReading } from '@/lib/save-reading';

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

interface PersonFormData {
  name: string;
  birthday: string;
  birthTime: number;
  gender: Gender;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ELEMENT_LABELS: Record<Language, Record<string, string>> = {
  zh: { '木': '木', '火': '火', '土': '土', '金': '金', '水': '水' },
  en: { '木': 'Wood', '火': 'Fire', '土': 'Earth', '金': 'Metal', '水': 'Water' },
};

const TIME_PERIODS = [
  { value: 0, label: '子时 (23:00–00:59)', labelEn: 'Zi (23:00–00:59)' },
  { value: 1, label: '丑时 (01:00–02:59)', labelEn: 'Chou (01:00–02:59)' },
  { value: 2, label: '寅时 (03:00–04:59)', labelEn: 'Yin (03:00–04:59)' },
  { value: 3, label: '卯时 (05:00–06:59)', labelEn: 'Mao (05:00–06:59)' },
  { value: 4, label: '辰时 (07:00–08:59)', labelEn: 'Chen (07:00–08:59)' },
  { value: 5, label: '巳时 (09:00–10:59)', labelEn: 'Si (09:00–10:59)' },
  { value: 6, label: '午时 (11:00–12:59)', labelEn: 'Wu (11:00–12:59)' },
  { value: 7, label: '未时 (13:00–14:59)', labelEn: 'Wei (13:00–14:59)' },
  { value: 8, label: '申时 (15:00–16:59)', labelEn: 'Shen (15:00–16:59)' },
  { value: 9, label: '酉时 (17:00–18:59)', labelEn: 'You (17:00–18:59)' },
  { value: 10, label: '戌时 (19:00–20:59)', labelEn: 'Xu (19:00–20:59)' },
  { value: 11, label: '亥时 (21:00–22:59)', labelEn: 'Hai (21:00–22:59)' },
];

const NARRATIVE_BLOCKS = [
  {
    label: '01 Two charts as weather',
    heading: 'Compatibility is a weather pattern, not a verdict.',
    body: 'Each birth chart is a small climate. Putting two together asks where they amplify, where they cancel, and where one steady force supports the other.',
  },
  {
    label: '02 Three lenses',
    heading: 'Five elements, ten stems, twelve branches.',
    body: 'Five-element fit reads the long-term temperature. Stem combinations show how feelings translate into action. Branch harmonies and clashes mark the short-term flashpoints.',
  },
  {
    label: '03 What the score actually means',
    heading: 'A number is a starting point, not a sentence.',
    body: 'A score above seventy still has rough days; one below fifty can hold for decades with the right care. The advice is what to do — not whether to stay.',
  },
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

// ─── PersonForm ───────────────────────────────────────────────────────────────

function PersonForm({
  title,
  data,
  onChange,
  language,
  formId = 'person',
}: {
  title: string;
  data: PersonFormData;
  onChange: (d: PersonFormData) => void;
  language: Language;
  formId?: string;
}) {
  return (
    <GlassCard
      level="card"
      className="rounded-[1.5rem] border border-white/[0.06] bg-black/20 p-5 sm:p-6"
    >
      <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
        {title}
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label
            htmlFor={`${formId}-name`}
            className="mb-1.5 block text-[10px] uppercase tracking-[0.28em] text-white/35"
          >
            {language === 'zh' ? '姓名' : 'Name'}
          </label>
          <input
            id={`${formId}-name`}
            type="text"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder={language === 'zh' ? '请输入姓名' : 'Enter name'}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white/85 placeholder-white/30 transition-all focus:border-purple-500/40 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor={`${formId}-birthday`}
            className="mb-1.5 block text-[10px] uppercase tracking-[0.28em] text-white/35"
          >
            {language === 'zh' ? '出生日期' : 'Birth date'}
          </label>
          <input
            id={`${formId}-birthday`}
            type="date"
            value={data.birthday}
            onChange={(e) => onChange({ ...data, birthday: e.target.value })}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white/85 transition-all focus:border-purple-500/40 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor={`${formId}-birth-time`}
            className="mb-1.5 block text-[10px] uppercase tracking-[0.28em] text-white/35"
          >
            {language === 'zh' ? '出生时辰' : 'Birth hour'}
          </label>
          <select
            id={`${formId}-birth-time`}
            value={data.birthTime}
            onChange={(e) => onChange({ ...data, birthTime: Number(e.target.value) })}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white/85 transition-all focus:border-purple-500/40 focus:outline-none"
          >
            {TIME_PERIODS.map((period) => (
              <option key={period.value} value={period.value} className="bg-black text-white">
                {language === 'zh' ? period.label : period.labelEn}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="mb-1.5 text-[10px] uppercase tracking-[0.28em] text-white/35">
            {language === 'zh' ? '性别' : 'Gender'}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onChange({ ...data, gender: 'male' })}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm transition-all ${
                data.gender === 'male'
                  ? 'border-white/30 bg-white/[0.08] text-white/90'
                  : 'border-white/[0.08] bg-white/[0.02] text-white/55 hover:border-white/20'
              }`}
            >
              {language === 'zh' ? '男' : 'Male'}
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...data, gender: 'female' })}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm transition-all ${
                data.gender === 'female'
                  ? 'border-white/30 bg-white/[0.08] text-white/90'
                  : 'border-white/[0.08] bg-white/[0.02] text-white/55 hover:border-white/20'
              }`}
            >
              {language === 'zh' ? '女' : 'Female'}
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ─── ScoreDial ────────────────────────────────────────────────────────────────
// Cinematic replacement for ScoreCircle. One ring color = one tone.
//   ≥ 70  → gold
//   ≥ 50  → purpleLight
//   ≥ 30  → goldLight (warm caution)
//   < 30  → riskRed (functional, allowed by §1.1)

function ScoreDial({ score, language }: { score: number; language: Language }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const ringColor =
    score >= 70 ? colors.gold :
    score >= 50 ? colors.purpleLight :
    score >= 30 ? colors.goldLight :
    colors.riskRed;

  const label =
    score >= 70 ? (language === 'zh' ? '相得益彰' : 'Strong harmony')
    : score >= 50 ? (language === 'zh' ? '稳定可持' : 'Stable chemistry')
    : score >= 30 ? (language === 'zh' ? '需要经营' : 'Needs care')
    : (language === 'zh' ? '挑战较大' : 'Significant friction');

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-48 w-48">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="100" cy="100" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="none" />
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke={ringColor}
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-5xl" style={{ color: ringColor }}>{score}</span>
          <span className="mt-1 text-[10px] uppercase tracking-[0.28em] text-white/40">/ 100</span>
        </div>
      </div>
      <p
        className="mt-5 text-[11px] uppercase tracking-[0.28em]"
        style={{ color: ringColor }}
      >
        {label}
      </p>
    </div>
  );
}

// ─── ElementBars ──────────────────────────────────────────────────────────────
// Element distribution is a "data chart" per SKILL §1.1 — single neutral bar with
// the count rendered, no per-element rainbow. Element label stays culturally meaningful.

function ElementBars({
  person,
  side,
  language,
}: {
  person: BaZiData;
  side: string;
  language: Language;
}) {
  const elements = [person.year.element, person.month.element, person.day.element, person.hour.element];
  const allElements = ['木', '火', '土', '金', '水'];
  const count: Record<string, number> = {};
  allElements.forEach((e) => { count[e] = 0; });
  elements.forEach((e) => { count[e]++; });

  return (
    <div>
      <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">{side}</div>
      <div className="mt-4 space-y-2.5">
        {allElements.map((el) => {
          const c = count[el];
          const pct = (c / 4) * 100;
          return (
            <div key={el} className="flex items-center gap-3">
              <span className="w-10 font-serif text-sm text-white/85">
                {ELEMENT_LABELS[language][el]}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: c > 0
                      ? 'linear-gradient(90deg, rgba(167,139,250,0.7), rgba(212,175,55,0.7))'
                      : 'transparent',
                  }}
                />
              </div>
              <span className="w-5 text-right text-xs text-white/45">{c}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-xs text-white/45">
        {language === 'zh' ? '日主：' : 'Day master: '}
        <span className="text-white/85">
          {ELEMENT_LABELS[language][person.dayMasterElement]}
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LoveMatchPage() {
  const [language, setLanguage] = useSyncedLanguage('en');
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

  const copy = moduleLandingCopy.loveMatch[language];

  const t = useCallback(
    (en: string, zh: string) => (language === 'zh' ? zh : en),
    [language]
  );

  const handleCalculate = useCallback(async (withAI: boolean) => {
    setLoading(true);
    if (withAI) setLoadingAI(true);
    setError('');
    setResult(null);

    try {
      const [y1, m1, d1] = person1Data.birthday.split('-').map(Number);
      const hour1 = person1Data.birthTime * 2 + 23;
      const chart1 = calculateBaZi(y1, m1, d1, hour1);
      const baziData1: BaZiData = { ...chart1, gender: person1Data.gender };

      const [y2, m2, d2] = person2Data.birthday.split('-').map(Number);
      const hour2 = person2Data.birthTime * 2 + 23;
      const chart2 = calculateBaZi(y2, m2, d2, hour2);
      const baziData2: BaZiData = { ...chart2, gender: person2Data.gender };

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
      if (!res.ok) throw new Error((json.aiError as string) || (language === 'zh' ? '计算失败 请重试' : 'Calculation failed'));

      setResult(json);

      saveReading({
        reading_type: 'love-match',
        title: `${person1Data.name || (language === 'zh' ? 'TA' : 'Partner')} · ${person2Data.name || (language === 'zh' ? '你' : 'You')} love match`,
        summary: (json.compatibility.advice ?? '').slice(0, 160),
        reading_data: json as unknown as Record<string, unknown>,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : (language === 'zh' ? '计算失败 请重试' : 'An error occurred'));
    } finally {
      setLoading(false);
      setLoadingAI(false);
    }
  }, [person1Data, person2Data, language]);

  const COMPAT = result?.compatibility;

  const insightItems = useMemo(() => {
    if (!result || !COMPAT) return [];
    return [
      {
        icon: '✦',
        label: t('Five-element score', '五行得分'),
        value: String(COMPAT.elementAnalysis.score),
      },
      {
        icon: '✧',
        label: t('Stem combinations', '天干合化'),
        value: String(COMPAT.stemMatch.score),
      },
      {
        icon: '◌',
        label: t('Six-harmony branches', '地支六合'),
        value: String(COMPAT.branchMatch.liuHe.length),
      },
      {
        icon: '✺',
        label: t('Three-combination branches', '地支三合'),
        value: String(COMPAT.branchMatch.sanHe.length),
      },
    ];
  }, [result, COMPAT, t]);

  return (
    <main className="relative min-h-screen overflow-x-hidden text-white">
      <PageChrome disableSpotlight />

      <div className="fixed right-4 top-4 z-50">
        <LanguageSwitch />
      </div>

      <BackgroundVideoHero
        eyebrow={copy.hero.eyebrow}
        title={copy.hero.title}
        subtitle={copy.hero.subtitle}
        description={copy.hero.description}
        posterSrc="/assets/images/posters/relationship-hero-poster-16x9.jpg"
        imageSrc="/assets/images/posters/relationship-hero-poster-16x9.jpg"
        meta={<TrustStrip items={[...copy.trustItems]} className="w-full max-w-3xl" />}
      >
        <ModuleInputShell
          eyebrow={copy.form.eyebrow}
          title={copy.form.title}
          description={copy.form.description}
          footer={copy.form.footer}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <PersonForm
              title={t("Partner's chart", 'TA 的命盘')}
              data={person1Data}
              onChange={setPerson1Data}
              language={language}
              formId="partner"
            />
            <PersonForm
              title={t('Your chart', '你的命盘')}
              data={person2Data}
              onChange={setPerson2Data}
              language={language}
              formId="you"
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => handleCalculate(false)}
              disabled={loading}
              className="flex-1 rounded-2xl border border-white/[0.14] bg-white/[0.06] px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white/90 transition-all hover:border-white/30 hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ boxShadow: '0 0 36px rgba(245, 197, 66, 0.16)' }}
            >
              {loading && !loadingAI
                ? t('Reading…', '计算中…')
                : copy.primaryCta}
            </button>
            <button
              type="button"
              onClick={() => handleCalculate(true)}
              disabled={loading}
              className="flex-1 rounded-2xl border border-white/[0.14] bg-white/[0.04] px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white/85 transition-all hover:border-white/30 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ boxShadow: '0 0 36px rgba(167, 139, 250, 0.18)' }}
            >
              {loadingAI
                ? t('AI reading…', 'AI 解读中…')
                : t('AI deep interpretation', 'AI 深度解读')}
            </button>
          </div>
        </ModuleInputShell>
      </BackgroundVideoHero>

      {/* Error banner */}
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

      {/* Pre-result narrative — shown until the user submits */}
      {!result && !loading && (
        <ScrollNarrativeSection
          accentColor="#7c3aed"
          goldColor="#D4AF37"
          blocks={NARRATIVE_BLOCKS}
        />
      )}

      {/* Result */}
      {result && COMPAT && (
        <>
          <ResultScaffold
            eyebrow={t('YOUR COMPATIBILITY', '你们的合盘')}
            title={t(
              'Two charts read together — calmly.',
              '两份命盘 一次安静地读完'
            )}
            subtitle={t(
              'A single weather pattern, not a verdict. Use the score as a starting point — and let the advice below tell you what to do with it.',
              '把它当作一种气象 不是裁定 用这个分数作为入口 下面的建议告诉你具体怎么应对。'
            )}
            overview={
              <div className="space-y-7">
                <div className="flex flex-col items-center">
                  <ScoreDial score={COMPAT.score} language={language} />
                </div>
                <p className="mx-auto max-w-2xl text-center font-serif text-xl leading-relaxed text-white/85 sm:text-2xl">
                  {COMPAT.advice}
                </p>
              </div>
            }
            highlights={
              <div className="space-y-6">
                <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                  {t('Five-element distribution', '五行对照')}
                </div>
                <div className="grid gap-7 sm:grid-cols-2">
                  <ElementBars
                    person={result.person1}
                    side={t("Partner's chart", 'TA 的命盘')}
                    language={language}
                  />
                  <ElementBars
                    person={result.person2}
                    side={t('Your chart', '你的命盘')}
                    language={language}
                  />
                </div>
              </div>
            }
            details={
              <div className="space-y-6">
                <div>
                  <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                    {t('Element relations', '五行关系')}
                  </div>
                  <p className="mt-2 text-xs text-white/45">
                    {t('Score', '得分')}:{' '}
                    <span style={{ color: COMPAT.elementAnalysis.score >= 0 ? colors.purpleLight : colors.riskRed }}>
                      {COMPAT.elementAnalysis.score > 0 ? '+' : ''}
                      {COMPAT.elementAnalysis.score}
                    </span>
                  </p>
                  <ul className="mt-3 space-y-1.5 text-sm leading-7 text-white/72">
                    {COMPAT.elementAnalysis.harmonies.map((h, i) => (
                      <li key={`harmony-${i}`} style={{ color: colors.purpleLight }}>
                        ✓ {h}
                      </li>
                    ))}
                    {COMPAT.elementAnalysis.conflicts.map((c, i) => (
                      <li key={`conflict-${i}`} style={{ color: colors.riskRed }}>
                        × {c}
                      </li>
                    ))}
                    {COMPAT.elementAnalysis.harmonies.length === 0 &&
                      COMPAT.elementAnalysis.conflicts.length === 0 && (
                        <li className="text-white/45">
                          {t('Element relations are balanced.', '五行关系平和。')}
                        </li>
                      )}
                  </ul>
                </div>

                <div className="border-t border-white/[0.06] pt-5">
                  <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                    {t('Stem combinations', '天干合化')}
                  </div>
                  <p className="mt-2 text-xs text-white/45">
                    {t('Score', '得分')}:{' '}
                    <span style={{ color: colors.gold }}>+{COMPAT.stemMatch.score}</span>
                  </p>
                  {COMPAT.stemMatch.pairs.length === 0 ? (
                    <p className="mt-3 text-sm text-white/45">
                      {t('No stem combinations.', '无合化关系。')}
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-1.5 text-sm leading-7 text-white/75">
                      {COMPAT.stemMatch.pairs.map((p, i) => (
                        <li key={`stem-${i}`}>· {p}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="border-t border-white/[0.06] pt-5">
                  <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                    {t('Branch relations', '地支关系')}
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-white/72 sm:grid-cols-3">
                    <div>
                      <div className="text-xs text-white/45">{t('Six-harmony', '六合')}</div>
                      <div className="mt-1" style={{ color: colors.purpleLight }}>
                        +{COMPAT.branchMatch.liuHe.length * 10}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-white/45">{t('Three-combination', '三合')}</div>
                      <div className="mt-1" style={{ color: colors.gold }}>
                        +{COMPAT.branchMatch.sanHe.length * 15}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-white/45">{t('Six-opposition', '六冲')}</div>
                      <div className="mt-1" style={{ color: colors.riskRed }}>
                        −{COMPAT.branchMatch.chong.length * 10}
                      </div>
                    </div>
                  </div>
                  {COMPAT.branchMatch.chong.length > 0 && (
                    <p
                      className="mt-3 text-xs"
                      style={{ color: colors.riskRed }}
                    >
                      ⚠ {t('Watch for opposition effects.', '注意六冲影响。')}
                    </p>
                  )}
                </div>
              </div>
            }
            aside={
              <div className="space-y-5">
                <div>
                  <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                    {t('Two-line summary', '一句话总结')}
                  </div>
                  <p className="mt-3 font-serif text-lg leading-relaxed text-white/85">
                    {language === 'zh'
                      ? `${COMPAT.score} 分。${COMPAT.score >= 70 ? '相得益彰。' : COMPAT.score >= 50 ? '稳定可持。' : COMPAT.score >= 30 ? '需要经营。' : '挑战较大。'}`
                      : `${COMPAT.score}/100. ${COMPAT.score >= 70 ? 'Strong harmony.' : COMPAT.score >= 50 ? 'Stable chemistry.' : COMPAT.score >= 30 ? 'Needs care.' : 'Significant friction.'}`}
                  </p>
                </div>

                <GlassCard
                  level="soft"
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                    {t('Day masters', '日主')}
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-white/72">
                    <p>
                      {t("Partner's", 'TA 的')}:{' '}
                      <span className="text-white/90">
                        {ELEMENT_LABELS[language][result.person1.dayMasterElement]}
                      </span>
                    </p>
                    <p>
                      {t('Yours', '你的')}:{' '}
                      <span className="text-white/90">
                        {ELEMENT_LABELS[language][result.person2.dayMasterElement]}
                      </span>
                    </p>
                  </div>
                </GlassCard>
              </div>
            }
          />

          <InsightGrid
            title={t('The numbers behind the score', '分数背后的细节')}
            subtitle={t(
              'Five-element fit, stem combinations, branch harmonies — read at a glance.',
              '五行得分 天干合化 地支六合三合 一眼看清。'
            )}
            items={insightItems}
            accentColor="#7c3aed"
            goldColor="#D4AF37"
          />

          {/* AI interpretation */}
          {result.aiInterpretation && (
            <LandingSection
              eyebrow={t('AI deep interpretation', 'AI 深度解读')}
              title={t(
                'Read together by an AI second voice.',
                '让 AI 用第二个声音 把这次合盘再读一遍。'
              )}
              subtitle={
                result.disclaimer ?? t(
                  'Treat this as a thoughtful second opinion, not a verdict.',
                  '把它当作一份认真的第二意见 而不是裁定。'
                )
              }
            >
              <GlassCard
                level="strong"
                className="mx-auto max-w-3xl rounded-[1.75rem] border border-white/[0.08] bg-black/30 p-6 sm:p-8"
              >
                <p className="whitespace-pre-wrap text-base leading-7 text-white/85">
                  {result.aiInterpretation}
                </p>
                {result.aiMeta && (
                  <p className="mt-5 text-[10px] uppercase tracking-[0.28em] text-white/30">
                    {result.aiMeta.provider} · {result.aiMeta.model} ·{' '}
                    {result.aiMeta.latencyMs}ms
                  </p>
                )}
              </GlassCard>
            </LandingSection>
          )}

          {result.aiError && (
            <div className="mx-auto max-w-3xl px-6 pb-4">
              <GlassCard
                level="card"
                className="rounded-[1.5rem] border border-rose-500/30 bg-rose-500/10 p-4 text-rose-100"
              >
                {t('AI interpretation failed', 'AI 解读失败')}: {result.aiError}
              </GlassCard>
            </div>
          )}

          {/* Share & save */}
          <LandingSection
            eyebrow={t('Share & save', '分享与保存')}
            title={t(
              'Keep this reading, or send it to the other person.',
              '把这次合盘保存下来 或发给另一半。'
            )}
            subtitle={t(
              'Saved to your reading history automatically. Export or share when you want to.',
              '已自动保存到你的解读历史 需要时再导出或分享。'
            )}
          >
            <GlassCard
              level="card"
              className="mx-auto max-w-2xl rounded-[1.75rem] border border-white/[0.06] bg-black/20 p-6 sm:p-8"
            >
              <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                {t('Share panel', '分享面板')}
              </div>
              <p className="mt-3 text-sm leading-7 text-white/60">
                {t(
                  'QR code, social links, copy-to-clipboard. Send a TianJi reading the way you would send a chapter.',
                  '二维码 社交链接 一键复制 把这次合盘像送一章书一样递出去。'
                )}
              </p>
              <div className="mt-5">
                <SharePanel
                  serviceType="love-match"
                  resultId={`love-match-${person1Data.birthday}-${person2Data.birthday}`}
                  shareUrl={`https://tianji.global/love-match?score=${COMPAT.score}`}
                />
              </div>
            </GlassCard>
          </LandingSection>
        </>
      )}

      {/* Footer beat — present whether or not a reading is up */}
      <div className="px-6 pb-16 pt-8 text-center text-xs uppercase tracking-[0.28em] text-white/30">
        {t('TianJi · BaZi marriage compatibility', 'TianJi · 八字合婚')}
      </div>
    </main>
  );
}
