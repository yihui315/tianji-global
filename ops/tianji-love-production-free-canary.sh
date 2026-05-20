#!/usr/bin/env bash
set -eEuo pipefail

CANARY_EXECUTE="${CANARY_EXECUTE:-false}"
SOURCE_BRANCH="${CANARY_SOURCE_BRANCH:-staging-degraded-20260518}"
REPO_URL="${REPO_URL:-https://github.com/yihui315/tianji-global.git}"
BASE_DIR="${BASE_DIR:-/var/www/tianji-global}"
APP_PORT="${APP_PORT:-3000}"
PUBLIC_BASE_URL="${PUBLIC_BASE_URL:-https://tianji.love}"
PM2_APP="${PM2_APP:-}"
PREFLIGHT_PORT="${PREFLIGHT_PORT:-3068}"
PREFLIGHT_PM2_APP="${PREFLIGHT_PM2_APP:-tianji-canary-preflight}"
PREFLIGHT_BASE_URL="http://127.0.0.1:${PREFLIGHT_PORT}"
PREFLIGHT_ALLOWED_CODES="${PREFLIGHT_ALLOWED_CODES:-200,301,302,307,308}"
READINESS_TIMEOUT_SECONDS="${READINESS_TIMEOUT_SECONDS:-60}"
READINESS_INTERVAL_SECONDS="${READINESS_INTERVAL_SECONDS:-2}"
CANARY_ENV_SOURCE="${CANARY_ENV_SOURCE:-${BASE_DIR}/shared/.env.production}"
STAMP="${STAMP:-$(date -u +%Y%m%d-%H%M%S)-free-canary}"
RELEASE_DIR="${BASE_DIR}/releases/${STAMP}"
CURRENT_LINK="${BASE_DIR}/current"
ROLLBACK_FILE="${BASE_DIR}/FREE_CANARY_ROLLBACK_TARGET"

OLD_RELEASE=""
SWITCHED_CURRENT=false
PREFLIGHT_STARTED=false

log() {
  printf '[free-canary] %s\n' "$*"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log "missing required command: $1"
    exit 1
  fi
}

resolve_rollback_target_for_display() {
  if command -v readlink >/dev/null 2>&1 && [[ -e "${CURRENT_LINK}" || -L "${CURRENT_LINK}" ]]; then
    readlink -f "${CURRENT_LINK}" 2>/dev/null || printf '%s' "<unavailable>"
  else
    printf '%s' "<resolved during execution before any mutation>"
  fi
}

print_dry_run() {
  local rollback_target
  rollback_target="$(resolve_rollback_target_for_display)"

  cat <<EOF
[free-canary] DRY RUN ONLY

This script prepares TianJi Love production free canary execution but will not
deploy unless CANARY_EXECUTE=true is set.

CANARY_EXECUTE is not true; no production mutation will be performed.

Effective source branch:
  ${SOURCE_BRANCH}

Candidate release path:
  ${RELEASE_DIR}

Current symlink:
  ${CURRENT_LINK}

Rollback release path:
  ${rollback_target}

Rollback plan:
  If a failure occurs after current is switched, reset ${CURRENT_LINK} back to
  the rollback release path and restart the verified production PM2 app.

Candidate preflight:
  port: ${PREFLIGHT_PORT}
  PM2 app: ${PREFLIGHT_PM2_APP}
  local base URL: ${PREFLIGHT_BASE_URL}
  accepted status codes: ${PREFLIGHT_ALLOWED_CODES}

Production public base URL:
  ${PUBLIC_BASE_URL}

Production port:
  ${APP_PORT}

Required execution env:
  CANARY_EXECUTE=true
  CANARY_SOURCE_BRANCH=<candidate source branch, optional>
  PM2_APP=<verified production PM2 app name>

Safety locks appended to the release .env.local:
  NEXT_PUBLIC_APP_ENV=production
  STAGING_DEGRADED_MODE=true
  AI_PROVIDER_LIVE_DISABLED=true
  STRIPE_LIVE_DISABLED=true
  EMAIL_SEND_DISABLED=true
  SUPABASE_MUTATION_DISABLED=true
  NEXT_PUBLIC_TIANJI_VEDIC_ENABLED=false
  TIANJI_VEDIC_REPORT_MODE=disabled

This script will not copy staging .env.local, will not run paid smoke, and will
not enable Stripe, webhook, email, Supabase mutation, provider-live scaling, or
Vedic paid public exposure.

No current symlink switch, production PM2 restart, production env write, paid
smoke, or live side effect is performed in dry-run mode.
EOF
}

