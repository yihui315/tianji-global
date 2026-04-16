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
  if (/\b(zh|en|labelEn|titleEn|subtitleEn|nameEn|descEn)\b/.test(line)) return false;
  return true;
}

function extractCandidateSnippets(line: string) {
  const snippets: string[] = [];

  const jsxMatches = line.match(/>([^<]+)</g) ?? [];
  for (const match of jsxMatches) {
    snippets.push(match.slice(1, -1).trim());
  }

  const metadataMatch = line.match(/\b(title|description|subtitle|headline|message)\s*:\s*(['"`])((?:\\.|(?!\2).)*)\2/);
  if (metadataMatch?.[3]) {
    snippets.push(metadataMatch[3]);
  }

  return snippets.filter(Boolean);
}

function looksMirroredBilingual(snippet: string) {
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
