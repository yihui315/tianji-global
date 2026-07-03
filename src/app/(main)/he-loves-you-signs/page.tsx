'use client';

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
  { href: '/love-test', labelEn: 'Love Test', labelZh: '感情测试' },
  { href: '/ask', labelEn: 'Ask a Question', labelZh: '提问' },
  { href: '/guide', labelEn: 'All Guides', labelZh: '全部指南' },
  { href: '/pricing', labelEn: 'Pro Access', labelZh: 'Pro 会员' },
];

const DISCLAIMER_EN =
  'tianji.love provides entertainment and self-reflection tools. Results are for reference only and do not constitute professional advice.';
const DISCLAIMER_ZH =
  'tianji.love 提供娱乐与自我探索工具，结果仅供参考，不构成专业建议。';

const SIGNS = [
  {
    titleEn: 'He Remembers the Small Things',
    titleZh: '他记得细节',
    descEn:
      'A man in love pays attention to what you say — even the throwaway comments. He recalls your favorite coffee order, that story you mentioned once, the name of your childhood pet. This isn\'t accidental charm; it\'s his brain filing you under "matters."',
    descZh:
      '一个陷入爱情的男人会留意你说过的话——即便是随口一说的内容。他记得你喜欢的咖啡、你某次提到的故事、你童年宠物的名字。这不是刻意的讨好，而是他把你放在了"重要"的位置。',
    icon: '🧠',
  },
  {
    titleEn: 'He Makes Time, Even When He\'s Busy',
    titleZh: '再忙也会为你腾出时间',
    descEn:
      'Truly busy people still find minutes for what matters to them. If he consistently carves out space for you — even a quick voice note, even a short call — that space is being taken from somewhere else. Watch where he draws the line.',
    descZh:
      '真正忙碌的人仍会为在意的人找到时间。如果他持续为你留出空间——即使是一条语音、一通短电话——那时间是从别处挤出来的。观察他在哪里画线。',
    icon: '⏰',
  },
  {
    titleEn: 'His Body Language Changes Around You',
    titleZh: '他在你面前身体语言会变',
    descEn:
      'Men typically narrow their body language when they\'re comfortable; they expand it when they\'re trying to impress or connect. Watch for: facing you fully, uncrossed arms, leaning in, finding reasons to be physically near. Unconscious orientation is one of the most reliable tells.',
    descZh:
      '男人在放松时身体语言会变窄；在想要吸引或靠近时则会展开。观察：是否完全面向你、手臂是否张开、是否身体前倾、是否找理由靠近。身体的无意识朝向是最可靠的信号之一。',
    icon: '💓',
  },
  {
    titleEn: 'He Includes You in His Future',
    titleZh: '他把你放进未来规划',
    descEn:
      'Subtle future-talk is different from grand declarations. "We should try that restaurant sometime" vs. just "that restaurant is good." He references future events with you as an assumption, not a question. This language pattern — "when we go," not "if we go" — is significant.',
    descZh:
      '含蓄的未来话语和宏大宣言不同。"我们改天可以去那家餐厅" vs 只是"那家餐厅不错"。他在提到未来时默认你在场——"我们去的时候"而非"如果我们去的话"。这种语言模式很重要。',
    icon: '🔮',
  },
  {
    titleEn: 'He\'s Curious About Your Inner World',
    titleZh: '他对你内心世界好奇',
    descEn:
      'Surface attraction focuses on appearance and shared activities. Love wants to understand your fears, your dreams, your "why." If he asks questions that go deeper than what you do into why you think and feel the way you do — he\'s investing emotionally, not just romantically.',
    descZh:
      '表面的吸引关注外表和共同活动。爱情想要理解你的恐惧、梦想和"为什么"。如果他问的问题超越你在做什么，深入到你的思考和感受模式——他在情感上投入了，而不只是浪漫上。',
    icon: '🌙',
  },
  {
    titleEn: 'He Shows Vulnerability With You',
    titleZh: '他对你展现脆弱',
    descEn:
      'This is one of the clearest signals — and one of the most frightening for many men. Sharing failures, fears, or insecurities requires trust. A man who lets you see the parts of himself he doesn\'t show everyone is making a quiet declaration.',
    descZh:
      '这是最清晰的信号之一——也是许多男人最害怕的。分享失败、恐惧或不安全感需要信任。一个让你看到他不会展示给所有人的那一面的人，正在默默宣告着什么。',
    icon: '🪞',
  },
];

