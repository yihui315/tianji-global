# WEBSITE_STATUS_REPORT — TianJi Global / TianJi Love Health Check

日期：2026-05-21  
审查角色：CPO + Senior QA  
审查范围：GitHub `main` 分支静态源码、路由、核心前端组件、API 入口、测试/CI 配置、支付/报告/聊天关键链路  
总体结论：**Amber / Conditional No-Go**。当前网站已经具备可演示的 TianJi Love 免费预览、结果页、付费解锁和部分 AI/占卜模块能力；但尚未完全达到“主页 → AI 咨询（ai-consult）→ 占卜评估（assessment）→ 解决方案（solutions）”这一统一产品链路目标。核心体验目前更像“Love Reading 免费预览漏斗 + 分散的占卜工具页”，AI 咨询、流式输出、历史记录与报告生成仍有明显生产化差距。

---

## 执行说明

### 已读取/检查的关键文件

- `package.json`
- `README.md`
- `next.config.js`
- `tsconfig.typecheck.json`
- `.github/workflows/self-audit.yml`
- `src/app/(main)/layout.tsx`
- `src/app/(main)/page.tsx`
- `src/app/[locale]/page.tsx`
- `src/app/[locale]/pricing/page.tsx`
- `src/components/home/TianjiLoveHome.tsx`
- `src/app/api/love-reading/session/route.ts`
- `src/app/[locale]/love-reading/result/[id]/page.tsx`
- `src/components/love-reading/LoveReportCheckoutButton.tsx`
- `src/components/love-reading/ReportJobPoller.tsx`
- `src/lib/love-reading-store.ts`
- `src/lib/report-jobs.ts`
- `src/app/api/checkout/route.ts`
- `src/app/api/ask/route.ts`
- `src/app/api/ask/stream/route.ts`
- `src/lib/ai-orchestrator.ts`
- `src/app/(main)/bazi/page.tsx`
- `src/components/chat/BaZiChat.tsx`
- `src/app/api/bazi-chat/route.ts`
- `src/lib/bazi-ai.ts`
- `src/__tests__/landing-design-contract.test.ts`
- `src/__tests__/love-reading-session-contract.test.ts`
- `scripts/smoke-production.mjs`

### 未完成项 / 限制

- `.ai/PROJECT_CONTEXT.md`：当前 `main` 分支未找到该文件。因此本次使用 `README.md`、设计契约测试、Love funnel 相关代码和当前路由作为“设计初衷”的替代依据。
- 本地命令执行：当前 MCP/GitHub 工具链可以读取和写入仓库，但本执行环境无法直接在项目目录运行真实 `npm run lint / typecheck / build`。曾尝试通过本地克隆仓库执行检查，但执行环境无法解析 `github.com`，因此未获得本轮真实 npm 输出。
- 替代判断依据：已读取 `package.json` 中的 `release:check`、`lint`、`typecheck`、`test`、`build`、audit scripts，以及 `.github/workflows/self-audit.yml` 的 CI 检查配置，并结合源码进行静态 QA。

---

## 【现状诊断】技术栈与核心功能完成度

### 1. 技术栈现状

当前项目是 **Next.js App Router** 架构，不存在传统 `/src/router` 路由表。路由由 `src/app/**/page.tsx` 和 API route 文件组成。

主要技术栈：

- Frontend：Next.js 15、React、Tailwind CSS、Framer Motion、Chart.js、Three.js。
- AI：OpenAI/Packy、Anthropic、Gemini、Grok、Ollama 等 provider 抽象层。
- 付费：Stripe Checkout。
- 数据：PostgreSQL/Supabase 方向，部分功能带内存 fallback。
- Auth：NextAuth。
- 测试与审计：Vitest、typecheck、lint、route/copy/share/upgrade audit scripts。

需要注意：

- `README.md` 写的是 React 19；`package.json` 里实际是 `react@18.3.1`，但 `@types/react` 是 `^19.2.14`。这属于版本叙述与依赖现实不一致，可能放大类型问题。
- `next.config.js` 中设置了：
  - `typescript.ignoreBuildErrors: true`
  - `eslint.ignoreDuringBuilds: true`

