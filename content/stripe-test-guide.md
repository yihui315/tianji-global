# Stripe Test Mode Verification Guide
# tianji.love — P12

## Prerequisites
- Stripe Test Mode enabled on Stripe Dashboard
- Stripe test API keys configured in `.env.production`
- `ENABLE_PAY_PER_USE=true`

## Test Checkout Flow (One-Time Payment)

### Step 1: Navigate to Pricing
Visit: https://tianji.love/en/pricing

### Step 2: Click "Solo Love Report — $4.99"
Should open: `/en/love-reading` (free preview funnel)

### Step 3: Complete Free Reading
1. Enter birth details (use test data below)
2. Submit → receive preview result
3. Look for "Unlock Full Report — $4.99" CTA

### Step 4: Click CTA
1. Triggers `POST /api/checkout` with:
   ```json
   {
     "productId": "solo_love_report",
     "readingSessionId": "<uuid>",
     "locale": "en"
   }
   ```
2. Response: `{ "url": "https://checkout.stripe.com/..." }`
3. Browser redirects to Stripe Checkout

### Step 5: Stripe Checkout (Test Mode)
Use Stripe test card:
- Card: `4242 4242 4242 4242`
- Expiry: any future date (e.g., `12/28`)
- CVC: any3 digits (e.g., `123`)
- ZIP: any 5 digits (e.g., `10001`)

### Step 6: Webhook Verification
After payment, Stripe sends webhook to `/api/stripe/webhook`:
1. `checkout.session.completed` → marks order paid
2. Creates report job → runs report generation
3. Sends "report ready" email (if configured)

### Step 7: Success Page
Redirect to: `/en/love-reading/result/{readingId}?checkout=success`

---

## Test Checkout Flow (Subscription — Monthly Pass)

### Step 1: Navigate to Pricing
Visit: https://tianji.love/en/pricing

### Step 2: Click "Monthly Pass — $9.99/mo"
Should trigger checkout with `productId: "monthly_pass"`

### Step 3: Stripe Checkout
Use same test card: `4242 4242 4242 4242`

### Step 4: Webhook (Subscription)
Stripe sends `checkout.session.completed` with `mode: "subscription"`:
1. `handleCheckoutSessionCompleted()` detects subscription mode
2. Calls `grantEntitlement({ productId: "monthly_pass" })`
3. Calls `trackLoveFunnelEvent('love_checkout_success', ...)`
4. Logs: `[stripe/webhook] subscription activated: cs_...`

### Step 5: Subscription Management
- Customer Portal: `GET /api/stripe/portal` → Stripe billing portal
- Cancel: via portal → triggers `customer.subscription.deleted` webhook
- Webhook → `revokeEntitlement({ stripeSubscriptionId })`

---

## Test Card Numbers (Stripe Test Mode)

| Card | Use |
|------|-----|
| `4242 4242 4242 4242` | Always succeeds |
| `40000000 0000 0002` | Always fails (declined) |
| `4000 0025 0000 3155` | 3D Secure required |
| `4000 0000 0000 9995` | Insufficient funds |

## Webhook Testing (Stripe CLI)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger a test checkout session
stripe checkout sessions create \
  --success-url=http://localhost:3000/en/pricing \
  --cancel-url=http://localhost:3000/en/pricing \
  --mode=payment \
  --line-items name="Test Product",amount=499,currency=usd
```

## Manual API Test

```bash
# Test checkout API (without real Stripe)
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "solo_love_report",
    "readingSessionId": "test-session-123",
    "locale": "en"
  }'
# Expected: { "url": "https://checkout.stripe.com/..." }
```

## Verification Checklist

- [ ] `/api/checkout` returns Stripe checkout URL
- [ ] Stripe checkout page renders correctly (test mode badge)
- [ ] Payment with `4242` card succeeds
- [ ] Webhook received at `/api/stripe/webhook`
- [ ] Order marked as paid in database
- [ ] Success page shows "Payment Successful"
- [ ] Report generated and accessible
- [ ] Email notification sent (if configured)
- [ ] Analytics event `checkout_success` logged
- [ ] Subscription mode: entitlement granted
- [ ] Subscription cancellation: entitlement revoked

## Common Issues

### "This payment has not been approved"
→ Stripe webhook secret not configured or webhook not received
→ Fix: Verify `STRIPE_WEBHOOK_SECRET` in `.env.production`

### "Missing readingSessionId"
→ Checkout API called without valid session ID
→ Fix: Only one-time payments require readingSessionId; subscriptions don't

### "Metadata validation failed"
→ Checkout metadata missing required fields
→ Fix: Ensure `source`, `productId`, `locale` are passed correctly

### Checkout redirects to localhost
→ `NEXT_PUBLIC_APP_URL` not set correctly
→ Fix: Set to `https://tianji.love` in production env

## Supabase DB Verification

After successful payment, check `orders` table:
```sql
SELECT id, product_id, status, created_at
FROM orders
WHERE status = 'paid'
ORDER BY created_at DESC
LIMIT 5;
```

Check `entitlements` table (subscriptions):
```sql
SELECT user_id, entitlement, is_active, expires_at
FROM entitlements
WHERE is_active = true;
```