'use client';

import { useEffect, useState } from 'react';

// Color scheme
const COLORS = {
  background: '#111827',
  cardBg: '#1F2937',
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  border: '#374151',
  auspicious: '#EF4444', // Red - lucky
  inauspicious: '#1F2937', // Black - unlucky
  neutral: '#F59E0B', // Yellow - neutral
  accent: '#F59E0B',
  accentLight: 'rgba(245, 158, 11, 0.2)',
};

// Flying star info
const STAR_NAMES: Record<number, { name: string; element: string; color: string }> = {
  1: { name: '贪狼', element: '水', color: '白' },
  2: { name: '巨门', element: '土', color: '黑' },
  3: { name: '禄存', element: '木', color: '碧' },
  4: { name: '文曲', element: '木', color: '绿' },
  5: { name: '廉贞', element: '土', color: '黄' },
  6: { name: '武曲', element: '金', color: '白' },
  7: { name: '破军', element: '金', color: '赤' },
  8: { name: '左辅', element: '土', color: '白' },
  9: { name: '右弼', element: '火', color: '紫' },
};

const DIRECTIONS_INFO = [
  { key: '北', label: 'N', angle: 0 },
  { key: '东北', label: 'NE', angle: 45 },
  { key: '东', label: 'E', angle: 90 },
  { key: '东南', label: 'SE', angle: 135 },
  { key: '南', label: 'S', angle: 180 },
  { key: '西南', label: 'SW', angle: 225 },
  { key: '西', label: 'W', angle: 270 },
  { key: '西北', label: 'NW', angle: 315 },
];

const DIRECTION_OPTIONS = ['北', '东', '南', '西', '东北', '东南', '西南', '西北'];

interface PalaceData {
  position: number;
  direction: string;
  directionEn: string;
  trigram: string;
  star: {
    number: number;
    name: string;
    nameEn: string;
    element: string;
    elementEn: string;
    color: string;
    auspicious: boolean;
    meaning: string;
  };
  currentStar: number | null;
}

interface FengShuiResponse {
  success: boolean;
  yearlyStars: {
    chart: {
      year: number;
      period: number;
      buildingAge: number;
      facing: string;
      palaces: PalaceData[];
      yearlyMountainStar: number;
      yearlyWaterStar: number;
    };
    interpretations: Array<{
      position: number;
      direction: string;
      star: number;
      interpretation: string;
    }>;
  };
  monthlyStars: Array<{
    month: number;
    monthName: string;
    palaces: Array<{ position: number; direction: string; directionEn: string; star: number }>;
  }>;
  analysis: {
    overallFortune: string;
    goodPalaces: string[];
    badPalaces: string[];
    keyFavorableStars: string[];
    keyUnfavorableStars: string[];
  };
  remedies: Array<{
    palace: string;
    direction: string;
    problem: string;
    solutions: string[];
  }>;
  personalizedRemedies?: Array<{
    basedOn: string;
    suggestions: string[];
  }>;
}

