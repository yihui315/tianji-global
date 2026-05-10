'use client';

/**
 * Solar Return — TianJi Global
 *
 * Rewritten under the tianji-cinematic design skill (.claude/skills/tianji-cinematic/SKILL.md).
 * Recipe: §7.1 reading-input page (single-input, single-result + chart variant).
 *
 * What changed vs. the previous version:
 *   - Removed amber/orange gradient title — Instrument Serif italic via BackgroundVideoHero.
 *   - Removed rainbow PLANET_COLORS / ZODIAC sign colors — chart repainted in
 *     gold (luminaries) + purple (everything else) within the palette law.
 *   - Removed the @astrodraw/astrochart container (third-party rainbow palette)
 *     — kept only the in-house SVG PlanetWheel which we control end-to-end.
 *   - All cards are <GlassCard>; all copy through `moduleLandingCopy.solarReturn`.
 *   - Added saveReading() on success.
 *
 * API contract preserved — POST /api/solar-return with
 *   { birthDate, birthTime, lat, lng, targetYear }.
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

interface PlanetData {
  name: string;
  longitude: number;
  latitude: number;
  sign: number;
  signName: string;
  signSymbol: string;
  degree: number;
  orb: number;
}

interface HouseData {
  houses: number[];
  ascendant: number;
  midheaven: number;
}

interface ChartData {
  planets: PlanetData[];
  houses: HouseData;
  julianDay: number;
}

interface SolarReturnResponse {
  birthDate: string;
  birthTime: string;
  targetYear: number;
  birthdayExactTime: string;
  birthSunLongitude: number;
  chart: ChartData;
  interpretation: string;
  meta: {
    platform: string;
    version: string;
    calculationType: string;
  };
}

// ─── Tokens ────────────────────────────────────────────────────────────────

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

// Luminaries (Sun, Moon) get the gold accent · all other planets get purple.
function planetTone(name: string): string {
  if (name === 'Sun') return colors.gold;
  if (name === 'Moon') return colors.goldLight;
  return colors.purpleLight;
}

// ─── Planet Wheel (palette-locked) ─────────────────────────────────────────

function PlanetWheel({
  chart,
  language,
}: {
  chart: ChartData;
  language: 'zh' | 'en';
}) {
  const size = 460;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 210;
  const innerR = 150;
  const signR = 180;

  function coordFor(r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-md">
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={colors.goldLight} strokeWidth="1.5" opacity="0.4" />
      {/* Inner ring */}
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke={colors.purpleLight} strokeWidth="1.5" opacity="0.4" />
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

      {/* House cusps */}
      {chart.houses.houses.map((cusp, i) => {
        const pos = coordFor(innerR, cusp);
        return (
          <g key={`cusp-${i}`}>
            <line
              x1={cx} y1={cy}
              x2={pos.x} y2={pos.y}
              stroke="rgba(255,255,255,0.15)" strokeWidth="1" opacity="0.4"
            />
            <text
              x={pos.x} y={pos.y}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="7" fill="rgba(255,255,255,0.5)"
            >
              {i + 1}
            </text>
          </g>
        );
      })}

      {/* Planet positions */}
      {chart.planets.map((p) => {
        const pos = coordFor(outerR - 12, p.longitude);
        const tone = planetTone(p.name);
        return (
          <g key={p.name}>
            <circle cx={pos.x} cy={pos.y} r="9" fill={`${tone}33`} stroke={tone} strokeWidth="1" />
            <text
              x={pos.x} y={pos.y + 3}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="10" fill={tone} fontWeight="bold"
            >
              {PLANET_SYMBOLS[p.name] ?? p.name[0]}
            </text>
            <title>{p.name}: {p.signSymbol} {p.signName} {p.degree.toFixed(1)}°</title>
          </g>
        );
      })}

      {/* Center label */}
      <circle cx={cx} cy={cy} r="30" fill="rgba(10,10,10,0.85)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)">
        SOLAR
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="11" fill={colors.gold} fontStyle="italic">
        太阳返照
      </text>
    </svg>
  );
}

