/**
 * AI Narrative Script Generation Engine
 * 天机全球 — 情感化叙事脚本生成
 *
 * 功能:
 * 1. 基于八字生成个性化叙事脚本
 * 2. 情感化表达（共鸣感、沉浸感）
 * 3. 多场景支持（命运解读、年度运势、每日提示）
 */

export type NarrativeStyle = 'poetic' | 'warm' | 'mysterious' | 'philosophical' | 'practical';
export type NarrativeScene = 'fortune_telling' | 'yearly_reading' | 'daily_tip' | 'relationship_insight' | 'career_guidance';

// ==================== 叙事风格模板 ====================

interface NarrativeTemplate {
  opening: Record<NarrativeStyle, string>;
  body: Record<NarrativeStyle, string>;
  closing: Record<NarrativeStyle, string>;
  emotionalTone: string;
}

const NARRATIVE_TEMPLATES: Record<NarrativeScene, NarrativeTemplate> = {
  fortune_telling: {
    opening: {
      poetic: '在星辰交汇的刹那，命运的织锦缓缓展开...',
      warm: '亲爱的主人，命盘已为您呈现，让我为您细细解读...',
      mysterious: '迷雾散去，真相浮现——您八字中的密码正在被解码...',
      philosophical: '人生如河，命如舟楫。今日我们一同审视您的命运之河...',
      practical: '根据您的八字信息，以下是今日运势要点。'
    },
    body: {
      poetic: '✨ {{element}}星曜闪烁，{{pillar}}柱显灵...',
      warm: '🌟 您的{{element}}能量很强，这代表着您有{{strength}}的天赋...',
      mysterious: '🔮 在{{direction}}的方向，命运之门正在开启...',
      philosophical: '🌿 万物皆有其规律，您今日的{{aspect}}运势遵循五行之道...',
      practical: '📌 今日{{aspect}}运势评分：{{score}}/100，建议{{advice}}。'
    },
    closing: {
      poetic: '星辰的低语已传达，愿您在命运长河中找到属于自己的光。',
      warm: '希望这些解读能帮助您。记住，真正的力量来自您自己的选择 💫',
      mysterious: '命运的迷雾暂时散去，但星盘的变化永不停歇...',
      philosophical: '知命而行，顺势而为。愿您每日都有新的领悟。',
      practical: '以上是今日运势总结。明日同一时刻，星盘将呈现新的可能。'
    },
    emotionalTone: 'contemplative'
  },

  yearly_reading: {
    opening: {
      poetic: '春去秋来，岁月轮回——新的一年，命运赐予您新的可能。',
      warm: '新的一年到来了！我为您准备了专属的年度运势解读 🌟',
      mysterious: '时间之门开启，过去一年的经验将成为您的养分...',
      philosophical: '年年岁岁花相似，岁岁年年人不同。您的年度运势正在展开...',
      practical: '以下是基于您八字推算的年度运势分析。'
    },
    body: {
      poetic: '🌙 在{{month}}月，{{event}}将成为您命运的转折点...',
      warm: '💝 这一年，您的{{aspect}}运势特别旺盛，尤其在{{month}}月...',
      mysterious: '⚡ 命运的齿轮在转动：{{month}}月将迎来{{event}}的契机...',
      philosophical: '☯️ 阴阳交替，五行流转——{{month}}月的{{aspect}}需要特别关注...',
      practical: '📅 重点关注：{{month}} ({{event}}) | 运势评分：{{score}}/100'
    },
    closing: {
      poetic: '愿您在这一年如星辰般璀璨，命运之书每一页都写满精彩。',
      warm: '这一年充满了机遇！勇敢迈步，我会一直陪伴您 💕',
      mysterious: '命运的谜题已部分揭开，但答案还在您手中书写...',
      philosophical: '年年皆风景，岁岁皆成长。愿您这一年圆满自在。',
      practical: '以上是年度运势概览。如需深入分析，请随时询问。'
    },
    emotionalTone: 'hopeful'
  },

  daily_tip: {
    opening: {
      poetic: '清晨的第一缕星光，为您带来今日的指引...',
      warm: '早安！☀️ 今日的星象为您准备了小小的惊喜...',
      mysterious: '当黎明破晓，命运的微光已为您点亮今日之路...',
      philosophical: '每日三省吾身，今日请关注您的{{aspect}}...',
      practical: '📋 今日运势速递：{{score}}/100'
    },
    body: {
      poetic: '🌸 {{luckyColor}}色的微光将带来好运，今日宜{{activity}}...',
      warm: '✨ 今日您需要关注{{aspect}}，这将为您带来{{outcome}}...',
      mysterious: '🔑 今日关键词：{{keyword}}。当您遇到{{situation}}，记住...',
      philosophical: '☯️ 今日宜静心，{{activity}}将帮助您达到{{outcome}}...',
      practical: '✅ 今日建议：{{advice}} | 幸运方位：{{direction}} | 幸运色：{{color}}'
    },
    closing: {
      poetic: '愿今日的每一刻都如星光般闪耀 🌟',
      warm: '祝您今日顺心如意！有任何问题随时来找我 💫',
      mysterious: '星光已为您点亮前路，但真正的旅程由您主导...',
      philosophical: '一日一悟，日日精进。',
      practical: '记得关注今天的运势变化，明天见！'
    },
    emotionalTone: 'gentle'
  },

  relationship_insight: {
    opening: {
      poetic: '缘起缘灭，皆有定数——让我们一起探讨您命盘中的姻缘密码...',
      warm: '感情的世界是复杂的，但您的八字为您指明了方向 💕',
      mysterious: '两颗星的轨迹正在交汇，命运的姻缘线已若隐若现...',
      philosophical: '相遇是缘，相知是份。在命理的海洋中，我们探讨您的感情之舟...',
      practical: '根据您的八字，以下是感情运势分析。'
    },
    body: {
      poetic: '💫 您的{{element}}能量在感情中表现为{{trait}}，这影响着您的吸引力...',
      warm: '🌹 您的正缘特征：{{trait}}。与您五行相合的伴侣是{{partner}}...',
      mysterious: '⚡ 在{{month}}月，您可能会遇到命中注定的相遇...',
      philosophical: '☯️ 感情之路如流水，过于强势或过于柔顺都不利，关键在于{{balance}}...',
      practical: '📌 感情运势评分：{{score}}/100 | 注意事项：{{warning}}'
    },
    closing: {
      poetic: '愿您早日找到那个与您星盘相映的人 🌟',
      warm: '感情需要经营，也需要缘分。您值得被好好珍惜 💝',
      mysterious: '姻缘天定，但选择权在您手中...',
      philosophical: '知命而不认命，在感情中同样适用。',
      practical: '如有更多感情问题，欢迎继续咨询。'
    },
    emotionalTone: 'romantic'
  },

  career_guidance: {
    opening: {
      poetic: '事业的星轨正在运行，让我们的解读照亮您的职业之路...',
      warm: '职场如战场，但您有独特的优势！让我为您分析 🌟',
      mysterious: '在事业的迷宫中，您的八字是那盏指引的灯...',
      philosophical: '职业不仅是谋生，更是实现人生价值的途径。让我们一起探索...',
      practical: '以下是基于您八字的职业发展建议。'
    },
    body: {
      poetic: '🌟 {{element}}能量在职场中表现为{{strength}}，这是您的制胜法宝...',
      warm: '💼 您最适合在{{industry}}行业发展，您的天赋在于{{talent}}...',
      mysterious: '⚡ 在{{time}}前后，将有一个重要的职业机会出现...',
      philosophical: '☯️ 事业如登山，您的五行决定了最适合您的登山路径...',
      practical: '📌 事业发展建议：{{advice}} | 最佳方向：{{direction}} | 重点月份：{{month}}'
    },
    closing: {
      poetic: '愿您的事业如星辰般照耀四方 ✨',
      warm: '相信自己，您的天赋会让您发光发热 💪',
      mysterious: '命运的齿轮已为您转动，把握机会吧...',
      philosophical: '知行合一，方能在事业中达到圆满。',
      practical: '如需深入的职业规划分析，请告诉我您的具体目标。'
    },
    emotionalTone: 'motivating'
  }
};

