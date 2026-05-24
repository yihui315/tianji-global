# TianJi Love Safe Publisher Bridge - 2026-05-24

## Purpose

Create a safe publishing bridge between Codex-generated TianJi Love content and manual or future approved publishing tools.

This bridge converts daily publishing packs into structured queue files while keeping social platform publishing behind manual review and explicit approval.

## Inputs

```text
assets/marketing/daily/day-001-publishing-pack.md
assets/marketing/content-calendar-7day.md
assets/marketing/love-test-next-30-hooks.md
assets/marketing/love-test-next-20-video-scripts.md
assets/marketing/love-test-next-20-share-captions.md
```

## Outputs

```text
assets/marketing/publishing-queue/day-001-publishing-queue.csv
assets/marketing/publishing-queue/day-001-publishing-queue.json
assets/marketing/publishing-queue/README.md
```

## Queue result

```text
Queue items: 16
Xiaohongshu posts: 3
Douyin scripts: 2
Videohao scripts: 1
Share-card captions: 5
KOL DM templates: 2
SEO keyword outlines: 3
Default review_status: pending_manual_review
Default publish_status: not_published
Default cta_url: https://tianji.love/love-test
```

## Safety guarantees

The bridge does not include:

```text
account credentials
login cookies
API tokens
platform automation scripts
captcha bypass
fake testimonials
fake user numbers
guaranteed outcomes
100% accurate claims
```

## Gate status

```text
Safe publisher bridge: Go
Publishing queue: Go
Manual review required: Go
Social auto-posting: No-Go - requires explicit approval and platform-safe adapter
Stripe checkout execution: Not run
Paid smoke: No-Go
Production deploy: No-Go
```

## Next action

Manual operator can review `assets/marketing/publishing-queue/day-001-publishing-queue.csv`, publish approved items manually, paste published URLs and metrics back into the queue/KPI CSV, then run:

```text
自动运行 TianJi Love
```

Future n8n/Postiz/Mixpost adapter work must be a separate gate with explicit approval for platform-safe integration.
