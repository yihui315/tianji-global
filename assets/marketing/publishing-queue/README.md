# TianJi Love Publishing Queue

This directory contains safe, reviewable publishing queues generated from TianJi Love marketing packs.

## Purpose

The queue converts daily marketing packs into structured CSV and JSON that can be:

- reviewed manually,
- pasted into a spreadsheet,
- handed to a human publisher,
- later connected to approved tooling such as n8n, Postiz, or Mixpost.

## Safety boundary

This bridge does not:

- auto-post to any social platform,
- use account credentials,
- use cookies or login sessions,
- call platform APIs,
- bypass captcha,
- deploy production,
- run Stripe checkout,
- run paid smoke,
- mutate Supabase,
- call provider live AI,
- read `.env` files.

## Queue fields

Each item includes:

```text
publish_date
channel
content_id
content_type
title
hook
body_or_script
caption
hashtags
cta_url
asset_note
review_status
publish_status
published_url
impressions
clicks
love_test_starts
notes
```

## Status values

Recommended review status:

```text
pending_manual_review
approved_for_manual_publish
needs_edit
rejected
```

Recommended publish status:

```text
not_published
published_manually
scheduled_in_approved_tool
skipped
```

## Manual workflow

1. Open the CSV or JSON queue.
2. Review safety checks and copy.
3. Edit platform-specific phrasing manually if needed.
4. Publish manually or import into an approved tool.
5. Paste the published URL back into the queue.
6. Enter aggregate metrics after observation.
7. Update the matching KPI CSV.
8. Run `自动运行 TianJi Love` for KPI analysis.

## Future adapter rules

Any n8n/Postiz/Mixpost adapter must be a separate approved task and must preserve these gates:

```text
Social auto-posting: No-Go until explicit approval.
Account credentials: No-Go inside repository files.
Cookies/tokens: No-Go inside repository files.
Platform API use: No-Go until adapter-specific approval.
```
