'use client';

import Image from 'next/image';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Crown, History, Lock, LogOut, Settings, Sparkles, UserRound } from 'lucide-react';
import {
  buildHistoryItems,
  formatDateTime,
  getModuleMeta,
  getPlanBadge,
  getPrimaryProfile,
  getVisibleSectionCards,
  type DestinyResponseMeta,
  type HistoryItem,
  type LegacyReadingSummary,
  type ProfileApiResponse,
} from '@/lib/unified-frontend';
import type { Entitlement } from '@/types/entitlement';
import type { ModuleResult } from '@/types/module-result';
import type { DestinyProfile } from '@/types/unified-profile';
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
  TianjiLoveTrustCard,
} from '@/components/tianji-love';

const FREE_ENTITLEMENT: Entitlement = {
  id: 'free',
  userId: '',
  plan: 'free',
  features: {
    unifiedProfile: false,
    deepRelationship: false,
    longTimeline: false,
    premiumAdvice: false,
    exportPdf: false,
    multiProfile: false,
    advisorMode: false,
  },
  isActive: true,
};

const FREE_DESTINY_META: DestinyResponseMeta = {
  plan: 'free',
  visibleSections: ['identity', 'timing'],
  lockedSections: ['relationship', 'career', 'wealth', 'actions', 'risk'],
};

