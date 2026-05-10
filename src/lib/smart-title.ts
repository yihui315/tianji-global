export type SmartTitleLang = 'auto' | 'zh' | 'en' | 'mixed';
export type ResolvedSmartTitleLang = Exclude<SmartTitleLang, 'auto'>;
export type SmartTitlePriority = 'hero' | 'section' | 'compact';
export type SmartTitleTokenKind = 'cjk' | 'latin' | 'neutral';

export interface SmartTitleToken {
  text: string;
  kind: SmartTitleTokenKind;
}

export interface SmartTitleOptions {
  lang?: SmartTitleLang;
  maxLines?: 1 | 2 | 3;
  priority?: SmartTitlePriority;
}

export interface SmartTitlePlan {
  lang: ResolvedSmartTitleLang;
  maxCh: number;
  segments: string[];
  tokens: SmartTitleToken[];
  utilityClass: string;
}

const CJK_RE = /[\u3400-\u9fff\uf900-\ufaff]/g;
const LATIN_RE = /[A-Za-z]/g;
const TOKEN_RE = /[\u3400-\u9fff\uf900-\ufaff]+|[A-Za-z0-9]+|[^A-Za-z0-9\u3400-\u9fff\uf900-\ufaff]+/g;
const TITLE_PUNCTUATION_RE = /[\u3001\u3002\uff0c\uff01\uff1f\uff1a\uff1b,!.?:;]/g;

const MAX_CH_BY_PRIORITY: Record<SmartTitlePriority, Record<ResolvedSmartTitleLang, number>> = {
  hero: {
    zh: 14,
    en: 28,
    mixed: 18,
  },
  section: {
    zh: 16,
    en: 34,
    mixed: 22,
  },
  compact: {
    zh: 12,
    en: 24,
    mixed: 16,
  },
};

export function detectSmartTitleLang(text: string): ResolvedSmartTitleLang {
  const cjkCount = (text.match(CJK_RE) ?? []).length;
  const latinCount = (text.match(LATIN_RE) ?? []).length;

  if (cjkCount > 0 && latinCount > 0) return 'mixed';
  if (cjkCount > 0) return 'zh';
  return 'en';
}

export function tokenizeSmartTitle(text: string): SmartTitleToken[] {
  return (text.match(TOKEN_RE) ?? []).map((part) => {
    if (CJK_RE.test(part)) {
      CJK_RE.lastIndex = 0;
      return { text: part, kind: 'cjk' };
    }

    CJK_RE.lastIndex = 0;
    if (LATIN_RE.test(part)) {
      LATIN_RE.lastIndex = 0;
      return { text: part, kind: 'latin' };
    }

    LATIN_RE.lastIndex = 0;
    return { text: part, kind: 'neutral' };
  });
}

export function sanitizeSmartTitleText(text: string) {
  return text
    .replace(TITLE_PUNCTUATION_RE, '')
    .split(/\r?\n/)
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

export function planSmartTitle(text: string, options: SmartTitleOptions = {}): SmartTitlePlan {
  const displayText = sanitizeSmartTitleText(text);
  const lang = options.lang && options.lang !== 'auto' ? options.lang : detectSmartTitleLang(displayText);
  const priority = options.priority ?? 'section';
  const maxLines = options.maxLines ?? (priority === 'hero' ? 2 : 3);
  const maxCh = MAX_CH_BY_PRIORITY[priority][lang];
  const segments = splitSmartTitle(displayText, lang, maxLines, maxCh);

  return {
    lang,
    maxCh,
    segments,
    tokens: tokenizeSmartTitle(displayText),
    utilityClass: `tj-smart-title tj-smart-title-${lang} tj-smart-title-${priority}`,
  };
}

function splitSmartTitle(
  text: string,
  lang: ResolvedSmartTitleLang,
  maxLines: number,
  maxCh: number
) {
  if (!text) return [''];
  if (text.includes('\n')) {
    return text
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, maxLines);
  }
  if (visualLength(text, lang) <= maxCh) return [text];
  if (lang === 'en') return splitEnglishTitle(text, maxLines, maxCh);
  return splitCjkTitle(text, maxLines, maxCh);
}

function splitCjkTitle(text: string, maxLines: number, maxCh: number) {
  const chars = Array.from(text);
  const lineCount = Math.min(maxLines, Math.ceil(chars.length / maxCh));

  if (lineCount <= 1) return [text];

  const segments: string[] = [];
  let cursor = 0;

  for (let index = 0; index < lineCount; index += 1) {
    const remainingChars = chars.length - cursor;
    const remainingLines = lineCount - index;
    let take = Math.ceil(remainingChars / remainingLines);

    if (remainingLines > 1 && remainingChars - take > 0 && remainingChars - take < 4) {
      take = remainingChars - 4;
    }

    take = Math.max(4, take);
    segments.push(chars.slice(cursor, cursor + take).join(''));
    cursor += take;
  }

  return segments.filter(Boolean);
}

function splitEnglishTitle(text: string, maxLines: number, maxCh: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const segments: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;

    if (segments.length < maxLines - 1 && next.length > maxCh && current) {
      segments.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) segments.push(current);
  return segments;
}

function visualLength(text: string, lang: ResolvedSmartTitleLang) {
  if (lang === 'en') return text.length;
  return Array.from(text).reduce((total, char) => {
    if (/[\u3400-\u9fff\uf900-\ufaff]/.test(char)) return total + 1;
    if (/[A-Za-z0-9]/.test(char)) return total + 0.62;
    return total + 0.35;
  }, 0);
}
