#!/bin/bash
# =============================================================================
# audit-adsense.sh — AdSense content scanner
# Scans for: duplicate ad slot IDs, testimonials, cookie banners
# =============================================================================

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$REPO_ROOT/src"
OUTPUT_FILE="$REPO_ROOT/.ai/AUDIT_ADSENSE_$(date +%Y%m%d_%H%M%S).md"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

log() { printf '[%s] %s\n' "$(date '+%H:%M:%S')" "$*"; }
warn() { printf '[%s] WARN: %s\n' "$(date '+%H:%M:%S')" "$*" >&2; }

# ---------------------------------------------------------------------------
# 1. Duplicate ad slot IDs
# Pattern: data-ad-slot, id="slot-*" or any element with adsense slot ID
# ---------------------------------------------------------------------------

log "Scanning for duplicate ad slot IDs..."

DUPE_IDS=$(grep -rn --include='*.tsx' --include='*.ts' --include='*.jsx' --include='*.js' \
  -E 'data-ad-slot|id="(adsense|ad-|slot-)[^"]*"' "$SRC_DIR" 2>/dev/null || true)

declare -A SLOT_COUNT
FOUND_DUPES=false

while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  file=$(echo "$line" | cut -d: -f1)
  content=$(echo "$line" | cut -d: -f2-)

  # Extract slot IDs
  while IFS= read -r slot; do
    [[ -z "$slot" ]] && continue
    slot=$(echo "$slot" | tr -d ' "' | sed 's/.*data-ad-slot=//' | sed 's/.*id=//')
    [[ -z "$slot" ]] && continue
    SLOT_COUNT["$slot"]+="$file "
    if [[ "${SLOT_COUNT[$slot]}" != *"$file "* ]]; then
      FOUND_DUPES=true
    fi
  done < <(echo "$content" | grep -oE 'data-ad-slot="[^"]+"|id="(adsense|ad-|slot-)[^"]*"')
done <<< "$DUPE_IDS"

# ---------------------------------------------------------------------------
# 2. Testimonials (fake review sections)
# ---------------------------------------------------------------------------

log "Scanning for testimonials sections..."

TESTIMONIAL_PATTERNS=(
  "testimonial"
  "customer.review"
  "user.review"
  "review.card"
  "satisfied.customer"
  "五星评价"
  "用户好评"
)

FOUND_TESTIMONIALS=false
TESTIMONIAL_FILES=()

for pattern in "${TESTIMONIAL_PATTERNS[@]}"; do
  matches=$(grep -rln --include='*.tsx' --include='*.ts' --include='*.jsx' --include='*.js' \
    -iE "$pattern" "$SRC_DIR" 2>/dev/null || true)
  if [[ -n "$matches" ]]; then
    FOUND_TESTIMONIALS=true
    while IFS= read -r f; do
      [[ -n "$f" && " ${TESTIMONIAL_FILES[*]} " != *" $f "* ]] && TESTIMONIAL_FILES+=("$f")
    done <<< "$matches"
  fi
done

# ---------------------------------------------------------------------------
# 3. Cookie banners / GDPR notices
# ---------------------------------------------------------------------------

log "Scanning for cookie banners..."

COOKIE_PATTERNS=(
  "cookie.banner"
  "cookie.consent"
  "gdpr"
  "cookie.policy"
  "accept.cookies"
  "cookies.accept"
  "隐私政策"
  "cookie提示"
)

FOUND_COOKIES=false
COOKIE_FILES=()

for pattern in "${COOKIE_PATTERNS[@]}"; do
  matches=$(grep -rln --include='*.tsx' --include='*.ts' --include='*.jsx' --include='*.js' \
    -iE "$pattern" "$SRC_DIR" 2>/dev/null || true)
  if [[ -n "$matches" ]]; then
    FOUND_COOKIES=true
    while IFS= read -r f; do
      [[ -n "$f" && " ${COOKIE_FILES[*]} " != *" $f "* ]] && COOKIE_FILES+=("$f")
    done <<< "$matches"
  fi
done

# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------

log "Writing report to $OUTPUT_FILE"

{
  echo "# AdSense Audit Report"
  echo ""
  echo "**Generated:** $(date '+%Y-%m-%d %H:%M:%S')"
  echo "**Branch:** $(git -C "$REPO_ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'N/A')"
  echo "**Commit:** $(git -C "$REPO_ROOT" rev-parse --short HEAD 2>/dev/null || echo 'N/A')"
  echo ""
  echo "---"
  echo ""

  echo "## 1. Duplicate Ad Slot IDs"
  echo ""
  if [[ "$FOUND_DUPES" == "true" ]]; then
    echo "⚠️  **ISSUES FOUND**"
    echo ""
    for slot in "${!SLOT_COUNT[@]}"; do
      count=$(echo "${SLOT_COUNT[$slot]}" | wc -w)
      if [[ $count -gt 1 ]]; then
        echo "Slot \`$slot\` appears in $count files:"
        echo "${SLOT_COUNT[$slot]}" | tr ' ' '\n' | sed 's/^/  - /'
        echo ""
      fi
    done
  else
    echo "✅ No duplicate ad slot IDs detected"
  fi
  echo ""

  echo "## 2. Testimonials"
  echo ""
  if [[ "$FOUND_TESTIMONIALS" == "true" ]]; then
    echo "⚠️  **TESTIMONIALS FOUND** — violates AdSense policy"
    echo ""
    for f in "${TESTIMONIAL_FILES[@]}"; do
      echo "- $f"
    done
  else
    echo "✅ No testimonial content detected"
  fi
  echo ""

  echo "## 3. Cookie Banners / GDPR"
  echo ""
  if [[ "$FOUND_COOKIES" == "true" ]]; then
    echo "⚠️  **COOKIE BANNERS FOUND**"
    echo ""
    for f in "${COOKIE_FILES[@]}"; do
      echo "- $f"
    done
  else
    echo "✅ No cookie banner content detected"
  fi
  echo ""

  echo "---"
  echo ""
  echo "**Scan complete.**"

} > "$OUTPUT_FILE"

log "Done. Report: $OUTPUT_FILE"

# Exit with error if issues found
if [[ "$FOUND_DUPES" == "true" ]] || [[ "$FOUND_TESTIMONIALS" == "true" ]]; then
  exit 1
fi
