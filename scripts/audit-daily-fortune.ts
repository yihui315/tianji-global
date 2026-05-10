const fs = require('node:fs');
const path = require('node:path');

const files = [
  'supabase/migrations/005_seed_fortune_remedy_rules.sql',
  'src/lib/daily-fortune/content-templates.ts',
  'src/lib/daily-fortune/remedy-engine.ts',
  'src/components/daily-fortune/DailyFortuneCard.tsx',
  'src/components/daily-fortune/DailyFortuneClient.tsx',
  'src/components/daily-fortune/RemedyList.tsx',
  'src/components/emails/DailyDigestEmail.tsx',
];

const blockedPatterns = [
  '保证发财',
  '必定复合',
  '必然分手',
  '投资建议',
  '诊断',
  '治疗',
  '法律意见',
  '你会死亡',
  '灾祸无法避免',
];

const findings: string[] = [];

for (const relativeFile of files) {
  const file = path.resolve(process.cwd(), relativeFile);
  if (!fs.existsSync(file)) continue;

  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line: string, index: number) => {
    for (const pattern of blockedPatterns) {
      if (line.includes(pattern)) {
        findings.push(`${relativeFile}:${index + 1} contains "${pattern}"`);
      }
    }
  });
}

if (findings.length > 0) {
  console.error('audit-daily-fortune: blocked wording found');
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log('audit-daily-fortune: OK');

export {};
