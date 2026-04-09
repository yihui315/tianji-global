/**
 * RAG (Retrieval-Augmented Generation) Module — TianJi Global
 * Stores reading embeddings and provides similarity search for improved AI interpretations
 */

import { getPool } from './db';

export interface ReadingEmbedding {
  id: string;
  readingId: string;
  serviceType: 'yijing' | 'tarot' | 'bazi' | 'ziwei' | 'western' | 'fortune';
  contentText: string;
  createdAt: Date;
}

export interface UserFeedback {
  id: string;
  userId: string;
  readingId: string;
  rating: number; // 1-5
  feedbackText: string;
  serviceType: string;
  createdAt: Date;
}

export interface SimilarReading {
  readingId: string;
  serviceType: string;
  contentText: string;
  similarity: number;
  createdAt: Date;
}

/**
 * Generate a pseudo-embedding from text (placeholder until OpenAI is configured)
 * Uses a simple hash-based approach for deterministic results
 */
function generatePseudoEmbedding(text: string): number[] {
  const dim = 1536;
  const embedding = new Array(dim).fill(0);
  for (let i = 0; i < text.length; i++) {
    embedding[i % dim] += text.charCodeAt(i);
  }
  const max = Math.max(...embedding.map(Math.abs));
  if (max === 0) return embedding.map(() => 0);
  return embedding.map((v) => v / max);
}

/**
 * Store a reading embedding in PostgreSQL
 */
export async function storeReadingEmbedding(
  readingId: string,
  serviceType: ReadingEmbedding['serviceType'],
  content: string,
  embedding?: number[]
): Promise<void> {
  const pool = getPool();
  const vec = embedding ?? generatePseudoEmbedding(content);

  await pool.query(
    `INSERT INTO reading_embeddings (id, reading_id, service_type, content_text, embedding, created_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4::vector, NOW())
     ON CONFLICT (reading_id) DO UPDATE SET
       content_text = EXCLUDED.content_text,
       embedding = EXCLUDED.embedding,
       service_type = EXCLUDED.service_type`,
    [readingId, serviceType, content, JSON.stringify(vec)]
  );
}

/**
 * Query similar past readings using vector cosine similarity
 */
export async function querySimilarReadings(
  serviceType: ReadingEmbedding['serviceType'],
  queryEmbedding: number[],
  limit: number = 5
): Promise<SimilarReading[]> {
  const pool = getPool();

  const result = await pool.query(
    `SELECT reading_id, service_type, content_text, created_at,
            1 - (embedding <=> $1::vector) AS similarity
     FROM reading_embeddings
     WHERE service_type = $2
     ORDER BY embedding <=> $1::vector
     LIMIT $3`,
    [JSON.stringify(queryEmbedding), serviceType, limit]
  );

  return result.rows.map((row) => ({
    readingId: row.reading_id,
    serviceType: row.service_type,
    contentText: row.content_text,
    similarity: parseFloat(row.similarity),
    createdAt: row.created_at,
  }));
}

/**
 * Store user feedback for a reading
 */
export async function storeUserFeedback(
  userId: string,
  readingId: string,
  rating: number,
  feedbackText: string,
  serviceType: string
): Promise<void> {
  const pool = getPool();

  await pool.query(
    `INSERT INTO user_feedback (id, user_id, reading_id, rating, feedback_text, service_type, created_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())`,
    [userId, readingId, rating, feedbackText, serviceType]
  );
}

/**
 * Get averaged interpretation from similar past readings (RAG approach)
 */
export async function getAveragedInterpretation(
  serviceType: ReadingEmbedding['serviceType'],
  birthData: Record<string, string | number>
): Promise<{ similarInsights: string[]; avgRating: number; sampleCount: number }> {
  const pool = getPool();

  // Query similar readings (use pseudo-embedding from birth data)
  const pseudoEmbedding = generatePseudoEmbedding(JSON.stringify(birthData));
  const similar = await querySimilarReadings(serviceType, pseudoEmbedding, 5);

  // Get average rating from user feedback
  const ratingResult = await pool.query(
    `SELECT AVG(f.rating)::numeric(3,2) as avg_rating, COUNT(*) as cnt
     FROM user_feedback f
     JOIN reading_embeddings r ON f.reading_id = r.reading_id
     WHERE r.service_type = $1`,
    [serviceType]
  );

  const avgRating = parseFloat(ratingResult.rows[0]?.avg_rating ?? '0');
  const sampleCount = parseInt(ratingResult.rows[0]?.cnt ?? '0', 10);

  return {
    similarInsights: similar.map((r) => r.contentText),
    avgRating,
    sampleCount,
  };
}

/**
 * Get high-rated interpretations for a service type (for model fine-tuning RAG)
 */
export async function getHighRatedInterpretations(
  serviceType: ReadingEmbedding['serviceType'],
  minRating: number = 4,
  limit: number = 10
): Promise<string[]> {
  const pool = getPool();

  const result = await pool.query(
    `SELECT f.feedback_text
     FROM user_feedback f
     JOIN reading_embeddings r ON f.reading_id = r.reading_id
     WHERE r.service_type = $1 AND f.rating >= $2
     ORDER BY f.rating DESC
     LIMIT $3`,
    [serviceType, minRating, limit]
  );

  return result.rows.map((r) => r.feedback_text);
}

/**
 * Check if RAG is available (pgvector extension installed)
 */
export async function isRAGAvailable(): Promise<boolean> {
  try {
    const pool = getPool();
    const result = await pool.query(`SELECT 1 FROM pg_extension WHERE extname = 'vector'`);
    return (result.rows.length ?? 0) > 0;
  } catch {
    return false;
  }
}
