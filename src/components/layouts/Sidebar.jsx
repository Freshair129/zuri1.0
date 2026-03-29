'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Megaphone,
  ShoppingCart,
  ChefHat,
  CalendarDays,
  Settings,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Inbox', href: '/inbox', icon: MessageSquare },
  { label: 'CRM', href: '/crm', icon: Users },
  { label: 'Marketing', href: '/marketing', icon: Megaphone },
  { label: 'POS', href: '/pos', icon: ShoppingCart },
  { label: 'Kitchen', href: '/kitchen', icon: ChefHat },
  { label: 'Schedule', href: '/schedule', icon: CalendarDays },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-20 h-screen bg-gray-900 border-r border-gray-800 shrink-0">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-gray-800">
        <span className="text-2xl font-black text-indigo-400">Z</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col items-center gap-1 py-4">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`
                flex flex-col items-center justify-center w-14 h-14 rounded-xl gap-1
                transition-colors text-xs font-medium
                ${isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <Icon className="h-5 w-5" />
              <span className="hidden">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings at bottom */}
      <div className="flex items-center justify-center h-16 border-t border-gray-800">
        <Link
          href="/settings"
          title="Settings"
          className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </div>
    </aside>
  );
}
