#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

function fail(message) {
  console.error(`CLEAN_RELEASE_VERIFY=FAIL`);
  console.error(`ERROR=${message}`);
  process.exit(1);
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8', stdio: 'pipe' });
  if (result.status !== 0) {
    fail(`${command} ${args.join(' ')} failed: ${result.stderr?.trim() ?? 'unknown error'}`);
  }
  return result.stdout?.trim() ?? '';
}

async function sha256(path) {
  return createHash('sha256').update(await readFile(path)).digest('hex');
}

const archivePath = resolve(process.argv[2] ?? '');
const expectedCommit = process.argv[3] ?? '';

if (!archivePath || !/^[0-9a-f]{40}$/.test(expectedCommit)) {
  fail('Usage: verify-clean-release.mjs <archive.tar.gz> <40-char commit>');
}

const checksumPath = `${archivePath}.sha256`;
await stat(archivePath).catch(() => fail(`Archive not found: ${archivePath}`));
await stat(checksumPath).catch(() => fail(`Checksum file not found: ${checksumPath}`));

const expectedSha = (await readFile(checksumPath, 'utf8')).trim().split(/\s+/)[0];
const actualSha = await sha256(archivePath);
if (expectedSha !== actualSha) {
  fail(`Archive SHA-256 mismatch: expected ${expectedSha}, got ${actualSha}`);
}

const extractRoot = await mkdtemp(join(tmpdir(), 'tianji-clean-release-'));
try {
  run('tar', ['-xzf', archivePath, '-C', extractRoot]);

  const required = [
    '.next/BUILD_ID',
    '.next/server',
    '.next/static',
    'public',
    'package.json',
    'package-lock.json',
    'next.config.js',
    'release-manifest.json',
  ];

  for (const relativePath of required) {
    await stat(join(extractRoot, relativePath)).catch(() => fail(`Missing bundle path: ${relativePath}`));
  }

  for (const forbidden of ['.env', '.env.local', '.env.production', '.git']) {
    try {
      await stat(join(extractRoot, forbidden));
      fail(`Forbidden path present in bundle: ${forbidden}`);
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }

  const manifest = JSON.parse(await readFile(join(extractRoot, 'release-manifest.json'), 'utf8'));
  const buildId = (await readFile(join(extractRoot, '.next', 'BUILD_ID'), 'utf8')).trim();
  const packageLockSha256 = await sha256(join(extractRoot, 'package-lock.json'));

  if (manifest.service !== 'tianji-love') fail('Manifest service mismatch');
  if (manifest.commit !== expectedCommit) fail('Manifest commit mismatch');
  if (manifest.buildId !== buildId) fail('Manifest BUILD_ID mismatch');
  if (manifest.packageLockSha256 !== packageLockSha256) fail('Manifest lockfile hash mismatch');
  if (!Number.isFinite(Date.parse(manifest.builtAt))) fail('Manifest builtAt is invalid');
  if (manifest.safety?.containsEnvironmentFiles !== false) fail('Manifest environment-file safety flag mismatch');
  if (manifest.safety?.containsGitDirectory !== false) fail('Manifest git-directory safety flag mismatch');
  if (manifest.safety?.productionCutoverAuthorized !== false) fail('Bundle must not authorize production cutover');

  console.log('CLEAN_RELEASE_VERIFY=PASS');
  console.log(`ARCHIVE_NAME=${basename(archivePath)}`);
  console.log(`ARCHIVE_SHA256=${actualSha}`);
  console.log(`COMMIT=${manifest.commit}`);
  console.log(`BUILD_ID=${manifest.buildId}`);
  console.log(`BUILT_AT=${manifest.builtAt}`);
  console.log('CONTAINS_ENV_FILES=NO');
  console.log('CONTAINS_GIT_DIRECTORY=NO');
  console.log('PRODUCTION_CUTOVER_AUTHORIZED=NO');
} finally {
  await rm(extractRoot, { recursive: true, force: true });
}
