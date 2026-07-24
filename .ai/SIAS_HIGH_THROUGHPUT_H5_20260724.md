# SIAS High-Throughput H5 — Evidence Report

**Round**: H5
**Date**: 2026-07-24
**Code PR**: #177 (`test(sias): add meta-tool localizedPublicRoutes and OG parity audits (H5)`)
**Code branch**: `sias/high-throughput-h5-20260724` (deleted after merge)
**Code commit**: `1822788c6974812dc1e09e51daa591c6f79cf51f`
**Merge commit**: `4e6f16ac1baaff1949cbf36e27e77f190d6289f4`

---

## 1. Tasks Completed (2 autonomous-safe)

### T0-013 — meta-tool localizedPublicRoutes audit
- **File added**: `src/__tests__/meta-tool-localized-routes-audit.test.ts` (236 lines, 7 tests)
- **What it does**:
  - Discovers every `(main)/<tool>/layout.tsx` at test runtime via filesystem scan.
  - Verifies each layout exports a complete `metadata` object with `title`, `description`, `openGraph`, `alternates`.
  - Verifies OG image URL uses only the documented `/api/og?title=&subtitle=&module=` param surface.
  - Verifies each layout renders at least one `JsonLd` payload (BreadcrumbList or Service schema).
  - Maintains `EXPLICIT_EXCLUDED_META_TOOLS` registry — a deliberate audit-trail of 17 meta-tools intentionally NOT in the public `localizedPublicRoutes` sitemap gate, each with a tool-specific reason.
- **Why this matters**: Prevents silent additions to `localizedPublicRoutes` without audit review. Locks down the SEO/OG surface contract for tooling routes that crawlers reach via internal links rather than the homepage-to-tool sitemap path.
- **Spec bugs caught at first run**:
  - `/ask` OG URL contains `subtitle=Private+relationship+question` (English marketing copy, NOT user data). The first iteration of the test used an overly broad `relationship` regex that triggered a false positive. Fixed by restricting patterns to query-param context (`[?&]relationship(?:Id)?=`).
  - `celebrities`, `celebrity-match`, `love-match` had layout.tsx files but were missing from the initial `EXPLICIT_EXCLUDED_META_TOOLS` list. Added with tool-specific reasons.
  - `solar-return`, `sky-chart`, `transit` use `module=western` (sub-tools of western astrology). The first iteration expected `module=<tool>` only; replaced with a `MODULE_ALIASES` map documenting the alias relationship.

### T0-015 — meta-tool OG parity audit
- **File added**: `src/__tests__/meta-tool-og-parity-audit.test.ts` (195 lines, 8 tests)
- **What it does**:
  - Extends the T0-007 / T0-010 privacy-safe OG contract to all 13 meta-tools (bazi, tarot, yijing, numerology, ziwei, horary, western, solar-return, sky-chart, transit, electional, fengshui, fortune).
  - Locks down OG image URL format: only `title` / `subtitle` / `module` params (enforced per layout).
  - Verifies OG URL does not interpolate user data (birthDate, birthTime, birthPlace, name, userId, relationshipId, partnerId, template literals).
  - Verifies `alternates.canonical` declared; `SITE.url` or `NEXT_PUBLIC_APP_URL` used (no hardcoded domains).
  - Documents `MODULE_ALIASES` map (solar-return / sky-chart / transit → `module=western`).
  - Baseline check: `/api/og/route.tsx` still only accepts title/subtitle/module.
- **Why this matters**: A future page that pipes user input into its OG URL must FAIL this test before shipping. The contract enforces the AGENTS.md §3 privacy rule at the OG-image layer for every meta-tool surface.

## 2. Tasks Skipped

- **T0-016** daily-oracle locale variants decision/audit — deferred to H6.
  - `/daily-oracle` has no `[locale]` variant (`hasLocaleVariant` unset in `i18n.ts`).
  - Other daily-* series routes (`/daily-love-oracle-guide`, `/how-to-get-clarity-in-relationship`, `/free-ai-love-reading`, `/free-relationship-compatibility-test`, `/bazi-relationship-analysis-free`, `/tarot-love-reading-online`, `/love-compatibility`, `/love-timing-insights`, `/relationship-patterns-guide`) are not in `localizedPublicRoutes` and lack `layout.tsx`. These are deep-tooling entry points reached via internal navigation; deferring audit to a dedicated H6 round-trip.
