'use client';
import { useState } from 'react';

const OUTCOME_COLORS: Record<string, string> = {
  yes: '#10B981',
  no: '#EF4444',
  uncertain: '#F59E0B',
};
const OUTCOME_LABELS: Record<string, string> = {
  yes: '✅ 是',
  no: '❌ 否',
  uncertain: '⚡ 不确定',
};
const OUTCOME_ICONS: Record<string, string> = {
  yes: '✅',
  no: '❌',
  uncertain: '⚡',
};

function WheelChart({ ascSign, ascDegree, planets }: { ascSign: string; ascDegree: number; planets: any[] }) {
  const cx = 150, cy = 150, r = 120;
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const signGlyphs: Record<string, string> = {
    Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
    Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
  };
  const planetGlyphs: Record<string, string> = {
    Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
    Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  };

  return (
    <svg viewBox="0 0 300 300" style={{ maxWidth: '300px', margin: '0 auto', display: 'block' }}>
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#334155" strokeWidth="2" />
      <circle cx={cx} cy={cy} r={r - 20} fill="none" stroke="#1E293B" strokeWidth="18" />
      {/* Sign segments */}
      {signs.map((sign, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x1 = cx + (r - 30) * Math.cos(angle);
        const y1 = cy + (r - 30) * Math.sin(angle);
        const x2 = cx + (r - 10) * Math.cos(angle);
        const y2 = cy + (r - 10) * Math.sin(angle);
        return (
          <g key={sign}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#475569" strokeWidth="1" />
            <text
              x={cx + (r - 45) * Math.cos(angle)}
              y={cy + (r - 45) * Math.sin(angle)}
              fill="#94A3B8"
              fontSize="10"
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${i * 30}, ${cx + (r - 45) * Math.cos(angle)}, ${cy + (r - 45) * Math.sin(angle)})`}
            >
              {signGlyphs[sign]}
            </text>
          </g>
        );
      })}
      {/* ASC marker */}
      <text x={cx} y={cy - r + 5} fill="#F59E0B" fontSize="12" textAnchor="middle" fontWeight="bold">ASC {ascSign}</text>
      {/* Planet positions */}
      {planets.map((p: any, i: number) => {
        const lon = p.longitude ?? 0;
        const angle = (lon - 90) * (Math.PI / 180);
        const px = cx + (r - 55) * Math.cos(angle);
        const py = cy + (r - 55) * Math.sin(angle);
        return (
          <g key={p.planet}>
            <circle cx={px} cy={py} r="8" fill="#1E293B" stroke="#F59E0B" strokeWidth="1" />
            <text x={px} y={py + 3} fill="#fff" fontSize="7" textAnchor="middle" dominantBaseline="middle">
              {planetGlyphs[p.planet] ?? p.planet[0]}
            </text>
          </g>
        );
      })}
      {/* Center */}
      <circle cx={cx} cy={cy} r="30" fill="#0F172A" stroke="#334155" strokeWidth="1" />
      <text x={cx} y={cy - 5} fill="#94A3B8" fontSize="7" textAnchor="middle">HORARY</text>
      <text x={cx} y={cy + 8} fill="#F59E0B" fontSize="8" textAnchor="middle" fontWeight="bold">CHART</text>
    </svg>
  );
}

export default function HoraryPage() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const cast = async () => {
    if (question.trim().length < 3) {
      setError('Please write a meaningful question');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/horary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (data.success) setResult(data);
      else setError(data.error || 'Casting failed');
    } catch {
      setError('Network error, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', color: '#fff', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔮</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            卦占问事 / Horary Astrology
          </h1>
          <p style={{ color: '#94A3B8', marginTop: '0.5rem' }}>
            提问的时刻，便是答案的时刻 · The moment you ask is the moment of insight
          </p>
        </div>

        {/* Question Input */}
        <div style={{ background: '#1E293B', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', color: '#94A3B8', marginBottom: '1rem' }}>YOUR QUESTION</h2>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="静心冥想后，写下你的问题... (e.g. Should I change my career this year?)"
            rows={3}
            style={{
              width: '100%',
              background: '#0F172A',
              border: '1px solid #334155',
              borderRadius: '0.75rem',
              padding: '1rem',
              color: '#fff',
              fontSize: '1rem',
              resize: 'none',
              fontFamily: 'inherit',
              lineHeight: 1.6,
            }}
          />
          <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '0.5rem', textAlign: 'right' }}>
            {question.length} characters
          </div>
        </div>

        {error && (
          <div style={{ background: '#7F1D1D', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', color: '#FCA5A5' }}>{error}</div>
        )}

        {/* Cast Button */}
        <button
          onClick={cast}
          disabled={loading}
          style={{
            width: '100%',
            background: loading ? '#374151' : 'linear-gradient(135deg, #8B5CF6, #6366F1)',
            border: 'none',
            borderRadius: '0.75rem',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: 700,
            color: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '2rem',
          }}
        >
          {loading ? '✨ Casting Chart...' : '🔮 起卦问事 / Cast Your Chart'}
        </button>

        {/* Result */}
        {result && (
          <div>
            {/* Cast Time */}
            <div style={{ background: '#1E293B', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748B' }}>CAST TIME · 起卦时刻</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F59E0B', marginTop: '0.25rem' }}>
                {new Date(result.castTime).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
              </div>
            </div>

            {/* Outcome */}
            <div
              style={{
                background: '#1E293B',
                borderRadius: '1rem',
                padding: '2rem',
                textAlign: 'center',
                marginBottom: '1.5rem',
                border: `2px solid ${OUTCOME_COLORS[result.judgment.outcome]}`,
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{OUTCOME_ICONS[result.judgment.outcome]}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: OUTCOME_COLORS[result.judgment.outcome] }}>
                {OUTCOME_LABELS[result.judgment.outcome]}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.5rem' }}>
                Strength: <span style={{ color: result.judgment.strength === 'strong' ? '#10B981' : result.judgment.strength === 'weak' ? '#EF4444' : '#F59E0B', fontWeight: 700 }}>
                  {result.judgment.strength}
                </span>
              </div>
            </div>

            {/* Chart */}
            <div style={{ background: '#1E293B', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.9rem', color: '#94A3B8', marginBottom: '1rem', textAlign: 'center' }}>PLANETARY CHART</h3>
              {result.chart && (
                <WheelChart
                  ascSign={result.chart.ascSign}
                  ascDegree={result.chart.ascDegree}
                  planets={result.chart.planets}
                />
              )}
            </div>

            {/* Reasons */}
            <div style={{ background: '#1E293B', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.9rem', color: '#94A3B8', marginBottom: '1rem' }}>ANALYSIS · 分析</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {result.judgment.reasons.map((r: string, i: number) => (
                  <div key={i} style={{ fontSize: '0.85rem', color: '#CBD5E1', padding: '0.5rem', background: '#0F172A', borderRadius: '0.375rem' }}>
                    → {r}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#64748B' }}>
                <strong>Significators:</strong> {result.judgment.significators.join(', ')} · House {result.judgment.house} ({result.judgment.houseRuler} rules)
              </div>
            </div>

            {/* Share */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <button
                onClick={() => {
                  const text = `🔮 Horary Reading: "${question}" → ${OUTCOME_LABELS[result.judgment.outcome]} (${result.judgment.strength}) - via TianJi Global`;
                  navigator.clipboard.writeText(text);
                }}
                style={{
                  background: '#334155',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                📤 Share Reading
              </button>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div style={{ textAlign: 'center', marginTop: '2rem', color: '#475569', fontSize: '0.75rem' }}>
          ⚠️ 本解读仅供娱乐参考，不构成任何决策依据 · For entertainment purposes only
        </div>
      </div>
    </div>
  );
}
