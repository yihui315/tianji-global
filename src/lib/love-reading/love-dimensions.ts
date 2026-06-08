import { LOVE_DIMENSION_KEYS, type LoveDimension, type LoveDimensionKey, type LoveReportLocale } from './report-schema';

type Copy = {
  label: string;
  insight: string;
  action: string;
};

const copy: Record<LoveReportLocale, Record<LoveDimensionKey, Copy>> = {
  en: {
    emotional_connection: {
      label: 'Emotional connection',
      insight: 'The emotional signal is clearest when both people can name what they need without pressure.',
      action: 'Ask one direct but low-pressure question about what feels safe right now.',
    },
    communication: {
      label: 'Communication',
      insight: 'Communication improves when the goal is understanding before persuasion.',
      action: 'Repeat back what you heard before adding your own interpretation.',
    },
    values_alignment: {
      label: 'Values alignment',
      insight: 'Longer-term fit depends on how honestly both people handle expectations and boundaries.',
      action: 'Name one shared value and one difference that deserves patience.',
    },
    growth_support: {
      label: 'Growth support',
      insight: 'This connection works best when support does not become control.',
      action: 'Offer one concrete form of support and let the other person choose the pace.',
    },
    passion_intimacy: {
      label: 'Passion and intimacy',
      insight: 'Attraction is useful when it is matched with emotional steadiness.',
      action: 'Let warmth build through consistency rather than intensity alone.',
    },
  },
  zh: {
    emotional_connection: {
      label: '情感连接',
      insight: '当双方能在没有压力的情况下说出真实需要时，情感信号最清晰�?,
      action: '先问一个低压力但真诚的问题：现在什么会让你更安心？',
    },
    communication: {
      label: '沟通质�?,
      insight: '这段关系的沟通关键，是先确认理解，再表达判断�?,
      action: '回应前先复述一次你听到的重点�?,
    },
    values_alignment: {
      label: '价值观对齐',
      insight: '长期适配度取决于双方如何处理期待、边界和现实选择�?,
      action: '说清一个共同价值，也承认一个需要耐心的差异�?,
    },
    growth_support: {
      label: '成长支持',
      insight: '支持能让关系变稳，但支持不应该变成控制�?,
      action: '给出一个具体支持选项，并让对方决定节奏�?,
    },
    passion_intimacy: {
      label: '吸引与亲�?,
      insight: '吸引力有价值，但需要被稳定的情绪回应承接�?,
      action: '用持续的小行动建立温度，而不是只依靠强烈情绪�?,
    },
  },
  'zh-Hant': {
    emotional_connection: {
      label: '情感連結',
      insight: '當雙方能在沒有壓力的情況下說出真實需要時，情感信號最清晰�?,
      action: '先問一個低壓力但真誠的問題：現在什麼會讓你更安心？',
    },
    communication: {
      label: '溝通品�?,
      insight: '這段關係的溝通關鍵，是先確認理解，再表達判斷�?,
      action: '回應前先複述一次你聽到的重點�?,
    },
    values_alignment: {
      label: '價值觀對齊',
      insight: '長期適配度取決於雙方如何處理期待、邊界和現實選擇�?,
      action: '說清一個共同價值，也承認一個需要耐心的差異�?,
    },
    growth_support: {
      label: '成長支持',
      insight: '支持能讓關係變穩，但支持不應該變成控制�?,
      action: '給出一個具體支持選項，並讓對方決定節奏�?,
    },
    passion_intimacy: {
      label: '吸引與親�?,
      insight: '吸引力有價值，但需要被穩定的情緒回應承接�?,
      action: '用持續的小行動建立溫度，而不是只依靠強烈情緒�?,
    },
  },
};

export function buildLoveDimensions(
  locale: LoveReportLocale,
  scores: Partial<Record<LoveDimensionKey, number>>,
  uncertaintyNote?: string
): LoveDimension[] {
  return LOVE_DIMENSION_KEYS.map((key) => {
    const score = Math.max(0, Math.min(100, Math.round(scores[key] ?? 66)));
    const item = copy[locale][key];

    return {
      key,
      score,
      label: item.label,
      insight: item.insight,
      evidence: ['Deterministic relationship preview signal', score >= 70 ? 'Strong relative score band' : 'Needs mindful calibration'],
      action: item.action,
      uncertaintyNote,
    };
  });
}
