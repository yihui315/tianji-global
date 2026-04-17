import type { Entitlement } from '@/types/entitlement';
import type { ModuleResult } from '@/types/module-result';
import type { DestinyProfile } from '@/types/unified-profile';
import type { UserProfile } from '@/types/user-profile';

export interface LegacyReadingSummary {
  id: string;
  reading_type: string;
  title: string;
  summary: string;
  created_at: string;
}

export interface ProfileApiResponse {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  timezone?: string | null;
  language?: 'en' | 'zh';
}

export interface HistoryItem {
  id: string;
  moduleType: string;
  title: string;
  summary: string;
  createdAt: string;
  profileId?: string;
  profileName?: string;
  confidenceScore?: number;
  isPremium?: boolean;
  kind: 'unified' | 'legacy';
}

export interface ModuleMeta {
  label: string;
  labelZh: string;
  color: string;
  emoji: string;
  gradient: string;
}

export interface DestinyResponseMeta {
  plan: Entitlement['plan'];
  visibleSections: string[];
  lockedSections: string[];
}

export const MODULE_META: Record<string, ModuleMeta> = {
  western: { label: 'Western', labelZh: '西洋占星', color: 'text-blue-300', emoji: '✦', gradient: 'from-blue-600 to-blue-800' },
  bazi: { label: 'BaZi', labelZh: '八字', color: 'text-amber-300', emoji: '☯', gradient: 'from-amber-600 to-amber-800' },
  ziwei: { label: 'Zi Wei', labelZh: '紫微斗数', color: 'text-purple-300', emoji: '✺', gradient: 'from-purple-600 to-purple-800' },
  numerology: { label: 'Numerology', labelZh: '数字命理', color: 'text-fuchsia-300', emoji: '#', gradient: 'from-fuchsia-600 to-fuchsia-800' },
  fortune: { label: 'Fortune Timeline', labelZh: '运势时间线', color: 'text-emerald-300', emoji: '⏳', gradient: 'from-emerald-600 to-emerald-800' },
  relationship: { label: 'Relationship', labelZh: '关系合盘', color: 'text-rose-300', emoji: '❤', gradient: 'from-rose-600 to-rose-800' },
  tarot: { label: 'Tarot', labelZh: '塔罗', color: 'text-pink-300', emoji: '🜁', gradient: 'from-pink-600 to-pink-800' },
  yijing: { label: 'Yi Jing', labelZh: '易经', color: 'text-emerald-300', emoji: '☰', gradient: 'from-emerald-600 to-emerald-800' },
  fengshui: { label: 'Feng Shui', labelZh: '风水', color: 'text-teal-300', emoji: '⌂', gradient: 'from-teal-600 to-teal-800' },
  electional: { label: 'Electional', labelZh: '择日', color: 'text-cyan-300', emoji: '✧', gradient: 'from-cyan-600 to-cyan-800' },
  transit: { label: 'Transit', labelZh: '行运', color: 'text-sky-300', emoji: '☄', gradient: 'from-sky-600 to-sky-800' },
  'solar-return': { label: 'Solar Return', labelZh: '太阳回归', color: 'text-orange-300', emoji: '☼', gradient: 'from-orange-600 to-orange-800' },
};

export const FALLBACK_MODULE_META: ModuleMeta = {
  label: 'Reading',
  labelZh: '解读',
  color: 'text-slate-300',
  emoji: '✦',
  gradient: 'from-slate-600 to-slate-800',
};

export function getModuleMeta(moduleType: string): ModuleMeta {
  return MODULE_META[moduleType] ?? FALLBACK_MODULE_META;
}

export function formatDateTime(value: string, language: 'zh' | 'en'): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  if (language === 'zh') {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getProfileDisplayName(profile?: Pick<UserProfile, 'displayName' | 'nickname'> | null): string | undefined {
  return profile?.displayName ?? profile?.nickname ?? undefined;
}

export function getPrimaryProfile(profiles: UserProfile[]): UserProfile | null {
  return profiles.find((profile) => profile.isPrimary) ?? profiles[0] ?? null;
}

export function getResultSummary(result: ModuleResult): string {
  return (
    result.summary ??
    result.normalizedPayload.summary.oneLiner ??
    result.normalizedPayload.identity?.summary ??
    result.normalizedPayload.relationship?.summary ??
    result.normalizedPayload.career?.summary ??
    ''
  );
}

export function buildHistoryItems(
  results: ModuleResult[],
  readings: LegacyReadingSummary[],
  profiles: UserProfile[]
): HistoryItem[] {
  if (results.length > 0) {
    return results
      .map((result) => {
        const profile = profiles.find((item) => item.id === result.profileId);

        return {
          id: result.id,
          moduleType: result.moduleType,
          title: result.title ?? `${getModuleMeta(result.moduleType).label} Reading`,
          summary: getResultSummary(result),
          createdAt: result.createdAt,
          profileId: result.profileId,
          profileName: getProfileDisplayName(profile),
          confidenceScore: result.confidenceScore,
          isPremium: result.isPremium,
          kind: 'unified' as const,
        };
      })
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
  }

  return readings
    .map((reading) => ({
      id: reading.id,
      moduleType: reading.reading_type,
      title: reading.title,
      summary: reading.summary,
      createdAt: reading.created_at,
      kind: 'legacy' as const,
    }))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

export function getPlanBadge(plan: Entitlement['plan']): { label: string; labelZh: string } {
  if (plan === 'pro') {
    return { label: 'Pro', labelZh: '专业版' };
  }

  if (plan === 'premium') {
    return { label: 'Premium', labelZh: '高级版' };
  }

  return { label: 'Free', labelZh: '免费版' };
}

export function getVisibleSectionCards(profile: Partial<DestinyProfile>) {
  return [
    { key: 'identity', title: profile.identitySummary?.headline, summary: profile.identitySummary?.summary },
    { key: 'relationship', title: profile.relationshipProfile?.headline, summary: profile.relationshipProfile?.summary },
    { key: 'career', title: profile.careerProfile?.headline, summary: profile.careerProfile?.summary },
    { key: 'wealth', title: profile.wealthProfile?.headline, summary: profile.wealthProfile?.summary },
    {
      key: 'timing',
      title: profile.timingProfile?.headline,
      summary: profile.timingProfile?.summary ?? profile.timingProfile?.currentWindow,
    },
    { key: 'actions', title: profile.actionProfile?.headline, summary: profile.actionProfile?.summary },
  ].filter((item) => item.title || item.summary);
}

export function getFeatureLabel(feature: keyof Entitlement['features'], language: 'zh' | 'en') {
  const labels: Record<keyof Entitlement['features'], { en: string; zh: string }> = {
    unifiedProfile: { en: 'Unified destiny profile', zh: '统一命理画像' },
    deepRelationship: { en: 'Deep relationship reading', zh: '深度关系解读' },
    longTimeline: { en: 'Extended timeline', zh: '长周期时间线' },
    premiumAdvice: { en: 'Premium action guidance', zh: '高级行动建议' },
    exportPdf: { en: 'PDF export', zh: 'PDF 导出' },
    multiProfile: { en: 'Multi-profile management', zh: '多档案管理' },
    advisorMode: { en: 'Advisor mode', zh: '顾问模式' },
  };

  return language === 'zh' ? labels[feature].zh : labels[feature].en;
}
