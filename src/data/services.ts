/**
 * Shared service definitions used across the homepage and potentially other pages.
 */

export interface ServiceItem {
  href: string;
  icon: string;
  title: string;
  desc: string;
}

export const SERVICES: ServiceItem[] = [
  { href: '/ziwei', icon: '🌟', title: '紫微斗数', desc: '14主星 · 12宫位 · 四化飞星' },
  { href: '/bazi', icon: '📊', title: '八字命理', desc: '日主 · 十神 · 大运流年' },
  { href: '/yijing', icon: '🔮', title: '易经占卜', desc: '64卦 · 爻辞 · 象数分析' },
  { href: '/western', icon: '⭐', title: '西方星盘', desc: 'SWEPH精确计算 · AstroChart专业星盘' },
  { href: '/synastry', icon: '💫', title: '合盘分析', desc: '叠盘 · 复合盘 · 戴维森盘' },
  { href: '/tarot', icon: '🃏', title: '塔罗占卜', desc: '78张牌 · AI智能解读' },
  { href: '/numerology', icon: '🔢', title: '姓名命理', desc: '三才五格 · 数理磁场' },
  { href: '/solar-return', icon: '☀️', title: '太阳返照', desc: '年度运势 · 生日星盘' },
  { href: '/transit', icon: '🔭', title: 'Transit推运', desc: '次限推进 · 顺逆行分析' },
  { href: '/fengshui', icon: '🏠', title: '风水布局', desc: '八宅 · 玄空飞星' },
  { href: '/electional', icon: '📅', title: '择日择吉', desc: '黄道吉日 · 最优时辰' },
  { href: '/horary', icon: '🌀', title: '卦占', desc: '时间卦 · 即时天机' },
];
