/**
 * Stripe Client — TianJi Global
 * Manages Stripe subscription billing integration
 */

import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors when env vars are missing
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('Missing STRIPE_SECRET_KEY environment variable');
    }
    _stripe = new Stripe(secretKey, {
      apiVersion: '2025-04-30.basil',
      typescript: true,
    });
  }
  return _stripe;
}

// Alias for backward compatibility
export const stripe = {
  get checkout() { return getStripe().checkout; },
  get billingPortal() { return getStripe().billingPortal; },
  get webhooks() { return getStripe().webhooks; },
};

// ─── Subscription Plans ────────────────────────────────────────────────────────

export const PLANS = {
  PRO_MONTHLY: {
    id: 'price_pro_monthly',
    name: 'Pro Monthly',
    nameZh: '专业版月度',
    description: 'Unlimited readings, all fortune types, priority AI processing',
    descriptionZh: '无限解读，所有命理类型，优先AI处理',
    price: 9.99,
    priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
    interval: 'month' as const,
    features: {
      en: [
        'Unlimited fortune readings',
        'All 5 fortune types (Ziwei, Bazi, Yijing, Western, Tarot)',
        'Priority AI processing',
        'Detailed PDF reports',
        '30-day reading history',
        'Email support',
      ],
      zh: [
        '无限命理解读',
        '全部5种命理类型（紫微斗数、八字、易经、西方占星、塔罗）',
        '优先AI处理',
        '详细PDF报告',
        '30天解读历史',
        '邮件支持',
      ],
    },
  },
  PRO_YEARLY: {
    id: 'price_pro_yearly',
    name: 'Pro Yearly',
    nameZh: '专业版年度',
    description: 'Best value — 2 months free',
    descriptionZh: '最佳性价比 — 赠送2个月',
    price: 99.99,
    priceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_pro_yearly',
    interval: 'year' as const,
    features: {
      en: [
        'Everything in Pro Monthly',
        'Save 17% vs monthly',
        '2 months free',
        'Exclusive yearly reports',
        'Priority customer support',
      ],
      zh: [
        '专业版月度全部功能',
        '比月度方案节省17%',
        '赠送2个月',
        '专属年度报告',
        '优先客户支持',
      ],
    },
  },
} as const;

export type PlanId = keyof typeof PLANS;

// ─── Session Metadata ───────────────────────────────────────────────────────────

export interface SubscriptionMetadata {
  userId: string;
  email: string;
  planId: PlanId;
}

export function buildSubscriptionMetadata(
  userId: string,
  email: string,
  planId: PlanId
): SubscriptionMetadata {
  return { userId, email, planId };
}
