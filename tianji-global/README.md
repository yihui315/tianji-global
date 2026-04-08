# 天机全球 · TianJi Global 🔮

**AI Fortune Platform | 天机全球AI算命平台**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![OpenAI](https://img.shields.io/badge/Powered%20by-OpenAI-blue)](https://openai.com/)

> *"知天命，顺天机 — Know destiny, follow the cosmic order."*

TianJi Global is the world's premier AI-powered fortune and destiny analysis platform. We unite the ancient wisdom of Chinese metaphysics with state-of-the-art artificial intelligence to deliver personalised, meaningful destiny readings accessible to everyone, worldwide.

---

## ✨ Features

### Core Fortune Modules
| Module | Chinese | Description |
|--------|---------|-------------|
| BaZi Analysis | 八字分析 | Four Pillars of Destiny — analyse life path, career, wealth, relationships & health from your birth date & time |
| Zi Wei Dou Shu | 紫微斗数 | Purple Star Astrology — detailed 12-palace fate chart with annual & monthly luck cycles |
| Yi Jing Oracle | 易经占卜 | AI-guided I Ching divination — cast hexagrams and receive deep, contextualised interpretations |
| Feng Shui Advisor | 风水顾问 | Personalised home & office energy flow recommendations |
| Daily Almanac | 每日黄历 | Auspicious days, lucky hours, and daily fortune digest |

### Platform Highlights
- 🌐 **Multilingual** — English, 简体中文, 繁體中文, 日本語, 한국어
- 🤖 **AI-Powered** — GPT-based natural language interpretations, no jargon
- 📱 **Cross-Platform** — Web, iOS & Android
- 🔒 **Privacy-First** — All readings are encrypted; we never sell your data
- 🌍 **Global Timezone Support** — Accurate birth-time calculations worldwide

---

## 🗂 Project Structure

```
tianji-global/
├── src/
│   ├── api/          # REST & GraphQL API handlers
│   ├── components/   # Reusable UI components
│   └── utils/        # BaZi, Zi Wei, Yi Jing calculation engines
├── public/           # Static assets
├── docs/             # Documentation & API reference
├── package.json
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yihui315/tianji-global.git
cd tianji-global

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | ✅ | Your OpenAI API key |
| `PORT` | ❌ | Server port (default: 3000) |
| `NODE_ENV` | ❌ | `development` / `production` |
| `JWT_SECRET` | ✅ | Secret for JWT token signing |

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Next.js 14, Tailwind CSS |
| Backend | Node.js, Express, GraphQL |
| AI Engine | OpenAI GPT-4, LangChain |
| Database | PostgreSQL, Redis |
| Deployment | Docker, Kubernetes, Vercel |

---

## 📖 API Reference

Full API documentation is available in [`docs/api.md`](docs/api.md).

### Example — BaZi Reading

```http
POST /api/v1/bazi
Content-Type: application/json

{
  "birthDate": "1990-05-15",
  "birthTime": "08:30",
  "birthPlace": "Shanghai, China",
  "gender": "male",
  "language": "en"
}
```

**Response:**
```json
{
  "chart": {
    "year": { "heavenlyStem": "庚", "earthlyBranch": "午" },
    "month": { "heavenlyStem": "辛", "earthlyBranch": "巳" },
    "day":   { "heavenlyStem": "壬", "earthlyBranch": "戌" },
    "hour":  { "heavenlyStem": "甲", "earthlyBranch": "辰" }
  },
  "element": "Water",
  "interpretation": "Your chart reveals a strong Water element personality — intuitive, adaptable, and deeply creative. Career prospects in technology, arts, or finance are favoured...",
  "luckyPeriods": ["2025–2035: Metal Luck Cycle — peak career advancement"]
}
```

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](docs/CONTRIBUTING.md) before submitting a pull request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🌐 Links

- **Website:** https://tianji.global
- **Documentation:** https://docs.tianji.global
- **Discord Community:** https://discord.gg/tianji-global
- **Twitter / X:** [@TianJiGlobal](https://twitter.com/TianJiGlobal)

---

<div align="center">

Made with ❤️ and 🔮 by the TianJi Global Team

**TianJi Global | 天机全球** © 2024 — All rights reserved

</div>
