/**
 * Celebrity Database - Western Astrology Birth Chart Data
 * TianJi Global | 天机全球
 */

import celebrityData from '@/data/celebrities.json';

export interface CelebrityEntry {
  id: string;
  name: string;
  birthDate: string;  // YYYY-MM-DD
  birthTime: string;  // HH:MM
  lat: number;        // birth location latitude
  lng: number;         // birth location longitude
  profession: string;
  description: string;
}

export const celebrityDB: CelebrityEntry[] = celebrityData as CelebrityEntry[];

export function getCelebrityById(id: string): CelebrityEntry | undefined {
  return celebrityDB.find(c => c.id === id);
}

export function getAllCelebrities(): CelebrityEntry[] {
  return celebrityDB;
}
