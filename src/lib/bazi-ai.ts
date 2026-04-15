/**
 * BaZi AI 增强版 API
 *
 * 升级内容:
 * 1. AI多轮对话支持
 * 2. 情感共鸣解读
 * 3. What-If情境模拟
 */

interface BaZiInput {
  birthDate: string;
  birthTime: string;
  gender?: 'male' | 'female';
  language?: 'zh' | 'en';
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  id: string;
  messages: ChatMessage[];
  baziData: BaZiInput;
  createdAt: Date;
}

// ==================== 命理知识库 ====================

const ELEMENT_ANALYSIS = {
  木: {
    strength: ['创造力', '仁慈', '生长力'],
    weakness: ['固执', '优柔寡断'],
    career: ['教育', '文化', '艺术', '宗教'],
    color: '绿色',
    direction: '东方'
  },
  火: {
    strength: ['热情', '领导力', '执行力'],
    weakness: ['急躁', '易怒'],
    career: ['能源', '餐饮', '娱乐', '销售'],
    color: '红色',
    direction: '南方'
  },
  土: {
    strength: ['稳重', '诚信', '耐心'],
    weakness: ['保守', '固执'],
    career: ['房地产', '农业', '物流', '政府'],
    color: '黄色',
    direction: '中央'
  },
  金: {
    strength: ['果断', '正义感', '执行力'],
    weakness: ['冷酷', '批判性'],
    career: ['金融', '法律', '工程', '金属'],
    color: '白色',
    direction: '西方'
  },
  水: {
    strength: ['智慧', '灵活', '适应力'],
    weakness: ['善变', '不稳定'],
    career: ['贸易', '咨询', '技术', '媒体'],
    color: '黑色/蓝色',
    direction: '北方'
  }
};

const TEN_GODS = {
  比肩: { desc: '独立自主，竞争合作', relation: '兄弟姐妹，朋友同事' },
  劫财: { desc: '财务竞争，异性缘分', relation: '异性兄弟姐妹，合作伙伴' },
  食神: { desc: '福气智慧，表达能力', relation: '晚辈，学生' },
  伤官: { desc: '才华创意，表现欲望', relation: '晚辈，学生' },
  正财: { desc: '稳健理财，务实积累', relation: '妻子（男命），财星' },
  偏财: { desc: '投资理财，意外之财', relation: '父亲，情人' },
  正官: { desc: '事业地位，规则约束', relation: '丈夫（女命），上司' },
  七杀: { desc: '压力动力，竞争挑战', relation: '小三，男性上司' },
  正印: { desc: '学历名誉，长辈贵人', relation: '母亲，长辈' },
  枭神: { desc: '偏印领悟，直觉神秘', relation: '继母，意外帮助' }
};

// ==================== AI解读引擎 ====================

export function generateBaziInterpretation(bazi: any, language: 'zh' | 'en' = 'zh'): string {
  const dayMaster = bazi.dayHeavenlyStem;
  const element = bazi.dayMasterElement;
  const analysis = ELEMENT_ANALYSIS[element] || {};

  if (language === 'zh') {
    return `
# ${bazi.name} 的八字命盘解读

## 📊 基础信息
- **日主**: ${dayMaster}（${element}性）
- **出生日期**: ${bazi.year}年 ${bazi.month}月 ${bazi.day}日 ${bazi.hour}时

## 🌟 五行分析
您的日主为**${element}性**，代表您天生具有：

**优点**: ${analysis.strength?.join('、') || '待分析'}
**需要注意**: ${analysis.weakness?.join('、') || '待提升'}

## 💼 事业发展
最适合的方向: **${analysis.direction}**（${analysis.color}色）
推荐行业: ${analysis.career?.join('、') || '待定'}

## ❤️ 十神分析
${Object.entries(bazi.tenGods || {}).map(([god, info]: [string, any]) =>
  `- **${god}**: ${TEN_GODS[god]?.desc || ''}（代表${TEN_GODS[god]?.relation || ''}）`
).join('\n')}

## 🔮 流年运势
请继续对话，我可以为您详细分析任意方面的运势。
`;
  }

  return `Your BaZi chart shows Day Master ${dayMaster} (${element}). This indicates...`;
}

