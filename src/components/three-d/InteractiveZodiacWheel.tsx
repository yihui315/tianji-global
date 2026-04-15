'use client';

/**
 * InteractiveZodiacWheel — 交互式星座轮盘
 *
 * 可拖拽旋转的十二星座轮盘
 * 基于 AI_Animation 的交互式3D效果
 */

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface ZodiacSign {
  id: string;
  name: string;
  nameEn: string;
  symbol: string;
  element: string;
  dates: string;
  color: string;
}

const ZODIAC_SIGNS: ZodiacSign[] = [
  { id: 'aries', name: '白羊座', nameEn: 'Aries', symbol: '♈', element: '火', dates: '3.21-4.19', color: '#EF4444' },
  { id: 'taurus', name: '金牛座', nameEn: 'Taurus', symbol: '♉', element: '土', dates: '4.20-5.20', color: '#10B981' },
  { id: 'gemini', name: '双子座', nameEn: 'Gemini', symbol: '♊', element: '风', dates: '5.21-6.21', color: '#F59E0B' },
  { id: 'cancer', name: '巨蟹座', nameEn: 'Cancer', symbol: '♋', element: '水', dates: '6.22-7.22', color: '#94A3B8' },
  { id: 'leo', name: '狮子座', nameEn: 'Leo', symbol: '♌', element: '火', dates: '7.23-8.22', color: '#F97316' },
  { id: 'virgo', name: '处女座', nameEn: 'Virgo', symbol: '♍', element: '土', dates: '8.23-9.22', color: '#84CC16' },
  { id: 'libra', name: '天秤座', nameEn: 'Libra', symbol: '♎', element: '风', dates: '9.23-10.23', color: '#EC4899' },
  { id: 'scorpio', name: '天蝎座', nameEn: 'Scorpio', symbol: '♏', element: '水', dates: '10.24-11.22', color: '#8B5CF6' },
  { id: 'sagittarius', name: '射手座', nameEn: 'Sagittarius', symbol: '♐', element: '火', dates: '11.23-12.21', color: '#6366F1' },
  { id: 'capricorn', name: '摩羯座', nameEn: 'Capricorn', symbol: '♑', element: '土', dates: '12.22-1.19', color: '#14B8A6' },
  { id: 'aquarius', name: '水瓶座', nameEn: 'Aquarius', symbol: '♒', element: '风', dates: '1.20-2.18', color: '#0EA5E9' },
  { id: 'pisces', name: '双鱼座', nameEn: 'Pisces', symbol: '♓', element: '水', dates: '2.19-3.20', color: '#A855F7' }
];

const ELEMENT_SYMBOLS: Record<string, string> = {
  '火': '🔥',
  '土': '🏔️',
  '风': '💨',
  '水': '💧'
};

interface InteractiveZodiacWheelProps {
  language?: 'zh' | 'en';
  selectedSign?: string;
  onSelect?: (sign: ZodiacSign) => void;
  size?: number;
  interactive?: boolean;
}

