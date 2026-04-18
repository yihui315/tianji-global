# TianJi Global 命理AI平台升级策划案 v1.0

**作者**：TianJi Product Team  
**日期**：2026-04-17  
**版本**：v1.0

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

---

### 2.2 内容分层架构

**Layer 1：知识层（Knowledge Layer）**
- 中文占星百科（八字/紫微/七政基础概念）
- 用途：SEO + 权威性 + 教育
- 目标：4周内上线基础版

**Layer 2：工具层（Tool Layer）**
- 圆形 SVG 星盘可视化（TianJi 当前已有基础版本，需重构）
- 出生地 Atlas（经纬度/时区数据库）
- 择时工具（Electional Astrology）
- 目标：3周内完成星盘可视化重构

**Layer 3：AI 服务层（AI Service Layer）**
- Narrative Composer：负责 hook/body/closure 三层叙事
- Fortune Timeline Builder：负责年度时间轴生成（大运/流年/流月）
- Cultural Coherence Checker：负责语义审核（不同文化不能混）
- 目标：每个模块有明确的 Handoff Contract

**Layer 4：产品层（Product Layer）**
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

### 3.1 当前流水线问题诊断

**TianJi 当前 AI 流水线状态分析**：

| 组件 | 状态 | 问题 |
|------|------|------|
| AI Orchestrator | 已实现 | Provider 抽象层良好，但缺少文化审核环节 |
| Report Generation | 已实现 | 单次生成，缺少多阶段流水线 |
| Fortune/择时 | 已实现 | API 层完整，但与 AI 生成脱节 |
| Cultural Coherence | **缺失** | 核心缺口 |
| Handoff Contract | **缺失** | 模块间传递无标准化格式 |

**黑箱步骤**：
- AI 生成内容的语义正确性完全依赖 Model 本身，没有独立审核层
- Narrative Composer 的 prompt 没有系统类型区分
- 不同命理系统的报告使用同一套 prompt 模板

**失败模式**：
- AI 在八字报告中可能混入西方占星概念
- Narrative Composer 超时没有 fallback，直接返回错误
- 模块间依赖没有明确的超时和降级机制

### 3.2 四视图注册设计

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
Narrative Composer
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
    ├─ 四柱/命宫/星盘可视化
    ├─ 基础解读（免费）
    └─ 升级提示（付费深度报告）

Step 4: 选择 - 免费报告 vs 付费深度报告
    │
    ├─ 免费：基础命盘 + 简述
    └─ 付费：完整流年分析/合盘/年度订阅

Step 5: 生成 - AI 流水线执行（显示进度）
    │
    ├─ Step 5.1: 命理计算中...
    ├─ Step 5.2: 时间轴生成中...
    ├─ Step 5.3: 叙事生成中...
    └─ Step 5.4: 文化审核中...

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
   ├─ Step 2: 文化审核（输入）
   │         state: VALIDATING_INPUT
   │
   ├─ Step 3: 时间轴生成
   │         state: BUILDING_TIMELINE
   │
   ├─ Step 4: 叙事生成
   │         state: COMPOSING_NARRATIVE
   │
   └─ Step 5: 文化审核（输出）
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
ACTIONED ───────────────────────────────────────────────────────
   │
   │ 分享/升级/返回


FAILED（任意阶段）───────────────────────────────────────────────
   │
   ├─ Step 1 失败：calculation_failed → 提示检查输入 → 重试
   ├─ Step 2 失败：input_validation_failed → 提示输入不适用于该系统 → 返回Step 2
   ├─ Step 3 失败：timeline_timeout → fallback{ phases: [], key_dates: [] }
   ├─ Step 4 失败：narrative_timeout → fallback{ hook, closure, body: [] }
   └─ Step 5 失败：output_validation_failed → 驳回重生成 → 回Step 4
