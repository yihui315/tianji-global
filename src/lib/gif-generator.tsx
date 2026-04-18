/**
 * Animated chart image generation utility using @vercel/og (Satori).
 * Renders chart components as static Open Graph images.
 *
 * For animated GIF/WebP output, the API captures the final rendered state.
 * True multi-frame animation would require puppeteer (installed separately).
 */

import { ImageResponse } from '@vercel/og';

const PUBLIC_DIR = './public/animated';

// Ensure output directory exists
function ensureDir(): void {
  try {
    const { existsSync, mkdirSync } = require('fs');
    if (!existsSync(PUBLIC_DIR)) {
      mkdirSync(PUBLIC_DIR, { recursive: true });
    }
  } catch {
    // ignore
  }
}

export type ChartType = 'bazi' | 'ziwei' | 'tarot' | 'synastry';
export type OutputFormat = 'png' | 'webp' | 'gif';

interface GenerationOptions {
  width?: number;
  height?: number;
  format?: OutputFormat;
}

interface BaziPillar {
  heavenlyStem?: string;
  earthlyBranch?: string;
  element?: string;
}

interface BaziChartData {
  year?: BaziPillar;
  month?: BaziPillar;
  day?: BaziPillar;
  hour?: BaziPillar;
  dayMasterElement?: string;
}

/**
 * Generates a chart image using @vercel/og (Satori).
 * Returns a data URL or public URL to the generated image.
 */
export async function generateAnimatedCard(
  type: ChartType,
  resultData: Record<string, unknown>,
  options: GenerationOptions = {}
): Promise<string> {
  const { width = 600, height = 600, format = 'png' } = options;

  ensureDir();

  const html = buildChartHtml(type, resultData, width, height);

  try {
    const response = new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0F172A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />,
      {
        width,
        height,
      }
    );

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = format === 'webp' ? 'image/webp' : format === 'gif' ? 'image/png' : 'image/png';
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error(`[gif-generator] @vercel/og rendering failed for ${type}:`, error);
    // Return a simple placeholder SVG data URL as fallback
    return buildPlaceholderSvg(type, width, height);
  }
}

/**
 * Generates a static chart image (no animation capture).
 */
export async function generateStaticCard(
  type: ChartType,
  resultData: Record<string, unknown>,
  options: GenerationOptions = {}
): Promise<string> {
  return generateAnimatedCard(type, resultData, options);
}

/**
 * Builds inline HTML for chart rendering.
 * Used as innerHTML content in the OG image response.
 */
function buildChartHtml(type: ChartType, data: Record<string, unknown>, w: number, h: number): string {
  switch (type) {
    case 'bazi':
      return buildBaZiHtml(data, w, h);
    case 'ziwei':
      return buildZiWeiHtml(data, w, h);
    case 'tarot':
      return buildTarotHtml(data, w, h);
    case 'synastry':
      return buildSynastryHtml(data, w, h);
    default:
      return buildPlaceholderHtml(type, w, h);
  }
}

