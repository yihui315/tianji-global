'use strict';

/**
 * Zi Wei Dou Shu (紫微斗数) — Purple Star Astrology calculation engine.
 *
 * Implements:
 *  1. Life Palace (命宫) determination
 *  2. Body Palace (身宫) determination
 *  3. Zi Wei star system – 14 major stars
 *  4. Tian Fu star system – 8 stars
 *  5. Four Transformations (四化): Lu/Quan/Ke/Ji
 *  6. Full 12-palace configuration
 *
 * Reference algorithm follows the traditional Ming-dynasty Zi Wei system
 * using lunar month and birth hour (地支) as primary inputs.
 */

// ─── Constants ───────────────────────────────────────────────────────────────

const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/** 12 palaces in order starting from 寅 (index 0 = 寅). */
const PALACE_NAMES = [
  '命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫',
  '迁移宫', '交友宫', '官禄宫', '田宅宫', '福德宫', '父母宫',
];

const PALACE_NAMES_EN = [
  'Life', 'Siblings', 'Spouse', 'Children', 'Wealth', 'Health',
  'Travel', 'Friends', 'Career', 'Property', 'Karma', 'Parents',
];

/** Zi Wei (紫微) star group — 14 major stars. */
const ZI_WEI_GROUP = [
  '紫微', '天机', '太阳', '武曲', '天同', '廉贞',
  '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军',
];

/** Tian Fu (天府) star group — 8 supplementary stars. */
const TIAN_FU_GROUP = [
  '文昌', '文曲', '左辅', '右弼', '天魁', '天钺', '禄存', '地空',
];

/**
 * Four Transformations (四化) table keyed by year heavenly stem.
 * Each entry: [禄 Lu, 权 Quan, 科 Ke, 忌 Ji]
 */