```

### 3.3 Handoff Contract 格式

```typescript
interface HandoffContract<Input, Output> {
  component: string;           // 当前组件名称
  version: string;              // 合同版本号
  timestamp: string;           // ISO 8601 时间戳
  payload: Input;              // 实际传递的数据
  
  expected_response: {
    success: Output;           // 成功时的输出
    failure: {
      error_code: string;      // 错误码
      error_message: string;   // 错误信息
      fallback: Output | null; // 降级输出，如果为 null 表示无法降级
      retry: boolean;          // 是否可以重试
    };
  };
  
  timeout_ms: number;          // 超时时间
  retry_count: number;         // 已重试次数
  max_retries: number;         // 最大重试次数
  
  invariants: string[];        // 跨调用必须满足的不变条件
}

// 命理计算 → 文化审核 的 Handoff Contract 示例
interface BirthDataHandoff extends HandoffContract<
  { date: string; time: string; location: string; system_type: string },
  { valid: boolean; violations: string[] }
> {
  invariants: [
    "birth_date 必须在 1900-01-01 到 2100-12-31 之间",
    "birth_time 必须是 00:00-23:59",
    "location 必须是有效城市名或坐标"
  ];
}

// 时间轴 → 叙事生成 的 Handoff Contract 示例
interface TimelineDataHandoff extends HandoffContract<
  { phases: TimelinePhase[]; key_dates: KeyDate[]; dominant_elements: string[] },
  { hook: string; body: NarrativeBlock[]; closure: string }
> {
  invariants: [
    "phases 必须包含至少一个 phase",
    "key_dates 中的日期必须在 target_year 范围内",
    "dominant_elements 必须与 system_type 一致"
  ];
}
```

---

## 四、文化智能：语义审核层

### 4.1 为什么需要语义审核

**引用 Anthropologist 框架的核心洞察**：

> "No culture salad" — 混合不同文化概念会让内容失去意义

玄学内容特别敏感：用户会基于这些信息做人生决策。错误的语义混用（如把八字用神概念混入西方占星）会误导用户，甚至导致用户做出错误的人生选择。

**当前风险**：
- AI 模型（如 Claude/GPT）在没有文化审核层的情况下，可能会不自觉地将不同文化体系的概念混合
- 八字报告可能出现"你的上升星座是..."的荒谬表述
- 西方占星报告可能混入"五行相生相克"的概念

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

### 4.3 语义审核实现

```typescript
// Cultural Coherence Checker 模块

type SystemType = "bazi" | "ziwei" | "qizheng" | "western";

interface CoherenceViolation {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  suggestion: string;
}

interface CoherenceResult {
  valid: boolean;
  violations: CoherenceViolation[];
  confidence: number;  // 0.0 - 1.0
  checked_at: string;
}

// 核心检查函数
function checkCulturalCoherence(
  data: string | object,
  targetSystem: SystemType,
  checkType: "input" | "output"
): CoherenceResult {
  const violations: CoherenceViolation[] = [];
  
  // 1. 字符串内容检查
  if (typeof data === "string") {
    violations.push(...checkStringContent(data, targetSystem));
  }
  
  // 2. 结构化数据检查
  if (typeof data === "object") {
    violations.push(...checkStructuredData(data, targetSystem));
  }
  
  // 3. 颜色语义检查
  violations.push(...checkColorSemantics(data, targetSystem));
  
  // 4. 时间语义检查
  if (checkType === "output") {
    violations.push(...checkTimeSemantics(data, targetSystem));
  }
  
  const hasErrors = violations.some(v => v.severity === "error");
  
  return {
    valid: !hasErrors,
    violations,
    confidence: calculateConfidence(violations),
    checked_at: new Date().toISOString(),
  };
}

