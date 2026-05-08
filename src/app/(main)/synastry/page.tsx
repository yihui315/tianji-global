'use client';

/**
 * Synastry — TianJi Global
 *
 * Rewritten under the tianji-cinematic design skill (.claude/skills/tianji-cinematic/SKILL.md).
 * Recipe: §7.1 reading-input page (two-chart input variant, single-result + chart wheel).
 *
 * What changed vs. the previous version:
 *   - Removed Tailwind violet/purple/pink rainbow gradient title — Instrument Serif italic via BackgroundVideoHero.
 *   - Removed `bg-clip-text text-transparent` — title now lives in BackgroundVideoHero.
 *   - Replaced rainbow ASPECT_COLORS map (gold/green/red/blue/pink) with a 2-bucket palette:
 *       supportive aspects → goldLight  ·  challenging aspects → riskRed (chart-data exception only).
 *   - Replaced blue-vs-red Person A / Person B color pair with goldLight (outer) and purpleLight (inner).
 *   - Replaced the homemade ShareButton with SharePanel.
 *   - All copy, hero, trust strip wired through `moduleLandingCopy.synastry`.
 *   - Cards: every panel wrapped in <GlassCard>.
 *   - Added saveReading() on success.
 *
 * API contract preserved — POST /api/synastry with
 *   { person1, person2, enhanceWithAI, language, type: 'overlay' | 'composite' | 'davison' }.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import SharePanel from '@/components/SharePanel';
import PDFDownloadButton from '@/components/PDFDownloadButton';
import {
  BackgroundVideoHero,
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

type SynastryType = 'overlay' | 'composite' | 'davison';

interface PlanetPosition {
  name: string;
  longitude: number;
  latitude: number;
  sign: number;
  signName: string;
  signSymbol: string;
  degree: number;
  orb: number;
}

interface HousePlacements {
  houses: number[];
  ascendant: number;
  midheaven: number;
}

interface ChartData {
  planets: PlanetPosition[];
  houses: HousePlacements;
  julianDay: number;
}

type AspectType = 'Conjunction' | 'Sextile' | 'Square' | 'Trine' | 'Opposition';

interface Aspect {
  planet1: string;
  planet2: string;
  type: AspectType;
  exactAngle: number;
  orb: number;
  strength: number;
  polarity: string;
  polarityScore: number;
}

interface MidpointStructure {
  midpoint: number;
  planet1: string;
  planet2: string;
  aspectToThird: number;
  thirdPlanet: string;
  structureType: 'T-square' | 'Grand Trine' | 'Yod' | 'Castle' | 'Bow';
  sensitivity: 'high' | 'medium' | 'low';
}

interface CompositeChartData {
  planets: PlanetPosition[];
  houses: HousePlacements;
  midpointStructures: MidpointStructure[];
}

interface SynastryResponse {
  person1Chart: ChartData;
  person2Chart: ChartData;
  aspects: Aspect[];
  overallScore: number;
  compositeChart?: CompositeChartData;
  davisonChart?: CompositeChartData;
  meta?: { type: SynastryType };
  aiInterpretation?: string;
  disclaimer?: string;
}

// ─── Tokens ───────────────────────────────────────────────────────────────────

// Aspect bucketing — supportive aspects share one accent, challenging share another.
// This honors SKILL.md §1.1 palette law (functional reds only inside data charts/result deltas).
const SUPPORTIVE_ASPECTS = new Set<string>(['Conjunction', 'Sextile', 'Trine']);

function aspectColor(type: string): string {
  return SUPPORTIVE_ASPECTS.has(type) ? colors.goldLight : colors.riskRed;
}

// Person A → outer ring (gold) · Person B → inner ring (purple)
const PERSON_A_TONE = colors.goldLight;
const PERSON_B_TONE = colors.purpleLight;

const ZODIAC_SIGNS = [
  { name: 'Aries',       nameZh: '白羊', symbol: '♈' },
  { name: 'Taurus',      nameZh: '金牛', symbol: '♉' },
  { name: 'Gemini',      nameZh: '双子', symbol: '♊' },
  { name: 'Cancer',      nameZh: '巨蟹', symbol: '♋' },
  { name: 'Leo',         nameZh: '狮子', symbol: '♌' },
  { name: 'Virgo',       nameZh: '处女', symbol: '♍' },
  { name: 'Libra',       nameZh: '天秤', symbol: '♎' },
  { name: 'Scorpio',     nameZh: '天蝎', symbol: '♏' },
  { name: 'Sagittarius', nameZh: '射手', symbol: '♐' },
  { name: 'Capricorn',   nameZh: '摩羯', symbol: '♑' },
  { name: 'Aquarius',    nameZh: '水瓶', symbol: '♒' },
  { name: 'Pisces',      nameZh: '双鱼', symbol: '♓' },
];

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
};

const ASPECT_LABELS_EN: Record<string, string> = {
  Conjunction: 'Conjunction',
  Sextile: 'Sextile',
  Square: 'Square',
  Trine: 'Trine',
  Opposition: 'Opposition',
};

const ASPECT_LABELS_ZH: Record<string, string> = {
  Conjunction: '合相',
  Sextile: '六分相',
  Square: '四分相',
  Trine: '三分相',
  Opposition: '对分相',
};

// ─── Score Dial — single-tone ring (chart-data exception) ────────────────────

function ScoreDial({ score, language }: { score: number; language: 'zh' | 'en' }) {
  const [animated, setAnimated] = useState(0);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 200);
    return () => clearTimeout(timer);
  }, [score]);

  const ringColor =
    score >= 70 ? colors.gold :
    score >= 50 ? colors.purpleLight :
    score >= 30 ? colors.goldLight :
    colors.riskRed;

  const label =
    score >= 70 ? (language === 'zh' ? '高度和谐' : 'Highly harmonious') :
    score >= 50 ? (language === 'zh' ? '中等和谐' : 'Moderately harmonious') :
    (language === 'zh' ? '需要努力' : 'Requires effort');

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-44 w-44">
        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="none" />
          <circle
            cx="80" cy="80" r={radius}
            stroke={ringColor} strokeWidth="10" fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-5xl text-white/90">{animated}</span>
          <span className="text-[10px] uppercase tracking-[0.28em] text-white/40">/ 100</span>
        </div>
      </div>
      <p
        className="mt-4 font-serif text-lg italic"
        style={{ color: ringColor }}
      >
        {label}
      </p>
    </div>
  );
}

// ─── Synastry Wheel — repainted in palette ────────────────────────────────────

function SynastryWheel({
  chart1,
  chart2,
  aspects,
  language,
}: {
  chart1: ChartData;
  chart2: ChartData;
  aspects: Aspect[];
  language: 'zh' | 'en';
}) {
  const size = 480;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 220;
  const innerR = 155;
  const signR = 200;
  const planetDotR = 5;

  function coordFor(r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  const planetMap1 = new Map(chart1.planets.map((p) => [p.name, p]));
  const planetMap2 = new Map(chart2.planets.map((p) => [p.name, p]));

  const aspectLines: Array<{
    x1: number; y1: number; x2: number; y2: number;
    color: string; strength: number;
  }> = [];
  for (const asp of aspects.slice(0, 20)) {
    const p1 = planetMap1.get(asp.planet1);
    const p2 = planetMap2.get(asp.planet2);
    if (!p1 || !p2) continue;
    const c1 = coordFor(outerR, p1.longitude);
    const c2 = coordFor(innerR, p2.longitude);
    aspectLines.push({
      x1: c1.x, y1: c1.y, x2: c2.x, y2: c2.y,
      color: aspectColor(asp.type), strength: asp.strength,
    });
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-lg">
      {/* Outer ring (Person A) */}
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={PERSON_A_TONE} strokeWidth="1.5" opacity="0.45" />
      {/* Inner ring (Person B) */}
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke={PERSON_B_TONE} strokeWidth="1.5" opacity="0.45" />
      {/* Sign ring */}
      <circle cx={cx} cy={cy} r={signR} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="3 5" opacity="0.5" />

      {/* Zodiac signs around outer ring */}
      {ZODIAC_SIGNS.map((sign, i) => {
        const angle = i * 30;
        const outer = coordFor(outerR + 14, angle);
        const signName = language === 'zh' ? sign.nameZh : sign.name.slice(0, 3);
        return (
          <g key={sign.name}>
            <text
              x={outer.x} y={outer.y}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="14" fill="rgba(255,255,255,0.6)"
              transform={`rotate(${angle}, ${outer.x}, ${outer.y})`}
            >
              {sign.symbol}
            </text>
            <text
              x={outer.x} y={outer.y + 14}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="8" fill="rgba(255,255,255,0.35)"
              transform={`rotate(${angle}, ${outer.x}, ${outer.y + 14})`}
            >
              {signName}
            </text>
          </g>
        );
      })}

      {/* Aspect lines */}
      {aspectLines.map((line, i) => (
        <line
          key={i}
          x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
          stroke={line.color}
          strokeWidth={1 + (line.strength / 100) * 2}
          strokeOpacity={0.35 + (line.strength / 100) * 0.45}
        />
      ))}

      {/* Person A planets (outer ring, gold) */}
      {chart1.planets.map((p) => {
        const pos = coordFor(outerR, p.longitude);
        return (
          <g key={`p1-${p.name}`}>
            <circle cx={pos.x} cy={pos.y} r={planetDotR + 1} fill={PERSON_A_TONE} opacity="0.95" />
            <circle cx={pos.x} cy={pos.y} r={planetDotR} fill={colors.gold} />
            <text
              x={pos.x + 8} y={pos.y - 4}
              fontSize="11" fill={PERSON_A_TONE} fontWeight="bold"
            >
              {PLANET_SYMBOLS[p.name] ?? p.name[0]}
            </text>
            <title>Person A: {p.name} {p.signSymbol} {p.signName} {p.degree.toFixed(1)}°</title>
          </g>
        );
      })}

      {/* Person B planets (inner ring, purple) */}
      {chart2.planets.map((p) => {
        const pos = coordFor(innerR, p.longitude);
        return (
          <g key={`p2-${p.name}`}>
            <circle cx={pos.x} cy={pos.y} r={planetDotR + 1} fill={PERSON_B_TONE} opacity="0.95" />
            <circle cx={pos.x} cy={pos.y} r={planetDotR} fill={colors.purple} />
            <text
              x={pos.x - 8} y={pos.y - 4}
              fontSize="11" fill={PERSON_B_TONE} fontWeight="bold"
              textAnchor="end"
            >
              {PLANET_SYMBOLS[p.name] ?? p.name[0]}
            </text>
            <title>Person B: {p.name} {p.signSymbol} {p.signName} {p.degree.toFixed(1)}°</title>
          </g>
        );
      })}

      {/* Center label */}
      <circle cx={cx} cy={cy} r="30" fill="rgba(10,10,10,0.85)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)">
        SYNASTRY
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="11" fill={PERSON_A_TONE} fontStyle="italic">
        天机合盘
      </text>
    </svg>
  );
}

