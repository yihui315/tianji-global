/**
 * PDF Report Generator
 * TianJi Global | 天机全球
 * 
 * Generates professional PDF reports with embedded chart SVGs,
 * planetary positions tables, house information, and AI interpretations.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { generateNatalChartSvg, generateSynastryChartSvg, svgToDataUrl, type PlanetPoint, type SynastryPlanetData } from './chart-svg';
import { ZODIAC_SIGNS } from './synastry-engine';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WesternReportData {
  birthDate: string;
  birthTime: string;
  birthLocation: { lat: number; lng: number; name?: string };
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
  aiInterpretation?: string;
  language?: 'en' | 'zh';
}

export interface SynastryReportData {
  person1: {
    birthDate: string;
    birthTime: string;
    birthLocation: { lat: number; lng: number; name?: string };
    name?: string;
  };
  person2: {
    birthDate: string;
    birthTime: string;
    birthLocation: { lat: number; lng: number; name?: string };
    name?: string;
  };
  person1Planets: SynastryPlanetData[];
  person2Planets: SynastryPlanetData[];
  aspects: Array<{
    planet1: string;
    planet2: string;
    type: string;
    orb: number;
    strength: number;
    polarity: string;
  }>;
  overallScore: number;
  aiInterpretation?: string;
  language?: 'en' | 'zh';
}

// ─── Color Palette ─────────────────────────────────────────────────────────────

const COLORS = {
  primary: '#3b82f6',
  secondary: '#06b6d4',
  dark: '#1e293b',
  darkLight: '#334155',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  white: '#ffffff',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  gold: '#ffd700',
  silver: '#c0c0c0',
};

const PLANET_COLORS: Record<string, string> = {
  Sun: '#FFD700',
  Moon: '#C0C0C0',
  Mercury: '#B8860B',
  Venus: '#98FB98',
  Mars: '#FF6347',
  Jupiter: '#DAA520',
  Saturn: '#708090',
  Uranus: '#40E0D0',
  Neptune: '#4169E1',
  Pluto: '#8B008B',
};

const ASPECT_COLORS: Record<string, string> = {
  Conjunction: '#FFD700',
  Sextile: '#4CAF50',
  Square: '#F44336',
  Trine: '#2196F3',
  Opposition: '#E91E63',
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

function formatDate(dateStr: string, language: 'en' | 'zh' = 'zh'): string {
  const date = new Date(dateStr);
  if (language === 'zh') {
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

function addTextWithShadow(doc: jsPDF, text: string, x: number, y: number, options: Record<string, unknown> = {}): void {
  doc.setTextColor(COLORS.dark);
  doc.text(text, x + 0.5, y + 0.5, options);
  doc.setTextColor(COLORS.text);
  doc.text(text, x, y, options);
}

// ─── Western Report Generator ─────────────────────────────────────────────────

export async function generateWesternReportPdf(data: WesternReportData): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  const language = data.language || 'zh';

  // ─── Page 1: Cover ───────────────────────────────────────────────────────

  // Background gradient (simulated with rectangles)
  doc.setFillColor(30, 41, 59); // dark slate
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Decorative accent bar
  doc.setFillColor(59, 130, 246); // blue-500
  doc.rect(0, 0, 8, pageHeight, 'F');

  // Title
  doc.setTextColor(241, 245, 249); // slate-100
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  const title = language === 'zh' ? '西方星盘报告' : 'Western Natal Chart Report';
  doc.text(title, pageWidth / 2, 60, { align: 'center' });

  // Subtitle
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  const subtitle = language === 'zh' ? '天机全球 · TianJi Global' : 'TianJi Global · Astrology Report';
  doc.text(subtitle, pageWidth / 2, 75, { align: 'center' });

  // Birth info box
  doc.setFillColor(51, 65, 85); // slate-700
  doc.roundedRect(margin + 10, 95, contentWidth - 20, 50, 3, 3, 'F');

  doc.setTextColor(241, 245, 249);
  doc.setFontSize(12);
  
  const birthDateLabel = language === 'zh' ? '出生日期' : 'Birth Date';
  const birthTimeLabel = language === 'zh' ? '出生时间' : 'Birth Time';
  const locationLabel = language === 'zh' ? '出生地点' : 'Location';
  
  doc.setFont('helvetica', 'bold');
  doc.text(`${birthDateLabel}:`, margin + 20, 112);
  doc.text(`${birthTimeLabel}:`, margin + 20, 125);
  doc.text(`${locationLabel}:`, margin + 20, 138);
  
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(data.birthDate, language), margin + 60, 112);
  doc.text(formatTime(data.birthTime), margin + 60, 125);
  const locationStr = data.birthLocation.name || `${data.birthLocation.lat.toFixed(4)}°, ${data.birthLocation.lng.toFixed(4)}°`;
  doc.text(locationStr, margin + 60, 138);

  // Big Three section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  const bigThreeTitle = language === 'zh' ? '三大星体' : 'Big Three';
  doc.text(bigThreeTitle, pageWidth / 2, 165, { align: 'center' });

  // Sun
  doc.setFillColor(51, 65, 85);
  doc.roundedRect(margin + 15, 175, (contentWidth - 30) / 3, 45, 3, 3, 'F');
  doc.setTextColor(255, 215, 0); // gold
  doc.setFontSize(24);
  doc.text('☉', pageWidth / 2 - 30, 195);
  doc.setTextColor(241, 245, 249);
  doc.setFontSize(10);
  const sunLabel = language === 'zh' ? '太阳' : 'Sun';
  doc.text(sunLabel, pageWidth / 2 - 30, 205);
  doc.setFontSize(14);
  doc.text(`${data.bigThree.sun.symbol} ${language === 'zh' ? data.bigThree.sun.signZh : data.bigThree.sun.sign}`, pageWidth / 2 - 30, 213);

  // Moon
  doc.setFillColor(51, 65, 85);
  doc.roundedRect(pageWidth / 2 - (contentWidth - 30) / 6, 175, (contentWidth - 30) / 3, 45, 3, 3, 'F');
  doc.setTextColor(192, 192, 192); // silver
  doc.setFontSize(24);
  const moonLabel = language === 'zh' ? '月亮' : 'Moon';
  doc.text('☽', pageWidth / 2, 195);
  doc.setTextColor(241, 245, 249);
  doc.setFontSize(10);
  doc.text(moonLabel, pageWidth / 2, 205);
  doc.setFontSize(14);
  doc.text(`${data.bigThree.moon.symbol} ${language === 'zh' ? data.bigThree.moon.signZh : data.bigThree.moon.sign}`, pageWidth / 2, 213);

  // Rising
  doc.setFillColor(51, 65, 85);
  doc.roundedRect(pageWidth - margin - 15 - (contentWidth - 30) / 3, 175, (contentWidth - 30) / 3, 45, 3, 3, 'F');
  doc.setTextColor(168, 85, 247); // purple-500
  doc.setFontSize(24);
  const risingLabel = language === 'zh' ? '上升' : 'Rising';
  doc.text('↑', pageWidth / 2 + 30, 195);
  doc.setTextColor(241, 245, 249);
  doc.setFontSize(10);
  doc.text(risingLabel, pageWidth / 2 + 30, 205);
  doc.setFontSize(14);
  doc.text(`${data.bigThree.rising.symbol} ${language === 'zh' ? data.bigThree.rising.signZh : data.bigThree.rising.sign}`, pageWidth / 2 + 30, 213);

  // Footer
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(10);
  const footerText = language === 'zh' 
    ? '本报告仅供娱乐与自我探索，不构成医疗、法律或财务建议。'
    : 'This report is for entertainment and self-reflection only. Not for professional advice.';
  doc.text(footerText, pageWidth / 2, pageHeight - 20, { align: 'center' });

  // ─── Page 2: Natal Chart ──────────────────────────────────────────────────

  doc.addPage();
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setTextColor(59, 130, 246);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const chartTitle = language === 'zh' ? '专业星盘图' : 'Natal Chart';
  doc.text(chartTitle, pageWidth / 2, margin, { align: 'center' });

  // Generate and embed the natal chart SVG
  const planetsForSvg: PlanetPoint[] = data.planets.map(p => ({
    name: p.name,
    longitude: p.longitude,
    signSymbol: p.signSymbol,
    signName: p.sign,
    degree: p.degree,
  }));

  const chartSvg = generateNatalChartSvg(planetsForSvg, data.houses.cusps, {
    width: 400,
    height: 400,
  });
  const chartDataUrl = svgToDataUrl(chartSvg);

  // Add chart image to PDF
  const chartSize = Math.min(contentWidth - 20, 160);
  const chartX = (pageWidth - chartSize) / 2;
  doc.addImage(chartDataUrl, 'SVG', chartX, margin + 10, chartSize, chartSize);

  // Chart info below
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const chartInfo = language === 'zh'
    ? `上升点: ${data.houses.ascendantSign} | 天顶: ${data.houses.mcSign}`
    : `Ascendant: ${data.houses.ascendantSign} | Midheaven: ${data.houses.mcSign}`;
  doc.text(chartInfo, pageWidth / 2, margin + chartSize + 20, { align: 'center' });

  // ─── Page 3: Planetary Positions Table ──────────────────────────────────

  doc.addPage();
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setTextColor(59, 130, 246);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const planetsTitle = language === 'zh' ? '行星位置' : 'Planetary Positions';
  doc.text(planetsTitle, pageWidth / 2, margin, { align: 'center' });

  // Planet positions table
  const planetHeaders = language === 'zh'
    ? [['行星', '符号', '星座', '度数']]
    : [['Planet', 'Symbol', 'Sign', 'Degree']];

  const planetRows = data.planets.map(p => [
    language === 'zh' ? getChinesePlanetName(p.name) : p.name,
    p.symbol,
    `${p.signSymbol} ${language === 'zh' ? p.signZh : p.sign}`,
    `${p.degree.toFixed(1)}°`,
  ]);

  autoTable(doc, {
    head: planetHeaders,
    body: planetRows,
    startY: margin + 10,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    bodyStyles: {
      textColor: [241, 245, 249],
    },
    alternateRowStyles: {
      fillColor: [51, 65, 85],
    },
  });

  // ─── Page 4: House Cusps Table ─────────────────────────────────────────────

  doc.addPage();
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setTextColor(59, 130, 246);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const housesTitle = language === 'zh' ? '宫位信息' : 'House Cusps';
  doc.text(housesTitle, pageWidth / 2, margin, { align: 'center' });

  // House cusps table
  const houseHeaders = language === 'zh'
    ? [['宫位', '符号', '星座', '度数']]
    : [['House', 'Symbol', 'Sign', 'Degree']];

  const houseRows = data.houses.cusps.map((cusp, i) => {
    const signIndex = Math.floor(cusp / 30) % 12;
    const sign = ZODIAC_SIGNS[signIndex];
    return [
      language === 'zh' ? `第${i + 1}宫` : `House ${i + 1}`,
      sign.symbol,
      language === 'zh' ? sign.nameZh : sign.name,
      `${cusp.toFixed(1)}°`,
    ];
  });

  autoTable(doc, {
    head: houseHeaders,
    body: houseRows,
    startY: margin + 10,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: [6, 182, 212], // cyan-500
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    bodyStyles: {
      textColor: [241, 245, 249],
    },
    alternateRowStyles: {
      fillColor: [51, 65, 85],
    },
  });

  // ─── Page 5: AI Interpretation (if available) ────────────────────────────

  if (data.aiInterpretation) {
    doc.addPage();
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    doc.setTextColor(168, 85, 247); // purple-500
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    const aiTitle = language === 'zh' ? 'AI 深度解读' : 'AI Deep Analysis';
    doc.text(aiTitle, pageWidth / 2, margin, { align: 'center' });

    doc.setTextColor(241, 245, 249);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const splitText = doc.splitTextToSize(data.aiInterpretation, contentWidth - 10);
    doc.text(splitText, margin + 5, margin + 20);

    // Disclaimer
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(9);
    const disclaimer = language === 'zh'
      ? '本报告仅供娱乐与自我探索，不构成医疗、法律或财务建议。重要人生决策请咨询具备资质的专业人士。'
      : 'This reading is for entertainment and self-reflection purposes only. It does not constitute medical, legal, or financial advice. Always consult a qualified professional for important life decisions.';
    const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth);
    doc.text(disclaimerLines, margin, pageHeight - 25);
  }

  // Convert to Buffer
  const pdfOutput = doc.output('arraybuffer');
  return Buffer.from(pdfOutput);
}

// ─── Synastry Report Generator ───────────────────────────────────────────────

export async function generateSynastryReportPdf(data: SynastryReportData): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  const language = data.language || 'zh';

  // ─── Page 1: Cover ───────────────────────────────────────────────────────

  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Decorative accent bar
  doc.setFillColor(239, 68, 68); // red-500
  doc.rect(0, 0, 8, pageHeight, 'F');

  // Title
  doc.setTextColor(241, 245, 249);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  const title = language === 'zh' ? '星盘合盘报告' : 'Synastry Report';
  doc.text(title, pageWidth / 2, 55, { align: 'center' });

  // Subtitle
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  const subtitle = language === 'zh' ? '天机全球 · TianJi Global' : 'TianJi Global · Astrology Report';
  doc.text(subtitle, pageWidth / 2, 70, { align: 'center' });

  // Compatibility Score Circle
  doc.setFillColor(51, 65, 85);
  doc.circle(pageWidth / 2, 110, 35, 'F');
  
  const scoreColor = data.overallScore >= 70 ? [34, 197, 94] : data.overallScore >= 50 ? [245, 158, 11] : [239, 68, 68];
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.overallScore}`, pageWidth / 2, 108);
  doc.setFontSize(12);
  doc.setTextColor(148, 163, 184);
  doc.text('/100', pageWidth / 2, 118);

  const scoreLabel = data.overallScore >= 70 
    ? (language === 'zh' ? '高度和谐' : 'Highly Harmonious')
    : data.overallScore >= 50 
    ? (language === 'zh' ? '中等和谐' : 'Moderately Harmonious')
    : (language === 'zh' ? '需要努力' : 'Requires Effort');
  doc.setTextColor(241, 245, 249);
  doc.setFontSize(14);
  doc.text(scoreLabel, pageWidth / 2, 160);

  // Person 1 Info
  doc.setFillColor(51, 65, 85);
  doc.roundedRect(margin + 10, 175, (contentWidth - 30) / 2, 40, 3, 3, 'F');
  doc.setTextColor(59, 130, 246); // blue-500
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const p1Label = language === 'zh' ? '人物 A' : 'Person A';
  doc.text(p1Label, margin + 20, 190);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(241, 245, 249);
  doc.setFontSize(10);
  doc.text(`${formatDate(data.person1.birthDate, language)}`, margin + 20, 202);
  doc.text(formatTime(data.person1.birthTime), margin + 20, 210);

  // Person 2 Info
  doc.setFillColor(51, 65, 85);
  doc.roundedRect(pageWidth / 2 + 5, 175, (contentWidth - 30) / 2, 40, 3, 3, 'F');
  doc.setTextColor(239, 68, 68); // red-500
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const p2Label = language === 'zh' ? '人物 B' : 'Person B';
  doc.text(p2Label, pageWidth / 2 + 15, 190);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(241, 245, 249);
  doc.setFontSize(10);
  doc.text(`${formatDate(data.person2.birthDate, language)}`, pageWidth / 2 + 15, 202);
  doc.text(formatTime(data.person2.birthTime), pageWidth / 2 + 15, 210);

  // Footer
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(10);
  const footerText = language === 'zh' 
    ? '本报告仅供娱乐与自我探索，不构成医疗、法律或财务建议。'
    : 'This report is for entertainment and self-reflection only. Not for professional advice.';
  doc.text(footerText, pageWidth / 2, pageHeight - 20, { align: 'center' });

  // ─── Page 2: Synastry Chart ───────────────────────────────────────────────

  doc.addPage();
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setTextColor(239, 68, 68);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const chartTitle = language === 'zh' ? '合盘星象图' : 'Synastry Chart';
  doc.text(chartTitle, pageWidth / 2, margin, { align: 'center' });

  // Generate and embed the synastry chart SVG
  const chartSvg = generateSynastryChartSvg(data.person1Planets, data.person2Planets, {
    width: 400,
    height: 400,
  });
  const chartDataUrl = svgToDataUrl(chartSvg);

  const chartSize = Math.min(contentWidth - 20, 160);
  const chartX = (pageWidth - chartSize) / 2;
  doc.addImage(chartDataUrl, 'SVG', chartX, margin + 10, chartSize, chartSize);

  // ─── Page 3: Aspects Table ────────────────────────────────────────────────

  doc.addPage();
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setTextColor(59, 130, 246);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const aspectsTitle = language === 'zh' ? '行星相位' : 'Planetary Aspects';
  doc.text(aspectsTitle, pageWidth / 2, margin, { align: 'center' });

  // Aspects table
  const aspectHeaders = language === 'zh'
    ? [['行星1', '相位', '行星2', '误差', '强度']]
    : [['Planet 1', 'Aspect', 'Planet 2', 'Orb', 'Strength']];

  const aspectRows = data.aspects.slice(0, 20).map(a => [
    a.planet1,
    a.type,
    a.planet2,
    `${a.orb.toFixed(1)}°`,
    `${a.strength.toFixed(0)}%`,
  ]);

  autoTable(doc, {
    head: aspectHeaders,
    body: aspectRows,
    startY: margin + 10,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    bodyStyles: {
      textColor: [241, 245, 249],
    },
    alternateRowStyles: {
      fillColor: [51, 65, 85],
    },
  });

  // ─── Page 4: AI Interpretation (if available) ────────────────────────────

  if (data.aiInterpretation) {
    doc.addPage();
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    doc.setTextColor(168, 85, 247);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    const aiTitle = language === 'zh' ? 'AI 深度解读' : 'AI Deep Analysis';
    doc.text(aiTitle, pageWidth / 2, margin, { align: 'center' });

    doc.setTextColor(241, 245, 249);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const splitText = doc.splitTextToSize(data.aiInterpretation, contentWidth - 10);
    doc.text(splitText, margin + 5, margin + 20);

    // Disclaimer
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(9);
    const disclaimer = language === 'zh'
      ? '本报告仅供娱乐与自我探索，不构成医疗、法律或财务建议。重要人生决策请咨询具备资质的专业人士。'
      : 'This reading is for entertainment and self-reflection purposes only. It does not constitute medical, legal, or financial advice. Always consult a qualified professional for important life decisions.';
    const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth);
    doc.text(disclaimerLines, margin, pageHeight - 25);
  }

  // Convert to Buffer
  const pdfOutput = doc.output('arraybuffer');
  return Buffer.from(pdfOutput);
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

function getChinesePlanetName(name: string): string {
  const names: Record<string, string> = {
    Sun: '太阳',
    Moon: '月亮',
    Mercury: '水星',
    Venus: '金星',
    Mars: '火星',
    Jupiter: '木星',
    Saturn: '土星',
    Uranus: '天王星',
    Neptune: '海王星',
    Pluto: '冥王星',
  };
  return names[name] || name;
}
