'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const FAQ_DATA = [
  {
    category: 'General',
    items: [
      {
        q: 'What is Tianji Love?',
        a: 'Tianji Love is an AI-assisted relationship reflection tool that combines traditional divination systems (BaZi, tarot, numerology, synastry) with modern psychology to help you reflect on relationship dynamics, timing signals, and compatibility.',
      },
      {
        q: 'Is Tianji Love free?',
        a: 'Yes — Love Test previews, tarot draws, and basic compatibility checks are free. Paid unlocks ($1.99–$2.99) give fuller readings with deeper guidance, timing analysis, and practical next steps.',
      },
      {
        q: 'Is this for entertainment only?',
        a: 'Tianji Love readings are for entertainment and self-reflection only. They are not medical, legal, financial, or professional psychological advice. Do not make important life decisions based solely on any automated reading.',
      },
    ],
  },
  {
    category: 'Privacy & Data',
    items: [
      {
        q: 'Is my data private?',
        a: 'Yes. Birth date, birth time, and questions are used only to generate your reading. We do not sell or share personal data. Payment information is handled by Stripe and never touches our servers.',
      },
      {
        q: 'Where is my data stored?',
        a: 'Reading inputs are processed in memory and not persistently stored unless you create an account. Payment data is stored by Stripe per their data policy.',
      },
      {
        q: 'Can I delete my data?',
        a: 'Contact us at any time to request deletion of your reading history. Payment records are retained by Stripe in accordance with their compliance requirements.',
      },
    ],
  },
  {
    category: 'Readings & Features',
    items: [
      {
        q: 'How does Love Test work?',
        a: 'Enter a relationship question, and get a free preview instantly. For $1.99, unlock the full reading with in-depth interpretation, timing signals, and actionable guidance.',
      },
      {
        q: 'What is BaZi (Eight Characters)?',
        a: 'BaZi is a traditional Chinese system that maps your birth timeline to five elements and ten celestial stems. It assesses relationship compatibility and timing patterns based on classical Chinese cosmology.',
      },
      {
        q: 'How does tarot work here?',
        a: 'Choose a spread (single card, three-card, or Celtic cross) and focus on a question. A 78-card deck is shuffled and drawn randomly. Each card is interpreted in the context of its position and your question.',
      },
      {
        q: 'What is synastry?',
        a: 'Synastry compares two birth charts to reveal relationship dynamics. Tianji Love supports BaZi-based synastry and Ziwei Doushu synastry.',
      },
      {
        q: 'What is numerology?',
        a: 'Numerology derives personality traits, life path numbers, and compatibility signals from your name and birth date using the Pythagorean system.',
      },
    ],
  },
  {
    category: 'Pricing & Payments',
    items: [
      {
        q: 'What does unlocking cost?',
        a: 'Love Test full reading: $1.99 per question. Draw Timing: $2.99 per draw. Pro Monthly subscription: $9.99/month. Pro Yearly: $99.99/year.',
      },
      {
        q: 'Is payment secure?',
        a: 'All payments are processed by Stripe, a PCI-compliant payment processor. We never see or store your card details.',
      },
      {
        q: 'Is there a refund policy?',
        a: 'One-time unlocks include a 24-hour refund window. Contact us within 24 hours of purchase for a full refund.',
      },
    ],
  },
  {
    category: 'Account',
    items: [
      {
        q: 'Do I need an account?',
        a: 'No account is required to use free previews or make one-time purchases. Create an account to save reading history and access it across devices.',
      },
      {
        q: 'How do I cancel a subscription?',
        a: 'Log in and go to account settings to cancel at any time. Cancellation takes effect at the end of the current billing period.',
      },
    ],
  },
];

