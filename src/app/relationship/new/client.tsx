'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoveComplianceFooter } from '@/components/love-reading/LoveComplianceFooter';
import { RelationshipForm } from '@/components/relationship/RelationshipForm';
import { RelationshipResult } from '@/components/relationship/RelationshipResult';
import { trackRevenueFunnelEvent } from '@/lib/analytics/funnel-events';
import { isAppLanguage, type AppLanguage } from '@/lib/language-routing';
import type { RelationshipReading, RelationshipType } from '@/types/relationship';

const copy = {
  en: {
    analyzing: 'Analyzing...',
    title: 'Relationship Compatibility Reading',
    loadingBody: 'Reading the structure and rhythm of this relationship...',
    body: 'Enter two birth profiles to decode compatibility, attraction, communication patterns, and near-term timing.',
    backToNamesPrefix: 'Back to',
    testEyebrow: 'Free Fate Match Test',
    testTitle: 'Not sure yet? Test the signal first.',
    testBody: 'Use two nicknames and one relationship concern before sharing birth details. No payment path is opened.',
    testCta: 'Take Free Fate Match Test',
    back: 'Back',
  },
  zh: {
    analyzing: '分析中...',
    title: '关系合盘分析',
    loadingBody: '基于星盘结构深度解读你们的关系模式...',
    body: '输入两个人的出生信息，AI 解码你们的关系结构、吸引力、沟通方式与未来节律。',
    backToNamesPrefix: '返回',
    testEyebrow: '免费缘分测试',
    testTitle: '还不确定？先测试关系信号。',
    testBody: '先用两个昵称和一个关系问题获取初始判断，再决定是否填写出生细节。不会打开支付路径。',
    testCta: '开始免费缘分测试',
    back: '返回',
  },
} satisfies Record<AppLanguage, Record<string, string>>;

function getLanguage(queryLang: string | null): AppLanguage {
  return isAppLanguage(queryLang) ? queryLang : 'en';
}

export default function RelationshipNewClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const language = getLanguage(searchParams.get('lang'));
  const t = copy[language];
  const [result, setResult] = useState<RelationshipReading | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: {
    relationType: RelationshipType;
    personA: { nickname: string; birthDate: string; birthTime?: string; birthLocation?: string };
    personB: { nickname: string; birthDate: string; birthTime?: string; birthLocation?: string };
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/relationship/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relationType: data.relationType,
          personA: data.personA,
          personB: data.personB,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.error ?? 'Analysis failed');
        return;
      }

      setResult(json.data);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1040 50%, #0a0a1a 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <button
              onClick={() => setResult(null)}
              className="text-xs underline mb-4"
              style={{ color: 'rgba(226,232,240,0.4)' }}
            >
              {t.backToNamesPrefix} {result.personA.nickname} & {result.personB.nickname}
            </button>
          </div>
          <RelationshipResult reading={result} lang={language} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1040 50%, #0a0a1a 100%)' }}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-pink-200/70">TianJi Love</div>
          <h1 className="text-3xl font-serif font-bold mb-2 text-white">
            {isLoading ? t.analyzing : t.title}
          </h1>
          <p className="text-sm" style={{ color: 'rgba(226,232,240,0.55)' }}>
            {isLoading ? t.loadingBody : t.body}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl text-center text-sm"
            style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#F87171' }}>
            {error}
          </div>
        )}

        <div
          className="mb-6 rounded-xl p-5 text-center"
          style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.18)' }}
        >
          <p className="text-xs uppercase tracking-[0.22em]" style={{ color: 'rgba(253,230,138,0.72)' }}>
            {t.testEyebrow}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">{t.testTitle}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6" style={{ color: 'rgba(226,232,240,0.62)' }}>
            {t.testBody}
          </p>
          <Link
            href="/love-test"
            onClick={() =>
              void trackRevenueFunnelEvent('growth_fate_test_cta_click', {
                source: 'relationship_new',
                surface: 'relationship_entry_polish',
                cta: 'free_fate_test',
              })
            }
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-amber-100 px-5 text-sm font-bold text-[#160b14]"
          >
            {t.testCta}
          </Link>
        </div>

        <RelationshipForm onSubmit={handleSubmit} isLoading={isLoading} lang={language} />

        <LoveComplianceFooter language={language} className="mt-6" />

        <div className="text-center mt-8">
          <button
            onClick={() => router.back()}
            className="text-xs"
            style={{ color: 'rgba(226,232,240,0.3)' }}
          >
            {t.back}
          </button>
        </div>
      </div>
    </div>
  );
}
