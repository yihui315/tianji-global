# TianJi Love Task Board

## Current task

### Task ID: 20260624-pr113-revenue-os-p0-ci-repair

- Status: done-with-codex-executor; continuation verification passed and local commit amended.
- Owner: Codex Executor
- Branch: `codex/pr113-revenue-os-p0-20260624`
- Worktree: `C:\Users\Administrator\codex-worktrees\tianji-pr113-revenue-os-p0-20260624`
- Source base: `origin/feature/marketing-rebuild-20260623@1570053`
- Goal: Repair PR #113 CI/typecheck blockers and add source-only Revenue OS P0 assets for lead capture, marketing leads storage, manual publishing queue, growth events, daily report scripting, and focused API tests.
- Result: Reproduced the TypeScript mismatch, fixed LeadCaptureForm language/analytics typing, converted `/api/marketing/leads` to App Router `route.ts`, typed localized love-reading copy maps with `Locale`, added `marketing_leads` migration and API tests, added growth-event contract and manual-only publishing queue assets, and added the local daily growth report script.
- Validation: `npm ci --ignore-scripts --no-audit --fund=false`, final `npm run typecheck -- --pretty false`, `npm run lint`, `npm run test -- src/__tests__/api/marketing-leads.test.ts`, `npm run test`, `npm run build:staging:degraded`, and `git diff --check` passed. Continuation verification reran the required chain and passed without source changes.
- Gate status: PR #113 CI/typecheck Go; Lead Capture Source Go; Marketing Leads Migration Go; API Tests Go; Growth Events Contract Go; Publishing Queue Go; Daily Growth Report source Go; Revenue Execution No-Go; Stripe paid smoke No-Go; Production deploy No-Go; Supabase production mutation No-Go.
- Next step: Open/update PR after human review and explicit approval to push. Keep payment, deploy, webhook, production Supabase, and social publishing blocked.
