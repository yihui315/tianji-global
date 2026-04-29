'use client';

export const dynamic = 'force-dynamic';

import { useCallback, useEffect, useRef, useState } from 'react';
import PDFDownloadButton from '@/components/PDFDownloadButton';
import SharePanel from '@/components/SharePanel';
import { saveReading } from '@/lib/save-reading';
import { useSyncedLanguage } from '@/hooks/useSyncedLanguage';
import { moduleLandingCopy } from '@/lib/language-routing';
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

interface PlanetData {
  name: string;
  symbol: string;
  sign: string;
  signZh: string;
  degree: number;
  longitude: number;
  signSymbol: string;
}

interface HouseData {
  cusps: number[];
  ascendant: number;
  midheaven: number;
  ascendantSign: string;
  ascendantSignZh: string;
  mcSign: string;
  mcSignZh: string;
}

interface BigThree {
  sun: { sign: string; signZh: string; symbol: string; degree: number };
  moon: { sign: string; signZh: string; symbol: string; degree: number };
  rising: { sign: string; signZh: string; symbol: string; degree: number };
}

interface ChartApiResponse {
  chart: {
    planets: Array<{
      name: string;
      longitude: number;
      latitude: number;
      sign: number;
      signName: string;
      signSymbol: string;
      degree: number;
      orb: number;
    }>;
    houses: {
      houses: number[];
      ascendant: number;
      midheaven: number;
    };
    julianDay: number;
  };
  planets: PlanetData[];
  houses: HouseData;
  bigThree: BigThree;
  meta: {
    platform: string;
    version: string;
    calculationMode: string;
  };
}

type Language = 'zh' | 'en';

const ZODIAC_SIGNS = [
  { name: 'Aries', element: 'Fire' },
  { name: 'Taurus', element: 'Earth' },
  { name: 'Gemini', element: 'Air' },
  { name: 'Cancer', element: 'Water' },
  { name: 'Leo', element: 'Fire' },
  { name: 'Virgo', element: 'Earth' },
  { name: 'Libra', element: 'Air' },
  { name: 'Scorpio', element: 'Water' },
  { name: 'Sagittarius', element: 'Fire' },
  { name: 'Capricorn', element: 'Earth' },
  { name: 'Aquarius', element: 'Air' },
  { name: 'Pisces', element: 'Water' },
];

const ELEMENT_COLORS: Record<string, string> = {
  Fire: '#F59E0B',
  Earth: '#D97706',
  Air: '#67E8F9',
  Water: '#38BDF8',
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: 'Sun',
  Moon: 'Moon',
  Mercury: 'Mer',
  Venus: 'Ven',
  Mars: 'Mar',
  Jupiter: 'Jup',
  Saturn: 'Sat',
  Uranus: 'Ura',
  Neptune: 'Nep',
  Pluto: 'Plu',
};

const CHART_SETTINGS = {
  COLOR_BACKGROUND: '#0A0A0A',
  CIRCLE_COLOR: '#3B2855',
  CIRCLE_STRONG: 2,
  CIRCLE_WEAK: 1,
  LINE_COLOR: '#6D5A8D',
  POINTS_COLOR: '#F4E7B8',
  POINTS_TEXT_SIZE: 10,
  POINTS_STROKE: 1.5,
  SYMBOL_SCALE: 1,
  SYMBOL_SUN: 'Su',
  SYMBOL_MOON: 'Mo',
  SYMBOL_MERCURY: 'Me',
  SYMBOL_VENUS: 'Ve',
  SYMBOL_MARS: 'Ma',
  SYMBOL_JUPITER: 'Ju',
  SYMBOL_SATURN: 'Sa',
  SYMBOL_URANUS: 'Ur',
  SYMBOL_NEPTUNE: 'Ne',
  SYMBOL_PLUTO: 'Pl',
  COLOR_ARIES: '#FF6B6B',
  COLOR_TAURUS: '#4ECDC4',
  COLOR_GEMINI: '#FFE66D',
  COLOR_CANCER: '#95E1D3',
  COLOR_LEO: '#F38181',
  COLOR_VIRGO: '#AA96DA',
  COLOR_LIBRA: '#FCBAD3',
  COLOR_SCORPIO: '#A8D8EA',
  COLOR_SAGITTARIUS: '#FF9F43',
  COLOR_CAPRICORN: '#786FA6',
  COLOR_AQUARIUS: '#63CDDA',
  COLOR_PISCES: '#7B68EE',
  COLORS_SIGNS: [
    '#FF6B6B',
    '#4ECDC4',
    '#FFE66D',
    '#95E1D3',
    '#F38181',
    '#AA96DA',
    '#FCBAD3',
    '#A8D8EA',
    '#FF9F43',
    '#786FA6',
    '#63CDDA',
    '#7B68EE',
  ],
  CUSPS_STROKE: 2,
  CUSPS_FONT_COLOR: '#B8A9D6',
  SIGNS_COLOR: '#6D5A8D',
  SIGNS_STROKE: 1,
  MARGIN: 15,
  PADDING: 10,
  SHIFT_IN_DEGREES: 0,
  STROKE_ONLY: false,
  ADD_CLICK_AREA: true,
  COLLISION_RADIUS: 10,
};

