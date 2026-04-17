'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Chart from 'chart.js/auto';
import 'chart.js/auto';
import { GlassCard } from '@/components/ui/GlassCard';
import { MysticButton } from '@/components/ui/MysticButton';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PlanetData {
  name: string; symbol: string; sign: string; signZh: string;
  degree: number; longitude: number; signSymbol: string;
}
interface HouseData { cusps: number[]; ascendant: number; midheaven: number; ascendantSign: string; ascendantSignZh: string; mcSign: string; mcSignZh: string; }
interface BigThree { sun: { sign: string; signZh: string; symbol: string; degree: number; }; moon: { sign: string; signZh: string; symbol: string; degree: number; }; rising: { sign: string; signZh: string; symbol: string; degree: number; }; }
interface ChartApiResponse {
  chart: Record<string, unknown>; planets: PlanetData[]; houses: HouseData; bigThree: BigThree; meta: Record<string, string>;
}

// ─── Zodiac Data ─────────────────────────────────────────────────────────────

const ZODIAC = [
  { name: 'Aries', nameZh: '白羊', symbol: '♈', element: 'Fire', quality: 'Cardinal' },
  { name: 'Taurus', nameZh: '金牛', symbol: '♉', element: 'Earth', quality: 'Fixed' },
  { name: 'Gemini', nameZh: '双子', symbol: '♊', element: 'Air', quality: 'Mutable' },
  { name: 'Cancer', nameZh: '巨蟹', symbol: '♋', element: 'Water', quality: 'Cardinal' },
  { name: 'Leo', nameZh: '狮子', symbol: '♌', element: 'Fire', quality: 'Fixed' },
  { name: 'Virgo', nameZh: '处女', symbol: '♍', element: 'Earth', quality: 'Mutable' },
  { name: 'Libra', nameZh: '天秤', symbol: '♎', element: 'Air', quality: 'Cardinal' },
  { name: 'Scorpio', nameZh: '天蝎', symbol: '♏', element: 'Water', quality: 'Fixed' },
  { name: 'Sagittarius', nameZh: '射手', symbol: '♐', element: 'Fire', quality: 'Mutable' },
  { name: 'Capricorn', nameZh: '摩羯', symbol: '♑', element: 'Earth', quality: 'Cardinal' },
  { name: 'Aquarius', nameZh: '水瓶', symbol: '♒', element: 'Air', quality: 'Fixed' },
  { name: 'Pisces', nameZh: '双鱼', symbol: '♓', element: 'Water', quality: 'Mutable' },
];

const ELEMENTS = ['Fire', 'Earth', 'Air', 'Water'];
const ELEM_COLORS = { Fire: '#FF6B6B', Earth: '#F59E0B', Air: '#60A5FA', Water: '#34D399' };
const ELEM_BG = { Fire: 'rgba(255,107,107,0.15)', Earth: 'rgba(245,158,11,0.15)', Air: 'rgba(96,165,250,0.15)', Water: 'rgba(52,211,153,0.15)' };
const PLANET_COLORS: Record<string, string> = { Sun: '#FFD700', Moon: '#C0C0C0', Mercury: '#B8860B', Venus: '#98FB98', Mars: '#FF6347', Jupiter: '#DAA520', Saturn: '#708090', Uranus: '#40E0D0', Neptune: '#4169E1', Pluto: '#8B008B' };

// ─── Interpretation Engine ────────────────────────────────────────────────────

const SIGN_KEYWORDS: Record<string, { zh: string[]; en: string[] }> = {
  Aries: { zh: ['开创者', '行动派', '先驱者', '勇气型'], en: ['Pioneer', 'Action-Oriented', 'Leader', 'Brave'] },
  Taurus: { zh: ['稳定者', '享受型', '积累者', '务实型'], en: ['Stabilizer', 'Pleasure-Seeker', 'Builder', 'Practical'] },
  Gemini: { zh: ['沟通者', '好奇型', '多变者', '智识型'], en: ['Communicator', 'Curious', 'Versatile', 'Intellectual'] },
  Cancer: { zh: ['守护者', '敏感型', '情感型', '直觉型'], en: ['Nurturer', 'Sensitive', 'Emotional', 'Intuitive'] },
  Leo: { zh: ['表演者', '自信型', '创造者', '领导型'], en: ['Performer', 'Confident', 'Creative', 'Generous'] },
  Virgo: { zh: ['分析者', '完美型', '服务者', '务实型'], en: ['Analyst', 'Perfectionist', 'Helper', 'Detail-Oriented'] },
  Libra: { zh: ['平衡者', '和谐型', '外交型', '审美型'], en: ['Balancer', 'Harmonizer', 'Diplomat', 'Aesthetic'] },
  Scorpio: { zh: ['探索者', '深刻型', '变革者', '洞察型'], en: ['Explorer', 'Intense', 'Transformer', 'Perceptive'] },
  Sagittarius: { zh: ['冒险者', '自由型', '探索者', '乐观型'], en: ['Adventurer', 'Freedom-Seeker', 'Explorer', 'Optimistic'] },
  Capricorn: { zh: ['攀登者', '成就型', '自律者', '务实型'], en: ['Climber', 'Achiever', 'Disciplined', 'Ambitious'] },
  Aquarius: { zh: ['创新者', '独特型', '博爱者', '理想型'], en: ['Innovator', 'Unique', 'Humanitarian', 'Visionary'] },
  Pisces: { zh: ['梦想家', '感受型', '超越者', '艺术型'], en: ['Dreamer', 'Feeler', 'Transcender', 'Artistic'] },
};

