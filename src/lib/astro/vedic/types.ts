export interface GeoLocationInput {
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface BirthInput {
  date: string;
  time?: string;
  timezone?: string;
  location?: GeoLocationInput;
}

export interface KundliSourceMetadata {
  sourceType: 'manual' | 'kundli-pdf-text' | 'computed';
  zodiac: 'sidereal' | 'tropical' | 'unknown';
  ayanamsa: 'Lahiri' | string;
  sourceName?: string;
  extractedAt?: string;
  warnings: string[];
}

export interface NakshatraInfo {
  name: string;
  pada?: number;
  lord?: string;
}

export interface PlanetPosition {
  planet: string;
  sign: string;
  degree?: number;
  house?: number;
  retrograde?: boolean;
  nakshatra?: NakshatraInfo;
}

export interface HousePosition {
  house: number;
  sign: string;
  lord?: string;
}

export interface DashaPeriod {
  system: 'Vimshottari' | string;
  planet: string;
  startDate?: string;
  endDate?: string;
  subPeriods?: DashaPeriod[];
}

export interface VedicChartData {
  metadata: KundliSourceMetadata;
  birth?: BirthInput;
  ascendant?: {
    sign: string;
    degree?: number;
  };
  moonSign?: string;
  moonNakshatra?: NakshatraInfo;
  planets: PlanetPosition[];
  houses: HousePosition[];
  dashaPeriods: DashaPeriod[];
  warnings: string[];
}

export interface RelationshipAstroReport {
  summary: string;
  chartSignals: string[];
  emotionalPattern: string;
  attractionPattern: string;
  relationshipChallenges: string[];
  timingWindows: string[];
  marriagePotential: string;
  compatibilityNotes: string[];
  practicalGuidance: string[];
  disclaimer: string;
}

export interface CompatibilityReport {
  summary: string;
  sharedSignals: string[];
  complementaryPatterns: string[];
  frictionPatterns: string[];
  timingWindows: string[];
  practicalGuidance: string[];
  disclaimer: string;
}

export interface VedicPrompt {
  systemPrompt: string;
  userPrompt: string;
}
