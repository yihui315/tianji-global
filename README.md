# 天机全球 · TianJi Global

**AI Fortune Platform | 天机全球AI算命平台**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org/)

> *"知天命，顺天机 — Know destiny, follow the cosmic order."*

TianJi Global is the world's premier AI-powered fortune and destiny analysis platform. We unite the ancient wisdom of Chinese metaphysics with state-of-the-art artificial intelligence to deliver personalised, meaningful destiny readings accessible to everyone, worldwide.

---

## Features

### Fortune Modules

| Module | Chinese | Description |
|--------|---------|-------------|
| Zi Wei Dou Shu | 紫微斗数 | Purple Star Astrology — 12-palace fate chart with iztro engine, annual & monthly luck cycles |
| BaZi Analysis | 八字分析 | Four Pillars of Destiny — life path, career, wealth, relationships & health from birth data |
| Yi Jing Oracle | 易经占卜 | AI-guided I Ching divination — cast hexagrams with contextualised interpretations |
| Tarot Reading | 塔罗牌 | AI-powered tarot spreads — Celtic Cross, Three Cards, Yes/No oracle |
| Western Astrology | 西方占星 | Natal chart with planets, houses, and aspects |
| Life Fortune Chart | 人生K线图 | Interactive bar+line chart showing fortune cycles across 10 life phases (Chart.js) |

### Platform Highlights

- **Multi-AI Provider** — Claude, GPT-4, Grok, Gemini, Ollama — automatic fallback, cost tracking
- **Bilingual** — English, 简体中文, 繁體中文
- **Privacy-First** — Ollama local mode, no data stored unless authenticated
- **Social Sharing** — Dynamic OG image generation per module type
- **Stripe Payments** — Subscription tiers (Free / Pro Monthly / Pro Yearly)
- **User Accounts** — NextAuth v5 with Google OAuth + email credentials

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS, Chart.js |
| AI | Anthropic Claude, OpenAI GPT-4, xAI Grok, Google Gemini, Ollama |
| Auth | NextAuth v5 (Google OAuth + Credentials) |
| Database | Supabase (PostgreSQL + Auth + Realtime) |
| Payments | Stripe (Checkout + Webhooks + Billing Portal) |
| Deployment | Vercel (recommended) |

---

## Project Structure

```
src/
├── app/
│   ├── (main)/              # Main routes (public)
│   │   ├── page.tsx         # Homepage with navigation
│   │   ├── ziwei/           # 紫微斗数
│   │   ├── bazi/            # 八字分析
│   │   ├── yijing/          # 易经占卜
│   │   ├── tarot/           # 塔罗牌
│   │   ├── western/         # 西方占星
│   │   ├── fortune/         # 人生K线图
│   │   └── pricing/         # Pricing + success/cancel pages
│   ├── dashboard/           # Protected user dashboard
│   ├── login/               # Auth pages
│   └── api/                 # API routes
│       ├── ask/             # AI chat endpoint
│       ├── ziwei/           # Ziwei calculation
│       ├── bazi/            # BaZi calculation
│       ├── yijing/          # Yi Jing oracle
│       ├── tarot/           # Tarot reading
│       ├── fortune/         # Life fortune predictions
│       ├── stripe/          # Checkout + Webhook + Portal
│       └── share/og/        # OG image generation
├── components/
│   └── charts/LifeChart.tsx # Chart.js fortune visualization
├── lib/
│   ├── ai-orchestrator.ts   # Multi-model AI routing + fallback
│   ├── ai-models.ts         # Model registry with pricing
│   ├── auth.ts              # NextAuth v5 config
│   └── stripe.ts            # Stripe client + plans
├── types/
│   └── ai.ts                # AI types + MODEL_REGISTRY
└── middleware.ts            # Route protection
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- At least one AI provider API key (Anthropic recommended)

### Installation

```bash
# Clone
git clone https://github.com/yihui315/tianji-global.git
cd tianji-global

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env — add your API keys

# Start development server
npm run dev
```

App runs at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

---

## Environment Variables

### Required for Development

```bash
# At least ONE AI provider required:
ANTHROPIC_API_KEY=sk-ant-...      # Recommended (Claude 3.5 Sonnet)
OPENAI_API_KEY=sk-...             # GPT-4
GROK_API_KEY=...                  # xAI Grok
GEMINI_API_KEY=...                # Google Gemini

# NextAuth (generate with: openssl rand -base64 32)
NEXT_AUTH_SECRET=your-secret-here
NEXT_AUTH_URL=http://localhost:3000
```

### Optional

```bash
# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Local AI (privacy mode)
OLLAMA_BASE_URL=http://localhost:11434
```

---

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ask` | POST | General AI chat |
| `/api/ziwei` | POST | Ziwei chart calculation |
| `/api/bazi` | POST | BaZi four pillars |
| `/api/yijing` | POST | Yi Jing hexagram |
| `/api/tarot` | POST | Tarot card reading |
| `/api/fortune` | GET | Life fortune cycles |
| `/api/stripe/checkout` | POST | Create checkout session |
| `/api/stripe/webhook` | POST | Stripe webhook handler |
| `/api/stripe/portal` | POST | Billing portal session |
| `/api/share/og` | GET | Dynamic OG image |

### Example — Ziwei Reading

```http
POST /api/ziwei
Content-Type: application/json

{
  "birthDate": "1990-05-15",
  "birthTime": "08:30",
  "gender": "male",
  "language": "zh"
}
```

### Example — Life Fortune

```http
GET /api/fortune?birthDate=1990-05-15&birthTime=08:30&language=zh
```

Returns 10 life phases (童年→耄耋) with career/wealth/love/health scores and best/worst periods.

---

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Set environment variables in Vercel dashboard.

### Docker

```bash
docker build -t tianji-global .
docker run -p 3000:3000 --env-file .env tianji-global
```

---

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'feat: add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## License

MIT License — see [LICENSE](LICENSE) file.

---

## Links

- **Website:** https://tianji.global
- **GitHub:** https://github.com/yihui315/tianji-global

---

<div align="center">

Made with ❤️ and 🔮

**TianJi Global | 天机全球** © 2024–2025 — All rights reserved

</div>
