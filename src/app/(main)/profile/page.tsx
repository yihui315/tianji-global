'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { Crown, Lock, Plus, Save, Trash2, UserRound } from 'lucide-react';
import {
  getFeatureLabel,
  getPlanBadge,
  getPrimaryProfile,
  type ProfileApiResponse,
} from '@/lib/unified-frontend';
import { withLanguageParam } from '@/lib/language-routing';
import type { Entitlement } from '@/types/entitlement';
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

const copy = {
  en: {
    nav: {
      compatibility: 'Compatibility',
      loveReading: 'Love Reading',
      timing: 'Timing',
      pricing: 'Pricing',
      history: 'History',
    },
    loading: 'Loading your profile hub...',
    back: 'Back to dashboard',
    eyebrow: 'Private profile center',
    title: 'Account preferences and destiny profiles',
    account: 'Account preferences',
    displayName: 'Display name',
    timezone: 'Default timezone',
    saveAccount: 'Save account preferences',
    saving: 'Saving...',
    entitlements: 'Entitlements',
    upgrade: 'See upgrade paths',
    profileList: 'Profile list',
    profilesOnLayer: 'Profiles on the private layer',
    primary: 'Primary',
    makePrimary: 'Make primary',
    openFull: 'Open full view',
    delete: 'Delete',
    deleting: 'Deleting...',
    editing: 'Editing profile',
    noSelected: 'No profile selected',
    profileType: 'Profile type',
    self: 'Self',
    other: 'Other',
    language: 'Language',
    birthDate: 'Birth date',
    birthTime: 'Birth time',
    birthLocation: 'Birth location',
    saveProfile: 'Save profile',
    viewProfile: 'View full destiny profile',
    create: 'Create new profile',
    createProfile: 'Create new profile',
    creating: 'Creating...',
    noProfiles: 'No private profiles yet. Create your primary profile on the right.',
    supabaseFallback:
      'Unified profile management needs Supabase. Account preferences still save, but multi-profile and aggregated destiny views need the database connection.',
    birthRequired: 'Birth date is required.',
    accountSaved: 'Account preferences saved.',
    accountFailed: 'Failed to save account preferences.',
    profileSaved: 'Destiny profile saved.',
    profileFailed: 'Failed to save destiny profile.',
    profileCreated: 'New destiny profile created.',
    profileCreateFailed: 'Failed to create destiny profile.',
    primaryFailed: 'Failed to change the primary profile.',
    primaryUpdated: 'Primary profile updated.',
    deleted: 'Profile deleted.',
    deleteFailed: 'Failed to delete destiny profile.',
    loadFailed: 'Failed to load profile data.',
    privacyNote:
      'Profile data is private account data. Public share pages do not expose birth date, time, location, or timezone by default.',
  },
  zh: {
    nav: {
      compatibility: '关系合盘',
      loveReading: '爱情解读',
      timing: '时机',
      pricing: '会员权益',
      history: '历史',
    },
    loading: '正在加载你的档案中心...',
    back: '返回控制台',
    eyebrow: '私人档案中心',
    title: '账号偏好与命理档案',
    account: '账号偏好',
    displayName: '显示名称',
    timezone: '默认时区',
    saveAccount: '保存账号偏好',
    saving: '保存中...',
    entitlements: '权益',
    upgrade: '查看升级路径',
    profileList: '档案列表',
    profilesOnLayer: '私人层中的档案',
    primary: '主档案',
    makePrimary: '设为主档案',
    openFull: '打开完整视图',
    delete: '删除',
    deleting: '删除中...',
    editing: '编辑档案',
    noSelected: '尚未选择档案',
    profileType: '档案类型',
    self: '本人',
    other: '他人',
    language: '语言',
    birthDate: '出生日期',
    birthTime: '出生时间',
    birthLocation: '出生地点',
    saveProfile: '保存档案',
    viewProfile: '查看完整命理档案',
    create: '新增档案',
    createProfile: '创建新档案',
    creating: '创建中...',
    noProfiles: '还没有私人档案。先在右侧创建你的主档案。',
    supabaseFallback: '统一档案管理依赖 Supabase。当前账号偏好仍可保存，但多档案与统一画像需要数据库连接。',
    birthRequired: '出生日期为必填项。',
    accountSaved: '账号偏好已保存。',
    accountFailed: '保存账号偏好失败。',
    profileSaved: '命理档案已保存。',
    profileFailed: '保存命理档案失败。',
    profileCreated: '新的命理档案已创建。',
    profileCreateFailed: '创建命理档案失败。',
    primaryFailed: '切换主档案失败。',
    primaryUpdated: '主档案已更新。',
    deleted: '档案已删除。',
    deleteFailed: '删除命理档案失败。',
    loadFailed: '加载档案数据失败。',
    privacyNote: '档案数据是私人账号数据。公开分享页默认不展示出生日期、时间、地点或时区。',
  },
} as const;

