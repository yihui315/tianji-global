'use client';

import { useState, useCallback } from 'react';
import SharePanel from '@/components/SharePanel';
import PDFDownloadButton from '@/components/PDFDownloadButton';

type Language = 'en' | 'zh';

interface LifePathResult {
  number: number;
  isMaster: boolean;
  title: string;
  titleChinese: string;
  description: string;
  descriptionChinese: string;
  traits: string[];
  traitsChinese: string[];
}

interface DestinyResult {
  number: number;
  isMaster: boolean;
  title: string;
  titleChinese: string;
  description: string;
  descriptionChinese: string;
  expressionNumber: number;
  nameValue: number;
}

interface SoulUrgeResult {
  number: number;
  isMaster: boolean;
  title: string;
  titleChinese: string;
  description: string;
  descriptionChinese: string;
  vowelValue: number;
  vowels: string[];
}

interface NumerologyReading {
  name: string;
  birthdate: string;
  lifePath: LifePathResult;
  destiny: DestinyResult;
  soulUrge: SoulUrgeResult;
  personalityNumber: number;
  maturityNumber: number;
  lifePathDescription: string;
  destinyDescription: string;
  soulUrgeDescription: string;
  compatibility: string[];
  compatibilityChinese: string[];
  luckyNumbers: number[];
  luckyDays: string[];
  luckyDaysChinese: string[];
  rulingPlanet: string;
  rulingPlanetChinese: string;
  element: string;
  elementChinese: string;
  language: Language;
  meta: { platform: string; version: string; method: string };
}

