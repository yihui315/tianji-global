'use client';

/**
 * Transit (Secondary Progressions) — TianJi Global
 *
 * Rewritten under the tianji-cinematic design skill (.claude/skills/tianji-cinematic/SKILL.md).
 * Recipe: §7.1 reading-input page (single-input, single-result + chart variant).
 *
 * Note: this route is named "transit" but the engine implements
 * secondary progressions (1 day post-birth = 1 year of life).
 *
 * What changed vs. the previous version:
 *   - Removed blue-purple gradient title — Instrument Serif italic via BackgroundVideoHero.
 *   - Replaced traffic-light MOTION_COLORS (green / red / amber) with a palette-respecting trio:
 *       direct → goldLight  ·  retrograde → riskRed  ·  station → goldLight
 *     (chart-data exception only — riskRed used as a status delta, not a brand color).
 *   - Replaced the blue-vs-purple natal/progressed ring pair with goldLight + purpleLight.
 *   - All cards wrapped in <GlassCard>; copy through `moduleLandingCopy.transit`.
 *   - Added saveReading() on success.
 *
 * API contract preserved — POST /api/transit with
 *   { birthDate, birthTime, lat, lng, targetDate, includeMotion, includeInterpretation }.
 */

import { useState, useCallback, useRef } from 'react';
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

// ─── Types ─────────────────────────────────────────────────────────────────

interface PlanetTransitData {
  name: string;
  longitude: number;
  natalLongitude: number;
  sign: number;
  signName: string;
  signSymbol: string;
  degree: number;
  motion: 'direct' | 'retrograde' | 'station';
  speed: number;
  isRetrograde: boolean;
}

interface MotionData {
  planet: string;
  currentMotion: 'direct' | 'retrograde' | 'station';
  speed: number;
  status: string;
}

interface TransitResponse {
  birthDate: string;
  birthTime: string;
  targetDate: string;
  age: number;
  progressedDays: number;
  planets: PlanetTransitData[];
  majorTransits: string[];
  motionAnalysis: MotionData[];
  interpretation: string;
}

// ─── Tokens ────────────────────────────────────────────────────────────────

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
};

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

// Motion → palette colors (data-chart exception).
function motionColor(motion: 'direct' | 'retrograde' | 'station'): string {
  if (motion === 'retrograde') return colors.riskRed;
  if (motion === 'station') return colors.gold;
  return colors.goldLight;
}

const NATAL_TONE = colors.purpleLight; // inner ring
const PROGRESSED_TONE = colors.goldLight; // outer ring

// ─── Planet Wheel ──────────────────────────────────────────────────────────

function PlanetWheel({
  planets,
  language,
}: {
  planets: PlanetTransitData[];
  language: 'zh' | 'en';
}) {
  const size = 460;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 210;
  const innerR = 145;
  const signR = 180;

  function coordFor(r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-md">
      {/* Outer ring (progressed) */}
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={PROGRESSED_TONE} strokeWidth="1.5" opacity="0.4" />
      {/* Inner ring (natal) */}
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke={NATAL_TONE} strokeWidth="1.5" opacity="0.4" />
      {/* Sign ring */}
      <circle cx={cx} cy={cy} r={signR} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="3 5" opacity="0.5" />

      {/* Zodiac signs */}
      {ZODIAC_SIGNS.map((sign, i) => {
        const angle = i * 30;
        const outer = coordFor(outerR + 14, angle);
        const signLabel = language === 'zh' ? sign.nameZh : sign.name.slice(0, 3);
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
              fontSize="8" fill="rgba(255,255,255,0.3)"
              transform={`rotate(${angle}, ${outer.x}, ${outer.y + 14})`}
            >
              {signLabel}
            </text>
          </g>
        );
      })}

      {/* Natal positions (inner ring) */}
      {planets.map((p) => {
        const pos = coordFor(innerR, p.natalLongitude);
        return (
          <g key={`natal-${p.name}`}>
            <circle cx={pos.x} cy={pos.y} r="6" fill={`${NATAL_TONE}55`} stroke={NATAL_TONE} strokeWidth="1" />
            <text
              x={pos.x} y={pos.y + 3}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="8" fill={NATAL_TONE}
            >
              {PLANET_SYMBOLS[p.name] ?? p.name[0]}
            </text>
            <title>Natal {p.name}: {p.signSymbol} {p.signName} {p.degree.toFixed(1)}°</title>
          </g>
        );
      })}

      {/* Progressed positions (outer ring) */}
      {planets.map((p) => {
        const pos = coordFor(outerR - 12, p.longitude);
        const tone = motionColor(p.motion);
        return (
          <g key={`progressed-${p.name}`}>
            <circle cx={pos.x} cy={pos.y} r="9" fill={`${tone}33`} stroke={tone} strokeWidth="1" />
            <text
              x={pos.x} y={pos.y + 3}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="10" fill={tone} fontWeight="bold"
            >
              {PLANET_SYMBOLS[p.name] ?? p.name[0]}
            </text>
            {p.motion === 'retrograde' && (
              <text
                x={pos.x + 12} y={pos.y - 10}
                fontSize="10" fill={colors.riskRed} fontWeight="bold"
              >
                R
              </text>
            )}
            <title>
              Progressed {p.name}: {p.signSymbol} {p.signName} {p.degree.toFixed(1)}° ({p.motion})
            </title>
          </g>
        );
      })}

      {/* Center label */}
      <circle cx={cx} cy={cy} r="30" fill="rgba(10,10,10,0.85)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)">
        PROGRESSED
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="11" fill={colors.gold} fontStyle="italic">
        次限推运
      </text>
    </svg>
  );
}

