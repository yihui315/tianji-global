'use client';

import Link from 'next/link';
import { GlassCard, LanguageSwitch } from '@/components/ui';
import { LandingSection } from '@/components/landing';
import { useSyncedLanguage } from '@/hooks/useSyncedLanguage';
import { withLanguageParam } from '@/lib/language-routing';

const COPY = {
  zh: {
    eyebrow: '关于天机',
    title: '让千年的命理智慧，跟现代生活同频。',
    subtitle:
      '天机全球（TianJi Global）把紫微斗数、八字、易经、西方占星与塔罗，做成一套你愿意长期回看的解读体验。我们关心你看完之后的下一步，而不是停在第一次的好奇。',
    hello: '联系我们',
    helloEmail: 'hello@tianji.global',
    backHome: '返回首页',
    missionEyebrow: '使命',
    missionTitle: '可被信任的占卜，不止一次的解读。',
    missionBody:
      '占卜不是娱乐数据。它会被你在重要时刻反复回看。所以我们要求自己：把流派源流写清楚，AI 解读必须可解释，结果可以保存可以导出，也可以彻底删除。',
    pillarsEyebrow: '我们如何工作',
    pillarsTitle: '四个我们不会让步的承诺。',
    pillars: [
      {
        tag: '01',
        title: '尊重传统',
        body: '紫微、八字、易经的判读都基于传统典籍，不为了顺耳改写卦辞与判断。',
      },
      {
        tag: '02',
        title: 'AI 透明',
        body: 'AI 解读会标注出处、模型版本与置信度，不让算法替你决定意义。',
      },
      {
        tag: '03',
        title: '隐私即默认',
        body: '出生时间、问题文本默认不向第三方共享。导出 PDF 与历史记录，权限永远在你手里。',
      },
      {
        tag: '04',
        title: '克制商业',
        body: '不卖结果，不卖运势焦虑。会员只解锁深度与频次，免费版永远能完整完成一次解读。',
      },
    ],
    trustEyebrow: '信任与数据',
    trustTitle: '你的数据，怎么用，怎么删，写给你看。',
    trustBody:
      '我们处理的数据包括出生时间、问题文本、AI 解读结果与历史记录。数据的所有权属于你；以下是你随时可以行使的权利。',
    trustItems: [
      {
        title: '查看 / 导出',
        body: '所有解读支持 PDF 导出与原始 JSON 导出，你可以拿走全部数据。',
      },
      {
        title: '更正 / 重写',
        body: '出生时间、姓名、性别等基础信息支持随时更新；旧的解读会保留版本痕迹。',
      },
      {
        title: '彻底删除',
        body: '联系下方邮箱，我们会在 14 天内删除你的账户、问题文本、AI 输出与缓存。',
      },
      {
        title: '不被推送',
        body: '默认关闭营销邮件。订阅过程也只发结账与会员变动通知。',
      },
    ],
    deletionTitle: '想删除你的数据？',
    deletionBody:
      '把下面的邮件发给我们就够了。无需提供理由、无需走任何挽留流程。我们会在确认身份后，在 14 个自然日内完成账户、问题文本、AI 输出与备份缓存的彻底删除，并邮件回执。',
    deletionCta: '发邮件请求删除',
    deletionMailtoSubject: '请求删除我的天机账号与数据',
    deletionMailtoBody:
      '你好，我希望删除我的天机账号与所有相关数据。我用来注册的邮箱是：（请填写）。我同意这次删除是不可逆的。',
    deletionTimeline: '通常 14 天内完成 · 删除完毕会邮件回执',
    deletionLearnMore: '查看完整隐私政策',
    contactEyebrow: '更多联系方式',
    contactTitle: '一切问题，都从这里开始。',
    contactItems: [
      { label: '产品与功能', value: 'hello@tianji.global' },
      { label: '会员与发票', value: 'billing@tianji.global' },
      { label: '隐私与数据', value: 'privacy@tianji.global' },
    ],
    footerNote: '© 2026 TianJi Global · 不卖结果，不卖焦虑',
  },
  en: {
    eyebrow: 'About TianJi',
    title: 'Ancient divination, in step with modern life.',
    subtitle:
      'TianJi Global brings Zi Wei Dou Shu, Bazi, the I Ching, Western astrology, and Tarot into one reading experience you can return to over time. We care about your next step, not your first surprise.',
    hello: 'Get in touch',
    helloEmail: 'hello@tianji.global',
    backHome: 'Back to home',
    missionEyebrow: 'Mission',
    missionTitle: 'A divination service that earns trust the second time too.',
    missionBody:
      'A reading is not entertainment data. People come back to it at the moments that matter. So we hold ourselves to four things: clear sourcing, explainable AI, exportable results — and the option to delete everything.',
    pillarsEyebrow: 'How we work',
    pillarsTitle: 'Four commitments we will not soften.',
    pillars: [
      {
        tag: '01',
        title: 'Respect the tradition',
        body: 'Zi Wei, Bazi, and the I Ching follow classical sources. We do not rewrite a judgement just because it sounds pleasant.',
      },
      {
        tag: '02',
        title: 'AI we can explain',
        body: 'Every AI interpretation is labelled with source, model, and confidence. The algorithm does not get to decide what your reading means.',
      },
      {
        tag: '03',
        title: 'Privacy by default',
        body: 'Birth time and question text are never shared with third parties. PDF exports and history live under your control alone.',
      },
      {
        tag: '04',
        title: 'Restraint in commerce',
        body: 'We do not monetise outcomes or fear. Membership only unlocks depth and frequency — the free tier still finishes a complete reading.',
      },
    ],
    trustEyebrow: 'Trust & data',
    trustTitle: 'Your data, how it is used, and how to delete it — in writing.',
    trustBody:
      'We process birth time, question text, AI outputs, and reading history. The data belongs to you. These are the rights you can exercise at any time.',
    trustItems: [
      {
        title: 'View / Export',
        body: 'Every reading exports as PDF and as raw JSON. You can take everything with you.',
      },
      {
        title: 'Correct / Restate',
        body: 'Birth time, name, and gender can be updated anytime. Past readings keep a version trail.',
      },
      {
        title: 'Delete completely',
        body: 'Email the address below. Within 14 days we erase your account, question text, AI outputs, and cached data.',
      },
      {
        title: 'No push',
        body: 'Marketing email is off by default. Subscription mail only covers checkout and plan changes.',
      },
    ],
    deletionTitle: 'Want your data removed?',
    deletionBody:
      'Sending the email below is enough. No reasons required, no retention dance. After identity check, we erase your account, question text, AI outputs, and backup caches within 14 calendar days, and reply to confirm.',
    deletionCta: 'Email a deletion request',
    deletionMailtoSubject: 'Please delete my TianJi account and data',
    deletionMailtoBody:
      'Hello, I would like my TianJi account and all related data deleted. The email I registered with is: (please fill in). I understand this deletion is irreversible.',
    deletionTimeline: 'Usually completed within 14 days · You receive an email confirmation',
    deletionLearnMore: 'Read the full privacy policy',
    contactEyebrow: 'More ways to reach us',
    contactTitle: 'Anything you need to ask — starts here.',
    contactItems: [
      { label: 'Product & features', value: 'hello@tianji.global' },
      { label: 'Billing & invoices', value: 'billing@tianji.global' },
      { label: 'Privacy & data', value: 'privacy@tianji.global' },
    ],
    footerNote: '© 2026 TianJi Global · No outcome sales, no anxiety sales',
  },
} as const;

