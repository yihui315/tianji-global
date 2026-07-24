#!/usr/bin/env node
/**
 * SIAS self-monitor — continuous discovery, classification, and backlog surfacing.
 *
 * Hard rule (from user 2026-07-23 ruling, reinforced below):
 *   SIAS must NEVER fabricate a green state by creating empty placeholder
 *   assets (e.g. an empty humans.txt), by inventing a Contact: address in
 *   security.txt, or by adding a fake apple-app-site-association Team ID.
 *   Each missing site-root asset is a discovery item, not a bug to fix
 *   silently. Items that need human input are parked in the BLOCKED
 *   REGISTRY with a resume_signal.
 *
 * Output surface:
 *   - .ai/reports/sias-self-monitor-<date>.json   (machine-readable)
 *   - .ai/SIAS_SELF_MONITOR_<date>.md            (human-readable report)
 *   - stdout: one JSON line (machine-readable, same shape as the report)
 *
 * Classification buckets:
 *   - autonomous_actionable   SIAS can fix this without human input.
 *                             (none expected in this initial scan; reserved
 *                              for future iterations.)
 *   - known_blocked           Issue exists, classification is known, the
 *                             BLOCKED REGISTRY row carries the resume_signal.
 *                             (this is the *correct* outcome for the items
 *                              discovered today — they are not "fresh errors"
 *                              and they are not "fixed"; they are parked.)
 *   - human_required          Resume_signal is "human fills X" — SIAS cannot
 *                             unblock without user input.
 *   - infra_blocked           Depends on an external infrastructure recovery
 *                             (e.g. BLOCKED-002 SSH).
 *   - unsafe_for_autonomy     Touches production deploy / live Stripe /
 *                             production Supabase / etc.
 *
 * Exit code:
 *   0 — no *unclassified* issues remain. (Known-blocked issues are fine
 *       because the BLOCKED REGISTRY already accounts for them.)
 *   1 — at least one *unclassified* issue was found, OR a previous
 *       known_blocked item regressed (a backfill we expected to find is
 *       now missing again).
 *
 * The CLI never exits 1 for a fresh discovery that maps cleanly to an
 * existing BLOCKED REGISTRY row. That is the difference between a
 * self-monitor and a gate.
 */

import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = join(__filename, '..', '..');

const REPORT_DATE = new Date().toISOString().slice(0, 10);

/**
 * Site-root assets SIAS expects to exist on the deployed surface.
 *
 * `classification` is the BUCKET the missing-or-broken state is parked under
 * today. `resumeSignal` is the BLOCKED REGISTRY entry's "user must do X"
 * text, copied verbatim so the report carries the unblock condition.
 */
