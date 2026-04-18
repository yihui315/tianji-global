'use client';

import { useMemo } from 'react';
import BaziWheelWidget from './BaziWheelWidget';
import ZiWeiPalaceWidget from './ZiWeiPalaceWidget';

export type WidgetType = 'bazi-wheel' | 'ziwei-palace' | 'tarot-card' | 'synastry-chart';

export interface WidgetParams {
  birthDate?: string;
  birthTime?: string;
  name?: string;
  gender?: string;
  birthdayType?: 'solar' | 'lunar';
}

interface BaseWidgetProps {
  type: WidgetType;
  params?: WidgetParams;
  width?: number;
  height?: number;
  className?: string;
}

export default function BaseWidget({
  type,
  params = {},
  width = 400,
  height = 400,
  className = '',
}: BaseWidgetProps) {
  const containerStyle = {
    width: `${width}px`,
    height: `${height}px`,
    maxWidth: '100%',
    maxHeight: '100%',
  };

  if (type === 'bazi-wheel') {
    return (
      <div style={containerStyle} className={className}>
        <BaziWheelWidget
          birthDate={params.birthDate}
          birthTime={params.birthTime}
          name={params.name}
          width={width}
          height={height}
        />
      </div>
    );
  }

  if (type === 'ziwei-palace') {
    return (
      <div style={containerStyle} className={className}>
        <ZiWeiPalaceWidget
          birthDate={params.birthDate}
          birthTime={params.birthTime ? parseInt(params.birthTime.split(':')[0]) : 2}
          gender={params.gender === 'female' ? 'female' : 'male'}
          birthdayType={params.birthdayType}
          width={width}
          height={height}
        />
      </div>
    );
  }

  if (type === 'tarot-card') {
    return (
      <div
        style={{
          ...containerStyle,
          background: 'linear-gradient(135deg, #581c87 0%, #1F2937 100%)',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#C4B5FD',
          fontFamily: 'sans-serif',
        }}
        className={className}
      >
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>★</div>
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#FCD34D' }}>
          {params.name || 'Tarot Card'}
        </div>
        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
          {params.birthDate ? `Date: ${params.birthDate}` : 'Draw your cards'}
        </div>
        <div style={{ fontSize: '10px', color: '#7C3AED', marginTop: '8px', opacity: 0.7 }}>
          TianJi Global · 天机全球
        </div>
      </div>
    );
  }

  if (type === 'synastry-chart') {
    return (
      <div
        style={{
          ...containerStyle,
          background: 'linear-gradient(135deg, #0c1a2e 0%, #1F2937 100%)',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
        className={className}
      >
        <svg width={width * 0.7} height={height * 0.5} viewBox="0 0 200 150">
          {/* Simplified synastry chart - two overlapping wheels */}
          <circle cx="80" cy="75" r="55" fill="none" stroke="#7C3AED" strokeWidth="1.5" opacity="0.5" />
          <circle cx="120" cy="75" r="55" fill="none" stroke="#F59E0B" strokeWidth="1.5" opacity="0.5" />
          {/* Overlap */}
          <ellipse cx="100" cy="75" rx="25" ry="40" fill="#7C3AED" opacity="0.15" />
          {/* Connection lines */}
          <line x1="45" y1="40" x2="155" y2="40" stroke="#A78BFA" strokeWidth="1" opacity="0.4" />
          <line x1="35" y1="75" x2="165" y2="75" stroke="#FCD34D" strokeWidth="1" opacity="0.4" />
          <line x1="45" y1="110" x2="155" y2="110" stroke="#A78BFA" strokeWidth="1" opacity="0.4" />
          <line x1="80" y1="20" x2="120" y2="20" stroke="#7C3AED" strokeWidth="1" opacity="0.4" />
          {/* Labels */}
          <text x="80" y="12" textAnchor="middle" fill="#A78BFA" fontSize="8">Person A</text>
          <text x="120" y="12" textAnchor="middle" fill="#FCD34D" fontSize="8">Person B</text>
        </svg>
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#A78BFA' }}>
          {params.name || 'Synastry Chart'}
        </div>
        <div style={{ fontSize: '10px', color: '#7C3AED', marginTop: '4px', opacity: 0.7 }}>
          TianJi Global · 天机全球
        </div>
      </div>
    );
  }

  // Fallback error state
  return (
    <div
      style={{
        ...containerStyle,
        background: '#1F2937',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#EF4444',
        fontFamily: 'sans-serif',
        fontSize: '14px',
        textAlign: 'center',
        padding: '16px',
      }}
      className={className}
    >
      Unknown widget type: {type}
    </div>
  );
}