// ==================== 五行元素描述 ====================

const ELEMENT_NARRATIVE = {
  '木': {
    symbol: '🌿',
    metaphor: '如一棵向上生长的树',
    strength: '创造力和适应力',
    careerDirection: '东方',
    luckyColor: '绿色',
    personality: '仁慈而富有理想',
    seasons: ['春', '早晨'],
    directions: ['东方', '东南方'],
    compatibleElements: ['水', '火'],
    growthStory: '从种子到参天大树的蜕变'
  },
  '火': {
    symbol: '🔥',
    metaphor: '如一团燃烧的火焰',
    strength: '热情和领导力',
    careerDirection: '南方',
    luckyColor: '红色',
    personality: '热情而充满能量',
    seasons: ['夏', '中午'],
    directions: ['南方', '东南方'],
    compatibleElements: ['木', '土'],
    growthStory: '从火苗到烈焰的升华'
  },
  '土': {
    symbol: '🏔️',
    metaphor: '如大地承载万物',
    strength: '稳定和诚信',
    careerDirection: '中央',
    luckyColor: '黄色',
    personality: '稳重而值得信赖',
    seasons: ['季夏', '傍晚'],
    directions: ['中央', '东北方', '西南方'],
    compatibleElements: ['火', '金'],
    growthStory: '从泥土到山川的积淀'
  },
  '金': {
    symbol: '⚔️',
    metaphor: '如一把精工锻造的利剑',
    strength: '果断和正义感',
    careerDirection: '西方',
    luckyColor: '白色',
    personality: '刚毅而明辨是非',
    seasons: ['秋', '傍晚'],
    directions: ['西方', '西北方'],
    compatibleElements: ['土', '水'],
    growthStory: '从矿石到利刃的淬炼'
  },
  '水': {
    symbol: '🌊',
    metaphor: '如一条流动的河流',
    strength: '智慧和灵活性',
    careerDirection: '北方',
    luckyColor: '蓝色',
    personality: '灵动而富有智慧',
    seasons: ['冬', '夜晚'],
    directions: ['北方', '西北方'],
    compatibleElements: ['金', '木'],
    growthStory: '从溪流到大海的汇聚'
  }
};