function buildPlaceholderSvg(type: ChartType, w: number, h: number): string {
  const titles: Record<ChartType, string> = {
    bazi: '八字',
    ziwei: '紫微斗数',
    tarot: '塔罗牌',
    synastry: '星盘合盘',
  };
  const title = titles[type];
  return `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect fill="#0F172A" width="${w}" height="${h}"/><text x="${w/2}" y="${h/2}" text-anchor="middle" fill="#7C3AED" font-size="32" font-family="sans-serif">${title}</text></svg>`).toString('base64')}`;
}

function buildPlaceholderHtml(type: ChartType, w: number, h: number): string {
  return '';
}

// ─── BaZi Chart HTML ─────────────────────────────────────────────────────────

function buildBaZiHtml(data: Record<string, unknown>, w: number, h: number): string {
  const chart = (data.chart || data) as BaziChartData;
  const elements: Record<string, string> = {
    '木': '#22C55E', '火': '#EF4444', '土': '#D97706', '金': '#9CA3AF', '水': '#3B82F6',
  };
  const elementEn: Record<string, string> = {
    '木': 'Wood', '火': 'Fire', '土': 'Earth', '金': 'Metal', '水': 'Water',
  };
  const dmElement = chart.dayMasterElement || '木';
  const cx = w / 2, cy = h / 2;
  const outerR = Math.min(w, h) / 2 - 40;
  const innerR = outerR * 0.35, midR = outerR * 0.65;
  const pillars = [
    { label: '年', pillar: chart.year || {}, angle: 0 },
    { label: '月', pillar: chart.month || {}, angle: 90 },
    { label: '日', pillar: chart.day || {}, angle: 180 },
    { label: '时', pillar: chart.hour || {}, angle: 270 },
  ];
  function polar(r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${w}" height="${h}" fill="#0F172A"/>
    <circle cx="${cx}" cy="${cy}" r="${outerR}" fill="none" stroke="#7C3AED" stroke-width="4" opacity="0.6"/>
    <circle cx="${cx}" cy="${cy}" r="${innerR}" fill="none" stroke="#F59E0B" stroke-width="4" opacity="0.6"/>
    ${pillars.map((p, i) => {
      const outer = polar(outerR, p.angle);
      const inner = polar(innerR, p.angle);
      const elem = p.pillar.element || '木';
      return `<line x1="${inner.x}" y1="${inner.y}" x2="${outer.x}" y2="${outer.y}" stroke="${elements[elem]}" stroke-width="3" opacity="0.5"/>`;
    }).join('')}
    ${pillars.map((p) => {
      const mid = polar(midR, p.angle + 45);
      const elem = p.pillar.element || '木';
      return `<text x="${mid.x}" y="${mid.y - 14}" text-anchor="middle" fill="#FCD34D" font-size="${w * 0.05}" font-weight="bold" font-family="serif">${p.pillar.heavenlyStem || ''}</text>
        <text x="${mid.x}" y="${mid.y + 8}" text-anchor="middle" fill="#FDBA74" font-size="${w * 0.05}" font-weight="bold" font-family="serif">${p.pillar.earthlyBranch || ''}</text>
        <text x="${mid.x}" y="${mid.y + 28}" text-anchor="middle" fill="${elements[elem]}" font-size="${w * 0.03}" font-family="sans-serif">${elementEn[elem]}</text>`;
    }).join('')}
    <circle cx="${cx}" cy="${cy}" r="${innerR * 0.8}" fill="#1F2937" stroke="#F59E0B" stroke-width="3"/>
    <text x="${cx}" y="${cy - 10}" text-anchor="middle" fill="#F59E0B" font-size="${w * 0.07}" font-weight="bold" font-family="serif">${chart.day?.heavenlyStem || ''}</text>
    <text x="${cx}" y="${cy + 18}" text-anchor="middle" fill="${elements[dmElement]}" font-size="${w * 0.035}" font-family="sans-serif">${elementEn[dmElement]}</text>
    <text x="${cx}" y="${h - 16}" text-anchor="middle" fill="rgba(245,158,11,0.5)" font-size="${w * 0.025}" font-family="sans-serif">八字 · Ba Zi</text>
  </svg>`;
}

// ─── ZiWei Chart HTML ─────────────────────────────────────────────────────────

