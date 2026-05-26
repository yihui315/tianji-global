'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { layout, prepare } from '@chenglou/pretext';

type PretextWhiteSpace = 'normal' | 'pre-wrap';

type PretextTextLayoutOptions = {
  text: string;
  font: string;
  lineHeight: number;
  minHeight?: number;
  whiteSpace?: PretextWhiteSpace;
  enabled?: boolean;
};

export function usePretextTextLayout<TElement extends HTMLElement = HTMLElement>({
  text,
  font,
  lineHeight,
  minHeight = 0,
  whiteSpace = 'normal',
  enabled = true,
}: PretextTextLayoutOptions) {
  const ref = useRef<TElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;

    const element = ref.current;
    if (!element) return undefined;

    const updateWidth = () => {
      const nextWidth = Math.max(0, element.clientWidth);
      setWidth((currentWidth) => (Math.abs(currentWidth - nextWidth) < 0.5 ? currentWidth : nextWidth));
    };

    updateWidth();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled]);

  const measurement = useMemo(() => {
    if (!enabled || width <= 0 || text.trim().length === 0) return null;

    try {
      const prepared = prepare(text, font, { whiteSpace });
      return layout(prepared, width, lineHeight);
    } catch {
      return null;
    }
  }, [enabled, font, lineHeight, text, whiteSpace, width]);

  const measuredMinHeight = measurement ? Math.max(minHeight, Math.ceil(measurement.height)) : minHeight;
  const style = measuredMinHeight > 0
    ? ({ minHeight: `${measuredMinHeight}px` } satisfies CSSProperties)
    : undefined;

  return {
    ref,
    style,
    lineCount: measurement?.lineCount ?? 0,
  };
}
