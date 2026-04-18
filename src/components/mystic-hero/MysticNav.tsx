'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

/**
 * Minimal mystic navigation bar.
 * Items: 首页 · 占卜 · 星座 · 塔罗 · 关于
 * Mobile: hamburger → fullscreen overlay
 * Scrolled state: deeper backdrop
 */

const NAV_ITEMS = [
  { label: '首页', labelEn: 'Home', href: '/' },
  { label: '占卜', labelEn: 'Divination', href: '/fortune' },
  { label: '星座', labelEn: 'Astrology', href: '/western' },
  { label: '塔罗', labelEn: 'Tarot', href: '/tarot' },
  { label: '关于', labelEn: 'About', href: '/about' },
];

export default function MysticNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
          scrolled
            ? 'bg-black/80 backdrop-blur-2xl border-white/10'
            : 'bg-transparent backdrop-blur-sm border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-purple-600 flex items-center justify-center text-lg shadow-[0_0_20px_-4px] shadow-amber-400/50 group-hover:shadow-amber-400/80 transition-shadow">
              ☯︎
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-serif tracking-tight text-white">TianJi</span>
              <span className="text-xl font-serif tracking-tight text-amber-300">全球</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white/70 hover:text-amber-300 text-sm tracking-wide transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-1 bg-white/[0.06] px-3 py-1.5 rounded-full text-xs">
              <button className="font-medium text-white/70 hover:text-white transition">中</button>
              <span className="text-white/20">|</span>
              <button className="font-medium text-amber-300">EN</button>
            </div>
            <Link href="/login">
              <button className="px-5 py-2.5 bg-white/[0.08] border border-white/15 text-white text-sm rounded-full hover:bg-white/15 hover:border-amber-300/30 transition-all">
                登入天机
              </button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-white/70 transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white/70 transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white/70 transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center gap-8">
          <button
            className="absolute top-5 right-6 text-white/60 text-2xl"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
          {NAV_ITEMS.map(item => (
            <a
              key={item.href}
              href={item.href}
              className="text-3xl font-serif text-white/80 hover:text-amber-300 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
              <span className="block text-sm text-white/30 font-sans">{item.labelEn}</span>
            </a>
          ))}
          <a href="/login">
            <button className="mt-4 px-8 py-3 bg-gradient-to-r from-amber-400 to-purple-600 text-black rounded-full font-medium">
              登入天机
            </button>
          </a>
        </div>
      )}
    </>
  );
}
