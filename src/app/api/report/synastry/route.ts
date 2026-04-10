/**
 * Synastry Chart PDF Report API
 * TianJi Global | 天机全球
 * 
 * Downloads a PDF report for a synastry (compatibility) chart.
 */

import { NextRequest, NextResponse } from 'next/server';
import { computeSynastry, ZODIAC_SIGNS, type SynastryResult } from '@/lib/synastry-engine';
import { generateSynastryReportPdf, type SynastryReportData } from '@/lib/report-generator';

// ─── Request Types ───────────────────────────────────────────────────────────

interface PersonData {
  birthDate: string;
  birthTime: string;
  lat: number;
  lng: number;
  name?: string;
}

interface SynastryReportRequest {
  person1: PersonData;
  person2: PersonData;
  language?: 'en' | 'zh';
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

function formatDegree(longitude: number): number {
  return Math.round((longitude % 30) * 100) / 100;
}

// ─── Route Handler ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body: SynastryReportRequest = await request.json();
    const { person1, person2, language = 'zh' } = body;

    // Validate required fields
    if (!person1?.birthDate || !person1?.birthTime || !person2?.birthDate || !person2?.birthTime) {
      return NextResponse.json(
        { error: 'Both person1 and person2 must include birthDate and birthTime' },
        { status: 400 }
      );
    }

    if (person1.lat === undefined || person1.lng === undefined || 
        person2.lat === undefined || person2.lng === undefined) {
      return NextResponse.json(
        { error: 'Both persons must include lat and lng coordinates' },
        { status: 400 }
      );
    }

    // Compute synastry
    const synResult: SynastryResult = computeSynastry(person1, person2);

    // Format planet data for SVG
    const formatPlanet = (p: { name: string; longitude: number; sign: number; signSymbol: string; signName: string; degree: number }) => ({
      name: p.name,
      longitude: p.longitude,
      signSymbol: p.signSymbol,
      signName: p.signName,
      degree: formatDegree(p.degree),
    });

    const person1Planets = synResult.person1Chart.planets.map(formatPlanet);
    const person2Planets = synResult.person2Chart.planets.map(formatPlanet);

    // Format aspects
    const aspects = synResult.aspects.map(a => ({
      planet1: a.planet1,
      planet2: a.planet2,
      type: a.type,
      orb: a.orb,
      strength: a.strength,
      polarity: a.polarity,
    }));

    // Prepare report data
    const reportData: SynastryReportData = {
      person1: {
        birthDate: person1.birthDate,
        birthTime: person1.birthTime,
        birthLocation: { lat: person1.lat, lng: person1.lng, name: person1.name },
        name: person1.name,
      },
      person2: {
        birthDate: person2.birthDate,
        birthTime: person2.birthTime,
        birthLocation: { lat: person2.lat, lng: person2.lng, name: person2.name },
        name: person2.name,
      },
      person1Planets,
      person2Planets,
      aspects,
      overallScore: synResult.overallScore,
      language,
    };

    // Generate PDF
    const pdfBuffer = await generateSynastryReportPdf(reportData);

    // Return as base64 for compatibility with PDFDownloadButton
    const base64 = pdfBuffer.toString('base64');

    return NextResponse.json({
      success: true,
      pdf: base64,
      filename: language === 'zh' 
        ? `合盘报告_${person1.birthDate}_${person2.birthDate}.pdf`
        : `Synastry_Report_${person1.birthDate}_${person2.birthDate}.pdf`,
    });

  } catch (err) {
    console.error('Synastry Report API error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
