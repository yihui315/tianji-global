# Search Console Setup Guide — P24

## Google Search Console

### Step 1: Add Property

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Click **Add Property**
3. Choose **Domain** → enter `tianji.love`
4. Verify via DNS TXT record (add TXT record at your domain registrar)

### Step 2: Submit Sitemap

1. In Search Console → your property → **Sitemaps**
2. Enter: `sitemap.xml` (full URL: `https://tianji.love/sitemap.xml`)
3. Click **Submit**

### Step 3: Wait for Indexing

- Googlebot usually crawls within 24-48 hours
- Check **Pages** report for indexed URLs
- Expected: 30+ SEO pages + homepage + pricing

### Step 4: Check Coverage

Go to **Pages** → look for:
- ✅ **Valid** (green): SEO pages indexed
- ⚠️ **Excluded**: pages with `noindex` or blocked by robots.txt
- ❌ **Error**: crawl errors

### Step 5: Request Indexing for Key Pages

For faster indexing of new pages:
1. URL Inspection tool → paste `https://tianji.love/en/does-my-ex-still-love-me`
2. Click **Request Indexing**

---

## Bing Webmaster

### Step 1: Add Site

1. Go to [bing.com/webmaster](https://bing.com/webmaster)
2. Sign in → **Add Site**
3. Enter `https://tianji.love`
4. Verify via DNS TXT or HTML file upload

### Step 2: Submit Sitemap

1. Site → **Sitemaps** → enter `https://tianji.love/sitemap.xml`
2. Click **Submit**

### Step 3: Configure Crawl Settings

1. Settings → Crawl Control → set crawl rate (Bingbot slower than Google)
2. URL Parameters: leave default (no special params)

---

## Yandex Webmaster (Russia/Eastern Europe)

1. Go to [webmaster.yandex.com](https://webmaster.yandex.com)
2. Add site → verify ownership
3. Submit sitemap `https://tianji.love/sitemap.xml`

---

## IndexNow — Instant Indexing Protocol

IndexNow tells search engines about new URLs immediately (faster than sitemap ping).

### Setup (optional — for future automation)

```bash
# Install IndexNow tool
# After publishing new content, call:
curl -s "https://api.indexnow.org/IndexNow" \
  -H "Content-Type: application/json" \
  -d '{
    "host": "tianji.love",
    "key": "YOUR_INDEXNOW_KEY",
    "urlList": ["https://tianji.love/en/new-page"]
  }'
```

Get your IndexNow key from [indexnow.org](https://www.indexnow.org)

---

## SEO Performance Checklist

### Month 1 Goals
- [ ] 30+ pages indexed by Google
- [ ] "will my ex come back" in top 20 results
- [ ] 100+ organic visitors/day

### Month 3 Goals
- [ ] 500+ organic visitors/day
- [ ] 3+ keywords in top 10
- [ ] First organic conversion (Stripe payment)

### Metrics to Track
| Metric | Tool | Target |
|--------|------|--------|
| Impressions | Search Console | +20% MoM |
| Clicks | Search Console | +15% MoM |
| CTR | Search Console | >2% |
| Indexed pages | Search Console | 50+ |
| Organic traffic | GA4 / Plausible | +30% MoM |

---

## Common Issues

### "Sitemap not found" error
→ Check `https://tianji.love/sitemap.xml` returns XML content
→ Check robots.txt doesn't block: `User-agent: * Disallow: /sitemap.xml`

### "Discovered - currently not indexed"
→ Normal for new pages — wait 1-2 weeks
→ Use URL Inspection → Request Indexing for faster crawl

### Pages showing "Excluded"
→ Check if page has `<meta name="robots" content="noindex">` in source
→ Check if page is behind auth (shouldn't be for public SEO pages)