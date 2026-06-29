---
name: tianji-seo-geo-engine
description: Use when running SEO health checks and geographic keyword optimization for tianji.love. Covers Core Web Vitals, technical SEO audit, schema markup, zh-CN/localized SEO, and geo-targeting for Chinese-speaking markets.
metadata:
  hermes:
    recipe:
      schedule: "0 9 * * 3"
      deliver: skill
      prompt: |
        Clone/fetch the yihui315/tianji-global repo first.
        Work in /root/tianji-global directory.
        Run tianji-seo-geo-engine skill operations:
        1. Run PageSpeed Insights API checks for key pages
        2. Check robots.txt and sitemap.xml
        3. Verify og tags and hreflang tags
        4. Audit zh-CN localized SEO elements
        5. Generate weekly SEO report with Core Web Vitals metrics
---

# TianJi SEO Geo-Engine Skill

## Purpose

Run SEO health checks and geographic keyword optimization for tianji.love. Covers Core Web Vitals monitoring, technical SEO audits, schema markup validation, zh-CN/localized SEO, and geo-targeting for Chinese-speaking markets.

## Allowed Actions

- curl PageSpeed Insights API to fetch Core Web Vitals metrics.
- Check robots.txt accessibility and rules.
- Check sitemap.xml for indexing coverage.
- Check og tags (Open Graph meta tags) on key pages.
- Check hreflang tags for internationalization.
- Write weekly SEO report to `ops/marketing-底座/reports/weekly-seo-report-YYYY-Wnn.md`.
- Read existing marketing and SEO assets under `assets/marketing/**` and `ops/marketing-底座/**`.

## Forbidden Actions

- Do not deploy production or mutate server state.
- Do not make .env changes or access secrets.
- Do not modify source code or configuration files.
- Do not run database or API server mutations.
- Do not access account credentials or tokens.
- Do not post to social platforms or external services.

## Workflow

1. Clone/fetch the yihui315/tianji-global repo to `/root/tianji-global`.
2. Run PageSpeed Insights API checks for key pages:
   - `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://tianji.love/`
   - `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://tianji.love/ask`
   - `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://tianji.love/pricing`
   - `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://tianji.love/love-test`
3. Check sitemap at `/sitemap.xml` on tianji.love.
4. Check robots.txt on tianji.love.
5. Verify zh-CN hreflang tags on key pages.
6. Check og tags (og:title, og:description, og:image) on key pages.
7. Write weekly SEO report to `ops/marketing-底座/reports/weekly-seo-report-YYYY-Wnn.md` with LCP, FID, and CLS metrics.

## Verification

Report is written with LCP (Largest Contentful Paint), FID (First Input Delay), and CLS (Cumulative Layout Shift) metrics included. Report location: `ops/marketing-底座/reports/weekly-seo-report-YYYY-Wnn.md`.