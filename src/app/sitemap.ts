import { MetadataRoute } from 'next';
import { SITE } from '@/components/seo/JsonLd';

/**
 * Sitemap — public, indexable routes only.
 * User-specific (profile / reading / readings / report) and internal
 * test routes (animations / cosmic) are intentionally excluded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE.url;
  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = [
    // Homepage
    { url: baseUrl, lastModified, changeFrequency: 'daily', priority: 1.0 },

    // Core divination modules
    { url: `${baseUrl}/bazi`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/ziwei`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/yijing`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/tarot`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/western`, lastModified, changeFrequency: 'weekly', priority: 0.9 },

    // Composite / theme modules
    { url: `${baseUrl}/fortune`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/love-match`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/synastry`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/celebrity-match`, lastModified, changeFrequency: 'weekly', priority: 0.7 },

    // Astro & timing utilities
    { url: `${baseUrl}/electional`, lastModified, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/transit`, lastModified, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/solar-return`, lastModified, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/sky-chart`, lastModified, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/horary`, lastModified, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/fengshui`, lastModified, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/numerology`, lastModified, changeFrequency: 'weekly', priority: 0.7 },

    // Reference
    { url: `${baseUrl}/celebrities`, lastModified, changeFrequency: 'weekly', priority: 0.7 },

    // Embed widget
    { url: `${baseUrl}/embed`, lastModified, changeFrequency: 'monthly', priority: 0.5 },

    // Commercial / info
    { url: `${baseUrl}/pricing`, lastModified, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/about`, lastModified, changeFrequency: 'monthly', priority: 0.7 },

    // Legal
    { url: `${baseUrl}/legal/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${baseUrl}/legal/terms`, lastModified, changeFrequency: 'yearly', priority: 0.4 },
  ];

  return entries;
}
