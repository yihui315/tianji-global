'use client';

import Link from 'next/link';
import { useState } from 'react';

const FORTUNE_ITEMS = [
  {
    href: '/ziwei',
    title: '紫微斗数',
    titleEn: 'Zi Wei Dou Shu',
    description: '14主星 · 12宫位 · 四化分析',
    descriptionEn: 'Purple Star Astrology',
    icon: '🌟',
    gradient: 'from-purple-600 to-indigo-700',
  },
  {
    href: '/bazi',
    title: '八字命理',
    titleEn: 'Ba Zi',
    description: '日主 · 十神 · 大运流年',
    descriptionEn: 'Four Pillars of Destiny',
    icon: '📊',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    href: '/yijing',
    title: '易经占卜',
    titleEn: 'Yi Jing',
    description: '64卦 · 爻辞 · 象数分析',
    descriptionEn: 'I Ching Oracle',
    icon: '🔥',
    gradient: 'from-red-500 to-pink-600',
  },
  {
    href: '/western',
    title: '西方占星',
    titleEn: 'Western Astrology',
    description: '太阳 · 月亮 · 上升星座',
    descriptionEn: 'Sun, Moon & Rising Signs',
    icon: '✨',
    gradient: 'from-blue-500 to-cyan-600',
  },
  {
    href: '/tarot',
    title: '塔罗牌',
    titleEn: 'Tarot',
    description: '78牌 · 大阿卡纳与小子阿卡纳',
    descriptionEn: 'Major & Minor Arcana',
    icon: '🎴',
    gradient: 'from-violet-600 to-purple-600',
  },
  {
    href: '/love-match',
    title: '姻缘合盘',
    titleEn: 'Love Match',
    description: '八字合婚 · 命理姻缘配对',
    descriptionEn: 'BaZi Marriage Compatibility',
    icon: '💘',
    gradient: 'from-pink-600 to-rose-600',
  },
  {
    href: '/synastry',
    title: '星盘合盘',
    titleEn: 'Synastry',
    description: '西方占星 · 行星相位分析',
    descriptionEn: 'Western Astrology · Planetary Aspects',
    icon: '💫',
    gradient: 'from-violet-600 to-purple-600',
  },
  {
    href: '/sky-chart',
    title: '实时星空',
    titleEn: 'Sky Chart',
    description: '3D天体球 · 实时星象观测',
    descriptionEn: '3D Celestial Sphere · Real-time Sky',
    icon: '🌌',
    gradient: 'from-blue-900 to-indigo-900',
  },
  {
    href: '/fengshui',
    title: '玄空风水',
    titleEn: 'Flying Star Feng Shui',
    description: '三元玄空飞星 · 阳宅风水分析',
    descriptionEn: 'Xuan Kong Fei Xing · Building Analysis',
    icon: '🏠',
    gradient: 'from-amber-700 to-orange-600',
  },
  {
    href: '/electional',
    title: '择日择时',
    titleEn: 'Electoral Astrology',
    description: '开业·嫁娶·出行·手术最佳时辰',
    descriptionEn: 'Best Timing for Business, Marriage, Travel',
    icon: '📅',
    gradient: 'from-emerald-600 to-teal-600',
  },
  {
    href: '/horary',
    title: '卦占问事',
    titleEn: 'Horary Astrology',
    description: '提问的时刻 · 即时卦象解读',
    descriptionEn: 'Cast a Chart for This Moment',
    icon: '🔮',
    gradient: 'from-indigo-700 to-violet-700',
  },
  {
    href: '/celebrities',
    title: '名人命盘',
    titleEn: 'Celebrity Charts',
    description: '与马斯克/霉霉同盘 · 名人命盘数据库',
    descriptionEn: 'Match Charts with Elon, Taylor & More',
    icon: '🌍',
    gradient: 'from-cyan-600 to-blue-600',
  },
  {
    href: '/embed',
    title: '嵌入图表',
    titleEn: 'Embed Widgets',
    description: '将 TianJi 图表嵌入你的网站',
    descriptionEn: 'Embed TianJi Charts on Your Site',
    icon: '📐',
    gradient: 'from-slate-600 to-gray-600',
  },
];

export default function HomePage() {
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
        {/* Stars Effect */}
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
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/30 rounded-full blur-3xl" />
      </div>

      {/* Content */}
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
                href="/pricing"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-amber-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
              >
                {language === 'zh' ? '订阅方案' : 'Pricing'}
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

        {/* Hero Section */}
        <section className="text-center px-6 py-12 md:py-20">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {language === 'zh' ? (
              <>探索命运的<span className="text-purple-400">奥秘</span></>
            ) : (
              <>Discover the <span className="text-purple-400">Mysteries</span> of Fate</>
            )}
          </h2>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            {language === 'zh'
              ? '融合中国传统文化与现代人工智能的命理平台'
              : 'AI-powered fortune platform combining Chinese metaphysics with modern technology'}
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
            <span className="px-3 py-1 bg-slate-800/50 rounded-full">紫微斗数</span>
            <span className="px-3 py-1 bg-slate-800/50 rounded-full">八字命理</span>
            <span className="px-3 py-1 bg-slate-800/50 rounded-full">易经占卜</span>
            <span className="px-3 py-1 bg-slate-800/50 rounded-full">西方占星</span>
            <span className="px-3 py-1 bg-slate-800/50 rounded-full">塔罗牌</span>
          </div>
        </section>

        {/* Navigation Cards */}
        <section className="px-6 pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FORTUNE_ITEMS.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative overflow-hidden rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Card Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <div className="relative p-6">
                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${item.gradient} mb-4`}>
                      <span className="text-2xl">{item.icon}</span>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-purple-300 text-sm mb-3">{item.titleEn}</p>
                    
                    {/* Description */}
                    <p className="text-slate-400 text-sm mb-4">
                      {language === 'zh' ? item.description : item.descriptionEn}
                    </p>
                    
                    {/* Arrow */}
                    <div className="flex items-center text-purple-400 text-sm font-medium">
                      <span>{language === 'zh' ? '开始探索' : 'Start Exploring'}</span>
                      <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
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

      {/* CSS for Stars Animation */}
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
