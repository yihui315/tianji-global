'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

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
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 max-w-6xl mx-auto">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Start a New Reading</h2>
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
          <h2 className="text-xl font-semibold mb-4">Recent Readings</h2>
          <div className="text-purple-300 text-sm">
            Your reading history will appear here after you complete your first reading.
          </div>
        </div>
      </main>
    </div>
  );
}