这意味着 `next build` 可以在 TypeScript/ESLint 错误存在时继续成功。虽然 `release:check` 和 CI workflow 会单独跑 `typecheck`/`lint`，但如果有人只执行 `npm run build`，会得到偏乐观结果。

### 2. 当前主产品链路

当前 `main` 分支的主入口不是 `ai-consult / assessment / solutions`，而是 TianJi Love 关系洞察漏斗：

```text
/ 或 /en
  → TianjiLoveHome / localized home
  → /api/love-reading/session
  → /en/love-reading/result/[id]
  → locked premium sections
  → /api/checkout
  → Stripe Checkout
  → result page with checkout status
  → report job poller after entitlement
```

已完成度判断：

- **主页表单：基本完成。** `TianjiLoveHome` 支持 birth date/time/place、solo/compatibility 两种模式，并 POST 到 `/api/love-reading/session`。
- **免费预览：基本完成。** `love-reading/session` 创建 session 并返回 teaser 和 redirect URL。
- **隐私保护：较好。** 契约测试明确检查出生日期、时间、地点不出现在 create payload 和 teaser payload 中。
- **结果页：基本完成。** `src/app/[locale]/love-reading/result/[id]/page.tsx` 可以展示 teaser、locked premium sections、checkout button 和 pricing link。
- **付费入口：已接入。** `LoveReportCheckoutButton` 调用 `/api/checkout`，后端创建 Stripe Checkout session。
- **完整报告：半完成。** 有 report job、entitlement 检查和 `ReportJobPoller`，但任务执行方式还不像生产级后台任务。

### 3. AI/占卜模块完成度

现有模块能力较多，但呈现为分散工具页，而不是统一漏斗：

- `/api/ask`：非流式 AI 问答接口。
- `/api/ask/stream`：SSE 流式接口。
- `/bazi`：较完整的八字工具页，包含表单、图表、AI deep read、动画、分享、PDF、聊天。
- `/api/bazi-chat`：八字多轮聊天 API。
- `BaZiChat`：前端聊天组件。

但需要明确：

- `BaZiChat` 当前不是 token streaming，而是提交后等待完整 JSON 回复，再一次性展示。
- `src/lib/bazi-ai.ts` 的聊天回复主要是规则/模板式生成，不是真正统一 AI provider 调用。
- `/api/ask/stream` 存在，但本轮未发现主前端页面稳定接入这个 endpoint。
- 用户提出的 `ai-consult / assessment / solutions` 路径在当前 `main` 分支搜索不到。

### 4. 测试与 CI 现状

已存在较好的“契约测试”基础：

- `landing-design-contract.test.ts`：检查 TianJi Love 首页定位、CTA、表单、隐私/非确定性表达、资产存在和 reduced motion。
- `love-reading-session-contract.test.ts`：检查 session 创建、redirect、teaser、locked sections、隐私字段不泄露。
- `self-audit.yml`：计划运行 `typecheck`、`lint`、`test`、`build` 和 route/copy/share/upgrade audit。
- `smoke-production.mjs`：覆盖 `/en`、`/zh-CN/pricing`、demo result、checkout invalid payload。

但本轮未获得最新一次真实 CI 通过证据，也未能在当前环境直接执行 npm 命令。

---

## 【流畅度评估】哪些交互可能导致阻塞或高延时

### High Risk

#### 1. 报告生成从 Server Component 渲染路径触发

`src/app/[locale]/love-reading/result/[id]/page.tsx` 中，在 paid 状态下会 `ensureReportJobForSession`，然后对 queued/failed job 执行：

```ts
void runReportJob(reportJob.id);
```

这对生产不稳：

- 在请求渲染路径里启动耗时 AI 任务，不是真后台 worker。
- serverless/进程重启/请求生命周期结束时任务可能中断。
- 多次刷新可能重复触发 queued/failed job。
- 用户看到的只是 poller，不是真正可靠的任务队列状态。

