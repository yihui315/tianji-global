'use client';

import { useState } from 'react';

type ServiceType = 'bazi' | 'ziwei' | 'yijing' | 'tarot' | 'fortune' | 'synastry';

interface PDFDownloadButtonProps {
  serviceType: ServiceType;
  resultData: Record<string, unknown>;
  birthData?: {
    birthday?: string;
    birthTime?: string;
    gender?: string;
    name?: string;
  };
  label?: string;
  language?: 'zh' | 'en';
  includeAiInterpretation?: boolean;
  className?: string;
}

export default function PDFDownloadButton({
  serviceType,
  resultData,
  birthData,
  label,
  language = 'zh',
  includeAiInterpretation = true,
  className = '',
}: PDFDownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/report/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType,
          birthData,
          resultData,
          includeAiInterpretation,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error('PDF generation failed');
      }

      const json = await res.json();
      const binaryString = atob(json.pdf);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `TianJiGlobal_${serviceType}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download error:', err);
      alert(language === 'zh' ? 'PDF生成失败' : 'PDF generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold rounded-lg transition-all disabled:opacity-50 ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {loading ? (language === 'zh' ? '生成中...' : 'Generating...') : (label || (language === 'zh' ? '下载PDF' : 'Download PDF'))}
    </button>
  );
}
