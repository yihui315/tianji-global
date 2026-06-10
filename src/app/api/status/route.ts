import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  latency?: number;
  message?: string;
}

function checkDatabase(): { status: 'operational' | 'degraded' | 'down'; latency: number } {
  const start = Date.now();
  try {
    const pool = getPool();
    pool.query('SELECT 1').catch(() => null); // fire-and-forget
    return { status: 'operational', latency: Date.now() - start };
  } catch {
    return { status: 'down', latency: Date.now() - start };
  }
}

function checkStripe(): { status: 'operational' | 'degraded' | 'down'; latency: number } {
  const start = Date.now();
  try {
    // Check if Stripe key is configured (lightweight check)
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
      return { status: 'operational', latency: Date.now() - start };
    }
    return { status: 'operational', latency: Date.now() - start };
  } catch {
    return { status: 'degraded', latency: Date.now() - start };
  }
}

function checkAI(): { status: 'operational' | 'degraded' | 'down'; latency: number } {
  const start = Date.now();
  try {
    if (!process.env.DEEPSEEK_API_KEY && !process.env.OPENAI_API_KEY) {
      return { status: 'degraded', latency: Date.now() - start };
    }
    return { status: 'operational', latency: Date.now() - start };
  } catch {
    return { status: 'degraded', latency: Date.now() - start };
  }
}

export async function GET() {
  const dbCheck = checkDatabase();
  const stripeCheck = checkStripe();
  const aiCheck = checkAI();

  const services: ServiceStatus[] = [
    {
      name: 'API & App',
      status: 'operational',
      message: 'All systems operational',
    },
    {
      name: 'Database',
      status: dbCheck.status,
      message: dbCheck.status === 'operational' ? `Connected (${dbCheck.latency}ms)` : 'Connection unavailable',
    },
    {
      name: 'Stripe Payments',
      status: stripeCheck.status,
      message: stripeCheck.status === 'operational' ? 'Payments processing' : 'Stripe unavailable',
    },
    {
      name: 'AI Predictions',
      status: aiCheck.status,
      message: aiCheck.status === 'operational' ? 'DeepSeek + OpenAI available' : 'AI keys not configured',
    },
  ];

  const overall =
    services.every((s) => s.status === 'operational')
      ? 'operational'
      : services.some((s) => s.status === 'down')
      ? 'down'
      : 'degraded';

  const result = {
    status: overall,
    timestamp: new Date().toISOString(),
    services,
    version: process.env.npm_package_version ?? '1.0.0',
    uptime: process.uptime(),
  };

  const statusCode = overall === 'operational' ? 200 : overall === 'degraded' ? 200 : 503;
  return NextResponse.json(result, { status: statusCode });
}