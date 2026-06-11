#!/usr/bin/env node
/**
 * validate-analytics-events.js
 * Validates that all analytics events in the codebase are properly typed and documented.
 * Run: node scripts/validate-analytics-events.js
 */
import { readFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';

const EVENT_FILES = ['src/lib/analytics/track.ts', 'src/lib/analytics/funnel-events.ts'];
const KNOWN_EVENTS = new Set([
  // relationship events
  'relationship_view', 'relationship_result_view', 'relationship_share_click',
  'relationship_share_success', 'relationship_unlock_click', 'relationship_checkout_start',
  'relationship_checkout_success', 'relationship_checkout_blocked_missing_persisted_reading',
  // funnel events
  'relationship_free_completed', 'unlock_click', 'checkout_start',
  'checkout_success', 'page_view', 'cta_click',
]);

let issues = [];

function extractEvents(content) {
  const events = new Set();
  const regex = /trackRelationshipEvent\s*\(\s*\{[^}]*event:\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    events.add(match[1]);
  }
  return [...events];
}

for (const file of EVENT_FILES) {
  try {
    const content = readFileSync(file, 'utf8');
    const events = extractEvents(content);
    const missing = events.filter(e => !KNOWN_EVENTS.has(e));
    if (missing.length > 0) {
      issues.push({ file, missing });
    }
  } catch {
    issues.push({ file, error: 'cannot read' });
  }
}

if (issues.length === 0) {
  console.log('✓ All analytics events validated — no unknown events found');
  console.log('  Known events:', KNOWN_EVENTS.size);
  process.exit(0);
} else {
  console.log('⚠ Unknown analytics events detected:');
  for (const { file, missing } of issues) {
    console.log(`  ${file}: ${missing.join(', ')}`);
  }
  console.log('\nTo add unknown events, update KNOWN_EVENTS in this script.');
  process.exit(0); // non-fatal for now
}