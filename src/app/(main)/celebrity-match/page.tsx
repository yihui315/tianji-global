'use client';

/**
 * Celebrity Match — TianJi Global
 *
 * Rewritten under the tianji-cinematic design skill (.claude/skills/tianji-cinematic/SKILL.md).
 * Recipe: §7.1 reading-input page (single-input, ranked-list output variant).
 *
 * What changed vs. the previous version:
 *   - Removed Tailwind candy palette (indigo/amber/yellow/pink/red avatar palette) — gold + purple + black only.
 *   - Removed `bg-clip-text` rainbow title — Instrument Serif italic via BackgroundVideoHero.
 *   - Removed `bg-white dark:bg-gray-800` light/dark theming — all surfaces are dark glass.
 *   - Removed rainbow ASPECT_COLORS — aspects are bucketed as supportive (gold/purple) vs challenging (riskRed).
 *   - Removed multi-color Avatar palette — single neutral monogram disk.
 *   - Wrapped each match in <GlassCard>; ResultScaffold holds the ranked list.
 *   - All copy, hero, trust strip wired through `moduleLandingCopy.celebrityMatch`.
 *   - Added saveReading() on success.
 *
 * API contract preserved — POST /api/celebrity-match with { birthDate, birthTime, lat, lng }.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import SharePanel from '@/components/SharePanel';
import {
  BackgroundVideoHero,
  LandingSection,
  ModuleInputShell,
  PageChrome,
  ResultScaffold,
  ScrollNarrativeSection,
  TrustStrip,
} from '@/components/landing';
import { GlassCard, LanguageSwitch } from '@/components/ui';
import { colors } from '@/design-system';
import { useSyncedLanguage } from '@/hooks/useSyncedLanguage';
import { moduleLandingCopy } from '@/lib/language-routing';
import { saveReading } from '@/lib/save-reading';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CelebrityEntry {
  id: string;
  name: string;
  birthDate: string;
  birthTime: string;
  lat: number;
  lng: number;
  profession: string;
  description: string;
}

interface MatchReason {
  planet1: string;
  planet2: string;
  aspectType: string;
  description: string;
}

interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  exactAngle: number;
  orb: number;
  strength: number;
  polarity: string;
  polarityScore: number;
}

interface CelebrityMatch {
  celebrity: CelebrityEntry;
  matchScore: number;
  sunScore: number;
  moonScore: number;
  venusScore: number;
  marsScore: number;
  reasons: MatchReason[];
  aspects: Aspect[];
}

interface ApiResponse {
  matches: CelebrityMatch[];
  userInput: { birthDate: string; birthTime: string; lat: number; lng: number };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
};

const PLANET_LABELS_ZH: Record<string, string> = {
  Sun: '太阳', Moon: '月亮', Venus: '金星', Mars: '火星',
  Mercury: '水星', Jupiter: '木星', Saturn: '土星',
};

const PLANET_LABELS_EN: Record<string, string> = {
  Sun: 'Sun', Moon: 'Moon', Venus: 'Venus', Mars: 'Mars',
  Mercury: 'Mercury', Jupiter: 'Jupiter', Saturn: 'Saturn',
};

// Aspects bucketed as supportive vs challenging — no rainbow.
const SUPPORTIVE_ASPECTS = new Set(['Conjunction', 'Sextile', 'Trine']);
const ASPECT_LABELS_ZH: Record<string, string> = {
  Conjunction: '合相', Sextile: '六分相', Square: '四分相',
  Trine: '三分相', Opposition: '对分相',
};
const ASPECT_LABELS_EN: Record<string, string> = {
  Conjunction: 'Conjunction', Sextile: 'Sextile', Square: 'Square',
  Trine: 'Trine', Opposition: 'Opposition',
};

const CITY_COORDS: Record<string, [number, number]> = {
  beijing: [39.9042, 116.4074],
  shanghai: [31.2304, 121.4737],
  'new york': [40.7128, -74.006],
  london: [51.5074, -0.1278],
  paris: [48.8566, 2.3522],
  tokyo: [35.6762, 139.6503],
  'los angeles': [34.0522, -118.2437],
  'san francisco': [37.7749, -122.4194],
  'hong kong': [22.3193, 114.1694],
  taipei: [25.033, 121.5654],
};

const NARRATIVE_BLOCKS = [
  {
    label: '01 Four-planet resonance',
    heading: 'Sun, moon, Venus, and Mars — together as a tone.',
    body: 'These four planets describe core self, inner emotional weather, what you find beautiful, and what you reach for. Compare two charts on these four and you have a fingerprint of how someone runs.',
  },
  {
    label: '02 Aspects, not signs alone',
    heading: 'It is the angle between planets that gives the music.',
    body: 'Two charts that share the same Sun sign can still feel completely different. The aspect — conjunction, trine, sextile, square, opposition — and how tight it is, that is what we score on.',
  },
  {
    label: '03 Resonance, not destiny',
    heading: 'A high score is a tuning fork, not a verdict.',
    body: 'You will see who hums most like you on each planet. Read this as: here are figures whose work and life rhythm you may find naturally legible — not a roadmap of who to be.',
  },
];

// ─── Subcomponents ────────────────────────────────────────────────────────────

// Single-tone monogram disk. No rainbow palette.
function MonogramDisk({ name, size = 56 }: { name: string; size?: number }) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-serif"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        border: '1px solid rgba(167,139,250,0.35)',
        background: 'radial-gradient(circle at 30% 30%, rgba(167,139,250,0.18), rgba(10,10,10,0.85) 70%)',
        color: colors.textPrimary,
      }}
    >
      {initials}
    </div>
  );
}

// Animated score bar with single neutral fill.
function ScoreBar({ score, label }: { score: number; label: string }) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const duration = 900;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * score));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [score]);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em]">
        <span className="text-white/45">{label}</span>
        <span className="font-serif text-sm text-white/85">{displayed}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${displayed}%`,
            background: 'linear-gradient(90deg, rgba(167,139,250,0.7), rgba(212,175,55,0.7))',
          }}
        />
      </div>
    </div>
  );
}

function aspectColor(type: string): string {
  return SUPPORTIVE_ASPECTS.has(type) ? colors.purpleLight : colors.riskRed;
}

function MatchCard({
  match,
  index,
  expanded,
  onToggle,
  language,
}: {
  match: CelebrityMatch;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  language: 'zh' | 'en';
}) {
  const planetLabels = language === 'zh' ? PLANET_LABELS_ZH : PLANET_LABELS_EN;
  const aspectLabels = language === 'zh' ? ASPECT_LABELS_ZH : ASPECT_LABELS_EN;
  const rankLabel = language === 'zh' ? `第 ${index + 1} 位` : `Rank ${index + 1}`;
  const overallColor =
    match.matchScore >= 70 ? colors.gold :
    match.matchScore >= 50 ? colors.purpleLight :
    colors.goldLight;

  return (
    <GlassCard
      level="card"
      className="overflow-hidden rounded-[1.5rem] border border-white/[0.06] bg-black/20"
    >
      {/* Header — clickable */}
      <button
        type="button"
        onClick={onToggle}
        className="block w-full p-5 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-4">
          <div className="text-[10px] uppercase tracking-[0.28em] text-white/40">
            {rankLabel}
          </div>
          <MonogramDisk name={match.celebrity.name} size={56} />
          <div className="min-w-0 flex-1">
            <div className="font-serif text-lg text-white/90">
              {match.celebrity.name}
            </div>
            <div className="mt-0.5 text-xs text-white/50">
              {match.celebrity.profession}
            </div>
            <div className="mt-1 text-[11px] text-white/35">
              {match.celebrity.birthDate} {match.celebrity.birthTime}
            </div>
          </div>
          <div className="text-right">
            <div
              className="font-serif text-4xl"
              style={{ color: overallColor }}
            >
              {match.matchScore}%
            </div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">
              {language === 'zh' ? '匹配度' : 'Match'}
            </div>
          </div>
        </div>

        {/* Mini score bars */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <ScoreBar score={match.sunScore} label={`☉ ${planetLabels.Sun}`} />
          <ScoreBar score={match.moonScore} label={`☽ ${planetLabels.Moon}`} />
          <ScoreBar score={match.venusScore} label={`♀ ${planetLabels.Venus}`} />
          <ScoreBar score={match.marsScore} label={`♂ ${planetLabels.Mars}`} />
        </div>

        {/* Top reason */}
        {match.reasons.length > 0 && (
          <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <p className="text-xs leading-6 text-white/70">
              ✦ {match.reasons[0].description}
            </p>
          </div>
        )}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="space-y-4 border-t border-white/[0.06] px-5 py-5">
          <p className="text-sm leading-7 text-white/72">
            {match.celebrity.description}
          </p>

          <div>
            <div className="mb-3 text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
              {language === 'zh' ? '相位分析' : 'Aspect breakdown'}
            </div>
            <div className="space-y-2">
              {match.reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="shrink-0 text-base text-white/60">
                    {PLANET_SYMBOLS[r.planet1] || '·'}
                  </span>
                  <div className="flex-1">
                    <span className="text-xs text-white/75">
                      {planetLabels[r.planet1] || r.planet1}
                    </span>
                    <span
                      className="ml-2 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-[0.18em]"
                      style={{
                        border: `1px solid ${aspectColor(r.aspectType)}55`,
                        color: aspectColor(r.aspectType),
                      }}
                    >
                      {aspectLabels[r.aspectType] || r.aspectType}
                    </span>
                    <p className="mt-1 text-xs leading-6 text-white/55">{r.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {match.aspects.length > 0 && (
            <div>
              <div className="mb-3 text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                {language === 'zh' ? '行星相位' : 'Planet aspects'}
              </div>
              <div className="flex flex-wrap gap-2">
                {match.aspects.slice(0, 6).map((asp, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px]"
                    style={{
                      border: `1px solid ${aspectColor(asp.type)}44`,
                      color: aspectColor(asp.type),
                    }}
                  >
                    <span>{PLANET_SYMBOLS[asp.planet1] || asp.planet1[0]}</span>
                    <span>{aspectLabels[asp.type] || asp.type}</span>
                    <span>{PLANET_SYMBOLS[asp.planet2] || asp.planet2[0]}</span>
                    <span className="text-white/40">{asp.strength}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onToggle}
        className="w-full border-t border-white/[0.06] py-2 text-[10px] uppercase tracking-[0.22em] text-white/40 transition-colors hover:text-white/65"
      >
        {expanded
          ? (language === 'zh' ? '收起详情 ▲' : 'Collapse ▲')
          : (language === 'zh' ? '展开详情 ▼' : 'Expand ▼')}
      </button>
    </GlassCard>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CelebrityMatchPage() {
  const [language, setLanguage] = useSyncedLanguage('en');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [lat, setLat] = useState('39.9042');
  const [lng, setLng] = useState('116.4074');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [matches, setMatches] = useState<CelebrityMatch[]>([]);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  const copy = moduleLandingCopy.celebrityMatch[language];

  const t = useCallback(
    (en: string, zh: string) => (language === 'zh' ? zh : en),
    [language]
  );

  const handlePlaceChange = (place: string) => {
    setBirthPlace(place);
    const lower = place.toLowerCase().trim();
    if (CITY_COORDS[lower]) {
      setLat(CITY_COORDS[lower][0].toString());
      setLng(CITY_COORDS[lower][1].toString());
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!birthDate || !birthTime) {
      setError(t('Please enter your birth date and time.', '请输入生日日期和时间'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/celebrity-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate,
          birthTime,
          lat: parseFloat(lat) || 39.9042,
          lng: parseFloat(lng) || 116.4074,
        }),
      });
      if (!res.ok) throw new Error(t('Request failed', '请求失败'));
      const data: ApiResponse = await res.json();
      setMatches(data.matches);
      setExpandedIdx(0);

      saveReading({
        reading_type: 'celebrity-match',
        title: `Celebrity match · ${birthDate} ${birthTime}`,
        summary: data.matches
          .slice(0, 3)
          .map((m) => `${m.celebrity.name} (${m.matchScore}%)`)
          .join(', '),
        reading_data: data as unknown as Record<string, unknown>,
      });
    } catch {
      setError(t('Calculation failed. Please try again.', '计算出错，请稍后重试'));
    } finally {
      setLoading(false);
    }
  }, [birthDate, birthTime, lat, lng, t]);

  return (
    <main className="relative min-h-screen overflow-x-hidden text-white">
      <PageChrome disableSpotlight />

      <div className="fixed right-4 top-4 z-50">
        <LanguageSwitch />
      </div>

      <BackgroundVideoHero
        eyebrow={copy.hero.eyebrow}
        title={copy.hero.title}
        subtitle={copy.hero.subtitle}
        description={copy.hero.description}
        posterSrc="/assets/images/posters/western-hero-poster-16x9.jpg"
        imageSrc="/assets/images/posters/western-hero-poster-16x9.jpg"
        meta={<TrustStrip items={[...copy.trustItems]} className="w-full max-w-3xl" />}
      >
        <ModuleInputShell
          eyebrow={copy.form.eyebrow}
          title={copy.form.title}
          description={copy.form.description}
          footer={copy.form.footer}
        >
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="cm-birth-date"
                  className="mb-1.5 block text-[10px] uppercase tracking-[0.28em] text-white/35"
                >
                  {t('Birth date', '出生日期')}
                </label>
                <input
                  id="cm-birth-date"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white/85 transition-all focus:border-purple-500/40 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="cm-birth-time"
                  className="mb-1.5 block text-[10px] uppercase tracking-[0.28em] text-white/35"
                >
                  {t('Birth time', '出生时间')}
                </label>
                <input
                  id="cm-birth-time"
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white/85 transition-all focus:border-purple-500/40 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="cm-birth-place"
                className="mb-1.5 block text-[10px] uppercase tracking-[0.28em] text-white/35"
              >
                {t('Birth place', '出生地点')}
              </label>
              <input
                id="cm-birth-place"
                type="text"
                placeholder={t(
                  'Enter a city — Beijing, New York, London, Paris, Tokyo…',
                  '输入城市名称，如 Beijing, New York, London…'
                )}
                value={birthPlace}
                onChange={(e) => handlePlaceChange(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white/85 placeholder-white/30 transition-all focus:border-purple-500/40 focus:outline-none"
              />
              <p className="mt-2 text-[11px] text-white/35">
                {t(
                  'Resolved cities: Beijing, Shanghai, New York, London, Paris, Tokyo, Los Angeles, San Francisco, Hong Kong, Taipei.',
                  '已支持: Beijing, Shanghai, New York, London, Paris, Tokyo, Los Angeles, Hong Kong, Taipei'
                )}
              </p>
            </div>

            <details className="group">
              <summary className="cursor-pointer list-none text-[11px] uppercase tracking-[0.22em] text-white/35 transition-colors hover:text-white/65">
                {t(`Advanced — manual coordinates (${lat}, ${lng})`, `高级 — 手动设置坐标 (${lat}, ${lng})`)}
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="cm-latitude"
                    className="mb-1 block text-[10px] uppercase tracking-[0.22em] text-white/35"
                  >
                    {t('Latitude', '纬度')}
                  </label>
                  <input
                    id="cm-latitude"
                    type="number"
                    step="0.0001"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-white/85 transition-all focus:border-purple-500/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="cm-longitude"
                    className="mb-1 block text-[10px] uppercase tracking-[0.22em] text-white/35"
                  >
                    {t('Longitude', '经度')}
                  </label>
                  <input
                    id="cm-longitude"
                    type="number"
                    step="0.0001"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-white/85 transition-all focus:border-purple-500/40 focus:outline-none"
                  />
                </div>
              </div>
            </details>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-2xl border border-white/[0.14] bg-white/[0.06] px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white/90 transition-all hover:border-white/30 hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ boxShadow: '0 0 36px rgba(245, 197, 66, 0.16)' }}
            >
              {loading
                ? t('Matching…', '计算中…')
                : copy.primaryCta}
            </button>
          </div>
        </ModuleInputShell>
      </BackgroundVideoHero>

      {/* Error banner */}
      {error && (
        <div className="mx-auto max-w-4xl px-6 py-8 sm:px-8">
          <GlassCard
            level="card"
            className="rounded-[1.5rem] border border-rose-500/30 bg-rose-500/10 p-4 text-rose-100"
          >
            {error}
          </GlassCard>
        </div>
      )}

      {/* Pre-result narrative */}
      {matches.length === 0 && !loading && !error && (
        <ScrollNarrativeSection
          accentColor="#7c3aed"
          goldColor="#D4AF37"
          blocks={NARRATIVE_BLOCKS}
        />
      )}

      {/* Result */}
      {matches.length > 0 && (
        <>
          <ResultScaffold
            eyebrow={t('YOUR CELEBRITY MATCHES', '你的名人匹配')}
            title={t(
              'These charts hum closest to yours.',
              '这些星盘 与你共鸣最强。'
            )}
            subtitle={t(
              'Sun, moon, Venus, and Mars compared as a tone — read it as resonance, not destiny.',
              '太阳 月亮 金星 火星 当作一种音色 把它读成共鸣 而不是命运。'
            )}
            overview={
              <div className="space-y-5">
                {matches.map((m, i) => (
                  <MatchCard
                    key={m.celebrity.id}
                    match={m}
                    index={i}
                    expanded={expandedIdx === i}
                    onToggle={() => setExpandedIdx(expandedIdx === i ? null : i)}
                    language={language}
                  />
                ))}
              </div>
            }
            highlights={
              <div className="space-y-4">
                <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                  {t('Algorithm at a glance', '算法说明')}
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { icon: '☉', labelEn: 'Sun', labelZh: '太阳', descEn: 'Core self · 30%', descZh: '核心自我 30%' },
                    { icon: '☽', labelEn: 'Moon', labelZh: '月亮', descEn: 'Inner weather · 25%', descZh: '情感世界 25%' },
                    { icon: '♀', labelEn: 'Venus', labelZh: '金星', descEn: 'Aesthetic · 22%', descZh: '爱情审美 22%' },
                    { icon: '♂', labelEn: 'Mars', labelZh: '火星', descEn: 'Drive · 23%', descZh: '行动欲望 23%' },
                  ].map((item) => (
                    <GlassCard
                      key={item.labelEn}
                      level="soft"
                      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 text-center"
                    >
                      <div className="text-2xl" style={{ color: colors.goldLight }}>
                        {item.icon}
                      </div>
                      <div className="mt-1 text-xs text-white/85">
                        {language === 'zh' ? item.labelZh : item.labelEn}
                      </div>
                      <div className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-white/40">
                        {language === 'zh' ? item.descZh : item.descEn}
                      </div>
                    </GlassCard>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-6 text-white/50">
                  {t(
                    'Tightness of conjunction, trine, sextile, square, and opposition aspects determine the score. Same-sign and same-element pairings add bonuses.',
                    '通过合相 三分相 六分相 四分相 对分相的紧密程度计算匹配度 同星座加分 同元素加分。'
                  )}
                </p>
              </div>
            }
            details={null}
            aside={null}
          />

          <LandingSection
            eyebrow={t('Share', '分享')}
            title={t(
              'Send this list to someone who would understand.',
              '把这份名单发给真正会读它的人。'
            )}
            subtitle={t(
              'Saved to your reading history automatically.',
              '已自动保存到你的解读历史。'
            )}
          >
            <GlassCard
              level="card"
              className="mx-auto max-w-2xl rounded-[1.75rem] border border-white/[0.06] bg-black/20 p-6 sm:p-8"
            >
              <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                {t('Share panel', '分享面板')}
              </div>
              <p className="mt-3 text-sm leading-7 text-white/60">
                {t(
                  'QR code, social links, copy-to-clipboard.',
                  '二维码 社交链接 一键复制。'
                )}
              </p>
              <div className="mt-5">
                <SharePanel
                  serviceType="celebrity-match"
                  resultId={matches[0]?.celebrity.id ?? 'result'}
                  shareUrl={`https://tianji.global/celebrity-match`}
                />
              </div>
            </GlassCard>
          </LandingSection>
        </>
      )}

      {/* Footer beat */}
      <div className="px-6 pb-16 pt-8 text-center text-xs uppercase tracking-[0.28em] text-white/30">
        {t('TianJi · Western astrology celebrity match', 'TianJi · 西方占星名人匹配')}
      </div>
    </main>
  );
}