const SIGN_SUMMARY: Record<string, { zh: string; en: string }> = {
  Aries: { zh: '你是人生的先驱者，喜欢走在前面，不畏惧第一个尝试。你的能量是向前的、爆发式的。', en: 'You are a pioneer who leads from the front, never afraid to try first. Your energy is forward-moving and explosive.' },
  Taurus: { zh: '你是大地的孩子，追求稳定与舒适，相信积累的力量。你的耐心是最大的武器。', en: 'You are a child of the earth, seeking stability and comfort. Your patience is your greatest weapon.' },
  Gemini: { zh: '你是信息的编织者，思维敏捷，总能同时处理多条线索。你的好奇心永不停歇。', en: 'You are an information weaver with sharp intellect, always juggling multiple threads. Your curiosity never stops.' },
  Cancer: { zh: '你是情感的守护者，直觉敏锐，深深理解他人的感受。你的敏感是一种强大的共情力。', en: 'You are an emotional guardian with sharp intuition and deep empathy for others. Your sensitivity is a powerful gift.' },
  Leo: { zh: '你是舞台的主角，自带光芒，相信自己有能力改变世界。你的自信有感染力。', en: 'You are the star of the show, radiating confidence and believing you can change the world. Your self-belief is infectious.' },
  Virgo: { zh: '你是完美的工匠，用分析和细节把世界变得更美好。你的挑剔源于对卓越的追求。', en: 'You are a craftsman of perfection who makes the world better through analysis and detail. Your pickiness stems from pursuit of excellence.' },
  Libra: { zh: '你是关系的艺术家，追求和谐与美感，相信最好的答案是平衡出来的。', en: 'You are an artist of relationships who seeks harmony and beauty, believing the best answers come from balance.' },
  Scorpio: { zh: '你是深海的探索者，看透表象，直击本质。你的深刻让你拥有强大的转化力。', en: 'You are an explorer of the deep who sees through surface to essence. Your depth gives you powerful transformative ability.' },
  Sagittarius: { zh: '你是自由的追寻者，乐观地相信诗和远方一定存在。你的信念是最强大的导航。', en: 'You are a seeker of freedom who optimistically believes in distant horizons. Your faith is your greatest navigator.' },
  Capricorn: { zh: '你是巅峰的攀登者，相信成功靠一步一步积累。你的韧性可以征服任何高山。', en: 'You are a climber of peaks who believes success comes from step-by-step accumulation. Your resilience can conquer any mountain.' },
  Aquarius: { zh: '你是未来的思想家，总在思考下一个可能性。你的独特来自于你不随波逐流。', en: 'You are a thinker of the future always exploring next possibilities. Your uniqueness comes from your refusal to follow the crowd.' },
  Pisces: { zh: '你是灵性的诗人，感受着世界的每一个脉动。你的敏感让你连接到了更深的存在。', en: 'You are a spiritual poet feeling every pulse of the world. Your sensitivity connects you to something deeper.' },
};

const CAREER_TIPS: Record<string, { zh: string[]; en: string[] }> = {
  Fire: { zh: ['适合开创性工作', '领导岗位', '销售/创业', '体育/竞技'], en: ['Pioneering work', 'Leadership roles', 'Sales/Entrepreneurship', 'Sports/Competition'] },
  Earth: { zh: ['适合稳定积累型', '财务/投资', '建筑/设计', '农业/自然资源'], en: ['Stable accumulation', 'Finance/Investment', 'Architecture/Design', 'Agriculture/Natural Resources'] },
  Air: { zh: ['适合沟通协作型', '媒体/教育', '法律/外交', '咨询/技术'], en: ['Communication/Collaboration', 'Media/Education', 'Law/Diplomacy', 'Consulting/Tech'] },
  Water: { zh: ['适合深度服务型', '医疗/心理', '艺术/创意', '灵性/疗愈'], en: ['Deep service', 'Healthcare/Psychology', 'Art/Creativity', 'Spiritual/Healing'] },
};

const RISK_TIPS: Record<string, { zh: string[]; en: string[] }> = {
  Fire: { zh: ['冲动决策', '过度竞争', '耐心不足'], en: ['Impulsive decisions', 'Excessive competition', 'Lack of patience'] },
  Earth: { zh: ['过度保守', '抗拒变化', '执着物质'], en: ['Overly cautious', 'Resistance to change', 'Material attachment'] },
  Air: { zh: ['想法飘忽', '浅尝辄止', '过度理性'], en: ['Scattered thinking', 'Shallow engagement', 'Over-intellectualizing'] },
  Water: { zh: ['情绪波动', '边界模糊', '逃避现实'], en: ['Emotional volatility', 'Blurred boundaries', 'Escapism'] },
};

function getSignData(signName: string) {
  return ZODIAC.find(s => s.name === signName) ?? ZODIAC[0];
}

function computeElements(planets: PlanetData[]) {
  const counts: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const personalPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
  planets.filter(p => personalPlanets.includes(p.name)).forEach(p => {
    const sign = getSignData(p.sign);
    counts[sign.element]++;
  });
  const total = Object.values(counts).reduce((a, b) => a + b, 1);
  return { Fire: Math.round(counts.Fire / total * 100), Earth: Math.round(counts.Earth / total * 100), Air: Math.round(counts.Air / total * 100), Water: Math.round(counts.Water / total * 100) };
}

