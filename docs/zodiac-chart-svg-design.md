# ZodiacChart SVG 组件设计规范

> TianJi Global 星盘 SVG 组件 | 版本 1.0
> 设计参考：Astro.com Extended Chart Selection
> 技术栈：React + TypeScript + Swiss Ephemeris (sweph)

---

## 1. 设计愿景与美学方向

### 1.1 核心美学理念

**"瑞士精工 × 中国水墨"** — 将瑞士工程的精确严谨与中国水墨的飘逸空灵融为一体。

- **精确感**：数学般的圆环分割、精确的行星定位、清晰的视觉层级
- **东方韵**：柔和的金色边界、淡雅的星座配色、若隐若现的墨韵效果
- **现代感**：扁平化符号、流畅的交互动效、高信息密度

### 1.2 色彩体系

```css
/* 主题色彩 */
--chart-background: #0a0f1a;        /* 深海蓝黑（暗色主题）*/
--chart-background-light: #f5f7fa;   /* 月光白（亮色主题）*/
--chart-background-transparent: transparent;

/* 边界与装饰 */
--zodiac-boundary: #c9a962;          /* 柔金边界 */
--zodiac-boundary-glow: rgba(201, 169, 98, 0.3);
--house-boundary: rgba(201, 169, 98, 0.4);

/* 四元素色彩（淡雅系）*/
--element-fire: #d35d4a;             /* 火：赭红 */
--element-earth: #7d8c5a;            /* 土：苔绿 */
--element-air: #6b9dbf;              /* 风：天蓝 */
--element-water: #3d6d8a;            /* 水：藏青 */

/* 行星色彩 */
--planet-default: #e8e4dc;           /* 行星符号：墨白 */
--planet-retrograde: #d35d4a;        /* 逆行：赭红 */
--planet-glow: rgba(232, 228, 220, 0.15);

/* 相位色彩 */
--aspect-trine: #4a90c2;             /* 三分：蓝 */
--aspect-square: #c24a4a;            /* 四分：红 */
--aspect-sextile: #5a9c6b;          /* 六分：绿 */
--aspect-opposition: #c27a4a;       /* 对分：橙 */
--aspect-conjunction: transparent;  /* 合相：无连线 */
--aspect-semi-sextile: #888888;     /* 半六分：灰（点线）*/
--aspect-quincunx: #8b5a8b;         /* 五分：紫（点线）*/

/* 交互反馈 */
--hover-highlight: rgba(201, 169, 98, 0.2);
--tooltip-background: rgba(10, 15, 26, 0.95);
--tooltip-border: #c9a962;
```

### 1.3 字体规范

```css
/* 中文优先 */
--font-zh: 'Noto Serif SC', 'Source Han Serif CN', serif;
/* 英文/数字 */
--font-en: 'Inter', 'SF Pro Display', sans-serif;
/* 符号/度数 */
--font-symbol: 'DejaVu Sans', 'Apple Symbols', sans-serif;

/* 字号层级 */
--text-sign-symbol: 28px;           /* 星座符号 */
--text-sign-name: 12px;             /* 星座名称 */
--text-planet: 14px;                /* 行星名称 */
--text-degree: 10px;               /* 度数 */
--text-house: 11px;                /* 宫号 */
```

---

## 2. SVG 整体结构

### 2.1 画布规格

```
viewBox: "0 0 800 800"
center: (400, 400)

环形半径（由外而内）：
┌─────────────────────────────────┐
│  外圈半径 Outer Radius    380   │  ← Zodiac Band（黄道带）
│  中圈半径 Middle Radius   320   │  ← House Divisions（宫位）
│  内圈半径 Inner Radius    260   │  ← Planet Positions（行星）
│  中心圆半径 Center Radius   80   │  ← Center Display
│  行星符号半径 Planet Radius 240  │  ← 行星符号定位（略向内）
└─────────────────────────────────┘

每宫弧度：30° = π/6 radians
```

### 2.2 SVG 层级架构

