import Link from 'next/link';
import { LayoutDashboard, FileText, Tag, Zap, TrendingUp, Rss, Bot, Megaphone, Share2, Search as SearchIcon, Image as ImageIcon, Users, Settings, LogOut, ExternalLink } from 'lucide-react';

const nav = [
  { section: 'Overview', items: [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ]},
  { section: 'Content', items: [
    { href: '/admin/news', label: 'All News', icon: FileText },
    { href: '/admin/categories', label: 'Categories', icon: Tag },
    { href: '/admin/breaking', label: 'Breaking News', icon: Zap },
    { href: '/admin/trending', label: 'Trending', icon: TrendingUp },
  ]},
  { section: 'Automation', items: [
    { href: '/admin/sources', label: 'RSS Sources', icon: Rss },
    { href: '/admin/automation', label: 'Automation', icon: Bot },
  ]},
  { section: 'Marketing', items: [
    { href: '/admin/ads', label: 'Advertisements', icon: Megaphone },
    { href: '/admin/social', label: 'Social Sharing', icon: Share2 },
    { href: '/admin/seo', label: 'SEO', icon: SearchIcon },
  ]},
  { section: 'System', items: [
    { href: '/admin/media', label: 'Media Library', icon: ImageIcon },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ]},
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#0B0E14] text-white">
      <aside className="w-60 bg-[#12151C] border-r border-neutral-800 flex flex-col">
        <div className="p-4 border-b border-neutral-800">
          <Link href="/admin/dashboard" className="font-black text-lg tracking-tight">
            ZEN-G<span className="text-blue-500">.</span>CMS
          </Link>
          <Link href="/" target="_blank" className="mt-1 inline-flex items-center gap-1 text-[10px] text-neutral-500 hover:text-blue-400">
            <ExternalLink className="w-3 h-3" /> View live site
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-5 text-xs">
          {nav.map((group) => (
            <div key={group.section}>
              <div className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-500">{group.section}</div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href} className="flex items-center gap-2 px-2 py-1.5 rounded text-neutral-300 hover:bg-neutral-800 hover:text-white">
                      <Icon className="w-3.5 h-3.5" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <form action="/auth/signout" method="post" className="p-3 border-t border-neutral-800">
          <button type="submit" className="flex items-center gap-2 text-rose-400 text-xs font-semibold hover:text-rose-300">
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </form>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
