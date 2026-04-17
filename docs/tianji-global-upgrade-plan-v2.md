# TianJi Global 命理AI平台升级策划案 v2.0

**作者**：TianJi Product Team
**日期**：2026-04-17
**版本**：v2.0（整合 P0+P1 交付物）

---

## 执行摘要

### 已完成（v1 → v2 增量）

| 模块 | 交付 | 状态 | 测试 |
|------|------|------|------|
| P0 星盘可视化 SVG | ZodiacChart.tsx + utils + constants + types | ✅ | 18 tests |
| P0 四视图注册架构 | pipeline-registry/ (workflow + state-machine + tracker + components) | ✅ | 13 tests |
| P0 文化一致性检查 | cultural-coherence/ (checker + pipeline + analytics) | ✅ | 9 tests |
| P1 知识库 | 17篇深度文章（八字/紫微/实用指南/系统对比） | ✅ | — |
| P1 Narrative Composer v2 | Liz Greene 风格三层叙事模板 | ✅ | 2 tests |
| P1 季节内容生成 | 月度运势 + 年度运势生成器 | ✅ | 5 tests |

**47 tests passing，零 TypeScript 错误**

---

## 一、战略背景与核心洞察

### 1.1 为什么现在需要升级

**中英文世界占卜平台的差距分析**

| 维度 | Astro.com（英文） | TianJi Global（中文） |
|------|-----------------|----------------------|
| 月均访问量 | 9,000,000+ | 未知（待建设） |
| 核心引擎 | Swiss Ephemeris（30年开源积累） | sweph npm（需验证精度） |
| 内容体系 | 西方占星全矩阵 | 中文命理散点状 |
| 文化深度 | Liz Greene 级别叙事 | 框架搭建中 |
| 用户信任 | 30年品牌积累 | 新兴平台 |

**TianJi 的独特机会：中文命理（八字/紫微/七政四余）是 Astro.com 完全没有覆盖的领域**

Astro.com 的核心是西方占星术（Western Astrology），基于回归黄道系统，主要服务于英语世界用户。而中文命理体系——八字、紫微斗数、七政四余——是完全独立于西方占星的文化知识体系，在全球中文用户群体中有着深厚的文化根基和广阔的市场需求。

**关键洞察：内容体系的核心是"文化连贯性"，不是"信息量"**

agency-agents 的 Anthropologist 框架揭示：用户需要的不是更多的命理信息，而是一套文化自洽、逻辑自洽的命理叙事。混合不同命理系统的概念（如把八字用神概念混入西方占星）会从根本上破坏内容的可信度。

### 1.2 两大理论框架

**框架 A：Anthropologist 的文化连贯性检查**

- **"No culture salad" 原则**：不要混合不同命理系统的概念而不理解各自的上下文
- **每个系统需要独立文档**：
  - Subsistence/Economy（社会功能）
  - Social Organization（结构）
  - Belief System（宇宙观）
  - Internal Tensions（内在矛盾）
- **"What problem does this practice solve?" 功能主义方法**：理解每个命理系统在传统中国社会中解决了什么问题

**框架 B：Workflow Architect 的四视图注册设计**

1. **By Workflow（按流水线）**：report_generation → fortune_timeline → narrative_composition → coherence_check
2. **By Component（按组件）**：各 AI 模块的输入/输出/状态
3. **By User Journey（按用户旅程）**：用户从输入生日到拿到报告的每一步
4. **By State（按状态）**：pending → processing → validated → delivered

### 1.3 升级愿景

**一句话概括**：构建一个文化自洽、流水线透明、用户体验流畅的中文命理AI平台，让中文用户获得比 Astro.com 更深度的命理服务。

**五大核心原则**：

1. **文化连贯性优先**：任何 AI 生成内容必须通过 Cultural Coherence Checker，绝不混合不同命理系统的核心概念
2. **流水线透明可控**：每个 AI 模块有明确的输入/输出/超时/失败响应，模块间有标准化 Handoff Contract
3. **差异化在中文命理**：八字、紫微斗数、七政四余是 TianJi 的核心战场，不是西方占星的翻译版本
4. **免费内容是权威性建设**：百科、基础命盘、每日运势的目的是建立用户信任，不是流量收割
5. **用户旅程无断点**：从入口到报告到行动，每一步都有清晰的引导和降级方案

---

## 二、内容体系：文化连贯性框架

### 2.1 命理系统文化档案（每个系统独立文档）

#### 2.1.1 八字体系文化档案

