/**
 * Flying Star Feng Shui Engine (玄空飞星)
 * Based on San Yuan (三元宫) Xuan Kong Fei Xing principles.
 * Calculates yearly and monthly flying star charts for a building.
 */

// 9 Flying Stars with their attributes
export const FLYING_STARS = {
  1: { name: '贪狼', nameEn: 'Greedy Wolf', element: '水', elementEn: 'Water', color: '白', auspicious: true, meaning: 'wealth, career, opportunities' },
  2: { name: '巨门', nameEn: 'Giant Gate', element: '土', elementEn: 'Earth', color: '黑', auspicious: false, meaning: 'sickness, disputes, obstacles' },
  3: { name: '禄存', nameEn: 'Receiving Salary', element: '木', elementEn: 'Wood', color: '碧', auspicious: false, meaning: 'conflict, legal issues, arguments' },
  4: { name: '文曲', nameEn: 'Scholar Phoenix', element: '木', elementEn: 'Wood', color: '绿', auspicious: true, meaning: 'scholarship, creativity, travel' },
  5: { name: '廉贞', nameEn: 'Pure Yi', element: '土', elementEn: 'Earth', color: '黄', auspicious: false, meaning: 'central authority, illness, instability' },
  6: { name: '武曲', nameEn: 'Martial Valor', element: '金', elementEn: 'Metal', color: '白', auspicious: true, meaning: 'authority, retirement, military' },
  7: { name: '破军', nameEn: 'Broken Army', element: '金', elementEn: 'Metal', color: '赤', auspicious: false, meaning: 'destruction, loss, abrupt changes' },
  8: { name: '左辅', nameEn: 'Left Assistant', element: '土', elementEn: 'Earth', color: '白', auspicious: true, meaning: 'support, stability, guardianship' },
  9: { name: '右弼', nameEn: 'Right Assistant', element: '火', elementEn: 'Fire', color: '紫', auspicious: true, meaning: 'auspiciousness, blessing, nobility' },
} as const;

// 8 Compass Directions
export const DIRECTIONS = {
  '北': { angle: 0, index: 0, name: 'North', trigram: '坎' },
  '东北': { angle: 45, index: 1, name: 'Northeast', trigram: '艮' },
  '东': { angle: 90, index: 2, name: 'East', trigram: '震' },
  '东南': { angle: 135, index: 3, name: 'Southeast', trigram: '巽' },
  '南': { angle: 180, index: 4, name: 'South', trigram: '离' },
  '西南': { angle: 225, index: 5, name: 'Southwest', trigram: '坤' },
  '西': { angle: 270, index: 6, name: 'West', trigram: '兑' },
  '西北': { angle: 315, index: 7, name: 'Northwest', trigram: '乾' },
} as const;

// 9-Grid palace positions (1-9)
export type PalacePosition = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// Grid layout:
// 4 9 2
// 3 5 7
// 8 1 6

// 9 palaces correspond to:
// 1=NorthCenter, 2=SouthCenter, 3=EastCenter, 4=WestCenter
// 5=Center, 6=SouthwestCorner, 7=NortheastCorner, 8=NorthwestCorner, 9=SoutheastCorner

export interface FlyingStar {
  number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  name: string;
  nameEn: string;
  element: string;
  elementEn: string;
  color: string;
  auspicious: boolean;
  meaning: string;
}

export interface Palace {
  position: PalacePosition;
  direction: string;
  directionEn: string;
  trigram: string;
  star: FlyingStar | null;
  currentStar: number | null;
  mountainStar: number | null;
  waterStar: number | null;
}

export interface FlyingStarChart {
  year: number;
  period: number; // 1-9 (三元龙运)
  buildingAge: number;
  facing: string;
  palaces: Palace[];
  yearlyMountainStar: number;
  yearlyWaterStar: number;
}

export interface MonthlyStar {
  month: number;
  monthName: string;
  palaces: Palace[];
}

