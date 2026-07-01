# TianJi Love Safe Publisher Bridge - 2026-07-01

## Purpose

Convert the latest TianJi Love daily publishing pack into a structured, manual-review-only
queue that future tools (n8n, Postiz, Mixpost) could consume **only after explicit
approval of a platform-safe adapter**. This bridge never posts to any social platform,
never holds credentials, and never bypasses captcha, 2FA, or platform rate limits.

## Source pack

```text
assets/marketing/daily/day-014-publishing-pack.md
```

Theme: **Initiation in ambiguity — wanting to reach out is not the same as being
ready to send.** Primary hook: `Wanting to reach out is not the same as being ready
to send.` Primary CTA path: `/love-test`. Pack publishing date: `2026-07-01`.

## Outputs (this run)

```text
assets/marketing/publishing-queue.json   # 23 items, credential-free, all manual-review
assets/marketing/publishing-queue.csv    # same 23 items, flat for spreadsheet review
.ai/TIANJI_LOVE_SAFE_PUBLISHER_BRIDGE.md # this document
.ai/CHANGELOG_AI.md                      # run log
.ai/REVIEW_PACKET.md                     # reviewer summary
```

The bridge does **not** touch the existing per-day `assets/marketing/publishing-queue/`
files (`schema.json`, `README.md`, `2026-06-*.{json,csv,md}`). Those remain in place
for the daily manual publishing loop; the new top-level `publishing-queue.{json,csv}`
files are the bridge export for a future platform-safe adapter.

## Queue contents (23 items)

| Channel        | Content type   | Count | Notes |
|----------------|----------------|-------|-------|
| xiaohongshu    | post           | 5     | 5 Xiaohongshu posts (Chinese) |
| tiktok_reels   | short_video    | 5     | 5 Reels scripts (Chinese) |
| twitter_x      | short_post     | 5     | 5 X / Twitter posts (Chinese) |
| reddit_quora   | answer_draft   | 3     | 3 long-form answer drafts (English) |
| kol_dm         | dm_draft + post_draft | 2 | 1 KOL DM template + 1 KOL post draft (English) |
| seo_outline    | seo_outline    | 3     | 3 SEO article outlines (English) |

## Defaults applied to every item

```text
review_status         = pending_manual_review
publish_status        = not_published
manual_review_required = true
auto_post_eligible    = false
credentials_present   = false
published_url         = "" (absent / empty)
impressions,clicks,leads,paid_conversions = 0
revenue               = 0
```

Credential fields (`token`, `cookie`, `session`, `api_key`, `password`, `webhook_secret`,
`stripe_secret`, etc.) are **absent** from both files, not blank placeholder strings.
There is no `.env*` read, print, copy, diff, or inference anywhere in this run.

## Channel-level UTM routing

Every item carries:

```text
utm_source  = <channel>            # xiaohongshu | tiktok_reels | twitter_x | reddit_quora | kol_dm | seo_outline
utm_medium  = organic
utm_campaign = revenue_os_bridge_day14
cta_url      = https://tianji.love/love-test?utm_source=<channel>&utm_medium=organic&utm_campaign=revenue_os_bridge_day14
```

The campaign tag is unique to this bridge run so a future adapter can filter
its own input from any other export. UTM is metadata only — the bridge never
fires any HTTP request.

## Manual inspection workflow

1. Open `assets/marketing/publishing-queue.json` (or `.csv` for spreadsheet review).
2. For each item, verify:
   - copy tone matches the day theme,
   - no fake testimonial, fake metric, fake user count, or guaranteed outcome,
   - no diagnosis language, no "act now" urgency, no Stripe / payment claim,
   - CTA points to `/love-test` (or another reflective surface), not a checkout,
   - `published_url` is empty (no fake engagement, no fabricated URL).
3. If approved, copy the item into the per-day `assets/marketing/publishing-queue/`
   CSV/JSON for the day it should go live and publish manually through your normal
   channel workflow.
4. Paste the real `published_url` back into the queue row after publishing.
5. Only then enter observed aggregate metrics (impressions, clicks, leads,
   paid_conversions, revenue) — never before.

## How to stop / keep credential-free

```text
- Never commit any social, scheduler, or n8n/Postiz/Mixpost credential to the repo.
- Never paste a token, cookie, webhook secret, or session id into a publishing
  queue file. The schema does not even have a field for it.
- If a future adapter needs a token, store it in a local-only secret manager
  (e.g., 1Password, macOS Keychain, or a CI secret store) and reference it by
  name in code, not in the queue file.
- If you find a credential in the repo, rotate it immediately and remove it
  with a filter-branch rewrite (no plain `git rm` in history).
- To disable the bridge entirely, delete the two new files in
  `assets/marketing/`. The existing per-day publishing loop in
  `assets/marketing/publishing-queue/` keeps working independently.
```

## Future n8n / Postiz / Mixpost adapter (NOT enabled this run)

A future adapter could read `assets/marketing/publishing-queue.json`, apply its
own `review_status === "approved_for_manual_publish"` filter, and then push
approved items through a manually-installed, separately-approved credential.
This skill run **does not approve, scaffold, or wire** such an adapter.

The bridge is now structured so that a future adapter only needs to:

```text
1. Read assets/marketing/publishing-queue.json.
2. Filter on review_status in {approved_for_manual_publish}.
3. Skip items where credentials_present === true (defensive — none today).
4. Submit to the adapter's separately-approved account, in a separate
   gate with explicit user approval and a platform-safe adapter module.
```

Until that gate is explicitly approved, the recommended workflow is the
existing manual-only path described above.

## Gate status

```text
Publisher bridge export: Go
Publishing queue JSON: Go
Publishing queue CSV: Go
Credentials: No-Go - not used or stored
Social auto-posting: No-Go - manual publishing only
Stripe checkout execution: Not run
Paid smoke: No-Go - awaiting explicit approval
Production deploy: No-Go
```

## Safety guarantees

The bridge does not include, store, transmit, or infer:

```text
account credentials
login cookies
API tokens (social, scheduler, webhook)
platform automation scripts (no headless, no captcha bypass, no 2FA bypass)
fake testimonials, fake metrics, fake user counts, fake revenue
guaranteed relationship outcomes, guaranteed replies, reunion promises
100% accurate or "perfect accuracy" claims
diagnosis language, "you are broken" framing, shame reversal
Stripe / payment / checkout copy
production deploy, production Supabase mutation, server mutation
.env* read, print, copy, diff, or inference
```
