'use client';

export const dynamic = 'force-dynamic';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import PDFDownloadButton from '@/components/PDFDownloadButton';
import { saveReading } from '@/lib/save-reading';
import { GlassCard, MysticButton, LanguageSwitch } from '@/components/ui';
import { colors, glass, radii, shadows } from '@/design-system';

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

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Zodiac & Element Data ────────────────────────────────────────────────────

const ZODIAC_SIGNS = [
  { name: 'Aries', nameZh: '白羊', symbol: '♈', element: 'Fire' },
  { name: 'Taurus', nameZh: '金牛', symbol: '♉', element: 'Earth' },
  { name: 'Gemini', nameZh: '双子', symbol: '♊', element: 'Air' },
  { name: 'Cancer', nameZh: '巨蟹', symbol: '♋', element: 'Water' },
  { name: 'Leo', nameZh: '狮子', symbol: '♌', element: 'Fire' },
  { name: 'Virgo', nameZh: '处女', symbol: '♍', element: 'Earth' },
  { name: 'Libra', nameZh: '天秤', symbol: '♎', element: 'Air' },
  { name: 'Scorpio', nameZh: '天蝎', symbol: '♏', element: 'Water' },
  { name: 'Sagittarius', nameZh: '射手', symbol: '♐', element: 'Fire' },
  { name: 'Capricorn', nameZh: '摩羯', symbol: '♑', element: 'Earth' },
  { name: 'Aquarius', nameZh: '水瓶', symbol: '♒', element: 'Air' },
  { name: 'Pisces', nameZh: '双鱼', symbol: '♓', element: 'Water' },
];

const ELEMENT_COLORS: Record<string, string> = {
  Fire: colors.gold,
  Earth: '#D97706',
  Air: colors.dataCyan,
  Water: '#06B6D4',
};

const ELEMENT_BG: Record<string, string> = {
  Fire: 'rgba(239, 68, 68, 0.15)',
  Earth: 'rgba(217, 119, 6, 0.15)',
  Air: 'rgba(6, 182, 212, 0.15)',
  Water: 'rgba(6, 182, 212, 0.15)',
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
};

const PLANET_COLORS: Record<string, string> = {
  Sun: '#FFD700',
  Moon: '#C0C0C0',
  Mercury: '#B8860B',
  Venus: '#98FB98',
  Mars: '#FF6347',
  Jupiter: '#DAA520',
  Saturn: '#708090',
  Uranus: '#40E0D0',
  Neptune: '#4169E1',
  Pluto: '#8B008B',
};

// ─── AstroChart Settings ─────────────────────────────────────────────────────

