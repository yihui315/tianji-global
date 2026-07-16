#!/usr/bin/env tsx
/**
 * scripts/audit-adsense.ts
 * AdSense content scanner — TypeScript rewrite of audit-adsense.sh
 *
 * Checks:
 *  1. Duplicate ad slot IDs (data-ad-slot, id="slot-*", id="adsense-*")
 *  2. Testimonials / fake persona content (testimonialTokens, fake names)
 *  3. Cookie consent component mounted in root layout
 *  4. @ts-ignore / @ts-nocheck (zero tolerance in PR #143 scope)
 *  5. Empty ad containers (placeholder divs with no real content)
 *  6. tianji.global legacy references
 *
 * Exit: 0 = pass, 1 = issues found
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const REPO_ROOT = join(__dirname, '..');
const SRC_DIR = join(REPO_ROOT, 'src');

const errors: string[] = [];
const warnings: string[] = [];

function log(msg: string) {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${msg}`);
}

function warn(msg: string) {
  warnings.push(msg);
  console.warn(`  WARN: ${msg}`);
}

function err(msg: string) {
  errors.push(msg);
  console.error(`  FAIL: ${msg}`);
}

function getAllTsxTsFiles(dir: string): string[] {
  const files: string[] = [];
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      try {
        if (statSync(full).isDirectory()) {
          if (!entry.startsWith('.') && entry !== 'node_modules') {
            files.push(...getAllTsxTsFiles(full));
          }
        } else if (/\.(tsx?|jsx?)$/.test(entry)) {
          files.push(full);
        }
      } catch {}
    }
  } catch {}
  return files;
}

// ─── 1. Duplicate ad slot IDs ────────────────────────────────────────────────
log('Scanning for duplicate ad slot IDs...');

const slotIdPattern = /(?:data-ad-slot|id)="([^"]+)"/g;
const adSlotFiles = new Map<string, Map<string, number>>(); // slotId → (file → count)

for (const file of getAllTsxTsFiles(SRC_DIR)) {
  let content: string;
  try {
    content = readFileSync(file, 'utf-8');
  } catch {
    continue;
  }

  // Skip non-component files
  const rel = relative(REPO_ROOT, file);
  if (rel.includes('/__tests__/') || rel.includes('/node_modules/')) continue;

  let match: RegExpExecArray | null;
  slotIdPattern.lastIndex = 0;
  while ((match = slotIdPattern.exec(content)) !== null) {
    const slotId = match[1];
    if (!slotId || !/^(adsense|ad-|slot-)/.test(slotId)) continue;

    if (!adSlotFiles.has(slotId)) adSlotFiles.set(slotId, new Map());
    const fileMap = adSlotFiles.get(slotId)!;
    fileMap.set(file, (fileMap.get(file) ?? 0) + 1);
  }
}

for (const [slotId, fileMap] of adSlotFiles) {
  const totalCount = [...fileMap.values()].reduce((a, b) => a + b, 0);
  if (totalCount > 1) {
    const files = [...fileMap.entries()].map(([f]) => `  - ${relative(REPO_ROOT, f)}`).join('\n');
    err(`Duplicate ad slot ID "${slotId}" used ${totalCount} times:\n${files}`);
  }
}

// ─── 2. Testimonials / fake persona content ──────────────────────────────────
log('Scanning for testimonial/persona content...');

const testimonialPatterns = [
  /testimonialTokens/i,
  /"name"\s*:\s*"[A-Z][a-z]+\s+[A-Z]\./,       // "Sophia L.", "Marcus T."
  /"location"\s*:\s*"[^"]+"/,                    // fake locations like "New York, NY"
  /satisfied\s+(customer|user|client)/i,
  /customer\s+review/i,
  /用户好评/i,
  /五星评价/i,
  /testimonial/i,
];

const skipDirs = ['/__tests__/', '/node_modules/', '/lib/astro/'];

for (const file of getAllTsxTsFiles(SRC_DIR)) {
  const rel = relative(REPO_ROOT, file);
  if (skipDirs.some(d => rel.includes(d))) continue;

  let content: string;
  try {
    content = readFileSync(file, 'utf-8');
  } catch {
    continue;
  }

  for (const pattern of testimonialPatterns) {
    if (pattern.test(content)) {
      const match = content.match(pattern)?.[0];
      warn(`Testimonial/persona content in ${rel}: "${match}"`);
      break;
    }
  }
}

// ─── 3. Cookie consent in root layout ───────────────────────────────────────
log('Checking cookie consent component...');

const rootLayoutPath = join(REPO_ROOT, 'src/app/layout.tsx');
let hasCookieConsent = false;
try {
  const content = readFileSync(rootLayoutPath, 'utf-8');
  hasCookieConsent = /cookie[Cc]onsent|Cookie[Cc]onsent|CookieBanner|cookie_banner/i.test(content);
} catch {
  warn('Cannot read root layout.tsx');
}

if (!hasCookieConsent) {
  err(`Cookie consent component NOT mounted in src/app/layout.tsx — required for GDPR/AdSense`);
} else {
  log('  Cookie consent component found in root layout');
}

// ─── 4. @ts-ignore / @ts-nocheck ─────────────────────────────────────────────
log('Scanning for @ts-ignore / @ts-nocheck...');

const tsIgnoreFiles = new Map<string, number>();

for (const file of getAllTsxTsFiles(SRC_DIR)) {
  const rel = relative(REPO_ROOT, file);
  if (rel.includes('/node_modules/')) continue;

  let content: string;
  try {
    content = readFileSync(file, 'utf-8');
  } catch {
    continue;
  }

  const matches = content.match(/@ts-ignore|@ts-nocheck/g);
  if (matches) {
    tsIgnoreFiles.set(rel, matches.length);
  }
}

for (const [file, count] of [...tsIgnoreFiles.entries()].sort()) {
  // Filter out legitimate library/type files that pre-exist
  if (file.startsWith('src/data/') || file.startsWith('src/lib/bazi') || file.startsWith('src/lib/yijing') || file.startsWith('src/types/')) {
    warn(`@ts-ignore found in ${file} (${count}x) — existing library, tolerated`);
  } else {
    err(`@ts-ignore/@ts-nocheck found in ${file} (${count}x)`);
  }
}

// ─── 5. Empty ad containers ───────────────────────────────────────────────────
log('Scanning for empty ad containers...');

const emptyAdPattern = /<(?:div|section|aside)[^>]*(?:data-ad-slot|id)="([^"]*)"[^>]*>\s*<\/(?:div|section|aside)>/gi;

for (const file of getAllTsxTsFiles(SRC_DIR)) {
  const rel = relative(REPO_ROOT, file);
  if (rel.includes('/__tests__/') || rel.includes('/node_modules/')) continue;

  let content: string;
  try {
    content = readFileSync(file, 'utf-8');
  } catch {
    continue;
  }

  let match;
  emptyAdPattern.lastIndex = 0;
  while ((match = emptyAdPattern.exec(content)) !== null) {
    if (match[1] && /^(adsense|ad-|slot-)/.test(match[1])) {
      warn(`Empty ad container with slot "${match[1]}" in ${rel}`);
    }
  }
}

// ─── 6. tianji.global legacy references ──────────────────────────────────────
log('Scanning for tianji.global legacy references...');

const globalPattern = /tianji\.global/gi;
const globalFiles = new Map<string, number>();

for (const file of getAllTsxTsFiles(SRC_DIR)) {
  const rel = relative(REPO_ROOT, file);
  if (rel.includes('/node_modules/')) continue;

  let content: string;
  try {
    content = readFileSync(file, 'utf-8');
  } catch {
    continue;
  }

  const matches = content.match(globalPattern);
  if (matches) {
    globalFiles.set(rel, matches.length);
  }
}

for (const [file, count] of [...globalFiles.entries()].sort()) {
  err(`tianji.global legacy reference in ${file} (${count}x) — should be tianji.love`);
}

// ─── Summary ─────────────────────────────────────────────────────────────────
log('');
if (errors.length > 0) {
  console.error(`\n=== RESULT: FAIL — ${errors.length} error(s) ===`);
  errors.forEach(e => console.error('  ' + e));
  process.exit(1);
} else {
  console.log(`\n=== RESULT: PASS ===`);
  if (warnings.length > 0) {
    console.log(`${warnings.length} warning(s):`);
    warnings.forEach(w => console.log('  WARN: ' + w));
  }
  process.exit(0);
}
