'use strict';

/**
 * BaZi (八字) — Four Pillars of Destiny calculation engine.
 *
 * Derives the Heavenly Stem (天干) and Earthly Branch (地支)
 * for each of the four pillars: Year, Month, Day, and Hour.
 */

const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ELEMENTS = ['Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water'];

/**
 * Calculates the Heavenly Stem index for a given year.
 * Base reference: 1984 (甲子 year) → stem index 0.
 *
 * @param {number} year - Gregorian year
 * @returns {number} stem index (0–9)
 */
function yearStemIndex(year) {
  return ((year - 4) % 10 + 10) % 10;
}

/**
 * Calculates the Earthly Branch index for a given year.
 * Base reference: 1984 (甲子 year) → branch index 0.
 *
 * @param {number} year - Gregorian year
 * @returns {number} branch index (0–11)
 */
function yearBranchIndex(year) {
  return ((year - 4) % 12 + 12) % 12;
}

/**
 * Derives the Hour pillar branch index from the clock hour (0–23).
 *
 * @param {number} hour - Clock hour (0–23)
 * @returns {number} branch index (0–11)
 */
function hourBranchIndex(hour) {
  // Each earthly branch covers two hours; 子时 starts at 23:00.
  return Math.floor(((hour + 1) % 24) / 2);
}

/**
 * Builds a single pillar object.
 *
 * @param {number} stemIdx  - Index into HEAVENLY_STEMS (0–9)
 * @param {number} branchIdx - Index into EARTHLY_BRANCHES (0–11)
 * @returns {{ heavenlyStem: string, earthlyBranch: string, element: string }}
 */
function buildPillar(stemIdx, branchIdx) {
  return {
    heavenlyStem: HEAVENLY_STEMS[stemIdx % 10],
    earthlyBranch: EARTHLY_BRANCHES[branchIdx % 12],
    element: ELEMENTS[stemIdx % 10],
  };
}

/**
 * Calculates the full BaZi (Four Pillars) chart.
 *
 * @param {{ year: number, month: number, day: number, hour: number }} birthDate
 * @returns {{ year: object, month: object, day: object, hour: object, dayMasterElement: string }}
 */
function calculateBaZi({ year, month, day, hour }) {
  const yearStem = yearStemIndex(year);
  const yearBranch = yearBranchIndex(year);

  // Month stem is derived from year stem and month number (1-based)
  const monthStem = ((yearStem % 5) * 2 + (month - 1)) % 10;
  const monthBranch = (month + 1) % 12; // 寅 (index 2) = month 1

  // Day calculation (simplified Julian Day Number approach)
  const jdn = julianDayNumber(year, month, day);
  const dayStem = ((jdn - 11) % 10 + 10) % 10;
  const dayBranch = ((jdn - 11) % 12 + 12) % 12;

  const hourBranch = hourBranchIndex(hour);
  const hourStem = ((dayStem % 5) * 2 + hourBranch) % 10;

  return {
    year: buildPillar(yearStem, yearBranch),
    month: buildPillar(monthStem, monthBranch),
    day: buildPillar(dayStem, dayBranch),
    hour: buildPillar(hourStem, hourBranch),
    dayMasterElement: ELEMENTS[dayStem % 10],
  };
}

/**
 * Computes the Julian Day Number for a given Gregorian calendar date.
 * Used as a stable, epoch-independent base for day pillar calculations.
 *
 * @param {number} y - Year
 * @param {number} m - Month (1–12)
 * @param {number} d - Day (1–31)
 * @returns {number}
 */
function julianDayNumber(y, m, d) {
  const a = Math.floor((14 - m) / 12);
  const yr = y + 4800 - a;
  const mo = m + 12 * a - 3;
  return d + Math.floor((153 * mo + 2) / 5) + 365 * yr +
    Math.floor(yr / 4) - Math.floor(yr / 100) + Math.floor(yr / 400) - 32045;
}

module.exports = { calculateBaZi, HEAVENLY_STEMS, EARTHLY_BRANCHES, ELEMENTS };