// ==================== What-If 情境模拟 ====================

interface WhatIfScenario {
  type: 'career_change' | 'relocation' | 'education' | 'relationship' | 'investment' | 'health';
  title: string;
  titleEn: string;
  impact: 'positive' | 'negative' | 'neutral';
  elementInfluence: string[];
  scoreChange: Record<string, number>;
  description: string;
  descriptionEn: string;
}

const SCENARIOS: Record<string, WhatIfScenario[]> = {
  career_change: [
    {
      type: 'career_change',
      title: '换工作',
      titleEn: 'Career Change',
      impact: 'positive',
      elementInfluence: ['木', '火'],
      scoreChange: { career: 15, wealth: 10, love: -5 },
      description: '您的日主为木性，换到创意/文化行业将大大提升事业运势。',
      descriptionEn: 'Your Day Master is Wood element. Switching to creative/cultural industries will greatly enhance your career fortune.'
    },
    {
      type: 'career_change',
      title: '创业',
      titleEn: 'Start Business',
      impact: 'neutral',
      elementInfluence: ['火', '金'],
      scoreChange: { career: 20, wealth: -10, health: -15 },
      description: '创业带来高回报但也伴随高风险，建议先做小规模尝试。',
      descriptionEn: 'Entrepreneurship brings high returns but also high risks. Consider starting small first.'
    },
    {
      type: 'career_change',
      title: '晋升管理',
      titleEn: 'Management Promotion',
      impact: 'positive',
      elementInfluence: ['土'],
      scoreChange: { career: 18, wealth: 12, health: -8 },
      description: '土性稳重特质适合管理岗位，晋升将带来财富和地位提升。',
      descriptionEn: 'Your Earth element stability makes you suitable for management roles.'
    }
  ],
  relocation: [
    {
      type: 'relocation',
      title: '迁往东方',
      titleEn: 'Move East',
      impact: 'positive',
      elementInfluence: ['木'],
      scoreChange: { career: 12, health: 8 },
      description: '东方为木，您的木性日主在此方向将得到增强。',
      descriptionEn: 'East is Wood direction, which will strengthen your Wood Day Master.'
    },
    {
      type: 'relocation',
      title: '迁往南方',
      titleEn: 'Move South',
      impact: 'neutral',
      elementInfluence: ['火'],
      scoreChange: { career: 15, health: -10 },
      description: '南方火旺，对木性日主有利但需注意心血管健康。',
      descriptionEn: 'South fire is favorable for Wood but watch cardiovascular health.'
    }
  ],
  education: [
    {
      type: 'education',
      title: '深造学习',
      titleEn: 'Further Education',
      impact: 'positive',
      elementInfluence: ['水'],
      scoreChange: { career: 10, wealth: 5 },
      description: '水代表智慧和学习，适合通过教育提升自我。',
      descriptionEn: 'Water represents wisdom and learning. Education will enhance your prospects.'
    }
  ],
  relationship: [
    {
      type: 'relationship',
      title: '结婚',
      titleEn: 'Marriage',
      impact: 'positive',
      elementInfluence: ['土'],
      scoreChange: { love: 25, wealth: -5 },
      description: '土性稳重利于长期关系，结婚将稳定感情运势。',
      descriptionEn: 'Earth stability favors long-term relationships. Marriage will stabilize love fortune.'
    }
  ],
  investment: [
    {
      type: 'investment',
      title: '股票投资',
      titleEn: 'Stock Investment',
      impact: 'neutral',
      elementInfluence: ['金', '水'],
      scoreChange: { wealth: 20, health: -5 },
      description: '金水代表金融活动，财运佳但需控制风险。',
      descriptionEn: 'Metal and Water represent financial activities. Good fortune but manage risk.'
    }
  ],
  health: [
    {
      type: 'health',
      title: '坚持运动',
      titleEn: 'Regular Exercise',
      impact: 'positive',
      elementInfluence: ['木', '火'],
      scoreChange: { health: 20, career: 5 },
      description: '运动增强木火能量，提升整体运势。',
      descriptionEn: 'Exercise enhances Wood and Fire energy, boosting overall fortune.'
    }
  ]
};

