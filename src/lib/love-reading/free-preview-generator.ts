import { chooseLoveArchetype } from './love-archetypes';
import { buildLoveDimensions } from './love-dimensions';
import { buildCurrentLoveWindow } from './love-timing';
import { assertLoveReportQuality } from './report-quality-check';
import {
  LOVE_DIMENSION_KEYS,
  LOVE_REPORT_VERSION,
  normalizeLoveReportLocale,
  scoreBand,
  type LoveDimensionKey,
  type LoveReport,
  type LoveReportLocale,
  type PrivateBirthInput,
} from './report-schema';

export type FreePreviewRelationshipMode = 'solo' | 'compatibility';

export type FreePreviewReportInput = {
  locale?: LoveReportLocale | 'zh-CN';
  readingMode?: FreePreviewRelationshipMode;
  personA: PrivateBirthInput;
  personB?: PrivateBirthInput;
  createdAt?: string;
};

function hashText(value: string) {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) % 9973;
  }
  return hash;
}

function scoreFromInput(input: FreePreviewReportInput, key: LoveDimensionKey) {
  const seed = [
    input.readingMode ?? 'solo',
    input.personA.birthDate ?? '',
    input.personA.birthTime ?? '',
    input.personB?.birthDate ?? '',
    input.personB?.birthTime ?? '',
    key,
  ].join('|');
  return 48 + (hashText(seed) % 38);
}

function uncertaintyNote(input: FreePreviewReportInput, locale: LoveReportLocale) {
  const missingTime = !input.personA.birthTime || (input.readingMode === 'compatibility' && !input.personB?.birthTime);
  const missingPlace = !input.personA.birthPlace || (input.readingMode === 'compatibility' && !input.personB?.birthPlace);
  const onlyOne = input.readingMode !== 'compatibility' || !input.personB?.birthDate;

  if (!missingTime && !missingPlace && !onlyOne) return undefined;

  const copy = {
    en: onlyOne
      ? 'Only one birth profile is available, so this preview reflects personal relationship tendency rather than full compatibility.'
      : missingTime
        ? 'Birth time is missing, so this preview avoids precise house, rising, or timing claims.'
        : 'Birth place is missing, so this preview uses conservative location-independent guidance.',
    zh: onlyOne
      ? '目前只有一方出生信息，因此本报告只分析关系倾向，不做完整双方互动判断�?
      : missingTime
        ? '由于缺少出生时间，本报告不涉及精确宫位、上升或具体时点判断�?
        : '由于缺少出生地点，本报告采用保守解释，不输出地点依赖结论�?,
    'zh-Hant': onlyOne
      ? '目前只有一方出生資訊，因此本報告只分析關係傾向，不做完整雙方互動判斷�?
      : missingTime
        ? '由於缺少出生時間，本報告不涉及精確宮位、上升或具體時點判斷�?
        : '由於缺少出生地點，本報告採用保守解釋，不輸出地點依賴結論�?,
  } as const;

  return copy[locale];
}

function copyFor(locale: LoveReportLocale) {
  return {
    en: {
      headline: 'Your relationship preview is ready',
      oneLiner: 'A privacy-safe first signal for understanding the pattern, pace, and next best action.',
      strength: 'The relationship has enough signal to support a calm next step.',
      friction: 'The main risk is asking for certainty before the communication pattern is proven.',
      next7: [
        'Start with one honest check-in.',
        'Avoid reading silence as a final answer.',
        'Choose consistency over dramatic proof.',
      ],
      teaser: 'Unlock the full report for five-dimension depth, a 30-day window, and a repair script.',
      shareCta: 'Start your private TianJi Love preview',
    },
    zh: {
      headline: '你的关系预览已生�?,
      oneLiner: '一个隐私安全的第一信号，用来理解关系模式、节奏和下一步行动�?,
      strength: '这段关系已经有足够信号，适合采取一个稳定的小行动�?,
      friction: '主要风险是过早追求确定答案，而沟通模式还没有被验证�?,
      next7: ['先做一次诚实确认�?, '不要把沉默直接解读成最终答案�?, '用持续行动代替戏剧化证明�?],
      teaser: '解锁完整报告可查看五维度深度拆解�?0天窗口和沟通修复脚本�?,
      shareCta: '开始你�?TianJi Love 私密预览',
    },
    'zh-Hant': {
      headline: '你的關係預覽已生�?,
      oneLiner: '一個隱私安全的第一信號，用來理解關係模式、節奏和下一步行動�?,
      strength: '這段關係已經有足夠信號，適合採取一個穩定的小行動�?,
      friction: '主要風險是過早追求確定答案，而溝通模式還沒有被驗證�?,
      next7: ['先做一次誠實確認�?, '不要把沉默直接解讀成最終答案�?, '用持續行動代替戲劇化證明�?],
      teaser: '解鎖完整報告可查看五維度深度拆解�?0天窗口和溝通修復腳本�?,
      shareCta: '開始你的 TianJi Love 私密預覽',
    },
  }[locale];
}

export function generateFreePreviewReport(input: FreePreviewReportInput): LoveReport {
  const locale = normalizeLoveReportLocale(input.locale);
  const scores = Object.fromEntries(
    LOVE_DIMENSION_KEYS.map((key) => [key, scoreFromInput(input, key)])
  ) as Record<LoveDimensionKey, number>;
  const overallScore = Math.round(
    LOVE_DIMENSION_KEYS.reduce((sum, key) => sum + scores[key], 0) / LOVE_DIMENSION_KEYS.length
  );
  const note = uncertaintyNote(input, locale);
  const c = copyFor(locale);
  const archetype = chooseLoveArchetype(overallScore, locale);
  const report: LoveReport = {
    version: LOVE_REPORT_VERSION,
    locale,
    visibility: 'free',
    headline: c.headline,
    oneLiner: c.oneLiner,
    relationshipArchetype: archetype,
    overallScore,
    dimensions: buildLoveDimensions(locale, scores, note),
    currentWindow: buildCurrentLoveWindow(overallScore, locale, note),
    strengths: [c.strength, archetype.summary],
    frictionPoints: [c.friction],
    next7Days: c.next7,
    next30Days: [],
    premiumTeaser: c.teaser,
    premiumSections: [],
    privacySafeShareSummary: {
      title: archetype.title,
      summary: archetype.summary,
      scoreBand: scoreBand(overallScore),
      cta: c.shareCta,
      archetypeTitle: archetype.title,
    },
    createdAt: input.createdAt ?? '1970-01-01T00:00:00.000Z',
  };

  assertLoveReportQuality(report);
  return report;
}