export default function FengShuiPage() {
  const [buildingAge, setBuildingAge] = useState<number>(2015);
  const [facingDirection, setFacingDirection] = useState<string>('北');
  const [data, setData] = useState<FengShuiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPalace, setHoveredPalace] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');

  const fetchFengShui = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/fengshui', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buildingAge,
          facingDirection,
        }),
      });
      if (!response.ok) throw new Error('Failed to fetch Feng Shui data');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFengShui();
  }, []);

  const handleShare = async () => {
    if (!data) return;
    const text = `玄空飞星风水分析\n朝向: ${facingDirection}\n年份: ${data.yearlyStars.chart.year}\n吉利方位: ${data.analysis.goodPalaces.join(', ')}\n凶位: ${data.analysis.badPalaces.join(', ')}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: '玄空飞星风水', text });
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text).catch(() => {});
    }
  };

  const getPalaceColor = (star: number | null, auspicious: boolean | undefined): string => {
    if (!star) return COLORS.cardBg;
    // 1,4,6,8,9 are auspicious (red), 2,3,5,7 are inauspicious (black)
    if ([1, 4, 6, 8, 9].includes(star)) return '#7F1D1D'; // dark red
    if ([2, 3, 5, 7].includes(star)) return '#1F2937'; // dark/black
    return '#78350F'; // neutral/amber
  };

  const getStarTextColor = (star: number | null): string => {
    if (!star) return COLORS.text;
    if ([1, 6, 8].includes(star)) return '#FFFFFF';
    if ([4, 9].includes(star)) return '#FEF3C7';
    if ([2, 3, 5, 7].includes(star)) return '#FCD34D';
    return COLORS.text;
  };

  // Grid layout: positions map to grid cells
  // Position: 4=Northwest, 9=North, 2=NorthEast
  //           3=West,     5=Center,  7=East
  //           8=Southwest,1=South,  6=Southeast
  const getGridPosition = (pos: number): { row: number; col: number } => {
    const positions: Record<number, { row: number; col: number }> = {
      4: { row: 0, col: 0 },
      9: { row: 0, col: 1 },
      2: { row: 0, col: 2 },
      3: { row: 1, col: 0 },
      5: { row: 1, col: 1 },
      7: { row: 1, col: 2 },
      8: { row: 2, col: 0 },
      1: { row: 2, col: 1 },
      6: { row: 2, col: 2 },
    };
    return positions[pos] || { row: 1, col: 1 };
  };

  // Get interpretation text
  const getInterpretation = (palace: PalaceData | undefined): string => {
    if (!palace || !palace.star) return '';
    const interpretations: Record<number, { zh: string; en: string }> = {
      1: {
        zh: `一白贪狼星临${palace.direction}宫。此星为吉星，主事业、财运、人际关系。适合创业、投资、社交。`,
        en: `1 White Greedy Wolf in ${palace.directionEn}. Auspicious for career, wealth, and relationships.`,
      },
      2: {
        zh: `二黑巨门星临${palace.direction}宫。此星为凶星，主疾病、纠纷、口舌是非。需特别注意健康和处事方式。`,
        en: `2 Black Giant Gate in ${palace.directionEn}. Inauspicious - associated with illness and disputes.`,
      },
      3: {
        zh: `三碧禄存星临${palace.direction}宫。此星主是非争执、诉讼诉讼。处事宜低调，忌冲动行事。`,
        en: `3 Green Receiving Salary in ${palace.directionEn}. Risks arguments and legal issues.`,
      },
      4: {
        zh: `四绿文曲星临${palace.direction}宫。此星主学业、文化、艺术才华。利于考试、创作、学习。`,
        en: `4 Green Scholar in ${palace.directionEn}. Beneficial for scholarship and creativity.`,
      },
      5: {
        zh: `五黄廉贞星临${palace.direction}宫。此星为最大凶星，主灾祸、疾病、意外。务必谨慎行事。`,
        en: `5 Yellow Pure Yi in ${palace.directionEn}. Most inauspicious - disasters and accidents possible.`,
      },
      6: {
        zh: `六白武曲星临${palace.direction}宫。此星为吉星，主权威、事业成就、贵人相助。利于事业发展。`,
        en: `6 White Martial Valor in ${palace.directionEn}. Auspicious for authority and career.`,
      },
      7: {
        zh: `七赤破军星临${palace.direction}宫。此星为凶星，主破财、损失、变动。需保守理财。`,
        en: `7 Red Broken Army in ${palace.directionEn}. Inauspicious - financial loss and changes.`,
      },
      8: {
        zh: `八白左辅星临${palace.direction}宫。此星为大吉星，主财富、置业、稳定。利于积累财产。`,
        en: `8 White Left Assistant in ${palace.directionEn}. Highly auspicious for wealth and property.`,
      },
      9: {
        zh: `九紫右弼星临${palace.direction}宫。此星为吉星，主姻缘、喜庆、好事临门。利于嫁娶、社交。`,
        en: `9 Purple Right Assistant in ${palace.directionEn}. Auspicious for relationships and celebrations.`,
      },
    };
    const interp = interpretations[palace.star.number];
    return language === 'zh' ? interp?.zh || '' : interp?.en || '';
  };

  // Compass rose component
  const CompassRose = ({ selected, onSelect }: { selected: string; onSelect: (d: string) => void }) => (
    <div style={{
      position: 'relative',
      width: '160px',
      height: '160px',
      margin: '0 auto',
    }}>
      {/* Outer circle */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '140px',
        height: '140px',
        borderRadius: '50%',
        border: `2px solid ${COLORS.border}`,
        background: COLORS.cardBg,
      }} />
      
      {/* Direction markers */}
      {DIRECTIONS_INFO.map((dir, i) => {
        const angle = (dir.angle - 90) * (Math.PI / 180);
        const radius = 60;
        const x = 80 + radius * Math.cos(angle);
        const y = 80 + radius * Math.sin(angle);
        const isSelected = selected === dir.key;
        
        return (
          <button
            key={dir.key}
            onClick={() => onSelect(dir.key)}
            style={{
              position: 'absolute',
              left: `${x}px`,
              top: `${y}px`,
              transform: 'translate(-50%, -50%)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              background: isSelected ? COLORS.accent : COLORS.cardBg,
              color: isSelected ? '#000' : COLORS.text,
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 'bold',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: isSelected ? `0 0 12px ${COLORS.accent}` : 'none',
            }}
          >
            <span>{dir.key}</span>
            <span style={{ fontSize: '9px', opacity: 0.7 }}>{dir.label}</span>
          </button>
        );
      })}
      
      {/* Center indicator */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '20px',
        height: '20px',
        background: COLORS.accent,
        borderRadius: '50%',
        boxShadow: `0 0 8px ${COLORS.accent}`,
      }} />
      
      {/* N marker */}
      <div style={{
        position: 'absolute',
        top: '4px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '10px',
        color: COLORS.accent,
        fontWeight: 'bold',
      }}>N</div>
    </div>
  );

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      backgroundColor: COLORS.background,
      padding: '2rem',
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: COLORS.text,
            marginBottom: '0.25rem',
          }}>
            🏠 玄空飞星风水 / Flying Star Feng Shui
          </h1>
          <p style={{ color: COLORS.textSecondary, fontSize: '0.875rem' }}>
            {language === 'zh' ? '基于三元玄空飞星原理的阳宅风水分析' : 'Building Feng Shui Analysis based on Xuan Kong Fei Xing Principles'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setLanguage(l => l === 'zh' ? 'en' : 'zh')}
            style={{
              padding: '0.5rem 1rem',
              background: COLORS.cardBg,
              border: `1px solid ${COLORS.border}`,
              borderRadius: '8px',
              color: COLORS.text,
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            {language === 'zh' ? 'EN' : '中文'}
          </button>
          {data && (
            <button
              onClick={handleShare}
              style={{
                padding: '0.5rem 1rem',
                background: COLORS.accent,
                border: 'none',
                borderRadius: '8px',
                color: '#000',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
              }}
            >
              {language === 'zh' ? '分享' : 'Share'}
            </button>
          )}
        </div>
      </div>

      {/* Input Section */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        {/* Building Age Input */}
        <div style={{
          padding: '1.5rem',
          background: COLORS.cardBg,
          borderRadius: '12px',
          border: `1px solid ${COLORS.border}`,
        }}>
          <label style={{
            display: 'block',
            color: COLORS.text,
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '0.75rem',
          }}>
            {language === 'zh' ? '建造年份 (Building Age)' : 'Year Built'}
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input
              type="range"
              min="1990"
              max="2025"
              value={buildingAge}
              onChange={(e) => setBuildingAge(parseInt(e.target.value))}
              style={{
                flex: 1,
                accentColor: COLORS.accent,
              }}
            />
            <span style={{
              color: COLORS.accent,
              fontSize: '1.5rem',
              fontWeight: '700',
              minWidth: '60px',
              textAlign: 'center',
            }}>
              {buildingAge}
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: COLORS.textSecondary,
            fontSize: '0.75rem',
            marginTop: '0.25rem',
          }}>
            <span>1990</span>
            <span>2025</span>
          </div>
        </div>

        {/* Facing Direction */}
        <div style={{
          padding: '1.5rem',
          background: COLORS.cardBg,
          borderRadius: '12px',
          border: `1px solid ${COLORS.border}`,
        }}>
          <label style={{
            display: 'block',
            color: COLORS.text,
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '0.75rem',
          }}>
            {language === 'zh' ? '朝向 (Facing Direction)' : 'Building Facing'}
          </label>
          <CompassRose selected={facingDirection} onSelect={setFacingDirection} />
        </div>

        {/* Calculate Button */}
        <div style={{
          padding: '1.5rem',
          background: COLORS.cardBg,
          borderRadius: '12px',
          border: `1px solid ${COLORS.border}`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <button
            onClick={fetchFengShui}
            disabled={loading}
            style={{
              padding: '1rem 2rem',
              background: loading ? COLORS.border : `linear-gradient(135deg, #D97706, #F59E0B)`,
              border: 'none',
              borderRadius: '12px',
              color: '#000',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%',
            }}
          >
            {loading ? (language === 'zh' ? '计算中...' : 'Calculating...') : (language === 'zh' ? '重新计算' : 'Recalculate')}
          </button>
          {data && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: COLORS.textSecondary, fontSize: '0.75rem' }}>
                {language === 'zh' ? '当前运' : 'Current Period'}
              </div>
              <div style={{ color: COLORS.accent, fontSize: '2rem', fontWeight: '700' }}>
                {data.yearlyStars.chart.period}{language === 'zh' ? '运' : '运'}
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1rem',
          background: '#7F1D1D',
          borderRadius: '8px',
          color: COLORS.text,
          marginBottom: '1.5rem',
        }}>
          {error}
        </div>
      )}

      {data && (
        <>
          {/* Flying Star Chart */}
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            marginBottom: '2rem',
          }}>
            <h2 style={{
              color: COLORS.text,
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '1rem',
            }}>
              {language === 'zh' ? '📊 飞星盘 (Flying Star Chart)' : '📊 Flying Star Chart'}
              <span style={{ color: COLORS.textSecondary, fontSize: '0.875rem', marginLeft: '0.5rem' }}>
                {language === 'zh' ? `朝向: ${data.yearlyStars.chart.facing}` : `Facing: ${data.yearlyStars.chart.facing}`}
              </span>
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              maxWidth: '400px',
              margin: '0 auto',
            }}>
              {[4, 9, 2, 3, 5, 7, 8, 1, 6].map((pos) => {
                const palace = data.yearlyStars.chart.palaces.find(p => p.position === pos);
                const star = palace?.star;
                const isHovered = hoveredPalace === pos;
                
                return (
                  <div
                    key={pos}
                    onMouseEnter={() => setHoveredPalace(pos)}
                    onMouseLeave={() => setHoveredPalace(null)}
                    style={{
                      aspectRatio: '1',
                      background: getPalaceColor(star?.number || null, star?.auspicious),
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: isHovered ? `0 0 16px ${star?.auspicious ? '#EF4444' : '#374151'}` : 'none',
                      padding: '0.5rem',
                      border: `2px solid ${isHovered ? (star?.auspicious ? '#EF4444' : '#F59E0B') : COLORS.border}`,
                    }}
                  >
                    {/* Direction label */}
                    <div style={{
                      fontSize: '0.625rem',
                      color: COLORS.textSecondary,
                      marginBottom: '0.125rem',
                    }}>
                      {palace?.direction || ''}{palace?.trigram ? `(${palace.trigram})` : ''}
                    </div>
                    
                    {/* Star number */}
                    <div style={{
                      fontSize: '1.75rem',
                      fontWeight: '700',
                      color: star ? (star.number === 5 ? '#F59E0B' : '#FFFFFF') : COLORS.text,
                    }}>
                      {star?.number || '?'}
                    </div>
                    
                    {/* Star name */}
                    <div style={{
                      fontSize: '0.75rem',
                      color: star ? getStarTextColor(star.number) : COLORS.textSecondary,
                    }}>
                      {star?.name || ''}
                    </div>
                    
                    {/* Element indicator */}
                    <div style={{
                      fontSize: '0.625rem',
                      color: star ? (star.number === 2 || star.number === 3 ? '#FCD34D' : '#9CA3AF') : COLORS.textSecondary,
                      marginTop: '0.125rem',
                    }}>
                      {star?.element || ''}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1.5rem',
              marginTop: '1rem',
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '16px', height: '16px', background: '#7F1D1D', borderRadius: '4px' }} />
                <span style={{ color: COLORS.textSecondary, fontSize: '0.75rem' }}>
                  {language === 'zh' ? '吉利 (Auspicious)' : 'Auspicious'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '16px', height: '16px', background: '#1F2937', borderRadius: '4px' }} />
                <span style={{ color: COLORS.textSecondary, fontSize: '0.75rem' }}>
                  {language === 'zh' ? '凶煞 (Inauspicious)' : 'Inauspicious'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '16px', height: '16px', background: '#78350F', borderRadius: '4px' }} />
                <span style={{ color: COLORS.textSecondary, fontSize: '0.75rem' }}>
                  {language === 'zh' ? '中立 (Neutral)' : 'Neutral'}
                </span>
              </div>
            </div>
          </div>

          {/* Hover Interpretation */}
          {hoveredPalace && (() => {
            const palace = data.yearlyStars.chart.palaces.find(p => p.position === hoveredPalace);
            if (!palace) return null;
            
            return (
              <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                marginBottom: '2rem',
                padding: '1rem',
                background: COLORS.cardBg,
                borderRadius: '8px',
                border: `1px solid ${COLORS.border}`,
              }}>
                <div style={{ color: COLORS.accent, fontWeight: '600', marginBottom: '0.5rem' }}>
                  {palace.direction}宫 ({palace.directionEn}) - {palace.star?.name} ({palace.star?.nameEn})
                </div>
                <div style={{ color: COLORS.text, fontSize: '0.875rem', lineHeight: '1.6' }}>
                  {getInterpretation(palace)}
                </div>
                {!palace.star?.auspicious && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <span style={{ color: COLORS.textSecondary, fontSize: '0.75rem' }}>
                      {language === 'zh' ? '化解建议: ' : 'Remedies: '}
                    </span>
                    {data.remedies.find(r => r.direction === palace.direction)?.solutions.join(', ')}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Monthly Stars */}
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            marginBottom: '2rem',
          }}>
            <h2 style={{
              color: COLORS.text,
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '1rem',
            }}>
              {language === 'zh' ? '📅 月份飞星 (Monthly Flying Stars)' : '📅 Monthly Flying Stars'}
            </h2>
            
            {/* Month selector */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              marginBottom: '1rem',
              justifyContent: 'center',
            }}>
              {['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'].map((name, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedMonth(i + 1)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: selectedMonth === i + 1 ? COLORS.accent : COLORS.cardBg,
                    border: `1px solid ${selectedMonth === i + 1 ? COLORS.accent : COLORS.border}`,
                    borderRadius: '6px',
                    color: selectedMonth === i + 1 ? '#000' : COLORS.text,
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
            
            {/* Monthly chart */}
            {(() => {
              const monthly = data.monthlyStars.find(m => m.month === selectedMonth);
              if (!monthly) return null;
              
              return (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.5rem',
                  maxWidth: '400px',
                  margin: '0 auto',
                }}>
                  {[4, 9, 2, 3, 5, 7, 8, 1, 6].map((pos) => {
                    const p = monthly.palaces.find(palace => palace.position === pos);
                    const starNum = p?.star || 5;
                    const isAuspicious = [1, 4, 6, 8, 9].includes(starNum);
                    
                    return (
                      <div
                        key={pos}
                        style={{
                          aspectRatio: '1',
                          background: isAuspicious ? '#7F1D1D' : '#1F2937',
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0.5rem',
                          border: `1px solid ${COLORS.border}`,
                        }}
                      >
                        <div style={{ fontSize: '0.625rem', color: COLORS.textSecondary }}>
                          {p?.direction || ''}
                        </div>
                        <div style={{
                          fontSize: '1.5rem',
                          fontWeight: '700',
                          color: getStarTextColor(starNum),
                        }}>
                          {starNum}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: COLORS.textSecondary }}>
                          {STAR_NAMES[starNum]?.name || ''}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Analysis & Remedies */}
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}>
            {/* Analysis */}
            <div style={{
              padding: '1.5rem',
              background: COLORS.cardBg,
              borderRadius: '12px',
              border: `1px solid ${COLORS.border}`,
            }}>
              <h3 style={{
                color: COLORS.text,
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '1rem',
              }}>
                {language === 'zh' ? '📊 风水分析' : '📊 Feng Shui Analysis'}
              </h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ color: COLORS.textSecondary, fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  {language === 'zh' ? '吉利方位' : 'Auspicious Directions'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {data.analysis.goodPalaces.map((p, i) => (
                    <span key={i} style={{
                      padding: '0.25rem 0.5rem',
                      background: '#7F1D1D',
                      borderRadius: '4px',
                      color: COLORS.text,
                      fontSize: '0.75rem',
                    }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ color: COLORS.textSecondary, fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  {language === 'zh' ? '需注意方位' : 'Caution Directions'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {data.analysis.badPalaces.map((p, i) => (
                    <span key={i} style={{
                      padding: '0.25rem 0.5rem',
                      background: '#374151',
                      borderRadius: '4px',
                      color: '#FCD34D',
                      fontSize: '0.75rem',
                    }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <div style={{ color: COLORS.textSecondary, fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  {language === 'zh' ? '关键吉利星' : 'Key Auspicious Stars'}
                </div>
                <div style={{ color: COLORS.text, fontSize: '0.875rem' }}>
                  {data.analysis.keyFavorableStars.join(', ') || '-'}
                </div>
              </div>
            </div>

            {/* Remedies */}
            <div style={{
              padding: '1.5rem',
              background: COLORS.cardBg,
              borderRadius: '12px',
              border: `1px solid ${COLORS.border}`,
            }}>
              <h3 style={{
                color: COLORS.text,
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '1rem',
              }}>
                {language === 'zh' ? '🔧 化解建议' : '🔧 Remedy Suggestions'}
              </h3>
              
              {data.remedies.length === 0 ? (
                <div style={{ color: COLORS.textSecondary, fontSize: '0.875rem' }}>
                  {language === 'zh' ? '暂无需要化解的方位。' : 'No remedies needed at this time.'}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {data.remedies.slice(0, 3).map((remedy, i) => (
                    <div key={i} style={{
                      padding: '0.75rem',
                      background: '#374151',
                      borderRadius: '8px',
                    }}>
                      <div style={{ color: '#FCD34D', fontSize: '0.875rem', fontWeight: '600' }}>
                        {remedy.direction}宫
                      </div>
                      <div style={{ color: COLORS.textSecondary, fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        {remedy.problem}
                      </div>
                      <div style={{ color: COLORS.text, fontSize: '0.75rem' }}>
                        {remedy.solutions.join(' | ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Personalized Remedies */}
          {data.personalizedRemedies && data.personalizedRemedies.length > 0 && (
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '1.5rem',
              background: `linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2))`,
              borderRadius: '12px',
              border: `1px solid ${COLORS.accent}`,
              marginBottom: '2rem',
            }}>
              <h3 style={{
                color: COLORS.accent,
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '1rem',
              }}>
                {language === 'zh' ? '✨ 个性化解化建议 (基于八字)' : '✨ Personalized Remedies (Based on BaZi)'}
              </h3>
              {data.personalizedRemedies.map((pr, i) => (
                <div key={i}>
                  <div style={{ color: COLORS.text, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    {pr.basedOn}
                  </div>
                  <div style={{ color: COLORS.textSecondary, fontSize: '0.875rem' }}>
                    {pr.suggestions.join(' | ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {loading && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: `4px solid ${COLORS.border}`,
            borderTopColor: COLORS.accent,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