export function generateWhatIfAnalysis(
  question: string,
  bazi: any
): { scenarios: WhatIfScenario[]; recommendation: string; recommendationEn: string } {
  const element = bazi.dayMasterElement || '木';
  const dayMaster = bazi.dayHeavenlyStem || '甲';

  // 识别情境类型
  let scenarioType = 'career_change';
  const q = question.toLowerCase();

  if (q.includes('换工作') || q.includes('跳槽') || q.includes('辞职')) {
    scenarioType = 'career_change';
  } else if (q.includes('搬家') || q.includes('迁移') || q.includes('去')) {
    scenarioType = 'relocation';
  } else if (q.includes('学习') || q.includes('读书') || q.includes('深造')) {
    scenarioType = 'education';
  } else if (q.includes('结婚') || q.includes('恋爱') || q.includes('感情')) {
    scenarioType = 'relationship';
  } else if (q.includes('投资') || q.includes('理财') || q.includes('股票')) {
    scenarioType = 'investment';
  } else if (q.includes('健康') || q.includes('运动') || q.includes('养生')) {
    scenarioType = 'health';
  }

  const scenarios = SCENARIOS[scenarioType] || SCENARIOS.career_change;

  // 根据八字调整分数
  const adjustedScenarios = scenarios.map(s => ({
    ...s,
    scoreChange: adjustScoresForBazi(s.scoreChange, element, dayMaster)
  }));

  // 生成推荐
  const positiveScenarios = adjustedScenarios.filter(s => s.impact === 'positive');
  const recommendation = positiveScenarios.length > 0
    ? `根据您的八字分析，${positiveScenarios[0].title}对您最为有利。建议把握时机，勇敢尝试。`
    : '当前时机需要谨慎考虑，建议先做小规模尝试，积累经验后再做决定。';

  const recommendationEn = positiveScenarios.length > 0
    ? `Based on your BaZi chart, ${positiveScenarios[0].titleEn} is most favorable for you. Consider taking action when the timing is right.`
    : 'The current timing requires caution. Consider starting small and gaining experience before making major decisions.';

  return {
    scenarios: adjustedScenarios,
    recommendation,
    recommendationEn
  };
}

function adjustScoresForBazi(
  scores: Record<string, number>,
  element: string,
  dayMaster: string
): Record<string, number> {
  const elementBonus: Record<string, Record<string, number>> = {
    '木': { career: 5, health: 3 },
    '火': { career: 8, health: -3 },
    '土': { wealth: 8, love: 5 },
    '金': { wealth: 10, career: 5 },
    '水': { love: 8, health: 5 }
  };

  const bonus = elementBonus[element] || {};
  const adjusted = { ...scores };

  for (const [key, value] of Object.entries(bonus)) {
    if (key in adjusted) {
      adjusted[key] = Math.min(100, adjusted[key] + value);
    }
  }

  return adjusted;
}

// ==================== 情感共鸣引擎 ====================

interface EmotionProfile {
  primary: 'harmony' | 'growth' | 'security' | 'freedom' | 'belonging';
  intensity: number; // 1-10
  trigger: string;
  triggerEn: string;
}

const EMOTION_PROFILES: Record<string, EmotionProfile> = {
  '木': {
    primary: 'growth',
    intensity: 8,
    trigger: '缺乏成长空间',
    triggerEn: 'Lack of growth space'
  },
  '火': {
    primary: 'freedom',
    intensity: 7,
    trigger: '被压抑的热情',
    triggerEn: 'Suppressed passion'
  },
  '土': {
    primary: 'security',
    intensity: 9,
    trigger: '生活不稳定',
    triggerEn: 'Life instability'
  },
  '金': {
    primary: 'belonging',
    intensity: 6,
    trigger: '不公平待遇',
    triggerEn: 'Unfair treatment'
  },
  '水': {
    primary: 'harmony',
    intensity: 7,
    trigger: '关系冲突',
    triggerEn: 'Relationship conflicts'
  }
};

