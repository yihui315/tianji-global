'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

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

// ─── Planet Symbols ─────────────────────────────────────────────────────────

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
};

const MOTION_COLORS = {
  direct: '#22c55e',
  retrograde: '#ef4444',
  station: '#f59e0b',
};

// ─── Planet Wheel Component ───────────────────────────────────────────────────

function PlanetWheel({ planets }: { planets: PlanetTransitData[] }) {
  const size = 400;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 180;
  const innerR = 130;
  const signR = 155;

  const ZODIAC_SIGNS = [
    { name: 'Aries',     nameZh: '白羊', symbol: '♈' },
    { name: 'Taurus',    nameZh: '金牛', symbol: '♉' },
    { name: 'Gemini',    nameZh: '双子', symbol: '♊' },
    { name: 'Cancer',    nameZh: '巨蟹', symbol: '♋' },
    { name: 'Leo',       nameZh: '狮子', symbol: '♌' },
    { name: 'Virgo',     nameZh: '处女', symbol: '♍' },
    { name: 'Libra',     nameZh: '天秤', symbol: '♎' },
    { name: 'Scorpio',   nameZh: '天蝎', symbol: '♏' },
    { name: 'Sagittarius',nameZh: '射手', symbol: '♐' },
    { name: 'Capricorn', nameZh: '摩羯', symbol: '♑' },
    { name: 'Aquarius',  nameZh: '水瓶', symbol: '♒' },
    { name: 'Pisces',    nameZh: '双鱼', symbol: '♓' },
  ];

  function coordFor(r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-md mx-auto">
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
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

      {/* Natal positions (inner ring) */}
      {planets.map(p => {
        const pos = coordFor(innerR, p.natalLongitude);
        const motionColor = MOTION_COLORS[p.motion];
        return (
          <g key={`natal-${p.name}`}>
            <circle cx={pos.x} cy={pos.y} r="6" fill={motionColor} opacity="0.4" />
            <text
              x={pos.x} y={pos.y + 3}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="8" fill="#94a3b8"
            >
              {PLANET_SYMBOLS[p.name] ?? p.name[0]}
            </text>
            <title>Natal {p.name}: {p.signSymbol} {p.signName} {p.degree.toFixed(1)}°</title>
          </g>
        );
      })}

      {/* Progressed positions (outer ring) */}
      {planets.map(p => {
        const pos = coordFor(outerR, p.longitude);
        const motionColor = MOTION_COLORS[p.motion];
        return (
          <g key={`progressed-${p.name}`}>
            <circle cx={pos.x} cy={pos.y} r="8" fill={motionColor} />
            <text
              x={pos.x} y={pos.y + 3}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="8" fill="white" fontWeight="bold"
            >
              {PLANET_SYMBOLS[p.name] ?? p.name[0]}
            </text>
            {p.motion === 'retrograde' && (
              <text
                x={pos.x + 10} y={pos.y - 10}
                fontSize="10" fill="#ef4444" fontWeight="bold"
              >
                R
              </text>
            )}
            <title>Progressed {p.name}: {p.signSymbol} {p.signName} {p.degree.toFixed(1)}° ({p.motion})</title>
          </g>
        );
      })}

      {/* Center */}
      <circle cx={cx} cy={cy} r="25" fill="#1e293b" stroke="#334155" strokeWidth="2" />
      <text x={cx} y={cy - 5} textAnchor="middle" fontSize="8" fill="#64748b">PROGRESSED</text>
      <text x={cx} y={cy + 7} textAnchor="middle" fontSize="10" fill="#e2e8f0" fontWeight="bold">次限推运</text>
    </svg>
  );
}

// ─── Planet List Component ─────────────────────────────────────────────────

