# TianJi Global 用户系统升级策划

**版本**: v1
**日期**: 2025-04-18
**状态**: 规划中

---

## 一、现状盘点

### 已有

| 模块 | 文件 | 状态 |
|------|------|------|
| Auth | `src/app/api/auth/[...nextauth]/route.ts` | ✅ Google OAuth 工作正常 |
| 登录页 | `src/app/login/page.tsx` | ✅ UI 完成，Magic Link 按钮 disabled（Resend 未配置） |
| Profile API | `src/app/api/profile/route.ts` | ✅ GET/PATCH，Supabase fallback |
| Profile 页面 | `src/app/(main)/profile/page.tsx` | ✅ 时区/语言设置，localStorage 兜底 |
| Supabase Schema | `supabase/migrations/002_users_table.sql` | ✅ users 表结构（含 subscription 字段） |
| 用户表字段 | email, name, avatar_url, stripe_customer_id, subscription_status, subscription_tier | ✅ |

### 缺失

1. **出生数据存储** — 用户没有地方保存自己的八字/紫微出生信息
2. **Supabase RLS** — users 表没有 RLS 策略，服务端 key 可写但客户端无法访问
3. **Stripe 订阅** — subscription 字段存在但 Stripe 未集成
4. **用户 Dashboard** — 没有统一的个人报告入口
5. **出生数据 CRUD API** — `/api/birth-profiles`（创建/读取/更新/删除用户出生配置）
6. **Resend Magic Link** — 邮件发送未配置（需要域名验证）
7. **LLM API Key 管理** — 用户没有地方输入自己的 OpenAI key

---

## 二、用户系统核心数据模型

### 2.1 出生配置表 (birth_profiles)

```sql
CREATE TABLE birth_profiles (
  id              UUID                  PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID                  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT                  NOT NULL,           -- "我的主账号"、"老公"
  system          TEXT                  NOT NULL DEFAULT 'bazi',  -- 'bazi' | 'ziwei' | 'western'
  birth_date      DATE                  NOT NULL,
  birth_time      INTEGER               NOT NULL,           -- 时辰 index 0-12 (0=早子, 1=丑...)
  gender          TEXT,                                   -- 'male' | 'female'
  timezone        TEXT,
  birth_location  JSONB,                                  -- { lat, lng, city }
  is_default      BOOLEAN               DEFAULT FALSE,
  created_at      TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ           NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_birth_profiles_user_id ON birth_profiles(user_id);
```

**为什么单独建表**：用户可能有多套出生配置（自己的、不同家庭成员的）。合盘报告需要两个人各自的配置。

### 2.2 用户表补充字段

在现有 `users` 表基础上，确认以下字段存在：

```sql
-- 在 users 表中
timezone        TEXT,              -- 用户首选时区
language        TEXT  DEFAULT 'zh', -- 'zh' | 'en'
taste_profile   JSONB,             -- 用户 Taste Profile（由 Taste Rule 引擎生成）
openai_api_key  TEXT,              -- 用户自己的 API key（加密存储，仅服务端可见）
```

---

## 三、升级阶段规划

### P2-1: 出生数据 API + 基础存储 (1 周)

**目标**：用户可以保存/管理自己的出生配置，用于后续报告生成。

#### API: `/api/birth-profiles`

```typescript
// POST — 创建出生配置
// GET  — 列出当前用户所有配置
// GET /:id — 获取单个配置
// PATCH /:id — 更新配置
// DELETE /:id — 删除配置

interface BirthProfile {
  id: string;
  userId: string;
  name: string;
  system: 'bazi' | 'ziwei' | 'western';
  birthDate: string;      // YYYY-MM-DD
  birthTime: number;       // 0-12
  gender: 'male' | 'female';
  timezone: string;
  birthLocation?: { lat: number; lng: number; city?: string };
  isDefault: boolean;
}
```

#### 前端: 出生数据管理页面

- `src/app/(main)/birth-profiles/page.tsx` — 列表页
- `src/app/(main)/birth-profiles/new/page.tsx` — 创建页
- `src/app/(main)/birth-profiles/[id]/page.tsx` — 详情/编辑页
- `src/components/birth-profile/BirthProfileForm.tsx` — 复用表单组件

**表单字段**: 姓名（称呼）/ 系统选择 / 出生日期 / 出生时辰下拉 / 性别 / 时区 / 出生地（可选，经纬度）

#### 验证

```bash
# 测试
curl -X POST https://tianji-global.vercel.app/api/birth-profiles \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"我的八字","system":"bazi","birthDate":"1990-01-15","birthTime":5,"gender":"male"}'
```

---

### P2-2: Supabase RLS + 用户数据隔离 (1 周)

**目标**：用户只能访问自己的数据，防止越权。

#### RLS 策略

