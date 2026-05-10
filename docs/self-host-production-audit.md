# Tianji Love Self-Hosted Production Audit

This checklist audits the self-hosted Tianji Love production deployment.

- Production IP: `186.244.244.81`
- Production domain: `tianji.love`
- Expected app port: `127.0.0.1:3000`
- Expected reverse proxy: Nginx
- Expected process manager: PM2, with systemd acceptable only if it is the active deployment path

Do not print secrets. Do not paste `.env` contents into tickets, logs, PR comments, docs, or chat. Do not modify environment values during this audit.

## Payment Safety Gate

`ENABLE_PAY_PER_USE` must remain `false` until Stripe staging verification passes.

Do not enable paid unlock during this audit. Stripe Checkout, webhook signature validation, duplicate webhook replay, invalid-signature rejection, paid entitlement unlock, refund/support handling, Supabase migrations, and Resend delivery must be verified in staging before production paid traffic is allowed.

If you need to check the flag on the server, inspect only this one non-secret line and do not print the rest of the env file:

```bash
cd /opt/tianji-global
grep -E '^ENABLE_PAY_PER_USE=' .env.production
```

Pass criteria: the value is exactly `ENABLE_PAY_PER_USE=false` or the variable is absent and the application default keeps paid unlock disabled.

## External Network Checks

Run these from a workstation outside the production server.

| Check | Command | Pass criteria |
| --- | --- | --- |
| `tianji.love` DNS A record | `dig +short A tianji.love` | Returns `186.244.244.81`. |
| `www.tianji.love` DNS resolution | `dig +short A www.tianji.love` or `dig +short CNAME www.tianji.love` | Resolves directly or indirectly to `186.244.244.81`. |
| HTTP 80 reachability | `curl -I --max-time 15 http://tianji.love/` | Returns a valid HTTP response, preferably `301` redirecting to HTTPS. |
| HTTPS 443 reachability | `curl -Iv --max-time 20 https://tianji.love/` | TLS handshake succeeds and returns a valid HTTP response. |
| Direct IP with domain host | `curl -I --max-time 15 -H 'Host: tianji.love' http://186.244.244.81/` | Nginx accepts the Host header and redirects or proxies as expected. |

PowerShell equivalents:

```powershell
Resolve-DnsName tianji.love
Resolve-DnsName www.tianji.love
Test-NetConnection tianji.love -Port 80
Test-NetConnection tianji.love -Port 443
curl.exe -I --max-time 15 http://tianji.love/
curl.exe -I --max-time 20 https://tianji.love/
```

## Current External Observation

Observed from this workstation on 2026-05-10:

- `tianji.love` resolves to `186.244.244.81`.
- `www.tianji.love` CNAMEs to `tianji.love`, which resolves to `186.244.244.81`.
- TCP port 80 is reachable.
- TCP port 443 is reachable.
- HTTP with `Host: tianji.love` returns `301` to `https://tianji.love/`.
- `curl -I https://tianji.love/` returns `200`.
- `curl -I https://www.tianji.love/` returns `200`.
- The HTTPS response includes `Server: nginx/1.24.0 (Ubuntu)` and `X-Powered-By: Next.js`, so the public Nginx-to-Next.js path is responding externally.
- The TLS certificate subject is `CN=tianji.love`, issuer is Let's Encrypt `E7`, protocol is TLS 1.2, and the observed certificate validity window is 2026-05-02 to 2026-07-31.
- SSH key login as `deploy` is not available from this workstation.

Current smoke status:

| Route | Observed status |
| --- | --- |
| `/` | `200` |
| `/en` | `404` |
| `/zh-CN` | `404` |
| `/en/pricing` | `404` |
| `/en/love-reading/result/demo` | `404` |
| `/legal/privacy` | `200` |
| `/legal/terms` | `200` |
| `/pricing` | `200` |
| `/relationship/new` | `200` |

The `404` responses on the Love V1 localized routes indicate that production is serving an older app build or a branch that does not yet include the PR #46 localized Love V1 routes. Treat this as `NO-GO` for Love V1 paid launch until the intended release commit is deployed and the smoke checklist passes.

## Server Internal Checks

Run these over SSH on the production server. Do not print secret values.

### 1. OS, Time, And Disk

```bash
hostname
date -u
uptime
df -h /
free -h
```

Pass criteria: host is the expected server, system time is sane, root disk has enough free space, and memory is not exhausted.

### 2. Listening Ports

```bash
sudo ss -tulpn | grep -E ':(80|443|3000)\b'
```

