#!/usr/bin/env node
/**
 * decide-keep-or-discard.js
 * Reads baseline + variant scores, computes delta, decides keep/discard.
 * Usage: node scripts/decide-keep-or-discard.js <baseline.json> <variant.json>
 */
import { readFileSync } from 'fs';
const [,, baselinePath, variantPath] = process.argv;
if (!baselinePath || !variantPath) {
  console.error('Usage: node decide-keep-or-discard.js <baseline.json> <variant.json>'); process.exit(1);
}
const baseline = JSON.parse(readFileSync(baselinePath));
const variant = JSON.parse(readFileSync(variantPath));
const delta = variant.grandTotal - baseline.grandTotal;
const KEEP_THRESHOLD = 2;
const decision = delta >= KEEP_THRESHOLD ? 'keep' : 'discard';
const result = { baseline: baseline.grandTotal, variant: variant.grandTotal, delta, decision, threshold: KEEP_THRESHOLD };
console.log(JSON.stringify(result, null, 2));
