'use client';

import { useEffect, useRef, useState } from 'react';

interface DestinyShareCardProps {
  headline: string;
  oneLiner: string;
  compatibilityScore: number;
  shareUrl: string;
}

export function DestinyShareCard({
  headline,
  oneLiner,
  compatibilityScore,
  shareUrl,
}: DestinyShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const width = canvas.width;
    const height = canvas.height;

    context.clearRect(0, 0, width, height);

    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0f0b1f');
    gradient.addColorStop(0.6, '#1f123b');
    gradient.addColorStop(1, '#3b1a2c');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    context.fillStyle = 'rgba(255,255,255,0.06)';
    context.beginPath();
    context.arc(90, 90, 120, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.arc(width - 110, height - 80, 140, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = '#f59e0b';
    context.font = '600 26px sans-serif';
    context.fillText('AI Destiny Scan', 44, 56);

    context.fillStyle = '#ffffff';
    context.font = '700 40px serif';
    wrapText(context, headline, 44, 118, width - 88, 50);

    context.fillStyle = 'rgba(255,255,255,0.82)';
    context.font = '500 24px sans-serif';
    wrapText(context, oneLiner, 44, 240, width - 88, 34);

    context.fillStyle = 'rgba(255,255,255,0.08)';
    roundRect(context, 44, 320, 220, 92, 24);
    context.fill();
    context.fillStyle = '#ffffff';
    context.font = '700 48px sans-serif';
    context.fillText(`${compatibilityScore}%`, 72, 380);
    context.fillStyle = '#fcd34d';
    context.font = '500 20px sans-serif';
    context.fillText('Relationship signal', 72, 344);

    context.fillStyle = 'rgba(255,255,255,0.68)';
    context.font = '400 18px sans-serif';
    context.fillText('tianji-global.vercel.app', 44, height - 30);
  }, [compatibilityScore, headline, oneLiner]);

  async function copyText() {
    await navigator.clipboard.writeText(`${headline}\n${oneLiner}\nCompatibility: ${compatibilityScore}%\n${shareUrl}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function downloadPng() {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const url = canvas.toDataURL('image/png');
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'destiny-share-card.png';
    anchor.click();
  }

  async function share() {
    if (navigator.share) {
      await navigator.share({
        title: headline,
        text: `${oneLiner} Compatibility: ${compatibilityScore}%`,
        url: shareUrl,
      });
      return;
    }

    await copyText();
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">One-line share card</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Turn the result into something worth sharing</h3>
        </div>
        <div className="rounded-full border border-amber-300/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-100">
          Compatibility {compatibilityScore}%
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={1200}
        height={630}
        className="w-full rounded-2xl bg-[#0f0b1f]"
      />

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={copyText}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
        >
          {copied ? 'Copied' : 'Copy text'}
        </button>
        <button
          onClick={downloadPng}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
        >
          Download PNG
        </button>
        <button
          onClick={share}
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:opacity-90"
        >
          Share result
        </button>
      </div>
    </div>
  );
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  words.forEach((word) => {
    const testLine = `${line}${word} `;
    if (context.measureText(testLine).width > maxWidth && line) {
      context.fillText(line.trim(), x, currentY);
      line = `${word} `;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  });

  if (line.trim()) {
    context.fillText(line.trim(), x, currentY);
  }
}