const ASTROLOGY_INSIGHTS = [
  {
    titleEn: 'Venus in His Chart',
    titleZh: '他星盘中的金星',
    descEn:
      'Venus describes how a man experiences and expresses love. A man with Venus in Cancer loves protectively and domestically; Venus in Aries is direct and competitive in romance; Venus in Libra seeks harmony and intellectual connection. Compare his Venus sign to how he actually behaves — alignment is meaningful.',
    descZh:
      '金星描述了一个男人如何体验和表达爱情。金星在巨蟹座的男人保护欲强、注重家庭；金星在白羊座直接且有竞争感；金星在天秤座寻求和谐与智识交流。把他金星的星座和他实际行为对比——一致性是有意义的。',
  },
  {
    titleEn: 'The 5th House of Romance',
    titleZh: '第五宫：浪漫宫',
    descEn:
      'Ruled by Leo, the 5th house governs how we experience joy, creativity, and romantic desire. Planetary aspects to this house reveal how sincerely a man pursues romantic connection. A well-aspected 5th house often shows someone who genuinely enjoys love as a process, not just a destination.',
    descZh:
      '由狮子座统治，第五宫掌管我们如何体验快乐、创造力和浪漫欲望。行星与这个宫位的相位揭示了男人追求浪漫联系的真挚程度。第五宫相位良好的人通常会真正享受爱情的过程，而不只是结果。',
  },
  {
    titleEn: 'Mars: How He Pursues',
    titleZh: '火星：他的追求方式',
    descEn:
      'Mars describes energy, drive, and how a man takes action — including romantic action. Mars in Pisces acts through emotional intuition; Mars in Capricorn acts through structure and long-term planning. If his approach to winning your affection matches his Mars sign, that\'s authentic expression.',
    descZh:
      '火星描述了能量、驱动力以及一个男人如何采取行动——包括浪漫行动。金星在双鱼座通过情感直觉行动；火星在摩羯座通过结构和长期规划行动。如果他追求你的方式与他火星星座一致——那就是真实的表达。',
  },
];

const FAQS = [
  {
    qEn: 'Can astrology tell me if he loves me for sure?',
    qZh: '星盘能确定他是否爱我吗？',
    aEn: 'No divination or astrology gives 100% certainty — anyone who claims otherwise is selling something. What astrology offers is pattern recognition: how he tends to experience love (Venus), how he pursues (Mars), what his heart actually needs (Moon). Use this alongside behavioral observation, not as a replacement.',
    aZh: '没有任何占卜或星盘能 100% 确定——声称可以的都是骗人。星盘提供的是模式识别：他如何体验爱情（金星）、如何追求（火星）、他内心真正需要什么（月亮）。把这和观察行为结合使用，不要用它替代。',
  },
  {
    qEn: 'What if his actions and words don\'t match?',
    qZh: '如果他的行为和话语不一致怎么办？',
    aEn: 'Always trust consistent behavior over consistent words. Words can be managed, rehearsed, and manipulated. Patterns of action — how he spends his time, where his attention goes, whether he follows through — are much harder to fake. If there\'s a persistent gap between what he says and what he does, pay attention to the actions.',
    aZh: '永远相信一致的行为而非一致的话语。话语可以被管理、排练和操控。行为模式——他如何分配时间、注意力在哪里、是否兑现承诺——更难伪装。如果话语和行为之间持续存在差距，关注他的行动。',
  },
  {
    qEn: 'He\'s not expressive — does that mean he doesn\'t care?',
    qZh: '他不爱表达——这意味着他不在乎吗？',
    aEn: 'Not necessarily. Some men — particularly those with strong Saturn or earth-sign emphasis in their chart — process and express love through acts of service, reliability, and presence rather than words or dramatic gestures. Look for love in the language he actually speaks, not the language you expect.',
    aZh: '不一定。有些男人——特别是星盘中土星或土象星座强调很强的人——通过服务、可靠和陪伴来表达爱，而不是话语或戏剧性的姿态。在他实际使用的语言中寻找爱，而不是你期望的语言。',
  },
  {
    qEn: 'How long should I wait for him to show signs?',
    qZh: '我应该等多久来观察他的信号？',
    aEn: 'Context matters more than a calendar. A new relationship developing over 2 months with consistent signs is healthy. A relationship of 2 years with no clear emotional engagement is a different conversation. Generally: if you\'re regularly uncertain about whether someone cares after 3–4 months of dating, that uncertainty itself is information.',
    aZh: '背景比时间表更重要。一段在2个月内持续发展并有一致信号的新感情是健康的。持续2年却没有明确情感投入的关系则是另一回事。通常：如果约会3-4个月后你仍然经常不确定对方是否在意——这种不确定性本身就是信息。',
  },
];

function t(en: string, zh: string, lang: 'en' | 'zh'): string {
  return lang === 'zh' ? zh : en;
}

function href(path: string) {
  return path;
}

