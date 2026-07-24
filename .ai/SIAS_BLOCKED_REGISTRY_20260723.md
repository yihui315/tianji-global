# SIAS BLOCKED Registry

Tracks items that **cannot be resolved by autonomous execution** in the SIAS conveyor. Each entry has a stable ID, a status, and a resolution path.

## Status vocabulary
- `parked` — discovered and intentionally not yet resolved
- `design_decision_required` — needs a human to make a trade-off
- `infra_blocked` — depends on external infrastructure
- `human_required` — needs human action outside the codebase
- `external_required` — depends on third-party data / verdict
- `unsafe_for_autonomy` — out of scope for autonomous execution
- `completed` — resolved (kept for audit trail)

---

## Active blockers

### BLOCKED-001 — Real `tianji.love` URLs required
- **Status**: human_required
- **Origin**: T0-001 (initial L2 round)
- **Why blocked**: Need canonical public URLs verified live in production crawler view. Cannot fake or guess.
- **Resolution**: human provides validated URLs from production.

### BLOCKED-002 — STAGING-004 / 154.217.241.238 unreachable
- **Status**: infra_blocked
- **Origin**: T0-002 (initial L2 round)
- **Why blocked**: VPS at 154.217.241.238 (STAGING-004) is unreachable; Redis cluster is on that host.
- **Resolution**: restore SSH access to 154.217.241.238, then resume STAGING-004 work.

### BLOCKED-003 — Stripe test-mode smoke approval
- **Status**: approval_required
- **Origin**: T0-003
- **Why blocked**: Live Stripe test-mode checkout requires explicit approval to fire real API calls against Stripe's sandbox.
- **Resolution**: explicit human approval to run live Stripe test smoke.

### BLOCKED-005 — Real KPI data required
- **Status**: external_required
- **Origin**: T0-004
- **Why blocked**: Real visitor KPI cannot be generated autonomously. All `data/love-test-day-*kpi-entry.csv` files are zero-scaffolded.
- **Resolution**: human runs real funnel smoke and uploads actual KPI data.

### BLOCKED-006 — Production deploy gate
- **Status**: unsafe_for_autonomy
- **Origin**: T0-006
- **Why blocked**: SIAS conveyor never touches production deploy pipeline.
- **Resolution**: explicit human approval per deploy, with verified baseline.

### BLOCKED-007 — Live Stripe interaction
- **Status**: unsafe_for_autonomy
- **Origin**: T0-007
- **Why blocked**: SIAS conveyor never fires live Stripe API calls.
- **Resolution**: BLOCKED-003 must be cleared first, then human-controlled run.

### BLOCKED-008 — Live AdSense verdict
- **Status**: external_required
- **Origin**: T0-008
- **Why blocked**: Live AdSense publisher approval / crawler verdict cannot be generated autonomously.
- **Resolution**: human submits site to AdSense and captures verdict.

### BLOCKED-009 — Real visit telemetry
- **Status**: external_required
- **Origin**: T0-009
- **Why blocked**: Real visitor telemetry requires production traffic.
- **Resolution**: real users + GA4 dashboard capture.

### BLOCKED-010 — Social profile verification
- **Status**: human_required
- **Origin**: T0-010
- **Why blocked**: Twitter / Reddit / X social profile ownership cannot be verified autonomously.
- **Resolution**: human claims social handles and updates AboutJsonLd or footer.

### BLOCKED-011 — apple-app-site-association verification
- **Status**: human_required
- **Origin**: discovery (L1)
- **Why blocked**: iOS app entitlement requires Apple Developer ID + signed manifest.
- **Resolution**: human provides signed manifest.

### BLOCKED-012 — humans.txt ownership
- **Status**: human_required
- **Origin**: discovery (L1)
- **Why blocked**: Site ownership attestation requires legal entity confirmation.
- **Resolution**: human provides entity info.

### BLOCKED-013 — security.txt verification
- **Status**: human_required
- **Origin**: discovery (L1)
- **Why blocked**: Security contact requires a verified, monitored email.
- **Resolution**: human provides contact.

### BLOCKED-015 — `/about-us` vs `/about` URL conflict
- **Status**: human_required
- **Origin**: H4 (T0-014 / BLOCKED-014 resolution)
- **Why blocked**: If both `/about` and `/about-us` routes exist or are reachable via redirects, sitemap publication may surface a duplicate. Need verification that `/about-us` is not registered anywhere.
- **Resolution**: human audits (main)/about-us for any layout/page existence.

### BLOCKED-016 — Real sitemap verification for `/about`
- **Status**: external_required
- **Origin**: H4 (T0-014 / BLOCKED-014 resolution)
- **Why blocked**: `build:staging:degraded` does not produce a real sitemap with live `/about` URLs (only static generation). Manual fetch + parse of `/sitemap.xml` in production needed.
- **Resolution**: human fetches production sitemap and confirms `/about` is listed with priority 0.6.

### BLOCKED-017 — `/about` canonical URL structure review
- **Status**: human_required
- **Origin**: H4 (T0-014 / BLOCKED-014 resolution)
- **Why blocked**: Canonical URL should be `https://tianji.love/about` or include `/zh` locale variant? The current `SITE.url + '/about'` is a single canonical, but locale-alias redirects to `/[locale]/about` exist. Need confirmation that the canonical choice is intentional and not causing duplicate-content signal.
- **Resolution**: human reviews locale vs single-canonical trade-off.

---

## Resolved blockers

### BLOCKED-014 — `/about` SEO surface exclusion from public sitemap
- **Status**: completed
- **Origin**: H3 (T0-008 audit contract discovered `/about` had SEO+OG layout but was missing from `localizedPublicRoutes`)
- **Resolution**: Decision A — added `/about` to `localizedPublicRoutes` with `priority: 0.6` and `changeFrequency: 'monthly'`.
- **Resolved in**: PR #175 (`feat(sias): expand public route and attribution contracts`) — merge commit `0c67b9d2e514b3f80b036412f5f725b358409d24`.
- **Verified**: `/about` appears in `localized-public-routes-coverage.test.ts`; audit entry registered.

---

## H5 Update

**No new blockers** added in H5. The 17 meta-tools audited by T0-013 are explicitly registered in the `EXPLICIT_EXCLUDED_META_TOOLS` list (a code-level audit-trail, not a blocker registry entry) with tool-specific reasons for their exclusion from `localizedPublicRoutes`. If a future agent adds a new meta-tool `layout.tsx` without updating that registry OR `localizedPublicRoutes`, the T0-013 audit test will fail and surface the regression.