'use client';
import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const [birthData, setBirthData] = useState({ date: '', time: '', gender: 'male' });

  useEffect(() => {
    const canvas = document.getElementById('stars') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars: { x: number; y: number; size: number; speed: number }[] = [];
    for (let i = 0; i < 800; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.1,
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(212, 175, 119, 0.8)';
      stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        star.y += star.speed;
        if (star.y > canvas.height) star.y = 0;
      });
      requestAnimationFrame(animate);
    }
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const SERVICES = [
    { href: '/ziwei', icon: '🌟', title: '紫微斗数', desc: '14主星 · 12宫位 · 四化飞星' },
    { href: '/bazi', icon: '📊', title: '八字命理', desc: '日主 · 十神 · 大运流年' },
    { href: '/yijing', icon: '🔮', title: '易经占卜', desc: '64卦 · 爻辞 · 象数分析' },
    { href: '/western', icon: '⭐', title: '西方星盘', desc: 'SWEPH精确计算 · AstroChart专业星盘' },
    { href: '/synastry', icon: '💫', title: '合盘分析', desc: '叠盘 · 复合盘 · 戴维森盘' },
    { href: '/tarot', icon: '🃏', title: '塔罗占卜', desc: '78张牌 · AI智能解读' },
    { href: '/numerology', icon: '🔢', title: '姓名命理', desc: '三才五格 · 数理磁场' },
    { href: '/solar-return', icon: '☀️', title: '太阳返照', desc: '年度运势 · 生日星盘' },
    { href: '/transit', icon: '🔭', title: 'Transit推运', desc: '次限推进 · 顺逆行分析' },
    { href: '/fengshui', icon: '🏠', title: '风水布局', desc: '八宅 · 玄空飞星' },
    { href: '/electional', icon: '📅', title: '择日择吉', desc: '黄道吉日 · 最优时辰' },
    { href: '/horary', icon: '🌀', title: '卦占', desc: '时间卦 · 即时天机' },
  ];

  return (
    <>
      <canvas id="stars" className="fixed inset-0 pointer-events-none z-0 opacity-40" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-400 to-purple-600 flex items-center justify-center text-2xl shadow-[0_0_25px_-5px] shadow-amber-400">☯️︎</div>
            <div>
              <span className="text-3xl font-serif tracking-tighter text-white">TianJi</span>
              <span className="text-3xl font-serif tracking-tighter text-amber-300">全球</span>
            </div>
          </div>

          <div className="flex items-center gap-8 text-white/90">
            <a href="#services" className="hover:text-amber-300 transition">命理服务</a>
            <a href="#how" className="hover:text-amber-300 transition">天机如何运转</a>
            <a href="/pricing" className="hover:text-amber-300 transition">订阅方案</a>
            <div className="flex items-center gap-1 bg-white/10 px-4 py-2 rounded-3xl text-sm">
              <button className="font-medium">中文</button>
              <span className="text-white/30">|</span>
              <button className="font-medium text-amber-300">EN</button>
            </div>
            <button className="px-6 py-3 bg-white text-black rounded-3xl font-medium hover:scale-105 transition">登入天机</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center px-6 pt-32">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-3xl mb-8 border border-amber-300/30">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span className="text-amber-300 text-sm tracking-[2px] font-medium">AI · 古籍 · 星空</span>
          </div>

          <h1 className="text-7xl md:text-8xl font-serif leading-none tracking-tighter text-white mb-6">
            命运的<br />奥秘<br /><span className="bg-gradient-to-r from-amber-300 via-purple-300 to-amber-300 bg-clip-text text-transparent">已为你打开</span>
          </h1>

          <p className="text-2xl text-white/70 max-w-lg mx-auto mb-12">
            紫微·八字·星盘·塔罗<br />
            古今中西，AI以古典智慧为你解开天机
          </p>

          {/* 立即起卦小窗 */}
          <div className="max-w-md mx-auto bg-white/5 backdrop-blur-3xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <p className="text-amber-300 text-sm mb-6 tracking-widest">今日天机 · 输入生辰</p>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                className="bg-white/10 border border-white/30 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-amber-300"
                onChange={e => setBirthData({...birthData, date: e.target.value})}
              />
              <input
                type="time"
                className="bg-white/10 border border-white/30 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-amber-300"
                onChange={e => setBirthData({...birthData, time: e.target.value})}
              />
            </div>
            <select
              className="w-full mt-4 bg-white/10 border border-white/30 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-amber-300"
              onChange={e => setBirthData({...birthData, gender: e.target.value})}
            >
              <option value="male">乾造 · 男</option>
              <option value="female">坤造 · 女</option>
            </select>

            <button
              onClick={() => {
                if (!birthData.date || !birthData.time) {
                  alert('请输入完整的出生日期和时间');
                  return;
                }
                window.location.href = `/fortune?date=${birthData.date}&time=${birthData.time}&gender=${birthData.gender}`;
              }}
              className="w-full mt-8 py-6 bg-gradient-to-r from-amber-400 to-purple-600 text-black font-medium text-xl rounded-3xl hover:scale-105 transition-all shadow-[0_0_40px_-10px] shadow-amber-400"
            >
              立即起卦 · 窥见一生
            </button>
            <p className="text-white/40 text-xs mt-4">娱乐参考 · 非绝对预测</p>
          </div>
        </div>

        {/* 右侧漂浮元素 */}
        <div className="hidden lg:block absolute right-12 bottom-12 text-amber-300/30 text-8xl animate-float">☯️︎</div>
        <div className="hidden lg:block absolute left-20 top-40 text-purple-300/20 text-6xl animate-float-delay">★</div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-black relative">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-5xl font-serif text-center text-white mb-16">十二天机法门</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((s) => (
              <a
                key={s.href}
                href={s.href}
                className="group bg-gradient-to-br from-white/5 to-white/10 border border-white/10 hover:border-amber-300/50 rounded-3xl p-8 transition-all hover:-translate-y-3 hover:shadow-2xl hover:shadow-amber-300/10"
              >
                <div className="text-5xl mb-6 group-hover:scale-110 transition">{s.icon}</div>
                <h3 className="text-2xl font-serif text-white mb-2">{s.title}</h3>
                <p className="text-white/60">{s.desc}</p>
                <button className="mt-8 text-amber-300 group-hover:text-white flex items-center gap-2">
                  开始排盘 <span className="text-xl">→</span>
                </button>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-24 bg-black/50 relative">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-5xl font-serif text-white mb-16">天机如何运转</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: '01', title: '输入生辰', desc: '提供你的出生日期、时间和地点' },
              { step: '02', title: 'AI解析', desc: '瑞士星历表+古籍算法，精准计算星体位置' },
              { step: '03', title: '深度解读', desc: '融合现代心理学与古典命理，给你专属分析' },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="text-7xl font-serif text-amber-300/20 mb-4">{item.step}</div>
                <h3 className="text-xl font-serif text-white mb-2">{item.title}</h3>
                <p className="text-white/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 结尾CTA */}
      <div className="py-20 bg-gradient-to-b from-transparent via-purple-900/30 to-transparent text-center">
        <p className="text-3xl font-serif text-amber-300">天机已为你准备好答案</p>
        <a href="/western">
          <button className="mt-8 px-12 py-6 text-2xl bg-white text-black rounded-3xl hover:bg-amber-300 transition">
            进入完整命盘
          </button>
        </a>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delay { animation: float 8s ease-in-out infinite 2s; }
      `}</style>
    </>
  );
}
