'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, radii, glass, durations, easings } from '@/design-system';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQAccordionProps {
  items: FAQItem[];
  /** Allow multiple items open at once */
  allowMultiple?: boolean;
  /** Extra class names */
  className?: string;
}

/**
 * FAQAccordion — Expandable Q&A list following TianJi glass style.
 */
export function FAQAccordion({
  items,
  allowMultiple = false,
  className = '',
}: FAQAccordionProps) {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set());

  const toggle = useCallback(
    (idx: number) => {
      setOpenIndices((prev) => {
        const next = new Set(allowMultiple ? prev : []);
        if (prev.has(idx)) {
          next.delete(idx);
        } else {
          next.add(idx);
        }
        return next;
      });
    },
    [allowMultiple]
  );

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {items.map((item, idx) => {
        const isOpen = openIndices.has(idx);
        return (
          <div
            key={idx}
            style={{
              ...glass.card,
              borderRadius: radii.card,
            }}
          >
            <button
              onClick={() => toggle(idx)}
              className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
              aria-expanded={isOpen}
            >
              <span
                className="text-sm font-medium pr-4"
                style={{ color: colors.textPrimary }}
              >
                {item.question}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: durations.fast, ease: easings.out }}
                className="text-base flex-shrink-0"
                style={{ color: colors.textTertiary }}
                aria-hidden="true"
              >
                +
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    duration: durations.normal,
                    ease: easings.out,
                  }}
                  className="overflow-hidden"
                >
                  <div
                    className="px-5 pb-4 text-sm leading-relaxed"
                    style={{ color: colors.textTertiary }}
                  >
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