Pass criteria:

- Nginx listens on `0.0.0.0:80` and `0.0.0.0:443`, or equivalent IPv6 listeners.
- Next.js listens on `127.0.0.1:3000` or the documented local app bind address.
- Port `3000` is not publicly exposed unless intentionally allowed by firewall policy.

### 3. Nginx Reverse Proxy

```bash
sudo nginx -t
sudo nginx -T | grep -nE 'server_name|proxy_pass|listen 80|listen 443'
curl -I -H 'Host: tianji.love' http://127.0.0.1/
curl -I http://127.0.0.1:3000/en
```

Pass criteria:

- `nginx -t` succeeds.
- The active site includes `server_name tianji.love www.tianji.love`.
- HTTPS server block proxies application traffic to `http://127.0.0.1:3000`.
- Local app health check at `127.0.0.1:3000/en` returns `200`.

Expected proxy shape:

```nginx
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
```

### 4. Next.js App Status

```bash
cd /opt/tianji-global
git status --short --branch
node -v
npm -v
curl -I http://127.0.0.1:3000/
curl -I http://127.0.0.1:3000/en
```

Pass criteria:

- Server is on the intended release branch and commit.
- Node is compatible with the release runbook, preferably Node 20 LTS.
- Local app routes respond before testing the public domain.

### 5. PM2 Or Systemd Process Status

PM2 path:

```bash
pm2 status tianji-global --no-color
pm2 describe tianji-global
pm2 logs tianji-global --lines 80 --nostream
```

Systemd path, only if PM2 is not used:

```bash
systemctl status tianji-global --no-pager
journalctl -u tianji-global -n 80 --no-pager
```

Pass criteria:

- Exactly one process-management path is active for the app.
- The app is online/running.
- Recent logs do not show crash loops, missing secrets, port conflicts, or repeated 5xx errors.

### 6. SSL Certificate Status

```bash
sudo certbot certificates
echo | openssl s_client -connect tianji.love:443 -servername tianji.love 2>/dev/null | openssl x509 -noout -subject -issuer -dates
echo | openssl s_client -connect www.tianji.love:443 -servername www.tianji.love 2>/dev/null | openssl x509 -noout -subject -issuer -dates
```

Pass criteria:

- Certificate covers both `tianji.love` and `www.tianji.love`.
- Certificate is not expired and has enough renewal runway.
- Nginx uses the same certificate paths reported by Certbot or the documented certificate manager.

### 7. Firewall Status

```bash
sudo ufw status verbose
sudo iptables -S
```

Also check the cloud provider firewall/security group.

Pass criteria:

- Ports `80/tcp` and `443/tcp` are open to the public.
- SSH is restricted to approved operators or provider access controls.
- Port `3000/tcp` is not open to the public unless there is a documented exception.

## Production Smoke Checklist

Run after Nginx, TLS, and the app process are healthy.

```bash
BASE_URL=https://tianji.love
for path in \
  / \
  /en \
  /zh-CN \
  /en/pricing \
  /en/love-reading/result/demo \
  /legal/privacy \
  /legal/terms
do
  echo "== $BASE_URL$path =="
  curl -I --max-time 20 "$BASE_URL$path"
done
```

Expected result:

| Route | Expected |
| --- | --- |
| `/` | `200` or intentional redirect to the canonical localized homepage. |
| `/en` | `200`. |
| `/zh-CN` | `200`. |
| `/en/pricing` | `200`; no live paid unlock should be enabled. |
| `/en/love-reading/result/demo` | `200`; demo report is visible and privacy-safe. |
| `/legal/privacy` | `200`. |
| `/legal/terms` | `200`. |

If any smoke route returns `5xx`, stop launch traffic and inspect the PM2/systemd logs before retrying.

## Audit Result Template

Copy this block into the release note or PR comment after running the audit. Do not include secrets.

```text
Production audit date:
Auditor:
Commit:

DNS:
- tianji.love A:
- www.tianji.love:

Network:
- HTTP 80:
- HTTPS 443:

Server:
- Nginx config test:
- Reverse proxy to 127.0.0.1:3000:
- Next.js local health:
- PM2/systemd status:
- SSL certificate status:
- Firewall status:

Smoke:
- /:
- /en:
- /zh-CN:
- /en/pricing:
- /en/love-reading/result/demo:
- /legal/privacy:
- /legal/terms:

Payment safety:
- ENABLE_PAY_PER_USE remains false:
- Stripe staging verification completed:

Decision:
- GO / NO-GO:
- Follow-up:
```
