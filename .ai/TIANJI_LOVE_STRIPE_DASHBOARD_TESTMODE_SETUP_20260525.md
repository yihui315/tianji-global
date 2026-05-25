# TianJi Love Stripe Dashboard Test-Mode Setup 20260525

## 1. Stripe Dashboard Mode

Test mode / Sandbox: Blocked - user action required.

User checklist:

```text
1. Open Stripe Dashboard.
2. Switch to Test mode / Sandbox.
3. Confirm all products, prices, keys, and webhooks used for this smoke are test-mode resources.
4. Do not use pk_live_ or sk_live_ keys.
```

## 2. Products And Prices

| Product | Test price created | Price ID configured locally | Notes |
|---|---|---|---|
| Ask | Blocked | n/a | Code uses inline price_data from src/lib/ask-question.ts |
| Draw | Blocked | n/a | Code uses inline price_data from src/lib/quick-draw.ts |
| Relationship | Blocked | n/a | Code uses inline price_data from src/lib/billing.ts |

Suggested Dashboard setup for test operations:

```text
Product 1: TianJi Ask Paid Reading, one-time test price, suggested USD 1 or HKD 9.9
Product 2: TianJi Draw Paid Reading, one-time test price, suggested USD 1 or HKD 9.9
Product 3: TianJi Relationship Full Report, one-time test price, suggested USD 3 or HKD 29
```

Do not paste price IDs into chat. If future code switches from inline `price_data` to price IDs, store IDs only in local/staging env.

## 3. API Keys

| Key | Expected shape | Present locally | Live key avoided |
|---|---|---|---|
| Publishable | pk_test_* | masked no | yes |
| Secret | sk_test_* or rk_test_* | masked no | yes |
| Webhook | whsec_* | masked no | yes |

User checklist:

```text
Stripe Dashboard -> Developers -> API keys
Publishable key must start with pk_test_
Secret key must start with sk_test_ or rk_test_
Never use pk_live_, sk_live_, or rk_live_
```

## 4. Webhook

Endpoint / CLI listener: Blocked - Stripe CLI unavailable on PATH in this environment.

Events covered: Blocked.

Webhook secret configured: masked no.

Detected webhook endpoint:

```text
http://localhost:3000/api/stripe/webhook
```

Local user action:

```powershell
stripe login
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

Put the temporary `whsec_...` value in local `.env.local` only. Do not paste it into chat and do not commit it.

Staging user action:

```text
Stripe Dashboard -> Developers -> Webhooks -> Add endpoint
URL: https://<staging-domain>/api/stripe/webhook
Events:
- checkout.session.completed
- checkout.session.expired
- payment_intent.succeeded
- payment_intent.payment_failed
```

## 5. Supabase Staging

Supabase staging env present: Blocked.

Relationship UUID persistence: Blocked.

Required local/staging env names:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
```

## 6. Safety

```text
Secrets printed: No
.env committed: No
Live mode used: No
Production deploy: Not run
Production database mutation: Not run
Social publishing: Not run
```

## 7. Official Stripe Setup Notes

Stripe test card testing requires test API keys and sandbox/test values. Interactive test payments can use `4242 4242 4242 4242` with a future expiry and any CVC/postal code.

Webhook endpoints must verify signatures with the endpoint secret and the `Stripe-Signature` header.