const CHART_SETTINGS = {
  COLOR_BACKGROUND: '#1e293b',
  CIRCLE_COLOR: '#475569',
  CIRCLE_STRONG: 2,
  CIRCLE_WEAK: 1,
  LINE_COLOR: '#64748b',
  POINTS_COLOR: '#e2e8f0',
  POINTS_TEXT_SIZE: 10,
  POINTS_STROKE: 1.5,
  SYMBOL_SCALE: 1,
  SYMBOL_SUN: '☉',
  SYMBOL_MOON: '☽',
  SYMBOL_MERCURY: '☿',
  SYMBOL_VENUS: '♀',
  SYMBOL_MARS: '♂',
  SYMBOL_JUPITER: '♃',
  SYMBOL_SATURN: '♄',
  SYMBOL_URANUS: '♅',
  SYMBOL_NEPTUNE: '♆',
  SYMBOL_PLUTO: '♇',
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
    '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3',
    '#F38181', '#AA96DA', '#FCBAD3', '#A8D8EA',
    '#FF9F43', '#786FA6', '#63CDDA', '#7B68EE'
  ],
  CUSPS_STROKE: 2,
  CUSPS_FONT_COLOR: '#94a3b8',
  SIGNS_COLOR: '#64748b',
  SIGNS_STROKE: 1,
  MARGIN: 15,
  PADDING: 10,
  SHIFT_IN_DEGREES: 0,
  STROKE_ONLY: false,
  ADD_CLICK_AREA: true,
  COLLISION_RADIUS: 10,
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function WesternPage() {
  const [birthday, setBirthday] = useState<string>('1990-08-16');
  const [birthTime, setBirthTime] = useState<string>('12:00');
  const [lat, setLat] = useState<number>(35.6762);
  const [lng, setLng] = useState<number>(139.6503);
  const [language, setLanguage] = useState<Language>('zh');
  const [chartData, setChartData] = useState<ChartApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch chart data from API
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
        summary: `${language === 'zh' ? '西方星盘' : 'Western Natal Chart'} - ${birthday}`,
        reading_data: data as unknown as Record<string, unknown>,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [birthday, birthTime, lat, lng, language]);

  // Render AstroChart SVG (client-side only)
  useEffect(() => {
    if (!chartData || !chartRef.current || !isClient) return;

    const container = chartRef.current;
    container.innerHTML = '';

    // Prepare data for AstroChart
    const planets: Record<string, number[]> = {};
    chartData.chart.planets.forEach(p => {
      planets[p.name] = [p.longitude];
    });

    // Add Ascendant, IC, Descendant, MC as points of interest
    const asc = chartData.houses.ascendant;
    const ic = (chartData.houses.midheaven + 180) % 360;
    const dsc = (asc + 180) % 360;
    const mc = chartData.houses.midheaven;

    const astroData = {
      planets,
      cusps: chartData.houses.cusps,
    };

    // Create chart
    const width = Math.min(container.clientWidth || 400, 500);
    const height = width;

    // Dynamically import AstroChart to avoid SSR issues
    import('@astrodraw/astrochart').then((mod) => {
      const Chart = mod.default;

      const chart = new Chart(container.id, width, height, CHART_SETTINGS);

      // Draw radix chart
      chart.radix(astroData);

      // Add points of interest for aspect lines
      chart.radix({ planets, cusps: chartData.houses.cusps })
        .addPointsOfInterest({
          As: [asc],
          Ic: [ic],
          Ds: [dsc],
          Mc: [mc],
        });
    }).catch((err) => {
      console.error('AstroChart render error:', err);
    });
  }, [chartData, isClient]);

  // Get element info for a sign
  const getSignElement = (signName: string) => {
    return ZODIAC_SIGNS.find(s => s.name === signName)?.element ?? 'Fire';
  };

  return (
    <main
      className="min-h-screen text-white p-4 md:p-8"
      style={{ backgroundColor: colors.bgPrimary }}
    >
      {/* Layer 1: Deep space base */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 0%, ${colors.bgNebula} 0%, transparent 55%)`, zIndex: 0 }} />
      {/* Layer 2: Purple nebula */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 20% 20%, rgba(59,20,75,0.35) 0%, transparent 50%)', zIndex: 0 }} />
      {/* Layer 3: Cyan depth */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 80% 80%, rgba(6,30,60,0.45) 0%, transparent 50%)', zIndex: 0 }} />
      {/* Layer 4: Bottom warmth */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(80,40,100,0.2) 0%, transparent 40%)', zIndex: 0 }} />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <FadeInWhenVisible>
          <div className="text-center mb-8 pt-4">
            <h1
              className="text-4xl md:text-5xl font-serif font-bold mb-3"
              style={{
                background: `linear-gradient(135deg, ${colors.purpleLight}, ${colors.dataCyan})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {language === 'zh' ? '西方星盘' : 'Western Natal Chart'}
            </h1>
            <p className="text-sm text-white/40 tracking-wide">
              {language === 'zh'
                ? '使用瑞士星历表(SWEPH)精确计算 · AstroChart专业可视化'
                : 'Swiss Ephemeris Precision · AstroChart Visualization'}
            </p>
          </div>
        </FadeInWhenVisible>

        {/* Input Form */}
        <FadeInWhenVisible delay={0.1}>
          <GlassCard level="card" className="p-6 mb-6 border border-white/[0.06] bg-white/[0.015] rounded-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Birthday */}
              <div>
                <label className="block text-xs font-serif text-white/40 mb-2 tracking-widest uppercase">
                  {language === 'zh' ? '出生日期' : 'Birthday'}
                </label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40 bg-white/[0.04] border border-white/[0.06]"
                />
              </div>

              {/* Birth Time */}
              <div>
                <label className="block text-xs font-serif text-white/40 mb-2 tracking-widest uppercase">
                  {language === 'zh' ? '出生时间' : 'Birth Time'}
                </label>
                <input
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40 bg-white/[0.04] border border-white/[0.06]"
                />
              </div>

              {/* Latitude */}
              <div>
                <label className="block text-xs font-serif text-white/40 mb-2 tracking-widest uppercase">
                  {language === 'zh' ? '出生纬度' : 'Latitude'}
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="-90"
                  max="90"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-xl text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40 bg-white/[0.04] border border-white/[0.06]"
                />
              </div>

              {/* Longitude */}
              <div>
                <label className="block text-xs font-serif text-white/40 mb-2 tracking-widest uppercase">
                  {language === 'zh' ? '出生经度' : 'Longitude'}
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="-180"
                  max="180"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-xl text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40 bg-white/[0.04] border border-white/[0.06]"
                />
              </div>
            </div>

            {/* Language Toggle & Calculate Button Row */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <LanguageSwitch />

              <MysticButton
                variant="solid"
                size="lg"
                onClick={fetchChartData}
                disabled={isLoading}
                className="flex-1"
                style={{
                  background: `linear-gradient(135deg, ${colors.purple}, ${colors.dataCyan})`,
                }}
              >
                {isLoading
                  ? (language === 'zh' ? '计算中...' : 'Calculating...')
                  : (language === 'zh' ? '生成星盘' : 'Generate Chart')}
              </MysticButton>
            </div>

            {error && (
              <div
                className="mt-4 p-4 rounded-xl text-center text-sm"
                style={{
                  backgroundColor: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#EF4444',
                }}
              >
                {error}
              </div>
            )}
          </GlassCard>
        </FadeInWhenVisible>

        {/* Results */}
        {chartData && (
          <div className="space-y-6">
            {/* Big Three */}
            <FadeInWhenVisible delay={0.15}>
              <div className="grid grid-cols-3 gap-4">
              {/* Sun */}
              <GlassCard
                level="card"
                hoverLift
                glowColor={colors.gold}
                className="p-5 text-center border border-white/[0.06] bg-white/[0.015] rounded-2xl"
              >
                <div className="text-3xl mb-1">☀️</div>
                <div className="text-xs mb-1 text-amber-400/80">
                  {language === 'zh' ? '太阳' : 'Sun'}
                </div>
                <div className="text-2xl mb-1">{chartData.bigThree.sun.symbol}</div>
                <div className="text-lg font-bold text-white/90 mb-1">
                  {language === 'zh' ? chartData.bigThree.sun.signZh : chartData.bigThree.sun.sign}
                </div>
                <div className="text-sm" style={{ color: ELEMENT_COLORS[getSignElement(chartData.bigThree.sun.sign)] }}>
                  {chartData.bigThree.sun.degree}°
                </div>
              </GlassCard>

              {/* Moon */}
              <GlassCard
                level="card"
                hoverLift
                glowColor={colors.textSecondary}
                className="p-5 text-center border border-white/[0.06] bg-white/[0.015] rounded-2xl"
              >
                <div className="text-3xl mb-1">🌙</div>
                <div className="text-xs mb-1 text-white/40">
                  {language === 'zh' ? '月亮' : 'Moon'}
                </div>
                <div className="text-2xl mb-1">{chartData.bigThree.moon.symbol}</div>
                <div className="text-lg font-bold text-white/90 mb-1">
                  {language === 'zh' ? chartData.bigThree.moon.signZh : chartData.bigThree.moon.sign}
                </div>
                <div className="text-sm" style={{ color: ELEMENT_COLORS[getSignElement(chartData.bigThree.moon.sign)] }}>
                  {chartData.bigThree.moon.degree}°
                </div>
              </GlassCard>

              {/* Rising */}
              <GlassCard
                level="card"
                hoverLift
                glowColor={colors.purpleLight}
                className="p-5 text-center border border-white/[0.06] bg-white/[0.015] rounded-2xl"
              >
                <div className="text-3xl mb-1">⬆️</div>
                <div className="text-xs mb-1 text-purple-300/70">
                  {language === 'zh' ? '上升' : 'Rising'}
                </div>
                <div className="text-2xl mb-1">{chartData.bigThree.rising.symbol}</div>
                <div className="text-lg font-bold text-white/90 mb-1">
                  {language === 'zh' ? chartData.bigThree.rising.signZh : chartData.bigThree.rising.sign}
                </div>
                <div className="text-sm" style={{ color: ELEMENT_COLORS[getSignElement(chartData.bigThree.rising.sign)] }}>
                  {chartData.bigThree.rising.degree}°
                </div>
              </GlassCard>
            </div>
            </FadeInWhenVisible>

            {/* AstroChart SVG Visualization */}
            <FadeInWhenVisible delay={0.2}>
              <GlassCard level="card" className="p-6 border border-white/[0.06] bg-white/[0.015] rounded-2xl">
                <h3 className="text-sm font-serif text-white/40 tracking-widest uppercase mb-4 text-center">
                  {language === 'zh' ? '专业星盘' : 'Natal Chart'}
                </h3>
              <div className="flex justify-center">
                <div
                  id="western-chart"
                  ref={chartRef}
                  className="w-full max-w-md"
                />
              </div>
            </GlassCard>
            </FadeInWhenVisible>

            {/* Planet Positions Table */}
            <FadeInWhenVisible delay={0.25}>
              <GlassCard level="card" className="p-6 border border-white/[0.06] bg-white/[0.015] rounded-2xl">
                <h3 className="text-sm font-serif text-white/40 tracking-widest uppercase mb-4 text-center">
                  {language === 'zh' ? '行星位置' : 'Planetary Positions'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {chartData.planets.map((planet) => (
                    <GlassCard key={planet.name} level="soft" className="p-3 text-center border border-white/[0.04] bg-white/[0.02] rounded-xl">
                      <div className="text-lg mb-1" style={{ color: PLANET_COLORS[planet.name] }}>
                        {PLANET_SYMBOLS[planet.name]}
                      </div>
                      <div className="text-white/80 font-medium text-sm">
                        {language === 'zh' ? getChinesePlanetName(planet.name) : planet.name}
                      </div>
                      <div className="text-sm mt-1 text-cyan-400/70">
                        {planet.signSymbol} {language === 'zh' ? planet.signZh : planet.sign} {planet.degree}°
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </GlassCard>
            </FadeInWhenVisible>

            {/* House Cusps */}
            <FadeInWhenVisible delay={0.3}>
              <GlassCard level="card" className="p-6 border border-white/[0.06] bg-white/[0.015] rounded-2xl">
                <h3 className="text-sm font-serif text-white/40 tracking-widest uppercase mb-4 text-center">
                  {language === 'zh' ? '宫位' : 'Houses'}
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {chartData.houses.cusps.map((cusp, index) => {
                    const signIndex = Math.floor(cusp / 30) % 12;
                    const sign = ZODIAC_SIGNS[signIndex];
                    return (
                      <GlassCard key={index} level="soft" className="p-3 text-center border border-white/[0.04] bg-white/[0.02] rounded-xl">
                        <div className="text-xs mb-1 text-white/20">
                          {language === 'zh' ? `第${index + 1}宫` : `House ${index + 1}`}
                        </div>
                        <div className="text-white/80 font-medium text-sm">
                          {sign.symbol}
                        </div>
                        <div className="text-sm text-white/40">
                          {language === 'zh' ? sign.nameZh : sign.name}
                        </div>
                      </GlassCard>
                    );
                  })}
                </div>

                {/* Ascendant & Midheaven */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <GlassCard level="soft" className="p-4 text-center border border-white/[0.04] bg-white/[0.02] rounded-xl">
                    <div className="text-xs mb-1 text-purple-300/70">
                      {language === 'zh' ? '上升星座' : 'Ascendant'}
                    </div>
                    <div className="text-2xl mb-1">
                      {ZODIAC_SIGNS[Math.floor(chartData.houses.ascendant / 30) % 12].symbol}
                    </div>
                    <div className="text-white/80 font-medium">
                      {language === 'zh' ? chartData.houses.ascendantSignZh : chartData.houses.ascendantSign}
                    </div>
                    <div className="text-sm text-purple-300/60">{chartData.houses.ascendant}°</div>
                  </GlassCard>
                  <GlassCard level="soft" className="p-4 text-center border border-white/[0.04] bg-white/[0.02] rounded-xl">
                    <div className="text-xs mb-1 text-cyan-400/70">
                      {language === 'zh' ? '天顶' : 'Midheaven'}
                    </div>
                    <div className="text-2xl mb-1">
                      {ZODIAC_SIGNS[Math.floor(chartData.houses.midheaven / 30) % 12].symbol}
                    </div>
                    <div className="text-white/80 font-medium">
                      {language === 'zh' ? chartData.houses.mcSignZh : chartData.houses.mcSign}
                    </div>
                    <div className="text-sm text-cyan-400/60">{chartData.houses.midheaven}°</div>
                  </GlassCard>
                </div>
              </GlassCard>
            </FadeInWhenVisible>

            {/* PDF Download */}
            <div className="flex justify-center mt-6">
              <PDFDownloadButton
                serviceType="western"
                resultData={chartData as unknown as Record<string, unknown>}
                birthData={{
                  birthday: birthday,
                  birthTime: birthTime,
                  name: language === 'zh' ? '西方星盘' : 'Western Natal',
                }}
                language={language}
              />
            </div>

            {/* Calculation Info */}
            <div className="text-center" style={{ color: colors.textMuted }}>
              <p className="text-xs">{chartData.meta.platform} · v{chartData.meta.version}</p>
              <p className="mt-1 text-xs">{chartData.meta.calculationMode}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <FadeInWhenVisible delay={0.4}>
          <div className="mt-12 text-center">
            <p className="text-sm text-white/20">© 2024 TianJi Global · 天机全球</p>
            <p className="mt-1 text-xs text-white/15">
              {language === 'zh'
                ? '使用瑞士星历表(SWEPH)进行高精度天文计算'
                : 'High-precision astronomical calculations using Swiss Ephemeris (SWEPH)'}
            </p>
          </div>
        </FadeInWhenVisible>
      </div>
    </main>
  );
}

// ─── Helper Functions ────────────────────────────────────────────────────────

function getChinesePlanetName(name: string): string {
  const names: Record<string, string> = {
    Sun: '太阳',
    Moon: '月亮',
    Mercury: '水星',
    Venus: '金星',
    Mars: '火星',
    Jupiter: '木星',
    Saturn: '土星',
    Uranus: '天王星',
    Neptune: '海王星',
    Pluto: '冥王星',
  };
  return names[name] ?? name;
}
