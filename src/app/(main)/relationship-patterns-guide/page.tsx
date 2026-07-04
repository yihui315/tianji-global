'use client';

export async function generateMetadata() {
  return {
    title: 'Relationship Patterns Guide — Recognize Attachment Styles & Healing Cycles | Tianji Love',
    description: 'Discover the repeating patterns shaping your love life. Learn to identify attachment styles, communication loops, and timing cycles through astrology.',
    alternates: {
      languages: {
        'en': '/relationship-patterns-guide',
        'zh-CN': '/zh-CN/relationship-patterns-guide',
        'x-default': '/relationship-patterns-guide',
      },
    },
  };
}

import {
  Brain,
  Compass,
  FileText,
  Heart,
  Lightbulb,
  MessageCircleHeart,
  RefreshCw,
  Scale,
  Sparkles,
  Users,
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
import { AdSenseSlot } from '@/components/ads/AdSenseSlot';
import { AffiliateProductGrid } from '@/components/affiliate/AffiliateProductGrid';

const INTERNAL_LINKS = [
  { href: '/guide', labelEn: 'Guides', labelZh: '指南' },
  { href: '/love-test', labelEn: 'Love Test', labelZh: '感情测试' },
  { href: '/about', labelEn: 'About', labelZh: '关于' },
  { href: '/services', labelEn: 'Services', labelZh: '服务' },
];

const DISCLAIMER_EN =
  'tianji.love provides entertainment and self-reflection tools. Results are for reference only and do not constitute professional advice.';
const DISCLAIMER_ZH =
  'tianji.love 提供娱乐与自我探索工具，结果仅供参考，不构成专业建议。';

const FAQS = [
  {
    qEn: 'How do I know if I have a repeating relationship pattern?',
    qZh: '如何判断自己是否有重复的感情模式？',
    aEn: 'You may have a repeating pattern if you notice similar dynamics across multiple relationships — for example, always feeling anxious when a partner needs space, or consistently attracting partners who are emotionally unavailable. Journaling about each relationship and noticing themes can reveal these cycles.',
    aZh: '如果你在多段感情中注意到相似的动态，例如总是在伴侣需要空间时感到焦虑，或者总是被情感疏离的伴侣吸引，这可能说明你存在重复模式。记录每段感情的日志并注意主题，有助于揭示这些循环。',
  },
  {
    qEn: 'Can astrology really help me understand my relationship patterns?',
    qZh: '星盘真的能帮助我理解感情模式吗？',
    aEn: 'Astrology offers a symbolic language for understanding behavioral tendencies. Your birth chart — particularly the Moon (emotional needs), Venus (love style), Mars (how you pursue desires), and the 7th House — reveals deep-seated patterns. Transit periods can also trigger pattern surfacing, helping you see what needs healing.',
    aZh: '星盘提供了一种象征性语言来理解行为倾向。你的出生图——尤其是月亮（情感需求）、金星（爱情风格）、火星（如何追求欲望）以及第七宫——揭示了根深蒂固的模式。行运周期也可以触发模式浮现，帮助你看到需要疗愈的部分。',
  },
  {
    qEn: 'What is the difference between anxious and avoidant attachment?',
    qZh: '焦虑型依恋和回避型依恋有什么区别？',
    aEn: 'Anxious attachment develops when caregiving was inconsistent — you learned to hypervigilantly monitor relationships for signs of abandonment. Avoidant attachment develops when emotional expression was discouraged — you learned to self-reliance and view intimacy as a threat. Many people swing between both, known as anxious-avoidant or disorganized attachment.',
    aZh: '焦虑型依恋在照顾不一致时形成——你学会了高度警惕地监控关系中的遗弃迹象。回避型依恋在情绪表达被抑制时形成——你学会了自给自足，并将亲密视为威胁。许多人在两者之间摇摆，称为焦虑-回避型或混乱型依恋。',
  },
  {
    qEn: 'When should I seek professional help for my relationship patterns?',
    qZh: '我何时应该寻求专业帮助来处理感情模式？',
    aEn: 'Seek therapy if patterns cause significant distress, lead to harmful relationships, create co-dependency, or result in repeated heartbreak. A licensed therapist or counselor specializing in attachment trauma can help you rewrite these patterns at their root. Astrology can guide self-awareness, but deep healing often benefits from professional support.',
    aZh: '如果模式造成严重困扰、导致有害的感情关系、产生依赖共生或反复经历心碎，建议寻求治疗。与依恋创伤相关的持证治疗师或咨询师可以帮助你从根本上改写这些模式。星盘可以促进自我觉察，但深度疗愈通常需要专业支持。',
  },
  {
    qEn: 'How long does it take to change a relationship pattern?',
    qZh: '改变感情模式需要多长时间？',
    aEn: 'Pattern change is a process, not an event. With consistent self-awareness work — journaling, therapy, conscious dating choices — most people notice shifts within 3–6 months. Deeper core beliefs may take longer. Astrology transits, particularly Saturn returns and Pluto transits, often mark powerful windows for transformation.',
    aZh: '模式改变是一个过程，而不是一个事件。通过持续的自我觉察工作——记录、治疗、有意识的约会选择——大多数人在3–6个月内注意到变化。更深层的核心信念可能需要更长时间。星盘行运，特别是土星回归和冥王星行运，通常标志着有力的转化窗口。',
  },
];

const COMMON_PATTERNS = [
  {
    icon: RefreshCw,
    titleEn: 'Push-Pull Cycles',
    titleZh: '推拉循环',
    descEn: 'One partner pursues while the other retreats, then they switch roles. This creates an addictive dynamic that feels intense but prevents real intimacy.',
    descZh: '一方追求，另一方后退，然后角色互换。这创造了一种令人上瘾的动态，感觉强烈但阻碍真正的亲密。',
  },
  {
    icon: Scale,
    titleEn: 'Anxious–Avoidant Seesaw',
    titleZh: '焦虑-回避跷跷板',
    descEn: 'The anxious partner clings while the avoidant partner withdraws. Both are trying to regulate their nervous system, but neither feels safe.',
    descZh: '焦虑型依附，另一方退缩。两者都在试图调节神经系统，但都没有感到安全。',
  },
  {
    icon: Sparkles,
    titleEn: 'Familiar Chemistry',
    titleZh: '熟悉的化学反应',
    descEn: 'You are drawn to what feels "normal" based on childhood templates. Someone exciting but unstable may feel like home — until the pattern breaks down.',
    descZh: '你被「正常」的感觉所吸引，这基于童年模板。令人兴奋但不稳定的伴侣可能感觉像家——直到模式崩溃。',
  },
  {
    icon: Heart,
    titleEn: 'Compatibility Trap',
    titleZh: '适合陷阱',
    descEn: 'Choosing partners who are safe, comfortable, and predictable — but缺乏激情。 Long-term compatibility matters, but ignoring chemistry entirely can leave you feeling numb.',
    descZh: '选择安全、舒适、可预测的伴侣——但缺乏激情。长期适合很重要，但完全忽视化学反应会让你感到麻木。',
  },
];

const PRACTICAL_EXERCISES = [
  {
    icon: FileText,
    titleEn: 'Pattern Journal',
    titleZh: '模式日记',
    itemsEn: [
      'List 3 past relationships and note the common emotional theme (e.g., "I always feel unworthy")',
      'Identify the earliest memory where you felt that feeling',
      'Write a letter to your younger self, then re-read it from that self\'s perspective',
    ],
    itemsZh: [
      '列出3段过去的感情，记录共同的情绪主题（例如「我总是感到不值得」）',
      '找出你最早感到这种感受的记忆',
      '给年幼的自己写一封信，然后从那个自我的角度重新阅读',
    ],
  },
  {
    icon: MessageCircleHeart,
    titleEn: 'Conversation Starters',
    titleZh: '对话启动器',
    itemsEn: [
      '"What\'s something you need from me that you\'ve never asked for?"',
      '"What does a healthy argument look like to you?"',
      '"When do you feel most connected to me?"',
    ],
    itemsZh: [
      '「有什么事情是你需要但从未开口要求的？」',
      '「你认为健康的争论是什么样的？」',
      '「你在什么时候最感到与我连接？」',
    ],
  },
  {
    icon: Compass,
    titleEn: 'Reflection Questions',
    titleZh: '反思问题',
    itemsEn: [
      'Am I choosing this person because of who they are — or who they need me to be?',
      'Do I feel more myself around them, or less?',
      'Is this relationship healing my childhood wound or reopening it?',
    ],
    itemsZh: [
      '我选择这个人是因为他们是谁——还是因为他们需要我成为谁？',
      '我在他们身边感到更真实，还是更不真实？',
      '这段感情是在疗愈我童年的伤口，还是在重新揭开它？',
    ],
  },
];

export default function RelationshipPatternsGuidePage() {
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
            {t('Self-Awareness · Growth · Healing', '自我觉察 · 成长 · 疗愈')}
          </p>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-[#ffe3b4] sm:text-5xl">
            {t('Relationship Patterns Guide', '感情模式指南')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-[#f4d7a3]/72">
            {t(
              'Discover the repeating patterns that shape your love life. Learn to recognize attachment styles, communication loops, and timing cycles — and how astrology reveals them.',
              '发现塑造你感情生活的重复模式。学习识别依恋风格、沟通循环和时机周期——以及星盘如何揭示它们。'
            )}
          </p>
        </div>
      </section>

      {/* What Are Relationship Patterns */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 py-16 sm:px-8">
        <TianjiLoveSectionTitle
          title={t('What Are Relationship Patterns?', '什么是感情模式？')}
          eyebrow={t('Introduction', '引言')}
        />
        <TianjiLovePanel className="mt-6 p-6">
          <p className="text-sm leading-relaxed text-[#f4d7a3]/72">
            {t(
              'Relationship patterns are the repeating emotional and behavioral scripts we carry into every connection. They are formed in childhood, shaped by how our caregivers met (or failed to meet) our needs. Once formed, they operate like invisible blueprints — drawing us toward certain types of partners, triggering predictable conflicts, and creating familiar cycles of joy and pain.',
              '感情模式是我们带入每段关系的重复情感和行为脚本。它们在童年形成，受照顾者如何满足或未能满足我们的需求所塑造。一旦形成，它们像无形的蓝图一样运作——吸引我们走向特定类型的伴侣，触发可预测的冲突，以及创造熟悉的喜悦与痛苦循环。'
            )}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-[#f4d7a3]/72">
            {t(
              'The good news: patterns can be recognized. And once recognized, they can be changed. Astrology offers a powerful mirror for this work — your birth chart holds the keys to understanding your attachment style, love language, and the specific wounds waiting to be healed.',
              '好消息是：模式可以被识别。一旦被识别，它们就可以被改变。星盘为这项工作提供了一个有力的镜子——你的出生图持有理解你的依恋风格、爱情语言以及等待疗愈的特定创伤的钥匙。'
            )}
          </p>
        </TianjiLovePanel>
      </section>

      {/* Common Patterns */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <TianjiLoveSectionTitle
          title={t('Common Patterns', '常见模式')}
          eyebrow={t('Recognition', '识别')}
        />
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {COMMON_PATTERNS.map((pattern) => {
            const Icon = pattern.icon;
            return (
              <TianjiLovePanel key={pattern.titleEn} className="flex flex-col p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#b57248]/38 bg-[#0a1020]/66">
                  <Icon className="h-6 w-6 text-[#d8b77b]" aria-hidden />
                </div>
                <h3 className="font-serif text-lg font-semibold text-[#ffe3b4]">
                  {t(pattern.titleEn, pattern.titleZh)}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#f4d7a3]/62">
                  {t(pattern.descEn, pattern.descZh)}
                </p>
              </TianjiLovePanel>
            );
          })}
        </div>
      </section>

      {/* AdSense placeholder */}
      <div id="patterns-guide-ads" className="relative z-10 mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <AdSenseSlot slot="PATTERNS_GUIDE_SLOT" format="in-article" page="relationship-patterns-guide" />
      </div>

      {/* How Astrology Reveals Patterns */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <TianjiLoveSectionTitle
          title={t('How Astrology Reveals Patterns', '星盘如何揭示模式')}
          eyebrow={t('Cosmic Mirror', '宇宙之镜')}
        />
        <TianjiLovePanel className="mt-6 p-6">
          <p className="text-sm leading-relaxed text-[#f4d7a3]/72">
            {t(
              'Your birth chart is not a prediction — it is a map of psychological tendencies. Certain placements act as windows into your relationship patterns:',
              '你的出生图不是预测——它是心理倾向的地图。某些配置作为洞察感情模式的窗口：'
            )}
          </p>
          <ul className="mt-4 space-y-3 text-sm text-[#f4d7a3]/72">
            <li className="flex gap-3">
              <span className="font-semibold text-[#d8b77b]">☽ Moon:</span>
              {t('Your emotional needs and how you seek security in connection.', '你的情感需求以及如何在关系中寻求安全感。')}
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-[#d8b77b]">♀ Venus:</span>
              {t('Your love language, what you find attractive, and how you give affection.', '你的爱情语言，你被什么吸引，以及你如何给予关爱。')}
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-[#d8b77b]">♂ Mars:</span>
              {t('How you pursue desires and assert yourself in relationships.', '你如何追求欲望并在关系中维护自己。')}
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-[#d8b77b]">⑦ 7th House:</span>
              {t('Your partnership style and the qualities you are attracted to in others.', '你的合作关系风格以及你被他人的哪些特质吸引。')}
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-[#d8b77b]">✧ Chiron:</span>
              {t('Your deepest relationship wound — and where healing is possible.', '你最深的感情创伤——以及疗愈可能发生的地方。')}
            </li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-[#f4d7a3]/72">
            {t(
              'Transits — the current movement of planets — act as timing signals. When slow-moving planets like Saturn, Pluto, or Neptune cross your 7th House or aspect your Venus/Moon, old patterns often surface for examination. These are not punishments — they are invitations to grow.',
              '行运——行星当前的运动——作为时机信号。当土星、冥王星或海王星等慢行行星经过你的第七宫或与你的金星/月亮形成相位时，旧模式通常会浮出水面等待审视。这些不是惩罚——它们是成长的邀请。'
            )}
          </p>
        </TianjiLovePanel>
      </section>

      {/* Practical Exercises */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <TianjiLoveSectionTitle
          title={t('Practical Exercises', '实用练习')}
          eyebrow={t('Do the Work', '付诸行动')}
        />
        <div className="mt-6 space-y-6">
          {PRACTICAL_EXERCISES.map((exercise) => {
            const Icon = exercise.icon;
            return (
              <TianjiLovePanel key={exercise.titleEn} className="flex flex-col p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#b57248]/38 bg-[#0a1020]/66">
                    <Icon className="h-5 w-5 text-[#d8b77b]" aria-hidden />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-[#ffe3b4]">
                    {t(exercise.titleEn, exercise.titleZh)}
                  </h3>
                </div>
                <ul className="mt-3 space-y-2">
                  {(language === 'zh' ? exercise.itemsZh : exercise.itemsEn).map((item, i) => (
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
            {t('Ready to go deeper?', '准备好深入了吗？')}
          </h2>
          <p className="mt-3 text-sm text-[#f4d7a3]/62">
            {t(
              'A personalized love reading can reveal your specific patterns, timing windows, and actionable steps for healing.',
              '个性化的爱情解读可以揭示你的特定模式、时机窗口和疗愈的可操作步骤。'
            )}
          </p>
          <TianjiLoveButton href={href('/relationship/new')} className="mt-6">
            {t('Get Your Love Reading', '获取你的爱情解读')}
            <Sparkles className="ml-2 h-4 w-4" aria-hidden />
          </TianjiLoveButton>
        </TianjiLovePanel>
      </section>

      {/* When to Seek Deeper Help */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <TianjiLoveSectionTitle
          title={t('When to Seek Deeper Help', '何时寻求更深入的帮助')}
          eyebrow={t('Professional Support', '专业支持')}
        />
        <TianjiLovePanel className="mt-6 p-6">
          <p className="text-sm leading-relaxed text-[#f4d7a3]/72">
            {t(
              'Self-awareness through astrology and journaling is powerful — but some patterns are rooted in trauma that benefits from clinical support. Consider reaching out to a licensed therapist if you experience:',
              '通过星盘和日记进行自我觉察是有力的——但有些模式根植于创伤，需要临床支持。如果你遇到以下情况，考虑联系持证治疗师：'
            )}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-[#f4d7a3]/72">
            <li className="flex gap-2">
              <span className="text-[#d8b77b]">•</span>
              {t('Repeated patterns of abusive or toxic relationships', '反复出现虐待或有害的感情关系模式')}
            </li>
            <li className="flex gap-2">
              <span className="text-[#d8b77b]">•</span>
              {t('Inability to trust after betrayal or loss', '在背叛或失去后无法信任')}
            </li>
            <li className="flex gap-2">
              <span className="text-[#d8b77b]">•</span>
              {t('Co-dependency, people-pleasing, or losing yourself in relationships', '依赖共生、讨好型人格或在感情中失去自我')}
            </li>
            <li className="flex gap-2">
              <span className="text-[#d8b77b]">•</span>
              {t('Persistent anxiety, depression, or panic related to attachment', '与依恋相关的持续焦虑、抑郁或恐慌')}
            </li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-[#f4d7a3]/72">
            {t(
              'Therapy + astrology together create a powerful combination: astrology reveals the pattern, therapy heals the wound.',
              '治疗+星盘结合会产生强大的组合：星盘揭示模式，治疗疗愈创伤。'
            )}
          </p>
        </TianjiLovePanel>
      </section>

      {/* AdSense placeholder */}
      <div id="patterns-guide-ads" className="relative z-10 mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <AdSenseSlot slot="PATTERNS_GUIDE_BOTTOM_SLOT" format="display" page="relationship-patterns-guide" />
      </div>

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

            {/* Affiliate Products */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <AffiliateProductGrid page="relationship-patterns-guide" />
      </section>

      <TianjiLoveFooter
        disclaimer={t(DISCLAIMER_EN, DISCLAIMER_ZH)}
        links={footerLinks}
        homeHref={href('/')}
      />
    </TianjiLoveShell>
  );
}
