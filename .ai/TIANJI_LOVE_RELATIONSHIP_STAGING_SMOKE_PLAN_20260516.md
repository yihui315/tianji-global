# TianJi Love Relationship Staging Smoke Plan - 2026-05-16

## Status

Staging paid smoke is blocked on masked staging env evidence, not on the local source contract.

## Preconditions

Do not proceed until all are true:

- Staging deployment target is explicitly identified.
- `ENABLE_PAY_PER_USE=true` only in staging/test mode.
- Stripe publishable key and secret key are test-mode by prefix only.
- Stripe webhook secret is present and masked.
- Supabase URL and service role key are present and masked.
- `NEXT_PUBLIC_APP_URL` points to the staging origin.
- No live Stripe key is present in the staging runtime.
- Relationship paid unlock contract is fixed and covered by tests.

## Non-Paid Staging Smoke

1. Open `/relationship/new?lang=en`.
2. Confirm the English hero says `Reveal the hidden pattern between two people.`
3. Confirm sample result card appears.
4. Confirm no birth location input is present in the free form.
5. Submit two sample profiles.
6. Confirm the free result says `First Compatibility Signal`.
7. Confirm the free result only exposes the hook content.
8. Confirm the locked sections are visible:
   - five dimensions
   - next 30 days
   - conflict repair
   - communication guidance
   - PDF-ready report
   - saved history
9. Confirm CTA says `Unlock the Full Relationship Pattern - $4.99` or equivalent rendered dash.
10. Confirm share link uses the staging origin and not `tianji.global`.
11. Confirm analytics POSTs are accepted or safely queued without collecting birth dates, birth times, or private names.

## Paid Staging Smoke

Blocked until staging/test env evidence is available.

When unblocked:

1. Enable `ENABLE_PAY_PER_USE=true` only in staging.
2. Use only Stripe test-mode keys.
3. Create a relationship reading.
4. Click `$4.99` unlock.
5. Confirm Checkout opens in Stripe test mode.
6. Complete payment with a Stripe test card.
7. Confirm webhook receives `checkout.session.completed`.
8. Confirm order/payment is recorded idempotently.
9. Confirm the same relationship reading unlocks paid content after server verification.
10. Confirm refresh and direct navigation still show the paid state.
11. Confirm duplicate webhook event does not create duplicate unlocks/jobs.
12. Confirm cancel URL returns to a useful relationship result or pricing state.

## Staging Decision Rule

Return `Staging deploy: Go` only if:

- Local validation passes.
- Staging env is masked and test-mode safe.
- Relationship paid unlock contract is server-authorized.
- Non-paid staging smoke passes.
- Stripe test checkout smoke passes.

Current decision:

```text
Staging deploy: No-Go for paid checkout review until masked test env evidence is collected
```

## Remaining Work

- Add a staging masked env evidence packet.
- Run staging non-paid smoke.
- Run Stripe test checkout smoke.
