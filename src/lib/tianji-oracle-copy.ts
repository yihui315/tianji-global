export type TianjiOracleLanguage = 'en' | 'zh';

export const tianjiOracleCopy = {
  en: {
    hero: {
      eyebrow: 'TIANJI ORACLE · ONE QUESTION',
      title: 'Ask one question. Get a decision reading.',
      subtitle: 'Situation · Hidden tension · Timing · Next move',
      description:
        'Bring the question that keeps looping in your mind. TianJi turns it into a structured oracle reading you can act on today.',
    },
    primaryCta: 'Read my question',
    secondaryCta: 'How the reading works',
    form: {
      eyebrow: 'Your question',
      title: 'Name the situation you need to understand',
      description:
        'Write the real situation, the choice in front of you, and what feels unclear. TianJi will synthesize the first signal before you pay.',
      footer: 'You get a free preview first. Unlock only if the signal feels useful.',
      placeholder:
        'e.g. I am torn between two job offers. What hidden factor should I weigh before I choose?',
      loading: 'Reading the situation...',
    },
    trustItems: [
      { label: 'One clear question', description: 'No generic horoscope. The reading is anchored to your situation.' },
      { label: 'Structured synthesis', description: 'Situation, hidden tension, timing, and next move in one flow.' },
      { label: 'One-time unlock', description: 'No subscription. Pay once only if the preview helps.' },
    ],
    preview: {
      eyebrow: 'YOUR FIRST SIGNAL',
      paywallNote:
        'Unlock the complete synthesis for {price}: situation map, hidden tension, timing read, next best move, and one reflection prompt.',
      assurance: 'Secure Stripe checkout · One-time payment · 24h refund window.',
      unlockCta: 'Unlock my complete reading · {price}',
      unlocking: 'Opening checkout...',
    },
    unlocked: {
      eyebrow: 'YOUR COMPLETE TIANJI READING',
    },
    unlockBenefits: [
      'The real issue underneath the question',
      'The hidden pressure or opportunity to notice',
      'Whether this is a move-now, wait, or reframe moment',
      'A concrete next step for the next 24 to 72 hours',
    ],
  },
  zh: {
    hero: {
      eyebrow: '天机问答 · 一个问题',
      title: '问一个问题，得到一份综合判断',
      subtitle: '局势 · 隐变量 · 时机 · 下一步',
      description:
        '把那个一直在脑子里打转的问题写下来。天机会把它整理成一份能拿来行动的综合解读。',
    },
    primaryCta: '解读我的问题',
    secondaryCta: '看看解读方式',
    form: {
      eyebrow: '你的问题',
      title: '说清楚你现在想看懂的处境',
      description:
        '写下真实情况、眼前选择，以及最不确定的地方。付费前，天机会先给你一段核心信号。',
      footer: '先看免费预览；只有当这个信号对你有用，再解锁完整解读。',
      placeholder: '比如 我在两份工作之间纠结，做决定前有什么隐藏因素需要看见？',
      loading: '正在读取局势...',
    },
    trustItems: [
      { label: '一个清楚问题', description: '不是泛泛的运势，而是围绕你的真实处境。' },
      { label: '综合判断结构', description: '局势、隐变量、时机、下一步，放在同一条线里。' },
      { label: '单次解锁', description: '不订阅。预览有帮助，再一次性付费。' },
    ],
    preview: {
      eyebrow: '你的第一段信号',
      paywallNote:
        '解锁完整综合解读 {price}：局势地图、隐藏张力、时机判断、下一步行动与一个反思问题。',
      assurance: '通过 Stripe 安全结账 · 一次付费 · 24 小时内可退款',
      unlockCta: '解锁我的完整解读 · {price}',
      unlocking: '正在打开结账...',
    },
    unlocked: {
      eyebrow: '你的完整天机解读',
    },
    unlockBenefits: [
      '这个问题背后真正卡住你的点',
      '现在最容易被忽略的压力或机会',
      '此刻适合行动、等待，还是换一种问法',
      '接下来 24 到 72 小时可以做的一步',
    ],
  },
} satisfies Record<TianjiOracleLanguage, {
  hero: { eyebrow: string; title: string; subtitle: string; description: string };
  primaryCta: string;
  secondaryCta: string;
  form: {
    eyebrow: string;
    title: string;
    description: string;
    footer: string;
    placeholder: string;
    loading: string;
  };
  trustItems: Array<{ label: string; description: string }>;
  preview: {
    eyebrow: string;
    paywallNote: string;
    assurance: string;
    unlockCta: string;
    unlocking: string;
  };
  unlocked: { eyebrow: string };
  unlockBenefits: string[];
}>;
