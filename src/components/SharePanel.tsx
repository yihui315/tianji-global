'use client';

import { useState, useCallback, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface SharePanelProps {
  serviceType: string;
  resultId: string;
  shareUrl: string;
}

export default function SharePanel({ serviceType, resultId, shareUrl }: SharePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showWechatTip, setShowWechatTip] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  const handleDownloadQR = useCallback(() => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 400, 400);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `tianji-${serviceType}-qr.png`;
        link.href = pngUrl;
        link.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }, [serviceType]);

  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('我的' + getServiceName(serviceType) + '命理结果 - TianJi Global')}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent('我的' + getServiceName(serviceType) + '命理结果: ' + shareUrl)}`;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="mt-6 w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-semibold text-base transition-all"
      >
        分享结果
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div
            style={{
              backgroundColor: '#1e1e2e',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '420px',
              width: '100%',
              border: '1px solid #334155',
              position: 'relative',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                fontSize: '24px',
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              ×
            </button>

            {/* Title */}
            <h3
              style={{
                color: '#E2E8F0',
                fontSize: '22px',
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: '24px',
              }}
            >
              分享结果
            </h3>

            {/* QR Code */}
            <div
              ref={qrRef}
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '24px',
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '16px',
              }}
            >
              <QRCodeSVG value={shareUrl} size={180} level="H" />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <button
                onClick={handleCopyLink}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: copied ? '#10B981' : '#7C3AED',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
              >
                {copied ? '已复制 ✓' : '复制链接'}
              </button>

              <button
                onClick={handleDownloadQR}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  backgroundColor: 'transparent',
                  color: '#E2E8F0',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#7C3AED';
                  e.currentTarget.style.backgroundColor = 'rgba(124,58,237,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#334155';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                下载二维码
              </button>
            </div>

            {/* Platform Links */}
            <div>
              <p
                style={{
                  color: '#64748B',
                  fontSize: '14px',
                  textAlign: 'center',
                  marginBottom: '16px',
                }}
              >
                分享到
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '16px',
                }}
              >
                {/* WeChat */}
                <div style={{ position: 'relative' }}>
                  <button
                    onMouseEnter={() => setShowWechatTip(true)}
                    onMouseLeave={() => setShowWechatTip(false)}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      border: '1px solid #334155',
                      backgroundColor: '#07C160',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '24px',
                    }}
                  >
                    💬
                  </button>
                  {showWechatTip && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '56px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#1e1e2e',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: '#E2E8F0',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        zIndex: 10,
                      }}
                    >
                      请使用二维码分享
                    </div>
                  )}
                </div>

                {/* Twitter/X */}
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    border: '1px solid #334155',
                    backgroundColor: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '22px',
                    textDecoration: 'none',
                  }}
                >
                  𝕏
                </a>

                {/* WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    border: '1px solid #334155',
                    backgroundColor: '#25D366',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '24px',
                    textDecoration: 'none',
                  }}
                >
                  📱
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function getServiceName(serviceType: string): string {
  const names: Record<string, string> = {
    bazi: '八字',
    tarot: '塔罗牌',
    yijing: '易经',
    ziwei: '紫微斗数',
    western: '西方占星',
  };
  return names[serviceType] || '命理';
}
