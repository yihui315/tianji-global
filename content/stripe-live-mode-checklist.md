# Stripe Live Mode Checklist — P26

⚠️ **High Risk — Read before proceeding**

Follow AGENTS.md revenue safety gates:
- Do not run live Stripe, production Supabase, production deploy, real paid smoke
- High-risk tasks may proceed only in test mode unless user gives explicit approval

---

## Pre-Live Requirements

### 1. Stripe Test Mode Verification (Complete First)

Before switching to live, verify everything works in test mode:

```bash
# Test checkout — use Stripe test card
# Card: 4242 4242 4242 4242 (any future expiry, any CVC)
# See: content/stripe-test-guide.md for full test procedure
```

**Must verify:**
- [ ] `/api/checkout` creates session successfully (test mode)
- [ ] Stripe test checkout page loads correctly
- [ ] Test payment completes → `checkout.session.completed` webhook fires
- [ ] Entitlement granted after test payment
- [ ] Success URL redirects to `/pricing?checkout=success`

### 2. Stripe Account Verification

Go to [dashboard.stripe.com/settings/account](https://dashboard.stripe.com/settings/account):
- [ ] Email verified
- [ ] Business name entered
- [ ] Tax ID added (EIN or equivalent)
- [ ] Bank account connected for payouts

### 3. Product Configuration

In Stripe Dashboard → Products:
- [ ] **Monthly Pass** — $9.99/month recurring (test mode first)
- [ ] **Solo Love Report** — $4.99 one-time
- [ ] **Compatibility Report** — $12.99 one-time
- [ ] **Deep Love Report** — $19.99 one-time
- [ ] **Gift Report** — $9.99 one-time

### 4. Price IDs — Update billing.ts

Once products created in Stripe (live mode), update `src/lib/billing.ts`:

```typescript
// Replace test Price IDs with live Price IDs
// GET from Stripe Dashboard → Products → each product → Pricing tab
// LIVE Price IDs look like: price_1234567890abcdefghijklmn
```

⚠️ **AGENTS.md Rule**: Do not commit Price IDs to git. Use environment variables:

```typescript
// Use env variable approach
const monthlyPassPriceId = process.env.STRIPE_MONTHLY_PASS_PRICE_ID;
```

Add to `.env.production`:
```
STRIPE_MONTHLY_PASS_PRICE_ID=price_...
STRIPE_SOLO_REPORT_PRICE_ID=price_...
STRIPE_COMPATIBILITY_REPORT_PRICE_ID=price_...
STRIPE_DEEP_LOVE_REPORT_PRICE_ID=price_...
STRIPE_GIFT_REPORT_PRICE_ID=price_...
```

### 5. Update checkout route for env-based Price IDs

In `src/app/api/checkout/route.ts`, fetch price from env:
```typescript
// Instead of hardcoded price_data, use Stripe Price ID
const priceId = getStripePriceId(body.productId); // from env
```

---

## Switching from Test to Live

### Step 1: Final Test Mode Verification

**CRITICAL** — Run full test cycle:
1. Go through `/pricing` → click Buy → Stripe test checkout
2. Use test card `4242 4242 4242 4242`
3. Verify success URL, entitlement grant, email
4. Check Stripe Dashboard → Test Mode → Payments

### Step 2: Update Environment Variables

```bash
# In /opt/tianji-global/.env.production
# Change Stripe keys from test to live
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Step 3: Rebuild + Deploy

```bash
cd /opt/tianji-global
rm -rf .next && npm run build
pm2 restart tianji-global
pm2 save
```

### Step 4: Verify Live Mode

1. Check Stripe Dashboard → Live Mode toggle (top right) → "View live data"
2. Try a REAL small payment ($1 test):
   - Use card: 4242 4242 4242 4242 (Stripe doesn't charge real for this test card)
   - OR use: 4000000000000077 (charge declined for testing)
   - For REAL test: use any real card with $1 charge

### Step 5: Monitor First Payments

Watch Stripe Dashboard for:
- Payment intents succeeding
- Webhook events firing correctly
- Entitlements granting
- Refunds handling (if any)

---

## Post-Live Monitoring Checklist

- [ ] Stripe Dashboard → Payments: first live payment appears
- [ ] Webhook delivery: `checkout.session.completed` fires
- [ ] Entitlement granted in database
- [ ] Email receipt sent to customer
- [ ] Error monitoring: check `pm2 logs tianji-global` for Stripe errors

---

## Rollback Plan

If live mode has issues:

```bash
# Revert to test keys in .env.production
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Rebuild + restart
rm -rf .next && npm run build
pm2 restart tianji-global
```

---

## Compliance Checklist

- [ ] Privacy Policy page published at `/privacy`
- [ ] Terms of Service page published at `/terms`
- [ ] Refund policy clearly stated on pricing page
- [ ] Contact info in footer
- [ ] Cookie consent banner working