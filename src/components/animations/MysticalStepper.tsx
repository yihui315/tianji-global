'use client';

/**
 * MysticalStepper — 神秘占卜进度步进器
 *
 * 基于 AI_Animation 的渐显动画模式
 * 用于占卜过程的步骤展示
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Step {
  id: number;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
}

interface MysticalStepperProps {
  steps: Step[];
  language?: 'zh' | 'en';
  autoPlay?: boolean;
  autoPlayInterval?: number;
  onStepChange?: (step: number) => void;
}

export default function MysticalStepper({
  steps,
  language = 'zh',
  autoPlay = false,
  autoPlayInterval = 4000,
  onStepChange
}: MysticalStepperProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0); // 1 = forward, -1 = backward

  const goToStep = (index: number) => {
    setDirection(index > currentStep ? 1 : -1);
    setCurrentStep(index);
    onStepChange?.(index);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
      onStepChange?.(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
      onStepChange?.(currentStep - 1);
    }
  };

  // Auto-play
  React.useEffect(() => {
    if (autoPlay && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setDirection(1);
        setCurrentStep(currentStep + 1);
        onStepChange?.(currentStep + 1);
      }, autoPlayInterval);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, currentStep, steps.length, autoPlayInterval, onStepChange]);

  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0,
      scale: 0.95
    })
  };

  return (
    <div className="mystical-stepper">
      {/* Progress Line */}
      <div className="stepper-track">
        <div className="track-line">
          <motion.div
            className="track-fill"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Step Dots */}
        <div className="step-dots">
          {steps.map((step, index) => (
            <button
              key={step.id}
              className={`step-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              onClick={() => goToStep(index)}
            >
              <span className="dot-icon">{index < currentStep ? '✓' : step.icon}</span>

              {/* Glow ring for active */}
              {index === currentStep && (
                <motion.div
                  className="dot-glow"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              {/* Label */}
              <span className="dot-label">
                {language === 'zh' ? step.title : step.titleEn}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="stepper-content">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="content-card"
          >
            <div className="card-icon">{steps[currentStep].icon}</div>
            <h3 className="card-title">
              {language === 'zh' ? steps[currentStep].title : steps[currentStep].titleEn}
            </h3>
            <p className="card-desc">
              {language === 'zh' ? steps[currentStep].description : steps[currentStep].descriptionEn}
            </p>

            {/* Progress indicator */}
            <div className="card-progress">
              <span className="progress-text">
                {currentStep + 1} / {steps.length}
              </span>
              <div className="progress-dots">
                {steps.map((_, i) => (
                  <span
                    key={i}
                    className={`progress-dot ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'done' : ''}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="stepper-nav">
        <button
          className="nav-btn prev"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          ← {language === 'zh' ? '上一步' : 'Previous'}
        </button>

        <button
          className="nav-btn auto-play"
          onClick={() => {}}
        >
          {autoPlay ? '⏸' : '▶'} {language === 'zh' ? '自动播放' : 'Auto Play'}
        </button>

        <button
          className="nav-btn next"
          onClick={nextStep}
          disabled={currentStep === steps.length - 1}
        >
          {language === 'zh' ? '下一步' : 'Next'} →
        </button>
      </div>

      <style jsx>{`
        .mystical-stepper {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding: 24px;
          background: rgba(255,255,255,0.02);
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .stepper-track {
          position: relative;
          padding: 0 20px;
        }

        .track-line {
          height: 2px;
          background: rgba(255,255,255,0.1);
          border-radius: 1px;
          position: absolute;
          top: 20px;
          left: 40px;
          right: 40px;
        }

        .track-fill {
          height: 100%;
          background: linear-gradient(90deg, #7C3AED, #A782FF, #EC4899);
          border-radius: 1px;
        }

        .step-dots {
          display: flex;
          justify-content: space-between;
          position: relative;
          z-index: 1;
        }

        .step-dot {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          cursor: pointer;
          position: relative;
        }

        .dot-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          border: 2px solid rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          transition: all 0.3s;
        }

        .step-dot.active .dot-icon {
          background: linear-gradient(135deg, #7C3AED, #A782FF);
          border-color: transparent;
          color: white;
          box-shadow: 0 0 20px rgba(168, 130, 255, 0.5);
        }

        .step-dot.completed .dot-icon {
          background: rgba(16, 185, 129, 0.2);
          border-color: #10B981;
          color: #10B981;
        }

        .dot-glow {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid rgba(168, 130, 255, 0.5);
          pointer-events: none;
        }

        .dot-label {
          font-size: 11px;
          color: rgba(255,255,255,0.5);
          white-space: nowrap;
          transition: color 0.3s;
        }

        .step-dot.active .dot-label {
          color: #A782FF;
          font-weight: 600;
        }

        .stepper-content {
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .content-card {
          text-align: center;
          padding: 32px;
          background: rgba(255,255,255,0.03);
          border-radius: 16px;
          border: 1px solid rgba(168, 130, 255, 0.2);
          max-width: 400px;
        }

        .card-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .card-title {
          font-size: 24px;
          font-weight: 700;
          color: white;
          margin-bottom: 12px;
        }

        .card-desc {
          font-size: 14px;
          color: rgba(255,255,255,0.6);
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .card-progress {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .progress-text {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
        }

        .progress-dots {
          display: flex;
          gap: 6px;
        }

        .progress-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          transition: all 0.3s;
        }

        .progress-dot.active {
          background: #A782FF;
          box-shadow: 0 0 8px rgba(168, 130, 255, 0.5);
        }

        .progress-dot.done {
          background: #10B981;
        }

        .stepper-nav {
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }

        .nav-btn {
          padding: 10px 20px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.7);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.1);
          border-color: rgba(168, 130, 255, 0.5);
          color: white;
        }

        .nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .nav-btn.auto-play {
          border-color: rgba(168, 130, 255, 0.3);
          color: #A782FF;
        }

        .nav-btn.next {
          background: linear-gradient(135deg, #7C3AED, #A782FF);
          border: none;
          color: white;
        }

        .nav-btn.next:hover:not(:disabled) {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}