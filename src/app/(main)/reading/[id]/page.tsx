'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { formatDateTime, getModuleMeta, type HistoryItem } from '@/lib/unified-frontend';
import type { ModuleResult, UnifiedSection } from '@/types/module-result';
import type { UserProfile } from '@/types/user-profile';

interface LegacyReadingDetail {
  id: string;
  reading_type: string;
  title: string;
  summary: string;
  created_at: string;
  reading_data?: Record<string, unknown>;
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { MysticButton } from '@/components/ui/MysticButton';
import { HeroSummary } from '@/components/reading/HeroSummary';
import { ChartSection } from '@/components/reading/ChartSection';
import { InsightSection } from '@/components/reading/InsightSection';
import { ApplicationSection } from '@/components/reading/ApplicationSection';
import { TimelineSection } from '@/components/reading/TimelineSection';
import { ActionSection } from '@/components/reading/ActionSection';
import { UpgradeSection } from '@/components/reading/UpgradeSection';
import { TrustSection } from '@/components/reading/TrustSection';
import type { Reading, Language, WesternChartData } from '@/types/reading';
import { generateReading } from '@/lib/reading-engine';
import { ZODIAC_DATA, ELEM_COLORS } from '@/lib/chart-engine';

function getSignData(signName: string) {
  return ZODIAC_DATA.find(s => s.name === signName) ?? ZODIAC_DATA[0];
}

function isUnifiedResult(value: ModuleResult | LegacyReadingDetail | null): value is ModuleResult {
  return Boolean(value && 'moduleType' in value);
}

function hasSectionContent(section?: UnifiedSection) {
  return Boolean(
    section?.headline ||
      section?.summary ||
      section?.strengths?.length ||
      section?.opportunities?.length ||
      section?.risks?.length ||
      section?.advice?.length
  );
}

async function parseJson<T>(response: Response): Promise<T | null> {
  if (!response.ok) {
    return null;
  }

  return (await response.json()) as T;
}

export default function ReadingDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const [reading, setReading] = useState<ModuleResult | LegacyReadingDetail | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [router, status]);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user || !params?.id) {
      return;
    }

    let active = true;

    async function load() {
      setLoading(true);
      setNotice(null);

      try {
        const [readingResponse, profilesResponse, accountResponse] = await Promise.all([
          fetch(`/api/readings/${params.id}`),
          fetch('/api/profiles'),
          fetch('/api/profile'),
        ]);

        const readingPayload = await parseJson<{ success: boolean; data: ModuleResult | LegacyReadingDetail }>(readingResponse);
        const profilesPayload = await parseJson<{ success: boolean; data: UserProfile[] }>(profilesResponse);
        const accountPayload = await parseJson<{ language?: 'en' | 'zh' }>(accountResponse);

        if (!active) {
          return;
        }

        const nextReading = readingPayload?.data ?? null;
        setReading(nextReading);
        setLanguage(accountPayload?.language ?? 'en');

        if (isUnifiedResult(nextReading)) {
          const ownerProfile = (profilesPayload?.data ?? []).find((item) => item.id === nextReading.profileId) ?? null;
          setProfile(ownerProfile);
        } else {
          setProfile(null);
        }

        if (!nextReading) {
          setNotice('Reading not found.');
        }
      } catch (error) {
        if (active) {
          console.error('[reading] detail load failed', error);
          setNotice('Failed to load reading detail.');
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
  }, [params?.id, session?.user, status]);

  if (status !== 'authenticated' || !session?.user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-slate-950 to-indigo-950">
        <div className="text-white text-lg">{language === 'zh' ? '正在加载结果详情...' : 'Loading reading detail...'}</div>
      </div>
    );
  }

  if (!reading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-950 to-indigo-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <h1 className="text-2xl font-semibold">{language === 'zh' ? '未找到解读结果' : 'Reading not found'}</h1>
          <p className="mt-3 text-sm text-slate-300">{notice ?? (language === 'zh' ? '这条记录可能已被删除。' : 'This record may have been removed.')}</p>
          <Link href="/readings" className="mt-5 inline-flex rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10">
            {language === 'zh' ? '返回历史页' : 'Back to history'}
          </Link>
        </div>
      </div>
    );
  }

  const unified = isUnifiedResult(reading);
  const moduleType = unified ? reading.moduleType : reading.reading_type;
  const meta = getModuleMeta(moduleType);
  const createdAt = unified ? reading.createdAt : reading.created_at;
  const sections: Array<{ key: string; section?: UnifiedSection }> = unified
    ? [
        { key: 'identity', section: reading.normalizedPayload.identity },
        { key: 'relationship', section: reading.normalizedPayload.relationship },
        { key: 'career', section: reading.normalizedPayload.career },
        { key: 'wealth', section: reading.normalizedPayload.wealth },
        { key: 'timing', section: reading.normalizedPayload.timing },
        { key: 'advice', section: reading.normalizedPayload.advice },
        { key: 'risk', section: reading.normalizedPayload.risk },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.2),_transparent_35%),linear-gradient(135deg,_#14091f,_#09090f_55%,_#0f172a)] text-white">
      <header className="border-b border-white/10 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-6">
          <div className="flex items-center gap-4">
            <Link href="/readings" className="text-sm text-purple-300 transition hover:text-purple-200">
              ← {language === 'zh' ? '返回历史页' : 'Back to history'}
            </Link>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-purple-300/80">
                {language === 'zh' ? '结果详情' : 'Reading detail'}
              </p>
              <h1 className="mt-2 text-3xl font-semibold">{reading.title}</h1>
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

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
        {notice ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            {notice}
          </div>
        ) : null}

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className={`flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br ${meta.gradient} text-3xl`}>
                {meta.emoji}
              </div>
              <div>
                <p className="text-sm text-slate-300">{language === 'zh' ? meta.labelZh : meta.label}</p>
                <p className="mt-2 text-sm text-slate-300">
                  {formatDateTime(createdAt, language)}
                  {profile ? ` · ${profile.displayName ?? profile.nickname ?? profile.birthDate}` : ''}
                </p>
                <p className="mt-4 max-w-3xl text-base text-slate-200">
                  {unified
                    ? reading.summary ?? reading.normalizedPayload.summary.oneLiner ?? reading.normalizedPayload.summary.headline
                    : reading.summary}
                </p>
              </div>
            </div>

            {unified && profile ? (
              <Link
                href={`/dashboard/profile/${reading.profileId}`}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
              >
                {language === 'zh' ? '打开对应命理档案' : 'Open linked destiny profile'}
              </Link>
            ) : null}
          </div>

          {unified && reading.normalizedPayload.summary.keywords?.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {reading.normalizedPayload.summary.keywords.map((keyword) => (
                <span key={keyword} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                  {keyword}
                </span>
              ))}
            </div>
          ) : null}
        </section>

        {unified ? (
          <>
            <section className="grid gap-4 md:grid-cols-2">
              {sections.filter((item) => hasSectionContent(item.section)).map((item) => (
                <div key={item.key} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{item.key}</p>
                  <h2 className="mt-2 text-xl font-semibold">
                    {item.section?.headline ?? (language === 'zh' ? '待补全' : 'Awaiting more signals')}
                  </h2>
                  <p className="mt-3 text-sm text-slate-300">
                    {item.section?.summary ?? (language === 'zh' ? '这一层正在等待更多模块结果。' : 'This layer is waiting for more module results.')}
                  </p>

                  {item.section?.strengths?.length ? (
                    <div className="mt-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/80">
                        {language === 'zh' ? '优势' : 'Strengths'}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.section.strengths.slice(0, 4).map((entry) => (
                          <span key={entry} className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
                            {entry}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {item.section?.advice?.length ? (
                    <div className="mt-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-amber-300/80">
                        {language === 'zh' ? '建议' : 'Advice'}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.section.advice.slice(0, 4).map((entry) => (
                          <span key={entry} className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-200">
                            {entry}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </section>

            {reading.normalizedPayload.timeline?.phases?.length ? (
              <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                  {language === 'zh' ? '时间线' : 'Timeline'}
                </p>
                <div className="mt-5 space-y-3">
                  {reading.normalizedPayload.timeline.phases.map((phase) => (
                    <div key={`${phase.range}-${phase.label}`} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">{phase.range}</span>
                        <h3 className="text-base font-semibold">{phase.label}</h3>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">{phase.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        ) : (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              {language === 'zh' ? '兼容层详情' : 'Compatibility detail'}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              {language === 'zh' ? '这条记录来自旧 readings 接口' : 'This record came from the legacy readings interface'}
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              {language === 'zh'
                ? '你现在看到的是兼容层输出。后续重新写入 unified result 后，这里会展示更结构化的 identity / relationship / timing 分层结果。'
                : 'You are seeing the compatibility output. Once this flow writes back into the unified result model, this page will show structured identity / relationship / timing layers instead.'}
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