const QUICK_ACTIONS = [
  { href: '/ask', moduleType: 'relationship', labelEn: 'Love Reading', labelZh: '爱情解读' },
  { href: '/relationship/new', moduleType: 'relationship', labelEn: 'Compatibility', labelZh: '关系合盘' },
  { href: '/draw', moduleType: 'fortune', labelEn: 'Timing', labelZh: '时机' },
  { href: '/pricing', moduleType: 'western', labelEn: 'Pricing', labelZh: '会员权益' },
] as const;

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
    loading: 'Loading your Tianji Love dashboard...',
    eyebrow: 'Private dashboard',
    welcome: (name: string) => `Welcome back, ${name}`,
    subtitle: 'Your love readings, timing windows, compatibility reports, and account settings now live in one calm surface.',
    plan: 'Current plan',
    upgrade: 'View upgrade paths',
    portal: 'Manage subscription',
    redirecting: 'Redirecting...',
    profileSettings: 'Profile settings',
    signOut: 'Sign out',
    dashboardError: 'A dashboard request failed:',
    fallback:
      'The unified private profile layer needs Supabase tables. Legacy history still works, but full aggregation appears after the database is connected.',
    primaryProfile: 'Primary private profile',
    noProfile: 'No primary profile yet. Add your birth details first so private history and reports can connect.',
    createProfile: 'Create profile',
    openProfile: 'Open full profile',
    timingWindow: 'Current timing window',
    waitingTiming: 'Waiting for the next relationship signal',
    timingBody: 'Complete a love reading, timing question, or compatibility report to build this layer.',
    latest: 'Latest update',
    noHistory: 'No history yet. Start with one of the core Tianji Love paths.',
    core: 'Core entry points',
    build: 'Keep building your private relationship practice',
    allHistory: 'View all history',
    snapshot: 'Private profile snapshot',
    snapshotTitle: 'Cross-report summary',
    noSnapshot:
      'No unified snapshot is ready yet. Once at least one unified module result lands, the private profile layers will appear here.',
    locked: 'Premium layers still locked',
    lockedBody: 'Upgrade to unlock deeper relationship, timing, action, and history layers when they are implemented for your account.',
    recent: 'Recent history',
    records: (count: number) => `${count} records`,
    privacy:
      'Dashboard content is private account content. Public share pages still hide birth date, time, location, and timezone by default.',
  },
  zh: {
    nav: {
      compatibility: '关系合盘',
      loveReading: '爱情解读',
      timing: '时机',
      pricing: '会员权益',
      history: '历史',
    },
    loading: '正在加载 Tianji Love 控制台...',
    eyebrow: '私人控制台',
    welcome: (name: string) => `${name}，欢迎回来`,
    subtitle: '你的爱情解读、时机窗口、关系合盘和账号设置，现在集中在同一个安静的页面里。',
    plan: '当前方案',
    upgrade: '查看升级路径',
    portal: '管理订阅',
    redirecting: '正在跳转...',
    profileSettings: '档案设置',
    signOut: '退出登录',
    dashboardError: '控制台请求失败：',
    fallback: '统一私人档案层依赖 Supabase 表。旧历史仍可使用，完整聚合会在数据库连接后显示。',
    primaryProfile: '主私人档案',
    noProfile: '还没有主档案。先补充出生资料，私人历史和报告才能关联起来。',
    createProfile: '创建档案',
    openProfile: '打开完整档案',
    timingWindow: '当前时机窗口',
    waitingTiming: '等待下一段关系信号',
    timingBody: '完成爱情解读、时机问题或关系合盘后，这一层会逐步建立。',
    latest: '最新更新',
    noHistory: '还没有历史记录。先从 Tianji Love 核心路径开始。',
    core: '核心入口',
    build: '继续建立你的私人关系练习',
    allHistory: '查看全部历史',
    snapshot: '私人档案快照',
    snapshotTitle: '跨报告摘要',
    noSnapshot: '还没有统一快照。至少完成一条统一模块结果后，私人档案层会显示在这里。',
    locked: '仍锁定的高级层',
    lockedBody: '当账号支持后，升级可解锁更深的关系、时机、行动和历史层。',
    recent: '最近历史',
    records: (count: number) => `${count} 条记录`,
    privacy: '控制台内容是私人账号内容。公开分享页默认仍隐藏出生日期、时间、地点和时区。',
  },
} as const;

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const [profile, setProfile] = useState<ProfileApiResponse | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [entitlement, setEntitlement] = useState<Entitlement>(FREE_ENTITLEMENT);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [destiny, setDestiny] = useState<Partial<DestinyProfile> | null>(null);
  const [destinyMeta, setDestinyMeta] = useState<DestinyResponseMeta>(FREE_DESTINY_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [unifiedReady, setUnifiedReady] = useState(true);

  const t = copy[language];
  const primaryProfile = getPrimaryProfile(profiles);
  const visibleCards = destiny ? getVisibleSectionCards(destiny).slice(0, 4) : [];
  const latestHistory = history[0] ?? null;
  const planBadge = getPlanBadge(entitlement.plan);
  const welcomeName = primaryProfile?.displayName ?? session?.user?.name ?? profile?.name ?? 'Seeker';
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
      setError(null);

      try {
        const [profileResponse, profilesResponse, entitlementResponse, readingsResponse] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/profiles'),
          fetch('/api/entitlements'),
          fetch('/api/readings'),
        ]);

        const profilePayload = await parseJson<ProfileApiResponse>(profileResponse);
        const profilesPayload = await parseJson<{ success: boolean; data: UserProfile[] }>(profilesResponse);
        const entitlementPayload = await parseJson<{ success: boolean; data: Entitlement }>(entitlementResponse);
        const readingsPayload = await parseJson<{
          readings: LegacyReadingSummary[];
          results: ModuleResult[];
        }>(readingsResponse);

        const nextProfiles = profilesPayload?.data ?? [];
        const nextEntitlement = entitlementPayload?.data ?? FREE_ENTITLEMENT;
        const nextHistory = buildHistoryItems(
          readingsPayload?.results ?? [],
          readingsPayload?.readings ?? [],
          nextProfiles
        );

        const primary = getPrimaryProfile(nextProfiles);
        let nextDestiny: Partial<DestinyProfile> | null = null;
        let nextMeta: DestinyResponseMeta = { ...FREE_DESTINY_META, plan: nextEntitlement.plan };
        let unifiedAvailable = profilesResponse.status !== 503 && entitlementResponse.status !== 503;

        if (primary) {
          const destinyResponse = await fetch(`/api/destiny/profile/${primary.id}`);
          if (destinyResponse.ok) {
            const destinyPayload = (await destinyResponse.json()) as {
              success: boolean;
              data: Partial<DestinyProfile>;
              meta: DestinyResponseMeta;
            };
            nextDestiny = destinyPayload.data ?? null;
            nextMeta = destinyPayload.meta ?? nextMeta;
          } else if (destinyResponse.status === 503) {
            unifiedAvailable = false;
          }
        }

        if (!active) {
          return;
        }

        setProfile(profilePayload);
        setProfiles(nextProfiles);
        setEntitlement(nextEntitlement);
        setHistory(nextHistory);
        setDestiny(nextDestiny);
        setDestinyMeta(nextMeta);
        setLanguage(primary?.language ?? profilePayload?.language ?? 'en');
        setUnifiedReady(unifiedAvailable);
      } catch (loadError) {
        if (!active) {
          return;
        }

        console.error('[dashboard] failed to load unified dashboard', loadError);
        setError('Failed to load dashboard data.');
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

  async function handlePortal() {
    setPortalLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/portal', { method: 'POST' });
      const payload = await response.json();

      if (response.ok && payload.url) {
        window.location.href = payload.url as string;
        return;
      }

      setError('Unable to open the subscription portal right now.');
    } catch (portalError) {
      console.error('[dashboard] portal error', portalError);
      setError('Unable to open the subscription portal right now.');
    } finally {
      setPortalLoading(false);
    }
  }

  if (status !== 'authenticated' || !session?.user || loading) {
    return (
      <TianjiLoveShell className="tianji-love-dashboard-loading">
        <div className="relative z-10 flex min-h-screen items-center justify-center text-[#ffe3b4]">{t.loading}</div>
      </TianjiLoveShell>
    );
  }

  return (
    <TianjiLoveShell className="tianji-love-dashboard-page" ariaLabel="Tianji Love private dashboard">
      <TianjiLoveHeader
        homeHref="/"
        navItems={getTianjiLovePrimaryNav(language)}
        cta={getTianjiLovePrimaryCta(language)}
        languageLabel={language === 'zh' ? 'EN' : '中文'}
        onLanguageToggle={toggleLanguage}
      />

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-7 px-5 py-10 sm:px-8">
        <section className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
          <div>
            <p className="mb-5 text-xs uppercase tracking-[0.32em] text-[#d8b77b]/70">{t.eyebrow}</p>
            <h1 className="max-w-4xl font-serif text-4xl font-semibold leading-tight text-[#ffe3b4] sm:text-5xl">
              {t.welcome(welcomeName)}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#f5d8aa]/78">{t.subtitle}</p>
          </div>

          <TianjiLovePanel className="p-5">
            <div className="flex items-center gap-3">
              {session.user.image ? (
                <Image src={session.user.image} alt="Profile avatar" width={48} height={48} unoptimized className="h-12 w-12 rounded-lg object-cover" />
              ) : (
                <div className="grid h-12 w-12 place-items-center rounded-lg border border-[#b57248]/32 bg-[#070b16]/70 text-lg font-semibold text-[#ffe3b4]">
                  {(session.user.name ?? '?').slice(0, 1)}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#ffe3b4]">{session.user.name ?? accountName(profile)}</p>
                <p className="truncate text-xs text-[#f4d7a3]/52">{session.user.email ?? profile?.email}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              <Link href="/profile" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#b57248]/32 bg-[#070b16]/62 px-4 text-sm text-[#ffe3b4] transition hover:border-[#ffe3b4]/50">
                <Settings className="h-4 w-4" aria-hidden />
                {t.profileSettings}
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#b57248]/32 bg-[#070b16]/62 px-4 text-sm text-[#ffe3b4] transition hover:border-[#ffe3b4]/50"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                {t.signOut}
              </button>
            </div>
          </TianjiLovePanel>
        </section>

        {error ? (
          <div className="rounded-lg border border-[#ff9c8b]/34 bg-[#ff6c73]/10 px-5 py-4 text-sm text-[#ffd0c9]">
            {t.dashboardError} {error}
          </div>
        ) : null}

        {!unifiedReady ? (
          <div className="rounded-lg border border-[#d8b77b]/32 bg-[#d8b77b]/10 px-5 py-4 text-sm leading-6 text-[#ffe3b4]">
            {t.fallback}
          </div>
        ) : null}

        <TianjiLovePanel className="p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-[#d8b77b]/28 bg-[#d8b77b]/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-[#ffe3b4]">
                {t.plan}: {language === 'zh' ? planBadge.labelZh : planBadge.label}
              </div>
              <h2 className="mt-4 font-serif text-3xl text-[#ffe3b4]">{language === 'zh' ? '你的私人关系中枢已连接' : 'Your private relationship hub is connected'}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#f4d7a3]/68">{t.privacy}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <TianjiLoveButton href="/pricing">{t.upgrade}</TianjiLoveButton>
              <button
                type="button"
                onClick={handlePortal}
                disabled={portalLoading}
                className="inline-flex min-h-14 items-center justify-center rounded-lg border border-[#b57248]/58 bg-black/24 px-6 text-base font-semibold text-[#f7ddb2] transition hover:border-[#ffe1a6] disabled:opacity-60"
              >
                {portalLoading ? t.redirecting : t.portal}
              </button>
            </div>
          </div>
        </TianjiLovePanel>

        <section className="grid gap-5 md:grid-cols-3">
          <TianjiLovePanel className="p-5">
            <UserRound className="mb-3 h-5 w-5 text-[#d8b77b]" aria-hidden />
            <p className="text-xs uppercase tracking-[0.24em] text-[#d8b77b]/62">{t.primaryProfile}</p>
            {primaryProfile ? (
              <>
                <h2 className="mt-3 font-serif text-2xl text-[#ffe3b4]">{primaryProfile.displayName ?? primaryProfile.nickname ?? primaryProfile.birthDate}</h2>
                <p className="mt-2 text-sm leading-6 text-[#f4d7a3]/58">
                  {primaryProfile.birthDate}
                  {primaryProfile.birthTime ? ` / ${primaryProfile.birthTime}` : ''}
                  {primaryProfile.birthLocation ? ` / ${primaryProfile.birthLocation}` : ''}
                </p>
                <Link href={`/dashboard/profile/${primaryProfile.id}`} className="mt-5 inline-flex text-sm font-medium text-[#d8b77b] transition hover:text-[#ffe3b4]">
                  {t.openProfile}
                </Link>
              </>
            ) : (
              <>
                <p className="mt-3 text-sm leading-7 text-[#f4d7a3]/64">{t.noProfile}</p>
                <TianjiLoveButton href="/profile" variant="secondary" className="mt-5">{t.createProfile}</TianjiLoveButton>
              </>
            )}
          </TianjiLovePanel>

          <TianjiLovePanel className="p-5">
            <Sparkles className="mb-3 h-5 w-5 text-[#d8b77b]" aria-hidden />
            <p className="text-xs uppercase tracking-[0.24em] text-[#d8b77b]/62">{t.timingWindow}</p>
            <h2 className="mt-3 font-serif text-2xl text-[#ffe3b4]">{destiny?.timingProfile?.headline ?? t.waitingTiming}</h2>
            <p className="mt-2 text-sm leading-7 text-[#f4d7a3]/64">
              {destiny?.timingProfile?.summary ?? destiny?.timingProfile?.currentWindow ?? t.timingBody}
            </p>
          </TianjiLovePanel>

          <TianjiLovePanel className="p-5">
            <History className="mb-3 h-5 w-5 text-[#d8b77b]" aria-hidden />
            <p className="text-xs uppercase tracking-[0.24em] text-[#d8b77b]/62">{t.latest}</p>
            {latestHistory ? (
              <>
                <h2 className="mt-3 line-clamp-2 font-serif text-2xl text-[#ffe3b4]">{latestHistory.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm leading-7 text-[#f4d7a3]/64">{latestHistory.summary}</p>
                <p className="mt-3 text-xs text-[#f4d7a3]/45">{formatDateTime(latestHistory.createdAt, language)}</p>
              </>
            ) : (
              <p className="mt-3 text-sm leading-7 text-[#f4d7a3]/64">{t.noHistory}</p>
            )}
          </TianjiLovePanel>
        </section>

        <section>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#d8b77b]/62">{t.core}</p>
              <h2 className="mt-2 font-serif text-3xl text-[#ffe3b4]">{t.build}</h2>
            </div>
            <Link href="/readings" className="text-sm text-[#d8b77b] transition hover:text-[#ffe3b4]">{t.allHistory}</Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {QUICK_ACTIONS.map((action) => {
              const meta = getModuleMeta(action.moduleType);
              return (
                <Link key={action.href} href={action.href} className={`rounded-lg border border-[#b57248]/32 bg-gradient-to-br ${meta.gradient} p-5 transition hover:-translate-y-0.5 hover:border-[#ffe3b4]/48`}>
                  <div className="text-lg font-semibold text-[#ffe3b4]">{meta.emoji}</div>
                  <h3 className="mt-4 text-lg font-semibold text-[#ffe3b4]">{language === 'zh' ? action.labelZh : action.labelEn}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#fff4dd]/72">{language === 'zh' ? '进入同一套 Tianji Love 视觉与转化路径。' : 'Continue inside the same Tianji Love visual and conversion path.'}</p>
                </Link>
              );
            })}
          </div>
        </section>

        <TianjiLovePanel className="p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#d8b77b]/62">{t.snapshot}</p>
              <h2 className="mt-2 font-serif text-3xl text-[#ffe3b4]">{t.snapshotTitle}</h2>
            </div>
            {destiny?.confidenceScore ? (
              <span className="rounded-full border border-[#d8b77b]/28 bg-[#d8b77b]/10 px-3 py-1 text-sm text-[#ffe3b4]">
                {Math.round(destiny.confidenceScore)}%
              </span>
            ) : null}
          </div>

          {visibleCards.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {visibleCards.map((card) => (
                <div key={card.key} className="rounded-lg border border-[#b57248]/24 bg-[#070b16]/56 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#d8b77b]/50">{card.key}</p>
                  <h3 className="mt-2 text-lg font-semibold text-[#ffe3b4]">{card.title ?? (language === 'zh' ? '等待更多信号' : 'Waiting for more signals')}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#f4d7a3]/64">{card.summary ?? t.noSnapshot}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-lg border border-dashed border-[#b57248]/34 bg-[#070b16]/42 p-5 text-sm leading-7 text-[#f4d7a3]/64">{t.noSnapshot}</p>
          )}
        </TianjiLovePanel>

        {destinyMeta.lockedSections.length > 0 ? (
          <TianjiLovePanel className="p-6">
            <Crown className="mb-3 h-6 w-6 text-[#d8b77b]" aria-hidden />
            <h2 className="font-serif text-3xl text-[#ffe3b4]">{t.locked}</h2>
            <p className="mt-3 text-sm leading-7 text-[#f4d7a3]/66">{t.lockedBody}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {destinyMeta.lockedSections.map((section) => (
                <span key={section} className="rounded-full border border-[#d8b77b]/24 bg-[#d8b77b]/10 px-3 py-1 text-xs text-[#ffe3b4]">
                  {section}
                </span>
              ))}
            </div>
          </TianjiLovePanel>
        ) : null}

        <section>
          <TianjiLoveSectionTitle title={t.recent} className="mb-8" />
          <div className="mb-4 text-sm text-[#f4d7a3]/52">{t.records(history.length)}</div>
          {history.length > 0 ? (
            <div className="space-y-3">
              {history.slice(0, 6).map((item) => (
                <HistoryRow key={item.id} item={item} language={language} />
              ))}
            </div>
          ) : (
            <TianjiLovePanel className="p-6 text-sm leading-7 text-[#f4d7a3]/64">{t.noHistory}</TianjiLovePanel>
          )}
        </section>

        <TianjiLoveTrustCard icon={Lock} title={language === 'zh' ? '隐私默认值保持不变' : 'Privacy defaults remain'} body={t.privacy} />
      </main>

      <TianjiLoveFooter
        homeHref="/"
        disclaimer={t.privacy}
        links={getTianjiLoveFooterNav(language)}
      />
    </TianjiLoveShell>
  );
}

function accountName(profile: ProfileApiResponse | null) {
  return profile?.name ?? profile?.email ?? 'User';
}

function HistoryRow({ item, language }: { item: HistoryItem; language: 'en' | 'zh' }) {
  const meta = getModuleMeta(item.moduleType);
  return (
    <Link href={`/reading/${item.id}`} className="flex items-start gap-4 rounded-lg border border-[#b57248]/28 bg-[#070b16]/56 p-4 transition hover:border-[#ffe3b4]/48">
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${meta.gradient} text-[#ffe3b4]`}>
        {meta.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-base font-semibold text-[#ffe3b4]">{item.title}</h3>
          {item.kind === 'unified' ? <Badge>unified</Badge> : null}
          {item.isPremium ? <Badge>premium</Badge> : null}
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#f4d7a3]/64">{item.summary}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#f4d7a3]/45">
          <span>{language === 'zh' ? meta.labelZh : meta.label}</span>
          <span>{formatDateTime(item.createdAt, language)}</span>
          {item.profileName ? <span>{item.profileName}</span> : null}
        </div>
      </div>
    </Link>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-[#d8b77b]/24 bg-[#d8b77b]/10 px-2 py-0.5 text-[11px] text-[#ffe3b4]">
      {children}
    </span>
  );
}
