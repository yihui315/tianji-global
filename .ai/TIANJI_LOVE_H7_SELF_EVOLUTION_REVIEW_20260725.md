# TianJi Love H7 Self-Evolution Review — 2026-07-25

## 1. 目标

总结 H7 staging 部署 + 浏览器 UAT 全过程中可复用的稳定经验，沉淀为可执行的 Skill，避免下次重复踩坑。

## 2. 经验清单（10 条）

### 经验 1 — 生产实际端口不能靠历史假设

- **触发场景:** 接手 TianJi Love 项目后第一次准备 staging 部署
- **错误表现:** 假设 staging 端口 = 历史看到的 3000，实际是 127.0.0.1:3001；或假设生产端口是 3000，实际 3103
- **根本原因:** 端口由 Nginx `proxy_pass` + PM2 `ecosystem.config.js` 联合决定；不查 = 凭印象
- **安全修复:** 调试前先 `ss -tlnp | grep <port>` + `pm2 list` + `nginx -T | grep proxy_pass`
- **验证方法:** 三方输出端口/进程一致
- **防止复发:** tianji-staging-deployment skill 已写入"执行前检查"4 步
- **适用范围:** 任何 Next.js + PM2 + Nginx staging/production
- **置信度:** 高
- **证据文件:** tianji-deployment-troubleshooting/SKILL.md §1

### 经验 2 — staging 目录嵌套 Git 仓库导致 ESLint 父级配置冲突

- **触发场景:** 在 /var/www/tianji-global-staging/releases/X 下跑 npm run lint
- **错误表现:** ESLint 加载 root 仓库的 `.eslintrc`，与项目期望不一致，lint fail 但本地过
- **根本原因:** release 目录里复制了 `.git/`，触发 ESLint 父级配置回溯
- **安全修复:** 复制 release 时 `--exclude='.git'`，或显式 `rm -rf <staging>/.git`
- **验证方法:** `find /var/www/tianji-global-staging -name .git -type d` 只 1 个（root）
- **防止复发:** tianji-staging-deployment skill §"常见故障"
- **适用范围:** rsync 部署 + 多层 Git 仓库
- **置信度:** 高
- **证据文件:** tianji-staging-deployment/SKILL.md

### 经验 3 — Git 仓库归 deploy 用户时 root 操作触发 dubious ownership

- **触发场景:** root 用户 SSH 后在 deploy-owned 仓库跑 git 命令
- **错误表现:** `fatal: detected dubious ownership in repository at '...'`
- **根本原因:** Git 2.35+ 安全策略禁止 root 操作非 root 仓库
- **安全修复:** `git config --global --add safe.directory <repo-path>`
- **验证方法:** `git status` 不再报错
- **防止复发:** tianji-staging-deployment skill §"常见故障"
- **适用范围:** 多用户服务器 + 任何 Git 操作
- **置信度:** 高
- **证据文件:** tianji-staging-deployment/SKILL.md

### 经验 4 — 云控制台多行粘贴可能只执行第一段

- **触发场景:** SSH 后粘贴 3-5 行 bash 命令
- **错误表现:** 第一段成功，后续段没跑，部署看起来完成但实际缺步骤
- **根本原因:** 终端控制台的 paste 处理对新行/EOF 的处理不一致
- **安全修复:** 把多行命令写到 `/tmp/script.sh`，再 `bash /tmp/script.sh`
- **验证方法:** 脚本末尾加 echo + counter，确认所有 step 都执行
- **防止复发:** tianji-staging-deployment skill 默认推荐脚本化
- **适用范围:** 任何云控制台 / tmux / screen 的多行命令
- **置信度:** 中-高
- **证据文件:** tianji-deployment-troubleshooting/SKILL.md §5

### 经验 5 — 单个测试默认 5 秒超时不适合服务器并行环境

- **触发场景:** staging 服务器并行跑 800+ 测试
- **错误表现:** 部分测试偶发 "Timeout - Async callback was not invoked"
- **根本原因:** jest 默认 5000ms 太紧，服务器并行 CPU/IO 抖动会拖长
- **安全修复:** `jest.config.js` 设 `testTimeout: 30000`，或具体 describe 内 `jest.setTimeout(30000)`
- **验证方法:** 重跑测试 3 次，无 timeout
- **防止复发:** jest 配置基线应纳入 PR template
- **适用范围:** 任何 CI/CD 并行测试
- **置信度:** 高
- **证据文件:** tianji-staging-deployment/SKILL.md §"常见故障"

### 经验 6 — 不能因 CI 曾通过就直接跳过服务器回归

- **触发场景:** GitHub Actions Build & Test 全绿后认为可以 release
- **错误表现:** staging 部署后 /api/version 不健康、PM2 启动失败、Nginx 反代不通
- **根本原因:** CI 环境 ≠ 服务器环境（OS / 依赖 / 网络 / 端口）
- **安全修复:** 每次 staging 部署后必须跑：① /api/version 健康 ② Nginx 50/50 smoke ③ PM2 日志 flush 后复测
- **验证方法:** Stage 6 验收门 12 项全 PASS
- **防止复发:** tianji-staging-deployment skill §"验收门槛"
- **适用范围:** 所有 staging/production 部署
- **置信度:** 高
- **证据文件:** tianji-staging-deployment/SKILL.md

