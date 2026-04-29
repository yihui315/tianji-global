'use client';

/**
 * Global error boundary — last line of defence.
 *
 * This file is rendered when an error escapes both the per-segment
 * `error.tsx` boundaries AND the root layout. Because the root layout has
 * already failed by this point, Next.js requires this component to render
 * its own <html> and <body>.
 *
 * Keep it minimal: no fonts, no providers, no analytics — anything that
 * could fail again would defeat the purpose.
 */

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('[global error boundary]', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          backgroundColor: '#050508',
          color: '#fff',
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 520 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            TianJi · 天机
          </div>
          <h1
            style={{
              marginTop: 24,
              fontSize: 26,
              lineHeight: 1.35,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.88)',
            }}
          >
            Something broke deeply enough that the whole page stopped.
          </h1>
          <p
            style={{
              marginTop: 16,
              fontSize: 14,
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            We have logged the issue. You can try once more, or refresh the page.
            <br />
            <span style={{ color: 'rgba(255,255,255,0.38)' }}>
              页面遇到了严重错误，可以再试一次或刷新。
            </span>
          </p>
          {error?.digest && (
            <p
              style={{
                marginTop: 16,
                fontSize: 11,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)',
              }}
            >
              Error ref · {error.digest}
            </p>
          )}
          <div
            style={{
              marginTop: 32,
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                padding: '12px 24px',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.16)',
                backgroundColor: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.88)',
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Try again · 重试
            </button>
            {/*
              Intentional plain anchor: this boundary fires when the root
              layout itself has crashed, so next/link's router context may
              not be reliably mounted. A hard navigation is the safer fallback.
            */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                padding: '12px 24px',
                borderRadius: 16,
                border: '1px solid rgba(252,211,77,0.3)',
                backgroundColor: 'rgba(252,211,77,0.08)',
                color: 'rgba(254,243,199,0.9)',
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Return home · 回到首页
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
