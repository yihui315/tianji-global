/**
 * Zodiac month preview — static, deterministic, calendar-based template library
 * for the Tianji Love landing "Birth Month Signal" preview card.
 *
 * Design rules (strict — do NOT widen without review):
 * - Pure data file. No fetch, no env reads, no analytics, no backend.
 * - No birth date, birth time, or birth year is ever stored or transmitted.
 * - Month-only input (1–12). The component consumer maps month → sign using
 *   the well-known tropical zodiac date ranges; year/time are deliberately
 *   discarded by design (they would push the feature into "reading" territory
 *   and out of "preview" scope).
 * - Bilingual strings only (en + zh-CN), kept in lockstep with `copy.tsx`.
 */

import { ZODIAC_SIGNS } from '@/components/zodiac/constants';

export const MONTH_LABELS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

export const MONTH_LABELS_ZH = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月',
] as const;

export type ZodiacPreviewLocale = 'en' | 'zh-CN';

export interface ZodiacMonthPreview {
  /** 0-indexed birth month (0 = Jan … 11 = Dec). */
  month: number;
  /** Sign name in the requested locale (Western zodiac). */
  sign: string;
  /** One-sentence preview in the requested locale. */
  line: string;
  /** Reflective sub-line in the requested locale (≤ 80 chars). */
  hint: string;
}

/**
 * Month → sign tropical boundary (standard Northern hemisphere dates).
 * Each entry: [monthIndex (0-based), dayStart, monthEnd (0-based), dayEnd].
 * Edge case: months that span the zodiac boundary are split.
 */
const MONTH_SIGN_BOUNDARIES: ReadonlyArray<{
  monthIndex: number;
  sign: typeof ZODIAC_SIGNS[number];
  startDay: number;
  endMonthIndex: number;
  endDay: number;
}> = [
  { monthIndex: 2, sign: 'Aries',     startDay: 21, endMonthIndex: 3,  endDay: 19 }, // Mar 21 – Apr 19
  { monthIndex: 3, sign: 'Taurus',    startDay: 20, endMonthIndex: 4,  endDay: 20 }, // Apr 20 – May 20
  { monthIndex: 4, sign: 'Gemini',    startDay: 21, endMonthIndex: 5,  endDay: 20 }, // May 21 – Jun 20
  { monthIndex: 5, sign: 'Cancer',    startDay: 21, endMonthIndex: 6,  endDay: 22 }, // Jun 21 – Jul 22
  { monthIndex: 6, sign: 'Leo',       startDay: 23, endMonthIndex: 7,  endDay: 22 }, // Jul 23 – Aug 22
  { monthIndex: 7, sign: 'Virgo',     startDay: 23, endMonthIndex: 8,  endDay: 22 }, // Aug 23 – Sep 22
  { monthIndex: 8, sign: 'Libra',     startDay: 23, endMonthIndex: 9,  endDay: 22 }, // Sep 23 – Oct 22
  { monthIndex: 9, sign: 'Scorpio',   startDay: 23, endMonthIndex: 10, endDay: 21 }, // Oct 23 – Nov 21
  { monthIndex: 10, sign: 'Sagittarius', startDay: 22, endMonthIndex: 11, endDay: 21 }, // Nov 22 – Dec 21
  { monthIndex: 11, sign: 'Capricorn', startDay: 22, endMonthIndex: 0, endDay: 19 }, // Dec 22 – Jan 19
  { monthIndex: 0, sign: 'Aquarius',  startDay: 20, endMonthIndex: 1,  endDay: 18 }, // Jan 20 – Feb 18
  { monthIndex: 1, sign: 'Pisces',    startDay: 19, endMonthIndex: 2,  endDay: 20 }, // Feb 19 – Mar 20
];

const SIGN_LABELS: Record<ZodiacPreviewLocale, Record<typeof ZODIAC_SIGNS[number], string>> = {
  en: {
    Aries: 'Aries',
    Taurus: 'Taurus',
    Gemini: 'Gemini',
    Cancer: 'Cancer',
    Leo: 'Leo',
    Virgo: 'Virgo',
    Libra: 'Libra',
    Scorpio: 'Scorpio',
    Sagittarius: 'Sagittarius',
    Capricorn: 'Capricorn',
    Aquarius: 'Aquarius',
    Pisces: 'Pisces',
  },
  'zh-CN': {
    Aries: '白羊座',
    Taurus: '金牛座',
    Gemini: '双子座',
    Cancer: '巨蟹座',
    Leo: '狮子座',
    Virgo: '处女座',
    Libra: '天秤座',
    Scorpio: '天蝎座',
    Sagittarius: '射手座',
    Capricorn: '摩羯座',
    Aquarius: '水瓶座',
    Pisces: '双鱼座',
  },
};

/**
 * Twelve deterministic preview lines, one per zodiac sign. These are
 * calibration fixtures — wording, not predictions. They name patterns;
 * they do not promise outcomes.
 *
 * Style: short, reflective, contract-tested for length and absence of
 * pricing/payment language.
 */
