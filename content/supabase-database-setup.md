# Supabase DATABASE_URL Setup Guide — P27

## Current Status

Your production environment does NOT have a `.env.production` file.
This is actually secure — credentials are injected via PM2 environment, not stored on disk.

## To Configure DATABASE_URL

### Step 1: Get Connection String from Supabase

1. Go to [supabase.com](https://supabase.com) → your project
2. Settings → Database → Connection String
3. Choose **URI** tab (not Pooled)
4. Copy the connection string:

```bash
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

### Step 2: Add to PM2 Environment

```bash
# As deploy user, edit PM2 environment:
sudo -u deploy bash -c "pm2 start node_modules/.bin/next --name tianji-global -- start -p 3000 --env DATABASE_URL='postgresql://postgres.PROJECT:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres'"
```

Or use ecosystem file:

```bash
sudo -u deploy bash -c "cat > /home/deploy/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'tianji-global',
    script: 'node_modules/.bin/next',
    args: 'start -p 3000',
    cwd: '/opt/tianji-global',
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://postgres.PROJECT:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres',
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      NEXT_PUBLIC_APP_URL: 'https://tianji.love',
      ENABLE_PAY_PER_USE: 'true'
    }
  }]
};
EOF"
```

Then restart:
```bash
sudo -u deploy bash -c "pm2 delete tianji-global; pm2 start /home/deploy/ecosystem.config.js && pm2 save"
```

### Step 3: Verify Connection

```bash
curl -s http://127.0.0.1:3000/api/health | python3 -c "import sys,json; d=json.load(sys.stdin); print('DB:', d.get('services',{}).get('database','unknown'))"
```

### Step 4: Run Migration

Once DATABASE_URL is set, run the SQL migration in Supabase Dashboard → SQL Editor.

## Verification

After setting DATABASE_URL, check PM2 logs:
```bash
sudo -u deploy bash -c "pm2 logs tianji-global --lines 20 --nostream"
```

Look for: "Database connected" or connection errors.

## Rollback

If DATABASE_URL causes issues, restart without it:
```bash
sudo -u deploy bash -c "pm2 delete tianji-global; pm2 start node_modules/.bin/next --name tianji-global -- start -p 3000 && pm2 save"
```