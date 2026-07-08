# TianJi Love Safe Publisher Bridge — 2026-07-08

## Purpose

Create a safe publishing bridge between Codex-generated TianJi Love content and a future approved publishing tool (n8n, Postiz, Mixpost, or similar). The bridge converts daily publishing packs and the seven-day content calendar into structured queue files while keeping social platform publishing behind manual review and explicit approval.

This is a documentation-and-queue export only. It does not post to any social platform, does not store credentials, and does not wire up any automation tool. The first phase is **manual review only**.

## What this bridge does

- Exports content metadata, hooks, captions, platform hints, planned dates, and a per-item safety baseline as JSON and CSV.
- Marks every queue item as `pending_manual_review` and `not_published`.
- Leaves all credential fields absent (no `token`, `api_key`, `password`, `cookie`, `webhook_secret`, `postiz_*`, `supabase_*`, etc.).
- Documents how to inspect, stop, and keep the bridge credential-free.

## What this bridge does NOT do

- It does **not** post to Xiaohongshu, Douyin, Reels, X, Reddit, Quora, or any other social platform.
- It does **not** use login cookies, account credentials, browser automation, captcha bypass, 2FA bypass, or platform-rate-limit bypass.
- It does **not** store or transport Stripe keys, Supabase service keys, Resend keys, AI provider keys, or webhook secrets.
- It does **not** run Stripe live, paid smoke, production deploy, or production data mutation.
- It does **not** invoke any third-party publisher (n8n, Postiz, Mixpost, Buffer, Hootsuite, Later, etc.) in this commit.

## Inputs

```text
assets/marketing/daily/day-021-publishing-pack.md      # the latest active publishing pack (Day 021, 2026-07-14)
assets/marketing/content-calendar-7day.md             # 90-day calendar (Days 1–90, up to 2026-09-21)
assets/marketing/love-test-next-30-hooks.md           # hook pool (100 hooks, 2026-07-08 refresh)
assets/marketing/love-test-next-20-video-scripts.md   # video-script pool (52 scripts, 2026-07-08 refresh)
assets/marketing/love-test-next-20-share-captions.md  # share-caption pool (60 captions, 2026-07-08 refresh)
data/love-test-day-021-kpi-entry.csv                  # manual KPI entry for Day 021
```

## Outputs

```text
assets/marketing/publishing-queue.json   # structured queue export for future tool ingest
assets/marketing/publishing-queue.csv    # flat-row queue export for spreadsheet review
.ai/TIANJI_LOVE_SAFE_PUBLISHER_BRIDGE.md # this file
.ai/CHANGELOG_AI.md                      # updated with this run's record
.ai/REVIEW_PACKET.md                     # updated with this run's review summary
```

## Queue result (Day 021 — 2026-07-14)

```text
Total items:             23
Xiaohongshu posts:        5
Reels short videos:       5
X short posts:            5
Reddit/Quora drafts:      3
KOL (1 DM + 1 post):      2
SEO article outlines:     3
Default review_status:    pending_manual_review
Default publish_status:   not_published
Default cta_url:          https://tianji.love/love-test
Calendar window covered:  2026-07-14 → 2026-09-21 (Days 21–90, span 69 days)
```

The current queue export covers the most recent active publishing pack (Day 021). Earlier days (Day 001 through Day 020) and future days (Day 022 through Day 090) are intentionally not in this file — each day's metadata is appended when its publishing pack lands, so the bridge stays accurate to the live pack set.

## Schema

The JSON shape follows the existing day-level schema in `assets/marketing/publishing-queue/day-001-publishing-queue.json` and `assets/marketing/publishing-queue/schema.json`, with the following additions for tool-ingest clarity:

```text
schema_version            string  "1.0"
generated_at              string  ISO date of the export
generated_by_skill        string  "tianji-github-safe-publisher-bridge"
manual_review_required    bool    always true
auto_posting_enabled      bool    always false
credentials_present       bool    always false
target_safety_baseline    string  comma-separated safety checks required per item
source_packs              array   input files used to build the export
calendar_window           object  earliest/latest planned date and day-number span
platform_hints            object  per-channel language and format hints
items[]                   array   per-content-item metadata (see schema.json)
summary                   object  totals and per-channel counts
next_steps                array   instructions for the manual operator
```

