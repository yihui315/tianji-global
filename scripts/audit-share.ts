const fs = require('node:fs');
const path = require('node:path');

const publicShareRoots = [
  path.resolve('src/app/relationship/share'),
  path.resolve('src/components/share'),
];

const sensitiveFields = ['birthDate', 'birthTime', 'birthLocation', 'timezone'];
const flagged: string[] = [];

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  lines.forEach((line: string, index: number) => {
    for (const field of sensitiveFields) {
      if (line.includes(field)) {
        flagged.push(`${path.relative(process.cwd(), filePath)}:${index + 1}`);
        break;
      }
    }
  });
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

    if (/\.(ts|tsx)$/.test(full)) {
      scanFile(full);
    }
  }
}

for (const root of publicShareRoots) {
  walk(root);
}

const relationshipShareRoute = path.resolve('src/app/api/relationship/share/route.ts');
if (!fs.existsSync(relationshipShareRoute)) {
  console.error('Missing relationship share API route: src/app/api/relationship/share/route.ts');
  process.exit(1);
}

const shareRouteSource = fs.readFileSync(relationshipShareRoute, 'utf8');
if (!/includeBirthData:\s*shareSettings\?\.includeBirthData\s*\?\?\s*false/.test(shareRouteSource)) {
  console.error('Relationship share API must default includeBirthData to false.');
  process.exit(1);
}

if (flagged.length) {
  console.error('Potential sensitive public share fields found:');
  for (const file of flagged) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

console.log('audit-share: OK');

export {};
import fs from "fs";
import path from "path";

const errors: string[] = [];

// Check share panel has privacy safeguards
const shareFiles = [
  "src/components/share/SharePanel.tsx",
  "src/components/SharePanel.tsx",
];

let hasSharePanel = false;
for (const f of shareFiles) {
  if (fs.existsSync(f)) {
    hasSharePanel = true;
    const content = fs.readFileSync(f, "utf8");
    // Must have age gate or privacy notice
    if (!/(age|年龄|privacy|隐私|consent|同意)/i.test(content)) {
      errors.push(`${f}: Missing privacy safeguard text`);
    }
  }
}

if (!hasSharePanel) {
  errors.push("No share panel found in expected locations");
}

const result = { ok: errors.length === 0, errors };
fs.writeFileSync("audit-share.json", JSON.stringify(result, null, 2));
console.log("Share audit:", errors.length === 0 ? "✅ OK" : `❌ ${errors.length} issues`);
errors.forEach((e) => console.log(" -", e));
