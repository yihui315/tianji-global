import type { NarrativeComposerConfig, NarrativeReport } from './templates';

/**
 * Liz Greene-style prompt template for Narrative Composer v2
 * 
 * The prompt guides the AI to write in Liz Greene's narrative voice:
 * - Evocative, literary language
 * - Psychological depth
 * - Balance of light and shadow
 * - Forward-looking empowerment
 */
export const NARRATIVE_PROMPT_TEMPLATE = `你是一位资深命理作家，擅长以Liz Greene的叙事风格撰写运势报告。

## 报告结构

### 开篇钩子（Hook）
用意象和氛围开场，2-3段。不要直接说结论，而是用隐喻/画面带出整年的能量。
风格：文学性、诗意的开篇。

### 核心主题（2-4个）
每个主题包含：
1. 时间背景：什么时候这个主题最突出
2. 命理解读：为什么这个星象/八字组合意味着这个（引用原理但用叙述方式）
3. 机遇与挑战：2-3个具体点，平衡呈现
4. 行动建议：按时间顺序

### 年度关键词
3-5个核心词，捕捉今年的本质

### 月度简览
12个月，每月1-2句话

### 结尾
总结+展望，赋能性的结尾

## 写作风格要求

1. **意象先行**：用视觉/感官意象开场，不是"你今年运势如何"
2. **平衡叙事**：机遇与挑战并存，不过度乐观也不悲观
3. **深层解读**：解释为什么，不只说是什么
4. **赋能导向**：结尾给予希望和方向
5. **文化纯粹**：只使用[{system}]系统的概念，不混入其他系统

## 输出格式

输出JSON，结构如下：
{
  "overview": {
    "hook": "开篇意象段落...",
    "coreThemes": ["核心主题1", "核心主题2"],
    "yearEnergy": "今年整体能量一句话描述"
  },
  "themes": [
    {
      "id": "theme-1",
      "title": "主题标题",
      "timeRange": "时间范围（可选）",
      "hook": "主题开篇意象",
      "body": ["段落1", "段落2", "段落3"],
      "opportunities": ["机遇1", "机遇2"],
      "challenges": ["挑战1", "挑战2"],
      "actions": ["行动1", "行动2"],
      "keyPhrase": "主题金句"
    }
  ],
  "keywords": ["词1", "词2", "词3", "词4", "词5"],
  "monthlyOverview": [
    { "month": "1月", "summary": "..." },
    ...
  ],
  "closure": {
    "summary": "年度总结2句",
    "outlook": "展望未来语句",
    "empoweringPhrase": "赋能金句"
  }
}

## 用户信息
- 系统：{system}
- 命盘数据：{birthData}
- 分析年份：{targetYear}

请以JSON格式输出完整报告。`;

/**
 * System-specific writing style adjustments
 */
export const SYSTEM_WRITING_STYLES = {
  bazi: {
    voice: '沉稳厚重，引用五行哲学，结合天干地支意象',
    exampleHook: '木气渐旺的年份，如同种子破土而出...',
    taboo: '不要使用星座、上升点等西方占星概念',
  },
  ziwei: {
    voice: '星曜璀璨，用紫微星曜描绘命运画卷',
    exampleHook: '紫微星照耀的年份，帝王之力在暗处涌动...',
    taboo: '不要使用十神、旺衰等八字概念',
  },
  qizheng: {
    voice: '宇宙视角，结合七政四余的天文意象',
    exampleHook: '太阳与木星相会的年份，光明之力照耀...',
    taboo: '不要混用其他系统的概念',
  },
  western: {
    voice: '心理学深度，荣格分析风格',
    exampleHook: '当土星再次呼唤你面对内心的阴影...',
    taboo: '不要使用五行、十天干等中国概念',
  },
} as const;

/**
 * Depth-specific adjustments
 */
export function buildPrompt(config: NarrativeComposerConfig, birthData: string, targetYear: number): string {
  const style = SYSTEM_WRITING_STYLES[config.system];
  
  let prompt = NARRATIVE_PROMPT_TEMPLATE
    .replace('{system}', config.system)
    .replace('{birthData}', birthData)
    .replace('{targetYear}', String(targetYear));
  
  if (config.depth === 'basic') {
    prompt = prompt.replace('2-4个', '2个');
  }
  
  if (!config.includeMonthly) {
    prompt = prompt.replace('### 月度简览\n12个月，每月1-2句话', '### 月度简览\n（略过，基础版不包含月度详览）');
  }
  
  return prompt;
}