export function generateEmotionResonance(
  bazi: any,
  topic: string,
  language: 'zh' | 'en' = 'zh'
): string {
  const element = bazi.dayMasterElement || '木';
  const profile = EMOTION_PROFILES[element];

  const resonanceZH = `
## 💝 情感共鸣解读

您的日主为${element}性，在面对「${topic}」这个话题时：

**情感触发点**: ${profile.trigger}
**情感强度**: ${'❤️'.repeat(profile.intensity)}

**共鸣建议**:
1. **理解自己的核心需求** — ${profile.primary === 'growth' ? '您渴望成长和创造' : profile.primary === 'freedom' ? '您需要表达和自由' : profile.primary === 'security' ? '您渴望稳定和安全感' : profile.primary === 'belonging' ? '您需要被认可和归属' : '您需要内心的平静与和谐'}
2. **接受自己的情感反应** — 对「${topic}」的情绪波动是正常的
3. **寻求合适的支持** — 与理解您五行特质的人交流

**温馨提示**: 命理解读仅供参考，真正的力量来自于您对自身的了解和接纳。
`;

  const resonanceEN = `
## 💝 Emotional Resonance

Your Day Master is ${element} element. When facing the topic of "${topic}":

**Emotional Trigger**: ${profile.triggerEn}
**Emotional Intensity**: ${'❤️'.repeat(profile.intensity)}

**Resonance Advice**:
1. **Understand Your Core Need** — You ${profile.primary === 'growth' ? 'desire growth and creativity' : profile.primary === 'freedom' ? 'need expression and freedom' : profile.primary === 'security' ? 'crave stability and security' : profile.primary === 'belonging' ? 'need recognition and belonging' : 'seek inner peace and harmony'}
2. **Accept Your Emotional Reactions** — Your emotional fluctuations about "${topic}" are normal
3. **Seek Appropriate Support** — Talk with people who understand your elemental nature

**Gentle Reminder**: Fortune-telling is for entertainment only. Your real strength comes from self-awareness and acceptance.
`;

  return language === 'zh' ? resonanceZH : resonanceEN;
}

// ==================== 增强版多轮对话引擎 ====================

export function generateChatResponse(
  userMessage: string,
  session: ChatSession
): string {
  const message = userMessage.toLowerCase();
  const bazi = session.baziData;

  // What-If 情境模拟
  if (message.includes('如果') || message.includes('换工作') || message.includes('跳槽') ||
      message.includes('创业') || message.includes('搬家') || message.includes('投资') ||
      message.includes('学习') || message.includes('结婚') || message.includes('健康')) {
    return generateWhatIfResponse(userMessage, bazi);
  }

  // 情感共鸣
  if (message.includes('感觉') || message.includes('心情') || message.includes('情绪') ||
      message.includes('焦虑') || message.includes('迷茫') || message.includes('困惑')) {
    return generateEmotionResonance(bazi, userMessage, session.baziData.language || 'zh');
  }

  // 意图识别
  if (message.includes('事业') || message.includes('工作') || message.includes('职业')) {
    return generateCareerAdvice(bazi);
  }
  if (message.includes('感情') || message.includes('爱情') || message.includes('婚姻') || message.includes('桃花')) {
    return generateLoveAdvice(bazi);
  }
  if (message.includes('财运') || message.includes('钱') || message.includes('财富') || message.includes('投资')) {
    return generateWealthAdvice(bazi);
  }
  if (message.includes('健康') || message.includes('身体') || message.includes('养生')) {
    return generateHealthAdvice(bazi);
  }

  // 默认回复
  return generateGeneralAdvice(bazi);
}

