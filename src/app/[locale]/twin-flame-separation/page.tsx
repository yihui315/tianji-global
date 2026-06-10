import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildLocalizedMetadata } from '@/lib/i18n-metadata';
import { getLocalizedPath, isSupportedLocale, locales, type Locale } from '@/lib/i18n';

type PageParams = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) return {};
  const title = 'Twin Flame Separation Stage — What It Really Means';
  const description =
    'Discover if you\'re going through the twin flame separation stage. Learn the signs, what it means for your spiritual journey, and how to navigate this transformative period.';
  return buildLocalizedMetadata({ locale, path: '/twin-flame-separation', title, description });
}

const t = {
  en: {
    heroTitle: 'Twin Flame Separation Stage',
    heroSubtitle:
      'Separation is not the end — it\'s the inner work that was always meant to happen.',
    signs: {
      title: 'Signs You\'re in the Separation Stage',
      items: [
        'An intense, magnet-like pull that suddenly feels blocked or distant',
        'Recurring dreams about your twin flame — even when you\'ve moved on',
        'Feeling their emotions as if they\'re beside you, then suddenly not',
        'Unexplained restlessness, anxiety, or emotional heaviness without cause',
        'Synchronistic signs: repeating numbers, songs, symbols connected to them',
        'A deep knowing that they are still connected — despite the silence',
      ],
    },
    meaning: {
      title: 'What the Separation Stage Actually Means',
      body: 'The twin flame separation stage is a sacred crucible. Neither person is at fault — the separation exists because both souls are being stretched beyond their old patterns. The DF runner may feel overwhelmed by the intensity; the DF chaser may feel abandoned. But the truth: both are being prepared for a more authentic reunion.',
    },
    journey: {
      title: 'Your Journey Through Separation',
      steps: [
        { label: 'Acknowledge the Pain', text: 'Don\'t suppress what you feel. Let yourself grieve, ache, and long. That longing is evidence of the bond.' },
        { label: 'Turn the Lens Inward', text: 'Separation is divine pressure to face your wounds. Where do you still seek external validation? Where do you fear being truly seen?' },
        { label: 'Forgive the Distance', text: 'Your twin flame isn\'t abandoning you — they\'re surviving the only way they know how. Compassion dissolves the illusion of separation.' },
        { label: 'Trust the Timing', text: 'The reunion will not come on your timeline. But it will come the moment both souls have learned what the separation was designed to teach.' },
        { label: 'Become Whole First', text: 'You are not "half" of your twin flame. You are a complete soul learning to stand in your own light. When you\'re fully in yours, they will find their way back.' },
      ],
    },
    reading: {
      title: 'Get Your Twin Flame Reading',
      desc: 'Receive a personalized twin flame separation reading — understand your stage, the lessons, and what the universe has coded for your reunion.',
      cta: 'Start My Reading',
    },
    more: {
      title: 'Continue Exploring',
      links: [
        { label: 'Will My Ex Come Back?', href: '/will-my-ex-come-back' },
        { label: 'Signs My Ex Regrets Leaving', href: '/signs-my-ex-regrets-leaving' },
        { label: 'Daily Love Oracle', href: '/daily-oracle' },
        { label: 'View All Readings', href: '/love-reading' },
      ],
    },
  },
  'zh-CN': {
    heroTitle: '双生火焰分离阶段',
    heroSubtitle: '分离不是结束——而是一场始终注定要发生的内心功课。',
    signs: {
      title: '你正处于分离阶段的迹象',
      items: [
        '强烈磁吸般的牵引突然感到受阻或遥远',
        '反复梦到双生火焰——即使你已经向前走',
        '感受他们的情绪，仿佛他们在身边，然后又突然消失',
        '无原因的莫名不安、焦虑或情感沉重',
        '同步迹象：重复的数字、歌曲、与他们相关的符号',
        '一种深刻的认知——他们仍然连接着——尽管沉默',
      ],
    },
    meaning: {
      title: '分离阶段真正意味着什么',
      body: '双生火焰分离阶段是一个神圣的熔炉。两个人都没有错——分离的存在是因为两个灵魂都在被拉伸出旧的模式。DF奔跑者可能感到被强度淹没；DF 追逐者可能感到被抛弃。但真相是：两个人都在为更真实的重逢做准备。',
    },
    journey: {
      title: '你的分离之旅',
      steps: [
        { label: '承认痛苦', text: '不要压抑你的感受。让自己悲伤、痛苦、渴望。那种渴望是连接的证明。' },
        { label: '将镜头转向内心', text: '分离是神圣的压力，让你面对自己的伤口。你还在哪里寻求外部认可？在哪里害怕被真正看见？' },
        { label: '宽恕距离', text: '你的双生火焰并没有抛弃你——他们正在以自己知道的唯一方式生存。慈悲化解分离的幻象。' },
        { label: '信任时机', text: '重逢不会按照你的时间表到来。但它会在两个灵魂都学会了分离所设计的课程的那一刻到来。' },
        { label: '先让自己完整', text: '你不是双生火焰的"另一半"。你是一个学习站立在自己光芒中的完整灵魂。当你完全在自己的光中时，他们会找到回来的路。' },
      ],
    },
    reading: {
      title: '获取你的双生火焰解读',
      desc: '接收个性化的双生火焰分离解读——了解你的阶段、功课，以及宇宙为你们重逢所编码的内容。',
      cta: '开始我的解读',
    },
    more: {
      title: '继续探索',
      links: [
        { label: '前任会回来吗？', href: '/will-my-ex-come-back' },
        { label: '前任后悔离开的迹象', href: '/signs-my-ex-regrets-leaving' },
        { label: '每日爱情签', href: '/daily-oracle' },
        { label: '查看所有解读', href: '/love-reading' },
      ],
    },
  },
};