type AstroData = { planets: Record<string, number[]>; cusps: number[] };
type AstroRadix = { addPointsOfInterest?: (points: Record<string, number[]>) => void };
type AstroChartConstructor = new (
  elementId: string,
  width: number,
  height: number,
  settings: typeof CHART_SETTINGS
) => { radix: (data: AstroData) => AstroRadix };

export default function WesternPage() {
  const [birthday, setBirthday] = useState<string>('1990-08-16');
  const [birthTime, setBirthTime] = useState<string>('12:00');
  const [lat, setLat] = useState<number>(35.6762);
  const [lng, setLng] = useState<number>(139.6503);
  const [language, setLanguage] = useSyncedLanguage();
  const [chartData, setChartData] = useState<ChartApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const copy = moduleLandingCopy.western[language];

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchChartData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/western', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate: birthday,
          birthTime,
          lat,
          lng,
          language,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to calculate chart');
      }

      const data: ChartApiResponse = await response.json();
      setChartData(data);
      saveReading({
        reading_type: 'western',
        title: `${birthday} Western Natal Chart`,
        summary: `Western Natal Chart - ${birthday}`,
        reading_data: data as unknown as Record<string, unknown>,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [birthday, birthTime, lat, lng, language]);

  useEffect(() => {
    if (!chartData || !chartRef.current || !isClient) return;

    const container = chartRef.current;
    container.innerHTML = '';

    const planets: Record<string, number[]> = {};
    chartData.chart.planets.forEach((planet) => {
      planets[planet.name] = [planet.longitude];
    });

    const asc = chartData.houses.ascendant;
    const ic = (chartData.houses.midheaven + 180) % 360;
    const dsc = (asc + 180) % 360;
    const mc = chartData.houses.midheaven;
    const width = Math.min(container.clientWidth || 420, 520);

    import('@astrodraw/astrochart')
      .then((mod) => {
        const AstroChart = mod.default as unknown as AstroChartConstructor;
        const chart = new AstroChart(container.id, width, width, CHART_SETTINGS);
        const radix = chart.radix({ planets, cusps: chartData.houses.cusps });
        radix.addPointsOfInterest?.({ As: [asc], Ic: [ic], Ds: [dsc], Mc: [mc] });
      })
      .catch((err) => {
        console.error('AstroChart render error:', err);
      });
  }, [chartData, isClient]);

  const getSignElement = (signName: string) => {
    return ZODIAC_SIGNS.find((sign) => sign.name === signName)?.element ?? 'Fire';
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050508] text-white">
      <BackgroundVideoHero
        eyebrow={copy.hero.eyebrow}
        title={copy.hero.title}
        subtitle={copy.hero.subtitle}
        description={copy.hero.description}
        videoSrc="/assets/videos/hero/western-hero-loop-6s-1080p.mp4"
        posterSrc="/assets/images/posters/western-hero-poster-16x9.jpg"
        imageSrc="/assets/images/hero/western-hero-master-16x9.jpg"
        ctaLabel={isLoading ? (language === 'zh' ? '计算中' : 'Calculating...') : copy.primaryCta}
        ctaHref="#western-form"
        secondaryCtaLabel={copy.secondaryCta}
        secondaryCtaHref="#western-narrative"
        stats={[
          { label: language === 'zh' ? '核心' : 'Core', value: 'Big 3' },
          { label: language === 'zh' ? '行星' : 'Planets', value: '10' },
          { label: language === 'zh' ? '渲染' : 'Renderer', value: 'AstroChart' },
        ]}
      />

      <TrustStrip
        items={[...copy.trustItems]}
      />

      <LandingSection
        id="western-form"
        eyebrow={copy.form.eyebrow}
        title={copy.form.title}
        description={copy.form.description}
      >
        <ModuleInputShell
          eyebrow={copy.form.eyebrow}
          title={language === 'zh' ? '生成你的西方星盘' : 'Generate your western chart'}
          description={copy.form.description}
          footer={language === 'zh' ? 'AstroChart SVG 仍然只在客户端渲染，保留之前 SSR 安全的行为。' : 'The AstroChart SVG renders only on the client, preserving the previous SSR-safe behavior.'}
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.22em] text-white/45">{language === 'zh' ? '生日' : 'Birthday'}</span>
              <input
                type="date"
                value={birthday}
                onChange={(event) => setBirthday(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-violet-300/50"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.22em] text-white/45">{language === 'zh' ? '出生时间' : 'Birth Time'}</span>
              <input
                type="time"
                value={birthTime}
                onChange={(event) => setBirthTime(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-violet-300/50"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.22em] text-white/45">{language === 'zh' ? '纬度' : 'Latitude'}</span>
              <input
                type="number"
                step="0.0001"
                min="-90"
                max="90"
                value={lat}
                onChange={(event) => setLat(Number.parseFloat(event.target.value) || 0)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-violet-300/50"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.22em] text-white/45">{language === 'zh' ? '经度' : 'Longitude'}</span>
              <input
                type="number"
                step="0.0001"
                min="-180"
                max="180"
                value={lng}
                onChange={(event) => setLng(Number.parseFloat(event.target.value) || 0)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-violet-300/50"
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as Language)}
              className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm uppercase tracking-[0.18em] text-white outline-none"
            >
              <option value="zh">ZH</option>
              <option value="en">EN</option>
            </select>
            <button
              onClick={fetchChartData}
              disabled={isLoading}
              className="flex-1 rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (language === 'zh' ? '计算中' : 'Calculating...') : copy.primaryCta}
            </button>
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-400/25 bg-rose-500/10 p-4 text-sm text-rose-200">
              {error}
            </div>
          )}
        </ModuleInputShell>
      </LandingSection>

      <ScrollNarrativeSection
        blocks={[
          {
            label: '01',
            heading: 'The big three establishes the front door.',
            body: 'Sun, Moon, and Rising are displayed first so the result feels readable before the full chart appears.',
            align: 'left',
          },
          {
            label: '02',
            heading: 'The wheel keeps its technical source.',
            body: 'The AstroChart dynamic import still handles the chart drawing, preserving the original rendering capability.',
            align: 'center',
          },
          {
            label: '03',
            heading: 'Planet positions become an evidence layer.',
            body: 'The table remains available after the visual chart so advanced users can inspect every placement.',
            align: 'right',
          },
        ]}
      />

      {chartData ? (
        <>
          <LandingSection
            eyebrow="Generated result"
            title="Natal chart overview"
            description={`${chartData.meta.platform} / ${chartData.meta.version} / ${chartData.meta.calculationMode}`}
          >
            <ResultScaffold
            eyebrow="Big Three"
            title={`${chartData.bigThree.sun.sign} / ${chartData.bigThree.moon.sign} / ${chartData.bigThree.rising.sign}`}
            summary="The chart opens with the three most legible identity anchors, then expands into the full wheel and placement table."
            highlights={[
              { label: 'Sun', value: `${chartData.bigThree.sun.sign} ${chartData.bigThree.sun.degree}deg` },
              { label: 'Moon', value: `${chartData.bigThree.moon.sign} ${chartData.bigThree.moon.degree}deg` },
              { label: 'Rising', value: `${chartData.bigThree.rising.sign} ${chartData.bigThree.rising.degree}deg` },
            ]}
            details={
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {[
                    { label: 'Sun', item: chartData.bigThree.sun },
                    { label: 'Moon', item: chartData.bigThree.moon },
                    { label: 'Rising', item: chartData.bigThree.rising },
                  ].map(({ label, item }) => (
                    <div key={label} className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 text-center">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/35">{label}</p>
                      <p className="mt-3 font-serif text-2xl text-white/88">
                        {language === 'zh' ? item.signZh : item.sign}
                      </p>
                      <p className="mt-2 text-sm text-amber-100/75">{item.degree}deg</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-black/30 p-5">
                  <h3 className="mb-5 text-center text-xs uppercase tracking-[0.22em] text-white/36">
                    Natal chart wheel
                  </h3>
                  <div className="flex justify-center">
                    <div id="western-chart" ref={chartRef} className="w-full max-w-[520px]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
                  {chartData.planets.map((planet) => (
                    <div
                      key={planet.name}
                      className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4 text-center"
                    >
                      <div className="text-xs uppercase tracking-[0.18em] text-white/35">
                        {PLANET_SYMBOLS[planet.name] ?? planet.name}
                      </div>
                      <div className="mt-2 font-semibold text-white/84">
                        {language === 'zh' ? getChinesePlanetName(planet.name) : planet.name}
                      </div>
                      <div
                        className="mt-2 text-sm"
                        style={{ color: ELEMENT_COLORS[getSignElement(planet.sign)] ?? '#D4AF37' }}
                      >
                        {planet.signSymbol} {language === 'zh' ? planet.signZh : planet.sign} {planet.degree}deg
                      </div>
                    </div>
                  ))}
                </div>

                <PDFDownloadButton
                  serviceType="western"
                  resultData={chartData as unknown as Record<string, unknown>}
                  language={language}
                />
              </div>
            }
            aside={
              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/35">Chart note</p>
                  <p className="mt-3 text-lg font-serif text-white/82">
                    The wheel is the proof layer; the Big Three is the doorway.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-violet-300/20 bg-violet-300/[0.06] p-5 text-sm leading-6 text-white/58">
                  Latitude and longitude stay editable for users who need precision rather than location guesses.
                </div>
              </div>
            }
            />
          </LandingSection>

          <ShareSection
            ogBgSrc="/assets/images/og/western-og-bg-1200x630.jpg"
            title="Share the chart without exposing birth data."
            subtitle="Share the chart as a public card pointing back to TianJi, or keep it private — the PDF export stays on your device until you decide what to do with it."
          >
            <div className="mx-auto max-w-md">
              <SharePanel
                serviceType="western"
                resultId="western-chart"
                shareUrl="https://tianji.global/western"
              />
            </div>
          </ShareSection>
        </>
      ) : (
        <LandingSection
          eyebrow="Preview"
          title="Your sky wheel will render after calculation"
          description="Fill in your birth date, time, and place above — the chart wheel and placement table will appear here."
        >
          <InsightGrid
            title="Inside every reading"
            subtitle="Chart · houses · aspects · export"
            items={[
              { label: 'Birth data', value: 'Date, time, and place — entered explicitly, never guessed' },
              { label: 'Chart wheel', value: 'A live SVG sky wheel with planets, houses, and aspects' },
              { label: 'Placements', value: 'Sun, Moon, rising, and a clear table of all bodies' },
              { label: 'Take it home', value: 'Export the full chart as a high-quality PDF' },
            ]}
          />
        </LandingSection>
      )}
    </main>
  );
}

function getChinesePlanetName(name: string): string {
  const names: Record<string, string> = {
    Sun: 'Sun',
    Moon: 'Moon',
    Mercury: 'Mercury',
    Venus: 'Venus',
    Mars: 'Mars',
    Jupiter: 'Jupiter',
    Saturn: 'Saturn',
    Uranus: 'Uranus',
    Neptune: 'Neptune',
    Pluto: 'Pluto',
  };
  return names[name] ?? name;
}