```sql
-- 启用 RLS
ALTER TABLE birth_profiles ENABLE ROW LEVEL SECURITY;

-- birth_profiles: 用户只能操作自己的记录
CREATE POLICY "Users manage own birth profiles"
  ON birth_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- users 表: 用户只能查看/更新自己的记录
CREATE POLICY "Users view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 禁止客户端直接访问 accounts/sessions 表
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No client access" ON accounts FOR ALL USING (false);
CREATE POLICY "No client access" ON sessions FOR ALL USING (false);
```

#### 服务端 Supabase Admin 用法（API Routes）

API Routes 始终使用 Service Role Key（不经过 RLS），由 Next.js API 层做业务权限控制。

```typescript
// ✅ 正确：API Route 中使用 admin client（RLS 已禁用 admin）
const supabase = getSupabaseAdmin();

// ❌ 错误：浏览器端使用 admin key
// Service Role Key 永远不暴露给客户端
```

#### 前端数据获取

```typescript
// 浏览器端使用 anon key + RLS
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const { data } = await supabase
  .from('birth_profiles')
  .select('*')
  .eq('user_id', session.user.id);
```

---

### P2-3: 用户 Dashboard 首页 (1 周)

**目标**：用户登录后看到个性化的报告入口。

#### 路由: `src/app/(main)/dashboard/page.tsx`

```
┌─────────────────────────────────────────────┐
│  🔮 天机全球                    [头像] ▼    │
├─────────────────────────────────────────────┤
│  早安，张三                                  │
│  你的 2025 年度运势报告已生成                │
│  [查看报告]                                 │
├─────────────────────────────────────────────┤
│  📊 我的数据                                 │
│  ┌────────┐ ┌────────┐ ┌────────┐          │
│  │ 我的八字│ │ 老公八字│ │ 合盘报告│          │
│  └────────┘ └────────┘ └────────┘          │
├─────────────────────────────────────────────┤
│  🔮 免费工具入口                             │
│  [八字排盘] [紫微排盘] [星盘查询] [合盘分析]  │
├─────────────────────────────────────────────┤
│  💎 订阅计划                                │
│  当前: Free | [升级到 Pro]                   │
└─────────────────────────────────────────────┘
```

#### 核心组件

- `src/app/(main)/dashboard/page.tsx` — Dashboard 主页面
- `src/components/dashboard/QuickActions.tsx` — 快捷入口
- `src/components/dashboard/ProfileSummary.tsx` — 用户出生配置概览
- `src/components/dashboard/SubscriptionBanner.tsx` — 订阅状态横幅

---

### P2-4: Stripe 订阅集成 (1-2 周)

**目标**：实现付费功能，从免费用户升级到 Pro。

#### 订阅计划

| Plan | 价格 | 内容 |
|------|------|------|
| Free | $0 | 基础排盘，每月 1 次 AI 报告 |
| Pro | $9.9/月 | 无限报告，合盘分析，年度运势，优先 AI 生成 |
| Premium | $19.9/月 | Pro + 多套出生配置，历史报告，API Access |

#### Stripe 集成文件

```
src/app/api/stripe/
  route.ts              # POST — 创建 checkout session
  webhook/route.ts      # POST — Stripe webhook handler
```

#### Stripe Webhook 事件

```typescript
// 监听的事件
'checkout.session.completed'  → 创建/更新 subscription 记录
'customer.subscription.updated' → 更新 subscription_status
'customer.subscription.deleted' → 降级为 free
'invoice.payment_failed' → 标记 payment_failed
```

#### Subscription API

```typescript
// GET /api/subscription — 获取当前订阅状态
// POST /api/stripe/checkout — 创建 Stripe Checkout Session
// POST /api/stripe/portal — 创建客户 Portal Session（管理订阅）
```

---

### P2-5: OpenAI API Key 管理 (1 周)

**目标**：用户输入自己的 API key，解锁 AI 报告功能。

#### UI: `src/app/(main)/settings/api-keys/page.tsx`

- 用户在自己的 OpenAI key（加密存储在 users.openai_api_key）
- 前端显示 ****masked****，仅首次显示完整一次
- 使用 `crypto-js` AES-256 加密，key 存环境变量

#### API

```typescript
// POST /api/user/api-key — 设置用户的 API key
// DELETE /api/user/api-key — 删除 API key
```

#### 使用逻辑

```typescript
// 在 AI 报告生成时，优先使用用户自己的 key
const apiKey = userApiKey ?? process.env.OPENAI_API_KEY;
```

---

### P2-6: Magic Link / 邮箱登录 (0.5 周)

**目标**：补全邮箱登录选项。

#### Resend 配置

```bash
# .env.local
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=noreply@tianjiglobal.com  # 需要域名验证
```

#### NextAuth Resend Provider

