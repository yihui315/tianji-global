'use client';

/**
 * ConstellationEffect — 星座连线特效
 *
 * 星空中的星座连线动画
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Star {
  x: number;
  y: number;
  size: number;
  twinkle: number;
  speed: number;
}

interface Constellation {
  name: string;
  points: Array<{ x: number; y: number }>;
  color: string;
}

interface ConstellationEffectProps {
  count?: number;
  constellations?: Constellation[];
  animated?: boolean;
}

const DEFAULT_CONSTELLATIONS: Constellation[] = [
  {
    name: '大熊座',
    points: [
      { x: 100, y: 50 }, { x: 150, y: 80 }, { x: 200, y: 70 },
      { x: 250, y: 90 }, { x: 300, y: 100 }, { x: 350, y: 80 }
    ],
    color: '#A782FF'
  },
  {
    name: '猎户座',
    points: [
      { x: 500, y: 150 }, { x: 550, y: 200 }, { x: 600, y: 250 },
      { x: 650, y: 300 }, { x: 700, y: 250 }, { x: 750, y: 200 }
    ],
    color: '#F59E0B'
  }
];

export default function ConstellationEffect({
  count = 80,
  constellations = DEFAULT_CONSTELLATIONS,
  animated = true
}: ConstellationEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stars, setStars] = useState<Star[]>([]);
  const [lines, setLines] = useState<Array<{ from: number; to: number; alpha: number }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize stars
    const initialStars: Star[] = [];
    for (let i = 0; i < count; i++) {
      initialStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        twinkle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.01
      });
    }
    setStars(initialStars);

    // Draw lines between close stars
    const lineUpdates: typeof lines = [];
    for (let i = 0; i < initialStars.length; i++) {
      for (let j = i + 1; j < initialStars.length; j++) {
        const dx = initialStars[i].x - initialStars[j].x;
        const dy = initialStars[i].y - initialStars[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          lineUpdates.push({ from: i, to: j, alpha: 1 - dist / 100 });
        }
      }
    }
    setLines(lineUpdates);

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      initialStars.forEach((star) => {
        star.twinkle += star.speed;
        const alpha = 0.3 + Math.sin(star.twinkle) * 0.3;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();

        // Glow
        if (star.size > 1.5) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(168, 130, 255, ${alpha * 0.2})`;
          ctx.fill();
        }
      });

      // Draw constellation lines
      lineUpdates.forEach((line) => {
        const from = initialStars[line.from];
        const to = initialStars[line.to];
        if (!from || !to) return;

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = `rgba(168, 130, 255, ${line.alpha * 0.15})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [count]);

  return (
    <div className="constellation-effect" style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background: 'linear-gradient(180deg, #030014 0%, #0a0a1e 50%, #1a0a3e 100%)'
        }}
      />

      {/* Constellation labels */}
      <svg
        style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}
        width="100%"
        height="100%"
      >
        {constellations.map((constellation, i) => (
          <g key={i}>
            {/* Draw constellation path */}
            {animated && (
              <motion.path
                d={`M ${constellation.points.map((p, j) =>
                  j === 0 ? `${p.x} ${p.y}` : `L ${p.x} ${p.y}`
                ).join(' ')}`}
                fill="none"
                stroke={constellation.color}
                strokeWidth="2"
                strokeDasharray="1000"
                initial={{ strokeDashoffset: 1000 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 2, delay: i * 0.5 }}
                style={{ filter: `drop-shadow(0 0 4px ${constellation.color})` }}
              />
            )}

            {/* Star points */}
            {constellation.points.map((point, j) => (
              <motion.circle
                key={j}
                cx={point.x}
                cy={point.y}
                r="4"
                fill={constellation.color}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.5 + j * 0.1 }}
                style={{ filter: `drop-shadow(0 0 8px ${constellation.color})` }}
              />
            ))}

            {/* Label */}
            {constellation.points.length > 0 && (
              <motion.text
                x={constellation.points[0].x}
                y={constellation.points[0].y - 20}
                fill={constellation.color}
                fontSize="14"
                fontFamily="serif"
                textAnchor="middle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.5 + constellation.points.length * 0.1 + 0.5 }}
              >
                {constellation.name}
              </motion.text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
