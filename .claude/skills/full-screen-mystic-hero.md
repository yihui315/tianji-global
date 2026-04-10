# Skill: /full-screen-mystic-hero

## 概述
完整神秘英雄区组件——组装所有子系统为一个沉浸式全屏首页英雄区：
CosmicBackground、MysticVignette、CosmicBreathing、TarotCardFlip、
HeroTitle、HeroCTA、MysticNav、ConfigPanel。

## 组件位置
`src/components/mystic-hero/MysticHero.tsx`

## 子组件清单

| 组件 | 职责 | 对应 Skill |
|---|---|---|
| CosmicBackground | 宇宙背景 + 星尘 + 星座粒子 | /floating-zodiac-particles |
| MysticVignette | 水晶球径向暗角 | /create-mystic-vignette |
| CosmicBreathing | Perlin noise 呼吸晃动 | /cosmic-breathing-wobble |
| TarotCardFlip | 3D 塔罗卡装饰 | /tarot-card-flip |
| HeroTitle | 双语标题 + 发光脉冲 | — |
| HeroCTA | CTA 按钮 + 鼠标跟随符号 | — |
| MysticNav | 极简导航 + 移动端菜单 | — |
| ConfigPanel | 实时调参面板 | — |

## Z-Index 层级

| 层 | z-index | 说明 |
|---|---|---|
| CosmicBackground (CSS) | 0 | 星云渐变背景 |
| CosmicBackground (Canvas) | 1 | 星尘 + 星座粒子 |
| MysticVignette | 2 | 暗角覆盖 |
| TarotCardFlip | 3 | 装饰塔罗牌 |
| Hero Content | 5 | 标题、CTA 等 |
| MysticNav | 50 | 导航栏 |
| Mobile Overlay | 60 | 移动端菜单 |
| ConfigPanel | 70 | 调参面板 |

## 使用示例
```tsx
import MysticHero from '@/components/mystic-hero/MysticHero';

export default function Home() {
  return (
    <div className="mystic-page">
      <MysticHero />
      {/* ... other sections ... */}
    </div>
  );
}
```

## 移动端适配
- 导航变汉堡菜单
- 标题缩小至 `text-5xl`
- CTA 垂直堆叠
- TarotCardFlip 在 < 1024px 时隐藏（`hidden lg:block`）
- 粒子密度自动按视口面积缩减

## 暗黑模式
- 默认即为暗色主题（宇宙背景天然暗黑）
- 所有文字使用 `text-white/xx` 透明度层级
