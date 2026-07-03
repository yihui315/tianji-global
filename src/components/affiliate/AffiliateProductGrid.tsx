'use client';

import { useSyncedLanguage } from '@/hooks/useSyncedLanguage';
import { trackAffiliateClick, type AffiliateNetwork, type AdMonetizedPage } from '@/lib/analytics/monetization-events';

export type AffiliateNetwork = 'amazon' | 'astrology' | 'book' | 'course' | 'crystal' | 'cj_affiliate';

export interface AffiliateProduct {
  /** Display name */
  nameEn: string;
  nameZh: string;
  /** Amazon ASIN or custom URL */
  link: string;
  /** Amazon product image URL (optional for custom) */
  imageUrl?: string;
  /** Affiliate network */
  tag: AffiliateNetwork;
  /** Price in USD for display */
  price?: string;
  /** Star rating 1-5 */
  rating?: number;
  /** Number of reviews */
  reviews?: number;
}

const PRODUCTS: AffiliateProduct[] = [
  {
    nameEn: 'Crystal Bracelet for Love & Attraction',
    nameZh: '爱情能量水晶手链',
    link: 'https://www.amazon.com/s?k=rose+quartz+bracelet+love&tag=tianjilove-20',
    imageUrl: 'https://m.media-amazon.com/images/I/41r6+JPJGXL._AC_SY200_.jpg',
    tag: 'crystal',
    price: '$12.99',
    rating: 4.6,
    reviews: 3182,
  },
  {
    nameEn: 'Classic Tarot Deck — Rider-Waite',
    nameZh: '经典韦特塔罗牌套',
    link: 'https://www.amazon.com/s?k=tarot+deck+rider+waite&tag=tianjilove-20',
    imageUrl: 'https://m.media-amazon.com/images/I/51ZB5pRyS8L._AC_SY200_.jpg',
    tag: 'amazon',
    price: '$14.99',
    rating: 4.8,
    reviews: 8921,
  },
  {
    nameEn: 'Chinese Astrology: The Maison de l\'Astrologie Guide',
    nameZh: '中国星座：八字命理入门指南',
    link: 'https://www.amazon.com/s?k=chinese+astrology+bazi+book&tag=tianjilove-20',
    imageUrl: 'https://m.media-amazon.com/images/I/51Qgz9bS5QL._AC_SY200_.jpg',
    tag: 'book',
    price: '$18.95',
    rating: 4.5,
    reviews: 1240,
  },
  {
    nameEn: 'AstroSage Pro — Online Astrology Reports',
    nameZh: 'AstroSage 专业星盘报告',
    link: 'https://www.affiliate-link-goes-here.com', // replace after registration
    tag: 'astrology',
  },
  {
    nameEn: 'Relationship Reset Course — Dr. Laura DeRuiter',
    nameZh: '关系修复课程',
    link: 'https://www.affiliate-link-goes-here.com', // replace after registration
    tag: 'course',
  },
  {
    nameEn: 'Amethyst Crystal Points — Set of 3',
    nameZh: '紫水晶原石三件套',
    link: 'https://www.amazon.com/s?k=amethyst+crystal+points&tag=tianjilove-20',
    imageUrl: 'https://m.media-amazon.com/images/I/41vE4rW5QSL._AC_SY200_.jpg',
    tag: 'crystal',
    price: '$19.99',
    rating: 4.7,
    reviews: 2045,
  },
];

const TAG_LABELS: Record<AffiliateProduct['tag'], { en: string; zh: string }> = {
  amazon:   { en: 'Popular',     zh: '热门' },
  astrology:{ en: 'Astrology',   zh: '命理工具' },
  book:     { en: 'Book',        zh: '书籍' },
  course:   { en: 'Course',      zh: '课程' },
  crystal:  { en: 'Crystals',    zh: '水晶' },
};

function StarRating({ value }: { value: number }) {
  return (
    <span className="text-[#d8b77b] text-xs" aria-label={`${value} stars`}>
      {'★'.repeat(Math.round(value))}{'☆'.repeat(5 - Math.round(value))}
    </span>
  );
}

export interface AffiliateProductGridProps {
  /** Slice to a subset of products (default: all) */
  products?: AffiliateProduct[];
  title?: string;
  className?: string;
  /** Canonical page name for analytics */
  page?: string;
}

export function AffiliateProductGrid({
  products = PRODUCTS,
  title,
  className = '',
  page = 'unknown',
}: AffiliateProductGridProps) {
  const { language } = useSyncedLanguage();
  const isZh = language === 'zh';

  return (
    <section className={`affiliate-grid ${className}`}>
      {title && (
        <div className="mb-6 text-center">
          <h2 className="font-serif text-lg font-semibold text-[#ffe3b4]">
            {isZh ? '相关推荐' : 'Related Products'}
          </h2>
          <p className="mt-1 text-xs text-[#f4d7a3]/56">
            {isZh ? '我们精选的命理工具与周边' : 'Curated tools & accessories for your spiritual journey'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {products.map((product) => (
          <a
            key={product.link}
            href={product.link}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() =>
              trackAffiliateClick({
                network: product.tag,
                product_name: isZh ? product.nameZh : product.nameEn,
                page: (page || 'unknown') as 'homepage' | 'blog' | AdMonetizedPage,
                link_url: product.link,
              })
            }
            className="group flex flex-col gap-2 rounded-xl border border-[#d8b77b]/12 bg-[#0f0f18] p-3 transition hover:border-[#d8b77b]/36 hover:bg-[#14142a]"
          >
            {product.imageUrl ? (
              <div className="relative aspect-square overflow-hidden rounded-lg bg-[#1a1a2e]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.imageUrl}
                  alt={isZh ? product.nameZh : product.nameEn}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute bottom-1 left-1 rounded bg-[#d8b77b]/80 px-1.5 py-0.5 text-[10px] font-medium text-[#0a0a10]">
                  {TAG_LABELS[product.tag][isZh ? 'zh' : 'en']}
                </span>
              </div>
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-lg bg-[#1a1a2e]">
                <span className="text-2xl">🔮</span>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <p className="line-clamp-2 text-xs font-medium leading-snug text-[#f4d7a3]">
                {isZh ? product.nameZh : product.nameEn}
              </p>
              {product.price && (
                <p className="text-xs font-semibold text-[#d8b77b]">{product.price}</p>
              )}
              {product.rating && (
                <div className="flex items-center gap-1">
                  <StarRating value={product.rating} />
                  {product.reviews !== undefined && (
                    <span className="text-[10px] text-[#f4d7a3]/36">({product.reviews.toLocaleString()})</span>
                  )}
                </div>
              )}
            </div>
          </a>
        ))}
      </div>

      <p className="mt-3 text-center text-[10px] text-[#f4d7a3]/32">
        {isZh
          ? '* 联盟链接。我们可能会从符合条件的购买中获得佣金。'
          : '* Affiliate links. We may earn a commission from qualifying purchases.'}
      </p>
    </section>
  );
}
