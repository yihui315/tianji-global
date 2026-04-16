'use client';

/**
 * CosmicOrb — 3D宇宙球体
 *
 * 基于 AI_Animation 的3D旋转效果
 * 使用Three.js + React Three Fiber
 */

function buildParticles(count: number, radius: number) {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    const distance = radius * (0.7 + ((index * 17) % 25) / 50);
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      size: 1.5 + (index % 3),
      opacity: 0.2 + ((index * 13) % 50) / 100,
    };
  });
}

interface OrbConfig {
  color?: string;
  wireframe?: boolean;
  rotateSpeed?: number;
  glowIntensity?: number;
}


export default function CosmicOrb({
  color = '#A782FF',
  wireframe = true,
  rotateSpeed = 0.005,
  glowIntensity = 0.5,
  width = 600,
  height = 400,
  className = ''
}: OrbConfig & { width?: number; height?: number; className?: string }) {
  const size = Math.min(width, height);
  const cx = width / 2;
  const cy = height / 2;
  const orbRadius = size * 0.18;
  const particles = buildParticles(48, size * 0.28);
  const spinDuration = `${Math.max(8, 24 - rotateSpeed * 1000)}s`;
  const pulseOpacity = Math.min(0.9, 0.25 + glowIntensity * 0.5);

  return (
    <div className={`cosmic-orb ${className}`} style={{ width, height }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        <defs>
          <radialGradient id="orb-core" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#F5D0FE" stopOpacity="0.95" />
            <stop offset="45%" stopColor={color} stopOpacity="0.85" />
            <stop offset="100%" stopColor="#312E81" stopOpacity="0.2" />
          </radialGradient>
          <radialGradient id="orb-glow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={color} stopOpacity={pulseOpacity} />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="orb-pulse">
          <circle cx={cx} cy={cy} r={orbRadius * 1.9} fill="url(#orb-glow)" />
          <circle cx={cx} cy={cy} r={orbRadius * 1.4} fill="url(#orb-glow)" opacity="0.5" />
        </g>

        <g className="orb-rings">
          {[1.3, 1.8, 2.3].map((ratio, index) => (
            <ellipse
              key={ratio}
              cx={cx}
              cy={cy}
              rx={orbRadius * ratio}
              ry={orbRadius * (0.38 + index * 0.06)}
              fill="none"
              stroke={index === 2 ? '#EC4899' : color}
              strokeOpacity={0.25 - index * 0.04}
              strokeWidth={wireframe ? 1.4 : 2}
              className={`ring-${index + 1}`}
            />
          ))}
        </g>

        <g className="orb-shell">
          <circle
            cx={cx}
            cy={cy}
            r={orbRadius}
            fill="url(#orb-core)"
            stroke={wireframe ? color : '#F5D0FE'}
            strokeOpacity={wireframe ? 0.7 : 0.35}
            strokeWidth={wireframe ? 1.5 : 0.8}
          />
          <path
            d={`M ${cx - orbRadius * 0.7} ${cy + orbRadius * 0.2} Q ${cx} ${cy - orbRadius * 0.9} ${cx + orbRadius * 0.7} ${cy - orbRadius * 0.1}`}
            fill="none"
            stroke="#FDF4FF"
            strokeOpacity="0.45"
            strokeWidth="2"
          />
          <path
            d={`M ${cx - orbRadius * 0.5} ${cy - orbRadius * 0.4} Q ${cx - orbRadius * 0.15} ${cy - orbRadius * 0.75} ${cx + orbRadius * 0.55} ${cy - orbRadius * 0.55}`}
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity="0.25"
            strokeWidth="1.5"
          />
        </g>

        <g className="orb-particles">
          {particles.map((particle, index) => (
            <circle
              key={index}
              cx={cx + particle.x}
              cy={cy + particle.y}
              r={particle.size}
              fill={index % 5 === 0 ? '#EC4899' : color}
              fillOpacity={particle.opacity}
            />
          ))}
        </g>
      </svg>

      <style jsx>{`
        .cosmic-orb {
          border-radius: 16px;
          overflow: hidden;
          background:
            radial-gradient(circle at 50% 45%, rgba(167, 130, 255, 0.22), transparent 34%),
            radial-gradient(circle at 22% 24%, rgba(236, 72, 153, 0.14), transparent 26%),
            linear-gradient(180deg, #030014 0%, #0a0a1e 100%);
        }

        .orb-shell {
          transform-origin: center;
          animation: orbFloat 7s ease-in-out infinite;
        }

        .orb-rings {
          transform-origin: center;
          animation: ringSpin ${spinDuration} linear infinite;
        }

        .orb-particles {
          transform-origin: center;
          animation: ringSpin calc(${spinDuration} * 1.4) linear infinite reverse;
        }

        .ring-2 {
          animation: ringTilt 10s ease-in-out infinite;
          transform-origin: center;
        }

        .ring-3 {
          animation: ringTilt 14s ease-in-out infinite reverse;
          transform-origin: center;
        }

        .orb-pulse {
          animation: pulseGlow 4s ease-in-out infinite;
          transform-origin: center;
        }

        @keyframes ringSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes orbFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-6px) scale(1.02); }
        }

        @keyframes pulseGlow {
          0%, 100% { opacity: 0.75; }
          50% { opacity: 1; }
        }

        @keyframes ringTilt {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(12deg) scale(1.02); }
        }
      `}</style>
    </div>
  );
}
