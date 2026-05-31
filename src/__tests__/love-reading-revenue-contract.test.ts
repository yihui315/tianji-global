import { describe, expect, it } from 'vitest';
import {
  LOVE_PREMIUM_REPORT_LEGACY_PRODUCT_TYPES,
  LOVE_PREMIUM_REPORT_PRICE,
  LOVE_PREMIUM_REPORT_PRODUCT_TYPE,
  isLovePremiumReportProduct,
  normalizeLoveProductType,
} from '@/lib/love-reading/revenue-contract';

describe('TianJi Love revenue contract', () => {
  it('defines the canonical Love premium report product and price', () => {
    expect(LOVE_PREMIUM_REPORT_PRODUCT_TYPE).toBe('love_premium_report');
    expect(LOVE_PREMIUM_REPORT_PRICE.currency).toBe('cny');
    expect(LOVE_PREMIUM_REPORT_PRICE.amountMinor).toBe(1990);
    expect(LOVE_PREMIUM_REPORT_PRICE.display).toBe('¥19.9');
  });

  it('documents the legacy Love premium report aliases', () => {
    expect(LOVE_PREMIUM_REPORT_LEGACY_PRODUCT_TYPES).toEqual([
      'solo_love_report',
      'compatibility_report',
    ]);
  });

  it('normalizes the canonical product and legacy aliases', () => {
    expect(normalizeLoveProductType('love_premium_report')).toBe('love_premium_report');
    expect(normalizeLoveProductType('solo_love_report')).toBe('love_premium_report');
    expect(normalizeLoveProductType('compatibility_report')).toBe('love_premium_report');
  });

  it('returns null for unsupported or empty product values', () => {
    expect(normalizeLoveProductType('unknown')).toBeNull();
    expect(normalizeLoveProductType('')).toBeNull();
    expect(normalizeLoveProductType(null)).toBeNull();
    expect(normalizeLoveProductType(undefined)).toBeNull();
  });

  it('identifies only canonical and legacy Love premium report products', () => {
    expect(isLovePremiumReportProduct('love_premium_report')).toBe(true);
    expect(isLovePremiumReportProduct('solo_love_report')).toBe(true);
    expect(isLovePremiumReportProduct('compatibility_report')).toBe(true);
    expect(isLovePremiumReportProduct('unknown')).toBe(false);
    expect(isLovePremiumReportProduct('')).toBe(false);
    expect(isLovePremiumReportProduct(null)).toBe(false);
    expect(isLovePremiumReportProduct(undefined)).toBe(false);
  });
});

