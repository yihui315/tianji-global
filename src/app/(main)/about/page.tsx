'use client';

import Link from 'next/link';
import { GlassCard, LanguageSwitch } from '@/components/ui';
import { LandingSection } from '@/components/landing';
import { useSyncedLanguage } from '@/hooks/useSyncedLanguage';
import { withLanguageParam } from '@/lib/language-routing';

const COPY = {
  zh: {
    eyebrow: '信任中心',
    title: '天机 Love — 关系解读方法与数据说明',
    subtitle:
      '我们把这件事写清楚：Tianji Love 提供什么样的解读、如何生成、你的隐私如何处理、以及为什么它是一份反思性的关系指引，而不是一份保证。',
    backHome: '返回首页',
    hello: '联系我们',
    helloEmail: 'hello@tianji.global',

    // What it does
    doesEyebrow: '天机 Love 做什么',
    doesTitle: '提供关系模式反思，不是预测命运',
    doesBody:
      'Tianji Love 把你的出生信息与问题输入转化为一份关系模式分析报告。报告涵盖情感节奏、相容性信号、时机窗口与实用建议，基于紫微斗数、西方占星与塔罗的传统框架，由 AI 生成文字解读。',
    doesItems: [
      {
        title: '出生信息 → 解读',
        body: '你提供出生年月日时与问题，AI 基于传统命理框架生成一份关系模式分析。',
      },
      {
        title: '隐私输入处理',
        body: '出生时间与问题文本仅用于当次解读，不共享给第三方，不用于广告定向。',
      },
      {
        title: '结果可导出、可删除',
        body: '所有解读可导出为 PDF 或 JSON，也可以随时请求彻底删除。',
      },
      {
        title: '免费完成一次完整解读',
        body: '免费用户可以完成一次完整的关系解读。会员解锁更多深度与频次。',
      },
    ],

    // What it does NOT do
    doesNotEyebrow: '天机 Love 不做什么',
    doesNotTitle: '这不是什么',
    doesNotBody: '我们主动说明 Tianji Love 不能做什么、不会做什么，这样你可以做出知情的决定。',
    doesNotItems: [
      {
        title: '不预测具体事件',
        body: '报告不保证「你们会在三个月后复合」或「这个人就是对的人」。时机描述是观察窗口，不是日期承诺。',
      },
      {
        title: '不算命，不卖焦虑',
        body: '我们不卖「你今年运势如何」或「你的命是多少」。结果不是娱乐分数，不用于医疗、法律或财务决策。',
      },
      {
        title: 'AI 不替你做决定',
        body: '算法不会说「你应该分手还是继续」。报告提供模式观察，最终判断永远是你自己的。',
      },
      {
        title: '不暴露隐私数据',
        body: '出生时间、出生地点、时区不会出现在任何分享链接或公开结果中。',
      },
    ],

    // How readings are generated
    methodEyebrow: '解读如何生成',
    methodTitle: 'AI 解读的高层逻辑',
    methodBody:
      '当你提交解读请求后，系统按以下步骤生成报告。全程可追溯、可质疑、可拒绝。',
    methodSteps: [
      {
        step: '01',
        title: '输入整理',
        body: '你的出生日期、问题与选定的命理方法（紫微、占星或塔罗）被整理为结构化输入。出生时间精确到分钟，仅存储于你的账户下。',
      },
      {
        step: '02',
        title: '传统框架计算',
        body: '系统根据传统典籍规则计算星盘、八字或牌阵。这一步是确定性的规则运算，不涉及 AI。',
      },
      {
        step: '03',
        title: 'AI 生成解读',
        body: '基于计算结果与你的问题，AI 模型生成一份文字报告，包含：模式分析、时机信号、情感相容性与可行动的反思指引。AI 会标注模型来源与版本。',
      },
      {
        step: '04',
        title: '安全过滤与分发',
        body: '报告经过确定性语言过滤器，移除「一定会」「保证」等词汇。生成后，结果存储为私有链接，你可选择是否分享。',
      },
    ],

    // Why reflective guidance, not guaranteed
    guidanceEyebrow: '为什么是反思性指引',
    guidanceTitle: '结果是一面镜子，不是水晶球',
    guidanceBody:
      '所有 Tianji Love 的解读都是「反思性关系指引」（reflective relationship guidance）。这意味着：',
    guidanceItems: [
      {
        title: '观察模式，不是宣布命运',
        body: '报告描述的是你当前的关系模式与情感节奏。它是一个思考工具，不是一份已确定的未来。',
      },
      {
        title: '时机是窗口，不是日历',
        body: '「未来三个月」是适合反思与行动的窗口，不是「事情必然发生」的预言。你可以主动影响结果。',
      },
      {
        title: '最终判断属于你',
        body: '我们不会告诉你应该怎么做。报告提供可行动的反思建议，决定权始终在你手里。',
      },
      {
        title: '可质疑，可忽略',
        body: '如果某条解读感觉不对，你可以质疑它、忽略它，或者换一个问题重新开始。没有权威替你做主。',
      },
    ],
    guidanceNote:
      'Tianji Love 的解读不构成医疗、法律或财务建议。如有重大决策需求，请咨询专业人士。',

    // Privacy
    privacyEyebrow: '隐私与数据',
    privacyTitle: '你的出生信息如何处理',
    privacyBody:
      '出生时间是敏感个人信息。以下是我们处理隐私的原则：',
    privacyItems: [
      {
        title: '仅用于当次解读',
        body: '出生时间只用于计算你的命理图谱，不用于训练模型，不与第三方共享，不出现在任何分享链接中。',
      },
      {
        title: '可更新、可更正',
        body: '出生时间、姓名等基础信息可随时在账户中更新。旧的解读会保留版本痕迹。',
      },
      {
        title: '加密存储',
        body: '所有敏感数据在传输和存储时加密。你可随时导出或彻底删除。',
      },
    ],

    // Delete / Export / Contact
    dataEyebebrow: '数据权利',
    dataTitle: '你的数据，你随时可以处置',
    dataBody: '以下是你随时可以行使的数据权利，无需提供理由。',
    dataItems: [
      {
        title: '查看 / 导出',
        body: '所有解读支持 PDF 导出与原始 JSON 导出，你可以拿走全部数据。',
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
      '发邮件给我们就够了。无需提供理由、无需走任何挽留流程。确认身份后，我们在 14 个自然日内完成彻底删除，并邮件回执。',
    deletionCta: '发邮件请求删除',
    deletionMailtoSubject: '请求删除我的天机账号与数据',
    deletionMailtoBody:
      '你好，我希望删除我的天机账号与所有相关数据。我用来注册的邮箱是：（请填写）。我同意这次删除是不可逆的。',
    deletionTimeline: '通常 14 天内完成 · 删除完毕会邮件回执',
    deletionLearnMore: '查看完整隐私政策',

    // Contact
    contactEyebrow: '更多联系方式',
    contactTitle: '一切问题，都从这里开始。',
    contactItems: [
      { label: '产品与功能', value: 'hello@tianji.global' },
      { label: '会员与发票', value: 'billing@tianji.global' },
      { label: '隐私与数据', value: 'privacy@tianji.global' },
    ],
    footerNote: '© 2026 TianJi Global · 反思性关系指引，不是保证',
  },
  en: {
    eyebrow: 'Trust Center',
    title: 'Tianji Love — Method & Data Explained',
    subtitle:
      'We write this clearly: what Tianji Love delivers, how readings are generated, how your privacy is handled, and why results are reflective relationship guidance — not a guarantee.',
    backHome: 'Back to home',
    hello: 'Get in touch',
    helloEmail: 'hello@tianji.global',

    // What it does
    doesEyebrow: 'What Tianji Love does',
    doesTitle: 'Reflective relationship guidance, not fate prediction',
    doesBody:
      'Tianji Love transforms your birth information and question into a relationship pattern report. The report covers emotional rhythms, compatibility signals, timing windows, and practical guidance — based on classical frameworks of Zi Wei Dou Shu, Western astrology, and Tarot, with AI-generated prose.',
    doesItems: [
      {
        title: 'Birth info → reading',
        body: 'You provide birth date/time and a question. AI generates a relationship pattern analysis based on traditional frameworks.',
      },
      {
        title: 'Private inputs handled with care',
        body: 'Birth time and question text are used only for the current reading. They are never shared with third parties or used for ad targeting.',
      },
      {
        title: 'Results exportable, deletable',
        body: 'Every reading can be exported as PDF or JSON. You can also request complete deletion at any time.',
      },
      {
        title: 'Free tier completes a full reading',
        body: 'Free users get one complete relationship reading. Membership unlocks additional depth and frequency.',
      },
    ],

    // What it does NOT do
    doesNotEyebrow: 'What Tianji Love does not do',
    doesNotTitle: 'What it is not',
    doesNotBody: 'We actively state what Tianji Love cannot and will not do, so you can make an informed decision.',
    doesNotItems: [
      {
        title: 'No specific-event predictions',
        body: 'The report does not guarantee "you will reconcile in three months" or "this person is your destiny." Timing descriptions are observation windows, not date commitments.',
      },
      {
        title: 'No fortune-selling or anxiety commerce',
        body: 'We do not sell "what is your luck this year" or "how much is your fate worth." Results are not entertainment scores and are not used for medical, legal, or financial decisions.',
      },
      {
        title: 'AI does not decide for you',
        body: 'The algorithm will not say "you should break up or stay." The report provides pattern observation — the judgment is always yours.',
      },
      {
        title: 'No private data in shared links',
        body: 'Birth time, birth location, and timezone never appear in any share link or public result.',
      },
    ],

    // How readings are generated
    methodEyebrow: 'How readings are generated',
    methodTitle: 'High-level AI generation logic',
    methodBody:
      'When you submit a reading request, the system generates your report through the following steps. The full process is traceable, challengeable, and optional.',
    methodSteps: [
      {
        step: '01',
        title: 'Input assembly',
        body: 'Your birth date, time, question, and chosen method (Zi Wei, astrology, or Tarot) are assembled into a structured input. Birth time is precise to the minute and stored only in your account.',
      },
      {
        step: '02',
        title: 'Traditional framework calculation',
        body: 'The system calculates your horoscope, BaZi, or card spread using classical rules. This step is deterministic rule-based computation — no AI involved.',
      },
      {
        step: '03',
        title: 'AI report generation',
        body: 'Based on the calculated result and your question, an AI model generates prose: pattern analysis, timing signals, emotional compatibility, and actionable reflective guidance. The AI labels model source and version.',
      },
      {
        step: '04',
        title: 'Safety filtering and delivery',
        body: 'The report passes through a deterministic-language filter that strips "will definitely happen" or "guaranteed" phrasing. After generation, the result is stored as a private link you can choose to share or keep to yourself.',
      },
    ],

    // Why reflective guidance, not guaranteed
    guidanceEyebrow: 'Why reflective guidance',
    guidanceTitle: 'Results are a mirror, not a crystal ball',
    guidanceBody:
      'Every Tianji Love reading is "reflective relationship guidance." Here is what that means:',
    guidanceItems: [
      {
        title: 'Pattern observation, not fate declaration',
        body: 'The report describes your current relationship patterns and emotional rhythms. It is a thinking tool, not a fixed future.',
      },
      {
        title: 'Timing is a window, not a calendar',
        body: '"The next three months" is a window for reflection and action — not a promise that something will happen. You can actively influence the outcome.',
      },
      {
        title: 'The final judgment is yours',
        body: 'We will not tell you what to do. The report offers actionable reflective suggestions. The decision is always yours.',
      },
      {
        title: 'Challengeable, ignorable',
        body: 'If any reading feels wrong, you can challenge it, ignore it, or re-ask with a different question. No authority decides for you.',
      },
    ],
    guidanceNote:
      'Tianji Love readings do not constitute medical, legal, or financial advice. For significant decisions, consult a qualified professional.',

    // Privacy
    privacyEyebrow: 'Privacy & data',
    privacyTitle: 'How your birth information is handled',
    privacyBody:
      'Birth time is sensitive personal information. Here is how we handle privacy:',
    privacyItems: [
      {
        title: 'Used only for the current reading',
        body: 'Birth time is used only to calculate your chart. It is never used to train models, never shared with third parties, and never appears in any share link.',
      },
      {
        title: 'Updatable, correctable',
        body: 'Birth time, name, and other basics can be updated in your account at any time. Past readings retain a version trail.',
      },
      {
        title: 'Encrypted storage',
        body: 'All sensitive data is encrypted in transit and at rest. You can export or delete everything at any time.',
      },
    ],

    // Delete / Export / Contact
    dataEyebrow: 'Your data rights',
    dataTitle: 'Your data, always under your control',
    dataBody: 'These are your data rights. exercisable at any time, no reason required.',
    dataItems: [
      {
        title: 'View / Export',
        body: 'Every reading exports as PDF and as raw JSON. You can take everything with you.',
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

    // Contact
    contactEyebrow: 'More ways to reach us',
    contactTitle: 'Anything you need to ask — starts here.',
    contactItems: [
      { label: 'Product & features', value: 'hello@tianji.global' },
      { label: 'Billing & invoices', value: 'billing@tianji.global' },
      { label: 'Privacy & data', value: 'privacy@tianji.global' },
    ],
    footerNote: '© 2026 TianJi Global · Reflective relationship guidance, not a guarantee',
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

      {/* What Tianji Love does */}
      <LandingSection eyebrow={t.doesEyebrow} title={t.doesTitle} description={t.doesBody}>
        <div className="grid gap-6 sm:grid-cols-2">
          {t.doesItems.map((item) => (
            <GlassCard
              key={item.title}
              level="card"
              className="rounded-[1.75rem] border border-white/[0.06] bg-white/[0.025] p-7"
            >
              <div className="mb-3 text-[0.66rem] uppercase tracking-[0.26em] text-[rgba(212,175,119,0.62)]">
                {item.title}
              </div>
              <p className="text-sm leading-7 text-white/60">{item.body}</p>
            </GlassCard>
          ))}
        </div>
      </LandingSection>

      {/* What Tianji Love does NOT do */}
      <LandingSection eyebrow={t.doesNotEyebrow} title={t.doesNotTitle} description={t.doesNotBody}>
        <div className="grid gap-6 sm:grid-cols-2">
          {t.doesNotItems.map((item) => (
            <GlassCard
              key={item.title}
              level="card"
              className="rounded-[1.75rem] border border-white/[0.06] bg-white/[0.025] p-7"
            >
              <div className="mb-3 text-[0.66rem] uppercase tracking-[0.26em] text-[rgba(212,175,119,0.62)]">
                {item.title}
              </div>
              <p className="text-sm leading-7 text-white/60">{item.body}</p>
            </GlassCard>
          ))}
        </div>
      </LandingSection>

      {/* How readings are generated */}
      <LandingSection eyebrow={t.methodEyebrow} title={t.methodTitle} description={t.methodBody}>
        <div className="grid gap-6 sm:grid-cols-2">
          {t.methodSteps.map((step) => (
            <GlassCard
              key={step.step}
              level="card"
              className="rounded-[1.75rem] border border-white/[0.06] bg-white/[0.025] p-7"
            >
              <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(212,175,119,0.34)] text-[0.72rem] font-semibold tracking-[0.18em] text-[rgba(212,175,119,0.88)]">
                {step.step}
              </div>
              <h3 className="mb-3 font-serif text-xl text-white/92">{step.title}</h3>
              <p className="text-sm leading-7 text-white/60">{step.body}</p>
            </GlassCard>
          ))}
        </div>
      </LandingSection>

      {/* Why reflective guidance */}
      <LandingSection eyebrow={t.guidanceEyebrow} title={t.guidanceTitle} description={t.guidanceBody}>
        <div className="grid gap-6 sm:grid-cols-2">
          {t.guidanceItems.map((item) => (
            <GlassCard
              key={item.title}
              level="card"
              className="rounded-[1.75rem] border border-white/[0.06] bg-white/[0.025] p-7"
            >
              <div className="mb-3 text-[0.66rem] uppercase tracking-[0.26em] text-[rgba(212,175,119,0.62)]">
                {item.title}
              </div>
              <p className="text-sm leading-7 text-white/60">{item.body}</p>
            </GlassCard>
          ))}
        </div>
        <p className="mt-8 text-center text-sm italic text-white/40">{t.guidanceNote}</p>
      </LandingSection>

      {/* Privacy & data */}
      <LandingSection eyebrow={t.privacyEyebrow} title={t.privacyTitle} description={t.privacyBody}>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.privacyItems.map((item) => (
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
      </LandingSection>

      {/* Data rights */}
      <LandingSection eyebrow={t.dataEyebrow} title={t.dataTitle} description={t.dataBody}>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.dataItems.map((item) => (
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
