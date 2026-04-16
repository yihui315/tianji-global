'use client';

/**
 * FortuneTimeline — 命运时间轴可视化
 *
 * 功能:
 * 1. D3.js 绘制人生运势曲线
 * 2. 大限/流年标注
 * 3. 关键节点高亮
 * 4. 交互式查看详情
 */

import React, { useRef, useEffect, useState } from 'react';

interface TimelineEvent {
  age: number;
  year: number;
  type: 'major_cycle' | 'annual' | 'milestone' | 'challenge';
  title: string;
  titleEn: string;
  score: number; // 运势评分 0-100
  description: string;
  descriptionEn: string;
  element?: string;
}

interface FortuneTimelineProps {
  birthYear: number;
  startAge?: number;
  endAge?: number;
  data: TimelineEvent[];
  language?: 'zh' | 'en';
  width?: number;
  height?: number;
}

const ELEMENT_COLORS: Record<string, string> = {
  '木': '#10B981',
  '火': '#EF4444',
  '土': '#F59E0B',
  '金': '#94A3B8',
  '水': '#3B82F6',
  'default': '#A782FF'
};

const TYPE_LABELS = {
  zh: {
    major_cycle: '大限',
    annual: '流年',
    milestone: '关键节点',
    challenge: '挑战期'
  },
  en: {
    major_cycle: 'Major Cycle',
    annual: 'Annual',
    milestone: 'Milestone',
    challenge: 'Challenge'
  }
};

