'use client';

/**
 * 命盘可视化组件 - FortuneWheel
 *
 * 功能:
 * 1. 八字命盘可视化
 * 2. 事业/感情/财富/健康四维图
 * 3. 交互式展示
 */

import React, { useState, useEffect } from 'react';

interface FortuneData {
  career: number;    // 事业发展 0-100
  love: number;     // 感情运势 0-100
  wealth: number;   // 财富积累 0-100
  health: number;    // 健康状态 0-100
  date: string;     // 命盘日期
}

interface FortuneWheelProps {
  data: FortuneData;
  language?: 'zh' | 'en';
}

export default function FortuneWheel({ data, language = 'zh' }: FortuneWheelProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(true);
  }, []);

  const labels = {
    zh: { career: '事业', love: '感情', wealth: '财富', health: '健康' },
    en: { career: 'Career', love: 'Love', wealth: 'Wealth', health: 'Health' }
  };

  const l = labels[language];
  const items = [
    { key: 'career', value: data.career, color: '#F59E0B' },
    { key: 'love', value: data.love, color: '#EC4899' },
    { key: 'wealth', value: data.wealth, color: '#10B981' },
    { key: 'health', value: data.health, color: '#6366F1' }
  ];

  // 计算雷达图路径
  const center = 150;
  const radius = 120;
  const getPoint = (value: number, index: number, total: number) => {
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  // 背景网格点
  const gridPoints = [20, 40, 60, 80, 100].map(v => {
    return items.map((_, i) => getPoint(v, i, 4));
  });

  // 数据点
  const dataPoints = items.map((item, i) => getPoint(animated ? item.value : 0, i, 4));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="fortune-wheel">
      <svg viewBox="0 0 300 300" className="wheel-svg">
        {/* 背景网格 */}
        {gridPoints.map((points, vi) => (
          <polygon
            key={vi}
            points={points.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        ))}

        {/* 连接线 */}
        {items.map((_, i) => {
          const p = getPoint(100, i, 4);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
            />
          );
        })}

        {/* 数据区域 */}
        <path
          d={dataPath}
          fill={animated ? 'rgba(168,130,255,0.3)' : 'transparent'}
          stroke="rgba(168,130,255,0.8)"
          strokeWidth="2"
          style={{
            transition: 'all 1s ease-out',
            transformOrigin: `${center}px ${center}px`
          }}
        />

        {/* 数据点 */}
        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={animated ? 6 : 0}
            fill={items[i].color}
            style={{ transition: 'all 0.5s ease-out', transitionDelay: `${i * 0.1}s` }}
          />
        ))}

        {/* 标签 */}
        {items.map((item, i) => {
          const p = getPoint(115, i, 4);
          const percentage = animated ? item.value : 0;
          return (
            <g key={i}>
              <text
                x={p.x}
                y={p.y - 8}
                textAnchor="middle"
                fill="white"
                fontSize="14"
                fontWeight="bold"
              >
                {l[item.key as keyof typeof l]}
              </text>
              <text
                x={p.x}
                y={p.y + 8}
                textAnchor="middle"
                fill={item.color}
                fontSize="16"
                fontWeight="bold"
              >
                {percentage}%
              </text>
            </g>
          );
        })}
      </svg>

      {/* 详细数据 */}
      <div className="fortune-details">
        {items.map((item, i) => (
          <div key={item.key} className="detail-item" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="detail-label" style={{ color: item.color }}>
              {l[item.key as keyof typeof l]}
            </div>
            <div className="detail-bar">
              <div
                className="detail-fill"
                style={{
                  width: animated ? `${item.value}%` : '0%',
                  backgroundColor: item.color,
                  transition: `width 1s ease-out ${i * 0.1}s`
                }}
              />
            </div>
            <div className="detail-value">{item.value}%</div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .fortune-wheel {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 16px;
          padding: 24px;
          color: white;
        }
        .wheel-svg {
          width: 100%;
          max-width: 300px;
          margin: 0 auto;
          display: block;
        }
        .fortune-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-top: 24px;
        }
        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .detail-label {
          font-size: 12px;
          font-weight: 600;
        }
        .detail-bar {
          height: 6px;
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
          overflow: hidden;
        }
        .detail-fill {
          height: 100%;
          border-radius: 3px;
        }
        .detail-value {
          font-size: 14px;
          font-weight: bold;
          text-align: right;
        }
      `}</style>
    </div>
  );
}
