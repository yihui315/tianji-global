'use client';

/**
 * CosmicShowcase — 宇宙组件展示页
 */

import React, { useState } from 'react';
import CosmicBackground from '@/components/three-d/CosmicBackground';
import CosmicOrb from '@/components/three-d/CosmicOrb';
import GlassCardPro from '@/components/three-d/GlassCardPro';
import InteractiveZodiacWheel from '@/components/three-d/InteractiveZodiacWheel';
import FortuneFlow from '@/components/three-d/FortuneFlow';
import MysticalLoader from '@/components/three-d/MysticalLoader';
import CompatibilityChart from '@/components/three-d/CompatibilityChart';
import AnimatedProgress, { MultiRingProgress } from '@/components/three-d/AnimatedProgress';
import ConstellationEffect from '@/components/three-d/ConstellationEffect';
import MysticParticles from '@/components/three-d/MysticParticles';
import GlowButton from '@/components/animations/GlowButton';

export default function CosmicShowcase() {
  const [activeTab, setActiveTab] = useState('background');
  const [loading, setLoading] = useState(false);
  const [selectedSign, setSelectedSign] = useState<string>('aries');

  const tabs = [
    { id: 'background', label: '背景特效' },
    { id: '3d', label: '3D组件' },
    { id: 'progress', label: '进度条' },
    { id: 'chart', label: '图表' }
  ];

  return (
    <div style={{ background: '#030014', minHeight: '100vh', color: 'white' }}>
      {/* Header */}
      <div style={{ padding: '40px 20px', textAlign: 'center', borderBottom: '1px solid rgba(168,130,255,0.2)' }}>
        <h1 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8, background: 'linear-gradient(135deg, #7C3AED, #A782FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ✨ 天机宇宙组件库
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
          基于 AI_Animation 灵感 | 天机全球
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '20px', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: activeTab === tab.id ? '2px solid #A782FF' : '1px solid rgba(255,255,255,0.2)',
              background: activeTab === tab.id ? 'rgba(168,130,255,0.2)' : 'transparent',
              color: activeTab === tab.id ? '#A782FF' : 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 600 : 400
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
        {activeTab === 'background' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
            <GlassCardPro variant="glow" hoverEffect>
              <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#A782FF' }}>🌌 CosmicBackground</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 16 }}>星云渐变 + 粒子飘动背景</p>
              <div style={{ height: 200, borderRadius: 12, overflow: 'hidden' }}>
                <CosmicBackground particleCount={100} nebulaIntensity={0.2} />
              </div>
            </GlassCardPro>

            <GlassCardPro variant="glow" hoverEffect>
              <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#A782FF' }}>✨ ConstellationEffect</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 16 }}>星空连线 + 星座绘制动画</p>
              <div style={{ height: 200, borderRadius: 12, overflow: 'hidden' }}>
                <ConstellationEffect count={60} />
              </div>
            </GlassCardPro>

            <GlassCardPro variant="glow" hoverEffect className="full-width">
              <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#A782FF' }}>🌊 MysticParticles</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 16 }}>交互式粒子系统，鼠标移动推开粒子，点击爆发</p>
              <div style={{ height: 300, borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
                <MysticParticles count={150} interactive />
                <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                  移动鼠标或点击
                </div>
              </div>
            </GlassCardPro>
          </div>
        )}

        {activeTab === '3d' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
            <GlassCardPro variant="glow" hoverEffect>
              <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#A782FF' }}>🪐 CosmicOrb</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 16 }}>Three.js 3D旋转球体</p>
              <div style={{ height: 350, borderRadius: 12, overflow: 'hidden' }}>
                <CosmicOrb width={400} height={350} />
              </div>
            </GlassCardPro>

            <GlassCardPro variant="glow" hoverEffect>
              <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#A782FF' }}>🔮 InteractiveZodiacWheel</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 16 }}>拖拽旋转的十二星座轮盘</p>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <InteractiveZodiacWheel
                  selectedSign={selectedSign}
                  onSelect={(sign) => setSelectedSign(sign.id)}
                  size={320}
                />
              </div>
            </GlassCardPro>

            <GlassCardPro variant="glow" hoverEffect>
              <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#A782FF' }}>⚡ FortuneFlow</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 16 }}>运势数据流动可视化</p>
              <FortuneFlow nodes={[]} animated />
            </GlassCardPro>

            <GlassCardPro variant="glow" hoverEffect>
              <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#A782FF' }}>⏳ MysticalLoader</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 16 }}>神秘加载动画</p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                {loading ? (
                  <MysticalLoader language="zh" duration={4000} onComplete={() => setLoading(false)} />
                ) : (
                  <GlowButton onClick={() => setLoading(true)} variant="primary">
                    测试加载
                  </GlowButton>
                )}
              </div>
            </GlassCardPro>
          </div>
        )}

        {activeTab === 'progress' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            <GlassCardPro variant="glow" hoverEffect>
              <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#A782FF' }}>📊 AnimatedProgress</h3>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
                <AnimatedProgress value={85} label="事业" color="#F59E0B" />
                <AnimatedProgress value={72} label="感情" color="#EC4899" />
                <AnimatedProgress value={68} label="财富" color="#10B981" />
                <AnimatedProgress value={90} label="健康" color="#6366F1" />
              </div>
            </GlassCardPro>

            <GlassCardPro variant="glow" hoverEffect>
              <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#A782FF' }}>🔵 MultiRingProgress</h3>
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 20 }}>
                <MultiRingProgress
                  size={180}
                  rings={[
                    { label: '事业', value: 85, color: '#F59E0B' },
                    { label: '感情', value: 72, color: '#EC4899' },
                    { label: '财富', value: 68, color: '#10B981' },
                    { label: '健康', value: 90, color: '#6366F1' }
                  ]}
                />
              </div>
            </GlassCardPro>

            <GlassCardPro variant="glow" hoverEffect>
              <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#A782FF' }}>✨ GlowButton 变体</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <GlowButton variant="primary" icon="🚀" fullWidth>主要按钮</GlowButton>
                <GlowButton variant="secondary" icon="📚" fullWidth>次要按钮</GlowButton>
                <GlowButton variant="accent" icon="❤️" fullWidth>强调按钮</GlowButton>
                <GlowButton variant="warning" icon="⚠️" fullWidth>警告按钮</GlowButton>
              </div>
            </GlassCardPro>
          </div>
        )}

        {activeTab === 'chart' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
            <GlassCardPro variant="glow" hoverEffect>
              <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#A782FF' }}>💑 CompatibilityChart</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 16 }}>关系兼容度可视化</p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <CompatibilityChart
                  person1={{ name: '小明', nameEn: 'Xiao Ming', sign: '白羊座', element: '火', color: '#EF4444' }}
                  person2={{ name: '小红', nameEn: 'Xiao Hong', sign: '狮子座', element: '火', color: '#F97316' }}
                  language="zh"
                  showDetails
                />
              </div>
            </GlassCardPro>

            <GlassCardPro variant="glow" hoverEffect>
              <h3 style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#A782FF' }}>🎴 GlassCardPro</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 16 }}>3D倾斜玻璃拟态卡片</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <GlassCardPro variant="default">默认</GlassCardPro>
                <GlassCardPro variant="glow">发光</GlassCardPro>
                <GlassCardPro variant="bordered">边框</GlassCardPro>
                <GlassCardPro variant="gradient">渐变</GlassCardPro>
              </div>
            </GlassCardPro>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
        <p>✨ 天机全球 | 宇宙组件库</p>
        <p style={{ marginTop: 8 }}>共 20+ 动画组件 | 基于 AI_Animation 灵感</p>
      </div>
    </div>
  );
}
