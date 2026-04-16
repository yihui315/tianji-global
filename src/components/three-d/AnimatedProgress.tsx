'use client';

/**
 * AnimatedProgress — 动态圆形进度条
 *
 * 带有数值动画和颜色渐变的进度环
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  showValue?: boolean;
  label?: string;
  labelEn?: string;
  animated?: boolean;
  duration?: number;
}

export default function AnimatedProgress({
  value,
  size = 120,
  strokeWidth = 8,
  color = '#A782FF',
  bgColor = 'rgba(255,255,255,0.1)',
  showValue = true,
  label,
  labelEn,
  animated = true,
  duration = 1.5
}: AnimatedProgressProps) {
  const [displayValue, setDisplayValue] = useState(animated ? 0 : value);

  useEffect(() => {
    if (!animated) {
      setDisplayValue(value);
      return;
    }

    const start = 0;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      setDisplayValue(Math.round(start + (value - start) * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, animated, duration]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayValue / 100) * circumference;

  // Gradient colors based on value
  const getColor = () => {
    if (displayValue >= 80) return '#10B981';
    if (displayValue >= 60) return '#F59E0B';
    if (displayValue >= 40) return '#6366F1';
    return '#EF4444';
  };

  const progressColor = color === '#A782FF' ? getColor() : color;

  return (
    <div className="animated-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration, ease: 'easeOut' }}
          style={{
            filter: `drop-shadow(0 0 6px ${progressColor}80)`
          }}
        />

        {/* Glow effect */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth + 4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference, opacity: 0.3 }}
          animate={{ strokeDashoffset, opacity: [0.3, 0.6, 0.3] }}
          transition={{
            duration,
            ease: 'easeOut',
            opacity: { duration: 1.5, repeat: Infinity }
          }}
          style={{
            filter: `blur(4px)`
          }}
        />
      </svg>

      {/* Center content */}
      <div className="progress-center">
        {showValue && (
          <span className="progress-value" style={{ color: progressColor }}>
            {displayValue}
          </span>
        )}
        {label && (
          <span className="progress-label">{label}</span>
        )}
        {labelEn && !label && (
          <span className="progress-label">{labelEn}</span>
        )}
      </div>

      <style jsx>{`
        .animated-progress {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .progress-center {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .progress-value {
          font-size: 28px;
          font-weight: bold;
          line-height: 1;
        }
        .progress-label {
          font-size: 11px;
          color: rgba(255,255,255,0.5);
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}

// Multi-ring progress
interface MultiRingProgressProps {
  rings: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  size?: number;
}

export function MultiRingProgress({ rings, size = 200 }: MultiRingProgressProps) {
  return (
    <div className="multi-ring" style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size}>
        {rings.map((ring, i) => {
          const offset = size / 2 - 15 - i * 15;
          const circumference = 2 * Math.PI * offset;
          const dashOffset = circumference - (ring.value / 100) * circumference;

          return (
            <g key={i}>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={offset}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="10"
              />
              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={offset}
                fill="none"
                stroke={ring.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 1.5, delay: i * 0.2, ease: 'easeOut' }}
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
              />
            </g>
          );
        })}
      </svg>

      <div className="multi-ring-legend" style={{
        position: 'absolute',
        bottom: -30,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        fontSize: 11
      }}>
        {rings.map((ring, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: ring.color }} />
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>{ring.label}</span>
            <span style={{ color: ring.color, marginLeft: 'auto', fontWeight: 'bold' }}>{ring.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