**CULTURAL SYSTEM: 八字（BaZi / Four Pillars of Destiny）**

**Subsistence & Economy（社会功能）**
- 传统中国社会：婚配（八字合婚）、经商（择日开市）、从政（科考吉时）、农时（节气播种）
- 解决的问题：如何在不确定的人生中寻求可预测性？如何在关键决策点获得心理支持？
- 现代应用：职业发展咨询、感情关系分析、人生重大决策择时

**Social Organization（结构）**
- 四柱结构：年柱（祖辈/早年）→ 月柱（父母/青年）→ 日柱（本人/中年）→ 时柱（子女/晚年）
- 十神体系：比肩、劫财、食神、伤官、正财、偏财、正官、七杀、正印、偏印
- 大运流年：以10年为一个周期循环往复

**Belief System（宇宙观）**
- 阴阳五行：木火土金水，相生相克
- 天干地支：10天干 × 12地支 = 60甲子循环
- 命定 vs 运势：命是定数（大运/流年），运是变数（可以通过积德、风水调整）

**Internal Tensions（内在矛盾）**
- **命定 vs 运势改变**：八字算命强调命定论，但"积德改命"的传统又承认人的主观能动性
- **用神系统内部矛盾**：用神是八字分析的核心，但不同派别对用神的定义和计算方法存在分歧
- **现代化张力**：传统八字以农业社会为背景，现代职业多样性对原有十神体系提出挑战

**与其他系统的边界**
- 八字与紫微斗数：**不可混用**。八字用"日主"为中心，紫微斗数以"命宫"为中心，两者的宫主星系统完全不同
- 八字与七政四余：可以共享五行概念，但七政四余的恒星黄道与八字的回归黄道体系不同

#### 2.1.2 紫微斗数文化档案

**CULTURAL SYSTEM: 紫微斗数（Zi Wei Dou Shu / Purple Star Astrology）**

**Subsistence & Economy（社会功能）**
- 传统中国社会：皇家历法辅助、政治决策参考、个人命运预测
- 解决的问题：相比八字更注重视化的命宫体系，如何通过星曜组合解读人生？
- 现代应用：性格深度分析、事业天赋识别、人际关系模式

**Social Organization（结构）**
- 命宫为核心：12宫固定分布（命宫、兄弟宫、夫妻宫、子女宫、财帛宫、疾厄宫、迁移宫、仆役宫、官禄宫、田宅宫、福德宫、父母宫）
- 14正曜 + 14辅曜 + 四化星（化禄、化权、化科、化忌）
- 北斗星系（紫微、天机、太阳、武曲、天同、廉贞） + 南斗星系（天府、太阴、贪狼、巨门、天相、天梁、七杀、破军）

**Belief System（宇宙观）**
- 星曜拟人化：每颗星曜有明确性格特征和象征意义
- 四化飞星：星曜因四化产生生克关系，构成复杂的命运网络
- 宫位流转：宫位与宫位之间的呼应关系是解读重点

**Internal Tensions（内在矛盾）**
- **命宫中心论**：紫微斗数强调命宫的决定性作用，但实际论命需要综合考虑多宫联动
- **四化复杂性**：四化系统在不同派别（飞星派、三合派）中的应用差异显著
- **与八字的关系**：两者都是中国传统命理，但理论根基不同，不可简单嫁接

**与其他系统的边界**
- 紫微斗数与八字：**绝对不可混用**。紫微斗数的四化概念与八字的十神系统完全不同
- 紫微斗数与七政四余：共享中国星象学传统，但七政四余更注重实际星体位置

#### 2.1.3 七政四余文化档案

**CULTURAL SYSTEM: 七政四余（Qi Zheng Si Yu / Seven Stars and Four Residual Bodies）**

**Subsistence & Economy（社会功能）**
- 传统中国社会：最高级别的皇家命理，历法制定、重大决策参考
- 解决的问题：最接近天文学的中国命理体系，如何通过实际星体位置解读命运？
- 现代应用：精深专业命理、择日（尤其婚丧嫁娶）、天象与命运关联分析

**Social Organization（结构）**
- 七政：太阳、日、月、木星、火星、土星、金星（实际星体）
- 四余：罗睺、计都、紫气、月孛（虚星/交点）
- 恒星黄道：与西方占星的根本区别，使用实际恒星位置而非回归黄道

