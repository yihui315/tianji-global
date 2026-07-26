# TianJi Love Production Release Plan — 2026-07-26

> **Status:** DESIGN ONLY (no execution)
> **Target commit:** `42eae7c4af4859fd579721591093eb14f530bc13`
> **Production root:** `/opt/tianji-global`
> **Production port:** 3103
> **Production PM2 process:** `tianji`
> **Production URL:** https://tianji.love

---

## 1. 适用与前置

本计划假设：
- 已在 SSH 通道下执行 `TIANJI_LOVE_PRODUCTION_READINESS_REVIEW_20260726.md` §8 检查清单
- 生产 commit 已确认（建议先做 recovery deploy 到 PR #164+）
- main target = `42eae7c4af4859fd579721591093eb14f530bc13`
- 已获得明确 "批准生产发布" 人工授权

## 2. Release 目录结构（设计）

```
/var/www/tianji-global/
├── current → releases/<active>
└── releases/
    ├── <PREVIOUS_TIMESTAMP>/          ← 当前生产（待回滚）
    ├── <NEW_TIMESTAMP>/               ← 本次新版本
    └── ...
```

**关键不变量**：
- `/opt/tianji-global` 不可写、不可原地修改（生产代码源）
- `current` 是软链，切换 = `ln -nfs`
- 旧 release 永不删除（保留回滚链）

## 3. 发布步骤（执行顺序）

### 3.1 Pre-flight（只读验证）

```bash
# 确认 production 当前状态
git -C /opt/tianji-global rev-parse HEAD
git -C /opt/tianji-global status --short          # 必须 clean
sudo pm2 describe tianji | grep -E "status|uptime|restarts"
# 确认 nginx -t 干净
sudo nginx -t
# 确认 release 目录可写
test -w /var/www/tianji-global
ls -d /var/www/tianji-global/releases/*/  | wc -l  # 至少 N 个历史 release
```

### 3.2 创建新 release 目录

```bash
TS=$(date -u +%Y%m%dT%H%M%SZ)
NEW=/var/www/tianji-global/releases/$TS
mkdir -p "$NEW"

# 复制源码（不含 .git / node_modules / .next）
rsync -a --exclude='.git' --exclude='node_modules' --exclude='.next' \
  /Users/yihui/tianji-global/ "$NEW"/
```

注：若生产服务器无法 SSH 到本机，需先在本机构建 production build artifact（`npm ci && npm run build`），再 rsync `out/` 到 release 目录。

### 3.3 安装依赖 + 构建

```bash
cd "$NEW"
# 锁定依赖 — 不允许 npm audit fix --force
npm ci

# production build（不带 staging 降级开关）
npm run build
```

### 3.4 环境变量存在性检查（不读值）

```bash
cd "$NEW"
# 列出 .env.production 实际定义的变量名
grep -E '^[A-Z_]+=' /opt/tianji-global/.env.production | cut -d= -f1 | sort > /tmp/prod-env-names.txt

# 与 readiness review §4.1 对照
# 期望全部 PRESENT 或 NOT_REQUIRED；任何 UNKNOWN → ABORT
```

### 3.5 离线 / 本地 smoke（在新 release 目录，不启动 PM2）

```bash
cd "$NEW"
# 仅语法 + 类型 + 测试套件
npm run typecheck
npm run lint
# 不跑 e2e（涉及真实路由，stage 已在 staging 验证）
```

### 3.6 切换 current 软链（原子）

```bash
ln -nfs "$NEW" /var/www/tianji-global/current
# 验证
readlink /var/www/tianji-global/current
test "$(readlink /var/www/tianji-global/current)" = "$NEW"
```

### 3.7 PM2 reload（不 restart）

```bash
sudo pm2 reload tianji --update-env
# 等 5 秒
sleep 5

# 验证进程
sudo pm2 describe tianji | grep -E "status|uptime"
```

⚠️ **禁止** `pm2 delete tianji` 或 `pm2 kill`（连带 staging 进程）

### 3.8 验证（不消耗付费资源）

```bash
# /api/version 健康
curl -sS https://tianji.love/api/version | jq '{commit, status, degradedReasons}'
# 期望 commit = 42eae7c4..., status = ok

# 关键路由 50/50 smoke
for i in {1..50}; do
  curl -sS -o /dev/null -w "%{http_code}\n" https://tianji.love/
done | sort | uniq -c
# 期望全部 200

# console error: 仅 HTTP 探测，不重新跑 Playwright（避免与生产真实流量并发）
```

### 3.9 发布后日志观察（30 分钟）

```bash
# PM2 实时日志
sudo pm2 logs tianji --lines 200 --nostream --raw | grep -iE "error|fatal" | tail -50

# Nginx 5xx
sudo awk '/ 5[0-9]{2} /' /var/log/nginx/tianji.love.access.log | tail -50

# 监控面板：参考生产部署文档（人工）
```

### 3.10 异常自动回滚触发条件

任一条件触发立即回滚（详见 `TIANJI_LOVE_PRODUCTION_ROLLBACK_PLAN_20260726.md`）：
- `/api/version` 不返回 status=ok
- 首页持续 5xx（连续 3 次）
- PM2 crash loop（restarts > 5 in 60s）
- 新增 Nginx 502
- 任何 P0 console / network 错误

## 4. 已知风险点

| 风险 | 缓解 |
|------|------|
| PR #181 (H7 UTM redirect) 改 redirect 行为 | 已 staging UAT PASS (PR #182)；main UAT 已确认保留 + 剥离符合预期 |
| src/lib/i18n.ts +6 行 | 微调；staging 验证无功能回归 |
| src/lib/analytics/pricing-surface.ts / utm-params.ts / redirect-query.ts 新增 | 新文件不影响现有路径 |
| package.json +scripts | 仅新增 npm scripts，运行时不变 |
| scripts/revenue/* 新增 | 仅在被显式调用时运行；不在 release 路径自动触发 |
| scripts/sias-self-monitor.mjs 新增 | 同上 |

## 5. 不在本次发布范围

- H8 实施（HOLD）
- P3-CANONICAL-001 修复（BACKLOG）
- 修改生产 .env.production / Nginx / PM2 配置
- 启动任何 live payment / email / Supabase 写入
- 修改 GitHub Actions / Vercel 配置

---

生成时间: 2026-07-26
执行 agent: Hermes
状态: DESIGN ONLY — 必须获得"批准生产发布"明确指令才能执行