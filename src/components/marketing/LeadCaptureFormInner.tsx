'use client';

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useSearchParams } from 'next/navigation';
import { trackClientEvent } from '@/lib/analytics/client';

type LeadCaptureFormProps = {
  sourcePage: string;
  variant?: string;
};

const COPY = {
  en: {
    title: 'Get weekly love insights',
    description: 'Join readers receiving practical love pattern breakdowns every week.',
    placeholder: 'your@email.com',
    button: 'Subscribe',
    subscribing: 'Subscribing...',
    success: "You're in! Check your inbox for a welcome message.",
    error: 'Something went wrong. Please try again.',
    consent: 'I agree to receive weekly love insights from Tianji Love. No spam, unsubscribe anytime.',
    consentRequired: 'Please agree to receive emails.',
    invalidEmail: 'Please enter a valid email address.',
  },
  zh: {
    title: '每周获取感情洞察',
    description: '加入读者社群，每周收到实用的感情模式分析。',
    placeholder: 'your@email.com',
    button: '订阅',
    subscribing: '订阅中...',
    success: '订阅成功！我们已发送欢迎邮件到您的收件箱。',
    error: '出了点问题，请重试。',
    consent: '我同意接收来自 Tianji Love 的每周感情洞察邮件。随时可取消订阅。',
    consentRequired: '请勾选同意接收邮件。',
    invalidEmail: '请输入有效的邮箱地址。',
  },
} as const;

type Status = 'idle' | 'loading' | 'success' | 'error';

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function LeadCaptureFormInner({ sourcePage, variant = 'default' }: LeadCaptureFormProps) {
  const lang = useLanguage();
  const searchParams = useSearchParams();
  const copy = lang === 'zh' ? COPY.zh : COPY.en;
  const viewedRef = useRef(false);

  const utmSource = searchParams.get('utm_source');
  const utmMedium = searchParams.get('utm_medium');
  const utmCampaign = searchParams.get('utm_campaign');
  const utmContent = searchParams.get('utm_content');
  const utmTerm = searchParams.get('utm_term');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>('idle');

  // Fire-and-forget: lead_capture_viewed on mount (once)
  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    void trackClientEvent({
      event: 'lead_capture_viewed',
      moduleType: 'marketing',
      payload: { source_page: sourcePage, variant, locale: lang },
    });
  }, [sourcePage, variant, lang]);

  const [emailError, setEmailError] = useState('');
  const [consentError, setConsentError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setConsentError('');

    if (!validateEmail(email)) {
      setEmailError(copy.invalidEmail);
      return;
    }
    if (!consent) {
      setConsentError(copy.consentRequired);
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch('/api/marketing/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name || undefined,
          locale: lang,
          source_page: sourcePage,
          variant,
          utm_source: utmSource || undefined,
          utm_medium: utmMedium || undefined,
          utm_campaign: utmCampaign || undefined,
          consent: true,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus('error');
        void trackClientEvent({
          event: 'lead_capture_failed',
          moduleType: 'marketing',
          payload: { source_page: sourcePage, variant, locale: lang, reason: 'api_error' },
        });
        return;
      }

      setStatus('success');
      void trackClientEvent({
        event: 'lead_capture_submitted',
        moduleType: 'marketing',
        payload: { source_page: sourcePage, variant, locale: lang },
      });
    } catch {
      setStatus('error');
      void trackClientEvent({
        event: 'lead_capture_failed',
        moduleType: 'marketing',
        payload: { source_page: sourcePage, variant, locale: lang, reason: 'network_error' },
      });
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-lg border border-[#b57248]/32 bg-[#1a0e0a]/70 p-6 text-center">
        <p className="text-[#ffe3b4]">{copy.success}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-[#b57248]/32 bg-[#1a0e0a]/60 p-6"
      noValidate
    >
      <p className="mb-1 font-serif text-lg text-[#ffe3b4]">{copy.title}</p>
      <p className="mb-4 text-sm text-[#d8b77b]/72">{copy.description}</p>

      <div className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={copy.placeholder}
          required
          disabled={status === 'loading'}
          className="w-full rounded border border-[#b57248]/42 bg-[#0d0707]/82 px-4 py-2.5 text-sm text-[#f4d7a3] placeholder-[#d8b77b]/52 outline-none focus:border-[#b57248]/82 focus:ring-1 focus:ring-[#b57248]/42 disabled:opacity-50"
        />
        {emailError && (
          <p role="alert" className="text-xs text-red-400">{emailError}</p>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full rounded bg-[#ff6c73] py-2.5 text-sm font-semibold text-white transition hover:bg-[#ff6c73]/90 disabled:opacity-50"
        >
          {status === 'loading' ? copy.subscribing : copy.button}
        </button>

        <label className="flex items-start gap-2.5 text-left">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 shrink-0 rounded border-[#b57248]/42 accent-[#ff6c73]"
          />
          <span className="text-xs leading-relaxed text-[#d8b77b]/72">{copy.consent}</span>
        </label>
        {consentError && (
          <p role="alert" className="text-xs text-red-400">{consentError}</p>
        )}

        {status === 'error' && (
          <p role="alert" className="text-sm text-red-400">{copy.error}</p>
        )}
      </div>
    </form>
  );
}
