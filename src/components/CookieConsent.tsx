'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CONSENT_CHANGE_EVENT,
  CONSENT_STORAGE_KEY,
  DEFAULT_CONSENT_PREFERENCES,
  createConsentPreferences,
  parseConsentPreferences,
  serializeConsentPreferences,
  type ConsentPreferences,
} from '@/lib/consent';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const panelStyle = {
  background: 'rgba(5, 5, 8, 0.98)',
  border: '1px solid rgba(255, 255, 255, 0.14)',
  color: 'white',
} as const;

function applyConsent(preferences: ConsentPreferences) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || ((...args: unknown[]) => window.dataLayer?.push(args));
  window.gtag('consent', 'update', {
    analytics_storage: preferences.analytics ? 'granted' : 'denied',
  });
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: preferences }));
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [managing, setManaging] = useState(false);
  const [preferences, setPreferences] = useState(DEFAULT_CONSENT_PREFERENCES);

  useEffect(() => {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    const stored = parseConsentPreferences(raw);

    if (stored) {
      setPreferences(stored);
      applyConsent(stored);
      if (raw === 'accepted') {
        localStorage.setItem(CONSENT_STORAGE_KEY, serializeConsentPreferences(stored));
      }
      return;
    }

    applyConsent(DEFAULT_CONSENT_PREFERENCES);
    setVisible(true);
  }, []);

  const save = (analytics: boolean) => {
    const next = createConsentPreferences(analytics);
    localStorage.setItem(CONSENT_STORAGE_KEY, serializeConsentPreferences(next));
    setPreferences(next);
    applyConsent(next);
    setManaging(false);
    setVisible(false);
  };

  return (
    <>
      {visible ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Cookie consent"
          style={{
            ...panelStyle,
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            borderLeft: 0,
            borderRight: 0,
            borderBottom: 0,
            padding: '18px 24px',
          }}
        >
          <div style={{ margin: '0 auto', display: 'flex', maxWidth: '1180px', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
            <p style={{ margin: 0, minWidth: '260px', flex: 1, fontSize: '13px', lineHeight: 1.6, color: 'rgba(255,255,255,0.76)' }}>
              Necessary cookies keep the site working. Analytics is off by default. Advertising remains disabled in this panel and, if enabled, is controlled only by a Google-certified consent provider.{' '}
              <Link href="/legal/privacy" style={{ color: '#d8b77b', textDecoration: 'underline' }}>Privacy Policy</Link>
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => save(false)} className="consent-secondary-button">
                Reject non-essential
              </button>
              <button type="button" onClick={() => setManaging(true)} className="consent-secondary-button">
                Manage options
              </button>
              <button type="button" onClick={() => save(true)} className="consent-primary-button">
                Accept analytics
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setManaging(true)}
          className="consent-settings-button"
          aria-label="Open privacy settings"
        >
          Privacy settings
        </button>
      )}

      {managing ? (
        <div className="consent-modal-backdrop" role="presentation">
          <div role="dialog" aria-modal="true" aria-label="Manage cookie preferences" className="consent-modal">
            <h2 style={{ margin: 0, color: '#ffe3b4', fontSize: '22px' }}>Manage options</h2>
            <p style={{ color: 'rgba(255,255,255,0.68)', fontSize: '13px', lineHeight: 1.6 }}>
              Change or withdraw optional consent at any time. Necessary storage cannot be disabled because it supports security and core site functions.
            </p>
            <ConsentToggle label="Necessary" description="Security, session, language, and consent records." checked disabled onChange={() => undefined} />
            <ConsentToggle
              label="Analytics"
              description="Helps us understand aggregate site usage."
              checked={preferences.analytics}
              onChange={(analytics) => setPreferences((current) => ({ ...current, analytics }))}
            />
            <div style={{ padding: '14px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <strong style={{ display: 'block', color: '#ffe3b4', fontSize: '14px' }}>Advertising</strong>
              <span style={{ display: 'block', marginTop: '4px', color: 'rgba(255,255,255,0.55)', fontSize: '12px', lineHeight: 1.5 }}>
                Advertising cannot be enabled here. A Google-certified consent provider is the only interface allowed to grant advertising and TCF consent.
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => save(false)} className="consent-secondary-button">
                Reject non-essential
              </button>
              <button type="button" onClick={() => save(preferences.analytics)} className="consent-primary-button">
                Save choices
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <style jsx global>{`
        .consent-primary-button,
        .consent-secondary-button,
        .consent-settings-button {
          min-height: 40px;
          border-radius: 7px;
          padding: 9px 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .consent-primary-button { border: 1px solid #d8b77b; background: #d8b77b; color: #050508; }
        .consent-secondary-button { border: 1px solid rgba(216,183,123,0.48); background: transparent; color: #f4d7a3; }
        .consent-settings-button { position: fixed; right: 14px; bottom: 14px; z-index: 9998; border: 1px solid rgba(216,183,123,0.42); background: rgba(5,5,8,0.92); color: #f4d7a3; }
        .consent-modal-backdrop { position: fixed; inset: 0; z-index: 10000; display: grid; place-items: center; padding: 20px; background: rgba(0,0,0,0.72); }
        .consent-modal { width: min(520px, 100%); border: 1px solid rgba(216,183,123,0.3); border-radius: 14px; background: #08090d; padding: 24px; color: white; box-shadow: 0 24px 80px rgba(0,0,0,0.5); }
      `}</style>
    </>
  );
}

function ConsentToggle({
  label,
  description,
  checked,
  disabled = false,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label style={{ display: 'flex', justifyContent: 'space-between', gap: '18px', padding: '14px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
      <span>
        <strong style={{ display: 'block', color: '#ffe3b4', fontSize: '14px' }}>{label}</strong>
        <span style={{ display: 'block', marginTop: '4px', color: 'rgba(255,255,255,0.55)', fontSize: '12px', lineHeight: 1.5 }}>{description}</span>
      </span>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} style={{ width: '20px', height: '20px', accentColor: '#d8b77b' }} />
    </label>
  );
}
