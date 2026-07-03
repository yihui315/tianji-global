'use client';

import { useEffect, useRef } from 'react';

/**
 * Media.net contextual ad slot component.
 *
 * Contextual ads for Chinese-language traffic — fills when AdSense is
 * unapproved, rejected, or the user is in a non-English market.
 *
 * Setup:
 *  1. Register at https://www.media.net / directcn.media.net
 *  2. Replace MEDIA_NET_PUBLISHER_ID and MEDIA_NET_SLOT_ID placeholders
 *  3. Add MEDIA_NET_PUBLISHER_ID to public/ads.txt
 *
 * Dev mode: renders a styled placeholder (same visual contract as AdSenseSlot).
 */

export interface MediaNetSlotProps {
  className?: string;
  style?: React.CSSProperties;
  minHeight?: number;
  /** Canonical page name for analytics */
  page?: string;
  /** Called when ad loads (filled === true) or no-fill / PSA shown (filled === false) */
  onFillChange?: (filled: boolean) => void;
}

export function MediaNetSlot({
  className = '',
  style,
  minHeight = 280,
  page,
  onFillChange,
}: MediaNetSlotProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isDev =
    !process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL?.includes('localhost');

  // Replace these after Media.net registration
  const pid = process.env.NEXT_PUBLIC_MEDIA_NET_PUBLISHER_ID || 'REPLACE_PID';
  const sid = process.env.NEXT_PUBLIC_MEDIA_NET_SLOT_ID || 'REPLACE_SID';
  const isPlaceholder = pid === 'REPLACE_PID' || sid === 'REPLACE_SID';

  // In dev mode or when not configured, render placeholder
  if (isDev || isPlaceholder) {
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

  // Load Media.net script once via window flag
  useEffect(() => {
    if (window.mediaNetLoaded) return;
    window.mediaNetLoaded = true;

    const script = document.createElement('script');
    script.src = '//cdnv2.media.net/aads/aads.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }, []);

  // Render the ad slot
  useEffect(() => {
    if (!ref.current) return;

    const slotId = `medianet-${sid}`;
    ref.current.id = slotId;

    // Media.net typically uses ins elements with data attributes
    const ins = ref.current.querySelector('ins');
    if (ins) {
      ins.setAttribute('data-media-net-pid', pid);
      ins.setAttribute('data-media-net-sid', sid);
    }

    // Trigger ad request via Media.net API if available
    const timer = setTimeout(() => {
      if (typeof window.mnApi !== 'undefined') {
        (window.mnApi as { requestAd?: (slotId: string) => void }).requestAd?.(sid);
      }
      // Report attempted (not filled — Media.net fires fill events separately)
      onFillChange?.(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [pid, sid, onFillChange]);

  return (
    <div
      ref={ref}
      className={`ad-slot-wrapper ${className}`}
      style={{ minHeight, ...style }}
    >
      {/* Media.net ad container — replace with their actual markup after registration */}
      <ins
        className="adsbymedianet"
        data-media-net-pid={pid}
        data-media-net-sid={sid}
        style={{ display: 'block', width: '100%', minHeight }}
      />
    </div>
  );
}

// Extend Window type
declare global {
  interface Window {
    mediaNetLoaded?: boolean;
    mnApi?: { requestAd?: (slotId: string) => void };
  }
}
