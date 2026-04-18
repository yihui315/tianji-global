'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  getFeatureLabel,
  getPlanBadge,
  getPrimaryProfile,
  type ProfileApiResponse,
} from '@/lib/unified-frontend';
import type { Entitlement } from '@/types/entitlement';
import type { UserProfile } from '@/types/user-profile';

const TIMEZONES = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : ['UTC'];

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

interface ProfileDraft {
  profileType: 'self' | 'other';
  displayName: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  timezone: string;
  language: 'en' | 'zh';
}

function toDraft(profile?: UserProfile | null, timezone = 'UTC', language: 'en' | 'zh' = 'en'): ProfileDraft {
  return {
    profileType: profile?.profileType ?? 'self',
    displayName: profile?.displayName ?? profile?.nickname ?? '',
    birthDate: profile?.birthDate ?? '',
    birthTime: profile?.birthTime ?? '',
    birthLocation: profile?.birthLocation ?? '',
    timezone: profile?.timezone ?? timezone,
    language: profile?.language ?? language,
  };
}

async function parseJson<T>(response: Response): Promise<T | null> {
  if (!response.ok) {
    return null;
  }

  return (await response.json()) as T;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const [account, setAccount] = useState<ProfileApiResponse | null>(null);
  const [accountName, setAccountName] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProfileDraft>(toDraft());
  const [newDraft, setNewDraft] = useState<ProfileDraft>(toDraft());
  const [entitlement, setEntitlement] = useState<Entitlement>(FREE_ENTITLEMENT);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [unifiedReady, setUnifiedReady] = useState(true);
  const [saving, setSaving] = useState<'account' | 'profile' | 'create' | null>(null);
  const [deletingProfileId, setDeletingProfileId] = useState<string | null>(null);

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
        const [accountResponse, profilesResponse, entitlementResponse] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/profiles'),
          fetch('/api/entitlements'),
        ]);

        const accountPayload = await parseJson<ProfileApiResponse>(accountResponse);
        const profilesPayload = await parseJson<{ success: boolean; data: UserProfile[] }>(profilesResponse);
        const entitlementPayload = await parseJson<{ success: boolean; data: Entitlement }>(entitlementResponse);

        if (!active) {
          return;
        }

        const nextProfiles = profilesPayload?.data ?? [];
        const primaryProfile = getPrimaryProfile(nextProfiles);
        const nextLanguage = primaryProfile?.language ?? accountPayload?.language ?? 'en';
        const nextTimezone = accountPayload?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';

        setAccount(accountPayload);
        setAccountName(accountPayload?.name ?? session?.user?.name ?? '');
        setTimezone(nextTimezone);
        setProfiles(nextProfiles);
        setEntitlement(entitlementPayload?.data ?? FREE_ENTITLEMENT);
        setLanguage(nextLanguage);
        setUnifiedReady(profilesResponse.status !== 503 && entitlementResponse.status !== 503);
        setSelectedProfileId(primaryProfile?.id ?? null);
        setDraft(toDraft(primaryProfile, nextTimezone, nextLanguage));
        setNewDraft(toDraft(undefined, nextTimezone, nextLanguage));
      } catch (error) {
        if (active) {
          console.error('[profile] load failed', error);
          setNotice('Failed to load profile data.');
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

  const selectedProfile = profiles.find((item) => item.id === selectedProfileId) ?? null;
  const planBadge = getPlanBadge(entitlement.plan);

  function upsertProfile(profile: UserProfile) {
    const nextProfiles = profiles.some((item) => item.id === profile.id)
      ? profiles.map((item) => (item.id === profile.id ? profile : item))
      : [...profiles, profile];
    const sortedProfiles = nextProfiles.sort((left, right) => Number(right.isPrimary) - Number(left.isPrimary));
    setProfiles(sortedProfiles);
    setSelectedProfileId(profile.id);
    setDraft(toDraft(profile, timezone, profile.language));
  }

  async function saveAccount() {
    setSaving('account');
    setNotice(null);
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: accountName, timezone }),
      });

      if (!response.ok) {
        setNotice('Failed to save account preferences.');
        return;
      }

      setAccount((current) => ({ ...current, name: accountName, timezone }));
      setNotice('Account preferences saved.');
    } catch (error) {
      console.error('[profile] account save failed', error);
      setNotice('Failed to save account preferences.');
    } finally {
      setSaving(null);
    }
  }

  async function saveSelectedProfile() {
    if (!selectedProfileId || !draft.birthDate) {
      setNotice('Birth date is required.');
      return;
    }

    setSaving('profile');
    setNotice(null);
    try {
      const response = await fetch(`/api/profiles/${selectedProfileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileType: draft.profileType,
          displayName: draft.displayName,
          birthDate: draft.birthDate,
          birthTime: draft.birthTime || undefined,
          birthLocation: draft.birthLocation || undefined,
          timezone: draft.timezone,
          language: draft.language,
        }),
      });

      const payload = await parseJson<{ success: boolean; data: UserProfile }>(response);
      if (!payload?.data) {
        setNotice('Failed to save destiny profile.');
        return;
      }

      upsertProfile(payload.data);
      setNotice('Destiny profile saved.');
    } catch (error) {
      console.error('[profile] profile save failed', error);
      setNotice('Failed to save destiny profile.');
    } finally {
      setSaving(null);
    }
  }

  async function createProfile() {
    if (!newDraft.birthDate) {
      setNotice('Birth date is required.');
      return;
    }

    setSaving('create');
    setNotice(null);
    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileType: newDraft.profileType,
          displayName: newDraft.displayName,
          birthDate: newDraft.birthDate,
          birthTime: newDraft.birthTime || undefined,
          birthLocation: newDraft.birthLocation || undefined,
          timezone: newDraft.timezone,
          language: newDraft.language,
          isPrimary: profiles.length === 0,
        }),
      });

      const payload = await parseJson<{ success: boolean; data: UserProfile }>(response);
      if (!payload?.data) {
        setNotice('Failed to create destiny profile.');
        return;
      }

      upsertProfile(payload.data);
      setNewDraft(toDraft(undefined, timezone, language));
      setNotice('New destiny profile created.');
    } catch (error) {
      console.error('[profile] profile creation failed', error);
      setNotice('Failed to create destiny profile.');
    } finally {
      setSaving(null);
    }
  }

  async function makePrimary(profileId: string) {
    setNotice(null);
    try {
      const response = await fetch(`/api/profiles/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPrimary: true }),
      });

      const payload = await parseJson<{ success: boolean; data: UserProfile }>(response);
      if (!payload?.data) {
        setNotice('Failed to change the primary profile.');
        return;
      }

      const nextProfiles = profiles
        .map((item) => ({ ...item, isPrimary: item.id === profileId }))
        .sort((left, right) => Number(right.isPrimary) - Number(left.isPrimary));
      setProfiles(nextProfiles);
      setSelectedProfileId(profileId);
      setDraft(toDraft({ ...payload.data, isPrimary: true }, timezone, payload.data.language));
      setNotice('Primary profile updated.');
    } catch (error) {
      console.error('[profile] primary update failed', error);
      setNotice('Failed to change the primary profile.');
    }
  }

  async function deleteProfile(profileId: string) {
    setDeletingProfileId(profileId);
    setNotice(null);
    try {
      const response = await fetch(`/api/profiles/${profileId}`, { method: 'DELETE' });
      if (!response.ok) {
        setNotice('Failed to delete destiny profile.');
        return;
      }

      const nextProfiles = profiles.filter((item) => item.id !== profileId);
      const nextPrimary = getPrimaryProfile(nextProfiles);
      setProfiles(nextProfiles);
      setSelectedProfileId(nextPrimary?.id ?? null);
      setDraft(toDraft(nextPrimary, timezone, nextPrimary?.language ?? language));
      setNotice('Profile deleted.');
    } catch (error) {
      console.error('[profile] delete failed', error);
      setNotice('Failed to delete destiny profile.');
    } finally {
      setDeletingProfileId(null);
    }
  }

  if (status !== 'authenticated' || !session?.user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-slate-950 to-indigo-950">
        <div className="text-white text-lg">{language === 'zh' ? '正在加载档案中心...' : 'Loading your profile hub...'}</div>
      </div>
    );
  }

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
                {language === 'zh' ? '档案中心' : 'Profile center'}
              </p>
              <h1 className="mt-2 text-3xl font-semibold">
                {language === 'zh' ? '账号偏好与 Destiny Profiles' : 'Account preferences and destiny profiles'}
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

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-8">
        {!unifiedReady ? (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
            {language === 'zh'
              ? '统一档案管理依赖 Supabase。当前账号偏好仍可保存，但多档案与统一画像需要数据库连接。'
              : 'Unified profile management needs Supabase. Account preferences still save, but multi-profile and aggregated destiny views need the database connection.'}
          </div>
        ) : null}

        {notice ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            {notice}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              {language === 'zh' ? '账号偏好' : 'Account preferences'}
            </p>
            <div className="mt-5 flex items-center gap-4">
              {session.user.image ? (
                <img src={session.user.image} alt="Profile avatar" className="h-16 w-16 rounded-full border border-white/15" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-purple-700 text-xl font-semibold">
                  {(session.user.name ?? '?').slice(0, 1)}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-semibold">{session.user.name ?? account?.name ?? 'User'}</h2>
                <p className="text-sm text-slate-300">{session.user.email ?? account?.email}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-400">{language === 'zh' ? '显示名称' : 'Display name'}</span>
                <input
                  value={accountName}
                  onChange={(event) => setAccountName(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-400/40"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-400">{language === 'zh' ? '默认时区' : 'Default timezone'}</span>
                <select
                  value={timezone}
                  onChange={(event) => setTimezone(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-400/40"
                >
                  {TIMEZONES.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={saveAccount}
                disabled={saving === 'account'}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 px-5 py-3 text-sm font-semibold transition hover:opacity-90 disabled:opacity-60"
              >
                {saving === 'account'
                  ? language === 'zh' ? '保存中...' : 'Saving...'
                  : language === 'zh' ? '保存账号偏好' : 'Save account preferences'}
              </button>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                {language === 'zh' ? planBadge.labelZh : planBadge.label}
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              {language === 'zh' ? '权限清单' : 'Entitlements'}
            </p>
            <h2 className="mt-3 text-2xl font-semibold">{language === 'zh' ? planBadge.labelZh : planBadge.label}</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {Object.entries(entitlement.features).map(([feature, enabled]) => (
                <span
                  key={feature}
                  className={`rounded-full px-3 py-1 text-xs ${
                    enabled
                      ? 'border border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
                      : 'border border-white/10 bg-white/5 text-slate-400'
                  }`}
                >
                  {getFeatureLabel(feature as keyof Entitlement['features'], language)}
                </span>
              ))}
            </div>
            <Link href="/pricing" className="mt-5 inline-flex text-sm font-medium text-amber-300 transition hover:text-amber-200">
              {language === 'zh' ? '查看升级路径 →' : 'See upgrade paths →'}
            </Link>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                  {language === 'zh' ? '档案列表' : 'Profile list'}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {language === 'zh' ? '已接入 unified profile' : 'Profiles on the unified layer'}
                </h2>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                {profiles.length} {language === 'zh' ? '个档案' : 'profiles'}
              </span>
            </div>

            {profiles.length > 0 ? (
              <div className="mt-5 space-y-3">
                {profiles.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-4 transition ${
                      selectedProfileId === item.id
                        ? 'border-purple-400/40 bg-purple-500/10'
                        : 'border-white/10 bg-slate-950/35'
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSelectedProfileId(item.id);
                        setDraft(toDraft(item, timezone, item.language));
                      }}
                      className="w-full text-left"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold">{item.displayName ?? item.nickname ?? item.birthDate}</h3>
                        {item.isPrimary ? (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-200">
                            {language === 'zh' ? '主档案' : 'Primary'}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm text-slate-300">
                        {item.birthDate}
                        {item.birthTime ? ` · ${item.birthTime}` : ''}
                        {item.birthLocation ? ` · ${item.birthLocation}` : ''}
                      </p>
                    </button>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      {!item.isPrimary ? (
                        <button
                          onClick={() => void makePrimary(item.id)}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200 transition hover:bg-white/10"
                        >
                          {language === 'zh' ? '设为主档案' : 'Make primary'}
                        </button>
                      ) : null}
                      <Link
                        href={`/dashboard/profile/${item.id}`}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200 transition hover:bg-white/10"
                      >
                        {language === 'zh' ? '打开完整视图' : 'Open full view'}
                      </Link>
                      {!item.isPrimary ? (
                        <button
                          onClick={() => void deleteProfile(item.id)}
                          disabled={deletingProfileId === item.id}
                          className="rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1 text-rose-100 transition hover:bg-rose-500/20 disabled:opacity-60"
                        >
                          {deletingProfileId === item.id
                            ? language === 'zh' ? '删除中...' : 'Deleting...'
                            : language === 'zh' ? '删除' : 'Delete'}
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-white/15 bg-slate-950/30 p-5 text-sm text-slate-300">
                {language === 'zh'
                  ? '还没有任何统一档案。先在右侧创建你的主档案。'
                  : 'No unified profiles yet. Create your primary profile on the right.'}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                {language === 'zh' ? '当前编辑档案' : 'Editing profile'}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {selectedProfile
                  ? selectedProfile.displayName ?? selectedProfile.nickname ?? selectedProfile.birthDate
                  : language === 'zh' ? '还没有已选档案' : 'No profile selected'}
              </h2>

              {selectedProfile ? (
                <>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm text-slate-400">{language === 'zh' ? '档案类型' : 'Profile type'}</span>
                      <select
                        value={draft.profileType}
                        onChange={(event) => setDraft((current) => ({ ...current, profileType: event.target.value as 'self' | 'other' }))}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                      >
                        <option value="self">{language === 'zh' ? '本人' : 'Self'}</option>
                        <option value="other">{language === 'zh' ? '他人' : 'Other'}</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm text-slate-400">{language === 'zh' ? '语言' : 'Language'}</span>
                      <select
                        value={draft.language}
                        onChange={(event) => setDraft((current) => ({ ...current, language: event.target.value as 'en' | 'zh' }))}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                      >
                        <option value="en">English</option>
                        <option value="zh">中文</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm text-slate-400">{language === 'zh' ? '显示名称' : 'Display name'}</span>
                      <input
                        value={draft.displayName}
                        onChange={(event) => setDraft((current) => ({ ...current, displayName: event.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm text-slate-400">{language === 'zh' ? '出生日期' : 'Birth date'}</span>
                      <input
                        type="date"
                        value={draft.birthDate}
                        onChange={(event) => setDraft((current) => ({ ...current, birthDate: event.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm text-slate-400">{language === 'zh' ? '出生时间' : 'Birth time'}</span>
                      <input
                        type="time"
                        value={draft.birthTime}
                        onChange={(event) => setDraft((current) => ({ ...current, birthTime: event.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                      />
                    </label>
                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-sm text-slate-400">{language === 'zh' ? '出生地点' : 'Birth location'}</span>
                      <input
                        value={draft.birthLocation}
                        onChange={(event) => setDraft((current) => ({ ...current, birthLocation: event.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                      />
                    </label>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={saveSelectedProfile}
                      disabled={saving === 'profile'}
                      className="rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 px-5 py-3 text-sm font-semibold transition hover:opacity-90 disabled:opacity-60"
                    >
                      {saving === 'profile'
                        ? language === 'zh' ? '保存中...' : 'Saving...'
                        : language === 'zh' ? '保存档案' : 'Save profile'}
                    </button>
                    <Link
                      href={`/dashboard/profile/${selectedProfile.id}`}
                      className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm transition hover:bg-white/10"
                    >
                      {language === 'zh' ? '查看完整档案' : 'View full destiny profile'}
                    </Link>
                  </div>
                </>
              ) : null}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                {language === 'zh' ? '新增档案' : 'Create new profile'}
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-400">{language === 'zh' ? '档案类型' : 'Profile type'}</span>
                  <select
                    value={newDraft.profileType}
                    onChange={(event) => setNewDraft((current) => ({ ...current, profileType: event.target.value as 'self' | 'other' }))}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                  >
                    <option value="self">{language === 'zh' ? '本人' : 'Self'}</option>
                    <option value="other">{language === 'zh' ? '他人' : 'Other'}</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-400">{language === 'zh' ? '语言' : 'Language'}</span>
                  <select
                    value={newDraft.language}
                    onChange={(event) => setNewDraft((current) => ({ ...current, language: event.target.value as 'en' | 'zh' }))}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                  >
                    <option value="en">English</option>
                    <option value="zh">中文</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-400">{language === 'zh' ? '显示名称' : 'Display name'}</span>
                  <input
                    value={newDraft.displayName}
                    onChange={(event) => setNewDraft((current) => ({ ...current, displayName: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-400">{language === 'zh' ? '出生日期' : 'Birth date'}</span>
                  <input
                    type="date"
                    value={newDraft.birthDate}
                    onChange={(event) => setNewDraft((current) => ({ ...current, birthDate: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-400">{language === 'zh' ? '出生时间' : 'Birth time'}</span>
                  <input
                    type="time"
                    value={newDraft.birthTime}
                    onChange={(event) => setNewDraft((current) => ({ ...current, birthTime: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm text-slate-400">{language === 'zh' ? '出生地点' : 'Birth location'}</span>
                  <input
                    value={newDraft.birthLocation}
                    onChange={(event) => setNewDraft((current) => ({ ...current, birthLocation: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white"
                  />
                </label>
              </div>

              <button
                onClick={createProfile}
                disabled={saving === 'create'}
                className="mt-5 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 px-5 py-3 text-sm font-semibold transition hover:opacity-90 disabled:opacity-60"
              >
                {saving === 'create'
                  ? language === 'zh' ? '创建中...' : 'Creating...'
                  : language === 'zh' ? '创建新档案' : 'Create new profile'}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
