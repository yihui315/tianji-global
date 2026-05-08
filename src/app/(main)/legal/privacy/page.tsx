'use client';

import Link from 'next/link';
import { useState } from 'react';
import { GlassCard, LanguageSwitch } from '@/components/ui';
import { useSyncedLanguage } from '@/hooks/useSyncedLanguage';
import { withLanguageParam } from '@/lib/language-routing';
import { LegalCosmicLayers } from '../_layers';

const CONTENT = {
  zh: {
    eyebrow: '隐私政策',
    title: '你的数据，我们怎么处理。',
    lastUpdated: '最后更新：2024 年 12 月',
    intro:
      '天机全球（"我们"、"我们的"或"天机"）致力于保护您的隐私。本隐私政策解释了我们如何收集、使用、披露和保护您的个人信息。',
    backHome: '返回首页',
    deletionCta: '请求删除我的数据',
    sections: [
      {
        title: '信息收集',
        content: `我们收集以下类型的信息：

• 您主动提供的信息：您在注册账户、订阅服务或填写表单时提供的姓名、电子邮件地址、出生日期、性别等。
• 来自 Chinese metaphysics 服务的数据：当您使用我们的八字、命理、紫微斗数、易经等服务时，您提供的信息以及由我们的 AI 系统分析得出的洞察。
• 支付信息：我们通过第三方支付处理器处理付款，我们不会存储您的完整信用卡信息。
• 技术数据：IP 地址、浏览器类型、设备标识符、cookies 以及您如何使用我们的服务的技术日志。`,
      },
      {
        title: '数据使用',
        content: `我们使用收集的数据用于：

• 提供和改善我们的服务：包括 AI 驱动的命理分析、个性化内容推荐。
• 账户管理：处理注册、登录、密码重置等服务。
• 通信：发送与服务相关的通知、更新、营销通讯（您可以随时选择退出）。
• 安全和防欺诈：检测和预防欺诈、滥用或未经授权的访问。
• 法律合规：遵守适用的法律和监管要求。`,
      },
      {
        title: '数据存储与安全',
        content: `数据存储：
• 您的数据存储在安全的云服务器上。
• 我们使用行业标准的加密技术保护数据传输和存储。

数据保留：
• 账户数据保留至您删除账户为止。
• 分析数据在匿名化后可能保留更长时间。

安全性：
• 我们实施多层次安全措施，包括防火墙、入侵检测和定期安全审计。
• 所有数据传输使用 SSL/TLS 加密。`,
      },
      {
        title: 'Cookies',
        content: `我们使用 cookies 和类似技术：

• 必要的 Cookies：确保网站正常运作所必需的 cookies。
• 分析 Cookies：帮助我们了解用户如何使用我们的网站。
• 功能 Cookies：记住您的偏好设置。

您可以通过浏览器设置管理或禁用 cookies，但这可能影响网站功能。`,
      },
      {
        title: '您的权利（GDPR / CCPA）',
        content: `根据您所在的司法管辖区，您可能有权：

• 访问您的个人数据
• 更正不准确的数据
• 删除您的数据（"被遗忘权"）
• 限制或反对数据处理
• 数据可携带权
• 撤回同意权
• 向监管机构投诉的权利

如需行使这些权利，请联系：privacy@tianji.global`,
      },
      {
        title: '联系我们',
        content: `如果您对本隐私政策有任何疑问或疑虑，请联系我们：

• 电子邮件：hello@tianji.global
• 隐私事务：privacy@tianji.global
• 网站：https://tianji.global

我们将尽快回复您的请求，并在 30 天内予以处理。`,
      },
    ],
  },
  en: {
    eyebrow: 'Privacy Policy',
    title: 'Your data — how we handle it.',
    lastUpdated: 'Last updated: December 2024',
    intro:
      'TianJi Global ("we", "our", or "TianJi") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information.',
    backHome: 'Back to home',
    deletionCta: 'Request data deletion',
    sections: [
      {
        title: 'Information We Collect',
        content: `We collect the following types of information:

• Information you provide: Name, email address, date of birth, gender, and other details you provide when registering for an account, subscribing to services, or filling out forms.
• Reading data: Birth time, location, questions you submit, and the AI-generated interpretations across our BaZi, Zi Wei Dou Shu, I Ching, Tarot, and other readings.
• Payment information: We process payments through third-party payment processors. We do not store your complete credit card information.
• Technical data: IP address, browser type, device identifiers, cookies, and technical logs of how you use our services.`,
      },
      {
        title: 'How We Use Your Data',
        content: `We use the collected data for:

• Providing and improving our services: Including AI-driven fortune analysis and personalized content recommendations.
• Account management: Processing registration, login, password reset, and other services.
• Communication: Sending service-related notifications, updates, and marketing communications (you can opt out at any time).
• Security and fraud prevention: Detecting and preventing fraud, abuse, or unauthorized access.
• Legal compliance: Complying with applicable laws and regulatory requirements.`,
      },
      {
        title: 'Data Storage & Security',
        content: `Data Storage:
• Your data is stored on secure cloud servers.
• We use industry-standard encryption technologies to protect data in transit and at rest.

Data Retention:
• Account data is retained until you delete your account.
• Anonymized analytics may be retained beyond account deletion for product improvement.

Security:
• We implement multi-layered security measures including firewalls, intrusion detection, and regular security audits.
• All data transmissions are encrypted using SSL/TLS.`,
      },
      {
        title: 'Cookies',
        content: `We use cookies and similar technologies:

• Essential Cookies: Necessary for the website to function properly.
• Analytics Cookies: Help us understand how users use our website.
• Functional Cookies: Remember your preferences.

You can manage or disable cookies through your browser settings, but this may affect website functionality.`,
      },
      {
        title: 'Your Rights (GDPR / CCPA)',
        content: `Depending on your jurisdiction, you may have the right to:

• Access your personal data
• Correct inaccurate data
• Delete your data ("Right to be Forgotten")
• Restrict or object to data processing
• Data portability
• Withdraw consent
• Lodge a complaint with a data protection authority

To exercise these rights, please contact: privacy@tianji.global`,
      },
      {
        title: 'Contact Us',
        content: `If you have any questions or concerns about this Privacy Policy, please contact us:

• Email: hello@tianji.global
• Privacy: privacy@tianji.global
• Website: https://tianji.global

We respond to data requests within 30 days, and usually much sooner.`,
      },
    ],
  },
} as const;

