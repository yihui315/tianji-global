'use client';

import { useState, useCallback } from 'react';
import { Iztrolabe } from 'react-iztro';
import ZiWeiPalaceAnimation from '@/components/animations/ZiWeiPalaceAnimation';
import AnimatedShareButton from '@/components/AnimatedShareButton';
import { saveReading } from '@/lib/save-reading';
import { GlassCard, MysticButton, LanguageSwitch, SectionHeader } from '@/components/ui';
import { colors } from '@/design-system';

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
        saveReading({
          reading_type: 'ziwei',
          title: `${birthday} ${birthdayType === 'lunar' ? '农历' : '阳历'} ${gender === 'male' ? '男' : '女'} 紫微斗数`,
          summary: data.aiInterpretation?.slice(0, 120) ?? '',
          reading_data: data as unknown as Record<string, unknown>,
        });
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
    <div
      className="mystic-page text-white min-h-screen"
      style={{ background: colors.bgPrimary }}
    >
      {/* Fixed LanguageSwitch top-right */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitch />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-12 w-full">
        {/* Page Header */}
        <SectionHeader
          title="紫微斗数 · Zi Wei Dou Shu"
          subtitle="以星耀配合宫位，推断命运走势"
          badge="🌟"
        />

        {/* Input Form */}
        <GlassCard level="card" className="p-6 sm:p-8 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Birthday Type */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  生日类型 / Birthday Type
                </label>
                <select
                  value={birthdayType}
                  onChange={(e) => setBirthdayType(e.target.value as 'solar' | 'lunar')}
                  className="w-full rounded-lg px-3 py-2.5 text-sm"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${colors.borderSubtle}`,
                    color: colors.textPrimary,
                  }}
                >
                  <option value="solar">阳历 / Solar</option>
                  <option value="lunar">农历 / Lunar</option>
                </select>
              </div>

              {/* Birthday */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  生日 / Birthday
                </label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full rounded-lg px-3 py-2.5 text-sm"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${colors.borderSubtle}`,
                    color: colors.textPrimary,
                  }}
                />
              </div>

              {/* Birth Time (时辰) */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  出生时辰 / Birth Hour
                </label>
                <select
                  value={birthTime}
                  onChange={(e) => setBirthTime(Number(e.target.value))}
                  className="w-full rounded-lg px-3 py-2.5 text-sm"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${colors.borderSubtle}`,
                    color: colors.textPrimary,
                  }}
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
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  性别 / Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                  className="w-full rounded-lg px-3 py-2.5 text-sm"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${colors.borderSubtle}`,
                    color: colors.textPrimary,
                  }}
                >
                  <option value="male">男 / Male</option>
                  <option value="female">女 / Female</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6 flex justify-center">
              <MysticButton
                variant="solid"
                size="lg"
                type="submit"
                disabled={isLoadingAI}
              >
                {isLoadingAI ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    AI 解读中...
                  </span>
                ) : '✨ AI 解读'}
              </MysticButton>
            </div>
          </form>
        </GlassCard>

        {/* Loading State */}
        {isLoadingAI && (
          <GlassCard level="card" className="p-8 text-center mb-8">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-pulse">
                <div className="h-4 w-64 rounded mb-2" style={{ background: 'rgba(255,255,255,0.1)' }} />
                <div className="h-4 w-48 rounded mx-auto" style={{ background: 'rgba(255,255,255,0.1)' }} />
              </div>
              <p style={{ color: colors.textMuted }}>正在调用 AI 分析您的紫微命盘...</p>
            </div>
          </GlassCard>
        )}

        {/* AI Result */}
        {aiResult && !isLoadingAI && (
          <>
            {aiResult.aiError ? (
              <GlassCard level="card" className="p-6 mb-8">
                <p style={{ color: '#F87171', textAlign: 'center' }}>
                  AI 解读失败: {aiResult.aiError}
                </p>
              </GlassCard>
            ) : (
              <GlassCard level="card" className="p-6 mb-8">
                <h2
                  className="text-xl font-serif font-bold mb-4 text-center"
                  style={{ color: colors.gold }}
                >
                  ✨ AI 命盘解读
                </h2>
                <div
                  className="whitespace-pre-wrap leading-relaxed"
                  style={{ color: colors.textSecondary }}
                >
                  {aiResult.aiInterpretation}
                </div>
                {aiResult.disclaimer && (
                  <p className="mt-4 text-xs italic" style={{ color: colors.textMuted }}>
                    {aiResult.disclaimer}
                  </p>
                )}
                {aiResult.aiMeta && (
                  <div
                    className="mt-4 pt-4 flex justify-between text-xs"
                    style={{ color: colors.textMuted, borderTop: `1px solid ${colors.borderSubtle}` }}
                  >
                    <span>Model: {aiResult.aiMeta.model}</span>
                    <span>Latency: {aiResult.aiMeta.latencyMs}ms | Cost: ${aiResult.aiMeta.costUSD?.toFixed(4) ?? 'N/A'}</span>
                  </div>
                )}
              </GlassCard>
            )}
          </>
        )}

        {/* Animated ZiWei Palace Chart */}
        {aiResult && !isLoadingAI && !aiResult.aiError && (
          <div className="mb-8">
            <h3
              className="text-xl font-serif font-bold mb-4 text-center"
              style={{ color: colors.gold }}
            >
              ✨ Animated ZiWei Palace
            </h3>
            <GlassCard level="card" className="p-4">
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
            </GlassCard>
          </div>
        )}

        {/* Astrolabe Visualization */}
        <div
          style={{
            width: 1024,
            maxWidth: '100%',
            margin: '0 auto',
            boxShadow: '0 0 25px rgba(124,58,237,0.15)',
            borderRadius: 8,
            overflow: 'hidden',
            border: `1px solid ${colors.borderSubtle}`,
          }}
        >
          <Iztrolabe
            birthday={birthday}
            birthTime={birthTime}
            birthdayType={birthdayType}
            gender={gender}
          />
        </div>
      </div>
    </div>
  );
}
