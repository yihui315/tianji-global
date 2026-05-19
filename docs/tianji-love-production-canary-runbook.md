# TianJi Love Production Free Canary Runbook

## 1. Scope

This runbook prepares a production free canary only.

Do not deploy unless the user gives explicit manual approval. Do not approve paid launch from this runbook.

Allowed production canary surfaces:

```text
home
pricing
relationship free
ask preview
draw preview
login
paid routes locked / disabled
Vedic paid disabled
```

Blocked surfaces:

```text
Stripe live payment
Stripe webhook
Ask paid unlock
Draw paid unlock
Vedic paid public report
email automation
Supabase production mutation
provider live scaling
```

## 2. Exact release path strategy

Use a new release directory. Do not build directly in `current`.

Release path pattern:

```text
/var/www/tianji-global/releases/YYYYMMDD-HHMMSS-free-canary
```

Current symlink:

```text
/var/www/tianji-global/current
```

Required preflight before execution:

```bash
set -euo pipefail

OLD_RELEASE="$(readlink -f /var/www/tianji-global/current)"
echo "old_release=${OLD_RELEASE}"
test -d "${OLD_RELEASE}"

ss -lntp | grep -E ':(3000|3103)\b' || true
```

Operator rule:

```text
Record the old release path before switching current. Do not delete it during the canary.
```

## 3. Env flag strategy

Production free canary initial flags:

```text
NEXT_PUBLIC_APP_ENV=production
STAGING_DEGRADED_MODE=true
AI_PROVIDER_LIVE_DISABLED=true
STRIPE_LIVE_DISABLED=true
EMAIL_SEND_DISABLED=true
SUPABASE_MUTATION_DISABLED=true
NEXT_PUBLIC_TIANJI_VEDIC_ENABLED=false
TIANJI_VEDIC_REPORT_MODE=disabled
```

Why `STAGING_DEGRADED_MODE=true` is used temporarily:

```text
Lane M is a production free canary, not a paid launch. The degraded guards intentionally keep live side effects locked while free public routes are checked on production.
```

Important build caution:

```text
npm run build:staging:degraded currently sets NEXT_PUBLIC_APP_ENV=staging inside package.json. For Lane M, prefer npm run build with the production free canary flags exported in the shell. Only use npm run build:staging:degraded if the operator explicitly accepts that public env label behavior.
```

Do not print production secrets. Do not `cat` production `.env` files.

## 4. Build command

Preferred build for Lane M:

```bash
export NEXT_PUBLIC_APP_ENV=production
export STAGING_DEGRADED_MODE=true
export AI_PROVIDER_LIVE_DISABLED=true
export STRIPE_LIVE_DISABLED=true
export EMAIL_SEND_DISABLED=true
export SUPABASE_MUTATION_DISABLED=true
export NEXT_PUBLIC_TIANJI_VEDIC_ENABLED=false
export TIANJI_VEDIC_REPORT_MODE=disabled

npm ci --legacy-peer-deps
npm run build
```

Fallback build only with explicit acceptance of the staging public env label:

```bash
npm ci --legacy-peer-deps
npm run build:staging:degraded
```

## 5. Production canary command template

Preferred server-side script:

```bash
bash ops/tianji-love-production-free-canary.sh
```

Default behavior is dry-run only. It prints the planned release path, source branch, canary flags, and required execution environment, then exits without cloning, building, switching `current`, restarting PM2, or smoking production.

Do not execute production canary until explicit manual approval is given.

Approval phrase:

```text
Approved: execute Lane M production free canary using server-side preflight build, free routes only, paid/live side effects locked.
```

After approval, the operator must verify the production PM2 app name on the server, then pass it explicitly:

```bash
sudo -iu deploy bash <<'EOF'
set -euo pipefail

cd /path/to/reviewed/tianji-global

CANARY_EXECUTE=true \
PM2_APP=<verified-production-pm2-app> \
bash ops/tianji-love-production-free-canary.sh
EOF
```

Script safety properties:

