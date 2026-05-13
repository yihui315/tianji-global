'use client';

import { useState, type ComponentType } from 'react';
import { AlertTriangle, Heart, MessageCircleHeart, RefreshCw, ShieldCheck, Sparkles, Timer } from 'lucide-react';

import { TianjiLovePanel } from '@/components/tianji-love';
import { trackRelationshipEvent } from '@/lib/analytics/track';
import type {
  RelationshipDimension,
  RelationshipType,
  RelationshipVariant,
} from '@/lib/analytics/relationship-events';
import type { RelationshipDimensionScore } from '@/types/relationship';
import type { Language } from '@/types/reading';

type IconComponent = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

const DIMENSION_META: Record<string, { icon: IconComponent; color: string; bgColor: string }> = {
  attraction: { icon: Heart, color: '#FF8F83', bgColor: 'rgba(255,143,131,0.1)' },
  communication: { icon: MessageCircleHeart, color: '#D8B77B', bgColor: 'rgba(216,183,123,0.1)' },
  conflict: { icon: AlertTriangle, color: '#F87171', bgColor: 'rgba(248,113,113,0.1)' },
  rhythm: { icon: Timer, color: '#34D399', bgColor: 'rgba(52,211,153,0.1)' },
  longTerm: { icon: ShieldCheck, color: '#F5B35D', bgColor: 'rgba(245,179,93,0.1)' },
};

const DIMENSION_LABELS = {
  zh: {
    attraction: '吸引力',
    communication: '沟通方式',
    conflict: '冲突模式',
    rhythm: '节奏匹配',
    longTerm: '长期稳定',
  },
  en: {
    attraction: 'Attraction',
    communication: 'Communication',
    conflict: 'Conflict pattern',
    rhythm: 'Rhythm match',
    longTerm: 'Long-term stability',
  },
} as const;

const sectionCopy = {
  zh: {
    strengths: '优势',
    risks: '需要留意',
    advice: '建议',
    expand: '展开详情',
    collapse: '收起详情',
  },
  en: {
    strengths: 'Strengths',
    risks: 'Watch points',
    advice: 'Advice',
    expand: 'Expand details',
    collapse: 'Collapse details',
  },
} as const;

interface DimensionCardProps {
  dimensionKey: string;
  data: RelationshipDimensionScore;
  lang: Language;
  isPremium: boolean;
  onUnlock: () => void;
  experimentId?: string;
  variant?: RelationshipVariant;
  relationType?: RelationshipType;
}

function scoreColor(score: number) {
  if (score >= 70) return '#34D399';
  if (score >= 45) return '#F5B35D';
  return '#F87171';
}

function normalizeLang(lang: Language): 'zh' | 'en' {
  return lang === 'en' ? 'en' : 'zh';
}

function renderList(items: string[], color: string) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-xs leading-5 text-[#f4d7a3]/62">
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function DimensionCard({
  dimensionKey,
  data,
  lang,
}: DimensionCardProps) {
  const language = normalizeLang(lang);
  const meta = DIMENSION_META[dimensionKey] ?? { icon: Sparkles, color: '#D8B77B', bgColor: 'rgba(216,183,123,0.1)' };
  const labels = DIMENSION_LABELS[language];
  const copy = sectionCopy[language];
  const label = labels[dimensionKey as keyof typeof labels] ?? dimensionKey;
  const Icon = meta.icon;

  return (
    <TianjiLovePanel className="p-5">
      <div className="absolute left-0 top-0 h-1 rounded-t-xl transition-all duration-700" style={{ width: `${data.score}%`, background: meta.color }} />
      <div className="mb-4 flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full" style={{ background: meta.bgColor, color: meta.color }}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-[0.08em]" style={{ color: meta.color }}>{label}</h3>
          <p className="mt-1 text-xs leading-5 text-[#f4d7a3]/45">{data.label}</p>
        </div>
        <span className="ml-auto text-2xl font-bold" style={{ color: scoreColor(data.score) }}>{data.score}</span>
      </div>

      <p className="mb-4 text-sm leading-7 text-[#f4d7a3]/72">{data.summary}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {data.strengths.length > 0 && (
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#34D399]">{copy.strengths}</h4>
            {renderList(data.strengths, '#34D399')}
          </section>
        )}
        {data.risks.length > 0 && (
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#F87171]">{copy.risks}</h4>
            {renderList(data.risks, '#F87171')}
          </section>
        )}
      </div>

      {data.advice.length > 0 && (
        <section className="mt-4 border-t border-[#d8b77b]/14 pt-4">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: meta.color }}>{copy.advice}</h4>
          {renderList(data.advice, meta.color)}
        </section>
      )}
    </TianjiLovePanel>
  );
}

interface ExpandableDimensionCardProps extends DimensionCardProps {
  experimentId?: string;
  variant?: RelationshipVariant;
  relationType?: RelationshipType;
}

export function ExpandableDimensionCard({
  experimentId,
  variant,
  relationType,
  dimensionKey,
  data,
  lang,
  isPremium,
  onUnlock,
}: ExpandableDimensionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const language = normalizeLang(lang);
  const meta = DIMENSION_META[dimensionKey] ?? { icon: Sparkles, color: '#D8B77B', bgColor: 'rgba(216,183,123,0.1)' };
  const labels = DIMENSION_LABELS[language];
  const copy = sectionCopy[language];
  const label = labels[dimensionKey as keyof typeof labels] ?? dimensionKey;
  const Icon = meta.icon;

  const handleToggle = async () => {
    const next = !expanded;
    setExpanded(next);

    if (next && experimentId && variant && relationType) {
      await trackRelationshipEvent({
        event: 'relationship_dimension_expand',
        experiment_id: experimentId,
        variant,
        relation_type: relationType,
        dimension: dimensionKey as RelationshipDimension,
      });
    }

    if (!next) onUnlock();
  };

  return (
    <TianjiLovePanel className="p-5">
      <div className="absolute left-0 top-0 h-1 rounded-t-xl transition-all duration-700" style={{ width: `${data.score}%`, background: meta.color }} />
      <button type="button" onClick={handleToggle} className="w-full text-left">
        <div className="mb-3 flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full" style={{ background: meta.bgColor, color: meta.color }}>
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold tracking-[0.08em]" style={{ color: meta.color }}>{label}</h3>
            <p className="mt-1 text-xs leading-5 text-[#f4d7a3]/45">{data.label}</p>
          </div>
          <span className="ml-auto text-2xl font-bold" style={{ color: scoreColor(data.score) }}>{data.score}</span>
        </div>
        <p className="text-sm leading-7 text-[#f4d7a3]/72">{data.summary}</p>
        {!expanded && !isPremium && (
          <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold" style={{ color: meta.color }}>
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            {copy.expand}
          </p>
        )}
      </button>

      {expanded && (
        <div className="mt-4 border-t border-[#d8b77b]/14 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {data.strengths.length > 0 && (
              <section>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#34D399]">{copy.strengths}</h4>
                {renderList(data.strengths, '#34D399')}
              </section>
            )}
            {data.risks.length > 0 && (
              <section>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#F87171]">{copy.risks}</h4>
                {renderList(data.risks, '#F87171')}
              </section>
            )}
          </div>
          {data.advice.length > 0 && (
            <section className="mt-4 border-t border-[#d8b77b]/14 pt-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: meta.color }}>{copy.advice}</h4>
              {renderList(data.advice, meta.color)}
            </section>
          )}
          <button type="button" onClick={handleToggle} className="mt-3 text-xs font-semibold text-[#f4d7a3]/58">
            {copy.collapse}
          </button>
        </div>
      )}
    </TianjiLovePanel>
  );
}
