'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Heart,
  Lock,
  MessageCircleHeart,
  Shield,
  Sparkles,
} from 'lucide-react';

import { RelationshipForm } from '@/components/relationship/RelationshipForm';
import { RelationshipResult } from '@/components/relationship/RelationshipResult';
import {
  TianjiLoveButton,
  TianjiLoveFinalCta,
  TianjiLoveFooter,
  TianjiLoveHeader,
  TianjiLoveHeroImage,
  TianjiLovePanel,
  TianjiLoveSectionTitle,
  TianjiLoveShell,
  TianjiLoveTrustCard,
} from '@/components/tianji-love';
import { trackRelationshipEvent } from '@/lib/analytics/track';
import { type AppLanguage, isAppLanguage, withLanguageParam } from '@/lib/language-routing';
import type { RelationshipReading, RelationshipType } from '@/types/relationship';

type RelationshipCopy = {
  nav: { home: string; loveReading: string; ask: string; draw: string; pricing: string; about: string; login: string; privacy: string };
  hero: {
    eyebrow: string;
    title: string;
    line: string;
    body: string;
    primary: string;
    secondary: string;
  };
  sample: {
    eyebrow: string;
    title: string;
    score: string;
    pattern: string;
    nextMove: string;
    unlock: string;
  };
  trust: Array<{ title: string; body: string; icon: typeof Lock }>;
  steps: Array<{ title: string; body: string }>;
  loading: { title: string; body: string };
  error: { title: string; fallback: string };
  result: { back: string };
  finalCta: { title: string; button: string };
  footer: string;
};

const LEGACY_HERO_REFERENCE_SIGNAL = '/assets/images/home-reference/tianji-love-hero-couple-portrait.png';
const HERO_COUPLE_REFERENCE = '/assets/images/hero/tianji-love-couple-red-thread-16x9.png';
const FINAL_PAVILION = '/assets/images/hero/tianji-love-moon-pavilion-16x9.png';

