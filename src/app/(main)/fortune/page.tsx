'use client';

import { useState } from 'react';
import LifeChart, { type FortunePoint } from '@/components/charts/LifeChart';

export default function FortunePage() {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [gender, setGender] = useState('unspecified');
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [data, setData] = useState<{
    fortuneCycles: FortunePoint[];
    currentAge: number;
    currentPhase: string;
    summary: string;
    bestPeriods: string[];
    challengingPeriods: string[];
    aiInterpretation?: string;
    disclaimer?: string;
    aiMeta?: { provider: string; model: string; latencyMs: number; costUSD: number };
    aiError?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState('');

  const isZH = language === 'zh';

  const handleGenerate = async (withAI: boolean) => {
    if (!birthDate) {
      setError(isZH ? '请选择出生日期' : 'Please select your birth date');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        birthDate,
        gender,
        language,
        ...(birthTime ? { birthTime } : {}),
        enhanceWithAI: String(withAI),
      });

      const res = await fetch(`/api/fortune?${params}`);
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Failed to generate');
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setLoadingAI(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] overflow-x-hidden">
      <div className="star-field" aria-hidden="true" />
      {/* Header }
      <header className="px-4 py-6 border-b border-white/[0.06]">
        <h1 className="text-2xl font-serif text-white/90">
          {isZH ? '📊 人生运势图' : '📊 Life Fortune Chart'}
        </h1>
        <p className="text-white/50 text-sm mt-1">
          {isZH ? '基于八字/紫微推算人生各阶段运势' : 'Fortune cycles based on your birth chart'}
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16">
        {/* Input Form */}
        <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-6 border border-gray-700 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label              className="block text-white/50 text-sm mb-1"
                {isZH ? '出生日期 *' : 'Birth Date *'}
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                className="w-full px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/80 focus:ring-2 focus:ring-[#7C3AED]/50 focus:outline-none focus:border-[#7C3AED]/30"
              />
            </div>
            <div>
              <label              className="block text-white/50 text-sm mb-1"
                {isZH ? '出生时辰' : 'Birth Time'}
              </label>
              <input
                type="time"
                value={birthTime}
                onChange={e => setBirthTime(e.target.value)}
                className="w-full px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/80 focus:ring-2 focus:ring-[#7C3AED]/50 focus:outline-none focus:border-[#7C3AED]/30"
              />
            </div>
            <div>
              <label              className="block text-white/50 text-sm mb-1"
                {isZH ? '性别' : 'Gender'}
              </label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/80 focus:ring-2 focus:ring-[#7C3AED]/50 focus:outline-none focus:border-[#7C3AED]/30"
              >
                <option value="unspecified">{isZH ? '未指定' : 'Unspecified'}</option>
                <option value="male">{isZH ? '男' : 'Male'}</option>
                <option value="female">{isZH ? '女' : 'Female'}</option>
              </select>
            </div>
            <div>
              <label              className="block text-white/50 text-sm mb-1"
                {isZH ? '语言' : 'Language'}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setLanguage('zh')}
                  className={`flex-1 py-2 rounded-lg font-medium transition ${
                    language === 'zh'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  中文
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`flex-1 py-2 rounded-lg font-medium transition ${
                    language === 'en'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm mt-3 bg-red-900/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex gap-4 mt-4">
            <button
              onClick={() => handleGenerate(false)}
              disabled={loading}
              className="flex-1 px-8 py-3 bg-[#7C3AED]/80 hover:bg-[#7C3AED] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02]"
            >
              {loading && !loadingAI ? (isZH ? '生成中...' : 'Generating...') : (isZH ? '🔮 生成运势图' : '🔮 Generate Fortune Chart')}
            </button>
            <button
              onClick={() => { setLoadingAI(true); handleGenerate(true); }}
              disabled={loading}
              className="flex-1 px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-600 disabled:from-gray-600 text-white font-semibold rounded-xl transition"
            >
              {loadingAI ? (isZH ? 'AI解读中...' : 'AI Interpreting...') : (isZH ? '✨ AI 深度解读' : '✨ AI Deep Interpretation')}
            </button>
          </div>
        </div>

        {/* Results */}
        {data && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl p-5 border border-white/[0.06] bg-white/[0.02]">
                <div className="text-purple-300 text-sm mb-1">
                  {isZH ? '当前阶段' : 'Current Phase'}
                </div>
                <div className="text-2xl font-bold text-white">{data.currentPhase}</div>
                <div className="text-gray-400 text-sm mt-1">
                  {isZH ? `年龄 ${data.currentAge} 岁` : `Age ${data.currentAge}`}
                </div>
              </div>
              <div className="rounded-xl p-5 border border-white/[0.06] bg-white/[0.02]">
                <div className="text-amber-300 text-sm mb-1">
                  {isZH ? '✨ 最佳运势期' : '✨ Best Fortune Periods'}
                </div>
                {data.bestPeriods.slice(0, 2).map((p, i) => (
                  <div key={i} className="text-sm text-gray-200 mt-1">{p}</div>
                ))}
              </div>
              <div className="rounded-xl p-5 border border-white/[0.06] bg-white/[0.02]">
                <div className="text-rose-300 text-sm mb-1">
                  {isZH ? '⚠ 挑战期' : '⚠ Challenging Periods'}
                </div>
                {data.challengingPeriods.map((p, i) => (
                  <div key={i} className="text-sm text-gray-200 mt-1">{p}</div>
                ))}
              </div>
            </div>

            {/* Summary Text */}
            <div className="bg-gray-900/50 backdrop-blur rounded-xl p-5 border border-gray-700">
              <h3 className="text-lg font-semibold mb-2 text-purple-300">
                {isZH ? '📝 运势概述' : '📝 Fortune Summary'}
              </h3>
              <p className="text-gray-300 leading-relaxed">{data.summary}</p>
            </div>

            {/* AI Interpretation */}
            {data.aiInterpretation && (
              <div className="bg-gradient-to-r from-purple-900/40 to-amber-900/40 backdrop-blur rounded-xl p-5 border border-purple-500/30">
                <h3 className="text-lg font-semibold mb-3 text-purple-300">
                  {isZH ? '✨ AI 深度解读' : '✨ AI Deep Interpretation'}
                </h3>
                <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{data.aiInterpretation}</p>
                {data.disclaimer && (
                  <p className="text-slate-500 text-xs mt-4 italic">{data.disclaimer}</p>
                )}
                {data.aiMeta && (
                  <p className="text-slate-600 text-xs mt-2">
                    {data.aiMeta.provider} · {data.aiMeta.model} · {data.aiMeta.latencyMs}ms
                  </p>
                )}
              </div>
            )}

            {data.aiError && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 text-red-200 text-sm">
                {isZH ? 'AI 解读失败' : 'AI Interpretation Failed'}: {data.aiError}
              </div>
            )}

            {/* Chart */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-purple-300">
                {isZH ? '📈 人生运势曲线' : '📈 Life Fortune Curve'}
              </h3>
              <LifeChart data={data.fortuneCycles} language={language} />
            </div>

            {/* Phase Details Table */}
            <div className="bg-gray-900/50 backdrop-blur rounded-xl p-5 border border-gray-700 overflow-x-auto">
              <h3 className="text-lg font-semibold mb-4 text-purple-300">
                {isZH ? '📋 各阶段详细数据' : '📋 Phase Details'}
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="text-left py-2">{isZH ? '阶段' : 'Phase'}</th>
                    <th className="text-center py-2">{isZH ? '年龄' : 'Age'}</th>
                    <th className="text-center py-2">{isZH ? '综合' : 'Overall'}</th>
                    <th className="text-center py-2">{isZH ? '事业' : 'Career'}</th>
                    <th className="text-center py-2">{isZH ? '财富' : 'Wealth'}</th>
                    <th className="text-center py-2">{isZH ? '感情' : 'Love'}</th>
                    <th className="text-center py-2">{isZH ? '健康' : 'Health'}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.fortuneCycles.map((phase, i) => (
                    <tr
                      key={i}
                      className={`border-b border-gray-800 ${
                        phase.overall >= 70 ? 'text-green-300' :
                        phase.overall <= 40 ? 'text-red-300' : 'text-gray-200'
                      }`}
                    >
                      <td className="py-2 font-medium">
                        {isZH ? phase.phase : phase.phaseEn}
                      </td>
                      <td className="text-center py-2 text-gray-400">
                        {phase.ageStart}-{phase.ageEnd}
                      </td>
                      <td className="text-center py-2 font-bold">{phase.overall}</td>
                      <td className="text-center py-2">{phase.career}</td>
                      <td className="text-center py-2">{phase.wealth}</td>
                      <td className="text-center py-2">{phase.love}</td>
                      <td className="text-center py-2">{phase.health}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!data && !loading && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔮</div>
            <h2 className="text-2xl font-bold text-gray-300 mb-2">
              {isZH ? '探索您的人生运势' : 'Explore Your Life Fortune'}
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              {isZH
                ? '输入您的出生日期，开启人生运势之旅'
                : 'Enter your birth date to discover your fortune cycles across life phases'}
            </p>
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