export default function AboutPage() {
  const [language, setLanguage] = useSyncedLanguage();
  const t = COPY[language];

  const deletionMailto = `mailto:privacy@tianji.global?subject=${encodeURIComponent(
    t.deletionMailtoSubject,
  )}&body=${encodeURIComponent(t.deletionMailtoBody)}`;

  return (
    <main id="main-content" className="relative min-h-screen overflow-hidden bg-[#050508] text-white">
      <AboutCosmicLayers />

      <LanguageSwitch className="fixed right-6 top-6 z-30" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 pt-10">
        <Link
          href={withLanguageParam('/', language)}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-white/45 transition hover:text-white/85"
        >
          <span aria-hidden>←</span> {t.backHome}
        </Link>
        <a
          href={`mailto:${t.helloEmail}`}
          className="hidden text-xs uppercase tracking-[0.28em] text-[rgba(212,175,119,0.78)] transition hover:text-[rgba(212,175,119,1)] md:inline-flex"
        >
          {t.hello} · {t.helloEmail}
        </a>
      </header>

      <section className="relative z-10 mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
        <p className="mb-5 text-[0.7rem] uppercase tracking-[0.36em] text-[rgba(212,175,119,0.78)]">
          {t.eyebrow}
        </p>
        <h1 className="font-serif text-4xl leading-[1.18] text-white/95 sm:text-5xl md:text-6xl">
          {t.title}
        </h1>
        <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-white/65 sm:text-lg">
          {t.subtitle}
        </p>
      </section>

      <LandingSection
        eyebrow={t.missionEyebrow}
        title={t.missionTitle}
        description={t.missionBody}
      >
        <div />
      </LandingSection>

      <LandingSection eyebrow={t.pillarsEyebrow} title={t.pillarsTitle}>
        <div className="grid gap-6 sm:grid-cols-2">
          {t.pillars.map((pillar) => (
            <GlassCard
              key={pillar.tag}
              level="card"
              className="rounded-[1.75rem] border border-white/[0.06] bg-white/[0.025] p-7"
            >
              <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(212,175,119,0.34)] text-[0.72rem] font-semibold tracking-[0.18em] text-[rgba(212,175,119,0.88)]">
                {pillar.tag}
              </div>
              <h3 className="mb-3 font-serif text-xl text-white/92">{pillar.title}</h3>
              <p className="text-sm leading-7 text-white/60">{pillar.body}</p>
            </GlassCard>
          ))}
        </div>
      </LandingSection>

      <LandingSection
        eyebrow={t.trustEyebrow}
        title={t.trustTitle}
        description={t.trustBody}
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.trustItems.map((item) => (
            <GlassCard
              key={item.title}
              level="card"
              className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-6"
            >
              <div className="mb-3 text-[0.66rem] uppercase tracking-[0.26em] text-[rgba(212,175,119,0.62)]">
                {item.title}
              </div>
              <p className="text-sm leading-6 text-white/62">{item.body}</p>
            </GlassCard>
          ))}
        </div>

        <div className="mt-12">
          <GlassCard
            level="strong"
            className="overflow-hidden rounded-[2rem] border border-[rgba(212,175,119,0.28)] bg-[radial-gradient(circle_at_15%_0%,rgba(212,175,119,0.12),transparent_55%),rgba(8,8,16,0.6)] p-8 sm:p-12"
          >
            <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-center">
              <div>
                <div className="mb-4 text-[0.7rem] uppercase tracking-[0.32em] text-[rgba(212,175,119,0.78)]">
                  {language === 'zh' ? '数据删除入口' : 'Data deletion'}
                </div>
                <h3 className="font-serif text-2xl text-white/94 sm:text-3xl">
                  {t.deletionTitle}
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/62 sm:text-base">
                  {t.deletionBody}
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/35">
                  {t.deletionTimeline}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <a
                  href={deletionMailto}
                  className="inline-flex items-center justify-center gap-3 rounded-full border border-[rgba(212,175,119,0.5)] bg-gradient-to-br from-[#f8e7c2] to-white px-7 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-black shadow-[0_30px_80px_rgba(212,175,119,0.18)] transition hover:from-[#fff5dd] hover:to-white"
                >
                  <span aria-hidden>✦</span>
                  {t.deletionCta}
                </a>
                <Link
                  href={withLanguageParam('/legal/privacy', language)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 text-xs uppercase tracking-[0.22em] text-white/65 transition hover:border-white/25 hover:text-white"
                >
                  {t.deletionLearnMore}
                </Link>
              </div>
            </div>
          </GlassCard>
        </div>
      </LandingSection>

      <LandingSection eyebrow={t.contactEyebrow} title={t.contactTitle}>
        <div className="grid gap-4 sm:grid-cols-3">
          {t.contactItems.map((item) => (
            <a
              key={item.label}
              href={`mailto:${item.value}`}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition hover:border-[rgba(212,175,119,0.4)] hover:bg-white/[0.04]"
            >
              <div className="mb-2 text-[0.66rem] uppercase tracking-[0.26em] text-white/40 group-hover:text-[rgba(212,175,119,0.78)]">
                {item.label}
              </div>
              <div className="font-mono text-sm text-white/85 group-hover:text-white">
                {item.value}
              </div>
            </a>
          ))}
        </div>
      </LandingSection>

      <footer className="relative z-10 border-t border-white/10 px-6 py-10 text-center text-xs uppercase tracking-[0.24em] text-white/30">
        <Link href={withLanguageParam('/', language)} className="hover:text-white/65">
          TianJi Global
        </Link>
        <p className="mt-3 normal-case tracking-normal text-white/40">{t.footerNote}</p>
      </footer>
    </main>
  );
}

