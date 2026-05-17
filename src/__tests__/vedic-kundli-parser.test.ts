import { describe, expect, it } from 'vitest';
import { parseKundliPdfText } from '@/lib/astro/vedic/kundli-pdf-parser';

describe('Vedic Kundli PDF text parser placeholder', () => {
  it('parses obvious copied Kundli fields without fabricating missing data', () => {
    const parsed = parseKundliPdfText(`
      Ayanamsa: Lahiri
      Zodiac: Sidereal
      Ascendant: Libra 04°12'
      Moon Sign: Cancer
      Moon Nakshatra: Pushya Pada 2
      7th House: Aries Lord Mars
      Venus: Taurus 18°24' House 8
      Mars: Aries 06°15' House 7
      Dasha: Moon 2025-01-01 to 2035-01-01
    `);

    expect(parsed.metadata?.ayanamsa).toBe('Lahiri');
    expect(parsed.metadata?.zodiac).toBe('sidereal');
    expect(parsed.ascendant?.sign).toBe('Libra');
    expect(parsed.moonSign).toBe('Cancer');
    expect(parsed.moonNakshatra?.name).toBe('Pushya');
    expect(parsed.houses?.[0]).toMatchObject({ house: 7, sign: 'Aries', lord: 'Mars' });
    expect(parsed.planets?.map((planet) => planet.planet)).toEqual(['Venus', 'Mars']);
    expect(parsed.dashaPeriods?.[0]).toMatchObject({ planet: 'Moon' });
  });

  it('returns warnings for missing fields and never invents chart data', () => {
    const parsed = parseKundliPdfText('This PDF text has a name, but no usable chart fields.');

    expect(parsed.planets ?? []).toEqual([]);
    expect(parsed.houses ?? []).toEqual([]);
    expect(parsed.dashaPeriods ?? []).toEqual([]);
    expect(parsed.warnings?.length).toBeGreaterThan(0);
    expect(JSON.stringify(parsed)).not.toMatch(/secret|API_KEY|birthTime|birthLocation|timezone/i);
  });
});