const SIGN_LINE_EN: Record<typeof ZODIAC_SIGNS[number], string> = {
  Aries:       'You move quickly into new feelings, then check the room twice.',
  Taurus:      'You hold steady while the pace around you keeps shifting.',
  Gemini:      'You hear the thing behind the thing, even when it is unspoken.',
  Cancer:      'You sense emotional weather before anyone else has named it.',
  Leo:         'You lead with warmth, then ask if the warmth was felt.',
  Virgo:       'You notice the small distances others walk past.',
  Libra:       'You keep balance so others do not have to choose first.',
  Scorpio:     'You stay with feelings longer than you say out loud.',
  Sagittarius: 'You chase the next honest question before the last one closes.',
  Capricorn:   'You build quietly and expect less applause than you deserve.',
  Aquarius:    'You read the pattern, then wait to see who else notices.',
  Pisces:      'You hold space for feelings no one has put into words yet.',
};

const SIGN_LINE_ZH: Record<typeof ZODIAC_SIGNS[number], string> = {
  Aries:       '你很快地走进一种新的感觉，然后又回头看了两遍房间。',
  Taurus:      '周围的节奏一直在变，你却稳在那里。',
  Gemini:      '你听见的是话语背后那件未被说出口的事。',
  Cancer:      '在所有人命名情绪之前，你已经感应到了那片天气。',
  Leo:         '你用温暖领路，然后问自己：那份温暖，对方感受到了吗？',
  Virgo:       '别人跨过的小距离，你都看见了。',
  Libra:       '你替别人扛住平衡，好让他们不必先开口选。',
  Scorpio:     '你停留感受的时间，比你说的还要长。',
  Sagittarius: '上一个真诚的问题还没关上，你已经在追下一个。',
  Capricorn:   '你安静地搭台，却以为会得到的掌声比实际少。',
  Aquarius:    '你看清模式之后，会等别人发现它。',
  Pisces:      '你替那些还没被说出的话，先撑开了一片地方。',
};

const SIGN_HINT_EN: Record<typeof ZODIAC_SIGNS[number], string> = {
  Aries:       'A reflex toward honesty, not confrontation.',
  Taurus:      'Stability is a form of care.',
  Gemini:      'Listening is your loudest skill.',
  Cancer:      'Feeling first, vocabulary second.',
  Leo:         'Warmth without an audit trail.',
  Virgo:       'Patterns before they are visible.',
  Libra:       'Equilibrium before opinion.',
  Scorpio:     'Held feeling, never idle.',
  Sagittarius: 'Curiosity outruns comfort.',
  Capricorn:   'Quiet building compounds.',
  Aquarius:    'Pattern reads, then patience.',
  Pisces:      'Holds the unnamed.',
};

const SIGN_HINT_ZH: Record<typeof ZODIAC_SIGNS[number], string> = {
  Aries:       '朝向诚实，而不是冲突。',
  Taurus:      '稳定，是一种照顾。',
  Gemini:      '你最响亮的本事，是倾听。',
  Cancer:      '先感受，再找词。',
  Leo:         '温暖不带考核表。',
  Virgo:       '在可见之前，先看见模式。',
  Libra:       '在表达意见前，先稳住平衡。',
  Scorpio:     '被按住的感受，从不空转。',
  Sagittarius: '好奇心跑在舒适区前面。',
  Capricorn:   '安静地搭建，一直在累积。',
  Aquarius:    '读懂模式，然后等。',
  Pisces:      '托住那些没被命名的东西。',
};

/**
 * Resolve a birth month (0-indexed) to a zodiac sign using the standard
 * tropical boundary dates. The day-of-month boundary is irrelevant at the
 * preview stage (we only have the month), so we return the dominant sign
 * for the chosen month — the same choice any landing preview would make.
 *
 * Returned `line` / `hint` are pure static copy keyed off the sign + locale.
 */
export function buildZodiacMonthPreview(
  monthIndex: number,
  locale: ZodiacPreviewLocale,
): ZodiacMonthPreview {
  if (!Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    throw new Error(`buildZodiacMonthPreview: monthIndex out of range (${monthIndex})`);
  }
  if (locale !== 'en' && locale !== 'zh-CN') {
    throw new Error(`buildZodiacMonthPreview: unsupported locale (${locale})`);
  }

  // Map a month to the sign whose midpoint sits in that month. Simple and
  // publicly defensible: every month is unambiguously assigned to one sign.
  const monthToSign: Record<number, typeof ZODIAC_SIGNS[number]> = {
    0: 'Capricorn',
    1: 'Aquarius',
    2: 'Pisces',
    3: 'Aries',
    4: 'Taurus',
    5: 'Gemini',
    6: 'Cancer',
    7: 'Leo',
    8: 'Virgo',
    9: 'Libra',
    10: 'Scorpio',
    11: 'Sagittarius',
  };

  const sign = monthToSign[monthIndex];
  const labels = SIGN_LABELS[locale];
  const lineMap = locale === 'en' ? SIGN_LINE_EN : SIGN_LINE_ZH;
  const hintMap = locale === 'en' ? SIGN_HINT_EN : SIGN_HINT_ZH;

  return {
    month: monthIndex,
    sign: labels[sign],
    line: lineMap[sign],
    hint: hintMap[sign],
  };
}

/**
 * Returns the array of all 12 month-bound sign names for the chosen locale.
 * Used by the UI to render the dropdown labels and by tests for parity checks.
 */
export function listZodiacPreviewSigns(locale: ZodiacPreviewLocale): string[] {
  const labels = SIGN_LABELS[locale];
  return ZODIAC_SIGNS.map((sign) => labels[sign]);
}
