'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import SharePanel from '@/components/SharePanel';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CelebrityEntry {
  id: string;
  name: string;
  birthDate: string;
  birthTime: string;
  lat: number;
  lng: number;
  profession: string;
  description: string;
}

interface MatchReason {
  planet1: string;
  planet2: string;
  aspectType: string;
  description: string;
}

interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  exactAngle: number;
  orb: number;
  strength: number;
  polarity: string;
  polarityScore: number;
}

interface CelebrityMatch {
  celebrity: CelebrityEntry;
  matchScore: number;
  sunScore: number;
  moonScore: number;
  venusScore: number;
  marsScore: number;
  reasons: MatchReason[];
  aspects: Aspect[];
}

interface ApiResponse {
  matches: CelebrityMatch[];
  userInput: { birthDate: string; birthTime: string; lat: number; lng: number };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
};

const PLANET_LABELS: Record<string, string> = {
  Sun: '太阳', Moon: '月亮', Venus: '金星', Mars: '火星',
};

const ASPECT_COLORS: Record<string, string> = {
  Conjunction: '#FFD700',
  Sextile: '#4CAF50',
  Square: '#F44336',
  Trine: '#2196F3',
  Opposition: '#E91E63',
};

const ASPECT_LABELS: Record<string, string> = {
  Conjunction: '合相',
  Sextile: '六分相',
  Square: '四分相',
  Trine: '三分相',
  Opposition: '对分相',
};

// ─── Avatar Component ─────────────────────────────────────────────────────────

function Avatar({ name, size = 64 }: { name: string; size?: number }) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
  ];
  const colorIdx = name.charCodeAt(0) % colors.length;
  return (
    <div
      className={`${colors[colorIdx]} rounded-full flex items-center justify-center text-white font-bold shrink-0`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}

// ─── Animated Score Bar ───────────────────────────────────────────────────────

function ScoreBar({ score, label, color }: { score: number; label: string; color: string }) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const duration = 1000;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * score));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [score]);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500 dark:text-gray-400">{label}</span>
        <span className="font-bold text-gray-700 dark:text-gray-200">{displayed}%</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${displayed}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─── Match Card ──────────────────────────────────────────────────────────────