export default function PrivacyPage() {
  const [language] = useSyncedLanguage();
  const [activeSection, setActiveSection] = useState<number | null>(0);
  const t = CONTENT[language];

  const deletionMailto = `mailto:privacy@tianji.global?subject=${encodeURIComponent(
    language === 'zh' ? '请求删除我的天机账号与数据' : 'Please delete my TianJi account and data',
  )}`;

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
                  id={`privacy-trigger-${index}`}
                  onClick={() => setActiveSection(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                  aria-controls={`privacy-panel-${index}`}
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
                    id={`privacy-panel-${index}`}
                    role="region"
                    aria-labelledby={`privacy-trigger-${index}`}
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
            href={deletionMailto}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,119,0.42)] bg-gradient-to-br from-[#f8e7c2] to-white px-6 py-3 font-semibold tracking-[0.2em] text-black transition hover:from-[#fff5dd]"
          >
            <span aria-hidden>✦</span>
            {t.deletionCta}
          </a>
          <Link
            href={withLanguageParam('/about', language)}
            className="rounded-full border border-white/12 bg-white/[0.03] px-6 py-3 text-white/70 transition hover:border-white/30 hover:text-white"
          >
            {language === 'zh' ? '关于天机' : 'About TianJi'}
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 px-6 py-10 text-center text-xs uppercase tracking-[0.24em] text-white/30">
        <Link href={withLanguageParam('/', language)} className="hover:text-white/65">
          TianJi Global
        </Link>
        <p className="mt-3 normal-case tracking-normal text-white/40">
          {language === 'zh'
            ? '© 2026 TianJi Global · 你的数据，权利始终在你手里'
            : '© 2026 TianJi Global · Your data, your rights, always'}
        </p>
      </footer>
    </main>
  );
}
