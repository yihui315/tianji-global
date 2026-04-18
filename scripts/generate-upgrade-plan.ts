const fs = require('node:fs');
const path = require('node:path');

type ExistenceCheck = {
  label: string;
  filePath: string;
};

const rubricPath = path.resolve('docs/self-check-rubric.json');
const rubric = JSON.parse(fs.readFileSync(rubricPath, 'utf8'));

const checks: ExistenceCheck[] = [
  { label: 'relationship share route', filePath: 'src/app/relationship/share/[slug]/page.tsx' },
  { label: 'relationship radar', filePath: 'src/components/relationship/RelationshipRadar.tsx' },
  { label: 'timeline component', filePath: 'src/components/timeline/FortuneTimeline.tsx' },
  { label: 'share card component', filePath: 'src/components/share/ShareCard.tsx' },
  { label: 'premium upgrade section', filePath: 'src/components/reading/UpgradeSection.tsx' },
];

const findings = checks.map((check) => ({
  label: check.label,
  filePath: check.filePath,
  exists: fs.existsSync(path.resolve(check.filePath)),
}));

const missingFindings = findings.filter((finding) => !finding.exists);
const priorities = missingFindings.length > 0
  ? missingFindings.map((finding) => `Add or restore ${finding.label}`)
  : [
      'Complete relationship share modes',
      'Complete result-page locked premium section',
      'Complete timeline event markers and dimension switching',
    ];

const plan = {
  generatedAt: new Date().toISOString(),
  priorities,
  findings,
  rubricSummary: rubric,
};

fs.writeFileSync(
  path.resolve('upgrade-plan.generated.json'),
  JSON.stringify(plan, null, 2),
);

console.log('Generated upgrade-plan.generated.json');

export {};
