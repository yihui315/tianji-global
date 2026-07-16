'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const COOKIE_KEY = 'tianji_cookie_consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'rgba(5, 5, 8, 0.97)',
        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
      }}
    >
      <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.75)', flex: 1, minWidth: '240px' }}>
        {'We use cookies to improve your experience and analyze site traffic. '}
        <Link href="/privacy" style={{ color: '#d8b77b', textDecoration: 'underline' }}>Privacy Policy</Link>
      </p>
      <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
        <button
          onClick={() => {
            localStorage.setItem(COOKIE_KEY, 'accepted');
            setVisible(false);
          }}
          style={{
            background: '#d8b77b',
            color: '#050508',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 20px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
