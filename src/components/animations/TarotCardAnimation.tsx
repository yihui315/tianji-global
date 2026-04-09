'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type TarotCard, type DrawnCard, type SpreadLayout } from '@/lib/tarot';

interface TarotCardAnimationProps {
  drawnCards: DrawnCard[];
  spread?: SpreadLayout;
  language?: 'en' | 'zh';
  spreadType?: 'single' | 'three-card' | 'celtic-cross';
  playing?: boolean;
  width?: number;
  height?: number;
}

function getCardSymbol(arcana: string, suit?: string): string {
  if (arcana === 'major') return '★';
  switch (suit) {
    case 'Wands': return '🔥';
    case 'Cups': return '💧';
    case 'Swords': return '⚔️';
    case 'Pentacles': return '💰';
    default: return '?';
  }
}

// Single animated tarot card with flip
function AnimatedCard({
  drawnCard,
  language,
  index,
  playing,
  onClick,
  isRevealed,
}: {
  drawnCard: DrawnCard;
  language: 'en' | 'zh';
  index: number;
  playing: boolean;
  onClick: () => void;
  isRevealed: boolean;
}) {
  const { card, isReversed, positionName, positionNameChinese } = drawnCard;

  const cardVariants = {
    hidden: { opacity: 0, scale: 0, rotateY: 0 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.5,
        type: 'spring',
        stiffness: 200,
        damping: 20,
      },
    }),
  };

  const flipVariants = {
    front: { rotateY: 0 },
    back: { rotateY: 180 },
  };

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate={playing ? 'visible' : 'hidden'}
      style={{ perspective: 1000 }}
      onClick={onClick}
      whileHover={{ scale: playing && !isRevealed ? 1.05 : 1 }}
      whileTap={{ scale: playing ? 0.97 : 1 }}
      className="cursor-pointer"
    >
      <motion.div
        animate={isRevealed ? 'back' : 'front'}
        variants={flipVariants}
        transition={{ duration: 0.6, type: 'spring', stiffness: 150, damping: 20 }}
        style={{ transformStyle: 'preserve-3d', position: 'relative', width: '100%', height: '100%' }}
      >
        {/* Card Back */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(135deg, #581c87 0%, #7c3aed 100%)',
            borderRadius: 8,
            border: '2px solid #A78BFA',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <div style={{ fontSize: 24 }}>🌙</div>
          <div style={{ color: '#C4B5FD', fontSize: 10, fontFamily: 'serif', textAlign: 'center' }}>TianJi</div>
          <div
            style={{
              width: '60%',
              height: 1,
              background: 'linear-gradient(to right, transparent, #A78BFA, transparent)',
              margin: '4px 0',
            }}
          />
          <div style={{ color: '#7c3aed', fontSize: 8 }}>Tarot</div>
        </div>

        {/* Card Front */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: isReversed
              ? 'linear-gradient(135deg, #7c2d12 0%, #991b1b 100%)'
              : 'linear-gradient(135deg, #581c87 0%, #7c3aed 100%)',
            borderRadius: 8,
            border: `2px solid ${isReversed ? '#FCD34D' : '#A78BFA'}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 8,
          }}
        >
          {/* Position label */}
          <div style={{ fontSize: 8, color: '#C4B5FD', marginBottom: 2, textAlign: 'center' }}>
            {language === 'zh' ? positionNameChinese : positionName}
          </div>
          {/* Symbol */}
          <div style={{ fontSize: 28, marginBottom: 4 }}>{getCardSymbol(card.arcana, card.suit)}</div>
          {/* Card name */}
          <div
            style={{
              color: isReversed ? '#FCD34D' : '#E9D5FF',
              fontSize: 11,
              fontWeight: 'bold',
              fontFamily: 'serif',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            {language === 'zh' ? card.nameChinese : card.name}
          </div>
          {card.arcana === 'minor' && (
            <div style={{ color: '#C4B5FD', fontSize: 9, opacity: 0.8 }}>
              {language === 'zh' ? card.suitChinese : card.suit}
            </div>
          )}
          {isReversed && (
            <div
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                background: '#FCD34D',
                color: '#000',
                fontSize: 7,
                padding: '2px 4px',
                borderRadius: 4,
                fontWeight: 'bold',
              }}
            >
              {language === 'zh' ? '逆位' : 'Rev'}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function TarotCardAnimation({
  drawnCards,
  spread,
  language = 'en',
  spreadType = 'three-card',
  playing = true,
  width = 800,
  height = 400,
}: TarotCardAnimationProps) {
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());

  const toggleReveal = (index: number) => {
    setRevealedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // Spread layout positions
  const getSpreadLayout = () => {
    if (spreadType === 'single') {
      return [{ x: 0.5, y: 0.5 }];
    }
    if (spreadType === 'three-card') {
      return [
        { x: 0.2, y: 0.5 },
        { x: 0.5, y: 0.5 },
        { x: 0.8, y: 0.5 },
      ];
    }
    // Celtic cross — simplified 10-position spread
    return [
      { x: 0.35, y: 0.3 },
      { x: 0.35, y: 0.55 },
      { x: 0.65, y: 0.3 },
      { x: 0.55, y: 0.5 },
      { x: 0.45, y: 0.5 },
      { x: 0.65, y: 0.65 },
      { x: 0.75, y: 0.65 },
      { x: 0.5, y: 0.75 },
      { x: 0.5, y: 0.9 },
      { x: 0.5, y: 1.05 },
    ];
  };

  const positions = getSpreadLayout();

  const spreadName = spread?.name || (spreadType === 'single' ? 'Single Card' : spreadType === 'three-card' ? 'Three Card' : 'Celtic Cross');

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AnimatePresence>
        {playing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <span style={{ color: 'rgba(124,58,237,0.4)', fontSize: 10, fontFamily: 'sans-serif' }}>
              {spreadName} · Tarot
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: spreadType === 'single' ? '1fr' : spreadType === 'three-card' ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)',
          gap: spreadType === 'celtic-cross' ? 8 : 16,
          width: '100%',
          maxWidth: spreadType === 'celtic-cross' ? 500 : 600,
        }}
      >
        {drawnCards.slice(0, positions.length).map((drawnCard, index) => {
          const pos = positions[index];
          if (!pos) return null;

          return (
            <motion.div
              key={`card-${index}`}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              transition={{
                delay: index * 0.15,
                duration: 0.5,
                type: 'spring',
                stiffness: 180,
                damping: 18,
              }}
              style={{
                aspectRatio: '2/3',
                width: '100%',
                maxWidth: spreadType === 'celtic-cross' ? 90 : 120,
              }}
            >
              <AnimatedCard
                drawnCard={drawnCard}
                language={language}
                index={index}
                playing={playing}
                onClick={() => toggleReveal(index)}
                isRevealed={revealedIndices.has(index)}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
