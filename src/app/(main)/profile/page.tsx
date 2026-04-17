'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const TIMEZONES = Intl.supportedValuesOf('timeZone');

const TIMEZONE_LABELS: Record<string, string> = {
  'Asia/Shanghai': '🇨🇳 中国 (北京时间)',
  'Asia/Hong_Kong': '🇭🇰 香港 (HKT)',
  'Asia/Taipei': '🇹🇼 台北 (CST)',
  'Asia/Singapore': '🇸🇬 新加坡 (SGT)',
  'Asia/Tokyo': '🇯🇵 日本 (JST)',
  'Asia/Seoul': '🇰🇷 韩国 (KST)',
  'America/New_York': '🇺🇸 纽约 (EST)',
  'America/Los_Angeles': '🇺🇸 洛杉矶 (PST)',
  'America/Chicago': '🇺🇸 芝加哥 (CST)',
  'Europe/London': '🇬🇧 伦敦 (GMT)',
  'Europe/Paris': '🇫🇷 巴黎 (CET)',
  'Europe/Berlin': '🇩🇪 柏林 (CET)',
  'Australia/Sydney': '🇦🇺 悉尼 (AEST)',
};

function formatTimezone(tz: string): string {
  return TIMEZONE_LABELS[tz] ?? tz;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [timezone, setTimezone] = useState('Asia/Shanghai');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Detect browser timezone
    const savedTz = localStorage.getItem('tianji_timezone');
    if (savedTz && TIMEZONES.includes(savedTz)) {
      setTimezone(savedTz);
    } else {
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      localStorage.setItem('tianji_timezone', timezone);
      
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timezone }),
      });
      
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="px-8 py-6 border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-purple-300 hover:text-white transition text-sm flex items-center gap-1">
              <span>←</span>
              {language === 'zh' ? '返回仪表盘' : 'Back to Dashboard'}
            </Link>
            <h1 className="text-xl font-bold">{language === 'zh' ? '个人资料' : 'Profile'}</h1>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-full p-1">
            <button
              onClick={() => setLanguage('zh')}
              className={`px-3 py-1 rounded-full text-sm transition ${language === 'zh' ? 'bg-purple-600 text-white' : 'text-slate-300'}`}
            >
              中文
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-full text-sm transition ${language === 'en' ? 'bg-purple-600 text-white' : 'text-slate-300'}`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-8">
        <div className="space-y-6">
          {/* Avatar + Identity */}
          <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/[0.06] flex items-center gap-6">
            {user?.image ? (
              <img
                src={user.image}
                alt="Avatar"
                className="w-20 h-20 rounded-full border-2 border-purple-400"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-purple-700 flex items-center justify-center text-3xl border-2 border-purple-400">
                {user?.name?.[0] ?? '?'}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold">{user?.name ?? 'User'}</h2>
              <p className="text-purple-300 text-sm">{user?.email}</p>
              <p className="text-slate-400 text-xs mt-1">
                {language === 'zh' ? '通过 Google 登录' : 'Signed in via Google'}
              </p>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/[0.06] space-y-5">
            <h3 className="text-lg font-semibold mb-4">
              {language === 'zh' ? '偏好设置' : 'Preferences'}
            </h3>

            {/* Name (read-only — managed by Google) */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                {language === 'zh' ? '显示名称' : 'Display Name'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={user?.name ?? ''}
                  readOnly
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/[0.06] rounded-lg text-white/50 cursor-not-allowed"
                />
                <span className="text-xs text-slate-500 px-2">
                  {language === 'zh' ? '由 Google 管理' : 'Managed by Google'}
                </span>
              </div>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                {language === 'zh' ? '时区' : 'Timezone'}
              </label>
              <select
                value={timezone}
                onChange={e => { setTimezone(e.target.value); setSaved(false); }}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/[0.06] rounded-lg text-white appearance-none cursor-pointer hover:bg-white/10 transition"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
              >
                {TIMEZONES.map(tz => (
                  <option key={tz} value={tz} className="bg-slate-900">
                    {formatTimezone(tz)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1.5">
                {language === 'zh'
                  ? '用于生时校正和择时吉凶计算'
                  : 'Used for birth time correction and electional astrology'}
              </p>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-amber-500 text-white rounded-lg font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
              >
                {saving
                  ? (language === 'zh' ? '保存中...' : 'Saving...')
                  : (language === 'zh' ? '保存设置' : 'Save Preferences')}
              </button>
              {saved && (
                <span className="text-green-400 text-sm flex items-center gap-1">
                  <span>✓</span>
                  {language === 'zh' ? '已保存' : 'Saved'}
                </span>
              )}
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/[0.06]">
            <h3 className="text-lg font-semibold mb-4">
              {language === 'zh' ? '账户信息' : 'Account'}
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">{language === 'zh' ? '邮箱' : 'Email'}</span>
                <span>{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{language === 'zh' ? '订阅计划' : 'Plan'}</span>
                <span className="text-purple-300">
                  {language === 'zh' ? '免费版' : 'Free'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{language === 'zh' ? '数据存储' : 'Data Storage'}</span>
                <span className="text-slate-400 text-xs">
                  {language === 'zh' ? '本地 (配置 Supabase 后可云端同步)' : 'Local (cloud sync after Supabase setup)'}
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <Link
                href="/pricing"
                className="text-sm text-amber-400 hover:text-amber-300 transition"
              >
                {language === 'zh' ? '升级到专业版 →' : 'Upgrade to Pro →'}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
