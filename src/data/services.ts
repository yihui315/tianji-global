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

/** Local AI-generated preview images served from /public/assets/services/ */
const IMG = {
  ziwei:      '/assets/services/ziwei.jpg',
  bazi:       '/assets/services/bazi.jpg',
  yijing:     '/assets/services/yijing.jpg',
  western:    '/assets/services/western.jpg',
  synastry:   '/assets/services/synastry.jpg',
  tarot:      '/assets/services/tarot.jpg',
  numerology: '/assets/services/numerology.jpg',
  solreturn:  '/assets/services/solar-return.jpg',
  transit:    '/assets/services/transit.jpg',
  fengshui:   '/assets/services/fengshui.jpg',
  electional: '/assets/services/electional.jpg',
  horary:     '/assets/services/horary.jpg',
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