```xml
<svg viewBox="0 0 800 800" role="img" aria-label="天机星盘">
  <defs>
    <!-- 滤镜：发光效果 -->
    <filter id="glow">...</filter>
    <!-- 渐变：黄道带背景 -->
    <linearGradient id="zodiac-gradient">...</linearGradient>
    <!-- 符号定义 -->
    <symbol id="sun-glyph">...</symbol>
    <!-- ...其他行星符号 -->
  </defs>

  <!-- Layer 1: 背景 -->
  <circle cx="400" cy="400" r="390" class="chart-background"/>

  <!-- Layer 2: 黄道带环（12宫分段填充）-->
  <g id="zodiac-band">
    <!-- 12个扇形，每个30° -->
  </g>

  <!-- Layer 3: 宫位边界线 -->
  <g id="house-cusps">
    <!-- 12条径向线 -->
  </g>

  <!-- Layer 4: 黄道带边界 -->
  <g id="sign-boundaries">
    <!-- 12条细线 -->
  </g>

  <!-- Layer 5: 度数刻度 -->
  <g id="degree-ticks">
    <!-- 每度小刻度，5°中刻度 -->
  </g>

  <!-- Layer 6: 星座符号与名称 -->
  <g id="sign-symbols">
    <!-- 符号 + 中文名 -->
  </g>

  <!-- Layer 7: 宫头数字 -->
  <g id="house-numbers">
    <!-- 12个宫头数字 -->
  </g>

  <!-- Layer 8: 相位线 -->
  <g id="aspect-lines">
    <!-- 行星间相位连接 -->
  </g>

  <!-- Layer 9: 行星符号 -->
  <g id="planets">
    <!-- 行星符号 + 名称 -->
  </g>

  <!-- Layer 10: 中心 -->
  <g id="center">
    <!-- TianJi Logo 或地球符号 -->
  </g>

  <!-- Layer 11: 交互层 -->
  <g id="interactions">
    <!-- 透明热区用于悬停检测 -->
  </g>
</svg>
```

---

## 3. 外环：黄道带（Zodiac Band）

### 3.1 扇形结构

每个星座占 30° 弧度，12 个扇形首尾相连。

**扇形路径计算**（以 Aries 0° 为例）：

```typescript
function getZodiacSegmentPath(
  startDegree: number,  // 起始角度（°）
  radius: number,
  center: { x: number; y: number }
): string {
  const startRad = (startDegree - 90) * Math.PI / 180;
  const endRad = (startDegree + 30 - 90) * Math.PI / 180;

  const x1 = center.x + radius * Math.cos(startRad);
  const y1 = center.y + radius * Math.sin(startRad);
  const x2 = center.x + radius * Math.cos(endRad);
  const y2 = center.y + radius * Math.sin(endRad);

  const largeArc = 30 > 180 ? 1 : 0; // 恒为0（30° < 180°）

  return `M ${center.x} ${center.y} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}
```

### 3.2 元素色彩映射

| 元素 | 星座 | 颜色值 | 透明度 |
|------|------|--------|--------|
| 火 (Fire) | Aries, Leo, Sagittarius | `#d35d4a` | 0.12 |
| 土 (Earth) | Taurus, Virgo, Capricorn | `#7d8c5a` | 0.12 |
| 风 (Air) | Gemini, Libra, Aquarius | `#6b9dbf` | 0.12 |
| 水 (Water) | Cancer, Scorpio, Pisces | `#3d6d8a` | 0.12 |

### 3.3 星座符号定位

**位置**：每个星座弧段的中心点

```typescript
function getSignSymbolPosition(
  signDegree: number,  // 星座起始角度（0°, 30°, 60°...）
  radius: number,
  center: { x: number; y: number }
): { x: number; y: number } {
  const midDegree = signDegree + 15; // 弧段中点
  const rad = (midDegree - 90) * Math.PI / 180;
  return {
    x: center.x + radius * Math.cos(rad),
    y: center.y + radius * Math.sin(rad),
  };
}
```

**显示内容**：
- 符号 Unicode（如 `♈`）
- 中文简称（如 `白羊`）
- 位于半径 350 处

### 3.4 度数刻度

```typescript
// 绘制每个星座内的刻度
for (let deg = 0; deg < 30; deg++) {
  const angle = (signStart + deg - 90) * Math.PI / 180;

  // 小刻度（每度）：长3px
  if (deg % 5 !== 0) {
    const innerR = OUTER_RADIUS - 3;
    const outerR = OUTER_RADIUS;
    // 画线
  }

  // 中刻度（每5°）：长6px + 数字
  if (deg % 5 === 0 && deg !== 0) {
    const innerR = OUTER_RADIUS - 6;
    const outerR = OUTER_RADIUS;
    // 画线 + 度数文字
  }
}
```

---

## 4. 中环：宫位系统（House Divisions）

### 4.1 Placidus 宫位计算

使用 Swiss Ephemeris 的 `swe_house` 函数：

```typescript
import { swe_house, SE_SIDM_MERIDIAN } from 'sweph';

interface HouseCusp {
  house: number;           // 1-12
  cuspDegree: number;      // 黄道度数 (0-360)
  sign: string;            // 星座名称
  signDegree: number;      // 星座内度数 (0-29.99)
}

function getHouseCusps(
  jd: number,           // Julian Day
  lat: number,           // 纬度
  lng: number,           // 经度
  houseSystem: HouseSystem = 'PLACIDUS'
): HouseCusp[] {
  const hs = HouseSystemCode[houseSystem]; // 'P', 'K', 'E', 'W', 'C'
  const cusp = swe_house(jd, lat, lng, hs, SE_SIDM_MERIDIAN);

  return Array.from({ length: 12 }, (_, i) => {
    const degree = cusp.cusp[i + 1]; // 1-indexed
    const { sign, degree: signDeg } = getZodiacSignAndDegree(degree);
    return {
      house: i + 1,
      cuspDegree: degree,
      sign,
      signDegree: signDeg,
    };
  });
}
```

