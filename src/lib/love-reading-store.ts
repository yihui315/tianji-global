import { randomUUID } from 'node:crypto';
import { getPool } from '@/lib/db';

export type LoveReadingLocale = 'en' | 'zh-CN';
export type LoveReadingMode = 'solo' | 'compatibility';

export interface CreateLoveReadingSessionInput {
  locale: LoveReadingLocale;
  readingMode: LoveReadingMode;
  birthDate: string;
  birthTime?: string | null;
  birthPlace?: string | null;
}

export interface LoveReadingTeaser {
  summary: string;
  emotionalInsight: string;
  actionableSuggestion: string;
  patternTags: string[];
  lockedSections: string[];
}

export interface LoveReadingSessionRecord {
  sessionId: string;
  birthProfileId: string;
  locale: LoveReadingLocale;
  readingMode: LoveReadingMode;
  status: 'teaser_ready';
  teaser: LoveReadingTeaser;
  createdAt: string;
}

const lockedSections = [
  'Karmic Patterns',
  'Relationship Dynamics',
  'Future Timing',
  'Emotional Compatibility',
  'Actionable Guidance',
  'Private report link',
] as const;

const memorySessions =
  ((globalThis as typeof globalThis & {
    __tianjiLoveReadingSessions?: Map<string, LoveReadingSessionRecord>;
  }).__tianjiLoveReadingSessions ??= new Map<string, LoveReadingSessionRecord>());

function shouldUseDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function buildTeaser(readingMode: LoveReadingMode): LoveReadingTeaser {
  if (readingMode === 'compatibility') {
    return {
      summary:
        'Your free teaser highlights romantic patterns and emotional timing signals for a compatibility reading. Deeper sections stay locked until upgrade.',
      emotionalInsight:
        'You may notice the relationship most clearly where each person asks for reassurance in a different language.',
      actionableSuggestion:
        'Choose one recurring tension and name what each person needs before trying to solve it.',
      patternTags: ['compatibility lens', 'emotional rhythm', 'private teaser'],
      lockedSections: [...lockedSections],
    };
  }

  return {
    summary:
      'Your free teaser highlights romantic patterns, emotional timing, and the relationship choices that may deserve gentler attention.',
    emotionalInsight:
      'Your strongest signal is where longing and self-protection meet before a clear conversation happens.',
    actionableSuggestion:
      'Write down the pattern you want to interrupt, then choose one honest conversation to practice this week.',
    patternTags: ['love pattern', 'timing signal', 'self-reflection'],
    lockedSections: [...lockedSections],
  };
}

export function resetLoveReadingMemoryStoreForTests() {
  memorySessions.clear();
}

export async function createLoveReadingSession(
  input: CreateLoveReadingSessionInput
): Promise<LoveReadingSessionRecord> {
  const sessionId = randomUUID();
  const birthProfileId = randomUUID();
  const teaser = buildTeaser(input.readingMode);
  const createdAt = new Date().toISOString();
  const record: LoveReadingSessionRecord = {
    sessionId,
    birthProfileId,
    locale: input.locale,
    readingMode: input.readingMode,
    status: 'teaser_ready',
    teaser,
    createdAt,
  };

  if (!shouldUseDatabase()) {
    memorySessions.set(sessionId, record);
    return record;
  }

  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('begin');
    await client.query(
      `
        insert into birth_profiles (
          id,
          birth_date,
          birth_time,
          birth_place,
          data_minimized
        )
        values ($1, $2, $3, $4, true)
      `,
      [
        birthProfileId,
        input.birthDate,
        input.birthTime?.trim() || null,
        input.birthPlace?.trim() || null,
      ]
    );

    await client.query(
      `
        insert into reading_sessions (
          id,
          birth_profile_id,
          locale,
          reading_mode,
          status
        )
        values ($1, $2, $3, $4, 'teaser_ready')
      `,
      [sessionId, birthProfileId, input.locale, input.readingMode]
    );

    await client.query(
      `
        insert into reading_teasers (
          session_id,
          summary,
          pattern_tags,
          locked_sections,
          content
        )
        values ($1, $2, $3, $4, $5)
      `,
      [
        sessionId,
        teaser.summary,
        teaser.patternTags,
        JSON.stringify(teaser.lockedSections),
        JSON.stringify({
          framing: 'self-reflection',
          readingMode: input.readingMode,
          emotionalInsight: teaser.emotionalInsight,
          actionableSuggestion: teaser.actionableSuggestion,
        }),
      ]
    );

    await client.query('commit');
    return record;
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

export async function getLoveReadingSession(
  sessionId: string
): Promise<LoveReadingSessionRecord | null> {
  const memoryRecord = memorySessions.get(sessionId);
  if (memoryRecord) {
    return memoryRecord;
  }

  if (!shouldUseDatabase()) {
    return null;
  }

  const result = await getPool().query(
    `
      select
        rs.id as session_id,
        rs.birth_profile_id,
        rs.locale,
        rs.reading_mode,
        rs.status,
        rs.created_at,
        rt.summary,
        rt.pattern_tags,
        rt.locked_sections,
        rt.content
      from reading_sessions rs
      join reading_teasers rt on rt.session_id = rs.id
      where rs.id = $1
      limit 1
    `,
    [sessionId]
  );

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  const fallbackTeaser = buildTeaser(row.reading_mode);
  const teaserContent =
    typeof row.content === 'string' ? JSON.parse(row.content || '{}') : row.content ?? {};

  return {
    sessionId: row.session_id,
    birthProfileId: row.birth_profile_id,
    locale: row.locale,
    readingMode: row.reading_mode,
    status: row.status,
    createdAt:
      row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    teaser: {
      summary: row.summary,
      emotionalInsight:
        typeof teaserContent.emotionalInsight === 'string'
          ? teaserContent.emotionalInsight
          : fallbackTeaser.emotionalInsight,
      actionableSuggestion:
        typeof teaserContent.actionableSuggestion === 'string'
          ? teaserContent.actionableSuggestion
          : fallbackTeaser.actionableSuggestion,
      patternTags: row.pattern_tags ?? [],
      lockedSections: Array.isArray(row.locked_sections)
        ? row.locked_sections
        : JSON.parse(row.locked_sections ?? '[]'),
    },
  };
}