// ─── Motion Legend ─────────────────────────────────────────────────────────

function MotionLegend({ language }: { language: 'zh' | 'en' }) {
  const items = [
    { motion: 'direct' as const, en: 'Direct', zh: '顺行' },
    { motion: 'retrograde' as const, en: 'Retrograde', zh: '逆行' },
    { motion: 'station' as const, en: 'Station', zh: '静止' },
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
      {items.map((it) => (
        <div key={it.motion} className="flex items-center gap-2">
          <span
            className="block h-2 w-2 rounded-full"
            style={{ backgroundColor: motionColor(it.motion) }}
          />
          <span className="text-white/55">{language === 'zh' ? it.zh : it.en}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Planet List ───────────────────────────────────────────────────────────

function PlanetList({
  planets,
  language,
}: {
  planets: PlanetTransitData[];
  language: 'zh' | 'en';
}) {
  return (
    <div className="space-y-1.5">
      {planets.map((p) => {
        const tone = motionColor(p.motion);
        return (
          <div
            key={p.name}
            className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-base"
              style={{
                backgroundColor: `${tone}1f`,
                border: `1px solid ${tone}55`,
                color: tone,
              }}
            >
              {PLANET_SYMBOLS[p.name] ?? p.name[0]}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-white/85">{p.name}</span>
                <span className="text-sm text-white/55">
                  {p.signSymbol} {p.signName} {p.degree.toFixed(1)}°
                </span>
                {p.motion === 'retrograde' && (
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] uppercase tracking-[0.2em]"
                    style={{
                      backgroundColor: `${colors.riskRed}1f`,
                      color: colors.riskRed,
                    }}
                  >
                    R
                  </span>
                )}
                {p.motion === 'station' && (
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] uppercase tracking-[0.2em]"
                    style={{
                      backgroundColor: `${colors.gold}1f`,
                      color: colors.gold,
                    }}
                  >
                    {language === 'zh' ? '静止' : 'Station'}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-white/35">
                {language === 'zh' ? '出生位置' : 'Natal'}: {p.natalLongitude.toFixed(2)}°
                <span className="mx-2 text-white/20">·</span>
                {language === 'zh' ? '速度' : 'Motion'}: {p.speed.toFixed(3)}°/day
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Narrative blocks ──────────────────────────────────────────────────────

const NARRATIVE_BLOCKS_EN = [
  {
    label: '01',
    heading: 'One day for every year you have lived.',
    body: 'Secondary progressions take your birth chart and walk it forward — one day for each year of life. The position of the Sun on the day you turned 27 is your progressed Sun at age 27.',
  },
  {
    label: '02',
    heading: 'A slow inner clock, not the daily sky.',
    body: 'Where transits track the live sky, progressions track an inner clock that moves much slower. The progressed Moon takes about 27 years to circle the chart — so a sign change there is a real, multi-year shift.',
  },
  {
    label: '03',
    heading: 'Retrograde and station are real markers.',
    body: 'When a progressed planet stations or turns retrograde, that signals a long inner reorientation. We mark those moments clearly so they are not lost in the noise.',
  },
];

const NARRATIVE_BLOCKS_ZH = [
  {
    label: '01',
    heading: '出生后的一天 等于人生的一年。',
    body: '次限推运把出生星盘往前推 —— 每一岁对应出生后的一天 你 27 岁时的推运太阳 就是出生 27 天那天太阳的位置。',
  },
  {
    label: '02',
    heading: '一条慢节奏的内在时钟 不是每天的天空。',
    body: '行运盯着每天的天空 推运盯着的是内在的慢节律 推运月亮要走完一圈大约 27 年 所以一次换座 就是一段持续多年的转折。',
  },
  {
    label: '03',
    heading: '逆行与静止 是真实存在的标记。',
    body: '当一颗推运行星静止 或转入逆行 那就是一段持续很久的内在重新定位 我们把这些时刻标得清楚 不让它们被淹没在数据里。',
  },
];

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function TransitPage() {
  const [language, setLanguage] = useSyncedLanguage('en');
  const [birthDate, setBirthDate] = useState('2000-01-01');
  const [birthTime, setBirthTime] = useState('12:00');
  const [targetDate, setTargetDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [lat, setLat] = useState('35.6762');
  const [lng, setLng] = useState('139.6503');
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<TransitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  void setLanguage;

  const copy = moduleLandingCopy.transit[language];

  const t = useCallback(
    (en: string, zh: string) => (language === 'zh' ? zh : en),
    [language]
  );

  const handleCalculate = useCallback(async () => {
    setIsCalculating(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/transit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate,
          birthTime,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          targetDate,
          includeMotion: true,
          includeInterpretation: true,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }

      const data: TransitResponse = await res.json();
      setResult(data);
      setTimeout(
        () => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        100
      );

      saveReading({
        reading_type: 'transit',
        title: `Progressions · ${data.birthDate} → ${data.targetDate}`,
        summary: `Age ${data.age.toFixed(1)} · ${data.progressedDays} progressed days · ${data.planets.length} planets`,
        reading_data: data as unknown as Record<string, unknown>,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : t('Calculation failed', '计算出错'));
    } finally {
      setIsCalculating(false);
    }
  }, [birthDate, birthTime, lat, lng, targetDate, t]);

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
        >
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="t-birth-date"
                  className="mb-1.5 block text-[10px] uppercase tracking-[0.28em] text-white/35"
                >
                  {t('Birth date', '出生日期')}
                </label>
                <input
                  id="t-birth-date"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white/85 transition-all focus:border-purple-500/40 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="t-birth-time"
                  className="mb-1.5 block text-[10px] uppercase tracking-[0.28em] text-white/35"
                >
                  {t('Birth time', '出生时间')}
                </label>
                <input
                  id="t-birth-time"
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white/85 transition-all focus:border-purple-500/40 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="t-target-date"
                className="mb-1.5 block text-[10px] uppercase tracking-[0.28em] text-white/35"
              >
                {t('Progression date', '推运日期')}
              </label>
              <input
                id="t-target-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white/85 transition-all focus:border-purple-500/40 focus:outline-none"
              />
              <p className="mt-1.5 text-[11px] text-white/40">
                {t(
                  'Rule: each day after birth represents one year of life.',
                  '规则: 出生后每一天 代表生命的一年。'
                )}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="t-latitude"
                  className="mb-1.5 block text-[10px] uppercase tracking-[0.28em] text-white/35"
                >
                  {t('Latitude', '纬度')}
                </label>
                <input
                  id="t-latitude"
                  type="number"
                  step="0.0001"
                  min="-90"
                  max="90"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white/85 transition-all focus:border-purple-500/40 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="t-longitude"
                  className="mb-1.5 block text-[10px] uppercase tracking-[0.28em] text-white/35"
                >
                  {t('Longitude', '经度')}
                </label>
                <input
                  id="t-longitude"
                  type="number"
                  step="0.0001"
                  min="-180"
                  max="180"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white/85 transition-all focus:border-purple-500/40 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleCalculate}
              disabled={isCalculating}
              className="w-full rounded-2xl border border-white/[0.14] bg-white/[0.06] px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white/90 transition-all hover:border-white/30 hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ boxShadow: '0 0 36px rgba(245, 197, 66, 0.16)' }}
            >
              {isCalculating ? t('Calculating…', '计算中…') : copy.primaryCta}
            </button>
          </div>
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

      {!result && !isCalculating && !error && (
        <ScrollNarrativeSection
          accentColor="#7c3aed"
          goldColor="#D4AF37"
          blocks={language === 'zh' ? NARRATIVE_BLOCKS_ZH : NARRATIVE_BLOCKS_EN}
        />
      )}

      {result && (
        <div ref={resultRef}>
          <ResultScaffold
            eyebrow={t('PROGRESSION READING', '推运解读')}
            title={t(
              `The progressed chart at age ${result.age.toFixed(1)}.`,
              `${result.age.toFixed(1)} 岁的推运盘。`
            )}
            subtitle={t(
              `${result.progressedDays} progressed days · ${result.planets.length} planets · target ${result.targetDate}`,
              `推运 ${result.progressedDays} 天 · ${result.planets.length} 颗行星 · 目标 ${result.targetDate}`
            )}
            overview={
              <div className="grid gap-5 lg:grid-cols-2">
                <GlassCard
                  level="card"
                  className="rounded-[1.5rem] border border-white/[0.06] bg-black/25 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.28em] text-white/40">
                        {t('Progression at a glance', '推运速览')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className="font-serif text-4xl italic"
                        style={{ color: colors.gold }}
                      >
                        {result.age.toFixed(1)}
                      </div>
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                        {t('years', '岁')}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                        {t('Birth', '出生日期')}
                      </div>
                      <div className="mt-1 text-sm text-white/85">
                        {result.birthDate}{' '}
                        <span className="text-white/45">{result.birthTime}</span>
                      </div>
                    </div>
                    <div
                      className="rounded-xl border p-3"
                      style={{
                        borderColor: `${colors.gold}55`,
                        backgroundColor: `${colors.gold}10`,
                      }}
                    >
                      <div
                        className="text-[10px] uppercase tracking-[0.22em]"
                        style={{ color: colors.goldLight }}
                      >
                        {t('Target date', '目标日期')}
                      </div>
                      <div className="mt-1 font-serif text-base italic text-white/90">
                        {result.targetDate}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                        {t('Progressed days', '推运天数')}
                      </div>
                      <div className="mt-1 text-sm text-white/85">
                        {result.progressedDays}
                      </div>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard
                  level="card"
                  className="rounded-[1.5rem] border border-white/[0.06] bg-black/25 p-5"
                >
                  <div className="text-[10px] uppercase tracking-[0.28em] text-white/40">
                    {t('Progressed wheel', '推运星盘')}
                  </div>
                  <div className="mt-4">
                    <PlanetWheel planets={result.planets} language={language} />
                  </div>
                  <div className="mt-3">
                    <MotionLegend language={language} />
                  </div>
                  <p className="mt-3 text-center text-[11px] text-white/40">
                    {t(
                      'Outer ring · progressed  ·  Inner ring · natal',
                      '外圈 · 推运  ·  内圈 · 出生'
                    )}
                  </p>
                </GlassCard>
              </div>
            }
            highlights={
              <div className="space-y-5">
                <GlassCard
                  level="soft"
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
                >
                  <div className="mb-4 text-[0.68rem] uppercase tracking-[0.28em] text-white/40">
                    {t('Planet details', '行星详情')}
                  </div>
                  <PlanetList planets={result.planets} language={language} />
                </GlassCard>

                {result.majorTransits.length > 0 && (
                  <GlassCard
                    level="soft"
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
                  >
                    <div className="mb-4 text-[0.68rem] uppercase tracking-[0.28em] text-white/40">
                      {t('Major progressions', '重要推运')}
                    </div>
                    <ul className="space-y-2">
                      {result.majorTransits.map((transit, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-sm leading-6 text-white/72"
                        >
                          <span style={{ color: colors.purpleLight }}>✦</span>
                          <span>{transit}</span>
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                )}
              </div>
            }
            details={
              result.interpretation ? (
                <GlassCard
                  level="card"
                  className="rounded-[1.5rem] border border-white/[0.06] bg-black/25 p-6"
                >
                  <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/40">
                    {t('Interpretation', '解读')}
                  </div>
                  <div className="mt-4 whitespace-pre-line text-sm leading-7 text-white/72">
                    {result.interpretation}
                  </div>
                </GlassCard>
              ) : null
            }
            aside={null}
          />

          <LandingSection
            eyebrow={t('Save · Share', '保存 · 分享')}
            title={t(
              'Take this progression with you.',
              '把这次推运 带在身边。'
            )}
            subtitle={t(
              'Saved to your reading history. Export a PDF or share a summary.',
              '已保存到解读历史。导出 PDF 或分享要点。'
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
                    'Share a clean summary of this progression — age, target, and notable shifts.',
                    '分享一份简洁摘要 —— 年纪 目标日期 与显著转折。'
                  )}
                </p>
                <div className="mt-5">
                  <SharePanel
                    serviceType="transit"
                    resultId={`${result.birthDate}_${result.targetDate}`}
                    shareUrl="https://tianji.global/transit"
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
                    'Generate a printable report with the wheel, planet details, and interpretation.',
                    '生成一份包含星盘 行星详情 与解读的 PDF 报告。'
                  )}
                </p>
                <div className="mt-5">
                  <PDFDownloadButton
                    serviceType="western"
                    resultData={result as unknown as Record<string, unknown>}
                    birthData={{
                      name: t('Progression', '推运'),
                      birthday: `${result.birthDate} ${result.birthTime}`,
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
