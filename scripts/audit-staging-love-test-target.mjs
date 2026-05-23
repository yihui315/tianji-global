import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const requiredPackageScripts = [
  'build:staging:degraded',
  'audit:staging:degraded',
];

const requiredSourceFiles = [
  'src/app/(main)/love-test/page.tsx',
  'src/app/api/share/card/route.tsx',
  'src/__tests__/love-test-mvp-contract.test.ts',
];

const loveTestMaterialFiles = [
  'src/lib/love-test.ts',
  'assets/love-test-share-card-prompts.md',
  'assets/love-test-short-video-scripts.md',
  'assets/love-test-copywriting.md',
  'assets/love-test-monthly-report.md',
  'assets/love-test-personality.md',
  'data/love-test-event-tracking.csv',
  'data/love-test-kpi-tracking.csv',
];

const stagingDocs = [
  'docs/tianji-love-staging-deploy-runbook.md',
  'docs/tianji-love-staging-smoke-runbook.md',
  'docs/tianji-love-staging-https-runbook.md',
  '.ai/TIANJI_LOVE_LANE_S_STAGING_DEPLOY_READY_20260521.md',
  '.ai/TIANJI_LOVE_STAGING_HOST_TARGET_EVIDENCE_20260516.md',
  '.ai/TIANJI_LOVE_STAGING_HOST_TARGET_REVIEW_20260516.md',
];

function fromRoot(relativePath) {
  return path.join(root, relativePath);
}

function readText(relativePath) {
  try {
    return fs.readFileSync(fromRoot(relativePath), 'utf8');
  } catch {
    return '';
  }
}

function exists(relativePath) {
  return fs.existsSync(fromRoot(relativePath));
}

function statusWhen(value) {
  return value ? 'go' : 'no-go';
}

function readPackageJson() {
  try {
    return JSON.parse(readText('package.json'));
  } catch {
    return {};
  }
}

function gitStatusFor(relativePaths) {
  try {
    return execFileSync('git', ['status', '--short', '--', ...relativePaths], {
      cwd: root,
      encoding: 'utf8',
      windowsHide: true,
    });
  } catch {
    return '';
  }
}

function gitStatusLines(relativePaths) {
  return gitStatusFor(relativePaths)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function pathFromStatusLine(line) {
  return line.replace(/^[MADRCU?! ]{1,2}\s+/, '');
}

function missingPaths(paths) {
  return paths.filter((relativePath) => !exists(relativePath));
}

function hasEvery(source, needles) {
  return needles.every((needle) => source.includes(needle));
}

function main() {
  const packageJson = readPackageJson();
  const packageScripts = packageJson.scripts || {};
  const candidatePaths = [...requiredSourceFiles, ...loveTestMaterialFiles];
  const candidateStatusLines = gitStatusLines(candidatePaths);
  const untrackedCandidateFiles = candidateStatusLines
    .filter((line) => line.startsWith('??'))
    .map(pathFromStatusLine);

  const combinedStagingDocs = stagingDocs.map(readText).join('\n');
  const packageScriptMissing = requiredPackageScripts.filter((scriptName) => !packageScripts[scriptName]);
  const deployWrapper = String(packageScripts['deploy:staging:degraded'] || '');

  const result = {
    packageScripts: statusWhen(packageScriptMissing.length === 0),
    localLoveTestSource: statusWhen(missingPaths(requiredSourceFiles).length === 0),
    loveTestMaterials: statusWhen(missingPaths(loveTestMaterialFiles).length === 0),
    stagingDocs: statusWhen(missingPaths(stagingDocs).length === 0),
    stagingUrlDocumented: statusWhen(combinedStagingDocs.includes('staging.tianji.love')),
    stagingPathDocumented: statusWhen(combinedStagingDocs.includes('/var/www/tianji-global-staging')),
    stagingPortDocumented: statusWhen(combinedStagingDocs.includes('3058')),
    stagingPm2AppDocumented: statusWhen(combinedStagingDocs.includes('tianji-staging')),
    deployWrapperBuildOnly: statusWhen(deployWrapper === 'npm run build:staging:degraded'),
    currentCandidateSourceRef: statusWhen(untrackedCandidateFiles.length === 0),
    loveTestSmokeScopeDocumented: statusWhen(
      hasEvery(combinedStagingDocs, ['STAGING_BASE_URL', 'smoke:staging:nonpaid']),
    ),
    secretsFreeValidation: 'go',
  };

  const blockers = [];

  if (packageScriptMissing.length > 0) {
    blockers.push(`Missing package scripts: ${packageScriptMissing.join(', ')}`);
  }

  const missingRequiredSource = missingPaths(requiredSourceFiles);
  if (missingRequiredSource.length > 0) {
    blockers.push(`Missing Love-Test source/test files: ${missingRequiredSource.join(', ')}`);
  }

  const missingMaterials = missingPaths(loveTestMaterialFiles);
  if (missingMaterials.length > 0) {
    blockers.push(`Missing Love-Test material files: ${missingMaterials.join(', ')}`);
  }

  const missingDocs = missingPaths(stagingDocs);
  if (missingDocs.length > 0) {
    blockers.push(`Missing staging docs: ${missingDocs.join(', ')}`);
  }

  if (untrackedCandidateFiles.length > 0) {
    blockers.push(
      `Current Love-Test candidate has no committed deploy source ref: ${untrackedCandidateFiles.join(', ')}`,
    );
  }

  if (result.deployWrapperBuildOnly === 'go') {
    blockers.push('deploy:staging:degraded is build-only and does not deploy the current candidate.');
  }

  if (result.stagingUrlDocumented !== 'go') {
    blockers.push('No documented staging URL found.');
  }

  if (result.stagingPathDocumented !== 'go' || result.stagingPortDocumented !== 'go') {
    blockers.push('No complete documented staging path/port target found.');
  }

  const overall = blockers.length === 0 ? 'go' : 'no-go';

  console.log(JSON.stringify({
    ...result,
    overall,
    blockers,
  }, null, 2));
}

main();