export default function FortuneTimeline({
  birthYear,
  startAge = 0,
  endAge = 80,
  data = [],
  language = 'zh',
  width = 800,
  height = 400
}: FortuneTimelineProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    event: TimelineEvent | null;
  }>({ visible: false, x: 0, y: 0, event: null });

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = svgRef.current;
    const margin = { top: 40, right: 40, bottom: 60, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Clear previous
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // Create scales
    const xScale = (age: number) => margin.left + ((age - startAge) / (endAge - startAge)) * chartWidth;
    const yScale = (score: number) => margin.top + chartHeight - (score / 100) * chartHeight;

    // Background gradient
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#030014;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#1a1a3e;stop-opacity:1" />
      </linearGradient>
      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#7C3AED;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#A782FF;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
      </linearGradient>
      <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#A782FF;stop-opacity:0.4" />
        <stop offset="100%" style="stop-color:#A782FF;stop-opacity:0" />
      </linearGradient>
    `;
    svg.appendChild(defs);

    // Chart background
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', String(width));
    bg.setAttribute('height', String(height));
    bg.setAttribute('fill', 'url(#bgGradient)');
    bg.setAttribute('rx', '12');
    svg.appendChild(bg);

    // Grid lines
    const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gridGroup.setAttribute('class', 'grid');

    // Horizontal grid
    [0, 20, 40, 60, 80, 100].forEach((val) => {
      const y = yScale(val);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(margin.left));
      line.setAttribute('y1', String(y));
      line.setAttribute('x2', String(width - margin.right));
      line.setAttribute('y2', String(y));
      line.setAttribute('stroke', 'rgba(255,255,255,0.08)');
      line.setAttribute('stroke-width', '1');
      line.setAttribute('stroke-dasharray', '4,4');
      gridGroup.appendChild(line);

      // Label
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', String(margin.left - 8));
      label.setAttribute('y', String(y + 4));
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('fill', 'rgba(255,255,255,0.3)');
      label.setAttribute('font-size', '11');
      label.textContent = `${val}`;
      gridGroup.appendChild(label);
    });

    svg.appendChild(gridGroup);

    // Age axis
    const ageAxisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const ageStep = Math.ceil((endAge - startAge) / 8);
    for (let age = startAge; age <= endAge; age += ageStep) {
      const x = xScale(age);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(x));
      line.setAttribute('y1', String(margin.top + chartHeight));
      line.setAttribute('x2', String(x));
      line.setAttribute('y2', String(margin.top + chartHeight + 6));
      line.setAttribute('stroke', 'rgba(255,255,255,0.2)');
      line.setAttribute('stroke-width', '1');
      ageAxisGroup.appendChild(line);

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', String(x));
      label.setAttribute('y', String(margin.top + chartHeight + 20));
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', 'rgba(255,255,255,0.4)');
      label.setAttribute('font-size', '11');
      label.textContent = `${age}`;
      ageAxisGroup.appendChild(label);

      // Year label
      const yearLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      yearLabel.setAttribute('x', String(x));
      yearLabel.setAttribute('y', String(margin.top + chartHeight + 34));
      yearLabel.setAttribute('text-anchor', 'middle');
      yearLabel.setAttribute('fill', 'rgba(255,255,255,0.2)');
      yearLabel.setAttribute('font-size', '9');
      yearLabel.textContent = String(birthYear + age);
      ageAxisGroup.appendChild(yearLabel);
    }

    // Age axis title
    const ageTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    ageTitle.setAttribute('x', String(width / 2));
    ageTitle.setAttribute('y', String(height - 8));
    ageTitle.setAttribute('text-anchor', 'middle');
    ageTitle.setAttribute('fill', 'rgba(255,255,255,0.3)');
    ageTitle.setAttribute('font-size', '10');
    ageTitle.textContent = language === 'zh' ? '年龄 (岁)' : 'Age';
    ageAxisGroup.appendChild(ageTitle);

    svg.appendChild(ageAxisGroup);

    // Area fill
    const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let areaD = `M ${xScale(data[0].age)} ${yScale(data[0].score)}`;
    data.forEach((d) => {
      areaD += ` L ${xScale(d.age)} ${yScale(d.score)}`;
    });
    areaD += ` L ${xScale(data[data.length - 1].age)} ${margin.top + chartHeight}`;
    areaD += ` L ${xScale(data[0].age)} ${margin.top + chartHeight} Z`;
    areaPath.setAttribute('d', areaD);
    areaPath.setAttribute('fill', 'url(#areaGradient)');
    svg.appendChild(areaPath);

    // Main line
    const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let lineD = `M ${xScale(data[0].age)} ${yScale(data[0].score)}`;
    data.forEach((d) => {
      lineD += ` L ${xScale(d.age)} ${yScale(d.score)}`;
    });
    linePath.setAttribute('d', lineD);
    linePath.setAttribute('fill', 'none');
    linePath.setAttribute('stroke', 'url(#lineGradient)');
    linePath.setAttribute('stroke-width', '3');
    linePath.setAttribute('stroke-linecap', 'round');
    linePath.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(linePath);

    // Glow effect
    const glowLine = linePath.cloneNode() as SVGPathElement;
    glowLine.setAttribute('stroke-width', '8');
    glowLine.setAttribute('opacity', '0.3');
    glowLine.setAttribute('filter', 'blur(4px)');
    svg.insertBefore(glowLine, linePath);

    // Events
    const eventsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    data.forEach((d) => {
      const x = xScale(d.age);
      const y = yScale(d.score);
      const color = ELEMENT_COLORS[d.element || 'default'];

      // Vertical connector line
      const connector = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      connector.setAttribute('x1', String(x));
      connector.setAttribute('y1', String(y));
      connector.setAttribute('x2', String(x));
      connector.setAttribute('y2', String(y + (d.type === 'challenge' ? 20 : -20)));
      connector.setAttribute('stroke', color);
      connector.setAttribute('stroke-width', '1');
      connector.setAttribute('opacity', '0.5');
      eventsGroup.appendChild(connector);

      // Event dot
      const dotSize = d.type === 'milestone' ? 10 : d.type === 'major_cycle' ? 8 : 6;
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(x));
      circle.setAttribute('cy', String(y));
      circle.setAttribute('r', String(dotSize));
      circle.setAttribute('fill', color);
      circle.setAttribute('stroke', 'rgba(255,255,255,0.8)');
      circle.setAttribute('stroke-width', '2');
      circle.style.cursor = 'pointer';
      circle.style.transition = 'all 0.2s';

      // Interaction
      circle.addEventListener('mouseenter', (e) => {
        circle.setAttribute('r', String(dotSize + 3));
        setTooltip({
          visible: true,
          x: e.clientX,
          y: e.clientY,
          event: d
        });
      });
      circle.addEventListener('mouseleave', () => {
        circle.setAttribute('r', String(dotSize));
        setTooltip({ visible: false, x: 0, y: 0, event: null });
      });

      eventsGroup.appendChild(circle);

      // Label for major cycles
      if (d.type === 'major_cycle' || d.type === 'milestone') {
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        const labelY = y - 25;
        label.setAttribute('x', String(x));
        label.setAttribute('y', String(labelY));
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('fill', color);
        label.setAttribute('font-size', '10');
        label.setAttribute('font-weight', '600');
        label.textContent = d.type === 'major_cycle'
          ? (language === 'zh' ? `${d.age}岁` : `Age ${d.age}`)
          : (language === 'zh' ? d.title : d.titleEn);
        eventsGroup.appendChild(label);
      }
    });

    svg.appendChild(eventsGroup);

    // Title
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', String(margin.left));
    title.setAttribute('y', String(24));
    title.setAttribute('fill', 'rgba(255,255,255,0.8)');
    title.setAttribute('font-size', '16');
    title.setAttribute('font-weight', '700');
    title.textContent = language === 'zh' ? '✨ 命运时间轴' : '✨ Fortune Timeline';
    svg.appendChild(title);

  }, [data, width, height, startAge, endAge, birthYear, language]);

  return (
    <div className="fortune-timeline">
      <svg ref={svgRef} width={width} height={height} />

      {/* Tooltip */}
      {tooltip.visible && tooltip.event && (
        <div
          className="timeline-tooltip"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10
          }}
        >
          <div className="tooltip-header">
            <span className="tooltip-type">
              {TYPE_LABELS[language][tooltip.event.type]}
            </span>
            <span className="tooltip-score">{tooltip.event.score}/100</span>
          </div>
          <div className="tooltip-title">
            {language === 'zh' ? tooltip.event.title : tooltip.event.titleEn}
          </div>
          <div className="tooltip-desc">
            {language === 'zh' ? tooltip.event.description : tooltip.event.descriptionEn}
          </div>
          <div className="tooltip-age">
            {language === 'zh'
              ? `${tooltip.event.age}岁 (${tooltip.event.year}年)`
              : `Age ${tooltip.event.age} (${tooltip.event.year})`}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="timeline-legend">
        {Object.entries(TYPE_LABELS[language]).map(([key, label]) => (
          <div key={key} className="legend-item">
            <div className={`legend-dot type-${key}`} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        .fortune-timeline {
          position: relative;
          background: rgba(255,255,255,0.02);
          border-radius: 16px;
          padding: 20px;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .timeline-tooltip {
          position: fixed;
          background: rgba(10, 10, 30, 0.95);
          border: 1px solid rgba(168,130,255,0.3);
          border-radius: 12px;
          padding: 12px 16px;
          max-width: 240px;
          z-index: 100;
          pointer-events: none;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        }
        .tooltip-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .tooltip-type {
          font-size: 10px;
          color: #A782FF;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .tooltip-score {
          font-size: 12px;
          color: #F59E0B;
          font-weight: 600;
        }
        .tooltip-title {
          font-size: 14px;
          font-weight: 600;
          color: white;
          margin-bottom: 6px;
        }
        .tooltip-desc {
          font-size: 12px;
          color: rgba(255,255,255,0.6);
          line-height: 1.5;
          margin-bottom: 8px;
        }
        .tooltip-age {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
        }
        .timeline-legend {
          display: flex;
          gap: 16px;
          margin-top: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: rgba(255,255,255,0.5);
        }
        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .legend-dot.type-major_cycle { background: #A782FF; }
        .legend-dot.type-annual { background: #3B82F6; }
        .legend-dot.type-milestone { background: #F59E0B; }
        .legend-dot.type-challenge { background: #EF4444; }
      `}</style>
    </div>
  );
}