export default async function TwinFlameSeparationPage({ params }: PageParams) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const c = t[locale as keyof typeof t];

  return (
    <main className="min-h-screen bg-[#050508] px-5 py-16 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Breadcrumb */}
        <nav className="mb-8 text-xs text-white/40">
          <Link href={getLocalizedPath('/', locale)} className="hover:text-[#d8b77b]">TianJi</Link>
          <span className="mx-2">/</span>
          <span className="text-white/60">Twin Flame Separation</span>
        </nav>

        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="mb-3 text-xs font-medium tracking-widest text-[#d8b77b]/70 uppercase">
            Twin Flame Journey
          </div>
          <h1 className="font-serif text-4xl text-[#ffe3b4] sm:text-5xl">{c.heroTitle}</h1>
          <p className="mt-5 text-lg text-white/60 leading-relaxed max-w-xl mx-auto">{c.heroSubtitle}</p>
        </div>

        {/* Signs */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-[#ffe3b4]">{c.signs.title}</h2>
          <ul className="mt-5 space-y-3">
            {c.signs.items.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-white/60">
                <span className="mt-1 text-[#d8b77b]">✦</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Meaning */}
        <section className="mb-12 rounded-2xl border border-white/10 bg-white/5 p-8">
          <h2 className="font-serif text-2xl text-[#ffe3b4]">{c.meaning.title}</h2>
          <p className="mt-4 text-sm text-white/60 leading-relaxed">{c.meaning.body}</p>
        </section>

        {/* Journey */}
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-[#ffe3b4]">{c.journey.title}</h2>
          <div className="mt-5 space-y-4">
            {c.journey.steps.map((step) => (
              <div key={step.label} className="flex gap-4">
                <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-[#d8b77b]/30 text-xs text-[#d8b77b] font-medium">
                  {c.journey.steps.indexOf(step) + 1}
                </div>
                <div>
                  <div className="text-sm font-medium text-[#ffe3b4]">{step.label}</div>
                  <div className="mt-1 text-sm text-white/60 leading-relaxed">{step.text}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Reading CTA */}
        <section className="mb-12 rounded-2xl bg-gradient-to-b from-[#1a1215] to-[#0d0a0c] border border-[#d8b77b]/20 p-8 text-center">
          <h2 className="font-serif text-2xl text-[#ffe3b4]">{c.reading.title}</h2>
          <p className="mt-3 text-sm text-white/60">{c.reading.desc}</p>
          <Link
            href="/love-reading"
            className="mt-6 inline-block rounded-full bg-[#d8b77b] px-8 py-3 text-sm font-medium text-[#0a0812] hover:bg-[#e8c98b] transition-colors"
          >
            {c.reading.cta}
          </Link>
        </section>

        {/* More Links */}
        <section>
          <h2 className="font-serif text-xl text-[#ffe3b4]">{c.more.title}</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {c.more.links.map((link) => (
              <Link
                key={link.href}
                href={getLocalizedPath(link.href, locale)}
                className="rounded-full border border-white/20 px-4 py-2 text-xs text-white/60 hover:border-[#d8b77b]/40 hover:text-[#d8b77b]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}