```text
default dry-run
requires CANARY_EXECUTE=true to deploy
requires explicit PM2_APP and refuses tianji-staging
uses a new /var/www/tianji-global/releases/YYYYMMDD-HHMMSS-free-canary path
does not copy staging .env.local
appends free-canary side-effect locks without printing secret values
runs npm ci --legacy-peer-deps and npm run build before switching current
starts the candidate release on 127.0.0.1:3068 as PM2 app tianji-canary-preflight before switching current
smokes candidate home, pricing, ask, draw, and login before switching current
switches current only after build and candidate preflight succeed
restarts only the verified PM2 app passed in PM2_APP
waits up to 60 seconds for https://tianji.love/ to return 200 after PM2 restart
smokes only free GET routes
always stop/deletes tianji-canary-preflight on success or failure
rolls back current symlink and restarts PM2 if post-switch smoke/restart fails
does not run Stripe checkout, webhook replay, paid unlock, email send, Supabase mutation, or provider-live scaling
```

Manual template, for review only. Prefer the script above because it has dry-run and rollback guardrails:

```bash
sudo -iu deploy bash <<'EOF'
set -euo pipefail

BRANCH="staging-degraded-20260518"
REPO="https://github.com/yihui315/tianji-global.git"
STAMP="$(date -u +%Y%m%d-%H%M%S)-free-canary"
BASE="/var/www/tianji-global"
RELEASE="${BASE}/releases/${STAMP}"
OLD_RELEASE="$(readlink -f "${BASE}/current")"

echo "old_release=${OLD_RELEASE}"
test -d "${OLD_RELEASE}"

mkdir -p "${RELEASE}"
git clone -b "${BRANCH}" "${REPO}" "${RELEASE}"
cd "${RELEASE}"

git rev-parse HEAD
git status --short
test -f package.json
test -f package-lock.json

# Build a production free canary env without printing secret values.
# If a production shared env file is used, copy it without cat/echo and append
# the free-canary locks below so the final effective values are fail-closed.
if [ -f "${BASE}/shared/.env.production" ]; then
  cp "${BASE}/shared/.env.production" .env.local
else
  touch .env.local
fi
chmod 600 .env.local

cat >> .env.local <<'ENVEOF'
NEXT_PUBLIC_APP_ENV=production
STAGING_DEGRADED_MODE=true
AI_PROVIDER_LIVE_DISABLED=true
STRIPE_LIVE_DISABLED=true
EMAIL_SEND_DISABLED=true
SUPABASE_MUTATION_DISABLED=true
NEXT_PUBLIC_TIANJI_VEDIC_ENABLED=false
TIANJI_VEDIC_REPORT_MODE=disabled
PORT=3000
NEXT_PUBLIC_APP_URL=https://tianji.love
NEXTAUTH_URL=https://tianji.love
AUTH_URL=https://tianji.love
ENVEOF

export NEXT_PUBLIC_APP_ENV=production
export STAGING_DEGRADED_MODE=true
export AI_PROVIDER_LIVE_DISABLED=true
export STRIPE_LIVE_DISABLED=true
export EMAIL_SEND_DISABLED=true
export SUPABASE_MUTATION_DISABLED=true
export NEXT_PUBLIC_TIANJI_VEDIC_ENABLED=false
export TIANJI_VEDIC_REPORT_MODE=disabled

npm ci --legacy-peer-deps
npm run build

ln -sfn "${RELEASE}" "${BASE}/current"

cd "${BASE}/current"
pm2 restart tianji-global --update-env
pm2 status
pm2 logs tianji-global --lines 80 --nostream

echo "old_release=${OLD_RELEASE}" > "${BASE}/FREE_CANARY_ROLLBACK_TARGET"
echo "new_release=${RELEASE}" >> "${BASE}/FREE_CANARY_ROLLBACK_TARGET"
EOF
```

If the verified production PM2 app name is not `tianji-global`, replace only the PM2 app name after recording the observed name in the canary evidence.

