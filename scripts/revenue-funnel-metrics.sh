#!/usr/bin/env bash
# revenue-funnel-metrics.sh
# Pulls real funnel metrics from production DB and updates data/love-test-funnel-metrics.csv
# This bridges the analytics_events table → CSV that funnel-optimizer reads.
#
# Usage: ./scripts/revenue-funnel-metrics.sh
# Cron: runs weekly (Monday 02:30) — before funnel-optimizer at 02:00 on even weeks

set -euo pipefail

DB_NAME="${DB_NAME:-tianji_global}"
METRICS_FILE="data/love-test-funnel-metrics.csv"
TODAY=$(date +%Y-%m-%d)

# ── Helpers ────────────────────────────────────────────────────────────────────

run_query() {
  sudo -u postgres psql -d "$DB_NAME" -t -A -c "$1" 2>/dev/null
}

calc_rate() {
  local num=$1 denom=$2
  if [ -z "$denom" ] || [ "$denom" -eq 0 ] || [ -z "$num" ]; then
    echo "0"
  else
    echo "scale=4; $num / $denom" | bc -l | awk '{printf "%.4f", $0}' | sed 's/^\./0./'
  fi
}

# ── Funnel counts (last 7 days) ───────────────────────────────────────────────

home_view=$(run_query "SELECT count(*) FROM analytics_events WHERE event='love_home_view' AND created_at > now() - interval '7 days';")
test_start=$(run_query "SELECT count(*) FROM analytics_events WHERE event='love_session_created' AND created_at > now() - interval '7 days';")
result_view=$(run_query "SELECT count(*) FROM analytics_events WHERE event='love_result_view' AND created_at > now() - interval '7 days';")
unlock_click=$(run_query "SELECT count(*) FROM analytics_events WHERE event='love_unlock_click' AND created_at > now() - interval '7 days';")
checkout_created=$(run_query "SELECT count(*) FROM analytics_events WHERE event='love_checkout_created' AND created_at > now() - interval '7 days';")
checkout_success=$(run_query "SELECT count(*) FROM analytics_events WHERE event='love_checkout_success' AND created_at > now() - interval '7 days';")
refund_count=$(run_query "SELECT count(*) FROM analytics_events WHERE event='love_refund_requested' AND created_at > now() - interval '7 days';")

# Default to 0 if empty
home_view=${home_view:-0}
test_start=${test_start:-0}
result_view=${result_view:-0}
unlock_click=${unlock_click:-0}
checkout_created=${checkout_created:-0}
checkout_success=${checkout_success:-0}
refund_count=${refund_count:-0}

# ── Revenue ───────────────────────────────────────────────────────────────────

revenue_rows=$(run_query "SELECT coalesce(sum(amount_total),0), coalesce(count(*),0) FROM orders WHERE status='paid' AND updated_at > now() - interval '7 days';")
revenue_cny=$(echo "$revenue_rows" | cut -d'|' -f1)
paid_orders=$(echo "$revenue_rows" | cut -d'|' -f2)
revenue_cny=${revenue_cny:-0}
paid_orders=${paid_orders:-0}

# ── Derive rates ──────────────────────────────────────────────────────────────

home_to_test=$(calc_rate "$test_start" "$home_view")
test_to_result=$(calc_rate "$result_view" "$test_start")
result_to_unlock=$(calc_rate "$unlock_click" "$result_view")
unlock_to_checkout=$(calc_rate "$checkout_created" "$unlock_click")
checkout_to_paid=$(calc_rate "$checkout_success" "$checkout_created")

# ── Build row ─────────────────────────────────────────────────────────────────

NOTES="real_db_pipeline"

# ── Ensure header ─────────────────────────────────────────────────────────────

if [ ! -f "$METRICS_FILE" ]; then
  cat > "$METRICS_FILE" << 'HEADER'
date,homepage_to_love_test_ctr,love_test_start_rate,result_view_rate,share_card_click_rate,ask_next_click_rate,paid_intent_view_rate,preview_submit_rate,unlock_click_rate,checkout_ready_rate,paid_conversion_rate,revenue_cny,notes
HEADER
fi

# ── Append/replace today's row (idempotent) ──────────────────────────────────

# Remove any existing row for today, then append new row
grep -v "^${TODAY}," "$METRICS_FILE" > "${METRICS_FILE}.tmp" 2>/dev/null || cp "$METRICS_FILE" "${METRICS_FILE}.tmp"
{
  cat "${METRICS_FILE}.tmp"
  echo "${TODAY},${home_to_test},${test_to_result},${result_to_unlock},0,0,0,0,${unlock_to_checkout},${checkout_to_paid},${checkout_to_paid},${revenue_cny},${NOTES}"
} > "${METRICS_FILE}" && rm "${METRICS_FILE}.tmp"

# ── Output ────────────────────────────────────────────────────────────────────

echo "=== Revenue Funnel Metrics — ${TODAY} ==="
echo "Home views:        ${home_view}"
echo "Test starts:       ${test_start}  → CTR ${home_to_test}"
echo "Result views:     ${result_view}  → ${test_to_result}"
echo "Unlock clicks:    ${unlock_click}  → ${result_to_unlock}"
echo "Checkout created: ${checkout_created}  → ${unlock_to_checkout}"
echo "Checkout paid:    ${checkout_success}  → ${checkout_to_paid}"
echo "Refunds:          ${refund_count}"
echo "Revenue (CNY):   ${revenue_cny}  from ${paid_orders} orders"
echo ""
echo "Updated ${METRICS_FILE}"