### 4.2 宫位边界线

**绘制**：从中心到外环的径向线

```typescript
function drawHouseCuspLine(
  cuspDegree: number,
  innerRadius: number,
  outerRadius: number,
  center: { x: number; y: number }
): JSX.Element {
  const rad = (cuspDegree - 90) * Math.PI / 180;
  const x1 = center.x + innerRadius * Math.cos(rad);
  const y1 = center.y + innerRadius * Math.sin(rad);
  const x2 = center.x + outerRadius * Math.cos(rad);
  const y2 = center.y + outerRadius * Math.sin(rad);

  return (
    <line
      x1={x1} y1={y1}
      x2={x2} y2={y2}
      stroke="var(--house-boundary)"
      strokeWidth={1.5}
    />
  );
}
```

### 4.3 宫头数字

**位置**：位于内环（半径 310 处），沿宫头线方向向外偏移

```typescript
function getHouseNumberPosition(
  cuspDegree: number,
  radius: number,
  center: { x: number; y: number }
): { x: number; y: number; rotation: number } {
  const rad = (cuspDegree - 90) * Math.PI / 180;
  // 向外偏移 15°，避免与边界线重叠
  const offsetRad = rad + 0.08;
  return {
    x: center.x + radius * Math.cos(offsetRad),
    y: center.y + radius * Math.sin(offsetRad),
    rotation: cuspDegree, // 文字跟随角度旋转
  };
}
```

---

## 5. 内环：行星位置（Planet Positions）

### 5.1 行星符号 Unicode

```typescript
const PLANET_GLYPHS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '⛢',      // 或 '♅'
  Neptune: '♆',
  Pluto: '♇',
  NorthNode: '☊',
  SouthNode: '☋',
  Chiron: '⚷',
};

const PLANET_NAMES_ZH: Record<string, string> = {
  Sun: '太阳',
  Moon: '月亮',
  Mercury: '水星',
  Venus: '金星',
  Mars: '火星',
  Jupiter: '木星',
  Saturn: '土星',
  Uranus: '天王星',
  Neptune: '海王星',
  Pluto: '冥王星',
  NorthNode: '北交点',
  SouthNode: '南交点',
  Chiron: '凯龙',
};
```

### 5.2 行星定位计算

```typescript
function getPlanetPosition(
  planetDegree: number,    // 黄道经度 (0-360)
  radius: number,
  center: { x: number; y: number }
): { x: number; y: number; rotation: number } {
  const rad = (planetDegree - 90) * Math.PI / 180;
  return {
    x: center.x + radius * Math.cos(rad),
    y: center.y + radius * Math.sin(rad),
    rotation: planetDegree,
  };
}
```

### 5.3 碰撞检测与布局

**问题**：当两颗行星黄经差 < 5° 时，符号会重叠。

**解决方案**：堆叠布局

```typescript
interface PlanetLayout {
  planet: Planet;
  x: number;
  y: number;
  offset: number; // 0=正常, ±1=上下偏移
}

function resolvePlanetCollisions(
  planets: Planet[],
  radius: number,
  center: { x: number; y: number }
): PlanetLayout[] {
  // 1. 按黄经排序
  const sorted = [...planets].sort((a, b) => a.longitude - b.longitude);

  // 2. 分组：找出 5° 范围内的行星群
  const groups: Planet[][] = [];
  let currentGroup: Planet[] = [];

  sorted.forEach((planet) => {
    if (currentGroup.length === 0) {
      currentGroup.push(planet);
    } else {
      const last = currentGroup[currentGroup.length - 1];
      const diff = Math.abs(normalizeDegree(planet.longitude - last.longitude));
      if (diff < 5) {
        currentGroup.push(planet);
      } else {
        groups.push([...currentGroup]);
        currentGroup = [planet];
      }
    }
  });
  if (currentGroup.length > 0) groups.push(currentGroup);

  // 3. 布局
  const layouts: PlanetLayout[] = [];

  groups.forEach((group) => {
    if (group.length === 1) {
      // 正常位置
      const pos = getPlanetPosition(group[0].longitude, radius, center);
      layouts.push({ planet: group[0], ...pos, offset: 0 });
    } else {
      // 堆叠：平均分配在 ±3° 范围内
      const step = 6 / (group.length + 1);
      group.forEach((planet, i) => {
        const offsetDeg = -3 + step * (i + 1);
        const newDegree = normalizeDegree(planet.longitude + offsetDeg);
        const pos = getPlanetPosition(newDegree, radius, center);
        layouts.push({ planet, ...pos, offset: offsetDeg > 0 ? 1 : -1 });
      });
    }
  });

  return layouts;
}
```

### 5.4 逆行标记

