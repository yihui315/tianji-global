# CLAUDE.md — TianJi Global 神秘占卜首页

> 本文件是 Claude / AI 代理的"圣经"——记录所有神秘参数、约定、调优技巧和占卜文案模板。

---

## 🔮 项目概述

**TianJi Global** 世界级占卜星座算命平台首页，对标 Co–Star、CHANI、Nebula 等顶级占星网站。

- **框架**: Next.js 15 + React 18 + TypeScript
- **样式**: Tailwind CSS 3.4 + CSS Custom Properties
- **动画**: requestAnimationFrame + Perlin noise（自写 simplex noise）
- **已有依赖（无需新增）**: `three`、`framer-motion`、`lucide-react`

---

## ⚙️ 神秘参数字典

| CSS 变量 | 默认值 | 范围 | 说明 |
|---|---|---|---|
| `--vignette-intensity` | `0.8` | 0 – 1 | 水晶球暗角强度（越大边缘越暗） |
| `--wobble-intensity` | `0.6` | 0 – 1 | 呼吸晃动强度（乘以各通道幅度） |
| `--particle-density` | `25` | 10 – 60 | 粒子密度系数（影响星尘数+星座符号数） |
| `--breathing-speed` | `0.0003` | 0.0001 – 0.001 | Perlin noise 时间缩放（越大晃动越快） |
| `--mystic-bg-primary` | `#030014` | HEX | 主背景色 |
| `--mystic-accent-gold` | `#F59E0B` | HEX | 金色强调色 |
| `--mystic-accent-purple` | `#7C3AED` | HEX | 紫色强调色 |
| `--mystic-glow-color` | `rgba(168,130,255,0.3)` | RGBA | 辉光主色 |

---

## 🎯 调优技巧

### 暗角（Vignette）
- `0.6`–`0.85` 是最佳沉浸感区间
- 超过 `0.9` 会让内容区过暗
- 星芒辉光使用 `box-shadow: inset` 而非额外图层

### 呼吸晃动（Breathing Wobble）
- 各通道使用不同 Perlin noise seed offset（+333 间距），确保 X/Y/Rotation/Scale 不同步
- 幅度极小：translateX ±2px, translateY ±3px, rotate ±0.3deg, scale ±0.002
- `--breathing-speed` 降低到 `0.00015` 会让晃动更"缓慢梦幻"

### 粒子系统
- 800+ 星尘粒子在 Canvas 2D 上渲染（轻量高效）
- 黄道符号使用 Canvas `fillText` 渲染 Unicode（♈♉♊…）
- 移动端自动降低粒子数（按视口面积比例）
- 闪烁使用 Perlin noise 驱动 alpha，避免重复感

### 塔罗卡翻转
- 使用 CSS `perspective(800px)` + `rotateY` 实现
- Perlin noise 驱动旋转速度，8–15 秒一个完整视觉周期
- 透明度 0.15–0.25，纯装饰不可交互

### 性能
- 所有 Canvas 粒子合并在一个 Canvas 上
- `will-change: transform` 仅在动画元素上使用
- `prefers-reduced-motion: reduce` 时禁用所有动画
- 移动端（< 1024px）隐藏塔罗卡装饰

---

## ✍️ 占卜文案模板

### 主标题变体
1. 预知未来 · 命运已书写
2. 星辰为你指引方向
3. 命运的密码 · 已为你解锁
4. 天机已显 · 命运已定
5. 穿越星海 · 预见未来
6. 你的命运 · 星辰已知
7. 揭开命运的面纱
8. 宇宙的低语 · 只为你
9. 星座之书 · 已然翻开
10. 命运之轮 · 永不停转

### 副标题变体
1. 世界级占卜 · 星座 · 塔罗 · 命运指引
2. AI × 古典智慧 · 探索你的星辰之路
3. 紫微 · 八字 · 星盘 · 塔罗 — 古今中西全覆盖
4. 命运的答案 · 就在星空之中
5. 精准星体计算 · 深度命理解读

### CTA 变体
1. 立即占卜你的命运 / 探索今日星运
2. 开始你的星辰之旅 / 查看每日运势
3. 揭开命运密码 / 免费星座分析
4. 窥见未来 · 立即开始 / 今日塔罗指引

---

## 📁 文件结构

```
src/components/mystic-hero/
├── perlin.ts            — Simplex noise 工具函数
├── CosmicBackground.tsx — 全屏宇宙背景 + 星尘 + 星座粒子
├── MysticVignette.tsx   — 水晶球径向暗角
├── CosmicBreathing.tsx  — Perlin noise 呼吸晃动包装器
├── TarotCardFlip.tsx    — 塔罗卡装饰（3D 翻转）
├── HeroTitle.tsx        — 中英双语标题 + 发光脉冲
├── HeroCTA.tsx          — CTA 按钮 + 鼠标环绕符号
├── MysticNav.tsx        — 极简导航（移动端汉堡菜单）
├── ConfigPanel.tsx      — 实时调参面板
└── MysticHero.tsx       — 总组装器
```

---

## 🚀 一键启动

```bash
# 开发模式
npm run dev
# → 访问 http://localhost:3000

# 生产构建
npm run build && npm start
```

---

## 🖼️ 建议背景图资源

> 默认方案不依赖任何外部图片，全部使用 CSS 渐变 + Canvas 生成。
> 以下为可选增强资源：

| 来源 | 搜索关键词 | 用途 |
|---|---|---|
| Unsplash | "deep space nebula dark" | 全屏背景备选 |
| Unsplash | "galaxy purple gold" | 星云色调参考 |
| Pexels | "cosmic stars dark" | 粒子背景叠加 |

---

## 🐛 已知坑 & 约定

1. Canvas `fillText` 在不同 OS 上渲染 Unicode 星座符号字体大小可能略有差异
2. `--vignette-intensity` 使用 CSS `opacity` 而非渐变 stop 值，更容易动态调整
3. ConfigPanel 状态不持久化（刷新即重置），如需持久化可扩展 localStorage
4. 移动端汉堡菜单使用 state 而非 CSS-only，确保动画流畅
5. Perlin noise `buildTables()` 在模块加载时执行一次，不影响 SSR（组件均为 `'use client'`）
