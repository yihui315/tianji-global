const fs = require('node:fs');
const path = require('node:path');

const targets = [
  { filePath: 'src/app/relationship/new/page.tsx', label: 'relationship route' },
  { filePath: 'src/app/relationship/share/[slug]/page.tsx', label: 'public relationship share route' },
  { filePath: 'src/components/relationship/RelationshipRadar.tsx', label: 'relationship graph component' },
  { filePath: 'src/components/share/ShareCard.tsx', label: 'share components' },
  { filePath: 'src/components/timeline/FortuneTimeline.tsx', label: 'timeline components' },
  { filePath: 'src/components/reading/UpgradeSection.tsx', label: 'premium upgrade section' },
];

const missing = targets.filter((target) => !fs.existsSync(path.resolve(process.cwd(), target.filePath)));

if (missing.length) {
  console.error('Upgrade-critical modules missing:');
  for (const entry of missing) {
    console.error(`- ${entry.label}: ${entry.filePath}`);
  }
  process.exit(1);
}

console.log('audit-upgrade: OK');

export {};