// 系统专属概念检查
const SYSTEM_CONCEPTS: Record<SystemType, Set<string>> = {
  bazi: new Set([
    "用神", "日主", "十神", "比肩", "劫财", "食神", "伤官",
    "正财", "偏财", "正官", "七杀", "正印", "偏印",
    "四柱", "年柱", "月柱", "日柱", "时柱",
    "大运", "流年", "命局", "格局", "旺衰"
  ]),
  ziwei: new Set([
    "紫微", "天府", "太阴", "贪狼", "巨门", "天相", "天梁",
    "七杀", "破军", "四化", "化禄", "化权", "化科", "化忌",
    "命宫", "兄弟宫", "夫妻宫", "子女宫", "财帛宫", "疾厄宫",
    "迁移宫", "仆役宫", "官禄宫", "田宅宫", "福德宫", "父母宫"
  ]),
  qizheng: new Set([
    "七政", "四余", "太阳", "太阴", "木星", "火星", "土星", "金星", "水星",
    "罗睺", "计都", "紫气", "月孛",
    "二十八宿", "恒星黄道", "升度", "脱度"
  ]),
  western: new Set([
    "上升", "下降", "天顶", "天底", "MC", "IC",
    "白羊座", "金牛座", "双子座", "巨蟹座", "狮子座", "处女座",
    "天秤座", "天蝎座", "射手座", "摩羯座", "水瓶座", "双鱼座",
    "宫头", "相位", "合相", "刑相", "冲相", "拱相", "六合"
  ])
};

// 跨系统污染检测
function checkSystemPollution(
  content: string,
  targetSystem: SystemType
): CoherenceViolation[] {
  const violations: CoherenceViolation[] = [];
  const targetConcepts = SYSTEM_CONCEPTS[targetSystem];
  
  for (const [system, concepts] of Object.entries(SYSTEM_CONCEPTS)) {
    if (system === targetSystem) continue;
    
    const foundConcepts = concepts.filter(concept => content.includes(concept));
    
    if (foundConcepts.length > 0) {
      violations.push({
        severity: "error",
        code: `CROSS_SYSTEM_${system.toUpperCase()}`,
        message: `在 ${targetSystem} 报告中检测到 ${system} 概念: ${foundConcepts.join(", ")}`,
        suggestion: `这些概念属于 ${system} 系统，不应出现在 ${targetSystem} 报告中。请使用 ${targetSystem} 系统的对应概念。`
      });
    }
  }
  
  return violations;
}

// 颜色语义检查
function checkColorSemantics(
  data: string | object,
  targetSystem: SystemType
): CoherenceViolation[] {
  const violations: CoherenceViolation[] = [];
  const content = typeof data === "string" ? data : JSON.stringify(data);
  
  const colorMappings: Record<string, Record<string, string>> = {
    red: {
      western: "危险/停止/火星",
      chinese: "吉祥/喜庆/朱雀"
    },
    white: {
      western: "纯洁/婚礼",
      chinese: "丧事/不吉/白虎"
    },
    yellow: {
      western: "温暖/快乐",
      chinese: "皇家专用/黄色在中国文化中"
    }
  };
  
  // 检测颜色描述是否文化适配
  // （实际实现需要更复杂的 NLP，这里是伪代码）
  
  return violations;
}

// 输出示例
const result = checkCulturalCoherence(
  "你的上升星座是狮子座，今日运势受到火星影响，五行中木星代表木属性...",
  "bazi",
  "output"
);

// result:
// {
//   valid: false,
//   violations: [
//     {
//       severity: "error",
//       code: "CROSS_SYSTEM_WESTERN",
//       message: "在 bazi 报告中检测到 western 概念: 上升星座, 火星, 木星",
//       suggestion: "这些概念属于 western 系统，不应出现在 bazi 报告中。"
//     }
//   ],
//   confidence: 0.95,
//   checked_at: "2026-04-17T12:00:00.000Z"
// }
```

---

## 五、产品升级路线图

### 5.1 时间轴

```
Week 1-3: 基础设施
├── 星盘可视化 SVG 重构
│   ├── 设计新的 SVG 星盘组件（圆形，12宫位，10星曜）
│   ├── 实现动态交互（hover 显示星曜详情）
│   └── 适配移动端
├── 四视图注册架构落地
│   ├── 定义所有 AI 模块的 Handoff Contract
│   ├── 实现状态机管理
│   └── 日志和监控
├── Handoff Contract 标准化
│   ├── birth_data → validated_birth_data
│   ├── validated_birth_data → timeline_data
│   ├── timeline_data → narrative_data
│   └── narrative_data → final_report
└── Cultural Coherence Checker 原型
    ├── 基础规则引擎
    ├── 系统概念库（八字/紫微/七政/西方）
    └── 输入验证 + 输出验证

