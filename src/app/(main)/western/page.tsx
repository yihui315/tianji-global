'use client';

import { useState, useCallback } from 'react';

type Language = 'zh' | 'en';

interface PlanetaryPositions {
  sun: string;
  moon: string;
  rising: string;
}

const ZODIAC_SIGNS = [
  { name: 'Aries', nameZh: '白羊', symbol: '♈', element: 'Fire' },
  { name: 'Taurus', nameZh: '金牛', symbol: '♉', element: 'Earth' },
  { name: 'Gemini', nameZh: '双子', symbol: '♊', element: 'Air' },
  { name: 'Cancer', nameZh: '巨蟹', symbol: '♋', element: 'Water' },
  { name: 'Leo', nameZh: '狮子', symbol: '♌', element: 'Fire' },
  { name: 'Virgo', nameZh: '处女', symbol: '♍', element: 'Earth' },
  { name: 'Libra', nameZh: '天秤', symbol: '♎', element: 'Air' },
  { name: 'Scorpio', nameZh: '天蝎', symbol: '♏', element: 'Water' },
  { name: 'Sagittarius', nameZh: '射手', symbol: '♐', element: 'Fire' },
  { name: 'Capricorn', nameZh: '摩羯', symbol: '♑', element: 'Earth' },
  { name: 'Aquarius', nameZh: '水瓶', symbol: '♒', element: 'Air' },
  { name: 'Pisces', nameZh: '双鱼', symbol: '♓', element: 'Water' },
];

const ELEMENT_COLORS: Record<string, string> = {
  'Fire': 'text-red-500',
  'Earth': 'text-yellow-600',
  'Air': 'text-blue-400',
  'Water': 'text-cyan-500',
};

const PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