function buildZiWeiHtml(data: Record<string, unknown>, w: number, h: number): string {
  const palaces = (data.palaces || []) as Array<{ nameZh: string; mainStar: string; stars: string[] }>;
  const mingzhu = (data.mingzhu || '紫微') as string;
  const cx = w / 2, cy = h / 2;
  const outerSize = Math.min(w, h) * 0.88;
  const boxW = outerSize / 3.2, boxH = outerSize / 4;
  const positions = [
    [cx + boxW * 0.6, cy - boxH * 1.3, 2], [cx, cy - boxH * 1.3, 1], [cx - boxW * 0.6, cy - boxH * 1.3, 0],
    [cx + boxW * 0.6, cy - boxH * 0.1, 3], [cx + boxW * 0.6, cy + boxH * 0.6, 4], [cx, cy + boxH * 1.1, 11],
    [cx - boxW * 0.6, cy + boxH * 0.6, 5], [cx - boxW * 0.6, cy - boxH * 0.1, 10],
    [cx + boxW * 0.6, cy + boxH * 1.1, 6], [cx, cy + boxH * 1.1, 7], [cx - boxW * 0.6, cy + boxH * 1.1, 8],
    [cx, cy + boxH * 2.3, 9],
  ];
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${w}" height="${h}" fill="#0F172A"/>
    ${positions.map(([x, y, idx]) => {
      const p = palaces[idx] || {};
      const isMing = p.nameZh === '命宫';
      return `<rect x="${x - boxW / 2}" y="${y - boxH / 2}" width="${boxW}" height="${boxH}" fill="${isMing ? '#2D1B69' : '#1F2937'}" stroke="${isMing ? '#A78BFA' : '#374151'}" stroke-width="${isMing ? 2 : 1}" rx="4"/>
        <text x="${x}" y="${y - boxH * 0.1}" text-anchor="middle" fill="${isMing ? '#C4B5FD' : '#FCD34D'}" font-size="${boxW * 0.13}" font-weight="bold" font-family="serif">${p.mainStar || ''}</text>
        <text x="${x}" y="${y + boxH * 0.15}" text-anchor="middle" fill="#94A3B8" font-size="${boxW * 0.09}">${(p.stars || []).slice(0, 2).join(' · ')}</text>
        <text x="${x}" y="${y + boxH * 0.38}" text-anchor="middle" fill="#7C3AED" font-size="${boxW * 0.1}" font-weight="bold">${p.nameZh || ''}</text>`;
    }).join('')}
    <circle cx="${cx}" cy="${cy + boxH * 0.1}" r="${boxW * 0.3}" fill="#1F2937" stroke="#A78BFA" stroke-width="2"/>
    <text x="${cx}" y="${cy + boxH * 0.1 + boxW * 0.05}" text-anchor="middle" fill="#C4B5FD" font-size="${boxW * 0.13}" font-weight="bold" font-family="serif">${mingzhu}</text>
    <text x="${cx}" y="${h - 16}" text-anchor="middle" fill="rgba(124,58,237,0.7)" font-size="${w * 0.025}" font-family="sans-serif">紫微斗数 · Zi Wei Dou Shu</text>
  </svg>`;
}

// ─── Tarot HTML ───────────────────────────────────────────────────────────────

function buildTarotHtml(data: Record<string, unknown>, w: number, h: number): string {
  const drawnCards = (data.drawnCards || []) as Array<{
    card: { name: string; nameChinese: string; arcana: string; suit: string };
    isReversed: boolean;
    positionName: string;
  }>;
  const cols = Math.min(drawnCards.length || 3, 3);
  const cardW = Math.floor(w * 0.7 / cols);
  const cardH = Math.floor(cardW * 1.5);
  const gap = 16;
  const totalW = drawnCards.slice(0, cols).length * (cardW + gap) - gap;
  const startX = (w - totalW) / 2;
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${w}" height="${h}" fill="#0F172A"/>
    ${drawnCards.slice(0, 10).map((d, i) => {
      const col = i % cols;
      const x = startX + col * (cardW + gap);
      const y = (h - cardH) / 2;
      const isRev = d.isReversed;
      const symbol = d.card.arcana === 'major' ? '★' : d.card.suit === 'Wands' ? '🔥' : d.card.suit === 'Cups' ? '💧' : d.card.suit === 'Swords' ? '⚔️' : d.card.suit === 'Pentacles' ? '💰' : '?';
      return `<rect x="${x}" y="${y}" width="${cardW}" height="${cardH}" fill="${isRev ? 'url(#revGrad)' : 'url(#frontGrad)'}" rx="8" stroke="${isRev ? '#FCD34D' : '#A78BFA'}" stroke-width="2"/>
        <defs>
          <linearGradient id="frontGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#581c87"/><stop offset="100%" stop-color="#7c3aed"/></linearGradient>
          <linearGradient id="revGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#7c2d12"/><stop offset="100%" stop-color="#991b1b"/></linearGradient>
        </defs>
        <text x="${x + cardW / 2}" y="${y + cardH * 0.35}" text-anchor="middle" fill="#C4B5FD" font-size="${cardW * 0.12}">${symbol}</text>
        <text x="${x + cardW / 2}" y="${y + cardH * 0.55}" text-anchor="middle" fill="${isRev ? '#FCD34D' : '#E9D5FF'}" font-size="${cardW * 0.1}" font-weight="bold">${d.card.nameChinese || d.card.name || ''}</text>
        <text x="${x + cardW / 2}" y="${y + cardH * 0.68}" text-anchor="middle" fill="rgba(196,181,253,0.7)" font-size="${cardW * 0.07}">${d.card.arcana === 'minor' ? (d.card.suit || '') : 'Major'}</text>`;
    }).join('')}
    <text x="${w / 2}" y="${h - 16}" text-anchor="middle" fill="rgba(124,58,237,0.5)" font-size="${w * 0.025}" font-family="sans-serif">塔罗牌 · Tarot</text>
  </svg>`;
}

// ─── Synastry HTML ────────────────────────────────────────────────────────────

function buildSynastryHtml(data: Record<string, unknown>, w: number, h: number): string {
  const score = (data.overallScore || 50) as number;
  const cx = w / 2, cy = h / 2;
  const r = Math.min(w, h) * 0.3;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${w}" height="${h}" fill="#0F172A"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#334155" stroke-width="${r * 0.15}" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${r * 0.15}" stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round" transform="rotate(-90 ${cx} ${cy})"/>
    <text x="${cx}" y="${cy - 8}" text-anchor="middle" fill="white" font-size="${r * 0.4}" font-weight="bold">${score}</text>
    <text x="${cx}" y="${cy + r * 0.25}" text-anchor="middle" fill="#94A3B8" font-size="${r * 0.15}">/ 100</text>
    <text x="${cx}" y="${h - 24}" text-anchor="middle" fill="#7C3AED" font-size="${w * 0.04}" font-family="sans-serif">星盘合盘 · Synastry</text>
  </svg>`;
}
