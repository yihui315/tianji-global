'use client';

import { useState } from 'react';
import { Check, ThumbsUp } from 'lucide-react';

export function FeedbackButtons({
  reportId,
  actionId,
}: {
  reportId?: string;
  actionId?: string;
}) {
  const [status, setStatus] = useState<'idle' | 'helpful' | 'executed' | 'error'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function sendFeedback(input: { helpful?: boolean; executed?: boolean }) {
    if (!reportId) return;
    setIsSubmitting(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/remedies/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId,
          actionId,
          ...input,
        }),
      });

      if (!response.ok) throw new Error('feedback_failed');
      setStatus(input.executed ? 'executed' : 'helpful');
    } catch {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <button
        type="button"
        title="有帮助"
        disabled={isSubmitting || !reportId}
        onClick={() => sendFeedback({ helpful: true })}
        className="inline-flex h-9 items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3 text-xs font-semibold text-white/72 transition hover:border-emerald-200/50 hover:text-emerald-100 disabled:cursor-not-allowed disabled:opacity-45"
      >
        <ThumbsUp className="h-4 w-4" aria-hidden="true" />
        有帮助
      </button>
      <button
        type="button"
        title="已执行"
        disabled={isSubmitting || !reportId}
        onClick={() => sendFeedback({ executed: true })}
        className="inline-flex h-9 items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3 text-xs font-semibold text-white/72 transition hover:border-amber-200/50 hover:text-amber-100 disabled:cursor-not-allowed disabled:opacity-45"
      >
        <Check className="h-4 w-4" aria-hidden="true" />
        已执行
      </button>
      <span className="min-h-5 text-xs text-white/45" aria-live="polite">
        {status === 'helpful' && '已记录'}
        {status === 'executed' && '已记录执行'}
        {status === 'error' && '暂时无法记录'}
      </span>
    </div>
  );
}