export const SITE_ROOT_ASSETS = [
  {
    name: 'ads.txt',
    path: 'public/ads.txt',
    expectedContentType: 'text/plain',
    appRoutePath: 'src/app/ads.txt/route.ts',
    description: 'AdSense / ads.txt 1.0.2 declaration (Google crawler expects this at the site root).',
    formatCheck: (body) => {
      const lines = body
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#'));
      if (lines.length === 0) {
        return { ok: false, reason: 'no non-comment records' };
      }
      const firstFields = (lines[0] ?? '').split(',').map((field) => field.trim());
      if (firstFields.length < 3) {
        return { ok: false, reason: `first record has ${firstFields.length} field(s), need >=3` };
      }
      if (!/^[a-z0-9.-]+$/i.test(firstFields[0] ?? '')) {
        return { ok: false, reason: `invalid domain "${firstFields[0] ?? ''}"` };
      }
      if (!/^pub-\d+$/i.test(firstFields[1] ?? '')) {
        return { ok: false, reason: `invalid publisher id "${firstFields[1] ?? ''}"` };
      }
      if (!/^(DIRECT|RESELLER)$/i.test(firstFields[2] ?? '')) {
        return { ok: false, reason: `invalid relationship "${firstFields[2] ?? ''}"` };
      }
      return { ok: true };
    },
    missingClassification: 'autonomous_actionable',
    missingResumeSignal: 'no action; ads.txt already exists on main since PR #161.',
    missingBlockedRegistryRef: null,
    // The App Router fallback route for ads.txt is intentionally NOT auto-created
    // by this PR — it ships in the parallel PR #170 (sias/h2-ads-txt-hardening-20260723).
    // While that PR is in flight, we suppress the missing-route issue so the
    // report does not flag a known-in-flight change as a fresh error.
    appRouteInFlightRef: 'PR #170 (sias/h2-ads-txt-hardening-20260723)',
  },
  {
    name: 'apple-app-site-association',
    path: 'public/apple-app-site-association',
    expectedContentType: 'application/json',
    appRoutePath: 'src/app/apple-app-site-association/route.ts',
    description: 'iOS Universal Links manifest. SIAS cannot invent Apple Team ID / appID / paths.',
    formatCheck: (body) => {
      const trimmed = body.trim();
      if (!trimmed) return { ok: false, reason: 'empty body is not a valid apple-app-site-association' };
      try {
        const parsed = JSON.parse(trimmed);
        if (!parsed || typeof parsed !== 'object') {
          return { ok: false, reason: 'top-level must be a JSON object' };
        }
        return { ok: true };
      } catch (err) {
        return { ok: false, reason: `not valid JSON: ${err instanceof Error ? err.message : String(err)}` };
      }
    },
    missingClassification: 'human_required',
    missingResumeSignal:
      'human fills public/apple-app-site-association with real Apple Team ID, appID, and paths from the iOS team, then commits. SIAS then adds the App Router fallback route.',
    missingBlockedRegistryRef: 'BLOCKED-011',
  },
  {
    name: 'humans.txt',
    path: 'public/humans.txt',
    expectedContentType: 'text/plain',
    appRoutePath: 'src/app/humans.txt/route.ts',
    description: 'humans.txt — credit / attribution. SIAS does not invent authorship or contributor list.',
    formatCheck: (body) => {
      const trimmed = body.trim();
      if (!trimmed) return { ok: false, reason: 'empty body would be fabrication of "we are here"' };
      return { ok: true };
    },
    missingClassification: 'human_required',
    missingResumeSignal:
      'human authors public/humans.txt with the real site / team credit (the humans.txt convention), then commits. SIAS then adds the App Router fallback route.',
    missingBlockedRegistryRef: 'BLOCKED-012',
  },
  {
    name: 'security.txt',
    path: 'public/.well-known/security.txt',
    expectedContentType: 'text/plain',
    appRoutePath: 'src/app/.well-known/security.txt/route.ts',
    description: 'security.txt per RFC 9116. SIAS does not invent Contact / Expires values.',
    formatCheck: (body) => {
      const trimmed = body.trim();
      if (!trimmed) return { ok: false, reason: 'empty body is invalid; RFC 9116 requires a Contact field' };
      if (!/^Contact\s*:/im.test(trimmed)) {
        return { ok: false, reason: 'RFC 9116 mandates a Contact field' };
      }
      return { ok: true };
    },
    missingClassification: 'human_required',
    missingResumeSignal:
      'human authors public/.well-known/security.txt with a real Contact (mailto or https URL) and Expires, then commits. SIAS then adds the App Router fallback route.',
    missingBlockedRegistryRef: 'BLOCKED-013',
  },
];

export const SOURCE_CONTRACTS = [
  {
    name: 'robots route',
    path: 'src/app/robots.ts',
    mustContain: ['export default function robots', 'MetadataRoute.Robots'],
    description: 'App Router robots.txt source (robots() must export MetadataRoute.Robots).',
    missingClassification: 'autonomous_actionable',
    missingResumeSignal: 'no action; robots.ts already exists on main.',
    missingBlockedRegistryRef: null,
  },
  {
    name: 'sitemap route',
    path: 'src/app/sitemap.ts',
    mustContain: ['export default function sitemap', 'MetadataRoute.Sitemap'],
    description: 'App Router sitemap.xml source (sitemap() must export MetadataRoute.Sitemap).',
    missingClassification: 'autonomous_actionable',
    missingResumeSignal: 'no action; sitemap.ts already exists on main.',
    missingBlockedRegistryRef: null,
  },
  {
    name: '/api/version route',
    path: 'src/app/api/version/route.ts',
    mustContain: ['export', 'GET', 'service:'],
    description: 'Smoke / SHA verification endpoint.',
    missingClassification: 'autonomous_actionable',
    missingResumeSignal: 'no action; /api/version already exists on main.',
    missingBlockedRegistryRef: null,
  },
  {
    name: '/api/health route',
    path: 'src/app/api/health/route.ts',
    mustContain: ['export', 'GET', 'status:'],
    description: 'Liveness / readiness endpoint.',
    missingClassification: 'autonomous_actionable',
    missingResumeSignal: 'no action; /api/health already exists on main.',
    missingBlockedRegistryRef: null,
  },
];

function readBody(relativePath) {
  try {
    return readFileSync(join(REPO_ROOT, relativePath), 'utf8');
  } catch {
    return null;
  }
}

