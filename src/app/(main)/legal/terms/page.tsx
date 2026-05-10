'use client';

import Link from 'next/link';
import { useState } from 'react';
import { GlassCard, LanguageSwitch } from '@/components/ui';
import { useSyncedLanguage } from '@/hooks/useSyncedLanguage';
import { withLanguageParam } from '@/lib/language-routing';
import { LegalCosmicLayers } from '../_layers';

const CONTENT = {
  zh: {
    eyebrow: '服务条款',
    title: '使用天机服务的条件。',
    lastUpdated: '最后更新：2024 年 12 月',
    intro:
      '欢迎使用天机全球服务。请仔细阅读以下条款，它们规定了您使用我们服务的法律条款和条件。',
    backHome: '返回首页',
    contactCta: '有问题写信给我们',
    sections: [
      {
        title: '服务描述',
        content: `天机全球提供以下服务：

• 八字命理分析：基于中国传统八字系统的 AI 驱动分析
• 紫微斗数：基于中国皇家星象学的命理服务
• 易经占卜：运用易经 64 卦的占卜系统
• 塔罗牌占卜：西方占卜体系的在线解读
• 爱情配对：基于多种命理体系的两性兼容性分析
• 择吉：选择吉日的传统方法
• 其他与 Chinese metaphysics 相关的服务

我们保留随时修改、暂停或终止任何服务的权利。`,
      },
      {
        title: '娱乐免责声明',
        content: `重要提示：

• 天机全球的服务仅供娱乐和参考目的，不构成专业财务、医疗、法律或任何其他专业建议。
• 命理分析基于传统智慧和 AI 算法，其结果不应被视为确定性预测。
• 您应自主做出所有决定，并对自己的行为负责。
• 我们不能保证任何预测、分析或占卜结果的准确性。
• 如有健康、心理健康、法律或财务方面的疑虑，请咨询相关专业人士。
• 使用我们的服务即表示您确认理解并接受以上声明。`,
      },
      {
        title: '用户责任',
        content: `作为用户，您同意：

• 提供真实、准确的个人信息
• 保护您的账户安全，不与他人共享登录凭据
• 不得使用我们的服务从事任何非法或未经授权的目的
• 不得尝试破解、干扰或破坏我们的系统
• 不得转售或商业利用我们的服务
• 遵守所有适用的本地、国家和国际法律
• 对您的账户下发生的所有活动负责`,
      },
      {
        title: '知识产权',
        content: `天机全球网站、设计、标识、内容、AI 算法及所有相关知识产权均为天机全球或其许可方的财产。

• 用户生成的内容归用户所有，但您授予我们使用您内容的有限许可以提供服务
• 我们的 AI 生成的分析结果可供您个人使用，但未经授权不得商业分发
• 未经明确书面许可，禁止复制、修改或分发我们的内容
• 尊重版权和知识产权是我们的核心价值`,
      },
      {
        title: '责任限制',
        content: `在法律允许的最大范围内：

• 天机全球不对任何间接、附带、特殊、后果性或惩罚性损害承担责任
• 我们不对任何因使用我们的服务而产生的决策或行动负责
• 我们对任何服务中断、技术问题或数据丢失不承担责任
• 我们的总责任不超过您在过去 12 个月内支付给我们服务费用
• 某些司法管辖区不允许限制或排除某些责任，因此这些限制可能不适用于您`,
      },
      {
        title: '账户终止',
        content: `我们可以基于以下原因终止或暂停您的账户：

• 违反本服务条款的任何条款
• 从事欺诈、非法或有害活动
• 滥用服务或试图损害我们的系统
• 长时间不活动（由我们自行决定）
• 您选择关闭您的账户

账户终止后：
• 您将无法访问您的账户及相关数据
• 我们可能会根据法律要求保留某些信息
• 您已支付的费用不予退还（除非法律另有要求）`,
      },
      {
        title: '适用法律',
        content: `本服务条款受以下法律管辖并按其解释：

• 如果您位于中华人民共和国境内，则受中华人民共和国法律管辖
• 如果您位于其他地区，则适用国际商法原则

争议解决：
• 任何因本服务条款引起的争议应首先通过友好协商解决
• 如协商不成，争议将提交有管辖权的法院解决
• 您同意接受相关法院的属人管辖权`,
      },
      {
        title: '联系我们',
        content: `如对本服务条款有任何疑问，请联系我们：

• 电子邮件：hello@tianji.global
• 网站：https://tianji.global

我们会尽快回复您的请求。`,
      },
    ],
  },
  en: {
    eyebrow: 'Terms of Service',
    title: 'The conditions for using TianJi.',
    lastUpdated: 'Last updated: December 2024',
    intro:
      'Welcome to TianJi Global. These Terms govern your use of our services — please read them carefully before continuing.',
    backHome: 'Back to home',
    contactCta: 'Email us with questions',
    sections: [
      {
        title: 'Service Description',
        content: `TianJi Global provides the following services:

• Bazi Fortune Telling: AI-driven analysis based on the traditional Chinese BaZi system
• Zi Wei Dou Shu: Fortune services based on Chinese imperial astrology
• Yi Jing Divination: Divination system using the 64 hexagrams of I Ching
• Tarot Reading: Single-card, three-card, and Celtic Cross spreads with AI interpretation
• Love Matching: Compatibility analysis based on multiple metaphysical systems
• Electional: Traditional methods for selecting auspicious dates
• Additional divination tools, including numerology, transits, and electional astrology

We reserve the right to modify, suspend, or terminate any service at any time.`,
      },
      {
        title: 'Entertainment Disclaimer',
        content: `Important Notice:

• TianJi Global services are for entertainment and reference purposes only, and do not constitute professional financial, medical, legal, or any other professional advice.
• Readings combine traditional methods with AI interpretation. Results are not deterministic predictions and should not be treated as guaranteed outcomes.
• You should make all decisions independently and take responsibility for your own actions.
• We cannot guarantee the accuracy of any predictions, analysis, or divination results.
• For health, mental health, legal, or financial concerns, please consult qualified professionals.
• By using our services, you confirm that you understand and accept the above disclaimer.`,
      },
      {
        title: 'User Responsibilities',
        content: `As a user, you agree to:

• Provide true and accurate personal information
• Protect your account security and not share login credentials with others
• Not use our services for any illegal or unauthorized purposes
• Not attempt to hack, interfere with, or disrupt our systems
• Not resell or commercially exploit our services
• Comply with all applicable local, national, and international laws
• Be responsible for all activities occurring under your account`,
      },
      {
        title: 'Intellectual Property',
        content: `The TianJi Global website, designs, logos, content, AI algorithms, and all related intellectual property are the property of TianJi Global or its licensors.

• User-generated content belongs to the user, but you grant us a limited license to use your content to provide services
• Our AI-generated analysis results are for your personal use only. Commercial distribution without authorization is prohibited
• Copying, modifying, or distributing our content without explicit written permission is prohibited
• Respecting copyright and intellectual property is our core value`,
      },
      {
        title: 'Limitation of Liability',
        content: `To the maximum extent permitted by law:

• TianJi Global shall not be liable for any indirect, incidental, special, consequential, or punitive damages
• We are not responsible for any decisions or actions taken based on the use of our services
• We assume no liability for service interruptions, technical issues, or data loss
• Our total liability shall not exceed the fees you paid to us for services in the past 12 months
• Some jurisdictions do not allow limitations or exclusions of certain liabilities, so these limitations may not apply to you`,
      },
      {
        title: 'Account Termination',
        content: `We may terminate or suspend your account for the following reasons:

• Violation of any terms in this Terms of Service
• Engagement in fraudulent, illegal, or harmful activities
• Abuse of services or attempts to harm our systems
• Prolonged inactivity (at our discretion)
• You choose to close your account

Upon account termination:
• You will no longer be able to access your account and related data
• We may retain certain information as required by law
• Fees already paid are non-refundable (unless required by law)`,
      },
      {
        title: 'Governing Law',
        content: `These Terms of Service are governed by and construed in accordance with:

• If you are located in the People's Republic of China, the laws of the PRC apply
• If you are located in other regions, the principles of international commercial law apply

Dispute Resolution:
• Any disputes arising from these Terms of Service shall first be resolved through friendly negotiation
• If negotiation fails, disputes shall be submitted to the competent court for resolution
• You agree to submit to the personal jurisdiction of the relevant courts`,
      },
      {
        title: 'Contact Us',
        content: `If you have any questions about these Terms of Service, please contact us:

• Email: hello@tianji.global
• Website: https://tianji.global

We will respond to your requests as soon as possible.`,
      },
    ],
  },
} as const;

