'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0a0a0a]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-lg mx-auto">
          {/* Success Icon */}
          <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-amber-500 shadow-2xl shadow-purple-500/30">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-white mb-4">
            {language === 'zh' ? '订阅成功！' : 'Subscription Confirmed!'}
          </h1>

          {/* Message */}
          <p className="text-slate-300 text-lg mb-6">
            {language === 'zh'
              ? '感谢您的支持，您现在可以享受全部高级功能'
              : 'Thank you for your support! You now have access to all premium features'}
          </p>

          {/* Session ID (for reference) */}
          {sessionId && (
            <p className="text-slate-500 text-xs mb-8">
              {language === 'zh' ? '订单号: ' : 'Order ID: '}
              <span className="font-mono">{sessionId.slice(0, 20)}...</span>
            </p>
          )}

          {/* What's included reminder */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 text-left">
            <h3 className="text-white font-semibold mb-3">
              {language === 'zh' ? '您现在可以使用：' : 'You now have access to:'}
            </h3>
            <ul className="space-y-2">
              {[
                language === 'zh' ? '无限命理解读' : 'Unlimited fortune readings',
                language === 'zh' ? '全部5种命理类型' : 'All 5 fortune types',
                language === 'zh' ? '优先AI处理' : 'Priority AI processing',
                language === 'zh' ? '详细PDF报告' : 'Detailed PDF reports',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                  <span className="text-purple-400">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition"
            >
              {language === 'zh' ? '前往控制台' : 'Go to Dashboard'}
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

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
