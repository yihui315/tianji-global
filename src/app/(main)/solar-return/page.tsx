'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

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

type Language = 'zh' | 'en';

// ─── Zodiac & Planet Data ──────────────────────────────────────────────────

const ZODIAC_SIGNS = [
  { name: 'Aries',     nameZh: '白羊', symbol: '♈', element: 'Fire' },
  { name: 'Taurus',    nameZh: '金牛', symbol: '♉', element: 'Earth' },
  { name: 'Gemini',    nameZh: '双子', symbol: '♊', element: 'Air' },
  { name: 'Cancer',    nameZh: '巨蟹', symbol: '♋', element: 'Water' },
  { name: 'Leo',       nameZh: '狮子', symbol: '♌', element: 'Fire' },
  { name: 'Virgo',     nameZh: '处女', symbol: '♍', element: 'Earth' },
  { name: 'Libra',    nameZh: '天秤', symbol: '♎', element: 'Air' },
  { name: 'Scorpio',   nameZh: '天蝎', symbol: '♏', element: 'Water' },
  { name: 'Sagittarius', nameZh: '射手', symbol: '♐', element: 'Fire' },
  { name: 'Capricorn', nameZh: '摩羯', symbol: '♑', element: 'Earth' },
  { name: 'Aquarius',  nameZh: '水瓶', symbol: '♒', element: 'Air' },
  { name: 'Pisces',    nameZh: '双鱼', symbol: '♓', element: 'Water' },
];

