'use client';

import { useState, useCallback, useEffect } from 'react';

/**
 * Config panel for live-tuning mystic parameters.
 * Exposed via a gear icon in the bottom-right corner.
 *
 * Controls:
 *  - Vignette intensity  (--vignette-intensity)
 *  - Wobble intensity    (--wobble-intensity)
 *  - Particle density    (--particle-density)
 *  - Color theme preset
 *  - Background preset
 */

interface Preset {
  label: string;
  vars: Record<string, string>;
}

const COLOR_THEMES: Preset[] = [
  {
    label: '🔮 深紫宇宙',
    vars: {
      '--mystic-accent-purple': '#7C3AED',
      '--mystic-accent-gold': '#F59E0B',
      '--mystic-glow-color': 'rgba(168,130,255,0.3)',
    },
  },
  {
    label: '✨ 金色命运',
    vars: {
      '--mystic-accent-purple': '#D97706',
      '--mystic-accent-gold': '#FCD34D',
      '--mystic-glow-color': 'rgba(252,211,77,0.3)',
    },
  },
  {
    label: '🃏 暗黑塔罗',
    vars: {
      '--mystic-accent-purple': '#991B1B',
      '--mystic-accent-gold': '#DC2626',
      '--mystic-glow-color': 'rgba(220,38,38,0.2)',
    },
  },
  {
    label: '❄️ 冰蓝星座',
    vars: {
      '--mystic-accent-purple': '#0EA5E9',
      '--mystic-accent-gold': '#67E8F9',
      '--mystic-glow-color': 'rgba(103,232,249,0.25)',
    },
  },
];

const BG_PRESETS: Preset[] = [
  {
    label: '默认星云',
    vars: { '--bg-preset': '0' },
  },
  {
    label: '深渊黑洞',
    vars: { '--bg-preset': '1' },
  },
  {
    label: '银河旋臂',
    vars: { '--bg-preset': '2' },
  },
];

export default function ConfigPanel() {
  const [open, setOpen] = useState(false);
  const [vignetteIntensity, setVignetteIntensity] = useState(0.8);
  const [wobbleIntensity, setWobbleIntensity] = useState(0.6);
  const [particleDensity, setParticleDensity] = useState(25);

  const setVar = useCallback((name: string, value: string) => {
    document.documentElement.style.setProperty(name, value);
  }, []);

  // Init CSS vars on mount
  useEffect(() => {
    setVar('--vignette-intensity', String(vignetteIntensity));
    setVar('--wobble-intensity', String(wobbleIntensity));
    setVar('--particle-density', String(particleDensity));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const applyPreset = useCallback((preset: Preset) => {
    Object.entries(preset.vars).forEach(([k, v]) => setVar(k, v));
  }, [setVar]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[70] w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md flex items-center justify-center text-white/40 hover:text-amber-300 hover:border-amber-300/30 transition-all text-lg"
        aria-label="Open config panel"
        title="调参面板"
      >
        ⚙
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 z-[70] w-80 max-h-[85vh] overflow-y-auto bg-black/90 backdrop-blur-2xl border-l border-t border-white/10 rounded-tl-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-medium text-amber-300 tracking-wider">✦ 神秘调参面板</h3>
        <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white text-sm">✕</button>
      </div>

      {/* Vignette */}
      <label className="block mb-4">
        <span className="text-white/50 text-xs">暗角强度 ({Math.round(vignetteIntensity * 100)}%)</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={vignetteIntensity}
          onChange={e => {
            const v = parseFloat(e.target.value);
            setVignetteIntensity(v);
            setVar('--vignette-intensity', String(v));
          }}
          className="mystic-slider w-full mt-1"
        />
      </label>

      {/* Wobble */}
      <label className="block mb-4">
        <span className="text-white/50 text-xs">晃动强度 ({Math.round(wobbleIntensity * 100)}%)</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={wobbleIntensity}
          onChange={e => {
            const v = parseFloat(e.target.value);
            setWobbleIntensity(v);
            setVar('--wobble-intensity', String(v));
          }}
          className="mystic-slider w-full mt-1"
        />
      </label>

      {/* Particle density */}
      <label className="block mb-5">
        <span className="text-white/50 text-xs">粒子密度 ({particleDensity})</span>
        <input
          type="range"
          min="10"
          max="60"
          step="5"
          value={particleDensity}
          onChange={e => {
            const v = parseInt(e.target.value, 10);
            setParticleDensity(v);
            setVar('--particle-density', String(v));
          }}
          className="mystic-slider w-full mt-1"
        />
      </label>

      {/* Color themes */}
      <div className="mb-5">
        <span className="text-white/50 text-xs block mb-2">颜色主题</span>
        <div className="grid grid-cols-2 gap-2">
          {COLOR_THEMES.map(t => (
            <button
              key={t.label}
              onClick={() => applyPreset(t)}
              className="px-3 py-2 text-xs text-white/70 bg-white/[0.04] border border-white/10 rounded-lg hover:border-amber-300/30 hover:text-amber-200 transition-all"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Background presets */}
      <div className="mb-3">
        <span className="text-white/50 text-xs block mb-2">背景预设</span>
        <div className="flex flex-col gap-2">
          {BG_PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="px-3 py-2 text-xs text-white/70 bg-white/[0.04] border border-white/10 rounded-lg hover:border-amber-300/30 hover:text-amber-200 transition-all text-left"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-white/20 text-[10px] mt-4">数值实时生效 · 刷新后重置</p>
    </div>
  );
}
