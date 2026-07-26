# TianJi Love Production Rollback Plan — 2026-07-26

> **Status:** DESIGN ONLY (paired with `TIANJI_LOVE_PRODUCTION_RELEASE_PLAN_20260726.md`)
> **Verdict:** `PRODUCTION_READINESS = NO_GO` — rollback plan not yet executable because previous-release anchor is UNKNOWN
> **Target rollback target:** previous production release (presumed under `/var/www/tianji-global/releases/`, but not SSH-verified)
> **Rollback policy:** atomic symlink swap + PM2 reload; **never** modify `/opt/tianji-global` in place.

> **2026-07-26 SSH preflight note:** The rollback anchor (previous production release path) was supposed to be filled in §1 before any release runs. It is currently `UNKNOWN` because the SSH preflight could not run. Any deploy attempt before §1 is populated must be aborted.
>
> **2026-07-26 §10 follow-up (TASK_ID=TIANJI-PRODUCTION-SSH-ALIAS-RECOVERY-003):** Attempted to recover the `tianji-love-staging` SSH alias. **Confirmed absent** on current machine: no `~/.ssh/config`, no `known_hosts` entry for tianji, no shell history of prior tianji ssh. Prior compact record claiming the alias resolved to `ser8221021417/tianji-prod` is not reproducible. Rollback anchor therefore remains `UNKNOWN`; abort any deploy attempt. See `TIANJI_LOVE_PRODUCTION_READINESS_REVIEW_20260726.md` §10 for full audit.

---

## 1. Rollback 前置信息（在发布前必须记录）

| 字段 | 值（发布前人工填入） |
|------|---------------------|
| Previous production commit | `<to be filled before publish>` |
| Previous production release path | `/var/www/tianji-global/releases/<PREV_TIMESTAMP>/` |
| Previous PM2 process | `tianji` |
| Previous PM2 restart count | `<to be recorded>` |
| Previous current symlink | `/var/www/tianji-global/current → <PREV>` |
| Previous /api/version commit | `<to be recorded>` |

发布完成后这些值不再变化，回滚目标是恢复到此快照。

## 2. Rollback 触发条件

任一条件触发立即回滚：

### 2.1 P0 — 立即回滚（不等观察期）
1. 首页持续 5xx（连续 3 次 / 60 秒内）
2. `/api/version` 不返回 `status: "ok"` 或 commit 不匹配
3. 任何 P0 console / network 错误（敏感参数泄漏 / 认证绕过 / 真实支付未授权触发）
4. PM2 crash loop（restarts > 5 in 60 秒）
5. 数据库连接异常（500 系列）
6. 新增 Nginx 502（与发布前基线对比）

### 2.2 P1 — 5 分钟观察后回滚
1. 关键路由失败（`/love-test` / `/pricing` / `/relationship/new` / `/login` 任一 5xx）
2. 支付入口异常（`/pricing` "Sign in to continue" 消失 / 出现真实 Stripe 按钮）
3. 登录链路异常（`/login` 邮箱按钮 "Email sign-in unavailable" 消失 / 出现真实邮件发送）
4. 静态资源大面积失败（任何 4xx 比例 > 1%）
5. H7 UTM 行为回归（保留参数丢失 / 敏感参数重新出现）

### 2.3 P2 — 30 分钟观察 + 人工决策
1. 性能回归（响应时间比基线 > 2x）
2. 控制台新增持续 warning（非阻断）

## 3. Rollback 命令（按 P0/P1 立即执行）

### 3.1 切回上一个 release

```bash
# 1. 确认上一个 release 存在
PREV=$(ls -1t /var/www/tianji-global/releases/ | sed -n '2p')
test -d "/var/www/tianji-global/releases/$PREV" || { echo "ABORT: previous release missing"; exit 1; }

# 2. 切换 current 软链（原子）
ln -nfs "/var/www/tianji-global/releases/$PREV" /var/www/tianji-global/current

# 3. 验证软链
readlink /var/www/tianji-global/current
test "$(readlink /var/www/tianji-global/current)" = "/var/www/tianji-global/releases/$PREV"

# 4. PM2 reload（不 restart）
sudo pm2 reload tianji --update-env
sleep 5
```

### 3.2 回滚后验证

```bash
# /api/version 必须恢复到 previous commit
curl -sS https://tianji.love/api/version | jq '{commit, status}'
# 期望: commit = previous production commit, status = ok

# 关键路由
for path in / /en /love-test /pricing /relationship/new /login /api/version; do
  code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 10 "https://tianji.love$path")
  echo "$path → $code"
done
# 期望全部 200（/api/version 期望 commit = previous）

# 50/50 HTTPS smoke
PASS=0; FAIL=0
for i in {1..50}; do
  code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 10 https://tianji.love/)
  if [ "$code" = "200" ]; then PASS=$((PASS+1)); else FAIL=$((FAIL+1)); fi
done
echo "PASS=$PASS FAIL=$FAIL"
# 期望 PASS=50 FAIL=0
```

### 3.3 如果软链切换后仍异常（更深层回滚）

如果软链已切回但 `/api/version` 仍异常，怀疑是构建 artifact 损坏或 .env 引用错位：

```bash
# 1. 检查 PM2 当前 cwd
sudo pm2 describe tianji | grep -E "exec cwd|script args"

# 2. 检查 .env.production 是否被意外改
ls -la /opt/tianji-global/.env.production
# 如果 mtime 在发布后不久且内容变化 → 回滚 .env.production
# 注意: /opt/tianji-global 是 SOURCE；.env.production 改动需对照 git history
# 严格禁止 agent 直接修改 .env.production；必须人工

# 3. 如果 .env 损坏，从上一份备份恢复（运维常规）
```

## 4. 回滚后证据记录

回滚成功后必须记录：

```bash
# PM2 当前状态
sudo pm2 describe tianji > /tmp/rollback-pm2-$(date -u +%Y%m%dT%H%M%SZ).log

# /api/version 响应
curl -sS https://tianji.love/api/version > /tmp/rollback-version-$(date -u +%Y%m%dT%H%M%SZ).json

# 50/50 smoke
for i in {1..50}; do
  curl -sS -o /dev/null -w "%{http_code}\n" https://tianji.love/
done > /tmp/rollback-smoke-$(date -u +%Y%m%dT%H%M%SZ).log

# Nginx 5xx 数量
sudo awk '/ 5[0-9]{2} /' /var/log/nginx/tianji.love.access.log | wc -l > /tmp/rollback-5xx-$(date -u +%Y%m%dT%H%M%SZ).txt
```

把日志追加到 `TIANJI_LOVE_PRODUCTION_READINESS_REVIEW_20260726.md` 的 `## 9. SSH 后人工核验结果` 段落（或新建 `TIANJI_LOVE_PRODUCTION_ROLLBACK_EVIDENCE_<DATE>.md`）。

## 5. 后续动作

回滚成功后：

1. 立即停止所有进一步发布动作
2. 通知人工（PR 评论 / Telegram / 邮件 — 按团队流程）
3. 诊断新 release 失败根因（从 release 目录 + PM2 log + Nginx log 重建）
4. 修复后**再次**做完整 readiness review，不能直接重试发布

## 6. 不在 rollback 范围

- 删除任何 release 目录（破坏回滚链）
- 修改 `/opt/tianji-global` 内任何文件
- 修改生产 .env.production
- 重启 staging 进程（tianji-staging，独立 PM2 进程）
- 触发 H8
- 修改 P3 canonical（保持 BACKLOG）

---

生成时间: 2026-07-26
执行 agent: Hermes
状态: DESIGN ONLY — 必须获得"批准生产发布"明确指令才能生效