Week 4-6: 内容体系
├── 中文占星百科基础版（八字 + 紫微）
│   ├── 100 篇基础概念文章
│   ├── SEO 优化（Meta, Schema markup）
│   └── 内部链接结构
├── Narrative Composer 升级（Liz Greene 结构借鉴）
│   ├── hook: 引人入胜的开场
│   ├── body: 深度分析（人格/关系/命运）
│   └── closure: 启示性结尾（不是总结，是开放）
├── 用户系统基础版
│   ├── 邮箱/手机注册
│   ├── 报告历史
│   └── 收藏和分享
└── 语义审核上线
    ├── 全量 AI 生成内容审核
    └── 用户反馈循环

Week 7-12: 产品矩阵
├── 关系合盘（八字合盘 + 星盘合盘）
│   ├── 双人命盘对比
│   ├── 关系兼容性分析
│   └── 建议与注意事项
├── 年度订阅产品
│   ├── 月度运势推送
│   ├── 季度深度报告
│   └── 年度总结
├── 择时工具基础版
│   ├── 最佳时间查询
│   ├── 婚礼/开业/搬家择日
│   └── 天象参考
└── 名人案例库（100个）
    ├── 名人八字解析
    ├── 名人星盘解析
    └── 案例文章

Month 4-6: 权威性建设
├── 签约占星师署名（中文世界）
│   ├── 合作占星师签约
│   ├── 专家署名报告
│   └── 专家问答功能
├── 名人案例扩展（500个）
│   ├── 历史名人命理
│   ├── 当代名人命理
│   └── 案例分析系列
├── 教育内容（50篇）
│   ├── 八字入门指南
│   ├── 紫微斗数入门指南
│   ├── 星盘解读教程
│   └── 命理与现代生活
└── Astro-Databank 对应：中国名人命理数据库
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
| 星盘可视化 | SVG 圆形星盘（可交互） | 技术展示 + 信任 | 使用率 60%+ |
| 择时工具基础版 | 最佳时间查询（限制次数） | 高端免费钩子 | 转化率 10%+ |
| 中文百科 | 八字/紫微/七政入门（100篇） | SEO + 权威性 | 跳出率 < 40% |

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
□ 文化连贯性违规数量：目标 0
□ 跨系统概念混用次数：目标 0
□ 用户报告内容投诉率：< 1%
□ 语义审核覆盖率：100%（所有 AI 生成内容）
□ 每日抽检比例：> 5%
□ Cultural Coherence Checker 准确率：> 95%
```

### 6.2 产品指标

```
□ 星盘可视化使用率：> 60% 的报告用户
□ 百科页面跳出率：< 40%
□ 免费→付费转化率：> 5%
□ 订阅续订率：> 70%
□ 用户报告分享率：> 15%
□ 注册用户月活：> 40%
□ 单用户平均收入（ARPU）：> ¥50/月（付费用户）
```

### 6.3 技术指标

```
□ AI 流水线成功率：> 95%
□ 平均报告生成时间：< 30s
□ Cultural Coherence Check 时间：< 500ms
□ 四视图注册覆盖：100% AI 模块
□ 系统可用性：> 99.9%
□ 错误恢复时间（MTTR）：< 5 分钟
```

---

## 七、风险与缓解

### 7.1 主要风险

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|----------|
| AI 叙事质量不足 | 高 | 中 | 持续人工抽检 + 用户反馈循环；建立内容质量评分体系 |
| 文化连贯性违规 | 高 | 低 | Cultural Coherence Checker 必须作为必须环节，不可绕过 |
| 用户对 AI 署名不信任 | 中 | 中 | 逐步引入专家署名体系；初期标注"AI 辅助分析" |
| 计算精度问题 | 高 | 低 | 全面测试 sweph 所有功能；建立已知问题清单 |
| 竞品快速跟进 | 中 | 中 | 加速核心功能落地；建立中文命理内容壁垒 |
| 法律合规风险 | 中 | 低 | 明确免责声明；不提供医疗/法律专业建议 |
| 模型提供商变更 | 中 | 低 | 保持多 Provider 支持；关键逻辑不依赖特定模型 |

### 7.2 "No Culture Salad" 执行规则

```
规则 1：每个命理系统有独立的 prompt 模板
       - bazi_prompt_template
       - ziwei_prompt_template
       - qizheng_prompt_template
       - western_prompt_template
       - 禁止使用通用 prompt 生成命理内容