export default withLanguageParam(function HeLovesYouSignsPage() {
  const { language } = useSyncedLanguage();
  const lang = language === 'zh' ? 'zh' : 'en';
  const navLinks = getTianjiLovePrimaryNav(lang);
  const footerLinks = getTianjiLoveFooterNav(language);

  return (
    <TianjiLoveShell>
      <TianjiLoveHeader links={navLinks} locale={lang} />

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 py-16 text-center sm:px-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d8b77b]/20 bg-[#d8b77b]/8 px-4 py-1.5 text-xs text-[#d8b77b]">
          <span className="text-[#d8b77b]">♡</span>
          {t('Emotional Clarity Guide', '情感清晰指南')}
        </div>
        <h1 className="font-serif text-4xl font-bold leading-tight text-[#ffe3b4] sm:text-5xl">
          {t(
            'How to Know If He Really Loves You',
            '如何判断他是否真的爱你'
          )}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-[#f4d7a3]/72">
          {t(
            'Behavioral science and astrology together reveal what words alone can\'t. This guide covers the signs that matter, how to read them accurately, and when astrology adds context your intuition might be missing.',
            '行为科学与星盘共同揭示了仅凭话语无法了解的东西。本指南涵盖真正重要的信号、如何准确解读，以及星盘何时能为你的直觉提供补充。'
          )}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <TianjiLoveButton href={href('/love-test')} size="lg" variant="primary">
            {t('Take the Love Test', '做感情测试')}
          </TianjiLoveButton>
          <TianjiLoveButton href={href('/ask')} size="lg" variant="outline">
            {t('Ask About Your Situation', '询问你的情况')}
          </TianjiLoveButton>
        </div>
      </section>

      {/* Signs Section */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <TianjiLoveSectionTitle
          title={t('6 Behavioral Signs That Matter', '6个重要的行为信号')}
          eyebrow={t('Read Between the Lines', '读懂行为') }
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {SIGNS.map((sign) => (
            <TianjiLovePanel key={sign.titleEn} className="p-6">
              <div className="mb-3 text-3xl">{sign.icon}</div>
              <h3 className="font-serif text-base font-semibold text-[#ffe3b4]">
                {t(sign.titleEn, sign.titleZh)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#f4d7a3]/62">
                {t(sign.descEn, sign.descZh)}
              </p>
            </TianjiLovePanel>
          ))}
        </div>
      </section>

      {/* Ad slot: in-article */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 py-6 sm:px-8">
        <AdSenseSlot
          slot="HE_LOVES_YOU_SLOT_1"
          format="in-article"
          page="he-loves-you-signs"
        />
      </div>

      {/* Astrology Section */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <TianjiLoveSectionTitle
          title={t('What Astrology Adds', '星盘能补充什么')}
          eyebrow={t('Beyond Behavior', '超越行为观察')}
        />
        <div className="mt-8 space-y-6">
          {ASTROLOGY_INSIGHTS.map((insight) => (
            <TianjiLovePanel key={insight.titleEn} className="p-6">
              <h3 className="font-serif text-base font-semibold text-[#ffe3b4]">
                {t(insight.titleEn, insight.titleZh)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#f4d7a3]/62">
                {t(insight.descEn, insight.descZh)}
              </p>
            </TianjiLovePanel>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border border-[#d8b77b]/20 bg-[#0f0f18] p-6 text-center">
          <p className="text-sm leading-relaxed text-[#f4d7a3]/72">
            {t(
              'Want to know how his specific chart describes his love language?',
              '想知道他的星盘具体如何描述他的爱情语言吗？'
            )}
          </p>
          <TianjiLoveButton href={href('/ask')} size="md" variant="primary" className="mt-4">
            {t('Ask an AI Love Question', 'AI 提问感情解读')}
          </TianjiLoveButton>
        </div>
      </section>

      {/* Ad slot: bottom */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 py-6 sm:px-8">
        <AdSenseSlot
          slot="HE_LOVES_YOU_SLOT_2"
          format="display"
          page="he-loves-you-signs"
        />
      </div>

      {/* FAQ */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 pb-8 sm:px-8">
        <TianjiLoveSectionTitle
          title={t('Frequently Asked Questions', '常见问题')}
          eyebrow={t('Common Questions', '常见疑问')}
        />
        <div className="mt-8 space-y-4">
          {FAQS.map((faq) => (
            <TianjiLovePanel key={faq.qEn} className="p-6">
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

      {/* Internal nav */}
      <nav className="relative z-10 flex justify-center gap-8 pb-8 text-sm text-[#f4d7a3]/56">
        {INTERNAL_LINKS.map((link) => (
          <Link
            key={link.href}
            href={href(link.href)}
            className="transition hover:text-[#ffe3b4]"
          >
            {t(link.labelEn, link.labelZh)}
          </Link>
        ))}
      </nav>

      {/* Affiliate Products */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <AffiliateProductGrid page="he-loves-you-signs" />
      </section>

      <TianjiLoveFooter
        disclaimer={t(DISCLAIMER_EN, DISCLAIMER_ZH)}
        links={footerLinks}
        homeHref={href('/')}
      />
    </TianjiLoveShell>
  );
});