```typescript
// 逆行行星：红色 + "Rx" 标记
function renderPlanetGlyph(planet: Planet, layout: PlanetLayout) {
  const isRetrograde = planet.speed < 0;

  return (
    <g transform={`translate(${layout.x}, ${layout.y})`}>
      {/* 发光效果 */}
      {isRetrograde && (
        <circle r="16" fill="var(--planet-glow)" />
      )}

      {/* 行星符号 */}
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fill={isRetrograde ? 'var(--planet-retrograde)' : 'var(--planet-default)'}
        fontSize="20"
      >
        {PLANET_GLYPHS[planet.name]}
      </text>

      {/* 逆行标记 */}
      {isRetrograde && (
        <text
          y="12"
          textAnchor="middle"
          fill="var(--planet-retrograde)"
          fontSize="9"
        >
          Rx
        </text>
      )}
    </g>
  );
}
```

---

## 6. 相位线（Aspect Lines）

### 6.1 相位类型定义

```typescript
interface AspectDefinition {
  name: AspectType;
  angle: number;
  orb: number;         // 容许度（°）
  color: string;
  strokeWidth: number;
  strokeDasharray?: string; // 点线用
  symbol: string;
}

type AspectType =
  | 'conjunction'
  | 'semi-sextile'
  | 'sextile'
  | 'square'
  | 'trine'
  | 'quincunx'
  | 'opposition';

const ASPECTS: AspectDefinition[] = [
  { name: 'conjunction', angle: 0, orb: 10, color: 'transparent', strokeWidth: 0, symbol: '☌' },
  { name: 'semi-sextile', angle: 30, orb: 3, color: 'var(--aspect-semi-sextile)', strokeWidth: 1, strokeDasharray: '3,3', symbol: '⚻' },
  { name: 'sextile', angle: 60, orb: 6, color: 'var(--aspect-sextile)', strokeWidth: 1.5, symbol: '✶' },
  { name: 'square', angle: 90, orb: 8, color: 'var(--aspect-square)', strokeWidth: 1.5, symbol: '□' },
  { name: 'trine', angle: 120, orb: 8, color: 'var(--aspect-trine)', strokeWidth: 2, symbol: '△' },
  { name: 'quincunx', angle: 150, orb: 3, color: 'var(--aspect-quincunx)', strokeWidth: 1, strokeDasharray: '3,3', symbol: '⚹' },
  { name: 'opposition', angle: 180, orb: 10, color: 'var(--aspect-opposition)', strokeWidth: 2, symbol: '☍' },
];
```

### 6.2 相位计算

```typescript
function calculateAspect(
  planet1Degree: number,
  planet2Degree: number
): { type: AspectType; orb: number; isMajor: boolean } | null {
  let diff = Math.abs(planet1Degree - planet2Degree);
  if (diff > 180) diff = 360 - diff;

  for (const aspect of ASPECTS) {
    const angleDiff = Math.abs(diff - aspect.angle);
    if (angleDiff <= aspect.orb) {
      const isMajor = ['conjunction', 'sextile', 'square', 'trine', 'opposition'].includes(aspect.name);
      return { type: aspect.name, orb: angleDiff, isMajor };
    }
  }
  return null;
}
```

### 6.3 相位线绘制

```typescript
function drawAspectLine(
  planet1: { x: number; y: number },
  planet2: { x: number; y: number },
  aspect: AspectDefinition,
  orb: number
): JSX.Element {
  // 线条透明度随 orb 增大而降低
  const opacity = 1 - (orb / aspect.orb) * 0.4;

  return (
    <line
      x1={planet1.x}
      y1={planet1.y}
      x2={planet2.x}
      y2={planet2.y}
      stroke={aspect.color}
      strokeWidth={aspect.strokeWidth}
      strokeDasharray={aspect.strokeDasharray}
      opacity={opacity}
      className="aspect-line"
    />
  );
}
```

---

## 7. 中心区域（Center）

### 7.1 设计方案

```typescript
// 方案 A：地球符号 + 宫位数字
// 方案 B：TianJi Logo
// 方案 C：空心 + 外圈装饰

function renderCenter() {
  return (
    <g id="center">
      {/* 外圈装饰 */}
      <circle
        cx={400}
        cy={400}
        r={75}
        fill="var(--chart-background)"
        stroke="var(--zodiac-boundary)"
        strokeWidth={1}
      />

      {/* 地球符号 */}
      <text
        x={400}
        y={400}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="36"
        fill="var(--zodiac-boundary)"
      >
        ⊕
      </text>

      {/* 装饰性四角图案（可选）*/}
      {/* 使用 CSS 或 SVG 图案实现中国风回纹 */}
    </g>
  );
}
```

---

## 8. 交互设计

### 8.1 悬停热区