// ==================== 叙事脚本生成器 ====================

interface NarrativeInput {
  bazi: {
    dayHeavenlyStem: string;
    dayMasterElement: string;
    gender?: string;
    year?: string;
    month?: string;
    day?: string;
    hour?: string;
  };
  scene: NarrativeScene;
  style?: NarrativeStyle;
  language?: 'zh' | 'en';
  additionalContext?: {
    month?: string;
    score?: number;
    aspect?: string;
    advice?: string;
    [key: string]: string | number | undefined;
  };
}

interface NarrativeOutput {
  script: string;
  meta: {
    scene: NarrativeScene;
    style: NarrativeStyle;
    element: string;
    emotionalTone: string;
    estimatedReadingTime: string;
  };
}

export function generateNarrativeScript(input: NarrativeInput): NarrativeOutput {
  const { bazi, scene, style = 'warm', language = 'zh', additionalContext = {} } = input;
  const template = NARRATIVE_TEMPLATES[scene];
  const element = bazi.dayMasterElement || '木';
  const elementData = ELEMENT_NARRATIVE[element as keyof typeof ELEMENT_NARRATIVE] || ELEMENT_NARRATIVE['木'];

  // 构建替换变量
  const variables = {
    element: element,
    pillar: bazi.dayHeavenlyStem,
    symbol: elementData.symbol,
    strength: elementData.strength,
    trait: elementData.personality,
    direction: elementData.careerDirection,
    color: elementData.luckyColor,
    month: (additionalContext.month as string) || '本月',
    score: (additionalContext.score as number) || 75,
    aspect: (additionalContext.aspect as string) || '综合',
    advice: (additionalContext.advice as string) || '保持积极心态',
    event: (additionalContext.event as string) || '重要转变',
    activity: (additionalContext.activity as string) || '冥想',
    outcome: (additionalContext.outcome as string) || '内心平静',
    keyword: (additionalContext.keyword as string) || '突破',
    situation: (additionalContext.situation as string) || '关键时刻',
    warning: (additionalContext.warning as string) || '避免冲动',
    industry: (additionalContext.industry as string) || '文化创意',
    talent: (additionalContext.talent as string) || '沟通能力',
    time: (additionalContext.time as string) || '秋季',
    balance: (additionalContext.balance as string) || '刚柔并济',
    partner: (additionalContext.partner as string) || '火性或土性',
    luckyColor: elementData.luckyColor,
    growthStory: elementData.growthStory
  };

  // 替换模板中的变量
  const replaceVariables = (text: string): string => {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key as keyof typeof variables]?.toString() || match;
    });
  };

  // 生成开场
  const opening = replaceVariables(template.opening[style]);

  // 生成正文 — 根据场景定制
  let body = replaceVariables(template.body[style]);

  // 根据不同场景增加个性化内容
  if (scene === 'fortune_telling') {
    body += `\n\n${elementData.symbol} **您的命盘核心**: ${element}性`;
    body += `\n${elementData.metaphor}，这意味着您天生具备${elementData.strength}。`;
    body += `\n\n📍 **幸运方向**: ${elementData.directions.join('、')}`;
    body += `\n🎨 **幸运色彩**: ${elementData.luckyColor}`;
    body += `\n🌱 **成长主题**: ${elementData.growthStory}`;
  }

  // 生成结语
  const closing = template.closing[style];

  // 组合完整脚本
  const script = `${opening}\n\n${body}\n\n${closing}`;

  // 计算预估阅读时间
  const wordCount = script.length;
  const readingTime = language === 'zh'
    ? `${Math.ceil(wordCount / 400)}分钟`
    : `${Math.ceil(wordCount / 200)} min`;

  return {
    script,
    meta: {
      scene,
      style,
      element,
      emotionalTone: template.emotionalTone,
      estimatedReadingTime: readingTime
    }
  };
}

// ==================== 快速生成器 ====================

export function generateQuickNarrative(
  element: string,
  scene: NarrativeScene,
  language: 'zh' | 'en' = 'zh'
): string {
  const input: NarrativeInput = {
    bazi: { dayHeavenlyStem: '甲', dayMasterElement: element },
    scene,
    style: 'warm',
    language
  };

  const { script } = generateNarrativeScript(input);
  return script;
}

// ==================== 批量生成器 ====================

export function generateBatchNarratives(
  bazi: { dayHeavenlyStem: string; dayMasterElement: string; gender?: string },
  scenes: NarrativeScene[],
  style: NarrativeStyle = 'warm',
  language: 'zh' | 'en' = 'zh'
): NarrativeOutput[] {
  return scenes.map(scene => generateNarrativeScript({
    bazi,
    scene,
    style,
    language
  }));
}

// ==================== 导出类型 ====================

export type { NarrativeInput, NarrativeOutput };