**Belief System（宇宙观）**
- 天人合一：人的命运与天上星体位置直接对应
- 升度脱度：星体在二十八宿中的具体位置决定吉凶
- 中西星学桥梁：七政四余是唯一可以与西方占星对话的中国命理体系

**Internal Tensions（内在矛盾）**
- **恒星黄道 vs 回归黄道**：这是与西方占星的根本分歧，同一天的星体位置在两个系统中可能相差几十度
- **古法 vs 今法**：恒星位置因岁差而缓慢变化，不同时代的七政四余计算结果不同
- **专业门槛**：七政四余是所有中国命理中门槛最高的，现代普及困难

**边界案例：七政四余的恒星黄道 vs 西方占星的回归黄道**

| 概念 | 七政四余 | 西方占星 |
|------|---------|---------|
| 黄道系统 | 恒星黄道（以实际恒星为参照） | 回归黄道（以春分点为参照） |
| 岁差影响 | 需要修正 | 已包含在系统中 |
| 当前差异 | 约24度偏差 | 基准 |

#### 2.1.4 西方占星文化档案

**CULTURAL SYSTEM: 西方占星（Western Astrology）**

**Subsistence & Economy（社会功能）**
- 古代：农业历法（节气）、航海导航、宗教日历
- 现代：心理分析（Dane Rudhyar）、性格测试、关系匹配
- Astro.com 主力：每日运势、个人星盘、关系合盘

**Social Organization（结构）**
- 12星座：白羊→双鱼（回归黄道）
- 10星曜：太阳、月亮、水星、金星、火星、木星、土星、天王星、海王星、冥王星
- 12宫位：个人星盘中的生活领域分布

**Belief System（宇宙观）**
- 元素四象：火（直觉）、土（感觉）、风（思维）、水（情感）
- 星座模式：基本（开创）、固定（维持）、变动（适应）
- 现代占星：心理分析导向，强调成长而非预测

**Internal Tensions（内在矛盾）**
- **古典 vs 现代**：古典占星注重行星状态，现代占星注重心理分析
- **预测 vs 成长**：命定论与自由意志的张力
- **岁差问题**：回归黄道与恒星黄道的差异导致"岁差论"争议

### 2.2 内容分层架构

**Layer 1：知识层（Knowledge Layer）** ✅ 已完成
- 中文占星百科（八字/紫微/七政基础概念）
- 用途：SEO + 权威性 + 教育
- 状态：**17篇文章已落地，47 tests passing**

**Layer 2：工具层（Tool Layer）** ✅ 星盘 SVG 已完成
- 圆形 SVG 星盘可视化（TianJi 当前已有基础版本，需重构）
- 出生地 Atlas（经纬度/时区数据库）
- 择时工具（Electional Astrology）
- 状态：**SVG 组件 18 tests passing，待接入命理计算引擎**

**Layer 3：AI 服务层（AI Service Layer）** ✅ Registry 已完成
- Narrative Composer：负责 hook/body/closure 三层叙事
- Fortune Timeline Builder：负责年度时间轴生成（大运/流年/流月）
- Cultural Coherence Checker：负责语义审核（不同文化不能混）
- 状态：**Registry + State Machine + Tracker 已落地，13 tests passing**

**Layer 4：产品层（Product Layer）** 待开发
- 免费：每日运势、基础八字报告、基础星盘
- 付费：流年分析、合盘报告、年度订阅
- 目标：3-6个月完成产品矩阵

### 2.3 "No Culture Salad" 规则

**可以跨系统共享的概念**：
- 五行木火土金水（八字、紫微、七政都使用）
- 阴阳概念
- 天干地支基础结构（但解释方式因系统而异）
- 命宫、宫位基础概念（需明确标注适用于哪种系统）

**绝对不能跨系统混用的概念**：
- 八字用神 ≠ 紫微斗数四化
- 八字十神 ≠ 紫微斗数星曜
- 西方占星12星座 ≠ 中国十二生肖
- 西方占星宫位（Asc/MC）≠ 紫微斗数宫位体系

**边界案例处理**：

```
边界案例 1：七政四余的恒星黄道 vs 西方占星的回归黄道
处理方案：
- 报告必须明确标注使用的是哪种黄道系统
- 在七政四余报告中提及西方占星时，必须注明岁差修正
- 绝不能在七政四余报告中直接使用西方占星的星座解释

边界案例 2：五行与西方元素
处理方案：
- 西方占星报告中提及五行是不当的（除非是跨文化比较文章）
- 中国命理报告中提及西方四元素也是不当的
- 保持系统纯粹性
```

