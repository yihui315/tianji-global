'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, Clock, Lock, Sparkles } from 'lucide-react';
import { formatDateTime, getModuleMeta, type LegacyReadingSummary } from '@/lib/unified-frontend';
import { withLanguageParam } from '@/lib/language-routing';
import type { ModuleResult, UnifiedSection } from '@/types/module-result';
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

interface LegacyReadingDetail extends LegacyReadingSummary {
  reading_data?: Record<string, unknown>;
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

const copy = {
  en: {
    nav: {
      compatibility: 'Compatibility',
      loveReading: 'Love Reading',
      timing: 'Timing',
      pricing: 'Pricing',
      history: 'History',
    },
    loading: 'Loading reading detail...',
    notFound: 'Reading not found',
    removed: 'This record may have been removed.',
    back: 'Back to history',
    eyebrow: 'Private reading detail',
    openProfile: 'Open linked destiny profile',
    keywords: 'Signals',
    timeline: 'Timeline',
    legacyTitle: 'Legacy reading detail',
    legacyBody:
      'This record came from the legacy readings interface. It stays available while the unified report model continues to absorb older results.',
    awaiting: 'Awaiting more signals',
    awaitingBody: 'This layer is waiting for more module results.',
    strengths: 'Strengths',
    advice: 'Advice',
    privacy:
      'This is private account content. Public share pages still hide birth date, time, location, and timezone by default.',
  },
  zh: {
    nav: {
      compatibility: '关系合盘',
      loveReading: '爱情解读',
      timing: '时机',
      pricing: '会员权益',
      history: '历史',
    },
    loading: '正在加载解读详情...',
    notFound: '未找到解读结果',
    removed: '这条记录可能已被删除。',
    back: '返回历史页',
    eyebrow: '私人解读详情',
    openProfile: '打开对应命理档案',
    keywords: '信号',
    timeline: '时间线',
    legacyTitle: '旧版解读详情',
    legacyBody: '这条记录来自旧 readings 接口。在统一报告模型继续吸收旧结果时，它仍然可用。',
    awaiting: '等待更多信号',
    awaitingBody: '这一层正在等待更多模块结果。',
    strengths: '优势',
    advice: '建议',
    privacy: '这是私人账号内容。公开分享页默认仍隐藏出生日期、时间、地点和时区。',
  },
} as const;

export default function ReadingDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const [reading, setReading] = useState<ModuleResult | LegacyReadingDetail | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const t = copy[language];
  const href = (path: string) => withLanguageParam(path, language);
  const toggleLanguage = () => setLanguage(language === 'zh' ? 'en' : 'zh');

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
        const nextLanguage = accountPayload?.language ?? 'en';
        setReading(nextReading);
        setLanguage(nextLanguage);

        if (isUnifiedResult(nextReading)) {
          const ownerProfile = (profilesPayload?.data ?? []).find((item) => item.id === nextReading.profileId) ?? null;
          setProfile(ownerProfile);
        } else {
          setProfile(null);
        }

