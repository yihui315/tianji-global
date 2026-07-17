export type ProductAvailability = 'available' | 'coming_soon';

export type ProductCurrency = 'USD' | 'CNY';

export type ProductCatalogItem = {
  id: string;
  name: string;
  nameZh: string;
  currency: ProductCurrency;
  amountMinor: number;
  displayPrice: string;
  availability: ProductAvailability;
  billing: 'one_time' | 'month' | 'year';
};

/**
 * Public product and price source of truth.
 *
 * Checkout contracts, pricing UI, and structured data import this catalog so
 * a product cannot silently advertise a different amount on another route.
 */
export const PRODUCT_CATALOG = {
  ASK_UNLOCK: {
    id: 'ask_unlock',
    name: 'Ask One Question Unlock',
    nameZh: 'Ask 单次解锁',
    currency: 'USD',
    amountMinor: 199,
    displayPrice: '$1.99',
    availability: 'available',
    billing: 'one_time',
  },
  DRAW_UNLOCK: {
    id: 'draw_unlock',
    name: 'Draw Timing Reading Unlock',
    nameZh: '时机抽牌完整解读',
    currency: 'USD',
    amountMinor: 299,
    displayPrice: '$2.99',
    availability: 'available',
    billing: 'one_time',
  },
  PRO_MONTHLY: {
    id: 'pro_monthly',
    name: 'Tianji Love Monthly',
    nameZh: 'Tianji Love 月度',
    currency: 'USD',
    amountMinor: 999,
    displayPrice: '$9.99',
    availability: 'available',
    billing: 'month',
  },
  PRO_YEARLY: {
    id: 'pro_yearly',
    name: 'Tianji Love Yearly',
    nameZh: 'Tianji Love 年度',
    currency: 'USD',
    amountMinor: 9999,
    displayPrice: '$99.99',
    availability: 'available',
    billing: 'year',
  },
  LOVE_PREMIUM_REPORT: {
    id: 'love_premium_report',
    name: 'Relationship Destiny Report',
    nameZh: '关系深度报告',
    currency: 'CNY',
    amountMinor: 1990,
    displayPrice: 'Coming soon',
    availability: 'coming_soon',
    billing: 'one_time',
  },
} as const satisfies Record<string, ProductCatalogItem>;

export const PUBLICLY_AVAILABLE_PRODUCTS = Object.values(PRODUCT_CATALOG).filter(
  (product) => product.availability === 'available'
);

export function minorAmountToMajor(amountMinor: number): string {
  return (amountMinor / 100).toFixed(2);
}
