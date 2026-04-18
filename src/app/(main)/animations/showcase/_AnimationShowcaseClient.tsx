'use client';

import React, { useState } from 'react';
import CosmicParticles from '@/components/animations/CosmicParticles';
import MysticalStepper from '@/components/animations/MysticalStepper';
import GlowButton from '@/components/animations/GlowButton';
import TarotCardReveal, { DEMO_TAROT_CARDS } from '@/components/animations/TarotCardReveal';
import { StaggeredGrid, SequentialReveal } from '@/components/animations/StaggeredReveal';
import { GlassCard, LanguageSwitch, SectionHeader } from '@/components/ui';
import { colors } from '@/design-system';

type Language = 'zh' | 'en';

const STEPS = [
  {
    id: 1,
    title: '选择命理类型',
    titleEn: 'Choose a reading',
    description: '从八字、紫微、塔罗等系统里选择你的入口。',
    descriptionEn: 'Pick BaZi, ZiWei, Tarot, and more.',
    icon: '✨',
  },
  {
    id: 2,
    title: '输入出生信息',
    titleEn: 'Enter birth details',
    description: '提供出生日期与时间，让结果更精准。',
    descriptionEn: 'Add your birth details for better precision.',
    icon: '🗓️',
  },
  {
    id: 3,
    title: '获取专属解读',
    titleEn: 'Get your reading',
    description: 'AI 基于命盘结构输出你的个性化结果。',
    descriptionEn: 'AI turns your chart into a personal reading.',
    icon: '🔮',
  },
  {
    id: 4,
    title: '继续深挖',
    titleEn: 'Explore deeper',
    description: '用追问和 What-if 情境继续扩展理解。',
    descriptionEn: 'Use follow-up prompts and What-if scenarios.',
    icon: '🌌',
  },
] as const;

const GRID_ITEMS = [
  { icon: '🪐', title: '星盘分析', titleEn: 'Horoscope', color: '#7C3AED' },
  { icon: '🔮', title: '塔罗占卜', titleEn: 'Tarot', color: '#EC4899' },
  { icon: '🧭', title: '八字命理', titleEn: 'BaZi', color: '#F59E0B' },
  { icon: '✨', title: '紫微斗数', titleEn: 'ZiWei', color: '#10B981' },
  { icon: '☯️', title: '易经卦爻', titleEn: 'YiJing', color: '#6366F1' },
  { icon: '💕', title: '合盘分析', titleEn: 'Synastry', color: '#F97316' },
] as const;

export default function AnimationShowcaseClient() {
  const [language, setLanguage] = useState<Language>('zh');
  const [tarotCards] = useState(DEMO_TAROT_CARDS);

  return (
    <div
      className="showcase-page"
      style={{ background: colors.bgPrimary, minHeight: '100vh', color: 'white' }}
    >
      <CosmicParticles count={120} color="168, 130, 255" speed={0.2} />

      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitch />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-12 w-full">
        <SectionHeader
          title="Animation Showcase"
          subtitle="动画组件展示 · TianJi Global"
          badge="✨"
        />

        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setLanguage('zh')}
            className={`px-4 py-2 rounded-lg ${language === 'zh' ? 'bg-purple-600' : 'bg-slate-700'}`}
          >
            中文
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-4 py-2 rounded-lg ${language === 'en' ? 'bg-purple-600' : 'bg-slate-700'}`}
          >
            English
          </button>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-purple-300 mb-4">
            {language === 'zh' ? '步骤动效' : 'Mystical Stepper'}
          </h2>
          <MysticalStepper steps={STEPS.map((step) => ({ ...step }))} language={language} />
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-purple-300 mb-4">
            {language === 'zh' ? '渐进式展示' : 'Staggered Reveal Animation'}
          </h2>
          <StaggeredGrid columns={3} staggerDelay={80}>
            {GRID_ITEMS.map((item) => (
              <div
                key={item.titleEn}
                className="bg-white/[0.03] rounded-xl p-6 text-center border border-white/[0.06] hover:border-white/20 transition-all cursor-pointer"
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <div className="font-bold" style={{ color: item.color }}>
                  {language === 'zh' ? item.title : item.titleEn}
                </div>
              </div>
            ))}
          </StaggeredGrid>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-purple-300 mb-4">
            {language === 'zh' ? '顺序揭示动画' : 'Sequential Reveal'}
          </h2>
          <div className="bg-white/[0.05] rounded-xl p-6 border border-white/[0.08]">
            <SequentialReveal
              text={
                language === 'zh'
                  ? '顺序动画可以把一段关键内容慢慢推到用户眼前。'
                  : 'Sequential reveal can slowly bring a key message into focus.'
              }
              className="text-slate-300"
              staggerDelay={40}
            />
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-purple-300 mb-4">
            {language === 'zh' ? '发光按钮' : 'Glow Button'}
          </h2>
          <div className="flex gap-4">
            <GlowButton onClick={() => {}}>
              {language === 'zh' ? '主要按钮' : 'Primary'}
            </GlowButton>
            <GlowButton onClick={() => {}} variant="secondary">
              {language === 'zh' ? '次要按钮' : 'Secondary'}
            </GlowButton>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-purple-300 mb-4">
            {language === 'zh' ? '塔罗翻牌动画' : 'Tarot Card Reveal'}
          </h2>
          <GlassCard level="card" className="p-6 bg-white/[0.02] rounded-2xl">
            <TarotCardReveal cards={tarotCards.slice(0, 3)} language={language} />
          </GlassCard>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-purple-300 mb-4">
            {language === 'zh' ? '宇宙粒子背景' : 'Cosmic Particles'}
          </h2>
          <GlassCard level="card" className="h-64 bg-white/[0.02] rounded-2xl relative overflow-hidden">
            <CosmicParticles count={80} color="139, 92, 246" speed={0.3} />
          </GlassCard>
        </section>
      </div>
    </div>
  );
}
