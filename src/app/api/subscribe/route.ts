import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const DATA_FILE = join(process.cwd(), 'public', 'blog', 'subscribers.json');

interface Subscriber {
  email: string;
  subscribedAt: string;
  source?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body?.email ?? '').trim().toLowerCase();
    const source = body?.source ?? 'unknown';

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    let subscribers: Subscriber[] = [];
    if (existsSync(DATA_FILE)) {
      try {
        subscribers = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
      } catch {
        subscribers = [];
      }
    }

    // Atomic upsert: check + write in one synchronous block
    // Note: for high-concurrency production use, replace with DB unique constraint
    const alreadySubscribed = subscribers.some(s => s.email === email);
    if (alreadySubscribed) {
      return NextResponse.json({ message: 'Already subscribed', success: true });
    }

    subscribers.push({ email, subscribedAt: new Date().toISOString(), source });
    try {
      writeFileSync(DATA_FILE, JSON.stringify(subscribers, null, 2));
    } catch (writeErr) {
      console.error('[subscribe] write failed:', writeErr);
      return NextResponse.json({ error: 'Subscription failed, please try again' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Subscribed successfully' });
  } catch (err) {
    console.error('[subscribe] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