规则 2：跨系统概念需要 Cultural Coherence Checker 明确放行
       - 只有明确标注"跨文化比较"的内容才允许混合
       - 放行需要双重确认（系统 + 内容类型）

规则 3：用户不能同时选择多个系统做综合报告
       - 除非明确定义了跨系统规则（如七政四余与西方占星的对话）
       - 界面层直接禁止此类选择

规则 4：百科内容需要标注适用系统
       - 每篇文章必须有 system_tag
       - 跨系统通用概念单独成文

规则 5：Cultural Coherence Checker 拦截的内容必须记录
       - 每日违规报告
       - 每周复盘
       - 持续优化规则库
```

---

## 八、结论与优先级

### 8.1 核心结论

1. **TianJi 的差异化在中文命理，不是翻译 Astro.com**
   - 中文命理（八字/紫微/七政四余）是完全独立于西方占星的市场
   - Astro.com 的9M月活用户主要是英语世界，中文命理市场几乎是空白

2. **内容质量 > 内容数量，文化连贯性是核心**
   - 混合不同命理系统的概念会从根本上破坏内容可信度
   - "No culture salad" 必须作为铁律执行

3. **四视图注册让 AI 流水线透明可控**
   - 每个模块有明确的输入/输出/超时/失败响应
   - 模块间传递有标准化 Handoff Contract
   - 状态机让问题定位清晰

4. **免费内容是权威性建设，不是流量收割**
   - 百科、基础命盘、每日运势的目的是建立用户信任
   - 信任是付费转化和长期留存的基础

### 8.2 立即行动项

**P0（本周必须完成）**：

```
□ 星盘可视化 SVG 方案设计
  - 输出具体组件规格（SVG 结构、尺寸、交互）
  - 评审后进入开发

□ 四视图注册架构设计
  - 输出架构图
  - 定义所有 Handoff Contract 格式
  - 评审后进入开发

□ Cultural Coherence Checker 规则编写
  - 八字系统边界定义
  - 紫微斗数系统边界定义
  - 七政四余系统边界定义
  - 西方占星系统边界定义
  - 跨系统污染检测规则
```

**P1（下周开始）**：

```
□ 中文百科内容大纲
  - 八字基础概念 50 篇
  - 紫微斗数基础概念 30 篇
  - 七政四余基础概念 20 篇

□ Narrative Composer prompt 升级
  - 参考 Liz Greene 叙事结构
  - 分系统独立 prompt
  - 三层叙事模板（hook/body/closure）

□ 用户系统技术方案
  - 注册/登录
  - 报告历史
  - 收藏功能
```

**P2（第三周开始）**：

```
□ 星盘可视化开发
□ 命理计算引擎集成
□ 用户系统开发
□ Cultural Coherence Checker 开发
```

---

**文档结束**

*本策划案为 TianJi Global 未来 6 个月的产品升级提供指导框架。具体实施细节需要在 P0 行动项完成后进一步细化。*