const SI_HUA_TABLE = {
  '甲': ['廉贞', '破军', '武曲', '太阳'],
  '乙': ['天机', '天梁', '紫微', '太阴'],
  '丙': ['天同', '天机', '文昌', '廉贞'],
  '丁': ['太阴', '天同', '天机', '巨门'],
  '戊': ['贪狼', '太阴', '右弼', '天机'],
  '己': ['武曲', '贪狼', '天梁', '文曲'],
  '庚': ['太阳', '武曲', '太阴', '天同'],
  '辛': ['巨门', '太阳', '文曲', '文昌'],
  '壬': ['天梁', '紫微', '左辅', '武曲'],
  '癸': ['破军', '巨门', '太阴', '贪狼'],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Maps clock hour (0–23) to earthly branch index (0–11).
 * 子时: 23–01, 丑时: 01–03, …
 *
 * @param {number} hour
 * @returns {number} branch index
 */
function hourToEarthlyBranchIndex(hour) {
  return Math.floor(((hour + 1) % 24) / 2);
}

/**
 * Returns the year heavenly stem (天干) for a Gregorian year.
 *
 * @param {number} year
 * @returns {string}
 */
function yearStem(year) {
  return HEAVENLY_STEMS[((year - 4) % 10 + 10) % 10];
}

/**
 * Returns the approximate lunar month from a Gregorian date.
 * This is a simplified approximation (±1 month accuracy) suitable for
 * most birth-chart use-cases; production would use a proper lunisolar library.
 *
 * @param {number} month - Gregorian month (1–12)
 * @param {number} day   - Gregorian day (1–31)
 * @returns {number} lunar month (1–12)
 */
function approximateLunarMonth(month, day) {
  // Each solar month maps roughly to the same lunar month,
  // offset by ~22 days from the start of the Chinese New Year.
  const offset = day >= 22 ? 1 : 0;
  return ((month - 1 + offset) % 12) + 1;
}

// ─── Life Palace (命宫) ───────────────────────────────────────────────────────

/**
 * Determines the earthly-branch index of the Life Palace (命宫).
 *
 * Traditional algorithm:
 *   Start at 寅 (index 2 in EARTHLY_BRANCHES, palace slot 0).
 *   Count forward (month - 1) slots for the month.
 *   Count backward (hourBranch + 1) slots for the hour.
 *   Result mod 12 gives the Life Palace branch.
 *
 * @param {number} lunarMonth - Lunar month (1–12)
 * @param {number} hourBranch - Earthly branch index of birth hour (0–11)
 * @returns {number} earthly branch index of Life Palace (0–11)
 */
function calculateLifePalaceBranch(lunarMonth, hourBranch) {
  // 寅 = branch index 2; Life Palace = 寅 + (月 - 1) - 时支
  const raw = (2 + (lunarMonth - 1) - hourBranch + 120) % 12;
  return raw;
}

// ─── Body Palace (身宫) ───────────────────────────────────────────────────────

/**
 * Determines the earthly-branch index of the Body Palace (身宫).
 *
 * Traditional algorithm:
 *   身宫 branch = (寅 + lunarMonth - 1 + hourBranch) mod 12
 *
 * @param {number} lunarMonth
 * @param {number} hourBranch
 * @returns {number}
 */
function calculateBodyPalaceBranch(lunarMonth, hourBranch) {
  return (2 + (lunarMonth - 1) + hourBranch) % 12;
}

// ─── Zi Wei Star Placement ────────────────────────────────────────────────────

/**
 * Places the 14 major stars of the Zi Wei group across the 12 palaces.
 *
 * Algorithm summary (traditional):
 *  1. Determine Zi Wei star palace from lunar day.
 *  2. Place remaining 5 Zi Wei-group stars relative to Zi Wei.
 *  3. Determine Tian Fu from Zi Wei, place 8 Tian Fu-group stars relative.
 *
 * @param {number} lunarDay   - Lunar day of birth (1–30)
 * @param {number} lifePalace - Life Palace earthly branch index
 * @returns {string[][]} Array of 12 palace slots, each containing star names
 */
function placeMajorStars(lunarDay, lifePalace) {
  const palaceStars = Array.from({ length: 12 }, () => []);

  // ── Zi Wei star position ──────────────────────────────────────────────────
  // Simplified placement: Zi Wei's palace is offset from the Life Palace by
  // (lunarDay - 1) % 12. Traditional ZiWei Dou Shu uses the Five Elements
  // Bureau (五行局: 水二局/木三局/金四局/土五局/火六局) to determine the exact
  // offset — a full implementation requires the bureau number derived from the
  // year stem and branch. This approximation is suitable for demonstration.
  const ziWeiPalaceOffset = (lunarDay - 1) % 12;
  const ziWeiPalace = (lifePalace + ziWeiPalaceOffset) % 12;

  palaceStars[ziWeiPalace].push('紫微');

  // Zi Wei group offsets relative to 紫微 palace:
  // 天机 -1, 太阳 -2 (skip), 武曲 -3 (skip), 天同 -4, 廉贞 -5 (skip)
  // Traditional exact placements:
  palaceStars[(ziWeiPalace + 11) % 12].push('天机');          // one before
  palaceStars[(ziWeiPalace + 10) % 12].push('太阳');          // two before (skip one)
  palaceStars[(ziWeiPalace +  9) % 12].push('武曲');          // three back
  palaceStars[(ziWeiPalace +  8) % 12].push('天同');          // four back
  palaceStars[(ziWeiPalace +  5) % 12].push('廉贞');          // seven back (skip two)

  // ── Tian Fu star: always opposite Zi Wei (6 palaces away) ───────────────
  const tianFuPalace = (ziWeiPalace + 6) % 12;
  palaceStars[tianFuPalace].push('天府');

  // Tian Fu group offsets relative to 天府 palace:
  palaceStars[(tianFuPalace +  1) % 12].push('太阴');
  palaceStars[(tianFuPalace +  2) % 12].push('贪狼');
  palaceStars[(tianFuPalace +  3) % 12].push('巨门');
  palaceStars[(tianFuPalace +  4) % 12].push('天相');
  palaceStars[(tianFuPalace +  5) % 12].push('天梁');
  palaceStars[(tianFuPalace +  6) % 12].push('七杀');
  palaceStars[(tianFuPalace + 10) % 12].push('破军');

  return palaceStars;
}

// ─── Supplementary Stars ─────────────────────────────────────────────────────

/**
 * Places the 8 supplementary (天府组辅星) stars across the 12 palaces.
 *
 * @param {number} yearStemIndex  - Year heavenly stem index (0–9)
 * @param {number} hourBranch     - Birth hour earthly branch index (0–11)
 * @param {number} lunarMonth     - Lunar month (1–12)
 * @returns {string[][]} Array of 12 palace slots with supplementary stars
 */
function placeSupplementaryStars(yearStemIndex, hourBranch, lunarMonth) {
  const palaceStars = Array.from({ length: 12 }, () => []);

  // 文昌 starts at 戌 (branch 10) and counts back by year stem
  palaceStars[(10 - yearStemIndex % 10 + 12) % 12].push('文昌');

  // 文曲 starts at 辰 (branch 4) and counts forward by year stem
  palaceStars[(4 + yearStemIndex % 10) % 12].push('文曲');

  // 左辅: starts at 辰 (branch 4), counts forward by month
  palaceStars[(4 + (lunarMonth - 1)) % 12].push('左辅');

  // 右弼: starts at 戌 (branch 10), counts back by month
  palaceStars[(10 - (lunarMonth - 1) + 120) % 12].push('右弼');

  // 天魁 and 天钺: placed by year stem (traditional table)
  const kuiYueTable = [
    [2, 8], [2, 8], [0, 10], [10, 0],  // 甲乙丙丁
    [2, 8], [0, 10], [2, 8], [2, 8],    // 戊己庚辛
    [4, 4], [4, 4],                      // 壬癸
  ];
  const stemIdx = yearStemIndex % 10;
  palaceStars[kuiYueTable[stemIdx][0]].push('天魁');
  palaceStars[kuiYueTable[stemIdx][1]].push('天钺');

  // 禄存: placed by year stem (same branch as year's Lu star)
  const luCunTable = [4, 5, 6, 7, 4, 5, 8, 9, 10, 11];
  palaceStars[luCunTable[stemIdx]].push('禄存');

  // 地空: starts at 亥 (branch 11), counts forward by hour branch
  palaceStars[(11 + hourBranch) % 12].push('地空');

  return palaceStars;
}

// ─── Four Transformations (四化) ─────────────────────────────────────────────

/**
 * Calculates the Four Transformations (四化星) for the year stem.
 *
 * @param {string} stem - Year heavenly stem character
 * @returns {{ lu: string, quan: string, ke: string, ji: string }}
 */
function calculateSiHua(stem) {
  const [lu, quan, ke, ji] = SI_HUA_TABLE[stem] || ['', '', '', ''];
  return { lu, quan, ke, ji };
}

// ─── Main Export ─────────────────────────────────────────────────────────────

/**
 * Calculates a complete Zi Wei Dou Shu (紫微斗数) birth chart.
 *
 * @param {string} birthDate  - ISO date string "YYYY-MM-DD"
 * @param {string} birthTime  - Time string "HH:MM"
 * @param {string} gender     - "male" | "female"
 * @returns {{
 *   lifePalace: { branch: string, name: string, index: number },
 *   bodyPalace: { branch: string, name: string, index: number },
 *   palaces: Array<{ index: number, branch: string, name: string, nameEn: string, isLifePalace: boolean, isBodyPalace: boolean, stars: string[] }>,
 *   siHua: { lu: string, quan: string, ke: string, ji: string },
 *   yearStem: string,
 *   gender: string
 * }}
 */
function calculateZiWei(birthDate, birthTime, gender) {
  const [year, month, day] = birthDate.split('-').map(Number);
  const [hour] = birthTime.split(':').map(Number);

  const lunarMonth = approximateLunarMonth(month, day);
  const lunarDay = day; // simplified: use solar day as lunar day approximation
  const hourBranch = hourToEarthlyBranchIndex(hour);
  const yStem = yearStem(year);
  const yStemIndex = HEAVENLY_STEMS.indexOf(yStem);

  // Palace indexes
  const lifePalaceBranch = calculateLifePalaceBranch(lunarMonth, hourBranch);
  const bodyPalaceBranch = calculateBodyPalaceBranch(lunarMonth, hourBranch);

  // Star placement (12 slots, each = one palace)
  const majorStars = placeMajorStars(lunarDay, lifePalaceBranch);
  const suppStars = placeSupplementaryStars(yStemIndex, hourBranch, lunarMonth);

  // Merge into 12 palaces
  // Palace order: slot 0 = Life Palace, slot 1 = next clockwise, etc.
  // Each slot maps to an earthly branch: lifePalaceBranch + slot index (mod 12)
  const palaces = Array.from({ length: 12 }, (_, slot) => {
    const branchIdx = (lifePalaceBranch + slot) % 12;
    const stars = [...majorStars[branchIdx], ...suppStars[branchIdx]];

    // Annotate Four Transformations
    const siHua = calculateSiHua(yStem);
    const annotated = stars.map(star => {
      if (star === siHua.lu)   return `${star}化禄`;
      if (star === siHua.quan) return `${star}化权`;
      if (star === siHua.ke)   return `${star}化科`;
      if (star === siHua.ji)   return `${star}化忌`;
      return star;
    });

    return {
      index: slot,
      branch: EARTHLY_BRANCHES[branchIdx],
      name: PALACE_NAMES[slot],
      nameEn: PALACE_NAMES_EN[slot],
      isLifePalace: slot === 0,
      isBodyPalace: branchIdx === bodyPalaceBranch,
      stars: annotated,
    };
  });

  const siHua = calculateSiHua(yStem);

  return {
    lifePalace: {
      branch: EARTHLY_BRANCHES[lifePalaceBranch],
      name: PALACE_NAMES[0],
      index: lifePalaceBranch,
    },
    bodyPalace: {
      branch: EARTHLY_BRANCHES[bodyPalaceBranch],
      name: PALACE_NAMES[palaces.findIndex(p => p.isBodyPalace)],
      index: bodyPalaceBranch,
    },
    palaces,
    siHua,
    yearStem: yStem,
    gender,
  };
}

/**
 * Generate a full Zi Wei chart using the iztro library (solar birthday).
 *
 * @param {Object} params
 * @param {string} params.birthday  — YYYY-MM-DD
 * @param {number} params.birthTime — hour index (0–12, 0=子时 midnight)
 * @param {'male'|'female'} params.gender
 * @param {boolean} [params.leapMonth] — treat month as lunar leap month
 * @param {string} [params.language]  — locale: 'zh-CN', 'en-US', etc.
 * @returns {Object} unified chart data
 */
function generateBySolar({ birthday, birthTime, gender, leapMonth = false, language = 'zh-CN' }) {
  // eslint-disable-next-line global-require
  const { astro } = require('iztro');
  const chart = astro.bySolar(birthday, birthTime, gender, leapMonth, language);
  return _normalizeIzstroChart(chart, language);
}

/**
 * Generate a full Zi Wei chart using the iztro library (lunar birthday).
 *
 * @param {Object} params
 * @param {string} params.birthday  — YYYY-MM-DD (lunar calendar date)
 * @param {number} params.birthTime — hour index (0–12)
 * @param {'male'|'female'} params.gender
 * @param {boolean} [params.leapMonth]
 * @param {string} [params.language]
 * @returns {Object} unified chart data
 */
function generateByLunar({ birthday, birthTime, gender, leapMonth = false, language = 'zh-CN' }) {
  // eslint-disable-next-line global-require
  const { astro } = require('iztro');
  const chart = astro.byLunar(birthday, birthTime, gender, leapMonth, language);
  return _normalizeIzstroChart(chart, language);
}

/**
 * Normalise an iztro FunctionalAstrolabe instance into the same data shape
 * that the AI interpreter expects (ZiweiData).
 *
 * @param {Object} chart — raw iztro chart
 * @param {string} language
 * @returns {Object}
 */
function _normalizeIzstroChart(chart, language) {
  // Find life palace (命宫 = index 4 in iztro palace array)
  const LIFE_PALACE_IDX = 4;
  const lifePalace = chart.palaces[LIFE_PALACE_IDX];
  const bodyPalaceIdx = chart.palaces.findIndex(p => p.isBodyPalace);
  const bodyPalace = chart.palaces[bodyPalaceIdx];

  // Year stem — iztro does not expose it directly; use the life palace stem as proxy
  const yearStem = lifePalace?.heavenlyStem || '未知';

  const palaces = chart.palaces.map((p, idx) => ({
    name: p.name,
    nameEn: p.name, // iztro doesn't separate English names; keep as-is for v1
    stars: [
      ...(p.majorStars || []).map(s => s.name),
      ...(p.minorStars || []).map(s => s.name),
      ...(p.adjectiveStars || []).map(s => s.name),
    ],
    isLifePalace: idx === LIFE_PALACE_IDX,
    heavenlyStem: p.heavenlyStem || '',
    earthlyBranch: p.earthlyBranch || '',
  }));

  // siHua — iztro doesn't expose it in v2; return empty placeholders
  const siHua = { lu: '', quan: '', ke: '', ji: '' };

  return {
    raw: {
      palaces,
      fiveElementsClass: chart.fiveElementsClass,
      soul: chart.soul,
      body: chart.body,
      zodiac: chart.zodiac,
      sign: chart.sign,
    },
    lifePalace: {
      branch: String(LIFE_PALACE_IDX),
      name: lifePalace?.name || '命宫',
    },
    bodyPalace: {
      branch: String(bodyPalaceIdx),
      name: bodyPalace?.name || '身宫',
    },
    yearStem,
    fiveElementsClass: chart.fiveElementsClass || '',
    soul: chart.soul || '',
    body: chart.body || '',
    zodiac: chart.zodiac || '',
    sign: chart.sign || '',
    siHua,
    gender: chart.gender,
    language,
  };
}

module.exports = {
  generateBySolar,
  generateByLunar,
  calculateZiWei,
  calculateLifePalaceBranch,
  calculateBodyPalaceBranch,
  calculateSiHua,
  PALACE_NAMES,
  PALACE_NAMES_EN,
  ZI_WEI_GROUP,
  TIAN_FU_GROUP,
  SI_HUA_TABLE,
};