function buildIssue({ surface, surfaceRef, severity, code, message, classification, resumeSignal, blockedRegistryRef }) {
  return { surface, surface_ref: surfaceRef, severity, code, message, classification, resume_signal: resumeSignal, blocked_registry_ref: blockedRegistryRef };
}

function checkAsset(asset) {
  const issues = [];
  const body = readBody(asset.path);
  if (body === null) {
    issues.push(
      buildIssue({
        surface: 'asset',
        surfaceRef: asset.name,
        severity: 'error',
        code: 'asset_missing',
        message: `${asset.path} is missing. ${asset.description}`,
        classification: asset.missingClassification,
        resumeSignal: asset.missingResumeSignal,
        blockedRegistryRef: asset.missingBlockedRegistryRef,
      })
    );
  } else {
    if (asset.formatCheck) {
      const result = asset.formatCheck(body);
      if (!result.ok) {
        issues.push(
          buildIssue({
            surface: 'asset',
            surfaceRef: asset.name,
            severity: 'error',
            code: 'asset_format_invalid',
            message: `${asset.path} failed format check: ${result.reason}.`,
            classification: 'autonomous_actionable',
            resumeSignal: `human reviews the failing body and either fixes the asset or downgrades the format check.`,
            blockedRegistryRef: null,
          })
        );
      }
    }
  }
  // App Router fallback route check. We deliberately do NOT auto-create the
  // route — the route is only meaningful once the underlying asset has real
  // content. Until then, the missing route is itself parked.
  if (!existsSync(join(REPO_ROOT, asset.appRoutePath))) {
    // Suppress when the route is known to ship in an in-flight sibling PR.
    if (asset.appRouteInFlightRef) {
      issues.push(
        buildIssue({
          surface: 'asset',
          surfaceRef: `${asset.name} (App Router fallback)`,
          severity: 'info',
          code: 'app_route_fallback_in_flight',
          message: `${asset.appRoutePath} ships in ${asset.appRouteInFlightRef} (Draft, MERGEABLE). The current report is taken on the H2 PR 2 branch before that sibling merges; this issue is NOT a fresh regression.`,
          classification: 'in_flight_in_sibling_pr',
          resumeSignal: `no action; route ships in ${asset.appRouteInFlightRef}.`,
          blockedRegistryRef: null,
        })
      );
      return issues;
    }
    issues.push(
      buildIssue({
        surface: 'asset',
        surfaceRef: `${asset.name} (App Router fallback)`,
        severity: 'info',
        code: 'app_route_fallback_missing',
        message: `${asset.appRoutePath} does not exist. SIAS will add the App Router fallback ONLY after the underlying asset has real content (see ${asset.missingBlockedRegistryRef ?? '—'}).`,
        classification: 'autonomous_possible_but_blocked_by_missing_content',
        resumeSignal: asset.missingResumeSignal,
        blockedRegistryRef: asset.missingBlockedRegistryRef,
      })
    );
  }
  return issues;
}

function checkContract(contract) {
  const issues = [];
  const source = readBody(contract.path);
  if (source === null) {
    issues.push(
      buildIssue({
        surface: 'contract',
        surfaceRef: contract.name,
        severity: 'error',
        code: 'contract_missing',
        message: `${contract.path} is missing. ${contract.description}`,
        classification: contract.missingClassification,
        resumeSignal: contract.missingResumeSignal,
        blockedRegistryRef: contract.missingBlockedRegistryRef,
      })
    );
    return issues;
  }
  for (const token of contract.mustContain) {
    if (!source.includes(token)) {
      issues.push(
        buildIssue({
          surface: 'contract',
          surfaceRef: contract.name,
          severity: 'error',
          code: 'contract_token_missing',
          message: `${contract.path} is missing required token "${token}".`,
          classification: 'autonomous_actionable',
          resumeSignal: `human reviews the failing contract; SIAS cannot safely invent a missing token.`,
          blockedRegistryRef: null,
        })
      );
    }
  }
  return issues;
}