type ProfileCopy = (typeof copy)[keyof typeof copy];

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

  const t = copy[language];
  const planBadge = getPlanBadge(entitlement.plan);
  const selectedProfile = profiles.find((item) => item.id === selectedProfileId) ?? null;
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
        setNotice(t.accountFailed);
        return;
      }

      setAccount((current) => ({ ...(current ?? {}), name: accountName, timezone }));
      setNotice(t.accountSaved);
    } catch (error) {
      console.error('[profile] account save failed', error);
      setNotice(t.accountFailed);
    } finally {
      setSaving(null);
    }
  }

  async function saveSelectedProfile() {
    if (!selectedProfileId || !draft.birthDate) {
      setNotice(t.birthRequired);
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
        setNotice(t.profileFailed);
        return;
      }

      upsertProfile(payload.data);
      setNotice(t.profileSaved);
    } catch (error) {
      console.error('[profile] profile save failed', error);
      setNotice(t.profileFailed);
    } finally {
      setSaving(null);
    }
  }

  async function createProfile() {
    if (!newDraft.birthDate) {
      setNotice(t.birthRequired);
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
        setNotice(t.profileCreateFailed);
        return;
      }

      upsertProfile(payload.data);
      setNewDraft(toDraft(undefined, timezone, language));
      setNotice(t.profileCreated);
    } catch (error) {
      console.error('[profile] profile creation failed', error);
      setNotice(t.profileCreateFailed);
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
        setNotice(t.primaryFailed);
        return;
      }

      const nextProfiles = profiles
        .map((item) => ({ ...item, isPrimary: item.id === profileId }))
        .sort((left, right) => Number(right.isPrimary) - Number(left.isPrimary));
      setProfiles(nextProfiles);
      setSelectedProfileId(profileId);
      setDraft(toDraft({ ...payload.data, isPrimary: true }, timezone, payload.data.language));
      setNotice(t.primaryUpdated);
    } catch (error) {
      console.error('[profile] primary update failed', error);
      setNotice(t.primaryFailed);
    }
  }

  async function deleteProfile(profileId: string) {
    setDeletingProfileId(profileId);
    setNotice(null);
    try {
      const response = await fetch(`/api/profiles/${profileId}`, { method: 'DELETE' });
      if (!response.ok) {
        setNotice(t.deleteFailed);
        return;
      }

      const nextProfiles = profiles.filter((item) => item.id !== profileId);
      const nextPrimary = getPrimaryProfile(nextProfiles);
      setProfiles(nextProfiles);
      setSelectedProfileId(nextPrimary?.id ?? null);
      setDraft(toDraft(nextPrimary, timezone, nextPrimary?.language ?? language));
      setNotice(t.deleted);
    } catch (error) {
      console.error('[profile] delete failed', error);
      setNotice(t.deleteFailed);
    } finally {
      setDeletingProfileId(null);
    }
  }

  if (status !== 'authenticated' || !session?.user || loading) {
    return (
      <TianjiLoveShell className="tianji-love-profile-loading">
        <div className="relative z-10 flex min-h-screen items-center justify-center text-[#ffe3b4]">{t.loading}</div>
      </TianjiLoveShell>
    );
  }

  return (
    <TianjiLoveShell className="tianji-love-profile-page" ariaLabel="Tianji Love profile center">
      <TianjiLoveHeader
        homeHref={href('/')}
        navItems={getTianjiLovePrimaryNav(language, href)}
        cta={getTianjiLovePrimaryCta(language, href)}
        languageLabel={language === 'zh' ? 'EN' : '中文'}
        onLanguageToggle={toggleLanguage}
      />

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-7 px-5 py-10 sm:px-8">
        <Link href="/dashboard" className="inline-flex w-fit text-sm text-[#d8b77b] transition hover:text-[#ffe3b4]">
          {t.back}
        </Link>

        <section>
          <p className="mb-5 text-xs uppercase tracking-[0.32em] text-[#d8b77b]/70">{t.eyebrow}</p>
          <h1 className="max-w-4xl font-serif text-4xl font-semibold leading-tight text-[#ffe3b4] sm:text-5xl">{t.title}</h1>
        </section>

        {!unifiedReady ? (
          <div className="rounded-lg border border-[#d8b77b]/32 bg-[#d8b77b]/10 px-5 py-4 text-sm leading-6 text-[#ffe3b4]">
            {t.supabaseFallback}
          </div>
        ) : null}

        {notice ? (
          <div className="rounded-lg border border-[#ff9c8b]/34 bg-[#ff6c73]/10 px-5 py-4 text-sm text-[#ffd0c9]">
            {notice}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <TianjiLovePanel className="p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-[#d8b77b]/62">{t.account}</p>
            <div className="mt-5 flex items-center gap-4">
              {session.user.image ? (
                <Image src={session.user.image} alt="Profile avatar" width={64} height={64} unoptimized className="h-16 w-16 rounded-lg object-cover" />
              ) : (
                <div className="grid h-16 w-16 place-items-center rounded-lg border border-[#b57248]/32 bg-[#070b16]/70 text-xl font-semibold text-[#ffe3b4]">
                  {(session.user.name ?? '?').slice(0, 1)}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-semibold text-[#ffe3b4]">{session.user.name ?? account?.name ?? 'User'}</h2>
                <p className="text-sm text-[#f4d7a3]/58">{session.user.email ?? account?.email}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label={t.displayName}>
                <input value={accountName} onChange={(event) => setAccountName(event.target.value)} className="tianji-love-field-input w-full rounded-lg border px-4 py-3 text-sm outline-none" />
              </Field>
              <Field label={t.timezone}>
                <select value={timezone} onChange={(event) => setTimezone(event.target.value)} className="tianji-love-field-input w-full rounded-lg border px-4 py-3 text-sm outline-none">
                  {TIMEZONES.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
                </select>
              </Field>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button type="button" onClick={saveAccount} disabled={saving === 'account'} className="tianji-love-primary inline-flex min-h-12 items-center gap-2 rounded-lg border border-[#ffb49e]/60 px-5 text-sm font-semibold text-[#fff7e6] disabled:opacity-60">
                <Save className="h-4 w-4" aria-hidden />
                {saving === 'account' ? t.saving : t.saveAccount}
              </button>
              <span className="rounded-full border border-[#b57248]/32 bg-[#070b16]/64 px-3 py-1 text-xs text-[#f4d7a3]/72">
                {language === 'zh' ? planBadge.labelZh : planBadge.label}
              </span>
            </div>
          </TianjiLovePanel>

          <TianjiLovePanel className="p-6">
            <Crown className="mb-3 h-6 w-6 text-[#d8b77b]" aria-hidden />
            <p className="text-xs uppercase tracking-[0.24em] text-[#d8b77b]/62">{t.entitlements}</p>
            <h2 className="mt-3 font-serif text-3xl text-[#ffe3b4]">{language === 'zh' ? planBadge.labelZh : planBadge.label}</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {Object.entries(entitlement.features).map(([feature, enabled]) => (
                <span key={feature} className={`rounded-full border px-3 py-1 text-xs ${enabled ? 'border-[#d8b77b]/34 bg-[#d8b77b]/10 text-[#ffe3b4]' : 'border-[#b57248]/24 bg-[#070b16]/52 text-[#f4d7a3]/46'}`}>
                  {getFeatureLabel(feature as keyof Entitlement['features'], language)}
                </span>
              ))}
            </div>
            <Link href={href('/pricing')} className="mt-5 inline-flex text-sm font-medium text-[#d8b77b] transition hover:text-[#ffe3b4]">
              {t.upgrade}
            </Link>
          </TianjiLovePanel>
        </section>

        <TianjiLoveSectionTitle title={t.profileList} />
        <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <TianjiLovePanel className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#d8b77b]/62">{t.profilesOnLayer}</p>
                <h2 className="mt-2 font-serif text-2xl text-[#ffe3b4]">{profiles.length} {language === 'zh' ? '个档案' : 'profiles'}</h2>
              </div>
              <UserRound className="h-6 w-6 text-[#d8b77b]" aria-hidden />
            </div>

            {profiles.length > 0 ? (
              <div className="mt-5 space-y-3">
                {profiles.map((item) => (
                  <div key={item.id} className={`rounded-lg border p-4 transition ${selectedProfileId === item.id ? 'border-[#ffb49e]/50 bg-[#ff6c73]/10' : 'border-[#b57248]/28 bg-[#070b16]/54'}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProfileId(item.id);
                        setDraft(toDraft(item, timezone, item.language));
                      }}
                      className="w-full text-left"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-[#ffe3b4]">{item.displayName ?? item.nickname ?? item.birthDate}</h3>
                        {item.isPrimary ? <Badge>{t.primary}</Badge> : null}
                      </div>
                      <p className="mt-2 text-sm text-[#f4d7a3]/58">
                        {item.birthDate}
                        {item.birthTime ? ` / ${item.birthTime}` : ''}
                        {item.birthLocation ? ` / ${item.birthLocation}` : ''}
                      </p>
                    </button>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      {!item.isPrimary ? <SmallButton onClick={() => void makePrimary(item.id)}>{t.makePrimary}</SmallButton> : null}
                      <Link href={`/dashboard/profile/${item.id}`} className="rounded-lg border border-[#b57248]/30 bg-[#070b16]/60 px-3 py-1 text-[#f4d7a3]/72 transition hover:border-[#ffe3b4]/44">
                        {t.openFull}
                      </Link>
                      {!item.isPrimary ? (
                        <SmallButton onClick={() => void deleteProfile(item.id)} danger disabled={deletingProfileId === item.id}>
                          {deletingProfileId === item.id ? t.deleting : t.delete}
                        </SmallButton>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-lg border border-dashed border-[#b57248]/34 bg-[#070b16]/42 p-5 text-sm text-[#f4d7a3]/62">
                {t.noProfiles}
              </div>
            )}
          </TianjiLovePanel>

          <div className="grid gap-6">
            <ProfileEditor
              title={t.editing}
              draft={draft}
              setDraft={setDraft}
              disabled={!selectedProfile}
              emptyLabel={t.noSelected}
              copy={t}
              onSubmit={saveSelectedProfile}
              submitLabel={saving === 'profile' ? t.saving : t.saveProfile}
              secondary={selectedProfile ? { label: t.viewProfile, href: `/dashboard/profile/${selectedProfile.id}` } : undefined}
            />

            <ProfileEditor
              title={t.create}
              draft={newDraft}
              setDraft={setNewDraft}
              copy={t}
              onSubmit={createProfile}
              submitLabel={saving === 'create' ? t.creating : t.createProfile}
              create
            />
          </div>
        </section>

        <TianjiLovePanel className="p-5">
          <Lock className="mb-3 h-5 w-5 text-[#d8b77b]" aria-hidden />
          <p className="text-sm leading-7 text-[#f4d7a3]/70">{t.privacyNote}</p>
        </TianjiLovePanel>
      </main>

      <TianjiLoveFooter
        homeHref={href('/')}
        disclaimer={t.privacyNote}
        links={getTianjiLoveFooterNav(language, href)}
      />
    </TianjiLoveShell>
  );
}

function ProfileEditor({
  title,
  draft,
  setDraft,
  copy,
  onSubmit,
  submitLabel,
  disabled,
  emptyLabel,
  secondary,
}: {
  title: string;
  draft: ProfileDraft;
  setDraft: Dispatch<SetStateAction<ProfileDraft>>;
  copy: ProfileCopy;
  onSubmit: () => void;
  submitLabel: string;
  disabled?: boolean;
  emptyLabel?: string;
  create?: boolean;
  secondary?: { label: string; href: string };
}) {
  return (
    <TianjiLovePanel className="p-6">
      <p className="text-xs uppercase tracking-[0.24em] text-[#d8b77b]/62">{title}</p>
      {disabled ? <h2 className="mt-2 font-serif text-2xl text-[#ffe3b4]">{emptyLabel}</h2> : null}
      {!disabled ? (
        <>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label={copy.profileType}>
              <select value={draft.profileType} onChange={(event) => setDraft((current) => ({ ...current, profileType: event.target.value as 'self' | 'other' }))} className="tianji-love-field-input w-full rounded-lg border px-4 py-3 text-sm">
                <option value="self">{copy.self}</option>
                <option value="other">{copy.other}</option>
              </select>
            </Field>
            <Field label={copy.language}>
              <select value={draft.language} onChange={(event) => setDraft((current) => ({ ...current, language: event.target.value as 'en' | 'zh' }))} className="tianji-love-field-input w-full rounded-lg border px-4 py-3 text-sm">
                <option value="en">English</option>
                <option value="zh">中文</option>
              </select>
            </Field>
            <Field label={copy.displayName}>
              <input value={draft.displayName} onChange={(event) => setDraft((current) => ({ ...current, displayName: event.target.value }))} className="tianji-love-field-input w-full rounded-lg border px-4 py-3 text-sm" />
            </Field>
            <Field label={copy.birthDate}>
              <input type="date" value={draft.birthDate} onChange={(event) => setDraft((current) => ({ ...current, birthDate: event.target.value }))} className="tianji-love-field-input w-full rounded-lg border px-4 py-3 text-sm" />
            </Field>
            <Field label={copy.birthTime}>
              <input type="time" value={draft.birthTime} onChange={(event) => setDraft((current) => ({ ...current, birthTime: event.target.value }))} className="tianji-love-field-input w-full rounded-lg border px-4 py-3 text-sm" />
            </Field>
            <Field label={copy.birthLocation}>
              <input value={draft.birthLocation} onChange={(event) => setDraft((current) => ({ ...current, birthLocation: event.target.value }))} className="tianji-love-field-input w-full rounded-lg border px-4 py-3 text-sm" />
            </Field>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={onSubmit} className="tianji-love-primary inline-flex min-h-12 items-center gap-2 rounded-lg border border-[#ffb49e]/60 px-5 text-sm font-semibold text-[#fff7e6]">
              <Plus className="h-4 w-4" aria-hidden />
              {submitLabel}
            </button>
            {secondary ? (
              <Link href={secondary.href} className="inline-flex min-h-12 items-center rounded-lg border border-[#b57248]/36 bg-[#070b16]/64 px-5 text-sm text-[#ffe3b4] transition hover:border-[#ffe3b4]/50">
                {secondary.label}
              </Link>
            ) : null}
          </div>
        </>
      ) : null}
    </TianjiLovePanel>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-[#f4d7a3]/62">{label}</span>
      {children}
    </label>
  );
}

function SmallButton({
  children,
  onClick,
  danger,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1 transition disabled:opacity-60 ${
        danger
          ? 'border-[#ff8f87]/28 bg-[#3d0f17]/30 text-[#ffd0c9]'
          : 'border-[#b57248]/30 bg-[#070b16]/60 text-[#f4d7a3]/72 hover:border-[#ffe3b4]/44'
      }`}
    >
      {danger ? <Trash2 className="h-3.5 w-3.5" aria-hidden /> : null}
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
