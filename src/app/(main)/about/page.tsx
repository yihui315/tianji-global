'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AboutPage() {
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');

  const content = {
    zh: {
      title: '关于我们',
      subtitle: 'About',
      mission: '让传统智慧通过现代AI触手可及',
      missionDesc: '我们相信，古代智慧可以改善现代生活。天机全球将中国命理学的深厚传统与最先进的人工智能技术相结合，为全球用户提供可访问、准确且有意义的命理服务。',
      story: '我们的故事',
      storyText: '天机全球由一群对传统智慧和现代科技充满热情的创始人创立。我们的团队包括命理学专家、人工智能工程师和用户体验设计师，共同致力于将古老的命理传统以现代、科学的方式呈现给世界。',
      tech: '技术架构',
      techDesc: '我们使用尖端的人工智能技术来处理和分析复杂的命理数据，为用户提供准确且有价值的洞察。',
      values: '核心价值',
      valueItems: [
        { title: '传统智慧', desc: '尊重并传承千年的命理传统' },
        { title: '现代创新', desc: '用AI技术让传统智慧焕发新生' },
        { title: '用户至上', desc: '以用户体验为核心，不断优化服务' },
        { title: '隐私保护', desc: '严格保护用户数据安全和隐私' },
      ],
      techStack: [
        { name: 'Next.js 15', desc: 'React框架' },
        { name: 'TypeScript', desc: '类型安全' },
        { name: 'Tailwind CSS', desc: '样式设计' },
        { name: 'OpenAI', desc: 'AI模型' },
        { name: 'Vercel', desc: '云端部署' },
        { name: 'Supabase', desc: '数据库' },
      ],
      contact: '联系我们',
      contactText: '我们随时欢迎您的声音',
      email: 'hello@tianji.global',
    },
    en: {
      title: 'About Us',
      subtitle: '关于我们',
      mission: 'Making Traditional Wisdom Accessible Through Modern AI',
      missionDesc: 'We believe ancient wisdom can improve modern life. TianJi Global combines the deep traditions of Chinese metaphysics with cutting-edge AI technology to provide accessible, accurate, and meaningful fortune-telling services to users worldwide.',
      story: 'Our Story',
      storyText: 'TianJi Global was founded by a group of passionate founders who love both traditional wisdom and modern technology. Our team includes metaphysics experts, AI engineers, and UX designers, all dedicated to presenting ancient fortune-telling traditions to the world in a modern, scientific way.',
      tech: 'Technology Stack',
      techDesc: 'We use cutting-edge AI technology to process and analyze complex metaphysical data, providing users with accurate and valuable insights.',
      values: 'Core Values',
      valueItems: [
        { title: 'Traditional Wisdom', desc: 'Respecting and passing on millennia of metaphysical traditions' },
        { title: 'Modern Innovation', desc: 'Rejuvenating traditional wisdom with AI technology' },
        { title: 'User First', desc: 'Continuously optimizing services with user experience as the core' },
        { title: 'Privacy Protection', desc: 'Strictly protecting user data security and privacy' },
      ],
      techStack: [
        { name: 'Next.js 15', desc: 'React Framework' },
        { name: 'TypeScript', desc: 'Type Safety' },
        { name: 'Tailwind CSS', desc: 'Styling' },
        { name: 'OpenAI', desc: 'AI Models' },
        { name: 'Vercel', desc: 'Cloud Deployment' },
        { name: 'Supabase', desc: 'Database' },
      ],
      contact: 'Contact Us',
      contactText: 'We welcome your voice anytime',
      email: 'hello@tianji.global',
    }
  };

  const t = content[language];

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[#0a0a0a]">
        <div className="stars-container">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="p-6">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                天机全球
              </h1>
              <p className="text-purple-300/80 text-lg">TianJi Global</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="px-4 py-2 bg-slate-800/50 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition"
              >
                {language === 'zh' ? '返回首页' : 'Back to Home'}
              </Link>
              <button
                onClick={() => setLanguage('zh')}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  language === 'zh'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                中文
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  language === 'en'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="px-6 py-20 text-center max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            {t.title}
          </h2>
          <p className="text-purple-300 text-xl mb-8">{t.subtitle}</p>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-amber-500 mx-auto mb-8" />
        </section>

        {/* Mission */}
        <section className="px-6 py-12 max-w-4xl mx-auto">
          <div className="rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 md:p-12 text-center">
            <div className="text-5xl mb-6">🌟</div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">{t.mission}</h3>
            <p className="text-slate-300 text-lg leading-relaxed">{t.missionDesc}</p>
          </div>
        </section>

        {/* Story */}
        <section className="px-6 py-12 max-w-4xl mx-auto">
          <div className="rounded-2xl bg-gradient-to-br from-purple-900/30 to-amber-900/30 border border-purple-700/30 p-8 md:p-12">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-3xl">📖</span> {t.story}
            </h3>
            <p className="text-slate-300 text-lg leading-relaxed">{t.storyText}</p>
          </div>
        </section>

        {/* Core Values */}
        <section className="px-6 py-12 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">{t.values}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.valueItems.map((item, index) => (
              <div
                key={index}
                className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-6 hover:border-purple-500/50 transition-colors"
              >
                <h4 className="text-lg font-semibold text-white mb-2">{item.title}</h4>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Technology Stack */}
        <section className="px-6 py-12 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-2 text-center">{t.tech}</h3>
          <p className="text-slate-400 text-center mb-8">{t.techDesc}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {t.techStack.map((tech, index) => (
              <div
                key={index}
                className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 text-center hover:border-amber-500/50 transition-colors"
              >
                <div className="text-2xl mb-2">⚙️</div>
                <h4 className="text-white font-medium">{tech.name}</h4>
                <p className="text-slate-400 text-sm">{tech.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="px-6 py-16 max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-white mb-4">{t.contact}</h3>
          <p className="text-slate-400 mb-6">{t.contactText}</p>
          <a
            href="mailto:hello@tianji.global"
            className="inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-amber-600 text-white rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            <span>📧</span>
            {t.email}
          </a>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 text-slate-500 text-sm">
          <p>© 2024 TianJi Global · 天机全球</p>
          <p className="mt-1">
            {language === 'zh'
              ? '融合传统智慧与现代科技'
              : 'Bridging Traditional Wisdom & Modern Technology'}
          </p>
        </footer>
      </div>

      <style jsx>{`
        .stars-container {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 50%;
          animation: twinkle ease-in-out infinite;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
      `}</style>
    </main>
  );
}
