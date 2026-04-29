'use client';

/**
 * Numerology — TianJi Global
 *
 * Rewritten under the tianji-cinematic design skill (.claude/skills/tianji-cinematic/SKILL.md).
 * Recipe: §7.1 reading-input page.
 *
 * What changed vs. the previous version:
 *   - Removed Tailwind candy palette (amber/pink/cyan/orange/etc.) — now gold + purple + black only.
 *   - Removed ad-hoc blob blurs — chrome is one <PageChrome /> component.
 *   - Removed `bg-clip-text` rainbow titles — Instrument Serif italic via SmartTitle.
 *   - Removed tab navigation in favor of sequential <LandingSection>s (§4.3 "one idea per beat").
 *   - Replaced raw <div className="bg-white/[0.02]"> cards with <GlassCard>.
 *   - All copy, hero, and trust strip wired through `moduleLandingCopy.numerology`.
 *
 * API and data contracts unchanged — POST /api/numerology with { name, birthdate, language }.
 */

import { useCallback, useMemo, useState } from 'react';
import PDFDownloadButton from '@/components/PDFDownloadButton';
import SharePanel from '@/components/SharePanel';
import {
  BackgroundVideoHero,
  InsightGrid,
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
  expressionNumberReduced?: number;
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

const NARRATIVE_BLOCKS = [
  {
    label: '01 Letters as numbers',
    heading: 'Every letter carries a value.',
    body: 'Pythagorean numerology assigns a number 1–9 to each letter of the Latin alphabet. Your full name and birth date together compress into a small set of repeating signals.',
  },
  {
    label: '02 The three core numbers',
    heading: 'Life path, destiny, soul urge — read together.',
    body: 'Life path comes from the birth date. Destiny from the full name. Soul urge from the vowels alone. Each one says something different about how you move, what you build, and what you quietly want.',
  },
  {
    label: '03 The supporting cast',
    heading: 'Personality, planet, lucky numbers, and days.',
    body: 'Around the three core numbers sit a personality digit, a maturity digit, a ruling planet, and a small set of lucky tokens. They are accent details — not the headline — but they are how the reading lands.',
  },
];

// ──────────────────────────────────────────────
// Number display — cinematic version
// ──────────────────────────────────────────────
// Instead of the rainbow gradient ring, the master numbers (11/22/33) get a
// gold ring and the rest a soft purple ring. Same data, calmer surface.
function NumberDisk({
  value,
  size = 'lg',
}: {
  value: number;
  size?: 'sm' | 'lg';
}) {
  const isMaster = value === 11 || value === 22 || value === 33;
  const dimension = size === 'lg' ? 132 : 76;
  const fontSize = size === 'lg' ? '3.25rem' : '1.85rem';
  return (
    <div
      className="relative flex items-center justify-center font-serif italic"
      style={{
        width: dimension,
        height: dimension,
        borderRadius: '9999px',
        border: `1px solid ${isMaster ? 'rgba(245, 197, 66, 0.5)' : 'rgba(167,139,250,0.35)'}`,
        background:
          'radial-gradient(circle at 30% 30%, rgba(167,139,250,0.18), rgba(10,10,10,0.85) 70%)',
        boxShadow: isMaster
          ? '0 0 36px rgba(245, 197, 66, 0.18)'
          : '0 0 28px rgba(167,139,250,0.18)',
        color: isMaster ? colors.goldLight : colors.textPrimary,
        fontSize,
        lineHeight: 1,
      }}
    >
      {value}
      {isMaster && (
        <span
          aria-hidden="true"
          className="absolute -right-1 -top-1 text-xs"
          style={{ color: colors.goldLight }}
        >
          ★
        </span>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────
export default function NumerologyPage() {
  const [language, setLanguage] = useSyncedLanguage('en');
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [reading, setReading] = useState<NumerologyReading | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = moduleLandingCopy.numerology[language];

  const t = useCallback(
    (en: string, zh: string) => (language === 'zh' ? zh : en),
    [language]
  );

  const calculate = useCallback(async () => {
    if (!name.trim() || !birthdate.trim()) {
      setError(t('Please enter your name and birth date.', '请输入姓名与出生日期'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setReading(null);

    try {
      const response = await fetch('/api/numerology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          birthdate: birthdate.trim(),
          language,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data?.error || t('Calculation failed.', '计算失败 请重试')
        );
      }

      const data: NumerologyReading = await response.json();
      setReading(data);

      saveReading({
        reading_type: 'numerology',
        title: `${data.name} · ${data.birthdate} numerology`,
        summary:
          (language === 'zh'
            ? data.lifePath.descriptionChinese
            : data.lifePath.description
          )?.slice(0, 120) ?? '',
        reading_data: data as unknown as Record<string, unknown>,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('Calculation failed.', '计算失败 请重试')
      );
    } finally {
      setIsLoading(false);
    }
  }, [name, birthdate, language, t]);

  const insightItems = useMemo(() => {
    if (!reading) return [];
    return [
      {
        icon: '✦',
        label: t('Personality', '人格数字'),
        value: String(reading.personalityNumber),
      },
      {
        icon: '✧',
        label: t('Maturity', '成熟数字'),
        value: String(reading.maturityNumber),
      },
      {
        icon: '◌',
        label: t('Ruling planet', '守护行星'),
        value: t(reading.rulingPlanet, reading.rulingPlanetChinese),
      },
      {
        icon: '✺',
        label: t('Element', '五行'),
        value: t(reading.element, reading.elementChinese),
      },
    ];
  }, [reading, t]);

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
        posterSrc="/assets/images/posters/home-hero-poster-16x9.jpg"
        imageSrc="/assets/images/posters/home-hero-poster-16x9.jpg"
        meta={<TrustStrip items={[...copy.trustItems]} className="w-full max-w-3xl" />}
      >
        <ModuleInputShell
          eyebrow={copy.form.eyebrow}
          title={copy.form.title}
          description={copy.form.description}
          footer={copy.form.footer}
        >
          <div className="space-y-5">
            <div>
              <label
                htmlFor="num-full-name"
                className="mb-1.5 block text-[10px] uppercase tracking-[0.28em] text-white/35"
              >
                {t('Full name', '姓名')}
              </label>
              <input
                id="num-full-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('Enter your full name', '输入你的全名')}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white/85 placeholder-white/30 transition-all focus:border-purple-500/40 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="num-birthdate"
                className="mb-1.5 block text-[10px] uppercase tracking-[0.28em] text-white/35"
              >
                {t('Birth date', '出生日期')}
              </label>
              <input
                id="num-birthdate"
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white/85 transition-all focus:border-purple-500/40 focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-white/35">
                {t('Format: YYYY-MM-DD', '格式：YYYY-MM-DD')}
              </p>
            </div>

            <button
              type="button"
              onClick={calculate}
              disabled={isLoading}
              className="w-full rounded-2xl border border-white/[0.14] bg-white/[0.06] px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white/90 transition-all hover:border-white/30 hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                boxShadow: '0 0 36px rgba(245, 197, 66, 0.16)',
              }}
            >
              {isLoading
                ? t('Calculating…', '计算中…')
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

      {/* Pre-result narrative — shown until the user submits */}
      {!reading && !isLoading && (
        <ScrollNarrativeSection
          accentColor="#7c3aed"
          goldColor="#D4AF37"
          blocks={NARRATIVE_BLOCKS}
        />
      )}

      {/* Result */}
      {reading && (
        <>
          <ResultScaffold
            eyebrow={t('YOUR NUMEROLOGY', '你的数字命理')}
            title={t('Your three core numbers are ready.', '你的三个核心数字已经就绪。')}
            subtitle={t(
              'Life path, destiny, soul urge. The calmest entry point first — then the supporting cast below.',
              '生命数 命运数 灵魂数 三个核心数字 先看主线 再展开周边细节。'
            )}
            overview={
              <div className="space-y-7">
                <div>
                  <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                    {t('Three core numbers', '三个核心数字')}
                  </div>
                  <p className="mt-3 max-w-3xl font-serif text-2xl text-white/90 sm:text-3xl">
                    {t(
                      reading.lifePath.description,
                      reading.lifePath.descriptionChinese
                    )}
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  {[
                    {
                      key: 'lifePath',
                      label: t('Life path', '生命数'),
                      result: reading.lifePath,
                    },
                    {
                      key: 'destiny',
                      label: t('Destiny', '命运数'),
                      result: reading.destiny,
                    },
                    {
                      key: 'soulUrge',
                      label: t('Soul urge', '灵魂数'),
                      result: reading.soulUrge,
                    },
                  ].map((item) => {
                    const r = item.result;
                    return (
                      <div
                        key={item.key}
                        className="flex flex-col items-center rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 text-center"
                      >
                        <NumberDisk value={r.number} />
                        <div className="mt-4 text-[10px] uppercase tracking-[0.24em] text-white/40">
                          {item.label}
                        </div>
                        <div className="mt-1 font-serif text-base text-white/85">
                          {t(r.title, r.titleChinese)}
                        </div>
                        {r.isMaster && (
                          <div
                            className="mt-2 text-[10px] uppercase tracking-[0.2em]"
                            style={{ color: colors.goldLight }}
                          >
                            ★ {t('Master number', '大师数字')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            }
            highlights={
              <div className="space-y-5">
                <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                  {t('Lucky tokens', '幸运指标')}
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-white/40">
                      {t('Lucky numbers', '幸运数字')}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {reading.luckyNumbers.map((n) => (
                        <span
                          key={n}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] font-serif text-sm text-white/85"
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-white/40">
                      {t('Lucky days', '幸运日')}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(language === 'zh'
                        ? reading.luckyDaysChinese
                        : reading.luckyDays
                      ).map((d) => (
                        <span
                          key={d}
                          className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-white/75"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/[0.06] pt-5">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/40">
                    {t('Compatibility', '兼容性')}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(language === 'zh'
                      ? reading.compatibilityChinese
                      : reading.compatibility
                    ).map((c) => (
                      <span
                        key={c}
                        className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-white/75"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            }
            details={
              <div className="space-y-6">
                <div>
                  <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                    {t('Life path', '生命数')}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/72 sm:text-base">
                    {t(reading.lifePath.description, reading.lifePath.descriptionChinese)}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(language === 'zh'
                      ? reading.lifePath.traitsChinese
                      : reading.lifePath.traits
                    ).map((trait) => (
                      <span
                        key={trait}
                        className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-white/75"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/[0.06] pt-5">
                  <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                    {t('Destiny', '命运数')}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/72 sm:text-base">
                    {t(reading.destiny.description, reading.destiny.descriptionChinese)}
                  </p>
                  <p className="mt-3 text-xs text-white/40">
                    {t('Full name value', '姓名总值')}: {reading.destiny.nameValue} ·{' '}
                    {t('Expression', '表现数')}: {reading.destiny.expressionNumber}
                    {typeof reading.destiny.expressionNumberReduced === 'number'
                      ? ` → ${reading.destiny.expressionNumberReduced}`
                      : null}
                  </p>
                </div>

                <div className="border-t border-white/[0.06] pt-5">
                  <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                    {t('Soul urge', '灵魂数')}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/72 sm:text-base">
                    {t(reading.soulUrge.description, reading.soulUrge.descriptionChinese)}
                  </p>
                  <p className="mt-3 text-xs text-white/40">
                    {t('Vowels found', '检测到的元音')}:{' '}
                    {reading.soulUrge.vowels.join(', ')} ·{' '}
                    {t('Vowel value', '元音总值')}: {reading.soulUrge.vowelValue}
                  </p>
                </div>
              </div>
            }
            aside={
              <div className="space-y-5">
                <div>
                  <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                    {t('Identity panel', '身份面板')}
                  </div>
                  <div
                    className="mt-4 font-serif text-2xl"
                    style={{ color: colors.textPrimary }}
                  >
                    {reading.name}
                  </div>
                  <div className="mt-1 text-xs text-white/45">{reading.birthdate}</div>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                    {t('Around the core', '核心之外')}
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-white/65">
                    <p>
                      {t('Personality', '人格数字')}:{' '}
                      <span className="text-white/85">
                        {reading.personalityNumber}
                      </span>
                    </p>
                    <p>
                      {t('Maturity', '成熟数字')}:{' '}
                      <span className="text-white/85">
                        {reading.maturityNumber}
                      </span>
                    </p>
                    <p>
                      {t('Ruling planet', '守护行星')}:{' '}
                      <span className="text-white/85">
                        {t(reading.rulingPlanet, reading.rulingPlanetChinese)}
                      </span>
                    </p>
                    <p>
                      {t('Element', '五行')}:{' '}
                      <span className="text-white/85">
                        {t(reading.element, reading.elementChinese)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            }
          />

          <InsightGrid
            title={t('The supporting cast', '核心之外的细节')}
            subtitle={t(
              'Personality, maturity, planet, and element — read at a glance.',
              '人格数字 成熟数字 守护行星 与五行 一眼看清。'
            )}
            items={insightItems}
            accentColor="#7c3aed"
            goldColor="#D4AF37"
          />

          <LandingSection
            eyebrow={t('Share & save', '分享与保存')}
            title={t(
              'Keep this reading, or send it to someone who would understand.',
              '把这次解读保存下来 或送给真正会读它的人。'
            )}
            subtitle={t(
              'Saved to your reading history automatically. Export or share when you want to.',
              '已自动保存到你的解读历史 需要时再导出或分享。'
            )}
          >
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <GlassCard
                level="card"
                className="rounded-[1.75rem] border border-white/[0.06] bg-black/20 p-6 sm:p-8"
              >
                <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                  {t('Share panel', '分享面板')}
                </div>
                <p className="mt-3 text-sm leading-7 text-white/60">
                  {t(
                    'QR code, social links, copy-to-clipboard. Send a TianJi reading the way you would send a chapter.',
                    '二维码 社交链接 一键复制 把这次解读像送一章书一样递出去。'
                  )}
                </p>
                <div className="mt-5">
                  <SharePanel
                    serviceType="numerology"
                    resultId={`numerology-${reading.name}-${reading.birthdate}`}
                    shareUrl={`https://tianji.global/numerology?name=${encodeURIComponent(reading.name)}`}
                  />
                </div>
              </GlassCard>

              <GlassCard
                level="strong"
                className="rounded-[1.75rem] border border-white/[0.08] bg-black/30 p-6 sm:p-8"
              >
                <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                  {t('PDF export', 'PDF 导出')}
                </div>
                <p className="mt-3 text-sm leading-7 text-white/60">
                  {t(
                    'A static, type-set PDF — for inboxes, journals, and anyone who reads slowly.',
                    '一份静态的 排版整齐的 PDF —— 给收件箱 给日记本 给读得慢的人。'
                  )}
                </p>
                <div className="mt-5">
                  <PDFDownloadButton
                    serviceType="numerology"
                    resultData={reading as unknown as Record<string, unknown>}
                    language={language}
                  />
                </div>
              </GlassCard>
            </div>
          </LandingSection>
        </>
      )}

      {/* Footer beat — present whether or not a reading is up */}
      <div className="px-6 pb-16 pt-8 text-center text-xs uppercase tracking-[0.28em] text-white/30">
        {t('TianJi · Pythagorean numerology', 'TianJi · 毕达哥拉斯数字命理')}
      </div>
    </main>
  );
}
