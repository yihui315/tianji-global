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
