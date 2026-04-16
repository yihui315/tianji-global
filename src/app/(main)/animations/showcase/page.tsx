export const dynamic = 'force-dynamic';

'use client';

/**
 * AnimationShowcase — 动画组件展示页
 *
 * 展示所有基于 AI_Animation 灵感创建的新动画组件
 */

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
  {
    id: 1,
    title: '选择命理类型',
    titleEn: 'Choose Fortune Type',
    description: '从八字、紫微、塔罗等中选择您想探索的类型',
    descriptionEn: 'Select from BaZi, ZiWei, Tarot and more',
    icon: '🎯'
  },
  {
    id: 2,
    title: '输入出生信息',
    titleEn: 'Enter Birth Info',
    description: '提供您的出生日期和时间，获得更精准的解读',
    descriptionEn: 'Provide your birth date and time for accurate readings',
    icon: '📅'
  },
  {
    id: 3,
    title: '获取命运解读',
    titleEn: 'Get Your Reading',
    description: 'AI将根据您的命盘信息，生成专属的命运解读',
    descriptionEn: 'AI generates personalized fate readings from your chart',
    icon: '🔮'
  },
  {
    id: 4,
    title: '探索更多可能',
    titleEn: 'Explore More',
    description: '通过多轮对话和What-If情境，深入了解命运',
    descriptionEn: 'Deep dive into destiny through multi-turn chat and What-If scenarios',
    icon: '✨'
  }
];

const GRID_ITEMS = [
  { icon: '🌟', title: '星盘分析', titleEn: 'Horoscope', color: '#7C3AED' },
  { icon: '🔮', title: '塔罗占卜', titleEn: 'Tarot', color: '#EC4899' },
  { icon: '📊', title: '八字命理', titleEn: 'BaZi', color: '#F59E0B' },
  { icon: '✨', title: '紫微斗数', titleEn: 'ZiWei', color: '#10B981' },
  { icon: '☯️', title: '易经六爻', titleEn: 'YiJing', color: '#6366F1' },
  { icon: '💑', title: '合盘分析', titleEn: 'Synastry', color: '#F97316' }
];