---

## 三、AI 流水线：四视图注册架构

### 3.1 已完成模块诊断

| 组件 | 状态 | 问题 |
|------|------|------|
| AI Orchestrator | 已实现 | Provider 抽象层良好，但缺少文化审核环节 |
| Report Generation | 已实现 | 单次生成，缺少多阶段流水线 |
| Fortune/择时 | 已实现 | API 层完整，但与 AI 生成脱节 |
| Cultural Coherence | ✅ **已完成** | 核心缺口已填入 |
| 四视图注册 | ✅ **已完成** | 状态机 + Tracker 已落地 |
| Narrative Composer v2 | ✅ **已完成** | Liz Greene 风格已实现 |
| Handoff Contract | ✅ **已完成** | Registry + Components 已标准化 |

### 3.2 四视图注册设计（已落地）

**视图 1：By Workflow（按流水线）**

```
用户输入生日（birth_date, birth_time, birth_location）
    ↓
命理计算引擎（sweph + 中国农历）
    ↓ [birth_data: { date, time, location, lunar?, timezone }]
Cultural Coherence Checker（检查输入是否适用于目标系统）
    ↓ [validated_birth_data]
Fortune Timeline Builder（生成时间轴：大运/流年/流月）
    ↓ [timeline_data: { phases: [], key_dates: [], dominant_elements: [] }]
Narrative Composer（生成 hook/body/closure 三层叙事）
    ↓ [narrative_data: { hook: string, body: NarrativeBlock[], closure: string }]
Cultural Coherence Checker（检查输出是否文化连贯）
    ↓ [final_report: { report: {}, coherence_check: {} }]
报告渲染（InsightSection + ApplicationSection）
```

**视图 2：By Component（按组件）**

```
Narrative Composer v2
├── 输入：{ timeline_data, user_profile, system_type: "bazi" | "ziwei" | "qizheng" | "western", language: "zh" | "en" }
├── 输出：{ hook: string, body: NarrativeBlock[], closure: string, word_count: number }
├── 超时：30s
├── 失败：返回 { hook: "本月运势整体平稳...", body: [...], closure: "把握当下，顺势而为。" }
└── 依赖：Fortune Timeline Builder

Fortune Timeline Builder
├── 输入：{ validated_birth_data, system_type: "bazi" | "ziwei" | "qizheng" | "western", target_year: number }
├── 输出：{ phases: TimelinePhase[], key_dates: KeyDate[], dominant_elements: string[], balance_analysis: {} }
├── 超时：15s
├── 失败：返回 { phases: [], key_dates: [], error: "calculation_timeout" }
└── 依赖：Cultural Coherence Checker（输入阶段）

Cultural Coherence Checker
├── 输入：{ data: any, target_system: "bazi" | "ziwei" | "qizheng" | "western", check_type: "input" | "output" }
├── 输出：{ valid: boolean, violations: string[], suggestions: string[], confidence: number }
├── 超时：5s
├── 失败：返回 { valid: true, violations: [], suggestions: [], confidence: 0.5 }
└── 依赖：无

命理计算引擎（sweph + 中国农历）
├── 输入：{ birth_date, birth_time, birth_location, system_type: "bazi" | "ziwei" | "qizheng" | "western" }
├── 输出：{ pillars: {}, planets: {}, houses: {}, coordinates: {} }
├── 超时：10s
├── 失败：返回 { error: "calculation_failed", fallback: null }
└── 依赖：无
```

**视图 3：By User Journey（按用户旅程）**

```
Step 1: 入口 - 用户选择系统（八字/紫微/七政/西方）
    │
    ├─ 八字 → bazi-flow
    ├─ 紫微斗数 → ziwei-flow
    ├─ 七政四余 → qizheng-flow
    └─ 西方占星 → western-flow

Step 2: 输入 - 出生日期/时间/地点
    │
    ├─ 日期选择器（公历/农历切换）
    ├─ 时间选择器（时辰精确到小时）
    └─ 地点输入（城市名 → 经纬度）

Step 3: 确认 - 显示命盘摘要（免费钩子）
    │
    ├─ 四柱/命宫/星盘可视化 ✅ SVG 组件已就绪
    ├─ 基础解读（免费）
    └─ 升级提示（付费深度报告）

Step 4: 选择 - 免费报告 vs 付费深度报告
    │
    ├─ 免费：基础命盘 + 简述
    └─ 付费：完整流年分析/合盘/年度订阅

Step 5: 生成 - AI 流水线执行（显示进度） ✅ Registry 已就绪
    │
    ├─ Step 5.1: 命理计算中...
    ├─ Step 5.2: 时间轴生成中...
    ├─ Step 5.3: 叙事生成中... ✅ Narrative Composer v2 已就绪
    └─ Step 5.4: 文化审核中... ✅ Coherence Checker 已就绪

Step 6: 阅读 - 报告展示（三层叙事）
    │
    ├─ InsightSection（hook/body/closure × 4模块）
    └─ ApplicationSection（hook/body/advice × 3模块）

Step 7: 行动 - 分享/升级/返回
    │
    ├─ 分享报告（社交媒体）
    ├─ 升级服务（推荐付费产品）
    └─ 返回首页（继续探索）
```

