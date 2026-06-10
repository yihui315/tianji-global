import type { Metadata } from 'next';
import { buildLocalizedMetadata } from '@/lib/i18n-metadata';
import { isSupportedLocale, locales } from '@/lib/i18n';
import { notFound } from 'next/navigation';

type PageParams = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) return {};
  return buildLocalizedMetadata({ locale, path: '/status', title: 'System Status' });
}

const statusCopy = {
  en: {
    title: 'System Status',
    subtitle: 'tianji.love — Live Service Status',
    lastUpdated: 'Last updated',
    allSystems: 'All systems operational',
    someDegraded: 'Partial degradation detected',
    serviceOutage: 'Service outage detected',
    services: 'Services',
    responseTime: 'Response time',
    operational: 'Operational',
    degraded: 'Degraded',
    down: 'Down',
    incidentHistory: 'Incident History',
    noIncidents: 'No incidents reported.',
    subscribe: 'Subscribe to updates',
    note: 'UptimeRobot free plan monitors from 1 location. Upgrade to pro for global monitoring.',
  },
  'zh-CN': {
    title: '系统状态',
    subtitle: 'tianji.love — 实时服务状态',
    lastUpdated: '最后更新',
    allSystems: '所有系统运行正常',
    someDegraded: '部分服务降级',
    serviceOutage: '检测到服务中断',
    services: '服务',
    responseTime: '响应时间',
    operational: '正常运行',
    degraded: '降级',
    down: '宕机',
    incidentHistory: '事件历史',
    noIncidents: '暂无事件报告。',
    subscribe: '订阅更新通知',
    note: 'UptimeRobot 免费版从1个地点监控。升级 Pro 可获得全球监控。',
  },
};

function StatusDot({ status }: { status: string }) {
  const color =
    status === 'operational' ? 'bg-emerald-400' : status === 'degraded' ? 'bg-amber-400' : 'bg-red-400';
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color} shadow-lg`} />;
}

function StatusRow({ name, status, message }: { name: string; status: string; message?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-4">
      <div className="flex items-center gap-3">
        <StatusDot status={status} />
        <span className="text-sm font-medium text-white/80">{name}</span>
      </div>
      <div className="text-right">
        <div className={`text-xs font-medium ${status === 'operational' ? 'text-emerald-400' : status === 'degraded' ? 'text-amber-400' : 'text-red-400'}`}>
          {status === 'operational' ? 'Operational' : status === 'degraded' ? 'Degraded' : 'Down'}
        </div>
        {message && <div className="text-xs text-white/30">{message}</div>}
      </div>
    </div>
  );
}

export default async function StatusPage({ params }: PageParams) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const t = statusCopy[locale as keyof typeof statusCopy];

  // Fetch live status from our API
  let statusData = { status: 'operational', services: [], timestamp: new Date().toISOString() };
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3000'}/api/status`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) statusData = await res.json();
  } catch {
    // Use fallback
  }

  const isZh = locale === 'zh-CN';

  return (
    <main className="min-h-screen bg-[#050508] px-5 py-16 text-white sm:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-2 text-xs font-medium tracking-widest text-[#d8b77b]/60 uppercase">
          {isZh ? '天机Love' : 'TianJi Love'}
        </div>
        <h1 className="font-serif text-4xl text-[#ffe3b4]">{t.title}</h1>
        <p className="mt-2 text-sm text-white/50">{t.subtitle}</p>
        <p className="mt-1 text-xs text-white/30">
          {t.lastUpdated}: {new Date(statusData.timestamp).toLocaleString(locale)}
        </p>

        {/* Overall Status Banner */}
        <div
          className={`mt-8 rounded-xl border p-6 ${
            statusData.status === 'operational'
              ? 'border-emerald-400/20 bg-emerald-400/08'
              : statusData.status === 'degraded'
              ? 'border-amber-400/20 bg-amber-400/08'
              : 'border-red-400/20 bg-red-400/08'
          }`}
        >
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              statusData.status === 'operational' ? 'text-emerald-400' : statusData.status === 'degraded' ? 'text-amber-400' : 'text-red-400'
            }`}>
              {statusData.status === 'operational'
                ? t.allSystems
                : statusData.status === 'degraded'
                ? t.someDegraded
                : t.serviceOutage}
            </div>
          </div>
        </div>

        {/* Service List */}
        <div className="mt-8">
          <h2 className="mb-1 text-sm font-semibold text-white/60 uppercase tracking-wide">{t.services}</h2>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] px-6">
            {statusData.services.map((svc: { name: string; status: string; message?: string }) => (
              <StatusRow key={svc.name} name={svc.name} status={svc.status} message={svc.message} />
            ))}
          </div>
        </div>

        {/* UptimeRobot Note */}
        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.04] p-5">
          <div className="text-sm font-medium text-white/60">{t.subscribe}</div>
          <div className="mt-3 space-y-2 text-sm text-white/40">
            <p>1. Visit<a href="https://statuspage.tianji.love" className="text-[#d8b77b] underline">statuspage.tianji.love</a> (create free StatusPage.io account)</p>
            <p>2. Add this endpoint: <code className="text-xs text-white/60">https://tianji.love/api/status</code></p>
            <p>3. Set alerting thresholds and notification channels (email/Slack)</p>
          </div>
          <p className="mt-4 text-xs text-white/30">{t.note}</p>
        </div>

        {/* Incident History */}
        <div className="mt-8">
          <h2 className="mb-4 font-serif text-xl text-[#ffe3b4]">{t.incidentHistory}</h2>
          <p className="text-sm text-white/40">{t.noIncidents}</p>
        </div>
      </div>
    </main>
  );
}