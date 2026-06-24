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
    namePlaceholder: 'Your name (optional)',
    emailPlaceholder: 'your@email.com',
    cta: 'Subscribe',
    loading: 'Subscribing…',
    consentLabel:
      'I agree to receive weekly love insights and content updates from Tianji Love. I can unsubscribe anytime.',
    successTitle: "You're in!",
    successBody:
      'Check your inbox for a welcome message. Expect insights every week.',
    errorTitle: 'Something went wrong',
    errorBody: 'Please try again in a moment.',
    invalidEmail: 'Please enter a valid email address.',
    consentRequired: 'You must agree to receive updates to subscribe.',
  },
  zh: {
    title: '接收每周爱情灵感',
    namePlaceholder: '你的名字（选填）',
    emailPlaceholder: 'your@email.com',
    cta: '订阅',
    loading: '订阅中…',
    consentLabel: '我同意接收来自天机乐爱的每周爱情灵感与内容更新。可随时取消订阅。',
    successTitle: '订阅成功！',
    successBody: '请查收欢迎邮件。每周都会收到爱情灵感。',
    errorTitle: '出了点问题',
    errorBody: '请稍后再试。',
    invalidEmail: '请输入有效的电子邮箱地址。',
    consentRequired: '请勾选同意接收更新后才能订阅。',
  },
} as const;

type Status = 'idle' | 'loading' | 'success' | 'error';

export function LeadCaptureForm({ sourcePage, variant = 'default' }: LeadCaptureFormProps) {
  const { lang } = useLanguage();
  const searchParams = useSearchParams();
  const copy = lang === 'zh' ? COPY.zh : COPY.en;
  const locale = lang === 'zh' ? 'zh-CN' : 'en';
  const viewedRef = useRef(false);

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
      payload: { source_page: sourcePage, variant, locale },
    });
  }, [sourcePage, variant, locale]);

  const [emailError, setEmailError] = useState('');
  const [consentError, setConsentError] = useState('');

  const utmSource = searchParams.get('utm_source') ?? '';
  const utmMedium = searchParams.get('utm_medium') ?? '';
  const utmCampaign = searchParams.get('utm_campaign') ?? '';
  const utmContent = searchParams.get('utm_content') ?? '';
  const utmTerm = searchParams.get('utm_term') ?? '';

  function validateEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  async function handleSubmit(e: React.FormEvent) {
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
          locale,
          source_page: sourcePage,
          variant,
          utm_source: utmSource || undefined,
          utm_medium: utmMedium || undefined,
          utm_campaign: utmCampaign || undefined,
          utm_content: utmContent || undefined,
          utm_term: utmTerm || undefined,
          consent: true,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus('error');
        void trackClientEvent({
          event: 'lead_capture_failed',
          moduleType: 'marketing',
          payload: { source_page: sourcePage, variant, locale, reason: 'api_error' },
        });
        return;
      }

      setStatus('success');
      void trackClientEvent({
        event: 'lead_capture_submitted',
        moduleType: 'marketing',
        payload: { source_page: sourcePage, variant, locale },
      });
    } catch {
      setStatus('error');
      void trackClientEvent({
        event: 'lead_capture_failed',
        moduleType: 'marketing',
        payload: { source_page: sourcePage, variant, locale, reason: 'network_error' },
      });
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
        <p className="text-base font-medium text-white/90">{copy.successTitle}</p>
        <p className="text-sm text-white/60">{copy.successBody}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm"
      noValidate
    >
      <p className="text-sm font-medium text-white/80">{copy.title}</p>

      <input
        type="text"
        placeholder={copy.namePlaceholder}
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-amber-200/40 focus:ring-1 focus:ring-amber-200/20"
        disabled={status === 'loading'}
        autoComplete="name"
      />

      <div className="flex flex-col gap-1">
        <input
          type="email"
          placeholder={copy.emailPlaceholder}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError('');
          }}
          className={`w-full rounded-xl border ${
            emailError ? 'border-red-400/50' : 'border-white/10'
          } bg-white/[0.06] px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-amber-200/40 focus:ring-1 focus:ring-amber-200/20`}
          disabled={status === 'loading'}
          autoComplete="email"
          required
        />
        {emailError && (
          <p className="px-1 text-xs text-red-400/80">{emailError}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              setConsentError('');
            }}
            disabled={status === 'loading'}
            className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-white/20 bg-white/[0.06] accent-amber-200"
          />
          <span className="text-xs leading-snug text-white/50">{copy.consentLabel}</span>
        </label>
        {consentError && (
          <p className="px-1 text-xs text-red-400/80">{consentError}</p>
        )}
      </div>

      {status === 'error' && (
        <div className="rounded-lg border border-red-400/20 bg-red-400/5 px-4 py-2.5">
          <p className="text-xs font-medium text-red-400/90">{copy.errorTitle}</p>
          <p className="mt-0.5 text-xs text-red-400/70">{copy.errorBody}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full cursor-pointer rounded-xl bg-gradient-to-br from-amber-100 to-white py-2.5 text-sm font-semibold text-black transition hover:from-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === 'loading' ? copy.loading : copy.cta}
      </button>
    </form>
  );
}
