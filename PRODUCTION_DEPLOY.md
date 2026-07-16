# TianJi Global — Production Deployment Guide

> **Self-hosted only.** Do not use Vercel as the production deployment path.

## Table of Contents

1. [Overview](#overview)
2. [Environment Variables Reference](#environment-variables-reference)
3. [Test vs Production Variables](#test-vs-production-variables)
4. [Stripe Webhook Setup](#stripe-webhook-setup)
5. [AI Provider Configuration](#ai-provider-configuration)
6. [Deployment Checklist](#deployment-checklist)
7. [Server Setup](#server-setup)
8. [Rollback](#rollback)

---

## Overview

- **Domain:** `https://tianji.love`
- **Server IP:** `186.244.244.81`
- **App directory:** `/opt/tianji-global`
- **Process manager:** PM2
- **PM2 app name:** `tianji-global`
- **Reverse proxy:** Nginx

---

## Environment Variables Reference

### Core (Required for all environments)

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Runtime environment | `production` |
| `PORT` | Next.js listen port | `3000` |
| `NEXT_PUBLIC_APP_URL` | Public app URL (no trailing slash) | `https://tianji.love` |
| `NEXTAUTH_URL` | Auth callback base URL | `https://tianji.love` |
| `AUTH_URL` | Alias for NEXTAUTH_URL (NextAuth v5) | `https://tianji.love` |
| `NEXTAUTH_SECRET` | JWT signing secret | *(generate with `openssl rand -base64 32`)* |
| `AUTH_SECRET` | Alias; NextAuth v5 prefers this | *(generate with `openssl rand -base64 32`)* |

### Google OAuth

| Variable | Description |
|---|---|
| `GOOGLE_CLIENT_ID` | Google OAuth app client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth app client secret |

Google OAuth redirect URI: `https://tianji.love/api/auth/callback/google`

### Database

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |

Requires PostgreSQL for `@auth/pg-adapter`. The auth adapter uses the database for session storage.

### Resend (Email)

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | Verified sender address |
| `EMAIL_SEND_DISABLED` | Set `true` to disable all email sending |

### Supabase

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous (browser-safe) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key — **server only, never expose** |
| `SUPABASE_MUTATION_DISABLED` | Set `true` to disable all Supabase write operations |

### Stripe

| Variable | Description |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_...` for production) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_live_...`) |
| `STRIPE_LIVE_DISABLED` | Set `true` to disable live Stripe processing |
| `STRIPE_ASK_PRICE_ID` | One-time Ask unlock price ID |
| `STRIPE_DRAW_PRICE_ID` | One-time Draw unlock price ID |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | Pro monthly subscription price ID |
| `STRIPE_PRO_YEARLY_PRICE_ID` | Pro yearly subscription price ID |
| `STRIPE_LOVE_PREMIUM_REPORT_PRICE_ID` | Love premium report one-time price ID |

### AI Providers

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | OpenAI API key |
| `OPENAI_BASE_URL` | OpenAI base URL (default: `https://api.openai.com/v1`) |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `ANTHROPIC_BASE_URL` | Anthropic base URL |
| `DEEPSEEK_API_KEY` | DeepSeek API key |
| `DEEPSEEK_BASE_URL` | DeepSeek base URL |
| `MINIMAX_API_KEY` | MiniMax API key |
| `MINIMAX_BASE_URL` | MiniMax base URL |
| `MINIMAX_TOKEN_PLAN_KEY` | MiniMax token plan key (for quota checks) |
| `GEMINI_API_KEY` | Gemini API key |
| `GOOGLE_API_KEY` | Alternative Gemini key name |
| `GEMINI_BASE_URL` | Gemini base URL |
| `GROK_API_KEY` | Grok (xAI) API key |
| `GROK_BASE_URL` | Grok base URL |
| `OLLAMA_BASE_URL` | Ollama server URL (default: `http://localhost:11434`) |
| `OLLAMA_MODEL` | Ollama default model override |
| `PACKY_API_ENDPOINT` | Packy API endpoint (uses `OPENAI_API_KEY`) |

### Feature Flags

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_APP_ENV` | `production` or `staging` |
| `STAGING_DEGRADED_MODE` | Set `true` to enable degraded mode |
| `AI_PROVIDER_LIVE_DISABLED` | Set `true` to block live AI provider calls |
| `STRIPE_LIVE_DISABLED` | Set `true` to block live Stripe payments |
| `EMAIL_SEND_DISABLED` | Set `true` to block email sending |
| `SUPABASE_MUTATION_DISABLED` | Set `true` to block Supabase writes |
| `NEXT_PUBLIC_TIANJI_VEDIC_ENABLED` | Set `true` to enable Vedic public report routes |
| `TIANJI_VEDIC_REPORT_MODE` | `disabled` or `enabled` |
| `AI_RUNTIME_MODE` | `local`, `hybrid`, or provider-routed |
| `AI_FREE_PREVIEW_PROVIDER` | Provider for non-paid previews |
| `AI_FREE_PREVIEW_MODEL` | Model for non-paid previews |
| `AI_ROUTER_PROVIDER` | Router provider for model gateway |
| `AI_ROUTER_MODEL` | Router model for model gateway |
| `AI_ENABLE_SAFETY_REWRITE` | Enable AI output safety rewriting |
| `AI_ENABLE_COST_LOGGING` | Enable cost logging |
| `AI_ENABLE_FALLBACK_LOGGING` | Enable fallback logging |
| `STAGING_BASE_URL` | Staging URL for smoke scripts |

---

## Test vs Production Variables

### Test/Development Only

```
# Stripe test mode keys (sk_test_... / pk_test_...)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# Staging AI / provider keys (not production credentials)
DEEPSEEK_API_KEY=sk-... (staging)
MINIMAX_API_KEY=... (staging)
```

### Production Only

```
# Stripe live keys (sk_live_... / pk_live_...)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...

# Real AI provider production keys
# Real Supabase production credentials
```

### Shared (Both)

```
NEXTAUTH_SECRET        # Must be unique per environment (rotate separately)
AUTH_SECRET            # Alias for NEXTAUTH_SECRET
DATABASE_URL           # Separate DB per environment recommended
RESEND_API_KEY         # Can be same if Resend account handles both
NEXT_PUBLIC_APP_URL    # Points to correct environment origin
NEXTAUTH_URL           # Must match NEXT_PUBLIC_APP_URL
```

---

## Stripe Webhook Setup

### Step 1: Get Your Webhook Signing Secret

1. Install the Stripe CLI on your server:
   ```bash
   # Linux/macOS
   curl -sSL https://stripe-cli.s3揭akte.com/install.sh | sh
   ```

2. Log in to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local machine for initial setup:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. The CLI outputs a webhook signing secret like `whsec_...`. Copy it.

5. In the Stripe Dashboard, go to **Developers → Webhooks** and add your endpoint:
   - URL: `https://tianji.love/api/stripe/webhook`
   - Events to listen for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

### Step 2: Configure the Secret

Set `STRIPE_WEBHOOK_SECRET=whsec_...` in your production environment.

### Step 3: Verify in Production

```bash
# Test webhook delivery using Stripe CLI
stripe trigger checkout.session.completed
```

### Important

- The webhook secret is **environment-specific**. Test (`whsec_test_...`) and live (`whsec_live_...`) secrets are different.
- Never commit webhook secrets to version control.
- Rotate webhook signing secrets periodically (see `docs/tianji-love-credential-rotation-checklist.md`).

---

## AI Provider Configuration

### Provider Auto-Detection

The app auto-detects available AI providers based on which `*_API_KEY` environment variables are set:

```typescript
// From src/lib/ai-orchestrator.ts
if (process.env.OPENAI_API_KEY) available.push('openai');
if (process.env.ANTHROPIC_API_KEY) available.push('anthropic');
if (process.env.GROK_API_KEY) available.push('grok');
if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) available.push('gemini');
if (process.env.DEEPSEEK_API_KEY) available.push('deepseek');
if (process.env.MINIMAX_API_KEY) available.push('minimax');
available.push('ollama'); // Always available (local server)
```

### Recommended Production Configuration

At least **one** of the following is required for live AI features:

| Provider | Required Variables | Notes |
|---|---|---|
| Ollama (local) | `OLLAMA_BASE_URL` | No API key needed. Run `ollama serve` on the server. |
| DeepSeek | `DEEPSEEK_API_KEY` | Cost-effective for production. |
| MiniMax | `MINIMAX_API_KEY`, `MINIMAX_TOKEN_PLAN_KEY` | Use token plan key for quota tracking. |
| OpenAI | `OPENAI_API_KEY` | Highest cost; widest model support. |

### Model Gateway Routes

The app routes AI requests through a model gateway (`src/lib/tianji-model-gateway.ts`) that selects the appropriate provider per task:

- `love-preview`, `relationship-report` → Ollama (or configured fallback)
- `ask-unlock`, `paid_ask` → Configured router provider
- `tarot-draw`, `tarot_draw` → Configured router provider

### Quota Gating (MiniMax)

MiniMax has a quota gate controlled by `MINIMAX_TOKEN_PLAN_KEY`:
```typescript
// From src/lib/tianji-model-gateway.ts
export function getMiniMaxQuotaGate(env) {
  const tokenPlanKeyPresent = Boolean(env.MINIMAX_TOKEN_PLAN_KEY);
  return { enabled: tokenPlanKeyPresent, ... };
}
```

---

## Deployment Checklist

### Pre-Deploy

- [ ] All secrets are set in the server environment (not in the repo)
- [ ] `NEXT_PUBLIC_APP_ENV=production`
- [ ] `STAGING_DEGRADED_MODE=false` (unless deploying a free canary)
- [ ] `STRIPE_LIVE_DISABLED=false` (unless deploying a free canary)
- [ ] `AI_PROVIDER_LIVE_DISABLED=false` (unless deploying a free canary)
- [ ] Stripe webhook endpoint configured at `https://tianji.love/api/stripe/webhook`
- [ ] Google OAuth redirect URI: `https://tianji.love/api/auth/callback/google`
- [ ] Resend sender/domain verified for `EMAIL_FROM`
- [ ] Supabase migrations applied from `supabase/migrations`
- [ ] AI provider keys have cost limits set in their dashboards

### Build & Release

```bash
cd /opt/tianji-global
git fetch origin main
git checkout main
git pull --ff-only origin main

npm ci --legacy-peer-deps
npm run release:check

pm2 restart tianji-global --update-env
pm2 save

SMOKE_BASE_URL=https://tianji.love npm run smoke:production
```

### Post-Deploy Smoke

```bash
# Check all key routes return 200
curl -sS -o /dev/null -w "home=%{http_code}\n" "https://tianji.love/"
curl -sS -o /dev/null -w "pricing=%{http_code}\n" "https://tianji.love/pricing"
curl -sS -o /dev/null -w "login=%{http_code}\n" "https://tianji.love/login"
curl -sS -o /dev/null -w "relationship=%{http_code}\n" "https://tianji.love/relationship/new"
```

### Paid Flow Smoke (after explicit approval)

```bash
# Test Stripe checkout session creation (test mode only)
# Test webhook endpoint receipt
# Verify entitlement write to Supabase
```

### Rollback

```bash
# Identify previous release
OLD_RELEASE="$(readlink -f /var/www/tianji-global/current)"

# Switch to previous release
ln -sfn "${OLD_RELEASE}" /var/www/tianji-global/current
cd /var/www/tianji-global/current
pm2 restart tianji-global --update-env

# Verify
curl -sS -o /dev/null -w "home=%{http_code}\n" https://tianji.love/
```

---

## Server Setup

### First-Time Setup

```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone the repository
cd /opt
sudo git clone https://github.com/yihui315/tianji-global.git
cd /opt/tianji-global
sudo git checkout main

# Install dependencies
sudo npm ci --legacy-peer-deps

# Start the app
cd /opt/tianji-global
NODE_ENV=production PORT=3000 pm2 start npm --name tianji-global -- start
pm2 save

# Nginx configuration (HTTP → HTTPS redirect + proxy)
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name tianji.love www.tianji.love;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tianji.love www.tianji.love;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Apply Nginx changes:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Related Documentation

- `docs/US_SERVER_DEPLOY.md` — Detailed server deployment steps
- `docs/DEPLOY.md` — General deployment overview and release gates
- `docs/tianji-love-production-canary-runbook.md` — Free canary deployment procedure
- `docs/tianji-love-credential-rotation-checklist.md` — Credential rotation guide
- `docs/tianji-love-staging-env-pack.md` — Staging environment variable reference