```typescript
// 为每个行星创建透明热区
function createPlanetHotspot(
  planet: Planet,
  layout: PlanetLayout,
  onHover: (planet: Planet) => void
): JSX.Element {
  return (
    <circle
      cx={layout.x}
      cy={layout.y}
      r={20}
      fill="transparent"
      className="planet-hotspot"
      onMouseEnter={() => onHover(planet)}
      onMouseLeave={() => onHover(null)}
      role="button"
      aria-label={`${PLANET_NAMES_ZH[planet.name]} in ${planet.sign} ${Math.floor(planet.degree)}°`}
    />
  );
}
```

### 8.2 工具提示（Tooltip）

```typescript
function PlanetTooltip({ planet, position }: { planet: Planet; position: { x: number; y: number } }) {
  const isRetrograde = planet.speed < 0;
  const directionText = isRetrograde ? '逆行' : '顺行';
  const speedAbs = Math.abs(planet.speed).toFixed(2);

  return (
    <div
      className="planet-tooltip"
      style={{
        left: position.x + 20,
        top: position.y - 10,
      }}
    >
      <div className="tooltip-header">
        <span className="glyph">{PLANET_GLYPHS[planet.name]}</span>
        <span className="name">{PLANET_NAMES_ZH[planet.name]}</span>
      </div>
      <div className="tooltip-body">
        <div>{Math.floor(planet.degree)}°{((planet.degree % 1) * 60).toFixed(0)}' {planet.sign}</div>
        <div>第 {planet.house} 宫</div>
        <div>{directionText}</div>
        <div className="speed">速度：{speedAbs}°/天</div>
      </div>
    </div>
  );
}
```

**Tooltip 样式**：

```css
.planet-tooltip {
  position: absolute;
  background: var(--tooltip-background);
  border: 1px solid var(--tooltip-border);
  border-radius: 8px;
  padding: 12px 16px;
  pointer-events: none;
  z-index: 1000;
  min-width: 160px;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.tooltip-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(201, 169, 98, 0.3);
}

.tooltip-header .glyph {
  font-size: 20px;
}

.tooltip-header .name {
  font-size: 14px;
  font-weight: 600;
  color: var(--zodiac-boundary);
}
```

### 8.3 点击事件

```typescript
interface ZodiacChartProps {
  // ... 其他 props
  onPlanetClick?: (planet: Planet, event: MouseEvent) => void;
  onSignClick?: (sign: Sign, event: MouseEvent) => void;
  onHouseClick?: (house: House, event: MouseEvent) => void;
}

// 使用
<circle
  onClick={(e) => onPlanetClick?.(planet, e)}
  className="planet-hotspot clickable"
/>
```

---

## 9. 响应式设计

### 9.1 断点处理

```typescript
function getResponsiveConfig(size: number, showAspects: boolean): ResponsiveConfig {
  if (size < 400) {
    // Mobile: 隐藏相位线、简化标签
    return {
      hideAspectLines: true,
      hideDegreeTicks: true,
      hideSignNames: true,
      planetFontSize: 12,
      signSymbolSize: 18,
    };
  } else if (size < 640) {
    // Tablet
    return {
      hideAspectLines: !showAspects,
      hideDegreeTicks: false,
      hideSignNames: false,
      planetFontSize: 14,
      signSymbolSize: 22,
    };
  } else {
    // Desktop
    return {
      hideAspectLines: false,
      hideDegreeTicks: false,
      hideSignNames: false,
      planetFontSize: 16,
      signSymbolSize: 28,
    };
  }
}
```

---

## 10. 完整组件接口

### 10.1 TypeScript 类型定义

```typescript
// ============================================
// 核心数据类型
// ============================================

type HouseSystem = 'PLACIDUS' | 'KOCH' | 'EQUAL' | 'WHOLE_SIGN' | 'CAMPANUS';
type ZodiacType = 'TROPICAL' | 'SIDEREAL';
type AspectType = 'conjunction' | 'semi-sextile' | 'sextile' | 'square' | 'trine' | 'quincunx' | 'opposition';
type Theme = 'dark' | 'light' | 'transparent';
type Language = 'zh' | 'en';

interface Planet {
  name: string;
  longitude: number;      // 黄道经度 0-360
  latitude: number;        // 黄道纬度
  speed: number;          // 速度（°/天），负数=逆行
  sign: string;           // 星座名称
  degree: number;         // 星座内度数 0-29.99
  house: number;          // 所在宫位 1-12
}

interface HouseCusp {
  house: number;
  cuspDegree: number;     // 黄道度数
  sign: string;
  signDegree: number;     // 星座内度数
}

interface Aspect {
  planet1: string;
  planet2: string;
  type: AspectType;
  orb: number;            // 与精确相位的偏差
  isMajor: boolean;
}

interface PlanetLayout extends Planet {
  x: number;
  y: number;
  offset: number;
  rotation: number;
}

// ============================================
// 组件 Props
// ============================================

interface ZodiacChartProps {
  // 数据
  date: Date;
  time: string;                      // "HH:MM" 格式
  location: {
    lat: number;
    lng: number;
    name: string;
  };

  // 预计算的数据（传入则跳过计算）
  planets?: Planet[];
  houseCusps?: HouseCusp[];
  aspects?: Aspect[];

  // 计算设置
  houseSystem: HouseSystem;
  zodiacType: ZodiacType;

  // 显示选项
  showAspects: boolean;
  showHouseCusps: boolean;
  showSignBoundaries: boolean;
  showPlanetDegrees: boolean;        // 悬停时显示
  showCuspDegrees: boolean;          // 悬停时显示
  aspectTypes?: AspectType[];        // 显示哪些相位，默认全部

  // 交互回调
  onPlanetClick?: (planet: Planet) => void;
  onSignClick?: (sign: string, degree: number) => void;
  onHouseClick?: (house: number, cuspDegree: number) => void;

  // 样式
  size: number;                      // px，正方形
  theme: Theme;
  language: Language;
}
```

