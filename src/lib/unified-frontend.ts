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
  western: { label: 'Western Astrology', labelZh: '西方占星', color: 'text-[#d8b77b]', emoji: 'A', gradient: 'from-[#7b3f33] to-[#2f1018]' },
  bazi: { label: 'BaZi', labelZh: '八字', color: 'text-[#d8b77b]', emoji: 'B', gradient: 'from-[#8a5a2c] to-[#24150b]' },
  ziwei: { label: 'Zi Wei', labelZh: '紫微斗数', color: 'text-[#d8b77b]', emoji: 'Z', gradient: 'from-[#6c4b8f] to-[#1b102b]' },
  numerology: { label: 'Numerology', labelZh: '数字命理', color: 'text-[#d8b77b]', emoji: '#', gradient: 'from-[#7a4b69] to-[#24101c]' },
  fortune: { label: 'Fortune Timeline', labelZh: '运势时间线', color: 'text-[#d8b77b]', emoji: 'T', gradient: 'from-[#4f6b48] to-[#0e1a10]' },
  relationship: { label: 'Relationship', labelZh: '关系合盘', color: 'text-[#ff9c8b]', emoji: 'L', gradient: 'from-[#9d3e44] to-[#2a0c13]' },
  tarot: { label: 'Tarot', labelZh: '塔罗', color: 'text-[#d8b77b]', emoji: 'R', gradient: 'from-[#724466] to-[#1b0d1c]' },
  yijing: { label: 'Yi Jing', labelZh: '易经', color: 'text-[#d8b77b]', emoji: 'Y', gradient: 'from-[#526047] to-[#11180d]' },
  fengshui: { label: 'Feng Shui', labelZh: '风水', color: 'text-[#d8b77b]', emoji: 'F', gradient: 'from-[#3f665e] to-[#0e1917]' },
  electional: { label: 'Electional', labelZh: '择日', color: 'text-[#d8b77b]', emoji: 'E', gradient: 'from-[#4f5c75] to-[#10131d]' },
  transit: { label: 'Transit', labelZh: '行运', color: 'text-[#d8b77b]', emoji: 'O', gradient: 'from-[#485d78] to-[#0f141e]' },
  'solar-return': { label: 'Solar Return', labelZh: '太阳回归', color: 'text-[#d8b77b]', emoji: 'S', gradient: 'from-[#87603b] to-[#24150a]' },
};

export const FALLBACK_MODULE_META: ModuleMeta = {
  label: 'Reading',
  labelZh: '解读',
  color: 'text-[#d8b77b]',
  emoji: 'R',
  gradient: 'from-[#6f5034] to-[#16100b]',
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
