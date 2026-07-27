import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { addLegacySubscriber } from '@/lib/legacy-subscriber-store';
import { isSupabaseMutationDisabled } from '@/lib/staging-degraded-mode';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const subscribeSchema = z.object({
  email: z.string().trim().email().max(255).transform((value) => value.toLowerCase()),
  name: z.string().trim().min(1).max(255).optional(),
  source: z.string().trim().min(1).max(100).default('website'),
});

function areSubscriberWritesDisabled(): boolean {
  return (
    process.env.SUBSCRIBER_WRITES_DISABLED === 'true' ||
    isSupabaseMutationDisabled()
  );
}

export async function POST(request: NextRequest) {
  try {
    if (areSubscriberWritesDisabled()) {
      return NextResponse.json(
        { success: false, skipped: true, reason: 'subscriber_mutation_disabled' },
        { status: 202 },
      );
    }

    const body = await request.json();
    const data = subscribeSchema.parse(body);
    const result = await addLegacySubscriber(data);

    if (!result.created) {
      return NextResponse.json({ success: true, alreadySubscribed: true });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: 'invalid_payload' },
        { status: 400 },
      );
    }

    console.error('[subscribe] legacy store error:', error);
    return NextResponse.json(
      { success: false, error: 'internal_error' },
      { status: 500 },
    );
  }
}