### 10.2 组件骨架

```typescript
import React, { useMemo, useState, useCallback } from 'react';
import { useCalculateChart } from '@/hooks/useCalculateChart';
import { useCollisions } from '@/hooks/useCollisions';
import { PLANET_GLYPHS, PLANET_NAMES_ZH } from '@/lib/ constants';
import styles from './ZodiacChart.module.css';

export const ZodiacChart: React.FC<ZodiacChartProps> = ({
  date,
  time,
  location,
  planets: propPlanets,
  houseCusps: propHouseCusps,
  aspects: propAspects,
  houseSystem = 'PLACIDUS',
  zodiacType = 'TROPICAL',
  showAspects = true,
  showHouseCusps = true,
  showSignBoundaries = true,
  showPlanetDegrees = false,
  showCuspDegrees = false,
  aspectTypes,
  onPlanetClick,
  onSignClick,
  onHouseClick,
  size = 800,
  theme = 'dark',
  language = 'zh',
}) => {
  const center = useMemo(() => ({ x: size / 2, y: size / 2 }), [size]);
  const outerRadius = useMemo(() => size * 0.475, [size]);
  const houseRadius = useMemo(() => size * 0.4, [size]);
  const planetRadius = useMemo(() => size * 0.325, [size]);
  const innerRadius = useMemo(() => size * 0.1, [size]);

  // 计算星盘数据（使用 sweph）
  const planets = useCalculateChart({ date, time, location, zodiacType });

  // 碰撞检测
  const planetLayouts = useCollisions(planets, planetRadius, center);

  // 悬停状态
  const [hoveredPlanet, setHoveredPlanet] = useState<Planet | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handlePlanetHover = useCallback((planet: Planet | null, event?: MouseEvent) => {
    setHoveredPlanet(planet);
    if (event) {
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  }, []);

  return (
    <div className={styles.container} style={{ width: size, height: size }}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={language === 'zh' ? '天机星盘' : 'TianJi Natal Chart'}
      >
        {/* 滤镜定义 */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Layer 1: 背景 */}
        <circle
          cx={center.x}
          cy={center.y}
          r={outerRadius + 10}
          className={styles.background}
        />

        {/* Layer 2: 黄道带 */}
        <ZodiacBand
          radius={outerRadius}
          center={center}
          planets={planets}
        />

        {/* Layer 3: 宫位 */}
        {showHouseCusps && (
          <HouseCusps
            cusps={houseCusps}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            center={center}
          />
        )}

        {/* Layer 4: 相位 */}
        {showAspects && (
          <AspectLines
            planets={planetLayouts}
            aspects={aspects}
          />
        )}

        {/* Layer 5: 行星 */}
        <PlanetLayer
          layouts={planetLayouts}
          onHover={handlePlanetHover}
          onClick={onPlanetClick}
        />

        {/* Layer 6: 中心 */}
        <Center radius={innerRadius} center={center} />

        {/* Layer 7: 交互热区 */}
        <InteractionLayer
          layouts={planetLayouts}
          onPlanetHover={handlePlanetHover}
        />
      </svg>

      {/* Tooltip */}
      {hoveredPlanet && (
        <PlanetTooltip
          planet={hoveredPlanet}
          position={tooltipPosition}
          language={language}
        />
      )}
    </div>
  );
};
```

---

## 11. 数据计算 Hook

### 11.1 useCalculateChart

