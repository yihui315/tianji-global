'use client';

import { FormEvent, type ComponentType, useRef, useState } from 'react';
import { BriefcaseBusiness, Calendar, Clock, Heart, Lock, User, Users } from 'lucide-react';

import { TianjiLoveFormField, TianjiLovePanel, cx } from '@/components/tianji-love';
import type { RelationshipType } from '@/types/relationship';

interface RelationshipFormProps {
  onSubmit: (data: {
    relationType: RelationshipType;
    personA: { nickname: string; birthDate: string; birthTime?: string; birthLocation?: string };
    personB: { nickname: string; birthDate: string; birthTime?: string; birthLocation?: string };
  }) => void;
  onStart?: () => void;
  isLoading?: boolean;
  lang?: 'zh' | 'en';
}

type PersonState = {
  nickname: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
};

type IconComponent = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

const RELATION_TYPES: Array<{
  value: RelationshipType;
  label: Record<'zh' | 'en', string>;
  helper: Record<'zh' | 'en', string>;
  icon: IconComponent;
}> = [
  {
    value: 'romantic',
    label: { zh: '亲密关系', en: 'Romantic' },
    helper: { zh: '吸引、承诺与相处节奏', en: 'Attraction, commitment, and rhythm' },
    icon: Heart,
  },
  {
    value: 'friendship',
    label: { zh: '灵魂友谊', en: 'Friendship' },
    helper: { zh: '信任、边界与长期陪伴', en: 'Trust, boundaries, and care' },
    icon: Users,
  },
  {
    value: 'work',
    label: { zh: '事业搭档', en: 'Work' },
    helper: { zh: '协作、冲突与共同目标', en: 'Collaboration, tension, and goals' },
    icon: BriefcaseBusiness,
  },
];

const formCopy = {
  zh: {
    personA: '第一位',
    personB: '第二位',
    nickname: '称呼',
    nicknamePlaceholder: '例如：我',
    partnerPlaceholder: '例如：对方',
    birthDate: '出生日期',
    birthTime: '出生时辰',
    birthTimeOptional: '可选',
    birthLocation: '出生地点',
    birthLocationOptional: '可选',
    locationPlaceholder: '城市即可',
    submit: '生成关系合盘',
    loading: '正在分析关系星轨',
    privacy: '出生资料只用于本次合盘计算；公开分享默认不包含生日、时辰、地点或时区。',
    required: '必填',
  },
  en: {
    personA: 'First person',
    personB: 'Second person',
    nickname: 'Name',
    nicknamePlaceholder: 'e.g. Me',
    partnerPlaceholder: 'e.g. Them',
    birthDate: 'Birth date',
    birthTime: 'Birth time',
    birthTimeOptional: 'optional',
    birthLocation: 'Birth location',
    birthLocationOptional: 'reserved for full report',
    locationPlaceholder: 'Birth location is reserved for advanced reports.',
    submit: 'Start Free Compatibility Reading',
    loading: 'Reading relationship orbit',
    privacy: 'Birth details are used only for this reading; public shares exclude date, time, location, and timezone by default.',
    required: 'required',
  },
} as const;

function cleanPerson(person: PersonState) {
  return {
    nickname: person.nickname.trim(),
    birthDate: person.birthDate,
    birthTime: person.birthTime || undefined,
    birthLocation: person.birthLocation.trim() || undefined,
  };
}

function PersonFields({
  label,
  person,
  placeholder,
  onChange,
  lang,
}: {
  label: string;
  person: PersonState;
  placeholder: string;
  onChange: (field: keyof PersonState, value: string) => void;
  lang: 'zh' | 'en';
}) {
  const copy = formCopy[lang];

  return (
    <TianjiLovePanel as="section" className="p-5">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-[#d8b77b]/8 text-[#d8b77b] shadow-[inset_0_0_0_1px_rgba(181,114,72,0.28)]">
          <User className="h-5 w-5" aria-hidden />
        </span>
        <h3 className="font-serif text-xl font-semibold tracking-[0.04em] text-[#ffe3b4]">{label}</h3>
      </div>

      <div className="space-y-4">
        <TianjiLoveFormField label={copy.nickname} badge={copy.required}>
          <input
            type="text"
            value={person.nickname}
            onChange={(event) => onChange('nickname', event.target.value)}
            placeholder={placeholder}
            required
            className="tianji-love-field-input relationship-field-input h-13 min-h-13 w-full rounded-lg border border-[#b57248]/36 px-4 text-sm outline-none transition focus:border-[#ffe3b4] focus:ring-2 focus:ring-[#d8b77b]/24"
          />
        </TianjiLoveFormField>

        <TianjiLoveFormField label={copy.birthDate} badge={copy.required}>
          <input
            type="date"
            value={person.birthDate}
            onChange={(event) => onChange('birthDate', event.target.value)}
            required
            className="tianji-love-field-input relationship-field-input h-13 min-h-13 w-full rounded-lg border border-[#b57248]/36 px-4 pr-11 text-sm outline-none transition [color-scheme:dark] focus:border-[#ffe3b4] focus:ring-2 focus:ring-[#d8b77b]/24"
          />
          <Calendar className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d8b77b]" aria-hidden />
        </TianjiLoveFormField>

        <TianjiLoveFormField label={`${copy.birthTime} (${copy.birthTimeOptional})`}>
          <input
            type="time"
            value={person.birthTime}
            onChange={(event) => onChange('birthTime', event.target.value)}
            className="tianji-love-field-input relationship-field-input h-13 min-h-13 w-full rounded-lg border border-[#b57248]/36 px-4 pr-11 text-sm outline-none transition [color-scheme:dark] focus:border-[#ffe3b4] focus:ring-2 focus:ring-[#d8b77b]/24"
          />
          <Clock className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d8b77b]" aria-hidden />
        </TianjiLoveFormField>

        <div className="rounded-lg border border-[#b57248]/22 bg-black/18 px-4 py-3 text-xs leading-5 text-[#f4d7a3]/52">
          <span className="font-semibold text-[#d8b77b]">{copy.birthLocation}:</span>{' '}
          {copy.locationPlaceholder}
        </div>
      </div>
    </TianjiLovePanel>
  );
}

