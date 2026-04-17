/**
 * Monthly Fortune Generator
 * 月度运势内容生成
 */

import type { MonthlyFortune, YearlyOverview, KeyDate } from './types';

// Month metadata
const MONTH_CONFIG = [
  { month: 1, season: 'winter' as const, element: 'water' as const, seasonName: '腊月', luckyColors: ['红', '金'], avoidColors: ['黑'] },
  { month: 2, season: 'spring' as const, element: 'wood' as const, seasonName: '正月', luckyColors: ['青', '绿'], avoidColors: ['白'] },
  { month: 3, season: 'spring' as const, element: 'wood' as const, seasonName: '二月', luckyColors: ['青', '绿'], avoidColors: ['金'] },
  { month: 4, season: 'spring' as const, element: 'earth' as const, seasonName: '三月', luckyColors: ['黄', '绿'], avoidColors: ['黑'] },
  { month: 5, season: 'summer' as const, element: 'fire' as const, seasonName: '四月', luckyColors: ['红', '紫'], avoidColors: ['蓝'] },
  { month: 6, season: 'summer' as const, element: 'fire' as const, seasonName: '五月', luckyColors: ['红', '绿'], avoidColors: ['灰'] },
  { month: 7, season: 'summer' as const, element: 'earth' as const, seasonName: '六月', luckyColors: ['黄', '红'], avoidColors: ['白'] },
  { month: 8, season: 'autumn' as const, element: 'metal' as const, seasonName: '七月', luckyColors: ['白', '金'], avoidColors: ['红'] },
  { month: 9, season: 'autumn' as const, element: 'metal' as const, seasonName: '八月', luckyColors: ['白', '金'], avoidColors: ['黄'] },
  { month: 10, season: 'autumn' as const, element: 'earth' as const, seasonName: '九月', luckyColors: ['黄', '橙'], avoidColors: ['黑'] },
  { month: 11, season: 'winter' as const, element: 'water' as const, seasonName: '十月', luckyColors: ['黑', '蓝'], avoidColors: ['红'] },
  { month: 12, season: 'winter' as const, element: 'water' as const, seasonName: '冬月', luckyColors: ['白', '蓝'], avoidColors: ['绿'] },
];

// Lunar festival dates
const FESTIVAL_DATES = [
  { month: 1, day: 15, name: '元宵节', energy: 'opportunistic' as const },
  { month: 4, day: 5, name: '清明节', energy: 'transformative' as const },
  { month: 5, day: 5, name: '端午节', energy: 'challenging' as const },
  { month: 7, day: 7, name: '七夕节', energy: 'opportunistic' as const },
  { month: 8, day: 15, name: '中秋节', energy: 'opportunistic' as const },
  { month: 9, day: 9, name: '重阳节', energy: 'transformative' as const },
];

function getSeasonalElement(month: number): { element: string; energy: string } {
  switch (month) {
    case 2: case 3: case 4: return { element: 'wood', energy: '生发、创新、起步' };
    case 5: case 6: case 7: return { element: 'fire', energy: '炽热、表达、高峰' };
    case 8: case 9: case 10: return { element: 'metal', energy: '收敛、决断、收获' };
    case 11: case 12: case 1: return { element: 'water', energy: '收藏、反思、孕育' };
    default: return { element: 'earth', energy: '稳定、转化、过渡' };
  }
}

export function generateMonthlyFortune(month: number, year: number): MonthlyFortune {
  const config = MONTH_CONFIG[month - 1];
  const { element, energy } = getSeasonalElement(month);
  
  const luckySigns = ['青龙', '白虎', '朱雀', '玄武'];
  const challengingSigns = ['刑太岁', '冲太岁'];
  
  return {
    month,
    season: config.season,
    element: config.element,
    overallEnergy: `${getSeasonalElement(month).energy}之月，整体能量利于${month <= 4 ? '规划布局' : month <= 8 ? '行动拓展' : month <= 10 ? '收获总结' : '反思沉淀'}`,
    luckySigns,
    challengingSigns,
    loveHoroscope: generateLoveFortune(month, element),
    careerHoroscope: generateCareerFortune(month, element),
    wealthHoroscope: generateWealthFortune(month, element),
    healthTip: generateHealthTip(month, config.season),
    keyDates: generateKeyDates(month, year),
    affirmation: generateAffirmation(month, element),
  };
}

function generateLoveFortune(month: number, element: string): string {
  const templates: Record<string, string[]> = {
    wood: ['木气旺月，情感关系有新芽萌发，单身者宜主动出击。', '本月人际关系活跃，合作运势强，利社交、脱单。'],
    fire: ['火月热情高涨，已有伴侣者感情升温，未婚者利表白。', '情感表达强烈，注意控制情绪波动，避免冲动决定。'],
    metal: ['金月收敛肃杀，感情上宜稳扎稳打，不宜冒险。', '白虎星旺，防口舌是非，沟通需注意方式。'],
    water: ['水月深沉内敛，利深入交流、化解误会。', '情感上思考多于行动，适合回顾与反思。'],
    earth: ['土月稳重踏实，利长期承诺、订婚、结婚。', '感情上可能有现实压力，需理性面对。'],
  };
  const options = templates[element] || templates['earth']!;
  return options[month % 2];
}