const FAQ_ZH = [
  {
    category: '一般问题',
    items: [
      {
        q: '什么是天机爱情？',
        a: '天机爱情是一款 AI 辅助的关系反思工具，融合八字、塔罗、生命灵数、合盘分析与现代心理学，帮助你反思关系动态、时机信号和兼容性。',
      },
      {
        q: '天机爱情免费吗？',
        a: '是的，爱情测试预览、塔罗抽牌和基础合盘免费使用。付费解锁（$1.99–$2.99）提供更完整深入的解读、时机分析和实用指引。',
      },
      {
        q: '这只是娱乐吗？',
        a: '天机爱情的解读仅供娱乐和自我反思之用，不构成医疗、法律、财务或专业心理建议。请勿仅根据任何自动解读做出重要人生决定。',
      },
    ],
  },
  {
    category: '隐私与数据',
    items: [
      {
        q: '我的数据私密吗？',
        a: '是的。出生日期、出生时间和问题仅用于生成解读，不出售或分享个人数据。支付信息由 Stripe 处理，我们的服务器不会接触。',
      },
      {
        q: '数据存在哪里？',
        a: '解读输入在内存中处理，除非创建账户否则不会持久化存储。支付数据由 Stripe 根据其合规要求存储。',
      },
      {
        q: '可以删除数据吗？',
        a: '随时联系我们申请删除解读历史。支付记录根据 Stripe 合规要求保留。',
      },
    ],
  },
  {
    category: '解读与功能',
    items: [
      {
        q: '爱情测试如何运作？',
        a: '输入一个关系问题，立即获得免费预览。支付 $1.99 解锁完整解读，包含深入解析、时机信号和实用行动指引。',
      },
      {
        q: '什么是八字？',
        a: '八字是传统中国命理系统，将出生时间映射到五行和十天干，基于中国古典宇宙观评估关系兼容性和时机模式。',
      },
      {
        q: '塔罗如何运作？',
        a: '选择牌阵（单牌、三牌或凯尔特十字），专注于一个问题。洗牌后随机抽出牌，每张牌结合位置和问题进行解读。',
      },
      {
        q: '什么是合盘？',
        a: '合盘比较两人的出生盘以揭示关系动态。天机爱情支持八字合盘和紫微斗数合盘。',
      },
      {
        q: '什么是生命灵数？',
        a: '生命灵数通过姓名和出生日期使用毕达哥拉斯体系推导性格特征、生命道路数字和兼容性信号。',
      },
    ],
  },
  {
    category: '定价与支付',
    items: [
      {
        q: '解锁需要多少钱？',
        a: '爱情测试完整解读：每个问题 $1.99。时机抽牌：每次 $2.99。专业月费：$9.99/月。专业年费：$99.99/年。',
      },
      {
        q: '支付安全吗？',
        a: '所有支付由 Stripe 处理，Stripe 是符合 PCI 标准的支付处理器。我们不会看到或存储任何卡信息。',
      },
      {
        q: '有退款政策吗？',
        a: '一次性解锁包含 24 小时退款窗口。购买后 24 小时内联系我们即可获得全额退款。',
      },
    ],
  },
  {
    category: '账户',
    items: [
      {
        q: '需要账户吗？',
        a: '使用免费预览或一次性购买无需账户。创建账户可保存解读历史，在不同设备间访问。',
      },
      {
        q: '如何取消订阅？',
        a: '登录后进入账户设置可随时取消。取消将在当前计费周期结束时生效。',
      },
    ],
  },
];

function detectLang(): 'en' | 'zh' {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem('tianji-lang');
  if (stored === 'zh' || stored === 'en') return stored;
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  if (urlLang === 'zh' || urlLang === 'en') return urlLang;
  const nav = navigator.language;
  return nav.startsWith('zh') ? 'zh' : 'en';
}

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(null);
  const [lang, setLang] = useState<'en' | 'zh'>('en');

  useEffect(() => {
    setLang(detectLang());
  }, []);

  const data = lang === 'zh' ? FAQ_ZH : FAQ_DATA;
  const totalItems = data.reduce((a, s) => a + s.items.length, 0);
  let itemIndex = 0;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '1rem 1.5rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ color: '#f59e0b', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>
            ← Tianji Love
          </Link>
          <button
            onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            {lang === 'en' ? '中文' : 'EN'}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '4rem 1.5rem 3rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ color: '#f59e0b', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Tianji Love / FAQ
        </p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: '700', marginBottom: '1rem' }}>
          {lang === 'en' ? 'Frequently Asked Questions' : '常见问题'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.1rem', maxWidth: '560px', margin: '0 auto' }}>
          {lang === 'en'
            ? 'Find answers about readings, privacy, pricing, and how Tianji Love works.'
            : '查找关于解读、隐私、定价和天机爱情运作方式的答案。'}
        </p>
      </section>

      {/* FAQ Content */}
      <section style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
        {data.map((section) => (
          <div key={section.category} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#f59e0b', marginBottom: '1rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {section.category}
            </h2>
            <div>
              {section.items.map((item) => {
                const idx = itemIndex++;
                return (
                  <div key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <button
                      onClick={() => setOpen(open === idx ? null : idx)}
                      style={{
                        width: '100%', padding: '1rem 0', background: 'none', border: 'none',
                        color: '#fff', textAlign: 'left', cursor: 'pointer', display: 'flex',
                        justifyContent: 'space-between', alignItems: 'center', fontSize: '1rem',
                      }}
                    >
                      <span style={{ flex: 1, paddingRight: '1rem', fontWeight: '500' }}>{item.q}</span>
                      <span style={{
                        color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem',
                        transform: open === idx ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s',
                      }}>▼</span>
                    </button>
                    {open === idx && (
                      <div style={{ paddingBottom: '1rem', color: 'rgba(255,255,255,0.65)', lineHeight: '1.7', fontSize: '0.95rem' }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.75rem' }}>
          {lang === 'en' ? 'Still have questions?' : '还有问题？'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>
          {lang === 'en' ? 'Reach out anytime.' : '随时联系我们。'}
        </p>
        <a
          href="mailto:support@tianji.love"
          style={{
            display: 'inline-block', padding: '0.75rem 2rem',
            background: '#f59e0b', color: '#000', fontWeight: '600',
            borderRadius: '8px', textDecoration: 'none', fontSize: '1rem',
          }}
        >
          {lang === 'en' ? 'Contact Us' : '联系我们'}
        </a>
      </section>
    </div>
  );
}
