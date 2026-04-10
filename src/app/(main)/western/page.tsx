'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

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
  Fire: 'text-red-400',
  Earth: 'text-yellow-500',
  Air: 'text-blue-400',
  Water: 'text-cyan-400',
};

const ELEMENT_BG: Record<string, string> = {
  Fire: 'from-red-900/40 to-orange-900/40',
  Earth: 'from-yellow-900/40 to-amber-900/40',
  Air: 'from-blue-900/40 to-cyan-900/40',
  Water: 'from-cyan-900/40 to-teal-900/40',
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
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {language === 'zh' ? '西方星盘' : 'Western Natal Chart'}
          </h1>
          <p className="text-blue-300/80 text-lg">
            {language === 'zh' ? '使用瑞士星历表(SWEPH)精确计算 · AstroChart专业可视化' : 'Swiss Ephemeris Precision · AstroChart Visualization'}
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-slate-800/50 rounded-xl p-6 mb-6 backdrop-blur-sm border border-slate-700/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Birthday */}
            <div>
              <label className="block text-blue-300 text-sm font-medium mb-2">
                {language === 'zh' ? '出生日期' : 'Birthday'}
              </label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Birth Time */}
            <div>
              <label className="block text-blue-300 text-sm font-medium mb-2">
                {language === 'zh' ? '出生时间' : 'Birth Time'}
              </label>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Latitude */}
            <div>
              <label className="block text-blue-300 text-sm font-medium mb-2">
                {language === 'zh' ? '出生纬度' : 'Latitude'}
              </label>
              <input
                type="number"
                step="0.0001"
                min="-90"
                max="90"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Longitude */}
            <div>
              <label className="block text-blue-300 text-sm font-medium mb-2">
                {language === 'zh' ? '出生经度' : 'Longitude'}
              </label>
              <input
                type="number"
                step="0.0001"
                min="-180"
                max="180"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Language Toggle */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setLanguage('zh')}
              className={`flex-1 py-2.5 rounded-lg border-2 transition-all ${
                language === 'zh'
                  ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                  : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500'
              }`}
            >
              中文
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`flex-1 py-2.5 rounded-lg border-2 transition-all ${
                language === 'en'
                  ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                  : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500'
              }`}
            >
              English
            </button>
          </div>

          {/* Calculate Button */}
          <button
            onClick={fetchChartData}
            disabled={isLoading}
            className="w-full py-4 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? (language === 'zh' ? '计算中...' : 'Calculating...')
              : (language === 'zh' ? '生成星盘' : 'Generate Chart')}
          </button>

          {error && (
            <div className="mt-4 p-4 rounded-lg bg-red-900/30 border border-red-600/50 text-red-300 text-center">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {chartData && (
          <div className="space-y-6">
            {/* Big Three */}
            <div className="grid grid-cols-3 gap-4">
              {/* Sun */}
              <div className={`bg-gradient-to-b ${ELEMENT_BG[getSignElement(chartData.bigThree.sun.sign)]} rounded-xl p-5 border border-amber-600/30 text-center`}>
                <div className="text-3xl mb-1">☀️</div>
                <div className="text-xs text-amber-400 mb-1">
                  {language === 'zh' ? '太阳' : 'Sun'}
                </div>
                <div className="text-2xl mb-1">{chartData.bigThree.sun.symbol}</div>
                <div className="text-lg font-bold text-white mb-1">
                  {language === 'zh' ? chartData.bigThree.sun.signZh : chartData.bigThree.sun.sign}
                </div>
                <div className={`text-sm ${ELEMENT_COLORS[getSignElement(chartData.bigThree.sun.sign)]}`}>
                  {chartData.bigThree.sun.degree}°
                </div>
              </div>

              {/* Moon */}
              <div className={`bg-gradient-to-b ${ELEMENT_BG[getSignElement(chartData.bigThree.moon.sign)]} rounded-xl p-5 border border-slate-500/30 text-center`}>
                <div className="text-3xl mb-1">🌙</div>
                <div className="text-xs text-slate-400 mb-1">
                  {language === 'zh' ? '月亮' : 'Moon'}
                </div>
                <div className="text-2xl mb-1">{chartData.bigThree.moon.symbol}</div>
                <div className="text-lg font-bold text-white mb-1">
                  {language === 'zh' ? chartData.bigThree.moon.signZh : chartData.bigThree.moon.sign}
                </div>
                <div className={`text-sm ${ELEMENT_COLORS[getSignElement(chartData.bigThree.moon.sign)]}`}>
                  {chartData.bigThree.moon.degree}°
                </div>
              </div>

              {/* Rising */}
              <div className={`bg-gradient-to-b ${ELEMENT_BG[getSignElement(chartData.bigThree.rising.sign)]} rounded-xl p-5 border border-purple-600/30 text-center`}>
                <div className="text-3xl mb-1">⬆️</div>
                <div className="text-xs text-purple-400 mb-1">
                  {language === 'zh' ? '上升' : 'Rising'}
                </div>
                <div className="text-2xl mb-1">{chartData.bigThree.rising.symbol}</div>
                <div className="text-lg font-bold text-white mb-1">
                  {language === 'zh' ? chartData.bigThree.rising.signZh : chartData.bigThree.rising.sign}
                </div>
                <div className={`text-sm ${ELEMENT_COLORS[getSignElement(chartData.bigThree.rising.sign)]}`}>
                  {chartData.bigThree.rising.degree}°
                </div>
              </div>
            </div>

            {/* AstroChart SVG Visualization */}
            <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border border-slate-700/50">
              <h3 className="text-xl font-bold text-blue-300 mb-4 text-center">
                {language === 'zh' ? '专业星盘' : 'Natal Chart'}
              </h3>
              <div className="flex justify-center">
                <div
                  id="western-chart"
                  ref={chartRef}
                  className="w-full max-w-md"
                />
              </div>
            </div>

            {/* Planet Positions Table */}
            <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border border-slate-700/50">
              <h3 className="text-xl font-bold text-blue-300 mb-4 text-center">
                {language === 'zh' ? '行星位置' : 'Planetary Positions'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {chartData.planets.map((planet) => (
                  <div
                    key={planet.name}
                    className="bg-slate-700/30 rounded-lg p-3 text-center border border-slate-600/30"
                  >
                    <div className="text-lg mb-1" style={{ color: PLANET_COLORS[planet.name] }}>
                      {PLANET_SYMBOLS[planet.name]}
                    </div>
                    <div className="text-white font-medium text-sm">
                      {language === 'zh' ? getChinesePlanetName(planet.name) : planet.name}
                    </div>
                    <div className="text-blue-300 text-xs mt-1">
                      {planet.signSymbol} {language === 'zh' ? planet.signZh : planet.sign} {planet.degree}°
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* House Cusps */}
            <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border border-slate-700/50">
              <h3 className="text-xl font-bold text-blue-300 mb-4 text-center">
                {language === 'zh' ? '宫位' : 'Houses'}
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {chartData.houses.cusps.map((cusp, index) => {
                  const signIndex = Math.floor(cusp / 30) % 12;
                  const sign = ZODIAC_SIGNS[signIndex];
                  return (
                    <div
                      key={index}
                      className="bg-slate-700/30 rounded-lg p-3 text-center border border-slate-600/30"
                    >
                      <div className="text-slate-400 text-xs mb-1">
                        {language === 'zh' ? `第${index + 1}宫` : `House ${index + 1}`}
                      </div>
                      <div className="text-white font-medium text-sm">
                        {sign.symbol}
                      </div>
                      <div className="text-blue-300 text-xs">
                        {language === 'zh' ? sign.nameZh : sign.name}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ascendant & Midheaven */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-purple-900/20 rounded-lg p-4 text-center border border-purple-600/30">
                  <div className="text-xs text-purple-400 mb-1">
                    {language === 'zh' ? '上升星座' : 'Ascendant'}
                  </div>
                  <div className="text-2xl mb-1">
                    {ZODIAC_SIGNS[Math.floor(chartData.houses.ascendant / 30) % 12].symbol}
                  </div>
                  <div className="text-white font-medium">
                    {language === 'zh' ? chartData.houses.ascendantSignZh : chartData.houses.ascendantSign}
                  </div>
                  <div className="text-purple-300 text-sm">{chartData.houses.ascendant}°</div>
                </div>
                <div className="bg-blue-900/20 rounded-lg p-4 text-center border border-blue-600/30">
                  <div className="text-xs text-blue-400 mb-1">
                    {language === 'zh' ? '天顶' : 'Midheaven'}
                  </div>
                  <div className="text-2xl mb-1">
                    {ZODIAC_SIGNS[Math.floor(chartData.houses.midheaven / 30) % 12].symbol}
                  </div>
                  <div className="text-white font-medium">
                    {language === 'zh' ? chartData.houses.mcSignZh : chartData.houses.mcSign}
                  </div>
                  <div className="text-blue-300 text-sm">{chartData.houses.midheaven}°</div>
                </div>
              </div>
            </div>

            {/* Calculation Info */}
            <div className="text-center text-slate-500 text-xs">
              <p>{chartData.meta.platform} · v{chartData.meta.version}</p>
              <p className="mt-1">{chartData.meta.calculationMode}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>© 2024 TianJi Global · 天机全球</p>
          <p className="mt-1">
            {language === 'zh'
              ? '使用瑞士星历表(SWEPH)进行高精度天文计算'
              : 'High-precision astronomical calculations using Swiss Ephemeris (SWEPH)'}
          </p>
        </div>
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