import { describe, expect, it } from 'vitest';
import {
  buildDestinyScan,
  decodeDestinyScanId,
  encodeDestinyScanId,
  toDestinyPreview,
  type DestinyScanInput,
} from '../../lib/destiny-scan';

const input: DestinyScanInput = {
  birthDate: '1994-07-12',
  birthTime: '08:30',
  birthLocation: 'Singapore',
};

const trafficInput: DestinyScanInput = {
  ...input,
  traffic: {
    source: 'tiktok',
    strategy: 'emotional_intense',
    campaign: 'spring-push',
  },
};

describe('destiny-scan', () => {
  it('round-trips the opaque scan id back into the original input', () => {
    const id = encodeDestinyScanId(input);

    expect(id).not.toContain(input.birthDate);
    expect(id).not.toContain(input.birthLocation);
    expect(decodeDestinyScanId(id)).toEqual(input);
  });

  it('builds a deterministic preview while keeping full sections locked out of the preview payload', () => {
    const result = buildDestinyScan(input, 'scan_1');
    const preview = toDestinyPreview(result);

    expect(result.summary.headline.length).toBeGreaterThan(20);
    expect(result.energy.points).toHaveLength(4);
    expect(result.timeline.trend).toHaveLength(7);
    expect(result.relationship.bullets.length).toBeGreaterThan(0);
    expect(preview).not.toHaveProperty('relationship');
    expect(preview).not.toHaveProperty('wealth');
    expect(preview).not.toHaveProperty('actions');
    expect(preview.summary.compatibilityScore).toBe(result.summary.compatibilityScore);
  });

  it('preserves traffic context and shifts copy strategy for traffic-aware scans', () => {
    const id = encodeDestinyScanId(trafficInput);
    const decoded = decodeDestinyScanId(id);
    const result = buildDestinyScan(trafficInput, 'scan_traffic');

    expect(decoded?.traffic).toEqual(trafficInput.traffic);
    expect(result.meta.trafficSource).toBe('tiktok');
    expect(result.meta.strategy).toBe('emotional_intense');
    expect(result.share.caption).toContain('Compatibility signal');
    expect(result.teaser.relationship).toContain('hidden');
  });
});
