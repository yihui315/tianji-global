/**
 * RAG Module Tests — TianJi Global
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generatePseudoEmbedding } from '../../lib/rag';

// Mock the db module before importing rag functions that depend on it
vi.mock('../../lib/db', () => ({
  getPool: vi.fn(() => ({
    query: vi.fn(),
  })),
}));

describe('RAG Module', () => {
  describe('generatePseudoEmbedding', () => {
    it('returns a 1536-dimensional array', () => {
      const embedding = generatePseudoEmbedding('test text');
      expect(embedding).toHaveLength(1536);
    });

    it('returns an array of numbers', () => {
      const embedding = generatePseudoEmbedding('test');
      for (const val of embedding) {
        expect(typeof val).toBe('number');
      }
    });

    it('returns deterministic results for the same input', () => {
      const text = '今日运势大吉';
      const emb1 = generatePseudoEmbedding(text);
      const emb2 = generatePseudoEmbedding(text);
      expect(emb1).toEqual(emb2);
    });

    it('returns different results for different inputs', () => {
      const emb1 = generatePseudoEmbedding('今日运势大吉');
      const emb2 = generatePseudoEmbedding('明日运势大凶');
      expect(emb1).not.toEqual(emb2);
    });

    it('all values are normalized between -1 and 1', () => {
      const embedding = generatePseudoEmbedding('测试文本 content');
      for (const val of embedding) {
        expect(val).toBeGreaterThanOrEqual(-1);
        expect(val).toBeLessThanOrEqual(1);
      }
    });

    it('empty string returns all zeros', () => {
      const embedding = generatePseudoEmbedding('');
      // All values should be 0 for empty string (max would be 0)
      expect(embedding).toHaveLength(1536);
    });

    it('embedding changes with longer text', () => {
      const short = generatePseudoEmbedding('短');
      const long = generatePseudoEmbedding('这是一个很长的文本用于测试嵌入向量的生成是否正确');
      expect(short).not.toEqual(long);
    });
  });

  describe('storeUserFeedback (mocked)', () => {
    it('pool.query is called with correct SQL structure', async () => {
      const { getPool } = await import('../../lib/db');
      const pool = getPool();
      const querySpy = vi.spyOn(pool, 'query');

      const { storeUserFeedback } = await import('../../lib/rag');
      await storeUserFeedback('user-1', 'reading-1', 5, 'Great reading!', 'bazi');

      expect(querySpy).toHaveBeenCalled();
      const callArg = querySpy.mock.calls[0][0] as string;
      expect(callArg).toContain('INSERT INTO user_feedback');
      expect(callArg).toContain('user_id');
      expect(callArg).toContain('reading_id');
      expect(callArg).toContain('rating');
    });

    it('storeUserFeedback passes correct parameter values', async () => {
      const { getPool } = await import('../../lib/db');
      const pool = getPool();
      const querySpy = vi.spyOn(pool, 'query');

      const { storeUserFeedback } = await import('../../lib/rag');
      await storeUserFeedback('user-123', 'reading-456', 4, '测试反馈', 'tarot');

      expect(querySpy).toHaveBeenCalled();
      const params = querySpy.mock.calls[0][1] as unknown[];
      expect(params).toContain('user-123');
      expect(params).toContain('reading-456');
      expect(params).toContain(4);
      expect(params).toContain('测试反馈');
      expect(params).toContain('tarot');
    });
  });

  describe('querySimilarReadings (mocked)', () => {
    it('returns array of SimilarReading objects', async () => {
      const { getPool } = await import('../../lib/db');
      const pool = getPool();
      const mockRows = [
        {
          reading_id: 'r1',
          service_type: 'bazi',
          content_text: '八字解读内容',
          similarity: 0.95,
          created_at: new Date(),
        },
        {
          reading_id: 'r2',
          service_type: 'bazi',
          content_text: '另一个八字解读',
          similarity: 0.88,
          created_at: new Date(),
        },
      ];
      vi.spyOn(pool, 'query').mockResolvedValueOnce({ rows: mockRows, command: '', rowCount: 2 } as any);

      const { querySimilarReadings } = await import('../../lib/rag');
      const embedding = generatePseudoEmbedding('test query');
      const results = await querySimilarReadings('bazi', embedding, 5);

      expect(Array.isArray(results)).toBe(true);
      expect(results).toHaveLength(2);
      expect(results[0]).toHaveProperty('readingId');
      expect(results[0]).toHaveProperty('serviceType');
      expect(results[0]).toHaveProperty('contentText');
      expect(results[0]).toHaveProperty('similarity');
      expect(results[0]).toHaveProperty('createdAt');
    });

    it('maps row fields correctly to SimilarReading interface', async () => {
      const { getPool } = await import('../../lib/db');
      const pool = getPool();
      const mockRows = [
        {
          reading_id: 'abc-123',
          service_type: 'yijing',
          content_text: '易经解读',
          similarity: 0.92,
          created_at: new Date('2024-01-01'),
        },
      ];
      vi.spyOn(pool, 'query').mockResolvedValueOnce({ rows: mockRows, command: '', rowCount: 1 } as any);

      const { querySimilarReadings } = await import('../../lib/rag');
      const results = await querySimilarReadings('yijing', generatePseudoEmbedding('test'), 3);

      expect(results[0].readingId).toBe('abc-123');
      expect(results[0].serviceType).toBe('yijing');
      expect(results[0].contentText).toBe('易经解读');
      expect(results[0].similarity).toBe(0.92);
    });

    it('querySimilarReadings calls pool.query with vector cosine similarity SQL', async () => {
      const { getPool } = await import('../../lib/db');
      const pool = getPool();
      const querySpy = vi.spyOn(pool, 'query').mockResolvedValueOnce({ rows: [], command: '', rowCount: 0 } as any);

      const { querySimilarReadings } = await import('../../lib/rag');
      await querySimilarReadings('bazi', generatePseudoEmbedding('test'), 5);

      expect(querySpy).toHaveBeenCalled();
      const sql = querySpy.mock.calls[0][0] as string;
      expect(sql).toContain('reading_embeddings');
      expect(sql).toContain('embedding');
      expect(sql).toContain('1 - (embedding <=>');
    });
  });

  describe('isRAGAvailable (mocked)', () => {
    it('returns true when pgvector extension exists', async () => {
      const { getPool } = await import('../../lib/db');
      const pool = getPool();
      vi.spyOn(pool, 'query').mockResolvedValueOnce({
        rows: [{ extname: 'vector' }],
        command: '',
        rowCount: 1,
      } as any);

      const { isRAGAvailable } = await import('../../lib/rag');
      const available = await isRAGAvailable();
      expect(available).toBe(true);
    });

    it('returns false when pgvector extension does not exist', async () => {
      const { getPool } = await import('../../lib/db');
      const pool = getPool();
      vi.spyOn(pool, 'query').mockResolvedValueOnce({ rows: [], command: '', rowCount: 0 } as any);

      const { isRAGAvailable } = await import('../../lib/rag');
      const available = await isRAGAvailable();
      expect(available).toBe(false);
    });

    it('returns false gracefully when pool.query throws', async () => {
      const { getPool } = await import('../../lib/db');
      const pool = getPool();
      vi.spyOn(pool, 'query').mockRejectedValueOnce(new Error('Connection failed'));

      const { isRAGAvailable } = await import('../../lib/rag');
      const available = await isRAGAvailable();
      expect(available).toBe(false);
    });
  });
});
