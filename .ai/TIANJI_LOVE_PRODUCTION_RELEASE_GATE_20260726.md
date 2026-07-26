# TianJi Love Production Release Gate — 2026-07-26

> **Status:** DESIGN ONLY
> **Target commit:** `42eae7c4af4859fd579721591093eb14f530bc13`
> **Production deploy:** FORBIDDEN (must receive explicit "批准生产发布" to execute)

---

## Gate A — 发布前（必须全 PASS 才能进入发布流程）

| # | 检查项 | 期望 | 当前 | 状态 |
|---|--------|------|------|------|
| A1 | main working tree clean | yes | yes | **PASS** |
| A2 | target commit 精确 | `42eae7c4...` | `42eae7c4af4859fd579721591093eb14f530bc13` | **PASS** |
| A3 | CI 成功（最近 main push） | success | 30xxxxx 编号 SUCCESS（待最终确认） | **CONDITIONAL** |
| A4 | H7 Final Gate | GO | GO (PR #182 MERGED) | **PASS** |
| A5 | Production baseline 已记录 | yes | partial（macOS 端无 SSH，仅 HTTP 基线） | **CONDITIONAL** |
| A6 | Production env 变量名就绪 | yes | schema 已扫描，实际 .env 未读 | **CONDITIONAL** |
| A7 | Build 可复现 | yes | `npm ci && npm run build` 已定义 | **PASS** |
| A8 | Rollback 可执行 | yes | `TIANJI_LOVE_PRODUCTION_ROLLBACK_PLAN_20260726.md` 已就绪 | **PASS** |
| A9 | 无数据库不可逆迁移 | yes | diff 0 DB migration | **PASS** |
| A10 | 无未授权 live smoke | yes | 本轮无任何真实支付 / 邮件 / webhook 触发 | **PASS** |

**Gate A 决议**: **CONDITIONAL_PASS** — A3/A5/A6 三项需 SSH 后人工核验。

## Gate B — 发布后技术验证（独立发布授权后执行）

| # | 检查项 | 期望 |
|---|--------|------|
| B1 | `/api/version` 返回 target commit | `commit = 42eae7c4af4859fd579721591093eb14f530bc13, status = ok` |
| B2 | 关键路由全 200 | `/`, `/en`, `/love-test`, `/pricing`, `/relationship/new`, `/login` |
| B3 | 连续 50 次 HTTPS smoke 无 5xx | PASS=50 FAIL=0 |
| B4 | 连续 10 次 `/api/version` 通过 | status=ok, commit 一致 |
| B5 | PM2 无 crash loop | restarts 不增长 |
| B6 | Nginx 无新 502 | 与发布前基线对比 |
| B7 | Console 无 P0/P1 错误 | Playwright re-check |
| B8 | 移动端无关键布局破坏 | Playwright mobile viewport |

Gate B 任何一项 fail → 触发 `TIANJI_LOVE_PRODUCTION_ROLLBACK_PLAN_20260726.md`

## Gate C — 受控业务验证（另行批准后执行）

| # | 检查项 | 期望 |
|---|--------|------|
| C1 | 免费爱情测试完整流程 | 表单提交 → 结果显示，无 500 |
| C2 | Checkout 页面可打开 | `/pricing` → 选择 plan → Stripe checkout（**仅 test-mode** 或人工指定的安全验证） |
| C3 | Stripe test-mode 安全验证 | 使用 `STRIPE_LIVE_DISABLED=true` 环境确保不进入生产支付 |
| C4 | Analytics attribution 正常 | H7 UTM redirect 行为与 staging 一致 |
| C5 | UTM 保留 + 敏感参数剥离 | 与 H7 UAT PASS 标准一致 |
| C6 | 登录链路（test-mode） | Supabase test-mode 下 email link 不发真实邮件 |

⚠️ **Gate C 严禁 agent 自动运行真实付费**。必须人工逐一批准每条 C 项。

---

## Final Verdict

```
PRODUCTION_READINESS = CONDITIONAL_GO
```

**前置条件**:
1. 人工 SSH 完成 `TIANJI_LOVE_PRODUCTION_READINESS_REVIEW_20260726.md` §8 检查清单
2. （建议）先做 recovery deploy 升到 PR #164+ 恢复 version health
3. 重新评估本 Gate 后才能最终 GO

**发布硬条件**:
- 任何 Gate A 条件 fail → 立即 ABORT，不发布
- 任何 Gate B fail → 立即触发 rollback plan
- 任何 Gate C 异常 → 暂停，提交人工决策

```
PRODUCTION_DEPLOY = HOLD
H8                = HOLD
P3_CANONICAL      = BACKLOG
```

---

生成时间: 2026-07-26
执行 agent: Hermes
状态: DESIGN ONLY