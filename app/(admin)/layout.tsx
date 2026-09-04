import Link from 'next/link';
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#0B0E14]">
      <aside className="w-56 bg-[#12151C] border-r border-neutral-800 p-4 flex flex-col justify-between text-xs">
        <div className="space-y-4">
          <div className="font-black text-lg text-white">ZEN-G CMS</div>
          <nav className="space-y-2 text-neutral-400">
            <Link href="/admin/dashboard" className="block hover:text-white">Dashboard</Link>
            <Link href="/" target="_blank" className="block hover:text-white">View Live Site ↗</Link>
          </nav>
        </div>
        <form action="/auth/signout" method="post">
          <button type="submit" className="text-rose-400 font-semibold">Sign Out</button>
        </form>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
