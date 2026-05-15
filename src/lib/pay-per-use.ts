import { NextResponse } from 'next/server';

export const PAY_PER_USE_DISABLED_ERROR = 'Paid unlock is disabled';

export function isPayPerUseEnabled(): boolean {
  return process.env.ENABLE_PAY_PER_USE === 'true';
}

export function requirePayPerUseEnabled() {
  if (isPayPerUseEnabled()) return null;

  return NextResponse.json(
    { error: PAY_PER_USE_DISABLED_ERROR },
    { status: 403 }
  );
}
