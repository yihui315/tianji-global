# Skill: /create-mystic-vignette

## 概述
创建"水晶球预知视角"或"命运之镜"径向暗角（Radial Gradient Vignette）覆盖层。
模拟深紫/黑色半透明边缘暗角，边缘带极弱星芒辉光。

## 组件位置
`src/components/mystic-hero/MysticVignette.tsx`

## 输入参数
| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `--vignette-intensity` | CSS var (0–1) | 0.8 | 控制暗角整体不透明度 |

## 核心实现逻辑
1. 绝对定位 `div`，覆盖全屏，`pointer-events: none`，`z-index: 2`
2. 使用 `radial-gradient(ellipse 75% 70% at 50% 50%, …)` 创建渐变
3. 中心 25% 完全透明 → 55% 浅紫黑 → 80% 深紫黑 → 100% 接近全黑
4. `box-shadow: inset` 叠加极弱星芒辉光（紫色 + 金色双层）
5. `opacity` 绑定到 CSS 变量 `--vignette-intensity`

## 使用示例
```tsx
import MysticVignette from '@/components/mystic-hero/MysticVignette';
// 直接放置在页面根层
<MysticVignette />
```

## 调优建议
- 强度 0.6–0.85 是最佳沉浸感区间
- 可通过 ConfigPanel 实时调整
- 搭配 CosmicBackground 使用效果最佳
