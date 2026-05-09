'use client';

import { useEffect, useState } from 'react';
import { trackClientEvent } from '@/lib/analytics/client';
import type { LoveReport } from '@/lib/love-report-generator';
import type { ReportJobStatus } from '@/lib/report-jobs';

export function ReportJobPoller({ jobId }: { jobId: string }) {
  const [status, setStatus] = useState<ReportJobStatus>('queued');
  const [result, setResult] = useState<LoveReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function poll() {
      try {
        const response = await fetch(`/api/report-jobs/${jobId}`);
        const payload = await response.json();
        if (!active) return;

        if (!response.ok || !payload.success) {
          setError('Unable to load the report yet. Please refresh or contact support.');
          return;
        }

        setStatus(payload.data.status);
        setResult(payload.data.result);

        if (payload.data.status === 'completed') {
          void trackClientEvent({
            event: 'love_report_completed',
            experimentId: 'love-v1',
            moduleType: 'love-reading',
            payload: {
              jobId,
              source: payload.data.result?.generationMeta?.source ?? null,
              model: payload.data.aiModel ?? payload.data.result?.generationMeta?.model ?? null,
              costUSD:
                payload.data.aiCostUSD ?? payload.data.result?.generationMeta?.costUSD ?? null,
            },
          });
        }

        if (!['completed', 'failed'].includes(payload.data.status)) {
          timer = setTimeout(poll, 1500);
        }
      } catch {
        if (active) {
          setError('Unable to load the report yet. Please refresh or contact support.');
        }
      }
    }

    void poll();

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [jobId]);

  if (error) {
    return <p className="text-sm text-rose-100">{error}</p>;
  }

  if (status === 'failed') {
    return (
      <p className="text-sm text-rose-100">
        We could not generate the report yet. Please refresh or contact support; your order is still safe.
      </p>
    );
  }

  if (status !== 'completed' || !result) {
    return <p className="text-sm text-white/60">Generating your report...</p>;
  }

  return (
    <section className="grid gap-4">
      <h2 className="text-2xl font-semibold">Full report</h2>
      <p>{result.summary}</p>
      <p>{result.karmicPatterns}</p>
      <p>{result.relationshipDynamics}</p>
      <p>{result.futureTiming}</p>
      <p>{result.emotionalCompatibility}</p>
      <ul className="list-disc space-y-2 pl-5">
        {result.actionableGuidance.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p>{result.privateReportLink}</p>
      <p className="text-sm text-white/50">{result.disclaimer}</p>
    </section>
  );
}