export default function InteractiveZodiacWheel({
  language = 'zh',
  selectedSign,
  onSelect,
  size = 500,
  interactive = true
}: InteractiveZodiacWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const lastAngle = useRef(0);

  const center = size / 2;
  const outerRadius = size / 2 - 40;
  const innerRadius = size / 4;
  const signRadius = (outerRadius + innerRadius) / 2;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return;
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - center;
    const y = e.clientY - rect.top - center;
    lastAngle.current = Math.atan2(y, x);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - center;
    const y = e.clientY - rect.top - center;
    const angle = Math.atan2(y, x);
    const delta = angle - lastAngle.current;
    setRotation(prev => prev + delta * (180 / Math.PI));
    lastAngle.current = angle;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSignClick = (sign: ZodiacSign) => {
    onSelect?.(sign);

    // Rotate to center the selected sign
    const index = ZODIAC_SIGNS.findIndex(s => s.id === sign.id);
    const targetAngle = -index * 30 + 90;
    setRotation(targetAngle);
  };

  return (
    <div className="zodiac-wheel">
      {/* Outer ring with gradient */}
      <div
        className="wheel-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: size,
          height: size,
          cursor: interactive ? (isDragging ? 'grabbing' : 'grab') : 'default'
        }}
      >
        {/* Background circles */}
        <svg width={size} height={size} className="wheel-bg">
          {/* Outer glow */}
          <defs>
            <radialGradient id="wheelGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx={center} cy={center} r={outerRadius + 20} fill="url(#wheelGlow)" />

          {/* Outer ring */}
          <circle
            cx={center}
            cy={center}
            r={outerRadius}
            fill="none"
            stroke="rgba(168,130,255,0.3)"
            strokeWidth="2"
          />

          {/* Inner ring */}
          <circle
            cx={center}
            cy={center}
            r={innerRadius}
            fill="rgba(0,0,0,0.3)"
            stroke="rgba(168,130,255,0.2)"
            strokeWidth="1"
          />

          {/* Degree marks */}
          {Array.from({ length: 360 }, (_, i) => {
            const angle = (i * Math.PI) / 180;
            const isMajor = i % 30 === 0;
            const r1 = isMajor ? outerRadius - 15 : outerRadius - 8;
            const r2 = outerRadius;
            return (
              <line
                key={i}
                x1={center + r1 * Math.cos(angle - Math.PI / 2)}
                y1={center + r1 * Math.sin(angle - Math.PI / 2)}
                x2={center + r2 * Math.cos(angle - Math.PI / 2)}
                y2={center + r2 * Math.sin(angle - Math.PI / 2)}
                stroke={isMajor ? 'rgba(168,130,255,0.5)' : 'rgba(168,130,255,0.2)'}
                strokeWidth={isMajor ? 2 : 1}
              />
            );
          })}
        </svg>

        {/* Rotating wheel */}
        <motion.div
          className="wheel-content"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          animate={{ rotate: rotation }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        >
          {/* Zodiac signs */}
          {ZODIAC_SIGNS.map((sign, index) => {
            const angle = (index * 30 - 90) * (Math.PI / 180);
            const x = center + signRadius * Math.cos(angle);
            const y = center + signRadius * Math.sin(angle);
            const isSelected = selectedSign === sign.id;

            return (
              <motion.button
                key={sign.id}
                className={`zodiac-sign ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSignClick(sign)}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  transform: 'translate(-50%, -50%)',
                  background: isSelected
                    ? `linear-gradient(135deg, ${sign.color}40, ${sign.color}20)`
                    : 'rgba(0,0,0,0.5)',
                  border: `2px solid ${isSelected ? sign.color : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '50%',
                  width: 50,
                  height: 50,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: isSelected ? `0 0 20px ${sign.color}50` : 'none'
                }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                title={language === 'zh' ? `${sign.name} (${sign.dates})` : `${sign.nameEn} (${sign.dates})`}
              >
                <span style={{ fontSize: 24, color: sign.color }}>{sign.symbol}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Center decoration */}
        <div
          className="center-decoration"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: innerRadius * 1.8,
            height: innerRadius * 1.8,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168,130,255,0.2) 0%, transparent 70%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          <div style={{
            fontSize: 48,
            color: '#A782FF',
            textShadow: '0 0 30px rgba(168,130,255,0.5)'
          }}>
            ✧
          </div>
        </div>

        {/* Labels */}
        {selectedSign && (
          <div
            className="sign-info"
            style={{
              position: 'absolute',
              bottom: -60,
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center'
            }}
          >
            {(() => {
              const sign = ZODIAC_SIGNS.find(s => s.id === selectedSign);
              if (!sign) return null;
              return (
                <>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: sign.color }}>
                    {language === 'zh' ? sign.name : sign.nameEn} {sign.symbol}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                    {sign.dates} · {ELEMENT_SYMBOLS[sign.element]} {sign.element}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Instruction */}
      {interactive && (
        <p className="instruction" style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
          {language === 'zh' ? '👆 拖拽旋转 · 点击选择星座' : '👆 Drag to rotate · Click to select'}
        </p>
      )}

      <style jsx>{`
        .zodiac-wheel {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .wheel-container {
          position: relative;
          border-radius: 50%;
          user-select: none;
        }

        .wheel-bg {
          position: absolute;
          top: 0;
          left: 0;
        }

        .zodiac-sign {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
}

// Zodiac compatibility matrix
export function getZodiacCompatibility(sign1: string, sign2: string): {
  score: number;
  description: string;
  descriptionEn: string;
} {
  const compatible: Record<string, string[]> = {
    'aries': ['leo', 'sagittarius', 'gemini', 'aquarius'],
    'taurus': ['virgo', 'capricorn', 'cancer', 'scorpio'],
    'gemini': ['libra', 'aquarius', 'aries', 'leo'],
    'cancer': ['scorpio', 'pisces', 'taurus', 'virgo'],
    'leo': ['aries', 'sagittarius', 'gemini', 'libra'],
    'virgo': ['taurus', 'capricorn', 'cancer', 'scorpio'],
    'libra': ['gemini', 'aquarius', 'leo', 'sagittarius'],
    'scorpio': ['cancer', 'pisces', 'virgo', 'capricorn'],
    'sagittarius': ['aries', 'leo', 'libra', 'aquarius'],
    'capricorn': ['taurus', 'virgo', 'scorpio', 'pisces'],
    'aquarius': ['gemini', 'libra', 'aries', 'sagittarius'],
    'pisces': ['cancer', 'scorpio', 'capricorn', 'taurus']
  };

  const compatibleSigns = compatible[sign1] || [];
  const isCompatible = compatibleSigns.includes(sign2);

  // Calculate score (simplified)
  let score = 50;
  if (isCompatible) score += 30;
  if (sign1 === sign2) score = 40;

  return {
    score: Math.min(100, score),
    description: isCompatible ? '你们非常契合！' : '需要多加磨合。',
    descriptionEn: isCompatible ? 'You are very compatible!' : 'Need more effort to understand each other.'
  };
}