---
name: tianji-deployment-troubleshooting
category: tianji-global
applies_to: TianJi Love / TianJi Global staging 部署调试方法论
---

# TianJi Deployment Troubleshooting — 根因调试清单

## 适用场景

staging 部署后出现任何异常时的根因定位。本 skill 只讲 **怎么判定 + 怎么查**，不写死 IP / 路径 / 密钥。

## 调试黄金顺序（先验证后动手）

### 1. 端口/进程基线（绝不假设）

```bash
# 生产端口（绝不能动）
ss -tlnp | grep 3103

# staging 端口（127.0.0.1:3001，仅内网）
ss -tlnp | grep 3001

# PM2 进程名（必须含 tianji-staging，绝不能漏 tianji）
pm2 list

# Nginx 反代上游（看实际 proxy_pass）
sudo nginx -T 2>/dev/null | grep -E "proxy_pass|listen" | grep -v "^#"
```

**判定:** 端口/进程/Nginx 必须三方一致；不一致 = 一定有错配。

### 2. /api/version 是 source of truth

```bash
curl -sS https://staging.tianji.love/api/version
```

字段判读:
| 字段 | 期望 |
|------|------|
| service | tianji-love |
| commit | 当前部署 commit |
| builtAt | 本次部署时间（UTC） |
| runtimeAt | 进程启动时间 |
| environment | 必须 = staging（绝不能 production）|
| status | 必须 = ok |
| degradedReasons | 必须 = [] |

**任何字段不符 = 必须立即停止 + 查根因，不要 reload。**

### 3. PM2 日志必须先 flush 再复测

```bash
pm2 flush tianji-staging
sleep 2
# 重新触发一次请求
curl -sS https://staging.tianji.love/api/version > /dev/null
# 再看新日志
pm2 logs tianji-staging --lines 100 --nostream --raw
```

**黄金规则:** 不 flush 直接 grep 历史日志 = 误判。

### 4. Nginx historical connection refused ≠ 当前故障

```bash
# 看当前真实 upstream 状态（不靠历史日志）
sudo tail -n 100 /var/log/nginx/staging.tianji.love.access.log | grep -E ' 5[0-9]{2} '
sudo tail -n 100 /var/log/nginx/staging.tianji.love.error.log | grep -E 'connect|refused'
```

历史 connection refused 可能来自 deploy 重启瞬间；当前 5xx 率 = 真故障。

### 5. 云控制台多行粘贴陷阱

云控制台粘贴多行 shell 脚本时，**可能只执行第一段**。
- **对策:** 把脚本写到服务器 `/tmp/*.sh`，再 `bash /tmp/*.sh`
- **判定:** 单条多行命令只看到一部分生效 = 多行粘贴问题

### 6. 服务器源码 vs release 目录

```bash
# 当前生效的代码（软链 target）
readlink /var/www/tianji-global-staging/current
# 服务器源码（绝对不要在这里改）
ls /opt/tianji-global/src 2>/dev/null
# ⚠️ /opt 是生产，任何编辑都是 P0
```

**唯一可改路径:** `/var/www/tianji-global-staging/releases/<UTC>/`
**改完必须:** 重新 build → 切换 current 软链 → reload PM2。

### 7. Git 仓库归 deploy 用户时 root 操作

root 用户在 deploy 拥有的 Git 仓库里操作会触发：
```
fatal: detected dubious ownership in repository at '...'
```

修复:
```bash
git config --global --add safe.directory <repo-path>
# 或: git -c safe.directory=<repo-path> status
```

### 8. ESLint 父级配置冲突

staging 目录**嵌套** Git 仓库时，父级 root 的 `.eslintrc` 可能覆盖 staging 的配置。
- 判定: `find /var/www/tianji-global-staging -name ".git" -type d` 应只 1 个
- 修复: `rm -rf <staging>/.git`（保留 root 的 git）

### 9. 测试超时默认值

`jest.setTimeout` 默认 5000ms 在 staging 服务器并行环境可能不够。
- 判定: 测试日志看到 "Timeout - Async callback was not invoked"
- 修复: 在 `jest.config.js` 或测试文件加 `jest.setTimeout(30000)`

### 10. Next.js version health 必须显式 set

```typescript
// app/api/version/route.ts
return NextResponse.json({
  service: 'tianji-love',
  commit: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT || 'unknown',
  builtAt: process.env.BUILD_TIME || new Date().toISOString(),
  runtimeAt: new Date().toISOString(),
  environment: process.env.NEXT_PUBLIC_APP_ENV || 'unknown',
  status: 'ok',
  degradedReasons: [],
})
```

**判定:** `commit` / `builtAt` 不能是 'unknown'，否则 evidence 不可信。

## 常见故障速查表

| 症状 | 第一查 | 第二查 |
|------|--------|--------|
| /api/version 502 | Nginx upstream 状态 | PM2 进程存活 |
| /api/version status != ok | .env.staging 的 STAGING_DEGRADED_MODE | 应用启动日志 |
| 桌面 OK 移动 NG | viewport meta tag | CSS @media 断点 |
| 控制台 TypeError | Network 面板 JS 加载顺序 | source map |
| 表单 submit 后白屏 | API route 5xx | PM2 runtime 日志 |
| UTM 敏感参数残留 | Next.js middleware 规则 | 业务 redirect handler |
| 支付按钮出现在 staging | STRIPE_LIVE_DISABLED | NEXT_PUBLIC_APP_ENV |

## 回滚决策树

```
异常出现
  ├─ 范围 = 单页面 CSS/JS → 改代码 → 新 release
  ├─ 范围 = 整个 staging → 检查 /api/version + PM2 → 回滚上一个 release
  ├─ 范围 = production 痕迹 → 立即停止 + 查 .env.production → 报告 P0
  └─ 不确定 → 停止 + 收集证据 → 报告人工
```

## 禁止操作

- `pm2 delete tianji`（生产）
- `npm audit fix --force`（破坏 lockfile）
- 在 `/opt/tianji-global` 改任何东西
- 把 `cat /var/www/.../env` 输出贴到聊天 / 报告 / commit
- 不 flush 直接判 PM2 日志
- 跳过 /api/version 直接看应用日志

## 适用范围

- ✅ TianJi Love staging
- ✅ TianJi Global 任何 Next.js + PM2 + Nginx staging
- ❌ 不适用 production（独立 skill）

## 置信度

高 — 10 条经验全部来自 H6/H7 真实部署与调试。

## 证据

- .ai/TIANJI_LOVE_H7_BROWSER_UAT_20260725.md
- .ai/TIANJI_LOVE_H7_FINAL_UAT_GATE_20260725.md
- .ai/TIANJI_LOVE_H7_SELF_EVOLUTION_REVIEW_20260725.md