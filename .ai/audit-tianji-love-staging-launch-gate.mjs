#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const fileArgIndex = args.indexOf('--file');
const evidenceFile = fileArgIndex >= 0 ? args[fileArgIndex + 1] : '.ai/TIANJI_LOVE_REVENUE_EVIDENCE_TODO_20260605.md';

const envReadiness = runNode(['.ai/verify-revenue-env-masked.mjs']);
const maskedEvidence = runNode(['.ai/validate-tianji-love-masked-evidence.mjs', '--file', evidenceFile]);

const blockers = [];
if (envReadiness.parsed?.overall !== 'conditional-go') {
  blockers.push('staging env readiness is not Conditional Go');
}
if (maskedEvidence.parsed?.overall !== 'go') {
  blockers.push('masked evidence validator is not Go');
}

for (const item of [envReadiness, maskedEvidence]) {
  if (Array.isArray(item.parsed?.blockers)) {
    blockers.push(...item.parsed.blockers);
  }
}

const uniqueBlockers = [...new Set(blockers)];
const overall = uniqueBlockers.length === 0 ? 'conditional-go' : 'no-go';

console.log(JSON.stringify({
  tool: 'tianji-love-staging-launch-gate',
  secret_handling: 'Only masked verifier and masked evidence validator outputs are included.',
  evidence_file: evidenceFile,
  overall,
  checks: [
    {
      name: 'audit:staging-env-readiness',
      exit_code: envReadiness.status,
      overall: envReadiness.parsed?.overall || 'unknown',
    },
    {
      name: 'masked evidence validator',
      exit_code: maskedEvidence.status,
      overall: maskedEvidence.parsed?.overall || 'unknown',
    },
  ],
  blockers: uniqueBlockers,
}, null, 2));

if (overall !== 'conditional-go') {
  process.exitCode = 1;
}

function runNode(commandArgs) {
  const result = spawnSync(process.execPath, commandArgs, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let parsed = null;
  try {
    parsed = JSON.parse(result.stdout);
  } catch {
    parsed = null;
  }

  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    parsed,
  };
}
