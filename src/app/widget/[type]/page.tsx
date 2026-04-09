'use client';

import { use } from 'react';
import BaseWidget from '@/components/widgets/BaseWidget';
import type { WidgetType, WidgetParams } from '@/components/widgets/BaseWidget';

const VALID_TYPES: WidgetType[] = ['bazi-wheel', 'ziwei-palace', 'tarot-card', 'synastry-chart'];

interface PageProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<{
    birthDate?: string;
    birthTime?: string;
    name?: string;
    gender?: string;
    birthdayType?: string;
  }>;
}

export default function WidgetPage({ params, searchParams }: PageProps) {
  const { type } = use(params);
  const sp = use(searchParams);

  const isValidType = VALID_TYPES.includes(type as WidgetType);

  const widgetParams: WidgetParams = {
    birthDate: sp.birthDate,
    birthTime: sp.birthTime,
    name: sp.name,
    gender: (sp.gender as 'male' | 'female') || 'male',
    birthdayType: (sp.birthdayType as 'solar' | 'lunar') || 'solar',
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#0F172A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
      }}
    >
      {!isValidType ? (
        <div style={{ color: '#EF4444', fontFamily: 'sans-serif', textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Invalid Widget Type</div>
          <div style={{ fontSize: '14px', color: '#94A3B8' }}>
            Valid types: {VALID_TYPES.join(', ')}
          </div>
        </div>
      ) : (
        <BaseWidget
          type={type as WidgetType}
          params={widgetParams}
          width={400}
          height={400}
        />
      )}
    </div>
  );
}

export const dynamic = 'force-static';
