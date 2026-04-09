/**
 * Unsubscribe Route — TianJi Global
 *
 * GET /api/unsubscribe?token=<user_id>
 * Disables daily fortune push notifications for the given user.
 */

import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return new NextResponse(
      HTML.unsubscribePage(false, 'Missing token parameter.'),
      { headers: { 'Content-Type': 'text/html' }, status: 400 },
    );
  }

  try {
    // Disable all daily subscriptions for this user
    const result = await pool.query(
      `UPDATE user_subscriptions
       SET enabled = false
       WHERE user_id = $1 AND enabled = true
       RETURNING id`,
      [token],
    );

    if (result.rowCount === 0) {
      return new NextResponse(
        HTML.unsubscribePage(false, 'No active subscriptions found for this user.'),
        { headers: { 'Content-Type': 'text/html' }, status: 404 },
      );
    }

    return new NextResponse(
      HTML.unsubscribePage(true),
      { headers: { 'Content-Type': 'text/html' }, status: 200 },
    );
  } catch (err) {
    console.error('[unsubscribe] Error:', err);
    return new NextResponse(
      HTML.unsubscribePage(false, 'An error occurred. Please try again later.'),
      { headers: { 'Content-Type': 'text/html' }, status: 500 },
    );
  }
}

// ─── Simple Inline HTML ───────────────────────────────────────────────────────

const HTML = {
  unsubscribePage(success: boolean, message?: string): string {
    if (success) {
      return `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>退订成功 | TianJi Global</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; }
    .card { background: #1e293b; border-radius: 16px; padding: 48px 40px; max-width: 480px; text-align: center; }
    .icon { font-size: 56px; margin-bottom: 16px; }
    h1 { font-size: 24px; font-weight: 700; margin: 0 0 12px; color: #f8fafc; }
    p { color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 28px; }
    .btn { display: inline-block; background: #f59e0b; color: #0f172a; font-weight: 700; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 15px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✅</div>
    <h1>退订成功</h1>
    <p>您已成功退订天机全球每日运势推送。<br>感谢您的使用，期待再次相遇。</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://tianji.global'}" class="btn">返回首页</a>
  </div>
</body>
</html>`;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Unsubscribe | TianJi Global</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0f172a; color: #f8fafc; min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; }
    .card { background: #1e293b; border-radius: 16px; padding: 48px 40px; max-width: 480px; text-align: center; }
    .icon { font-size: 56px; margin-bottom: 16px; }
    h1 { font-size: 24px; font-weight: 700; margin: 0 0 12px; color: #f8fafc; }
    p { color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 28px; }
    .btn { display: inline-block; background: #f59e0b; color: #0f172a; font-weight: 700; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 15px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">⚠️</div>
    <h1>${message ? 'Error' : 'Not Found'}</h1>
    <p>${message || 'No active subscriptions were found for this link.'}</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://tianji.global'}" class="btn">Go to Homepage</a>
  </div>
</body>
</html>`;
  },
};
