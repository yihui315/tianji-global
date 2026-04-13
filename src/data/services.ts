/**
 * Shared service definitions used across the homepage and potentially other pages.
 * All user-facing strings are bilingual (zh/en).
 */

export interface ServiceItem {
  href: string;
  icon: string;
  title: { zh: string; en: string };
  desc: { zh: string; en: string };
  /** AI-generated preview image URL */
  image?: string;
}

/** MiniMax AI-generated icon images served from /public/assets/icons/ */
const IMG = {
  ziwei:      '/assets/icons/icon-ziwei.png',
  bazi:       '/assets/icons/icon-bazi.png',
  yijing:     '/assets/icons/icon-yijing.png',
  western:    '/assets/icons/icon-western.png',
  synastry:   '/assets/icons/icon-synastry.png',
  tarot:      '/assets/icons/icon-tarot.png',
  numerology: '/assets/icons/icon-ai.png',     // numerology → AI icon
  solreturn:  '/assets/icons/icon-solar.png',  // solar return → solar icon
  transit:    '/assets/icons/icon-transit.png',
  fengshui:   '/assets/icons/icon-fengshui.png',
  electional: '/assets/icons/icon-electional.png',
  horary:     '/assets/icons/icon-yijing.png', // horary → yijing icon
};

export const SERVICES: ServiceItem[] = [
  { href: '/ziwei',        icon: '🌟', title: { zh: '紫微斗数', en: 'Zi Wei Dou Shu' },     desc: { zh: '14主星 · 12宫位 · 四化飞星', en: '14 Stars · 12 Palaces · Four Transformations' },   image: IMG.ziwei },
  { href: '/bazi',         icon: '📊', title: { zh: '八字命理', en: 'BaZi Analysis' },       desc: { zh: '日主 · 十神 · 大运流年', en: 'Day Master · Ten Gods · Decade Pillars' },             image: IMG.bazi },
  { href: '/yijing',       icon: '🔮', title: { zh: '易经占卜', en: 'Yi Jing Oracle' },      desc: { zh: '64卦 · 爻辞 · 象数分析', en: '64 Hexagrams · Line Texts · Symbolic Analysis' },     image: IMG.yijing },
  { href: '/western',      icon: '⭐', title: { zh: '西方星盘', en: 'Western Chart' },       desc: { zh: 'SWEPH精确计算 · 专业星盘', en: 'Swiss Ephemeris · Professional Chart' },             image: IMG.western },
  { href: '/synastry',     icon: '💫', title: { zh: '合盘分析', en: 'Synastry' },            desc: { zh: '叠盘 · 复合盘 · 戴维森盘', en: 'Overlay · Composite · Davison' },                   image: IMG.synastry },
  { href: '/tarot',        icon: '🃏', title: { zh: '塔罗占卜', en: 'Tarot Reading' },       desc: { zh: '78张牌 · AI智能解读', en: '78 Cards · AI Interpretation' },                          image: IMG.tarot },
  { href: '/numerology',   icon: '🔢', title: { zh: '姓名命理', en: 'Numerology' },          desc: { zh: '三才五格 · 数理磁场', en: 'Name Grids · Numeric Fields' },                           image: IMG.numerology },
  { href: '/solar-return', icon: '☀️', title: { zh: '太阳返照', en: 'Solar Return' },        desc: { zh: '年度运势 · 生日星盘', en: 'Annual Forecast · Birthday Chart' },                      image: IMG.solreturn },
  { href: '/transit',      icon: '🔭', title: { zh: 'Transit推运', en: 'Transits' },         desc: { zh: '次限推进 · 顺逆行分析', en: 'Progressions · Retrograde Analysis' },                  image: IMG.transit },
  { href: '/fengshui',     icon: '🏠', title: { zh: '风水布局', en: 'Feng Shui' },           desc: { zh: '八宅 · 玄空飞星', en: 'Eight Mansions · Flying Stars' },                              image: IMG.fengshui },
  { href: '/electional',   icon: '📅', title: { zh: '择日择吉', en: 'Electional' },          desc: { zh: '黄道吉日 · 最优时辰', en: 'Auspicious Dates · Optimal Timing' },                    image: IMG.electional },
  { href: '/horary',       icon: '🌀', title: { zh: '卦占', en: 'Horary' },                  desc: { zh: '时间卦 · 即时天机', en: 'Time Hexagram · Instant Insight' },                         image: IMG.horary },
];
