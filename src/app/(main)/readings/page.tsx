'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  buildHistoryItems,
  formatDateTime,
  getModuleMeta,
  type HistoryItem,
  type LegacyReadingSummary,
} from '@/lib/unified-frontend';
import type { ModuleResult } from '@/types/module-result';
import type { UserProfile } from '@/types/user-profile';

async function parseJson<T>(response: Response): Promise<T | null> {
  if (!response.ok) {
    return null;
  }

  return (await response.json()) as T;
}

export default function ReadingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [unifiedReady, setUnifiedReady] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [router, status]);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) {
      return;
    }

    let active = true;

    async function load() {
      setLoading(true);
      setNotice(null);

      try {
        const [profilesResponse, readingsResponse, accountResponse] = await Promise.all([
          fetch('/api/profiles'),
          fetch('/api/readings'),
          fetch('/api/profile'),
        ]);

        const profilesPayload = await parseJson<{ success: boolean; data: UserProfile[] }>(profilesResponse);
        const readingsPayload = await parseJson<{
          readings: LegacyReadingSummary[];
          results: ModuleResult[];
        }>(readingsResponse);
        const accountPayload = await parseJson<{ language?: 'en' | 'zh' }>(accountResponse);

        if (!active) {
          return;
        }

        const nextHistory = buildHistoryItems(
          readingsPayload?.results ?? [],
          readingsPayload?.readings ?? [],
          profilesPayload?.data ?? []
        );

        setHistory(nextHistory);
        setLanguage(accountPayload?.language ?? 'en');
        setUnifiedReady(profilesResponse.status !== 503);
      } catch (error) {
        if (active) {
          console.error('[readings] load failed', error);
          setNotice('Failed to load reading history.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [session?.user, status]);

  const moduleFilters = Array.from(new Set(history.map((item) => item.moduleType)));
  const visibleHistory = filter === 'all' ? history : history.filter((item) => item.moduleType === filter);

  async function handleDelete(item: HistoryItem) {
    const confirmed = window.confirm(
      language === 'zh' ? '确定删除这条解读记录吗？' : 'Delete this reading record?'
    );
    if (!confirmed) {
      return;
    }

    setDeletingId(item.id);
    setNotice(null);
    try {
      let response = await fetch(`/api/readings/${item.id}`, { method: 'DELETE' });
      if (!response.ok) {
        response = await fetch(`/api/readings?id=${item.id}`, { method: 'DELETE' });
      }

      if (!response.ok) {
        setNotice('Failed to delete the selected record.');
        return;
      }

      setHistory((current) => current.filter((entry) => entry.id !== item.id));
    } catch (error) {
      console.error('[readings] delete failed', error);
      setNotice('Failed to delete the selected record.');
    } finally {
      setDeletingId(null);
    }
  }

  if (status !== 'authenticated' || !session?.user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-slate-950 to-indigo-950">
        <div className="text-white text-lg">{language === 'zh' ? '正在加载解读历史...' : 'Loading reading history...'}</div>
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.2),_transparent_35%),linear-gradient(135deg,_#14091f,_#09090f_55%,_#0f172a)] text-white">
      <header className="border-b border-white/10 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-6">
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="px-8 py-6 border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-purple-300 transition hover:text-purple-200">
              ← {language === 'zh' ? '返回总控台' : 'Back to dashboard'}
            </Link>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-purple-300/80">
                {language === 'zh' ? '统一历史' : 'Unified history'}
              </p>
              <h1 className="mt-2 text-3xl font-semibold">
                {language === 'zh' ? '模块结果与兼容历史记录' : 'Module results and compatibility history'}
              </h1>
            </div>
          </div>

          <div className="flex gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-sm">
            <button
              onClick={() => setLanguage('zh')}
              className={`rounded-full px-3 py-1 transition ${language === 'zh' ? 'bg-purple-600 text-white' : 'text-slate-300'}`}
            >
              中文
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`rounded-full px-3 py-1 transition ${language === 'en' ? 'bg-purple-600 text-white' : 'text-slate-300'}`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        {!unifiedReady ? (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
            {language === 'zh'
              ? '当前环境还没有接上完整的 unified profile 表，所以这里只会尽量回退到旧 readings 兼容层。'
              : 'The full unified tables are not available in this environment yet, so this page falls back to the legacy readings compatibility layer when needed.'}
          </div>
        ) : null}
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

        {notice ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            {notice}
          </div>
        ) : null}

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                {language === 'zh' ? '记录概览' : 'History overview'}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {language === 'zh' ? `${history.length} 条记录已接入统一历史页` : `${history.length} records in the unified history view`}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  filter === 'all' ? 'bg-purple-600 text-white' : 'border border-white/10 bg-white/5 text-slate-300'
                }`}
              >
                {language === 'zh' ? '全部' : 'All'}
              </button>
              {moduleFilters.map((moduleType) => {
                const meta = getModuleMeta(moduleType);
                return (
                  <button
                    key={moduleType}
                    onClick={() => setFilter(moduleType)}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      filter === moduleType ? 'bg-purple-600 text-white' : 'border border-white/10 bg-white/5 text-slate-300'
                    }`}
                  >
                    {language === 'zh' ? meta.labelZh : meta.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {visibleHistory.length > 0 ? (
          <section className="space-y-3">
            {visibleHistory.map((item) => {
              const meta = getModuleMeta(item.moduleType);
              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur md:flex-row md:items-start"
                >
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.gradient} text-2xl`}>
                  key={reading.id}
                  className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur rounded-xl border border-white/[0.06] hover:bg-white/10 transition group"
                >
                  {/* Type badge */}
                  <div className={`w-12 h-12 rounded-xl bg-slate-600/30 flex items-center justify-center text-xl shrink-0`}>
                    {meta.emoji}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      {item.kind === 'unified' ? (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-200">
                          unified
                        </span>
                      ) : null}
                      {item.isPremium ? (
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-200">
                          premium
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-2 text-sm text-slate-300">{item.summary}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span>{language === 'zh' ? meta.labelZh : meta.label}</span>
                      <span>{formatDateTime(item.createdAt, language)}</span>
                      {item.profileName ? <span>{item.profileName}</span> : null}
                      {typeof item.confidenceScore === 'number' ? <span>{Math.round(item.confidenceScore)}%</span> : null}
                    </div>
                  </div>

                  <div className="flex gap-2 md:shrink-0">
                    <Link
                      href={`/reading/${item.id}`}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
                    >
                      {language === 'zh' ? '查看' : 'Open'}
                    </Link>
                    <button
                      onClick={() => void handleDelete(item)}
                      disabled={deletingId === item.id}
                      className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-sm text-rose-100 transition hover:bg-rose-500/20 disabled:opacity-60"
                    >
                      {deletingId === item.id
                        ? language === 'zh' ? '删除中...' : 'Deleting...'
                        : language === 'zh' ? '删除' : 'Delete'}
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        ) : (
          <section className="rounded-3xl border border-dashed border-white/15 bg-slate-950/30 p-8 text-center">
            <div className="text-4xl">✦</div>
            <h2 className="mt-4 text-2xl font-semibold">
              {language === 'zh' ? '还没有解读记录' : 'No reading history yet'}
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              {language === 'zh'
                ? '完成第一条模块结果后，这里会自动汇总 unified module results 和旧 readings 兼容历史。'
                : 'After your first module result, this page will automatically combine unified module results and the legacy readings compatibility layer.'}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="/bazi" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10">
                BaZi
              </Link>
              <Link href="/ziwei" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10">
                Zi Wei
              </Link>
              <Link href="/fortune" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10">
                Fortune
              </Link>
              <Link href="/relationship/new" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10">
                Relationship
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
