import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { PDFReport, type PDFReportData, type ServiceType } from '@/components/pdf/PDFReport';

export const runtime = 'nodejs';

interface PDFRequestBody {
  serviceType: ServiceType;
  birthData?: {
    birthday?: string;
    birthTime?: string;
    gender?: string;
    name?: string;
  };
  resultData: Record<string, unknown>;
  includeAiInterpretation?: boolean;
  language?: 'zh' | 'en';
}

export async function POST(request: NextRequest) {
  try {
    const body: PDFRequestBody = await request.json();

    const { serviceType, birthData, resultData, includeAiInterpretation = true, language = 'zh' } = body;

    if (!serviceType || !resultData) {
      return NextResponse.json({ error: 'Missing required fields: serviceType, resultData' }, { status: 400 });
    }

    const titleMap: Record<string, string> = {
      bazi: language === 'zh' ? '八字命理报告' : 'Ba Zi Report',
      ziwei: language === 'zh' ? '紫微斗数报告' : 'Zi Wei Report',
      yijing: language === 'zh' ? '易经卦象报告' : 'I Ching Report',
      tarot: language === 'zh' ? '塔罗牌报告' : 'Tarot Report',
      fortune: language === 'zh' ? '财富运势报告' : 'Fortune Report',
      synastry: language === 'zh' ? '合盘分析报告' : 'Synastry Report',
    };

    const pdfData: PDFReportData = {
      serviceType,
      title: titleMap[serviceType] || serviceType,
      userName: birthData?.name,
      birthData,
      resultData,
      includeAiInterpretation,
      language,
    };

    // Calculate element counts for BaZi
    if (serviceType === 'bazi') {
      const chart = (resultData as { chart: { year: { element: string }; month: { element: string }; day: { element: string }; hour: { element: string } } }).chart;
      if (chart) {
        const counts: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
        counts[chart.year.element]++;
        counts[chart.month.element]++;
        counts[chart.day.element]++;
        counts[chart.hour.element]++;
        pdfData.elementCounts = counts;
      }
    }

    // Generate PDF buffer
    const buffer = await renderToBuffer(<PDFReport data={pdfData} />);

    // Return as base64
    const base64 = buffer.toString('base64');

    return NextResponse.json({
      success: true,
      pdf: base64,
      filename: `TianJiGlobal_${serviceType}_${new Date().toISOString().split('T')[0]}.pdf`,
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'PDF generation failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
