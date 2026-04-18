'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  { href: '/bazi', moduleType: 'bazi' },
  { href: '/ziwei', moduleType: 'ziwei' },
  { href: '/fortune', moduleType: 'fortune' },
  { href: '/relationship/new', moduleType: 'relationship' },
] as const;

async function parseJson<T>(response: Response): Promise<T | null> {
  if (!response.ok) {
    return null;
  }

  return (await response.json()) as T;
}

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

        const primaryProfile = getPrimaryProfile(nextProfiles);
        let nextDestiny: Partial<DestinyProfile> | null = null;
        let nextMeta: DestinyResponseMeta = {
          ...FREE_DESTINY_META,
          plan: nextEntitlement.plan,
        };
        let unifiedAvailable = true;

        if (profilesResponse.status === 503 || entitlementResponse.status === 503) {
          unifiedAvailable = false;
        }

        if (primaryProfile) {
          const destinyResponse = await fetch(`/api/destiny/profile/${primaryProfile.id}`);
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
        setLanguage(primaryProfile?.language ?? profilePayload?.language ?? 'en');
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

  const primaryProfile = getPrimaryProfile(profiles);
  const visibleCards = destiny ? getVisibleSectionCards(destiny).slice(0, 4) : [];
  const latestHistory = history[0] ?? null;
  const planBadge = getPlanBadge(entitlement.plan);
  const welcomeName = primaryProfile?.displayName ?? session?.user?.name ?? profile?.name ?? 'Seeker';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-slate-950 to-indigo-950">
        <div className="text-white text-lg">{language === 'zh' ? '正在加载命理总控台...' : 'Loading your destiny cockpit...'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.22),_transparent_35%),linear-gradient(135deg,_#13091d,_#09090f_52%,_#0f172a)] text-white">
      <header className="border-b border-white/10 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-purple-300/80">
              {language === 'zh' ? '命理总控台' : 'Destiny Command Center'}
            </p>
            <h1 className="mt-2 text-3xl font-semibold">
              {language === 'zh' ? `${welcomeName}，欢迎回来` : `Welcome back, ${welcomeName}`}
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              {language === 'zh'
                ? '统一查看你的核心画像、当前时间窗口和最近模块更新。'
                : 'See your unified profile, current timing window, and latest module updates in one place.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
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

            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm transition hover:bg-white/10"
            >
              {session.user.image ? (
                <img src={session.user.image} alt="Profile avatar" className="h-7 w-7 rounded-full" />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-xs font-semibold">
                  {(session.user.name ?? '?').slice(0, 1)}
                </span>
              )}
              <span>{language === 'zh' ? '档案设置' : 'Profile settings'}</span>
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
            >
              {language === 'zh' ? '退出登录' : 'Sign out'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-8">
        {error ? (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {language === 'zh' ? '当前有一项数据加载失败：' : 'A dashboard request failed: '}
            {error}
          </div>
        ) : null}

        {!unifiedReady ? (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
            {language === 'zh'
              ? '统一命理档案依赖 Supabase 表。当前仍可查看旧历史，但完整档案、权限和聚合画像要在数据库连接后才会出现。'
              : 'The unified destiny layer needs Supabase tables. Legacy history still works, but full profiles, entitlements, and aggregation appear after the database is connected.'}
          </div>
        ) : null}

        <section className="rounded-3xl border border-purple-400/20 bg-gradient-to-r from-purple-900/35 to-amber-800/20 p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-purple-200">
                {language === 'zh' ? planBadge.labelZh : planBadge.label}
              </div>
              <h2 className="mt-3 text-2xl font-semibold">
                {language === 'zh'
                  ? '你的命理总控台已经接入统一权限层'
                  : 'Your cockpit is now powered by unified entitlements'}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-200">
                {language === 'zh'
                  ? `当前计划：${planBadge.labelZh}。统一画像${entitlement.features.unifiedProfile ? '已开启' : '仍锁定'}，最近模块结果会自动汇总到你的核心档案。`
                  : `Current plan: ${planBadge.label}. Unified profile is ${entitlement.features.unifiedProfile ? 'enabled' : 'still locked'}, and recent module results roll into your core destiny profile.`}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/pricing"
                className="rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 px-5 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
              >
                {language === 'zh' ? '查看升级路径' : 'View upgrade paths'}
              </Link>
              <button
                onClick={handlePortal}
                disabled={portalLoading}
                className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm transition hover:bg-white/10 disabled:opacity-60"
              >
                {portalLoading
                  ? language === 'zh' ? '正在跳转...' : 'Redirecting...'
                  : language === 'zh' ? '管理订阅' : 'Manage subscription'}
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              {language === 'zh' ? '我的核心画像' : 'My core profile'}
            </p>
            {primaryProfile ? (
              <>
                <h3 className="mt-3 text-xl font-semibold">
                  {primaryProfile.displayName ?? primaryProfile.nickname ?? (language === 'zh' ? '主档案' : 'Primary profile')}
                </h3>
                <p className="mt-2 text-sm text-slate-300">
                  {primaryProfile.birthDate}
                  {primaryProfile.birthTime ? ` · ${primaryProfile.birthTime}` : ''}
                  {primaryProfile.birthLocation ? ` · ${primaryProfile.birthLocation}` : ''}
                </p>
                <div className="mt-4 flex items-center gap-3 text-sm text-slate-300">
                  <span className="rounded-full bg-white/10 px-2 py-1">
                    {primaryProfile.profileType === 'self'
                      ? language === 'zh' ? '本人' : 'Self'
                      : language === 'zh' ? '他人' : 'Other'}
                  </span>
                  <span>{primaryProfile.timezone ?? profile?.timezone ?? 'UTC'}</span>
                </div>
                <Link
                  href={`/dashboard/profile/${primaryProfile.id}`}
                  className="mt-5 inline-flex text-sm font-medium text-purple-300 transition hover:text-purple-200"
                >
                  {language === 'zh' ? '打开完整档案 →' : 'Open full profile →'}
                </Link>
              </>
            ) : (
              <>
                <p className="mt-3 text-sm text-slate-300">
                  {language === 'zh'
                    ? '还没有主档案。先补全出生资料，统一画像才能开始聚合。'
                    : 'No primary profile yet. Add your birth details first so aggregation can begin.'}
                </p>
                <Link
                  href="/profile"
                  className="mt-5 inline-flex rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
                >
                  {language === 'zh' ? '创建主档案' : 'Create primary profile'}
                </Link>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              {language === 'zh' ? '当前时间窗口' : 'Current timing window'}
            </p>
            <h3 className="mt-3 text-xl font-semibold">
              {destiny?.timingProfile?.headline ??
                (language === 'zh' ? '等待新的聚合结果' : 'Waiting for the next aggregated signal')}
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              {destiny?.timingProfile?.summary ??
                destiny?.timingProfile?.currentWindow ??
                (language === 'zh'
                  ? '完成 BaZi、Zi Wei、Fortune 或 Relationship 后，这里会自动显示你的时间窗口。'
                  : 'After you complete BaZi, Zi Wei, Fortune, or Relationship, your timing window will appear here automatically.')}
            </p>
            {destiny?.timingProfile?.bestPeriods?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {destiny.timingProfile.bestPeriods.slice(0, 3).map((period) => (
                  <span key={period} className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">
                    {period}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              {language === 'zh' ? '最近一次模块更新' : 'Latest module update'}
            </p>
            {latestHistory ? (
              <>
                <div className="mt-3 flex items-start gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${getModuleMeta(latestHistory.moduleType).gradient}`}>
                    {getModuleMeta(latestHistory.moduleType).emoji}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold">{latestHistory.title}</h3>
                    <p className="mt-1 text-sm text-slate-300">
                      {latestHistory.profileName ??
                        (language === 'zh' ? '默认档案' : 'Default profile')}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      {formatDateTime(latestHistory.createdAt, language)}
                    </p>
                  </div>
                </div>
                <p className="mt-4 line-clamp-3 text-sm text-slate-300">{latestHistory.summary}</p>
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-300">
                {language === 'zh'
                  ? '还没有历史记录。先从四个核心模块里做一次解读。'
                  : 'No history yet. Start with one of the four core modules.'}
              </p>
            )}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                {language === 'zh' ? '四个核心入口' : 'Core entry points'}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {language === 'zh' ? '继续补全你的 Destiny Profile' : 'Keep building your destiny profile'}
              </h2>
            </div>
            <Link href="/readings" className="text-sm text-purple-300 transition hover:text-purple-200">
              {language === 'zh' ? '查看全部历史 →' : 'View all history →'}
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {QUICK_ACTIONS.map((action) => {
              const meta = getModuleMeta(action.moduleType);
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`rounded-2xl bg-gradient-to-br ${meta.gradient} p-5 transition hover:-translate-y-0.5 hover:opacity-95`}
                >
                  <div className="text-3xl">{meta.emoji}</div>
                  <h3 className="mt-4 text-lg font-semibold">
                    {language === 'zh' ? meta.labelZh : meta.label}
                  </h3>
                  <p className="mt-2 text-sm text-white/80">
                    {action.moduleType === 'fortune'
                      ? language === 'zh' ? '补强 timing 层与当前阶段判断。' : 'Strengthen timing signals and current-phase judgment.'
                      : action.moduleType === 'relationship'
                        ? language === 'zh' ? '补强 relationship 层与分享转化面。' : 'Strengthen the relationship layer and share surfaces.'
                        : language === 'zh'
                          ? '为统一画像增加新的基础模块信号。'
                          : 'Add a new foundational signal to the unified profile.'}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                {language === 'zh' ? '命理画像摘要' : 'Destiny profile snapshot'}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {language === 'zh' ? '核心画像与跨模块摘要' : 'Core profile and cross-module summary'}
              </h2>
            </div>
            {destiny?.confidenceScore ? (
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-200">
                {language === 'zh' ? '聚合置信度' : 'Confidence'}: {Math.round(destiny.confidenceScore)}%
              </span>
            ) : null}
          </div>

          {visibleCards.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {visibleCards.map((card) => (
                <div key={card.key} className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{card.key}</p>
                  <h3 className="mt-3 text-lg font-semibold">{card.title ?? (language === 'zh' ? '等待补全' : 'Waiting for more signals')}</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    {card.summary ?? (language === 'zh' ? '完成更多模块后，这一层会自动补齐。' : 'This layer fills in automatically after more module results arrive.')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-slate-950/30 p-6 text-sm text-slate-300">
              {language === 'zh'
                ? '还没有可展示的统一画像摘要。完成至少一个统一模块结果后，这里会自动汇总 identity / timing / relationship 等层。'
                : 'No unified snapshot is ready yet. Once at least one unified module result lands, identity, timing, relationship, and other layers will show up here automatically.'}
            </div>
          )}

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

        {destinyMeta.lockedSections.length > 0 ? (
          <section className="rounded-3xl border border-amber-400/20 bg-amber-500/5 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-amber-300/80">
              {language === 'zh' ? '锁定区' : 'Locked zone'}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              {language === 'zh' ? '还未解锁的高级层' : 'Premium layers still locked'}
            </h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {destinyMeta.lockedSections.map((section) => (
                <span key={section} className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-100">
                  {section}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-300">
              {language === 'zh'
                ? '升级后可查看更深的 relationship / career / wealth / action 层，并在总控台里直接看到完整聚合解释。'
                : 'Upgrade to unlock deeper relationship, career, wealth, and action layers directly inside the cockpit.'}
            </p>
          </section>
        ) : null}

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                {language === 'zh' ? '最近历史记录' : 'Recent history'}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {language === 'zh' ? '模块结果与兼容历史' : 'Module results and compatibility history'}
              </h2>
            </div>
            <span className="text-sm text-slate-400">
              {history.length} {language === 'zh' ? '条记录' : 'records'}
            </span>
          </div>

          {history.length > 0 ? (
            <div className="mt-6 space-y-3">
              {history.slice(0, 6).map((item) => {
                const meta = getModuleMeta(item.moduleType);
                return (
                  <Link
                    key={item.id}
                    href={`/reading/${item.id}`}
                    className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4 transition hover:border-purple-300/30 hover:bg-slate-950/60"
                  >
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.gradient}`}>
                      {meta.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-semibold group-hover:text-purple-200">{item.title}</h3>
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
                      <p className="mt-2 line-clamp-2 text-sm text-slate-300">{item.summary}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span>{language === 'zh' ? meta.labelZh : meta.label}</span>
                        <span>{formatDateTime(item.createdAt, language)}</span>
                        {item.profileName ? <span>{item.profileName}</span> : null}
                        {typeof item.confidenceScore === 'number' ? <span>{Math.round(item.confidenceScore)}%</span> : null}
                      </div>
                    </div>
                    <span className="text-slate-500 transition group-hover:text-white">→</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-slate-950/30 p-6 text-sm text-slate-300">
              {language === 'zh'
                ? '这里会显示旧 readings 兼容历史和新的 unified module results。完成第一条结果后，总控台会自动更新。'
                : 'Legacy readings and new unified module results will appear here together. The cockpit updates automatically after your first result.'}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
