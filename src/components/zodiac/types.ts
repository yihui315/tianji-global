export type HouseSystem = 'PLACIDUS' | 'KOCH' | 'EQUAL' | 'WHOLE_SIGN' | 'CAMPANUS';
export type ZodiacType = 'TROPICAL' | 'SIDEREAL';
export type AspectType = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition' | 'semi-sextile' | 'quincunx';
export type Theme = 'dark' | 'light' | 'transparent';

export interface Planet {
  name: string;
  sign: string;
  degree: number; // 0-29.99
  house: number; // 1-12
  isRetrograde: boolean;
  speed: number; // degrees per day, negative = retrograde
  longitude: number; // 0-360 zodiac longitude
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: AspectType;
  orb: number;
}

export interface HouseCusp {
  house: number;
  cuspDegree: number;
  sign: string;
  signDegree: number;
}

export interface ZodiacChartProps {
  date: Date;
  time: string;
  location: { lat: number; lng: number; name: string };
  houseSystem: HouseSystem;
  zodiacType: ZodiacType;
  showAspects: boolean;
  showHouseCusps: boolean;
  showSignBoundaries: boolean;
  showPlanetDegrees: boolean;
  showCuspDegrees: boolean;
  aspectTypes: AspectType[];
  planets: Planet[];
  aspects: Aspect[];
  houseCusps: HouseCusp[];
  onPlanetClick?: (planet: Planet) => void;
  onSignClick?: (sign: string) => void;
  onHouseClick?: (house: number) => void;
  size: number;
  theme: Theme;
  language: 'zh' | 'en';
}