        if (!nextReading) {
          setNotice(copy[nextLanguage].notFound);
        }
      } catch (error) {
        if (active) {
          console.error('[reading] detail load failed', error);
          setNotice(copy[language].notFound);
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
  }, [language, params?.id, session?.user, status]);

  if (status !== 'authenticated' || !session?.user || loading) {
    return (
      <TianjiLoveShell className="tianji-love-reading-loading">
        <div className="relative z-10 flex min-h-screen items-center justify-center text-[#ffe3b4]">{t.loading}</div>
      </TianjiLoveShell>
    );
  }

  if (!reading) {
    return (
      <ReadingShell language={language} toggleLanguage={toggleLanguage}>
        <section className="relative z-10 mx-auto flex min-h-[calc(100vh-92px)] w-full max-w-3xl items-center px-5 py-16 sm:px-8">
          <TianjiLovePanel className="w-full p-8 text-center">
            <h1 className="font-serif text-3xl text-[#ffe3b4]">{t.notFound}</h1>
            <p className="mt-3 text-sm leading-7 text-[#f4d7a3]/66">{notice ?? t.removed}</p>
            <TianjiLoveButton href={href('/readings')} className="mt-6">{t.back}</TianjiLoveButton>
          </TianjiLovePanel>
        </section>
      </ReadingShell>
    );
  }

  const unified = isUnifiedResult(reading);
  const moduleType = unified ? reading.moduleType : reading.reading_type;
  const meta = getModuleMeta(moduleType);
  const createdAt = unified ? reading.createdAt : reading.created_at;
  const summary = unified
    ? reading.summary ?? reading.normalizedPayload.summary.oneLiner ?? reading.normalizedPayload.summary.headline
    : reading.summary;
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
    <ReadingShell language={language} toggleLanguage={toggleLanguage}>
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 sm:px-8">
        <Link href={href('/readings')} className="inline-flex w-fit items-center gap-2 text-sm text-[#d8b77b] transition hover:text-[#ffe3b4]">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t.back}
        </Link>

        {notice ? (
          <div className="rounded-lg border border-[#ff9c8b]/34 bg-[#ff6c73]/10 px-5 py-4 text-sm text-[#ffd0c9]">
            {notice}
          </div>
        ) : null}

        <TianjiLovePanel className="p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${meta.gradient} text-xl font-semibold text-[#ffe3b4]`}>
                {meta.emoji}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-[#d8b77b]/62">{t.eyebrow}</p>
                <h1 className="mt-2 font-serif text-4xl font-semibold leading-tight text-[#ffe3b4]">{reading.title}</h1>
                <p className="mt-3 text-sm text-[#f4d7a3]/58">
                  {language === 'zh' ? meta.labelZh : meta.label} / {formatDateTime(createdAt, language)}
                  {profile ? ` / ${profile.displayName ?? profile.nickname ?? profile.birthDate}` : ''}
                </p>
                <p className="mt-5 max-w-3xl text-base leading-8 text-[#fff4dd]/82">{summary}</p>
              </div>
            </div>

            {unified && profile ? (
              <Link href={`/dashboard/profile/${reading.profileId}`} className="rounded-lg border border-[#b57248]/36 bg-[#070b16]/64 px-4 py-2 text-sm text-[#ffe3b4] transition hover:border-[#ffe3b4]/50">
                {t.openProfile}
              </Link>
            ) : null}
          </div>

          {unified && reading.normalizedPayload.summary.keywords?.length ? (
            <div className="mt-6">
              <p className="mb-3 text-xs uppercase tracking-[0.24em] text-[#d8b77b]/58">{t.keywords}</p>
              <div className="flex flex-wrap gap-2">
                {reading.normalizedPayload.summary.keywords.map((keyword) => (
                  <span key={keyword} className="rounded-full border border-[#d8b77b]/24 bg-[#d8b77b]/10 px-3 py-1 text-xs text-[#ffe3b4]">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </TianjiLovePanel>

        {unified ? (
          <>
            <section className="grid gap-4 md:grid-cols-2">
              {sections.filter((item) => hasSectionContent(item.section)).map((item) => (
                <SectionCard key={item.key} label={item.key} section={item.section} language={language} />
              ))}
            </section>

            {reading.normalizedPayload.timeline?.phases?.length ? (
              <TianjiLovePanel className="p-6">
                <Clock className="mb-3 h-5 w-5 text-[#d8b77b]" aria-hidden />
                <h2 className="font-serif text-2xl text-[#ffe3b4]">{t.timeline}</h2>
                <div className="mt-5 space-y-3">
                  {reading.normalizedPayload.timeline.phases.map((phase) => (
                    <div key={`${phase.range}-${phase.label}`} className="rounded-lg border border-[#b57248]/24 bg-[#070b16]/56 p-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-[#d8b77b]/24 bg-[#d8b77b]/10 px-3 py-1 text-xs text-[#ffe3b4]">{phase.range}</span>
                        <h3 className="text-base font-semibold text-[#ffe3b4]">{phase.label}</h3>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#f4d7a3]/66">{phase.description}</p>
                    </div>
                  ))}
                </div>
              </TianjiLovePanel>
            ) : null}
          </>
        ) : (
          <TianjiLovePanel className="p-6">
            <h2 className="font-serif text-2xl text-[#ffe3b4]">{t.legacyTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-[#f4d7a3]/66">{t.legacyBody}</p>
          </TianjiLovePanel>
        )}

        <TianjiLovePanel className="p-5">
          <Lock className="mb-3 h-5 w-5 text-[#d8b77b]" aria-hidden />
          <p className="text-sm leading-7 text-[#f4d7a3]/70">{t.privacy}</p>
        </TianjiLovePanel>
      </main>
    </ReadingShell>
  );
}

function ReadingShell({
  children,
  language,
  toggleLanguage,
}: {
  children: ReactNode;
  language: 'en' | 'zh';
  toggleLanguage: () => void;
}) {
  const t = copy[language];
  const href = (path: string) => withLanguageParam(path, language);

  return (
    <TianjiLoveShell className="tianji-love-reading-detail-page" ariaLabel="Tianji Love reading detail">
      <TianjiLoveHeader
        homeHref={href('/')}
        navItems={getTianjiLovePrimaryNav(language, href)}
        cta={getTianjiLovePrimaryCta(language, href)}
        languageLabel={language === 'zh' ? 'EN' : '中文'}
        onLanguageToggle={toggleLanguage}
      />
      {children}
      <TianjiLoveFooter
        homeHref={href('/')}
        disclaimer={t.privacy}
        links={getTianjiLoveFooterNav(language, href)}
      />
    </TianjiLoveShell>
  );
}

function SectionCard({
  label,
  section,
  language,
}: {
  label: string;
  section?: UnifiedSection;
  language: 'en' | 'zh';
}) {
  const t = copy[language];

  return (
    <TianjiLovePanel as="article" className="p-6">
      <p className="text-xs uppercase tracking-[0.24em] text-[#d8b77b]/58">{label}</p>
      <h2 className="mt-2 font-serif text-2xl text-[#ffe3b4]">{section?.headline ?? t.awaiting}</h2>
      <p className="mt-3 text-sm leading-7 text-[#f4d7a3]/66">{section?.summary ?? t.awaitingBody}</p>

      {section?.strengths?.length ? (
        <ChipGroup title={t.strengths} items={section.strengths.slice(0, 4)} />
      ) : null}

      {section?.advice?.length ? (
        <ChipGroup title={t.advice} items={section.advice.slice(0, 4)} />
      ) : null}
    </TianjiLovePanel>
  );
}

function ChipGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-4">
      <p className="text-xs uppercase tracking-[0.24em] text-[#d8b77b]/62">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((entry) => (
          <span key={entry} className="rounded-full border border-[#d8b77b]/22 bg-[#d8b77b]/10 px-3 py-1 text-xs text-[#ffe3b4]">
            {entry}
          </span>
        ))}
      </div>
    </div>
  );
}
