/**
 * Zodiac month bridge — static, deterministic, calendar-based template library
 * for the Tianji Love landing "Birth Month Bridge" reflection card.
 *
 * Design rules (strict — do NOT widen without review):
 *  - Pure data file. No fetch, no env reads, no analytics, no backend.
 *  - No birth date, birth time, or birth year is ever stored or transmitted.
 *  - Month-only input (0–11). Each month is presented as a BRIDGE between
 *    the two zodiac signs whose tropical boundary falls inside it. We do not
 *    tell the visitor which side of the bridge is theirs — that would require
 *    a day-of-month we never ask for. We offer a reflection that holds on
 *    either side.
 *  - Bilingual strings only (en + zh-CN), kept in lockstep with the consumer.
 *
 * Calendar source: standard Western tropical zodiac date boundaries.
 * Each entry is the pair of signs whose cusp falls in that calendar month.
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
export type ZodiacSignName = typeof ZODIAC_SIGNS[number];

export interface ZodiacMonthBridge {
  /** 0-indexed birth month (0 = Jan … 11 = Dec). */
  month: number;
  /** Localized label for the chosen month. */
  monthLabel: string;
  /** The two Western signs that straddle the cusp inside this month. */
  signs: [string, string];
  /** A reflective line that holds on either side of the bridge. */
  bridgeLine: string;
  /** Short calibration line saying which side is which. */
  bridgeHint: string;
  /** Per-sign canonical reflection lines. The bridge framing is what holds them. */
  reflectionPrimary: string;
  reflectionSecondary: string;
}

/**
 * Two signs straddle the cusp inside each month. Order = [earlier calendar
 * segment, later calendar segment]. The two-line reflections are written so
 * either one is a fair read for a visitor born in that month — we never
 * claim a specific sign for the visitor.
 */
const MONTH_BRIDGE: ReadonlyArray<{
  monthIndex: number;
  primary: ZodiacSignName;
  secondary: ZodiacSignName;
  /** Display-only calendar segments. February uses "month end" because no year is collected. */
  boundaryEN: string;
  boundaryZH: string;
}> = [
  { monthIndex: 0,  primary: 'Capricorn',    secondary: 'Aquarius',    boundaryEN: 'Jan 1–19 / Jan 20–31', boundaryZH: '1 月 1–19 日 / 20–31 日' },
  { monthIndex: 1,  primary: 'Aquarius',     secondary: 'Pisces',      boundaryEN: 'Feb 1–18 / Feb 19–month end', boundaryZH: '2 月 1–18 日 / 19 日–月末' },
  { monthIndex: 2,  primary: 'Pisces',       secondary: 'Aries',       boundaryEN: 'Mar 1–20 / Mar 21–31', boundaryZH: '3 月 1–20 日 / 21–31 日' },
  { monthIndex: 3,  primary: 'Aries',        secondary: 'Taurus',      boundaryEN: 'Apr 1–19 / Apr 20–30', boundaryZH: '4 月 1–19 日 / 20–30 日' },
  { monthIndex: 4,  primary: 'Taurus',       secondary: 'Gemini',      boundaryEN: 'May 1–20 / May 21–31', boundaryZH: '5 月 1–20 日 / 21–31 日' },
  { monthIndex: 5,  primary: 'Gemini',       secondary: 'Cancer',      boundaryEN: 'Jun 1–20 / Jun 21–30', boundaryZH: '6 月 1–20 日 / 21–30 日' },
  { monthIndex: 6,  primary: 'Cancer',       secondary: 'Leo',         boundaryEN: 'Jul 1–22 / Jul 23–31', boundaryZH: '7 月 1–22 日 / 23–31 日' },
  { monthIndex: 7,  primary: 'Leo',          secondary: 'Virgo',       boundaryEN: 'Aug 1–22 / Aug 23–31', boundaryZH: '8 月 1–22 日 / 23–31 日' },
  { monthIndex: 8,  primary: 'Virgo',        secondary: 'Libra',       boundaryEN: 'Sep 1–22 / Sep 23–30', boundaryZH: '9 月 1–22 日 / 23–30 日' },
  { monthIndex: 9,  primary: 'Libra',        secondary: 'Scorpio',     boundaryEN: 'Oct 1–22 / Oct 23–31', boundaryZH: '10 月 1–22 日 / 23–31 日' },
  { monthIndex: 10, primary: 'Scorpio',      secondary: 'Sagittarius', boundaryEN: 'Nov 1–21 / Nov 22–30', boundaryZH: '11 月 1–21 日 / 22–30 日' },
  { monthIndex: 11, primary: 'Sagittarius',  secondary: 'Capricorn',   boundaryEN: 'Dec 1–21 / Dec 22–31', boundaryZH: '12 月 1–21 日 / 22–31 日' },
];

const SIGN_LABELS: Record<ZodiacPreviewLocale, Record<ZodiacSignName, string>> = {
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

const REFLECTION_EN: Record<ZodiacSignName, string> = {
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

const REFLECTION_ZH: Record<ZodiacSignName, string> = {
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

/**
 * Build a month-bridge reflection for the given birth month. The result
 * holds two possible signs and never claims which is the visitor's.
 *
 * The bridgeLine phrasing uses "bridge / reflection / between" calibration
 * language — it explicitly states that the date we do not ask is what would
 * determine the side.
 */
export function buildZodiacMonthBridge(
  monthIndex: number,
  locale: ZodiacPreviewLocale,
): ZodiacMonthBridge {
  if (!Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    throw new Error(`buildZodiacMonthBridge: monthIndex out of range (${monthIndex})`);
  }
  if (locale !== 'en' && locale !== 'zh-CN') {
    throw new Error(`buildZodiacMonthBridge: unsupported locale (${locale})`);
  }

  const entry = MONTH_BRIDGE[monthIndex];
  const labels = SIGN_LABELS[locale];
  const primaryLabel = labels[entry.primary];
  const secondaryLabel = labels[entry.secondary];
  const monthLabel =
    locale === 'en' ? MONTH_LABELS_EN[monthIndex] : MONTH_LABELS_ZH[monthIndex];
  const reflectionMap = locale === 'en' ? REFLECTION_EN : REFLECTION_ZH;
  const boundary = locale === 'en' ? entry.boundaryEN : entry.boundaryZH;

  const bridgeLine =
    locale === 'en'
      ? `Born in ${monthLabel}, you sit on the bridge between ${primaryLabel} and ${secondaryLabel}. Which side is yours depends on the day we do not ask you for.`
      : `出生在 ${monthLabel}，你站在 ${primaryLabel} 与 ${secondaryLabel} 的过渡带上。哪一边属于你，取决于我们没问你的那个日子。`;

  const bridgeHint =
    locale === 'en'
      ? `Cusp: ${boundary} · These two readings both hold for the same month.`
      : `分界：${boundary} · 这两条反思，对同一个月都成立。`;

  return {
    month: monthIndex,
    monthLabel,
    signs: [primaryLabel, secondaryLabel],
    bridgeLine,
    bridgeHint,
    reflectionPrimary: reflectionMap[entry.primary],
    reflectionSecondary: reflectionMap[entry.secondary],
  };
}

/** Return all 12 month-pair sign names for the chosen locale. */
export function listZodiacBridgeSignPairs(locale: ZodiacPreviewLocale): string[][] {
  const labels = SIGN_LABELS[locale];
  return MONTH_BRIDGE.map((entry) => [
    labels[entry.primary],
    labels[entry.secondary],
  ]);
}
