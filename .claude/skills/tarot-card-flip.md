# Skill: /tarot-card-flip

## 概述
装饰性塔罗牌 3D 翻转动画——在英雄区两侧各放置一张半透明塔罗牌，
使用 Perlin noise 驱动缓慢的 3D 旋转（rotateY + rotateX），营造神秘飘浮感。
纯视觉装饰，非交互元素。桌面端（≥1024px）可见。

## 组件位置
`src/components/mystic-hero/TarotCardFlip.tsx`

## Props
| 参数 | 类型 | 说明 |
|---|---|---|
| `position` | `'left' \| 'right'` | 放置在英雄区左侧或右侧 |

## 核心实现逻辑
1. CSS `perspective(800px)` + `transform: rotateY() rotateX() translateY()`
2. Perlin noise 驱动三个通道，不同 seed 确保左右两张牌运动不同
3. rotateY 范围：±35deg（主翻转），rotateX：±8deg（微倾斜），translateY：±15px（浮动）
4. 卡片使用 `backface-visibility: hidden` 实现正反面切换
5. 正面：紫色渐变 + ✦ 符号 + "TAROT"
6. 反面：紫金渐变 + ☽ 符号 + "DESTINY"
7. 整体透明度低（border opacity 0.15–0.20）

## 使用示例
```tsx
import TarotCardFlip from '@/components/mystic-hero/TarotCardFlip';

<TarotCardFlip position="left" />
<TarotCardFlip position="right" />
```

## 调优建议
- 更大的 rotateY 范围（±45deg）会有更戏剧性的翻转
- 减小 noise 时间缩放（当前 0.00015）使翻转更缓慢
- 可增加更多牌面内容（如卦象、数字）丰富视觉