function AboutCosmicLayers() {
  return (
    <>
      <div aria-hidden className="tj-about-stardust" />
      <div aria-hidden className="tj-about-zodiac">
        <span style={{ left: '8%', top: '14%', animationDelay: '0s' }}>♈</span>
        <span style={{ left: '88%', top: '22%', animationDelay: '5s' }}>✦</span>
        <span style={{ left: '14%', top: '74%', animationDelay: '11s' }}>☾</span>
        <span style={{ left: '92%', top: '78%', animationDelay: '17s' }}>♓</span>
        <span style={{ left: '50%', top: '6%', animationDelay: '23s' }}>⚝</span>
      </div>
      <div aria-hidden className="tj-about-vignette" />

      <style>{`
        .tj-about-stardust {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(1.4px 1.4px at 18% 22%, rgba(212,175,119,0.78), transparent 60%),
            radial-gradient(1px 1px at 36% 74%, rgba(168,130,255,0.6), transparent 60%),
            radial-gradient(1.6px 1.6px at 64% 38%, rgba(212,175,119,0.7), transparent 60%),
            radial-gradient(1.2px 1.2px at 82% 64%, rgba(168,130,255,0.55), transparent 60%),
            radial-gradient(1px 1px at 8% 88%, rgba(212,175,119,0.55), transparent 60%);
          animation: tj-about-twinkle 11s ease-in-out infinite;
        }
        .tj-about-zodiac {
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
        }
        .tj-about-zodiac span {
          position: absolute;
          font-family: serif;
          font-size: 28px;
          color: rgba(168, 130, 255, 0.08);
          animation: tj-about-drift 28s ease-in-out infinite;
        }
        .tj-about-vignette {
          position: fixed;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background: radial-gradient(ellipse 80% 70% at 50% 50%, transparent 35%, rgba(0,0,0,0.78) 100%);
        }
        @keyframes tj-about-twinkle {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 0.95; }
        }
        @keyframes tj-about-drift {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.06; }
          50% { transform: translate(20px, -16px) rotate(8deg); opacity: 0.14; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tj-about-stardust,
          .tj-about-zodiac span {
            animation: none !important;
          }
        }
        @media (max-width: 640px) {
          .tj-about-zodiac span { font-size: 22px; }
        }
      `}</style>
    </>
  );
}
