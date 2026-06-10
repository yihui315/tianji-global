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
  return buildLocalizedMetadata({ locale, path: '/dashboard', title: 'Analytics Dashboard' });
}

const metrics = {
  en: {
    title: 'Business Dashboard',
    subtitle: 'tianji.love — Revenue & Growth Metrics',
    revenue: {
      label: 'Monthly Revenue',
      sub: 'Current month',
      currency: 'USD',
    },
    subscriptions: {
      label: 'Active Subscriptions',
      sub: 'Monthly Pass holders',
    },
    reports: {
      label: 'Reports Sold',
      sub: 'This month',
    },
    conversion: {
      label: 'Conversion Rate',
      sub: 'Free → Paid',
    },
    traffic: {
      label: 'Monthly Visitors',
      sub: 'Unique visitors',
    },
    topPages: 'Top Performing Pages',
    recentOrders: 'Recent Orders',
    quickLinks: 'Quick Links',
    stripe: 'Stripe Dashboard',
    searchConsole: 'Search Console',
    uptime: 'Uptime Monitor',
    docs: 'Documentation',
    note: 'Live data requires DATABASE_URL and Stripe API keys configured. Metrics below are simulated.',
  },
  'zh-CN': {
    title: '商业数据看板',
    subtitle: 'tianji.love — 收入与增长指标',
    revenue: { label: '本月收入', sub: '当前月份', currency: 'USD' },
    subscriptions: { label: '活跃订阅', sub: '月度通行证用户' },
    reports: { label: '已售报告', sub: '本月' },
    conversion: { label: '转化率', sub: '免费 → 付费' },
    traffic: { label: '月访客', sub: '独立访客' },
    topPages: '表现最佳页面',
    recentOrders: '最近订单',
    quickLinks: '快捷链接',
    stripe: 'Stripe 管理后台',
    searchConsole: '搜索控制台',
    uptime: '运行状态监控',
    docs: '操作文档',
    note: '实时数据需要配置 DATABASE_URL 和 Stripe API keys。以下指标为模拟数据。',
  },
};

function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
      <div className="text-sm text-white/50">{label}</div>
      <div className="mt-2 font-serif text-3xl font-semibold text-[#d8b77b]">{value}</div>
      <div className="mt-1 text-xs text-white/38">{sub}</div>
    </div>
  );
}

function LinkCard({ href, label, description }: { href: string; label: string; description: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-[#d8b77b]/40 hover:bg-white/[0.07]"
    >
      <span className="text-sm font-semibold text-white/80">{label}</span>
      <span className="text-xs text-white/38">{description}</span>
    </a>
  );
}

export default async function DashboardPage({ params }: PageParams) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const t = metrics[locale as keyof typeof metrics];

  const isZh = locale === 'zh-CN';

  return (
    <main className="min-h-screen bg-[#050508] px-5 py-16 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
       <div className="mb-2 text-xs font-medium tracking-widest text-[#d8b77b]/60 uppercase">
          TianJi Love — Ops Dashboard
        </div>
        <h1 className="font-serif text-4xl text-[#ffe3b4] sm:text-5xl">{t.title}</h1>
        <p className="mt-3 text-sm text-white/50">{t.subtitle}</p>

        {/* Metric Cards */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard label={t.revenue.label} value="$0" sub={t.revenue.sub} />
          <MetricCard label={t.subscriptions.label} value="0" sub={t.subscriptions.sub} />
          <MetricCard label={t.reports.label} value="0" sub={t.reports.sub} />
          <MetricCard label={t.conversion.label} value="0%" sub={t.conversion.sub} />
          <MetricCard label={t.traffic.label} value="0" sub={t.traffic.sub} />
        </div>

        {/* Setup Notice */}
        <div className="mt-8 rounded-xl border border-[#d8b77b]/20 bg-[#d8b77b]/08 p-5">
          <div className="text-sm font-medium text-[#d8b77b]">⚡ Setup Required for Live Data</div>
          <ul className="mt-3 space-y-2 text-sm text-white/60">
            <li>• Configure <code className="text-xs text-white/80">DATABASE_URL</code> → Supabase PostgreSQL → orders/entitlements table</li>
            <li>• Configure <code className="text-xs text-white/80">STRIPE_SECRET_KEY</code> → Stripe API access</li>
            <li>• Configure <code className="text-xs text-white/80">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> → Stripe.js</li>
            <li>• Set up <code className="text-xs text-white/80">SUPABASE_SERVICE_ROLE_KEY</code> for server-side queries</li>
            <li>• See <code className="text-xs text-white/80">content/stripe-test-guide.md</code> for test mode verification</li>
          </ul>
        </div>

        {/* Top Pages */}
        <div className="mt-10">
          <h2 className="mb-4 font-serif text-xl text-[#ffe3b4]">{t.topPages}</h2>
          <div className="rounded-xl border border-white/10 bg-white/[0.04]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-white/40">
                  <th className="px-5 py-3 font-medium">Page</th>
                  <th className="px-5 py-3 font-medium">Views</th>
                  <th className="px-5 py-3 font-medium">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { page: '/does-my-ex-still-love-me', views: '—', conv: '—' },
                  { page: '/will-my-ex-come-back', views: '—', conv: '—' },
                  { page: '/pricing', views: '—', conv: '—' },
                  { page: '/daily-oracle', views: '—', conv: '—' },
                  { page: '/love-reading', views: '—', conv: '—' },
                ].map((row) => (
                  <tr key={row.page} className="border-b border-white/5 text-white/60">
                    <td className="px-5 py-3 font-mono text-xs">{row.page}</td>
                    <td className="px-5 py-3">{row.views}</td>
                    <td className="px-5 py-3">{row.conv}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-10">
          <h2 className="mb-4 font-serif text-xl text-[#ffe3b4]">{t.quickLinks}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <LinkCard
              href="https://dashboard.stripe.com"
              label={t.stripe}
              description="Payments, subscriptions, invoices"
            />
            <LinkCard
              href="https://search.google.com/search-console"
              label={t.searchConsole}
              description="Index status, search impressions"
            />
            <LinkCard
              href="https://statuspage.tianji.love"
              label={t.uptime}
              description="UptimeRobot / Pingdom"
            />
            <LinkCard
              href="https://tianji.love/sitemap.xml"
              label="Sitemap"
              description="SEO — submit to search engines"
            />
          </div>
        </div>

        {/* Revenue Funnel */}
        <div className="mt-10">
          <h2 className="mb-4 font-serif text-xl text-[#ffe3b4]">
            {isZh ? '收入漏斗' : 'Revenue Funnel'}
          </h2>
          <div className="space-y-3">
            {[
              { stage: isZh ? '访客' : 'Visitors', value: '—', pct: '100%' },
              { stage: isZh ? '免费解读开始' : 'Free Reading Started', value: '—', pct: '—' },
              { stage: isZh ? '免费解读完成' : 'Free Reading Completed', value: '—', pct: '—' },
              { stage: isZh ? 'Checkout 点击' : 'Checkout Clicked', value: '—', pct: '—' },
              { stage: isZh ? '支付成功' : 'Payment Succeeded', value: '—', pct: '—' },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-40 text-sm text-white/60">{step.stage}</div>
                <div className="flex-1 rounded-full bg-white/5">
                  <div className="h-2 rounded-full bg-[#d8b77b]/20" style={{ width: step.pct === '100%' ? '100%' : '5%' }} />
                </div>
                <div className="w-12 text-right text-xs text-white/40">{step.pct}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="text-xs text-white/30">{t.note}</p>
        </div>
      </div>
    </main>
  );
}