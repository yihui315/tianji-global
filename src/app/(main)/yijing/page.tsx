'use client';

import { useState, useCallback } from 'react';

type Language = 'zh' | 'en';

interface ChangingLine {
  line: number;
  value: number;
  isYang: boolean;
  isChanging: boolean;
  meaning: string;
  meaningEn: string;
}

interface Hexagram {
  number: number;
  name: string;
  pinyin: string;
  english: string;
  aboveName?: string;
  belowName?: string;
  aboveEn?: string;
  belowEn?: string;
  judgement: string;
  judgementEn?: string;
  judgementZh?: string;
  image?: string;
  imageZh?: string;
  imageEn?: string;
  changingLines?: ChangingLine[];
}

interface LineInterpretation {
  position: number;
  value: number;
  meaning: string;
  meaningEn: string;
  isChanging: boolean;
  isYang: boolean;
}

interface CastResult {
  hexagram: Hexagram;
  lines: LineInterpretation[];
  hasChangingLines: boolean;
  aiInterpretation?: string;
}

const HEXAGRAMS: Hexagram[] = [
  { number: 1, name: '乾', pinyin: 'Qián', english: 'The Creative', judgement: 'Supreme success. Perseverance furthers.' },
  { number: 2, name: '坤', pinyin: 'Kūn', english: 'The Receptive', judgement: 'Supreme success. Perseverance of a mare furthers.' },
  { number: 3, name: '屯', pinyin: 'Zhūn', english: 'Difficulty at the Beginning', judgement: 'Supreme success. Do not advance; appoint helpers.' },
  { number: 4, name: '蒙', pinyin: 'Méng', english: 'Youthful Folly', judgement: 'Success. Perseverance furthers.' },
  { number: 5, name: '需', pinyin: 'Xū', english: 'Waiting', judgement: 'If you are sincere, you have light and success.' },
  { number: 6, name: '讼', pinyin: 'Sòng', english: 'Conflict', judgement: 'Be sincere, but meet obstacles halfway.' },
  { number: 7, name: '师', pinyin: 'Shī', english: 'The Army', judgement: 'The army needs perseverance and a strong man.' },
  { number: 8, name: '比', pinyin: 'Bǐ', english: 'Holding Together', judgement: 'Good fortune. Inquire of the oracle once more.' },
  { number: 9, name: '小畜', pinyin: 'Xiǎo Chù', english: 'The Taming Power of the Small', judgement: 'Success. Dense clouds but no rain from the west.' },
  { number: 10, name: '履', pinyin: 'Lǚ', english: 'Treading', judgement: 'Treading on the tail of a tiger. It does not bite. Success.' },
  { number: 11, name: '泰', pinyin: 'Tài', english: 'Peace', judgement: 'The small departs; the great approaches. Good fortune.' },
  { number: 12, name: '否', pinyin: 'Pǐ', english: 'Standstill', judgement: 'Standstill. No perseverance furthers the inferior man.' },
  { number: 13, name: '同人', pinyin: 'Tóng Rén', english: 'Fellowship with Men', judgement: 'Fellowship with men in the open. Success.' },
  { number: 14, name: '大有', pinyin: 'Dà Yǒu', english: 'Possession in Great Measure', judgement: 'Supreme success.' },
  { number: 15, name: '谦', pinyin: 'Qiān', english: 'Modesty', judgement: 'Success. The superior man carries things through.' },
  { number: 16, name: '豫', pinyin: 'Yù', english: 'Enthusiasm', judgement: 'Enthusiasm. Helpful to install helpers and set armies marching.' },
  { number: 17, name: '随', pinyin: 'Suí', english: 'Following', judgement: 'Supreme success. Perseverance furthers. No blame.' },
  { number: 18, name: '蛊', pinyin: 'Gǔ', english: 'Work on What Has Been Spoiled', judgement: 'Supreme success. Before the starting point, three days; after, three days.' },
  { number: 19, name: '临', pinyin: 'Lín', english: 'Approach', judgement: 'Supreme success. Perseverance furthers. In the eighth month there will be misfortune.' },
  { number: 20, name: '观', pinyin: 'Guān', english: 'Contemplation', judgement: 'The ablution has been made but not yet the offering. Sincere devotion.' },
  { number: 21, name: '噬嗑', pinyin: 'Shì Kè', english: 'Biting Through', judgement: 'Success. It furthers one to let justice be administered.' },
  { number: 22, name: '贲', pinyin: 'Bì', english: 'Grace', judgement: 'Success. In small matters it is favourable to undertake something.' },
  { number: 23, name: '剥', pinyin: 'Bō', english: 'Splitting Apart', judgement: 'It does not further one to go anywhere.' },
  { number: 24, name: '复', pinyin: 'Fù', english: 'Return', judgement: 'Success. Coming and going without error. Friends come without blame.' },
  { number: 25, name: '无妄', pinyin: 'Wú Wàng', english: 'Innocence', judgement: 'Supreme success. Perseverance furthers. If someone is not as he should be, he has misfortune.' },
  { number: 26, name: '大畜', pinyin: 'Dà Chù', english: 'The Taming Power of the Great', judgement: 'Perseverance furthers. Not eating at home brings good fortune.' },
  { number: 27, name: '颐', pinyin: 'Yí', english: 'The Corners of the Mouth', judgement: 'Perseverance brings good fortune. Pay heed to the providing of nourishment.' },
  { number: 28, name: '大过', pinyin: 'Dà Guò', english: 'Preponderance of the Great', judgement: 'The ridgepole sags to the breaking point. It furthers one to have somewhere to go.' },
  { number: 29, name: '坎', pinyin: 'Kǎn', english: 'The Abysmal', judgement: 'If you are sincere, you have success in your heart. Action brings reward.' },
  { number: 30, name: '离', pinyin: 'Lí', english: 'The Clinging', judgement: 'Perseverance furthers. It brings success. Care of the cow brings good fortune.' },
  { number: 31, name: '咸', pinyin: 'Xián', english: 'Influence', judgement: 'Success. Perseverance furthers. Taking a maiden to wife brings good fortune.' },
  { number: 32, name: '恒', pinyin: 'Héng', english: 'Duration', judgement: 'Success. No blame. Perseverance furthers. It furthers one to have somewhere to go.' },
  { number: 33, name: '遁', pinyin: 'Dùn', english: 'Retreat', judgement: 'Success. In what is small, perseverance furthers.' },
  { number: 34, name: '大壮', pinyin: 'Dà Zhuàng', english: 'The Power of the Great', judgement: 'Perseverance furthers.' },
  { number: 35, name: '晋', pinyin: 'Jìn', english: 'Progress', judgement: 'The powerful prince is honoured with horses in large numbers.' },
  { number: 36, name: '明夷', pinyin: 'Míng Yí', english: 'Darkening of the Light', judgement: 'In adversity it furthers one to be persevering.' },
  { number: 37, name: '家人', pinyin: 'Jiā Rén', english: 'The Family', judgement: 'Perseverance of the woman furthers.' },
  { number: 38, name: '睽', pinyin: 'Kuí', english: 'Opposition', judgement: 'In small matters, good fortune.' },
  { number: 39, name: '蹇', pinyin: 'Jiǎn', english: 'Obstruction', judgement: 'The southwest furthers. The northeast does not further. It furthers one to see the great man.' },
  { number: 40, name: '解', pinyin: 'Xiè', english: 'Deliverance', judgement: 'The southwest furthers. If there is no longer anything to be achieved, return brings good fortune.' },
  { number: 41, name: '损', pinyin: 'Sǔn', english: 'Decrease', judgement: 'Decrease combined with sincerity brings about supreme good fortune without blame.' },
  { number: 42, name: '益', pinyin: 'Yì', english: 'Increase', judgement: 'It furthers one to undertake something. It furthers one to cross the great water.' },
  { number: 43, name: '夬', pinyin: 'Guài', english: 'Break-through', judgement: 'One must resolutely make the matter known at the court of the king.' },
  { number: 44, name: '姤', pinyin: 'Gòu', english: 'Coming to Meet', judgement: 'The maiden is powerful. One should not marry such a maiden.' },
  { number: 45, name: '萃', pinyin: 'Cuì', english: 'Gathering Together', judgement: 'Success. The king approaches his temple. Great offerings bring good fortune.' },
  { number: 46, name: '升', pinyin: 'Shēng', english: 'Pushing Upward', judgement: 'Supreme success. One must see the great man. Do not be grieved. Marching to the south brings good fortune.' },
  { number: 47, name: '困', pinyin: 'Kùn', english: 'Oppression', judgement: 'Success. Perseverance. The great man brings about good fortune. No blame.' },
  { number: 48, name: '井', pinyin: 'Jǐng', english: 'The Well', judgement: 'The town may be changed, but the well cannot be changed. Draw near to the well; the water is there.' },
  { number: 49, name: '革', pinyin: 'Gé', english: 'Revolution', judgement: 'On your own day you are believed. Supreme success. Perseverance furthers. Remorse disappears.' },
  { number: 50, name: '鼎', pinyin: 'Dǐng', english: 'The Cauldron', judgement: 'Supreme good fortune. Success.' },
  { number: 51, name: '震', pinyin: 'Zhèn', english: 'The Arousing (Shock)', judgement: 'Shock brings success. When the shock comes, there is fear. Then laughter and words.' },
  { number: 52, name: '艮', pinyin: 'Gèn', english: 'Keeping Still, Mountain', judgement: 'Keeping his back still so that he no longer feels his body.' },
  { number: 53, name: '渐', pinyin: 'Jiàn', english: 'Development (Gradual Progress)', judgement: 'The maiden is given in marriage. Good fortune. Perseverance furthers.' },
  { number: 54, name: '归妹', pinyin: 'Guī Mèi', english: 'The Marrying Maiden', judgement: 'Undertakings bring misfortune. Nothing that would further.' },
  { number: 55, name: '丰', pinyin: 'Fēng', english: 'Abundance', judgement: 'Abundance has success. The king attains abundance. Be not sad.' },
  { number: 56, name: '旅', pinyin: 'Lǚ', english: 'The Wanderer', judgement: 'The wanderer — success through smallness. Perseverance brings good fortune.' },
  { number: 57, name: '巽', pinyin: 'Xùn', english: 'The Gentle (Wind)', judgement: 'Success through what is small. It furthers one to have somewhere to go.' },
  { number: 58, name: '兑', pinyin: 'Duì', english: 'The Joyous, Lake', judgement: 'Success. Perseverance is favourable.' },
  { number: 59, name: '涣', pinyin: 'Huàn', english: 'Dispersion (Dissolution)', judgement: 'Success. The king approaches his temple. It furthers one to cross the great water.' },
  { number: 60, name: '节', pinyin: 'Jié', english: 'Limitation', judgement: 'Success. Galling limitation must not be persevered in.' },
  { number: 61, name: '中孚', pinyin: 'Zhōng Fú', english: 'Inner Truth', judgement: 'Pigs and fishes. Good fortune. It furthers one to cross the great water. Perseverance furthers.' },
  { number: 62, name: '小过', pinyin: 'Xiǎo Guò', english: 'Preponderance of the Small', judgement: 'Success. Perseverance furthers. Small things may be done; great things should not be done.' },
  { number: 63, name: '既济', pinyin: 'Jì Jì', english: 'After Completion', judgement: 'Success in small matters. Perseverance furthers.' },
  { number: 64, name: '未济', pinyin: 'Wèi Jì', english: 'Before Completion', judgement: 'Success. But if the little fox has nearly completed the crossing, it gets its tail in the water.' },
];