cleanup_preflight() {
  if command -v pm2 >/dev/null 2>&1 && pm2 describe "${PREFLIGHT_PM2_APP}" >/dev/null 2>&1; then
    log "cleaning up preflight PM2 app: ${PREFLIGHT_PM2_APP}"
    pm2 delete "${PREFLIGHT_PM2_APP}" >/dev/null 2>&1 || true
  fi

  PREFLIGHT_STARTED=false
}

rollback() {
  local exit_code=$?

  cleanup_preflight

  if [[ "${SWITCHED_CURRENT}" == "true" && -n "${OLD_RELEASE}" && -d "${OLD_RELEASE}" ]]; then
    log "failure after current switch; rolling back to ${OLD_RELEASE}"
    ln -sfn "${OLD_RELEASE}" "${CURRENT_LINK}"
    cd "${CURRENT_LINK}"
    pm2 restart "${PM2_APP}" --update-env
    pm2 status
  else
    log "failure before current switch; no production symlink rollback needed"
  fi

  exit "${exit_code}"
}

write_canary_env() {
  cd "${RELEASE_DIR}"

  if [[ -f "${CANARY_ENV_SOURCE}" ]]; then
    log "copying production env source without printing values"
    cp "${CANARY_ENV_SOURCE}" .env.local
  else
    log "production env source not found; creating minimal canary .env.local"
    : > .env.local
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
}

export_canary_flags() {
  export NEXT_PUBLIC_APP_ENV=production
  export STAGING_DEGRADED_MODE=true
  export AI_PROVIDER_LIVE_DISABLED=true
  export STRIPE_LIVE_DISABLED=true
  export EMAIL_SEND_DISABLED=true
  export SUPABASE_MUTATION_DISABLED=true
  export NEXT_PUBLIC_TIANJI_VEDIC_ENABLED=false
  export TIANJI_VEDIC_REPORT_MODE=disabled
  export PORT="${APP_PORT}"
  export NEXT_PUBLIC_APP_URL="${PUBLIC_BASE_URL}"
  export NEXTAUTH_URL="${PUBLIC_BASE_URL}"
  export AUTH_URL="${PUBLIC_BASE_URL}"
}

smoke_get() {
  local name="$1"
  local path="$2"
  local allowed_codes="$3"
  local code

  code="$(curl -sS -o /dev/null -w '%{http_code}' "${PUBLIC_BASE_URL}${path}" || true)"
  if [[ -z "${code}" ]]; then
    code="curl-failed"
  fi
  printf '%s=%s\n' "${name}" "${code}"

  case ",${allowed_codes}," in
    *",${code},"*) return 0 ;;
    *) return 1 ;;
  esac
}

smoke_local_get() {
  local name="$1"
  local path="$2"
  local code

  code="$(curl -sS -o /dev/null -w '%{http_code}' "${PREFLIGHT_BASE_URL}${path}" || true)"
  if [[ -z "${code}" ]]; then
    code="curl-failed"
  fi
  printf 'preflight_%s=%s\n' "${name}" "${code}"

  case ",${PREFLIGHT_ALLOWED_CODES}," in
    *",${code},"*) return 0 ;;
    *) return 1 ;;
  esac
}

wait_for_preflight_home() {
  local deadline=$((SECONDS + READINESS_TIMEOUT_SECONDS))
  local code

  log "waiting up to ${READINESS_TIMEOUT_SECONDS}s for candidate preflight home on ${PREFLIGHT_BASE_URL}/"

  while (( SECONDS < deadline )); do
    code="$(curl -sS -o /dev/null -w '%{http_code}' "${PREFLIGHT_BASE_URL}/" || true)"
    if [[ -z "${code}" ]]; then
      code="curl-failed"
    fi
    printf 'preflight_readiness_home=%s\n' "${code}"

    case ",${PREFLIGHT_ALLOWED_CODES}," in
      *",${code},"*) return 0 ;;
    esac

    sleep "${READINESS_INTERVAL_SECONDS}"
  done

  return 1
}

