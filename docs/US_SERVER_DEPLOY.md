# TianJi Global US Server Deployment

This project is currently deployed on a self-hosted US server, not Vercel.

Known production shape from workspace history:

- Domain: `https://tianji.love`
- Server IP: `186.244.244.81`
- App directory: `/opt/tianji-global`
- Process manager: PM2
- PM2 app name: `tianji-global`
- Reverse proxy: Nginx

Do not store secret values in GitHub issues, PR comments, docs, logs, or chat.

## Required Server Runtime

- Ubuntu 22.04+ or equivalent Linux host
- Node.js 20 LTS
- npm using the repository `package-lock.json`
- PM2 installed for the deploy user
- Nginx reverse proxy on ports 80 and 443
- Valid TLS certificate for `tianji.love` and `www.tianji.love`
- App env file on the server, for example `/opt/tianji-global/.env.production`

## Required Production Environment Names

Set real values only on the server or in the deployment secret store.

- `NODE_ENV=production`
- `PORT=3000`
- `NEXT_PUBLIC_APP_URL=https://tianji.love`
- `AUTH_URL=https://tianji.love`
- `NEXTAUTH_URL=https://tianji.love`
- `NEXTAUTH_SECRET`
- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- at least one AI provider key, for example `OPENAI_API_KEY`

## First-Time Server Setup

Run these commands on the server as the deploy user after SSH key access is configured.

```bash
cd /opt
git clone https://github.com/yihui315/tianji-global.git tianji-global
cd /opt/tianji-global
git checkout main
npm ci --legacy-peer-deps
npm run release:check
PORT=3000 NODE_ENV=production pm2 start npm --name tianji-global -- start
pm2 save
```

Nginx should proxy the domain to the Next.js process:

```nginx
server {
    listen 80;
    server_name tianji.love www.tianji.love;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tianji.love www.tianji.love;

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

After editing Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Manual Deploy From The Server

Use this when GitHub Actions deployment is not configured yet.

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

## GitHub Actions Deployment

Use the manual workflow `Deploy US Server` after merging the launch PR to `main`.

Required GitHub secrets:

- `US_SERVER_HOST`
- `US_SERVER_USER`
- `US_SERVER_SSH_KEY`
- `US_SERVER_APP_DIR`
- `US_SERVER_PM2_APP`
- optional: `US_SERVER_PORT`

Optional GitHub variable:

- `SMOKE_BASE_URL`, defaults to `https://tianji.love`

The workflow runs `npm run release:check` on the server before restarting PM2.

## Current Launch Blockers

Observed from local preflight on 2026-05-10:

- `tianji.love` and `www.tianji.love` resolve to `186.244.244.81`.
- HTTP with the `tianji.love` host redirects to HTTPS.
- HTTPS handshake closes before a response from this workstation.
- The server IP root returns the default Nginx 404 without a Host header.
- SSH key login for `deploy`, `root`, and `ubuntu` is not available from this workstation.

Fix the server-side TLS/Nginx issue and provision SSH key access before running the deploy workflow.
