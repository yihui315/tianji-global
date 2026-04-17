'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  buildHistoryItems,
  formatDateTime,
  getModuleMeta,
  getVisibleSectionCards,
  type DestinyResponseMeta,
  type HistoryItem,
  type LegacyReadingSummary,
} from '@/lib/unified-frontend';
import type { ModuleResult } from '@/types/module-result';
import type { DestinyProfile } from '@/types/unified-profile';
import type { UserProfile } from '@/types/user-profile';

async function parseJson<T>(response: Response): Promise<T | null> {
  if (!response.ok) {
    return null;
  }

  return (await response.json()) as T;
}

export default function DashboardProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams<{ profileId: string }>();
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [destiny, setDestiny] = useState<Partial<DestinyProfile> | null>(null);
  const [meta, setMeta] = useState<DestinyResponseMeta | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [router, status]);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user || !params?.profileId) {
      return;
    }

    let active = true;

    async function load() {
      setLoading(true);
      setNotice(null);

      try {
        const [profilesResponse, destinyResponse, readingsResponse] = await Promise.all([
          fetch('/api/profiles'),
          fetch(`/api/destiny/profile/${params.profileId}`),
          fetch('/api/readings'),
        ]);

        const profilesPayload = await parseJson<{ success: boolean; data: UserProfile[] }>(profilesResponse);
        const destinyPayload = await parseJson<{
          success: boolean;
          data: Partial<DestinyProfile>;
          meta: DestinyResponseMeta;
        }>(destinyResponse);
        const readingsPayload = await parseJson<{
          readings: LegacyReadingSummary[];
          results: ModuleResult[];
        }>(readingsResponse);

        if (!active) {
          return;
        }

        const allProfiles = profilesPayload?.data ?? [];
        const nextProfile = allProfiles.find((item) => item.id === params.profileId) ?? null;
        const nextHistory = buildHistoryItems(
          readingsPayload?.results ?? [],
          readingsPayload?.readings ?? [],
          allProfiles
        ).filter((item) => item.profileId === params.profileId);

        setProfile(nextProfile);
        setDestiny(destinyPayload?.data ?? null);
        setMeta(destinyPayload?.meta ?? null);
        setHistory(nextHistory);
        setLanguage(nextProfile?.language ?? 'en');

        if (!destinyPayload?.data) {
          setNotice('Destiny profile not found.');
        }
      } catch (error) {
        if (active) {
          console.error('[dashboard/profile] load failed', error);
          setNotice('Failed to load the destiny profile.');
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
  }, [params?.profileId, session?.user, status]);

  if (status !== 'authenticated' || !session?.user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-slate-950 to-indigo-950">
        <div className="text-white text-lg">{language === 'zh' ? '正在加载命理档案...' : 'Loading destiny profile...'}</div>
      </div>
    );
  }

  const sectionCards = destiny ? getVisibleSectionCards(destiny) : [];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.2),_transparent_35%),linear-gradient(135deg,_#14091f,_#09090f_55%,_#0f172a)] text-white">
      <header className="border-b border-white/10 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-purple-300 transition hover:text-purple-200">
              ← {language === 'zh' ? '返回总控台' : 'Back to dashboard'}
            </Link>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-purple-300/80">
                {language === 'zh' ? '完整命理档案' : 'Full destiny profile'}
              </p>
              <h1 className="mt-2 text-3xl font-semibold">
                {profile?.displayName ?? profile?.nickname ?? (language === 'zh' ? '命理档案' : 'Destiny profile')}
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
        {notice ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            {notice}
          </div>
        ) : null}

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{language === 'zh' ? '出生信息' : 'Birth details'}</p>
              <p className="mt-2 text-sm text-slate-200">
                {profile?.birthDate ?? '—'}
                {profile?.birthTime ? ` · ${profile.birthTime}` : ''}
                {profile?.birthLocation ? ` · ${profile.birthLocation}` : ''}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{language === 'zh' ? '聚合置信度' : 'Confidence'}</p>
              <p className="mt-2 text-sm text-slate-200">{destiny?.confidenceScore ? `${Math.round(destiny.confidenceScore)}%` : '—'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{language === 'zh' ? '可见层级' : 'Visible sections'}</p>
              <p className="mt-2 text-sm text-slate-200">{meta?.visibleSections.join(', ') ?? '—'}</p>
            </div>
          </div>

          {destiny?.sourceModules?.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {destiny.sourceModules.map((moduleType) => (
                <span key={moduleType} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                  {language === 'zh' ? getModuleMeta(moduleType).labelZh : getModuleMeta(moduleType).label}
                </span>
              ))}
            </div>
          ) : null}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {sectionCards.length > 0 ? (
            sectionCards.map((card) => (
              <div key={card.key} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{card.key}</p>
                <h2 className="mt-2 text-xl font-semibold">{card.title ?? (language === 'zh' ? '待补全' : 'Awaiting more signals')}</h2>
                <p className="mt-3 text-sm text-slate-300">{card.summary ?? (language === 'zh' ? '这部分还在等待更多模块结果。' : 'This section is waiting for more module results.')}</p>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-white/15 bg-slate-950/30 p-8 text-sm text-slate-300 md:col-span-2">
              {language === 'zh'
                ? '这个档案还没有聚合出可展示的 destiny profile。先完成 BaZi、Zi Wei、Fortune 或 Relationship 结果写入。'
                : 'This profile has not aggregated into a visible destiny profile yet. Complete a BaZi, Zi Wei, Fortune, or Relationship result first.'}
            </div>
          )}
        </section>

        {meta?.lockedSections?.length ? (
          <section className="rounded-3xl border border-amber-400/20 bg-amber-500/5 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-amber-300/80">
              {language === 'zh' ? '锁定层' : 'Locked layers'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {meta.lockedSections.map((section) => (
                <span key={section} className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-100">
                  {section}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                {language === 'zh' ? '关联历史记录' : 'Linked history'}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {language === 'zh' ? '属于这个档案的最近结果' : 'Recent results for this profile'}
              </h2>
            </div>
            <Link href="/readings" className="text-sm text-purple-300 transition hover:text-purple-200">
              {language === 'zh' ? '查看全部 →' : 'View all →'}
            </Link>
          </div>

          {history.length > 0 ? (
            <div className="mt-5 space-y-3">
              {history.slice(0, 6).map((item) => {
                const metaItem = getModuleMeta(item.moduleType);
                return (
                  <Link
                    key={item.id}
                    href={`/reading/${item.id}`}
                    className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-slate-950/35 p-4 transition hover:border-purple-300/30 hover:bg-slate-950/55"
                  >
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${metaItem.gradient}`}>
                      {metaItem.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold group-hover:text-purple-200">{item.title}</h3>
                      <p className="mt-2 text-sm text-slate-300">{item.summary}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span>{language === 'zh' ? metaItem.labelZh : metaItem.label}</span>
                        <span>{formatDateTime(item.createdAt, language)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-white/15 bg-slate-950/30 p-6 text-sm text-slate-300">
              {language === 'zh'
                ? '这个档案还没有关联的 unified module results。'
                : 'This profile does not have linked unified module results yet.'}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
