# TianJi Love Staging HTTPS Runbook

## Scope

Fix the user-observed `https://staging.tianji.love` 502 path without changing production or paid/live systems.

This runbook is not executed by Codex. It is a server-operator checklist for the staging host only.

## Current Context

```text
production free canary: Go
production tianji.love: do not change
staging HTTP smoke: Go from prior hosted evidence
staging HTTPS browser/tool path: user-observed 502
staging host: staging.tianji.love
staging upstream: 127.0.0.1:3058
staging PM2 app: tianji-staging
paid launch: No-Go
```

## Safety Rules

```text
Do not modify tianji.love production server block.
Do not switch /var/www/tianji-global/current.
Do not restart tianji-global.
Do not read or print .env values.
Do not run Stripe, webhook, paid unlock, provider live, email, or Supabase mutation smoke.
Do not delete /var/www/tianji-global/releases/20260502-155434.
Do not stop staging except during an explicit incident rollback.
```

## Preflight

Run status-only checks first:

```bash
set +e
echo "prod_current=$(readlink -f /var/www/tianji-global/current)"
sudo -iu deploy pm2 status
ss -lntp | grep -E ':(3000|3058|3103)' || true
curl -sS -o /dev/null -w "staging_http=%{http_code}\n" http://staging.tianji.love
curl -k -sS -o /dev/null -w "staging_https_before=%{http_code}\n" https://staging.tianji.love || true
```

Expected before remediation:

```text
tianji-global online
tianji-staging online
3000 production listening
3058 staging listening
staging_http=200 or approved redirect
staging_https_before may be 502 before fix
```

## Nginx Certbot Procedure

Use the staging server name only:

```bash
sudo nginx -t
sudo certbot --nginx -d staging.tianji.love
sudo nginx -t
sudo systemctl reload nginx
```

When prompted, prefer HTTPS redirect for `staging.tianji.love` only if Nginx confirms it is editing the staging server block.

Do not accept a certbot edit that targets production `tianji.love`.

## Required Nginx Target

After remediation, the staging HTTPS server block must proxy to:

```text
proxy_pass http://127.0.0.1:3058
```

Record status labels only. Do not paste full config if it contains unrelated private paths or comments.

## Post-Change Smoke

```bash
set +e
curl -k -sS -o /dev/null -w "staging_https=%{http_code}\n" https://staging.tianji.love
curl -sS -o /dev/null -w "staging_http=%{http_code}\n" http://staging.tianji.love
curl -k -sS -o /dev/null -w "staging_ask=%{http_code}\n" https://staging.tianji.love/ask
curl -k -sS -o /dev/null -w "staging_draw=%{http_code}\n" https://staging.tianji.love/draw
curl -k -sS -o /dev/null -w "staging_pricing=%{http_code}\n" https://staging.tianji.love/pricing
curl -k -sS -o /dev/null -w "prod_home_guard=%{http_code}\n" https://tianji.love
sudo -iu deploy pm2 status
```

Expected:

```text
staging_https=200
staging_ask=200
staging_draw=200
staging_pricing=200
prod_home_guard=200
tianji-global online
tianji-staging online
```

## Rollback

If Nginx fails config test or production is affected:

```bash
sudo nginx -t
sudo systemctl reload nginx
curl -k -sS -o /dev/null -w "prod_home_after_nginx_rollback=%{http_code}\n" https://tianji.love
```

If certbot changed the wrong server block, restore the prior Nginx site file from the operator backup, then:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Evidence To Record

```text
nginx -t before: pass/fail
certbot staging.tianji.love: completed/not-run
nginx -t after: pass/fail
nginx reload: completed/not-run
staging_https: status code
staging_http: status code
staging_ask: status code
staging_draw: status code
staging_pricing: status code
prod_home_guard: status code
production current unchanged: yes/no
tianji-global online: yes/no
tianji-staging online: yes/no
paid/live side effects: none
```