export default function NumerologyPage() {
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [reading, setReading] = useState<NumerologyReading | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'lifePath' | 'destiny' | 'soulUrge' | 'overview'>('overview');

  const calculate = useCallback(async () => {
    if (!name.trim() || !birthdate.trim()) {
      setError(language === 'zh' ? '请输入姓名和出生日期' : 'Please enter your name and birthdate');
      return;
    }

    setIsLoading(true);
    setError(null);
    setReading(null);

    try {
      const response = await fetch('/api/numerology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), birthdate: birthdate.trim(), language }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Calculation failed');
      }

      const data: NumerologyReading = await response.json();
      setReading(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : (language === 'zh' ? '计算失败，请重试' : 'Calculation failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  }, [name, birthdate, language]);

  const getNumberColor = (num: number): string => {
    const colors: Record<number, string> = {
      1: 'from-amber-500 to-orange-600', 2: 'from-blue-400 to-blue-600',
      3: 'from-pink-400 to-pink-600', 4: 'from-emerald-500 to-emerald-700',
      5: 'from-cyan-400 to-cyan-600', 6: 'from-violet-400 to-violet-600',
      7: 'from-indigo-400 to-indigo-600', 8: 'from-red-500 to-red-700',
      9: 'from-yellow-500 to-orange-500', 11: 'from-silver-400 to-silver-600',
      22: 'from-gray-500 to-gray-700', 33: 'from-purple-500 to-purple-700',
    };
    return colors[num] || 'from-gray-400 to-gray-600';
  };

  const NumberDisplay = ({ number, size = 'large' }: { number: number; size?: 'small' | 'large' }) => {
    const sizeClass = size === 'large' ? 'text-7xl' : 'text-3xl';
    const isMaster = [11, 22, 33].includes(number);
    return (
      <div className={`bg-gradient-to-br ${getNumberColor(number)} rounded-2xl ${sizeClass} font-black text-white flex items-center justify-center shadow-xl ${isMaster ? 'ring-4 ring-yellow-400' : ''}`}
        style={{ width: size === 'large' ? 140 : 80, height: size === 'large' ? 140 : 80 }}>
        {number}
        {isMaster && <span className="absolute -top-2 -right-2 text-yellow-400 text-xl">★</span>}
      </div>
    );
  };

  const t = (en: string, zh: string) => language === 'zh' ? zh : en;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#030014] via-[#0f0a1e] to-[#030014] text-white p-4 md:p-8 relative overflow-hidden">
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-600/15 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-amber-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Name Numerology
          </h1>
          <p className="text-purple-300/80 text-lg">姓名数字命理 · TianJi Global</p>
        </div>

        {/* Input Form - Glass Card */}
        <div className="bg-gradient-to-br from-amber-950/40 via-slate-900/80 to-purple-950/40 rounded-xl p-6 mb-6 backdrop-blur-xl border border-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.1)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-purple-300 mb-2 font-medium">
                {t('Full Name', '姓名')}
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t('Enter your full name', '输入你的全名')}
                className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-purple-300 mb-2 font-medium">
                {t('Birthdate', '出生日期')}
              </label>
              <input
                type="text"
                value={birthdate}
                onChange={e => setBirthdate(e.target.value)}
                placeholder={t('YYYY-MM-DD', 'YYYY-MM-DD')}
                className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
              />
              <p className="text-slate-500 text-xs mt-1">{t('e.g. 1990-05-15', '例如 1990-05-15')}</p>
            </div>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-purple-300">{t('Language', '语言')}:</span>
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-lg transition-all backdrop-blur-sm ${language === 'en' ? 'bg-purple-500/30 border border-purple-400/50' : 'bg-slate-800/50 hover:bg-slate-700/50'}`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('zh')}
              className={`px-4 py-2 rounded-lg transition-all backdrop-blur-sm ${language === 'zh' ? 'bg-purple-500/30 border border-purple-400/50' : 'bg-slate-800/50 hover:bg-slate-700/50'}`}
            >
              中文
            </button>
          </div>

          <button
            onClick={calculate}
            disabled={isLoading}
            className="w-full py-4 rounded-lg bg-gradient-to-r from-amber-600/80 via-purple-600/80 to-pink-600/80 hover:from-amber-500/90 hover:via-purple-500/90 hover:to-pink-500/90 font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-xl border border-amber-400/30 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
          >
            {isLoading ? (t('Calculating...', '计算中...')) : (t('Calculate My Numbers', '计算我的命理数字'))}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-950/40 border border-red-500/30 rounded-lg p-4 mb-6 text-red-200 backdrop-blur-xl">
            {error}
          </div>
        )}

        {/* Results */}
        {reading && (
          <div className="space-y-6">
            {/* Core Numbers Banner - Glass Card */}
            <div className="bg-gradient-to-r from-amber-950/50 via-slate-900/90 to-pink-950/50 rounded-2xl p-6 border border-amber-500/20 backdrop-blur-xl shadow-[0_0_50px_rgba(245,158,11,0.1)]">
              <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-amber-400 to-pink-400 bg-clip-text text-transparent">
                {t('Your Core Numbers', '你的核心数字')}
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center">
                  <NumberDisplay number={reading.lifePath.number} />
                  <div className="mt-3 text-center">
                    <div className="text-purple-300 text-sm">{t('Life Path', '生命道路')}</div>
                    <div className="font-bold">{t(reading.lifePath.title, reading.lifePath.titleChinese)}</div>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <NumberDisplay number={reading.destiny.number} />
                  <div className="mt-3 text-center">
                    <div className="text-purple-300 text-sm">{t('Destiny', '命运')}</div>
                    <div className="font-bold">{t(reading.destiny.title, reading.destiny.titleChinese)}</div>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <NumberDisplay number={reading.soulUrge.number} />
                  <div className="mt-3 text-center">
                    <div className="text-purple-300 text-sm">{t('Soul Urge', '心灵渴望')}</div>
                    <div className="font-bold">{t(reading.soulUrge.title, reading.soulUrge.titleChinese)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {(['overview', 'lifePath', 'destiny', 'soulUrge'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all backdrop-blur-sm ${activeTab === tab ? 'bg-purple-500/30 border border-purple-400/50' : 'bg-slate-800/50 hover:bg-slate-700/50'}`}
                >
                  {tab === 'overview' ? t('Overview', '总览') :
                    tab === 'lifePath' ? t('Life Path', '生命道路') :
                    tab === 'destiny' ? t('Destiny', '命运') :
                    t('Soul Urge', '心灵渴望')}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-amber-950/40 to-slate-900/80 rounded-xl p-6 border border-amber-500/20 backdrop-blur-xl">
                  <h3 className="text-lg font-bold text-amber-400 mb-3">{t('Life Path Number', '生命道路数字')}</h3>
                  <p className="text-slate-300 leading-relaxed">{t(reading.lifePath.description, reading.lifePath.descriptionChinese)}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(language === 'zh' ? reading.lifePath.traitsChinese : reading.lifePath.traits).map((trait, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-amber-600/20 text-amber-300 text-sm border border-amber-500/30">{trait}</span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 rounded-xl p-4 border border-slate-700/30 text-center backdrop-blur-xl">
                    <div className="text-slate-400 text-sm mb-1">{t('Personality', '人格数字')}</div>
                    <div className="text-3xl font-black text-cyan-400">{reading.personalityNumber}</div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 rounded-xl p-4 border border-slate-700/30 text-center backdrop-blur-xl">
                    <div className="text-slate-400 text-sm mb-1">{t('Maturity', '成熟数字')}</div>
                    <div className="text-3xl font-black text-green-400">{reading.maturityNumber}</div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 rounded-xl p-4 border border-slate-700/30 text-center backdrop-blur-xl">
                    <div className="text-slate-400 text-sm mb-1">{t('Planet', '守护行星')}</div>
                    <div className="text-lg font-bold text-pink-400">{t(reading.rulingPlanet, reading.rulingPlanetChinese)}</div>
                  </div>
                  <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 rounded-xl p-4 border border-slate-700/30 text-center backdrop-blur-xl">
                    <div className="text-slate-400 text-sm mb-1">{t('Element', '五行元素')}</div>
                    <div className="text-lg font-bold text-orange-400">{t(reading.element, reading.elementChinese)}</div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-950/40 to-slate-900/80 rounded-xl p-6 border border-amber-500/20 backdrop-blur-xl">
                  <h3 className="text-lg font-bold text-amber-400 mb-3">{t('Lucky Numbers & Days', '幸运数字与日期')}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-slate-400 text-sm mb-2">{t('Lucky Numbers', '幸运数字')}</div>
                      <div className="flex gap-2 flex-wrap">
                        {reading.luckyNumbers.map((n, i) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-amber-600/20 text-amber-300 font-bold text-lg border border-amber-500/30">{
}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-sm mb-2">{t('Lucky Days', '幸运日')}</div>
                      <div className="flex gap-2 flex-wrap">
                        {(language === 'zh' ? reading.luckyDaysChinese : reading.luckyDays).map((d, i) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-purple-600/20 text-purple-300 text-sm border border-purple-500/30">{d}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-950/40 to-slate-900/80 rounded-xl p-6 border border-green-500/20 backdrop-blur-xl">
                  <h3 className="text-lg font-bold text-amber-400 mb-3">{t('Compatibility', '数字兼容性')}</h3>
                  <div className="flex gap-2 flex-wrap">
                    {(language === 'zh' ? reading.compatibilityChinese : reading.compatibility).map((c, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-green-600/20 text-green-300 text-sm border border-green-500/30">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Life Path Tab */}
            {activeTab === 'lifePath' && (
              <div className="bg-gradient-to-br from-amber-950/40 to-slate-900/80 rounded-xl p-6 border border-amber-500/20 backdrop-blur-xl">
                <div className="flex items-center gap-6 mb-6">
                  <NumberDisplay number={reading.lifePath.number} />
                  <div>
                    <div className="text-purple-300 text-sm">{t('Life Path Number', '生命道路数字')}</div>
                    <h3 className="text-2xl font-bold">{t(reading.lifePath.title, reading.lifePath.titleChinese)}</h3>
                    {reading.lifePath.isMaster && <span className="text-yellow-400 text-sm">★ {t('Master Number', '大师数字')}</span>}
                  </div>
                </div>
                <p className="text-slate-300 leading-relaxed mb-4">{t(reading.lifePath.description, reading.lifePath.descriptionChinese)}</p>
                <div className="flex flex-wrap gap-2">
                  {(language === 'zh' ? reading.lifePath.traitsChinese : reading.lifePath.traits).map((trait, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-amber-600/20 text-amber-300 text-sm border border-amber-500/30">{trait}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Destiny Tab */}
            {activeTab === 'destiny' && (
              <div className="bg-gradient-to-br from-purple-950/40 to-slate-900/80 rounded-xl p-6 border border-purple-500/20 backdrop-blur-xl">
                <div className="flex items-center gap-6 mb-6">
                  <NumberDisplay number={reading.destiny.number} />
                  <div>
                    <div className="text-purple-300 text-sm">{t('Destiny Number', '命运数字')}</div>
                    <h3 className="text-2xl font-bold">{t(reading.destiny.title, reading.destiny.titleChinese)}</h3>
                    {reading.destiny.isMaster && <span className="text-yellow-400 text-sm">★ {t('Master Number', '大师数字')}</span>}
                  </div>
                </div>
                <p className="text-slate-300 leading-relaxed mb-4">{t(reading.destiny.description, reading.destiny.descriptionChinese)}</p>
                <div className="bg-slate-800/50 rounded-lg p-4 text-sm backdrop-blur-sm">
                  <div className="text-slate-400">{t('Full Name Value', '姓名总值')}: <span className="text-white font-mono">{reading.destiny.nameValue}</span></div>
                  <div className="text-slate-400 mt-1">{t('Expression Number', '表现数字')}: <span className="text-white font-mono">{reading.destiny.expressionNumber}</span> → <span className="text-amber-400 font-bold">{reading.destiny.expressionNumberReduced}</span></div>
                </div>
              </div>
            )}

            {/* Soul Urge Tab */}
            {activeTab === 'soulUrge' && (
              <div className="bg-gradient-to-br from-pink-950/40 to-slate-900/80 rounded-xl p-6 border border-pink-500/20 backdrop-blur-xl">
                <div className="flex items-center gap-6 mb-6">
                  <NumberDisplay number={reading.soulUrge.number} />
                  <div>
                    <div className="text-purple-300 text-sm">{t('Soul Urge Number', '心灵渴望数字')}</div>
                    <h3 className="text-2xl font-bold">{t(reading.soulUrge.title, reading.soulUrge.titleChinese)}</h3>
                    {reading.soulUrge.isMaster && <span className="text-yellow-400 text-sm">★ {t('Master Number', '大师数字')}</span>}
                  </div>
                </div>
                <p className="text-slate-300 leading-relaxed mb-4">{t(reading.soulUrge.description, reading.soulUrge.descriptionChinese)}</p>
                <div className="bg-slate-800/50 rounded-lg p-4 text-sm backdrop-blur-sm">
                  <div className="text-slate-400">{t('Vowels Found', '检测到的元音')}: <span className="text-white font-mono">{reading.soulUrge.vowels.join(', ')}</span></div>
                  <div className="text-slate-400 mt-1">{t('Vowel Value', '元音总值')}: <span className="text-white font-mono">{reading.soulUrge.vowelValue}</span> → <span className="text-amber-400 font-bold">{reading.soulUrge.number}</span></div>
                </div>
              </div>
            )}
            {/* Share Panel */}
            <SharePanel
              serviceType="numerology"
              resultId={`numerology-${name}-${Date.now()}`}
              shareUrl={`https://tianji.global/numerology?name=${encodeURIComponent(name)}`}
            />

            {/* PDF Download */}
            <PDFDownloadButton
              serviceType="numerology"
              resultData={reading as unknown as Record<string, unknown>}
              language={language}
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>© 2024 TianJi Global · 天机全球</p>
          <p className="mt-1">{t('Pythagorean Numerology System', '毕达哥拉斯数字命理系统')}</p>
        </div>
      </div>
    </main>
  );
}