function PlanetList({ planets, language }: { planets: PlanetTransitData[]; language: 'zh' | 'en' }) {
  return (
    <div className="space-y-2">
      {planets.map(p => (
        <motion.div
          key={p.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800/70 transition-colors"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
            style={{ backgroundColor: `${MOTION_COLORS[p.motion]}22` }}>
            {PLANET_SYMBOLS[p.name] ?? p.name[0]}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">{p.name}</span>
              <span className="text-slate-400 text-sm">
                {p.signSymbol} {p.signName} {p.degree.toFixed(1)}°
              </span>
              {p.motion === 'retrograde' && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">R</span>
              )}
              {p.motion === 'station' && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">静止</span>
              )}
            </div>
            <div className="text-xs text-slate-500">
              {language === 'zh' ? '出生位置' : 'Natal'}: {p.natalLongitude.toFixed(2)}°
              {language === 'zh' ? ' | 移动' : ' | Motion'}: {p.speed.toFixed(3)}°/day
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Motion Legend ─────────────────────────────────────────────────────────

function MotionLegend({ language }: { language: 'zh' | 'en' }) {
  return (
    <div className="flex justify-center gap-6 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: MOTION_COLORS.direct }} />
        <span className="text-slate-400">{language === 'zh' ? '顺行' : 'Direct'}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: MOTION_COLORS.retrograde }} />
        <span className="text-slate-400">{language === 'zh' ? '逆行' : 'Retrograde'}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: MOTION_COLORS.station }} />
        <span className="text-slate-400">{language === 'zh' ? '静止' : 'Station'}</span>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function TransitPage() {
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [birthDate, setBirthDate] = useState('2000-01-01');
  const [birthTime, setBirthTime] = useState('12:00');
  const [targetDate, setTargetDate] = useState(() => {
    // Default to current date + some years
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [lat, setLat] = useState('35.6762');
  const [lng, setLng] = useState('139.6503');
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<TransitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Calculation failed');
    } finally {
      setIsCalculating(false);
    }
  }, [birthDate, birthTime, lat, lng, targetDate]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Glassmorphic Header */}
      <div className="relative bg-black/20 border-b border-blue-500/20 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {language === 'zh' ? '次限推运' : 'Secondary Progressions'}
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                {language === 'zh'
                  ? '基于1天=1年法则的推运系统'
                  : 'Progression system based on 1 day = 1 year rule'}
              </p>
            </div>
            <button
              onClick={() => setLanguage(l => l === 'zh' ? 'en' : 'zh')}
              className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-sm transition-colors border border-blue-400/30 backdrop-blur-sm"
            >
              {language === 'zh' ? 'EN' : '中文'}
            </button>
          </div>
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form - Glass Card */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-950/40 via-slate-900/80 to-purple-950/40 rounded-xl p-6 border border-blue-500/20 backdrop-blur-xl shadow-[0_0_40px_rgba(59,130,246,0.1)]">
              <h2 className="text-lg font-semibold text-white mb-4">
                {language === 'zh' ? '出生信息' : 'Birth Information'}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">
                      {language === 'zh' ? '出生日期' : 'Birth Date'}
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={e => setBirthDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">
                      {language === 'zh' ? '出生时间' : 'Birth Time'}
                    </label>
                    <input
                      type="time"
                      value={birthTime}
                      onChange={e => setBirthTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none backdrop-blur-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">
                      {language === 'zh' ? '出生纬度' : 'Latitude'}
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      min="-90" max="90"
                      value={lat}
                      onChange={e => setLat(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-1">
                      {language === 'zh' ? '出生经度' : 'Longitude'}
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      min="-180" max="180"
                      value={lng}
                      onChange={e => setLng(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none backdrop-blur-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-950/40 via-slate-900/80 to-blue-950/40 rounded-xl p-6 border border-purple-500/20 backdrop-blur-xl shadow-[0_0_40px_rgba(139,92,246,0.1)]">
              <h2 className="text-lg font-semibold text-white mb-4">
                {language === 'zh' ? '目标日期' : 'Target Date'}
              </h2>

              <div>
                <label className="block text-slate-400 text-sm mb-1">
                  {language === 'zh' ? '推运日期' : 'Progression Date'}
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={e => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none backdrop-blur-sm"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {language === 'zh'
                    ? '推运使用1天=1年法则：出生后每1天代表1年的生命历程'
                    : 'Progression rule: Each day after birth represents one year of life'}
                </p>
              </div>
            </div>

            {/* Calculate Button - Glassmorphic Gradient */}
            <button
              onClick={handleCalculate}
              disabled={isCalculating}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-500/90 hover:to-purple-500/90 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-xl border border-blue-400/30 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
            >
              {isCalculating
                ? (language === 'zh' ? '计算中...' : 'Calculating...')
                : (language === 'zh' ? '计算推运' : 'Calculate Progressions')}
            </button>

            {error && (
              <div className="p-4 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 text-sm backdrop-blur-xl">
                {error}
              </div>
            )}
          </div>

          {/* Results */}
          <div className="space-y-6">
            {result ? (
              <>
                {/* Summary Card - Glass Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-blue-950/50 via-slate-900/90 to-purple-950/50 rounded-xl p-6 border border-blue-500/20 backdrop-blur-xl shadow-[0_0_50px_rgba(59,130,246,0.15)]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      {language === 'zh' ? '推运结果' : 'Progression Results'}
                    </h3>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-400">{result.age.toFixed(1)}</div>
                      <div className="text-xs text-slate-400">
                        {language === 'zh' ? '岁' : 'years old'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 rounded-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700/30">
                      <div className="text-xs text-slate-400">
                        {language === 'zh' ? '出生日期' : 'Birth'}
                      </div>
                      <div className="text-sm text-white">{result.birthDate}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700/30">
                      <div className="text-xs text-slate-400">
                        {language === 'zh' ? '目标日期' : 'Target'}
                      </div>
                      <div className="text-sm text-white">{result.targetDate}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700/30">
                      <div className="text-xs text-slate-400">
                        {language === 'zh' ? '推运天数' : 'Prog. Days'}
                      </div>
                      <div className="text-sm text-white">{result.progressedDays}</div>
                    </div>
                  </div>
                </motion.div>

                {/* Planet Wheel - Glass Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 rounded-xl p-6 border border-slate-700/30 backdrop-blur-xl"
                >
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {language === 'zh' ? '星体位置图' : 'Planetary Positions'}
                  </h3>
                  <MotionLegend language={language} />
                  <div className="mt-4">
                    <PlanetWheel planets={result.planets} />
                  </div>
                  <p className="text-xs text-slate-500 text-center mt-2">
                    {language === 'zh'
                      ? '外圈: 推运位置 | 内圈: 出生位置'
                      : 'Outer: Progressed | Inner: Natal'}
                  </p>
                </motion.div>

                {/* Planet List - Glass Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 rounded-xl p-6 border border-slate-700/30 backdrop-blur-xl"
                >
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {language === 'zh' ? '行星详情' : 'Planet Details'}
                  </h3>
                  <PlanetList planets={result.planets} language={language} />
                </motion.div>

                {/* Major Transits - Glass Card */}
                {result.majorTransits.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-purple-950/40 to-slate-900/80 rounded-xl p-6 border border-purple-500/20 backdrop-blur-xl"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {language === 'zh' ? '重要推运' : 'Major Progressions'}
                    </h3>
                    <ul className="space-y-2">
                      {result.majorTransits.map((transit, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className="text-purple-400">•</span>
                          {transit}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Interpretation - Glass Card */}
                {result.interpretation && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-blue-950/40 to-slate-900/80 rounded-xl p-6 border border-blue-500/20 backdrop-blur-xl"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">
                      {language === 'zh' ? '解读' : 'Interpretation'}
                    </h3>
                    <div className="text-sm text-slate-300 whitespace-pre-line">
                      {result.interpretation}
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              /* Empty State - Glass Card */
              <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 rounded-xl p-12 border border-slate-700/30 text-center backdrop-blur-xl">
                <div className="text-5xl mb-4">🔮</div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {language === 'zh' ? '准备计算推运' : 'Ready to Calculate'}
                </h3>
                <p className="text-slate-400 text-sm">
                  {language === 'zh'
                    ? '输入出生信息和目标日期开始分析'
                    : 'Enter your birth information and target date to begin analysis'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
