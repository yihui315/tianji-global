import { NextRequest, NextResponse } from 'next/server';
import {
  calculateFlyingStars,
  calculateMonthlyStars,
  getStarInterpretation,
  getRemedies,
  FLYING_STARS,
  DIRECTIONS,
} from '@/lib/fengshui-engine';

// BaZi birth data interface for personalization
export interface BaZiData {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: 'male' | 'female';
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface FengShuiRequest {
  buildingAge: number; // Year the building was built (e.g., 2015)
  facingDirection: string; // e.g., '北', '东', '南', '西', '东北', '东南', '西南', '西北'
  birthData?: BaZiData; // Optional for personalized remedies
}

interface FengShuiResponse {
  success: boolean;
  yearlyStars: {
    chart: {
      year: number;
      period: number;
      buildingAge: number;
      facing: string;
      palaces: Array<{
        position: number;
        direction: string;
        directionEn: string;
        trigram: string;
        star: {
          number: number;
          name: string;
          nameEn: string;
          element: string;
          elementEn: string;
          color: string;
          auspicious: boolean;
          meaning: string;
        };
        currentStar: number | null;
        mountainStar: number | null;
        waterStar: number | null;
      }>;
      yearlyMountainStar: number;
      yearlyWaterStar: number;
    };
    interpretations: Array<{
      position: number;
      direction: string;
      star: number;
      interpretation: string;
    }>;
  };
  monthlyStars: Array<{
    month: number;
    monthName: string;
    palaces: Array<{
      position: number;
      direction: string;
      directionEn: string;
      star: number;
    }>;
  }>;
  analysis: {
    overallFortune: string;
    goodPalaces: string[];
    badPalaces: string[];
    keyFavorableStars: string[];
    keyUnfavorableStars: string[];
  };
  remedies: Array<{
    palace: string;
    direction: string;
    problem: string;
    solutions: string[];
  }>;
  personalizedRemedies?: Array<{
    basedOn: string;
    suggestions: string[];
  }>;
}

/**
 * Determine the Five Element missing from a BaZi chart (simplified)
 */
function getMissingElement(birthData: BaZiData): string {
  // Simplified: Use birth year to determine the element
  // In a full implementation, this would calculate the full 8 characters
  
  const year = birthData.year;
  const stem = year % 10;
  
  // Heavenly Stems: 0=甲, 1=乙, 2=丙, 3=丁, 4=戊, 5=己, 6=庚, 7=辛, 8=壬, 9=癸
  // Odd stems = Yang, Even stems = Yin
  // Elements: 0,1=木, 2,3=火, 4,5=土, 6,7=金, 8,9=水
  
  const elements = ['木', '火', '土', '金', '水'];
  const elementIndex = Math.floor(stem / 2) % 5;
  const presentElement = elements[elementIndex];
  
  // The missing element is the one not present in the year stem
  // Simplified approach: determine which element cycle the year falls in
  const allElements = ['木', '火', '土', '金', '水'];
  
  // For simplicity, we'll say the missing is based on a simple heuristic
  // Real BaZi would need month pillar as well
  const missingIndex = (elementIndex + 3) % 5; // Cycle back
  return allElements[missingIndex];
}

/**
 * Get element remedies based on missing element
 */
function getElementRemedies(missingElement: string): string[] {
  const elementRemedies: Record<string, string[]> = {
    '木': ['多接触绿色植物', '使用木制家具', '摆放竹子或木材装饰', '穿着绿色衣物'],
    '火': ['多接触阳光', '使用红色或紫色装饰', '摆放电器或蜡烛', '穿着红色衣物'],
    '土': ['多接触陶瓷或泥土', '使用黄色或棕色装饰', '摆放石头或玉石', '穿着黄色衣物'],
    '金': ['多接触金属物品', '使用白色或银色装饰', '摆放金属雕塑或奖杯', '穿着白色衣物'],
    '水': ['多接触水景', '使用蓝色或黑色装饰', '摆放鱼缸或喷泉', '穿着蓝色或黑色衣物'],
  };
  return elementRemedies[missingElement] || elementRemedies['木'];
}

/**
 * Get personalized remedies based on birth data
 */
function getPersonalizedRemedies(birthData: BaZiData): Array<{ basedOn: string; suggestions: string[] }> {
  const missingElement = getMissingElement(birthData);
  
  return [
    {
      basedOn: `根据您的八字，您缺${missingElement}行`,
      suggestions: getElementRemedies(missingElement),
    },
  ];
}

export async function POST(request: NextRequest) {
  try {
    const body: FengShuiRequest = await request.json();
    const { buildingAge, facingDirection, birthData } = body;

    // Validate required fields
    if (!buildingAge || !facingDirection) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: buildingAge, facingDirection' },
        { status: 400 }
      );
    }

    // Validate building age range
    if (buildingAge < 1864 || buildingAge > 2043) {
      return NextResponse.json(
        { success: false, error: 'buildingAge must be between 1864 and 2043' },
        { status: 400 }
      );
    }

