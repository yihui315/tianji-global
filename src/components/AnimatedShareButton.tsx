'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedShareButtonProps {
  type: 'ziwei' | 'tarot' | 'bazi' | 'synastry';
  resultData: Record<string, unknown>;
  format?: 'gif' | 'webp' | 'png';
  language?: 'zh' | 'en';
  variant?: 'primary' | 'secondary';
}

export default function AnimatedShareButton({
  type,
  resultData,
  format = 'webp',
  language = 'zh',
  variant = 'primary',
}: AnimatedShareButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setProgress(10);

    try {
      setProgress(30);
      const response = await fetch('/api/share/animated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, resultData, format, animated: true }),
      });

      setProgress(70);

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const { url } = await response.json();
      setProgress(90);

      if (!url) {
        throw new Error('No URL returned from server');
      }

      // Trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `tianji-${type}-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setProgress(100);
      setIsOpen(false);
    } catch (err) {
      console.error('[AnimatedShareButton] Generation failed:', err);
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  }, [type, resultData, format]);

  const buttonLabels = {
    primary: {
      idle: language === 'zh' ? '✨ 生成动画' : '✨ Generate Animation',
      loading: language === 'zh' ? '生成中...' : 'Generating...',
    },
    secondary: {
      idle: language === 'zh' ? '动画分享' : 'Animated Share',
      loading: language === 'zh' ? '生成中...' : 'Generating...',
    },
  };

  const labels = buttonLabels[variant];

  const baseButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 20px',
    borderRadius: 8,
    border: 'none',
    cursor: isGenerating ? 'not-allowed' : 'pointer',
    fontSize: 14,
    fontWeight: 600,
    transition: 'all 0.2s ease',
    opacity: isGenerating ? 0.7 : 1,
  };

  const primaryStyle: React.CSSProperties = {
    ...baseButtonStyle,
    background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
  };

  const secondaryStyle: React.CSSProperties = {
    ...baseButtonStyle,
    background: 'rgba(124, 58, 237, 0.15)',
    color: '#a78bfa',
    border: '1px solid rgba(124, 58, 237, 0.3)',
  };

  const style = variant === 'primary' ? primaryStyle : secondaryStyle;

  return (
    <>
      <motion.button
        onClick={() => !isGenerating && setIsOpen(true)}
        style={style}
        whileHover={!isGenerating ? { scale: 1.02, boxShadow: '0 6px 16px rgba(124, 58, 237, 0.4)' } : {}}
        whileTap={!isGenerating ? { scale: 0.98 } : {}}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'inline-block', width: 16, height: 16 }}
            >
              ↻
            </motion.span>
            {labels.loading}
          </>
        ) : (
          <>
            <span style={{ fontSize: 16 }}>✨</span>
            {labels.idle}
          </>
        )}
      </motion.button>

      {/* Options Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                backgroundColor: '#1e1e2e',
                borderRadius: 16,
                padding: 32,
                maxWidth: 400,
                width: '100%',
                border: '1px solid #334155',
              }}
            >
              <h3 style={{ color: '#E2E8F0', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 }}>
                {language === 'zh' ? '✨ 生成动画分享图' : '✨ Generate Animated Share Image'}
              </h3>

              {/* Format Selection */}
              <div style={{ marginBottom: 24 }}>
                <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 12 }}>
                  {language === 'zh' ? '选择格式' : 'Select Format'}
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  {(['webp', 'gif', 'png'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => handleGenerate()}
                      style={{
                        flex: 1,
                        padding: '12px 8px',
                        borderRadius: 8,
                        border: `1px solid ${format === fmt ? '#7C3AED' : '#334155'}`,
                        background: format === fmt ? 'rgba(124,58,237,0.2)' : 'transparent',
                        color: format === fmt ? '#a78bfa' : '#94A3B8',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 600,
                        transition: 'all 0.2s',
                      }}
                    >
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generation progress */}
              {isGenerating && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ height: 4, background: '#334155', borderRadius: 2, overflow: 'hidden' }}>
                    <motion.div
                      animate={{ width: `${progress}%` }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', borderRadius: 2 }}
                    />
                  </div>
                  <p style={{ color: '#64748B', fontSize: 12, textAlign: 'center', marginTop: 8 }}>
                    {language === 'zh' ? `生成中... ${progress}%` : `Generating... ${progress}%`}
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{ marginBottom: 24, padding: 12, background: 'rgba(239,68,68,0.1)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)' }}>
                  <p style={{ color: '#EF4444', fontSize: 13 }}>{error}</p>
                </div>
              )}

              {/* Cancel */}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 8,
                  border: '1px solid #334155',
                  background: 'transparent',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                {language === 'zh' ? '取消' : 'Cancel'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
