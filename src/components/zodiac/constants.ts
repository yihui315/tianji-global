import { AspectType } from './types';

export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;

export const ZODIAC_SIGNS_ZH: Record<string, string> = {
  Aries: '白羊', Taurus: '金牛', Gemini: '双子', Cancer: '巨蟹',
  Leo: '狮子', Virgo: '处女', Libra: '天秤', Scorpio: '天蝎',
  Sagittarius: '射手', Capricorn: '摩羯', Aquarius: '水瓶', Pisces: '双鱼'
};

export const PLANET_NAMES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
  'North Node', 'South Node', 'Chiron'
] as const;

export const PLANET_NAMES_ZH: Record<string, string> = {
  Sun: '太阳', Moon: '月亮', Mercury: '水星', Venus: '金星', Mars: '火星',
  Jupiter: '木星', Saturn: '土星', Uranus: '天王星', Neptune: '海王星', Pluto: '冥王星',
  'North Node': '北交', 'South Node': '南交', Chiron: '凯龙'
};

export const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '⛢', Neptune: '♆', Pluto: '♇',
  'North Node': '☊', 'South Node': '☋', Chiron: '⚷'
};

export const ASPECT_CONFIG: Record<AspectType, { angle: number; orb: number; color: string; style: string }> = {
  conjunction: { angle: 0, orb: 10, color: '#ffffff', style: 'solid' },
  'semi-sextile': { angle: 30, orb: 3, color: '#888888', style: 'dotted' },
  sextile: { angle: 60, orb: 6, color: '#4CAF50', style: 'solid' },
  square: { angle: 90, orb: 8, color: '#f44336', style: 'solid' },
  trine: { angle: 120, orb: 8, color: '#2196F3', style: 'solid' },
  quincunx: { angle: 150, orb: 3, color: '#9C27B0', style: 'dotted' },
  opposition: { angle: 180, orb: 10, color: '#FF9800', style: 'solid' }
};

export const SIGN_SYMBOLS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓'
};

export const SIGN_ELEMENTS: Record<string, 'fire' | 'earth' | 'air' | 'water'> = {
  Aries: 'fire', Leo: 'fire', Sagittarius: 'fire',
  Taurus: 'earth', Virgo: 'earth', Capricorn: 'earth',
  Gemini: 'air', Libra: 'air', Aquarius: 'air',
  Cancer: 'water', Scorpio: 'water', Pisces: 'water'
};

export const ELEMENT_COLORS: Record<string, string> = {
  fire: '#E57373',
  earth: '#81C784',
  air: '#64B5F6',
  water: '#4DD0E1'
};

export const CHART_DIMENSIONS = {
  viewBox: '0 0 800 800',
  center: { x: 400, y: 400 },
  outerRing: 380,
  houseRing: 320,
  planetRing: 260,
  innerCircle: 80,
  signArcDegrees: 30
};
