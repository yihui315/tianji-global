'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { MysticButton } from '@/components/ui/MysticButton';
import { HeroSummary } from '@/components/reading/HeroSummary';
import { ChartSection } from '@/components/reading/ChartSection';
import { InsightSection } from '@/components/reading/InsightSection';
import { ApplicationSection } from '@/components/reading/ApplicationSection';
import { TimelineSection } from '@/components/reading/TimelineSection';
import { ActionSection } from '@/components/reading/ActionSection';
import { UpgradeSection } from '@/components/reading/UpgradeSection';
import { TrustSection } from '@/components/reading/TrustSection';
import type { Reading, Language, WesternChartData } from '@/types/reading';
import { generateReading } from '@/lib/reading-engine';
import { ZODIAC_DATA, ELEM_COLORS } from '@/lib/chart-engine';

function getSignData(signName: string) {
  return ZODIAC_DATA.find(s => s.name === signName) ?? ZODIAC_DATA[0];
}

// ─── Demo Big Three Cards ─────────────────────────────────────────────────────

interface BigThreeCardProps {
  label: string;
  data: { sign: string; signZh: string; symbol: string; degree: number };
  accentColor: string;
  lang: Language;
}

function BigThreeCard({ label, data, accentColor, lang }: BigThreeCardProps) {
  const signData = getSignData(data.sign);
  return (
    <GlassCard level="card" className="p-5 text-center flex-1 min-w-0">
      <div className="text-2xl mb-1">{data.symbol}</div>
      <div className="text-xs mb-2" style={{ color: accentColor }}>{label}</div>
      <div className="text-xl font-serif font-bold text-white mb-1">
        {lang === 'zh' ? data.signZh : data.sign}
      </div>
      <div className="text-sm" style={{ color: ELEM_COLORS[signData.element] }}>
        {data.degree}° · {signData.element}
      </div>
    </GlassCard>
  );
}

// ─── Share Card (Viral Feature) ───────────────────────────────────────────────

interface ShareCardProps {
  reading: Reading;
  lang: Language;
}

