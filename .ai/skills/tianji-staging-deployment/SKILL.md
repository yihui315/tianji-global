---
name: tianji-staging-deployment
category: tianji-global
applies_to: TianJi Love staging (tianji-global) — PM2 deploy + health gate
---

# TianJi Staging Deployment — Safe Standalone Skill

## 适用场景

在 `staging.tianji.love` 上部署新版本（含 typecheck/lint/test/build/degraded build/HTTP smoke）。
**不适用于生产**（生产有独立的 `tianji` PM2 进程，端口 3103，目录 `/opt/tianji-global`，绝不可触碰）。

## 执行前检查（4 步）

```bash
# 1. 确认当前 staging release
readlink /var/www/tianji-global-staging/current
# 2. 确认 staging PM2 进程名 = tianji-staging（绝不能是 tianji）
pm2 list | grep -E 'tianji'   # 必须输出 tianji-staging 和 tianji 两行，且 tianji-staging 在 3001
# 3. 确认 /api/version 健康
curl -sS https://staging.tianji.love/api/version | jq -e '.status=="ok" and .commit'
# 4. 确认安全门禁存在
grep -E '^(STAGING_DEGRADED_MODE|STRIPE_LIVE_DISABLED|EMAIL_SEND_DISABLED|SUPABASE_MUTATION_DISABLED|NEXT_PUBLIC_APP_ENV)=' /var/www/tianji-global-staging/current/.env.staging
```

若任何一步 fail，立即停止，禁止部署。

## 安全边界（绝对红线）

| 禁止 | 原因 |
|------|------|
| 修改 `/opt/tianji-global` | 生产 |
| 修改生产 `.env.production` | 生产密钥 |
| 重启生产 PM2 进程 `tianji` | 3103 用户 |
| 修改正式站 Nginx 配置 | production.nginx.conf |
| 设置 `PRODUCTION_DEPLOY_ALLOWED=true` | 这是生产总开关，绝不打开 |
| 真实 Stripe 调用 / webhook | 财务 |
| 真实邮件发送 | 用户数据 |
| 生产 Supabase 写入 | 用户数据 |
| 自动合并 PR / self-approve | PR hard rule |

**必须保留的安全开关**:
```
STAGING_DEGRADED_MODE=true
STRIPE_LIVE_DISABLED=true
EMAIL_SEND_DISABLED=true
SUPABASE_MUTATION_DISABLED=true
AI_PROVIDER_LIVE_DISABLED=true
NEXT_PUBLIC_APP_ENV=staging
```

## 标准命令（release 流程）

```bash
# 1. 新 release 目录（UTC 时间戳）
TS=$(date -u +%Y%m%dT%H%M%SZ)
NEW=/var/www/tianji-global-staging/releases/$TS
mkdir -p "$NEW"

# 2. 复制 source + .env.staging
rsync -a --exclude='.git' --exclude='node_modules' --exclude='.next' \
  /Users/yihui/tianji-global/ "$NEW"/

# 3. 装依赖 + 构建（degraded build）
cd "$NEW" && npm ci && npm run build:staging-degraded

# 4. 切换 current 软链
ln -nfs "$NEW" /var/www/tianji-global-staging/current

# 5. 重载 PM2（不删进程）
pm2 reload tianji-staging --update-env
```

## 常见故障 & 判定方法

| 故障 | 判定 | 修复 |
|------|------|------|
| PM2 进程名变 `tianji` | `pm2 list` 看 name 列 | 立即 `pm2 delete <id>` + 按正确 name 重启 |
| /api/version 显示 production | 检查 `NEXT_PUBLIC_APP_ENV` | 必须 = staging |
| 控制台出现 Stripe 真实调用 | Network 面板 5xx/4xx | 立即停止，检查 `STRIPE_LIVE_DISABLED` |
| 端口 3001 被占 | `lsof -i:3001` | 杀掉非 PM2 进程 |
| deploy user dubious ownership | `git status` 在 server 报错 | 加 `git config --global --add safe.directory <path>` |
| ESLint 父级配置冲突 | staging 目录嵌套 Git repo | 移除 staging 内 `.git`（只保留单层 root） |

## 回滚方法

```bash
# 1. 找上一个稳定 release
PREV=$(ls -1t /var/www/tianji-global-staging/releases/ | sed -n '2p')

# 2. 切换 + 重载
ln -nfs /var/www/tianji-global-staging/releases/$PREV \
  /var/www/tianji-global-staging/current
pm2 reload tianji-staging --update-env

# 3. 验证
curl -sS https://staging.tianji.love/api/version
```

**保留所有旧 release，禁止删除**。

## 验收门槛（部署后必跑）

```bash
# /api/version 健康
curl -sS https://staging.tianji.love/api/version | jq -e '.status=="ok"'

# Nginx 反代干净（无 502）
for i in {1..5}; do curl -sS -o /dev/null -w "%{http_code}\n" https://staging.tianji.love/; done

# PM2 日志无新 ERROR
pm2 logs tianji-staging --lines 200 --nostream --raw | grep -i error | tail -10
# （flush 后复测一次，避免历史日志误判）
pm2 flush tianji-staging
sleep 3
curl -sS https://staging.tianji.love/api/version > /dev/null
pm2 logs tianji-staging --lines 50 --nostream --raw | grep -i error
```

## 禁止操作

- `pm2 delete tianji` （生产）
- `npm audit fix --force` （锁会被破坏）
- 删除 staging release（破坏回滚链）
- `pm2 kill` （连带杀生产）
- 直接改服务器源码热修复（必须新 release）
- 在生产 `.env.production` 加任何东西
- 跳过 typecheck/lint/test/build 直接部署

## 适用范围

- ✅ TianJi Love staging (`staging.tianji.love`)
- ✅ TianJi Global 其它 staging 子域（套用同样模式）
- ❌ 不适用 TianJi Global production（参考独立 production skill）

## 置信度

高 — 基于 H6 (2026-07-25 #179) + H7 (2026-07-25 #181) 部署验证。

## 证据

- .ai/TIANJI_LOVE_H7_BROWSER_UAT_20260725.md
- .ai/TIANJI_LOVE_H7_FINAL_UAT_GATE_20260725.md
- .ai/TIANJI_LOVE_H7_SELF_EVOLUTION_REVIEW_20260725.md