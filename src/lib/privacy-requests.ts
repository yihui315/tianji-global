import { randomUUID } from 'node:crypto';
import { getPool } from '@/lib/db';
import { sanitizePrivacyRequest } from '@/lib/trust-copy-guard';

export type PrivacyRequestType = 'export' | 'deletion';

interface CreatePrivacyRequestInput {
  requestType: PrivacyRequestType;
  email: string;
  locale?: string;
  requestSource?: string;
  details?: Record<string, unknown>;
  userId?: string | null;
}

export async function createPrivacyRequest({
  requestType,
  email,
  locale = 'en',
  requestSource = 'privacy_center',
  details = {},
  userId = null,
}: CreatePrivacyRequestInput) {
  const safeDetails = sanitizePrivacyRequest(details);

  if (!process.env.DATABASE_URL) {
    return {
      id: randomUUID(),
      persisted: false,
      requestType,
    };
  }

  const result = await getPool().query(
    `
      insert into public.deletion_requests (
        user_id,
        email,
        request_type,
        locale,
        request_source,
        details
      )
      values ($1, $2, $3, $4, $5, $6::jsonb)
      returning id
    `,
    [userId, email, requestType, locale, requestSource, JSON.stringify(safeDetails)]
  );

  return {
    id: result.rows[0].id as string,
    persisted: true,
    requestType,
  };
}