**视图 4：By State（按状态）**

```
PENDING ──────────────────────────────────────────────────────────
   │
   │ 用户输入birth_data
   ▼
PROCESSING ──────────────────────────────────────────────────────
   │
   ├─ Step 1: 命理计算（sweph）
   │         state: CALCULATING
   │
   ├─ Step 2: 文化审核（输入） ✅ 已实现
   │         state: VALIDATING_INPUT
   │
   ├─ Step 3: 时间轴生成
   │         state: BUILDING_TIMELINE
   │
   ├─ Step 4: 叙事生成 ✅ 已实现（v2）
   │         state: COMPOSING_NARRATIVE
   │
   └─ Step 5: 文化审核（输出）✅ 已实现
             state: VALIDATING_OUTPUT

VALIDATED ───────────────────────────────────────────────────────
   │
   │ 文化审核通过
   ▼
DELIVERED ───────────────────────────────────────────────────────
   │
   │ 报告已渲染
   ▼
READ ────────────────────────────────────────────────────────────
   │
   │ 用户阅读报告
   ▼
ACTIONED ────────────────────────────────────────────────────────
   │
   │ 分享/升级/返回


FAILED（任意阶段）───────────────────────────────────────────────
   │
   ├─ Step 1 失败：calculation_failed → 提示检查输入 → 重试
   ├─ Step 2 失败：input_validation_failed → 提示输入不适用于该系统 → 返回Step 2
   ├─ Step 3 失败：timeline_timeout → fallback{ phases: [], key_dates: [] }
   ├─ Step 4 失败：narrative_timeout → fallback{ hook, closure, body: [] } ✅ 已定义
   └─ Step 5 失败：output_validation_failed → 驳回重生成 → 回Step 4 ✅ 已定义
```

### 3.3 Handoff Contract 格式（已落地）

```typescript
// 已落地文件：src/lib/pipeline-registry/types.ts
interface HandoffContract<Input, Output> {
  component: string;
  version: string;
  timestamp: string;
  payload: Input;
  expected_response: {
    success: Output;
    failure: {
      error_code: string;
      error_message: string;
      fallback: Output | null;
      retry: boolean;
    };
  };
  timeout_ms: number;
  retry_count: number;
  max_retries: number;
  invariants: string[];
}
```

---

## 四、文化智能：语义审核层（已落地）

### 4.1 为什么需要语义审核

**引用 Anthropologist 框架的核心洞察**：

> "No culture salad" — 混合不同文化概念会让内容失去意义

玄学内容特别敏感：用户会基于这些信息做人生决策。错误的语义混用（如把八字用神概念混入西方占星）会误导用户，甚至导致用户做出错误的人生选择。

**当前状态**：✅ Cultural Coherence Checker 已完成，9 tests passing

### 4.2 语义审核检查清单

**文化边界检查**

```
□ 是否混用了不同命理系统的核心概念？
□ 八字报告中是否出现了紫微斗数的四化概念？（罗睺、计都、紫气、月孛）
□ 紫微斗数报告中是否出现了八字的十神概念？（比肩、劫财、食神...）
□ 西方占星报告中是否出现了中国命理概念？（八字、阴阳五行）
□ 中国命理报告中是否出现了西方占星术语？（上升、下降、天顶、天底）
□ 报告标题或摘要是否正确标注了命理系统来源？
□ 用户请求"综合分析"时，是否明确拒绝了跨系统混合报告？
```

**颜色语义检查**

