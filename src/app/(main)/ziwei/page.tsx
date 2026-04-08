'use client';

import { useState } from 'react';
import { Iztrolabe } from 'react-iztro';

/**
 * ZiweiPage —紫微斗数星盘页面
 * Uses react-iztro for visualization and iztro for data generation.
 */
export default function ZiweiPage() {
  const [birthday, setBirthday] = useState<string>('2000-08-16');
  const [birthTime, setBirthTime] = useState<number>(2); // 寅时
  const [birthdayType, setBirthdayType] = useState<'solar' | 'lunar'>('solar');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The Iztrolabe component will recalculate automatically via props
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-2">紫微斗数 · Zi Wei Dou Shu</h1>
      <p className="text-gray-600 mb-8 text-center max-w-xl">
        紫微斗数是中国传统命理学三大派别之一，以星耀配合宫位来推断一个人的命运走势。
      </p>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-6 mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Birthday Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              生日类型 / Birthday Type
            </label>
            <select
              value={birthdayType}
              onChange={(e) => setBirthdayType(e.target.value as 'solar' | 'lunar')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800"
            >
              <option value="solar">阳历 / Solar</option>
              <option value="lunar">农历 / Lunar</option>
            </select>
          </div>

          {/* Birthday */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              生日 / Birthday
            </label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800"
            />
          </div>

          {/* Birth Time (时辰) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              出生时辰 / Birth Hour
            </label>
            <select
              value={birthTime}
              onChange={(e) => setBirthTime(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800"
            >
              <option value={0}>子时 (23:00-00:59)</option>
              <option value={1}>丑时 (01:00-02:59)</option>
              <option value={2}>寅时 (03:00-04:59)</option>
              <option value={3}>卯时 (05:00-06:59)</option>
              <option value={4}>辰时 (07:00-08:59)</option>
              <option value={5}>巳时 (09:00-10:59)</option>
              <option value={6}>午时 (11:00-12:59)</option>
              <option value={7}>未时 (13:00-14:59)</option>
              <option value={8}>申时 (15:00-16:59)</option>
              <option value={9}>酉时 (17:00-18:59)</option>
              <option value={10}>戌时 (19:00-20:59)</option>
              <option value={11}>亥时 (21:00-22:59)</option>
              <option value={12}>子时尾 (23:00-23:59)</option>
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              性别 / Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as 'male' | 'female')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800"
            >
              <option value="male">男 / Male</option>
              <option value="female">女 / Female</option>
            </select>
          </div>
        </div>
      </form>

      {/* Astrolabe Visualization */}
      <div
        style={{
          width: 1024,
          maxWidth: '100%',
          margin: '0 auto',
          boxShadow: '0 0 25px rgba(0,0,0,0.25)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <Iztrolabe
          birthday={birthday}
          birthTime={birthTime}
          birthdayType={birthdayType}
          gender={gender}
        />
      </div>
    </main>
  );
}
