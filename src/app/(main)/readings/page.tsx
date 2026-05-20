'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Archive, Clock, HeartHandshake, Trash2 } from 'lucide-react';
import {
  buildHistoryItems,
  formatDateTime,
  getModuleMeta,
  type HistoryItem,
  type LegacyReadingSummary,
} from '@/lib/unified-frontend';
import { withLanguageParam } from '@/lib/language-routing';
import type { ModuleResult } from '@/types/module-result';
import type { UserProfile } from '@/types/user-profile';
import {
  getTianjiLoveFooterNav,
  getTianjiLovePrimaryCta,
  getTianjiLovePrimaryNav,
  TianjiLoveButton,
  TianjiLoveFooter,
  TianjiLoveHeader,
  TianjiLovePanel,
  TianjiLoveSectionTitle,
  TianjiLoveShell,
} from '@/components/tianji-love';

async function parseJson<T>(response: Response): Promise<T | null> {
  if (!response.ok) {
    return null;
  }

  return (await response.json()) as T;
}

const copy = {
  en: {
    nav: {
      compatibility: 'Compatibility',
      loveReading: 'Love Reading',
      timing: 'Timing',
      pricing: 'Pricing',
      profile: 'Profile',
    },
    loading: 'Loading reading history...',
    back: 'Back to dashboard',
    eyebrow: 'Private history',
    title: 'Your readings, reports, and compatibility history',
    overview: 'History overview',
    count: (count: number) => `${count} records in your private history`,
    all: 'All',
    open: 'Open',
    delete: 'Delete',
    deleting: 'Deleting...',
    deleteConfirm: 'Delete this reading record?',
    emptyTitle: 'No reading history yet',
    emptyBody:
      'Start with a love reading, timing question, or compatibility report. Saved results will collect here once available.',
    fallback:
      'The full unified profile tables are not available in this environment yet, so this page falls back to the legacy readings compatibility layer when needed.',
    loadFailed: 'Failed to load reading history.',
    deleteFailed: 'Failed to delete the selected record.',
    footer:
      'Reading history is private account content. Public share pages still hide birth date, time, location, and timezone by default.',
  },
  zh: {
    nav: {
      compatibility: '关系合盘',
      loveReading: '爱情解读',
      timing: '时机',
      pricing: '会员权益',
      profile: '档案',
    },
    loading: '正在加载解读历史...',
    back: '返回控制台',
    eyebrow: '私人历史',
    title: '你的解读、报告与关系合盘历史',
    overview: '历史概览',
    count: (count: number) => `私人历史中共有 ${count} 条记录`,
    all: '全部',
    open: '打开',
    delete: '删除',
    deleting: '删除中...',
    deleteConfirm: '确定删除这条解读记录吗？',
    emptyTitle: '还没有解读记录',
    emptyBody: '先开始一次爱情解读、时机问题或关系合盘。可保存的结果会在这里汇总。',
    fallback: '当前环境还没有完整接入统一档案表，所以这里会在需要时回退到旧 readings 兼容层。',
    loadFailed: '加载解读历史失败。',
    deleteFailed: '删除所选记录失败。',
    footer: '解读历史是私人账号内容。公开分享页默认仍隐藏出生日期、时间、地点和时区。',
  },
} as const;

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

  const t = copy[language];
  const href = (path: string) => withLanguageParam(path, language);
  const toggleLanguage = () => setLanguage(language === 'zh' ? 'en' : 'zh');

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
          setNotice(copy[language].loadFailed);
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
  }, [language, session?.user, status]);

  const moduleFilters = Array.from(new Set(history.map((item) => item.moduleType)));
  const visibleHistory = filter === 'all' ? history : history.filter((item) => item.moduleType === filter);

  async function handleDelete(item: HistoryItem) {
    const confirmed = window.confirm(t.deleteConfirm);
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
        setNotice(t.deleteFailed);
        return;
      }

      setHistory((current) => current.filter((entry) => entry.id !== item.id));
    } catch (error) {
      console.error('[readings] delete failed', error);
      setNotice(t.deleteFailed);
    } finally {
      setDeletingId(null);
    }
  }

  if (status !== 'authenticated' || !session?.user || loading) {
    return (
      <TianjiLoveShell className="tianji-love-readings-loading">
        <div className="relative z-10 flex min-h-screen items-center justify-center text-[#ffe3b4]">{t.loading}</div>
      </TianjiLoveShell>
    );
  }

  return (
    <TianjiLoveShell className="tianji-love-readings-page" ariaLabel="Tianji Love reading history">
      <TianjiLoveHeader
        homeHref={href('/')}
        navItems={getTianjiLovePrimaryNav(language, href)}
        cta={getTianjiLovePrimaryCta(language, href)}
        languageLabel={language === 'zh' ? 'EN' : '中文'}
        onLanguageToggle={toggleLanguage}
      />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 sm:px-8">
        <Link href="/dashboard" className="inline-flex w-fit text-sm text-[#d8b77b] transition hover:text-[#ffe3b4]">
          {t.back}
        </Link>

        <section className="py-6">
          <p className="mb-5 text-xs uppercase tracking-[0.32em] text-[#d8b77b]/70">{t.eyebrow}</p>
          <h1 className="max-w-4xl font-serif text-4xl font-semibold leading-tight text-[#ffe3b4] sm:text-5xl">{t.title}</h1>
        </section>

        {!unifiedReady ? (
          <div className="rounded-lg border border-[#d8b77b]/32 bg-[#d8b77b]/10 px-5 py-4 text-sm leading-6 text-[#ffe3b4]">
            {t.fallback}
          </div>
        ) : null}

        {notice ? (
          <div className="rounded-lg border border-[#ff9c8b]/34 bg-[#ff6c73]/10 px-5 py-4 text-sm text-[#ffd0c9]">
            {notice}
          </div>
        ) : null}

        <TianjiLovePanel className="p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#d8b77b]/62">{t.overview}</p>
              <h2 className="mt-2 font-serif text-2xl text-[#ffe3b4]">{t.count(history.length)}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
                {t.all}
              </FilterButton>
              {moduleFilters.map((moduleType) => {
                const meta = getModuleMeta(moduleType);
                return (
                  <FilterButton key={moduleType} active={filter === moduleType} onClick={() => setFilter(moduleType)}>
                    {language === 'zh' ? meta.labelZh : meta.label}
                  </FilterButton>
                );
              })}
            </div>
          </div>
        </TianjiLovePanel>

        {visibleHistory.length > 0 ? (
          <section className="space-y-4">
            {visibleHistory.map((item) => {
              const meta = getModuleMeta(item.moduleType);
              return (
                <TianjiLovePanel key={item.id} as="article" className="p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${meta.gradient} text-lg font-semibold text-[#ffe3b4]`}>
                      {meta.emoji}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-[#ffe3b4]">{item.title}</h3>
                        {item.kind === 'unified' ? <Badge>unified</Badge> : null}
                        {item.isPremium ? <Badge>premium</Badge> : null}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#f4d7a3]/68">{item.summary}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#f4d7a3]/50">
                        <span>{language === 'zh' ? meta.labelZh : meta.label}</span>
                        <span>{formatDateTime(item.createdAt, language)}</span>
                        {item.profileName ? <span>{item.profileName}</span> : null}
                        {typeof item.confidenceScore === 'number' ? <span>{Math.round(item.confidenceScore)}%</span> : null}
                      </div>
                    </div>

                    <div className="flex gap-2 md:shrink-0">
                      <Link href={`/reading/${item.id}`} className="rounded-lg border border-[#b57248]/36 bg-[#070b16]/72 px-4 py-2 text-sm text-[#ffe3b4] transition hover:border-[#ffe3b4]/50">
                        {t.open}
                      </Link>
                      <button
                        onClick={() => void handleDelete(item)}
                        disabled={deletingId === item.id}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#ff8f87]/28 bg-[#3d0f17]/30 px-4 py-2 text-sm text-[#ffd0c9] transition hover:border-[#ffb49e]/50 disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                        {deletingId === item.id ? t.deleting : t.delete}
                      </button>
                    </div>
                  </div>
                </TianjiLovePanel>
              );
            })}
          </section>
        ) : (
          <TianjiLovePanel className="p-8 text-center">
            <Archive className="mx-auto h-10 w-10 text-[#d8b77b]" aria-hidden />
            <h2 className="mt-4 font-serif text-3xl text-[#ffe3b4]">{t.emptyTitle}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#f4d7a3]/66">{t.emptyBody}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <TianjiLoveButton href={href('/ask')}>{t.nav.loveReading}</TianjiLoveButton>
              <TianjiLoveButton href={href('/relationship/new')} variant="secondary">
                {language === 'zh' ? '关系解读' : 'Start Relationship Reading'}
              </TianjiLoveButton>
              <TianjiLoveButton href={href('/draw')} variant="secondary">
                {language === 'zh' ? '抽牌' : 'Draw Timing Cards'}
              </TianjiLoveButton>
            </div>
          </TianjiLovePanel>
        )}

        <TianjiLoveSectionTitle title={language === 'zh' ? '历史记录隐私' : 'History Privacy'} />
        <div className="grid gap-4 md:grid-cols-2">
          <TianjiLovePanel className="p-5">
            <Clock className="mb-3 h-5 w-5 text-[#d8b77b]" aria-hidden />
            <h2 className="text-base font-semibold text-[#ffe3b4]">{language === 'zh' ? '按时间回看' : 'Return over time'}</h2>
            <p className="mt-2 text-sm leading-6 text-[#f4d7a3]/62">{language === 'zh' ? '历史页帮助你观察重复模式，而不是制造新的焦虑。' : 'History helps you revisit patterns without adding new anxiety.'}</p>
          </TianjiLovePanel>
          <TianjiLovePanel className="p-5">
            <HeartHandshake className="mb-3 h-5 w-5 text-[#d8b77b]" aria-hidden />
            <h2 className="text-base font-semibold text-[#ffe3b4]">{language === 'zh' ? '关系语境优先' : 'Relationship context first'}</h2>
            <p className="mt-2 text-sm leading-6 text-[#f4d7a3]/62">{language === 'zh' ? '爱情、时机和合盘会保持同一套视觉与返回路径。' : 'Love, timing, and compatibility stay inside the same visual system and return path.'}</p>
          </TianjiLovePanel>
        </div>
      </main>

      <TianjiLoveFooter
        homeHref={href('/')}
        disclaimer={t.footer}
        links={getTianjiLoveFooterNav(language, href)}
      />
    </TianjiLoveShell>
  );
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-4 py-2 text-sm transition ${
        active
          ? 'border-[#ffb49e]/56 bg-[#ff6c73]/18 text-[#ffe3b4]'
          : 'border-[#b57248]/32 bg-[#070b16]/58 text-[#f4d7a3]/66 hover:border-[#ffe3b4]/48'
      }`}
    >
      {children}
    </button>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-[#d8b77b]/28 bg-[#d8b77b]/10 px-2 py-0.5 text-[11px] text-[#ffe3b4]">
      {children}
    </span>
  );
}