// 生成示例数据
export function generateSampleTimeline(birthYear: number): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const stages = [
    { age: 0, score: 45, type: 'milestone' as const, title: '出生', titleEn: 'Birth', desc: '人生起点，命运初现', descEn: 'Starting point of destiny' },
    { age: 10, score: 55, type: 'milestone' as const, title: '少年', titleEn: 'Childhood', desc: '性格形成期', descEn: 'Personality formation' },
    { age: 16, score: 60, type: 'annual' as const, title: '青春期', titleEn: 'Teenage', desc: '变化与探索', descEn: 'Change and exploration' },
    { age: 20, score: 65, type: 'milestone' as const, title: '成年', titleEn: 'Adulthood', desc: '独立与成长', descEn: 'Independence and growth' },
    { age: 25, score: 72, type: 'major_cycle' as const, title: '第一大限', titleEn: '1st Major Cycle', desc: '事业起步期', descEn: 'Career start', element: '木' },
    { age: 30, score: 68, type: 'annual' as const, title: '而立之年', titleEn: 'Age 30', desc: '事业稳定期', descEn: 'Career stabilization' },
    { age: 35, score: 75, type: 'challenge' as const, title: '转折', titleEn: 'Turning Point', desc: '挑战与机遇并存', descEn: 'Challenges and opportunities', element: '火' },
    { age: 40, score: 80, type: 'major_cycle' as const, title: '第二大限', titleEn: '2nd Major Cycle', desc: '事业高峰期', descEn: 'Peak career', element: '土' },
    { age: 45, score: 70, type: 'annual' as const, title: '不惑', titleEn: 'Age 45', desc: '稳健发展', descEn: 'Steady development' },
    { age: 50, score: 65, type: 'challenge' as const, title: '考验', titleEn: 'Trial', desc: '重新审视人生', descEn: 'Re-evaluate life', element: '金' },
    { age: 55, score: 72, type: 'major_cycle' as const, title: '第三大限', titleEn: '3rd Major Cycle', desc: '智慧沉淀期', descEn: 'Wisdom accumulation', element: '水' },
    { age: 60, score: 78, type: 'milestone' as const, title: '花甲', titleEn: 'Age 60', desc: '人生成熟期', descEn: 'Life maturity' },
    { age: 65, score: 70, type: 'annual' as const, title: '耳顺', titleEn: 'Age 65', desc: '心态平和', descEn: 'Peaceful mindset' },
    { age: 70, score: 75, type: 'major_cycle' as const, title: '第四大限', titleEn: '4th Major Cycle', desc: '晚年安定期', descEn: 'Stable later years', element: '木' },
    { age: 75, score: 68, type: 'annual' as const, title: '古稀', titleEn: 'Age 75', desc: '回顾与传承', descEn: 'Reflection and legacy' },
    { age: 80, score: 60, type: 'milestone' as const, title: '杖朝', titleEn: 'Age 80', desc: '人生圆满', descEn: 'Life fulfillment' }
  ];

  stages.forEach(s => {
    events.push({
      age: s.age,
      year: birthYear + s.age,
      type: s.type,
      title: s.title,
      titleEn: s.titleEn,
      score: s.score,
      description: s.desc,
      descriptionEn: s.descEn,
      element: s.element
    });
  });

  return events;
}
