# Marketing Lead Capture Live Smoke Plan

This is a plan only. Codex must not run production DB writes, read `.env*`, or mutate Supabase.

## Preconditions

- `supabase/migrations/20260624_marketing_leads.sql` has been applied by an approved human operator.
- The operator confirms the target is production and has backup/recovery coverage.
- The operator approves a single consented test lead submission.
- The test email is owned by the operator.

## Manual Smoke Steps

1. Open `https://tianji.love/love-reading`.
2. Submit the lead form with an operator-owned test email and explicit consent.
3. Use UTM parameters when opening the page, for example:

```text
https://tianji.love/love-reading?utm_source=manual_smoke&utm_medium=operator&utm_campaign=revenue_os_day1
```

4. Confirm the UI returns success.
5. Human operator verifies one new row in `public.marketing_leads`.

## Expected Stored Fields

- `email`: operator-owned test email.
- `source_page`: the page source passed by the form.
- `locale`: `en` or `zh-CN`.
- `variant`: form variant.
- UTM fields: source, medium, campaign, content, term when supplied.
- `consent_given_at`: server timestamp.
- `status`: `pending_manual_review`.
- `ip_hash`: SHA-256 hash only, not raw IP.
- `user_agent`: truncated to at most 512 characters.

## Stop Conditions

- Any production target ambiguity.
- Any request to paste secrets into chat/docs/logs.
- Any failed migration or table access error.
- Any unexpected raw IP storage.
- Any missing consent.

## Gate Status

- Lead Capture Source: Go.
- Lead Capture Production Smoke: Pending Human Approval.
- Supabase production mutation: No-Go for Codex.
