# TianJi Global — Vercel Deployment Guide

## Prerequisites

- GitHub repository connected to your Vercel account
- Vercel Pro plan recommended (for production features, larger bandwidth)
- Stripe account with products/price IDs created
- Supabase project (or another PostgreSQL provider)
- At least one AI provider API key (OpenAI, Anthropic, xAI/Grok, Google Gemini)

---

## 1. Link GitHub Repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..." → "Project"**
3. Find your **tianji-global** repository in the list
4. Click **"Import"**
5. On the configuration screen:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `.` (default)
   - **Build Command:** `npm run build` (pre-filled)
   - **Output Directory:** `.next` (pre-filled)
6. Click **"Deploy"**

---

## 2. Set Environment Variables

In the Vercel project dashboard, go to **Settings → Environment Variables** and add the following:

### Required

| Variable | Value |
|---|---|
| `AUTH_SECRET` | Generate with: `openssl rand -base64 32` |
| `AUTH_URL` | `https://tianji.global` (or your custom domain) |
| `NEXT_PUBLIC_APP_URL` | `https://tianji.global` |
| `NEXT_PUBLIC_SUPABASE_URL` | From your Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From your Supabase project settings |
| `SUPABASE_SERVICE_ROLE_KEY` | From your Supabase project settings |
| `DATABASE_URL` | Full PostgreSQL connection string (e.g. `postgresql://user:pass@host:5432/db`) |
| `STRIPE_SECRET_KEY` | `sk_live_...` or `sk_test_...` from Stripe dashboard |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` from Stripe webhook settings (see Section 4) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` or `pk_test_...` from Stripe dashboard |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | Price ID for Pro Monthly plan from Stripe Dashboard |
| `STRIPE_PRO_YEARLY_PRICE_ID` | Price ID for Pro Yearly plan from Stripe Dashboard |
| `OPENAI_API_KEY` | From OpenAI platform.openai.com |
| `ANTHROPIC_API_KEY` | From console.anthropic.com |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console (OAuth 2.0) |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console (OAuth 2.0) |

### Optional (AI Providers)

| Variable | Description |
|---|---|
| `GROK_API_KEY` | From xAI (api.x.ai) |
| `GEMINI_API_KEY` | From Google AI Studio |
| `GOOGLE_API_KEY` | Alternative for Gemini (used when GEMINI_API_KEY is not set) |
| `OPENAI_BASE_URL` | Custom OpenAI-compatible proxy URL |
| `ANTHROPIC_BASE_URL` | Custom Anthropic proxy URL |
| `GROK_BASE_URL` | Custom Grok proxy URL |
| `GEMINI_BASE_URL` | Custom Gemini proxy URL |
| `OLLAMA_BASE_URL` | Local Ollama server URL (default: `http://localhost:11434`) |
| `DEFAULT_MODEL_PROVIDER` | `anthropic` (default), `openai`, `grok`, `gemini` |
| `DEFAULT_MODEL` | Model name to use by default |

> **Important:** Set environment variables for **Production**, **Preview**, and **Development** environments as appropriate.

---

## 3. Configure Stripe Webhook

### 3a. Get Your Webhook Signing Secret

1. In Stripe Dashboard, go to **Developers → Webhooks**
2. Click **"Add endpoint"**
3. Fill in:
   - **Endpoint URL:** `https://tianji.global/api/stripe/webhook`
   - **Listen to:** `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - **Signing secret:** Click **"Create"** or copy the `whsec_...` secret
4. Click **"Add endpoint"**
5. Copy the **Signing secret** (`whsec_...`)

### 3b. Add to Vercel

Add the signing secret as `STRIPE_WEBHOOK_SECRET` in your Vercel environment variables.

### Local Development Testing

For local Stripe CLI testing:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copy the resulting whsec_... into your .env as STRIPE_WEBHOOK_SECRET
```

---

## 4. Add Custom Domain (tianji.global)

### In Vercel

1. Go to **Settings → Domains**
2. Enter `tianji.global` and click **Add**
3. Vercel will provide DNS records to add

### DNS Configuration

Add the following records at your DNS provider:

| Type | Name | Value |
|---|---|---|
| `A` | `@` | `76.76.21.21` |
| `AAAA` | `@` | `2a04:4e42:200::731` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

> Note: Vercel may provide different values — use the exact values shown in the Vercel dashboard.

### After Domain Verification

1. Ensure the domain status shows **Valid** in Vercel
2. In Stripe Dashboard, update your webhook endpoint URL to use `https://tianji.global/api/stripe/webhook` (not the `.vercel.app` URL)
3. Update `AUTH_URL` and `NEXT_PUBLIC_APP_URL` in Vercel to use `https://tianji.global`

---

## 5. Build & Deploy

Every push to the `main` branch triggers an automatic production deployment. You can also:

- Push to a feature branch for preview deployments
- Use `vercel --prod` from CLI for immediate production deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (from project root)
vercel

# Production deploy
vercel --prod
```

---

## 6. Known Vercel-Specific Notes

### Edge Runtime Routes

The following API routes use specific runtimes:

- **`/api/share/og`** — Uses `runtime = 'edge'` for fast OG image generation via `@vercel/og`. This is compatible with Vercel Edge Functions.
- **`/api/stripe/webhook`** — Uses `runtime = 'nodejs'`. This is required because it uses the `pg` (node-postgres) library which is not compatible with Edge runtime.

### Database Connection

The Stripe webhook route uses a direct PostgreSQL connection (`pg` library) via `DATABASE_URL`. Ensure your PostgreSQL host allows connections from Vercel's IP ranges, or use Supabase which has built-in Vercel integration.

### NextAuth v5

NextAuth v5 is used. The `AUTH_SECRET` and `AUTH_URL` environment variables are required. On Vercel, `AUTH_URL` should match your deployment URL (e.g., `https://tianji.global` or `https://your-project.vercel.app`).

### AI Providers

At least one AI provider key is required (`OPENAI_API_KEY` or `ANTHROPIC_API_KEY`). All providers are optional but at least one must be configured.

---

## 7. Troubleshooting

### Build fails

```bash
# Run build locally to debug
npm run build
```

### Stripe webhook not working

- Verify `STRIPE_WEBHOOK_SECRET` is set in Vercel (not just in `.env`)
- Ensure webhook endpoint in Stripe dashboard matches your production URL
- Check Vercel function logs for the specific error

### Authentication redirect loops

- Ensure `AUTH_URL` matches exactly (no trailing slash) the URL you're accessing
- For preview deployments, add preview URLs to the Google OAuth **Authorized redirect URIs** in Google Cloud Console

### Environment variables not picked up

- Restart the deployment after adding new environment variables
- Check that the variable is set for the correct environment (Production/Preview/Development)
