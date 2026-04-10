# Skill: /floating-zodiac-particles

## 概述
漂浮黄道十二宫符号粒子系统——在 Canvas 2D 上渲染 Unicode 星座符号（♈♉♊…）+ 装饰符号（✦⚝✧☆），
配合 800+ 星尘粒子，全部使用 Perlin noise 驱动漂浮轨迹和闪烁。

## 组件位置
`src/components/mystic-hero/CosmicBackground.tsx`（星座粒子子系统内嵌于此）

## 输入参数
| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `--particle-density` | CSS var (10–60) | 25 | 粒子密度系数 |

## 核心实现逻辑

### 星尘粒子（Stardust）
1. 数量 = `(viewportArea / referenceArea) × density × 32`，最少 200 个
2. 每个粒子：x, y, size(0.3–2.5px), baseAlpha(0.3–0.8), speedY(0.05–0.3)
3. Perlin noise 驱动 alpha 闪烁 + X 方向微漂
4. 颜色：`rgba(212,175,119,α)` — 暖金色

### 星座符号（Zodiac）
1. 数量 = `density × 1.2`
2. 70% 使用黄道符号（♈–♓），30% 使用装饰符号（✦⚝✧☆）
3. 大小：14–36px，透明度：0.03–0.11（极弱）
4. Perlin noise 驱动三个通道：X偏移(±30px), Y偏移(±25px), 旋转(±0.3rad)
5. 颜色：`rgba(168,130,255,α)` — 浅紫色

### 性能优化
- 所有粒子合并在同一个 Canvas 上，避免多层 DOM
- resize 事件中重新初始化粒子数组
- 每帧约 30–60 次 noise 调用（星座符号），开销极低

## 使用示例
```tsx
import CosmicBackground from '@/components/mystic-hero/CosmicBackground';
// 放在页面最底层
<CosmicBackground />
```

## 调优建议
- density 15 → 适合移动端
- density 30–40 → 桌面端丰富感
- 超过 50 在低端设备上可能掉帧