The CSV is a flat one-row-per-item version of the same fields, with one column per safety check so reviewers can audit each row in a spreadsheet without re-parsing nested JSON.

## Safety guarantees (asserted per item, not asserted globally)

Every item carries these flags in JSON, and the matching `true`/`false` columns in CSV. A reviewer who sees any `false` in the CSV must reject that item before publish.

```text
no_fake_testimonial        true | false
no_fake_numbers            true | false
no_guaranteed_outcome      true | false
no_medical_diagnosis       true | false
no_payment_claim           true | false
no_reunion_promise         true | false
no_mind_reading            true | false
no_diagnosis_language      true | false
no_decision_made_for_user  true | false
cta_present                true | false
```

The bridge does **not** include any of the following, anywhere:

```text
account credentials
login cookies
API tokens
webhook secrets
Stripe / Supabase / Resend / OpenAI / Anthropic / Postiz / n8n / Mixpost keys
platform automation scripts
captcha bypass
fake testimonials
fake user numbers
guaranteed outcomes
perfect-accuracy claims
reunion promises
mind-reading claims
medical / psychological diagnosis language
```

## Manual operator workflow

1. Open `assets/marketing/publishing-queue.json` and the matching `publishing-queue.csv`.
2. For each row, read the `title`, `hook_or_caption`, `cta`, and `cta_url`. Verify the `body_summary` against the source `assets/marketing/daily/day-021-publishing-pack.md` post.
3. Confirm all 10 safety-check fields are `true` in the CSV. Reject the row if any are `false` and update the JSON `safety_checks` block to reflect the rejection.
4. Manually publish the approved item on the platform (Xiaohongshu app, Reels scheduler, X.com, Reddit, Quora, KOL DM tool, or the SEO CMS). Do **not** rely on the bridge to publish.
5. Paste the resulting `published_url` back into the queue (CSV column or JSON field) and into `data/love-test-day-021-kpi-entry.csv`. Fill `impressions`, `clicks`, `leads_captured`, `revenue_usd` after the observation window.
6. Set `publish_status` to `published_manually` only after step 4 succeeds.

## How to keep the bridge credential-free

- Do not commit any of the following to the repo: `.env`, `.env.local`, `.env.production`, browser cookie dumps, Playwright/Puppeteer session JSON, social-platform automation scripts, or any field that begins with `sk_`, `ghp_`, `xox`, `AKIA`, `AIza`, `postiz_`, `supabase_`, `stripe_webhook_secret`, `resend_`.
- If a future tool (n8n / Postiz / Mixpost) is approved for integration, the tool's own credentials stay **outside** the repo (in the operator's local `.env` or in the tool's secret manager). The queue files keep `auto_posting_enabled=false` until that gate is explicitly approved.
- A pre-commit `git diff --check` and a targeted secret-shape scan (regexes for the credential prefixes above) must continue to return zero hits on every change to the queue files.

## Gate status

```text
Publisher bridge export: Go
Publishing queue JSON:   Go
Publishing queue CSV:    Go
Credentials:             No-Go - not used or stored
Social auto-posting:     No-Go - manual publishing only
Stripe checkout execution: Not run
Paid smoke:              No-Go - awaiting explicit approval
Production deploy:       No-Go
```

## Future n8n / Postiz / Mixpost adapter work

Any future adapter that:

- reads `assets/marketing/publishing-queue.json`,
- calls a social-platform API, or
- carries credentials of any kind,

**must** be a separate gate with:

- explicit approval for platform-safe integration,
- a separate branch and PR,
- the credentials living outside the repo (operator `.env` or tool-side secret store),
- and the queue's `auto_posting_enabled` flipped to `true` only in that PR.

This commit does not wire up any such adapter.

## Skipped actions

- No day-by-day expansion of the queue for Days 001–020 or Days 022–090 — those days land in follow-up runs as their publishing packs are generated.
- No n8n / Postiz / Mixpost adapter code, no automation script, no platform-credential storage.
- No Stripe, paid smoke, production deploy, Supabase production mutation, Resend, AI provider live call, or `DESTINY_SCAN_SECRET` use.
- No `.env*` file read, no copy/diff/print of any secret, no screenshot or browser-profile capture.