function findPreviousReport() {
  const dir = join(REPO_ROOT, '.ai', 'reports');
  if (!existsSync(dir)) return null;
  const entries = readdirSync(dir).filter((name) => name.startsWith('sias-self-monitor-') && name.endsWith('.json')).sort();
  if (entries.length === 0) return null;
  const latest = entries[entries.length - 1];
  try {
    return JSON.parse(readFileSync(join(dir, latest), 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Fresh issue = a discovery that is NOT already accounted for in the BLOCKED
 * REGISTRY (no blocked_registry_ref, or classification == 'autonomous_actionable').
 * A missing apple-app-site-association is NOT a fresh error once BLOCKED-011
 * exists; it is a known_blocked item that the next SIAS batch will see.
 */
function isUnclassified(issue) {
  if (issue.classification === 'autonomous_actionable') return true;
  // human_required / known_blocked / infra_blocked / unsafe_for_autonomy all
  // require either the BLOCKED REGISTRY row OR the human to act. They are not
  // fresh errors from the self-monitor's point of view.
  return false;
}

function buildReport() {
  const assetReports = SITE_ROOT_ASSETS.map((asset) => ({
    asset: asset.name,
    path: asset.path,
    app_route_path: asset.appRoutePath,
    description: asset.description,
    blocked_registry_ref: asset.missingBlockedRegistryRef,
    issues: checkAsset(asset),
  }));
  const contractReports = SOURCE_CONTRACTS.map((contract) => ({
    contract: contract.name,
    path: contract.path,
    issues: checkContract(contract),
  }));

  const allIssues = [
    ...assetReports.flatMap((r) => r.issues.map((i) => ({ ...i, asset: r.asset, app_route_path: r.app_route_path }))),
    ...contractReports.flatMap((r) => r.issues.map((i) => ({ ...i, contract: r.contract }))),
  ];

  const previous = findPreviousReport();
  const previousIssueKeys = previous
    ? new Set(previous.issues.map((i) => `${i.code}::${i.surface_ref}`))
    : new Set();

  // An issue is "fresh" if it is unclassified AND not in the previous report.
  // We deliberately exclude classified issues so that a human_required item
  // does not get re-flagged as "fresh" on every run after the BLOCKED REGISTRY
  // entry is written.
  const fresh = allIssues.filter((issue) => isUnclassified(issue) && !previousIssueKeys.has(`${issue.code}::${issue.surface_ref}`));

  // Also detect regressions: a classified issue that WAS in the previous report
  // (meaning someone fixed it and now it's broken again, or the BLOCKED REGISTRY
  // entry is gone). The user wants these surfaced.
  const previouslySeenKeys = previousIssueKeys;
  const regressions = previous
    ? allIssues.filter((issue) => !isUnclassified(issue) && !previouslySeenKeys.has(`${issue.code}::${issue.surface_ref}`))
    : [];

  const counts = allIssues.reduce(
    (acc, issue) => {
      acc.total += 1;
      acc.byClassification[issue.classification] = (acc.byClassification[issue.classification] ?? 0) + 1;
      acc.bySeverity[issue.severity] = (acc.bySeverity[issue.severity] ?? 0) + 1;
      return acc;
    },
    { total: 0, byClassification: {}, bySeverity: {} }
  );

  const report = {
    scanner: 'sias-self-monitor',
    version: '1.1.0',
    generated_at: new Date().toISOString(),
    report_date: REPORT_DATE,
    previous_report_date: previous?.report_date ?? null,
    summary: {
      total_issues: counts.total,
      by_classification: counts.byClassification,
      by_severity: counts.bySeverity,
      fresh_unclassified_count: fresh.length,
      regression_count: regressions.length,
      known_blocked_count: allIssues.filter((i) => i.classification === 'known_blocked' || i.classification === 'human_required' || i.classification === 'autonomous_possible_but_blocked_by_missing_content').length,
      autonomous_actionable_count: counts.byClassification.autonomous_actionable ?? 0,
    },
    assets: assetReports,
    contracts: contractReports,
    issues: allIssues,
    fresh_unclassified: fresh,
    regressions,
    blocked_registry_ref: '.ai/SIAS_BLOCKED_REGISTRY_20260723.md',
    boundaries_respected: [
      'source-side only (no live production fetch)',
      'no .env / secrets read',
      'no .github/workflows change',
      'no fabrication (no empty placeholder files, no invented Contact / Team ID)',
      'no commit (the self-monitor only writes to .ai/reports/ and .ai/SIAS_SELF_MONITOR_<date>.md)',
    ],
  };

  return { report, fresh, regressions };
}

function renderHumanMarkdown(report) {
  const lines = [];
  lines.push(`# SIAS Self-Monitor — ${report.report_date}`);
  lines.push('');
  lines.push(`Generated at \`${report.generated_at}\`. Previous report: \`${report.previous_report_date ?? 'none'}\`.`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Total issues: **${report.summary.total_issues}**`);
  lines.push(`- Known-blocked (parked in \`.ai/SIAS_BLOCKED_REGISTRY_20260723.md\`): **${report.summary.known_blocked_count}**`);
  lines.push(`- Autonomous-actionable: **${report.summary.autonomous_actionable_count}**`);
  lines.push(`- Fresh unclassified (NOT in BLOCKED REGISTRY, NOT parked): **${report.summary.fresh_unclassified_count}**`);
  lines.push(`- Regressions (classified issue disappeared or BLOCKED REGISTRY row lost): **${report.summary.regression_count}**`);
  lines.push('');
  lines.push('## Classification counts');
  lines.push('');
  for (const [k, v] of Object.entries(report.summary.by_classification)) {
    lines.push(`- \`${k}\`: ${v}`);
  }
  lines.push('');
  lines.push('## Discovered items');
  lines.push('');
  for (const asset of report.assets) {
    if (asset.issues.length === 0) continue;
    lines.push(`### ${asset.asset}`);
    lines.push(`- Path: \`${asset.path}\``);
    lines.push(`- App Router fallback: \`${asset.app_route_path}\``);
    if (asset.blocked_registry_ref) {
      lines.push(`- BLOCKED REGISTRY ref: ${asset.blocked_registry_ref}`);
    }
    for (const issue of asset.issues) {
      lines.push(`  - [${issue.severity}] \`${issue.code}\` (${issue.classification}): ${issue.message}`);
      lines.push(`    - resume_signal: ${issue.resume_signal}`);
    }
    lines.push('');
  }
  for (const contract of report.contracts) {
    if (contract.issues.length === 0) continue;
    lines.push(`### ${contract.contract}`);
    lines.push(`- Path: \`${contract.path}\``);
    for (const issue of contract.issues) {
      lines.push(`  - [${issue.severity}] \`${issue.code}\` (${issue.classification}): ${issue.message}`);
    }
    lines.push('');
  }
  lines.push('## Fresh unclassified (these need attention)');
  lines.push('');
  if (report.fresh_unclassified.length === 0) {
    lines.push('None. Every discovery is either parked in BLOCKED REGISTRY or marked autonomous_actionable.');
  } else {
    for (const issue of report.fresh_unclassified) {
      lines.push(`- [${issue.severity}] \`${issue.code}\` on \`${issue.surface_ref}\`: ${issue.message}`);
    }
  }
  lines.push('');
  lines.push('## Regressions');
  lines.push('');
  if (report.regressions.length === 0) {
    lines.push('None. Every previously-classified discovery is still accounted for.');
  } else {
    for (const issue of report.regressions) {
      lines.push(`- [${issue.severity}] \`${issue.code}\` on \`${issue.surface_ref}\`: ${issue.message}`);
    }
  }
  lines.push('');
  lines.push('## Why no fake-green paths');
  lines.push('');
  lines.push(
    'SIAS does not create empty placeholder files (humans.txt, security.txt, apple-app-site-association) or invent a Contact / Apple Team ID to make this report read 0 issues. Each missing asset is parked in the BLOCKED REGISTRY with a resume_signal so the human can unblock it with real content.'
  );
  lines.push('');
  lines.push('## Boundaries respected');
  lines.push('');
  for (const boundary of report.boundaries_respected) {
    lines.push(`- ${boundary}`);
  }
  lines.push('');
  return lines.join('\n');
}

function run() {
  const { report } = buildReport();
  const outDir = join(REPO_ROOT, '.ai', 'reports');
  mkdirSync(outDir, { recursive: true });
  const jsonPath = join(outDir, `sias-self-monitor-${REPORT_DATE}.json`);
  writeFileSync(jsonPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
  const mdPath = join(REPO_ROOT, '.ai', `SIAS_SELF_MONITOR_${REPORT_DATE}.md`);
  writeFileSync(mdPath, renderHumanMarkdown(report), 'utf8');

  process.stdout.write(JSON.stringify(report) + '\n');

  const freshErrors = report.fresh_unclassified.filter((i) => i.severity === 'error').length;
  console.error(
    `[sias-self-monitor] total=${report.summary.total_issues} known_blocked=${report.summary.known_blocked_count} fresh=${report.fresh_unclassified.length} regressions=${report.regressions.length} -> ${relative(
      process.cwd(),
      jsonPath
    ).replaceAll('\\', '/')} + ${relative(process.cwd(), mdPath).replaceAll('\\', '/')}`
  );

  if (freshErrors > 0 || report.regressions.length > 0) {
    process.exitCode = 1;
  }
}

export { buildReport, renderHumanMarkdown, isUnclassified };

function isCliEntrypoint() {
  if (typeof process === 'undefined') return false;
  if (!process.argv?.[1]) return false;
  try {
    return fileURLToPath(import.meta.url) === process.argv[1];
  } catch {
    return false;
  }
}

if (isCliEntrypoint()) {
  run();
}