## 6. Smoke commands

Run after the symlink switch and PM2 restart:

```bash
BASE_URL=https://tianji.love

curl -sS -o /dev/null -w "home=%{http_code}\n" "$BASE_URL/"
curl -sS -o /dev/null -w "pricing=%{http_code}\n" "$BASE_URL/pricing"
curl -sS -o /dev/null -w "ask=%{http_code}\n" "$BASE_URL/ask"
curl -sS -o /dev/null -w "draw=%{http_code}\n" "$BASE_URL/draw"
curl -sS -o /dev/null -w "login=%{http_code}\n" "$BASE_URL/login"
curl -sS -o /dev/null -w "relationship=%{http_code}\n" "$BASE_URL/relationship/new"

SMOKE_BASE_URL=https://tianji.love npm run smoke:production || true
```

Manual free-flow checks:

```text
POST /api/relationship/analyze only with free test payload
POST /api/ask/preview only with non-paid preview payload
POST /api/draw/preview only with non-paid preview payload
```

Do not run checkout, webhook replay, paid unlock, email send, Supabase mutation, or provider live scaling in Lane M.

## 7. Rollback commands

Use if any free route returns repeated `5xx`, wrong-origin redirects, paid exposure, Vedic paid exposure, Stripe/webhook/email/Supabase side effects, or PM2 crash loops.

```bash
sudo -iu deploy bash <<'EOF'
set -euo pipefail

BASE="/var/www/tianji-global"
OLD_RELEASE="$(grep '^old_release=' "${BASE}/FREE_CANARY_ROLLBACK_TARGET" | cut -d= -f2-)"
test -d "${OLD_RELEASE}"

ln -sfn "${OLD_RELEASE}" "${BASE}/current"
cd "${BASE}/current"
pm2 restart tianji-global --update-env
pm2 status
pm2 logs tianji-global --lines 80 --nostream

curl -sS -o /dev/null -w "home=%{http_code}\n" https://tianji.love/
curl -sS -o /dev/null -w "pricing=%{http_code}\n" https://tianji.love/pricing
EOF
```

If the verified PM2 app name differs from `tianji-global`, use the verified name in both canary and rollback commands.

## 8. Go / No-Go table

| Gate | Go criteria | No-Go criteria | Decision before execution |
| --- | --- | --- | --- |
| Staging evidence | Hosted non-paid smoke overall `go` on `http://staging.tianji.love` | Missing or stale staging smoke | Go |
| Source candidate | `origin/staging-degraded-20260518` equals `1370486c1b36aee8128da2b90cc31eff1e622983` | Candidate branch missing or stale | Go |
| Production old release | Operator records `readlink -f /var/www/tianji-global/current` | Old release unknown | Conditional Go |
| PM2 app | Operator verifies production app name before restart | App name unknown at execution time | Conditional Go |
| Canary flags | All free-canary locks are effective and no secrets are printed | Any paid/live flag unsafe or printed secret | No-Go |
| Free routes | Home, pricing, relationship free, ask preview, draw preview, login pass | Any repeated 5xx, wrong origin, or paid-only content | No-Go / rollback |
| Paid/live routes | Remain locked or not exercised | Any live payment/webhook/email/Supabase mutation/provider expansion | Immediate rollback |
| Vedic paid | Disabled from public exposure | Public paid report reachable | Immediate rollback |
| Paid launch | Stripe/webhook/entitlement/provider/email/Supabase gates pass separately | Those gates are not-run | No-Go |

## 9. Evidence capture checklist

Record after execution, without secrets:

```text
old current release
new release path
source branch and commit
build command used
PM2 app name and status
free route smoke status codes
relationship/ask/draw preview result labels
paid route lock attestation
Vedic paid disabled attestation
rollback target
Go / No-Go decision
```

## 10. Final boundary

This runbook prepares and describes a canary. It does not itself approve production execution, paid launch, Stripe live payment, webhook mutation, email automation, Supabase mutation, provider live scaling, or Vedic paid public exposure.