const relationshipCopy = {
  zh: {
    nav: {
      home: '天机爱',
      loveReading: '关系解读',
      ask: '提问',
      draw: '抽牌',
      pricing: '会员权益',
      about: '关于',
      login: '登录',
      privacy: '隐私政策',
    },
    hero: {
      eyebrow: 'Tianji Love / Relationship Orbit',
      title: '把两个人的星轨，读成一段关系场。',
      line: 'Love is not a verdict. It is a pattern you can learn to hold.',
      body: '输入双方的出生日期与可选时辰，先看吸引、沟通、冲突、节奏与长期稳定性，再决定是否进入更深的关系报告。',
      primary: '填写双方信息',
      secondary: '回到首页',
    },
    sample: {
      eyebrow: 'Free First Signal',
      title: '浣犲皢鐪嬪埌鐨勫厤璐规憳瑕?',
      score: 'Overall compatibility score',
      pattern: 'Top relationship pattern',
      nextMove: 'Your next best move',
      unlock: 'Full report unlocks five dimensions, timing, and communication guidance',
    },
    trust: [
      { title: '隐私优先', body: '公开分享默认不包含出生日期、时辰、地点或时区。', icon: Shield },
      { title: '关系动力', body: '用模式、节奏和沟通建议替代绝对预测。', icon: MessageCircleHeart },
      { title: '清晰升级', body: '先看摘要，再决定是否解锁完整关系维度。', icon: Sparkles },
    ],
    steps: [
      { title: '1. 对齐两份资料', body: '昵称与出生日期为必填；时辰和地点可补充精度。' },
      { title: '2. 生成关系结构', body: '系统读取五个维度，给出适合沟通的摘要。' },
      { title: '3. 私密分享或升级', body: '分享只展示安全摘要，完整报告保留给你们自己。' },
    ],
    loading: {
      title: '正在读取你们的关系星轨',
      body: '请稍等片刻，系统正在整理吸引力、沟通方式与当前节奏。',
    },
    error: {
      title: '这次合盘没有完成',
      fallback: '分析失败，请检查输入后再试一次。',
    },
    result: {
      back: '重新填写双方资料',
    },
    finalCta: {
      title: '一段关系的答案，常藏在两个人共同的节奏里。',
      button: '继续爱情解读',
    },
    footer: '所有关系解读仅用于自我理解与沟通参考，不构成医疗、法律或财务建议。',
  },
  en: {
    nav: {
      home: 'Tianji Love',
      loveReading: 'Love Reading',
      ask: 'Ask',
      draw: 'Draw',
      pricing: 'Pricing',
      about: 'About',
      login: 'Login',
      privacy: 'Privacy',
    },
    hero: {
      eyebrow: 'Tianji Love / AI Relationship Compatibility Report',
      title: 'Reveal the hidden pattern between two people.',
      line: 'Private by default · No public birth data · First signal is free',
      body: 'Enter two birth dates to receive a private relationship reading across attraction, communication, conflict, timing, and long-term potential.',
      primary: 'Start Free Compatibility Reading',
      secondary: 'Back home',
    },
    sample: {
      eyebrow: 'Free First Signal',
      title: 'What your reading will show',
      score: 'Overall Compatibility Score',
      pattern: 'Top Pattern',
      nextMove: 'Your next best move',
      unlock: 'Full report unlocks five dimensions, 30-day timing, conflict repair, and communication guidance',
    },
    trust: [
      { title: 'Privacy First', body: 'No public birth data. Share links hide date, time, location, and timezone by default.', icon: Shield },
      { title: 'First Signal', body: 'Free results show the core pattern before you decide whether to unlock depth.', icon: MessageCircleHeart },
      { title: 'Full Report', body: 'Unlock all five dimensions, timing, and communication guidance when the reading earns it.', icon: Sparkles },
    ],
    steps: [
      { title: '1. Align both profiles', body: 'Nicknames and birth dates are required; birth time is optional, and location is reserved for advanced reports.' },
      { title: '2. Generate the pattern', body: 'The system reads five dimensions and returns a clear relationship summary.' },
      { title: '3. Share safely or upgrade', body: 'Sharing stays privacy-safe while deeper reports remain private.' },
    ],
    loading: {
      title: 'Reading your relationship orbit',
      body: 'The system is mapping attraction, communication, and current rhythm.',
    },
    error: {
      title: 'This reading did not complete',
      fallback: 'Analysis failed. Please check your inputs and try again.',
    },
    result: {
      back: 'Edit both profiles',
    },
    finalCta: {
      title: 'A relationship changes when both people can finally see the pattern.',
      button: 'Continue Love Reading',
    },
    footer: 'Relationship readings are for self-reflection and communication, not medical, legal, or financial advice.',
  },
} satisfies Record<AppLanguage, RelationshipCopy>;

function getLanguageFromSearch(searchParams: URLSearchParams): AppLanguage {
  const queryLang = searchParams.get('lang');
  return isAppLanguage(queryLang) ? queryLang : 'zh';
}