function computeKeywords(bigThree: BigThree, lang: 'zh' | 'en') {
  const sunK = SIGN_KEYWORDS[bigThree.sun.sign]?.[lang] ?? [];
  const moonK = SIGN_KEYWORDS[bigThree.moon.sign]?.[lang] ?? [];
  const risingK = SIGN_KEYWORDS[bigThree.rising.sign]?.[lang] ?? [];
  const combined = [...sunK, ...moonK.slice(0, 2), ...risingK.slice(0, 1)];
  return [...new Set(combined)].slice(0, 5);
}

function computeLifeCurve(birthYear: number) {
  const now = new Date().getFullYear();
  const age = now - birthYear;
  const phases = [
    { start: 18, end: 25, base: 45, label: '探索期' },
    { start: 25, end: 32, base: 58, label: '定位期' },
    { start: 32, end: 40, base: 72, label: '上升期' },
    { start: 40, end: 48, base: 80, label: '稳定期' },
    { start: 48, end: 55, base: 75, label: '深化期' },
    { start: 55, end: 65, base: 82, label: '收获期' },
    { start: 65, end: 75, base: 78, label: '传承期' },
  ];
  return phases.map(p => ({ ...p, overall: p.base + Math.floor(Math.random() * 10 - 5), career: p.base - 5 + Math.floor(Math.random() * 10), wealth: p.base + Math.floor(Math.random() * 8 - 4), love: p.base + Math.floor(Math.random() * 12 - 6), health: 85 + Math.floor(Math.random() * 10 - 5) }));
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function KeywordTag({ text }: { text: string }) {
  return (
    <span className="px-4 py-1.5 rounded-full text-xs font-medium border"
      style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(251,191,36,0.3)', color: '#FCD34D' }}>
      {text}
    </span>
  );
}

function BigThreeCard({ label, data, accentColor, lang }: { label: string; data: { sign: string; signZh: string; symbol: string; degree: number }; accentColor: string; lang: 'zh' | 'en' }) {
  const signData = getSignData(data.sign);
  return (
    <GlassCard level="card" className="p-5 text-center flex-1 min-w-0">
      <div className="text-2xl mb-1">{data.symbol}</div>
      <div className="text-xs mb-2" style={{ color: accentColor }}>{label}</div>
      <div className="text-xl font-serif font-bold text-white mb-1">{lang === 'zh' ? data.signZh : data.sign}</div>
      <div className="text-sm" style={{ color: ELEM_COLORS[signData.element] }}>{data.degree}° · {signData.element}</div>
    </GlassCard>
  );
}

// ─── EnergyRadar Chart ───────────────────────────────────────────────────────

function EnergyRadar({ elements, lang }: { elements: Record<string, number>; lang: 'zh' | 'en' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const labels = lang === 'zh' ? ['火', '土', '风', '水'] : ['Fire', 'Earth', 'Air', 'Water'];
    const values = [elements.Fire, elements.Earth, elements.Air, elements.Water];

    chartRef.current = new Chart(ctx, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: lang === 'zh' ? '能量分布' : 'Energy Distribution',
          data: values,
          backgroundColor: 'rgba(124, 58, 237, 0.2)',
          borderColor: '#A78BFA',
          borderWidth: 2,
          pointBackgroundColor: ['#FF6B6B', '#F59E0B', '#60A5FA', '#34D399'],
          pointBorderColor: '#fff',
          pointRadius: 5,
          pointHoverRadius: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0, max: 100,
            ticks: { display: false },
            grid: { color: 'rgba(255,255,255,0.08)' },
            angleLines: { color: 'rgba(255,255,255,0.08)' },
            pointLabels: { color: '#E2E8F0', font: { size: 13 } },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1F2937',
            titleColor: '#A78BFA',
            bodyColor: '#E2E8F0',
            borderColor: '#374151',
            borderWidth: 1,
            callbacks: {
              label: (ctx) => `${ctx.label}: ${ctx.raw}%`,
            },
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [elements, lang]);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="w-full h-64" />
      {/* Element labels overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { label: '火/Fire', color: '#FF6B6B', top: '5%', left: '50%', transform: 'translateX(-50%)' },
          { label: '土/Earth', color: '#F59E0B', top: '50%', right: '5%', transform: 'translateY(-50%)' },
          { label: '风/Air', color: '#60A5FA', bottom: '5%', left: '50%', transform: 'translateX(-50%)' },
          { label: '水/Water', color: '#34D399', top: '50%', left: '5%', transform: 'translateY(-50%)' },
        ].map(e => (
          <div key={e.label} className="absolute text-xs font-medium" style={{ color: e.color, top: e.top, left: e.left, right: e.right, bottom: e.bottom, transform: e.transform }}>{e.label}</div>
        ))}
      </div>
    </div>
  );
}

// ─── LifeTimeline Chart ───────────────────────────────────────────────────────

function LifeTimeline({ birthYear, lang }: { birthYear: number; lang: 'zh' | 'en' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const data = computeLifeCurve(birthYear);
    const labels = data.map(d => `${d.start}-${d.end}`);
    const overall = data.map(d => d.overall);
    const career = data.map(d => d.career);
    const love = data.map(d => d.love);
    const wealth = data.map(d => d.wealth);

    const gradBlue = ctx.createLinearGradient(0, 0, 0, 300);
    gradBlue.addColorStop(0, 'rgba(59,130,246,0.8)');
    gradBlue.addColorStop(1, 'rgba(59,130,246,0.05)');

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: lang === 'zh' ? '综合' : 'Overall',
            data: overall,
            borderColor: '#A78BFA',
            backgroundColor: 'rgba(167,139,250,0.08)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointRadius: 5,
            pointBackgroundColor: '#A78BFA',
            pointBorderColor: '#fff',
            pointHoverRadius: 8,
          },
          {
            label: lang === 'zh' ? '事业' : 'Career',
            data: career,
            borderColor: '#F59E0B',
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.4,
            borderDash: [5, 5],
            pointRadius: 3,
            pointBackgroundColor: '#F59E0B',
            fill: false,
          },
          {
            label: lang === 'zh' ? '感情' : 'Love',
            data: love,
            borderColor: '#F472B6',
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#F472B6',
            fill: false,
          },
          {
            label: lang === 'zh' ? '财富' : 'Wealth',
            data: wealth,
            borderColor: '#34D399',
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#34D399',
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            labels: { color: '#E2E8F0', font: { size: 12 }, usePointStyle: true, pointStyleWidth: 10 },
          },
          tooltip: {
            backgroundColor: '#1F2937',
            titleColor: '#FCD34D',
            bodyColor: '#E2E8F0',
            borderColor: '#374151',
            borderWidth: 1,
            padding: 12,
          },
        },
        scales: {
          x: { ticks: { color: '#94A3B8', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { min: 20, max: 100, ticks: { color: '#94A3B8', stepSize: 20 }, grid: { color: 'rgba(255,255,255,0.05)' } },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [birthYear, lang]);

  return <canvas ref={canvasRef} className="w-full h-72" />;
}

// ─── SignalLayers Chart ───────────────────────────────────────────────────────

function SignalLayers({ birthYear, lang }: { birthYear: number; lang: 'zh' | 'en' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const data = computeLifeCurve(birthYear);
    const labels = data.map(d => `${d.start}-${d.end}`);

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: lang === 'zh' ? '事业' : 'Career', data: data.map(d => d.career), backgroundColor: 'rgba(245,158,11,0.7)', borderColor: '#F59E0B', borderWidth: 1, borderRadius: 4 },
          { label: lang === 'zh' ? '感情' : 'Love', data: data.map(d => d.love), backgroundColor: 'rgba(244,114,182,0.7)', borderColor: '#F472B6', borderWidth: 1, borderRadius: 4 },
          { label: lang === 'zh' ? '财富' : 'Wealth', data: data.map(d => d.wealth), backgroundColor: 'rgba(52,211,153,0.7)', borderColor: '#34D399', borderWidth: 1, borderRadius: 4 },
          { label: lang === 'zh' ? '健康' : 'Health', data: data.map(d => d.health), backgroundColor: 'rgba(96,165,250,0.7)', borderColor: '#60A5FA', borderWidth: 1, borderRadius: 4 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#E2E8F0', font: { size: 12 }, usePointStyle: true } },
          tooltip: { backgroundColor: '#1F2937', titleColor: '#FCD34D', bodyColor: '#E2E8F0', borderColor: '#374151', borderWidth: 1 },
        },
        scales: {
          x: { stacked: true, ticks: { color: '#94A3B8' }, grid: { display: false } },
          y: { stacked: true, min: 0, max: 400, ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [birthYear, lang]);

  return <canvas ref={canvasRef} className="w-full h-64" />;
}

// ─── DeepInterpretation ───────────────────────────────────────────────────────

function DeepInterpretation({ bigThree, planets, lang }: { bigThree: BigThree; planets: PlanetData[]; lang: 'zh' | 'en' }) {
  const sunEl = getSignData(bigThree.sun.sign);
  const moonEl = getSignData(bigThree.moon.sign);

  const energyAnalysis = lang === 'zh'
    ? `你的太阳落在${bigThree.sun.signZh}座（${sunEl.element}元素），月亮落在${bigThree.moon.signZh}座（${moonEl.element}元素）。这种组合意味着你在外部世界中表现出${SIGN_KEYWORDS[bigThree.sun.sign].zh[0]}的特质，而在情感层面则更倾向于${SIGN_KEYWORDS[bigThree.moon.sign].zh[0]}的内在模式。`
    : `Your Sun in ${bigThree.sun.sign} (${sunEl.element}) gives you a ${SIGN_KEYWORDS[bigThree.sun.sign].en[0].toLowerCase()} outer expression, while your Moon in ${bigThree.moon.sign} (${moonEl.element}) shapes your emotional inner world as ${SIGN_KEYWORDS[bigThree.moon.sign].en[0].toLowerCase()}.`;

  const relationshipPattern = lang === 'zh'
    ? `你的上升${bigThree.rising.signZh}座赋予你在关系中的独特表达方式。你倾向于被${SIGN_KEYWORDS[bigThree.rising.sign].zh[1] || SIGN_KEYWORDS[bigThree.rising.sign].zh[0]}的伴侣吸引，在亲密关系中需要保持一定程度的独立空间。`
    : `Your Ascendant in ${bigThree.rising.sign} shapes how you appear in relationships. You gravitate toward partners who are ${SIGN_KEYWORDS[bigThree.rising.sign].en[1]?.toLowerCase() || SIGN_KEYWORDS[bigThree.rising.sign].en[0].toLowerCase()}, and you need independence in close partnerships.`;

  const careerPath = lang === 'zh'
    ? `最适合你的事业方向围绕${sunEl.element}能量的表达：${CAREER_TIPS[sunEl.element].zh.slice(0, 3).join('、')}。你的上升座暗示你在公共形象和外在表达上有独特天赋，善用这一优势可以加速职业发展。`
    : `Your ideal career path revolves around expressing ${sunEl.element} energy: ${CAREER_TIPS[sunEl.element].en.slice(0, 3).join(', ')}. Your Ascendant suggests a unique talent for public expression that can accelerate your professional growth.`;

  const riskSignals = lang === 'zh'
    ? `需要注意的是：${sunEl.element}能量若过度发挥，可能导致${RISK_TIPS[sunEl.element].zh.slice(0, 2).join('或')}.建议在重要决策前给自己留出冷静思考的空间。`
    : `Watch out for: ${RISK_TIPS[sunEl.element].en.slice(0, 2).join(' or ')} if your ${sunEl.element} energy is over-expressed. Give yourself space for calm reflection before major decisions.`;

  const sections = [
    { icon: '⚡', title: lang === 'zh' ? '能量结构分析' : 'Energy Structure', content: energyAnalysis, accent: '#A78BFA' },
    { icon: '💫', title: lang === 'zh' ? '关系模式' : 'Relationship Pattern', content: relationshipPattern, accent: '#F472B6' },
    { icon: '💼', title: lang === 'zh' ? '事业发展路径' : 'Career Path', content: careerPath, accent: '#F59E0B' },
    { icon: '⚠️', title: lang === 'zh' ? '风险预警' : 'Risk Signals', content: riskSignals, accent: '#F87171' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sections.map((s, i) => (
        <GlassCard key={i} level="card" className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{s.icon}</span>
            <h3 className="text-sm font-serif font-bold" style={{ color: s.accent }}>{s.title}</h3>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(226,232,240,0.85)' }}>{s.content}</p>
        </GlassCard>
      ))}
    </div>
  );
}

// ─── ApplicationModule ────────────────────────────────────────────────────────

function ApplicationModule({ title, icon, current, future, suggestions, accentColor, lang }: {
  title: string; icon: string; current: string; future: string; suggestions: string[]; accentColor: string; lang: 'zh' | 'en';
}) {
  return (
    <GlassCard level="card" className="p-5">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-base font-serif font-bold text-white">{title}</h3>
      </div>
      <div className="space-y-3">
        <div>
          <div className="text-xs font-medium mb-1" style={{ color: accentColor }}>{lang === 'zh' ? '当前状态' : 'Current State'}</div>
          <p className="text-sm" style={{ color: 'rgba(226,232,240,0.8)' }}>{current}</p>
        </div>
        <div>
          <div className="text-xs font-medium mb-1" style={{ color: accentColor }}>{lang === 'zh' ? '未来趋势' : 'Future Trend'}</div>
          <p className="text-sm" style={{ color: 'rgba(226,232,240,0.8)' }}>{future}</p>
        </div>
        <div>
          <div className="text-xs font-medium mb-1" style={{ color: accentColor }}>{lang === 'zh' ? '行动建议' : 'Action Items'}</div>
          <ul className="space-y-1">
            {suggestions.map((s, i) => (
              <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'rgba(226,232,240,0.8)' }}>
                <span style={{ color: accentColor }}>→</span>{s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </GlassCard>
  );
}

// ─── UpgradeSection ───────────────────────────────────────────────────────────

function UpgradeSection({ lang }: { lang: 'zh' | 'en' }) {
  const features = lang === 'zh'
    ? [
        '详细十年大运逐月分析',
        '关系深度合盘（双人匹配）',
        '个性化年度重点预测',
        '事业发展关键转折点',
        '财富积累最优时间窗口',
        '专属行动方案（AI生成）',
      ]
    : [
        'Detailed decade-by-decade analysis',
        'Deep relationship synastry (two-person)',
        'Personalized annual forecast',
        'Career turning points',
        'Optimal wealth-building windows',
        'AI-generated personalized action plan',
      ];

  return (
    <GlassCard level="strong" className="p-8 text-center relative overflow-hidden border border-white/[0.06] bg-white/[0.02]">
      {/* Premium background */}
      <div className="absolute inset-0 pointer-events-none" />
      <div className="relative z-10">
        <div className="inline-block px-4 py-1.5 rounded-full text-xs font-medium border mb-4"
          style={{ background: 'rgba(251,191,36,0.1)', borderColor: 'rgba(251,191,36,0.3)', color: '#FCD34D' }}>
          ⭐ {lang === 'zh' ? '高级版' : 'Premium'}
        </div>
        <h2 className="text-2xl font-serif font-bold text-white mb-2">
          {lang === 'zh' ? '解锁完整解读' : 'Unlock Full Reading'}
        </h2>
        <p className="text-sm mb-6" style={{ color: 'rgba(226,232,240,0.6)' }}>
          {lang === 'zh' ? '你正在查看基础版。升级后获得完整分析。' : 'You\'re viewing the basic version. Upgrade for complete analysis.'}
        </p>

        {/* Premium features list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8 max-w-lg mx-auto text-left">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(226,232,240,0.75)' }}>
              <span className="text-amber-400 flex-shrink-0">✦</span>{f}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <MysticButton variant="solid" size="lg" className="font-bold">
            {lang === 'zh' ? '解锁完整版' : 'Unlock Full Reading'}
          </MysticButton>
          <MysticButton variant="outline" size="lg">
            {lang === 'zh' ? '先看看' : 'Browse First'}
          </MysticButton>
        </div>

        <p className="text-xs mt-4" style={{ color: 'rgba(226,232,240,0.4)' }}>
          {lang === 'zh' ? '退款保证 · 一次购买 · 永久查看' : 'Money-back guarantee · One-time purchase · Lifetime access'}
        </p>
      </div>
    </GlassCard>
  );
}

// ─── TrustSection ─────────────────────────────────────────────────────────────

function TrustSection({ lang }: { lang: 'zh' | 'en' }) {
  const items = [
    { icon: '🔒', title: lang === 'zh' ? '隐私保护' : 'Privacy', desc: lang === 'zh' ? '你的出生信息仅用于计算，绝不共享或出售' : 'Your birth data is used for calculation only, never shared or sold' },
    { icon: '📊', title: lang === 'zh' ? '数据来源' : 'Data Sources', desc: lang === 'zh' ? '使用瑞士星历表(SWEPH)天文计算，精度达0.001角秒' : 'Swiss Ephemeris (SWEPH) astronomical calculations accurate to 0.001 arcseconds' },
    { icon: '🤖', title: lang === 'zh' ? 'AI边界' : 'AI Limitations', desc: lang === 'zh' ? 'AI解读基于统计学模型，仅供参考，不构成人生决策依据' : 'AI interpretations are statistical models for reference only, not life decision advice' },
    { icon: '⚕️', title: lang === 'zh' ? '免责声明' : 'Disclaimer', desc: lang === 'zh' ? '本产品仅供娱乐参考，不能替代专业医疗、法律或心理建议' : 'For entertainment reference only. Does not replace professional medical, legal, or psychological advice' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item, i) => (
        <GlassCard key={i} level="soft" className="p-4 text-center">
          <div className="text-2xl mb-2">{item.icon}</div>
          <div className="text-xs font-medium text-white mb-1">{item.title}</div>
          <p className="text-xs leading-tight" style={{ color: 'rgba(226,232,240,0.5)' }}>{item.desc}</p>
        </GlassCard>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WesternReportPage() {
  const [birthday, setBirthday] = useState('1990-08-16');
  const [birthTime, setBirthTime] = useState('12:00');
  const [lat, setLat] = useState(35.6762);
  const [lng, setLng] = useState(139.6503);
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [chartData, setChartData] = useState<ChartApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/western', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthDate: birthday, birthTime, lat, lng, language: lang }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Calculation failed'); }
      setChartData(await res.json());
      setShowReport(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [birthday, birthTime, lat, lng, lang]);

  const birthYear = parseInt(birthday.split('-')[0]);
  const keywords = chartData ? computeKeywords(chartData.bigThree, lang) : [];
  const elements = chartData ? computeElements(chartData.planets) : { Fire: 25, Earth: 25, Air: 25, Water: 25 };
  const summary = chartData ? (lang === 'zh' ? SIGN_SUMMARY[chartData.bigThree.sun.sign].zh : SIGN_SUMMARY[chartData.bigThree.sun.sign].en) : '';

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* ─── INPUT SECTION ─── */}
      {!showReport ? (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-lg">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-serif font-bold bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-transparent mb-2">
                {lang === 'zh' ? '生成你的命运仪表盘' : 'Generate Your Life Dashboard'}
              </h1>
              <p className="text-sm" style={{ color: 'rgba(226,232,240,0.5)' }}>
                {lang === 'zh' ? '输入出生信息，获取完整的西方星盘深度解读' : 'Enter your birth info for a complete Western astrology deep reading'}
              </p>
            </div>

            <GlassCard level="strong" className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(251,191,36,0.8)' }}>
                    {lang === 'zh' ? '出生日期' : 'Birthday'}
                  </label>
                  <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white text-sm focus:border-amber-400/60 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(251,191,36,0.8)' }}>
                    {lang === 'zh' ? '出生时间' : 'Birth Time'}
                  </label>
                  <input type="time" value={birthTime} onChange={e => setBirthTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white text-sm focus:border-amber-400/60 focus:outline-none transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(251,191,36,0.8)' }}>
                    {lang === 'zh' ? '纬度' : 'Latitude'}
                  </label>
                  <input type="number" step="0.0001" value={lat} onChange={e => setLat(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white text-sm focus:border-amber-400/60 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(251,191,36,0.8)' }}>
                    {lang === 'zh' ? '经度' : 'Longitude'}
                  </label>
                  <input type="number" step="0.0001" value={lng} onChange={e => setLng(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white text-sm focus:border-amber-400/60 focus:outline-none transition-colors" />
                </div>
              </div>

              {/* Language Toggle */}
              <div className="flex gap-2">
                <button onClick={() => setLang('zh')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${lang === 'zh' ? 'bg-amber-500/20 border border-amber-400/40 text-amber-300' : 'bg-white/[0.03] border border-white/[0.08] text-white/50 hover:text-white/70'}`}>
                  中文
                </button>
                <button onClick={() => setLang('en')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${lang === 'en' ? 'bg-amber-500/20 border border-amber-400/40 text-amber-300' : 'bg-white/[0.03] border border-white/[0.08] text-white/50 hover:text-white/70'}`}>
                  English
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-900/20 border border-red-600/30 text-red-300 text-sm text-center">
                  {error}
                </div>
              )}

              <button onClick={fetchData} disabled={isLoading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? (lang === 'zh' ? '解读中...' : 'Analyzing...') : (lang === 'zh' ? '生成命运仪表盘 →' : 'Generate Life Dashboard →')}
              </button>
            </GlassCard>

            <p className="text-center text-xs mt-4" style={{ color: 'rgba(226,232,240,0.3)' }}>
              {lang === 'zh' ? '使用瑞士星历表计算 · 你的数据仅用于本次计算' : 'Powered by Swiss Ephemeris · Your data is used for this calculation only'}
            </p>
          </div>
        </div>
      ) : (
        /* ─── REPORT SECTION ─── */
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
          {/* Back button */}
          <button onClick={() => setShowReport(false)}
            className="text-xs flex items-center gap-1.5 hover:text-amber-300 transition-colors" style={{ color: 'rgba(226,232,240,0.4)' }}>
            ← {lang === 'zh' ? '重新输入' : 'Re-enter'}
          </button>

          {/* ═══ 1. HERO SUMMARY ═══ */}
          <section>
            <GlassCard level="strong" className="p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-900/10 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10">
                <div className="inline-block px-3 py-1 rounded-full text-xs mb-4 border"
                  style={{ background: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.2)', color: 'rgba(251,191,36,0.7)' }}>
                  {lang === 'zh' ? '命运仪表盘' : 'Life Dashboard'}
                </div>
                <h1 className="text-2xl font-serif font-bold text-white mb-1">
                  {birthday} · {birthTime}
                </h1>
                <p className="text-xs mb-5" style={{ color: 'rgba(226,232,240,0.4)' }}>
                  {lat.toFixed(4)}°, {lng.toFixed(4)}°
                </p>

                {/* Keywords */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {keywords.map((k, i) => <KeywordTag key={i} text={k} />)}
                </div>

                {/* Summary */}
                <p className="text-base leading-relaxed max-w-xl mx-auto mb-6" style={{ color: 'rgba(226,232,240,0.85)' }}>
                  {summary}
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <MysticButton variant="solid" size="md">
                    {lang === 'zh' ? '保存报告' : 'Save Report'}
                  </MysticButton>
                  <MysticButton variant="outline" size="md">
                    {lang === 'zh' ? '解锁深度解读' : 'Unlock Full Reading'}
                  </MysticButton>
                </div>
              </div>
            </GlassCard>
          </section>

          {/* ═══ 2. BIG THREE + ELEMENTS ═══ */}
          <section>
            <div className="text-center mb-4">
              <h2 className="text-xs tracking-widest uppercase mb-1" style={{ color: 'rgba(251,191,36,0.6)' }}>
                {lang === 'zh' ? '核心命盘结构' : 'Core Chart Structure'}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <BigThreeCard label={lang === 'zh' ? '太阳' : 'Sun'} data={chartData!.bigThree.sun} accentColor="#FCD34D" lang={lang} />
              <BigThreeCard label={lang === 'zh' ? '月亮' : 'Moon'} data={chartData!.bigThree.moon} accentColor="#C0C0C0" lang={lang} />
              <BigThreeCard label={lang === 'zh' ? '上升' : 'Rising'} data={chartData!.bigThree.rising} accentColor="#A78BFA" lang={lang} />
            </div>

            {/* Element Bars */}
            <GlassCard level="card" className="p-5">
              <h3 className="text-sm font-serif font-bold mb-4 text-white">{lang === 'zh' ? '五行能量分布' : 'Five Elements Energy Distribution'}</h3>
              <div className="space-y-3">
                {ELEMENTS.map(el => (
                  <div key={el} className="flex items-center gap-3">
                    <span className="text-xs w-8 font-medium" style={{ color: ELEM_COLORS[el] }}>{el === 'Fire' ? '火' : el === 'Earth' ? '土' : el === 'Air' ? '风' : '水'}</span>
                    <div className="flex-1 h-2 rounded-full bg-white/[0.05] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${elements[el]}%` }}
                        transition={{ duration: 1.2, delay: ELEMENTS.indexOf(el) * 0.15, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${ELEM_COLORS[el]}80, ${ELEM_COLORS[el]})` }}
                      />
                    </div>
                    <span className="text-xs w-8 text-right" style={{ color: ELEM_COLORS[el] }}>{elements[el]}%</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </section>

          {/* ═══ 3. CHARTS ═══ */}
          <section>
            <div className="text-center mb-4">
              <h2 className="text-xs tracking-widest uppercase mb-1" style={{ color: 'rgba(251,191,36,0.6)' }}>
                {lang === 'zh' ? '可视化分析' : 'Visual Analysis'}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Energy Radar */}
              <GlassCard level="card" className="p-5">
                <h3 className="text-sm font-serif font-bold mb-3 text-white">{lang === 'zh' ? '能量雷达图' : 'Energy Radar'}</h3>
                <p className="text-xs mb-3" style={{ color: 'rgba(226,232,240,0.4)' }}>
                  {lang === 'zh' ? '你的五行能量结构' : 'Your elemental energy structure'}
                </p>
                <EnergyRadar elements={elements} lang={lang} />
              </GlassCard>

              {/* Life Timeline */}
              <GlassCard level="card" className="p-5">
                <h3 className="text-sm font-serif font-bold mb-3 text-white">{lang === 'zh' ? '人生运势曲线' : 'Life Fortune Curve'}</h3>
                <p className="text-xs mb-3" style={{ color: 'rgba(226,232,240,0.4)' }}>
                  {lang === 'zh' ? '20-75岁 · 综合/事业/感情/财富' : 'Age 20-75 · Overall/Career/Love/Wealth'}
                </p>
                <LifeTimeline birthYear={birthYear} lang={lang} />
              </GlassCard>

              {/* Signal Layers - full width */}
              <div className="md:col-span-2">
                <GlassCard level="card" className="p-5">
                  <h3 className="text-sm font-serif font-bold mb-3 text-white">{lang === 'zh' ? '多维信号叠加图' : 'Multi-Dimensional Signals'}</h3>
                  <p className="text-xs mb-3" style={{ color: 'rgba(226,232,240,0.4)' }}>
                    {lang === 'zh' ? '各维度能量累积 · 事业/感情/财富/健康' : 'Energy accumulation across dimensions · Career/Love/Wealth/Health'}
                  </p>
                  <SignalLayers birthYear={birthYear} lang={lang} />
                </GlassCard>
              </div>
            </div>
          </section>

          {/* ═══ 4. AI DEEP INTERPRETATION ═══ */}
          <section>
            <div className="text-center mb-4">
              <h2 className="text-xs tracking-widest uppercase mb-1" style={{ color: 'rgba(251,191,36,0.6)' }}>
                {lang === 'zh' ? 'AI 深度解读' : 'AI Deep Interpretation'}
              </h2>
            </div>
            <DeepInterpretation bigThree={chartData!.bigThree} planets={chartData!.planets} lang={lang} />
          </section>

          {/* ═══ 5. APPLICATION MODULES ═══ */}
          <section>
            <div className="text-center mb-4">
              <h2 className="text-xs tracking-widest uppercase mb-1" style={{ color: 'rgba(251,191,36,0.6)' }}>
                {lang === 'zh' ? '应用模块' : 'Application Modules'}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ApplicationModule
                title={lang === 'zh' ? '感情关系' : 'Relationships'}
                icon="❤️"
                current={lang === 'zh' ? '你目前在感情中表现出理性与谨慎并存的特质，重视精神层面的交流。' : 'You currently show a blend of rationality and caution in relationships, valuing intellectual connection.'}
                future={lang === 'zh' ? '未来两年感情能量上升，有遇到稳定伴侣的机遇窗口。' : 'Your romantic energy rises over the next two years, with an opportunity window for meeting a stable partner.'}
                suggestions={lang === 'zh' ? ['保持开放但谨慎的态度', '关注沟通而非情绪表达', '避免过早承诺'] : ['Stay open but cautious', 'Focus on communication over emotion', 'Avoid premature commitments']}
                accentColor="#F472B6"
                lang={lang}
              />
              <ApplicationModule
                title={lang === 'zh' ? '事业发展' : 'Career'}
                icon="💼"
                current={lang === 'zh' ? '职业能量正在积累期，适合打磨专业技能和建立行业人脉。' : 'Career energy is in an accumulation phase. Great time to sharpen skills and build industry connections.'}
                future={lang === 'zh' ? '32-40岁是事业上升关键期，40岁左右有晋升或转型机遇。' : 'Age 32-40 is the critical career uptrend period, with promotion or transition opportunities around 40.'}
                suggestions={lang === 'zh' ? ['专注长期积累而非短期回报', '寻找导师或合作伙伴', '敢于展示你的独特优势'] : ['Focus on long-term accumulation', 'Seek mentors or partners', 'Dare to showcase your unique strengths']}
                accentColor="#F59E0B"
                lang={lang}
              />
              <ApplicationModule
                title={lang === 'zh' ? '财富运势' : 'Wealth'}
                icon="💰"
                current={lang === 'zh' ? '财务状况稳定，适合稳健型投资，避免高杠杆操作。' : 'Financial situation is stable. Good for conservative investments, avoid high-leverage moves.'}
                future={lang === 'zh' ? '财富增长曲线平稳向上，40岁前后有一个较大财富积累节点。' : 'Wealth curve trends steadily upward with a major accumulation node around age 40.'}
                suggestions={lang === 'zh' ? ['建立6-12个月应急储备', '配置低风险资产打底', '寻找被动收入来源'] : ['Build 6-12 month emergency fund', 'Allocate low-risk assets as base', 'Find passive income sources']}
                accentColor="#34D399"
                lang={lang}
              />
            </div>
          </section>

          {/* ═══ 6. UPGRADE ═══ */}
          <UpgradeSection lang={lang} />

          {/* ═══ 7. TRUST ═══ */}
          <TrustSection lang={lang} />

          {/* Footer */}
          <div className="text-center text-xs pb-8" style={{ color: 'rgba(226,232,240,0.25)' }}>
            TianJi Global · {lang === 'zh' ? '瑞士星历表精密计算' : 'Swiss Ephemeris Precision Calculation'} · {chartData?.meta.calculationMode}
          </div>
        </div>
      )}
    </main>
  );
}