export default function TermsPage() {
  const [language] = useSyncedLanguage();
  const [activeSection, setActiveSection] = useState<number | null>(0);
  const t = CONTENT[language];

  return (
    <main id="main-content" className="relative min-h-screen overflow-hidden bg-[#050508] text-white">
      <LegalCosmicLayers />

      <LanguageSwitch className="fixed right-6 top-6 z-30" />

      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-6 pt-10">
        <Link
          href={withLanguageParam('/', language)}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-white/45 transition hover:text-white/85"
        >
          <span aria-hidden>←</span> {t.backHome}
        </Link>
      </header>

      <section className="relative z-10 mx-auto max-w-3xl px-6 pt-20 pb-12 text-center">
        <p className="mb-5 text-[0.7rem] uppercase tracking-[0.36em] text-[rgba(212,175,119,0.78)]">
          {t.eyebrow}
        </p>
        <h1 className="font-serif text-3xl leading-[1.18] text-white/95 sm:text-4xl md:text-5xl">
          {t.title}
        </h1>
        <p className="mt-5 text-xs uppercase tracking-[0.24em] text-white/40">{t.lastUpdated}</p>
        <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-white/65">{t.intro}</p>
      </section>

      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-16">
        <div className="space-y-3">
          {t.sections.map((section, index) => {
            const isOpen = activeSection === index;
            const tag = String(index + 1).padStart(2, '0');
            return (
              <GlassCard
                key={index}
                level="card"
                className="overflow-hidden rounded-[1.5rem] border border-white/[0.06] bg-white/[0.02] transition-colors hover:border-white/[0.12]"
              >
                <button
                  type="button"
                  id={`terms-trigger-${index}`}
                  onClick={() => setActiveSection(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                  aria-controls={`terms-panel-${index}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-full border border-[rgba(212,175,119,0.32)] text-[0.72rem] font-semibold tracking-[0.18em] text-[rgba(212,175,119,0.85)]">
                      {tag}
                    </span>
                    <h3 className="font-serif text-lg text-white/92">{section.title}</h3>
                  </div>
                  <span
                    aria-hidden
                    className={`text-base text-white/40 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-[rgba(212,175,119,0.85)]' : ''
                    }`}
                  >
                    ▾
                  </span>
                </button>
                {isOpen && (
                  <div
                    id={`terms-panel-${index}`}
                    role="region"
                    aria-labelledby={`terms-trigger-${index}`}
                    className="border-t border-white/[0.06] bg-black/15 px-6 py-5 pl-[4.25rem]"
                  >
                    <pre className="whitespace-pre-line font-sans text-sm leading-7 text-white/65">
                      {section.content}
                    </pre>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-xs uppercase tracking-[0.22em]">
          <a
            href="mailto:hello@tianji.global"
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,119,0.42)] bg-gradient-to-br from-[#f8e7c2] to-white px-6 py-3 font-semibold tracking-[0.2em] text-black transition hover:from-[#fff5dd]"
          >
            <span aria-hidden>✦</span>
            {t.contactCta}
          </a>
          <Link
            href={withLanguageParam('/legal/privacy', language)}
            className="rounded-full border border-white/12 bg-white/[0.03] px-6 py-3 text-white/70 transition hover:border-white/30 hover:text-white"
          >
            {language === 'zh' ? '隐私政策' : 'Privacy policy'}
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 px-6 py-10 text-center text-xs uppercase tracking-[0.24em] text-white/30">
        <Link href={withLanguageParam('/', language)} className="hover:text-white/65">
          TianJi Global
        </Link>
        <p className="mt-3 normal-case tracking-normal text-white/40">
          {language === 'zh'
            ? '© 2026 TianJi Global · 不卖结果，不卖焦虑'
            : '© 2026 TianJi Global · No outcome sales, no anxiety sales'}
        </p>
      </footer>
    </main>
  );
}