### 经验 7 — Next.js version health 必须设置 commit 和 builtAt

- **触发场景:** 实现 /api/version 但只 set status
- **错误表现:** /api/version 输出 `{status:"ok"}`，看不到真实 commit/时间，无法做 evidence 比对
- **根本原因:** 没有从环境变量读取 commit hash
- **安全修复:** 必须显式读 `process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT`，build 时注入 `BUILD_TIME`
- **验证方法:** curl /api/version 看 commit 字段非 'unknown'
- **防止复发:** tianji-deployment-troubleshooting skill §10
- **适用范围:** 所有 Next.js 项目
- **置信度:** 高
- **证据文件:** tianji-deployment-troubleshooting/SKILL.md §10

### 经验 8 — PM2 日志包含历史记录，必须先 flush 再复测

- **触发场景:** 想判定"当前 PM2 是否健康"
- **错误表现:** 直接 `pm2 logs | grep error` 看到历史错误，误判当前有故障
- **根本原因:** PM2 日志是滚动文件，旧错误还在
- **安全修复:** `pm2 flush <name>` → 触发一次请求 → 再看新日志
- **验证方法:** flush 后 + sleep 2 + 复测 curl
- **防止复发:** tianji-deployment-troubleshooting skill §3
- **适用范围:** 所有 PM2 调试
- **置信度:** 高
- **证据文件:** tianji-deployment-troubleshooting/SKILL.md §3

### 经验 9 — Nginx historical connection refused ≠ 当前持续故障

- **触发场景:** 看 nginx error log 发现 connection refused
- **错误表现:** 误判 staging 持续不可用，实际只是 deploy 重启瞬间上游短暂断开
- **根本原因:** error log 是 append-only，无法区分时间
- **安全修复:** 用 `tail -n 100` + 5xx 时间窗分析，配合 `pm2 list` 看进程存活
- **验证方法:** 当前 50/50 smoke + PM2 status
- **防止复发:** tianji-deployment-troubleshooting skill §4
- **适用范围:** 所有 Nginx + 反向上游
- **置信度:** 高
- **证据文件:** tianji-deployment-troubleshooting/SKILL.md §4

### 经验 10 — staging degraded 不得复制生产数据库密钥

- **触发场景:** 想"完整"测试，用生产 .env.production 当 staging .env
- **错误表现:** staging 写入生产数据库 / 发真实邮件 / 真实 Stripe 调用
- **根本原因:** 误以为 staging 等于"弱化版 production"
- **安全修复:** staging 必须有独立 `.env.staging`，且每个开关显式 false：
  - `STAGING_DEGRADED_MODE=true`
  - `STRIPE_LIVE_DISABLED=true`
  - `EMAIL_SEND_DISABLED=true`
  - `SUPABASE_MUTATION_DISABLED=true`
  - `AI_PROVIDER_LIVE_DISABLED=true`
- **验证方法:** grep .env.staging 看到全部 true
- **防止复发:** tianji-staging-deployment skill §"安全边界"
- **适用范围:** 所有 staging 环境
- **置信度:** 高
- **证据文件:** tianji-staging-deployment/SKILL.md

## 3. Skill 更新清单

| Skill 路径 | 动作 | 行数 | 涵盖经验 |
|------------|------|------|----------|
| .ai/skills/tianji-staging-deployment/SKILL.md | 新建 | ~120 | 1, 2, 3, 5, 6, 10 |
| .ai/skills/tianji-browser-uat/SKILL.md | 新建 | ~110 | 浏览器 UAT 全流程 |
| .ai/skills/tianji-deployment-troubleshooting/SKILL.md | 新建 | ~140 | 4, 7, 8, 9 |

## 4. 验证清单

- [x] 3 个 skill 都包含：适用场景 / 执行前检查 / 安全边界 / 标准命令 / 常见故障 / 回滚方法 / 验收门槛 / 禁止操作
- [x] 无敏感 IP / 密码 / 私钥写入 skill
- [x] 无生产 .env.production 字段被引用
- [x] 经验 1-10 每条都有触发场景 + 根本原因 + 安全修复 + 验证方法 + 适用范围
- [x] 经验描述不夸大，每条都有对应证据文件引用

## 5. 适用范围声明

- 这些 skill 是 TianJi Love H7 部署 + UAT 真实经验沉淀
- 后续 H8 / production release 必须复用这些 skill，不能凭印象操作
- 经验必须经过 ≥2 次独立 staging 部署验证后，才能晋升为 production skill

---

报告时间: 2026-07-25
执行 agent: Hermes (本会话)
下一阶段: Stage 6 最终验收门