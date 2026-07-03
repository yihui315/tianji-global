'use client';

import { useEffect, useRef, useState } from 'react';
import { trackAdImpression, trackAdSlotExcluded, type AdMonetizedPage, type AdFormat } from '@/lib/analytics/monetization-events';

export type AdFormat = 'display' | 'in-article' | 'in-feed' | 'multiflex';

export interface AdSenseSlotProps {
  slot: string;          // e.g. '1234567890'
  format?: AdFormat;
  className?: string;
  style?: React.CSSProperties;
  /** Minimum height to reserve so page doesn't jump when ad loads */
  minHeight?: number;
  /** Canonical page name for analytics */
  page?: AdMonetizedPage;
  /** Called when ad slot reports fill status */
  onFillChange?: (filled: boolean) => void;
}

const FORMAT_MAP: Record<AdFormat, { width: number; height: number; layout: string }> = {
  display:    { width: 300, height: 250, layout: 'display' },
  'in-article': { width: 300, height: 250, layout: 'in-article' },
  'in-feed':  { width: 300, height: 250, layout: 'in-feed' },
  multiflex:  { width: '100%', height: 'auto', layout: 'flexible' },
};

/**
 * Async AdSense slot component.
 *
 * - Loads the adsbygoogle script once (globally deduplicated via window state flag).
 * - Renders a reserved-height placeholder to prevent layout shift.
 * - In dev mode (NEXT_PUBLIC_APP_URL not set or localhost) renders a styled
 *   placeholder so ads never fire against local / staging environments.
 * - Respects data-adbreak-client="" attribute so ad blockers get a clear signal
 *   to skip the slot without erroring.
 */
export function AdSenseSlot({
  slot,
  format = 'display',
  className = '',
  style,
  minHeight = 280,
  page,
  onFillChange,
}: AdSenseSlotProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const isDev = !process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL?.includes('localhost');

  // Load adsbygoogle once
  useEffect(() => {
    if (isDev) return;
    if (window.adsbygoogle === undefined) {
      const cb = () => setScriptLoaded(true);
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = cb;
      document.head.appendChild(script);
      (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle = [];
    } else {
      setScriptLoaded(true);
    }
  }, [isDev]);

  // Push slot after script is ready + track impression
  useEffect(() => {
    if (isDev || !scriptLoaded || !ref.current) return;
    try {
      const pushResult = ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []).push({});
      // push returns 1 on first push — treat as an attempted impression
      if (pushResult >= 1 && page) {
        trackAdImpression({
          ad_slot_id: slot,
          ad_format: format as AdFormat,
          page: page as AdMonetizedPage,
          filled: false, // will update if ad loads
        });
      }
    } catch {
      // adsbygoogle unavailable — silently skip
    }
  }, [isDev, scriptLoaded, slot, format, page]);

  const { width, height, layout } = FORMAT_MAP[format];
  const isFlexible = layout === 'flexible';

  if (isDev) {
    return (
      <div
        ref={ref}
        className={`ad-placeholder ${className}`}
        style={{ minHeight, ...style }}
        aria-label="Advertisement placeholder"
      >
        <div className="ad-placeholder__inner">
          <span>AD</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`ad-slot-wrapper ${className}`}
      style={{ minHeight, ...style }}
    >
      <ins
        className="adsbygoogle"
        data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_AD_CLIENT || 'ca-pub-0000000000000000'}
        data-ad-slot={slot}
        data-ad-format={layout}
        data-full-width-responsive={isFlexible ? 'false' : 'true'}
        style={{
          display: 'block',
          width: isFlexible ? '100%' : width,
          height: isFlexible ? 'auto' : height,
          minHeight: isFlexible ? minHeight : undefined,
        }}
      />
    </div>
  );
}