function generateCareerFortune(month: number, element: string): string {
  const templates: Record<string, string[]> = {
    wood: ['木月利于创业、新项目启动，贵人运强。', '事业上宜进取，抓住春季生发之气。'],
    fire: ['火月事业高峰，利展示才华、获得认可。', '工作上冲劲足，注意与人协作的方式。'],
    metal: ['金月利于谈判、签合同、推进已有项目。', '事业上宜守成，不宜冒进，做好收尾工作。'],
    water: ['水月利策划、规划、幕后工作。', '事业上宜低调积累，等待时机。'],
    earth: ['土月利于稳定发展，利于房产、基建相关。', '工作上可能遇到瓶颈，需耐心突破。'],
  };
  const options = templates[element] || templates['earth']!;
  return options[month % 2];
}

function generateWealthFortune(month: number, element: string): string {
  const templates: Record<string, string[]> = {
    wood: ['木月宜投资新领域，但需谨慎评估后再下手。', '财运有新机会出现，偏财星动，利小试身手。'],
    fire: ['火月正偏财运皆旺，抓住机遇可有所斩获。', '财务上冲劲大，但注意冲动消费。'],
    metal: ['金月正财运稳定，以正财为主，偏财谨慎。', '财务上宜守财，避免大额投资。'],
    water: ['水月流动之象，财务上变动较多。', '财运平稳，关注现金流管理。'],
    earth: ['土月财务上收益稳定，适合长期规划。', '房产、固定资产相关运势较好。'],
  };
  const options = templates[element] || templates['earth']!;
  return options[month % 2];
}

function generateHealthTip(month: number, season: string): string {
  const tips: Record<string, string> = {
    spring: '春季肝气旺，宜疏肝理气，多进行户外活动。',
    summer: '夏季心火旺，宜清热降火，保持充足睡眠。',
    autumn: '秋季肺气旺，宜润燥养肺，多食白色食物。',
    winter: '冬季肾气旺，宜早睡晚起，适度进补。',
  };
  return tips[season];
}

function generateKeyDates(month: number, year: number): KeyDate[] {
  const dates: KeyDate[] = [];
  const festivals = FESTIVAL_DATES.filter(f => f.month === month);
  festivals.forEach(f => {
    dates.push({
      date: `${year}-${String(month).padStart(2, '0')}-${String(f.day).padStart(2, '0')}`,
      description: f.name,
      energy: f.energy,
    });
  });
  if (month === 3) dates.push({ date: `${year}-03-20`, description: '春分', energy: 'transformative' });
  if (month === 6) dates.push({ date: `${year}-06-21`, description: '夏至', energy: 'opportunistic' });
  if (month === 9) dates.push({ date: `${year}-09-22`, description: '秋分', energy: 'opportunistic' });
  if (month === 12) dates.push({ date: `${year}-12-21`, description: '冬至', energy: 'transformative' });
  return dates;
}

function generateAffirmation(month: number, element: string): string {
  const affirmations: Record<string, string> = {
    wood: '我如春日之木，生机勃勃，向上生长。',
    fire: '我如夏日之阳，光芒四射，热情洋溢。',
    metal: '我如秋日之金，坚定有力，收获得失。',
    water: '我如冬日之水，深沉内敛，静待时机。',
    earth: '我如大地之土，稳重踏实，承载万物。',
  };
  return affirmations[element];
}

export function generateYearlyFortune(year: number, animal: string, element: string): YearlyOverview {
  return {
    year,
    animal,
    element,
    overallTheme: `${animal}年${element}气当令，整体运势表现为稳重中求进。`,
    quarterlyForecasts: [
      { quarter: 1 as const, element: '水/木', theme: '开年布局', summary: '开年运势平稳，宜规划全年方向。', focusAreas: ['事业规划', '人际关系', '学习新技能'] },
      { quarter: 2 as const, element: '木/火', theme: '进取拓展', summary: '夏季能量高峰，宜抓住机遇积极行动。', focusAreas: ['事业发展', '财富积累', '感情发展'] },
      { quarter: 3 as const, element: '火/土', theme: '巩固深化', summary: '秋季收敛，适合总结经验、调整方向。', focusAreas: ['自我反思', '关系维护', '健康管理'] },
      { quarter: 4 as const, element: '金/水', theme: '收官总结', summary: '冬季收藏，宜沉淀积累，备战来年。', focusAreas: ['年度复盘', '明年规划', '家庭关系'] },
    ],
    keyTransformationDates: [
      { date: `${year}-02-04`, description: '立春（八字新年）', energy: 'transformative' },
      { date: `${year}-06-21`, description: '夏至', energy: 'opportunistic' },
      { date: `${year}-09-22`, description: '秋分', energy: 'opportunistic' },
      { date: `${year}-12-21`, description: '冬至', energy: 'transformative' },
    ],
  };
}

export { MONTH_CONFIG };