function generateWhatIfResponse(question: string, bazi: any): string {
  const { scenarios, recommendation, recommendationEn } = generateWhatIfAnalysis(question, bazi);
  const lang = bazi.language || 'zh';

  const scenariosText = scenarios.map((s, i) => {
    const scoreText = Object.entries(s.scoreChange)
      .map(([k, v]) => `${k}: ${v > 0 ? '+' : ''}${v}`)
      .join(', ');
    return `${i + 1}. **${s.titleEn}** — ${s.descriptionEn}
   影响力: ${scoreText}
   影响方向: ${s.impact === 'positive' ? '✅ 利好' : s.impact === 'negative' ? '⚠️ 需谨慎' : '➖ 中性'}`;
  }).join('\n\n');

  return `
## 🔮 What-If 情境分析

针对您的问题，我分析了以下可能的情境：

${scenariosText}

## 📋 综合建议

${lang === 'zh' ? recommendation : recommendationEn}

**提示**: 命盘分析仅供参考，真正的选择权在您手中。
`;
}

function generateCareerAdvice(bazi: any): string {
  const element = bazi.dayMasterElement;
  const analysis = ELEMENT_ANALYSIS[element] || {};

  return `
## 💼 事业运势分析

基于您的八字：

**最佳发展方向**: ${analysis.direction || '待定'}
**幸运颜色**: ${analysis.color || '待定'}
**适合行业**: ${analysis.career?.join('、') || '待定'}

**事业建议**:
1. 充分利用您的${analysis.strength?.[0] || '优势'}特质
2. 注意避免${analysis.weakness?.[0] || '不足'}可能带来的影响
3. 在${analysis.direction || '相应方向'}发展更有利

请问您想了解更具体的哪个方面？
`;
}

function generateLoveAdvice(bazi: any): string {
  return `
## ❤️ 感情运势分析

根据您的八字命盘：

**性格特点**: ${bazi.dayHeavenlyStem}日主
**对感情的态度**: 待详细分析

**建议**:
1. 了解自己的情感需求
2. 寻找与您五行相合的伴侣
3. 注意流年对感情的影响

您想了解正缘出现的时间还是如何提升感情运势？
`;
}

function generateWealthAdvice(bazi: any): string {
  return `
## 💰 财运分析

基于您的八字：

**理财特点**: 待分析
**财位**: 待定
**发财时机**: 流年配合

**建议**:
1. 正财为主，稳健积累
2. 注意理财风险
3. 把握流年机遇

您想了解具体的发财方位还是投资时机？
`;
}

function generateHealthAdvice(bazi: any): string {
  const element = bazi.dayMasterElement;

  const healthTips: Record<string, string[]> = {
    木: ['养肝护肝', '多进行户外活动'],
    火: ['保护心血管', '保持情绪稳定'],
    土: ['调理脾胃', '注意消化系统'],
    金: ['呼吸系统', '肺部保养'],
    水: ['肾脏泌尿', '注意保暖']
  };

  return `
## 🏥 健康建议

基于您${element}性体质：

**重点关注**: ${healthTips[element]?.[0] || '整体调理'}
**日常保健**: ${healthTips[element]?.[1] || '规律作息'}

**建议**:
1. 顺应季节调养
2. 注意对应器官保养
3. 保持心情愉悦
`;
}

function generateWhatIfAdvice(question: string, bazi: any): string {
  // What-If情境模拟
  return `
## 🔮 What-If 情境分析

针对您的问题"${question}"

我正在分析这将对您的命盘产生的影响...

**初步判断**: 需要结合您的具体命盘结构详细分析

**建议**: 请具体描述您想了解的情境（如：换工作、搬家、学习新技能等），我可以为您详细分析影响。
`;
}

function generateGeneralAdvice(bazi: any): string {
  return `
## 🌟 命盘总览

您的八字命盘信息：
- 日主: ${bazi.dayHeavenlyStem}
- 五行: ${bazi.dayMasterElement}

**您可以询问**:
- 💼 事业发展
- ❤️ 感情运势
- 💰 财富积累
- 🏥 健康建议
- 🔮 What-If情境（如：换工作会怎样）

请告诉我您最关心哪个方面？
`;
}

// ==================== 导出类型 ====================

export type { BaZiInput, ChatMessage, ChatSession };
