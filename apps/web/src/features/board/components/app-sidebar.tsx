'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, CheckSquare, Users, Calendar, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { icon: LayoutGrid, href: '/boards', label: 'Boards' },
  { icon: CheckSquare, href: '/tasks', label: 'Tasks' },
  { icon: Users, href: '/team', label: 'Team' },
  { icon: Calendar, href: '/calendar', label: 'Calendar' },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col items-center w-16 min-h-screen bg-[#d6ede2] py-4 gap-2 fixed left-0 top-0 z-40">
      {/* Logo */}
      <Link href="/boards" className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#4a9e7f] mb-4">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="7" height="18" rx="2" fill="white" />
          <rect x="13" y="3" width="8" height="10" rx="2" fill="white" opacity="0.7" />
          <rect x="13" y="16" width="8" height="5" rx="2" fill="white" opacity="0.4" />
        </svg>
      </Link>

      {NAV_ITEMS.map(({ icon: Icon, href, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            title={label}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
              active
                ? 'bg-[#f5c842] text-gray-900'
                : 'text-[#4a9e7f] hover:bg-[#c5e5d5]'
            }`}
          >
            <Icon size={20} />
          </Link>
        );
      })}

      <div className="mt-auto">
        <button
          title="Settings"
          className="flex items-center justify-center w-10 h-10 rounded-xl text-[#4a9e7f] hover:bg-[#c5e5d5] transition"
        >
          <Settings size={20} />
        </button>
      </div>
    </aside>
  );
}
