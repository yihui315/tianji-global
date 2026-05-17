import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getPaidOrderForCheckoutSession: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock('@/lib/billing', () => ({
  getPaidOrderForCheckoutSession: mocks.getPaidOrderForCheckoutSession,
}));

vi.mock('resend', () => ({
  Resend: vi.fn(() => ({
    emails: {
      send: mocks.sendEmail,
    },
  })),
}));

describe('love report email degraded guard', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    mocks.getPaidOrderForCheckoutSession.mockReset();
    mocks.sendEmail.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('skips Resend and order lookup when email sends are disabled', async () => {
    vi.stubEnv('EMAIL_SEND_DISABLED', 'true');
    vi.stubEnv('RESEND_API_KEY', 're_secret_do_not_print');

    const { sendReportReadyEmailForCheckoutSession } = await import('@/lib/love-report-email');
    const result = await sendReportReadyEmailForCheckoutSession({
      checkoutSessionId: 'cs_test_report',
      locale: 'en',
    });

    expect(result).toEqual({ sent: false, reason: 'email_send_disabled' });
    expect(mocks.getPaidOrderForCheckoutSession).not.toHaveBeenCalled();
    expect(mocks.sendEmail).not.toHaveBeenCalled();
    expect(JSON.stringify(result)).not.toMatch(/re_secret|API_KEY|birthDate|birthTime|birthLocation|timezone|prompt/i);
  });
});
