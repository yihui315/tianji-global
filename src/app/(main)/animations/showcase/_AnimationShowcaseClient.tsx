'use client';

import React, { useState } from 'react';
import CosmicParticles from '@/components/animations/CosmicParticles';
import MysticalStepper from '@/components/animations/MysticalStepper';
import GlowButton from '@/components/animations/GlowButton';
import TarotCardReveal, { DEMO_TAROT_CARDS } from '@/components/animations/TarotCardReveal';
import StaggeredReveal, { StaggeredGrid, SequentialReveal } from '@/components/animations/StaggeredReveal';
import { GlassCard, MysticButton, LanguageSwitch, SectionHeader } from '@/components/ui';
import { colors } from '@/design-system';

type Language = 'zh' | 'en';

const STEPS = [
  { id: 1, title: '选择命理类型', titleEn: 'Choose Fortune Type', description: '从八字、紫微、塔罗等中选择您想探索的类型', descriptionEn: 'Select from BaZi, ZiWei, Tarot and more', icon: '🎯' },
  { id: 2, title: '输入出生信息', titleEn: 'Enter Birth Info', description: '提供您的出生日期和时间，获得更精准的解读', descriptionEn: 'Provide your birth date and time for accurate readings', icon: '📅' },
  { id: 3, title: '获取命运解读', titleEn: 'Get Your Reading', description: 'AI将根据您的命盘信息，生成专属的命运解读', descriptionEn: 'AI generates personalized fate readings from your chart', icon: '🔮' },
  { id: 4, title: '探索更多可能', titleEn: 'Explore More', description: '通过多轮对话和What-If情境，深入了解命运', descriptionEn: 'Deep dive into destiny through multi-turn chat and What-If scenarios', icon: '✨' },
];

const GRID_ITEMS = [
  { icon: '🌟', title: '星盘分析', titleEn: 'Horoscope', color: '#7C3AED' },
  { icon: '🔮', title: '塔罗占卜', titleEn: 'Tarot', color: '#EC4899' },
  { icon: '📊', title: '八字命理', titleEn: 'BaZi', color: '#F59E0B' },
  { icon: '✨', title: '紫微斗数', titleEn: 'ZiWei', color: '#10B981' },
  { icon: '☯️', title: '易经六爻', titleEn: 'YiJing', color: '#6366F1' },
  { icon: '💑', title: '合盘分析', titleEn: 'Synastry', color: '#F97316' },
];

export default function AnimationShowcaseClient() {
  const [language, setLanguage] = useState<Language>('zh');
  const [tarotCards] = useState(DEMO_TAROT_CARDS);

  return (
    <div className="showcase-page" style={{ background: colors.bgPrimary, minHeight: '100vh', color: 'white' }}>
      <CosmicParticles count={120} color="168, 130, 255" speed={0.2} />

      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitch />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-12 w-full">
        <SectionHeader title="Animation Showcase" subtitle="动画组件展示 · TianJi Global" badge="✨" />

        {/* Language Toggle */}
        <div className="flex gap-2 mb-8">
          <button onClick={() => setLanguage('zh')} className={`px-4 py-2 rounded-lg ${language === 'zh' ? 'bg-purple-600' : 'bg-slate-700'}`}>中文</button>
          <button onClick={() => setLanguage('en')} className={`px-4 py-2 rounded-lg ${language === 'en' ? 'bg-purple-600' : 'bg-slate-700'}`}>English</button>
        </div>

        {/* MysticalStepper */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-purple-300 mb-4">{language === 'zh' ? ' mysticalStepper' : 'MysticalStepper'}</h2>
          <MysticalStepper steps={STEPS} language={language} />
        </section>

        {/* Staggered Reveal */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-purple-300 mb-4">{language === 'zh' ? '渐进式揭示动画' : 'Staggered Reveal Animation'}</h2>
          <StaggeredGrid columns={3} staggerDelay={80}>
            {GRID_ITEMS.map((item, i) => (
              <div key={i} className="bg-white/[0.03] rounded-xl p-6 text-center border border-white/[0.06] hover:border-white/20 transition-all cursor-pointer">
                <div className="text-4xl mb-3">{item.icon}</div>
                <div className="font-bold" style={{ color: item.color }}>
                  {language === 'zh' ? item.title : item.titleEn}
                </div>
              </div>
            ))}
          </StaggeredGrid>
        </section>

        {/* Sequential Reveal */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-purple-300 mb-4">{language === 'zh' ? '顺序揭示动画' : 'Sequential Reveal'}</h2>
          <SequentialReveal delay={100} direction="up">
            <div className="bg-white/[0.05] rounded-xl p-6 border border-white/[0.08]">
              <p className="text-slate-300">{language === 'zh' ? '顺序动画揭示的内容...' : 'Sequentially revealed content...'}</p>
            </div>
          </SequentialReveal>
        </section>

        {/* GlowButton */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-purple-300 mb-4">{language === 'zh' ? '发光按钮' : 'Glow Button'}</h2>
          <div className="flex gap-4">
            <GlowButton onClick={() => {}}>{language === 'zh' ? '主要按钮' : 'Primary'}</GlowButton>
            <GlowButton onClick={() => {}} variant="secondary">{language === 'zh' ? '次要按钮' : 'Secondary'}</GlowButton>
          </div>
        </section>

        {/* Tarot Card Reveal */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-purple-300 mb-4">{language === 'zh' ? '塔罗牌翻转动画' : 'Tarot Card Reveal'}</h2>
          <GlassCard level="card" className="p-6 bg-white/[0.02] rounded-2xl">
            <TarotCardReveal cards={tarotCards.slice(0, 3)} language={language} />
          </GlassCard>
        </section>

        {/* Cosmic Particles */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-purple-300 mb-4">{language === 'zh' ? '宇宙粒子背景' : 'Cosmic Particles'}</h2>
          <GlassCard level="card" className="h-64 bg-white/[0.02] rounded-2xl relative overflow-hidden">
            <CosmicParticles count={80} color="139, 92, 246" speed={0.3} />
          </GlassCard>
        </section>
      </div>
    </div>
  );
}
