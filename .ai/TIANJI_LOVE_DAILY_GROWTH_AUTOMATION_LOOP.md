# TianJi Love Daily Growth Automation Loop

## Purpose

Operate a daily growth loop for TianJi Love without production deploy, paid smoke, Stripe checkout, provider live AI calls, Supabase production mutation, or `.env` access.

## Daily input

- Yesterday content published
- Channel metrics
- `/love-test` starts
- result views
- share-card downloads
- ask_next clicks
- paid intent views
- preview submits
- unlock clicks
- notes

## Daily Codex tasks

1. Read KPI CSV.
2. Identify top 3 hooks.
3. Identify bottom 3 hooks.
4. Generate 10 new content ideas.
5. Improve 3 landing copy sections.
6. Improve 3 paid-intent CTA variants.
7. Generate 5 new share-card captions.
8. Update next day content calendar.
9. Do not deploy.
10. Do not run paid smoke.

## Weekly Codex tasks

1. Summarize KPI.
2. Pick best channel.
3. Pick best hook.
4. Recommend next A/B test.
5. Recommend price test only if paid smoke is approved.
6. Update REVIEW_PACKET.

## Daily output checklist

```text
KPI CSV updated: yes/no
Top hooks identified: yes/no
Bottom hooks identified: yes/no
New content ideas generated: yes/no
Content calendar updated: yes/no
Paid smoke run: no
Production deploy run: no
```

## Guardrails

- Do not invent metrics.
- Do not create fake testimonials.
- Do not claim guaranteed outcomes.
- Do not call live providers.
- Do not create checkout sessions.
- Do not read `.env` files.
- Keep all user behavior records aggregate and non-sensitive.
