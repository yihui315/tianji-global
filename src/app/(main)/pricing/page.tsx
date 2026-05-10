'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PLANS } from '@/lib/stripe';
import {
  BackgroundVideoHero,
  LandingSection,
} from '@/components/landing';
import { FAQAccordion, GlassCard } from '@/components/ui';
import { useSyncedLanguage } from '@/hooks/useSyncedLanguage';
import { withLanguageParam } from '@/lib/language-routing';

const PLAN_ORDER = ['PRO_MONTHLY', 'PRO_YEARLY'] as const;

const pricingCopy = {
  en: {
    hero: {
      eyebrow: 'TianJi Pro',
      title: 'Go deeper, when the reading starts to matter.',
      subtitle: 'Unlimited readings · Deeper AI interpretation · Long-lived history',
      description:
        'Pro is for people who want a divination practice, not a one-time curiosity. Unlock unlimited sessions across all five traditions, layered AI interpretation, exportable PDF reports, and a destiny profile you can return to over time.',
      cta: {
        auth: 'Choose your plan',
        guest: 'Sign in to upgrade',
      },
      secondary: 'Compare with the free tier',
      stats: [
        { label: 'Free reads', value: 'Always' },
        { label: 'Pro plans', value: '2' },
        { label: 'Refund window', value: '7 days' },
      ],
    },
    plans: {
      eyebrow: 'Plans',
      title: 'Choose your pace, not your depth.',
      description:
        'Both plans unlock the same Pro experience. The difference is how often you pay — not how seriously you read.',
      bestValue: 'Most chosen',
      save: 'Save 17% vs monthly',
      redirecting: 'Redirecting…',
      guestCta: 'Sign in to continue',
      authCta: 'Continue to checkout',
      footnote: 'Secure checkout via Stripe · Cancel anytime in your account',
    },
    why: {
      eyebrow: 'What Pro changes',
      title: 'Pro is the difference between a reading and a practice.',
      description:
        'The free tier always finishes a complete reading. Pro is for the moments when you want the page to keep speaking.',
      items: [
        {
          icon: '∞',
          title: 'Unlimited readings',
          body: 'No daily caps across Zi Wei, Bazi, I Ching, Western, and Tarot. Cast as often as a question deserves.',
        },
        {
          icon: '☾',
          title: 'Deeper AI layer',
          body: 'Pro readings include extended interpretation, changing-line analysis, and follow-up questions in the same thread.',
        },
        {
          icon: '✦',
          title: 'PDF export',
          body: 'Every reading exports as a typeset PDF you can save, share, or revisit on paper.',
        },
        {
          icon: '☷',
          title: 'Long history',
          body: '30-day reading history with version trail, so you can compare how the same question evolves over time.',
        },
        {
          icon: '⚝',
          title: 'Priority queue',
          body: 'AI requests run on a priority lane — readings come back faster, even at peak hours.',
        },
        {
          icon: '☯',
          title: 'Quiet by default',
          body: 'Marketing email stays off. You only hear from us about checkout and plan changes.',
        },
      ],
    },
    compare: {
      eyebrow: 'Free vs Pro',
      title: 'What you keep, what unlocks.',
      description: 'The free tier is genuinely usable. Pro is for going further on the same path.',
      headers: ['Capability', 'Free', 'Pro'],
      rows: [
        { label: 'Complete a reading', free: '✓', pro: '✓' },
        { label: 'All five traditions', free: '✓', pro: '✓' },
        { label: 'Save & share', free: '✓', pro: '✓' },
        { label: 'Daily reading cap', free: 'Limited', pro: 'Unlimited' },
        { label: 'AI interpretation depth', free: 'Standard', pro: 'Extended' },
        { label: 'PDF export', free: '—', pro: '✓' },
        { label: 'Reading history', free: 'Last 3', pro: '30 days · versioned' },
        { label: 'Priority AI queue', free: '—', pro: '✓' },
      ],
    },
    guarantee: {
      eyebrow: 'No-friction promise',
      title: 'Seven-day refund. One-click cancel. Full data export.',
      items: [
        {
          tag: '7d',
          title: '7-day refund',
          body: 'Email billing@tianji.global within seven days of purchase for a full refund — no questions asked.',
        },
        {
          tag: '1✕',
          title: 'One-click cancel',
          body: 'Cancel anytime from your account. The remainder of your billing period stays active.',
        },
        {
          tag: '⇲',
          title: 'Take everything with you',
          body: 'Your readings export as PDF and JSON whenever you want. Deletion erases everything within 14 days.',
        },
      ],
    },
    faq: {
      eyebrow: 'Questions before you upgrade',
      title: 'The honest answers, written by us.',
      items: [
        {
          question: 'Is the free tier still usable after Pro launches?',
          answer:
            'Yes — and we will keep it that way. The free tier always finishes a complete reading across all five traditions. Pro only unlocks frequency, depth, and exports.',
        },
        {
          question: 'Can I cancel my plan anytime?',
          answer:
            'Yes. You can cancel directly from your account. The plan stays active until the end of the current billing period, then stops renewing — no further charges.',
        },
        {
          question: 'Do you offer refunds?',
          answer:
            'Within seven days of purchase, we issue a full refund without asking questions. Email billing@tianji.global with your purchase email and we will handle it.',
        },
        {
          question: 'How does the AI interpretation actually work?',
          answer:
            'Each reading combines deterministic divination logic — hexagram casting, chart calculation, card drawing — with a language model layer for natural-language interpretation. The traditional source and AI portion are clearly distinguished in the result.',
        },
        {
          question: 'Where does my data live? Can I delete it?',
          answer:
            'Birth time, question text, and reading history are stored in our encrypted database, never sold or shared with third parties. You can request full deletion anytime — see the data deletion section on our about page.',
        },
        {
          question: 'Can I switch between monthly and yearly?',
          answer:
            'Yes. Switching to yearly applies the prorated difference; switching to monthly takes effect at the end of the current yearly term. No service interruption either way.',
        },
      ],
    },
    finalCta: {
      eyebrow: 'Ready when you are',
      title: 'The first reading is always free. Pro is for the next one.',
      description: 'Try a complete reading first. If the page wants to keep speaking, Pro is here.',
      primary: 'See plans again',
      secondary: 'Read about TianJi',
    },
  },
  zh: {
    hero: {
      eyebrow: 'TianJi Pro',
      title: '当这次解读开始变得重要 · 进入更深一层。',
      subtitle: '不限次数解读 · 更深 AI 层 · 长期可回看的命理档案',
      description:
        'Pro 是给把占卜当作长期实践的人，而不是一次猎奇。解锁全部五种传统的不限次解读、加深的 AI 解读层、可导出的 PDF 报告，以及可以反复回看的命理档案。',
      cta: {
        auth: '选择你的方案',
        guest: '登录后升级',
      },
      secondary: '看看免费版能做什么',
      stats: [
        { label: '免费解读', value: '永久可用' },
        { label: '会员方案', value: '2 个' },
        { label: '退款窗口', value: '7 天' },
      ],
    },
    plans: {
      eyebrow: '会员方案',
      title: '选你的节奏 · 不降你的深度。',
      description:
        '两个方案解锁完全相同的 Pro 体验。区别只在付费节奏，不在解读深度。',
      bestValue: '更多人选',
      save: '比月付节省 17%',
      redirecting: '正在跳转…',
      guestCta: '登录后继续',
      authCta: '继续结账',
      footnote: 'Stripe 安全结账 · 账户内随时取消',
    },
    why: {
      eyebrow: 'Pro 改变了什么',
      title: 'Pro 把一次解读，变成一段长期的实践。',
      description:
        '免费版始终能完整完成一次解读。Pro 是给那种「想让这一页继续讲下去」的时刻准备的。',
      items: [
        {
          icon: '∞',
          title: '不限次数解读',
          body: '紫微 / 八字 / 易经 / 西方 / 塔罗 全部去除每日上限。问题值得问，就尽管投。',
        },
        {
          icon: '☾',
          title: '加深的 AI 解读',
          body: 'Pro 解读包含延伸解读、变爻分析，以及在同一线程中追问的能力。',
        },
        {
          icon: '✦',
          title: 'PDF 导出',
          body: '每一次解读都可以导出为排版精良的 PDF。可以保存、分享，也可以打印翻看。',
        },
        {
          icon: '☷',
          title: '长期历史',
          body: '30 天的解读历史与版本痕迹。同一个问题在不同时间问，你可以一眼看清演变。',
        },
        {
          icon: '⚝',
          title: '优先队列',
          body: 'AI 请求走优先通道。即使在高峰期，结果也回得更快。',
        },
        {
          icon: '☯',
          title: '默认安静',
          body: '营销邮件默认关闭。你只会收到结账与会员变动的通知。',
        },
      ],
    },
    compare: {
      eyebrow: '免费版 vs Pro',
      title: '哪些保持不变 · 哪些会解锁。',
      description: '免费版本身就是一个能用的产品。Pro 是给愿意走得更远的人。',
      headers: ['能力', '免费版', 'Pro'],
      rows: [
        { label: '完整完成一次解读', free: '✓', pro: '✓' },
        { label: '全部五种传统', free: '✓', pro: '✓' },
        { label: '保存与分享', free: '✓', pro: '✓' },
        { label: '每日解读上限', free: '有限', pro: '不限' },
        { label: 'AI 解读深度', free: '标准', pro: '加深' },
        { label: 'PDF 导出', free: '—', pro: '✓' },
        { label: '解读历史', free: '最近 3 次', pro: '30 天 · 含版本' },
        { label: '优先 AI 队列', free: '—', pro: '✓' },
      ],
    },
    guarantee: {
      eyebrow: '我们的承诺',
      title: '7 天退款 · 一键取消 · 全量导出。',
      items: [
        {
          tag: '7d',
          title: '7 天无理由退款',
          body: '购买后 7 天内邮件 billing@tianji.global，全额退款，不问理由。',
        },
        {
          tag: '1✕',
          title: '一键取消',
          body: '账户内随时取消。剩余周期内会员仍然可用，到期不再续费。',
        },
        {
          tag: '⇲',
          title: '数据可以全部带走',
          body: '解读支持 PDF 与 JSON 导出。请求删除会在 14 天内彻底清除你的数据。',
        },
      ],
    },
    faq: {
      eyebrow: '升级前常见的问题',
      title: '我们自己写的真实回答。',
      items: [
        {
          question: 'Pro 上线之后，免费版还能用吗？',
          answer:
            '可以，并且会一直保留。免费版永远能完整完成一次解读，覆盖全部五种传统。Pro 只是解锁频次、深度与导出。',
        },
        {
          question: '会员可以随时取消吗？',
          answer:
            '可以。在账户里直接取消即可，会员状态会保持到当期结束，之后不再扣费。',
        },
        {
          question: '是否支持退款？',
          answer:
            '购买后 7 天内全额退款，不问理由。把购买使用的邮箱发到 billing@tianji.global，我们处理。',
        },
        {
          question: 'AI 解读到底是怎么工作的？',
          answer:
            '每一次解读由两部分组成：传统占卜算法（投币、起盘、抽牌等确定性逻辑）+ 语言模型用于自然语言解读。结果中会清楚区分「传统判断」与「AI 解读」两部分。',
        },
        {
          question: '我的数据存在哪里？可以删除吗？',
          answer:
            '出生时间、问题文本与解读历史都存放在加密数据库中，不会出售或与第三方共享。你随时可以请求全量删除——具体入口见关于页的「数据删除」一节。',
        },
        {
          question: '可以在月付和年付之间切换吗？',
          answer:
            '可以。月付转年付会按比例计算差额；年付转月付会在当前年度结束时生效。两种切换都不影响你的会员服务。',
        },
      ],
    },
    finalCta: {
      eyebrow: '准备好就来',
      title: '第一次解读永远免费。Pro 是给下一次准备的。',
      description: '先完整体验一次免费解读。如果你想让这一页继续讲下去，Pro 一直在。',
      primary: '回到方案',
      secondary: '了解天机',
    },
  },
} as const;

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [language] = useSyncedLanguage();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState('');
  const copy = pricingCopy[language];

  const isAuthenticated = !!session?.user;

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      router.push(withLanguageParam('/login', language));
      return;
    }

    setLoadingPlan(planId);
    setError('');

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoadingPlan(null);
    }
  };

  return (
    <main id="main-content" className="relative min-h-screen overflow-hidden bg-[#050508] text-white">
      <BackgroundVideoHero
        eyebrow={copy.hero.eyebrow}
        title={copy.hero.title}
        subtitle={copy.hero.subtitle}
        description={copy.hero.description}
        videoSrc="/assets/videos/hero/pricing-hero-loop-6s-1080p.mp4"
        posterSrc="/assets/images/posters/pricing-hero-poster-16x9.jpg"
        imageSrc="/assets/images/hero/pricing-hero-master-16x9.jpg"
        ctaLabel={isAuthenticated ? copy.hero.cta.auth : copy.hero.cta.guest}
        ctaHref="#plans"
        secondaryCtaLabel={copy.hero.secondary}
        secondaryCtaHref="#compare"
        stats={[...copy.hero.stats]}
      />

      <LandingSection
        eyebrow={copy.why.eyebrow}
        title={copy.why.title}
        description={copy.why.description}
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {copy.why.items.map((item) => (
            <GlassCard
              key={item.title}
              level="card"
              className="rounded-[1.75rem] border border-white/[0.06] bg-white/[0.025] p-7"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(212,175,119,0.32)] bg-[rgba(212,175,119,0.06)] font-serif text-xl text-[rgba(212,175,119,0.92)]">
                {item.icon}
              </div>
              <h3 className="mb-2 font-serif text-lg text-white/92">{item.title}</h3>
              <p className="text-sm leading-7 text-white/60">{item.body}</p>
            </GlassCard>
          ))}
        </div>
      </LandingSection>

      <LandingSection
        id="plans"
        eyebrow={copy.plans.eyebrow}
        title={copy.plans.title}
        description={copy.plans.description}
      >
        {error && (
          <div className="mx-auto mb-6 max-w-md rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-center text-sm text-rose-200">
            {error}
          </div>
        )}

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
          {PLAN_ORDER.map((planId) => {
            const plan = PLANS[planId];
            const isYearly = planId === 'PRO_YEARLY';
            const isLoading = loadingPlan === planId;
            const features = language === 'zh' ? plan.features.zh : plan.features.en;

            return (
              <article
                key={planId}
                className={`relative overflow-hidden rounded-[2.25rem] border p-7 shadow-[0_34px_120px_rgba(0,0,0,0.42)] transition hover:-translate-y-1 ${
                  isYearly
                    ? 'border-[rgba(212,175,119,0.45)] bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,119,0.18),transparent_42%),rgba(255,255,255,0.04)]'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                }`}
              >
                {isYearly && (
                  <div className="absolute right-5 top-5 rounded-full bg-gradient-to-r from-[#f8e7c2] to-white px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-black">
                    {copy.plans.bestValue}
                  </div>
                )}

                <div className="pr-24">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/35">
                    {plan.interval}
                  </p>
                  <h2 className="mt-4 font-serif text-3xl text-white/90">
                    {language === 'zh' ? plan.nameZh : plan.name}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-white/55">
                    {language === 'zh' ? plan.descriptionZh : plan.description}
                  </p>
                </div>

                <div className="mt-8 flex items-end gap-2">
                  <span className="font-serif text-5xl text-white/95">${plan.price}</span>
                  <span className="pb-2 text-sm text-white/42">/{plan.interval}</span>
                </div>

                {isYearly && (
                  <p className="mt-2 text-sm font-semibold text-[rgba(212,175,119,0.92)]">
                    {copy.plans.save}
                  </p>
                )}

                <div className="my-7 h-px bg-white/10" />

                <ul className="space-y-3">
                  {features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm leading-6 text-white/62">
                      <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[rgba(212,175,119,0.85)]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(planId)}
                  disabled={isLoading}
                  className={`mt-8 w-full rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    isYearly
                      ? 'bg-gradient-to-br from-[#f8e7c2] to-white text-black hover:from-[#fff5dd]'
                      : 'bg-white text-black hover:bg-white/90'
                  }`}
                >
                  {isLoading
                    ? copy.plans.redirecting
                    : !isAuthenticated
                      ? copy.plans.guestCta
                      : copy.plans.authCta}
                </button>
              </article>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs uppercase tracking-[0.22em] text-white/35">
          {copy.plans.footnote}
        </p>
      </LandingSection>

      <LandingSection
        id="compare"
        eyebrow={copy.compare.eyebrow}
        title={copy.compare.title}
        description={copy.compare.description}
      >
        <GlassCard
          level="card"
          className="overflow-hidden rounded-[1.75rem] border border-white/[0.06] bg-white/[0.02]"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  {copy.compare.headers.map((h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-4 text-[0.7rem] uppercase tracking-[0.22em] ${
                        i === 0 ? 'text-left text-white/45' : 'text-center'
                      } ${i === 2 ? 'text-[rgba(212,175,119,0.78)]' : 'text-white/45'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {copy.compare.rows.map((row, i) => (
                  <tr
                    key={row.label}
                    className={`${i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.012]'} border-b border-white/[0.04] last:border-b-0`}
                  >
                    <td className="px-5 py-4 text-white/78">{row.label}</td>
                    <td className="px-5 py-4 text-center text-white/45">{row.free}</td>
                    <td className="px-5 py-4 text-center font-semibold text-[rgba(212,175,119,0.95)]">
                      {row.pro}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </LandingSection>

      <LandingSection eyebrow={copy.guarantee.eyebrow} title={copy.guarantee.title}>
        <div className="grid gap-5 sm:grid-cols-3">
          {copy.guarantee.items.map((item) => (
            <GlassCard
              key={item.title}
              level="card"
              className="rounded-[1.5rem] border border-white/[0.06] bg-white/[0.025] p-6"
            >
              <div className="mb-4 inline-flex h-9 items-center justify-center rounded-full border border-[rgba(212,175,119,0.34)] bg-[rgba(212,175,119,0.05)] px-3 text-[0.7rem] font-semibold tracking-[0.18em] text-[rgba(212,175,119,0.95)]">
                {item.tag}
              </div>
              <h3 className="mb-2 font-serif text-base text-white/92">{item.title}</h3>
              <p className="text-sm leading-7 text-white/60">{item.body}</p>
            </GlassCard>
          ))}
        </div>
      </LandingSection>

      <LandingSection eyebrow={copy.faq.eyebrow} title={copy.faq.title}>
        <div className="mx-auto max-w-3xl">
          <FAQAccordion items={[...copy.faq.items]} />
        </div>
      </LandingSection>

      <LandingSection
        eyebrow={copy.finalCta.eyebrow}
        title={copy.finalCta.title}
        description={copy.finalCta.description}
      >
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="#plans"
            className="rounded-full bg-gradient-to-br from-[#f8e7c2] to-white px-7 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black transition hover:from-[#fff5dd]"
          >
            {copy.finalCta.primary}
          </Link>
          <Link
            href={withLanguageParam('/about', language)}
            className="rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/82 transition hover:border-white/30 hover:text-white"
          >
            {copy.finalCta.secondary}
          </Link>
        </div>
      </LandingSection>

      <footer className="border-t border-white/10 px-6 py-10 text-center text-xs uppercase tracking-[0.24em] text-white/30">
        <Link href={withLanguageParam('/', language)} className="hover:text-white/65">
          TianJi Global
        </Link>
      </footer>
    </main>
  );
}