```typescript
// hooks/useCalculateChart.ts
import { useMemo } from 'react';
import { swe_planet, swe_house, SE_PLANETS, SE_SIDM_MERIDIAN, SE_TROPICAL, SE_SIDEREAL } from 'sweph';

const HOUSE_SYSTEM_CODES: Record<HouseSystem, string> = {
  PLACIDUS: 'P',
  KOCH: 'K',
  EQUAL: 'E',
  WHOLE_SIGN: 'W',
  CAMPANUS: 'C',
};

export function useCalculateChart({
  date,
  time,
  location,
  zodiacType,
}: {
  date: Date;
  time: string;
  location: { lat: number; lng: number };
  zodiacType: ZodiacType;
}) {
  return useMemo(() => {
    // 转换为 Julian Day
    const jd = dateToJulianDay(date, time);

    // 瑞士 ephemeris 标志
    const flag = zodiacType === 'TROPICAL' ? SE_TROPICAL : SE_SIDEREAL;

    // 计算行星位置
    const planets: Planet[] = SE_PLANETS.map((planet) => {
      const pos = swe_planet(jd, planet.id, flag);
      const { sign, degree } = getZodiacSignAndDegree(pos.longitude);
      const house = getHouseNumber(pos.longitude, houseCusps);

      return {
        name: planet.name,
        longitude: pos.longitude,
        latitude: pos.latitude,
        speed: pos.speed,
        sign,
        degree,
        house,
      };
    });

    // 计算宫头
    const houseCode = HOUSE_SYSTEM_CODES[houseSystem];
    const houseResult = swe_house(jd, location.lat, location.lng, houseCode, SE_SIDM_MERIDIAN);
    const houseCusps: HouseCusp[] = Array.from({ length: 12 }, (_, i) => {
      const degree = houseResult.cusp[i + 1];
      const { sign, degree: signDeg } = getZodiacSignAndDegree(degree);
      return { house: i + 1, cuspDegree: degree, sign, signDegree: signDeg };
    });

    return { planets, houseCusps };
  }, [date, time, location, zodiacType, houseSystem]);
}
```

---

## 12. 辅助函数库

### 12.1 角度工具

```typescript
// 弧度转角度
const RAD_TO_DEG = 180 / Math.PI;

// 角度转弧度
const DEG_TO_RAD = Math.PI / 180;

// 标准化角度到 0-360
function normalizeDegree(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

// 黄道度数转星座和度数
function getZodiacSignAndDegree(longitude: number): { sign: string; degree: number } {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer',
    'Leo', 'Virgo', 'Libra', 'Scorpio',
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
  ];
  const signIndex = Math.floor(longitude / 30);
  const degreeInSign = longitude % 30;
  return { sign: signs[signIndex], degree: degreeInSign };
}

// 度数转度分秒字符串
function degreeToDMS(deg: number): string {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  const s = Math.round(((deg - d) * 60 - m) * 60);
  return `${d}°${m}'${s}"`;
}
```

### 12.2 SVG 路径工具

```typescript
// 绘制扇形
function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    'M', cx, cy,
    'L', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    'Z',
  ].join(' ');
}

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  const angleInRadians = (angleInDegrees - 90) * DEG_TO_RAD;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}
```

---

## 13. 性能优化

### 13.1 React 优化策略

```typescript
// 1. 使用 useMemo 缓存计算结果
const planetLayouts = useMemo(
  () => resolvePlanetCollisions(planets, planetRadius, center),
  [planets, planetRadius, center]
);

// 2. 使用 useCallback 缓存回调
const handlePlanetHover = useCallback(
  (planet: Planet | null) => setHoveredPlanet(planet),
  []
);

// 3. 使用 React.memo 防止不必要的重渲染
const ZodiacBand = React.memo<ZodiacBandProps>(({ ... }) => { ... });
const PlanetLayer = React.memo<PlanetLayerProps>(({ ... }) => { ... });

// 4. SVG 使用 CSS transform 实现悬停效果
.planet-hotspot {
  transition: transform 0.15s ease;
}
.planet-hotspot:hover {
  transform: scale(1.2);
}
```

### 13.2 懒加载相位计算

```typescript
// aspects 可能在数据量大时计算耗时，单独抽离
const AspectLines = React.lazy(() => import('./AspectLines'));

// 使用 Suspense
<Suspense fallback={null}>
  {showAspects && <AspectLines planets={planetLayouts} aspects={aspects} />}
</Suspense>
```

---

## 14. 无障碍（Accessibility）

### 14.1 ARIA 标签

```typescript
// SVG 根元素
<svg
  role="img"
  aria-label={language === 'zh' ? '天机星盘' : 'TianJi Natal Chart'}
>
  {/* 行星 */}
  <g
    role="button"
    aria-label={`${PLANET_NAMES_ZH[planet.name]}位于${planet.sign}${Math.floor(planet.degree)}度,第${planet.house}宫`}
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onPlanetClick?.(planet);
      }
    }}
  >
    {/* 行星符号 */}
  </g>
