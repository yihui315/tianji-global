'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { MysticButton } from '@/components/ui/MysticButton';
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

const RELATION_TYPES: { value: RelationshipType; labelZh: string; labelEn: string; icon: string }[] = [
  { value: 'romantic', labelZh: '浪漫关系', labelEn: 'Romantic', icon: '💕' },
  { value: 'friendship', labelZh: '友谊', labelEn: 'Friendship', icon: '🤝' },
  { value: 'work', labelZh: '工作搭档', labelEn: 'Work', icon: '💼' },
];

interface PersonFieldsProps {
  personLabel: string;
  person: { nickname: string; birthDate: string; birthTime: string; birthLocation: string };
  onChange: (field: string, value: string) => void;
  lang: 'zh' | 'en';
}

function PersonFields({ personLabel, person, onChange, lang }: PersonFieldsProps) {
  return (
    <GlassCard level="card" className="p-5">
      <h3 className="text-sm font-serif font-bold mb-4 text-white">{personLabel}</h3>
      <div className="space-y-3">
        <div>
          <label className="text-xs block mb-1" style={{ color: 'rgba(226,232,240,0.5)' }}>
            {lang === 'zh' ? '昵称 *' : 'Nickname *'}
          </label>
          <input
            type="text"
            value={person.nickname}
            onChange={e => onChange('nickname', e.target.value)}
            placeholder={lang === 'zh' ? '对方称呼' : 'Person name'}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#E2E8F0',
              outline: 'none',
            }}
          />
        </div>
        <div>
          <label className="text-xs block mb-1" style={{ color: 'rgba(226,232,240,0.5)' }}>
            {lang === 'zh' ? '出生日期 *' : 'Birth Date *'}
          </label>
          <input
            type="date"
            value={person.birthDate}
            onChange={e => onChange('birthDate', e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#E2E8F0',
              outline: 'none',
              colorScheme: 'dark',
            }}
          />
        </div>
        <div>
          <label className="text-xs block mb-1" style={{ color: 'rgba(226,232,240,0.5)' }}>
            {lang === 'zh' ? '出生时间（可选）' : 'Birth Time (optional)'}
          </label>
          <input
            type="time"
            value={person.birthTime}
            onChange={e => onChange('birthTime', e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#E2E8F0',
              outline: 'none',
              colorScheme: 'dark',
            }}
          />
        </div>
        <div>
          <label className="text-xs block mb-1" style={{ color: 'rgba(226,232,240,0.5)' }}>
            {lang === 'zh' ? '出生地点（可选）' : 'Birth Location (optional)'}
          </label>
          <input
            type="text"
            value={person.birthLocation}
            onChange={e => onChange('birthLocation', e.target.value)}
            placeholder={lang === 'zh' ? '城市名' : 'City'}
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#E2E8F0',
              outline: 'none',
            }}
          />
        </div>
      </div>
    </GlassCard>
  );
}

export function RelationshipForm({ onSubmit, isLoading, lang = 'zh' }: RelationshipFormProps) {
  const [relationType, setRelationType] = useState<RelationshipType>('romantic');
  const [personA, setPersonA] = useState({ nickname: '', birthDate: '', birthTime: '', birthLocation: '' });
  const [personB, setPersonB] = useState({ nickname: '', birthDate: '', birthTime: '', birthLocation: '' });

  const handlePersonA = (field: string, value: string) =>
    setPersonA(prev => ({ ...prev, [field]: value }));

  const handlePersonB = (field: string, value: string) =>
    setPersonB(prev => ({ ...prev, [field]: value }));

  const canSubmit = personA.nickname && personA.birthDate && personB.nickname && personB.birthDate;

  return (
    <div className="space-y-6">
      {/* Relation type selector */}
      <div className="grid grid-cols-3 gap-3">
        {RELATION_TYPES.map(rt => (
          <button
            key={rt.value}
            onClick={() => setRelationType(rt.value)}
            className="p-4 rounded-xl text-center transition-all"
            style={{
              background: relationType === rt.value
                ? 'rgba(167,139,250,0.15)'
                : 'rgba(255,255,255,0.03)',
              border: `1px solid ${relationType === rt.value ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.06)'}`,
            }}
          >
            <div className="text-2xl mb-1">{rt.icon}</div>
            <div className="text-xs font-medium" style={{ color: relationType === rt.value ? '#A78BFA' : 'rgba(226,232,240,0.6)' }}>
              {lang === 'zh' ? rt.labelZh : rt.labelEn}
            </div>
          </button>
        ))}
      </div>

      {/* Person inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PersonFields
          personLabel={lang === 'zh' ? '第一个人' : 'First Person'}
          person={personA}
          onChange={handlePersonA}
          lang={lang}
        />
        <PersonFields
          personLabel={lang === 'zh' ? '第二个人' : 'Second Person'}
          person={personB}
          onChange={handlePersonB}
          lang={lang}
        />
      </div>

      {/* Submit */}
      <MysticButton
        onClick={() => canSubmit && !isLoading && onSubmit({ relationType, personA, personB })}
        disabled={!canSubmit || isLoading}
        className="w-full py-4 text-base"
      >
        {isLoading
          ? (lang === 'zh' ? '分析中...' : 'Analyzing...')
          : (lang === 'zh' ? '🔮 分析关系' : '🔮 Analyze Relationship')}
      </MysticButton>

      <p className="text-center text-xs" style={{ color: 'rgba(226,232,240,0.3)' }}>
        {lang === 'zh'
          ? '出生信息仅用于计算，绝不存储或分享'
          : 'Birth info is used for calculation only, never stored or shared'}
      </p>
    </div>
  );
}