export default function AnimationShowcase() {
  const [language, setLanguage] = useState<Language>('zh');
  const [tarotCards] = useState(DEMO_TAROT_CARDS);

  return (
    <div className="showcase-page" style={{ background: colors.bgPrimary, minHeight: '100vh', color: 'white' }}>
      {/* 宇宙粒子背景 */}
      <CosmicParticles count={120} color="168, 130, 255" speed={0.2} />

      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitch />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-20 relative z-10">
        <SectionHeader
          title={language === 'zh' ? '✨ 动画组件展示' : '✨ Animation Showcase'}
          subtitle={language === 'zh' ? '基于 AI_Animation 的炫酷动画效果' : 'Cool animation effects inspired by AI_Animation'}
          badge="🎨"
        />

        {/* 语言切换 */}
        <div className="flex justify-center mb-12">
          <div className="flex gap-4">
            <button
              onClick={() => setLanguage('zh')}
              className={`px-6 py-2 rounded-lg border transition-all ${
                language === 'zh'
                  ? 'border-purple-500 bg-purple-500/20 text-white'
                  : 'border-white/20 bg-white/5 text-white/60'
              }`}
            >
              中文
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-6 py-2 rounded-lg border transition-all ${
                language === 'en'
                  ? 'border-purple-500 bg-purple-500/20 text-white'
                  : 'border-white/20 bg-white/5 text-white/60'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* 1. CosmicParticles 演示 */}
        <GlassCard level="card" className="mb-8 p-6">
          <h2 className="text-xl font-bold mb-4 text-amber-400">
            1. 🌌 CosmicParticles — 星尘粒子背景
          </h2>
          <p className="text-white/60 mb-4">
            {language === 'zh'
              ? 'Canvas绘制的宇宙星空粒子，带有向上飘动的星尘效果'
              : 'Canvas-drawn cosmic star particles with upward floating stardust effect'}
          </p>
          <div className="h-64 rounded-lg overflow-hidden relative">
            <CosmicParticles count={80} color="168, 130, 255" speed={0.3} />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white/40 text-lg">✨ 星空背景 ✨</p>
            </div>
          </div>
        </GlassCard>

        {/* 2. GlowButton 演示 */}
        <GlassCard level="card" className="mb-8 p-6">
          <h2 className="text-xl font-bold mb-4 text-amber-400">
            2. 💫 GlowButton — 脉冲发光按钮
          </h2>
          <p className="text-white/60 mb-4">
            {language === 'zh'
              ? '带有脉冲光环和涟漪效果的按钮'
              : 'Buttons with pulse glow and ripple effects'}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <GlowButton variant="primary" size="lg" icon="🚀">
              {language === 'zh' ? '开始探索' : 'Start Exploring'}
            </GlowButton>
            <GlowButton variant="secondary" size="lg" icon="📚">
              {language === 'zh' ? '学习更多' : 'Learn More'}
            </GlowButton>
            <GlowButton variant="accent" size="md" icon="❤️">
              {language === 'zh' ? '喜欢' : 'Like'}
            </GlowButton>
            <GlowButton variant="warning" size="sm" icon="⚠️">
              {language === 'zh' ? '注意' : 'Warning'}
            </GlowButton>
          </div>
        </GlassCard>

        {/* 3. MysticalStepper 演示 */}
        <GlassCard level="card" className="mb-8 p-6">
          <h2 className="text-xl font-bold mb-4 text-amber-400">
            3. 📍 MysticalStepper — 神秘进度步进器
          </h2>
          <p className="text-white/60 mb-4">
            {language === 'zh'
              ? '带有渐变进度条和动画效果的步骤指示器'
              : 'Step indicator with gradient progress bar and animation effects'}
          </p>
          <MysticalStepper steps={STEPS} language={language} autoPlay={false} />
        </GlassCard>

        {/* 4. TarotCardReveal 演示 */}
        <GlassCard level="card" className="mb-8 p-6">
          <h2 className="text-xl font-bold mb-4 text-amber-400">
            4. 🃏 TarotCardReveal — 塔罗牌翻转揭示
          </h2>
          <p className="text-white/60 mb-4">
            {language === 'zh'
              ? '3D翻转效果的塔罗牌揭示动画'
              : '3D flip animation for tarot card reveals'}
          </p>
          <TarotCardReveal
            cards={tarotCards}
            spread="three"
            language={language}
            autoReveal={false}
          />
        </GlassCard>

        {/* 5. StaggeredReveal 演示 */}
        <GlassCard level="card" className="mb-8 p-6">
          <h2 className="text-xl font-bold mb-4 text-amber-400">
            5. 📋 StaggeredReveal — 依次渐显动画
          </h2>
          <p className="text-white/60 mb-4">
            {language === 'zh'
              ? '内容依次渐显，增强阅读节奏感'
              : 'Content reveals sequentially for enhanced reading rhythm'}
          </p>

          <StaggeredReveal staggerDelay={200} direction="up">
            <div className="bg-white/5 p-4 rounded-lg">
              <h3 className="font-bold text-purple-400">第一步</h3>
              <p className="text-white/60 text-sm">这是第一个渐显的元素</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <h3 className="font-bold text-pink-400">第二步</h3>
              <p className="text-white/60 text-sm">这是第二个渐显的元素</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <h3 className="font-bold text-amber-400">第三步</h3>
              <p className="text-white/60 text-sm">这是第三个渐显的元素</p>
            </div>
          </StaggeredReveal>

          <div className="mt-6">
            <h3 className="text-sm text-white/40 mb-3">
              {language === 'zh' ? '网格布局版本:' : 'Grid Layout Version:'}
            </h3>
            <StaggeredGrid columns={3} staggerDelay={80}>
              {GRID_ITEMS.map((item, i) => (
                <div
                  key={i}
                  className="bg-white/[0.03] rounded-xl p-6 text-center border border-white/[0.06] hover:border-white/20 transition-all cursor-pointer"
                >
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <div className="font-bold" style={{ color: item.color }}>
                    {language === 'zh' ? item.title : item.titleEn}
                  </div>
                </div>
              ))}
            </StaggeredGrid>
          </div>
        </GlassCard>

        {/* 6. SequentialReveal 演示 */}
        <GlassCard level="card" className="mb-8 p-6">
          <h2 className="text-xl font-bold mb-4 text-amber-400">
            6. ✍️ SequentialReveal — 逐字显示
          </h2>
          <p className="text-white/60 mb-4">
            {language === 'zh'
              ? '文字逐字符显现的打字机效果'
              : 'Typewriter effect with character-by-character text reveal'}
          </p>

          <div className="bg-black/30 p-6 rounded-lg">
            <p className="text-2xl font-bold text-purple-400">
              <SequentialReveal
                text={language === 'zh'
                  ? '命运的密码，已为你书写...'
                  : 'The code of destiny, written for you...'
                }
                staggerDelay={60}
              />
            </p>
          </div>
        </GlassCard>

        {/* 组合演示 */}
        <GlassCard level="card" className="mb-8 p-6">
          <h2 className="text-xl font-bold mb-4 text-amber-400">
            🔥 组合效果演示
          </h2>
          <p className="text-white/60 mb-4">
            {language === 'zh'
              ? '多个动画组件组合使用'
              : 'Multiple animation components used together'}
          </p>

          <div className="flex flex-col gap-6">
            <StaggeredReveal staggerDelay={150}>
              <TarotCardReveal
                cards={tarotCards}
                spread="single"
                language={language}
                autoReveal={true}
                revealDelay={500}
              />
            </StaggeredReveal>

            <StaggeredReveal staggerDelay={100}>
              <div className="flex gap-4 justify-center">
                <GlowButton variant="primary" icon="🔮" fullWidth>
                  {language === 'zh' ? '开始占卜' : 'Start Divination'}
                </GlowButton>
                <GlowButton variant="secondary" icon="📖" fullWidth>
                  {language === 'zh' ? '了解更多' : 'Learn More'}
                </GlowButton>
              </div>
            </StaggeredReveal>
          </div>
        </GlassCard>

        {/* 页脚 */}
        <div className="text-center text-white/30 text-sm mt-12 pb-8">
          <p>✨ 基于 AI_Animation 灵感 | 天机全球</p>
          <p className="mt-2">
            {language === 'zh'
              ? '这些动画组件可增强占卜平台的沉浸感和交互体验'
              : 'These animation components enhance immersion and interaction on the fortune-telling platform'}
          </p>
        </div>
      </div>
    </div>
  );
}