import { NextRequest, NextResponse } from 'next/server';

const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ELEMENTS = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];
const ELEMENT_COLORS: Record<string, string> = {
  '木': '#22C55E',
  '火': '#EF4444',
  '土': '#D97706',
  '金': '#9CA3AF',
  '水': '#3B82F6',
};
const ELEMENT_EN: Record<string, string> = {
  '木': 'Wood', '火': 'Fire', '土': 'Earth', '金': 'Metal', '水': 'Water',
};

function yearStemIndex(year: number): number {
  return ((year - 4) % 10 + 10) % 10;
}
function yearBranchIndex(year: number): number {
  return ((year - 4) % 12 + 12) % 12;
}
function hourBranchIndex(hour: number): number {
  return Math.floor(((hour + 1) % 24) / 2);
}
function julianDayNumber(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yr = y + 4800 - a;
  const mo = m + 12 * a - 3;
  return d + Math.floor((153 * mo + 2) / 5) + 365 * yr +
    Math.floor(yr / 4) - Math.floor(yr / 100) + Math.floor(yr / 400) - 32045;
}
function buildPillar(stemIdx: number, branchIdx: number) {
  return {
    heavenlyStem: HEAVENLY_STEMS[stemIdx % 10],
    earthlyBranch: EARTHLY_BRANCHES[branchIdx % 12],
    element: ELEMENTS[stemIdx % 10],
  };
}
function calculateBaZi(year: number, month: number, day: number, hour: number) {
  const yearStem = yearStemIndex(year);
  const yearBranch = yearBranchIndex(year);
  const monthStem = ((yearStem % 5) * 2 + (month - 1)) % 10;
  const monthBranch = (month + 1) % 12;
  const jdn = julianDayNumber(year, month, day);
  const dayStem = ((jdn - 11) % 10 + 10) % 10;
  const dayBranch = ((jdn - 11) % 12 + 12) % 12;
  const hourBranch = hourBranchIndex(hour);
  const hourStem = ((dayStem % 5) * 2 + hourBranch) % 10;
  return {
    year: buildPillar(yearStem, yearBranch),
    month: buildPillar(monthStem, monthBranch),
    day: buildPillar(dayStem, dayBranch),
    hour: buildPillar(hourStem, hourBranch),
    dayMasterElement: ELEMENTS[dayStem % 10],
  };
}