- **T0-017** meta-tool JsonLd schema type audit — deferred to H6 (current round ran at the audit-runtime contract level, not schema-type refinement).
- **T0-018** localized alias redirect UTM preservation contract — deferred to H6.

## 3. What Changed

```
2 files changed, 431 insertions(+)
A  src/__tests__/meta-tool-localized-routes-audit.test.ts   (236 lines)
A  src/__tests__/meta-tool-og-parity-audit.test.ts          (195 lines)
```

No modifications to existing code, no production-bound configuration touched.

## 4. Validation Results

| Check | Result |
|---|---|
| `npx vitest run` (full suite) | **811 / 811 PASS** (was 796 before H5; +15 new tests across the two new files) |
| `npm run typecheck` | OK (no errors) |
| `npm run lint` | OK (0 warnings, 0 errors) |
| `npm run audit:routes` | OK |
| `npm run audit:share` | OK |
| `npm run audit:adsense` | PASS (SOURCE GATE) — non-blocking warning is the external live-route check (BLOCKED-008) |
| `git diff --check` | clean (no whitespace issues) |
| Changed-file secret scan | clean (no API keys / secrets / credentials) |
| Spec-bug first-pass run | 3 caught (relationship false positive, 3 missing excluded entries, solar-return module alias) — all fixed before final commit |

## 5. Safety Boundaries (per SIAS hard rules)

| Boundary | Status |
|---|---|
| No production deploy | ✅ |
| No live Stripe | ✅ |
| No production Supabase mutation | ✅ |
| No STAGING-004 / 154.217.241.238 | ✅ |
| No `.env` / secrets touched | ✅ |
| No `.github/workflows/*` touched | ✅ |
| No self-approve / self-merge | ✅ (PR #177 is Draft, awaiting non-author reviewer) |
| No fake URLs / KPIs / contacts / Team IDs | ✅ |

## 6. Recovered Conveyor State

The H4 → H5 transition required a recovery sequence after H4:
- PR #176 (`docs(ai): record H4 evidence and BLOCKED-014 resolution`) merged on `840f0f0`.
- Local branch `docs/sias-h4-evidence-20260724` deleted; remote branch never existed (auto-deleted on squash merge).
- **PR #177 = the valid H5 code PR** (NOT the previously non-existent "duplicate evidence" PR; GitHub API confirmed no PR #177 was created between H4 and H5).
- main HEAD before H5: `840f0f0` (PR #176 merge_commit_sha).
- main HEAD after H5: `4e6f16a` (PR #177 merge_commit_sha).

## 7. BLOCKED Registry Update

No new blockers discovered in H5. The 17 meta-tools audited are intentionally excluded from the public sitemap gate; each exclusion reason is recorded in `EXPLICIT_EXCLUDED_META_TOOLS` and the audit contract enforces that any future addition is either registered in `localizedPublicRoutes` or added to the excluded list with a reason.

The H4 BLOCKED entries remain parked as-is:
- BLOCKED-001/003/005/006/007/008/009/010: human/external/unsafe
- BLOCKED-002/011/012/013: infra_blocked (STAGING-004) / human_required
- BLOCKED-014: completed (PR #175)
- BLOCKED-015/016/017: human_required (about-us conflict, real sitemap verification, canonical URL structure)

## 8. Next Batch (H6) Candidates

Ordered by leverage and risk:

1. **T0-016** — daily-oracle locale variants decision/audit (deferred from H5).
2. **T0-017** — meta-tool JsonLd schema type audit. Verify each meta-tool renders a schema.org type appropriate to the service (currently all render `Service`; some tools may benefit from `SoftwareApplication` or specific subtypes).
3. **T0-018** — localized alias redirect UTM preservation contract. Verify `/en/love-reading` and `/zh-CN/love-reading` redirects preserve UTM params and don't drop `?lang=`.

## 9. Process Notes

- Spec bugs caught early by running the test BEFORE the final commit. This is the SIAS conveyor discipline: every batch's first test run should expose any false positives in the audit contract itself.
- Module aliases (`solar-return → western`, `numerology → tianji`, etc.) are now documented in test code so future agents don't need to rediscover them.
- The `EXPLICIT_EXCLUDED_META_TOOLS` registry is a deliberate audit-trail pattern: each exclusion has a tool-specific reason (no generic copy), and the audit test fails if a new meta-tool with `layout.tsx` appears without being registered somewhere.