// Simplified Julian Day Number calculation
function getJulianDay(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const a = Math.floor(year / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
}

// Calculate approximate Sun sign based on date
function getSunSign(month: number, day: number): number {
  // Approximate Sun sign boundaries (simplified)
  const signBoundaries = [
    { month: 1, day: 20, sign: 0 },   // Aries starts Jan 20
    { month: 2, day: 19, sign: 1 },   // Taurus
    { month: 3, day: 21, sign: 2 },   // Gemini
    { month: 4, day: 20, sign: 3 },   // Cancer
    { month: 5, day: 21, sign: 4 },   // Leo
    { month: 6, day: 22, sign: 5 },   // Virgo
    { month: 7, day: 23, sign: 6 },   // Libra
    { month: 8, day: 23, sign: 7 },   // Scorpio
    { month: 9, day: 23, sign: 8 },   // Sagittarius
    { month: 10, day: 23, sign: 9 },  // Capricorn
    { month: 11, day: 22, sign: 10 }, // Aquarius
    { month: 12, day: 22, sign: 11 }, // Pisces
  ];

  for (let i = signBoundaries.length - 1; i >= 0; i--) {
    if (month > signBoundaries[i].month || (month === signBoundaries[i].month && day >= signBoundaries[i].day)) {
      return signBoundaries[i].sign;
    }
  }
  return 0; // Aries by default
}

// Calculate approximate Moon sign (simplified - cycles every ~2.5 days)
function getMoonSign(jd: number): number {
  // Moon sign changes roughly every 2.25 days
  const moonCycle = 27.321661; // Sidereal month
  const baseJD = 2451550.1; // Reference Julian day for New Moon (Jan 6, 2000)
  const daysSinceBase = jd - baseJD;
  const moonAge = ((daysSinceBase % moonCycle) + moonCycle) % moonCycle;
  const signIndex = Math.floor((moonAge / moonCycle) * 12);
  return signIndex % 12;
}

// Calculate approximate Ascendant (Rising sign) based on birth time and latitude
// This is a simplified calculation using the "whole sign" house system approximation
function getAscendant(hour: number, minute: number, latitude: number): number {
  // Convert birth time to decimal hours
  const decimalHour = hour + minute / 60;
  
  // Simplified Ascendant calculation
  // In reality, this requires precise astronomical calculations with ecliptic longitude
  // Here we use an approximation based on time and latitude
  
  // The Ascendant moves roughly 1 degree every 4 minutes
  // At equator, it's approximately: (Local Sidereal Time at rising) / 15
  
  // Simplified formula: approximate ascendant based on time of day and latitude
  const latFactor = latitude / 90; // -1 to 1 for lat -90 to 90
  const timeFactor = (decimalHour - 6) / 12; // -1 at midnight, +1 at noon roughly
  
  // Base ascendant moves through all 12 signs over 24 hours
  const baseAscendant = ((decimalHour / 24) * 12 + 6) % 12;
  
  // Adjust for latitude (higher lat = slower ascendant progression)
  const adjustedAscendant = baseAscendant + (latFactor * timeFactor * 2);
  
  return Math.floor(((adjustedAscendant % 12) + 12) % 12);
}

// Calculate all planetary positions (simplified)
function calculatePlanets(jd: number, birthTime: number, latitude: number): PlanetaryPositions {
  const date = new Date(jd * 1000);
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  
  const sunSign = getSunSign(month, day);
  const moonSign = getMoonSign(jd);
  
  // Birth time in hours from midnight
  const hour = Math.floor(birthTime);
  const minute = Math.round((birthTime - hour) * 60);
  const risingSign = getAscendant(hour, minute, latitude);
  
  return {
    sun: ZODIAC_SIGNS[sunSign].name,
    moon: ZODIAC_SIGNS[moonSign].name,
    rising: ZODIAC_SIGNS[risingSign].name,
  };
}

// Get zodiac sign info
function getSignInfo(signName: string) {
  return ZODIAC_SIGNS.find(s => s.name === signName) || ZODIAC_SIGNS[0];
}

// Get sign from number
function getSignByIndex(index: number) {
  return ZODIAC_SIGNS[index % 12];
}

export default function WesternPage() {
  const [birthday, setBirthday] = useState<string>('2000-08-16');
  const [birthTime, setBirthTime] = useState<string>('12:00');
  const [latitude, setLatitude] = useState<number>(35.6762); // Default Tokyo
  const [language, setLanguage] = useState<Language>('zh');
  const [positions, setPositions] = useState<PlanetaryPositions | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = useCallback(() => {
    setIsCalculating(true);
    
    setTimeout(() => {
      const [year, month, day] = birthday.split('-').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);
      
      const jd = getJulianDay(year, month, day);
      const birthTimeDecimal = hour + minute / 60;
      
      const result = calculatePlanets(jd, birthTimeDecimal, latitude);
      setPositions(result);
      setIsCalculating(false);
    }, 500);
  }, [birthday, birthTime, latitude]);

  const sunSign = positions ? getSignInfo(positions.sun) : null;
  const moonSign = positions ? getSignInfo(positions.moon) : null;
  const risingSign = positions ? getSignInfo(positions.rising) : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {language === 'zh' ? '西方占星' : 'Western Astrology'}
          </h1>
          <p className="text-blue-300/80 text-lg">
            {language === 'zh' ? '太阳 · 月亮 · 上升星座' : 'Sun · Moon · Rising Signs'}
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-slate-800/50 rounded-xl p-6 mb-6 backdrop-blur-sm border border-slate-700/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Birthday */}
            <div>
              <label className="block text-blue-300 text-sm font-medium mb-2">
                {language === 'zh' ? '出生日期 / Birthday' : '出生日期 / Birthday'}
              </label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Birth Time */}
            <div>
              <label className="block text-blue-300 text-sm font-medium mb-2">
                {language === 'zh' ? '出生时间 / Birth Time' : '出生时间 / Birth Time'}
              </label>
              <input
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-blue-300 text-sm font-medium mb-2">
                {language === 'zh' ? '出生纬度 (可选)' : 'Birth Latitude (optional)'}
              </label>
              <input
                type="number"
                step="0.0001"
                min="-90"
                max="90"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                placeholder="35.6762"
                className="w-full px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600 text-white focus:border-blue-500 focus:outline-none"
              />
              <p className="text-slate-500 text-xs mt-1">
                {language === 'zh' ? '影响上升星座计算' : 'Affects Rising Sign calculation'}
              </p>
            </div>

            {/* Language */}
            <div>
              <label className="block text-blue-300 text-sm font-medium mb-2">
                {language === 'zh' ? '显示语言 / Language' : '显示语言 / Language'}
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setLanguage('zh')}
                  className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                    language === 'zh'
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                  }`}
                >
                  中文
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                    language === 'en'
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            disabled={isCalculating}
            className="w-full py-4 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 font-bold text-lg transition-all disabled:opacity-50"
          >
            {isCalculating
              ? (language === 'zh' ? '计算中...' : 'Calculating...')
              : (language === 'zh' ? '查看星盘' : 'Generate Chart')}
          </button>
        </div>

        {/* Results */}
        {positions && (
          <div className="space-y-6">
            {/* Main Signs Display */}
            <div className="grid grid-cols-3 gap-4">
              {/* Sun Sign */}
              <div className="bg-gradient-to-b from-amber-900/30 to-orange-900/30 rounded-xl p-6 border border-amber-600/30 text-center">
                <div className="text-4xl mb-2">☀️</div>
                <div className="text-sm text-amber-400 mb-2">
                  {language === 'zh' ? '太阳星座' : 'Sun Sign'}
                </div>
                <div className="text-3xl mb-1">{sunSign?.symbol}</div>
                <div className="text-xl font-bold text-white mb-1">
                  {language === 'zh' ? sunSign?.nameZh : sunSign?.name}
                </div>
                <div className={`text-sm ${ELEMENT_COLORS[sunSign?.element || 'Fire']}`}>
                  {sunSign?.element}
                </div>
              </div>

              {/* Moon Sign */}
              <div className="bg-gradient-to-b from-slate-700/30 to-slate-800/30 rounded-xl p-6 border border-slate-500/30 text-center">
                <div className="text-4xl mb-2">🌙</div>
                <div className="text-sm text-slate-400 mb-2">
                  {language === 'zh' ? '月亮星座' : 'Moon Sign'}
                </div>
                <div className="text-3xl mb-1">{moonSign?.symbol}</div>
                <div className="text-xl font-bold text-white mb-1">
                  {language === 'zh' ? moonSign?.nameZh : moonSign?.name}
                </div>
                <div className={`text-sm ${ELEMENT_COLORS[moonSign?.element || 'Water']}`}>
                  {moonSign?.element}
                </div>
              </div>

              {/* Rising Sign */}
              <div className="bg-gradient-to-b from-purple-900/30 to-indigo-900/30 rounded-xl p-6 border border-purple-600/30 text-center">
                <div className="text-4xl mb-2">⬆️</div>
                <div className="text-sm text-purple-400 mb-2">
                  {language === 'zh' ? '上升星座' : 'Rising Sign'}
                </div>
                <div className="text-3xl mb-1">{risingSign?.symbol}</div>
                <div className="text-xl font-bold text-white mb-1">
                  {language === 'zh' ? risingSign?.nameZh : risingSign?.name}
                </div>
                <div className={`text-sm ${ELEMENT_COLORS[risingSign?.element || 'Air']}`}>
                  {risingSign?.element}
                </div>
              </div>
            </div>

            {/* Zodiac Wheel Visualization */}
            <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border border-slate-700/50">
              <h3 className="text-xl font-bold text-blue-300 mb-6 text-center">
                {language === 'zh' ? '星座宫位图' : 'Zodiac Wheel'}
              </h3>
              <div className="relative w-64 h-64 mx-auto">
                {/* Outer circle */}
                <div className="absolute inset-0 rounded-full border-4 border-slate-600" />
                
                {/* Zodiac signs around the wheel */}
                {ZODIAC_SIGNS.map((sign, index) => {
                  const angle = (index * 30 - 90) * (Math.PI / 180);
                  const x = 50 + 40 * Math.cos(angle);
                  const y = 50 + 40 * Math.sin(angle);
                  const isHighlighted = 
                    sign.name === positions.sun || 
                    sign.name === positions.moon || 
                    sign.name === positions.rising;
                  
                  return (
                    <div
                      key={sign.name}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 text-center ${
                        isHighlighted ? 'scale-125' : 'opacity-60'
                      } transition-all`}
                      style={{ left: `${x}%`, top: `${y}%` }}
                    >
                      <div className={`text-xl ${isHighlighted ? 'opacity-100' : ''}`}>
                        {sign.symbol}
                      </div>
                      <div className={`text-xs ${isHighlighted ? 'text-white font-bold' : 'text-slate-500'}`}>
                        {language === 'zh' ? sign.nameZh : sign.name}
                      </div>
                    </div>
                  );
                })}

                {/* Center display */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm text-slate-400">
                      {language === 'zh' ? '三重要' : 'Big 3'}
                    </div>
                    <div className="flex gap-1 mt-1">
                      <span className="text-lg">{sunSign?.symbol}</span>
                      <span className="text-lg">{moonSign?.symbol}</span>
                      <span className="text-lg">{risingSign?.symbol}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interpretation */}
            <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border border-slate-700/50">
              <h3 className="text-xl font-bold text-blue-300 mb-4 text-center">
                {language === 'zh' ? '星盘解读' : 'Interpretation'}
              </h3>
              <div className="space-y-4 text-slate-300">
                <p>
                  <span className="text-amber-400 font-semibold">
                    {language === 'zh' ? '太阳星座 ' : 'Sun Sign '}
                    {sunSign?.symbol} {language === 'zh' ? sunSign?.nameZh : sunSign?.name}
                  </span>
                  {' '}({sunSign?.element})
                  <br />
                  {language === 'zh'
                    ? `太阳星座代表你的核心性格、人生目标和自我表达方式。`
                    : `Your Sun sign represents your core personality, life purpose, and how you express yourself.`}
                </p>
                <p>
                  <span className="text-slate-300 font-semibold">
                    {language === 'zh' ? '月亮星座 ' : 'Moon Sign '}
                    {moonSign?.symbol} {language === 'zh' ? moonSign?.nameZh : moonSign?.name}
                  </span>
                  {' '}({moonSign?.element})
                  <br />
                  {language === 'zh'
                    ? `月亮星座代表你的情感世界、直觉反应和内心需求。`
                    : `Your Moon sign represents your emotional world, intuition, and inner needs.`}
                </p>
                <p>
                  <span className="text-purple-400 font-semibold">
                    {language === 'zh' ? '上升星座 ' : 'Rising Sign '}
                    {risingSign?.symbol} {language === 'zh' ? risingSign?.nameZh : risingSign?.name}
                  </span>
                  {' '}({risingSign?.element})
                  <br />
                  {language === 'zh'
                    ? `上升星座代表你给外界的第一印象、你的人生舞台和行动方式。`
                    : `Your Rising sign represents your outward persona, the image you project, and how you take action.`}
                </p>
              </div>
            </div>

            {/* Element Distribution */}
            <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur-sm border border-slate-700/50">
              <h3 className="text-xl font-bold text-blue-300 mb-4 text-center">
                {language === 'zh' ? '元素分布' : 'Element Distribution'}
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {(['Fire', 'Earth', 'Air', 'Water'] as const).map((element) => {
                  const signs = [sunSign, moonSign, risingSign].filter(s => s?.element === element);
                  const count = signs.length;
                  return (
                    <div key={element} className="text-center">
                      <div className={`text-2xl mb-1 ${ELEMENT_COLORS[element]}`}>
                        {element === 'Fire' && '🔥'}
                        {element === 'Earth' && '🌍'}
                        {element === 'Air' && '💨'}
                        {element === 'Water' && '💧'}
                      </div>
                      <div className={`font-bold ${ELEMENT_COLORS[element]}`}>
                        {language === 'zh' 
                          ? (element === 'Fire' ? '火' : element === 'Earth' ? '土' : element === 'Air' ? '风' : '水')
                          : element}
                      </div>
                      <div className="text-white font-semibold">{count}/3</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>© 2024 TianJi Global · 天机全球</p>
          <p className="mt-1">
            {language === 'zh' 
              ? '注：上升星座计算为近似值，精确计算需要出生经纬度及时区信息'
              : 'Note: Rising sign is approximated. Precise calculation requires birth longitude, latitude, and timezone.'}
          </p>
        </div>
      </div>
    </main>
  );
}