function ShareCard({ reading, lang }: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  // MiniMax AI-generated share card backgrounds by service type
  const SHARE_BACKGROUNDS: Record<string, string> = {
    synastry: '/assets/share/share-relationship-card.png',
    ziwei:    '/assets/share/share-fortune-chart.png',
    bazi:     '/assets/share/share-fortune-chart.png',
    western:  '/assets/share/share-fortune-chart.png',
    tarot:    '/assets/share/share-ai-card.png',
    yijing:   '/assets/share/share-ai-card.png',
  };
  const bgImage = SHARE_BACKGROUNDS[reading.type] || '/assets/share/share-ai-card.png';

  const handleCopy = async () => {
    const text = `${reading.summary.headline}\n${reading.summary.keywords.join(' · ')}\n\n🔮 TianJi Global`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <GlassCard level="card" className="p-5">
      <div className="text-xs font-medium mb-3" style={{ color: 'rgba(251,191,36,0.6)' }}>
        {lang === 'zh' ? '📱 一句话分享卡片' : '📱 One-Line Share Card'}
      </div>
      <div
        className="p-4 rounded-xl text-center mb-3 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, rgba(124,58,237,0.6), rgba(251,191,36,0.3)), url(${bgImage}) center/cover`,
          border: '1px solid rgba(167,139,250,0.3)',
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 rounded-xl" style={{ background: 'rgba(3,0,20,0.5)' }} />
        <div className="relative z-10">
          <p className="text-sm font-serif font-bold text-white mb-1">{reading.summary.headline}</p>
          <div className="flex flex-wrap justify-center gap-1 mt-2">
            {reading.summary.keywords.slice(0, 3).map((k, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(226,232,240,0.9)' }}>
                {k}
              </span>
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={handleCopy}
        className="w-full text-xs py-2 rounded-lg transition-colors"
        style={{
          background: copied ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${copied ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.1)'}`,
          color: copied ? '#34D399' : 'rgba(226,232,240,0.6)',
        }}
      >
        {copied ? (lang === 'zh' ? '✓ 已复制！' : '✓ Copied!') : (lang === 'zh' ? '📋 复制文字' : '📋 Copy Text')}
      </button>
    </GlassCard>
  );
}

// ─── Premium Unlock Modal ─────────────────────────────────────────────────────

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: () => void;
  lang: Language;
}

function UnlockModal({ isOpen, onClose, onUnlock, lang }: UnlockModalProps) {
  const features = lang === 'zh'
    ? ['完整时间线分析', '关系/事业/财富深度解读', 'AI行动指南', '可分享命运卡片']
    : ['Full timeline analysis', 'Deep relationship/career/wealth insights', 'AI action guide', 'Shareable fortune card'];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <GlassCard level="strong" className="p-6 text-center">
              <div className="text-4xl mb-3">🔮</div>
              <h2 className="text-xl font-serif font-bold text-white mb-2">
                {lang === 'zh' ? '解锁完整命运报告' : 'Unlock Full Fortune Report'}
              </h2>
              <p className="text-sm mb-5" style={{ color: 'rgba(226,232,240,0.6)' }}>
                {lang === 'zh'
                  ? '一次解锁，终身查看。包含所有高级内容。'
                  : 'One-time unlock, lifetime access. All premium content included.'}
              </p>
              <div className="space-y-2 mb-6 text-left">
                {features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(226,232,240,0.8)' }}>
                    <span style={{ color: '#34D399' }}>✓</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <MysticButton variant="outline" size="md" className="flex-1" onClick={onClose}>
                  {lang === 'zh' ? '继续预览' : 'Keep Previewing'}
                </MysticButton>
                <MysticButton variant="solid" size="md" className="flex-1 font-bold" onClick={onUnlock}>
                  {lang === 'zh' ? '解锁 ¥68' : 'Unlock $9.9'}
                </MysticButton>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton({ lang }: { lang: Language }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-pulse">🔮</div>
        <p className="text-sm" style={{ color: 'rgba(226,232,240,0.5)' }}>
          {lang === 'zh' ? '正在加载你的命运报告...' : 'Loading your fortune report...'}
        </p>
      </div>
    </div>
  );
}

// ─── Main Reading Page ────────────────────────────────────────────────────────

function ReadingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [reading, setReading] = useState<Reading | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockTriggered, setUnlockTriggered] = useState(false);

  // Check URL params for reading data or generate demo
  useEffect(() => {
    const readId = searchParams.get('id');
    const readData = searchParams.get('data');
    const type = (searchParams.get('type') as 'western' | 'bazi' | 'ziwei') || 'western';
    const langParam = searchParams.get('lang') as Language;

    if (readData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(readData)) as Reading;
        setReading(parsed);
        setIsLoading(false);
        return;
      } catch { /* ignore */ }
    }

    // Generate demo reading for preview
    const demoBirthDate = searchParams.get('birthDate') || '1990-08-16';
    const demoBirthTime = searchParams.get('birthTime') || '12:00';
    const lang = langParam || 'zh';

    // Demo chart data
    const demoChartData: WesternChartData = {
      bigThree: {
        sun: { sign: 'Leo', signZh: '狮子', symbol: '♌', degree: 12.5 },
        moon: { sign: 'Scorpio', signZh: '天蝎', symbol: '♏', degree: 28.3 },
        rising: { sign: 'Capricorn', signZh: '摩羯', symbol: '♑', degree: 5.7 },
      },
      sun: { sign: 'Leo', signZh: '狮子', symbol: '♌', degree: 12.5 },
      moon: { sign: 'Scorpio', signZh: '天蝎', symbol: '♏', degree: 28.3 },
      rising: { sign: 'Capricorn', signZh: '摩羯', symbol: '♑', degree: 5.7 },
      planets: [
        { name: 'Sun', symbol: '☉', sign: 'Leo', signZh: '狮子', degree: 12.5, longitude: 120.5, signSymbol: '♌' },
        { name: 'Moon', symbol: '☽', sign: 'Scorpio', signZh: '天蝎', degree: 28.3, longitude: 298.3, signSymbol: '♏' },
        { name: 'Mercury', symbol: '☿', sign: 'Leo', signZh: '狮子', degree: 5.2, longitude: 115.2, signSymbol: '♌' },
        { name: 'Venus', symbol: '♀', sign: 'Cancer', signZh: '巨蟹', degree: 22.1, longitude: 102.1, signSymbol: '♋' },
        { name: 'Mars', symbol: '♂', sign: 'Virgo', signZh: '处女', degree: 18.9, longitude: 168.9, signSymbol: '♍' },
        { name: 'Jupiter', symbol: '♃', sign: 'Sagittarius', signZh: '射手', degree: 8.4, longitude: 248.4, signSymbol: '♐' },
        { name: 'Saturn', symbol: '♄', sign: 'Capricorn', signZh: '摩羯', degree: 25.2, longitude: 295.2, signSymbol: '♑' },
      ],
      houses: {
        ascendant: 5.7, ascendantSign: 'Capricorn', ascendantSignZh: '摩羯',
        midheaven: 15.3, mcSign: 'Scorpio', mcSignZh: '天蝎',
      },
    };

    const demoReading = generateReading(
      type,
      { birthDate: demoBirthDate, birthTime: demoBirthTime },
      demoChartData,
      lang
    );

    setReading(demoReading);
    setIsLoading(false);
  }, [searchParams]);

  const handleUnlock = useCallback(() => {
    if (!reading) return;
    // In production: trigger payment flow here
    // For demo: toggle premium state
    setReading(prev => prev ? { ...prev, isPremium: !prev.isPremium } : null);
    setShowUnlockModal(false);
  }, [reading]);

  const triggerUnlockModal = useCallback(() => {
    setShowUnlockModal(true);
  }, []);

  // Scroll-based unlock trigger
  useEffect(() => {
    if (!reading || reading.isPremium) return;

    const handleScroll = () => {
      if (unlockTriggered) return;
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > 50) {
        setUnlockTriggered(true);
        setShowUnlockModal(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [reading, unlockTriggered]);

  if (isLoading) {
    return <LoadingSkeleton lang="zh" />;
  }

  if (!reading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <GlassCard level="card" className="p-8 text-center max-w-md">
          <div className="text-3xl mb-3">🔮</div>
          <p className="text-white text-sm mb-4">Reading not found</p>
          <MysticButton variant="outline" size="md" onClick={() => router.push('/report/western')}>
            ← Generate New Reading
          </MysticButton>
        </GlassCard>
      </div>
    );
  }

  const lang = reading.language;

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <UnlockModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        onUnlock={handleUnlock}
        lang={lang}
      />

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        {/* Hero Summary */}
        <HeroSummary
          summary={reading.summary}
          user={reading.user}
          type={reading.type}
          isPremium={reading.isPremium}
          onUnlock={triggerUnlockModal}
          lang={lang}
          readingId={reading.id}
        />

        {/* Big Three Cards */}
        {reading.chart.western && (
          <section>
            <div className="text-center mb-4">
              <h2 className="text-xs tracking-widest uppercase mb-1" style={{ color: 'rgba(251,191,36,0.6)' }}>
                {lang === 'zh' ? '核心命盘结构' : 'Core Chart Structure'}
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <BigThreeCard
                label={lang === 'zh' ? '太阳' : 'Sun'}
                data={reading.chart.western.sun}
                accentColor="#FCD34D"
                lang={lang}
              />
              <BigThreeCard
                label={lang === 'zh' ? '月亮' : 'Moon'}
                data={reading.chart.western.moon}
                accentColor="#C0C0C0"
                lang={lang}
              />
              <BigThreeCard
                label={lang === 'zh' ? '上升' : 'Rising'}
                data={reading.chart.western.rising}
                accentColor="#A78BFA"
                lang={lang}
              />
            </div>
          </section>
        )}

        {/* Charts */}
        <ChartSection
          elements={reading.chart.elements}
          timeline={reading.timeline}
          lang={lang}
          isPremium={reading.isPremium}
          birthYear={parseInt(reading.user.birthDate.split('-')[0])}
        />

        {/* Insights */}
        <InsightSection
          insights={reading.insights}
          isPremium={reading.isPremium}
          onUnlock={triggerUnlockModal}
          lang={lang}
        />

        {/* Applications */}
        <ApplicationSection
          applications={reading.applications}
          isPremium={reading.isPremium}
          onUnlock={triggerUnlockModal}
          lang={lang}
        />

        {/* Timeline */}
        <TimelineSection
          timeline={reading.timeline}
          isPremium={reading.isPremium}
          onUnlock={triggerUnlockModal}
          lang={lang}
        />

        {/* Action Guide */}
        <ActionSection
          actions={reading.actions}
          isPremium={reading.isPremium}
          onUnlock={triggerUnlockModal}
          lang={lang}
        />

        {/* Share Card */}
        <section>
          <ShareCard reading={reading} lang={lang} />
        </section>

        {/* Upgrade */}
        <UpgradeSection
          isPremium={reading.isPremium}
          lang={lang}
          onUnlock={triggerUnlockModal}
        />

        {/* Trust */}
        <TrustSection lang={lang} />

        {/* Footer */}
        <div className="text-center text-xs pb-8" style={{ color: 'rgba(226,232,240,0.25)' }}>
          TianJi Global · {lang === 'zh' ? '瑞士星历表精密计算' : 'Swiss Ephemeris Precision Calculation'}
        </div>
      </div>
    </main>
  );
}

export default function ReadingPage() {
  return (
    <Suspense fallback={<LoadingSkeleton lang="zh" />}>
      <ReadingPageContent />
    </Suspense>
  );
}
