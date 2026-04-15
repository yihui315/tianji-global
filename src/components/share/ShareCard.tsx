'use client';

/**
 * ShareCard — 社交分享卡片生成器
 *
 * 功能:
 * 1. 生成精美的占卜结果分享卡片
 * 2. 支持多种样式模板
 * 3. 下载为图片/PDF
 * 4. 一键分享到社交媒体
 */

import React, { useState, useRef, useEffect } from 'react';

type CardStyle = 'cosmic' | 'elegant' | 'minimal' | 'gradient' | 'mystic';
type FortuneType = 'bazi' | 'ziwei' | 'tarot' | 'yijing' | 'western';

interface ShareCardProps {
  fortuneType: FortuneType;
  title: string;
  subtitle?: string;
  score?: number;
  element?: string;
  date?: string;
  style?: CardStyle;
  language?: 'zh' | 'en';
  onShare?: (blob: Blob) => void;
}

const CARD_PRESETS: Record<CardStyle, {
  bg: string;
  accent: string;
  fontFamily: string;
  borderRadius: string;
}> = {
  cosmic: {
    bg: 'linear-gradient(135deg, #0a0a1e 0%, #1a1a3e 50%, #2d1b4e 100%)',
    accent: '#A782FF',
    fontFamily: 'serif',
    borderRadius: '16px'
  },
  elegant: {
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    accent: '#F59E0B',
    fontFamily: 'sans-serif',
    borderRadius: '12px'
  },
  minimal: {
    bg: 'rgba(10, 10, 30, 0.9)',
    accent: '#EC4899',
    fontFamily: 'monospace',
    borderRadius: '8px'
  },
  gradient: {
    bg: 'linear-gradient(120deg, #7C3AED 0%, #A782FF 50%, #EC4899 100%)',
    accent: '#FFFFFF',
    fontFamily: 'system-ui',
    borderRadius: '20px'
  },
  mystic: {
    bg: 'linear-gradient(180deg, #030014 0%, #1a0a3e 100%)',
    accent: '#10B981',
    fontFamily: 'serif',
    borderRadius: '24px'
  }
};

const FORTUNE_LABELS: Record<FortuneType, Record<'zh' | 'en', string>> = {
  bazi: { zh: '八字命理', en: 'Ba Zi Fortune' },
  ziwei: { zh: '紫微斗数', en: 'Zi Wei Astrology' },
  tarot: { zh: '塔罗占卜', en: 'Tarot Reading' },
  yijing: { zh: '易经六爻', en: 'Yi Jing' },
  western: { zh: '西方占星', en: 'Western Astrology' }
};

const ELEMENT_ICONS: Record<string, string> = {
  '木': '🌿',
  '火': '🔥',
  '土': '🏔️',
  '金': '⚔️',
  '水': '🌊',
  'default': '✨'
};

