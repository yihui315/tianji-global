'use client';

import { FormEvent, type ComponentType, useState } from 'react';
import { BriefcaseBusiness, Calendar, Clock, Heart, Lock, MapPin, User, Users } from 'lucide-react';

import type { RelationshipType } from '@/types/relationship';

interface RelationshipFormProps {
  onSubmit: (data: {
    relationType: RelationshipType;
    personA: { nickname: string; birthDate: string; birthTime?: string; birthLocation?: string };
    personB: { nickname: string; birthDate: string; birthTime?: string; birthLocation?: string };
  }) => void;
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
    birthLocationOptional: 'optional',
    locationPlaceholder: 'City is enough',
    submit: 'Generate relationship reading',
    loading: 'Reading relationship orbit',
    privacy: 'Birth details are used only for this reading; public shares exclude date, time, location, and timezone by default.',
    required: 'required',
  },
} as const;

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

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
    <section className="rounded-2xl border border-[#d8b77b]/24 bg-black/24 p-5">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full border border-[#d8b77b]/35 text-[#d8b77b]">
          <User className="h-5 w-5" aria-hidden />
        </span>
        <h3 className="text-lg font-semibold tracking-[0.08em] text-[#ffe3b4]">{label}</h3>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-2 flex items-center justify-between text-xs font-semibold tracking-[0.1em] text-[#f4d7a3]/72">
            {copy.nickname}
            <span className="text-[#ff9c8b]/78">{copy.required}</span>
          </span>
          <input
            type="text"
            value={person.nickname}
            onChange={(event) => onChange('nickname', event.target.value)}
            placeholder={placeholder}
            required
            className="relationship-field-input h-12 w-full rounded-xl border border-[#d8b77b]/28 bg-[#03040a]/72 px-4 text-sm text-[#ffe3b4] outline-none transition placeholder:text-[#f4d7a3]/30 focus:border-[#ffe3b4] focus:ring-2 focus:ring-[#d8b77b]/24"
          />
        </label>

        <label className="block">
          <span className="mb-2 flex items-center justify-between text-xs font-semibold tracking-[0.1em] text-[#f4d7a3]/72">
            {copy.birthDate}
            <span className="text-[#ff9c8b]/78">{copy.required}</span>
          </span>
          <span className="relative block">
            <input
              type="date"
              value={person.birthDate}
              onChange={(event) => onChange('birthDate', event.target.value)}
              required
              className="relationship-field-input h-12 w-full rounded-xl border border-[#d8b77b]/28 bg-[#03040a]/72 px-4 pr-11 text-sm text-[#ffe3b4] outline-none transition [color-scheme:dark] focus:border-[#ffe3b4] focus:ring-2 focus:ring-[#d8b77b]/24"
            />
            <Calendar className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d8b77b]" aria-hidden />
          </span>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold tracking-[0.1em] text-[#f4d7a3]/72">
            {copy.birthTime} <span className="text-[#f4d7a3]/38">({copy.birthTimeOptional})</span>
          </span>
          <span className="relative block">
            <input
              type="time"
              value={person.birthTime}
              onChange={(event) => onChange('birthTime', event.target.value)}
              className="relationship-field-input h-12 w-full rounded-xl border border-[#d8b77b]/28 bg-[#03040a]/72 px-4 pr-11 text-sm text-[#ffe3b4] outline-none transition [color-scheme:dark] focus:border-[#ffe3b4] focus:ring-2 focus:ring-[#d8b77b]/24"
            />
            <Clock className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d8b77b]" aria-hidden />
          </span>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold tracking-[0.1em] text-[#f4d7a3]/72">
            {copy.birthLocation} <span className="text-[#f4d7a3]/38">({copy.birthLocationOptional})</span>
          </span>
          <span className="relative block">
            <input
              type="text"
              value={person.birthLocation}
              onChange={(event) => onChange('birthLocation', event.target.value)}
              placeholder={copy.locationPlaceholder}
              className="relationship-field-input h-12 w-full rounded-xl border border-[#d8b77b]/28 bg-[#03040a]/72 px-4 pr-11 text-sm text-[#ffe3b4] outline-none transition placeholder:text-[#f4d7a3]/30 focus:border-[#ffe3b4] focus:ring-2 focus:ring-[#d8b77b]/24"
            />
            <MapPin className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d8b77b]" aria-hidden />
          </span>
        </label>
      </div>
    </section>
  );
}

export function RelationshipForm({ onSubmit, isLoading = false, lang = 'zh' }: RelationshipFormProps) {
  const copy = formCopy[lang];
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

  return (
    <form className="space-y-7" onSubmit={handleSubmit}>
      <div className="grid gap-3 sm:grid-cols-3">
        {RELATION_TYPES.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setRelationType(item.value)}
            aria-pressed={relationType === item.value}
            className={cx(
              'rounded-2xl border p-4 text-left transition',
              relationType === item.value
                ? 'border-[#ff9c8b]/54 bg-[#ff6c73]/16 shadow-[0_0_28px_rgba(255,92,99,0.14)]'
                : 'border-[#d8b77b]/20 bg-black/22 hover:border-[#d8b77b]/42'
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
        className="relationship-form-submit inline-flex min-h-14 w-full items-center justify-center rounded-xl border border-[#ffb49e]/60 px-8 text-base font-semibold tracking-[0.12em] text-[#fff7e6] transition disabled:cursor-not-allowed disabled:opacity-45"
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