// ─── Aspect Row List ──────────────────────────────────────────────────────────

function AspectList({ aspects, language }: { aspects: Aspect[]; language: 'zh' | 'en' }) {
  const top = aspects.slice(0, 15);
  const aspectLabels = language === 'zh' ? ASPECT_LABELS_ZH : ASPECT_LABELS_EN;
  if (top.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-white/40">
        {language === 'zh' ? '没有显著相位。' : 'No major aspects found.'}
      </p>
    );
  }
  return (
    <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
      {top.map((asp, i) => {
        const c = aspectColor(asp.type);
        return (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2"
          >
            <span
              className="block h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: c }}
            />
            <span className="text-sm" style={{ color: PERSON_A_TONE }}>
              {PLANET_SYMBOLS[asp.planet1] ?? asp.planet1}
            </span>
            <span
              className="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.18em]"
              style={{ borderColor: `${c}66`, color: c }}
            >
              {aspectLabels[asp.type] ?? asp.type}
            </span>
            <span className="text-sm" style={{ color: PERSON_B_TONE }}>
              {PLANET_SYMBOLS[asp.planet2] ?? asp.planet2}
            </span>
            <span className="ml-auto text-[11px] text-white/40">
              {asp.strength}% · orb {asp.orb}°
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Person Form (inside GlassCard) ───────────────────────────────────────────

interface PersonFormData {
  birthDate: string;
  birthTime: string;
  lat: string;
  lng: string;
}

function PersonForm({
  label,
  tone,
  toneLabel,
  data,
  onChange,
  language,
  formId,
}: {
  label: string;
  tone: string;
  toneLabel: string;
  data: PersonFormData;
  onChange: (d: Partial<PersonFormData>) => void;
  language: 'zh' | 'en';
  formId: string;
}) {
  return (
    <GlassCard
      level="card"
      className="rounded-[1.5rem] border border-white/[0.06] bg-black/20 p-5"
    >
      <div className="mb-4 flex items-center gap-2">
        <span
          className="block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: tone, boxShadow: `0 0 14px ${tone}aa` }}
        />
        <span className="font-serif text-base italic" style={{ color: tone }}>
          {label}
        </span>
        <span className="ml-auto text-[10px] uppercase tracking-[0.22em] text-white/35">
          {toneLabel}
        </span>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor={`${formId}-birth-date`}
              className="mb-1 block text-[10px] uppercase tracking-[0.22em] text-white/35"
            >
              {language === 'zh' ? '出生日期' : 'Birth date'}
            </label>
            <input
              id={`${formId}-birth-date`}
              type="date"
              value={data.birthDate}
              onChange={(e) => onChange({ birthDate: e.target.value })}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white/85 transition-all focus:border-purple-500/40 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor={`${formId}-birth-time`}
              className="mb-1 block text-[10px] uppercase tracking-[0.22em] text-white/35"
            >
              {language === 'zh' ? '出生时间' : 'Birth time'}
            </label>
            <input
              id={`${formId}-birth-time`}
              type="time"
              value={data.birthTime}
              onChange={(e) => onChange({ birthTime: e.target.value })}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white/85 transition-all focus:border-purple-500/40 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor={`${formId}-latitude`}
              className="mb-1 block text-[10px] uppercase tracking-[0.22em] text-white/35"
            >
              {language === 'zh' ? '纬度' : 'Latitude'}
            </label>
            <input
              id={`${formId}-latitude`}
              type="number"
              step="0.0001"
              min="-90"
              max="90"
              value={data.lat}
              onChange={(e) => onChange({ lat: e.target.value })}
              placeholder="35.6762"
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-white/85 transition-all focus:border-purple-500/40 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor={`${formId}-longitude`}
              className="mb-1 block text-[10px] uppercase tracking-[0.22em] text-white/35"
            >
              {language === 'zh' ? '经度' : 'Longitude'}
            </label>
            <input
              id={`${formId}-longitude`}
              type="number"
              step="0.0001"
              min="-180"
              max="180"
              value={data.lng}
              onChange={(e) => onChange({ lng: e.target.value })}
              placeholder="139.6503"
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-white/85 transition-all focus:border-purple-500/40 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ─── Narrative blocks (pre-result scroll story) ──────────────────────────────

const NARRATIVE_BLOCKS_EN = [
  {
    label: '01',
    heading: 'Two charts, side by side.',
    body: 'We compute both natal charts in the Swiss Ephemeris, then overlay them so Person A becomes the outer wheel and Person B the inner. The geometry is the geometry — no decoration.',
  },
  {
    label: '02',
    heading: 'Aspects, bucketed honestly.',
    body: 'Conjunctions, trines, and sextiles are the supportive bucket. Squares and oppositions are the challenging bucket. We do not paint a rainbow over relationships that have real friction.',
  },
  {
    label: '03',
    heading: 'A composite chart you can read together.',
    body: 'Composite mode computes the midpoints of every pair of planets and treats the result as its own chart — the relationship as a third entity, with its own houses, planets, and themes.',
  },
];

const NARRATIVE_BLOCKS_ZH = [
  {
    label: '01',
    heading: '两张星盘 同时摊开。',
    body: '我们用 Swiss Ephemeris 同时算出两张本命星盘 把人物 A 作外圈 人物 B 作内圈叠在一起 几何就是几何 不做美化。',
  },
  {
    label: '02',
    heading: '相位 诚实地分两栏。',
    body: '合相 三分相 六分相归到“支持”那一栏 四分相 对分相归到“挑战”那一栏 我们不会用彩虹去掩盖真正存在的张力。',
  },
  {
    label: '03',
    heading: '一张你们可以共同阅读的复合盘。',
    body: '复合盘把两人每颗行星的中间点算出来 然后当作一张独立的星盘来读 这段关系就是一个独立的存在 有自己的宫位 行星 和主题。',
  },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

const DEFAULT_PERSON_A: PersonFormData = { birthDate: '2000-08-16', birthTime: '12:00', lat: '35.6762', lng: '139.6503' };
const DEFAULT_PERSON_B: PersonFormData = { birthDate: '1998-05-22', birthTime: '14:30', lat: '40.7128', lng: '-74.0060' };

export default function SynastryPage() {
  const [language, setLanguage] = useSyncedLanguage('en');
  const [synastryType, setSynastryType] = useState<SynastryType>('overlay');
  const [person1Data, setPerson1Data] = useState<PersonFormData>(DEFAULT_PERSON_A);
  const [person2Data, setPerson2Data] = useState<PersonFormData>(DEFAULT_PERSON_B);
  const [enhanceWithAI, setEnhanceWithAI] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<SynastryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  void setLanguage;

  const copy = moduleLandingCopy.synastry[language];

  const t = useCallback(
    (en: string, zh: string) => (language === 'zh' ? zh : en),
    [language]
  );

  const handleCalculate = useCallback(async () => {
    setIsCalculating(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/synastry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person1: {
            birthDate: person1Data.birthDate,
            birthTime: person1Data.birthTime,
            lat: parseFloat(person1Data.lat),
            lng: parseFloat(person1Data.lng),
          },
          person2: {
            birthDate: person2Data.birthDate,
            birthTime: person2Data.birthTime,
            lat: parseFloat(person2Data.lat),
            lng: parseFloat(person2Data.lng),
          },
          enhanceWithAI,
          language,
          type: synastryType,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }

      const data: SynastryResponse = await res.json();
      setResult(data);
      setTimeout(
        () => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        100
      );

      saveReading({
        reading_type: 'synastry',
        title: `Synastry · ${synastryType} · ${data.overallScore}/100`,
        summary: `${person1Data.birthDate} & ${person2Data.birthDate} · ${data.aspects.length} aspects · score ${data.overallScore}`,
        reading_data: data as unknown as Record<string, unknown>,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : t('Calculation failed', '计算出错'));
    } finally {
      setIsCalculating(false);
    }
  }, [person1Data, person2Data, enhanceWithAI, language, synastryType, t]);

  const aspectsForList =
    !result?.meta || result.meta.type === 'overlay' ? result?.aspects ?? [] : [];

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
        posterSrc="/assets/images/posters/western-hero-poster-16x9.jpg"
        imageSrc="/assets/images/posters/western-hero-poster-16x9.jpg"
        meta={<TrustStrip items={[...copy.trustItems]} className="w-full max-w-3xl" />}
      >
        <ModuleInputShell
          eyebrow={copy.form.eyebrow}
          title={copy.form.title}
          description={copy.form.description}
          footer={copy.form.footer}
        >
          <div className="space-y-5">
            {/* Two person forms */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <PersonForm
                label={t('Person A', '人物 A')}
                tone={PERSON_A_TONE}
                toneLabel={t('Outer wheel · Gold', '外圈 · 金')}
                data={person1Data}
                onChange={(d) => setPerson1Data((prev) => ({ ...prev, ...d }))}
                language={language}
                formId="person-a"
              />
              <PersonForm
                label={t('Person B', '人物 B')}
                tone={PERSON_B_TONE}
                toneLabel={t('Inner wheel · Purple', '内圈 · 紫')}
                data={person2Data}
                onChange={(d) => setPerson2Data((prev) => ({ ...prev, ...d }))}
                language={language}
                formId="person-b"
              />
            </div>

            {/* Mode + AI toggle inside one GlassCard */}
            <GlassCard
              level="soft"
              className="space-y-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <div>
                <div className="mb-2 text-[10px] uppercase tracking-[0.28em] text-white/40">
                  {t('Analysis mode', '分析模式')}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(['overlay', 'composite', 'davison'] as SynastryType[]).map((tp) => {
                    const active = synastryType === tp;
                    return (
                      <button
                        key={tp}
                        type="button"
                        onClick={() => setSynastryType(tp)}
                        className="rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.22em] transition-all"
                        style={{
                          borderColor: active ? `${colors.goldLight}88` : 'rgba(255,255,255,0.12)',
                          backgroundColor: active ? 'rgba(245,197,66,0.06)' : 'rgba(255,255,255,0.02)',
                          color: active ? colors.goldLight : 'rgba(255,255,255,0.6)',
                        }}
                      >
                        {tp === 'overlay' ? t('Overlay', '叠盘')
                          : tp === 'composite' ? t('Composite', '复合盘')
                          : t('Davison', '戴维森')}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs leading-6 text-white/50">
                  {synastryType === 'overlay'
                    ? t('Overlay both charts and read the aspects between them.', '把两张星盘叠在一起 读出彼此之间的相位。')
                    : synastryType === 'composite'
                    ? t('Compute midpoints of both charts to form a combined relationship chart.', '通过两人星盘的中间点 形成一张共同的关系盘。')
                    : t('Time-weighted midpoint chart that more precisely reflects the relationship core.', '时间加权的中点盘 更精确地反映关系本质。')}
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={enhanceWithAI}
                  onChange={(e) => setEnhanceWithAI(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/5"
                />
                <span className="text-xs text-white/70">
                  {t('Add AI deep interpretation', '叠加 AI 深度解读')}
                </span>
              </label>
            </GlassCard>

            <button
              type="button"
              onClick={handleCalculate}
              disabled={isCalculating}
              className="w-full rounded-2xl border border-white/[0.14] bg-white/[0.06] px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white/90 transition-all hover:border-white/30 hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ boxShadow: '0 0 36px rgba(245, 197, 66, 0.16)' }}
            >
              {isCalculating
                ? t('Calculating…', '计算中…')
                : copy.primaryCta}
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

      {/* Pre-result narrative */}
      {!result && !isCalculating && !error && (
        <ScrollNarrativeSection
          accentColor="#7c3aed"
          goldColor="#D4AF37"
          blocks={language === 'zh' ? NARRATIVE_BLOCKS_ZH : NARRATIVE_BLOCKS_EN}
        />
      )}

      {/* Result */}
      {result && (
        <div ref={resultRef}>
          <ResultScaffold
            eyebrow={t('SYNASTRY READING', '合盘解读')}
            title={t(
              'How these two charts read together.',
              '两张星盘 共同读出来的样子。'
            )}
            subtitle={t(
              `Mode · ${synastryType.toUpperCase()}  ·  ${result.aspects.length} major aspects`,
              `模式 · ${synastryType.toUpperCase()}  ·  ${result.aspects.length} 个主要相位`
            )}
            overview={
              <div className="grid gap-5 lg:grid-cols-2">
                <GlassCard
                  level="card"
                  className="flex flex-col items-center justify-center rounded-[1.5rem] border border-white/[0.06] bg-black/25 p-6"
                >
                  <div className="text-[10px] uppercase tracking-[0.28em] text-white/40">
                    {t('Compatibility score', '综合评分')}
                  </div>
                  <div className="mt-4">
                    <ScoreDial score={result.overallScore} language={language} />
                  </div>
                  <p className="mt-4 text-xs text-white/45">
                    {result.aspects.length} {t('major aspects', '个主要相位')}
                  </p>
                </GlassCard>

                <GlassCard
                  level="card"
                  className="rounded-[1.5rem] border border-white/[0.06] bg-black/25 p-5"
                >
                  <div className="text-[10px] uppercase tracking-[0.28em] text-white/40">
                    {t('Synastry wheel', '合盘星图')}
                  </div>
                  <div className="mt-4">
                    <SynastryWheel
                      chart1={result.person1Chart}
                      chart2={result.person2Chart}
                      aspects={result.aspects}
                      language={language}
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-6 text-[11px] text-white/55">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PERSON_A_TONE }} />
                      {t('Person A · outer', '人物 A · 外圈')}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PERSON_B_TONE }} />
                      {t('Person B · inner', '人物 B · 内圈')}
                    </span>
                  </div>
                </GlassCard>
              </div>
            }
            highlights={
              <div className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  {[
                    { label: t('Person A planets', '人物 A 行星位置'), chart: result.person1Chart, tone: PERSON_A_TONE },
                    { label: t('Person B planets', '人物 B 行星位置'), chart: result.person2Chart, tone: PERSON_B_TONE },
                  ].map((pane) => (
                    <GlassCard
                      key={pane.label}
                      level="soft"
                      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
                    >
                      <div
                        className="mb-3 font-serif text-sm italic"
                        style={{ color: pane.tone }}
                      >
                        {pane.label}
                      </div>
                      <div className="space-y-1">
                        {pane.chart.planets.map((p) => (
                          <div
                            key={p.name}
                            className="flex items-center justify-between border-b border-white/[0.05] py-1 last:border-0"
                          >
                            <span className="w-20 text-sm text-white/75">{p.name}</span>
                            <span className="text-sm text-white/55">
                              {p.signSymbol} {p.signName} {p.degree.toFixed(1)}°
                            </span>
                            <span className="w-16 text-right text-[10px] text-white/30">
                              {p.longitude.toFixed(1)}°
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 border-t border-white/[0.05] pt-2 text-[11px] text-white/40">
                        ASC: {pane.chart.houses.ascendant.toFixed(1)}° · MC:{' '}
                        {pane.chart.houses.midheaven.toFixed(1)}°
                      </div>
                    </GlassCard>
                  ))}
                </div>

                {/* Overlay aspects list */}
                {aspectsForList.length > 0 && (
                  <GlassCard
                    level="soft"
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
                  >
                    <div className="mb-3 text-[0.68rem] uppercase tracking-[0.28em] text-white/40">
                      {t('Aspect list', '相位列表')}
                    </div>
                    <AspectList aspects={aspectsForList} language={language} />
                  </GlassCard>
                )}

                {/* Composite / Davison */}
                {(result.compositeChart || result.davisonChart) && (() => {
                  const chartData = result.compositeChart ?? result.davisonChart;
                  const chartType = result.meta?.type ?? 'composite';
                  if (!chartData) return null;
                  return (
                    <div className="space-y-4">
                      <GlassCard
                        level="soft"
                        className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
                      >
                        <div
                          className="mb-3 font-serif text-sm italic"
                          style={{ color: colors.goldLight }}
                        >
                          {chartType === 'davison'
                            ? t('Davison chart planets', '戴维森盘行星')
                            : t('Composite chart planets', '复合盘行星')}
                        </div>
                        <div className="space-y-1">
                          {chartData.planets.map((p) => (
                            <div
                              key={p.name}
                              className="flex items-center justify-between border-b border-white/[0.05] py-1 last:border-0"
                            >
                              <span className="w-20 text-sm text-white/75">{p.name}</span>
                              <span className="text-sm text-white/55">
                                {p.signSymbol} {p.signName} {p.degree.toFixed(1)}°
                              </span>
                              <span className="w-16 text-right text-[10px] text-white/30">
                                {p.longitude.toFixed(1)}°
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 border-t border-white/[0.05] pt-2 text-[11px] text-white/40">
                          ASC: {chartData.houses.ascendant.toFixed(1)}° · MC:{' '}
                          {chartData.houses.midheaven.toFixed(1)}°
                        </div>
                      </GlassCard>

                      {chartData.midpointStructures && chartData.midpointStructures.length > 0 && (
                        <GlassCard
                          level="soft"
                          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
                        >
                          <div
                            className="mb-3 font-serif text-sm italic"
                            style={{ color: colors.purpleLight }}
                          >
                            {t('Midpoint structures', '中间点结构')}
                          </div>
                          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                            {chartData.midpointStructures.map((ms, i) => {
                              const sensColor =
                                ms.sensitivity === 'high'
                                  ? colors.gold
                                  : ms.sensitivity === 'medium'
                                  ? colors.goldLight
                                  : colors.purpleLight;
                              return (
                                <div
                                  key={i}
                                  className="flex items-center gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] p-2"
                                >
                                  <span
                                    className="h-2 w-2 shrink-0 rounded-full"
                                    style={{ backgroundColor: sensColor }}
                                  />
                                  <span className="text-sm" style={{ color: PERSON_A_TONE }}>
                                    {ms.planet1}
                                  </span>
                                  <span className="text-xs text-white/40">·</span>
                                  <span className="text-sm" style={{ color: PERSON_B_TONE }}>
                                    {ms.planet2}
                                  </span>
                                  <span className="ml-auto text-[11px] text-white/40">
                                    {ms.structureType} · {ms.thirdPlanet} @{' '}
                                    {ms.aspectToThird.toFixed(1)}°
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </GlassCard>
                      )}
                    </div>
                  );
                })()}
              </div>
            }
            details={
              result.aiInterpretation ? (
                <GlassCard
                  level="card"
                  className="rounded-[1.5rem] border border-white/[0.06] bg-black/25 p-6"
                >
                  <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/40">
                    {t('AI deep interpretation', 'AI 深度解读')}
                  </div>
                  <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-white/72">
                    {result.aiInterpretation}
                  </div>
                  {result.disclaimer && (
                    <p className="mt-4 border-t border-white/[0.06] pt-3 text-[11px] italic text-white/35">
                      {result.disclaimer}
                    </p>
                  )}
                </GlassCard>
              ) : null
            }
            aside={null}
          />

          <LandingSection
            eyebrow={t('Save · Share', '保存 · 分享')}
            title={t(
              'Take this reading with you.',
              '把这次解读 带走。'
            )}
            subtitle={t(
              'Saved to your reading history automatically. Export a PDF or share a summary.',
              '已自动保存到你的解读历史。导出 PDF 或分享要点。'
            )}
          >
            <div className="mx-auto max-w-2xl space-y-4">
              <GlassCard
                level="card"
                className="rounded-[1.75rem] border border-white/[0.06] bg-black/20 p-6 sm:p-8"
              >
                <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                  {t('Share panel', '分享面板')}
                </div>
                <p className="mt-3 text-sm leading-7 text-white/60">
                  {t(
                    'Share a clean summary of this synastry — score, mode, aspect count.',
                    '分享一份简洁摘要 — 综合分 模式 主要相位数。'
                  )}
                </p>
                <div className="mt-5">
                  <SharePanel
                    serviceType="synastry"
                    resultId={`${person1Data.birthDate}_${person2Data.birthDate}_${synastryType}`}
                    shareUrl="https://tianji.global/synastry"
                  />
                </div>
              </GlassCard>

              <GlassCard
                level="card"
                className="rounded-[1.75rem] border border-white/[0.06] bg-black/20 p-6 sm:p-8"
              >
                <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                  {t('PDF export', 'PDF 导出')}
                </div>
                <p className="mt-3 text-sm leading-7 text-white/60">
                  {t(
                    'Generate a printable report with the wheel, planet tables, and AI interpretation.',
                    '生成一份包含合盘星图 行星表格 AI 解读的 PDF 报告。'
                  )}
                </p>
                <div className="mt-5">
                  <PDFDownloadButton
                    serviceType="synastry"
                    resultData={result as unknown as Record<string, unknown>}
                    birthData={{
                      name: t('Synastry', '合盘'),
                      birthday: `${person1Data.birthDate} & ${person2Data.birthDate}`,
                    }}
                    language={language}
                  />
                </div>
              </GlassCard>
            </div>
          </LandingSection>
        </div>
      )}
    </main>
  );
}