</svg>
```

### 14.2 屏幕阅读器输出

```typescript
// 当行星被焦点时，屏幕阅读器应播报：
// "太阳在狮子座23度，第10宫，三分月亮"
function getPlanetAriaLabel(planet: Planet, aspects?: Aspect[]): string {
  const sign = language === 'zh' ? SIGN_NAMES_ZH[planet.sign] : planet.sign;
  const planetName = language === 'zh' ? PLANET_NAMES_ZH[planet.name] : planet.name;
  const degree = Math.floor(planet.degree);

  let label = `${planetName}在${sign}${degree}度，第${planet.house}宫`;

  if (aspects && aspects.length > 0) {
    const aspectList = aspects
      .filter((a) => a.planet1 === planet.name || a.planet2 === planet.name)
      .map((a) => {
        const otherPlanet = a.planet1 === planet.name ? a.planet2 : a.planet1;
        const aspectName = language === 'zh' ? ASPECT_NAMES_ZH[a.type] : a.type;
        return `${aspectName}${PLANET_NAMES_ZH[otherPlanet]}`;
      })
      .join('、');
    if (aspectList) {
      label += `，${aspectList}`;
    }
  }

  return label;
}
```

### 14.3 高对比度模式

```css
@media (prefers-contrast: high) {
  .zodiac-boundary {
    stroke-width: 2px;
  }

  .aspect-line {
    stroke-width: 3px;
  }

  .planet-glyph {
    fill: white;
  }
}
```

---

## 15. 导出功能

### 15.1 导出为 PNG

```typescript
import { svg2png } from 'svg2png-wasm';
// 或使用 html2canvas

async function downloadAsPNG(svgElement: SVGSVGElement, filename = 'zodiac-chart.png') {
  const svgString = new XMLSerializer().serializeToString(svgElement);
  const png = await svg2png(svgString, { scale: 2 }); // 2x 分辨率

  const link = document.createElement('a');
  link.download = filename;
  link.href = `data:image/png;base64,${png.toString('base64')}`;
  link.click();
}
```

### 15.2 导出为 SVG

```typescript
function downloadAsSVG(svgElement: SVGSVGElement, filename = 'zodiac-chart.svg') {
  const svgString = new XMLSerializer().serializeToString(svgElement);
  const blob = new Blob([svgString], { type: 'image/svg+xml' });

  const link = document.createElement('a');
  link.download = filename;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}
```

---

## 16. 文件结构

```
src/
├── components/
│   └── zodiac/
│       ├── ZodiacChart.tsx           # 主组件
│       ├── ZodiacChart.module.css    # 样式模块
│       ├── ZodiacBand.tsx            # 黄道带组件
│       ├── HouseCusps.tsx            # 宫位组件
│       ├── AspectLines.tsx          # 相位线组件
│       ├── PlanetLayer.tsx          # 行星层组件
│       ├── PlanetTooltip.tsx        # 工具提示组件
│       └── Center.tsx                # 中心组件
├── hooks/
│   ├── useCalculateChart.ts          # 星盘计算
│   └── useCollisions.ts              # 碰撞检测
├── lib/
│   ├── constants.ts                  # 常量（符号、名称映射）
│   ├── chart-utils.ts               # 工具函数
│   └── aspect-calculator.ts         # 相位计算
└── types/
    └── zodiac.ts                     # 类型定义
```

---

## 17. 附录：常量映射表

### 17.1 星座名称

```typescript
export const SIGN_NAMES_ZH: Record<string, string> = {
  Aries: '白羊座',
  Taurus: '金牛座',
  Gemini: '双子座',
  Cancer: '巨蟹座',
  Leo: '狮子座',
  Virgo: '处女座',
  Libra: '天秤座',
  Scorpio: '天蝎座',
  Sagittarius: '射手座',
  Capricorn: '摩羯座',
  Aquarius: '水瓶座',
  Pisces: '双鱼座',
};

export const SIGN_SYMBOLS: Record<string, string> = {
  Aries: '♈',
  Taurus: '♉',
  Gemini: '♊',
  Cancer: '♋',
  Leo: '♌',
  Virgo: '♍',
  Libra: '♎',
  Scorpio: '♏',
  Sagittarius: '♐',
  Capricorn: '♑',
  Aquarius: '♒',
  Pisces: '♓',
};
```

### 17.2 相位名称

```typescript
export const ASPECT_NAMES_ZH: Record<AspectType, string> = {
  conjunction: '合相',
  'semi-sextile': '半六分',
  sextile: '六分',
  square: '四分',
  trine: '三分',
  quincunx': '五分',
  opposition: '对分',
};
```

---

## 18. 实现检查清单

- [ ] 创建 SVG 基础结构和 viewBox
- [ ] 实现黄道带 12 宫扇形绘制
- [ ] 实现宫位边界线
- [ ] 实现度数刻度
- [ ] 实现星座符号与名称
- [ ] 实现行星定位与碰撞检测
- [ ] 实现相位计算与绘制
- [ ] 实现悬停交互与 Tooltip
- [ ] 实现点击回调
- [ ] 实现响应式配置
- [ ] 添加 ARIA 无障碍支持
- [ ] 添加键盘导航
- [ ] 实现 PNG/SVG 导出
- [ ] 性能优化（Memoization）
- [ ] 暗色/亮色主题切换
- [ ] 中文/英文语言切换

---

*文档版本：1.0*
*最后更新：2026-04-17*
*维护者：TianJi Global 前端团队*