// Calculate the period (运) number based on year
// San Yuan uses 20-year periods divided into 3 yuan
// Each yuan = 60 years, each xun = 20 years
function getPeriodForYear(year: number): number {
  // San Yuan period calculation from 1864 (first year of Xuan Kong)
  // Period 1: 1864-1883, Period 2: 1884-1903, Period 3: 1904-1923
  // Period 4: 1924-1943, Period 5: 1944-1963, Period 6: 1964-1983
  // Period 7: 1984-2003, Period 8: 2004-2023, Period 9: 2024-2043
  
  if (year < 1864) {
    // Before 1864, use 60-year cycle
    const offset = (year - 1864) % 180;
    const periodFrom1864 = Math.floor(Math.abs(offset) / 20) + 1;
    return ((periodFrom1864 - 1) % 9) + 1;
  }
  
  const yearsSince1864 = year - 1864;
  const totalPeriods = Math.floor(yearsSince1864 / 20);
  return ((totalPeriods % 9) + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
}

// Get the base star placement for a given period
// This uses the Xuan Kong Fei Xing "sheng Qi" (generate) sequence
function getBaseChartForPeriod(period: number): Map<PalacePosition, number> {
  // For each period, the 9 stars are arranged differently
  // The "qi" (生气) of the period enters the palace first
  // Following the "sheng qi" cycle: 1→2→3→4→5→6→7→8→9→1
  
  // Standard starting arrangement for each period
  // Period 1 (1864-1883): 1 in center
  // Period 2 (1884-1903): 2 in center
  // etc.
  
  const baseArrangement: Record<number, Record<PalacePosition, number>> = {
    1: { 1: 6, 2: 7, 3: 8, 4: 9, 5: 1, 6: 2, 7: 3, 8: 4, 9: 5 },
    2: { 1: 7, 2: 8, 3: 9, 4: 1, 5: 2, 6: 3, 7: 4, 8: 5, 9: 6 },
    3: { 1: 8, 2: 9, 3: 1, 4: 2, 5: 3, 6: 4, 7: 5, 8: 6, 9: 7 },
    4: { 1: 9, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7, 9: 8 },
    5: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9 }, // Special case - 5 in all
    6: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 1 },
    7: { 1: 3, 2: 4, 3: 5, 4: 6, 5: 7, 6: 8, 7: 9, 8: 1, 9: 2 },
    8: { 1: 4, 2: 5, 3: 6, 4: 7, 5: 8, 6: 9, 7: 1, 8: 2, 9: 3 },
    9: { 1: 5, 2: 6, 3: 7, 4: 8, 5: 9, 6: 1, 7: 2, 8: 3, 9: 4 },
  };
  
  const result = new Map<PalacePosition, number>();
  const arrangement = baseArrangement[period];
  for (const [pos, star] of Object.entries(arrangement)) {
    result.set(parseInt(pos) as PalacePosition, star);
  }
  return result;
}

