'use client';

/**
 * TarotCardReveal — 塔罗牌翻转揭示动画
 *
 * 基于 AI_Animation 的3D翻转动画模式
 * 塔罗牌翻开效果，带有神秘光芒
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TarotCard {
  id: string;
  name: string;
  nameEn: string;
  meaning: string;
  meaningEn: string;
  image?: string;
  reversed?: boolean;
}

interface TarotCardRevealProps {
  cards: TarotCard[];
  spread?: 'three' | 'five' | 'celtic' | 'single';
  language?: 'zh' | 'en';
  onSelect?: (card: TarotCard) => void;
  autoReveal?: boolean;
  revealDelay?: number;
}

const SPREAD_POSITIONS: Record<string, { x: number; y: number; rotation: number }[]> = {
  single: [{ x: 0, y: 0, rotation: 0 }],
  three: [
    { x: -150, y: 50, rotation: -15 },
    { x: 0, y: -30, rotation: 0 },
    { x: 150, y: 50, rotation: 15 }
  ],
  five: [
    { x: -200, y: 0, rotation: -20 },
    { x: -100, y: 30, rotation: -10 },
    { x: 0, y: -40, rotation: 0 },
    { x: 100, y: 30, rotation: 10 },
    { x: 200, y: 0, rotation: 20 }
  ],
  celtic: [
    { x: 0, y: -100, rotation: 0 },       // 1. 现状
    { x: -120, y: -20, rotation: -25 },   // 2. 障碍
    { x: 120, y: -20, rotation: 25 },     // 3. 过去
    { x: -60, y: 80, rotation: -10 },     // 4. 建议
    { x: 60, y: 80, rotation: 10 }        // 5. 未来
  ]
};

export default function TarotCardReveal({
  cards,
  spread = 'three',
  language = 'zh',
  onSelect,
  autoReveal = false,
  revealDelay = 1000
}: TarotCardRevealProps) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<TarotCard | null>(null);
  const positions = SPREAD_POSITIONS[spread] || SPREAD_POSITIONS.three;

  // Auto reveal effect
  React.useEffect(() => {
    if (autoReveal) {
      cards.forEach((card, i) => {
        setTimeout(() => {
          setRevealed(prev => new Set([...prev, card.id]));
        }, revealDelay * (i + 1));
      });
    }
  }, [autoReveal, cards, revealDelay]);

  const revealCard = (cardId: string) => {
    setRevealed(prev => new Set([...prev, cardId]));
  };

  const selectCard = (card: TarotCard) => {
    setSelected(card);
    onSelect?.(card);
  };

  return (
    <div className="tarot-spread">
      {/* Cards */}
      <div className="cards-container">
        {cards.map((card, index) => {
          const pos = positions[index] || positions[0];
          const isRevealed = revealed.has(card.id);
          const isSelected = selected?.id === card.id;

          return (
            <motion.div
              key={card.id}
              className="card-wrapper"
              style={{
                left: `calc(50% + ${pos.x}px)`,
                top: `calc(50% + ${pos.y}px)`,
                transform: `translate(-50%, -50%) rotate(${pos.rotation}deg)`
              }}
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              whileHover={{ scale: isRevealed ? 1.1 : 1.05, zIndex: 10 }}
              onClick={() => !isRevealed && revealCard(card.id)}
            >
              <div className={`card ${isRevealed ? 'revealed' : ''} ${isSelected ? 'selected' : ''}`}>
                {/* Card Front (face down) */}
                <motion.div
                  className="card-front"
                  animate={{ rotateY: isRevealed ? 180 : 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="card-back-design">
                    <div className="back-pattern" />
                    <div className="back-symbol">✧</div>
                    <div className="back-glow" />
                  </div>
                </motion.div>

                {/* Card Back */}
                <motion.div
                  className="card-back"
                  animate={{ rotateY: isRevealed ? 0 : -180 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="card-content">
                    <div className="card-icon">
                      {card.reversed ? '🔽' : '🔼'}
                    </div>
                    <div className="card-name">
                      {language === 'zh' ? card.name : card.nameEn}
                    </div>
                    <div className="card-meaning">
                      {language === 'zh' ? card.meaning : card.meaningEn}
                    </div>
                  </div>

                  {/* Glow effect */}
                  <div className="card-glow" />
                </motion.div>
              </div>

              {/* Click hint for unrevealed */}
              {!isRevealed && (
                <div className="reveal-hint">
                  {language === 'zh' ? '点击揭示' : 'Click to reveal'}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Selected card detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="detail-panel"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
          >
            <div className="panel-header">
              <span className="panel-icon">
                {selected.reversed ? '🔽' : '🔼'}
              </span>
              <span className="panel-title">
                {language === 'zh' ? selected.name : selected.nameEn}
              </span>
              {selected.reversed && (
                <span className="reversed-badge">
                  {language === 'zh' ? '逆位' : 'Reversed'}
                </span>
              )}
            </div>
            <div className="panel-meaning">
              {language === 'zh' ? selected.meaning : selected.meaningEn}
            </div>
            <button
              className="panel-close"
              onClick={() => setSelected(null)}
            >
              {language === 'zh' ? '关闭' : 'Close'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .tarot-spread {
          position: relative;
          width: 100%;
          min-height: 400px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .cards-container {
          position: relative;
          width: 100%;
          height: 350px;
        }

        .card-wrapper {
          position: absolute;
          width: 120px;
          height: 200px;
          cursor: pointer;
          perspective: 1000px;
        }

        .card {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
        }

        .card-front, .card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 12px;
          backface-visibility: hidden;
          overflow: hidden;
        }

        .card-front {
          background: linear-gradient(135deg, #1a1a3e 0%, #2d1b4e 100%);
          border: 2px solid rgba(168, 130, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-back-design {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .back-pattern {
          position: absolute;
          inset: 8px;
          border: 1px solid rgba(168, 130, 255, 0.3);
          border-radius: 8px;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 5px,
            rgba(168, 130, 255, 0.05) 5px,
            rgba(168, 130, 255, 0.05) 10px
          );
        }

        .back-symbol {
          font-size: 32px;
          color: rgba(168, 130, 255, 0.6);
          z-index: 1;
        }

        .back-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(168, 130, 255, 0.2) 0%, transparent 70%);
        }

        .card-back {
          background: linear-gradient(135deg, #0a0a1e 0%, #1a1a3e 100%);
          border: 2px solid rgba(168, 130, 255, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-content {
          text-align: center;
          padding: 16px;
          z-index: 1;
        }

        .card-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }

        .card-name {
          font-size: 14px;
          font-weight: 700;
          color: white;
          margin-bottom: 8px;
        }

        .card-meaning {
          font-size: 11px;
          color: rgba(255,255,255,0.6);
          line-height: 1.4;
        }

        .card-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(168, 130, 255, 0.3) 0%, transparent 70%);
          pointer-events: none;
        }

        .card.selected {
          box-shadow: 0 0 40px rgba(168, 130, 255, 0.8);
        }

        .reveal-hint {
          position: absolute;
          bottom: -30px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          white-space: nowrap;
        }

        .detail-panel {
          margin-top: 30px;
          padding: 20px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(168, 130, 255, 0.2);
          border-radius: 16px;
          max-width: 400px;
          width: 100%;
        }

        .panel-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .panel-icon {
          font-size: 24px;
        }

        .panel-title {
          font-size: 18px;
          font-weight: 700;
          color: white;
        }

        .reversed-badge {
          font-size: 10px;
          padding: 2px 8px;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.5);
          border-radius: 4px;
          color: #EF4444;
        }

        .panel-meaning {
          font-size: 14px;
          color: rgba(255,255,255,0.7);
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .panel-close {
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.2);
          background: transparent;
          color: rgba(255,255,255,0.6);
          font-size: 12px;
          cursor: pointer;
        }

        .panel-close:hover {
          background: rgba(255,255,255,0.05);
          color: white;
        }
      `}</style>
    </div>
  );
}

// Demo data
export const DEMO_TAROT_CARDS: TarotCard[] = [
  {
    id: '1',
    name: '愚者',
    nameEn: 'The Fool',
    meaning: '新的开始、自由、纯真',
    meaningEn: 'New beginnings, freedom, innocence'
  },
  {
    id: '2',
    name: '女祭司',
    nameEn: 'High Priestess',
    meaning: '直觉、神秘、潜意识',
    meaningEn: 'Intuition, mystery, subconscious'
  },
  {
    id: '3',
    name: '女皇',
    nameEn: 'The Empress',
    meaning: '丰盛、创造、母亲',
    meaningEn: 'Abundance, creativity, mother'
  }
];