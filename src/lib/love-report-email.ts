import { Resend } from 'resend';
import { getPaidOrderForCheckoutSession } from '@/lib/billing';
import type { Locale } from '@/lib/i18n';

export function buildPrivateReportLink(input: {
  appUrl: string;
  locale: Locale;
  sessionId: string;
}) {
  const appUrl = input.appUrl.replace(/\/$/, '');
  return `${appUrl}/${input.locale}/love-reading/result/${input.sessionId}`;
}

export function buildReportReadyEmail(input: { reportUrl: string }) {
  const subject = 'Your TianJi Love report is ready';
  const text = `Your TianJi Love report is ready.\n\nOpen your private report:\n${input.reportUrl}`;
  const html = `
    <p>Your TianJi Love report is ready.</p>
    <p><a href="${input.reportUrl}">Open your private report</a></p>
  `;

  return { subject, text, html };
}

export async function sendReportReadyEmailForCheckoutSession(input: {
  checkoutSessionId: string;
  locale: Locale;
}): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { sent: false, reason: 'email_not_configured' };
  }

  const order = await getPaidOrderForCheckoutSession(input.checkoutSessionId);
  if (!order?.customerEmail) {
    return { sent: false, reason: 'missing_customer_email' };
  }

  const reportUrl = buildPrivateReportLink({
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    locale: input.locale,
    sessionId: order.readingSessionId,
  });
  const email = buildReportReadyEmail({ reportUrl });
  const from = process.env.EMAIL_FROM || process.env.FROM_EMAIL || 'TianJi Global <noreply@tianji.global>';

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: order.customerEmail,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });

  if (error) {
    return { sent: false, reason: 'provider_error' };
  }

  return { sent: true };
}
