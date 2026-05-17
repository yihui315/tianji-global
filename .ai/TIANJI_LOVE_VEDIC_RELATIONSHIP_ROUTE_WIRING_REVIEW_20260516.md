# TianJi Love Vedic Relationship Route Wiring Review

## 1. Relationship analyze route

- Path: `src/app/api/relationship/analyze/route.ts`
- Public API: `POST /api/relationship/analyze`
- Current behavior: runs free compatibility analysis through `analyzeRelationship`, applies TianJi gateway safety rewrite metadata, optionally persists a non-premium/premium relationship reading when Supabase is configured, and returns `RelationshipReading`.
- Safety status: gateway safety metadata exists and does not include raw prompt or raw birth fields.
- Integration decision: do not attach Vedic here. This is the free analysis route and should remain unchanged.

## 2. Relationship paid/full report route

- Creation path: `src/app/api/report-jobs/create/route.ts`
- Fetch path: `src/app/api/report-jobs/[id]/route.ts`
- Generator path: `src/lib/report-jobs.ts` -> `src/lib/love-report-generator.ts`
- Current behavior: paid route checks entitlement before creating/fetching report jobs. `runReportJob` calls `generateLoveReport`.
- Current limitation: `LoveReportInput` only includes `sessionId`, `readingMode`, and optional `userId`; it does not carry structured `VedicChartData`.

## 3. Entitlement judgment location

- `report-jobs/create` checks `hasEntitlement` before creating/running a paid report job.
- `report-jobs/[id]` checks `hasEntitlement` before returning a report job.
- Billing entitlement names are `solo_love_report` and `compatibility_report`.
- Safe Vedic full report generation should only run after a paid/pro entitlement signal is explicitly provided to the Vedic extension.

## 4. Result schema

- `LoveReport` currently includes:
  - `summary`
  - `karmicPatterns`
  - `relationshipDynamics`
  - `futureTiming`
  - `emotionalCompatibility`
  - `actionableGuidance`
  - `privateReportLink`
  - `disclaimer`
  - `generationMeta`
- Existing tests assert this top-level shape when Vedic flags are absent.
- Safe extension approach: keep default output unchanged, and only attach Vedic output when flags and paid/pro entitlement permit it.

## 5. Share/privacy audit

- Relationship share API uses `sanitizeRelationshipSharePayload`.
- Sensitive key stripping covers `birthDate`, `birthTime`, `birthPlace`, `birthLocation`, and raw relationship answer variants.
- Vedic public output must not include birth time, birth location, timezone, raw Kundli text, raw provider prompt, or provider body.

## 6. Current safe integration position

Safe integration point:

- Add a small wrapper at `src/lib/astro/vedic/relationship-route-extension.ts`.
- Call it from `generateLoveReport` after the base paid report is generated.
- Keep Vedic disabled by default.
- In preview mode, attach safe metadata/internal preview only, not a public full report.
- In paid mode, attach Vedic sections only when paid/pro entitlement and structured chart data are explicitly present.

## 7. Locations that should not be wired in this task

- Do not modify `src/app/api/relationship/analyze/route.ts`.
- Do not modify Ask/Draw routes.
- Do not modify Stripe webhook or checkout behavior.
- Do not add public Vedic fields to share routes.
- Do not accept raw Kundli text or birth data from public report job API in this task.

## 8. No secrets read confirmation

- No `.env`, `.env.local`, production config, provider keys, Stripe keys, Supabase keys, Resend keys, deployment keys, or server credentials were read or printed.
- No live provider, Stripe test-live, webhook, email, Supabase mutation, paid smoke, or production deploy was run.