// Get the yearly flying star for a specific year and position
// Uses the "san zai ba gua" cycle
function getYearlyStarCycle(year: number): Map<PalacePosition, number> {
  // The yearly flying star cycles through the 9 positions over 9 years
  // Year 1: 1 enters, Year 2: 2 enters, etc.
  // Position 1 = North (坎), Position 9 = Southeast (巽)
  
  const yearInCycle = ((year - 1864) % 9 + 9) % 9; // 0-8
  const enteringStar = (yearInCycle + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  
  const result = new Map<PalacePosition, number>();
  
  // The star enters position 1, then flows in the "sheng qi" direction
  // 1→2→3→4→5→6→7→8→9 (clockwise in the 9-grid)
  // But the actual flow is: the star enters 1, the star in 1 goes to 2, etc.
  
  // Using the correct Fei Xing sequence for yearly stars
  // The entering star starts at position based on the cycle
  for (let pos = 1; pos <= 9; pos++) {
    // Standard cycle: star in position n = ((enteringStar + n - 2) % 9) + 1
    const star = (((enteringStar + pos - 2) % 9) + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    result.set(pos as PalacePosition, star);
  }
  
  return result;
}

// Get the palace direction mapping
function getPalaceDirection(position: PalacePosition): { direction: string; directionEn: string; trigram: string } {
  const mapping: Record<PalacePosition, { direction: string; directionEn: string; trigram: string }> = {
    1: { direction: '北', directionEn: 'North', trigram: '坎' },
    2: { direction: '南', directionEn: 'South', trigram: '离' },
    3: { direction: '东', directionEn: 'East', trigram: '震' },
    4: { direction: '西', directionEn: 'West', trigram: '兑' },
    5: { direction: '中', directionEn: 'Center', trigram: '中' },
    6: { direction: '西南', directionEn: 'Southwest', trigram: '坤' },
    7: { direction: '东北', directionEn: 'Northeast', trigram: '艮' },
    8: { direction: '西北', directionEn: 'Northwest', trigram: '乾' },
    9: { direction: '东南', directionEn: 'Southeast', trigram: '巽' },
  };
  return mapping[position];
}

// Rotate the chart based on building facing direction
function rotateChartForFacing(baseChart: Map<PalacePosition, number>, facing: string): Map<PalacePosition, number> {
  const facingInfo = DIRECTIONS[facing as keyof typeof DIRECTIONS];
  if (!facingInfo) {
    return baseChart; // Default if facing not recognized
  }
  
  // The facing direction determines how we orient the chart
  // If facing North (0°), the chart is standard
  // Each 45° rotation shifts the palace positions
  
  const rotationSteps = facingInfo.index; // 0-7 for 8 directions
  
  if (rotationSteps === 0) {
    return baseChart; // No rotation needed
  }
  
  // When facing changes, we rotate the grid
  // Standard: position 1 = North
  // If facing East (90°), then what was East becomes the "front"
  // We need to rotate the stars in the opposite direction
  
  const rotated = new Map<PalacePosition, number>();
  
  // Standard grid positions (when facing South by default):
  // Position: Direction mapping
  // 1=North, 2=South, 3=East, 4=West, 5=Center, 6=SW, 7=NE, 8=NW, 9=SE
  
  // When we rotate by n steps (45° each), we remap positions
  // Clockwise rotation of the compass means counter-clockwise rotation of stars
  
  const positionToDirection = [
    { pos: 1, dir: '北' },
    { pos: 2, dir: '南' },
    { pos: 3, dir: '东' },
    { pos: 4, dir: '西' },
    { pos: 5, dir: '中' },
    { pos: 6, dir: '西南' },
    { pos: 7, dir: '东北' },
    { pos: 8, dir: '西北' },
    { pos: 9, dir: '东南' },
  ];
  
  const directionToPosition: Record<string, number> = {};
  positionToDirection.forEach(({ pos, dir }) => {
    directionToPosition[dir] = pos;
  });
  
  for (const [pos, star] of baseChart) {
    const dirInfo = getPalaceDirection(pos);
    const currentDir = dirInfo.direction;
    
    // Find the direction index
    const dirIndex = Object.keys(DIRECTIONS).indexOf(currentDir);
    const newDirIndex = (dirIndex - rotationSteps + 8) % 8;
    const newDir = Object.keys(DIRECTIONS)[newDirIndex];
    const newPos = directionToPosition[newDir] || 5;
    
    rotated.set(newPos as PalacePosition, star);
  }
  
  return rotated;
}

// Main calculation function
export function calculateFlyingStars(year: number, buildingFacing: string): FlyingStarChart {
  const period = getPeriodForYear(year);
  const baseChart = getBaseChartForPeriod(period);
  const yearlyStars = getYearlyStarCycle(year);
  
  // Adjust for building age (older buildings have different charts)
  const adjustedChart = adjustForBuildingAge(baseChart, year, buildingFacing);
  
  // Rotate based on facing
  const rotatedChart = rotateChartForFacing(adjustedChart, buildingFacing);
  
  // Calculate mountain and water stars (山星和水星)
  // Mountain star = star in position 1 (or adjusted for facing)
  // Water star = star in position 2 (or adjusted for facing)
  const mountainStar = rotatedChart.get(7) || 5; // Default to center position for mountain
  const waterStar = rotatedChart.get(2) || 5;
  
  const palaces: Palace[] = [];
  for (let pos = 1; pos <= 9; pos++) {
    const starNumber = rotatedChart.get(pos as PalacePosition) || 5;
    const starInfo = FLYING_STARS[starNumber as keyof typeof FLYING_STARS];
    const dirInfo = getPalaceDirection(pos as PalacePosition);
    
    palaces.push({
      position: pos as PalacePosition,
      direction: dirInfo.direction,
      directionEn: dirInfo.directionEn,
      trigram: dirInfo.trigram,
      star: {
        number: starNumber as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
        name: starInfo.name,
        nameEn: starInfo.nameEn,
        element: starInfo.element,
        elementEn: starInfo.elementEn,
        color: starInfo.color,
        auspicious: starInfo.auspicious,
        meaning: starInfo.meaning,
      },
      currentStar: starNumber,
      mountainStar: pos === 7 ? starNumber : null,
      waterStar: pos === 2 ? starNumber : null,
    });
  }
  
  return {
    year,
    period,
    buildingAge: new Date().getFullYear() - year,
    facing: buildingFacing,
    palaces,
    yearlyMountainStar: mountainStar,
    yearlyWaterStar: waterStar,
  };
}

// Adjust chart based on building age (三元玄空飞星 rule)
// Older buildings use different period charts
function adjustForBuildingAge(baseChart: Map<PalacePosition, number>, year: number, facing: string): Map<PalacePosition, number> {
  // For San Yuan Fei Xing, the building's "age" determines which yuan's chart to use
  // A building constructed in which period uses that period's chart
  
  // The building age calculation: if building was built in year X,
  // use the period for year X, not the current year
  
  // Simplified: we use the current year to determine the chart
  // A more sophisticated version would track the building's original period
  
  // For now, just return the base chart
  // The period already accounts for the 20-year cycles
  return baseChart;
}

// Calculate monthly flying stars
export function calculateMonthlyStars(year: number, month: number): MonthlyStar {
  const monthNames = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  
  // Monthly flying stars follow a different cycle
  // The entering star for each month is based on the yearly star cycle
  // and the specific month's position
  
  // Monthly star cycle: each month, the flying stars shift
  // Using the standard Xuan Kong monthly chart
  const monthlyStartingStar = ((year % 9) + month) % 9 + 1;
  
  // Monthly positions cycle through the 9 palaces
  // Position 1 always gets the starting star for the month
  const result = new Map<PalacePosition, number>();
  
  for (let pos = 1; pos <= 9; pos++) {
    const star = (((monthlyStartingStar + pos - 2) % 9) + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    result.set(pos as PalacePosition, star);
  }
  
  const palaces: Palace[] = [];
  for (let pos = 1; pos <= 9; pos++) {
    const starNumber = result.get(pos as PalacePosition) || 5;
    const starInfo = FLYING_STARS[starNumber as keyof typeof FLYING_STARS];
    const dirInfo = getPalaceDirection(pos as PalacePosition);
    
    palaces.push({
      position: pos as PalacePosition,
      direction: dirInfo.direction,
      directionEn: dirInfo.directionEn,
      trigram: dirInfo.trigram,
      star: {
        number: starNumber as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
        name: starInfo.name,
        nameEn: starInfo.nameEn,
        element: starInfo.element,
        elementEn: starInfo.elementEn,
        color: starInfo.color,
        auspicious: starInfo.auspicious,
        meaning: starInfo.meaning,
      },
      currentStar: starNumber,
      mountainStar: null,
      waterStar: null,
    });
  }
  
  return {
    month,
    monthName: monthNames[month - 1] || 'Unknown',
    palaces,
  };
}

// Get interpretation for a flying star
export function getStarInterpretation(starNumber: number, position: PalacePosition): string {
  const star = FLYING_STARS[starNumber as keyof typeof FLYING_STARS];
  const posInfo = getPalaceDirection(position);
  
  const interpretations: Record<number, { zh: string; en: string }> = {
    1: {
      zh: `一白贪狼星临${posInfo.direction}宫。此星为吉星，主事业、财运、人际关系。适合创业、投资、社交。`,
      en: `1 White Greedy Wolf star in ${posInfo.directionEn} palace. This is an auspicious star governing career, wealth, and relationships. Good for entrepreneurship, investment, and networking.`,
    },
    2: {
      zh: `二黑巨门星临${posInfo.direction}宫。此星为凶星，主疾病、纠纷、口舌是非。需特别注意健康和处事方式。`,
      en: `2 Black Giant Gate star in ${posInfo.directionEn} palace. This is an inauspicious star associated with illness, disputes, and conflicts. Pay special attention to health and how you handle situations.`,
    },
    3: {
      zh: `三碧禄存星临${posInfo.direction}宫。此星主是非争执、诉讼诉讼。处事宜低调，忌冲动行事。`,
      en: `3 Green Receiving Salary star in ${posInfo.directionEn} palace. This star governs arguments, disputes, and legal matters. Act cautiously and avoid impulsive behavior.`,
    },
    4: {
      zh: `四绿文曲星临${posInfo.direction}宫。此星主学业、文化、艺术才华。利于考试、创作、学习。`,
      en: `4 Green Scholar Phoenix star in ${posInfo.directionEn} palace. This star governs scholarship, culture, and artistic talent. Beneficial for exams, creative work, and learning.`,
    },
    5: {
      zh: `五黄廉贞星临${posInfo.direction}宫。此星为最大凶星，主灾祸、疾病、意外。务必谨慎行事，忌大兴土木。`,
      en: `5 Yellow Pure Yi star in ${posInfo.directionEn} palace. This is the most inauspicious star, associated with disasters, illness, and accidents. Be extremely cautious and avoid major construction.`,
    },
    6: {
      zh: `六白武曲星临${posInfo.direction}宫。此星为吉星，主权威、事业成就、贵人相助。利于事业发展和地位提升。`,
      en: `6 White Martial Valor star in ${posInfo.directionEn} palace. This is an auspicious star governing authority, career achievement, and support from VIPs. Beneficial for career advancement and status improvement.`,
    },
    7: {
      zh: `七赤破军星临${posInfo.direction}宫。此星为凶星，主破财、损失、变动。需保守理财，忌冒险投机。`,
      en: `7 Red Broken Army star in ${posInfo.directionEn} palace. This is an inauspicious star associated with financial loss, damage, and abrupt changes. Be conservative with finances and avoid speculative ventures.`,
    },
    8: {
      zh: `八白左辅星临${posInfo.direction}宫。此星为大吉星，主财富、置业、稳定。利于积累财产和购置不动产。`,
      en: `8 White Left Assistant star in ${posInfo.directionEn} palace. This is a highly auspicious star governing wealth, property, and stability. Beneficial for accumulating assets and real estate.`,
    },
    9: {
      zh: `九紫右弼星临${posInfo.direction}宫。此星为吉星，主姻缘、喜庆、好事临门。利于嫁娶、订婚、社交活动。`,
      en: `9 Purple Right Assistant star in ${posInfo.directionEn} palace. This is an auspicious star governing relationships, celebrations, and good news. Beneficial for marriage, engagements, and social events.`,
    },
  };
  
  return interpretations[starNumber]?.zh || interpretations[5].zh;
}

// Get remedy suggestions based on star and position
export function getRemedies(starNumber: number, position: PalacePosition): string[] {
  const remedies: Record<number, string[]> = {
    1: ['放置蓝色或黑色水晶球', '挂山水画招财', '摆放鱼缸招财水'],
    2: ['放置黄色陶瓷化解', '挂八白玉佩', '摆放金属装饰'],
    3: ['放置绿色植物化煞', '挂木制装饰', '避免在此方位争执'],
    4: ['放置文昌塔或书籍', '挂四支毛笔', '摆放文竹或富贵竹'],
    5: ['放置金属铃铛化泄', '挂六枚铜钱', '避免在此方位进行大型装修'],
    6: ['放置圆形金属装饰', '挂金钟或金属风铃', '摆放金属奖杯或荣誉物品'],
    7: ['放置红色中国结化泄', '挂五行为火的装饰', '避免在此方位进行投资'],
    8: ['放置白色陶瓷化解', '摆放开光玉白菜', '摆放聚宝盆或金元宝'],
    9: ['放置紫色水晶化解', '挂红灯笼或红色装饰', '摆放喜庆用品如鸳鸯或并蒂莲'],
  };
  
  return remedies[starNumber] || remedies[5];
}