建议评级：**High**。

#### 2. 八字页面首屏和结果页负载过重

`src/app/(main)/bazi/page.tsx` 同步引入：

- `framer-motion`
- `BaziWheelAnimation`
- `BaZiChat`
- `PDFDownloadButton`
- `SharePanel`
- `FortuneWheel`
- 多个 landing primitives
- 视频 hero
- 图表/动画/分享/export 相关组件

这些功能很强，但如果全部进入同一 client bundle，会增加首屏 JS、hydration 成本和移动端卡顿风险。

建议评级：**High**。

#### 3. 多处内存存储 fallback 不适合生产

存在 module-level/global Map：

- `love-reading-store.ts`：`memorySessions`
- `report-jobs.ts`：`memoryJobs`
- `api/bazi-chat/route.ts`：`sessions = new Map<string, ChatSession>()`

风险：

- 进程重启丢失 session/history/job。
- 多实例部署时数据不一致。
- 长期运行可能内存膨胀。
- 无 TTL/清理策略。

建议评级：**High**。

#### 4. `next build` 对 TypeScript/ESLint 错误容忍

`next.config.js` 允许构建忽略 TypeScript 和 ESLint 错误。这不一定会直接影响用户流畅度，但会让影响流畅度的错误更容易进入生产。

建议评级：**High**。

### Medium Risk

#### 1. ReportJobPoller 固定 1.5 秒轮询

当前每 1500ms poll 一次 `/api/report-jobs/[id]`，没有指数退避、最长等待、明确失败恢复、用户可重试按钮或“后台生成后邮件通知”。低流量可接受，高流量和 AI 慢响应场景下容易放大后端压力。

建议评级：**Medium**。

#### 2. Streaming 能力存在，但体验没有统一落地

`/api/ask/stream` 支持 SSE，但：

- 只对 Anthropic/OpenAI 做真正增量解析。
- Grok/Gemini/Ollama 走非流式 fallback，一次性返回完整文本。
- BaZiChat 前端仍是普通 POST + typing dots，不是 token streaming。
- 本轮未发现主链路中稳定接入 `/api/ask/stream` 的前端页面。

建议评级：**Medium**。

#### 3. 聊天历史加载和渲染可持续性不足

`BaZiChat` 当前只保存在组件 state 和 API 内存 Map 中，前端会渲染全部 messages，且每次 messages 更新都 `scrollIntoView({ behavior: 'smooth' })`。短对话没问题，但长对话、移动端或 token streaming 后会有滚动与 DOM 累积风险。

建议评级：**Medium**。

#### 4. 背景视频 + scroll transforms 可能增加移动端压力

`BackgroundVideoHero` 同时有 priority image、video autoplay、Framer Motion `useScroll/useTransform`、多个 overlay。视觉高级，但需要按路由和设备做降级策略。

建议评级：**Medium**。

### Low / Positive

- TianJi Love 首页有 `aria-live="polite"`，表单状态反馈清楚。
- 有 `prefers-reduced-motion`，星空动画可在用户偏好下降级。
- Love funnel 契约测试覆盖隐私字段不泄露，这是正确方向。
- Checkout button 有 loading/error 状态。

---

## 【差距分析】对比最初设计目标，还缺什么，哪些地方体验打折

### 1. 核心链路名称和实际路由不一致

用户指定目标链路是：

```text
主页 → AI 咨询(ai-consult) → 占卜评估(assessment) → 解决方案(solutions)
```

当前 `main` 分支没有发现这些路由。实际主链路是：

```text
主页/Love Reading → Free teaser → Locked premium report → Checkout → Report job
```

这不是小问题，而是产品信息架构级差异。如果设计目标仍然是“AI 咨询 → 评估 → 解决方案”，需要补路由、补导航、补状态流转和补转化路径。

### 2. `/en` 本地化主页与 `/` 主主页体验不一致

