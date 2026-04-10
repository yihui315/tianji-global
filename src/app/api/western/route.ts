/**
 * Western Natal Chart API
 * TianJi Global | 天机全球
 *
 * Computes precise planetary positions and house cusps using
 * Swiss Ephemeris (sweph) for accurate Western astrology calculations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getChartData, ZODIAC_SIGNS, type ChartData } from '@/lib/synastry-engine';

// ─── Request Types ───────────────────────────────────────────────────────────

interface WesternNatalRequest {
  birthDate: string;       // YYYY-MM-DD
  birthTime: string;       // HH:MM (24-hour format)
  lat: number;             // Birth latitude (-90 to 90)
  lng: number;             // Birth longitude (-180 to 180)
  language?: 'en' | 'zh';
}

// ─── Response Types ───────────────────────────────────────────────────────────

export interface WesternNatalResponse {
  chart: ChartData;
  planets: Array<{
    name: string;
    symbol: string;
    sign: string;
    signZh: string;
    degree: number;
    longitude: number;
    signSymbol: string;
  }>;
  houses: {
    cusps: number[];
    ascendant: number;
    midheaven: number;
    ascendantSign: string;
    ascendantSignZh: string;
    mcSign: string;
    mcSignZh: string;
  };
  bigThree: {
    sun: { sign: string; signZh: string; symbol: string; degree: number };
    moon: { sign: string; signZh: string; symbol: string; degree: number };
    rising: { sign: string; signZh: string; symbol: string; degree: number };
  };
  meta: {
    platform: string;
    version: string;
    calculationMode: string;
  };
}

// ─── Helper Functions ────────────────────────────────────────────────────────

function getSignFromLongitude(longitude: number) {
  const signIndex = Math.floor(longitude / 30) % 12;
  const sign = ZODIAC_SIGNS[signIndex];
  return {
    sign: sign.name,
    signZh: sign.nameZh,
    symbol: sign.symbol,
  };
}

function formatDegree(longitude: number): number {
  return Math.round((longitude % 30) * 100) / 100;
}

// ─── Route Handler ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body: WesternNatalRequest = await request.json();
    const { birthDate, birthTime, lat, lng, language = 'zh' } = body;

    // Validate required fields
    if (!birthDate || !birthTime) {
      return NextResponse.json(
        { error: 'birthDate and birthTime are required' },
        { status: 400 }
      );
    }

    // Validate coordinates
    if (lat === undefined || lng === undefined) {
      return NextResponse.json(
        { error: 'lat and lng coordinates are required for accurate house calculations' },
        { status: 400 }
      );
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinates. lat must be -90 to 90, lng must be -180 to 180' },
        { status: 400 }
      );
    }

    // Compute natal chart using Swiss Ephemeris
    const chart = getChartData(birthDate, birthTime, lat, lng);

    // Format planet positions
    const planets = chart.planets.map(p => ({
      name: p.name,
      symbol: getPlanetSymbol(p.name),
      sign: p.signName,
      signZh: ZODIAC_SIGNS[p.sign].nameZh,
      degree: formatDegree(p.longitude),
      longitude: Math.round(p.longitude * 100) / 100,
      signSymbol: p.signSymbol,
    }));

    // Get Ascendant and Midheaven signs
    const ascendantSign = getSignFromLongitude(chart.houses.ascendant);
    const midheavenSign = getSignFromLongitude(chart.houses.midheaven);

    // Find Big Three (Sun, Moon, Rising)
    const sun = chart.planets.find(p => p.name === 'Sun');
    const moon = chart.planets.find(p => p.name === 'Moon');

    const bigThree = {
      sun: {
        sign: sun?.signName ?? 'Unknown',
        signZh: sun ? ZODIAC_SIGNS[sun.sign].nameZh : '未知',
        symbol: sun?.signSymbol ?? '?',
        degree: sun ? formatDegree(sun.longitude) : 0,
      },
      moon: {
        sign: moon?.signName ?? 'Unknown',
        signZh: moon ? ZODIAC_SIGNS[moon.sign].nameZh : '未知',
        symbol: moon?.signSymbol ?? '?',
        degree: moon ? formatDegree(moon.longitude) : 0,
      },
      rising: {
        sign: ascendantSign.sign,
        signZh: ascendantSign.signZh,
        symbol: ascendantSign.symbol,
        degree: formatDegree(chart.houses.ascendant),
      },
    };

    const response: WesternNatalResponse = {
      chart,
      planets,
      houses: {
        cusps: chart.houses.houses.map(h => Math.round(h * 100) / 100),
        ascendant: Math.round(chart.houses.ascendant * 100) / 100,
        midheaven: Math.round(chart.houses.midheaven * 100) / 100,
        ascendantSign: ascendantSign.sign,
        ascendantSignZh: ascendantSign.signZh,
        mcSign: midheavenSign.sign,
        mcSignZh: midheavenSign.signZh,
      },
      bigThree,
      meta: {
        platform: 'TianJi Global | 天机全球',
        version: '1.0.0',
        calculationMode: 'Swiss Ephemeris (SWEPH)',
      },
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('Western Natal API error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ─── Planet Symbols ───────────────────────────────────────────────────────────

function getPlanetSymbol(planet: string): string {
  const symbols: Record<string, string> = {
    Sun: '☉',
    Moon: '☽',
    Mercury: '☿',
    Venus: '♀',
    Mars: '♂',
    Jupiter: '♃',
    Saturn: '♄',
    Uranus: '♅',
    Neptune: '♆',
    Pluto: '♇',
  };
  return symbols[planet] ?? '?';
}