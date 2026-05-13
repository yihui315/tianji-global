const fs = require('node:fs');
const path = require('node:path');

const packageJsonPath = path.resolve('package.json');
const ciWorkflowPath = path.resolve('.github/workflows/ci.yml');

const requiredReleaseCommands = [
  'typecheck',
  'lint',
  'test',
  'build',
  'audit:routes',
  'audit:copy',
  'audit:share',
  'audit:upgrade',
];

function readText(filePath: string) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${path.relative(process.cwd(), filePath)}`);
  }

  return fs.readFileSync(filePath, 'utf8');
}

function addFailure(failures: string[], message: string) {
  failures.push(message);
}

const failures: string[] = [];
const packageJson = JSON.parse(readText(packageJsonPath));
const ciWorkflow = readText(ciWorkflowPath);

const scripts = packageJson.scripts ?? {};
const releaseCheck = scripts['release:check'];

if (typeof releaseCheck !== 'string' || !releaseCheck.trim()) {
  addFailure(failures, '`package.json` is missing `scripts.release:check`.');
} else {
  for (const command of requiredReleaseCommands) {
    const expected = `npm run ${command}`;
    if (!releaseCheck.includes(expected)) {
      addFailure(failures, `release:check must include \`${expected}\`.`);
    }
  }
}

if (!/^\s*run:\s*npm ci\s*$/m.test(ciWorkflow)) {
  addFailure(failures, 'Main CI must install dependencies with `npm ci`.');
}

if (!ciWorkflow.includes('npm run release:check')) {
  addFailure(failures, 'Main CI must run `npm run release:check`.');
}

const forbiddenCiSnippets = [
  'continue-on-error: true',
  'npm install --legacy-peer-deps',
  'npx tsc --noEmit',
  '|| true',
];

for (const snippet of forbiddenCiSnippets) {
  if (ciWorkflow.includes(snippet)) {
    addFailure(failures, `Main CI must not contain \`${snippet}\`.`);
  }
}

if (failures.length) {
  console.error('Release gate contract failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('audit-release-gate: OK');

export {};
