import { MetadataRoute } from 'next'
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tianji.global'
  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/bazi`, priority: 0.9 },
    { url: `${baseUrl}/yijing`, priority: 0.9 },
    { url: `${baseUrl}/tarot`, priority: 0.9 },
    { url: `${baseUrl}/ziwei`, priority: 0.9 },
    { url: `${baseUrl}/fortune`, priority: 0.9 },
    { url: `${baseUrl}/love-match`, priority: 0.8 },
    { url: `${baseUrl}/synastry`, priority: 0.8 },
    { url: `${baseUrl}/celebrities`, priority: 0.7 },
    { url: `${baseUrl}/electional`, priority: 0.7 },
    { url: `${baseUrl}/sky-chart`, priority: 0.7 },
    { url: `${baseUrl}/fengshui`, priority: 0.7 },
    { url: `${baseUrl}/horary`, priority: 0.7 },
    { url: `${baseUrl}/embed`, priority: 0.6 },
    { url: `${baseUrl}/pricing`, priority: 0.8 },
    { url: `${baseUrl}/about`, priority: 0.6 },
    { url: `${baseUrl}/legal/privacy`, priority: 0.5 },
    { url: `${baseUrl}/legal/terms`, priority: 0.5 },
  ]
}
