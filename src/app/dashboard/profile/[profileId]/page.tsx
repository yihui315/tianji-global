'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, History, Lock, UserRound } from 'lucide-react';
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
import {
  getTianjiLoveFooterNav,
  getTianjiLovePrimaryCta,
  getTianjiLovePrimaryNav,
  TianjiLoveFooter,
  TianjiLoveHeader,
  TianjiLovePanel,
  TianjiLoveSectionTitle,
  TianjiLoveShell,
  TianjiLoveTrustCard,
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
      history: 'History',
    },
    loading: 'Loading destiny profile...',
    back: 'Back to dashboard',
    eyebrow: 'Full private profile',
    fallbackName: 'Destiny profile',
    birth: 'Birth details',
    confidence: 'Confidence',
    visible: 'Visible sections',
    waiting: 'Awaiting more signals',
    waitingBody: 'This section is waiting for more module results.',
    emptyProfile:
      'This profile has not aggregated into a visible destiny profile yet. Complete a love reading, timing question, or compatibility report first.',
    locked: 'Locked layers',
    linked: 'Linked history',
    linkedTitle: 'Recent results for this profile',
    viewAll: 'View all',
    noLinked: 'This profile does not have linked unified module results yet.',
    notFound: 'Destiny profile not found.',
    loadFailed: 'Failed to load the destiny profile.',
    privacy:
      'This full profile is private account content. Public share pages still hide birth date, time, location, and timezone by default.',
  },
  zh: {
    nav: {
      compatibility: '关系合盘',
      loveReading: '爱情解读',
      timing: '时机',
      pricing: '会员权益',
      history: '历史',
    },
    loading: '正在加载命理档案...',
    back: '返回控制台',
    eyebrow: '完整私人档案',
    fallbackName: '命理档案',
    birth: '出生信息',
    confidence: '置信度',
    visible: '可见层级',
    waiting: '等待更多信号',
    waitingBody: '这一部分还在等待更多模块结果。',
    emptyProfile: '这个档案还没有聚合出可展示的私人画像。先完成一次爱情解读、时机问题或关系合盘。',
    locked: '锁定层',
    linked: '关联历史',
    linkedTitle: '属于这个档案的最近结果',
    viewAll: '查看全部',
    noLinked: '这个档案还没有关联的统一模块结果。',
    notFound: '未找到命理档案。',
    loadFailed: '加载命理档案失败。',
    privacy: '完整档案是私人账号内容。公开分享页默认仍隐藏出生日期、时间、地点和时区。',
  },
} as const;

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

  const t = copy[language];
  const toggleLanguage = () => setLanguage(language === 'zh' ? 'en' : 'zh');

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
          setNotice(copy[nextProfile?.language ?? 'en'].notFound);
        }
      } catch (error) {
        if (active) {
          console.error('[dashboard/profile] load failed', error);
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
  }, [language, params?.profileId, session?.user, status]);

  if (status !== 'authenticated' || !session?.user || loading) {
    return (
      <TianjiLoveShell className="tianji-love-dashboard-profile-loading">
        <div className="relative z-10 flex min-h-screen items-center justify-center text-[#ffe3b4]">{t.loading}</div>
      </TianjiLoveShell>
    );
  }

  const sectionCards = destiny ? getVisibleSectionCards(destiny) : [];

  return (
    <TianjiLoveShell className="tianji-love-dashboard-profile-page" ariaLabel="Tianji Love full private profile">
      <TianjiLoveHeader
        homeHref="/"
        navItems={getTianjiLovePrimaryNav(language)}
        cta={getTianjiLovePrimaryCta(language)}
        languageLabel={language === 'zh' ? 'EN' : '中文'}
        onLanguageToggle={toggleLanguage}
      />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 sm:px-8">
        <Link href="/dashboard" className="inline-flex w-fit items-center gap-2 text-sm text-[#d8b77b] transition hover:text-[#ffe3b4]">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t.back}
        </Link>

        <section>
          <p className="mb-5 text-xs uppercase tracking-[0.32em] text-[#d8b77b]/70">{t.eyebrow}</p>
          <h1 className="max-w-4xl font-serif text-4xl font-semibold leading-tight text-[#ffe3b4] sm:text-5xl">
            {profile?.displayName ?? profile?.nickname ?? t.fallbackName}
          </h1>
        </section>

        {notice ? (
          <div className="rounded-lg border border-[#ff9c8b]/34 bg-[#ff6c73]/10 px-5 py-4 text-sm text-[#ffd0c9]">
            {notice}
          </div>
        ) : null}

        <TianjiLovePanel className="p-6">
          <div className="grid gap-5 md:grid-cols-3">
            <InfoBlock label={t.birth}>
              {profile?.birthDate ?? '-'}
              {profile?.birthTime ? ` / ${profile.birthTime}` : ''}
              {profile?.birthLocation ? ` / ${profile.birthLocation}` : ''}
            </InfoBlock>
            <InfoBlock label={t.confidence}>
              {destiny?.confidenceScore ? `${Math.round(destiny.confidenceScore)}%` : '-'}
            </InfoBlock>
            <InfoBlock label={t.visible}>
              {meta?.visibleSections.join(', ') ?? '-'}
            </InfoBlock>
          </div>

          {destiny?.sourceModules?.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {destiny.sourceModules.map((moduleType) => (
                <span key={moduleType} className="rounded-full border border-[#d8b77b]/24 bg-[#d8b77b]/10 px-3 py-1 text-xs text-[#ffe3b4]">
                  {language === 'zh' ? getModuleMeta(moduleType).labelZh : getModuleMeta(moduleType).label}
                </span>
              ))}
            </div>
          ) : null}
        </TianjiLovePanel>

        <section className="grid gap-4 md:grid-cols-2">
          {sectionCards.length > 0 ? (
            sectionCards.map((card) => (
              <TianjiLovePanel key={card.key} as="article" className="p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-[#d8b77b]/58">{card.key}</p>
                <h2 className="mt-2 font-serif text-2xl text-[#ffe3b4]">{card.title ?? t.waiting}</h2>
                <p className="mt-3 text-sm leading-7 text-[#f4d7a3]/66">{card.summary ?? t.waitingBody}</p>
              </TianjiLovePanel>
            ))
          ) : (
            <TianjiLovePanel className="p-8 text-sm leading-7 text-[#f4d7a3]/66 md:col-span-2">
              {t.emptyProfile}
            </TianjiLovePanel>
          )}
        </section>

        {meta?.lockedSections?.length ? (
          <TianjiLovePanel className="p-6">
            <h2 className="font-serif text-2xl text-[#ffe3b4]">{t.locked}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {meta.lockedSections.map((section) => (
                <span key={section} className="rounded-full border border-[#d8b77b]/24 bg-[#d8b77b]/10 px-3 py-1 text-xs text-[#ffe3b4]">
                  {section}
                </span>
              ))}
            </div>
          </TianjiLovePanel>
        ) : null}

        <section>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#d8b77b]/62">{t.linked}</p>
              <h2 className="font-serif text-3xl text-[#ffe3b4]">{t.linkedTitle}</h2>
            </div>
            <Link href="/readings" className="text-sm text-[#d8b77b] transition hover:text-[#ffe3b4]">{t.viewAll}</Link>
          </div>

          {history.length > 0 ? (
            <div className="space-y-3">
              {history.slice(0, 6).map((item) => (
                <HistoryRow key={item.id} item={item} language={language} />
              ))}
            </div>
          ) : (
            <TianjiLovePanel className="p-6 text-sm leading-7 text-[#f4d7a3]/64">{t.noLinked}</TianjiLovePanel>
          )}
        </section>

        <TianjiLoveTrustCard icon={Lock} title={language === 'zh' ? '隐私保护' : 'Privacy guard'} body={t.privacy} />
      </main>

      <TianjiLoveFooter
        homeHref="/"
        disclaimer={t.privacy}
        links={getTianjiLoveFooterNav(language)}
      />
    </TianjiLoveShell>
  );
}

function InfoBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <UserRound className="mb-3 h-5 w-5 text-[#d8b77b]" aria-hidden />
      <p className="text-xs uppercase tracking-[0.24em] text-[#d8b77b]/58">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[#f4d7a3]/72">{children}</p>
    </div>
  );
}

function HistoryRow({ item, language }: { item: HistoryItem; language: 'en' | 'zh' }) {
  const meta = getModuleMeta(item.moduleType);
  return (
    <Link href={`/reading/${item.id}`} className="flex items-start gap-4 rounded-lg border border-[#b57248]/28 bg-[#070b16]/56 p-4 transition hover:border-[#ffe3b4]/48">
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${meta.gradient} text-[#ffe3b4]`}>
        {meta.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-[#d8b77b]" aria-hidden />
          <h3 className="truncate text-base font-semibold text-[#ffe3b4]">{item.title}</h3>
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#f4d7a3]/64">{item.summary}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#f4d7a3]/45">
          <span>{language === 'zh' ? meta.labelZh : meta.label}</span>
          <span>{formatDateTime(item.createdAt, language)}</span>
        </div>
      </div>
    </Link>
  );
}
