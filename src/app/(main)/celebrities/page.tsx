'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import SharePanel from '@/components/SharePanel';

interface BaZiChart {
  year: { heavenlyStem: string; earthlyBranch: string; element: string };
  month: { heavenlyStem: string; earthlyBranch: string; element: string };
  day: { heavenlyStem: string; earthlyBranch: string; element: string };
  hour: { heavenlyStem: string; earthlyBranch: string; element: string };
  dayMasterElement: string;
}

interface CelebrityEntry {
  id: string; name: string; birthDate: string; birthTime: string;
  gender: 'male'|'female'; nationality: string; occupation: string; description: string;
  chart?: BaZiChart;
  compatibility?: number;
}

const OCCUPATIONS = ['All', 'Politician', 'Artist', 'Athlete', 'Entrepreneur', 'Scientist'];

const ELEMENT_COLORS: Record<string, string> = {
  '木': 'text-green-500', 'Wood': 'text-green-500',
  '火': 'text-red-500', 'Fire': 'text-red-500',
  '土': 'text-yellow-600', 'Earth': 'text-yellow-600',
  '金': 'text-gray-400', 'Metal': 'text-gray-400',
  '水': 'text-blue-500', 'Water': 'text-blue-500',
};

const ELEMENT_ICONS: Record<string, string> = {
  '木': '🪵', 'Wood': '🪵',
  '火': '🔥', 'Fire': '🔥',
  '土': '🌍', 'Earth': '🌍',
  '金': '⚪', 'Metal': '⚪',
  '水': '💧', 'Water': '💧',
};

function Avatar({ name, size = 48 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
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

function ChartDisplay({ chart }: { chart: BaZiChart }) {
  const pillars = [chart.year, chart.month, chart.day, chart.hour];
  const labels = ['Year', 'Month', 'Day', 'Hour'];
  const dayMaster = chart.dayMasterElement;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {pillars.map((pillar, i) => (
          <div key={i} className="text-center bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">{labels[i]}</div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{pillar.heavenlyStem}</div>
            <div className="text-lg text-amber-600 dark:text-amber-400">{pillar.earthlyBranch}</div>
            <div className={`text-sm mt-1 ${ELEMENT_COLORS[pillar.element] || 'text-gray-500'}`}>
              {ELEMENT_ICONS[pillar.element]} {pillar.element}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-3 text-center">
        <div className="text-xs text-gray-500 mb-1">Day Master Element</div>
        <div className={`text-xl font-bold ${ELEMENT_COLORS[dayMaster] || 'text-gray-700 dark:text-gray-300'}`}>
          {ELEMENT_ICONS[dayMaster]} {dayMaster}
        </div>
      </div>
    </div>
  );
}

function CompatibilityBar({ score }: { score: number }) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const duration = 1200;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * score));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [score]);

  const color = score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${displayed}%` }} />
        </div>
        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 w-10 text-right">{displayed}%</span>
      </div>
    </div>
  );
}

export default function CelebritiesPage() {
  const [celebs, setCelebs] = useState<CelebrityEntry[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<CelebrityEntry | null>(null);
  const [showTwin, setShowTwin] = useState(false);
  const [twinBirthDate, setTwinBirthDate] = useState('');
  const [twinBirthTime, setTwinBirthTime] = useState('');
  const [twinMatches, setTwinMatches] = useState<CelebrityEntry[]>([]);
  const [twinLoading, setTwinLoading] = useState(false);
  const [twinError, setTwinError] = useState('');

  const fetchCelebs = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (filter !== 'All') params.set('occupation', filter);
    const res = await fetch(`/api/celebrities?${params}`);
    if (res.ok) setCelebs(await res.json());
  }, [search, filter]);

  useEffect(() => { fetchCelebs(); }, [fetchCelebs]);

  const openModal = async (celeb: CelebrityEntry) => {
    const res = await fetch(`/api/celebrities/${celeb.id}`);
    if (res.ok) setSelected(await res.json());
  };

  const findTwin = async () => {
    if (!twinBirthDate || !twinBirthTime) { setTwinError('Please enter both date and time'); return; }
    setTwinError('');
    setTwinLoading(true);
    try {
      const res = await fetch(`/api/celebrities?birthDate=${twinBirthDate}&birthTime=${twinBirthTime}`);
      if (res.ok) setTwinMatches(await res.json());
    } finally { setTwinLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-amber-500 bg-clip-text text-transparent">
            Celebrity BaZi Charts
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xl mx-auto">
            Explore the Four Pillars of Destiny for 50+ world-famous celebrities. Discover their birth charts and find your celebrity twin!
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, nationality..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {OCCUPATIONS.map(o => (
              <button
                key={o}
                onClick={() => setFilter(o)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === o
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-indigo-400'
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>

        {/* Celebrity Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {celebs.map(celeb => (
            <div
              key={celeb.id}
              onClick={() => openModal(celeb)}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={celeb.name} size={48} />
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate">{celeb.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{celeb.nationality}</p>
                </div>
              </div>
              <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                <p>🎂 {celeb.birthDate} {celeb.birthTime}</p>
                <p>👤 {celeb.occupation}</p>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 line-clamp-2">{celeb.description}</p>
            </div>
          ))}
        </div>

        {/* Find Your Twin */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">🔮 Find Your Celebrity Twin</h2>
            <p className="text-indigo-200 text-sm">Enter your birth data and discover which celebrities share your BaZi energy.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-indigo-200 font-medium">Birth Date</label>
              <input
                type="date"
                value={twinBirthDate}
                onChange={e => setTwinBirthDate(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-white/20 border border-white/30 text-white placeholder-indigo-200 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-indigo-200 font-medium">Birth Time</label>
              <input
                type="time"
                value={twinBirthTime}
                onChange={e => setTwinBirthTime(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-white/20 border border-white/30 text-white placeholder-indigo-200 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={findTwin}
                disabled={twinLoading}
                className="px-6 py-2.5 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-50"
              >
                {twinLoading ? 'Finding...' : 'Find My Twin ✨'}
              </button>
            </div>
          </div>
          {twinError && <p className="text-red-300 text-sm">{twinError}</p>}

          {twinMatches.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {twinMatches.map((match, i) => (
                <div key={match.id} className="bg-white/10 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar name={match.name} size={36} />
                    <div>
                      <p className="font-bold text-sm truncate">{match.name}</p>
                      <p className="text-xs text-indigo-200">{match.occupation}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">#{i + 1}</div>
                    <CompatibilityBar score={match.compatibility || 0} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl">&times;</button>
            <div className="flex items-center gap-4 mb-6">
              <Avatar name={selected.name} size={64} />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selected.name}</h2>
                <p className="text-gray-500 text-sm">{selected.nationality} · {selected.occupation}</p>
                <p className="text-xs text-gray-400 mt-0.5">🎂 {selected.birthDate} at {selected.birthTime}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{selected.description}</p>

            {selected.chart && (
              <>
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">BaZi Chart</h3>
                <ChartDisplay chart={selected.chart} />
              </>
            )}

            <div className="mt-6 flex gap-3">
              <SharePanel
                serviceType="celebrity"
                resultId={selected.id}
                shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/celebrities?celeb=${selected.id}`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