```typescript
// src/lib/auth.ts 中已配置，注释已打开
providers: [
  Resend({
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.EMAIL_FROM,
  }),
]
```

#### 步骤

1. 在 Resend 添加域名 `tianjiglobal.com` 并验证 DNS
2. 设置 `EMAIL_FROM=noreply@tianjiglobal.com`
3. 在 `src/app/login/page.tsx` 取消 Magic Link 的 disabled 状态
4. 测试登录流程

---

## 四、前端组件树

```
src/app/(main)/
  dashboard/page.tsx              ← 新增: 主 Dashboard
  birth-profiles/
    page.tsx                      ← 新增: 配置列表
    new/page.tsx                  ← 新增: 创建配置
    [id]/page.tsx                 ← 新增: 编辑配置
  settings/
    api-keys/page.tsx             ← 新增: API key 管理
    subscription/page.tsx         ← 新增: 订阅管理
  profile/page.tsx                ← 已有: 基本信息/时区

src/components/
  birth-profile/
    BirthProfileForm.tsx          ← 新增: 出生配置表单
    BirthProfileCard.tsx          ← 新增: 配置卡片
    SystemSelector.tsx            ← 新增: 系统选择（八字/紫微/星盘）
  dashboard/
    QuickActions.tsx              ← 新增
    ProfileSummary.tsx             ← 新增
    SubscriptionBanner.tsx         ← 新增
  subscription/
    PricingTable.tsx              ← 新增
    CheckoutButton.tsx             ← 新增
    SubscriptionStatus.tsx         ← 新增
```

---

## 五、API 总览

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/birth-profiles` | GET, POST | 列出/创建出生配置 |
| `/api/birth-profiles/:id` | GET, PATCH, DELETE | 单个配置 CRUD |
| `/api/profile` | GET, PATCH | 已有，用户基本信息 |
| `/api/stripe/checkout` | POST | 创建 Stripe Checkout |
| `/api/stripe/portal` | POST | 客户订阅管理页面 |
| `/api/stripe/webhook` | POST | Stripe webhook |
| `/api/user/api-key` | POST, DELETE | OpenAI API key 管理 |
| `/api/subscription` | GET | 获取订阅状态 |

---

## 六、合盘 × 用户系统集成

用户系统完成后，合盘报告的调用链变为：

```
用户选择 A 的出生配置 + B 的出生配置
    ↓
/api/synastry/route.ts
    ↓
1. 获取 birth_profiles（两人各自的数据）
2. 计算八字/紫微排盘
3. computeBaZiSynastry / computeZiweiSynastry
4. checkSynastryCoherence
5. composeSynastryNarrative
6. enhanceWithAI（如果用户有 API key）
    ↓
返回报告给前端
```

---

## 七、优先级

| 阶段 | 内容 | 优先级 | 理由 |
|------|------|--------|------|
| P2-1 | 出生数据 API + 存储 | **P0** | 所有报告生成都依赖它 |
| P2-2 | Supabase RLS | **P0** | 数据安全，发布前必须 |
| P2-3 | Dashboard | **P1** | 用户留存关键 |
| P2-4 | Stripe 订阅 | **P1** | 商业化基础 |
| P2-5 | API Key 管理 | **P2** | 进阶功能，解锁 AI |
| P2-6 | Magic Link | **P3** | 体验优化，已有 Google OAuth |

---

## 八、注意事项

1. **Service Role Key 安全**：永远只用在 Next.js API Routes，不打包到客户端
2. **用户数据隔离**：每个查询都必须带上 `user_id` 条件，防止越权
3. **Stripe Webhook 验签**：必须验证 `stripe-signature` header，防止伪造
4. **出生时间精度**：时辰 index 0-12（每时辰 2 小时），前端用下拉选时辰名
5. **时区处理**：所有时间存储 UTC，输出时转换用户时区
6. **Stripe 降级**：用户取消订阅 → `subscription_status = 'canceled'` → 降级为 Free plan

---

## 九、验证步骤

```bash
# 1. 启动 Supabase 本地环境
supabase start

# 2. 运行迁移
supabase db push

# 3. 创建测试用户（浏览器）
#    访问 /login → Google 登录 → 跳转 /dashboard

# 4. 测试 birth-profile 创建
curl -X POST http://localhost:3000/api/birth-profiles \
  -H "Content-Type: application/json" \
  -H "Cookie: <session_cookie>" \
  -d '{"name":"我的八字","system":"bazi","birthDate":"1990-01-15","birthTime":5,"gender":"male"}'

# 5. 验证 RLS（两个用户不能互读数据）
#    创建两个账号，分别插入 birth-profile，验证互相访问不到

# 6. 测试合盘（用户系统集成后）
#    用户 A 有 birth-profile-A，用户 B 有 birth-profile-B
#    POST /api/synastry 使用两人的 profile IDs，自动拉取数据
```
