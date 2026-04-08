/**
 * ZiweiEngine — wrapper around the iztro library for Zi Wei Dou Shu calculations.
 * Provides a clean TypeScript interface for the TianJi Global platform.
 */

import { astro } from 'iztro';
import type FunctionalAstrolabe from 'iztro/lib/astro/FunctionalAstrolabe';

export type BirthdayType = 'solar' | 'lunar';
export type Gender = 'male' | 'female';
export type Language = 'zh-CN' | 'zh-TW' | 'en-US' | 'ja' | 'ko' | 'vi';

/**
 * Parameters for generating a Zi Wei astrolabe via solar (Gregorian) date.
 */
export interface SolarBirthParams {
  birthday: string; // YYYY-MM-DD format
  birthTime: number; // 0-12 (时辰 index: 0=子时, 1=丑时, ...)
  gender: Gender;
  leapMonth?: boolean; // whether the month is a leap month (for lunar input)
  language?: Language;
}

/**
 * Parameters for generating a Zi Wei astrolabe via lunar date.
 */
export interface LunarBirthParams {
  birthday: string; // YYYY-MM-DD (lunar calendar date)
  birthTime: number; // 0-12 (时辰 index)
  gender: Gender;
  leapMonth: boolean; // whether the input month is a leap month
  language?: Language;
}

/**
 * Full Zi Wei birth chart data returned by the engine.
 */
export interface ZiweiChart {
  /** The raw iztro FunctionalAstrolabe for advanced usage */
  raw: FunctionalAstrolabe;
  /** Life Palace (命宫) display name */
  lifePalaceName: string;
  /** Body Palace (身宫) display name */
  bodyPalaceName: string;
  /** Solar date string used */
  solarDate: string;
  /** Lunar date string */
  lunarDate: string;
  /** Gender */
  gender: Gender;
  /** Birthday used for calculation */
  birthday: string;
  /** Birth time index (0-12) */
  birthTime: number;
  /** Birthday type */
  birthdayType: BirthdayType;
  /** Language used */
  language: Language;
  /** Five Elements Class (五行局) */
  fiveElementsClass: string;
  /** Main soul star */
  soul: string;
  /** Main body star */
  body: string;
  /** Zodiac animal */
  zodiac: string;
  /** Western zodiac sign */
  sign: string;
}

/**
 * Validates a date string is in YYYY-MM-DD format.
 */
function isValidDateString(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

/**
 * Builds a ZiweiChart object from iztro's FunctionalAstrolabe.
 */
function buildChart(
  astrolabe: FunctionalAstrolabe,
  birthday: string,
  birthTime: number,
  gender: Gender,
  birthdayType: BirthdayType,
  language: Language,
): ZiweiChart {
  // Life Palace is always at index 0; Body Palace has isBodyPalace=true
  const lifePalace = astrolabe.palaces[0];
  const bodyPalace = astrolabe.palaces.find(p => p.isBodyPalace);

  return {
    raw: astrolabe,
    lifePalaceName: lifePalace?.name || '',
    bodyPalaceName: bodyPalace?.name || '',
    solarDate: astrolabe.solarDate,
    lunarDate: astrolabe.lunarDate,
    gender,
    birthday,
    birthTime,
    birthdayType,
    language,
    fiveElementsClass: astrolabe.fiveElementsClass,
    soul: astrolabe.soul,
    body: astrolabe.body,
    zodiac: astrolabe.zodiac,
    sign: astrolabe.sign,
  };
}

/**
 * Generates a Zi Wei astrolabe from a solar (Gregorian) birthday.
 *
 * @example
 * const chart = generateBySolar({ birthday: '2000-08-16', birthTime: 2, gender: 'male' });
 */
export function generateBySolar(params: SolarBirthParams): ZiweiChart {
  const {
    birthday,
    birthTime,
    gender,
    leapMonth = false,
    language = 'zh-CN',
  } = params;

  if (!isValidDateString(birthday)) {
    throw new Error(`Invalid solar date format: "${birthday}". Expected YYYY-MM-DD.`);
  }
  if (birthTime < 0 || birthTime > 12) {
    throw new Error(`Invalid birthTime: ${birthTime}. Must be 0-12.`);
  }

  const astrolabe = astro.bySolar(birthday, birthTime, gender, leapMonth, language);

  return buildChart(astrolabe, birthday, birthTime, gender, 'solar', language);
}

/**
 * Generates a Zi Wei astrolabe from a lunar birthday.
 *
 * @example
 * const chart = generateByLunar({ birthday: '2000-07-17', birthTime: 2, gender: 'male', leapMonth: false });
 */
export function generateByLunar(params: LunarBirthParams): ZiweiChart {
  const {
    birthday,
    birthTime,
    gender,
    leapMonth,
    language = 'zh-CN',
  } = params;

  if (!isValidDateString(birthday)) {
    throw new Error(`Invalid lunar date format: "${birthday}". Expected YYYY-MM-DD.`);
  }
  if (birthTime < 0 || birthTime > 12) {
    throw new Error(`Invalid birthTime: ${birthTime}. Must be 0-12.`);
  }

  // iztro.byLunar signature: (date, birthTime, gender, isLeapMonth, fixLeap, language)
  const astrolabe = astro.byLunar(birthday, birthTime, gender, leapMonth, true, language);

  return buildChart(astrolabe, birthday, birthTime, gender, 'lunar', language);
}

/**
 * Converts a birth time hour (0-23) to iztro's 时辰 index (0-12).
 *
 * 时辰 mapping:
 *  0: 子时 (23:00-00:59)
 *  1: 丑时 (01:00-02:59)
 *  2: 寅时 (03:00-04:59)
 *  3: 卯时 (05:00-06:59)
 *  4: 辰时 (07:00-08:59)
 *  5: 巳时 (09:00-10:59)
 *  6: 午时 (11:00-12:59)
 *  7: 未时 (13:00-14:59)
 *  8: 申时 (15:00-16:59)
 *  9: 酉时 (17:00-18:59)
 * 10: 戌时 (19:00-20:59)
 * 11: 亥时 (21:00-22:59)
 * 12: 子时 (23:00-23:59) — same as index 0, end of 夜子时
 */
export function hourToShichenIndex(hour: number): number {
  if (hour >= 23 || hour < 1) return 0; // 子时
  return Math.floor((hour + 1) / 2);
}

export { astro };
export type { FunctionalAstrolabe };
