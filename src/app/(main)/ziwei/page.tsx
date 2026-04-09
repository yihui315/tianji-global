'use client';

import { useState, useCallback } from 'react';
import { Iztrolabe } from 'react-iztro';
import ZiWeiPalaceAnimation from '@/components/animations/ZiWeiPalaceAnimation';
import AnimatedShareButton from '@/components/AnimatedShareButton';

interface ZiweiAIResponse {
  aiInterpretation?: string;
  disclaimer?: string;
  aiMeta?: {
    provider: string;
    model: string;
    latencyMs: number;
    costUSD: number;
  };
  aiError?: string;
}

/**
 * ZiweiPage —紫微斗数星盘页面
 * Calls /api/ziwei with enhanceWithAI=true for AI interpretation.
 * Uses react-iztro Iztrolabe for visualization.
 */
export default function ZiweiPage() {
  const [birthday, setBirthday] = useState<string>('2000-08-16');
  const [birthTime, setBirthTime] = useState<number>(2); // 寅时
  const [birthdayType, setBirthdayType] = useState<'solar' | 'lunar'>('solar');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  const [aiResult, setAiResult] = useState<ZiweiAIResponse | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoadingAI(true);
      setAiResult(null);

      try {
        const params = new URLSearchParams({
          birthday,
          birthTime: String(birthTime),
          birthdayType,
          gender,
          enhanceWithAI: 'true',
          language: 'zh-CN',
        });

        const res = await fetch(`/api/ziwei?${params.toString()}`);

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const data: ZiweiAIResponse = await res.json();
        setAiResult(data);
      } catch (err) {
        console.error('Ziwei AI fetch failed:', err);
        setAiResult({
          aiError: err instanceof Error ? err.message : 'Failed to get AI interpretation',
        });
      } finally {
        setIsLoadingAI(false);
      }
    },
    [birthday, birthTime, birthdayType, gender]
  );

  return (
    <main className="min-h-screen flex flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-2">紫微斗数 · Zi Wei Dou Shu</h1>
      <p className="text-gray-600 mb-8 text-center max-w-xl">
        紫微斗数是中国传统命理学三大派别之一，以星耀配合宫位来推断一个人的命运走势。
      </p>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-6 mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Birthday Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              生日类型 / Birthday Type
            </label>
            <select
              value={birthdayType}
              onChange={(e) => setBirthdayType(e.target.value as 'solar' | 'lunar')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800"
            >
              <option value="solar">阳历 / Solar</option>
              <option value="lunar">农历 / Lunar</option>
            </select>
          </div>

          {/* Birthday */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              生日 / Birthday
            </label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800"
            />
          </div>

          {/* Birth Time (时辰) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              出生时辰 / Birth Hour
            </label>
            <select
              value={birthTime}
              onChange={(e) => setBirthTime(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800"
            >
              <option value={0}>子时 (23:00-00:59)</option>
              <option value={1}>丑时 (01:00-02:59)</option>
              <option value={2}>寅时 (03:00-04:59)</option>
              <option value={3}>卯时 (05:00-06:59)</option>
              <option value={4}>辰时 (07:00-08:59)</option>
              <option value={5}>巳时 (09:00-10:59)</option>
              <option value={6}>午时 (11:00-12:59)</option>
              <option value={7}>未时 (13:00-14:59)</option>
              <option value={8}>申时 (15:00-16:59)</option>
              <option value={9}>酉时 (17:00-18:59)</option>
              <option value={10}>戌时 (19:00-20:59)</option>
              <option value={11}>亥时 (21:00-22:59)</option>
              <option value={12}>子时尾 (23:00-23:59)</option>
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              性别 / Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as 'male' | 'female')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800"
            >
              <option value="male">男 / Male</option>
              <option value="female">女 / Female</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-center">
          <button
            type="submit"
            disabled={isLoadingAI}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingAI ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                AI 解读中...
              </span>
            ) : (
              '✨ AI 解读'
            )}
          </button>
        </div>
      </form>

      {/* AI Interpretation Display */}
      {isLoadingAI && (
        <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-6 mb-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-pulse">
              <div className="h-4 w-64 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-48 bg-gray-200 rounded mx-auto"></div>
            </div>
            <p className="text-gray-500">正在调用 AI 分析您的紫微命盘...</p>
          </div>
        </div>
      )}

      {aiResult && !isLoadingAI && (
        <>
          {aiResult.aiError ? (
            <div className="w-full max-w-2xl bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <p className="text-red-600 text-center">
                AI 解读失败: {aiResult.aiError}
              </p>
            </div>
          ) : (
            <div className="w-full max-w-2xl bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-xl p-6 mb-8 border border-purple-600/30">
              <h2 className="text-xl font-bold text-purple-300 mb-4 text-center">
                ✨ AI 命盘解读
              </h2>
              <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                {aiResult.aiInterpretation}
              </div>
              {aiResult.disclaimer && (
                <p className="mt-4 text-xs text-slate-400 italic">
                  {aiResult.disclaimer}
                </p>
              )}
              {aiResult.aiMeta && (
                <div className="mt-4 pt-4 border-t border-purple-600/30 text-xs text-slate-400 flex justify-between">
                  <span>
                    Model: {aiResult.aiMeta.model}
                  </span>
                  <span>
                    Latency: {aiResult.aiMeta.latencyMs}ms | Cost: ${aiResult.aiMeta.costUSD?.toFixed(4) ?? 'N/A'}
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Animated ZiWei Palace Chart */}
      {aiResult && !isLoadingAI && !aiResult.aiError && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-purple-300 mb-4 text-center">
            ✨ Animated ZiWei Palace
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <ZiWeiPalaceAnimation
              birthDate={birthday}
              birthTime={birthTime}
              gender={gender}
              birthdayType={birthdayType}
              width={420}
              height={420}
              playing={true}
            />
          </div>
          <div className="flex justify-center">
            <AnimatedShareButton
              type="ziwei"
              resultData={{ birthday, birthTime, birthdayType, gender }}
              format="webp"
              language="zh"
              variant="primary"
            />
          </div>
        </div>
      )}

      {/* Astrolabe Visualization */}
      <div
        style={{
          width: 1024,
          maxWidth: '100%',
          margin: '0 auto',
          boxShadow: '0 0 25px rgba(0,0,0,0.25)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <Iztrolabe
          birthday={birthday}
          birthTime={birthTime}
          birthdayType={birthdayType}
          gender={gender}
        />
      </div>
    </main>
  );
}
