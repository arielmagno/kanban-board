'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LayoutGrid, CheckSquare, Users, Calendar, Settings, LogOut } from 'lucide-react';
import { useLogout } from '@/features/auth/hooks/use-auth';
import { SettingsPanel } from '@/components/settings-panel';

const NAV_ITEMS = [
  { icon: LayoutGrid, href: '/boards', label: 'Boards' },
  { icon: CheckSquare, href: '/tasks', label: 'Tasks' },
  { icon: Users, href: '/team', label: 'Team' },
  { icon: Calendar, href: '/calendar', label: 'Calendar' },
];

export function AppSidebar() {
  const pathname = usePathname();
  const logout = useLogout();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <aside className="hidden md:flex flex-col items-center w-16 min-h-screen bg-sidebar-bg py-4 gap-2 fixed left-0 top-0 z-40 transition-colors duration-[var(--bf-motion-duration)]">
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
              className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-[var(--bf-motion-duration)] ${
                active
                  ? 'bg-sidebar-active text-gray-900'
                  : 'text-[#4a9e7f] hover:bg-[#c5e5d5]'
              }`}
            >
              <Icon size={20} />
            </Link>
          );
        })}

        <div className="mt-auto flex flex-col gap-2">
          <button
            type="button"
            title="Settings"
            onClick={() => setSettingsOpen(true)}
            className="flex items-center justify-center w-10 h-10 rounded-xl text-[#4a9e7f] hover:bg-[#c5e5d5] transition duration-[var(--bf-motion-duration)]"
          >
            <Settings size={20} />
          </button>
          <button
            title="Log out"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="flex items-center justify-center w-10 h-10 rounded-xl text-[#4a9e7f] hover:bg-red-100 hover:text-red-500 transition disabled:opacity-50 duration-[var(--bf-motion-duration)]"
          >
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