function MatchCard({ match, index, expanded, onToggle }: {
  match: CelebrityMatch;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const rankEmojis = ['🥇', '🥈', '🥉'];
  const rankColors = ['from-yellow-400 to-amber-500', 'from-gray-300 to-gray-400', 'from-orange-400 to-orange-500'];
  const overallColor = match.matchScore >= 70 ? '#22c55e' : match.matchScore >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Header */}
      <div className="p-5 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-4">
          <div className="text-3xl">{rankEmojis[index]}</div>
          <Avatar name={match.celebrity.name} size={56} />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{match.celebrity.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{match.celebrity.profession}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              🎂 {match.celebrity.birthDate} {match.celebrity.birthTime}
            </p>
          </div>
          <div className="text-right">
            <div
              className="text-4xl font-bold"
              style={{ color: overallColor }}
            >
              {match.matchScore}%
            </div>
            <div className="text-xs text-gray-400">匹配度</div>
          </div>
        </div>

        {/* Mini score bars */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <ScoreBar score={match.sunScore} label="☉ 太阳" color="#FFD700" />
          <ScoreBar score={match.moonScore} label="☽ 月亮" color="#94a3b8" />
          <ScoreBar score={match.venusScore} label="♀ 金星" color="#ec4899" />
          <ScoreBar score={match.marsScore} label="♂ 火星" color="#ef4444" />
        </div>

        {/* Top reason */}
        {match.reasons.length > 0 && (
          <div className="mt-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3">
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              ✨ {match.reasons[0].description}
            </p>
          </div>
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {match.celebrity.description}
          </p>

          {/* All reasons */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              相位分析
            </h4>
            <div className="space-y-2">
              {match.reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-base shrink-0">
                    {PLANET_SYMBOLS[r.planet1] || '⚪'}
                  </span>
                  <div className="flex-1">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {PLANET_LABELS[r.planet1] || r.planet1}
                    </span>
                    <span
                      className="ml-2 text-xs px-1.5 py-0.5 rounded font-medium"
                      style={{
                        backgroundColor: `${ASPECT_COLORS[r.aspectType] ?? '#888'}22`,
                        color: ASPECT_COLORS[r.aspectType] ?? '#888',
                      }}
                    >
                      {ASPECT_LABELS[r.aspectType] || r.aspectType}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{r.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top synastry aspects */}
          {match.aspects.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                行星相位
              </h4>
              <div className="flex flex-wrap gap-2">
                {match.aspects.slice(0, 6).map((asp, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${ASPECT_COLORS[asp.type] ?? '#888'}18`,
                      border: `1px solid ${ASPECT_COLORS[asp.type] ?? '#888'}44`,
                      color: ASPECT_COLORS[asp.type] ?? '#888',
                    }}
                  >
                    <span>{PLANET_SYMBOLS[asp.planet1] || asp.planet1[0]}</span>
                    <span>{ASPECT_LABELS[asp.type] || asp.type}</span>
                    <span>{PLANET_SYMBOLS[asp.planet2] || asp.planet2[0]}</span>
                    <span className="opacity-60">{asp.strength}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expand toggle */}
      <button
        onClick={onToggle}
        className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border-t border-gray-100 dark:border-gray-700 transition-colors"
      >
        {expanded ? '收起详情 ▲' : '展开详情 ▼'}
      </button>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CelebrityMatchPage() {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [lat, setLat] = useState('39.9042');
  const [lng, setLng] = useState('116.4074');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [matches, setMatches] = useState<CelebrityMatch[]>([]);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  // Simple city-to-coordinates lookup
  const CITY_COORDS: Record<string, [number, number]> = {
    'beijing': [39.9042, 116.4074],
    'shanghai': [31.2304, 121.4737],
    'new york': [40.7128, -74.006],
    'london': [51.5074, -0.1278],
    'paris': [48.8566, 2.3522],
    'tokyo': [35.6762, 139.6503],
    'los angeles': [34.0522, -118.2437],
    'san francisco': [37.7749, -122.4194],
    'hong kong': [22.3193, 114.1694],
    'taipei': [25.033, 121.5654],
  };

  const handlePlaceChange = (place: string) => {
    setBirthPlace(place);
    const lower = place.toLowerCase().trim();
    if (CITY_COORDS[lower]) {
      setLat(CITY_COORDS[lower][0].toString());
      setLng(CITY_COORDS[lower][1].toString());
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!birthDate || !birthTime) {
      setError('请输入生日日期和时间');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/celebrity-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate,
          birthTime,
          lat: parseFloat(lat) || 39.9042,
          lng: parseFloat(lng) || 116.4074,
        }),
      });
      if (!res.ok) throw new Error('请求失败');
      const data: ApiResponse = await res.json();
      setMatches(data.matches);
      setExpandedIdx(null);
    } catch {
      setError('计算出错，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [birthDate, birthTime, lat, lng]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="text-5xl mb-2">🔮</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-amber-500 bg-clip-text text-transparent">
            名人星盘匹配
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-lg mx-auto leading-relaxed">
            基于西方占星术相位分析，找到与你星盘最契合的世界名人。
            输入你的出生信息，探索与伟人之间的宇宙共鸣。
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 space-y-5 shadow-lg">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">你的出生信息</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">出生日期</label>
              <input
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">出生时间</label>
              <input
                type="time"
                value={birthTime}
                onChange={e => setBirthTime(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">出生地点</label>
            <input
              type="text"
              placeholder="输入城市名称，如 Beijing, New York, London..."
              value={birthPlace}
              onChange={e => handlePlaceChange(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-400">支持: Beijing, Shanghai, New York, London, Paris, Tokyo, Los Angeles, Hong Kong, Taipei</p>
          </div>

          {/* Coordinates (optional, hidden but functional) */}
          <details className="group">
            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 list-none">
              高级: 手动设置坐标 ({lat}, {lng})
            </summary>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">纬度</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={e => setLat(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500">经度</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={e => setLng(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </details>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 text-sm shadow-lg"
          >
            {loading ? '计算中... ✨' : '开始匹配 🔮'}
          </button>
        </div>

        {/* Results */}
        {matches.length > 0 && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                你的星盘匹配结果
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                基于太阳、月亮、金星、火星相位计算
              </p>
            </div>

            {matches.map((match, i) => (
              <MatchCard
                key={match.celebrity.id}
                match={match}
                index={i}
                expanded={expandedIdx === i}
                onToggle={() => setExpandedIdx(expandedIdx === i ? null : i)}
              />
            ))}

            {/* Share */}
            <div className="flex justify-center">
              <SharePanel
                serviceType="celebrity-match"
                resultId={matches[0]?.celebrity.id ?? 'result'}
                shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/celebrity-match`}
              />
            </div>
          </div>
        )}

        {/* How it works */}
        {matches.length === 0 && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-center">算法说明</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {[
                { icon: '☉', label: '太阳', desc: '核心自我 30%', color: 'text-yellow-500' },
                { icon: '☽', label: '月亮', desc: '情感世界 25%', color: 'text-gray-400' },
                { icon: '♀', label: '金星', desc: '爱情审美 22%', color: 'text-pink-500' },
                { icon: '♂', label: '火星', desc: '行动欲望 23%', color: 'text-red-500' },
              ].map(item => (
                <div key={item.label} className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
                  <div className={`text-2xl mb-1 ${item.color}`}>{item.icon}</div>
                  <div className="text-xs font-bold text-gray-700 dark:text-gray-200">{item.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
              通过合相、三分相、六分相、四分相、对分相的紧密程度计算匹配度。
              同星座加分、同元素加分。
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
