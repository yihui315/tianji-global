import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createPrivacyRequest } from '@/lib/privacy-requests';

const privacyRequestSchema = z.object({
  email: z.string().email(),
  locale: z.string().max(16).optional(),
  details: z.string().max(2000).optional(),
});

export async function POST(request: NextRequest) {
  const parsed = privacyRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid privacy request' }, { status: 400 });
  }

  const body = parsed.data;
  const result = await createPrivacyRequest({
    requestType: 'export',
    email: body.email,
    locale: body.locale ?? 'en',
    details: { note: body.details ?? null },
  });

  return NextResponse.json(
    {
      success: true,
      requestId: result.id,
      persisted: result.persisted,
    },
    { status: result.persisted ? 201 : 202 }
  );
}