// ─── Planet List (glass row, palette-locked) ───────────────────────────────

function PlanetList({
  planets,
  language,
}: {
  planets: PlanetData[];
  language: 'zh' | 'en';
}) {
  return (
    <div className="space-y-1.5">
      {planets.map((p) => {
        const tone = planetTone(p.name);
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
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white/80">{p.name}</span>
                <span className="text-sm text-white/55">
                  {p.signSymbol} {p.signName} {p.degree.toFixed(1)}°
                </span>
              </div>
              <div className="text-[11px] text-white/35">
                {language === 'zh' ? '黄经' : 'Longitude'}: {p.longitude.toFixed(2)}°
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
    heading: 'The chart begins on your birthday.',
    body: 'A solar-return chart is cast for the moment the Sun returns to its natal degree — usually within a day of your birthday. We use that moment as the start of your year.',
  },
  {
    label: '02',
    heading: 'Houses say where the year lives.',
    body: 'The houses that fall on the angles of the new chart point to the rooms of life this year leans into — relationships, career, money, growth.',
  },
  {
    label: '03',
    heading: 'Planets say what the year is about.',
    body: 'The planets near the angles, and the aspects they make, set the themes that show up most often in the next twelve months.',
  },
];

const NARRATIVE_BLOCKS_ZH = [
  {
    label: '01',
    heading: '这张星盘 从你生日开始。',
    body: '太阳返照盘是太阳回到出生度数那一刻的星盘 通常落在生日前后一两天 我们把这一刻 当作你这一年的起点。',
  },
  {
    label: '02',
    heading: '宫位 决定一年生活在哪里。',
    body: '落在这张新星盘四角的宫位 指向这一年最常被打开的房间 —— 关系 事业 财富 成长。',
  },
  {
    label: '03',
    heading: '行星 决定一年讲什么。',
    body: '靠近四角的行星 以及它们形成的相位 决定了这十二个月里 反复出现的主题。',
  },
];

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function SolarReturnPage() {
  const [language, setLanguage] = useSyncedLanguage('en');
  const [birthday, setBirthday] = useState('1990-08-16');
  const [birthTime, setBirthTime] = useState('12:00');
  const [lat, setLat] = useState(35.6762);
  const [lng, setLng] = useState(139.6503);
  const [targetYear, setTargetYear] = useState<number>(() => new Date().getFullYear());
  const [chartData, setChartData] = useState<SolarReturnResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  void setLanguage;

  const copy = moduleLandingCopy.solarReturn[language];

  const t = useCallback(
    (en: string, zh: string) => (language === 'zh' ? zh : en),
    [language]
  );

  const handleCalculate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setChartData(null);

    try {
      const response = await fetch('/api/solar-return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate: birthday,
          birthTime,
          lat,
          lng,
          targetYear,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Failed to calculate Solar Return' }));
        throw new Error(err.error || 'Failed to calculate Solar Return');
      }

      const data: SolarReturnResponse = await response.json();
      setChartData(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

      saveReading({
        reading_type: 'solar-return',
        title: `Solar Return ${data.targetYear} · ${data.birthDate}`,
        summary: `Exact: ${data.birthdayExactTime} · Sun ${data.birthSunLongitude.toFixed(2)}° · ${data.chart.planets.length} planets`,
        reading_data: data as unknown as Record<string, unknown>,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Calculation failed', '计算出错'));
    } finally {
      setIsLoading(false);
    }
  }, [birthday, birthTime, lat, lng, targetYear, t]);

  const ascSignIndex = chartData
    ? Math.floor(chartData.chart.houses.ascendant / 30)
    : 0;
  const mcSignIndex = chartData
    ? Math.floor(chartData.chart.houses.midheaven / 30)
    : 0;
  const dscSignIndex = chartData
    ? Math.floor(((chartData.chart.houses.ascendant + 180) % 360) / 30)
    : 0;
  const icSignIndex = chartData
    ? Math.floor(((chartData.chart.houses.midheaven + 180) % 360) / 30)
    : 0;

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
                  htmlFor="sr-birthday"
                  className="mb-1.5 block text-[10px] uppercase tracking-[0.28em] text-white/35"
                >
                  {t('Birth date', '出生日期')}
                </label>
                <input
                  id="sr-birthday"
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white/85 transition-all focus:border-purple-500/40 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="sr-birth-time"
                  className="mb-1.5 block text-[10px] uppercase tracking-[0.28em] text-white/35"
                >
                  {t('Birth time', '出生时间')}
                </label>
                <input
                  id="sr-birth-time"
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white/85 transition-all focus:border-purple-500/40 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="sr-target-year"
                  className="mb-1.5 block text-[10px] uppercase tracking-[0.28em] text-white/35"
                >
                  {t('Target year', '返照年份')}
                </label>
                <input
                  id="sr-target-year"
                  type="number"
                  min="1900"
                  max="2100"
                  value={targetYear}
                  onChange={(e) =>
                    setTargetYear(parseInt(e.target.value) || new Date().getFullYear())
                  }
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white/85 transition-all focus:border-purple-500/40 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="sr-latitude"
                  className="mb-1.5 block text-[10px] uppercase tracking-[0.28em] text-white/35"
                >
                  {t('Latitude', '纬度')}
                </label>
                <input
                  id="sr-latitude"
                  type="number"
                  step="0.0001"
                  min="-90"
                  max="90"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white/85 transition-all focus:border-purple-500/40 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="sr-longitude"
                  className="mb-1.5 block text-[10px] uppercase tracking-[0.28em] text-white/35"
                >
                  {t('Longitude', '经度')}
                </label>
                <input
                  id="sr-longitude"
                  type="number"
                  step="0.0001"
                  min="-180"
                  max="180"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white/85 transition-all focus:border-purple-500/40 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleCalculate}
              disabled={isLoading}
              className="w-full rounded-2xl border border-white/[0.14] bg-white/[0.06] px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white/90 transition-all hover:border-white/30 hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ boxShadow: '0 0 36px rgba(245, 197, 66, 0.16)' }}
            >
              {isLoading ? t('Calculating…', '计算中…') : copy.primaryCta}
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
      {!chartData && !isLoading && !error && (
        <ScrollNarrativeSection
          accentColor="#7c3aed"
          goldColor="#D4AF37"
          blocks={language === 'zh' ? NARRATIVE_BLOCKS_ZH : NARRATIVE_BLOCKS_EN}
        />
      )}

      {/* Result */}
      {chartData && (
        <div ref={resultRef}>
          <ResultScaffold
            eyebrow={t('SOLAR-RETURN READING', '太阳返照解读')}
            title={t(
              `The year that begins on ${chartData.birthdayExactTime}.`,
              `从 ${chartData.birthdayExactTime} 开始的那一年。`
            )}
            subtitle={t(
              `Birth Sun longitude · ${chartData.birthSunLongitude.toFixed(2)}°  ·  Target year ${chartData.targetYear}`,
              `出生太阳黄经 · ${chartData.birthSunLongitude.toFixed(2)}°  ·  返照年份 ${chartData.targetYear}`
            )}
            overview={
              <div className="grid gap-5 lg:grid-cols-2">
                <GlassCard
                  level="card"
                  className="rounded-[1.5rem] border border-white/[0.06] bg-black/25 p-6"
                >
                  <div className="text-[10px] uppercase tracking-[0.28em] text-white/40">
                    {t('Solar return at a glance', '返照速览')}
                  </div>
                  <div className="mt-5 grid gap-3">
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                        {t('Birth date', '出生日期')}
                      </div>
                      <div className="mt-1 text-sm text-white/85">
                        {chartData.birthDate}{' '}
                        <span className="text-white/45">{chartData.birthTime}</span>
                      </div>
                    </div>
                    <div
                      className="rounded-xl border p-3"
                      style={{
                        borderColor: `${colors.gold}55`,
                        backgroundColor: `${colors.gold}10`,
                      }}
                    >
                      <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: colors.goldLight }}>
                        {t('Solar-return exact time', '返照精确时间')}
                      </div>
                      <div className="mt-1 font-serif text-base italic text-white/90">
                        {chartData.birthdayExactTime}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                        {t('Birth Sun longitude', '出生太阳黄经')}
                      </div>
                      <div className="mt-1 text-sm text-white/85">
                        {chartData.birthSunLongitude.toFixed(2)}°
                      </div>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard
                  level="card"
                  className="rounded-[1.5rem] border border-white/[0.06] bg-black/25 p-5"
                >
                  <div className="text-[10px] uppercase tracking-[0.28em] text-white/40">
                    {t('Solar return chart', '太阳返照星盘')}
                  </div>
                  <div className="mt-4">
                    <PlanetWheel chart={chartData.chart} language={language} />
                  </div>
                  <p className="mt-3 text-center text-[11px] text-white/40">
                    {t(
                      'Swiss Ephemeris precision · luminaries gold · planets purple',
                      '瑞士星历精确计算 · 光体金 · 行星紫'
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
                    {t('House angles', '宫位四角')}
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      {
                        label: t('Ascendant', '上升点'),
                        value: chartData.chart.houses.ascendant,
                        symbol: ZODIAC_SIGNS[ascSignIndex].symbol,
                      },
                      {
                        label: t('Midheaven', '天顶'),
                        value: chartData.chart.houses.midheaven,
                        symbol: ZODIAC_SIGNS[mcSignIndex].symbol,
                      },
                      {
                        label: t('Descendant', '下降点'),
                        value: (chartData.chart.houses.ascendant + 180) % 360,
                        symbol: ZODIAC_SIGNS[dscSignIndex].symbol,
                      },
                      {
                        label: t('IC', '天底'),
                        value: (chartData.chart.houses.midheaven + 180) % 360,
                        symbol: ZODIAC_SIGNS[icSignIndex].symbol,
                      },
                    ].map((angle) => (
                      <div
                        key={angle.label}
                        className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center"
                      >
                        <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                          {angle.label}
                        </div>
                        <div
                          className="mt-1 font-serif text-lg italic"
                          style={{ color: colors.goldLight }}
                        >
                          {angle.symbol} {(angle.value % 30).toFixed(1)}°
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard
                  level="soft"
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
                >
                  <div className="mb-4 text-[0.68rem] uppercase tracking-[0.28em] text-white/40">
                    {t('Planetary positions', '行星位置')}
                  </div>
                  <PlanetList planets={chartData.chart.planets} language={language} />
                </GlassCard>
              </div>
            }
            details={
              chartData.interpretation ? (
                <GlassCard
                  level="card"
                  className="rounded-[1.5rem] border border-white/[0.06] bg-black/25 p-6"
                >
                  <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/40">
                    {t('Annual interpretation', '年度解读')}
                  </div>
                  <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-7 text-white/72">
                    {chartData.interpretation}
                  </pre>
                </GlassCard>
              ) : null
            }
            aside={null}
          />

          <LandingSection
            eyebrow={t('Save · Share', '保存 · 分享')}
            title={t(
              'Carry this year with you.',
              '把这一年 带在身边。'
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
                    'Share a clean summary of this solar-return year.',
                    '分享一份简洁的太阳返照年度摘要。'
                  )}
                </p>
                <div className="mt-5">
                  <SharePanel
                    serviceType="solar-return"
                    resultId={`${chartData.birthDate}_${chartData.targetYear}`}
                    shareUrl="https://tianji.global/solar-return"
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
                    'Generate a printable report with the wheel, house angles, and interpretation.',
                    '生成一份包含星盘 宫位四角 与年度解读的 PDF 报告。'
                  )}
                </p>
                <div className="mt-5">
                  <PDFDownloadButton
                    serviceType="western"
                    resultData={chartData as unknown as Record<string, unknown>}
                    birthData={{
                      name: t('Solar Return', '太阳返照'),
                      birthday: `${chartData.birthDate} ${chartData.birthTime}`,
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