export default function RelationshipNewClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [language, setLanguage] = useState<AppLanguage>(() => getLanguageFromSearch(searchParams));
  const [result, setResult] = useState<RelationshipReading | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLanguage(getLanguageFromSearch(searchParams));
  }, [searchParams]);

  useEffect(() => {
    void trackRelationshipEvent({
      event: 'relationship_page_view',
      experiment_id: 'relationship-p0-sales-loop',
      variant: 'A',
      payload: { lang: language, surface: 'relationship_new', funnel_stage: 'page_view' },
    });
  }, [language]);

  const copy = relationshipCopy[language];
  const isZh = language === 'zh';
  const href = (path: string) => withLanguageParam(path, language);

  const toggleLanguage = () => {
    const next = language === 'zh' ? 'en' : 'zh';
    setLanguage(next);
    router.replace(withLanguageParam('/relationship/new', next), { scroll: false });
  };

  const trackFormStart = () => {
    void trackRelationshipEvent({
      event: 'relationship_form_start',
      experiment_id: 'relationship-p0-sales-loop',
      variant: 'A',
      payload: { lang: language, funnel_stage: 'form_start' },
    });
  };

  const handleSubmit = async (data: {
    relationType: RelationshipType;
    personA: { nickname: string; birthDate: string; birthTime?: string; birthLocation?: string };
    personB: { nickname: string; birthDate: string; birthTime?: string; birthLocation?: string };
  }) => {
    setIsLoading(true);
    setError(null);

    void trackRelationshipEvent({
      event: 'relationship_form_submit',
      experiment_id: 'relationship-p0-sales-loop',
      variant: 'A',
      relation_type: data.relationType,
      payload: { lang: language, report_type: 'compatibility_report', funnel_stage: 'form_submit' },
    });

    try {
      const res = await fetch('/api/relationship/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relationType: data.relationType,
          lang: language,
          personA: data.personA,
          personB: data.personB,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.error ?? copy.error.fallback);
        void trackRelationshipEvent({
          event: 'relationship_error',
          experiment_id: 'relationship-p0-sales-loop',
          variant: 'A',
          relation_type: data.relationType,
          payload: { stage: 'analyze', lang: language, report_type: 'compatibility_report', funnel_stage: 'analysis_error' },
        });
        return;
      }

      setResult(json.data);
      void trackRelationshipEvent({
        event: 'relationship_analysis_success',
        experiment_id: 'relationship-p0-sales-loop',
        variant: 'A',
        relation_type: data.relationType,
        is_premium: false,
        payload: { lang: language, report_type: 'compatibility_report', funnel_stage: 'analysis_success' },
      });
    } catch {
      setError(copy.error.fallback);
      void trackRelationshipEvent({
        event: 'relationship_error',
        experiment_id: 'relationship-p0-sales-loop',
        variant: 'A',
        relation_type: data.relationType,
        payload: { stage: 'analyze_exception', lang: language, report_type: 'compatibility_report', funnel_stage: 'analysis_error' },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TianjiLoveShell className="tianji-love-relationship-page" ariaLabel="Tianji Love relationship shell">
      <TianjiLoveHeader
        homeHref={href('/')}
        navItems={[
          { label: copy.nav.loveReading, href: href('/relationship/new') },
          { label: copy.nav.ask, href: href('/ask') },
          { label: copy.nav.draw, href: href('/draw') },
          { label: copy.nav.pricing, href: href('/pricing'), mobile: true },
          { label: copy.nav.about, href: href('/about') },
          { label: copy.nav.login, href: href('/login'), mobile: true },
        ]}
        cta={{ label: isZh ? '填写资料' : 'Enter profiles', href: '#relationship-form' }}
        languageLabel={language === 'zh' ? '中 | EN' : 'EN | 中'}
        onLanguageToggle={toggleLanguage}
      />

      {result ? (
        <section className="relative z-10 mx-auto w-full max-w-4xl px-5 py-10 sm:px-8">
          <button
            type="button"
            onClick={() => setResult(null)}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d8b77b]/24 bg-black/20 px-4 py-2 text-sm text-[#f4d7a3]/70 transition hover:border-[#ffe3b4]/50 hover:text-[#ffe3b4]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {copy.result.back}
          </button>
          <RelationshipResult reading={result} lang={language} />
        </section>
      ) : (
        <>
          <section className="relationship-hero-section relative z-10 mx-auto grid w-full max-w-7xl gap-8 px-5 pb-10 pt-12 sm:px-8 lg:min-h-[690px] lg:grid-cols-[minmax(520px,0.92fr)_minmax(520px,1fr)] lg:items-center">
            <div className="relative z-10 max-w-3xl">
              <p className="mb-5 text-xs uppercase tracking-[0.32em] text-[#d8b77b]/70">Compatibility Report · {copy.hero.eyebrow}</p>
              {!isZh && (
                <h1
                  className="max-w-[720px] font-serif text-[2.3rem] font-semibold leading-[1.12] text-[#ffe3b4] sm:text-[3.6rem] lg:text-[4.35rem]"
                  style={{ fontFamily: 'var(--font-tianji-display)' }}
                >
                  {copy.hero.title}
                </h1>
              )}
              <h1
                className={`${!isZh ? 'hidden ' : ''}max-w-[720px] font-serif text-[2.3rem] font-semibold leading-[1.12] text-[#ffe3b4] sm:text-[3.6rem] lg:text-[4.35rem]`}
                style={{ fontFamily: 'var(--font-tianji-display)' }}
              >
                {isZh ? (
                  <>
                    把两个人的星轨，
                    <br />
                    读成一段关系场。
                  </>
                ) : (
                  <>
                    Read two charts
                    <br />
                    as one relational field.
                  </>
                )}
              </h1>
              <p className="mt-5 inline-block border-b border-[#cf635f]/50 pb-2 text-base font-semibold text-[#ff8f83]">
                {copy.hero.line}
              </p>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#f5d8aa]/78 sm:text-lg">{copy.hero.body}</p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#relationship-form"
                  className="tianji-love-primary inline-flex min-h-14 items-center justify-center rounded-lg border border-[#ffb49e]/60 px-8 text-base font-semibold text-[#fff7e6]"
                >
                  {copy.hero.primary}
                  <Heart className="ml-3 h-4 w-4" aria-hidden />
                </a>
                <TianjiLoveButton href={href('/')} variant="secondary">
                  {copy.hero.secondary}
                </TianjiLoveButton>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {copy.trust.map((item) => (
                  <TianjiLoveTrustCard key={item.title} icon={item.icon} title={item.title} body={item.body} />
                ))}
              </div>
            </div>

            <TianjiLoveHeroImage
              src={HERO_COUPLE_REFERENCE}
              referenceSignal={LEGACY_HERO_REFERENCE_SIGNAL}
              priority
              className="relationship-hero-visual"
            />
          </section>

          <section className="relative z-10 mx-auto grid w-full max-w-7xl gap-5 px-5 pb-8 sm:px-8 md:grid-cols-3">
            {copy.steps.map((step) => (
              <TianjiLovePanel key={step.title} as="article" className="p-5">
                <h2 className="text-base font-semibold text-[#ffe3b4]">{step.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#f4d7a3]/60">{step.body}</p>
              </TianjiLovePanel>
            ))}
          </section>

          <section id="relationship-form" className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-16 sm:px-8">
            <TianjiLovePanel className="love-birth-chart-panel p-5 sm:p-8">
              <TianjiLoveSectionTitle eyebrow="Birth Orbit Form" title={isZh ? '请填写双方的关系星轨' : 'Enter both relationship orbits'} className="mb-7" />

              <div className="mb-7 rounded-xl border border-[#d8b77b]/20 bg-black/20 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-[#d8b77b]/62">{copy.sample.eyebrow}</p>
                <h2 className="mt-2 font-serif text-2xl text-[#ffe3b4]">{copy.sample.title}</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[copy.sample.score, copy.sample.pattern, copy.sample.nextMove, copy.sample.unlock].map((item) => (
                    <div key={item} className="rounded-lg border border-[#b57248]/20 bg-[#d8b77b]/6 px-4 py-3 text-sm text-[#f4d7a3]/70">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {isLoading && (
                <div className="mb-6 rounded-xl border border-[#d8b77b]/22 bg-[#d8b77b]/8 p-4 text-center">
                  <p className="font-semibold text-[#ffe3b4]">{copy.loading.title}</p>
                  <p className="mt-1 text-sm text-[#f4d7a3]/62">{copy.loading.body}</p>
                </div>
              )}

              {error && (
                <div className="mb-6 rounded-xl border border-[#ff7f80]/30 bg-[#ff5264]/10 p-4 text-center">
                  <p className="font-semibold text-[#ffb4a3]">{copy.error.title}</p>
                  <p className="mt-1 text-sm text-[#ffd6c6]/76">{error}</p>
                </div>
              )}

              <RelationshipForm onSubmit={handleSubmit} onStart={trackFormStart} isLoading={isLoading} lang={language} />
            </TianjiLovePanel>
          </section>

          <TianjiLoveFinalCta imageSrc={FINAL_PAVILION} title={copy.finalCta.title} buttonLabel={copy.finalCta.button} href={href('/ask')} />
        </>
      )}

      <TianjiLoveFooter
        homeHref={href('/')}
        disclaimer={copy.footer}
        links={[
          { label: copy.nav.loveReading, href: href('/relationship/new') },
          { label: copy.nav.ask, href: href('/ask') },
          { label: copy.nav.draw, href: href('/draw') },
          { label: copy.nav.pricing, href: href('/pricing') },
          { label: copy.nav.about, href: href('/about') },
          { label: copy.nav.login, href: href('/login') },
          { label: copy.nav.privacy, href: href('/legal/privacy') },
        ]}
      />
    </TianjiLoveShell>
  );
}
