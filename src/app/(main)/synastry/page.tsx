'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PDFDownloadButton from '@/components/PDFDownloadButton';
import AnimatedShareButton from '@/components/AnimatedShareButton';

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Zodiac Data (same as engine) ─────────────────────────────────────────

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

const ASPECT_COLORS: Record<string, string> = {
  Conjunction:  '#FFD700',
  Sextile:      '#4CAF50',
  Square:       '#F44336',
  Trine:        '#2196F3',
  Opposition:   '#E91E63',
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
};

// ─── Animated Score Circle ───────────────────────────────────────────────────

function ScoreCircle({ score }: { score: number }) {
  const [animated, setAnimated] = useState(0);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 200);
    return () => clearTimeout(timer);
  }, [score]);

  const color = score >= 70 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-44 h-44 mx-auto">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={radius} stroke="#334155" strokeWidth="12" fill="none" />
        <circle
          cx="80" cy="80" r={radius}
          stroke={color} strokeWidth="12" fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-serif text-white/90">{animated}</span>
        <span className="text-sm text-slate-400">/ 100</span>
      </div>
    </div>
  );
}

// ─── SVG Synastry Wheel ──────────────────────────────────────────────────────

function SynastryWheel({ chart1, chart2, aspects }: {
  chart1: ChartData;
  chart2: ChartData;
  aspects: Aspect[];
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

  const planetMap1 = new Map(chart1.planets.map(p => [p.name, p]));
  const planetMap2 = new Map(chart2.planets.map(p => [p.name, p]));

  // Aspect lines: planet1 (outer) to planet2 (inner)
  const aspectLines: Array<{ x1: number; y1: number; x2: number; y2: number; color: string; strength: number }> = [];
  for (const asp of aspects.slice(0, 20)) {
    const p1 = planetMap1.get(asp.planet1);
    const p2 = planetMap2.get(asp.planet2);
    if (!p1 || !p2) continue;
    const c1 = coordFor(outerR, p1.longitude);
    const c2 = coordFor(innerR, p2.longitude);
    aspectLines.push({ x1: c1.x, y1: c1.y, x2: c2.x, y2: c2.y, color: ASPECT_COLORS[asp.type] ?? '#888', strength: asp.strength });
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-lg mx-auto">
      {/* Outer ring (Person A) */}
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.4" />
      {/* Inner ring (Person B) */}
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.4" />
      {/* Sign ring */}
      <circle cx={cx} cy={cy} r={signR} fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />

      {/* Zodiac signs around outer ring */}
      {ZODIAC_SIGNS.map((sign, i) => {
        const angle = i * 30;
        const outer = coordFor(outerR + 14, angle);
        const signName = sign.nameZh ?? sign.name;
        return (
          <g key={sign.name}>
            <text
              x={outer.x} y={outer.y}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="14" fill="#94a3b8"
              transform={`rotate(${angle}, ${outer.x}, ${outer.y})`}
            >
              {sign.symbol}
            </text>
            <text
              x={outer.x} y={outer.y + 14}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="8" fill="#64748b"
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
          strokeOpacity={0.4 + (line.strength / 100) * 0.5}
        />
      ))}

      {/* Person A planets (outer ring) */}
      {chart1.planets.map(p => {
        const pos = coordFor(outerR, p.longitude);
        return (
          <g key={`p1-${p.name}`}>
            <circle cx={pos.x} cy={pos.y} r={planetDotR + 1} fill="#3b82f6" />
            <circle cx={pos.x} cy={pos.y} r={planetDotR} fill="#60a5fa" />
            <text
              x={pos.x + 8} y={pos.y - 4}
              fontSize="10" fill="#93c5fd" fontWeight="bold"
            >
              {PLANET_SYMBOLS[p.name] ?? p.name[0]}
            </text>
            <title>Person A: {p.name} {p.signSymbol} {p.signName} {p.degree.toFixed(1)}°</title>
          </g>
        );
      })}

      {/* Person B planets (inner ring) */}
      {chart2.planets.map(p => {
        const pos = coordFor(innerR, p.longitude);
        return (
          <g key={`p2-${p.name}`}>
            <circle cx={pos.x} cy={pos.y} r={planetDotR + 1} fill="#ef4444" />
            <circle cx={pos.x} cy={pos.y} r={planetDotR} fill="#f87171" />
            <text
              x={pos.x - 8} y={pos.y - 4}
              fontSize="10" fill="#fca5a5" fontWeight="bold"
              textAnchor="end"
            >
              {PLANET_SYMBOLS[p.name] ?? p.name[0]}
            </text>
            <title>Person B: {p.name} {p.signSymbol} {p.signName} {p.degree.toFixed(1)}°</title>
          </g>
        );
      })}

      {/* Center label */}
      <circle cx={cx} cy={cy} r="28" fill="#1e293b" stroke="#334155" strokeWidth="2" />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="9" fill="#64748b">SYN-ASTRY</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fontSize="11" fill="#e2e8f0" fontWeight="bold">天机合盘</text>

      {/* Legend */}
      <g transform={`translate(20, ${size - 30})`}>
        {Object.entries(ASPECT_COLORS).map(([type, color], i) => (
          <g key={type} transform={`translate(${i * 80}, 0)`}>
            <line x1="0" y1="0" x2="16" y2="0" stroke={color} strokeWidth="2" />
            <text x="20" y="4" fontSize="9" fill="#94a3b8">{type}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

// ─── Aspect List (Animated) ───────────────────────────────────────────────────

function AspectList({ aspects }: { aspects: Aspect[] }) {
  const topAspects = aspects.slice(0, 15);
  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {topAspects.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-4">No major aspects found.</p>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          style={{ display: 'contents' }}
        >
          {topAspects.map((asp, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, x: -20, scale: 0.9 },
                visible: {
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  transition: { duration: 0.4, type: 'spring', stiffness: 180, damping: 20 },
                },
              }}
              className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50"
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(124,58,237,0.1)' }}
            >
              <motion.div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: ASPECT_COLORS[asp.type] ?? '#888' }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
              />
              <span className="text-sm text-slate-300">
                <span className="text-blue-400 font-medium">{asp.planet1}</span>
                <span className="text-slate-500 mx-1">{asp.type}</span>
                <span className="text-red-400 font-medium">{asp.planet2}</span>
              </span>
              <span className="text-xs text-slate-500 ml-auto">
                {asp.strength}% · orb {asp.orb}°
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ─── Share Button ────────────────────────────────────────────────────────────

function ShareButton({ data }: { data: SynastryResponse }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const summary = {
      score: data.overallScore,
      person1Sun: data.person1Chart.planets.find(p => p.name === 'Sun')?.signSymbol,
      person2Sun: data.person2Chart.planets.find(p => p.name === 'Sun')?.signSymbol,
      aspectCount: data.aspects.length,
    };

    const text = `星盘合盘 | Synastry on TianJi Global\n` +
      `Person A ☉${summary.person1Sun} + Person B ☉${summary.person2Sun}\n` +
      `Compatibility Score: ${summary.score}/100\n` +
      `${summary.aspectCount} major aspects found\n` +
      `https://tianji.global/synastry`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Synastry Report', text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
    >
      {copied ? (
        <>
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share Report
        </>
      )}
    </button>
  );
}

// ─── Person Form ─────────────────────────────────────────────────────────────

interface PersonFormProps {
  label: string;
  colorClass: string;
  data: { birthDate: string; birthTime: string; lat: string; lng: string };
  onChange: (d: Partial<typeof defaultData>) => void;
  language: 'zh' | 'en';
}

const defaultData = { birthDate: '2000-01-01', birthTime: '12:00', lat: '35.6762', lng: '139.6503' };

function PersonForm({ label, colorClass, data: d, onChange, language }: PersonFormProps) {
  return (
    <div className="space-y-4">
      <h3 className={`text-lg font-bold ${colorClass}`}>{label}</h3>

      <div>
        <label className="block text-slate-400 text-sm mb-1">
          {language === 'zh' ? '出生日期' : 'Birth Date'}
        </label>
        <input
          type="date"
          value={d.birthDate}
          onChange={e => onChange({ birthDate: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-slate-400 text-sm mb-1">
          {language === 'zh' ? '出生时间' : 'Birth Time'}
        </label>
        <input
          type="time"
          value={d.birthTime}
          onChange={e => onChange({ birthTime: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-slate-400 text-sm mb-1">
          {language === 'zh' ? '出生纬度' : 'Latitude'}
        </label>
        <input
          type="number"
          step="0.0001"
          min="-90" max="90"
          value={d.lat}
          onChange={e => onChange({ lat: e.target.value })}
          placeholder="35.6762"
          className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white text-sm focus:border-blue-500 focus:outline-none"
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
          value={d.lng}
          onChange={e => onChange({ lng: e.target.value })}
          placeholder="139.6503"
          className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function SynastryPage() {
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [synastryType, setSynastryType] = useState<SynastryType>('overlay');
  const [person1Data, setPerson1Data] = useState({ birthDate: '2000-08-16', birthTime: '12:00', lat: '35.6762', lng: '139.6503' });
  const [person2Data, setPerson2Data] = useState({ birthDate: '1998-05-22', birthTime: '14:30', lat: '40.7128', lng: '-74.0060' });
  const [enhanceWithAI, setEnhanceWithAI] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<SynastryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

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
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Calculation failed');
    } finally {
      setIsCalculating(false);
    }
  }, [person1Data, person2Data, enhanceWithAI, language]);

  const scoreLabel = result
    ? result.overallScore >= 70
      ? (language === 'zh' ? '高度和谐' : 'Highly Harmonious')
      : result.overallScore >= 50
      ? (language === 'zh' ? '中等和谐' : 'Moderately Harmonious')
      : (language === 'zh' ? '需要努力' : 'Requires Effort')
    : '';

  const scoreLabelColor = result
    ? result.overallScore >= 70 ? 'text-green-400' : result.overallScore >= 50 ? 'text-amber-400' : 'text-red-400'
    : '';

  return (
    <main className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Glassmorphic Header */}
      <header className="relative p-6 border-b border-violet-500/20 bg-black/20 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {language === 'zh' ? '星盘合盘' : 'Synastry'}
              </h1>
              <p className="text-slate-500 text-sm">Western Astrology · {language === 'zh' ? '西方占星合盘' : 'Relationship Compatibility'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguage('zh')}
              className={`px-3 py-1 rounded-full text-sm transition-all backdrop-blur-sm ${language === 'zh' ? 'bg-violet-500/30 text-white border border-violet-400/50' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-transparent'}`}
            >
              中文
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-full text-sm transition-all backdrop-blur-sm ${language === 'en' ? 'bg-violet-500/30 text-white border border-violet-400/50' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-transparent'}`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      <div className="relative max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Input Forms - Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Person A */}
          <div className="bg-gradient-to-br from-violet-950/40 via-slate-900/80 to-purple-950/40 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-6 shadow-[0_0_40px_rgba(124,58,237,0.1)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              <span className="text-blue-400 font-medium">
                {language === 'zh' ? '人物A' : 'Person A'}
              </span>
              <span className="text-slate-500 text-xs ml-auto">Outer wheel · 蓝色</span>
            </div>
            <PersonForm
              label={language === 'zh' ? '人物A 资料' : 'Person A'}
              colorClass="text-blue-400"
              data={person1Data}
              onChange={d => setPerson1Data(prev => ({ ...prev, ...d }))}
              language={language}
            />
          </div>

          {/* Person B */}
          <div className="bg-gradient-to-br from-red-950/40 via-slate-900/80 to-pink-950/40 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 shadow-[0_0_40px_rgba(244,63,94,0.1)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
              <span className="text-red-400 font-medium">
                {language === 'zh' ? '人物B' : 'Person B'}
              </span>
              <span className="text-slate-500 text-xs ml-auto">Inner wheel · 红色</span>
            </div>
            <PersonForm
              label={language === 'zh' ? '人物B 资料' : 'Person B'}
              colorClass="text-red-400"
              data={person2Data}
              onChange={d => setPerson2Data(prev => ({ ...prev, ...d }))}
              language={language}
            />
          </div>
        </div>

        {/* Options - Glass Panel */}
        <div className="space-y-3 p-4 bg-black/30 backdrop-blur-xl rounded-xl border border-violet-500/20">
          {/* Synastry Type Tabs */}
          <div>
            <label className="block text-slate-400 text-xs mb-2">
              {language === 'zh' ? '分析模式' : 'Analysis Mode'}
            </label>
            <div className="flex gap-2">
              {(['overlay', 'composite', 'davison'] as SynastryType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setSynastryType(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all backdrop-blur-sm ${
                    synastryType === t
                      ? t === 'overlay' ? 'bg-blue-500/30 text-blue-300 border border-blue-400/50'
                      : t === 'composite' ? 'bg-violet-500/30 text-violet-300 border border-violet-400/50'
                      : 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/50'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-transparent'
                  }`}
                >
                  {t === 'overlay' ? (language === 'zh' ? '叠盘' : 'Overlay') :
                   t === 'composite' ? (language === 'zh' ? '复合盘' : 'Composite') :
                   (language === 'zh' ? '戴维森盘' : 'Davison')}
                </button>
              ))}
            </div>
            <p className="text-slate-500 text-xs mt-1">
              {synastryType === 'overlay' ? (language === 'zh' ? '两人星盘叠加对比，分析行星相位' : 'Overlay both charts, analyze planetary aspects between them') :
               synastryType === 'composite' ? (language === 'zh' ? '计算两人星盘中点，形成第三张共同星盘' : 'Compute midpoints of both charts to form a combined relationship chart') :
               (language === 'zh' ? '时间加权中点盘，更精确反映关系本质' : 'Time-weighted midpoint chart, more accurately reflects relationship essence')}
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enhanceWithAI}
              onChange={e => setEnhanceWithAI(e.target.checked)}
              className="w-4 h-4 rounded border-violet-500/50 bg-violet-950/50 text-violet-400 focus:ring-violet-500 focus:ring-offset-0"
            />
            <span className="text-slate-300 text-sm">
              {language === 'zh' ? '✨ AI 增强解读' : '✨ AI Enhanced Interpretation'}
            </span>
          </label>
        </div>

        {/* Calculate Button - Glassmorphic Gradient */}
        <button
          onClick={handleCalculate}
          disabled={isCalculating}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600/80 via-purple-600/80 to-pink-600/80 hover:from-violet-500/90 hover:via-purple-500/90 hover:to-pink-500/90 font-bold text-lg text-white transition-all disabled:opacity-50 hover:scale-[1.02] backdrop-blur-xl border border-violet-400/30 shadow-[0_0_30px_rgba(124,58,237,0.3)]"
        >
          {isCalculating
            ? (language === 'zh' ? '计算中...' : 'Calculating...')
            : (language === 'zh' ? '💫 开始合盘分析' : '💫 Calculate Synastry')}
        </button>

        {error && (
          <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-red-400 text-sm backdrop-blur-xl">
            Error: {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div ref={resultRef} className="space-y-6">
            {/* Score + Wheel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Score - Glass Card */}
              <div className="bg-gradient-to-br from-violet-950/50 via-slate-900/90 to-purple-950/50 backdrop-blur-xl border border-violet-500/30 rounded-2xl p-6 flex flex-col items-center shadow-[0_0_50px_rgba(124,58,237,0.15)]">
                <h2 className="text-lg font-bold text-slate-200 mb-4">
                  {language === 'zh' ? '综合评分' : 'Overall Score'}
                </h2>
                <ScoreCircle score={result.overallScore} />
                <p className={`mt-4 text-xl font-bold ${scoreLabelColor}`}>{scoreLabel}</p>
                <p className="text-slate-500 text-sm mt-1">
                  {result.aspects.length} {language === 'zh' ? '个主要相位' : 'major aspects'}
                </p>
                <div className="mt-6 w-full">
                  <ShareButton data={result} />
                </div>
              </div>

              {/* Wheel - Glass Card */}
              <div className="bg-gradient-to-br from-violet-950/30 via-slate-900/80 to-purple-950/30 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-4 shadow-[0_0_40px_rgba(124,58,237,0.1)]">
                <SynastryWheel
                  chart1={result.person1Chart}
                  chart2={result.person2Chart}
                  aspects={result.aspects}
                />
              </div>
            </div>

            {/* Planet Tables - Glass Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: language === 'zh' ? '人物A 行星位置' : 'Person A Planetary Positions', chart: result.person1Chart, color: 'blue' },
                { label: language === 'zh' ? '人物B 行星位置' : 'Person B Planetary Positions', chart: result.person2Chart, color: 'red' },
              ].map(({ label, chart, color }) => (
                <div key={label} className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-4">
                  <h3 className={`text-${color}-400 font-bold mb-3`}>{label}</h3>
                  <div className="space-y-1">
                    {chart.planets.map(p => (
                      <div key={p.name} className="flex items-center justify-between py-1 border-b border-slate-700/30 last:border-0">
                        <span className="text-slate-300 text-sm w-20">{p.name}</span>
                        <span className="text-slate-400 text-sm">{p.signSymbol} {p.signName} {p.degree.toFixed(1)}°</span>
                        <span className="text-slate-600 text-xs w-16 text-right">{p.longitude.toFixed(1)}°</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-700/30 text-xs text-slate-500">
                    ASC: {chart.houses.ascendant.toFixed(1)}° · MC: {chart.houses.midheaven.toFixed(1)}°
                  </div>
                </div>
              ))}
            </div>

            {/* Aspects — only for overlay synastry */}
            {(!result.meta || result.meta.type === 'overlay') && result.aspects && (
              <div className="bg-gradient-to-br from-violet-950/40 to-slate-900/80 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-4 shadow-[0_0_40px_rgba(124,58,237,0.1)]">
                <h3 className="text-violet-400 font-bold mb-3">
                  {language === 'zh' ? '相位列表' : 'Aspect List'}
                </h3>
                <AspectList aspects={result.aspects} />
              </div>
            )}

            {/* Midpoint Structures — for composite and davison */}
            {(result.compositeChart || result.davisonChart) && (
              (() => {
                const chartData = result.compositeChart ?? result.davisonChart;
                const chartType = result.meta?.type ?? 'composite';
                return (
                  <>
                    {/* Composite/Davison Planet Table */}
                    <div className="bg-gradient-to-br from-violet-950/40 to-slate-900/80 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-4">
                      <h3 className="text-violet-400 font-bold mb-3">
                        {chartType === 'davison'
                          ? (language === 'zh' ? '戴维森盘行星位置' : 'Davison Chart Planetary Positions')
                          : (language === 'zh' ? '复合盘行星位置' : 'Composite Chart Planetary Positions')}
                      </h3>
                      <div className="space-y-1">
                        {chartData?.planets.map(p => (
                          <div key={p.name} className="flex items-center justify-between py-1 border-b border-slate-700/30 last:border-0">
                            <span className="text-slate-300 text-sm w-20">{p.name}</span>
                            <span className="text-slate-400 text-sm">{p.signSymbol} {p.signName} {p.degree.toFixed(1)}°</span>
                            <span className="text-slate-600 text-xs w-16 text-right">{p.longitude.toFixed(1)}°</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-700/30 text-xs text-slate-500">
                        ASC: {chartData?.houses.ascendant.toFixed(1)}° · MC: {chartData?.houses.midheaven.toFixed(1)}°
                      </div>
                    </div>

                    {/* Midpoint Structures */}
                    {chartData?.midpointStructures && chartData.midpointStructures.length > 0 && (
                      <div className="bg-gradient-to-br from-amber-950/40 to-slate-900/80 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-4">
                        <h3 className="text-amber-400 font-bold mb-3">
                          {language === 'zh' ? '中间点结构' : 'Midpoint Structures'}
                        </h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {chartData.midpointStructures.map((ms, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
                              <div className={`w-2 h-2 rounded-full ${
                                ms.sensitivity === 'high' ? 'bg-red-500' :
                                ms.sensitivity === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                              }`} />
                              <span className="text-sm text-slate-300">
                                <span className="text-blue-400">{ms.planet1}</span>
                                <span className="text-slate-500 mx-1">Midpoint</span>
                                <span className="text-red-400">{ms.planet2}</span>
                              </span>
                              <span className="text-xs text-slate-500 ml-auto">
                                {ms.structureType} · {ms.thirdPlanet} @ {ms.aspectToThird}°
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()
            )}

            {/* PDF Download */}
            <PDFDownloadButton
              serviceType="synastry"
              resultData={result as unknown as Record<string, unknown>}
              birthData={{
                name: `${language === 'zh' ? '合盘' : 'Synastry'}`,
                birthday: `${person1Data.birthDate} & ${person2Data.birthDate}`,
              }}
              language={language}
            />

            {/* Animated Share */}
            <AnimatedShareButton
              type="synastry"
              resultData={{
                overallScore: result.overallScore,
                person1: person1Data,
                person2: person2Data,
                aspects: result.aspects.map(a => ({ ...a })),
              }}
              format="webp"
              language={language}
              variant="secondary"
            />

            {/* AI Interpretation - Glowing Glass */}
            {result.aiInterpretation && (
              <div className="bg-gradient-to-br from-violet-950/60 via-slate-900/90 to-purple-950/60 backdrop-blur-xl border border-violet-500/40 rounded-2xl p-6 shadow-[0_0_60px_rgba(124,58,237,0.2)]">
                <h3 className="text-violet-300 font-bold mb-4 text-lg">
                  ✨ {language === 'zh' ? 'AI 深度解读' : 'AI Deep Interpretation'}
                </h3>
                <div className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">
                  {result.aiInterpretation}
                </div>
                {result.disclaimer && (
                  <p className="mt-4 text-xs text-slate-500 italic border-t border-violet-700/30 pt-3">
                    {result.disclaimer}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
