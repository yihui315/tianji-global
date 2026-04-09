'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const EVENT_TYPES = [
  { id: 'business_launch', icon: '💼', label: '商业开业', en: 'Business Launch' },
  { id: 'marriage', icon: '💍', label: '婚姻嫁娶', en: 'Marriage' },
  { id: 'travel', icon: '✈️', label: '出行旅游', en: 'Travel' },
  { id: 'surgery', icon: '🏥', label: '择期手术', en: 'Surgery' },
  { id: 'legal', icon: '⚖️', label: '法律诉讼', en: 'Legal' },
  { id: 'education', icon: '📚', label: '学业考试', en: 'Education' },
];

function getMoonEmoji(phase: string) {
  if (phase === 'waxing' || phase === 'full') return '🌒';
  if (phase === 'waning') return '🌘';
  return '🌑';
}

export default function ElectionalPage() {
  const [eventType, setEventType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  const calculate = async () => {
    if (!eventType || !startDate || !endDate) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/electional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType, startDate, endDate }),
      });
      const data = await res.json();
      if (data.success) setResults(data);
      else setError(data.error || 'Calculation failed');
    } catch {
      setError('Network error, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', color: '#fff', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📅</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, background: 'linear-gradient(135deg, #10B981, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            择日择时 / Electional Astrology
          </h1>
          <p style={{ color: '#94A3B8', marginTop: '0.5rem' }}>
            Find the most auspicious moment for your important life events
          </p>
        </div>

        {/* Event Type Selector */}
        <div style={{ background: '#1E293B', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', color: '#94A3B8', marginBottom: '1rem' }}>SELECT EVENT TYPE</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
            {EVENT_TYPES.map((et) => (
              <button
                key={et.id}
                onClick={() => setEventType(et.id)}
                style={{
                  background: eventType === et.id ? 'linear-gradient(135deg, #059669, #10B981)' : '#334155',
                  border: eventType === et.id ? '2px solid #10B981' : '2px solid transparent',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  cursor: 'pointer',
                  color: '#fff',
                  transition: 'all 0.2s',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{et.icon}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{et.label}</div>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{et.en}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div style={{ background: '#1E293B', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', color: '#94A3B8', marginBottom: '1rem' }}>DATE RANGE (MAX 90 DAYS)</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>START DATE</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ width: '100%', background: '#0F172A', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.5rem', color: '#fff', fontSize: '0.9rem' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>END DATE</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ width: '100%', background: '#0F172A', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.5rem', color: '#fff', fontSize: '0.9rem' }}
              />
            </div>
          </div>
        </div>

        {error && <div style={{ background: '#7F1D1D', border: '1px solid #EF4444', borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '1rem', color: '#FCA5A5' }}>{error}</div>}

        {/* Calculate Button */}
        <button
          onClick={calculate}
          disabled={loading || !eventType || !startDate || !endDate}
          style={{
            width: '100%',
            background: loading ? '#374151' : 'linear-gradient(135deg, #10B981, #059669)',
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
          {loading ? '⚡ Calculating Best Dates...' : '🔍 Find Best Dates'}
        </button>

        {/* Results */}
        {results?.candidates?.length > 0 && (
          <div>
            {/* Top 3 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {results.candidates.slice(0, 3).map((c: any, i: number) => {
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <div key={i} style={{ background: '#1E293B', borderRadius: '0.75rem', padding: '1rem', textAlign: 'center', border: i === 0 ? '2px solid #F59E0B' : '1px solid #334155' }}>
                    <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{medals[i]}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                      {new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: c.score >= 70 ? '#10B981' : c.score >= 50 ? '#F59E0B' : '#EF4444', marginTop: '0.25rem' }}>
                      {c.score}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#64748B', marginTop: '0.25rem' }}>{getMoonEmoji(c.moonPhase)} {c.moonPhase}</div>
                  </div>
                );
              })}
            </div>

            {/* Full List */}
            <div style={{ background: '#1E293B', borderRadius: '1rem', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1rem', color: '#94A3B8', marginBottom: '1rem' }}>ALL CANDIDATES</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {results.candidates.map((c: any, i: number) => {
                  const scoreColor = c.score >= 70 ? '#10B981' : c.score >= 50 ? '#F59E0B' : '#EF4444';
                  return (
                    <div key={i} style={{ background: '#0F172A', borderRadius: '0.5rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748B', minWidth: '60px' }}>
                        #{i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                          {new Date(c.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
                          {getMoonEmoji(c.moonPhase)} {c.moonPhase} · {c.voidOfCourse ? '⚠️ Void-of-course' : '✓ Moon active'}
                        </div>
                        {c.highlights.length > 0 && (
                          <div style={{ fontSize: '0.7rem', color: '#10B981', marginTop: '0.25rem' }}>{c.highlights.join(' · ')}</div>
                        )}
                        {c.warnings.length > 0 && (
                          <div style={{ fontSize: '0.7rem', color: '#F59E0B', marginTop: '0.25rem' }}>{c.warnings.join(' · ')}</div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: scoreColor }}>{c.score}</div>
                        <div style={{ fontSize: '0.65rem', color: '#64748B' }}>/ 100</div>
                      </div>
                      {/* Score bar */}
                      <div style={{ width: '60px', height: '4px', background: '#334155', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${c.score}%`, height: '100%', background: scoreColor, transition: 'width 0.3s' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div style={{ textAlign: 'center', marginTop: '3rem', color: '#475569', fontSize: '0.75rem' }}>
          ⚠️ This service is for entertainment reference only and does not constitute any decision-making basis.
        </div>
      </div>
    </div>
  );
}
