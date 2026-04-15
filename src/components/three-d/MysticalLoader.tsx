'use client';

/**
 * MysticalLoader — 神秘加载动画
 *
 * 基于 AI_Animation 的加载动画模式
 * 星空主题的加载指示器
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoaderStep {
  text: string;
  textEn: string;
  duration: number;
}

const DEFAULT_STEPS: LoaderStep[] = [
  { text: '正在连接命运...', textEn: 'Connecting to destiny...', duration: 800 },
  { text: '解析星盘数据...', textEn: 'Parsing astrological data...', duration: 600 },
  { text: '计算运势指数...', textEn: 'Calculating fortune index...', duration: 700 },
  { text: '解读命理密码...', textEn: 'Decoding fate matrix...', duration: 500 },
  { text: '生成命运报告...', textEn: 'Generating fate report...', duration: 600 }
];

interface MysticalLoaderProps {
  steps?: LoaderStep[];
  language?: 'zh' | 'en';
  duration?: number;
  onComplete?: () => void;
  showProgress?: boolean;
  variant?: 'stars' | 'orbit' | 'pulse' | 'runes';
}

export default function MysticalLoader({
  steps = DEFAULT_STEPS,
  language = 'zh',
  duration = 3000,
  onComplete,
  showProgress = true,
  variant = 'stars'
}: MysticalLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const totalDuration = steps.reduce((acc, step) => acc + step.duration, 0);
    const interval = duration / totalDuration;

    let accumulated = 0;
    const timers: NodeJS.Timeout[] = [];

    steps.forEach((step, index) => {
      accumulated += step.duration;

      // Update step
      const stepTimer = setTimeout(() => {
        setCurrentStep(index + 1);
      }, accumulated - step.duration);
      timers.push(stepTimer);

      // Update progress
      const progressTimer = setInterval(() => {
        setProgress(prev => {
          const increment = 100 / (totalDuration / 16);
          const next = prev + increment;
          return next >= 100 ? 100 : next;
        });
      }, interval);
      timers.push(progressTimer);
    });

    // Complete
    const completeTimer = setTimeout(() => {
      setIsComplete(true);
      setProgress(100);
      setTimeout(() => onComplete?.(), 500);
    }, duration);

    timers.push(completeTimer);

    return () => timers.forEach(clearTimeout);
  }, [steps, duration, onComplete]);

  return (
    <div className="mystical-loader">
      {/* Background effect */}
      <div className="loader-bg">
        <CosmicBackground variant={variant} />
      </div>

      {/* Main content */}
      <div className="loader-content">
        {/* Logo/Icon */}
        <motion.div
          className="loader-icon"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          ✧
        </motion.div>

        {/* Title */}
        <motion.h2
          className="loader-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {language === 'zh' ? '命盘解读中' : 'Analyzing Destiny'}
        </motion.h2>

        {/* Loading animation based on variant */}
        <div className="loading-animation">
          {variant === 'stars' && <StarsAnimation />}
          {variant === 'orbit' && <OrbitAnimation />}
          {variant === 'pulse' && <PulseAnimation />}
          {variant === 'runes' && <RunesAnimation />}
        </div>

        {/* Status text */}
        <AnimatePresence mode="wait">
          <motion.p
            key={currentStep}
            className="loader-status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {language === 'zh'
              ? steps[currentStep - 1]?.text || steps[0]?.text
              : steps[currentStep - 1]?.textEn || steps[0]?.textEn}
          </motion.p>
        </AnimatePresence>

        {/* Progress bar */}
        {showProgress && (
          <div className="progress-container">
            <div className="progress-track">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <span className="progress-text">{Math.round(progress)}%</span>
          </div>
        )}

        {/* Dots indicator */}
        <div className="dots-indicator">
          {steps.map((_, i) => (
            <motion.div
              key={i}
              className={`dot ${i < currentStep ? 'done' : ''} ${i === currentStep - 1 ? 'active' : ''}`}
              animate={
                i === currentStep - 1
                  ? { scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }
                  : {}
              }
              transition={{ duration: 0.8, repeat: i === currentStep - 1 ? Infinity : 0 }}
            />
          ))}
        </div>
      </div>

      {/* Complete animation */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            className="complete-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="complete-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10 }}
            >
              ✨
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .mystical-loader {
          position: relative;
          width: 400px;
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(180deg, #030014 0%, #0a0a1e 100%);
          border-radius: 20px;
          border: 1px solid rgba(168,130,255,0.2);
          overflow: hidden;
        }
        .loader-bg {
          position: absolute;
          inset: 0;
          opacity: 0.5;
        }
        .loader-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .loader-icon {
          font-size: 48px;
          color: #A782FF;
          text-shadow: 0 0 30px rgba(168,130,255,0.8);
        }
        .loader-title {
          font-size: 20px;
          font-weight: 700;
          color: white;
          margin: 0;
        }
        .loading-animation {
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .loader-status {
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          margin: 0;
        }
        .progress-container {
          width: 200px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .progress-track {
          flex: 1;
          height: 4px;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #7C3AED, #A782FF);
          border-radius: 2px;
        }
        .progress-text {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          min-width: 35px;
        }
        .dots-indicator {
          display: flex;
          gap: 8px;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
        }
        .dot.done {
          background: #10B981;
        }
        .dot.active {
          background: #A782FF;
        }
        .complete-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(3,0,20,0.9);
        }
        .complete-icon {
          font-size: 64px;
        }
      `}</style>
    </div>
  );
}

// Animation sub-components
function StarsAnimation() {
  return (
    <div className="stars-animation">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="star"
          style={{
            width: 8 + i * 2,
            height: 8 + i * 2,
            background: i % 2 === 0 ? '#A782FF' : '#EC4899',
            borderRadius: '50%'
          }}
          animate={{
            y: [-10, 10, -10],
            opacity: [0.5, 1, 0.5],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
      <style jsx>{`
        .stars-animation {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .star {
          filter: blur(1px);
        }
      `}</style>
    </div>
  );
}

function OrbitAnimation() {
  return (
    <div className="orbit-animation">
      <motion.div
        className="orbit"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      >
        <div className="orbit-dot" />
      </motion.div>
      <motion.div
        className="orbit orbit-2"
        animate={{ rotate: -360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <div className="orbit-dot dot-2" />
      </motion.div>
      <div className="orbit-center" />

      <style jsx>{`
        .orbit-animation {
          position: relative;
          width: 50px;
          height: 50px;
        }
        .orbit {
          position: absolute;
          inset: 0;
          border: 1px dashed rgba(168,130,255,0.5);
          border-radius: 50%;
        }
        .orbit-dot {
          position: absolute;
          top: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 8px;
          height: 8px;
          background: #A782FF;
          border-radius: 50%;
          box-shadow: 0 0 10px #A782FF;
        }
        .dot-2 {
          background: #EC4899;
          box-shadow: 0 0 10px #EC4899;
        }
        .orbit-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 12px;
          height: 12px;
          background: linear-gradient(135deg, #7C3AED, #A782FF);
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}

function PulseAnimation() {
  return (
    <div className="pulse-animation">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="pulse-ring"
          style={{ animationDelay: `${i * 0.3}s` }}
          animate={{
            scale: [1, 2],
            opacity: [0.6, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.3
          }}
        />
      ))}
      <div className="pulse-center">命</div>

      <style jsx>{`
        .pulse-animation {
          position: relative;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 2px solid #A782FF;
          border-radius: 50%;
        }
        .pulse-center {
          font-size: 20px;
          font-weight: bold;
          color: #A782FF;
        }
      `}</style>
    </div>
  );
}

function RunesAnimation() {
  const RUNES = ['☰', '☱', '☲', '☳', '☴', '☵'];

  return (
    <div className="runes-animation">
      {[...Array(6)].map((_, i) => (
        <motion.span
          key={i}
          animate={{
            opacity: [0.3, 1, 0.3],
            y: [-5, 5, -5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.2
          }}
          style={{ fontSize: 20, color: '#A782FF' }}
        >
          {RUNES[i]}
        </motion.span>
      ))}

      <style jsx>{`
        .runes-animation {
          display: flex;
          gap: 8px;
        }
      `}</style>
    </div>
  );
}

// Background effect component
function CosmicBackground({ variant }: { variant: string }) {
  return (
    <div className="cosmic-bg">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="bg-star"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            background: i % 3 === 0 ? '#A782FF' : i % 3 === 1 ? '#EC4899' : 'white'
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2]
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}

      <style jsx>{`
        .cosmic-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .bg-star {
          position: absolute;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}