export default function ShareCard({
  fortuneType,
  title,
  subtitle,
  score,
  element,
  date,
  style = 'cosmic',
  language = 'zh',
  onShare
}: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [generating, setGenerating] = useState(false);
  const preset = CARD_PRESETS[style];

  const label = FORTUNE_LABELS[fortuneType][language];
  const elementIcon = ELEMENT_ICONS[element || 'default'];

  const generateCardImage = async (): Promise<Blob | null> => {
    if (!canvasRef.current) return null;
    setGenerating(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Canvas size: 1200x630 (Open Graph optimized)
      canvas.width = 1200;
      canvas.height = 630;

      // Background
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 630);
      if (style === 'gradient') {
        bgGrad.addColorStop(0, '#7C3AED');
        bgGrad.addColorStop(0.5, '#A782FF');
        bgGrad.addColorStop(1, '#EC4899');
      } else if (style === 'cosmic') {
        bgGrad.addColorStop(0, '#0a0a1e');
        bgGrad.addColorStop(0.5, '#1a1a3e');
        bgGrad.addColorStop(1, '#2d1b4e');
      } else if (style === 'elegant') {
        bgGrad.addColorStop(0, '#1a1a2e');
        bgGrad.addColorStop(1, '#16213e');
      } else if (style === 'mystic') {
        bgGrad.addColorStop(0, '#030014');
        bgGrad.addColorStop(1, '#1a0a3e');
      } else {
        bgGrad.addColorStop(0, '#0a0a1e');
        bgGrad.addColorStop(1, '#0a0a1e');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 630);

      // Decorative circles
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = preset.accent;
      ctx.beginPath();
      ctx.arc(100, 100, 200, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(1100, 530, 180, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Border decoration
      ctx.strokeStyle = `${preset.accent}40`;
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 30, 1140, 570);

      // Fortune type label
      ctx.font = '500 22px sans-serif';
      ctx.fillStyle = preset.accent;
      ctx.textAlign = 'left';
      ctx.fillText(label, 60, 80);

      // Title
      ctx.font = `bold 72px ${preset.fontFamily}`;
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.fillText(title, 600, 280);

      // Subtitle
      if (subtitle) {
        ctx.font = '400 28px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText(subtitle, 600, 340);
      }

      // Score (if provided)
      if (score !== undefined) {
        // Score circle background
        ctx.fillStyle = `${preset.accent}20`;
        ctx.beginPath();
        ctx.arc(600, 440, 60, 0, Math.PI * 2);
        ctx.fill();

        // Score text
        ctx.font = 'bold 48px sans-serif';
        ctx.fillStyle = preset.accent;
        ctx.textAlign = 'center';
        ctx.fillText(`${score}`, 600, 455);
        ctx.font = '400 18px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('/ 100', 600, 485);
      }

      // Element icon and text
      if (element) {
        ctx.font = '64px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(elementIcon, 1100, 100);
        ctx.font = '400 24px sans-serif';
        ctx.fillStyle = preset.accent;
        ctx.fillText(`${language === 'zh' ? '五行' : 'Element'}: ${element}`, 1080, 140);
      }

      // Date
      if (date) {
        ctx.font = '400 20px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.textAlign = 'center';
        ctx.fillText(date, 600, 580);
      }

      // Watermark
      ctx.font = '400 18px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.textAlign = 'right';
      ctx.fillText('TianJi Global | 天机全球', 1140, 600);

      // Convert to blob
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          setGenerating(false);
          resolve(blob);
        }, 'image/png', 1.0);
      });
    } catch (error) {
      setGenerating(false);
      console.error('Error generating card:', error);
      return null;
    }
  };

  const handleDownload = async () => {
    const blob = await generateCardImage();
    if (blob && onShare) {
      onShare(blob);
    }

    // Auto download
    const blob2 = await generateCardImage();
    if (blob2) {
      const url = URL.createObjectURL(blob2);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tianji-${fortuneType}-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleCopyToClipboard = async () => {
    const blob = await generateCardImage();
    if (blob) {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        alert(language === 'zh' ? '已复制到剪贴板！' : 'Copied to clipboard!');
      } catch (err) {
        console.error('Copy failed:', err);
      }
    }
  };

  // Generate preview
  useEffect(() => {
    if (previewMode && canvasRef.current) {
      generateCardImage();
    }
  }, [previewMode, title, subtitle, score, element, style, language]);

  return (
    <div className="share-card-generator">
      {/* Preview Canvas */}
      <div className="card-preview">
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            maxWidth: '600px',
            borderRadius: preset.borderRadius,
            display: previewMode ? 'block' : 'none'
          }}
        />

        {/* Static preview (when not generating) */}
        {!previewMode && (
          <div
            className="preview-placeholder"
            style={{
              background: preset.bg,
              borderRadius: preset.borderRadius,
              padding: '40px',
              textAlign: 'center'
            }}
          >
            <div style={{ color: preset.accent, fontSize: '22px', marginBottom: '16px' }}>
              {label}
            </div>
            <div style={{ color: 'white', fontSize: '36px', fontWeight: 'bold', marginBottom: '12px' }}>
              {title}
            </div>
            {subtitle && (
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px' }}>
                {subtitle}
              </div>
            )}
            {score !== undefined && (
              <div style={{ color: preset.accent, fontSize: '48px', fontWeight: 'bold', marginTop: '20px' }}>
                {score}/100
              </div>
            )}
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', marginTop: '40px' }}>
              TianJi Global | 天机全球
            </div>
          </div>
        )}
      </div>

      {/* Style Selector */}
      <div className="style-selector">
        <span className="selector-label">
          {language === 'zh' ? '卡片风格' : 'Card Style'}
        </span>
        <div className="style-options">
          {(['cosmic', 'elegant', 'minimal', 'gradient', 'mystic'] as CardStyle[]).map((s) => (
            <button
              key={s}
              className={`style-btn ${style === s ? 'active' : ''}`}
              onClick={() => setPreviewMode(true)}
            >
              <div
                className="style-preview"
                style={{ background: CARD_PRESETS[s].bg }}
              />
              <span>{s}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="card-actions">
        <button
          className="action-btn primary"
          onClick={handleDownload}
          disabled={generating}
        >
          {generating
            ? (language === 'zh' ? '生成中...' : 'Generating...')
            : (language === 'zh' ? '📥 下载图片' : '📥 Download')}
        </button>

        <button
          className="action-btn secondary"
          onClick={handleCopyToClipboard}
          disabled={generating}
        >
          {language === 'zh' ? '📋 复制' : '📋 Copy'}
        </button>

        <button
          className="action-btn secondary"
          onClick={() => setPreviewMode(!previewMode)}
        >
          {previewMode
            ? (language === 'zh' ? '隐藏预览' : 'Hide Preview')
            : (language === 'zh' ? '👁️ 预览' : '👁️ Preview')}
        </button>
      </div>

      {/* Share buttons */}
      <div className="social-share">
        <button className="share-btn twitter">
          𝕏 Twitter
        </button>
        <button className="share-btn facebook">
          f Facebook
        </button>
        <button className="share-btn wechat">
          💬 WeChat
        </button>
      </div>

      <style jsx>{`
        .share-card-generator {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 24px;
          background: rgba(255,255,255,0.03);
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .card-preview {
          display: flex;
          justify-content: center;
        }
        .preview-placeholder {
          width: 100%;
          max-width: 600px;
        }
        .style-selector {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .selector-label {
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .style-options {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .style-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px;
          border: 2px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s;
        }
        .style-btn:hover {
          border-color: rgba(255,255,255,0.3);
        }
        .style-btn.active {
          border-color: #A782FF;
        }
        .style-preview {
          width: 48px;
          height: 32px;
          border-radius: 4px;
        }
        .style-btn span {
          font-size: 10px;
          color: rgba(255,255,255,0.6);
          text-transform: capitalize;
        }
        .card-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .action-btn {
          flex: 1;
          padding: 12px 20px;
          border-radius: 12px;
          border: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .action-btn.primary {
          background: linear-gradient(135deg, #7C3AED, #A782FF);
          color: white;
        }
        .action-btn.primary:hover:not(:disabled) {
          transform: scale(1.02);
        }
        .action-btn.secondary {
          background: rgba(255,255,255,0.1);
          color: white;
        }
        .action-btn.secondary:hover:not(:disabled) {
          background: rgba(255,255,255,0.15);
        }
        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .social-share {
          display: flex;
          gap: 8px;
        }
        .share-btn {
          flex: 1;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: white;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .share-btn:hover {
          background: rgba(255,255,255,0.1);
        }
        .share-btn.twitter { border-color: #1DA1F2; }
        .share-btn.facebook { border-color: #4267B2; }
        .share-btn.wechat { border-color: #07C160; }
      `}</style>
    </div>
  );
}