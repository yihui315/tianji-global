import type { AppLanguage } from '@/lib/language-routing';

export const loveReadingCompliance = {
  en: {
    disclaimer:
      'Love readings are for entertainment and self-reflection purposes only. They do not constitute medical, legal, financial, or professional advice. Results are not guaranteed and should not replace professional consultation.',
    notMedical:
      'This service does not provide medical diagnosis or treatment. If you are experiencing emotional distress, please consult a qualified mental health professional.',
    notLegal: 'This service does not provide legal advice. For legal matters, please consult a qualified attorney.',
    privacyNote:
      'Your questions and readings are kept private. We do not share your personal data with third parties for marketing purposes.',
    ageNotice: 'This service is intended for users 18 years of age and older.',
  },
  zh: {
    disclaimer: '情感运势仅供参考娱乐，不构成医疗、法律、金融或专业建议。',
    notMedical:
      '本服务不提供医疗诊断或治疗。如遇情感困扰，请咨询专业心理健康人士。',
    notLegal: '本服务不提供法律咨询。法律事务请咨询专业律师。',
    privacyNote: '您的提问和解读将严格保密。我们不会将您的个人信息用于营销目的。',
    ageNotice: '本服务仅面向18周岁及以上用户。',
  },
} satisfies Record<AppLanguage, Record<string, string>>;

export function getLoveReadingComplianceParagraph(lang: AppLanguage): string {
  const c = loveReadingCompliance[lang];
  if (lang === 'zh') {
    return `${c.disclaimer} ${c.notMedical} ${c.notLegal} ${c.privacyNote} ${c.ageNotice}`;
  }
  return `${c.disclaimer} ${c.notMedical} ${c.notLegal} ${c.privacyNote} ${c.ageNotice}`;
}