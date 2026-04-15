'use client';

/**
 * CompatibilityChart — 关系兼容性可视化
 *
 * 展示两个人之间的命理兼容度
 * 基于 AI_Animation 的图表动画模式
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface PersonData {
  name: string;
  nameEn: string;
  sign: string; // zodiac or element
  element?: string;
  color?: string;
}

interface CompatibilityChartProps {
  person1: PersonData;
  person2: PersonData;
  language?: 'zh' | 'en';
  showDetails?: boolean;
  animated?: boolean;
}

// Element compatibility matrix
const ELEMENT_COMPATIBILITY: Record<string, Record<string, number>> = {
  '木': { '木': 60, '火': 85, '土': 45, '金': 40, '水': 80 },
  '火': { '木': 85, '火': 50, '土': 75, '金': 60, '水': 55 },
  '土': { '木': 45, '火': 75, '土': 70, '金': 85, '水': 50 },
  '金': { '木': 40, '火': 60, '土': 85, '金': 55, '水': 75 },
  '水': { '木': 80, '火': 55, '土': 50, '金': 75, '水': 65 }
};

// Zodiac compatibility
const ZODIAC_COMPATIBILITY: Record<string, string[]> = {
  '白羊座': ['狮子座', '射手座', '双子座', '水瓶座'],
  '金牛座': ['处女座', '摩羯座', '巨蟹座', '天蝎座'],
  '双子座': ['天秤座', '水瓶座', '白羊座', '狮子座'],
  '巨蟹座': ['天蝎座', '双鱼座', '金牛座', '处女座'],
  '狮子座': ['白羊座', '射手座', '双子座', '天秤座'],
  '处女座': ['金牛座', '摩羯座', '巨蟹座', '天蝎座'],
  '天秤座': ['双子座', '水瓶座', '狮子座', '射手座'],
  '天蝎座': ['巨蟹座', '双鱼座', '处女座', '摩羯座'],
  '射手座': ['白羊座', '狮子座', '天秤座', '水瓶座'],
  '摩羯座': ['金牛座', '处女座', '天蝎座', '双鱼座'],
  '水瓶座': ['双子座', '天秤座', '白羊座', '射手座'],
  '双鱼座': ['巨蟹座', '天蝎座', '摩羯座', '金牛座']
};

export default function CompatibilityChart({
  person1,
  person2,
  language = 'zh',
  showDetails = true,
  animated = true
}: CompatibilityChartProps) {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  // Calculate compatibility score
  const calculateScore = (): number => {
    // Try element-based calculation
    if (person1.element && person2.element) {
      return ELEMENT_COMPATIBILITY[person1.element]?.[person2.element] || 50;
    }

    // Try zodiac-based calculation
    const zodiac1 = person1.sign;
    const zodiac2 = person2.sign;

    if (ZODIAC_COMPATIBILITY[zodiac1]?.includes(zodiac2)) {
      return 85;
    }

    // Default
    return 60;
  };

  const score = calculateScore();

  // Get compatibility label
  const getCompatibilityLabel = (s: number): { label: string; labelEn: string; color: string } => {
    if (s >= 80) return { label: '非常契合', labelEn: 'Excellent', color: '#10B981' };
    if (s >= 65) return { label: '比较契合', labelEn: 'Good', color: '#F59E0B' };
    if (s >= 50) return { label: '一般', labelEn: 'Fair', color: '#6366F1' };
    return { label: '需要磨合', labelEn: 'Challenging', color: '#EF4444' };
  };

  const label = getCompatibilityLabel(score);

  // Score arc calculation
  const arcRadius = 100;
  const arcLength = Math.PI * arcRadius;
  const scoreLength = (score / 100) * arcLength;

  return (
    <div className="compatibility-chart">
      {/* Main score display */}
      <div className="score-section">
        <div className="score-ring">
          <svg width="200" height="120" viewBox="0 0 200 120">
            {/* Background arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="12"
              strokeLinecap="round"
            />

            {/* Score arc */}
            <motion.path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={label.color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${animated ? 0 : scoreLength} ${arcLength}`}
              initial={animated ? { strokeDasharray: `0 ${arcLength}` } : {}}
              animate={animated ? { strokeDasharray: `${scoreLength} ${arcLength}` } : {}}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </svg>

          <div className="score-content">
            <motion.div
              className="score-number"
              initial={animated ? { opacity: 0, scale: 0.5 } : {}}
              animate={animated ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <span style={{ fontSize: 48, fontWeight: 'bold', color: label.color }}>
                {score}
              </span>
              <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.4)' }}>/100</span>
            </motion.div>
            <div className="score-label" style={{ color: label.color }}>
              {language === 'zh' ? label.label : label.labelEn}
            </div>
          </div>
        </div>
      </div>

      {/* Person cards */}
      <div className="person-section">
        <motion.div
          className="person-card"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="person-avatar" style={{ background: person1.color || '#A782FF' }}>
            {person1.name[0]}
          </div>
          <div className="person-info">
            <div className="person-name">{person1.name}</div>
            <div className="person-sign">{person1.sign}</div>
          </div>
        </motion.div>

        <div className="connection-symbol">⚡</div>

        <motion.div
          className="person-card"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="person-avatar" style={{ background: person2.color || '#EC4899' }}>
            {person2.name[0]}
          </div>
          <div className="person-info">
            <div className="person-name">{person2.name}</div>
            <div className="person-sign">{person2.sign}</div>
          </div>
        </motion.div>
      </div>

      {/* Detail breakdown */}
      {showDetails && (
        <motion.div
          className="details-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h4 className="details-title">
            {language === 'zh' ? '✨ 详细分析' : '✨ Detailed Analysis'}
          </h4>

          <div className="detail-grid">
            <DetailItem
              label="事业契合"
              labelEn="Career"
              value={score - 5}
              language={language}
              color="#F59E0B"
              animated={animated}
            />
            <DetailItem
              label="感情契合"
              labelEn="Love"
              value={score + 8}
              language={language}
              color="#EC4899"
              animated={animated}
            />
            <DetailItem
              label="沟通默契"
              labelEn="Communication"
              value={score - 10}
              language={language}
              color="#6366F1"
              animated={animated}
            />
            <DetailItem
              label="生活节奏"
              labelEn="Lifestyle"
              value={score + 5}
              language={language}
              color="#10B981"
              animated={animated}
            />
          </div>
        </motion.div>
      )}

      <style jsx>{`
        .compatibility-chart {
          background: rgba(255,255,255,0.02);
          border-radius: 20px;
          border: 1px solid rgba(168,130,255,0.2);
          padding: 24px;
          max-width: 400px;
        }
        .score-section {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }
        .score-ring {
          position: relative;
        }
        .score-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }
        .score-number {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 2px;
        }
        .score-label {
          font-size: 14px;
          font-weight: 600;
          margin-top: 4px;
        }
        .person-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 24px;
        }
        .person-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(255,255,255,0.03);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .person-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: bold;
          color: white;
        }
        .person-info {
          text-align: left;
        }
        .person-name {
          font-size: 14px;
          font-weight: 600;
          color: white;
        }
        .person-sign {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
        }
        .connection-symbol {
          font-size: 24px;
          color: #A782FF;
        }
        .details-section {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 20px;
        }
        .details-title {
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          margin: 0 0 12px 0;
          text-align: center;
        }
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
      `}</style>
    </div>
  );
}

// Detail item component
function DetailItem({
  label,
  labelEn,
  value,
  language,
  color,
  animated
}: {
  label: string;
  labelEn: string;
  value: number;
  language: 'zh' | 'en';
  color: string;
  animated: boolean;
}) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="detail-item">
      <div className="detail-label" style={{ color }}>
        {language === 'zh' ? label : labelEn}
      </div>
      <div className="detail-bar">
        <motion.div
          className="detail-fill"
          style={{ background: color }}
          initial={animated ? { width: 0 } : {}}
          animate={animated ? { width: `${clampedValue}%` } : {}}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
      <div className="detail-value" style={{ color }}>
        {clampedValue}
      </div>

      <style jsx>{`
        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .detail-label {
          font-size: 11px;
          font-weight: 600;
        }
        .detail-bar {
          height: 4px;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
          overflow: hidden;
        }
        .detail-fill {
          height: 100%;
          border-radius: 2px;
        }
        .detail-value {
          font-size: 12px;
          font-weight: bold;
          text-align: right;
        }
      `}</style>
    </div>
  );
}

// Demo component
export function CompatibilityDemo() {
  return (
    <CompatibilityChart
      person1={{
        name: '小明',
        nameEn: 'Xiao Ming',
        sign: '白羊座',
        element: '火',
        color: '#EF4444'
      }}
      person2={{
        name: '小红',
        nameEn: 'Xiao Hong',
        sign: '狮子座',
        element: '火',
        color: '#F97316'
      }}
      language="zh"
      showDetails={true}
      animated={true}
    />
  );
}