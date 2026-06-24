# TianJi Love Manual Publishing Queue

This directory stores reviewable, manual-only publishing queue files for TianJi Love growth work.

## Safety Boundary

The queue is a source artifact only. It must not:

- auto-post to any social platform,
- include account credentials, cookies, tokens, or session data,
- bypass platform review, captcha, or moderation,
- contain fake testimonials, fake user numbers, guaranteed relationship outcomes, or 100% accurate claims,
- run payment, webhook, Supabase, deploy, server, or provider-live actions.

All rows default to:

```text
review_status=pending_manual_review
publish_status=not_published
```

## Queue Fields

```text
id,date,channel,content_type,title,hook,body,cta,cta_url,utm_source,utm_medium,utm_campaign,review_status,publish_status,published_url,impressions,clicks,leads,paid_conversions,revenue,notes
```

## Manual Workflow

1. Review every row for safety, tone, and platform fit.
2. Edit copy manually if needed.
3. Publish manually, or import into a separately approved tool only after explicit approval.
4. Paste the published URL back into `published_url`.
5. Enter observed aggregate metrics only after they are real.
6. Run the local daily report script to summarize real metrics.

## Files

- `schema.json` defines the field contract.
- `sample-queue.csv` provides one safe starter row.
- Dated queue files can be added beside these files.