function getHexagramByNumber(number: number): Hexagram | null {
  return HEXAGRAMS.find(h => h.number === number) || null;
}

export default function YiJingPage() {
  const [mode, setMode] = useState<'cast' | 'search'>('cast');
  const [language, setLanguage] = useState<Language>('zh');
  const [searchNumber, setSearchNumber] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [castResult, setCastResult] = useState<CastResult | null>(null);
  const [searchResult, setSearchResult] = useState<Hexagram | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isCasting, setIsCasting] = useState(false);
  const [coinAnimating, setCoinAnimating] = useState(false);

  const handleCast = useCallback(async () => {
    setIsCasting(true);
    setCoinAnimating(true);
    setCastResult(null);

    try {
      const res = await fetch('/api/yijing?enhanceWithAI=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, gender, language, enhanceWithAI: true }),
      });

      if (!res.ok) {
        throw new Error('Divination failed');
      }

      const data = await res.json();
      setCastResult({
        hexagram: data.hexagram,
        lines: data.lines,
        hasChangingLines: data.hasChangingLines,
        aiInterpretation: data.aiInterpretation,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsCasting(false);
      setCoinAnimating(false);
    }
  }, [question, gender, language]);

  const handleSearch = useCallback(() => {
    const num = parseInt(searchNumber, 10);
    if (isNaN(num) || num < 1 || num > 64) {
      setSearchError(language === 'zh' ? '请输入1-64之间的数字' : 'Please enter a number between 1 and 64');
      setSearchResult(null);
      return;
    }
    const result = getHexagramByNumber(num);
    if (result) {
      setSearchResult(result);
      setSearchError(null);
    }
  }, [searchNumber, language]);

  const displayedHexagram = mode === 'cast' ? castResult?.hexagram : searchResult;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            {language === 'zh' ? '易经占卜' : 'Yi Jing'}
          </h1>
          <p className="text-red-300/80 text-lg">
            {language === 'zh' ? '六十四卦 · I Ching Oracle' : '六十四卦 · I Ching Oracle'}
          </p>
        </div>

        {/* Mode Selection */}
        <div className="bg-slate-800/50 rounded-xl p-6 mb-6 backdrop-blur-sm border border-slate-700/50">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => { setMode('cast'); setCastResult(null); setSearchResult(null); }}
              className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                mode === 'cast'
                  ? 'border-red-500 bg-red-500/20'
                  : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
              }`}
            >
              {language === 'zh' ? '🪙 硬币投掷' : '🪙 Coin Toss'}
            </button>
            <button
              onClick={() => { setMode('search'); setCastResult(null); setSearchResult(null); }}
              className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                mode === 'search'
                  ? 'border-red-500 bg-red-500/20'
                  : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
              }`}
            >
              {language === 'zh' ? '🔍 查找卦象' : '🔍 Search Hexagram'}
            </button>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={() => setLanguage('zh')}
              className={`px-4 py-2 rounded-lg ${language === 'zh' ? 'bg-red-600' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
              中文
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-lg ${language === 'en' ? 'bg-red-600' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
              English
            </button>
          </div>

          {/* Coin Toss Interface */}
          {mode === 'cast' && (
            <div className="text-center">
              <div className={`mb-6 ${coinAnimating ? 'animate-bounce' : ''}`}>
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-5xl shadow-lg shadow-yellow-500/30">
                  🪙
                </div>
              </div>
              {/* Question Input */}
              <div className="mb-4">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={language === 'zh' ? '请输入您的问题（可选）' : 'Your question (optional)'}
                  className="w-full max-w-md px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:border-red-500 focus:outline-none"
                />
              </div>

              {/* Gender Selection */}
              <div className="mb-6 flex items-center justify-center gap-4">
                <span className="text-slate-300">
                  {language === 'zh' ? '性别：' : 'Gender:'}
                </span>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:border-red-500 focus:outline-none"
                >
                  <option value="">{language === 'zh' ? '选择' : 'Select'}</option>
                  <option value="male">{language === 'zh' ? '男' : 'Male'}</option>
                  <option value="female">{language === 'zh' ? '女' : 'Female'}</option>
                </select>
              </div>

              <p className="text-slate-300 mb-6">
                {language === 'zh' 
                  ? '点击按钮进行三次硬币投掷' 
                  : 'Click to perform three coin tosses'}
              </p>
              <button
                onClick={handleCast}
                disabled={isCasting}
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 font-bold text-lg transition-all disabled:opacity-50"
              >
                {isCasting 
                  ? (language === 'zh' ? 'AI解读中...' : 'AI Interpreting...')
                  : (language === 'zh' ? '投掷硬币' : 'Toss Coins')}
              </button>
            </div>
          )}

          {/* Search Interface */}
          {mode === 'search' && (
            <div className="text-center">
              <div className="mb-4">
                <input
                  type="number"
                  min="1"
                  max="64"
                  value={searchNumber}
                  onChange={(e) => setSearchNumber(e.target.value)}
                  placeholder={language === 'zh' ? '输入卦象编号 (1-64)' : 'Enter hexagram number (1-64)'}
                  className="w-full max-w-xs px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 focus:border-red-500 focus:outline-none"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 font-bold transition-all"
              >
                {language === 'zh' ? '查找' : 'Search'}
              </button>
              {searchError && (
                <p className="text-red-400 mt-4">{searchError}</p>
              )}
            </div>
          )}
        </div>

        {/* Hexagram Display */}
        {displayedHexagram && (
          <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 rounded-xl p-6 border border-slate-700/50">
            {/* Hexagram Symbol */}
            <div className="flex justify-center mb-6">
              <div className="bg-amber-900/30 rounded-xl p-6 border border-amber-600/30">
                <div className="text-8xl text-center mb-2">{displayedHexagram.name}</div>
                <div className="text-center text-amber-400 text-lg">
                  {displayedHexagram.pinyin}
                </div>
              </div>
            </div>

            {/* Hexagram Info */}
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-amber-400 mb-2">
                {displayedHexagram.name} 卦 · #{displayedHexagram.number}
              </div>
              <div className="text-xl text-slate-300">
                {displayedHexagram.english}
              </div>
            </div>

            {/* Lines Display (for cast mode) */}
            {castResult && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-amber-300 text-center mb-4">
                  {language === 'zh' ? '六爻' : 'Six Lines'}
                </h3>
                <div className="space-y-2">
                  {[...castResult.lines].reverse().map((line, index) => (
                    <div key={index} className="flex items-center justify-center gap-4 bg-slate-700/30 rounded-lg py-2">
                      <span className="text-slate-400 w-8 text-right">{6 - index}</span>
                      <span className="text-2xl font-mono text-white w-32 text-center">
                        {line.isYang ? (line.isChanging ? '— × —' : '— ——') : (line.isChanging ? '— ○ —' : '— — —')}
                      </span>
                      <span className={`text-sm ${line.isChanging ? 'text-red-400' : 'text-slate-400'}`}>
                        {language === 'zh' ? line.meaning : line.meaningEn}
                      </span>
                    </div>
                  ))}
                </div>
                {castResult.hasChangingLines && (
                  <div className="mt-4 text-center text-red-400 font-semibold">
                    {language === 'zh' ? '⚠️ 有动爻（变卦）' : '⚠️ Has changing lines (transforming hexagram)'}
                  </div>
                )}
              </div>
            )}

            {/* Judgment */}
            <div className="bg-amber-900/20 rounded-xl p-6 border border-amber-600/30">
              <h3 className="text-lg font-semibold text-amber-300 mb-3 text-center">
                {language === 'zh' ? '卦辞' : 'Judgement'}
              </h3>
              <p className="text-slate-200 text-center text-lg leading-relaxed">
                {displayedHexagram.judgement}
              </p>
            </div>

            {/* AI Interpretation */}
            {castResult?.aiInterpretation && (
              <div className="mt-6 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-xl p-6 border border-purple-600/30">
                <h3 className="text-lg font-semibold text-purple-300 mb-3 text-center">
                  {language === 'zh' ? '✨ AI 解读' : '✨ AI Interpretation'}
                </h3>
                <p className="text-slate-200 text-center text-lg leading-relaxed whitespace-pre-wrap">
                  {castResult.aiInterpretation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Hexagram Reference Grid (for search mode) */}
        {mode === 'search' && (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-amber-300 mb-4 text-center">
              {language === 'zh' ? '六十四卦表' : '64 Hexagrams'}
            </h3>
            <div className="grid grid-cols-8 gap-2">
              {HEXAGRAMS.map((hex) => (
                <button
                  key={hex.number}
                  onClick={() => {
                    setSearchNumber(hex.number.toString());
                    setSearchResult(hex);
                  }}
                  className={`aspect-square rounded flex items-center justify-center text-xl font-bold transition-all ${
                    searchResult?.number === hex.number
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-700/50 text-amber-400 hover:bg-slate-600'
                  }`}
                >
                  {hex.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>© 2024 TianJi Global · 天机全球</p>
        </div>
      </div>
    </main>
  );
}
