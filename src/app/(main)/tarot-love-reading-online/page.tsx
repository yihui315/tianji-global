"use client";

import { Brain, Heart, Lock, Sparkles, Star, Users } from "lucide-react";
import Link from "next/link";

import {
  TianjiLoveButton,
  TianjiLoveFooter,
  TianjiLoveHeader,
  TianjiLovePanel,
  TianjiLoveSectionTitle,
  TianjiLoveShell,
  getTianjiLoveFooterNav,
  getTianjiLovePrimaryNav,
} from "@/components/tianji-love";
import { useSyncedLanguage } from "@/hooks/useSyncedLanguage";
import { withLanguageParam } from "@/lib/language-routing";

const INTERNAL_LINKS = [
  { href: "/guide", labelEn: "Guides", labelZh: "指南" },
  { href: "/love-test", labelEn: "Love Test", labelZh: "感情测试" },
  { href: "/tarot", labelEn: "Tarot", labelZh: "塔罗" },
  { href: "/about", labelEn: "About", labelZh: "关于" },
];

const DISCLAIMER_EN =
  "tianji.love provides entertainment and self-reflection tools. Results are for reference only and do not constitute professional advice.";
const DISCLAIMER_ZH =
  "tianji.love 提供娱乐与自我探索工具，结果仅供参考，不构成专业建议。";

const FAQS = [
  {
    qEn: "What is a tarot love reading?",
    qZh: "什么是塔罗爱情解读？",
    aEn: "A tarot love reading uses the 78-card tarot deck to explore questions about relationships, emotions, and connection. Cards are drawn and interpreted in the context of your specific situation, providing reflection and insight rather than deterministic predictions.",
    aZh: "塔罗爱情解读使用78张塔罗牌来探索关于关系、情感和联系的问题。牌卡根据你的具体情况抽取和解读，提供反思和洞察，而不是确定性的预测。",
  },
  {
    qEn: "Is this suitable for love and relationship questions?",
    qZh: "这适合爱情和关系问题吗？",
    aEn: "Yes. Tarot is particularly well-suited for emotional and relationship questions — how someone feels, dynamics within a connection, what is being mirrored, and what direction things may be heading. Our tarot reading is optimized for love and relationship inquiry.",
    aZh: "是的。塔罗特别适合情感和关系问题——某人的感受、关系中的动态、被反映的内容以及事物可能的发展方向。我们的塔罗解读专为爱情和关系探索而优化。",
  },
  {
    qEn: "Do I need any knowledge of tarot to do a reading?",
    qZh: "我需要塔罗知识才能进行解读吗？",
    aEn: "No. Our tarot reading is designed to be accessible to complete beginners. You choose a spread, ask your question in plain language, and the cards are drawn and interpreted for you automatically. Each card reveal includes position-level meaning so you understand exactly what each card represents in your spread.",
    aZh: "不需要。我们的塔罗解读专为完全初学者设计。你选择牌阵，用简单的语言提问，牌卡会自动抽出和解读。每张牌的揭示都包含位置层面的含义，让你准确理解每张牌在你的牌阵中代表什么。",
  },
  {
    qEn: "What spreads are available?",
    qZh: "有哪些牌阵可供选择？",
    aEn: "Three spreads are available: Single Card for a quick signal, Three Card for past-present-future exploration, and Celtic Cross for a comprehensive ten-card map of any situation. All three can be used for love and relationship questions.",
    aZh: "有三种牌阵可供选择：单张牌用于快速信号，三张牌用于过去-现在-未来探索，韦特交叉牌用于全面的十张牌情境地图。三种都可以用于爱情和关系问题。",
  },
  {
    qEn: "Is my question kept private?",
    qZh: "我的问题会保密吗？",
    aEn: "Yes. Your question and reading results are used only to generate your reading session. No account is required for a free tarot reading. We do not store or share your questions or results with third parties.",
    aZh: "是的。你的问题和解读结果仅用于生成你的解读会话。免费塔罗解读无需账户。我们不会存储或与第三方共享你的问题或结果。",
  },
];

const FEATURES = [
  {
    icon: Heart,
    titleEn: "Love & Relationship Focus",
    titleZh: "爱情与关系聚焦",
    descEn:
      "Optimized spreads and card interpretations specifically designed for romantic relationship questions and emotional exploration.",
    descZh: "专为浪漫关系问题和情感探索设计的优化牌阵和牌卡解读。",
  },
  {
    icon: Star,
    titleEn: "Three Spread Options",
    titleZh: "三种牌阵选择",
    descEn:
      "Single card for quick clarity, three-card for directional insight, or Celtic Cross for a full relationship map.",
    descEn: "单张牌快速澄清，三张牌定向洞察，或韦特交叉牌完整关系地图。",
  },
  {
    icon: Sparkles,
    titleEn: "AI-Enhanced Interpretation",
    titleZh: "AI增强解读",
    descEn:
      "Each card comes with position-level meaning, and an AI layer provides a synthesized interpretation connecting all cards in your spread.",
    descZh:
      "每张牌都有位置层面的含义，AI层提供综合解读，将你牌阵中的所有牌卡连接起来。",
  },
  {
    icon: Lock,
    titleEn: "Private & No Signup",
    titleZh: "私密且无需注册",
    descEn:
      "Ask any question freely. No account required, no data sold. Your reading is between you and the cards.",
    descZh: "自由提问。无需账户，不出售数据。你的解读只在你和牌卡之间。",
  },
];

