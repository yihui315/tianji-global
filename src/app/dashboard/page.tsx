'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [portalLoading, setPortalLoading] = useState(false);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-slate-900 to-indigo-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-indigo-900 text-white">
      {/* Header */}
      <header className="px-8 py-6 border-b border-white/10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">TianJi Dashboard</h1>
          <p className="text-purple-300 text-sm">
            Welcome{session.user?.name ? `, ${session.user.name}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {session.user?.image && (
            <img
              src={session.user.image}
              alt="Avatar"
              className="w-10 h-10 rounded-full border-2 border-purple-400"
            />
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm transition"
          >
            {language === 'zh' ? '退出登录' : 'Sign Out'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 max-w-6xl mx-auto">
        {/* Subscription Status */}
        <div className="mb-8 bg-gradient-to-r from-purple-900/50 to-amber-900/30 border border-purple-500/30 rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                {language === 'zh' ? '订阅状态' : 'Subscription'}
              </h2>
              <p className="text-purple-300 text-sm">
                {language === 'zh'
                  ? '您正在使用免费版本'
                  : 'You are on the free plan'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/pricing"
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-amber-500 text-white rounded-lg font-semibold text-sm hover:opacity-90 transition text-center"
              >
                {language === 'zh' ? '升级到专业版' : 'Upgrade to Pro'}
              </Link>
              <button
                onClick={async () => {
                  setPortalLoading(true);
                  try {
                    const res = await fetch('/api/stripe/portal', { method: 'POST' });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  } catch {
                    console.error('Portal error');
                  } finally {
                    setPortalLoading(false);
                  }
                }}
                disabled={portalLoading}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-sm transition disabled:opacity-50"
              >
                {portalLoading
                  ? (language === 'zh' ? '跳转中...' : 'Redirecting...')
                  : (language === 'zh' ? '管理订阅' : 'Manage Subscription')}
              </button>
            </div>
          </div>
        </div>

        {/* Language Toggle */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-slate-400 text-sm">{language === 'zh' ? '界面语言：' : 'Language:'}</span>
          <div className="flex gap-1 bg-white/10 rounded-full p-1">
            <button
              onClick={() => setLanguage('zh')}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                language === 'zh' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              中文
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                language === 'en' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {language === 'zh' ? '开始新的解读' : 'Start a New Reading'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { href: '/ziwei', label: '紫微斗数', labelEn: 'Zi Wei', color: 'from-purple-600 to-purple-800' },
              { href: '/bazi', label: '八字命理', labelEn: 'Ba Zi', color: 'from-amber-600 to-amber-800' },
              { href: '/yijing', label: '易经占卜', labelEn: 'Yi Jing', color: 'from-emerald-600 to-emerald-800' },
              { href: '/western', label: '西方占星', labelEn: 'Western', color: 'from-blue-600 to-blue-800' },
              { href: '/tarot', label: '塔罗牌', labelEn: 'Tarot', color: 'from-rose-600 to-rose-800' },
            ].map(card => (
              <a
                key={card.href}
                href={card.href}
                className={`bg-gradient-to-br ${card.color} p-6 rounded-xl text-center hover:scale-105 transition-transform cursor-pointer block`}
              >
                <div className="text-2xl mb-2">{card.label}</div>
                <div className="text-sm text-white/70">{card.labelEn}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Recent Readings */}
        <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-4">
            {language === 'zh' ? '最近解读' : 'Recent Readings'}
          </h2>
          <div className="text-purple-300 text-sm">
            {language === 'zh'
              ? '完成第一次解读后，您的历史记录将显示在这里'
              : 'Your reading history will appear here after you complete your first reading.'}
          </div>
        </div>
      </main>
    </div>
  );
}
