/**
 * Telegram Bot Tests — TianJi Global
 *
 * Tests for sendMessage, sendDailyFortune (with and without birth data),
 * sendTarotCard, getTelegramUser, and the exported helper utilities.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock dependencies (hoisted to top before any module-level code runs) ─────

// Mock fetch — vi.stubGlobal is hoisted by vitest automatically
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock @/lib/db with inline factory (no outer scope variables)
vi.mock('@/lib/db', () => ({
  pool: { query: vi.fn() },
}));

// Mock @/lib/ai-interpreter
vi.mock('@/lib/ai-interpreter', () => ({
  interpretFortune: vi.fn().mockResolvedValue({
    aiInterpretation: 'Test AI interpretation text.',
    disclaimer: 'This is a test disclaimer.',
  }),
  interpretTarot: vi.fn().mockResolvedValue({
    aiInterpretation: 'Test tarot interpretation.',
    disclaimer: 'Test disclaimer.',
  }),
}));

// Mock @/lib/bazi
vi.mock('@/lib/bazi', () => ({
  calculateBaZi: vi.fn().mockReturnValue({
    year: { heavenlyStem: '甲', earthlyBranch: '子', element: 'Wood' },
    month: { heavenlyStem: '乙', earthlyBranch: '丑', element: 'Wood' },
    day: { heavenlyStem: '丙', earthlyBranch: '寅', element: 'Fire' },
    hour: { heavenlyStem: '丁', earthlyBranch: '卯', element: 'Fire' },
    dayMasterElement: 'Fire',
  }),
}));

// Mock @/lib/tarot
vi.mock('@/lib/tarot', () => ({
  majorArcana: [
    {
      id: 'fool',
      name: 'The Fool',
      nameChinese: '愚者',
      arcana: 'major',
      meaning: 'New beginnings, innocence',
      reversedMeaning: 'Recklessness, risk-taking',
      meaningChinese: '新的开始，纯真',
      reversedMeaningChinese: '鲁莽，风险承担',
    },
  ],
}));

// ─── Imports after mocks ───────────────────────────────────────────────────────

import { pool } from '@/lib/db';
import {
  sendMessage,
  sendDailyFortune,
  sendTarotCard,
  getTelegramUser,
} from '../../lib/telegram-bot';
import type { TelegramUser } from '../../lib/telegram-bot';

const mockQuery = vi.mocked(pool.query);

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('telegram-bot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── sendMessage ──────────────────────────────────────────────────────────

  describe('sendMessage', () => {
    it('calls Telegram sendMessage API with correct payload', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      await sendMessage('12345', '<b>Hello</b>', 'HTML');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [, opts] = mockFetch.mock.calls[0]!;
      expect(opts.method).toBe('POST');
      const body = JSON.parse(opts.body as string);
      expect(body.chat_id).toBe('12345');
      expect(body.text).toBe('<b>Hello</b>');
      expect(body.parse_mode).toBe('HTML');
    });

    it('throws on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Bad Request'),
      });

      await expect(sendMessage('12345', 'test')).rejects.toThrow(
        'Telegram API error 400: Bad Request'
      );
    });

    it('uses Markdown parseMode when specified', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true });

      await sendMessage('12345', 'Hello *world*', 'Markdown');

      const body = JSON.parse(mockFetch.mock.calls[0]![1].body as string);
      expect(body.parse_mode).toBe('Markdown');
    });
  });

  // ── getTelegramUser ───────────────────────────────────────────────────

  describe('getTelegramUser', () => {
    it('returns null when no user found', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0 } as never);

      const result = await getTelegramUser('99999');
      expect(result).toBeNull();
    });

    it('returns user row when found', async () => {
      const mockUser: TelegramUser = {
        telegram_chat_id: '12345',
        birth_date: '1990-05-15',
        birth_time: '14:30',
        language: 'zh',
        subscribed: true,
        gender: 'male',
      };
      mockQuery.mockResolvedValueOnce({ rows: [mockUser], command: '', rowCount: 1 } as never);

      const result = await getTelegramUser('12345');
      expect(result).toEqual(mockUser);
    });

    it('queries with correct SQL and parameters', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0 } as never);

      await getTelegramUser('12345');

      expect(mockQuery).toHaveBeenCalledTimes(1);
      const [sql, params] = mockQuery.mock.calls[0]!;
      expect(sql).toContain('telegram_users');
      expect(sql).toContain('telegram_chat_id');
      expect(params).toEqual(['12345']);
    });
  });

  // ── sendDailyFortune ─────────────────────────────────────────────────────

  describe('sendDailyFortune', () => {
    it('sends generic message when user has no birth data', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], command: '', rowCount: 0 } as never);
      mockFetch.mockResolvedValue({ ok: true });

      await sendDailyFortune('12345');

      expect(mockFetch).toHaveBeenCalled();
      const lastCall = mockFetch.mock.calls.at(-1)!;
      const body = JSON.parse(lastCall[1].body as string);
      expect(body.text).toContain('今日运势');
      expect(body.text).toContain('尚未登记出生信息');
    });

    it('sends personalised BaZi fortune when birth data is present', async () => {
      const mockUser: TelegramUser = {
        telegram_chat_id: '12345',
        birth_date: '1990-05-15',
        birth_time: '14:30',
        language: 'zh',
        subscribed: true,
      };
      mockQuery.mockResolvedValueOnce({ rows: [mockUser], command: '', rowCount: 1 } as never);
      mockFetch.mockResolvedValue({ ok: true });

      await sendDailyFortune('12345', mockUser);

      expect(mockFetch).toHaveBeenCalled();
      const lastCall = mockFetch.mock.calls.at(-1)!;
      const body = JSON.parse(lastCall[1].body as string);
      expect(body.text).toContain('年柱');
      expect(body.text).toContain('月柱');
      expect(body.text).toContain('日柱');
      expect(body.text).toContain('时柱');
      expect(body.text).toContain('日主');
      expect(body.text).toContain('Test AI interpretation text.');
    });

    it('uses user object directly without extra DB lookup', async () => {
      const mockUser: TelegramUser = {
        telegram_chat_id: '12345',
        birth_date: '1990-05-15',
        birth_time: '08:00',
        language: 'en',
        subscribed: false,
      };
      mockFetch.mockResolvedValue({ ok: true });

      await sendDailyFortune('12345', mockUser);

      expect(mockQuery).not.toHaveBeenCalled();
      const lastCall = mockFetch.mock.calls.at(-1)!;
      const body = JSON.parse(lastCall[1].body as string);
      expect(body.text).toContain('Establishing');
    });

    it('falls to generic path for malformed birth_date format', async () => {
      const mockUser: TelegramUser = {
        telegram_chat_id: '12345',
        birth_date: 'not-a-date',
        birth_time: null,
        language: 'zh',
        subscribed: false,
      };
      mockFetch.mockResolvedValue({ ok: true });

      await expect(sendDailyFortune('12345', mockUser)).resolves.toBeUndefined();
    });
  });

  // ── sendTarotCard ────────────────────────────────────────────────────────

  describe('sendTarotCard', () => {
    it('sends a tarot card message', async () => {
      mockFetch.mockResolvedValue({ ok: true });

      await sendTarotCard('12345');

      expect(mockFetch).toHaveBeenCalled();
      const lastCall = mockFetch.mock.calls.at(-1)!;
      const body = JSON.parse(lastCall[1].body as string);
      expect(body.text).toContain('塔罗牌');
    });
  });
});

// ── Utility functions (pure, no mocks needed) ─────────────────────────────────

describe('Fortune utility functions', () => {
  let buildFortuneCycles: (birthYear: number, birthMonth: number, birthDay: number) => Array<{
    ageStart: number; ageEnd: number; phase: string; phaseEn: string;
    overall: number; career: number; wealth: number; love: number; health: number;
  }>;
  let calcAge: (birthYear: number, birthMonth: number, birthDay: number) => number;
  let getCurrentPhase: (age: number) => { phase: string; phaseEn: string };

  beforeEach(async () => {
    const mod = await import('../../lib/telegram-bot');
    buildFortuneCycles = mod.buildFortuneCycles as typeof buildFortuneCycles;
    calcAge = mod.calcAge as typeof calcAge;
    getCurrentPhase = mod.getCurrentPhase as typeof getCurrentPhase;
  });

  describe('buildFortuneCycles', () => {
    it('returns 10 life phases', () => {
      const cycles = buildFortuneCycles!(1990, 5, 15);
      expect(cycles).toHaveLength(10);
    });

    it('each cycle has all required score fields (0-100)', () => {
      const cycles = buildFortuneCycles!(1990, 5, 15);
      for (const c of cycles) {
        expect(c).toHaveProperty('overall');
        expect(c).toHaveProperty('career');
        expect(c).toHaveProperty('wealth');
        expect(c).toHaveProperty('love');
        expect(c).toHaveProperty('health');
        expect(c.overall).toBeGreaterThanOrEqual(0);
        expect(c.overall).toBeLessThanOrEqual(100);
      }
    });

    it('each cycle has phase metadata', () => {
      const cycles = buildFortuneCycles!(1990, 5, 15);
      for (const c of cycles) {
        expect(c).toHaveProperty('phase');
        expect(c).toHaveProperty('phaseEn');
        expect(c).toHaveProperty('ageStart');
        expect(c).toHaveProperty('ageEnd');
        expect(c.ageStart).toBeLessThanOrEqual(c.ageEnd);
      }
    });

    it('is deterministic for same birth date', () => {
      const a = buildFortuneCycles!(1990, 5, 15);
      const b = buildFortuneCycles!(1990, 5, 15);
      expect(a).toEqual(b);
    });

    it('differs for different birth dates', () => {
      const a = buildFortuneCycles!(1990, 5, 15);
      const b = buildFortuneCycles!(1985, 1, 1);
      expect(a).not.toEqual(b);
    });
  });

  describe('calcAge', () => {
    it('returns at least 1 even for future birth dates', () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 5);
      const age = calcAge!(future.getFullYear(), future.getMonth() + 1, future.getDate());
      expect(age).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getCurrentPhase', () => {
    it('maps age 5 to 童年 / Childhood', () => {
      const p = getCurrentPhase!(5);
      expect(p.phase).toBe('童年');
      expect(p.phaseEn).toBe('Childhood');
    });

    it('maps age 25 to 青年 / Young Adult', () => {
      const p = getCurrentPhase!(25);
      expect(p.phase).toBe('青年');
      expect(p.phaseEn).toBe('Young Adult');
    });

    it('maps age 35 to 而立 / Establishing', () => {
      const p = getCurrentPhase!(35);
      expect(p.phase).toBe('而立');
      expect(p.phaseEn).toBe('Establishing');
    });

    it('maps age 150 to 未知 / Unknown', () => {
      const p = getCurrentPhase!(150);
      expect(p.phase).toBe('未知');
      expect(p.phaseEn).toBe('Unknown');
    });
  });
});