    // Validate facing direction
    const validDirections = Object.keys(DIRECTIONS);
    if (!validDirections.includes(facingDirection)) {
      return NextResponse.json(
        { success: false, error: `Invalid facingDirection. Must be one of: ${validDirections.join(', ')}` },
        { status: 400 }
      );
    }

    // Calculate yearly flying star chart
    const currentYear = new Date().getFullYear();
    const yearlyChart = calculateFlyingStars(buildingAge, facingDirection);

    // Generate interpretations for each palace
    const interpretations = yearlyChart.palaces.map(palace => ({
      position: palace.position,
      direction: palace.direction,
      star: palace.currentStar,
      interpretation: getStarInterpretation(palace.currentStar || 5, palace.position),
    }));

    // Calculate monthly stars for current year
    const monthlyStars: Array<{
      month: number;
      monthName: string;
      palaces: Array<{ position: number; direction: string; directionEn: string; star: number }>;
    }> = [];
    
    for (let month = 1; month <= 12; month++) {
      const monthly = calculateMonthlyStars(currentYear, month);
      monthlyStars.push({
        month,
        monthName: monthly.monthName,
        palaces: monthly.palaces.map(p => ({
          position: p.position,
          direction: p.direction,
          directionEn: p.directionEn,
          star: p.currentStar || 5,
        })),
      });
    }

    // Generate overall analysis
    const goodPalaces = yearlyChart.palaces
      .filter(p => p.star?.auspicious)
      .map(p => `${p.direction}(${p.star?.name})`);
    
    const badPalaces = yearlyChart.palaces
      .filter(p => !p.star?.auspicious)
      .map(p => `${p.direction}(${p.star?.name})`);
    
    const keyFavorableStars = [1, 4, 6, 8, 9]
      .filter(n => yearlyChart.palaces.some(p => p.currentStar === n))
      .map(n => `${FLYING_STARS[n as keyof typeof FLYING_STARS].color}${FLYING_STARS[n as keyof typeof FLYING_STARS].name}`);
    
    const keyUnfavorableStars = [2, 3, 5, 7]
      .filter(n => yearlyChart.palaces.some(p => p.currentStar === n))
      .map(n => `${FLYING_STARS[n as keyof typeof FLYING_STARS].color}${FLYING_STARS[n as keyof typeof FLYING_STARS].name}`);

    // Generate remedy suggestions
    const remedies: Array<{
      palace: string;
      direction: string;
      problem: string;
      solutions: string[];
    }> = [];

    for (const palace of yearlyChart.palaces) {
      if (!palace.star?.auspicious && palace.currentStar) {
        const starInfo = FLYING_STARS[palace.currentStar as keyof typeof FLYING_STARS];
        remedies.push({
          palace: `${palace.trigram}宫`,
          direction: palace.direction,
          problem: `${starInfo.color}${starInfo.name}在此方位为${starInfo.auspicious ? '吉' : '凶'}`,
          solutions: getRemedies(palace.currentStar, palace.position),
        });
      }
    }

    // Get personalized remedies if birth data provided
    let personalizedRemedies: Array<{ basedOn: string; suggestions: string[] }> | undefined;
    if (birthData) {
      personalizedRemedies = getPersonalizedRemedies(birthData);
    }

    const response: FengShuiResponse = {
      success: true,
      yearlyStars: {
        chart: {
          year: yearlyChart.year,
          period: yearlyChart.period,
          buildingAge: yearlyChart.buildingAge,
          facing: yearlyChart.facing,
          palaces: yearlyChart.palaces.map(p => ({
            position: p.position,
            direction: p.direction,
            directionEn: p.directionEn,
            trigram: p.trigram,
            star: p.star || {
              number: 5,
              name: '廉贞',
              nameEn: 'Pure Yi',
              element: '土',
              elementEn: 'Earth',
              color: '黄',
              auspicious: false,
              meaning: 'central authority',
            },
            currentStar: p.currentStar,
            mountainStar: p.mountainStar,
            waterStar: p.waterStar,
          })),
          yearlyMountainStar: yearlyChart.yearlyMountainStar,
          yearlyWaterStar: yearlyChart.yearlyWaterStar,
        },
        interpretations,
      },
      monthlyStars,
      analysis: {
        overallFortune: `玄空飞星${yearlyChart.period}运（当前年份${currentYear}）`,
        goodPalaces,
        badPalaces,
        keyFavorableStars,
        keyUnfavorableStars,
      },
      remedies,
      personalizedRemedies,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Feng Shui API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate Feng Shui chart' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'Flying Star Feng Shui API (玄空飞星)',
    version: '1.0.0',
    endpoints: {
      POST: 'Calculate Flying Star chart for a building',
    },
    parameters: {
      buildingAge: 'Year the building was built (1864-2043)',
      facingDirection: 'Building facing direction: 北, 东北, 东, 东南, 南, 西南, 西, 西北',
      birthData: 'Optional BaZi birth data for personalized remedies',
    },
    flyingStars: Object.entries(FLYING_STARS).map(([num, star]) => ({
      number: parseInt(num),
      name: star.name,
      nameEn: star.nameEn,
      element: star.element,
      color: star.color,
      auspicious: star.auspicious,
    })),
  });
}
