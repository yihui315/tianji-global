export const DAILY_LOVE_ORACLE_MOODS = [
  { value: 'missing_them', label: '想念对方', helper: '心里有一个人，但不想把自己推得太急。' },
  { value: 'ambiguous_pull', label: '暧昧拉扯', helper: '有靠近，也有试探，适合先看清节奏。' },
  { value: 'cold_war_hesitation', label: '冷战犹豫', helper: '沉默正在放大误会，今天更适合降温。' },
  { value: 'reunion', label: '想复合', helper: '旧连接还在，但需要新的表达方式。' },
  { value: 'steady_love', label: '稳定恋爱', helper: '关系有基础，今天适合补一点温柔。' },
  { value: 'single_expectation', label: '单身期待', helper: '把注意力收回自己，新的缘分更容易靠近。' },
] as const;

export type DailyLoveOracleMood = (typeof DAILY_LOVE_ORACLE_MOODS)[number]['value'];

export type DailyLoveOracleResult = {
  id: string;
  dateKey: string;
  mood: DailyLoveOracleMood;
  moodLabel: string;
  keyword: string;
  relationshipHint: string;
  doToday: string;
  avoidToday: string;
  oneLiner: string;
};

type OracleTemplate = Omit<DailyLoveOracleResult, 'id' | 'dateKey' | 'mood' | 'moodLabel'>;

const ORACLE_TEMPLATES: OracleTemplate[] = [
  {
    keyword: '轻声靠近',
    relationshipHint: '今天适合用更轻的方式表达在意。先确认对方是否愿意接住你的信号，再决定下一步。',
    doToday: '发出一个不施压的关心，或者把想说的话先写成三句话。',
    avoidToday: '不要用试探、冷处理或反复追问来换取安全感。',
    oneLiner: '把话说轻一点，关系反而更容易听见你。',
  },
  {
    keyword: '边界感',
    relationshipHint: '今天的关系主题是把感受说清楚，而不是把答案逼出来。边界会让亲密更稳定。',
    doToday: '选择一个具体场景，说出你希望被怎样对待。',
    avoidToday: '不要把沉默理解成最终结论，也不要替对方下定论。',
    oneLiner: '清楚的边界，不会削弱爱，只会让爱有地方落下。',
  },
  {
    keyword: '慢一点',
    relationshipHint: '今天不适合急着定义关系，更适合观察对方是否持续、稳定、愿意回应。',
    doToday: '给自己一个小暂停，把最想问的问题留到情绪平稳后再说。',
    avoidToday: '不要因为一时焦虑就做出会让自己后悔的承诺或拉黑。',
    oneLiner: '慢一点不是退后，而是给真相留出空间。',
  },
  {
    keyword: '真实回应',
    relationshipHint: '今天适合看行动是否对齐语言。关系里的答案，往往藏在重复出现的小细节里。',
    doToday: '记录一个让你安心的细节，也记录一个仍需要确认的点。',
    avoidToday: '不要只听甜言蜜语，也不要只凭一次失误否定全部。',
    oneLiner: '真正的信号，会在行动里重复出现。',
  },
  {
    keyword: '重新连接',
    relationshipHint: '今天适合修复一个小断点，但修复不等于立刻回到从前。先让对话重新流动。',
    doToday: '发起一个具体、温和、可回答的问题。',
    avoidToday: '不要翻旧账开场，也不要把道歉变成要求对方立刻回应。',
    oneLiner: '旧关系若要继续，需要新的沟通方式。',
  },
  {
    keyword: '把爱放回自己',
    relationshipHint: '今天适合把注意力从对方反应收回到自己的状态。稳定的人更容易做出稳定选择。',
    doToday: '安排一件能让你恢复能量的小事，再决定是否联系。',
    avoidToday: '不要用不断刷新消息来判断自己的价值。',
    oneLiner: '当你先站稳，关系的风向才看得清。',
  },
  {
    keyword: '温柔确认',
    relationshipHint: '今天适合确认彼此的节奏，而不是制造新的压力。关系可以从一个小约定开始变清楚。',
    doToday: '提出一个低压力邀请，给对方明确但自由的回应空间。',
    avoidToday: '不要用含糊暗示期待对方完全读懂。',
    oneLiner: '温柔不是含糊，温柔也可以很清楚。',
  },
  {
    keyword: '顺势而行',
    relationshipHint: '今天的能量适合顺着已经出现的信号走，不需要凭空制造戏剧性转折。',
    doToday: '回应已经发生的善意，保持一个小而稳定的互动。',
    avoidToday: '不要为了证明在乎而做过度表达。',
    oneLiner: '今天不必用力过猛，顺势就好。',
  },
];

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function isDailyLoveOracleMood(value: string): value is DailyLoveOracleMood {
  return DAILY_LOVE_ORACLE_MOODS.some((mood) => mood.value === value);
}

export function computeDailyLoveOracle({
  dateKey = getLocalDateKey(),
  mood = 'missing_them',
}: {
  dateKey?: string;
  mood?: DailyLoveOracleMood;
} = {}): DailyLoveOracleResult {
  const moodMeta = DAILY_LOVE_ORACLE_MOODS.find((item) => item.value === mood) ?? DAILY_LOVE_ORACLE_MOODS[0];
  const templateIndex = hashString(`${dateKey}:${moodMeta.value}`) % ORACLE_TEMPLATES.length;
  const template = ORACLE_TEMPLATES[templateIndex];

  return {
    ...template,
    id: `daily_oracle_${dateKey.replaceAll('-', '')}_${moodMeta.value}_${templateIndex}`,
    dateKey,
    mood: moodMeta.value,
    moodLabel: moodMeta.label,
  };
}

export function getDailyLoveOracleShareText(result: DailyLoveOracleResult, shareUrl: string) {
  return [
    `今日天机：${result.keyword}`,
    result.oneLiner,
    `今日关系提示：${result.relationshipHint}`,
    `抽你的每日关系灵感签：${shareUrl}`,
  ].join('\n');
}