```
□ 红色：在西方占星 = 危险/停止/火星；在中国玄学 = 吉祥/喜庆/朱雀
□ 白色：在西方 = 纯洁/婚礼；在中国玄学 = 丧事/不吉/白虎
□ 黄色：在西方 = 温暖/快乐；在中国皇权语境 = 皇家专用
□ 黑色：在西方 = 葬礼/哀悼；在中国玄学 = 水/北方/玄武
□ 报告中的颜色吉凶判断是否根据用户所在文化圈正确映射？
□ 涉及颜色时是否注明了文化来源？
```

**命名结构检查**

```
□ East Asian names: 不做 first/last split
□ Chinese: 姓+名，直接处理，不拆分为 given_name / family_name
□ Japanese: 性+名，尊重用户输入格式
□ Korean: 姓+名，直接处理
□ 用户输入的名字是否用于后续称呼（而非强制音译）？
□ 报告中的称谓是否尊重用户输入格式？
```

**时间语义检查**

```
□ 中国农历 vs 公历：是否明确标注用的是哪种历法？
□ 八字以立春为新年：岁柱切换是否在报告中体现？（非春节切换）
□ 夏令时历史：1991年前中国无夏令时，计算时是否正确处理？
□ 出生地时区：是否根据出生地（而非当前所在地）确定八字时辰？
□ 七政四余的恒星黄道：是否与西方占星的回归黄道区分清楚？
```

### 4.3 语义审核实现（已落地）

**已落地文件**：
- `src/lib/cultural-coherence/types.ts` — SystemType / CoherenceResult / CoherenceViolation
- `src/lib/cultural-coherence/checker.ts` — checkCoherence() 核心
- `src/lib/cultural-coherence/pipeline.ts` — generateReportWithCoherenceCheck()
- `src/lib/cultural-coherence/analytics.ts` — 违规追踪接口
- `src/hooks/useCoherenceCheck.ts` — React hook

---

## 五、产品升级路线图 v2

### 5.1 时间轴

```
Week 1-3: P0 基础设施 ✅ 全部完成
├── 星盘可视化 SVG 重构 ✅ 651行，18 tests
├── 四视图注册架构落地 ✅ 637行，13 tests
└── Cultural Coherence Checker ✅ 9 tests

Week 4-6: P1 内容体系 ✅ 全部完成
├── 中文占星百科基础版 ✅ 17篇文章
├── Narrative Composer 升级 ✅ Liz Greene v2
├── 季节内容生成系统 ✅ MonthlyFortune / YearlyOverview
└── 语义审核上线 ✅ 集成到 reading-engine.ts

Week 7-12: P2 产品矩阵 ← 当前阶段
├── 关系合盘（八字合盘 + 星盘合盘）
│   ├── 双人命盘对比
│   ├── 关系兼容性分析
│   └── 合盘文化一致性检查
├── 年度订阅产品
│   ├── 月度运势推送
│   ├── 季度深度报告
│   └── 年度总结
├── 用户系统基础版
│   ├── 邮箱/手机注册
│   ├── 报告历史
│   └── 收藏和分享
└── 择时工具基础版
    ├── 最佳时间查询
    ├── 婚礼/开业/搬家择日
    └── 天象参考

Month 4-6: P3 权威性建设
├── 签约占星师署名（中文世界）
│   ├── 合作占星师签约
│   ├── 专家署名报告
│   └── 专家问答功能
├── 名人案例扩展
│   ├── 历史名人命理
│   ├── 当代名人命理
│   └── 案例分析系列
├── 教育内容（50篇）
│   ├── 八字入门指南
│   ├── 紫微斗数入门指南
│   ├── 星盘解读教程
│   └── 命理与现代生活
└── 中国名人命理数据库
    ├── 数据库架构
    ├── 数据录入流程
    └── 公开查询功能
```

### 5.2 免费 vs 付费产品矩阵

**免费产品（流量引擎）**

| 产品 | 功能 | 目的 | 预期指标 |
|------|------|------|----------|
| 每日运势 | 每日综合吉凶（12星座/八字日柱） | 最大流量入口 | DAU 10000+ |
| 基础命盘 | 八字/星盘基础解读 | SEO + 注册转化 | 注册率 30%+ |
| 星盘可视化 | SVG 圆形星盘（可交互）✅ | 技术展示 + 信任 | 使用率 60%+ |
| 知识库百科 | 八字/紫微/七政入门（17篇）✅ | SEO + 权威性 | 跳出率 < 40% |
| 月度运势 | 季节内容生成器 ✅ | 用户粘性 | DAU 提升 |
| 择时工具基础版 | 最佳时间查询（限制次数） | 高端免费钩子 | 转化率 10%+ |

