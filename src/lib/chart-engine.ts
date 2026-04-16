// ─── Chart Engine — Astrology Data & Calculations ───────────────────────────────

export interface ZodiacSign {
  name: string;
  nameZh: string;
  symbol: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  quality: 'Cardinal' | 'Fixed' | 'Mutable';
}

export interface Planet {
  name: string;
  symbol: string;
  orb: number;
}

export const ZODIAC_DATA: ZodiacSign[] = [
  { name: 'Aries', nameZh: '白羊', symbol: '♈', element: 'Fire', quality: 'Cardinal' },
  { name: 'Taurus', nameZh: '金牛', symbol: '♉', element: 'Earth', quality: 'Fixed' },
  { name: 'Gemini', nameZh: '双子', symbol: '♊', element: 'Air', quality: 'Mutable' },
  { name: 'Cancer', nameZh: '巨蟹', symbol: '♋', element: 'Water', quality: 'Cardinal' },
  { name: 'Leo', nameZh: '狮子', symbol: '♌', element: 'Fire', quality: 'Fixed' },
  { name: 'Virgo', nameZh: '处女', symbol: '♍', element: 'Earth', quality: 'Mutable' },
  { name: 'Libra', nameZh: '天秤', symbol: '♎', element: 'Air', quality: 'Cardinal' },
  { name: 'Scorpio', nameZh: '天蝎', symbol: '♏', element: 'Water', quality: 'Fixed' },
  { name: 'Sagittarius', nameZh: '射手', symbol: '♐', element: 'Fire', quality: 'Mutable' },
  { name: 'Capricorn', nameZh: '摩羯', symbol: '♑', element: 'Earth', quality: 'Cardinal' },
  { name: 'Aquarius', nameZh: '水瓶', symbol: '♒', element: 'Air', quality: 'Fixed' },
  { name: 'Pisces', nameZh: '双鱼', symbol: '♓', element: 'Water', quality: 'Mutable' },
];

export const PLANET_LIST: Planet[] = [
  { name: 'Sun', symbol: '☉', orb: 0 },
  { name: 'Moon', symbol: '☽', orb: 0 },
  { name: 'Mercury', symbol: '☿', orb: 0 },
  { name: 'Venus', symbol: '♀', orb: 0 },
  { name: 'Mars', symbol: '♂', orb: 0 },
  { name: 'Jupiter', symbol: '♃', orb: 0 },
  { name: 'Saturn', symbol: '♄', orb: 0 },
  { name: 'Uranus', symbol: '♅', orb: 0 },
  { name: 'Neptune', symbol: '♆', orb: 0 },
  { name: 'Pluto', symbol: '♇', orb: 0 },
];

export const ELEM_COLORS: Record<string, string> = {
  Fire: '#FF6B6B', Earth: '#F59E0B', Air: '#60A5FA', Water: '#34D399'
};

export const ELEM_COLORS_ZH: Record<string, string> = {
  Fire: '#FF6B6B', Earth: '#F59E0B', Air: '#60A5FA', Water: '#34D399',
  fire: '#FF6B6B', earth: '#F59E0B', metal: '#60A5FA', water: '#34D399', wood: '#A3E635'
};

export const ELEM_BG: Record<string, string> = {
  Fire: 'rgba(255,107,107,0.15)', Earth: 'rgba(245,158,11,0.15)',
  Air: 'rgba(96,165,250,0.15)', Water: 'rgba(52,211,153,0.15)',
  fire: 'rgba(255,107,107,0.15)', earth: 'rgba(245,158,11,0.15)',
  metal: 'rgba(96,165,250,0.15)', water: 'rgba(52,211,153,0.15)', wood: 'rgba(163,230,53,0.15)'
};

export const PLANET_COLORS: Record<string, string> = {
  Sun: '#FFD700', Moon: '#C0C0C0', Mercury: '#B8860B', Venus: '#98FB98',
  Mars: '#FF6347', Jupiter: '#DAA520', Saturn: '#708090', Uranus: '#40E0D0',
  Neptune: '#4169E1', Pluto: '#8B008B'
};

export const ELEMENTS_ORDER = ['wood', 'fire', 'earth', 'metal', 'water'];
export const ELEMENTS_ZH = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' };
export const ELEMENTS_EN = { wood: 'Wood', fire: 'Fire', earth: 'Earth', metal: 'Air', water: 'Water' };
export const ELEMENTS = ELEMENTS_EN;

export function getSignData(signName: string): ZodiacSign {
  return ZODIAC_DATA.find(s => s.name === signName) ?? ZODIAC_DATA[0];
}

export function signToElement(signName: string): string {
  return getSignData(signName).element.toLowerCase();
}

export function normalizeTo360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

export function degToSign(deg: number): { sign: ZodiacSign; degree: number } {
  const normalized = normalizeTo360(deg);
  const signIndex = Math.floor(normalized / 30);
  const degreeInSign = normalized % 30;
  return { sign: ZODIAC_DATA[signIndex], degree: Math.round(degreeInSign * 100) / 100 };
}
