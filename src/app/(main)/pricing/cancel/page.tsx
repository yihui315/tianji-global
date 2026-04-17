'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CancelPage() {
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] overflow-x-hidden">
      <div className="star-field" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-lg mx-auto">
          {/* Cancel Icon */}
          <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-500/20 shadow-xl">
            <svg
              className="w-12 h-12 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-white mb-4">
            {language === 'zh' ? '订阅已取消' : 'Subscription Cancelled'}
          </h1>

          {/* Message */}
          <p className="text-slate-400 text-lg mb-8">
            {language === 'zh'
              ? '您的订阅已取消，不会收取任何费用'
              : 'Your subscription was cancelled. No charges were made.'}
          </p>

          {/* Info Box */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 text-left">
            <h3 className="text-white font-semibold mb-3">
              {language === 'zh' ? '您仍然可以：' : 'You still can:'}
            </h3>
            <ul className="space-y-2">
              {[
                language === 'zh' ? '免费体验基础功能' : 'Try basic features for free',
                language === 'zh' ? '随时返回订阅' : 'Subscribe anytime later',
                language === 'zh' ? '探索其他命理工具' : 'Explore other fortune tools',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                  <span className="text-slate-500">•</span> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition"
            >
              {language === 'zh' ? '重新选择方案' : 'View Plans'}
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg font-semibold transition"
            >
              {language === 'zh' ? '返回首页' : 'Back to Home'}
            </Link>
          </div>

          {/* Language Toggle */}
          <div className="mt-8 flex justify-center gap-2 bg-white/10 rounded-full p-1 inline-flex">
            <button
              onClick={() => setLanguage('zh')}
              className={`px-4 py-1 rounded-full text-sm transition-all ${
                language === 'zh' ? 'bg-purple-600 text-white' : 'text-slate-300'
              }`}
            >
              中文
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-1 rounded-full text-sm transition-all ${
                language === 'en' ? 'bg-purple-600 text-white' : 'text-slate-300'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
