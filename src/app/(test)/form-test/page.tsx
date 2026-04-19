'use client';
export default function FormTest() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-black/40"
        style={{ boxShadow: '0 8px 48px rgba(0,0,0,0.6)' }}>
        <form onSubmit={e => e.preventDefault()} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] text-white/30 mb-1.5 tracking-widest uppercase">生日类型</label>
            <select className="w-full rounded-xl px-3 py-2.5 text-sm text-white/80 bg-white/[0.04] border border-white/[0.08]"> 
              <option>阳历 / Solar</option><option>农历 / Lunar</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-white/30 mb-1.5 tracking-widest uppercase">生日</label>
            <input type="date" defaultValue="2000-08-16" className="w-full rounded-xl px-3 py-2.5 text-sm text-white/80 bg-white/[0.04] border border-white/[0.08]" />
          </div>
          <div>
            <label className="block text-[10px] text-white/30 mb-1.5 tracking-widest uppercase">性别</label>
            <select className="w-full rounded-xl px-3 py-2.5 text-sm text-white/80 bg-white/[0.04] border border-white/[0.08]">
              <option>男 / Male</option><option>女 / Female</option>
            </select>
          </div>
          <div className="pt-2">
            <button type="submit" className="w-full rounded-xl py-3.5 text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.9) 0%, rgba(168,130,255,0.7) 100%)', color: '#0a0a0a' }}>
              ✨ 开启命盘解析
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
