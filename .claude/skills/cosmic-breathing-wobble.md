# Skill: /cosmic-breathing-wobble

## 概述
星空呼吸感晃动包装器——使用 Perlin noise 驱动极其细微的 translate + rotate + scale 随机变换，
模拟"星空水面漂浮"的代入感。动画使用 requestAnimationFrame，自然不重复。

## 组件位置
`src/components/mystic-hero/CosmicBreathing.tsx`

## 输入参数
| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `--wobble-intensity` | CSS var (0–1) | 0.6 | 晃动强度倍率 |
| `--breathing-speed` | CSS var | 0.0003 | Perlin noise 时间缩放 |
| `children` | ReactNode | — | 被包裹的内容 |
| `className` | string | '' | 额外 class |

## 核心实现逻辑
1. 4 个 Perlin noise 通道（X/Y/Rotation/Scale），每个使用不同 seed offset
2. requestAnimationFrame 循环中读取 `--wobble-intensity` 和 `--breathing-speed`
3. 输出 transform: `translate(Xpx, Ypx) rotate(Rdeg) scale(S)`
4. 幅度范围：X ±2px, Y ±3px, R ±0.3deg, S 0.998–1.002
5. 自动检测 `prefers-reduced-motion: reduce`，匹配时完全禁用

## 使用示例
```tsx
import CosmicBreathing from '@/components/mystic-hero/CosmicBreathing';

<CosmicBreathing className="my-hero-content">
  <h1>预知未来</h1>
  <p>命运已书写</p>
</CosmicBreathing>
```

## 调优建议
- `--breathing-speed: 0.00015` → 极缓慢梦幻感
- `--breathing-speed: 0.0005` → 更明显的"呼吸"节奏
- 强度 0.4–0.7 最为自然
