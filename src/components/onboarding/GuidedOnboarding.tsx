'use client';

/**
 * GuidedOnboarding — 引导式入门向导
 *
 * 功能:
 * 1. 新用户引导流程（3步骤）
 * 2. 命盘类型选择
 * 3. 个人信息收集
 * 4. 首次解读预览
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingData {
  fortuneType: 'bazi' | 'ziwei' | 'tarot' | 'yijing' | 'western' | 'synastry' | null;
  birthday: string;
  birthTime: string;
  gender: 'male' | 'female' | null;
  name: string;
  goal: string;
}

interface GuidedOnboardingProps {
  onComplete: (data: OnboardingData) => void;
  onSkip?: () => void;
  language?: 'zh' | 'en';
}

const FORTUNE_TYPES = {
  zh: [
    {
      id: 'bazi' as const,
      name: '八字命理',
      icon: '📊',
      desc: '四柱命理 · 深度分析',
      color: '#F59E0B',
      features: ['事业运势', '感情分析', '财富指南', '健康建议']
    },
    {
      id: 'ziwei' as const,
      name: '紫微斗数',
      icon: '✨',
      desc: '十二宫位 · 星曜解读',
      color: '#7C3AED',
      features: ['命宫分析', '大限流年', '星曜组合', '命运曲线']
    },
    {
      id: 'tarot' as const,
      name: '塔罗占卜',
      icon: '🃏',
      desc: '神秘卡牌 · 指引当下',
      color: '#EC4899',
      features: ['今日指引', '感情问题', '事业选择', '心灵成长']
    },
    {
      id: 'yijing' as const,
      name: '易经六爻',
      icon: '☯️',
      desc: '阴阳八卦 · 自然智慧',
      color: '#10B981',
      features: ['决策指引', '变化趋势', '吉凶判断', '行动建议']
    },
    {
      id: 'western' as const,
      name: '西方占星',
      icon: '🌟',
      desc: '星盘分析 · 性格解读',
      color: '#6366F1',
      features: ['太阳星座', '上升下降', '行星相位', '宫位解读']
    },
    {
      id: 'synastry' as const,
      name: '合盘分析',
      icon: '💑',
      desc: '关系合盘 · 缘分解读',
      color: '#F97316',
      features: ['合盘分析', '配对指数', '相处建议', '缘分走向']
    }
  ],
  en: [
    {
      id: 'bazi' as const,
      name: 'Ba Zi',
      icon: '📊',
      desc: 'Four Pillars · Deep Analysis',
      color: '#F59E0B',
      features: ['Career', 'Love', 'Wealth', 'Health']
    },
    {
      id: 'ziwei' as const,
      name: 'Zi Wei',
      icon: '✨',
      desc: '12 Palaces · Star Reading',
      color: '#7C3AED',
      features: ['Life Palace', 'Transit', 'Star Combos', 'Fate Curve']
    },
    {
      id: 'tarot' as const,
      name: 'Tarot',
      icon: '🃏',
      desc: 'Mystic Cards · Guidance',
      color: '#EC4899',
      features: ['Daily Guidance', 'Love', 'Career', 'Growth']
    },
    {
      id: 'yijing' as const,
      name: 'Yi Jing',
      icon: '☯️',
      desc: 'I Ching · Natural Wisdom',
      color: '#10B981',
      features: ['Decision', 'Change Trend', 'Fortune', 'Action']
    },
    {
      id: 'western' as const,
      name: 'Western Astrology',
      icon: '🌟',
      desc: 'Horoscope · Character',
      color: '#6366F1',
      features: ['Sun Sign', 'Ascendant', 'Planets', 'Houses']
    },
    {
      id: 'synastry' as const,
      name: 'Synastry',
      icon: '💑',
      desc: 'Relationship Chart',
      color: '#F97316',
      features: ['Compatibility', 'Match Score', 'Advice', 'Fate']
    }
  ]
};

const GOALS = {
  zh: [
    { id: 'career', label: '💼 事业发展', desc: '了解职业方向和事业运势' },
    { id: 'love', label: '❤️ 感情指引', desc: '探索感情和姻缘' },
    { id: 'wealth', label: '💰 财富积累', desc: '财运分析和理财建议' },
    { id: 'self', label: '🔮 自我探索', desc: '深度了解自己的性格和命运' },
    { id: 'decision', label: '🎯 重大决策', desc: '帮助做出重要人生选择' }
  ],
  en: [
    { id: 'career', label: '💼 Career', desc: 'Career direction and fortune' },
    { id: 'love', label: '❤️ Love Guidance', desc: 'Explore relationships' },
    { id: 'wealth', label: '💰 Wealth', desc: 'Financial analysis' },
    { id: 'self', label: '🔮 Self Discovery', desc: 'Understand yourself' },
    { id: 'decision', label: '🎯 Major Decision', desc: 'Make important choices' }
  ]
};

const TIME_PERIODS = {
  zh: [
    { value: 0, label: '子时 (23:00-00:59)' },
    { value: 1, label: '丑时 (01:00-02:59)' },
    { value: 2, label: '寅时 (03:00-04:59)' },
    { value: 3, label: '卯时 (05:00-06:59)' },
    { value: 4, label: '辰时 (07:00-08:59)' },
    { value: 5, label: '巳时 (09:00-10:59)' },
    { value: 6, label: '午时 (11:00-12:59)' },
    { value: 7, label: '未时 (13:00-14:59)' },
    { value: 8, label: '申时 (15:00-16:59)' },
    { value: 9, label: '酉时 (17:00-18:59)' },
    { value: 10, label: '戌时 (19:00-20:59)' },
    { value: 11, label: '亥时 (21:00-22:59)' }
  ],
  en: [
    { value: 0, label: 'Zi (23:00-00:59)' },
    { value: 1, label: 'Chou (01:00-02:59)' },
    { value: 2, label: 'Yin (03:00-04:59)' },
    { value: 3, label: 'Mao (05:00-06:59)' },
    { value: 4, label: 'Chen (07:00-08:59)' },
    { value: 5, label: 'Si (09:00-10:59)' },
    { value: 6, label: 'Wu (11:00-12:59)' },
    { value: 7, label: 'Wei (13:00-14:59)' },
    { value: 8, label: 'Shen (15:00-16:59)' },
    { value: 9, label: 'You (17:00-18:59)' },
    { value: 10, label: 'Xu (19:00-20:59)' },
    { value: 11, label: 'Hai (21:00-22:59)' }
  ]
};

export default function GuidedOnboarding({ onComplete, onSkip, language = 'zh' }: GuidedOnboardingProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    fortuneType: null,
    birthday: '2000-01-01',
    birthTime: '00:00',
    gender: null,
    name: '',
    goal: ''
  });

  const fortuneTypes = FORTUNE_TYPES[language] || FORTUNE_TYPES.zh;
  const goals = GOALS[language] || GOALS.zh;
  const timePeriods = TIME_PERIODS[language] || TIME_PERIODS.zh;

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete(data);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.fortuneType !== null;
      case 2:
        return data.birthday && data.gender !== null;
      case 3:
        return data.name.trim().length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="onboarding-container">
      {/* 进度条 */}
      <div className="progress-bar">
        <div className="progress-track">
          <motion.div
            className="progress-fill"
            initial={{ width: '33%' }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="step-indicator">
          {language === 'zh' ? `步骤 ${step} / 3` : `Step ${step} / 3`}
        </div>
      </div>

      {/* 步骤内容 */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="step-content"
          >
            <h2 className="step-title">
              {language === 'zh' ? '🎯 选择您想探索的命理类型' : '🎯 Choose Your Fortune Type'}
            </h2>
            <p className="step-desc">
              {language === 'zh'
                ? '每种命理都有独特的解读方式，选择您最感兴趣的一个开始探索'
                : 'Each fortune type has unique insights. Choose one that interests you most'}
            </p>

            <div className="fortune-grid">
              {fortuneTypes.map((type) => (
                <button
                  key={type.id}
                  className={`fortune-card ${data.fortuneType === type.id ? 'selected' : ''}`}
                  onClick={() => updateData({ fortuneType: type.id })}
                  style={{
                    '--accent-color': type.color,
                    borderColor: data.fortuneType === type.id ? type.color : undefined
                  } as React.CSSProperties}
                >
                  <div className="fortune-icon">{type.icon}</div>
                  <div className="fortune-name">{type.name}</div>
                  <div className="fortune-desc">{type.desc}</div>
                  <div className="fortune-features">
                    {type.features.map((f, i) => (
                      <span key={i} className="feature-tag">{f}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="step-content"
          >
            <h2 className="step-title">
              {language === 'zh' ? '📅 告诉我您的基本信息' : '📅 Tell Me About Yourself'}
            </h2>
            <p className="step-desc">
              {language === 'zh'
                ? '这些信息将帮助我更准确地为您解读命盘'
                : 'This info helps me give you more accurate readings'}
            </p>

            <div className="form-grid">
              {/* 生日 */}
              <div className="form-group">
                <label className="form-label">
                  {language === 'zh' ? '出生日期' : 'Birthday'}
                </label>
                <input
                  type="date"
                  value={data.birthday}
                  onChange={(e) => updateData({ birthday: e.target.value })}
                  className="form-input"
                />
              </div>

              {/* 性别 */}
              <div className="form-group">
                <label className="form-label">
                  {language === 'zh' ? '性别' : 'Gender'}
                </label>
                <div className="gender-buttons">
                  <button
                    className={`gender-btn ${data.gender === 'male' ? 'selected' : ''}`}
                    onClick={() => updateData({ gender: 'male' })}
                  >
                    {language === 'zh' ? '👨 男' : '👨 Male'}
                  </button>
                  <button
                    className={`gender-btn ${data.gender === 'female' ? 'selected' : ''}`}
                    onClick={() => updateData({ gender: 'female' })}
                  >
                    {language === 'zh' ? '👩 女' : '👩 Female'}
                  </button>
                </div>
              </div>

              {/* 时辰 (仅八字需要) */}
              {data.fortuneType === 'bazi' && (
                <div className="form-group">
                  <label className="form-label">
                    {language === 'zh' ? '出生时辰（精确到时辰段）' : 'Birth Hour'}
                  </label>
                  <select
                    value={data.birthTime}
                    onChange={(e) => updateData({ birthTime: e.target.value })}
                    className="form-input"
                  >
                    {timePeriods.map((t) => (
                      <option key={t.value} value={t.label}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="tip-box">
              <span className="tip-icon">💡</span>
              <p>
                {language === 'zh'
                  ? '提示：八字分析需要精确到时辰，时辰不同命运也会有所差异'
                  : 'Tip: BaZi analysis requires precise birth hour, as different hours affect destiny'}
              </p>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="step-content"
          >
            <h2 className="step-title">
              {language === 'zh' ? '🎯 最后一步 — 告诉我您的目的' : '🎯 Last Step — What Brings You Here?'}
            </h2>
            <p className="step-desc">
              {language === 'zh'
                ? '了解您的目的可以帮助我为您定制更精准的解读'
                : 'Knowing your purpose helps me tailor the reading for you'}
            </p>

            {/* 昵称 */}
            <div className="form-group">
              <label className="form-label">
                {language === 'zh' ? '您希望怎么称呼您？（选填）' : 'How should we call you? (optional)'}
              </label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => updateData({ name: e.target.value })}
                placeholder={language === 'zh' ? '输入昵称...' : 'Enter nickname...'}
                className="form-input"
              />
            </div>

            {/* 目的 */}
            <div className="goals-grid">
              {goals.map((goal) => (
                <button
                  key={goal.id}
                  className={`goal-card ${data.goal === goal.id ? 'selected' : ''}`}
                  onClick={() => updateData({ goal: goal.id })}
                >
                  <div className="goal-label">{goal.label}</div>
                  <div className="goal-desc">{goal.desc}</div>
                </button>
              ))}
            </div>

            {/* 预览 */}
            <div className="preview-box">
              <div className="preview-header">
                {language === 'zh' ? '📋 预览您的设置' : '📋 Preview Your Settings'}
              </div>
              <div className="preview-content">
                <div className="preview-row">
                  <span className="preview-label">
                    {language === 'zh' ? '命理类型' : 'Fortune Type'}:
                  </span>
                  <span className="preview-value">
                    {fortuneTypes.find(f => f.id === data.fortuneType)?.name || '-'}
                  </span>
                </div>
                <div className="preview-row">
                  <span className="preview-label">
                    {language === 'zh' ? '出生日期' : 'Birthday'}:
                  </span>
                  <span className="preview-value">{data.birthday}</span>
                </div>
                <div className="preview-row">
                  <span className="preview-label">
                    {language === 'zh' ? '探索目的' : 'Goal'}:
                  </span>
                  <span className="preview-value">
                    {goals.find(g => g.id === data.goal)?.label || '-'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 按钮区域 */}
      <div className="button-area">
        {step > 1 && (
          <button className="btn-back" onClick={handleBack}>
            ← {language === 'zh' ? '上一步' : 'Back'}
          </button>
        )}

        <button
          className="btn-next"
          onClick={handleNext}
          disabled={!canProceed()}
        >
          {step === 3
            ? (language === 'zh' ? '🚀 开始探索命运' : '🚀 Start Exploring')
            : (language === 'zh' ? '下一步 →' : 'Next →')}
        </button>
      </div>

      {/* 跳过按钮 */}
      {onSkip && (
        <button className="skip-btn" onClick={onSkip}>
          {language === 'zh' ? '跳过引导，直接使用' : 'Skip, use directly'}
        </button>
      )}

      <style jsx>{`
        .onboarding-container {
          max-width: 640px;
          margin: 0 auto;
          padding: 32px 24px;
          background: rgba(255,255,255,0.03);
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .progress-bar {
          margin-bottom: 32px;
        }
        .progress-track {
          height: 4px;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #7C3AED, #A782FF);
          border-radius: 2px;
        }
        .step-indicator {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          text-align: center;
        }
        .step-content {
          min-height: 400px;
        }
        .step-title {
          font-size: 24px;
          font-weight: 700;
          color: white;
          text-align: center;
          margin-bottom: 8px;
        }
        .step-desc {
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          text-align: center;
          margin-bottom: 24px;
        }
        .fortune-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        .fortune-card {
          padding: 16px 12px;
          border-radius: 12px;
          border: 2px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }
        .fortune-card:hover {
          border-color: rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.06);
        }
        .fortune-card.selected {
          border-color: var(--accent-color);
          background: rgba(124,58,237,0.15);
        }
        .fortune-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }
        .fortune-name {
          font-size: 14px;
          font-weight: 600;
          color: white;
          margin-bottom: 4px;
        }
        .fortune-desc {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          margin-bottom: 8px;
        }
        .fortune-features {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          justify-content: center;
        }
        .feature-tag {
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 10px;
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6);
        }
        .form-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 24px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form-label {
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          font-weight: 500;
        }
        .form-input {
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: white;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input:focus {
          border-color: rgba(124,58,237,0.5);
        }
        .gender-buttons {
          display: flex;
          gap: 12px;
        }
        .gender-btn {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          border: 2px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: white;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .gender-btn:hover {
          border-color: rgba(255,255,255,0.3);
        }
        .gender-btn.selected {
          border-color: #7C3AED;
          background: rgba(124,58,237,0.2);
        }
        .tip-box {
          display: flex;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.2);
          border-radius: 10px;
        }
        .tip-icon {
          font-size: 18px;
        }
        .tip-box p {
          font-size: 12px;
          color: rgba(245,158,11,0.9);
          line-height: 1.5;
          margin: 0;
        }
        .goals-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        .goal-card {
          padding: 16px;
          border-radius: 12px;
          border: 2px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        .goal-card:hover {
          border-color: rgba(255,255,255,0.3);
        }
        .goal-card.selected {
          border-color: #7C3AED;
          background: rgba(124,58,237,0.15);
        }
        .goal-label {
          font-size: 14px;
          font-weight: 600;
          color: white;
          margin-bottom: 4px;
        }
        .goal-desc {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
        }
        .preview-box {
          background: rgba(255,255,255,0.03);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
        }
        .preview-header {
          padding: 12px 16px;
          background: rgba(255,255,255,0.05);
          font-size: 12px;
          font-weight: 600;
          color: rgba(255,255,255,0.6);
        }
        .preview-content {
          padding: 16px;
        }
        .preview-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 13px;
        }
        .preview-row:last-child {
          margin-bottom: 0;
        }
        .preview-label {
          color: rgba(255,255,255,0.4);
        }
        .preview-value {
          color: white;
          font-weight: 500;
        }
        .button-area {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .btn-back {
          padding: 12px 24px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.15);
          background: transparent;
          color: rgba(255,255,255,0.6);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-back:hover {
          background: rgba(255,255,255,0.05);
          color: white;
        }
        .btn-next {
          flex: 1;
          padding: 14px 24px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #7C3AED, #A782FF);
          color: white;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-next:hover:not(:disabled) {
          transform: scale(1.02);
        }
        .btn-next:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .skip-btn {
          display: block;
          margin: 16px auto 0;
          padding: 8px 16px;
          border: none;
          background: transparent;
          color: rgba(255,255,255,0.3);
          font-size: 12px;
          cursor: pointer;
        }
        .skip-btn:hover {
          color: rgba(255,255,255,0.6);
        }
        @media (max-width: 640px) {
          .fortune-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .goals-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
