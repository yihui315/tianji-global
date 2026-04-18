/**
 * Seasonal/Monthly Fortune Content Types
 * 月度运势内容生成系统
 */

export interface KeyDate {
  date: string; // YYYY-MM-DD
  description: string;
  energy: 'challenging' | 'opportunistic' | 'transformative';
}

export interface MonthlyFortune {
  month: number; // 1-12
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  overallEnergy: string;
  luckySigns: string[];
  challengingSigns: string[];
  loveHoroscope: string;
  careerHoroscope: string;
  wealthHoroscope: string;
  healthTip: string;
  keyDates: KeyDate[];
  affirmation: string;
}

export interface SeasonalForecast {
  season: string;
  element: string;
  dominantTheme: string;
  opportunities: string[];
  challenges: string[];
  recommendedCrystals: string[];
  recommendedAffirmations: string[];
}

export interface QuarterlyFortune {
  quarter: 1 | 2 | 3 | 4;
  element: string;
  theme: string;
  summary: string;
  focusAreas: string[];
}

export interface YearlyOverview {
  year: number;
  animal: string;
  element: string;
  overallTheme: string;
  quarterlyForecasts: QuarterlyFortune[];
  keyTransformationDates: KeyDate[];
}
