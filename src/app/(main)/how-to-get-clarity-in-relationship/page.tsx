'use client';

import {
  Brain,
  Compass,
  Eye,
  FileText,
  Heart,
  Lightbulb,
  MessageCircleHeart,
  Scale,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

import {
  TianjiLoveButton,
  TianjiLoveFooter,
  TianjiLoveHeader,
  TianjiLovePanel,
  TianjiLoveSectionTitle,
  TianjiLoveShell,
  getTianjiLoveFooterNav,
  getTianjiLovePrimaryNav,
} from '@/components/tianji-love';
import { useSyncedLanguage } from '@/hooks/useSyncedLanguage';
import { withLanguageParam } from '@/lib/language-routing';

const INTERNAL_LINKS = [
  { href: '/guide', labelEn: 'Guides', labelZh: '指南' },
  { href: '/love-test', labelEn: 'Love Test', labelZh: '感情测试' },
  { href: '/relationship-patterns-guide', labelEn: 'Patterns Guide', labelZh: '模式指南' },
  { href: '/about', labelEn: 'About', labelZh: '关于' },
];

const DISCLAIMER_EN =
  'tianji.love provides entertainment and self-reflection tools. Results are for reference only and do not constitute professional advice.';
const DISCLAIMER_ZH =
  'tianji.love 提供娱乐与自我探索工具，结果仅供参考，不构成专业建议。';

const FAQS = [
  {
    qEn: 'How do I know if I need more clarity in my relationship?',
    qZh: '如何判断我的感情是否需要更多清晰感？',
    aEn: 'You may need clarity if you find yourself constantly second-guessing your partner\'s intentions, feeling confused about where the relationship is heading, experiencing repeated misunderstandings, or feeling emotionally drained from uncertainty. A tarot reading or astrology consultation can help illuminate hidden dynamics.',
    aZh: '如果你发现自己经常猜测伴侣的意图、对关系的走向感到困惑、反复出现误解、或因不确定性而情绪疲惫，你可能需要更多清晰感。塔罗解读或星盘咨询可以帮助揭示隐藏的动态。',
  },
  {
    qEn: 'Can astrology really provide clarity about love?',
    qZh: '星盘真的能为爱情提供清晰感吗？',
    aEn: 'Astrology does not predict the future — but it reveals psychological patterns, timing cycles, and emotional needs that are often invisible in everyday life. By understanding your Venus (love style), Moon (emotional needs), and the current planetary transits, you gain a mirror that reflects what may be unconscious in your relationship.',
    aZh: '星盘不会预测未来——但它揭示了在日常生活中经常看不见的心理模式、时机周期和情感需求。通过了解你的金星（爱情风格）、月亮（情感需求）以及当前行星行运，你获得了一面镜子，反射出感情中可能无意识的部分。',
  },
  {
    qEn: 'How do planetary transits affect relationship clarity?',
    qZh: '行星行运如何影响感情清晰感？',
    aEn: 'Slow-moving planets like Saturn, Pluto, and Neptune trigger transformation periods that often bring hidden truths to the surface. When Saturn squares your Venus or Pluto opposes your Moon, confusion may intensify — but so does the opportunity to see what is really there. These periods are ideal for deep reflection, not hasty decisions.',
    aZh: '土星、冥王星和海王星等慢行行星会触发转化期，常常将隐藏的真相浮出水面。当土星与你的金星形成刑相位或冥王星与你的月亮形成对分相时，困惑可能会加剧——但看清真相的机会也随之增加。这些时期是深度反思的理想时机，而非仓促决定。',
  },
  {
    qEn: 'What is the difference between confusion and a sign to leave?',
    qZh: '困惑和离开的信号有什么区别？',
    aEn: 'Confusion is a temporary state that often signals growth — it means something is being stirred up that needs attention. A sign to leave is persistent: you feel consistently unsafe, unheard, or devalued despite clear communication. Trust the distinction between "I do not understand this" and "I understand but I cannot accept this."',
    aZh: '困惑是一种暂时的状态，通常标志着成长——它意味着有什么东西正在被搅动，需要被关注。离开的信号是持续的——尽管进行了清晰的沟通，你仍然感到持续的不安全、被忽视或被贬低。相信「我不理解」和「我理解但我无法接受」之间的区别。',
  },
  {
    qEn: 'How long does it take to gain clarity in a relationship?',
    qZh: '在感情中获得清晰感需要多长时间？',
    aEn: 'Genuine clarity rarely comes in a single moment — it emerges through honest self-inquiry over weeks or months. Astrology can accelerate this by revealing the themes and timing at play. Tarot offers a snapshot of the current energetic reality. Both tools point you toward truth; the inner work of integration is yours.',
    aZh: '真正的清晰感很少在一个单一时刻到来——它通过几周或几个月的诚实自我探索逐渐显现。星盘可以通过揭示正在起作用的主题和时机来加速这个过程。塔罗提供当前能量现实的快照。两者都指向真相；内在整合的工作是你自己的。',
  },
];

const SIGNS_YOU_NEED_CLARITY = [
  {
    icon: Eye,
    titleEn: 'Constant Second-Guessing',
    titleZh: '不断怀疑自己',
    descEn: 'You replay conversations obsessively, wondering if your partner meant something different than what they said.',
    descZh: '你反复重温对话，怀疑你的伴侣是否表达了与话语不同的意思。',
  },
  {
    icon: Compass,
    titleEn: 'Lost Direction',
    titleZh: '迷失方向',
    descEn: 'You cannot see where the relationship is heading — no clear commitment, no honest conversation about the future.',
    descZh: '你看不到感情的走向——没有明确的承诺，没有关于未来的诚实对话。',
  },
  {
    icon: Scale,
    titleEn: 'Imbalanced Effort',
    titleZh: '付出失衡',
    descEn: 'One person is always giving more. You feel like you are carrying the emotional weight alone.',
    descZh: '一方总是付出更多。你感到自己独自承担着情感重量。',
  },
  {
    icon: MessageCircleHeart,
    titleEn: 'Communication Breakdown',
    titleZh: '沟通断裂',
    descEn: 'You argue about the same things repeatedly with no resolution, or have stopped talking about what truly matters.',
    descZh: '你们反复为同样的事情争吵却没有解决，或者已经停止谈论真正重要的事情。',
  },
];

const HOW_TO_GAIN_CLARITY = [
  {
    icon: FileText,
    titleEn: 'Name What You Feel',
    titleZh: '命名你的感受',
    itemsEn: [
      'Write down the facts of the situation without interpretation ("He canceled Friday again")',
      'Then write how it made you feel ("I feel like I am not a priority")',
      'Separate the story you are telling from the raw data of experience',
    ],
    itemsZh: [
      '写下情况的客观事实，不做解读（「他再次取消了周五的约会」）',
      '然后写下你的感受（「我感觉自己不是优先选项」）',
      '将你讲的故事与原始体验分开',
    ],
  },
  {
    icon: Brain,
    titleEn: 'Identify the Pattern',
    titleZh: '识别模式',
    itemsEn: [
      'Have you felt this way before — in this relationship or past ones?',
      'Is this an old wound being activated, or something genuinely wrong now?',
      'Ask: "Is this pattern familiar from my childhood?"',
    ],
    itemsZh: [
      '你之前是否有过这种感觉——在这段感情中或过去的感情中？',
      '这是一个旧伤口被激活了，还是现在真的有什么不对劲？',
      '问自己：「这个模式是否来自我的童年？」',
    ],
  },
  {
    icon: Eye,
    titleEn: 'Seek Outside Perspective',
    titleZh: '寻求外部视角',
    itemsEn: [
      'Talk to a trusted friend who can hold space without judgment',
      'Consult a therapist or counselor specializing in relationships',
      'Try a tarot reading or astrology consultation for symbolic reflection',
    ],
    itemsZh: [
      '与值得信赖的朋友交谈，他们可以提供不带评判的空间',
      '咨询专门从事关系治疗的治疗师或咨询师',
      '尝试塔罗解读或星盘咨询以获得象征性的反思',
    ],
  },
  {
    icon: Heart,
    titleEn: 'Ask the Hard Questions',
    titleZh: '问出难题',
    itemsEn: [
      '"Am I staying because I love them — or because I am afraid of being alone?"',
      '"Would I want this relationship if nothing changed in the next five years?"',
      '"What would I advise a close friend in my situation?"',
    ],
    itemsZh: [
      '「我留下来是因为我爱他们——还是因为我害怕孤独？」',
      '「如果未来五年一切照旧，我还会想要这段感情吗？」',
      '「如果一个亲密的朋友处于我的情况，我会给她什么建议？」',
    ],
  },
];

export default function HowToGetClarityInRelationshipPage() {
  const [language, setLanguage] = useSyncedLanguage('en');

  const t = (en: string, zh: string) => (language === 'zh' ? zh : en);
  const navItems = getTianjiLovePrimaryNav(language);
  const footerLinks = getTianjiLoveFooterNav(language);
  const href = (path: string) => withLanguageParam(path, language);

  const toggleLanguage = () => {
    const next = language === 'zh' ? 'en' : 'zh';
    setLanguage(next);
  };

  const faqPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: t(faq.qEn, faq.qZh),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(faq.aEn, faq.aZh),
      },
    })),
  };

  return (
    <TianjiLoveShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />

      <TianjiLoveHeader
        homeHref={href('/')}
        navItems={navItems}
        cta={{ label: t('Start Love Reading', '开始关系解读'), href: href('/relationship/new') }}
        languageLabel={language === 'zh' ? 'EN' : '中文'}
        onLanguageToggle={toggleLanguage}
      />

      {/* Hero */}
      <section className="relative z-10 px-5 pt-20 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-[#d8b77b]/64">
            {t('Self-Awareness · Clarity · Truth', '自我觉察 · 清晰 · 真相')}
          </p>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-[#ffe3b4] sm:text-5xl">
            {t('How to Get Clarity in Your Relationship', '如何在感情中获得清晰感')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-[#f4d7a3]/72">
            {t(
              'Confusion in love is not a sign of weakness — it is a signal that something hidden needs to be seen. Learn how to cut through uncertainty with astrology, honest self-inquiry, and practical tools.',
              '感情中的困惑不是软弱的标志——它是一个信号，表明有些隐藏的东西需要被看见。学习如何通过星盘、诚实的自我探索和实用工具来穿透不确定性。'
            )}
          </p>
        </div>
      </section>

      {/* What Is Clarity */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 py-16 sm:px-8">
        <TianjiLoveSectionTitle
          title={t('What Is Clarity in a Relationship?', '感情中的清晰感是什么？')}
          eyebrow={t('Definition', '定义')}
        />
        <TianjiLovePanel className="mt-6 p-6">
          <p className="text-sm leading-relaxed text-[#f4d7a3]/72">
            {t(
              'Clarity is not certainty that nothing will go wrong — it is the confidence to see what is actually there. A clear relationship means both partners have an honest, shared understanding of where they stand, what they want, and what they are building together.',
              '清晰感不是确信一切都不会出错——而是有信心看到真实的情况。一段清晰的感情意味着双方对彼此的立场、想要什么、以及正在共同建设什么有诚实、共同的理解。'
            )}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-[#f4d7a3]/72">
            {t(
              'Clarity requires courage. It means being willing to ask the questions you have been avoiding, to hear answers you may not want, and to sit with discomfort while truth emerges. Astrology cannot give you clarity — but it can show you where to look.',
              '清晰感需要勇气。它意味着愿意问出你一直在回避的问题，愿意听到你可能不想听的答案，并在真相浮现时承受不适。星盘不能给你清晰感——但它可以告诉你该看向哪里。'
            )}
          </p>
        </TianjiLovePanel>
      </section>

      {/* Signs You Need Clarity */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <TianjiLoveSectionTitle
          title={t('Signs You Need More Clarity', '你需要更多清晰感的迹象')}
          eyebrow={t('Recognition', '识别')}
        />
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {SIGNS_YOU_NEED_CLARITY.map((sign) => {
            const Icon = sign.icon;
            return (
              <TianjiLovePanel key={sign.titleEn} className="flex flex-col p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#b57248]/38 bg-[#0a1020]/66">
                  <Icon className="h-6 w-6 text-[#d8b77b]" aria-hidden />
                </div>
                <h3 className="font-serif text-lg font-semibold text-[#ffe3b4]">
                  {t(sign.titleEn, sign.titleZh)}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#f4d7a3]/62">
                  {t(sign.descEn, sign.descZh)}
                </p>
              </TianjiLovePanel>
            );
          })}
        </div>
      </section>

      {/* How Astrology Helps */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <TianjiLoveSectionTitle
          title={t('How Astrology Helps You See Clearly', '星盘如何帮助你看清')}
          eyebrow={t('Cosmic Mirror', '宇宙之镜')}
        />
        <TianjiLovePanel className="mt-6 p-6">
          <p className="text-sm leading-relaxed text-[#f4d7a3]/72">
            {t(
              'When emotion clouds judgment, symbolism can cut through. Astrology does not make decisions for you — but it reveals the hidden architecture of your relationship dynamics:',
              '当情绪蒙蔽判断时，象征符号可以穿透迷雾。星盘不会替你做决定——但它揭示了你关系动态的隐藏架构：'
            )}
          </p>
          <ul className="mt-4 space-y-3 text-sm text-[#f4d7a3]/72">
            <li className="flex gap-3">
              <span className="font-semibold text-[#d8b77b]">☽ Moon:</span>
              {t('What emotional needs you are seeking to have met — and where your sensitivity lies.', '你在寻求满足什么情感需求——以及你的敏感点在哪里。')}
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-[#d8b77b]">♀ Venus:</span>
              {t('Your love language and what you genuinely need from a partner, beyond习惯了.', '你的爱情语言以及你真正从伴侣那里需要的，不只是习惯。')}
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-[#d8b77b]">☿ Mercury:</span>
              {t('How you and your partner communicate — and where misunderstandings originate.', '你和伴侣如何沟通——以及误解从哪里产生。')}
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-[#d8b77b]">⚹ Juno:</span>
              {t('Your vision of a committed partnership and what fidelity means to you.', '你对忠诚伴侣关系的愿景以及忠诚对你意味着什么。')}
            </li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-[#f4d7a3]/72">
            {t(
              'Current planetary transits act as timing indicators. When slow-moving planets aspect your relationship points, it is often a period of surfacing — hidden dynamics come to light, for better or for worse. Use these windows for honest reflection, not impulsive action.',
              '当前行星行运作为时机指标。当慢行行星与你的关系点形成相位时，这通常是一个浮现期——隐藏的动态会显露出来，无论好坏。利用这些窗口进行诚实的反思，而不是冲动的行动。'
            )}
          </p>
        </TianjiLovePanel>
      </section>

      {/* AdSense placeholder */}
      <div id="clarity-relationship-ads" className="relative z-10 mx-auto max-w-7xl px-5 py-8 sm:px-8" />

      {/* How to Gain Clarity */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <TianjiLoveSectionTitle
          title={t('How to Gain Clarity', '如何获得清晰感')}
          eyebrow={t('Practical Steps', '实用步骤')}
        />
        <div className="mt-6 space-y-6">
          {HOW_TO_GAIN_CLARITY.map((step) => {
            const Icon = step.icon;
            return (
              <TianjiLovePanel key={step.titleEn} className="flex flex-col p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#b57248]/38 bg-[#0a1020]/66">
                    <Icon className="h-5 w-5 text-[#d8b77b]" aria-hidden />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-[#ffe3b4]">
                    {t(step.titleEn, step.titleZh)}
                  </h3>
                </div>
                <ul className="mt-3 space-y-2">
                  {(language === 'zh' ? step.itemsZh : step.itemsEn).map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-[#f4d7a3]/62">
                      <span className="text-[#d8b77b]">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </TianjiLovePanel>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-5 pb-8 sm:px-8">
        <TianjiLovePanel className="mx-auto max-w-3xl p-8 text-center">
          <Lightbulb className="mx-auto mb-4 h-10 w-10 text-[#d8b77b]" aria-hidden />
          <h2 className="font-serif text-2xl font-semibold text-[#ffe3b4]">
            {t('Ready for a deeper look?', '准备好更深入地了解了吗？')}
          </h2>
          <p className="mt-3 text-sm text-[#f4d7a3]/62">
            {t(
              'A personalized love reading can reveal the hidden dynamics in your relationship and help you see what clarity is trying to emerge.',
              '个性化的爱情解读可以揭示你感情中隐藏的动态，帮助你看到正在浮现的清晰感。'
            )}
          </p>
          <TianjiLoveButton href={href('/relationship/new')} className="mt-6">
            {t('Get Your Love Reading', '获取你的爱情解读')}
            <Sparkles className="ml-2 h-4 w-4" aria-hidden />
          </TianjiLoveButton>
        </TianjiLovePanel>
      </section>

      {/* FAQ */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 pb-8 sm:px-8">
        <TianjiLoveSectionTitle
          title={t('Frequently Asked Questions', '常见问题')}
          eyebrow={t('FAQ', '问答')}
        />
        <div className="mt-8 space-y-4">
          {FAQS.map((faq, i) => (
            <TianjiLovePanel key={i} className="p-6">
              <h3 className="font-serif text-base font-semibold text-[#ffe3b4]">
                {t(faq.qEn, faq.qZh)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#f4d7a3]/62">
                {t(faq.aEn, faq.aZh)}
              </p>
            </TianjiLovePanel>
          ))}
        </div>
      </section>

      {/* Internal Links */}
      <nav className="relative z-10 flex justify-center gap-8 pb-8 text-sm text-[#f4d7a3]/56">
        {INTERNAL_LINKS.map((link) => (
          <Link key={link.href} href={href(link.href)} className="transition hover:text-[#ffe3b4]">
            {t(link.labelEn, link.labelZh)}
          </Link>
        ))}
      </nav>

      <TianjiLoveFooter
        disclaimer={t(DISCLAIMER_EN, DISCLAIMER_ZH)}
        links={footerLinks}
        homeHref={href('/')}
      />
    </TianjiLoveShell>
  );
}