`/` 使用 `TianjiLoveHome`，有真实 birth chart form。  
`/en` / `/zh-CN` 是更轻的 localized landing，primary CTA 直接进入 demo result，而不是创建真实 session。

体验影响：

- 英文用户可能进入 demo，而非真实免费评估。
- SEO 本地化页面和实际转化主链路不一致。
- 用户从 pricing 点击 begin free 也进入 demo，不进入真实表单。

### 3. AI 咨询没有统一产品化

已有 `/api/ask` 和 `/api/ask/stream`，但没有看到清晰的 `ai-consult` 前端页面与主漏斗连接。  
BaZiChat 虽然像“AI 咨询”，但实际是单模块内的规则式聊天，不是统一 AI 顾问。

体验影响：

- 用户无法明确感知“先咨询 → 再评估 → 再买解决方案”的引导。
- AI 对话没有跨模块上下文沉淀。
- 流式输出能力没有成为统一体验卖点。

### 4. 占卜评估不是统一 assessment

BaZi、Love Reading、Ask、旧占卜模块各自存在，但没有一个统一的 `assessment` 层来承接：

- 用户问题
- 出生信息/关系信息
- 评估类型
- 风险/需求分层
- 推荐产品/报告类型

当前更像“多个工具集合”，不是“一个用户旅程”。

### 5. solutions 层仍偏静态/锁章节

Love result 页面展示 locked sections 和 checkout，这是付费转化入口；但“解决方案”还没有形成完整产品体验：

- 没有明确的解决方案卡片/路径。
- pricing 是静态卡片，不能直接选择并创建对应 session。
- full report 生成依赖非生产级后台任务模式。
- 缺少购买后失败恢复、邮件通知、报告历史页、订单状态页。

### 6. 历史记录和账户闭环不足

`README.md` 设计中有 User Accounts、Dashboard、history，但当前关键链路里：

- Love Reading session 可 DB 化，但 guest/history 体验未形成强闭环。
- BaZiChat session 是内存 Map。
- result/report 历史与登录态之间的产品呈现不足。

### 7. 质量门槛需要更硬

虽然 CI workflow 配置完整，但 `next.config.js` 忽略 build 阶段 TypeScript/ESLint 错误。如果团队不严格执行 `release:check`，就可能把隐藏问题带入生产。

---

## 【优化清单】按优先级列出后续改进建议

### High Priority

#### H1. 明确并统一核心产品链路

二选一：

1. **继续 TianJi Love 路线**：把用户目标链路改写为：

```text
Homepage → Love Reading Form → Free Teaser → Premium Solution → Checkout → Full Report
```

然后统一 `/`、`/en`、`/zh-CN`、pricing、nav、CTA。

2. **恢复 AI 咨询路线**：新增并打通：

```text
/ai-consult → /assessment → /solutions
```

并让 Love Reading、BaZi、Tarot 等模块成为 assessment/solutions 的子能力。

建议：当前商业目标是引流销售 TianJi Love 服务，优先选择方案 1，减少分散。

#### H2. 把 full report generation 移出页面渲染路径

禁止在 Server Component render 中 `void runReportJob(...)`。改为：

- checkout success/webhook 后创建 job；
- 独立 worker/queue/cron 执行 job；
- result page 只读取 job 状态；
- poller 支持 retry/backoff/timeout；
- 生成失败时允许重新排队。

#### H3. 替换内存 session/job/chat 存储

将以下 Map 存储替换为 DB/Redis：

- love reading session fallback
- report job fallback
- bazi chat sessions

最低要求：

- TTL
- user/session 绑定
- rate limit
- 多实例一致性
- 清理策略

#### H4. 恢复硬性质量门槛

建议：

- 保留 `release:check` 作为唯一上线前命令。
- `next.config.js` 取消或仅临时允许 `ignoreBuildErrors/ignoreDuringBuilds`。
- 对版本不一致做清理：README、React 版本、`@types/react` 版本保持一致。
- CI 必须产出最近一次通过证据后才能部署。

#### H5. 真正产品化 Streaming