**付费产品（收入引擎）**

| 产品 | 定价策略 | 目标用户 | 预期转化 |
|------|----------|----------|----------|
| 八字流年分析 | ¥99-299/次 | 深度用户 | 5%+ |
| 紫微斗数流年 | ¥99-299/次 | 深度用户 | 5%+ |
| 七政四余预测 | ¥299-599/次 | 专业用户 | 2%+ |
| 关系合盘 | ¥149-349/次 | 情侣/家庭 | 8%+ |
| 年度订阅 | ¥29-99/月 | 高频用户 | 续订率 70%+ |
| 择时服务 | ¥500+/次 | 商业决策 | 1%+ |

---

## 六、关键成功指标

### 6.1 内容质量指标

```
□ 文化连贯性违规数量：目标 0 ✅ Checker 已部署
□ 跨系统概念混用次数：目标 0
□ 用户报告内容投诉率：< 1%
□ 语义审核覆盖率：100%（所有 AI 生成内容）✅ Checker 已集成
□ 每日抽检比例：> 5%
□ Cultural Coherence Checker 准确率：> 95%
```

### 6.2 产品指标

```
□ 星盘可视化使用率：> 60% 的报告用户 ✅ SVG 组件已就绪
□ 百科页面跳出率：< 40% ✅ 17篇深度内容已落地
□ 免费→付费转化率：> 5%
□ 订阅续订率：> 70%
□ 用户报告分享率：> 15%
□ 注册用户月活：> 40%
□ 单用户平均收入（ARPU）：> ¥50/月（付费用户）
```

### 6.3 技术指标

```
□ AI 流水线成功率：> 95% ✅ Registry 已标准化 Handoff Contract
□ 平均报告生成时间：< 30s
□ Cultural Coherence Check 时间：< 500ms ✅ Checker 已落地
□ 四视图注册覆盖：100% AI 模块 ✅ Registry 已落地
□ 系统可用性：> 99.9%
□ 错误恢复时间（MTTR）：< 5 分钟 ✅ State Machine 已定义所有失败模式
```

---

## 七、风险与缓解

### 7.1 主要风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| AI 叙事质量不足 | 高 | 中 | 持续人工抽检 + 用户反馈循环；建立内容质量评分体系 |
| 文化连贯性违规 | 高 | 低 | Cultural Coherence Checker 已部署，必须作为必须环节，不可绕过 |
| 用户对 AI 署名不信任 | 中 | 中 | 逐步引入专家署名体系；初期标注"AI 辅助分析" |
| 计算精度问题 | 高 | 低 | 全面测试 sweph 所有功能；建立已知问题清单 |
| 竞品快速跟进 | 中 | 中 | 加速核心功能落地；建立中文命理内容壁垒 |
| 法律合规风险 | 中 | 低 | 明确免责声明；不提供医疗/法律专业建议 |
| 模型提供商变更 | 中 | 低 | 保持多 Provider 支持；关键逻辑不依赖特定模型 |

### 7.2 "No Culture Salad" 执行规则（已落地）

```
规则 1：每个命理系统有独立的 prompt 模板 ✅ Narrative Composer v2 已按系统分离
       - bazi_prompt_template
       - ziwei_prompt_template
       - qizheng_prompt_template
       - western_prompt_template
       - 禁止使用通用 prompt 生成命理内容

规则 2：跨系统概念需要 Cultural Coherence Checker 明确放行 ✅ 已实现
       - 只有明确标注"跨文化比较"的内容才允许混合
       - 放行需要双重确认（系统 + 内容类型）

规则 3：用户不能同时选择多个系统做综合报告 ✅ UI 层限制
       - 除非明确定义了跨系统规则（如七政四余与西方占星的对话）
       - 界面层直接禁止此类选择

规则 4：百科内容需要标注适用系统 ✅ 文章已有 system_tag 结构
       - 每篇文章必须有 system_tag
       - 跨系统通用概念单独成文

规则 5：Cultural Coherence Checker 拦截的内容必须记录 ✅ analytics.ts 已实现
       - 每日违规报告
       - 每周复盘
       - 持续优化规则库
```

---

## 八、下一步行动（v2）

### P2 Week 7-9：合盘系统 + 用户系统

```
□ 关系合盘开发
  ├── 八字合盘引擎（十神配合、大运协调）
  ├── 紫微斗数合盘（命宫对照、星曜互动）
  ├── 合盘文化一致性检查（防止跨系统混用）
  └── 合盘报告 Narrative 模板

□ 用户系统基础版
  ├── Supabase Auth 集成（已完成表结构，待 RLS 策略）
  ├── 报告历史存储
  ├── 收藏和分享功能
  └── 订阅管理
```

