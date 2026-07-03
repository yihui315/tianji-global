# Tianji.love SEO Indexing Guide

## Google Search Console Verification

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select property type (Domain or URL prefix)
3. Verify ownership via one of these methods:
   - **HTML file upload**: Download the verification HTML file and place it in your `public/` folder
   - **HTML tag**: Add the meta tag to your root layout file
   - **DNS TXT record**: Add a TXT record to your domain's DNS settings
4. Click "Verify"

## Sitemap URL

**https://tianji.love/sitemap.xml**

Submit this URL in Google Search Console under "Sitemaps" > "Add a sitemap".

## New Pages to Submit (10 Pages)

Submit these new pages in Google Search Console using "URL Inspection" > "Request Indexing":

| # | Page URL | Priority | Change Frequency |
|---|----------|----------|-------------------|
| 1 | `/tarot-love-reading-online` | 0.8 | weekly |
| 2 | `/how-to-get-clarity-in-relationship` | 0.7 | monthly |
| 3 | `/free-ai-love-reading` | 0.8 | weekly |
| 4 | `/free-relationship-compatibility-test` | 0.85 | weekly |
| 5 | `/daily-love-oracle-guide` | 0.75 | weekly |
| 6 | `/love-timing-insights` | 0.75 | weekly |
| 7 | `/bazi-relationship-analysis-free` | 0.8 | weekly |
| 8 | `/relationship-patterns-guide` | 0.7 | monthly |
| 9 | `/relationship/new` | 0.9 | weekly |
| 10 | `/pricing` | 0.9 | weekly |

## URL Inspection Checklist (Per Page)

Before submitting each URL for indexing:

- [ ] Page loads without errors (HTTP 200)
- [ ] All images have alt text
- [ ] Meta title is descriptive and unique
- [ ] Meta description is compelling and accurate
- [ ] Canonical URL is set correctly
- [ ] H1 heading is present and relevant
- [ ] Content is fully rendered (no loading spinners blocking content)
- [ ] Internal links are functional
- [ ] No duplicate content issues
- [ ] Structured data (JSON-LD) is valid if applicable
- [ ] Page is mobile-friendly
- [ ] Core Web Vitals are acceptable

## IndexNow Setup

IndexNow allows instant submission of new/updated URLs to search engines.

### 1. Generate API Key

1. Go to [IndexNow.org](https://www.indexnow.org/)
2. Click "Get an API Key"
3. Follow instructions to generate and verify your API key
4. Store it securely in your environment variables

### 2. Add Environment Variable

Add to your `.env.production`:

```bash
INDEXNOW_API_KEY=your_api_key_here
```

### 3. Create IndexNow API Route

Create `/src/app/api/indexnow/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { getSiteUrl } from '@/lib/i18n';

const INDEXNOW_URL = 'https://www.indexnow.org/indexnow';

export async function POST(request: Request) {
  try {
    const { urls } = await request.json();
    const apiKey = process.env.INDEXNOW_API_KEY;
    
    if (!apiKey || !urls?.length) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const siteUrl = getSiteUrl();
    const payload = {
      host: new URL(siteUrl).host,
      key: apiKey,
      keyLocation: `${siteUrl}/${apiKey}.txt`,
      urlList: urls.map((url: string) => 
        url.startsWith('http') ? url : `${siteUrl}${url}`
      ),
    };

    const response = await fetch(INDEXNOW_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return NextResponse.json({ success: response.ok });
  } catch (error) {
    console.error('IndexNow error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 4. Notify IndexNow of Sitemap

Submit your sitemap URL to IndexNow:

```bash
curl -X POST 'https://www.indexnow.org/indexnow' \
  -H 'Content-Type: application/json' \
  -d '{
    "host": "tianji.love",
    "key": "YOUR_API_KEY",
    "keyLocation": "https://tianji.love/YOUR_API_KEY.txt",
    "urlList": ["https://tianji.love/sitemap.xml"]
  }'
```

## Important Configuration Fix

### Environment Variable Issue

⚠️ **Current Issue**: `NEXT_PUBLIC_APP_URL` is set to `tianji.global` but should be `tianji.love`

**Fix in `.env.production`:**

```bash
# BEFORE (incorrect)
NEXT_PUBLIC_APP_URL=https://tianji.global

# AFTER (correct)
NEXT_PUBLIC_APP_URL=https://tianji.love
```

After updating, rebuild and redeploy your application for changes to take effect.

### Verify Current Setting

Check current value in `/src/lib/i18n.ts`:

```typescript
export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://tianji.global';
}
```

This default fallback to `tianji.global` should also be updated to `tianji.love` for consistency.