function buildSvg(chart: ReturnType<typeof calculateBaZi>, width = 400, height = 400): string {
  const cx = width / 2;
  const cy = height / 2;
  const outerRadius = Math.min(width, height) / 2 - 20;
  const innerRadius = outerRadius * 0.35;
  const midRadius = outerRadius * 0.65;

  const pillars = [
    { label: '年', pillar: chart.year, angle: 0 },
    { label: '月', pillar: chart.month, angle: 90 },
    { label: '日', pillar: chart.day, angle: 180 },
    { label: '时', pillar: chart.hour, angle: 270 },
  ];

  function polarToCartesian(cxi: number, cyi: number, r: number, angleDeg: number) {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cxi + r * Math.cos(angleRad), y: cyi + r * Math.sin(angleRad) };
  }
  function describeArc(cxi: number, cyi: number, r: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(cxi, cyi, r, endAngle);
    const end = polarToCartesian(cxi, cyi, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  }

  const segments = [0, 90, 180, 270].map((startAngle, i) => ({
    startAngle,
    endAngle: startAngle + 90,
    color: i % 2 === 0 ? '#7C3AED' : '#F59E0B',
  }));

  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="glow"><feGaussianBlur stdDeviation="2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="${width}" height="${height}" fill="#0F172A" rx="8"/>
  <circle cx="${cx}" cy="${cy}" r="${outerRadius}" fill="none" stroke="#7C3AED" stroke-width="2" opacity="0.6"/>
  <circle cx="${cx}" cy="${cy}" r="${innerRadius}" fill="none" stroke="#F59E0B" stroke-width="2" opacity="0.6"/>`;

  segments.forEach((seg) => {
    svg += `\n  <path d="${describeArc(cx, cy, (outerRadius + innerRadius) / 2, seg.startAngle, seg.endAngle)}" fill="none" stroke="${seg.color}" stroke-width="${outerRadius - innerRadius}" opacity="0.15"/>`;
  });

  pillars.forEach((p) => {
    const outer = polarToCartesian(cx, cy, outerRadius - 5, p.angle);
    const inner = polarToCartesian(cx, cy, innerRadius + 5, p.angle);
    svg += `\n  <line x1="${inner.x}" y1="${inner.y}" x2="${outer.x}" y2="${outer.y}" stroke="${ELEMENT_COLORS[p.pillar.element]}" stroke-width="2" opacity="0.5"/>`;
  });

  // Center
  svg += `\n  <circle cx="${cx}" cy="${cy}" r="${innerRadius * 0.8}" fill="#1F2937" stroke="#F59E0B" stroke-width="2" filter="url(#glow)"/>
  <text x="${cx}" y="${cy - 8}" text-anchor="middle" fill="#F59E0B" font-size="24" font-weight="bold" font-family="serif">${chart.day.heavenlyStem}</text>
  <text x="${cx}" y="${cy + 14}" text-anchor="middle" fill="${ELEMENT_COLORS[chart.dayMasterElement]}" font-size="12" font-family="sans-serif">${ELEMENT_EN[chart.dayMasterElement]}</text>`;

  // Labels
  pillars.forEach((p) => {
    const labelAngle = p.angle + 45;
    const pos = polarToCartesian(cx, cy, outerRadius + 12, labelAngle);
    svg += `\n  <text x="${pos.x}" y="${pos.y}" text-anchor="middle" dominant-baseline="middle" fill="#F59E0B" font-size="14" font-weight="bold" font-family="sans-serif">${p.label}</text>`;
  });

  // Content
  pillars.forEach((p) => {
    const labelAngle = p.angle + 45;
    const midPos = polarToCartesian(cx, cy, midRadius, labelAngle);
    svg += `\n  <text x="${midPos.x}" y="${midPos.y - 14}" text-anchor="middle" fill="#FCD34D" font-size="18" font-weight="bold" font-family="serif">${p.pillar.heavenlyStem}</text>
  <text x="${midPos.x}" y="${midPos.y + 6}" text-anchor="middle" fill="#FDBA74" font-size="18" font-weight="bold" font-family="serif">${p.pillar.earthlyBranch}</text>
  <text x="${midPos.x}" y="${midPos.y + 24}" text-anchor="middle" fill="${ELEMENT_COLORS[p.pillar.element]}" font-size="11" font-family="sans-serif">${ELEMENT_EN[p.pillar.element]}</text>`;
  });

  // Radial lines
  [0, 90, 180, 270].forEach((angle, i) => {
    const outer = polarToCartesian(cx, cy, outerRadius, angle);
    const innerPt = {
      x: cx + innerRadius * Math.cos(((angle - 90) * Math.PI) / 180),
      y: cy + innerRadius * Math.sin(((angle - 90) * Math.PI) / 180),
    };
    svg += `\n  <line x1="${outer.x}" y1="${outer.y}" x2="${innerPt.x}" y2="${innerPt.y}" stroke="#7C3AED" stroke-width="1" opacity="0.4"/>`;
  });

  svg += `\n  <text x="${cx}" y="${height - 10}" text-anchor="middle" fill="#7C3AED" font-size="10" font-family="sans-serif" opacity="0.7">TianJi Global · 八字命盘</text>`;
  svg += '\n</svg>';

  return svg;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const birthDate = searchParams.get('birthDate') || '2000-08-16';
  const birthTime = searchParams.get('birthTime') || '02:00';
  const gender = searchParams.get('gender') || 'male';
  const format = searchParams.get('format') || 'svg';

  try {
    const [year, month, day] = birthDate.split('-').map(Number);
    const [hourStr] = birthTime.split(':');
    const hour = parseInt(hourStr, 10);
    const chart = calculateBaZi(year, month, day, hour);

    if (format === 'png') {
      // For PNG we'd need sharp/canvas - return SVG with accept header
      return new NextResponse(buildSvg(chart), {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    return NextResponse.json(
      { chart, embedUrl: `/widget/bazi-wheel?birthDate=${birthDate}&birthTime=${birthTime}&gender=${gender}` },
      { headers: { 'Cache-Control': 'public, max-age=3600' } }
    );
  } catch (err) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }
}
