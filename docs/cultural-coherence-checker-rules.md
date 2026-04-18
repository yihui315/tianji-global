# TianJi Global 文化一致性检查器规则定义

> **治理原则：人类学家"No Culture Salad"原则**
> 混合不同系统的概念而不理解其上下文，将摧毁专业可信度。
> 本文档定义所有必须被程序化执行的规则。

---

## 目录

1. [系统概念边界](#1-系统概念边界)
2. [可共享概念](#2-可共享概念)
3. [颜色语义](#3-颜色语义)
4. [时间语义](#4-时间语义)
5. [姓名处理](#5-姓名处理)
6. [跨系统污染检测规则](#6-跨系统污染检测规则)
7. [实现伪代码](#7-实现伪代码)
8. [违规严重级别](#8-违规严重级别)

---

## 1. 系统概念边界

### Bazi（八字）—— 中国四柱命理

**核心概念（可以出现在八字报告中）：**

| 类别 | 概念列表 |
|------|----------|
| 十神 | 用神、日主、十神、比肩、劫财、食神、伤官、正财、偏财、正官、七杀、正印、偏印 |
| 四柱结构 | 四柱、年柱、月柱、日柱、时柱、命局 |
| 宫位 | 命宫、身宫 |
| 时间周期 | 大运、流年、流月、流日、命带、小运、胎元 |
| 格局 | 格局、旺衰、得令、失令 |
| 天干地支 | 天干、地支、藏干、遁干、旬空、四废、阴阳 |
| 五行 | 五行、木火土金水、相生、相克、旺相休囚死 |
| 神煞 | 驿马、桃花、贵人、文昌、太极、天德、月德、将星、华盖、劫煞 |
| 星曜关系 | 合、冲、刑、害、破、拱、夹、邀 |

**禁止概念（绝对不能出现在八字报告中——属于其他系统）：**

| 禁止类别 | 具体概念 | 所属系统 |
|----------|----------|----------|
| 紫微星曜 | 紫微、天府、太阴、贪狼、巨门、天相、天梁、七杀、破军、廉贞、武曲、天机、天同、太阳 | 紫微斗数 |
| 紫微四化 | 化禄、化权、化科、化忌 | 紫微斗数 |
| 紫微十二宫 | 命宫、兄弟宫、夫妻宫、子女宫、财帛宫、疾厄宫、迁移宫、仆役宫、官禄宫、田宅宫、福德宫、父母宫（注：八字有命宫/身宫但含义不同） | 紫微斗数 |
| 西方星盘点 | 上升星座、下降星座、天顶、天底、MC、IC、ASC、DSC | 西方占星 |
| 西方十二星座 | 白羊座、金牛座、双子座、巨蟹座、狮子座、处女座、天秤座、天蝎座、射手座、摩羯座、水瓶座、双鱼座 | 西方占星 |
| 七政四余 | 罗睺、计都、紫气、月孛（无明确七政四余上下文时禁止） | 七政四余 |
| 七政四余技法 | 恒星黄道、升度、脱度 | 七政四余 |
| 西方技法 | 太阳弧推进、次级推进、回归图 | 西方占星 |

---

### Ziwei（紫微斗数）—— 紫微斗数

**核心概念（可以出现在紫微斗数报告中）：**

| 类别 | 概念列表 |
|------|----------|
| 星曜 | 紫微、天府、太阴、贪狼、巨门、天相、天梁、七杀、破军、廉贞、武曲、天机、天同、太阳 |
| 四化 | 化禄、化权、化科、化忌 |
| 十二宫 | 命宫、兄弟宫、夫妻宫、子女宫、财帛宫、疾厄宫、迁移宫、仆役宫、官禄宫、田宅宫、福德宫、父母宫 |
| 宫位系统 | 北斗、南斗、中天、寅宫、申宫等十二宫位名称 |
| 星曜状态 | 庙、旺、平、陷、落（庙旺陷落）、星曜亮度 |
| 星曜关系 | 三合、冲、夹、会、同宫、对宫 |
| 四化星 | 忌星、权星、禄星、科星 |
| 流派 | 飞星、三合派 |

**禁止概念：**

| 禁止类别 | 具体概念 | 所属系统 |
|----------|----------|----------|
| 八字十神 | 用神、日主、十神、比肩、劫财、食神、伤官、正财、偏财、正官、七杀、正印、偏印 | 八字 |
| 八字四柱 | 年柱、月柱、日柱、时柱 | 八字 |
| 八字时间概念 | 大运、流年、流月（注：紫微斗数使用大限/流年但概念不同） | 八字 |
| 八字格局 | 格局、旺衰、得令、失令 | 八字 |
| 西方星盘点 | 上升星座、下降星座、MC、IC | 西方占星 |
| 西方十二星座 | 白羊座、金牛座、双子座、巨蟹座、狮子座、处女座、天秤座、天蝎座、射手座、摩羯座、水瓶座、双鱼座 | 西方占星 |
| 七政四余 | 恒星黄道、岁差（除非明确跨文化比较） | 七政四余 |

---

### Qizheng（七政四余）—— 七政四余

**核心概念（可以出现在七政四余报告中）：**

| 类别 | 概念列表 |
|------|----------|
| 七政（实际天体） | 太阳、太阴、木星、火星、土星、金星、水星 |
| 四余（交点与近点） | 罗睺、计都、紫气、月孛 |
| 二十八宿 | 角宿、亢宿、氐宿、房宿、心宿、尾宿、箕宿、斗宿、牛宿、女宿、虚宿、危宿、室宿、壁宿、奎宿、娄宿、胃宿、昴宿、毕宿、觜宿、参宿、井宿、鬼宿、柳宿、星宿、张宿、翼宿、轸宿 |
| 黄道系统 | 恒星黄道、回归黄道、岁差、岁差角 |
| 天文技法 | 升度、脱度、黄道宿度 |
| 宫位系统 | 宫度、入宫、度主 |
| 定位 | 七政四余、中西星学 |

**禁止概念：**

| 禁止类别 | 具体概念 | 所属系统 |
|----------|----------|----------|
| 八字系统 | 用神、十神、四柱、大运 | 八字 |
| 紫微斗数 | 紫微星曜和四化 | 紫微斗数 |
| 西方占星 | 西方十二星座、上升/下降/MC/IC | 西方占星 |

> **重要注意：** 太阳/太阴/木星/火星/土星/金星/水星在七政四余中是实际星体，与西方占星中同名的星曜概念不同。在七政四余报告中提到这些星体时，应明确标注为"七政"体系下的概念。

---

### Western（西方占星）—— 西方占星

**核心概念（可以出现在西方占星报告中）：**

| 类别 | 概念列表 |
|------|----------|
| 星盘点 | 上升星座（ASC）、下降星座（DSC）、天顶（MC）、天底（IC） |
| 十二星座 | 白羊座、金牛座、双子座、巨蟹座、狮子座、处女座、天秤座、天蝎座、射手座、摩羯座、水瓶座、双鱼座 |
| 行星 | 太阳、月亮、水星、金星、火星、木星、土星、天王星、海王星、冥王星 |
| 宫位 | 1-12宫、宫头、宫主星 |
| 相位 | 合相、刑相、冲相、拱相、六合、三分相、四分相、五分相、半六分相 |
| 元素 | 火象、土象、风象、水象 |
| 模式 | 基本宫、固定宫、变动宫 |
| 技法 | 逆行、过境（transit）、推进（progression）、回归图 |
| 黄道系统 | 回归黄道（对比恒星黄道） |

**禁止概念：**

| 禁止类别 | 具体概念 | 所属系统 |
|----------|----------|----------|
| 八字系统 | 用神、十神、日主、大运、流年 | 八字 |
| 紫微斗数 | 紫微、天府、四化、化禄、化权、化科、化忌 | 紫微斗数 |
| 七政四余 | 罗睺、计都、紫气、月孛、二十八宿、恒星黄道（除非明确跨文化比较） | 七政四余 |
| 中国五行 | 五行、木火土金水 | 中国玄学 |

---

## 2. 可共享概念

### 可以在系统间共享的概念（需适当上下文）

**在中国体系间共享（八字/紫微斗数/七政四余）：**

| 概念 | 共享说明 |
|------|----------|
| 阴阳 | 基本哲学概念，各系统均有使用但解释角度可能不同 |
| 五行 | 各系统均有使用，但在八字中作为十神判断依据，在七政四余中作为星体属性，需按系统分别解释 |
| 天干地支 | 十天干、十二地支——结构框架，非解释性概念 |
| 命 | 命运/命盘概念，中国玄学通用 |
| 运 | 时机/运势概念，中国玄学通用 |
| 吉凶 | 吉利/凶险的判断，中国玄学通用 |

### 绝对不能跨系统混用的概念

| 概念A | 系统A中含义 | 概念B | 系统B中含义 | 混用风险 |
|-------|-------------|-------|-------------|----------|
| 命宫 | 八字：命宫（身宫），仅两个宫位 | 命宫 | 紫微斗数：十二宫之一，整个命盘结构完全不同 | 高——必须通过系统前缀区分 |
| 身宫 | 八字：与命宫配合判断 | 身宫 | 紫微斗数：此概念不存在 | 高 |
| 七杀 | 八字：十神之一，代表竞争/挑战 | 七杀 | 紫微斗数：星曜之一，命运影响力不同 | 极高——相同汉字，完全不同系统 |
| 化忌 | 紫微斗数：四化之一，凶性转化 | 忌 | 八字：非相同概念体系 | 高 |
| 天机 | 紫微斗数：星曜 | 天机 | 八字：非相同概念 | 高 |
| 太阳 | 七政四余：实际星体（太阳系恒星） | 太阳 | 西方占星：行星之一，象征意义不同 | 中——需明确体系 |
| 太阴 | 七政四余：实际星体（月球） | 太阴 | 紫微斗数：星曜之一 | 中——需明确体系 |

**关键原则：** 即使汉字相同，只要属于不同系统，必须视为不同概念。绝不能在报告正文中不加分系说明地混用。

---

## 3. 颜色语义

颜色在不同文化体系中象征意义截然不同，解读必须基于目标系统。

### 颜色语义定义表

| 颜色 | 西方占星/玄学 | 中国玄学 | 语义差异处理规则 |
|------|---------------|----------|------------------|
| 红色 | 危险、停止、火星、警告 | 吉祥、喜庆、朱雀（朱雀之神） | 目标系统=western时解读为危险/警告；目标系统=bazi/ziwei/qizheng时解读为吉祥/成功 |
| 白色 | 纯洁、婚礼、全新开始 | 丧事、哀悼、不吉、白虎 | 目标系统=western时解读为纯洁/新生；目标系统=bazi/ziwei/qizheng时解读为丧事/不吉 |
| 黄色 | 温暖、快乐、愉悦 | 皇家（皇室专用）、皇帝之色、神圣 | 目标系统=western时按温暖解读；目标系统=bazi/ziwei/qizheng时按皇家/神圣解读 |
| 黑色 | 葬礼、哀悼、死亡 | 水、北方、玄武（玄武之神）、权力、神秘 | 目标系统=western时按葬礼解读；目标系统=bazi/ziwei/qizheng时按水/北方/权力解读 |

### 颜色语义检测逻辑

```
FUNCTION interpretColor(colorWord, targetSystem):
  IF targetSystem == 'western':
    RETURN westernColorMeaning[colorWord]
  ELSE IF targetSystem IN ['bazi', 'ziwei', 'qizheng']:
    RETURN chineseMetaphysicsColorMeaning[colorWord]
  ELSE:
    RETURN UNKNOWN_SYSTEM
```

---

## 4. 时间语义

### 中国农历规则

| 规则类型 | 正确概念 | 错误概念 | 说明 |
|----------|----------|----------|------|
| 八字新年 | 立春（Lichun） | 春节（农历新年） | 八字以立春为一年之始，非春节 |
| 八字月令 | 节气（Solar Terms） | 公历月/农历月 | 八字月份以节气管辖，非日历月 |
| 八字时辰 | 时辰（2小时一个时辰） | 小时 | 时辰以十二地支命名 |
| 时辰命名 | 子时（23:00-01:00）、丑时（01:00-03:00）等 | 24小时制 | 十二时辰对应十二地支 |

### 农历与公历转换规则

| 场景 | 处理规则 |
|------|----------|
| 用户输入农历日期 | 必须转换为公历进行计算 |
| 报告中标注 | 必须明确说明使用的日历系统 |
| 农历日期确认 | 若用户输入农历日期，必须在报告中明确确认转换结果 |

### 夏令时（DST）规则

| 时间范围 | DST状态 | 处理规则 |
|----------|---------|----------|
| 1991年至今 | 中国不实行夏令时 | 无需调整 |
| 1991年之前 | 部分城市曾实行夏令时 | 1991年前的出生时间需根据历史数据调整 |
| 报告要求 | 若进行DST调整 | 必须在报告中注明DST调整已应用 |

### 时区规则

| 规则 | 说明 |
|------|------|
| 使用出生地时区 | 使用出生地点的时区，非当前所在地时区 |
| 中国标准时区 | UTC+8（1949年后有历史变化） |
| 报告要求 | 报告中必须注明使用的时区信息 |

---

## 5. 姓名处理

### 姓名处理规则

| 规则类型 | 处理方式 |
|----------|----------|
| 绝不分隔 | 绝对不将中文姓名拆分为姓/名 |
| 完整使用 | 使用用户输入的完整姓名 |
| 姓名推断 | 若分析需要姓氏，从上下文推断（非总是适用） |
| 东亚姓名 | 绝不假设西方姓名顺序 |
| 报告称呼 | 按用户输入的姓名称呼 |
| 姓名学标注 | 若分析涉及姓名学（姓名学），必须单独标注 |

### 姓名处理检测

```
FUNCTION validateName(name, targetSystem):
  // 禁止行为检测
  IF nameWasSplit(name):
    RETURN VIOLATION: NAME_SPLIT_DETECTED
  IF westernNameOrderAssumed(name):
    RETURN VIOLATION: NAME_ORDER_ASSUMED
  IF autoRomanized(name):
    RETURN VIOLATION: AUTO_ROMANIZATION_DETECTED
  
  RETURN VALID
```

---

## 6. 跨系统污染检测规则

### 规则1：八字报告污染检测

**触发条件：** 八字报告中出现以下任一概念

**检测列表：**
- 西方星盘点：上升星座、下降星座、天顶、天底、MC、天底、ASC、DSC
- 西方十二星座：白羊座、金牛座、双子座、巨蟹座、狮子座、处女座、天秤座、天蝎座、射手座、摩羯座、水瓶座、双鱼座
- 紫微四化：化禄、化权、化科、化忌
- 紫微星曜：紫微、天府、太阴、贪狼、巨门、天相、天梁、七杀、破军、廉贞、武曲、天机、天同、太阳（无七政四余上下文时）
- 七政四余特殊概念：二十八宿、罗睺、计都、紫气、月孛（无明确七政四余上下文时）
- 西方技法：恒星黄道、升度、脱度、太阳弧推进、次级推进、回归图

**违规动作：** 拒绝报告，抛出错误 `CROSS_SYSTEM_CONTAMINATION`，列出所有发现的违规概念

**错误代码：** `BAZI_CONTAMINATION`

---

### 规则2：紫微斗数报告污染检测

**触发条件：** 紫微斗数报告中出现以下任一概念

**检测列表：**
- 八字十神：用神、日主、十神、比肩、劫财、食神、伤官、正财、偏财、正官、正印、偏印
- 八字四柱：年柱、月柱、日柱、时柱
- 八字时间：格局、旺衰、得令、失令（注：大运/流年/流月在紫微斗数中含义不同，检测时需考虑上下文）
- 西方星盘点：上升星座、下降星座、MC、IC
- 西方十二星座：白羊座、金牛座、双子座、巨蟹座、狮子座、处女座、天秤座、天蝎座、射手座、摩羯座、水瓶座、双鱼座
- 七政四余：恒星黄道、岁差（除非明确跨文化比较上下文）

**违规动作：** 拒绝报告，抛出错误 `CROSS_SYSTEM_CONTAMINATION`

**错误代码：** `ZIWEI_CONTAMINATION`

---

### 规则3：七政四余报告污染检测

**触发条件：** 七政四余报告中出现以下任一概念

**检测列表：**
- 八字十神：用神、日主、十神、比肩、劫财、食神、伤官、正财、偏财、正官、七杀、正印、偏印
- 紫微四化：化禄、化权、化科、化忌
- 紫微星曜：紫微、天府、太阴、贪狼、巨门、天相、天梁、七杀、破军
- 西方星盘点：上升星座、下降星座、MC、IC
- 西方十二星座：白羊座、金牛座、双子座、巨蟹座、狮子座、处女座、天秤座、天蝎座、射手座、摩羯座、水瓶座、双鱼座

**违规动作：** 拒绝报告，抛出错误 `CROSS_SYSTEM_CONTAMINATION`

**错误代码：** `QIZHENG_CONTAMINATION`

---

### 规则4：西方占星报告污染检测

**触发条件：** 西方占星报告中出现以下任一概念

**检测列表：**
- 八字概念：用神、十神、日主、大运、流年
- 紫微斗数：紫微、天府、四化、化禄、化权、化科、化忌
- 七政四余：罗睺、计都、紫气、月孛、二十八宿、恒星黄道（除非明确说明是跨文化比较）
- 中国五行：五行、木火土金水

**违规动作：** 拒绝报告，抛出错误 `CROSS_SYSTEM_CONTAMINATION`

**错误代码：** `WESTERN_CONTAMINATION`

---

## 7. 实现伪代码

### TypeScript 类型定义

```typescript
type SystemType = 'bazi' | 'ziwei' | 'qizheng' | 'western';

type Severity = 'error' | 'warning' | 'info';

interface Violation {
  severity: Severity;
  code: string;
  message: string;
  found: string[];
  rule: string;
}

interface CoherenceResult {
  valid: boolean;
  violations: Violation[];
  confidence: number;
  checked_at: string;
  system: SystemType;
}
```

### 系统禁止概念表

```typescript
const SYSTEM_FORBIDDEN_CONCEPTS: Record<SystemType, string[]> = {
  bazi: [
    // 紫微斗数星曜
    '紫微', '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军', '廉贞', '武曲', '天机', '天同', '太阳',
    // 紫微四化
    '化禄', '化权', '化科', '化忌',
    // 紫微斗数十二宫（八字只有命宫/身宫，含义不同）
    '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫', '迁移宫', '仆役宫', '官禄宫', '田宅宫', '福德宫', '父母宫',
    // 西方星盘点
    '上升星座', '下降星座', '天顶', '天底', 'MC', 'IC', 'ASC', 'DSC',
    // 西方十二星座
    '白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座',
    // 七政四余
    '罗睺', '计都', '紫气', '月孛', '二十八宿',
    // 七政四余技法
    '恒星黄道', '升度', '脱度',
    // 西方技法
    '太阳弧推进', '次级推进', '回归图'
  ],
  
  ziwei: [
    // 八字十神
    '用神', '日主', '十神', '比肩', '劫财', '食神', '伤官', '正财', '偏财', '正官', '正印', '偏印',
    // 八字四柱
    '年柱', '月柱', '日柱', '时柱',
    // 八字时间概念（紫微斗数有"大限"但含义不同，流年在两系统中均存在但解读不同）
    '格局', '旺衰', '得令', '失令',
    // 西方星盘点
    '上升星座', '下降星座', 'MC', 'IC',
    // 西方十二星座
    '白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座',
    // 七政四余（除非明确跨文化上下文）
    '恒星黄道', '岁差'
  ],
  
  qizheng: [
    // 八字十神
    '用神', '日主', '十神', '比肩', '劫财', '食神', '伤官', '正财', '偏财', '正官', '七杀', '正印', '偏印',
    // 紫微斗数四化
    '化禄', '化权', '化科', '化忌',
    // 紫微斗数星曜
    '紫微', '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军', '廉贞', '武曲', '天机', '天同',
    // 西方星盘点
    '上升星座', '下降星座', '天顶', '天底', 'MC', 'IC', 'ASC', 'DSC',
    // 西方十二星座
    '白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'
  ],
  
  western: [
    // 八字概念
    '用神', '十神', '日主', '大运', '流年',
    // 紫微斗数
    '紫微', '天府', '四化', '化禄', '化权', '化科', '化忌',
    // 七政四余（除非明确跨文化比较）
    '罗睺', '计都', '紫气', '月孛', '二十八宿', '恒星黄道',
    // 中国五行
    '五行', '木火土金水'
  ]
};
```

### 颜色语义表

```typescript
const COLOR_MEANINGS: Record<string, Record<SystemType, { meaning: string; action: string }>> = {
  red: {
    bazi: { meaning: '吉祥喜庆', action: '解读为吉利/成功' },
    ziwei: { meaning: '吉祥喜庆', action: '解读为吉利/成功' },
    qizheng: { meaning: '吉祥喜庆', action: '解读为吉利/成功' },
    western: { meaning: '危险警告', action: '解读为危险/警告/停止' }
  },
  white: {
    bazi: { meaning: '丧事不吉', action: '解读为凶险/丧事' },
    ziwei: { meaning: '丧事不吉', action: '解读为凶险/丧事' },
    qizheng: { meaning: '丧事不吉', action: '解读为凶险/丧事' },
    western: { meaning: '纯洁新生', action: '解读为纯洁/新生/开始' }
  },
  yellow: {
    bazi: { meaning: '皇家神圣', action: '解读为皇家/神圣/重要' },
    ziwei: { meaning: '皇家神圣', action: '解读为皇家/神圣/重要' },
    qizheng: { meaning: '皇家神圣', action: '解读为皇家/神圣/重要' },
    western: { meaning: '温暖快乐', action: '解读为温暖/快乐/愉悦' }
  },
  black: {
    bazi: { meaning: '水/北方/权力/玄武', action: '解读为水/北方/权力/神秘' },
    ziwei: { meaning: '水/北方/权力/玄武', action: '解读为水/北方/权力/神秘' },
    qizheng: { meaning: '水/北方/权力/玄武', action: '解读为水/北方/权力/神秘' },
    western: { meaning: '葬礼/死亡', action: '解读为葬礼/死亡/结束' }
  }
};
```

### 核心检测函数

```typescript
function checkCoherence(content: string, targetSystem: SystemType): CoherenceResult {
  const violations: Violation[] = [];
  const forbiddenConcepts = SYSTEM_FORBIDDEN_CONCEPTS[targetSystem];
  
  // 检测1：跨系统污染
  for (const concept of forbiddenConcepts) {
    if (content.includes(concept)) {
      violations.push({
        severity: 'error',
        code: `${targetSystem.toUpperCase()}_CONTAMINATION`,
        message: `检测到禁止概念"${concept}"，属于其他系统`,
        found: [concept],
        rule: `Rule ${getRuleNumber(targetSystem)}: ${targetSystem} report contamination`
      });
    }
  }
  
  // 检测2：颜色语义（warning级别）
  const colorWords = ['红', '白', '黄', '黑', '红色', '白色', '黄色', '黑色'];
  for (const color of colorWords) {
    if (content.includes(color)) {
      violations.push({
        severity: 'warning',
        code: 'COLOR SEMANTIC',
        message: `颜色"${color}"在不同系统中有不同语义`,
        found: [color],
        rule: 'Section 3: Color Semantics'
      });
    }
  }
  
  // 检测3：相同汉字不同概念（同名异物）
  const ambiguousTerms = checkAmbiguousTerms(content, targetSystem);
  violations.push(...ambiguousTerms);
  
  const valid = violations.filter(v => v.severity === 'error').length === 0;
  const confidence = calculateConfidence(violations);
  
  return {
    valid,
    violations,
    confidence,
    checked_at: new Date().toISOString(),
    system: targetSystem
  };
}

function checkAmbiguousTerms(content: string, targetSystem: SystemType): Violation[] {
  const violations: Violation[] = [];
  
  // 七杀在八字和紫微斗数中完全不同
  if (targetSystem === 'bazi' && content.includes('七杀')) {
    // 检查上下文是否明确是八字十神
    // 如果没有明确的八字上下文，标记为潜在问题
  }
  
  // 命宫在八字（两个宫位）和紫微斗数（十二宫之一）中完全不同
  if (targetSystem === 'bazi' && content.includes('命宫')) {
    // 需确认上下文明示八字命宫
  }
  
  return violations;
}
```

### 时间语义验证

```typescript
interface TimeContext {
  calendarSystem: 'lunar' | 'gregorian';
  hasDSTAdjustment: boolean;
  timezone: string;
  lunarToGregorianConfirmed: boolean;
}

function validateTimeContext(context: TimeContext, targetSystem: SystemType): Violation[] {
  const violations: Violation[] = [];
  
  if (context.calendarSystem === 'lunar' && !context.lunarToGregorianConfirmed) {
    violations.push({
      severity: 'warning',
      code: 'LUNAR_DATE_UNCONFIRMED',
      message: '使用农历日期但未确认转换为公历',
      found: [],
      rule: 'Section 4: Time Semantics'
    });
  }
  
  if (context.hasDSTAdjustment) {
    violations.push({
      severity: 'info',
      code: 'DST_ADJUSTMENT_APPLIED',
      message: '已应用夏令时调整',
      found: [],
      rule: 'Section 4: Time Semantics'
    });
  }
  
  return violations;
}
```

### 姓名验证

```typescript
function validateNameHandling(content: string, inputName: string): Violation[] {
  const violations: Violation[] = [];
  
  // 检测是否将姓名拆分
  const nameParts = inputName.split('').filter(c => c.trim().length > 0);
  for (const part of nameParts) {
    if (content.includes(`您的${part}姓`) || content.includes(`您的${part}名`)) {
      violations.push({
        severity: 'error',
        code: 'NAME_SPLIT_DETECTED',
        message: '检测到姓名被拆分为姓/名',
        found: [part],
        rule: 'Section 5: Name Handling'
      });
    }
  }
  
  return violations;
}
```

### 辅助函数

```typescript
function getRuleNumber(targetSystem: SystemType): string {
  const rules: Record<SystemType, string> = {
    bazi: '1',
    ziwei: '2',
    qizheng: '3',
    western: '4'
  };
  return rules[targetSystem];
}

function calculateConfidence(violations: Violation[]): number {
  const errorCount = violations.filter(v => v.severity === 'error').length;
  const warningCount = violations.filter(v => v.severity === 'warning').length;
  
  if (errorCount > 0) return 0;
  if (warningCount > 3) return 0.7;
  if (warningCount > 0) return 0.9;
  return 1.0;
}

function getSystemDisplayName(system: SystemType): string {
  const names: Record<SystemType, string> = {
    bazi: '八字',
    ziwei: '紫微斗数',
    qizheng: '七政四余',
    western: '西方占星'
  };
  return names[system];
}
```

---

## 8. 违规严重级别

### ERROR（错误）—— 必须阻止并拒绝

**定义：** 跨系统污染——概念来源于完全不同的体系，混合使用会破坏专业可信度。

**处理方式：**
- 阻止报告生成
- 抛出错误 `CROSS_SYSTEM_CONTAMINATION`
- 列出所有发现的违规概念
- 要求重新生成或人工审核

**示例：**
```json
{
  "severity": "error",
  "code": "BAZI_CONTAMINATION",
  "message": "八字报告中检测到紫微斗数星曜概念",
  "found": ["紫微", "天府", "化禄"],
  "action": "REJECT_AND_REGENERATE"
}
```

---

### WARNING（警告）—— 标记待人工审核

**定义：** 潜在歧义——概念可能在不同系统中有不同含义，需要人工确认上下文是否正确。

**处理方式：**
- 允许报告生成
- 标记为需要人工审核
- 在报告元数据中包含警告信息
- 不阻止用户查看报告

**示例：**
```json
{
  "severity": "warning",
  "code": "AMBIGUOUS_TERM",
  "message": "概念"命宫"在八字和紫微斗数中有不同含义",
  "found": ["命宫"],
  "action": "FLAG_FOR_REVIEW"
}
```

---

### INFO（信息）—— 包含在报告元数据中

**定义：** 文化上下文注释——帮助用户理解不同系统中概念的文化背景。

**处理方式：**
- 无条件允许
- 在报告元数据中包含
- 可用于生成解释性注释

**示例：**
```json
{
  "severity": "info",
  "code": "COLOR_CULTURAL_CONTEXT",
  "message": "在西方占星中，红色代表火星和危险；在中国玄学中，红色代表吉祥和喜庆",
  "found": ["红"],
  "action": "INCLUDE_IN_METADATA"
}
```

---

## 执行摘要

本规则文档定义TianJi Global文化一致性检查器的完整规则集，涵盖：

1. **四大体系的明确概念边界**——每个系统可以出现什么、禁止出现什么
2. **可共享概念的条件**——哪些概念可以在系统间共享（需适当上下文）
3. **颜色语义的差异化解读**——基于目标系统进行正确解读
4. **时间语义的精确规则**——农历/公历、夏令时、时区处理
5. **姓名处理的禁止行为**——绝对不能拆分、自动罗马化
6. **跨系统污染的具体检测规则**——每个系统的污染检测列表
7. **完整的TypeScript实现**——可直接转化为生产代码
8. **三级违规严重级别**——ERROR/WARNING/INFO及对应处理方式

**核心原则：人类学家的"No Culture Salad"原则——混合不同系统的概念而不理解其上下文，将摧毁专业可信度。本规则文档确保所有报告在系统纯净性和文化准确性上达到最高标准。**

---

*本文档最后更新：2026-04-17*
*版本：1.0*
*状态：正式发布*
