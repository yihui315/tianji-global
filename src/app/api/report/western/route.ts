/**
 * Western Natal Chart PDF Report API
 * TianJi Global | 天机全球
 * 
 * Downloads a PDF report for a Western natal chart.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getChartData, ZODIAC_SIGNS } from '@/lib/synastry-engine';
import { generateWesternReportPdf, type WesternReportData } from '@/lib/report-generator';

// ─── Request Types ───────────────────────────────────────────────────────────

interface WesternReportRequest {
  birthDate: string;
  birthTime: string;
  lat: number;
  lng: number;
  language?: 'en' | 'zh';
  enhanceWithAI?: boolean;
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

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

function getChinesePlanetName(name: string): string {
  const names: Record<string, string> = {
    Sun: '太阳', Moon: '月亮', Mercury: '水星', Venus: '金星', Mars: '火星',
    Jupiter: '木星', Saturn: '土星', Uranus: '天王星', Neptune: '海王星', Pluto: '冥王星',
  };
  return names[name] || name;
}

function getPlanetSymbol(planet: string): string {
  const symbols: Record<string, string> = {
    Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
    Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  };
  return symbols[planet] ?? '?';
}

// ─── Route Handler ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body: WesternReportRequest = await request.json();
    const { birthDate, birthTime, lat, lng, language = 'zh' } = body;

    // Validate required fields
    if (!birthDate || !birthTime) {
      return NextResponse.json(
        { error: 'birthDate and birthTime are required' },
        { status: 400 }
      );
    }

    if (lat === undefined || lng === undefined) {
      return NextResponse.json(
        { error: 'lat and lng coordinates are required' },
        { status: 400 }
      );
    }

    // Compute natal chart
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

    // Find Big Three
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

    // Prepare report data
    const reportData: WesternReportData = {
      birthDate,
      birthTime,
      birthLocation: { lat, lng },
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
      language,
    };

    // Generate PDF
    const pdfBuffer = await generateWesternReportPdf(reportData);

    // Return as base64 for compatibility with PDFDownloadButton
    const base64 = pdfBuffer.toString('base64');

    return NextResponse.json({
      success: true,
      pdf: base64,
      filename: language === 'zh' 
        ? `西方星盘报告_${birthDate}.pdf`
        : `Western_Natal_Report_${birthDate}.pdf`,
    });

  } catch (err) {
    console.error('Western Report API error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