### P2 Week 10-12：付费产品 + 择时工具

```
□ 付费报告流水线
  ├── 支付集成（Stripe/支付宝）
  ├── 报告解锁逻辑
  └── 订单和订阅管理

□ 择时工具基础版
  ├── 命理计算引擎择时模块
  ├── 用户输入最优时间
  └── 择日报告生成

□ 年度订阅系统
  ├── 月度运势推送（邮件/消息）
  ├── 季度深度报告自动生成
  └── 年度总结生成
```

### P3 Month 4-6：权威性建设

```
□ 签约占星师体系
□ 名人命理案例库（目标 100 个）
□ 教育内容扩展（目标 50 篇）
□ 中国名人命理数据库
```

---

## 九、已交付文件清单

```
src/components/zodiac/
├── types.ts            ✅  Planet/Aspect/HouseCusp/ZodiacChartProps
├── constants.ts        ✅  符号/颜色/尺寸常量
├── utils.ts            ✅  polarToCartesian/describeArc/calculateAspect
├── ZodiacChart.tsx     ✅  完整 SVG 组件（651行）
└── __tests__/utils.test.ts  ✅ 18 tests

src/lib/pipeline-registry/
├── types.ts            ✅  核心类型定义
├── workflow.ts         ✅  6阶段流水线
├── components.ts       ✅  6组件 I/O Schema（含 narrative-composer-v2）
├── journey.ts          ✅  7步用户旅程
├── state-machine.ts    ✅  状态机（8个转换）
├── tracker.ts          ✅  运行时追踪器
├── index.ts           ✅  barrel export
└── __tests__/         ✅ 13 tests

src/lib/cultural-coherence/
├── types.ts            ✅  SystemType/CoherenceResult
├── forbidden-concepts.ts ✅  4系统禁止词
├── color-semantics.ts  ✅  颜色语义
├── time-rules.ts      ✅  时间语义
├── checker.ts          ✅  checkCoherence() 核心
├── pipeline.ts         ✅  generateReportWithCoherenceCheck()
├── analytics.ts        ✅  违规追踪
├── coherence-events.ts ✅  事件类型
├── index.ts           ✅  barrel export
└── __tests__/         ✅ 9 tests

src/lib/narrative-composer/
├── templates.ts        ✅  NarrativeReport/NarrativeTheme + Liz Greene 结构
├── prompts.ts         ✅  文言写作风格系统
├── service.ts         ✅  generateNarrative()
├── index.ts           ✅  barrel export
└── __tests__/         ✅ 2 tests

src/lib/seasonal-content/
├── types.ts            ✅  MonthlyFortune/YearlyOverview
├── monthly-generator.ts ✅  月度/年度运势生成器
└── index.ts           ✅  barrel export

src/hooks/
└── useCoherenceCheck.ts ✅  React hook

src/lib/reading-engine.ts  ✅  集成 coherence check wrapper

docs/knowledge-base/
├── index.md            ✅  知识库入口
├── learning-path.md    ✅  学习路径
├── bazi/
│   ├── overview.md     ✅
│   ├── five-elements.md ✅
│   ├── ten-gods.md     ✅  (7248 bytes)
│   ├── dayun-liunian.md ✅  (5806 bytes)
│   └── case-studies.md ✅  (5515 bytes)
├── ziwei/
│   ├── overview.md     ✅
│   ├── main-stars.md   ✅
│   ├── palaces.md      ✅
│   └── sihua.md        ✅
├── practical/
│   ├── love-compatibility.md ✅
│   ├── career-guidance.md    ✅
│   ├── timing-decisions.md   ✅
│   ├── daily-cultivation.md  ✅
│   └── self-awareness.md    ✅
└── shared/
    └── comparison.md   ✅  系统对比

docs/
├── cultural-coherence-checker-rules.md  ✅ 708行
├── zodiac-chart-svg-design.md          ✅ 1417行
├── tianji-global-upgrade-plan-v1.md     ✅ 原始策划案
└── tianji-global-upgrade-plan-v2.md     ✅ 本文档
```

---

*本文档为 TianJi Global 未来 3-6 个月的产品升级提供指导框架。P0+P1 已全部完成，P2 合盘+用户系统开发中，P3 权威性建设待启动。*