把 streaming 变成用户可感知体验：

- 新建统一 AI 咨询组件，接入 `/api/ask/stream`。
- BaZiChat 改为 SSE/token streaming。
- 对非流式 provider 明确降级文案。
- 增加中断生成、重试、复制、保存、继续追问。

### Medium Priority

#### M1. 对重型组件做动态加载

对以下组件按需 lazy/dynamic import：

- `BaziWheelAnimation`
- `FortuneWheel`
- `BaZiChat`
- `PDFDownloadButton`
- `SharePanel`
- Three/Chart.js/PDF 相关依赖

首屏只保留：标题、价值主张、表单、基础 loading 状态。

#### M2. 统一本地化首页和真实转化入口

让 `/en` 与 `/zh-CN` 的 primary CTA 创建真实 session，而不是只进入 demo result。  
pricing 页的 “Begin free” 也应回到真实表单或直接创建对应报告类型。

#### M3. 增加端到端核心漏斗 smoke

新增 Playwright 或最小 API E2E：

```text
GET /en
POST /api/love-reading/session
GET /en/love-reading/result/[id]
POST /api/checkout invalid payload
POST /api/checkout valid test payload behind safe test env
simulate webhook/order entitlement
GET /api/report-jobs/[id]
```

不要只测 demo result。

#### M4. 改造 ReportJobPoller

建议：

- 1.5s → 2s/4s/8s backoff。
- 2–3 分钟超时提示。
- 失败可 retry。
- 页面离开时 cancel。
- 加进度状态：queued/running/finalizing/completed。

#### M5. 聊天历史与性能治理

- 前端 message 数量上限或虚拟列表。
- 历史记录分页加载。
- smooth scroll 只在用户接近底部时触发。
- 对 token streaming 做节流渲染。

### Low Priority

#### L1. 清理文档和代码注释不一致

`/api/ask/stream` 文件注释写 `GET /api/ask/stream`，实际导出是 `POST`。应修正，避免后续 QA 和 Codex 误判。

#### L2. 补 `.ai/PROJECT_CONTEXT.md`

当前缺少用户点名的设计初衷文件。建议新增：

- 产品目标
- 当前主链路
- 非目标链路
- 付费边界
- 隐私边界
- Go/No-Go 标准

#### L3. SEO / Sitemap 策略清晰化

当前 localized public routes 只列 `/`、`/pricing`、`/privacy`、`/terms`。如果 BaZi、Tarot、Love Reading 等要做 SEO，需要明确 sitemap；如果不做，需要文档说明。

#### L4. 无障碍细节增强

- loading button 加 `aria-busy`。
- checkout/report 状态区增强 screen reader 文案。
- 长报告章节增加跳转目录。
- 错误状态增加可操作恢复按钮。

---

## 最终 QA 判定

### 功能完整性

- TianJi Love 免费预览链路：**Go with caveats**。
- 付费 checkout 创建：**Code-level Go，需真实测试环境 smoke**。
- 完整报告生成：**No-Go for production-grade reliability**。
- AI 咨询统一体验：**No-Go / not productized**。
- 用户指定 `ai-consult → assessment → solutions` 链路：**No-Go / route chain not found**。

### 流畅度

- Love homepage：**基本流畅**。
- BaZi 高级工具页：**视觉强，但首屏和结果页重，需性能优化**。
- Streaming：**接口存在，但体验没有统一落地**。
- 历史记录：**Demo-level，不是生产级**。

### 是否达到设计目标

**没有完全达到。**  
当前已经从“功能拼装”进入“可演示漏斗”，但还没有成为一个统一、流畅、可信、可规模化的 AI 占卜商业网站。下一阶段不应继续堆模块，而应先统一产品链路、后台任务、数据持久化、真实 streaming 与上线质量门槛。

建议下一步执行主题：

```text
TianJi Love Core Funnel Production Hardening
目标：统一入口、真实 session、可靠报告生成、真实 streaming、硬性 CI gate、E2E smoke。
```
