export interface UserProfile {
  id: string;
  userId: string;
  profileType: 'self' | 'other';
  displayName?: string;
  nickname?: string;
  birthDate: string;
  birthTime?: string;
  birthLocation?: string;
  timezone?: string;
  lat?: number;
  lng?: number;
  language: 'en' | 'zh';
  gender?: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}
