# Love V1 Integration Report

Branch: `codex/integration-love-v1`

## What Changed

- Replaced the build-time Google Fonts dependency with a local CSS font stack so `next build` no longer hangs when `fonts.googleapis.com` is unreachable.
- Kept only the localized result route at `/[locale]/love-reading/result/[id]`.
- Kept homepage submission on the real `/api/love-reading/session` API and private result redirects.
- Added the manual QA checklist, preview environment checklist, and launch monitoring checklist.
- Stabilized Love V1 one-time Stripe Checkout products:
  - `solo_love_report` at `499` cents USD.
  - `compatibility_report` at `1299` cents USD.
- Restricted Love V1 checkout/webhook handling to one-time paid Checkout completion.
- Added paid entitlement checks, result paywall CTA, report job polling, retry-safe report job creation, and privacy-safe report recovery email scaffolding.
- Set private result page metadata to `noindex, nofollow`.

## Files Changed

Primary Love V1 stabilization files:

- `docs/love-v1-integration-qa.md`
- `docs/love-v1-preview-env.md`
- `docs/love-v1-launch-monitoring.md`
- `docs/love-v1-integration-report.md`
- `docs/love-v1-pr-summary.md`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/app/api/checkout/route.ts`
- `src/app/api/stripe/webhook/route.ts`
- `src/app/api/love-reading/session/route.ts`
- `src/app/api/love-reading/session/[sessionId]/route.ts`
- `src/app/api/report-jobs/create/route.ts`
- `src/app/api/report-jobs/[id]/route.ts`
- `src/app/[locale]/love-reading/result/[id]/page.tsx`
- `src/components/love-reading/LoveReportCheckoutButton.tsx`
- `src/components/love-reading/ReportJobPoller.tsx`
- `src/lib/billing.ts`
- `src/lib/love-reading-store.ts`
- `src/lib/love-report-email.ts`
- `src/lib/love-report-generator.ts`
- `src/lib/report-jobs.ts`
- `src/__tests__/love-reading-session-contract.test.ts`
- `src/__tests__/report-generator-contract.test.ts`
- `src/__tests__/stripe-checkout-contract.test.ts`
- `supabase/migrations/20260507_stripe_checkout.sql`
- `supabase/migrations/20260507_report_jobs.sql`

Existing dirty integration files are also present on the branch; review `git status --short` before committing so unrelated branch work is not hidden.

## Validation Commands

| Command | Result |
| --- | --- |
| `npm run lint` | Passed |
| `npm run typecheck` | Passed |
| `npm test -- love-reading-session stripe-checkout report-generator` | Passed, 3 files / 9 tests |
| `npm test` | Passed, 42 files / 446 tests |
| `npm run build` | Passed |
| `npm run release:check` | Passed |

Known validation warnings:

- `next lint` is deprecated in Next.js 15 and should be migrated before Next.js 16.
- Build prints the existing warning: using Edge runtime disables static generation for that page.

## Local Simulation QA

Ran a local dev-server smoke simulation on `http://127.0.0.1:3010`.

| Check | Result |
| --- | --- |
| `/` homepage loads | Passed |
| `/en` homepage loads | Passed |
| `/zh-CN` homepage loads | Passed |
| `POST /api/love-reading/session` creates solo session | Passed |
| Created session result URL loads teaser and paywall | Passed after fix |
| Missing birth date validation returns 400 | Passed |
| `zh-CN` compatibility session redirects localized | Passed |
| Unpaid report job creation returns 403 | Passed |
| Checkout without Stripe env fails with user-safe API error | Passed |
| Localized pricing/privacy/terms pages load | Passed |
| Unknown result id returns 404 | Passed |

Issue found and fixed:

- Without `DATABASE_URL`, the API route could create an in-memory reading session, but the result page could not reliably read it across runtime module instances and returned 404. The local fallback stores for love sessions and report jobs now use `globalThis` so local simulation and no-database smoke tests can run end to end.

Environment notes:

- Local dev logs `MissingSecret` when `NEXTAUTH_SECRET` is not configured. This is expected for the no-env local simulation, but staging must define it.
- Checkout logs a missing `STRIPE_SECRET_KEY` error when Stripe env is absent; the API response stays user-safe and does not expose secrets.

## 中文模拟运行摘要

本轮在本地启动临时 dev server，对 Love V1 核心链路做了模拟运行：

- `/`、`/en`、`/zh-CN` 均可正常加载。
- `POST /api/love-reading/session` 可以创建真实 love-reading session。
- Solo Reading 成功返回 `/en/love-reading/result/[id]`。
- `zh-CN` compatibility session 成功返回 `/zh-CN/love-reading/result/[id]`。
- 创建后的 result 页面可以打开，并显示 free teaser、locked premium sections 和 unlock CTA。
- 缺失 birth date 时返回 400。
- 未付款创建 report job 返回 403，符合“未付费不可生成完整报告”的预期。
- 本地没有 Stripe env 时，checkout API 返回用户安全错误，没有暴露密钥。
- `/en` 和 `/zh-CN` 的 pricing、privacy、terms 页面均可加载。
- 任意不存在的 result id 返回 404。

发现并修复的问题：

- 问题：无 `DATABASE_URL` 的本地模拟环境里，session API 已成功创建 session，但 result page 读取不到同一个 in-memory session，导致刚返回的 result URL 打开后 404。
- 修复：将 love-reading session 和 report job 的无数据库 fallback store 挂到 `globalThis`，避免 Next dev/runtime 模块实例不一致时丢失本地模拟数据。
- 结果：修复后本地 session -> result -> teaser/paywall 链路通过。

仍需 staging 验证：

- Stripe test mode 真实 Checkout。
- Stripe webhook 签名校验、重复事件幂等、无效签名拒绝。
- Supabase staging migrations。
- Resend 报告找回邮件。
- Self-hosted staging 上的移动端和 reduced motion 手工 QA。

## Remaining Risks

- Stripe sandbox payment, webhook delivery, duplicate webhook replay, and invalid-signature handling still need manual verification against a staging URL.
- Resend/report recovery email still needs staging verification with provider env configured.
- Supabase migrations must be applied in staging before paid unlock/report jobs can be verified end to end.
- The legacy Pro subscription pricing route and `/api/stripe/checkout` still exist outside the Love V1 checkout path; confirm product scope before launch.
- Staging QA was not run because no self-hosted staging URL was available.
- Report copy is deterministic scaffold content and still needs product/copy review before public launch.

## Manual QA Checklist

Use `docs/love-v1-integration-qa.md`.

Required P0 checks:

- `/en` homepage loads.
- `/zh-CN` homepage loads.
- Solo Reading form creates a session and redirects to `/[locale]/love-reading/result/[id]`.
- Couple Reading behavior validates cleanly.
- Free teaser shows summary, emotional insight, actionable suggestion, and locked sections.
- Unlock CTA opens Stripe Checkout in test mode.
- Paid webhook unlocks the full report.
- Report job polling reaches completed or a safe failure state.
- Report recovery email contains only a report title and private report link.
- Privacy, terms, and share pages do not expose raw birth data.

## Rollback Plan

1. Revert the Love V1 integration PR or branch commits as one rollback unit.
2. Redeploy the previous known-good production branch.
3. Run `npm run release:check` on the rollback commit.
4. Smoke test `/en`, `/zh-CN`, pricing, privacy, terms, and existing core reading pages.
5. Confirm Stripe webhook endpoints point to the intended environment before resuming traffic.
6. Reconcile any paid orders created during the launch window before retrying.
