'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LegalPage() {
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');

  const content = {
    zh: {
      title: '法律声明',
      subtitle: 'Legal',
      description: '了解天机全球的服务条款和隐私政策。',
      privacyTitle: '隐私政策',
      privacyDesc: '了解我们如何收集、使用和保护您的个人信息。',
      termsTitle: '服务条款',
      termsDesc: '使用我们的服务即表示您同意以下条款和条件。',
      updated: '最后更新：2024年',
    },
    en: {
      title: 'Legal Notices',
      subtitle: '法律声明',
      description: 'Learn about TianJi Global\'s Terms of Service and Privacy Policy.',
      privacyTitle: 'Privacy Policy',
      privacyDesc: 'Learn how we collect, use, and protect your personal information.',
      termsTitle: 'Terms of Service',
      termsDesc: 'By using our services, you agree to the following terms and conditions.',
      updated: 'Last updated: 2024',
    },
  };

  const t = content[language];

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
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
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="p-6">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                天机全球
              </h1>
              <p className="text-purple-300/80 text-lg">TianJi Global</p>
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
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                中文
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  language === 'en'
                    ? 'bg-purple-600 text-white'
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
            <p className="text-purple-300 text-lg">{t.subtitle}</p>
            <p className="text-slate-400 mt-2">{t.description}</p>
            <p className="text-slate-500 text-sm mt-4">{t.updated}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Privacy Policy Card */}
            <Link
              href="/legal/privacy"
              className="group relative overflow-hidden rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 p-8"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-2xl font-bold text-white mb-2">{t.privacyTitle}</h3>
                <p className="text-slate-400">{t.privacyDesc}</p>
                <div className="flex items-center text-purple-400 text-sm font-medium mt-4">
                  <span>{language === 'zh' ? '查看详情' : 'View Details'}</span>
                  <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Terms of Service Card */}
            <Link
              href="/legal/terms"
              className="group relative overflow-hidden rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20 p-8"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-orange-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="text-4xl mb-4">📜</div>
                <h3 className="text-2xl font-bold text-white mb-2">{t.termsTitle}</h3>
                <p className="text-slate-400">{t.termsDesc}</p>
                <div className="flex items-center text-amber-400 text-sm font-medium mt-4">
                  <span>{language === 'zh' ? '查看详情' : 'View Details'}</span>
                  <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
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
