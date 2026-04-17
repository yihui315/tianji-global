'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function TermsPage() {
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [activeSection, setActiveSection] = useState<number | null>(null);

  const content = {
    zh: {
      title: '服务条款',
      lastUpdated: '最后更新：2024年12月',
      intro: '欢迎使用天机全球服务。请仔细阅读以下条款，它们规定了您使用我们服务的法律条款和条件。',
      sections: [
        {
          title: '服务描述',
          icon: '🔮',
          content: `天机全球提供以下服务：

• 八字命理分析：基于中国传统八字系统的AI驱动分析
• 紫微斗数：基于中国皇家星象学的命理服务
• 易经占卜：运用易经64卦的占卜系统
• 塔罗牌占卜：西方占卜体系的在线解读
• 爱情配对：基于多种命理体系的两性兼容性分析
• 择吉：选择吉日的传统方法
• 其他与Chinese metaphysics相关的服务

我们保留随时修改、暂停或终止任何服务的权利。`
        },
        {
          title: '娱乐免责声明',
          icon: '⚠️',
          content: `重要提示：

• 天机全球的服务仅供娱乐和参考目的，不构成专业财务、医疗、法律或任何其他专业建议。
• 命理分析基于传统智慧和AI算法，其结果不应被视为确定性预测。
• 您应自主做出所有决定，并对自己的行为负责。
• 我们不能保证任何预测、分析或占卜结果的准确性。
• 如有健康、心理健康、法律或财务方面的疑虑，请咨询相关专业人士。
• 使用我们的服务即表示您确认理解并接受以上声明。`
        },
        {
          title: '用户责任',
          icon: '👤',
          content: `作为用户，您同意：

• 提供真实、准确的个人信息
• 保护您的账户安全，不与他人共享登录凭据
• 不得使用我们的服务从事任何非法或未经授权的目的
• 不得尝试破解、干扰或破坏我们的系统
• 不得转售或商业利用我们的服务
• 遵守所有适用的本地、国家和国际法律
• 对您的账户下发生的所有活动负责`
        },
        {
          title: '知识产权',
          icon: '💎',
          content: `天机全球网站、设计、标识、内容、AI算法及所有相关知识产权均为天机全球或其许可方的财产。

• 用户生成的内容归用户所有，但您授予我们使用您内容的有限许可以提供服务
• 我们的AI生成的分析结果可供您个人使用，但未经授权不得商业分发
• 未经明确书面许可，禁止复制、修改或分发我们的内容
• 尊重版权和知识产权是我们的核心价值`
        },
        {
          title: '责任限制',
          icon: '📜',
          content: `在法律允许的最大范围内：

• 天机全球不对任何间接、附带、特殊、后果性或惩罚性损害承担责任
• 我们不对任何因使用我们的服务而产生的决策或行动负责
• 我们对任何服务中断、技术问题或数据丢失不承担责任
• 我们的总责任不超过您在过去12个月内支付给我们服务费用
• 某些司法管辖区不允许限制或排除某些责任，因此这些限制可能不适用于您`
        },
        {
          title: '账户终止',
          icon: '🚫',
          content: `我们可以基于以下原因终止或暂停您的账户：

• 违反本服务条款的任何条款
• 从事欺诈、非法或有害活动
• 滥用服务或试图损害我们的系统
• 长时间不活动（由我们自行决定）
• 您选择关闭您的账户

账户终止后：
• 您将无法访问您的账户及相关数据
• 我们可能会根据法律要求保留某些信息
• 您已支付的费用不予退还（除非法律另有要求）`
        },
        {
          title: '适用法律',
          icon: '⚖️',
          content: `本服务条款受以下法律管辖并按其解释：

• 如果您位于中华人民共和国境内，则受中华人民共和国法律管辖
• 如果您位于其他地区，则适用国际商法原则

争议解决：
• 任何因本服务条款引起的争议应首先通过友好协商解决
• 如协商不成，争议将提交有管辖权的法院解决
• 您同意接受相关法院的属人管辖权`
        },
        {
          title: '联系我们',
          icon: '📧',
          content: `如对本服务条款有任何疑问，请联系我们：

• 电子邮件：hello@tianji.global
• 网站：https://tianji.global

我们会尽快回复您的请求。`
        }
      ]
    },
    en: {
      title: 'Terms of Service',
      lastUpdated: 'Last updated: December 2024',
      intro: 'Welcome to TianJi Global Services. Please read these terms carefully, as they constitute the legal terms and conditions governing your use of our services.',
      sections: [
        {
          title: 'Service Description',
          icon: '🔮',
          content: `TianJi Global provides the following services:

• Bazi Fortune Telling: AI-driven analysis based on the traditional Chinese BaZi system
• Zi Wei Dou Shu: Fortune services based on Chinese imperial astrology
• Yi Jing Divination: Divination system using the 64 hexagrams of I Ching
• Tarot Reading: Online interpretation of Western divination systems
• Love Matching: Compatibility analysis based on multiple metaphysical systems
• Electional: Traditional methods for selecting auspicious dates
• Other services related to Chinese metaphysics

We reserve the right to modify, suspend, or terminate any service at any time.`
        },
        {
          title: 'Entertainment Disclaimer',
          icon: '⚠️',
          content: `Important Notice:

• TianJi Global services are for entertainment and reference purposes only, and do not constitute professional financial, medical, legal, or any other professional advice.
• Fortune analysis is based on traditional wisdom and AI algorithms. Results should not be treated as definite predictions.
• You should make all decisions independently and take responsibility for your own actions.
• We cannot guarantee the accuracy of any predictions, analysis, or divination results.
• For health, mental health, legal, or financial concerns, please consult qualified professionals.
• By using our services, you confirm that you understand and accept the above disclaimer.`
        },
        {
          title: 'User Responsibilities',
          icon: '👤',
          content: `As a user, you agree to:

• Provide true and accurate personal information
• Protect your account security and not share login credentials with others
• Not use our services for any illegal or unauthorized purposes
• Not attempt to hack, interfere with, or disrupt our systems
• Not resell or commercially exploit our services
• Comply with all applicable local, national, and international laws
• Be responsible for all activities occurring under your account`
        },
        {
          title: 'Intellectual Property',
          icon: '💎',
          content: `The TianJi Global website, designs, logos, content, AI algorithms, and all related intellectual property are the property of TianJi Global or its licensors.

• User-generated content belongs to the user, but you grant us a limited license to use your content to provide services
• Our AI-generated analysis results are for your personal use only. Commercial distribution without authorization is prohibited
• Copying, modifying, or distributing our content without explicit written permission is prohibited
• Respecting copyright and intellectual property is our core value`
        },
        {
          title: 'Limitation of Liability',
          icon: '📜',
          content: `To the maximum extent permitted by law:

• TianJi Global shall not be liable for any indirect, incidental, special, consequential, or punitive damages
• We are not responsible for any decisions or actions taken based on the use of our services
• We assume no liability for service interruptions, technical issues, or data loss
• Our total liability shall not exceed the fees you paid to us for services in the past 12 months
• Some jurisdictions do not allow limitations or exclusions of certain liabilities, so these limitations may not apply to you`
        },
        {
          title: 'Account Termination',
          icon: '🚫',
          content: `We may terminate or suspend your account for the following reasons:

• Violation of any terms in this Terms of Service
• Engagement in fraudulent, illegal, or harmful activities
• Abuse of services or attempts to harm our systems
• Prolonged inactivity (at our discretion)
• You choose to close your account

Upon account termination:
• You will no longer be able to access your account and related data
• We may retain certain information as required by law
• Fees already paid are non-refundable (unless required by law)`
        },
        {
          title: 'Governing Law',
          icon: '⚖️',
          content: `These Terms of Service are governed by and construed in accordance with:

• If you are located in the People\'s Republic of China, the laws of the PRC apply
• If you are located in other regions, the principles of international commercial law apply

Dispute Resolution:
• Any disputes arising from these Terms of Service shall first be resolved through friendly negotiation
• If negotiation fails, disputes shall be submitted to the competent court for resolution
• You agree to submit to the personal jurisdiction of the relevant courts`
        },
        {
          title: 'Contact Us',
          icon: '📧',
          content: `If you have any questions about these Terms of Service, please contact us:

• Email: hello@tianji.global
• Website: https://tianji.global

We will respond to your requests as soon as possible.`
        }
      ]
    }
  };

  const t = content[language];

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[#0a0a0a]">
        <div className="stars-container">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="p-6">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                天机全球
              </h1>
              <p className="text-amber-300/80 text-lg">TianJi Global</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="px-4 py-2 bg-slate-800/50 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition"
              >
                {language === 'zh' ? '返回首页' : 'Back to Home'}
              </Link>
              <button
                onClick={() => setLanguage('zh')}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  language === 'zh'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                中文
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  language === 'en'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <section className="px-6 py-12 md:py-20 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t.title}
            </h2>
            <p className="text-amber-300 text-sm">{t.lastUpdated}</p>
            <p className="text-slate-400 mt-4 max-w-2xl mx-auto">{t.intro}</p>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            {t.sections.map((section, index) => (
              <div
                key={index}
                className="rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setActiveSection(activeSection === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{section.icon}</span>
                    <h3 className="text-xl font-semibold text-white">{section.title}</h3>
                  </div>
                  <svg
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${activeSection === index ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeSection === index && (
                  <div className="px-6 pb-4">
                    <div className="text-slate-300 whitespace-pre-line leading-relaxed pl-9">
                      {section.content}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 text-slate-500 text-sm">
          <p>© 2024 TianJi Global · 天机全球</p>
          <p className="mt-1">
            {language === 'zh'
              ? '融合传统智慧与现代科技'
              : 'Bridging Traditional Wisdom & Modern Technology'}
          </p>
        </footer>
      </div>

      <style jsx>{`
        .stars-container {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 50%;
          animation: twinkle ease-in-out infinite;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
      `}</style>
    </main>
  );
}
