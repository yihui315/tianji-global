// ─── Shared Utilities ─────────────────────────────────────────────────────────

/**
 * Generate a random URL-safe slug of given byte length.
 * Uses crypto-safe random bytes.
 */
export function randomSlug(byteLength = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const values = new Uint8Array(byteLength);
  // Uses Node.js crypto or browser crypto.getRandomValues
  const crypto = globalThis.crypto ?? (require('crypto') as typeof import('crypto'));
  crypto.getRandomValues(values);
  return Array.from(values)
    .map(v => chars[v % chars.length])
    .join('');
}

/**
 * Format a date string for display
 */
export function formatDate(dateStr: string, lang = 'zh'): string {
  const d = new Date(dateStr);
  if (lang === 'zh') {
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  }
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Clamp a number between min and max
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Generate a score color (CSS rgb string) from 0-100
 */
export function scoreColor(score: number): string {
  if (score >= 75) return 'rgb(52, 211, 153)'; // green
  if (score >= 55) return 'rgb(251, 191, 36)'; // amber
  if (score >= 35) return 'rgb(251, 146, 60)'; // orange
  return 'rgb(248, 113, 113)'; // red
}
