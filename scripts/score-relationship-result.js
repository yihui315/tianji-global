#!/usr/bin/env node
/**
 * score-relationship-result.ts
 * Scores a relationship result page against the AGENTS.md rubric (max 140 pts).
 * Usage: node scripts/score-relationship-result.js <path-to-page.tsx>
 */
import { readFileSync } from 'fs';
import { extname, join } from 'path';

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node score-relationship-result.js <page-file>');
  process.exit(1);
}

const filePath = args[0];
let content;
try {
  content = readFileSync(filePath, 'utf8');
} catch {
  console.error(`Cannot read: ${filePath}`);
  process.exit(1);
}

const score = {
  base: {
    hasHeroSummary: 0,
    hasPattern: 0,
    hasFiveDimensions: 0,
    hasCurrentWindow: 0,
    hasPracticalGuidance: 0,
    hasPremiumSection: 0,
    shareModes: 0,
  },
  copyQuality: {
    headlineStrength: 0,
    patternClarity: 0,
    emotionalResonance: 0,
    upgradeStrength: 0,
  },
};

const MAX_BASE = 74;
const MAX_COPY = 66;
const MAX_TOTAL = 140;

// Base scoring (74 pts max)
if (/heroSummary|hero_summary|hero-summary/i.test(content)) score.base.hasHeroSummary = 10;
else if (/<\w+[^>]*className[^>]*hero[^>]*>.*<\/\w+>/si.test(content)) score.base.hasHeroSummary = 10;

if (/pattern|Type.archetype|archetype|patternName/i.test(content)) score.base.hasPattern = 10;

const dimensionMatches = (content.match(/dimension|Dimension|score|Score|compatibility/i) || []).length;
score.base.hasFiveDimensions = Math.min(15, dimensionMatches >= 5 ? 15 : dimensionMatches >= 3 ? 10 : 0);

if (/currentWindow|window|timing| Timing|when|period|upcoming|next \d|forecast/i.test(content)) score.base.hasCurrentWindow = 10;

if (/practical|practicalGuidance|guidance|advice|action|step|recommend/i.test(content)) score.base.hasPracticalGuidance = 10;

if (/premium|report|reportEntitle|unlock|upgrade|paid|price|Premium/i.test(content)) score.base.hasPremiumSection = 10;

const shareCount = (content.match(/share|Share|shareCard|ShareCard|twitter|facebook|whatsapp|copyLink/i) || []).length;
score.base.shareModes = Math.min(9, Math.floor(shareCount / 2) * 3);

// Copy quality (66 pts max) — heuristic
const hasStrongHeadline = (content.match(/<h[1-2][^>]*>.*<\//i) || []).length > 0;
score.copyQuality.headlineStrength = hasStrongHeadline ? 15 : 5;

const hasPattern = score.base.hasPattern > 0;
score.copyQuality.patternClarity = hasPattern ? 12 : 5;

const emotionalWords = (content.match(/soul|heart|love|destiny|connection|energy|journey|deep|profound|feeling/i) || []).length;
score.copyQuality.emotionalResonance = Math.min(15, emotionalWords >= 8 ? 15 : emotionalWords >= 4 ? 10 : 5);

const hasCTA = /cta|button|unlock|upgrade|get.*report|get.*reading|Buy|Purchase/i.test(content);
score.copyQuality.upgradeStrength = hasCTA ? 12 : 4;

const baseTotal = Object.values(score.base).reduce((a, b) => a + b, 0);
const copyTotal = Object.values(score.copyQuality).reduce((a, b) => a + b, 0);
const grandTotal = baseTotal + copyTotal;

const result = {
  file: filePath,
  scoredAt: new Date().toISOString(),
  scoring: {
    maxBase: MAX_BASE,
    maxCopyQuality: MAX_COPY,
    maxTotal: MAX_TOTAL,
    keepThreshold: 2,
  },
  base: score.base,
  baseTotal,
  copyQuality: score.copyQuality,
  copyTotal,
  grandTotal,
  verdict: `${grandTotal}/${MAX_TOTAL}`,
};

console.log(JSON.stringify(result, null, 2));
