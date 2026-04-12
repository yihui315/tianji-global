/**
 * Shared service definitions used across the homepage and potentially other pages.
 */

export interface ServiceItem {
  href: string;
  icon: string;
  title: string;
  desc: string;
  /** AI-generated preview image URL */
  image?: string;
}

const IMG = {
  ziwei:      'https://hailuo-image-algeng-data.oss-cn-wulanchabu.aliyuncs.com/image_inference_output%2Ftalkie%2Fprod%2Fimg%2F2026-04-12%2Fc23d4d4b-9592-4daf-8c18-ab130678a843_aigc.jpeg',
  bazi:       'https://hailuo-image-algeng-data.oss-cn-wulanchabu.aliyuncs.com/image_inference_output%2Ftalkie%2Fprod%2Fimg%2F2026-04-12%2F66916bde-89ae-4701-a2e5-17af95f8caff_aigc.jpeg',
  yijing:     'https://hailuo-image-algeng-data.oss-cn-wulanchabu.aliyuncs.com/image_inference_output%2Ftalkie%2Fprod%2Fimg%2F2026-04-12%2Fb1f57a13-1199-4896-91c2-397b405ad9ee_aigc.jpeg',
  western:    'https://hailuo-image-algeng-data.oss-cn-wulanchabu.aliyuncs.com/image_inference_output%2Ftalkie%2Fprod%2Fimg%2F2026-04-12%2Fa045568b-75eb-4ea7-b784-a3a854272534_aigc.jpeg',
  synastry:   'https://hailuo-image-algeng-data.oss-cn-wulanchabu.aliyuncs.com/image_inference_output%2Ftalkie%2Fprod%2Fimg%2F2026-04-12%2F087fe8e4-e349-4475-a3e3-ee88b6740260_aigc.jpeg',
  tarot:      'https://hailuo-image-algeng-data.oss-cn-wulanchabu.aliyuncs.com/image_inference_output%2Ftalkie%2Fprod%2Fimg%2F2026-04-12%2Fa5fa25e1-45e0-417e-86c1-268d16477196_aigc.jpeg',
  numerology: 'https://hailuo-image-algeng-data.oss-cn-wulanchabu.aliyuncs.com/image_inference_output%2Ftalkie%2Fprod%2Fimg%2F2026-04-12%2F37ba284d-c183-4ee0-9a1e-74e24fc688b5_aigc.jpeg',
  solreturn:  'https://hailuo-image-algeng-data.oss-cn-wulanchabu.aliyuncs.com/image_inference_output%2Ftalkie%2Fprod%2Fimg%2F2026-04-12%2Fafc7b38d-d56f-4aae-8bbd-7d4b146eed14_aigc.jpeg',
  transit:    'https://hailuo-image-algeng-data.oss-cn-wulanchabu.aliyuncs.com/image_inference_output%2Ftalkie%2Fprod%2Fimg%2F2026-04-12%2Fe0a9c236-3fbb-4f19-8e84-73a6ecda76e2_aigc.jpeg',
  fengshui:   'https://hailuo-image-algeng-data.oss-cn-wulanchabu.aliyuncs.com/image_inference_output%2Ftalkie%2Fprod%2Fimg%2F2026-04-12%2F744ffd4c-a1da-48c1-a213-083978c3a966_aigc.jpeg',
  electional: 'https://hailuo-image-algeng-data.oss-cn-wulanchabu.aliyuncs.com/image_inference_output%2Ftalkie%2Fprod%2Fimg%2F2026-04-12%2F8d3be982-36bf-4a3a-8b35-4bcb26083112_aigc.jpeg',
  horary:     'https://hailuo-image-algeng-data.oss-cn-wulanchabu.aliyuncs.com/image_inference_output%2Ftalkie%2Fprod%2Fimg%2F2026-04-12%2F4fbed2f5-def8-4182-a5c2-9b6de72a6eba_aigc.jpeg',
};

export const SERVICES: ServiceItem[] = [
  { href: '/ziwei',        icon: '🌟', title: '紫微斗数',  desc: '14主星 · 12宫位 · 四化飞星',   image: IMG.ziwei      },
  { href: '/bazi',         icon: '📊', title: '八字命理',  desc: '日主 · 十神 · 大运流年',      image: IMG.bazi       },
  { href: '/yijing',       icon: '🔮', title: '易经占卜',  desc: '64卦 · 爻辞 · 象数分析',     image: IMG.yijing     },
  { href: '/western',      icon: '⭐', title: '西方星盘',  desc: 'SWEPH精确计算 · AstroChart专业星盘', image: IMG.western },
  { href: '/synastry',    icon: '💫', title: '合盘分析',  desc: '叠盘 · 复合盘 · 戴维森盘',   image: IMG.synastry   },
  { href: '/tarot',       icon: '🃏', title: '塔罗占卜',  desc: '78张牌 · AI智能解读',        image: IMG.tarot      },
  { href: '/numerology',  icon: '🔢', title: '姓名命理',  desc: '三才五格 · 数理磁场',        image: IMG.numerology },
  { href: '/solar-return',icon: '☀️', title: '太阳返照',  desc: '年度运势 · 生日星盘',        image: IMG.solreturn  },
  { href: '/transit',     icon: '🔭', title: 'Transit推运', desc: '次限推进 · 顺逆行分析',    image: IMG.transit    },
  { href: '/fengshui',    icon: '🏠', title: '风水布局',  desc: '八宅 · 玄空飞星',            image: IMG.fengshui   },
  { href: '/electional',  icon: '📅', title: '择日择吉',  desc: '黄道吉日 · 最优时辰',        image: IMG.electional },
  { href: '/horary',      icon: '🌀', title: '卦占',     desc: '时间卦 · 即时天机',          image: IMG.horary     },
];
