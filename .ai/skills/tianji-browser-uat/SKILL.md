---
name: tianji-browser-uat
category: tianji-global
applies_to: TianJi Love / TianJi Global staging — 浏览器人工 UAT 替代流程
---

# TianJi Browser UAT — Playwright 双端自动化

## 适用场景

在 staging 上验证：
- 多路由 HTTP 健康（桌面 + 移动端）
- UTM 白名单保留 + 敏感参数剥离
- SEO canonical / meta / hreflang
- 表单可输入、按钮可点击
- 移动端无横向溢出
- 支付 / 邮件 / 登录等敏感门禁被正确阻断

**绝不执行真实支付、真实 webhook、真实邮件发送。**

## 执行前检查（3 步）

```bash
# 1. /api/version 健康 + commit 一致
curl -sS https://staging.tianji.love/api/version

# 2. Playwright 装好
python3 -c "import playwright; print(playwright.__version__)"
# 缺失则: python3 -m pip install playwright && npx playwright install chromium

# 3. 创建工作目录
mkdir -p /tmp/tianji_uat_$(date -u +%Y%m%d)
```

## 安全边界

| 禁止 | 原因 |
|------|------|
| 触发真实 Stripe Checkout | 财务 |
| 在表单提交真实邮箱+密码 | 用户数据 |
| 点击邮件确认链接 | 可能触发真实回调 |
| 截图包含 Stripe iframe / 真实 customer id | 隐私 |
| 上传包含 token= / email= 的 URL 到公开报告 | 敏感参数泄漏 |

## 标准命令（完整 UAT 流程）

### 第一轮：基线健康

```bash
curl -sS https://staging.tianji.love/api/version | jq '{commit, status, degradedReasons}'
```

### 第二轮：9 路由 + UTM + 双重 viewport

```python
# 参考 /tmp/uat_h7.py — 完整 Playwright Python 脚本模板
# 关键参数：
# - DESKTOP: 1280×800, Chrome 147
# - MOBILE: 390×844, is_mobile=True, has_touch=True, Mobile Safari 17 UA
# - wait_until="networkidle" + 额外 3 秒（懒加载保险）
# - 监听 console.error / response.status>=500
```

### 第三轮：深度 DOM 检查

```python
# 参考 /tmp/uat_h7_deep.py
# 检查项：
# - canonical / meta description / og:title / hreflang
# - scrollWidth vs clientWidth（移动端溢出）
# - img.complete && img.naturalWidth > 0（图片健康）
# - input.disabled（表单可输入）
# - 关键词过滤按钮（pay/subscribe/buy/checkout）
```

### UTM 专项测试

```python
# URL 必须包含: utm_source, utm_medium, utm_campaign + 4 个敏感参数
# 保留白名单: utm_source, utm_medium, utm_campaign
# 剥离列表: token, email, name, password, code, key, secret, api_key
# 期望最终路径: /relationship/new 或对应目标
# 判定: parse_qs 后, retained_ok = all white in qs, stripped_ok = all sensitive not in qs
```

## 常见故障 & 判定

| 故障 | 判定 | 修复 |
|------|------|------|
| Playwright 找不到 chromium | `Executable doesn't exist` | `npx playwright install chromium` |
| 首轮 img broken=1 | networkidle 后立刻检测 | 加 `wait_for_timeout(3000)` 复测 |
| 桌面/移动 canonical 不一致 | 桌面有移动没 | 检查 layout 内的 metadata export |
| UTM 敏感参数残留 | stripped_ok=False | 检查 Next.js middleware/redirect |
| /pricing 出现 "Pay" 按钮 | pay_keywords 命中 | 立即停止 — STRIPE_LIVE_DISABLED 未生效 |
| 控制台持续 5xx | response listener 命中 | 检查 Network 面板 + /api/version |
| 移动端 scrollWidth > clientWidth | has_h_scroll=True | 检查 viewport meta + CSS |

## 回滚方法

UAT 失败不需要回滚代码 — 直接标 NO-GO，由 Stage 3 安全整改循环处理：
- 创建修复分支
- 最小范围修复
- 新 release 部署
- 重新跑 UAT

## 验收门槛

| 项 | 通过条件 |
|----|---------|
| HTTP 状态 | 全部 200（多路由 × 多 viewport）|
| console.error | 0 |
| Network 5xx | 0 |
| Network 4xx (非 _next 静态) | 0 |
| UTM 保留 | 3 个白名单全在 |
| UTM 剥离 | 4 个敏感全不在 |
| 移动端溢出 | 0 路由 has_h_scroll=True |
| 图片健康 | 100% img naturalWidth > 0 |
| 表单可输入 | 所有 input disabled=False |
| 支付阻断 | /pricing 0 pay-like 按钮 |
| 真实支付 | 0 次 Stripe API 调用 |

## 禁止操作

- `page.click` 触发真实 Stripe Checkout
- 在输入框填写真实邮箱 / 真实密码
- `page.goto` 任何 `/api/auth/email-callback` 链接（生产回跳）
- 把 token= / email= / password= 写入 PR description / 报告 / commit
- 跳过 `wait_for_timeout` 直接判 broken（误报）
- 把 stdout 含 token 的脚本保存进 git

## 适用范围

- ✅ TianJi Love 全部 H 阶段 UAT
- ✅ TianJi Global 任何 Next.js staging 部署后验证
- ❌ 不适用生产环境（不允许浏览器自动化）

## 置信度

高 — H6 / H7 (2026-07-25) 验证：18 路由 100% PASS，0 误判。

## 证据

- /tmp/uat_h7/results.json (基础 18 路由 + UTM)
- /tmp/uat_h7_deep/report.json (深度 DOM)
- /tmp/uat_h7_deep/*.png (12 张 full-page 截图)
- .ai/TIANJI_LOVE_H7_BROWSER_UAT_20260725.md