const ELEMENT_COLORS: Record<string, string> = {
  Fire: 'text-red-400',
  Earth: 'text-yellow-500',
  Air: 'text-blue-400',
  Water: 'text-cyan-400',
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

// ─── AstroChart Settings ────────────────────────────────────────────────────

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

// ─── Planet Wheel Component ──────────────────────────────────────────────────

function PlanetWheel({ chart }: { chart: ChartData }) {
  const size = 400;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 180;
  const innerR = 130;
  const signR = 155;

  function coordFor(r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-md mx-auto">
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.3" />
      {/* Inner ring */}
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="#8b5cf6" strokeWidth="2" opacity="0.3" />
      {/* Sign ring */}
      <circle cx={cx} cy={cy} r={signR} fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />

      {/* Zodiac signs */}
      {ZODIAC_SIGNS.map((sign, i) => {
        const angle = i * 30;
        const outer = coordFor(outerR + 12, angle);
        return (
          <g key={sign.name}>
            <text
              x={outer.x} y={outer.y}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="12" fill="#94a3b8"
              transform={`rotate(${angle}, ${outer.x}, ${outer.y})`}
            >
              {sign.symbol}
            </text>
          </g>
        );
      })}

      {/* Planet positions */}
      {chart.planets.map(p => {
        const pos = coordFor(outerR - 10, p.longitude);
        const color = PLANET_COLORS[p.name] ?? '#e2e8f0';
        return (
          <g key={p.name}>
            <circle cx={pos.x} cy={pos.y} r="8" fill={color} />
            <text
              x={pos.x} y={pos.y + 3}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="8" fill="white" fontWeight="bold"
            >
              {PLANET_SYMBOLS[p.name] ?? p.name[0]}
            </text>
            <title>{p.name}: {p.signSymbol} {p.signName} {p.degree.toFixed(1)}°</title>
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
              stroke="#475569" strokeWidth="1" opacity="0.3"
            />
            <text
              x={pos.x} y={pos.y}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="7" fill="#64748b"
            >
              {i + 1}
            </text>
          </g>
        );
      })}

      {/* Center */}
      <circle cx={cx} cy={cy} r="25" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
      <text x={cx} y={cy - 5} textAnchor="middle" fontSize="8" fill="#f59e0b">SOLAR</text>
      <text x={cx} y={cy + 7} textAnchor="middle" fontSize="10" fill="#e2e8f0" fontWeight="bold">太阳返照</text>
    </svg>
  );
}

// ─── Planet List Component ─────────────────────────────────────────────────

function PlanetList({ planets, language }: { planets: PlanetData[]; language: Language }) {
  return (
    <div className="space-y-2">
      {planets.map(p => (
        <motion.div
          key={p.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800/70 transition-colors"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
            style={{ backgroundColor: `${PLANET_COLORS[p.name]}22` }}
          >
            {PLANET_SYMBOLS[p.name] ?? p.name[0]}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">{p.name}</span>
              <span className="text-slate-400 text-sm">
                {p.signSymbol} {p.signName} {p.degree.toFixed(1)}°
              </span>
            </div>
            <div className="text-xs text-slate-500">
              {language === 'zh' ? '黄经' : 'Longitude'}: {p.longitude.toFixed(2)}°
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function SolarReturnPage() {
  const [birthday, setBirthday] = useState<string>('1990-08-16');
  const [birthTime, setBirthTime] = useState<string>('12:00');
  const [lat, setLat] = useState<number>(35.6762);
  const [lng, setLng] = useState<number>(139.6503);
  const [targetYear, setTargetYear] = useState<number>(() => new Date().getFullYear());
  const [language, setLanguage] = useState<Language>('zh');
  const [chartData, setChartData] = useState<SolarReturnResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch Solar Return data from API
  const fetchSolarReturnData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

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
        const err = await response.json();
        throw new Error(err.error || 'Failed to calculate Solar Return');
      }

      const data: SolarReturnResponse = await response.json();
      setChartData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [birthday, birthTime, lat, lng, targetYear]);

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
    const asc = chartData.chart.houses.ascendant;
    const ic = (chartData.chart.houses.midheaven + 180) % 360;
    const dsc = (asc + 180) % 360;
    const mc = chartData.chart.houses.midheaven;

    const astroData = {
      planets,
      cusps: chartData.chart.houses.houses,
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
      chart.radix({ planets, cusps: chartData.chart.houses.houses })
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#030014] via-[#0f0a1e] to-[#030014] text-white p-4 md:p-8 relative overflow-hidden">
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-600/15 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-orange-600/15 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            {language === 'zh' ? '太阳返照' : 'Solar Return'}
          </h1>
          <p className="text-amber-300/80 text-lg">
            {language === 'zh'
              ? '太阳每年回到出生时黄道经度的精确时刻 · SWEPH精确计算'
              : 'The precise moment when the Sun returns to its birth longitude · Swiss Ephemeris'}
          </p>
        </div>

        {/* Input Form - Glass Card */}
        <div className="bg-gradient-to-br from-amber-950/40 via-slate-900/80 to-orange-950/40 rounded-xl p-6 mb-6 backdrop-blur-xl border border-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.1)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {/* Birthday */}
            <div>
              <label className="block text-amber-300 text-sm font-medium mb-2">
                {language === 'zh' ? '出生日期' : 'Birthday'}
              </label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:border-amber-500 focus:outline-none backdrop-blur-sm"
              />
            </div>

            {/* Birth Time */}
            <div>
              <label className="block text-amber-300 text-sm font-medium mb-2">
                {language === 'zh' ? '出生时间' : 'Birth Time'}
              </label>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:border-amber-500 focus:outline-none backdrop-blur-sm"
              />
            </div>

            {/* Latitude */}
            <div>
              <label className="block text-amber-300 text-sm font-medium mb-2">
                {language === 'zh' ? '出生纬度' : 'Latitude'}
              </label>
              <input
                type="number"
                step="0.0001"
                min="-90"
                max="90"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:border-amber-500 focus:outline-none backdrop-blur-sm"
              />
            </div>

            {/* Longitude */}
            <div>
              <label className="block text-amber-300 text-sm font-medium mb-2">
                {language === 'zh' ? '出生经度' : 'Longitude'}
              </label>
              <input
                type="number"
                step="0.0001"
                min="-180"
                max="180"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:border-amber-500 focus:outline-none backdrop-blur-sm"
              />
            </div>

            {/* Target Year */}
            <div>
              <label className="block text-amber-300 text-sm font-medium mb-2">
                {language === 'zh' ? '返照年份' : 'Target Year'}
              </label>
              <input
                type="number"
                min="1900"
                max="2100"
                value={targetYear}
                onChange={(e) => setTargetYear(parseInt(e.target.value) || new Date().getFullYear())}
                className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:border-amber-500 focus:outline-none backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Language Toggle */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setLanguage('zh')}
              className={`flex-1 py-2.5 rounded-lg border-2 transition-all backdrop-blur-sm ${
                language === 'zh'
                  ? 'border-amber-500/50 bg-amber-500/20 text-amber-300'
                  : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
              }`}
            >
              中文
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`flex-1 py-2.5 rounded-lg border-2 transition-all backdrop-blur-sm ${
                language === 'en'
                  ? 'border-amber-500/50 bg-amber-500/20 text-amber-300'
                  : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
              }`}
            >
              English
            </button>
          </div>

          {/* Calculate Button - Glassmorphic Gradient */}
          <button
            onClick={fetchSolarReturnData}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600/80 to-orange-600/80 hover:from-amber-500/90 hover:to-orange-500/90 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-xl border border-amber-400/30 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
          >
            {isLoading
              ? (language === 'zh' ? '计算中...' : 'Calculating...')
              : (language === 'zh' ? '计算太阳返照' : 'Calculate Solar Return')}
          </button>

          {error && (
            <div className="mt-4 p-4 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 text-sm backdrop-blur-xl">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {chartData && (
          <div className="space-y-6">
            {/* Solar Return Info - Glass Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-amber-950/50 to-slate-900/80 rounded-xl p-6 border border-amber-500/20 backdrop-blur-xl shadow-[0_0_40px_rgba(245,158,11,0.1)]"
            >
              <h2 className="text-lg font-semibold text-amber-300 mb-4">
                {language === 'zh' ? '太阳返照精确时间' : 'Solar Return Exact Time'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-slate-800/50 text-center backdrop-blur-sm border border-slate-700/30">
                  <div className="text-xs text-slate-400 mb-1">
                    {language === 'zh' ? '出生日期' : 'Birth Date'}
                  </div>
                  <div className="text-white font-medium">{chartData.birthDate}</div>
                  <div className="text-xs text-slate-500">{chartData.birthTime}</div>
                </div>
                <div className="p-4 rounded-lg bg-amber-500/10 text-center border border-amber-500/30 backdrop-blur-sm">
                  <div className="text-xs text-amber-400 mb-1">
                    {language === 'zh' ? '返照精确时间' : 'SR Exact Time'}
                  </div>
                  <div className="text-white font-medium">{chartData.birthdayExactTime}</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 text-center backdrop-blur-sm border border-slate-700/30">
                  <div className="text-xs text-slate-400 mb-1">
                    {language === 'zh' ? '出生太阳黄经' : 'Birth Sun Longitude'}
                  </div>
                  <div className="text-white font-medium">{chartData.birthSunLongitude.toFixed(2)}°</div>
                </div>
              </div>
            </motion.div>

            {/* Chart - Glass Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 rounded-xl p-6 border border-slate-700/30 backdrop-blur-xl"
            >
              <h2 className="text-lg font-semibold text-white mb-4">
                {language === 'zh' ? '太阳返照星盘' : 'Solar Return Chart'}
              </h2>
              
              {/* Simple SVG Wheel */}
              <div className="mb-4">
                <PlanetWheel chart={chartData.chart} />
              </div>
              
              {/* AstroChart */}
              <div
                ref={chartRef}
                id="astrochart-container"
                className="w-full flex justify-center"
              />
              
              <p className="text-xs text-slate-500 text-center mt-4">
                {language === 'zh'
                  ? '使用瑞士星历表(SWEPH)精确计算 · AstroChart专业可视化'
                  : 'Swiss Ephemeris Precision · AstroChart Visualization'}
              </p>
            </motion.div>

            {/* Planet List - Glass Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 rounded-xl p-6 border border-slate-700/30 backdrop-blur-xl"
            >
              <h2 className="text-lg font-semibold text-white mb-4">
                {language === 'zh' ? '行星位置' : 'Planetary Positions'}
              </h2>
              <PlanetList planets={chartData.chart.planets} language={language} />
            </motion.div>

            {/* House Cusps - Glass Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-amber-950/40 to-slate-900/80 rounded-xl p-6 border border-amber-500/20 backdrop-blur-xl"
            >
              <h2 className="text-lg font-semibold text-white mb-4">
                {language === 'zh' ? '宫位信息' : 'House Information'}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-slate-800/50 text-center backdrop-blur-sm border border-slate-700/30">
                  <div className="text-xs text-slate-400">
                    {language === 'zh' ? '上升点' : 'Ascendant'}
                  </div>
                  <div className="text-amber-400 font-medium">
                    {ZODIAC_SIGNS[Math.floor(chartData.chart.houses.ascendant / 30)].symbol}{' '}
                    {(chartData.chart.houses.ascendant % 30).toFixed(1)}°
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50 text-center backdrop-blur-sm border border-slate-700/30">
                  <div className="text-xs text-slate-400">
                    {language === 'zh' ? '天顶' : 'Midheaven'}
                  </div>
                  <div className="text-amber-400 font-medium">
                    {ZODIAC_SIGNS[Math.floor(chartData.chart.houses.midheaven / 30)].symbol}{' '}
                    {(chartData.chart.houses.midheaven % 30).toFixed(1)}°
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50 text-center backdrop-blur-sm border border-slate-700/30">
                  <div className="text-xs text-slate-400">
                    {language === 'zh' ? '下降点' : 'Descendant'}
                  </div>
                  <div className="text-amber-400 font-medium">
                    {ZODIAC_SIGNS[Math.floor(((chartData.chart.houses.ascendant + 180) % 360) / 30)].symbol}{' '}
                    {((chartData.chart.houses.ascendant + 180) % 30).toFixed(1)}°
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50 text-center backdrop-blur-sm border border-slate-700/30">
                  <div className="text-xs text-slate-400">
                    {language === 'zh' ? '天底' : 'IC'}
                  </div>
                  <div className="text-amber-400 font-medium">
                    {ZODIAC_SIGNS[Math.floor(((chartData.chart.houses.midheaven + 180) % 360) / 30)].symbol}{' '}
                    {((chartData.chart.houses.midheaven + 180) % 30).toFixed(1)}°
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Interpretation - Glass Card */}
            {chartData.interpretation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-amber-950/40 to-slate-900/80 rounded-xl p-6 border border-amber-500/20 backdrop-blur-xl"
              >
                <h2 className="text-lg font-semibold text-white mb-4">
                  {language === 'zh' ? '解读' : 'Interpretation'}
                </h2>
                <pre className="text-slate-300 text-sm whitespace-pre-wrap font-sans">
                  {chartData.interpretation}
                </pre>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