export default function TarotLoveReadingOnlinePage() {
  const [language, setLanguage] = useSyncedLanguage("en");

  const t = (en: string, zh: string) => (language === "zh" ? zh : en);
  const navItems = getTianjiLovePrimaryNav(language);
  const footerLinks = getTianjiLoveFooterNav(language);
  const href = (path: string) => withLanguageParam(path, language);

  const toggleLanguage = () => {
    const next = language === "zh" ? "en" : "zh";
    setLanguage(next);
  };

  const faqPageSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: t(faq.qEn, faq.qZh),
      acceptedAnswer: {
        "@type": "Answer",
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
        homeHref={href("/")}
        navItems={navItems}
        cta={{
          label: t("Start Love Reading", "开始关系解读"),
          href: href("/relationship/new"),
        }}
        languageLabel={language === "zh" ? "EN" : "中文"}
        onLanguageToggle={toggleLanguage}
      />

      {/* Hero */}
      <section className="relative z-10 px-5 pt-20 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#b57248]/38 bg-[#0a1020]/66">
              <Heart className="h-8 w-8 text-[#d8b77b]" aria-hidden />
            </div>
          </div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#d8b77b]/64">
            {t("Tarot · Love · Insight", "塔罗 · 爱情 · 洞察")}
          </p>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-[#ffe3b4] sm:text-5xl">
            {t("Tarot Love Reading Online", "在线塔罗爱情解读")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-[#f4d7a3]/72">
            {t(
              "Explore your love life through the tarot. Ask a question, draw your cards, and receive a personalized reflection on your relationship dynamics, emotions, and path forward.",
              "通过塔罗探索你的爱情生活。提出你的问题，抽出牌卡，获得关于你关系动态、情感和前进方向的个性化反思。",
            )}
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <TianjiLoveButton href={href("/tarot")} size="lg">
              {t("Draw Your Cards", "抽牌")}
              <Sparkles className="ml-2 h-5 w-5" aria-hidden />
            </TianjiLoveButton>
            <TianjiLoveButton
              href={href("/guide")}
              variant="secondary"
              size="lg"
            >
              {t("Explore Guides", "探索指南")}
            </TianjiLoveButton>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 py-16 sm:px-8">
        <TianjiLoveSectionTitle
          title={t("How It Works", "如何使用")}
          eyebrow={t("Simple Process", "简单流程")}
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            {
              step: "01",
              titleEn: "Choose Your Spread",
              titleZh: "选择牌阵",
              descEn:
                "Single card for quick answers, three-card for directional insight, or Celtic Cross for deep exploration.",
              descZh: "单张牌快速回答，三张牌定向洞察，或韦特交叉牌深度探索。",
            },
            {
              step: "02",
              titleEn: "Ask Your Question",
              titleZh: "提出你的问题",
              descEn:
                "State your question in plain language. The clearer the question, the more focused the reading.",
              descZh: "用简单的语言陈述你的问题。问题越清晰，解读越聚焦。",
            },
            {
              step: "03",
              titleEn: "Receive Your Reading",
              titleZh: "接收你的解读",
              descEn:
                "Cards are drawn and interpreted. Each position has meaning, and an AI synthesis connects them into a coherent whole.",
              descZh:
                "牌卡被抽出和解读。每个位置都有含义，AI综合将它们连接成一个连贯的整体。",
            },
          ].map((item) => (
            <TianjiLovePanel key={item.step} className="p-6 text-center">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-[#b57248]/38 bg-[#0a1020]/66 mx-auto">
                <span className="text-xs font-semibold tracking-[0.18em] text-[#d8b77b]">
                  {item.step}
                </span>
              </div>
              <h3 className="font-serif text-base font-semibold text-[#ffe3b4]">
                {t(item.titleEn, item.titleZh)}
              </h3>
              <p className="mt-2 text-sm text-[#f4d7a3]/62">
                {t(item.descEn, item.descZh)}
              </p>
            </TianjiLovePanel>
          ))}
        </div>
      </section>

      {/* Spread Options */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <TianjiLoveSectionTitle
          title={t("Choose Your Spread", "选择你的牌阵")}
          eyebrow={t("Spread Options", "牌阵选择")}
        />
        <div className="mt-6 space-y-4">
          {[
            {
              nameEn: "Single Card",
              nameZh: "单张牌",
              descEn:
                'A quick signal for a single decision or moment. Best for: "What do I need to know right now about this situation?"',
              descZh:
                '针对单一决定或时刻的快速信号。最适合："关于这个情况，我需要知道什么？"',
            },
            {
              nameEn: "Three Card",
              nameZh: "三张牌",
              descEn:
                "Past, present, and emerging direction. Best for: understanding how a situation has evolved and where it is heading.",
              descZh:
                "过去、现在和新兴方向。最适合：理解情况如何演变以及它走向何方。",
            },
            {
              nameEn: "Celtic Cross",
              nameZh: "韦特交叉牌",
              descEn:
                "A full ten-card map of any situation. Best for: complex relationship questions that need comprehensive exploration.",
              descZh:
                "任何情况的完整十张牌地图。最适合：需要全面探索的复杂关系问题。",
            },
          ].map((spread) => (
            <TianjiLovePanel key={spread.nameEn} className="p-6">
              <h3 className="font-serif text-lg font-semibold text-[#ffe3b4]">
                {t(spread.nameEn, spread.nameZh)}
              </h3>
              <p className="mt-2 text-sm text-[#f4d7a3]/62">
                {t(spread.descEn, spread.descZh)}
              </p>
            </TianjiLovePanel>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <TianjiLoveSectionTitle
          title={t("What You Get", "你将获得什么")}
          eyebrow={t("Features", "功能")}
        />
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <TianjiLovePanel
                key={feature.titleEn}
                className="flex flex-col p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#b57248]/38 bg-[#0a1020]/66">
                  <Icon className="h-6 w-6 text-[#d8b77b]" aria-hidden />
                </div>
                <h3 className="font-serif text-lg font-semibold text-[#ffe3b4]">
                  {t(feature.titleEn, feature.titleZh)}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#f4d7a3]/62">
                  {t(feature.descEn, feature.descZh)}
                </p>
              </TianjiLovePanel>
            );
          })}
        </div>
      </section>

      {/* AdSense placeholder */}
      <AdSenseSlot slot="TAROT_READING_BOTTOM_SLOT" format="display" page="tarot-love-reading-online" />

      {/* Privacy */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <TianjiLoveSectionTitle
          title={t("Your Privacy is Protected", "你的隐私受到保护")}
          eyebrow={t("Privacy First", "隐私优先")}
        />
        <TianjiLovePanel className="mt-6 flex flex-col items-center p-6 text-center sm:flex-row sm:text-left">
          <div className="mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#b57248]/38 bg-[#0a1020]/66 sm:mb-0">
            <Lock className="h-7 w-7 text-[#d8b77b]" aria-hidden />
          </div>
          <div className="sm:ml-5">
            <p className="text-sm leading-relaxed text-[#f4d7a3]/72">
              {t(
                "Your question and reading results are used only to generate your reading session. No account is required. We do not sell or share your personal data with third parties. Your reading is between you and the cards.",
                "你的问题和解读结果仅用于生成你的解读会话。无需账户。我们不出售或与第三方共享你的个人数据。你的解读只在你和牌卡之间。",
              )}
            </p>
            <Link
              href={href("/privacy-center")}
              className="mt-2 inline-block text-sm text-[#d8b77b] underline"
            >
              {t(
                "Learn more about our privacy practices →",
                "了解更多关于我们隐私实践的信息 →",
              )}
            </Link>
          </div>
        </TianjiLovePanel>
      </section>

      {/* CTA Banner */}
      <section className="relative z-10 px-5 pb-8 sm:px-8">
        <TianjiLovePanel className="mx-auto max-w-3xl p-8 text-center">
          <Users
            className="mx-auto mb-4 h-10 w-10 text-[#d8b77b]"
            aria-hidden
          />
          <h2 className="font-serif text-2xl font-semibold text-[#ffe3b4]">
            {t(
              "Ready to see what the cards have to say?",
              "准备好看看牌卡要说什么了吗？",
            )}
          </h2>
          <p className="mt-3 text-sm text-[#f4d7a3]/62">
            {t(
              "Choose your spread, ask your question, and receive an instant tarot love reading — no signup required.",
              "选择你的牌阵，提出你的问题，立即获得塔罗爱情解读——无需注册。",
            )}
          </p>
          <TianjiLoveButton href={href("/tarot")} className="mt-6">
            {t("Start Tarot Reading", "开始塔罗解读")}
            <Heart className="ml-2 h-4 w-4" aria-hidden />
          </TianjiLoveButton>
        </TianjiLovePanel>
      </section>

      {/* AdSense placeholder */}
      <AdSenseSlot slot="TAROT_READING_SLOT" format="in-article" page="tarot-love-reading-online" />

      {/* FAQ */}
      <section className="relative z-10 mx-auto max-w-4xl px-5 pb-8 sm:px-8">
        <TianjiLoveSectionTitle
          title={t("Frequently Asked Questions", "常见问题")}
          eyebrow={t("FAQ", "问答")}
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
        <AffiliateProductGrid />
      </section>

      <TianjiLoveFooter
        disclaimer={t(DISCLAIMER_EN, DISCLAIMER_ZH)}
        links={footerLinks}
        homeHref={href("/")}
      />
    </TianjiLoveShell>
  );
}
