import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#050508] px-5 py-20 text-white">
      <div className="mb-6 text-center">
        <div className="mb-4 text-xs uppercase tracking-[0.4em] text-white/40">
          TianJi · 天机
        </div>
        <h1 className="mb-3 text-3xl font-semibold text-white/80">
          页面未找到 · Page Not Found
        </h1>
        <p className="mb-2 text-sm text-white/50">
          你要查找的页面不存在或已被移动。
        </p>
        <p className="mb-8 text-sm text-white/50">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block rounded-full bg-[#ff6c73] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#ff6c73]/90"
        >
          返回首页 · Return Home
        </Link>
      </div>
    </main>
  );
}