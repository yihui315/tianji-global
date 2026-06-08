# TianJi Growth Operating System

Owner: TianJi CEO
Live site: https://tianji.love
Primary offer: $1.99 Ask, $2.99 Quick Draw

## North Star

Turn spiritual curiosity into a paid self-reflection moment in under 3 minutes.

Do not start with a broad "AI astrology platform" pitch. Start with one concrete job:

- "Ask the question you keep circling."
- "Pull three cards for today."
- "Get a private answer now."

## Current Commercial Status

Ready:

- Production domain and HTTPS are live.
- `/ask`, `/draw`, `/pricing` are live.
- Preview APIs work.
- Canary monitoring is active.

Blocked before real checkout revenue:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `DATABASE_URL`
- Production AI provider key, preferably `OPENAI_API_KEY` or Packy-compatible key

Until those are configured, marketing can start collecting attention and testing demand, but paid checkout cannot complete.

## Sales Team

### 1. CEO / Revenue Owner

Goal: protect focus and make weekly revenue decisions.

Daily questions:

- How many people reached `/ask` or `/draw`?
- Which channel brought them?
- Did preview create enough curiosity to pay?
- What prevented checkout?

Decision rule:

- If Stripe is not live, all effort goes to payment activation.
- If Stripe is live and conversion is below 1%, improve offer/copy before adding channels.
- If conversion is above 2%, increase content output and creator outreach.

### 2. Conversion Lead

Goal: make the site convert.

Owns:

- Hero promise
- CTA clarity
- Ask/Draw flow
- Pricing objections
- Refund and disclaimer language

KPI:

- Visitor to preview start
- Preview start to checkout click
- Checkout click to paid completion

### 3. Content Lead

Goal: publish short-form demand hooks every day.

Channels:

- TikTok
- Instagram Reels
- YouTube Shorts
- Xiaohongshu if Chinese-language content is used

Daily output:

- 3 short videos
- 2 image posts
- 1 story/community prompt

KPI:

- Hook retention
- Profile clicks
- Visits to `/ask` or `/draw`

### 4. Partnerships Lead

Goal: borrow trust from people who already have spiritual/wellness audiences.

Targets:

- Tarot creators
- Astrology creators
- Journaling and self-care creators
- Relationship advice micro-creators
- Metaphysical shops and newsletters

Offer:

- Free creator codes
- 30% affiliate revenue share for first 30 days
- Co-branded "daily pull" landing copy

KPI:

- Creators contacted
- Replies
- Published mentions
- Paid conversions by source

### 5. Lifecycle Lead

Goal: turn one-time buyers into repeat buyers.

First loops:

- Daily card reminder
- "Ask a follow-up" after unlock
- Weekly reflection prompt
- Relationship/timing upsell later

KPI:

- Repeat purchase rate
- Email capture rate
- 7-day return rate

### 6. Ops / Reliability Lead

Goal: keep money paths alive.

Owns:

- Uptime
- Stripe webhook health
- Error logs
- Canary checks
- Production env inventory

KPI:

- Zero broken checkout days
- API error rate below 1%

## First Wedge

Audience:

Mobile-first women and younger adults who already consume tarot, astrology, journaling, and relationship content.

Positioning:

TianJi is not "fortune telling that predicts your life." It is a private reflection tool that gives symbolic clarity when your mind is looping.

First buying moments:

- "Should I text them?"
- "What is this relationship teaching me?"
- "What should I focus on today?"
- "Why do I feel stuck?"
- "What is the energy around this decision?"

## 14-Day Revenue Sprint

### Days 1-2: Payment Activation

- Configure Stripe live/test keys.
- Configure webhook endpoint: `https://tianji.love/api/stripe/webhook`.
- Configure `DATABASE_URL`.
- Run one real test checkout.
- Confirm webhook idempotency.

Exit criteria:

- A user can pay and unlock a result.

### Days 3-4: Conversion Tightening

- Make `/ask` the primary revenue page.
- Add one clear CTA above the fold.
- Add concise disclaimer without killing desire.
- Add "private, instant, no account needed" near CTA.
- Add "What can I ask?" examples.

Exit criteria:

- A cold visitor understands the offer in 5 seconds.

### Days 5-7: Content Launch

- Publish 15 short clips.
- Publish 10 image posts.
- Run daily "comment your question" prompt.
- Link all bios to `https://tianji.love/ask`.

Exit criteria:

- 100 qualified visitors to `/ask` or `/draw`.

### Days 8-10: Creator Outreach

- Contact 50 micro-creators.
- Offer free readings and affiliate split.
- Prioritize creators with comments asking for personal readings.

Exit criteria:

- 5 creator replies.
- 1 public mention booked.

### Days 11-14: Offer Testing

Test three angles:

- Ask: "Get clarity on the question you cannot stop replaying."
- Draw: "Your three-card day reading is waiting."
- Relationship: "Decode the energy between you two."

Exit criteria:

- Pick the angle with the highest preview-start rate.

## Daily CEO Dashboard

Track manually until analytics is wired:

- Sessions
- `/ask` visits
- `/draw` visits
- Preview starts
- Checkout starts
- Paid completions
- Revenue
- Top traffic source
- Top failed event

## Non-Negotiables

- No medical, legal, or financial advice.
- No guaranteed predictions.
- No fake testimonials.
- No paid ads until checkout is live and at least one organic channel converts.
