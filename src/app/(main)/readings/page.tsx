'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

type Reading = {
  id: string;
  reading_type: string;
  title: string;
  summary: string;
  created_at: string;
};

type FilterType = 'all' | 'ziwei' | 'bazi' | 'yijing' | 'western' | 'tarot';

const TYPE_META: Record<string, { label: string; labelEn: string; color: string; emoji: string; gradient: string }> = {
  ziwei:   { label: '紫微斗数', labelEn: 'Zi Wei',    color: 'text-purple-300',   emoji: '🔮', gradient: 'from-purple-600 to-purple-800' },
  bazi:    { label: '八字命理', labelEn: 'Ba Zi',     color: 'text-amber-300',     emoji: '🎴', gradient: 'from-amber-600 to-amber-800' },
  yijing:  { label: '易经占卜', labelEn: 'Yi Jing',  color: 'text-emerald-300',    emoji: '☯',  gradient: 'from-emerald-600 to-emerald-800' },
  western: { label: '西方占星', labelEn: 'Western',   color: 'text-blue-300',       emoji: '⭐', gradient: 'from-blue-600 to-blue-800' },
  tarot:   { label: '塔罗牌',   labelEn: 'Tarot',    color: 'text-rose-300',       emoji: '🃏', gradient: 'from-rose-600 to-rose-800' },
};

const FILTERS: { value: FilterType; label: string; labelEn: string }[] = [
  { value: 'all',     label: '全部',     labelEn: 'All' },
  { value: 'ziwei',  label: '紫微斗数', labelEn: 'Zi Wei' },
  { value: 'bazi',   label: '八字命理', labelEn: 'Ba Zi' },
  { value: 'yijing', label: '易经占卜', labelEn: 'Yi Jing' },
  { value: 'western',label: '西方占星', labelEn: 'Western' },
  { value: 'tarot',  label: '塔罗牌',   labelEn: 'Tarot' },
];

function formatDate(iso: string, lang: 'zh' | 'en') {
  const d = new Date(iso);
  if (lang === 'zh') {
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ReadingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [filter, setFilter] = useState<FilterType>('all');
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (!session?.user) return;
    fetch('/api/readings')
      .then(r => r.json())
      .then(data => {
        setReadings(data.readings ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session?.user]);

  const filtered = filter === 'all'
    ? readings
    : readings.filter(r => r.reading_type === filter);

  async function handleDelete(id: string) {
    if (!confirm(language === 'zh' ? '确定删除这条记录？' : 'Delete this reading?')) return;
    setDeleting(id);
    try {
      await fetch(`/api/readings?id=${id}`, { method: 'DELETE' });
      setReadings(prev => prev.filter(r => r.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="px-8 py-6 border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-purple-300 hover:text-white transition text-sm flex items-center gap-1">
              <span>←</span>
              {language === 'zh' ? '返回仪表盘' : 'Back to Dashboard'}
            </Link>
            <h1 className="text-xl font-bold">
              {language === 'zh' ? '解读历史' : 'Reading History'}
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-full p-1">
            <button
              onClick={() => setLanguage('zh')}
              className={`px-3 py-1 rounded-full text-sm transition ${language === 'zh' ? 'bg-purple-600 text-white' : 'text-slate-300'}`}
            >
              中文
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-full text-sm transition ${language === 'en' ? 'bg-purple-600 text-white' : 'text-slate-300'}`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-8">
        {/* Stats bar */}
        <div className="flex items-center gap-4 mb-6 text-sm text-slate-400">
          <span>
            {language === 'zh' ? '共' : 'Total: '}
            <span className="text-white font-semibold">{readings.length}</span>
            {language === 'zh' ? ' 条记录' : ' readings'}
          </span>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-sm transition border ${
                filter === f.value
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-white/5 border-white/[0.06] text-slate-300 hover:bg-white/10'
              }`}
            >
              {language === 'zh' ? f.label : f.labelEn}
              {f.value !== 'all' && (
                <span className="ml-1.5 text-xs opacity-60">
                  ({readings.filter(r => r.reading_type === f.value).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔮</div>
            <p className="text-purple-300 text-lg mb-2">
              {filter === 'all'
                ? (language === 'zh' ? '暂无解读记录' : 'No readings yet')
                : (language === 'zh' ? `暂无${TYPE_META[filter]?.label ?? filter}记录` : `No ${TYPE_META[filter]?.labelEn ?? filter} readings`)}
            </p>
            <p className="text-slate-500 text-sm mb-8">
              {language === 'zh'
                ? '完成第一次解读后，这里会显示您的历史记录'
                : 'Your reading history will appear here after you complete your first reading.'}
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-amber-500 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition"
            >
              {language === 'zh' ? '开始解读 →' : 'Start Reading →'}
            </Link>
          </div>
        )}

        {/* Readings list */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map(reading => {
              const meta = TYPE_META[reading.reading_type] ?? {
                label: reading.reading_type,
                labelEn: reading.reading_type,
                color: 'text-slate-300',
                emoji: '✨',
                gradient: 'from-slate-600 to-slate-800',
              };
              return (
                <div
                  key={reading.id}
                  className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur rounded-xl border border-white/[0.06] hover:bg-white/10 transition group"
                >
                  {/* Type badge */}
                  <div className={`w-12 h-12 rounded-xl bg-slate-600/30 flex items-center justify-center text-xl shrink-0`}>
                    {meta.emoji}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">
                      {reading.title}
                    </div>
                    {reading.summary && (
                      <div className="text-sm text-slate-400 truncate mt-0.5">
                        {reading.summary}
                      </div>
                    )}
                    <div className={`text-xs ${meta.color} mt-1`}>
                      {language === 'zh' ? meta.label : meta.labelEn}
                      {' · '}
                      <span className="text-slate-500">{formatDate(reading.created_at, language)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                    <Link
                      href={`/reading/${reading.id}`}
                      className="px-3 py-1.5 bg-purple-600/80 hover:bg-purple-600 text-white text-xs rounded-lg transition"
                    >
                      {language === 'zh' ? '查看' : 'View'}
                    </Link>
                    <button
                      onClick={() => handleDelete(reading.id)}
                      disabled={deleting === reading.id}
                      className="px-3 py-1.5 bg-white/10 hover:bg-red-500/30 text-slate-400 hover:text-red-300 text-xs rounded-lg transition disabled:opacity-50"
                    >
                      {deleting === reading.id ? '...' : '×'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
