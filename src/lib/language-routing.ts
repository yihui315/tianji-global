export type AppLanguage = 'zh' | 'en';

type LandingCopy = {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    description: string;
  };
  primaryCta: string;
  secondaryCta: string;
  form: {
    eyebrow: string;
    title: string;
    description: string;
    footer?: string;
  };
  trustItems: Array<{ label: string; value?: string; description?: string }>;
};

export const moduleLandingCopy = {
  bazi: {
    en: {
      hero: {
        eyebrow: 'BaZi reading',
        title: 'Read the structure before the story.',
        subtitle: 'Four pillars · Five elements · Ten gods',
        description:
          'See how your chart holds pressure, power, and timing — read in plain English, built for decisions rather than guesswork.',
      },
      primaryCta: 'Read my BaZi',
      secondaryCta: 'See how it works',
      form: {
        eyebrow: 'Fast entry',
        title: 'Enter your birth details to reveal your pillars.',
        description:
          'Start with the basics — birth date, hour, gender — and we will turn the structure of your chart into guidance you can actually use.',
        footer: 'Once the chart appears, the AI deep reading, chat, share, and PDF export are all one tap away.',
      },
      trustItems: [
        { label: 'Four pillars', value: 'Structure first' },
        { label: 'Five elements', value: 'Rhythm and balance' },
        { label: 'AI interpretation', value: 'Depth on demand' },
      ],
    },
    zh: {
      hero: {
        eyebrow: '八字命理',
        title: '先看结构 再进入解读',
        subtitle: '四柱 五行 十神',
        description:
          '把四柱里的压力 势能 与时机读成一套真正能拿来判断的语言',
      },
      primaryCta: '开始读八字',
      secondaryCta: '查看解读方式',
      form: {
        eyebrow: '快速录入',
        title: '输入出生资料 一次看清四柱',
        description: '从出生资料开始 把复杂命理整理成真正能读懂的判断结果',
        footer: '命盘出现后 仍可继续查看 AI 解读 聊天 分享与 PDF 导出',
      },
      trustItems: [
        { label: '四柱结构', value: '先看命局' },
        { label: '五行节律', value: '看见平衡' },
        { label: 'AI 解读', value: '需要时再深入' },
      ],
    },
  },
  yijing: {
    en: {
      hero: {
        eyebrow: 'I Ching oracle',
        title: 'Turn uncertainty into a deliberate choice',
        subtitle: 'Coin cast  Hexagram search  AI oracle',
        description:
          'Bring a real question and read the changing structure around it through a calmer more focused oracle experience',
      },
      primaryCta: 'Cast the oracle',
      secondaryCta: 'See the ritual',
      form: {
        eyebrow: 'Oracle entry',
        title: 'Choose a ritual or go straight to the hexagram',
        description:
          'Whether you cast coins or search directly the result still turns into a focused interpretation you can act on',
        footer: 'Interpretation reading history sharing and PDF export all remain part of the same flow',
      },
      trustItems: [
        { label: 'Coin cast', value: 'Ritual entry' },
        { label: 'Hexagram search', value: 'Direct lookup' },
        { label: 'AI oracle', value: 'Deeper context' },
      ],
    },
    zh: {
      hero: {
        eyebrow: '易经占筮',
        title: '把不确定带入一次清晰决策',
        subtitle: '铜钱起卦 卦象检索 AI 解卦',
        description: '带着真实问题进入卦象 用更克制更清楚的方式看懂变化与指向',
      },
      primaryCta: '开始起卦',
      secondaryCta: '查看解卦方式',
      form: {
        eyebrow: '占筮入口',
        title: '选择起卦 或直接进入卦象',
        description: '无论起卦还是查卦 最终都会进入一份更清晰更可行动的解读',
        footer: '解读 历史记录 分享与 PDF 导出仍在同一条使用路径里',
      },
      trustItems: [
        { label: '铜钱起卦', value: '有仪式感' },
        { label: '卦象检索', value: '直接进入' },
        { label: 'AI 解卦', value: '补足语境' },
      ],
    },
  },
  tarot: {
    en: {
      hero: {
        eyebrow: 'Tarot oracle',
        title: 'A card spread should open a real inner signal',
        subtitle: 'Choose the spread  Ask the question  Read the pattern',
        description:
          'Use a single card a three card spread or a Celtic Cross to reveal what is really pulling beneath the surface',
      },
      primaryCta: 'Draw your cards',
      secondaryCta: 'See the reading flow',
      form: {
        eyebrow: 'Tarot entry',
        title: 'Choose a spread and ask with precision',
        description: 'The draw still follows the original Tarot flow while the reading feels calmer richer and easier to share',
      },
      trustItems: [
        { label: 'Spread selection', value: 'Single  Three  Celtic Cross' },
        { label: 'Card states', value: 'Draw and reveal' },
        { label: 'Share output', value: 'Ready when you are' },
      ],
    },
    zh: {
      hero: {
        eyebrow: '塔罗占卜',
        title: '一次抽牌 应该打开真实的内在信号',
        subtitle: '选择牌阵 提出问题 看见背后牵引',
        description: '用单牌 三牌 或十字牌阵 把一件事背后的情绪 选择与走向读得更清楚',
      },
      primaryCta: '开始抽牌',
      secondaryCta: '查看阅读方式',
      form: {
        eyebrow: '塔罗入口',
        title: '选定牌阵 然后把问题说清楚',
        description: '抽牌仍走原有流程 但整体阅读体验更沉静 更完整 也更适合分享',
      },
      trustItems: [
        { label: '牌阵选择', value: '单牌 三牌 十字牌阵' },
        { label: '卡牌状态', value: '抽取与翻开' },
        { label: '分享输出', value: '随时生成' },
      ],
    },
  },
  western: {
    en: {
      hero: {
        eyebrow: 'Western astrology',
        title: 'Read the sky with precision before style',
        subtitle: 'Swiss Ephemeris  AstroChart  Natal chart',
        description:
          'See your Big Three planetary positions and chart dynamics in a modern observatory built for clarity',
      },
      primaryCta: 'Generate my chart',
      secondaryCta: 'See chart layers',
      form: {
        eyebrow: 'Chart console',
        title: 'Enter the coordinates of your birth',
        description: 'Use your birth data to generate a natal chart that feels readable precise and worth returning to',
      },
      trustItems: [
        { label: 'Big Three', value: 'Identity core' },
        { label: 'Planetary positions', value: 'Chart dynamics' },
        { label: 'AstroChart', value: 'Visual precision' },
      ],
    },
    zh: {
      hero: {
        eyebrow: '西方占星',
        title: '先看清星盘 再谈风格',
        subtitle: 'Swiss Ephemeris AstroChart 本命星盘',
        description: '把太阳 月亮 上升与行星位置读成一套清楚可信的星盘语言',
      },
      primaryCta: '生成星盘',
      secondaryCta: '查看星盘结构',
      form: {
        eyebrow: '星盘控制台',
        title: '输入你的出生坐标',
        description: '用出生资料生成一张更清楚 更精确 也更值得反复阅读的本命盘',
      },
      trustItems: [
        { label: '三大核心', value: '性格基底' },
        { label: '行星位置', value: '关系与动力' },
        { label: '星盘可视化', value: '精确呈现' },
      ],
    },
  },
  fortune: {
    en: {
      hero: {
        eyebrow: 'Life K-line',
        title: 'A life curve should make timing visible',
        subtitle:
          'Career  Wealth  Relationship  Health  Timing',
        description: 'See where life is expanding where it is asking for restraint and where the next turning point begins',
      },
      primaryCta: 'Generate my curve',
      secondaryCta: 'See the timing logic',
      form: {
        eyebrow: 'Forecast console',
        title: 'Enter the minimum data Keep the full timing layer',
        description:
          'Start with the essentials and turn your life path into a curve you can read at a glance',
      },
      trustItems: [
        { label: 'Life curve', value: 'Timing at a glance' },
        { label: 'Five dimensions', value: 'Career to health' },
        { label: 'AI deep reading', value: 'Optional layer' },
      ],
    },
    zh: {
      hero: {
        eyebrow: '人生 K 线',
        title: '命运曲线应该让时机一眼可见',
        subtitle: '事业 财富 关系 健康 时间窗口',
        description: '看见哪里适合推进 哪里需要收束 以及下一次关键转折会从哪里开始',
      },
      primaryCta: '生成命运曲线',
      secondaryCta: '查看时间逻辑',
      form: {
        eyebrow: '运势控制台',
        title: '输入最少资料 保留完整时间层',
        description: '从最少信息开始 把人生路径收束成一条可以一眼读懂的曲线',
      },
      trustItems: [
        { label: '命运曲线', value: '一眼看懂时机' },
        { label: '五个维度', value: '事业到健康' },
        { label: 'AI 深度解读', value: '需要时开启' },
      ],
    },
  },
  numerology: {
    en: {
      hero: {
        eyebrow: 'NUMEROLOGY · 数字命理',
        title: 'Letters and a birth date, read as recurring patterns.',
        subtitle: 'Life path · Destiny · Soul urge',
        description:
          'Pythagorean numerology turns your name and birth date into a small set of repeating signals. We surface the three core numbers first, then unfold the personality, planet, and lucky tokens around them.',
      },
      primaryCta: 'Calculate my numbers',
      secondaryCta: 'See how it works',
      form: {
        eyebrow: 'Quick entry',
        title: 'Enter your full name and birth date.',
        description:
          'The full name as you usually go by, plus a birth date in YYYY-MM-DD. Used once for the calculation, then forgotten.',
        footer: 'Your inputs leave the page only to be calculated. We never store the raw name.',
      },
      trustItems: [
        { label: 'Three core numbers', value: 'Life path, destiny, soul urge' },
        { label: 'Pythagorean system', value: 'Classical letter mapping' },
        { label: 'Lucky tokens', value: 'Numbers, days, planet, element' },
      ],
    },
    zh: {
      hero: {
        eyebrow: 'NUMEROLOGY · 数字命理',
        title: '把姓名与生辰 读成一组反复出现的信号',
        subtitle: '生命数 命运数 灵魂数',
        description:
          '毕达哥拉斯数字命理把你的姓名与生辰拆成一组反复出现的数字 先看三个核心数 再展开人格 守护行星与幸运数字',
      },
      primaryCta: '计算我的数字',
      secondaryCta: '查看计算逻辑',
      form: {
        eyebrow: '快速录入',
        title: '输入姓名与出生日期',
        description: '使用你日常使用的全名 配合 YYYY-MM-DD 格式的出生日期 仅用于本次计算',
        footer: '资料只用于本次解读 不会保存你的原始姓名',
      },
      trustItems: [
        { label: '三个核心数字', value: '生命 命运 灵魂' },
        { label: '毕达哥拉斯系统', value: '经典字母映射' },
        { label: '幸运指标', value: '数字 日期 行星 元素' },
      ],
    },
  },
  celebrityMatch: {
    en: {
      hero: {
        eyebrow: 'CELEBRITY MATCH · 名人星盘',
        title: 'Whose chart sounds the most like yours?',
        subtitle: 'Sun · Moon · Venus · Mars',
        description:
          'Western astrology aspect analysis compares your chart to a roster of well-known figures and surfaces the four planet pairs that hum loudest. Read it as resonance, not destiny.',
      },
      primaryCta: 'Find my closest matches',
      secondaryCta: 'See how it works',
      form: {
        eyebrow: 'Birth essentials',
        title: 'Enter the date, time, and place you were born.',
        description:
          'The four core planets need a real birth time and a reasonable city. We resolve common cities automatically; latitude and longitude are tunable.',
        footer: 'Used once for the calculation, then forgotten.',
      },
      trustItems: [
        { label: 'Four-planet model', value: 'Sun · Moon · Venus · Mars' },
        { label: 'Five aspect types', value: 'Conjunction to opposition' },
        { label: 'Same-sign bonus', value: 'Tighter resonance ranks higher' },
      ],
    },
    zh: {
      hero: {
        eyebrow: 'CELEBRITY MATCH · 名人星盘',
        title: '哪一份名人星盘 听起来最像你？',
        subtitle: '太阳 月亮 金星 火星',
        description:
          '西方占星术的相位分析 把你的星盘与一组著名人物的星盘逐一比对 找出鸣响最强的四个行星对 把它读成共鸣 而不是命运。',
      },
      primaryCta: '查看我的最佳匹配',
      secondaryCta: '查看分析逻辑',
      form: {
        eyebrow: '核心出生资料',
        title: '请输入你的出生日期 时间与地点',
        description:
          '四个核心行星需要真实出生时间 与一个明确的城市 常见城市会自动解析 经纬度也可以手动微调',
        footer: '资料只用于本次计算 不会保留',
      },
      trustItems: [
        { label: '四行星模型', value: '太阳 月亮 金星 火星' },
        { label: '五种相位', value: '合相到对分相' },
        { label: '同星座加分', value: '共鸣越紧 排名越高' },
      ],
    },
  },
  loveMatch: {
    en: {
      hero: {
        eyebrow: 'LOVE MATCH · 八字合婚',
        title: 'Two birth charts read together — what holds, what bends, what asks for care.',
        subtitle: 'Five elements · Stem combinations · Branch harmonies',
        description:
          'BaZi marriage compatibility takes two full birth charts and reads them as a single weather pattern. Where the elements support each other, where stems combine, where branches clash — and what to do about each.',
      },
      primaryCta: 'Read our compatibility',
      secondaryCta: 'See how it works',
      form: {
        eyebrow: 'Two birth charts',
        title: 'Enter both birth dates and hours.',
        description:
          'BaZi compatibility needs the year, month, day, and birth hour for both people. The hour matters — it changes the day-master pillar.',
        footer: 'Inputs are calculated server-side and forgotten after the reading. Optionally enable AI interpretation for a deeper read.',
      },
      trustItems: [
        { label: 'Five-element fit', value: 'Wood, fire, earth, metal, water' },
        { label: 'Stem & branch logic', value: 'Classical compatibility rules' },
        { label: 'AI interpretation', value: 'Optional second layer' },
      ],
    },
    zh: {
      hero: {
        eyebrow: 'LOVE MATCH · 八字合婚',
        title: '把两份命盘放在一起 看哪里相合 哪里需要松一口气',
        subtitle: '五行相生 天干合化 地支六合三合',
        description:
          '八字合婚把两个人的完整命盘当作一种气象 读出五行如何相生 天干如何合化 地支如何相冲 以及在每一处该如何应对',
      },
      primaryCta: '查看姻缘合盘',
      secondaryCta: '查看分析逻辑',
      form: {
        eyebrow: '两份命盘',
        title: '请输入两个人的出生日期与时辰',
        description:
          '八字合婚需要双方的年 月 日 与出生时辰 时辰会改变日主 不能省略',
        footer: '资料只用于本次合盘计算 不会保留 可选开启 AI 深度解读',
      },
      trustItems: [
        { label: '五行相生', value: '木火土金水' },
        { label: '天干地支', value: '经典合化规则' },
        { label: 'AI 解读', value: '可选的第二层' },
      ],
    },
  },
  synastry: {
    en: {
      hero: {
        eyebrow: 'SYNASTRY · 星盘合盘',
        title: 'Two charts, read as one relational field.',
        subtitle: 'Overlay · Composite · Davison',
        description:
          'Synastry overlays two natal charts and surfaces the aspects that actually shape a relationship. Composite and Davison modes let you read the partnership as its own chart, not just two people side by side.',
      },
      primaryCta: 'Calculate synastry',
      secondaryCta: 'See what we measure',
      form: {
        eyebrow: 'Two-chart console',
        title: 'Enter both birth coordinates',
        description:
          'Use real birth data for both people. The engine computes overlay aspects, midpoint structures, and a composite chart you can read together.',
        footer: 'Outer wheel is Person A · Inner wheel is Person B.',
      },
      trustItems: [
        { label: 'Overlay aspects', value: 'Real planetary geometry' },
        { label: 'Composite chart', value: 'Midpoint synthesis' },
        { label: 'Davison chart', value: 'Time-weighted relationship' },
      ],
    },
    zh: {
      hero: {
        eyebrow: 'SYNASTRY · 星盘合盘',
        title: '把两张星盘读成一段关系的力场。',
        subtitle: '叠盘 · 复合盘 · 戴维森盘',
        description:
          '合盘把两张本命星盘叠在一起 真正塑造一段关系的相位会被一一标出 复合盘与戴维森盘则把这段关系当作独立星盘 让你看见关系本身的样子',
      },
      primaryCta: '开始合盘',
      secondaryCta: '看看会算什么',
      form: {
        eyebrow: '双人控制台',
        title: '输入两个人的出生坐标',
        description: '使用两个人真实的出生信息 引擎会同时给出叠盘相位 中间点结构 与一张可以共同阅读的复合盘',
        footer: '外圈是人物 A 内圈是人物 B',
      },
      trustItems: [
        { label: '叠盘相位', value: '真实行星几何' },
        { label: '复合盘', value: '中间点合成' },
        { label: '戴维森盘', value: '时间加权关系盘' },
      ],
    },
  },
  solarReturn: {
    en: {
      hero: {
        eyebrow: 'SOLAR RETURN · 太阳回归',
        title: 'Read the year that begins on your birthday.',
        subtitle: 'Annual chart · Houses · Themes',
        description:
          'A solar-return chart is cast for the moment the Sun returns to its natal degree. We read it as a one-year forecast — house emphasis, planetary themes, and the timing window each cycle leans into.',
      },
      primaryCta: 'Cast my solar return',
      secondaryCta: 'See how the year is built',
      form: {
        eyebrow: 'Annual console',
        title: 'Birth chart in · Solar-return year out',
        description:
          'Enter your birth data and the year you want to read. The engine casts the chart for your solar-return moment and surfaces the houses, planets, and themes that define that twelve-month window.',
      },
      trustItems: [
        { label: 'Solar-return chart', value: 'One-year frame' },
        { label: 'House emphasis', value: 'Where the year lives' },
        { label: 'Planetary themes', value: 'What the year is about' },
      ],
    },
    zh: {
      hero: {
        eyebrow: 'SOLAR RETURN · 太阳回归',
        title: '读懂从生日开始的这一年。',
        subtitle: '年度星盘 · 宫位 · 主题',
        description:
          '太阳回归盘是太阳回到出生度数那一刻的星盘 我们把它当作未来一年的运势框架 看哪一宫被强调 哪些行星在主导 以及这一年最值得倾注的时间窗口',
      },
      primaryCta: '生成太阳回归盘',
      secondaryCta: '看年度结构是怎么搭出来的',
      form: {
        eyebrow: '年度控制台',
        title: '输入出生信息 输出回归年',
        description: '填入你的出生信息和想看的年份 引擎会算出太阳回归那一刻的星盘 并把这一年的宫位 行星 主题一一展开',
      },
      trustItems: [
        { label: '太阳回归盘', value: '一年的框架' },
        { label: '宫位重点', value: '一年生活在哪里' },
        { label: '行星主题', value: '一年在讲什么' },
      ],
    },
  },
  transit: {
    en: {
      hero: {
        eyebrow: 'PROGRESSIONS · 次限推运',
        title: 'One day after birth equals one year of life.',
        subtitle: 'Secondary progressions · Inner clock · Slow themes',
        description:
          'Secondary progressions advance your natal chart by one day for every year you have lived. We track the slow inner clock — Sun, Moon, and inner planets shifting sign and aspect over the years that actually shape who you become.',
      },
      primaryCta: 'Calculate progressions',
      secondaryCta: 'See how progressions work',
      form: {
        eyebrow: 'Progression console',
        title: 'Birth data in · Progressed chart out',
        description:
          'Enter your birth data and the date you want to read for. The engine advances the natal chart using the 1-day-per-year rule and reports the progressed planet positions and motions.',
      },
      trustItems: [
        { label: 'Secondary progressions', value: '1 day = 1 year' },
        { label: 'Planet motion', value: 'Direct · retrograde · station' },
        { label: 'Major shifts', value: 'Signs and aspects' },
      ],
    },
    zh: {
      hero: {
        eyebrow: 'PROGRESSIONS · 次限推运',
        title: '出生后一天 等同于人生的一年。',
        subtitle: '次限推运 · 内在节律 · 缓慢主题',
        description:
          '次限推运按 1 天 = 1 年的法则推进本命星盘 我们关心的是那一条慢节奏的内在时钟 —— 太阳 月亮 与内行星 在你长大的过程中 慢慢换星座 慢慢形成相位 慢慢塑造你成为今天的样子',
      },
      primaryCta: '计算推运',
      secondaryCta: '看看推运是怎么算的',
      form: {
        eyebrow: '推运控制台',
        title: '本命数据进来 推运盘出来',
        description: '填入出生资料和想推运到的日期 引擎用 1 天对 1 年的规则推进本命盘 给出推运行星位置与运动状态',
      },
      trustItems: [
        { label: '次限推运', value: '1 天 = 1 年' },
        { label: '行星运动', value: '顺行 · 逆行 · 静止' },
        { label: '主要转折', value: '换星座与相位' },
      ],
    },
  },
  pricing: {
    en: {
      hero: {
        eyebrow: 'Premium access',
        title: 'Go deeper when the reading starts to matter',
        subtitle: 'The Stripe checkout contract and plan IDs stay the same',
        description:
          'TianJi Pro is for people who want more than a surface reading Unlock unlimited sessions deeper AI interpretation and a destiny profile you can return to over time',
      },
      primaryCta: 'Choose Pro',
      secondaryCta: 'Back to Destiny Scan',
      form: {
        eyebrow: 'Plans',
        title: 'Choose your pace not your depth',
        description: 'Both plans keep the same checkout flow The difference is how often you pay not how seriously you read',
      },
      trustItems: [
        { label: 'planId unchanged', description: 'PRO_MONTHLY and PRO_YEARLY remain the only button inputs.' },
        { label: 'Endpoint unchanged', description: 'Checkout still posts to /api/stripe/checkout.' },
      ],
    },
    zh: {
      hero: {
        eyebrow: '高级会员',
        title: '当这次解读变得重要 就进入更深一层',
        subtitle: 'Stripe 结账合约与 planId 保持不变',
        description: 'TianJi Pro 适合不想只看表面结果的人 解锁不限次数阅读 更深 AI 解读 PDF 报告 与长期可回看的命理档案',
      },
      primaryCta: '选择 Pro',
      secondaryCta: '返回命运扫描',
      form: {
        eyebrow: '会员方案',
        title: '选择你的节奏 不降低你的深度',
        description: '两个方案走同一条结账路径 区别只在付费节奏 不在解读深度',
      },
      trustItems: [
        { label: 'planId 保持不变', description: '按钮输入仍然只使用 PRO_MONTHLY 和 PRO_YEARLY' },
        { label: '接口保持不变', description: '结账仍然 POST 到 /api/stripe/checkout' },
      ],
    },
  },
} satisfies Record<
  | 'bazi'
  | 'yijing'
  | 'tarot'
  | 'western'
  | 'fortune'
  | 'numerology'
  | 'celebrityMatch'
  | 'loveMatch'
  | 'synastry'
  | 'solarReturn'
  | 'transit'
  | 'pricing',
  Record<AppLanguage, LandingCopy>
>;

export function isAppLanguage(value: unknown): value is AppLanguage {
  return value === 'zh' || value === 'en';
}

export function resolveAppLanguage({
  queryLang,
  storedLang,
  navigatorLanguage,
  fallback = 'en',
}: {
  queryLang?: string | null;
  storedLang?: string | null;
  navigatorLanguage?: string | null;
  fallback?: AppLanguage;
}): AppLanguage {
  if (isAppLanguage(queryLang)) return queryLang;
  if (isAppLanguage(storedLang)) return storedLang;
  if (navigatorLanguage?.toLowerCase().startsWith('zh')) return 'zh';
  return fallback;
}

export function withLanguageParam(href: string, lang: AppLanguage): string {
  if (!href || href.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(href)) {
    return href;
  }

  const [pathAndSearch, hash = ''] = href.split('#');
  const [path, search = ''] = pathAndSearch.split('?');
  const params = new URLSearchParams(search);
  params.set('lang', lang);
  const query = params.toString();

  return `${path}${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`;
}
