const fs = require('node:fs');
const path = require('node:path');

const roots = [
  path.resolve('src/app'),
];

const filePattern = /\.(ts|tsx|md|mdx)$/;
const flagged: string[] = [];

function shouldInspectLine(line: string) {
  if (!line.trim()) return false;
  if (line.trim().startsWith('//')) return false;
  if (line.trim().startsWith('*')) return false;
  if (line.includes('http://') || line.includes('https://')) return false;
  if (line.includes('metadata')) return false;
  if (/\b(zh|en|labelEn|titleEn|subtitleEn|nameEn|descEn)\b/.test(line)) return false;
  return true;
}

function extractCandidateSnippets(line: string) {
  const snippets: string[] = [];

  const jsxMatches = line.match(/>([^<]+)</g) ?? [];
  for (const match of jsxMatches) {
    snippets.push(match.slice(1, -1).trim());
  }

  return snippets.filter(Boolean);
}

function looksMirroredBilingual(snippet: string) {
  if (snippet.length < 24) return false;
  if (/TianJi Global|2024|2025/.test(snippet)) return false;

  const hasCjk = /[\u3400-\u9fff]/.test(snippet);
  const hasLatinWord = /[A-Za-z]{4,}/.test(snippet);
  if (!hasCjk || !hasLatinWord) return false;

  return /[|/]| - | — | · /.test(snippet);
}

function walk(dir: string) {
  if (!fs.existsSync(dir)) return;

  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      walk(full);
      continue;
    }

    if (!filePattern.test(full)) {
      continue;
    }

    if (full.includes(`${path.sep}api${path.sep}`)) {
      continue;
    }

    if (full.includes(`${path.sep}animations${path.sep}showcase${path.sep}`)) {
      continue;
    }

    const content = fs.readFileSync(full, 'utf8');
    const lines = content.split(/\r?\n/);

    lines.forEach((line: string, index: number) => {
      if (!shouldInspectLine(line)) return;

      const snippets = extractCandidateSnippets(line);
      if (!snippets.some(looksMirroredBilingual)) return;

      flagged.push(`${path.relative(process.cwd(), full)}:${index + 1}`);
    });
  }
}

roots.forEach(walk);

if (flagged.length) {
  console.error('Potential mirrored bilingual content found:');
  for (const file of flagged) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

console.log('audit-copy: OK');

export {};
import fs from "fs";
import path from "path";

const errors: string[] = [];

function scanDuplication(dir: string, pattern: RegExp) {
  const results: string[] = [];
  function walk(d: string) {
    const files = fs.readdirSync(d);
    for (const f of files) {
      if (f === "node_modules" || f === ".git" || f === ".next") continue;
      const full = path.join(d, f);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        walk(full);
      } else if (stat.isFile() && /\.(tsx|ts|md)$/.test(f)) {
        const content = fs.readFileSync(full, "utf8");
        const matches = content.match(pattern);
        if (matches) {
          results.push(`${full}: ${matches.length} matches`);
        }
      }
    }
  }
  walk(dir);
  return results;
}

// Detect duplicated bilingual content (same paragraph repeated 3+ times)
const dupes = scanDuplication("src", /(中文.*英文|EN.*中文)/g);
if (dupes.length > 5) {
  errors.push(`High duplication detected: ${dupes.length} blocks`);
  dupes.slice(0, 5).forEach((d) => errors.push(`  ${d}`));
}

const result = { ok: errors.length === 0, errors };
fs.writeFileSync("audit-copy.json", JSON.stringify(result, null, 2));
console.log("Copy audit:", errors.length === 0 ? "✅ OK" : `❌ ${errors.length} issues`);
