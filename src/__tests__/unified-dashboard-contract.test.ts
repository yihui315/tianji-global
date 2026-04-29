import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { getFeatureLabel, getModuleMeta, getPlanBadge } from '@/lib/unified-frontend';
import { getVisibleSections, mapEntitlementRow } from '@/lib/unified-platform';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: vi.fn(),
  isSupabaseConfigured: vi.fn(() => true),
}));

const repoRoot = process.cwd();
const unifiedDisplayFiles = [
  'src/lib/unified-frontend.ts',
  'src/app/dashboard/page.tsx',
  'src/app/dashboard/profile/[profileId]/page.tsx',
  'src/app/(main)/profile/page.tsx',
  'src/app/(main)/readings/page.tsx',
  'src/app/(main)/reading/[id]/page.tsx',
];

const mojibakePattern = /(?:�|锟|鈥|鍛|鐗|瑗挎|绱|濉旂|鏄撶|涓|姝ｅ|杩斿|缁熶|鍘嗗)/;

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('unified dashboard contract', () => {
  it('keeps unified dashboard and history Chinese copy UTF-8 clean', () => {
    for (const file of unifiedDisplayFiles) {
      expect(read(file), file).not.toMatch(mojibakePattern);
    }

    expect(getModuleMeta('ziwei').labelZh).toBe('紫微斗数');
    expect(getModuleMeta('western').labelZh).toBe('西洋占星');
    expect(getPlanBadge('premium').labelZh).toBe('高级版');
    expect(getFeatureLabel('unifiedProfile', 'zh')).toBe('统一命理画像');
  });

  it('keeps entitlement visibility consistent between free and paid plans', () => {
    expect(getVisibleSections('free')).toEqual({
      visibleSections: ['identity', 'timing'],
      lockedSections: ['relationship', 'career', 'wealth', 'actions', 'risk'],
    });
    expect(getVisibleSections('premium')).toEqual({
      visibleSections: ['identity', 'relationship', 'career', 'wealth', 'timing', 'actions', 'risk'],
      lockedSections: [],
    });
    expect(getVisibleSections('pro')).toEqual({
      visibleSections: ['identity', 'relationship', 'career', 'wealth', 'timing', 'actions', 'risk'],
      lockedSections: [],
    });
  });

  it('maps entitlement rows with plan defaults and feature overrides', () => {
    const entitlement = mapEntitlementRow(
      {
        id: 'ent-1',
        user_id: 'user-1',
        plan: 'premium',
        features: {
          exportPdf: true,
        },
        is_active: true,
      },
      'free',
      'user-1'
    );

    expect(entitlement.plan).toBe('premium');
    expect(entitlement.features.unifiedProfile).toBe(true);
    expect(entitlement.features.deepRelationship).toBe(true);
    expect(entitlement.features.exportPdf).toBe(true);
  });
});