run_candidate_preflight() {
  log "starting candidate release preflight before current switch"
  cleanup_preflight

  cd "${RELEASE_DIR}"
  export_canary_flags

  PORT="${PREFLIGHT_PORT}" pm2 start npm --name "${PREFLIGHT_PM2_APP}" -- run start -- -p "${PREFLIGHT_PORT}"
  PREFLIGHT_STARTED=true
  pm2 status

  wait_for_preflight_home

  log "smoking candidate release on ${PREFLIGHT_BASE_URL}"
  smoke_local_get home "/"
  smoke_local_get pricing "/pricing"
  smoke_local_get ask "/ask"
  smoke_local_get draw "/draw"
  smoke_local_get login "/login"
}

wait_for_production_home() {
  local deadline=$((SECONDS + READINESS_TIMEOUT_SECONDS))
  local code

  log "waiting up to ${READINESS_TIMEOUT_SECONDS}s for production home after PM2 restart"

  while (( SECONDS < deadline )); do
    code="$(curl -sS -o /dev/null -w '%{http_code}' "${PUBLIC_BASE_URL}/" || true)"
    if [[ -z "${code}" ]]; then
      code="curl-failed"
    fi
    printf 'readiness_home=%s\n' "${code}"

    if [[ "${code}" == "200" ]]; then
      return 0
    fi

    sleep "${READINESS_INTERVAL_SECONDS}"
  done

  return 1
}

if [[ "${CANARY_EXECUTE}" != "true" ]]; then
  print_dry_run
  exit 0
fi

trap rollback ERR

require_command git
require_command npm
require_command pm2
require_command curl
require_command readlink

if [[ -z "${PM2_APP}" ]]; then
  log "PM2_APP is required and must be the verified production PM2 app name"
  exit 1
fi

if [[ "${PM2_APP}" == "tianji-staging" ]]; then
  log "refusing to restart staging PM2 app during production canary"
  exit 1
fi

if [[ "${APP_PORT}" != "3000" ]]; then
  log "refusing production canary on non-production port: ${APP_PORT}"
  exit 1
fi

log "confirming production PM2 app before any release switch: ${PM2_APP}"
pm2 describe "${PM2_APP}" >/dev/null

OLD_RELEASE="$(readlink -f "${CURRENT_LINK}")"
test -n "${OLD_RELEASE}"
test -d "${OLD_RELEASE}"

if [[ -e "${RELEASE_DIR}" ]]; then
  log "release path already exists: ${RELEASE_DIR}"
  exit 1
fi

log "old_release=${OLD_RELEASE}"
log "new_release=${RELEASE_DIR}"
log "cloning ${SOURCE_BRANCH}"
mkdir -p "${BASE_DIR}/releases"
git clone --branch "${SOURCE_BRANCH}" --single-branch "${REPO_URL}" "${RELEASE_DIR}"

cd "${RELEASE_DIR}"
git rev-parse HEAD
git status --short
test -f package.json
test -f package-lock.json

write_canary_env
export_canary_flags

log "installing dependencies"
npm ci --legacy-peer-deps

log "building production free canary"
npm run build

run_candidate_preflight

log "switching current symlink after successful build"
ln -sfn "${RELEASE_DIR}" "${CURRENT_LINK}"
SWITCHED_CURRENT=true

cat > "${ROLLBACK_FILE}" <<EOF
old_release=${OLD_RELEASE}
new_release=${RELEASE_DIR}
source_branch=${SOURCE_BRANCH}
pm2_app=${PM2_APP}
public_base_url=${PUBLIC_BASE_URL}
EOF
chmod 600 "${ROLLBACK_FILE}"

cd "${CURRENT_LINK}"
log "restarting production PM2 app: ${PM2_APP}"
pm2 restart "${PM2_APP}" --update-env
pm2 status
pm2 logs "${PM2_APP}" --lines 80 --nostream

wait_for_production_home

log "smoking production free routes"
smoke_get home "/" "200"
smoke_get pricing "/pricing" "200"
smoke_get ask "/ask" "200"
smoke_get draw "/draw" "200"
smoke_get login "/login" "200,302"
smoke_get relationship "/relationship/new" "200"

cleanup_preflight

trap - ERR

log "production free canary completed"
log "old_release=${OLD_RELEASE}"
log "new_release=${RELEASE_DIR}"
