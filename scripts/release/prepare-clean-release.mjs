#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const repoRoot = resolve(process.cwd());
const distRoot = join(repoRoot, 'dist', 'clean-release');
const stageRoot = join(distRoot, 'stage');

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: options.capture ? 'pipe' : 'inherit',
    ...options,
  });

  if (result.status !== 0) {
    const stderr = result.stderr?.trim();
    throw new Error(`${command} ${args.join(' ')} failed${stderr ? `: ${stderr}` : ''}`);
  }

  return result.stdout?.trim() ?? '';
}

async function sha256File(path) {
  const bytes = await readFile(path);
  return createHash('sha256').update(bytes).digest('hex');
}

function requireCommit(value) {
  if (!/^[0-9a-f]{40}$/.test(value)) {
    throw new Error('SERVICE_VERSION_COMMIT must be an exact 40-character lowercase commit SHA');
  }
  return value;
}

function requireIsoTimestamp(value) {
  const parsed = Date.parse(value);
  if (!value || !Number.isFinite(parsed)) {
    throw new Error('SERVICE_VERSION_BUILT_AT must be a valid ISO timestamp');
  }
  return new Date(parsed).toISOString();
}

const gitHead = run('git', ['rev-parse', 'HEAD'], { capture: true });
const commit = requireCommit(process.env.SERVICE_VERSION_COMMIT ?? gitHead);
const builtAt = requireIsoTimestamp(process.env.SERVICE_VERSION_BUILT_AT ?? '');

if (gitHead !== commit) {
  throw new Error(`Git HEAD ${gitHead} does not match SERVICE_VERSION_COMMIT ${commit}`);
}

for (const relativePath of ['.next/BUILD_ID', '.next/server', '.next/static']) {
  await stat(join(repoRoot, relativePath));
}

const buildId = (await readFile(join(repoRoot, '.next', 'BUILD_ID'), 'utf8')).trim();
if (!buildId) {
  throw new Error('.next/BUILD_ID is empty');
}

await rm(distRoot, { recursive: true, force: true });
await mkdir(stageRoot, { recursive: true });

await cp(join(repoRoot, '.next'), join(stageRoot, '.next'), {
  recursive: true,
  filter: (source) => !source.includes(`${join('.next', 'cache')}`),
});

const trackedSourceArchive = join(distRoot, 'tracked-source.tar');
run('git', [
  'archive',
  '--format=tar',
  `--output=${trackedSourceArchive}`,
  commit,
  'public',
  'package.json',
  'package-lock.json',
  'next.config.js',
]);
run('tar', ['-xf', trackedSourceArchive, '-C', stageRoot]);
await rm(trackedSourceArchive, { force: true });

for (const relativePath of ['public', 'package.json', 'package-lock.json', 'next.config.js']) {
  await stat(join(stageRoot, relativePath));
}

const packageLockSha256 = await sha256File(join(stageRoot, 'package-lock.json'));
const manifest = {
  schemaVersion: 1,
  service: 'tianji-love',
  commit,
  builtAt,
  buildId,
  nodeVersion: process.version,
  packageLockSha256,
  buildSource: {
    gitHead,
    trackedRuntimeFilesExtractedFromCommit: true,
  },
  runtime: {
    command: 'npm start',
    requiredEnvironment: [
      'NODE_ENV',
      'PORT',
      'SERVICE_VERSION_COMMIT',
      'SERVICE_VERSION_BUILT_AT',
    ],
  },
  safety: {
    containsEnvironmentFiles: false,
    containsGitDirectory: false,
    productionCutoverAuthorized: false,
  },
};

await writeFile(
  join(stageRoot, 'release-manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  { mode: 0o644 },
);

const archiveName = `tianji-love-${commit}.tar.gz`;
const archivePath = join(distRoot, archiveName);
run('tar', ['-czf', archivePath, '-C', stageRoot, '.']);

const archiveSha256 = await sha256File(archivePath);
await writeFile(`${archivePath}.sha256`, `${archiveSha256}  ${archiveName}\n`, { mode: 0o644 });
await writeFile(
  join(distRoot, 'release-summary.json'),
  `${JSON.stringify({ ...manifest, archiveName, archiveSha256 }, null, 2)}\n`,
  { mode: 0o644 },
);

console.log(`CLEAN_RELEASE_ARCHIVE=${archivePath}`);
console.log(`CLEAN_RELEASE_ARCHIVE_NAME=${basename(archivePath)}`);
console.log(`CLEAN_RELEASE_SHA256=${archiveSha256}`);
console.log(`CLEAN_RELEASE_COMMIT=${commit}`);
console.log(`CLEAN_RELEASE_BUILD_ID=${buildId}`);
console.log('TRACKED_RUNTIME_FILES_FROM_COMMIT=YES');
console.log('PRODUCTION_CUTOVER_AUTHORIZED=NO');