export function RelationshipForm({ onSubmit, onStart, isLoading = false, lang = 'zh' }: RelationshipFormProps) {
  const copy = formCopy[lang];
  const started = useRef(false);
  const [relationType, setRelationType] = useState<RelationshipType>('romantic');
  const [personA, setPersonA] = useState<PersonState>({ nickname: '', birthDate: '', birthTime: '', birthLocation: '' });
  const [personB, setPersonB] = useState<PersonState>({ nickname: '', birthDate: '', birthTime: '', birthLocation: '' });

  const handlePersonA = (field: keyof PersonState, value: string) =>
    setPersonA((previous) => ({ ...previous, [field]: value }));

  const handlePersonB = (field: keyof PersonState, value: string) =>
    setPersonB((previous) => ({ ...previous, [field]: value }));

  const canSubmit = Boolean(personA.nickname.trim() && personA.birthDate && personB.nickname.trim() && personB.birthDate);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || isLoading) return;
    onSubmit({
      relationType,
      personA: cleanPerson(personA),
      personB: cleanPerson(personB),
    });
  };

  const handleStart = () => {
    if (started.current) return;
    started.current = true;
    onStart?.();
  };

  return (
    <form className="tianji-love-relationship-form space-y-7" onFocusCapture={handleStart} onSubmit={handleSubmit}>
      <div className="grid gap-3 sm:grid-cols-3">
        {RELATION_TYPES.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setRelationType(item.value)}
            aria-pressed={relationType === item.value}
            className={cx(
              'tianji-love-relation-choice rounded-lg border p-4 text-left transition',
              relationType === item.value
                ? 'border-[#ff9c8b]/60 bg-[#ff6c73]/16 shadow-[0_0_28px_rgba(255,92,99,0.14)]'
                : 'border-[#b57248]/26 bg-black/22 hover:border-[#d8b77b]/48'
            )}
          >
            <item.icon className="mb-3 h-5 w-5 text-[#d8b77b]" aria-hidden />
            <span className="block text-sm font-semibold tracking-[0.08em] text-[#ffe3b4]">{item.label[lang]}</span>
            <span className="mt-2 block text-xs leading-5 text-[#f4d7a3]/54">{item.helper[lang]}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <PersonFields
          label={copy.personA}
          person={personA}
          placeholder={copy.nicknamePlaceholder}
          onChange={handlePersonA}
          lang={lang}
        />
        <PersonFields
          label={copy.personB}
          person={personB}
          placeholder={copy.partnerPlaceholder}
          onChange={handlePersonB}
          lang={lang}
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit || isLoading}
        className="tianji-love-primary relationship-form-submit inline-flex min-h-16 w-full items-center justify-center rounded-xl border border-[#ffb49e]/60 px-8 font-serif text-xl font-semibold tracking-[0.04em] text-[#fff7e6] transition disabled:cursor-not-allowed disabled:opacity-45"
      >
        {isLoading ? copy.loading : copy.submit}
        <Heart className="ml-3 h-4 w-4" aria-hidden />
      </button>

      <p className="mx-auto flex max-w-3xl items-start justify-center gap-2 text-center text-xs leading-6 text-[#f4d7a3]/50">
        <Lock className="mt-1 h-3.5 w-3.5 shrink-0 text-[#d8b77b]/70" aria-hidden />
        <span>{copy.privacy}</span>
      </p>
    </form>
  );
}
