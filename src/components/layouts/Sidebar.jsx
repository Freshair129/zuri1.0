'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTenant } from '@/context/TenantContext';
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
  const { tenant, loading } = useTenant();

  const brandColor = tenant?.config?.brandColor || '#4f46e5'; // Default indigo-600
  const logoUrl = tenant?.config?.logoUrl;

  return (
    <aside className="flex flex-col w-20 h-screen bg-gray-900 border-r border-gray-800 shrink-0">
      {/* Logo Section (Dynamic Branding) */}
      <div className="flex items-center justify-center h-16 border-b border-gray-800">
        {loading ? (
          <div className="h-8 w-8 rounded-lg bg-gray-800 animate-pulse" />
        ) : logoUrl ? (
          <img src={logoUrl} alt={tenant?.name} className="h-8 w-8 object-contain" />
        ) : (
          <div 
            className="flex items-center justify-center h-10 w-10 rounded-xl text-white font-black text-xl shadow-lg"
            style={{ backgroundColor: brandColor }}
          >
            {tenant?.name?.[0]?.toUpperCase() ?? 'Z'}
          </div>
        )}
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
              style={isActive ? { backgroundColor: brandColor } : {}}
              className={`
                flex flex-col items-center justify-center w-14 h-14 rounded-xl gap-1
                transition-all text-xs font-medium duration-200
                ${isActive
                  ? 'text-white shadow-md scale-105'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
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
