'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const moduleNavs = {
  '/kitchen': {
    title: 'Kitchen Ops',
    subtitle: 'Operational Suite',
    icon: 'restaurant_menu',
    items: [
      { label: 'Recipe Book', href: '/kitchen/recipes', icon: 'menu_book' },
      { label: 'Stock Alerts', href: '/kitchen/stock', icon: 'warning' },
      { label: 'Prep Lists', href: '/kitchen/prep', icon: 'checklist' },
      { label: 'Suppliers', href: '/kitchen/suppliers', icon: 'local_shipping' },
      { label: 'Analytics', href: '/kitchen/analytics', icon: 'analytics' },
    ],
  },
  '/crm': {
    title: 'Customer 360',
    subtitle: 'Relationship Suite',
    icon: 'person',
    items: [
      { label: 'Directory', href: '/crm', icon: 'groups' },
      { label: 'Segments', href: '/crm/segments', icon: 'data_thresholding' },
      { label: 'Lifecycle', href: '/crm/lifecycle', icon: 'rebase_edit' },
      { label: 'Insights', href: '/crm/insights', icon: 'psychology' },
    ],
  },
  // Defaults to Dashboard
  '/dashboard': {
    title: 'Zuri Central',
    subtitle: 'Business Overview',
    icon: 'dashboard',
    items: [
      { label: 'Overview', href: '/dashboard', icon: 'grid_view' },
      { label: 'Reports', href: '/dashboard/reports', icon: 'description' },
      { label: 'Activity', href: '/dashboard/activity', icon: 'history' },
    ],
  },
};

export default function Sidebar() {
  const pathname = usePathname();

  // Find the active module config
  const moduleKey = Object.keys(moduleNavs).find((key) => pathname?.startsWith(key)) || '/dashboard';
  const config = moduleNavs[moduleKey];

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 flex flex-col py-6 bg-white/80 dark:bg-[#181c1e]/80 backdrop-blur-xl shadow-[12px_0_40px_rgba(16,24,40,0.06)] z-40">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {config.icon}
            </span>
          </div>
          <div>
            <p className="font-prompt uppercase tracking-widest text-[10px] text-secondary">
              {config.title}
            </p>
            <h2 className="text-[10px] font-black text-secondary uppercase tracking-wider font-prompt">
              {config.subtitle}
            </h2>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {config.items.map(({ label, href, icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 group ${
                isActive
                  ? 'text-primary bg-surface-container-low border-r-4 border-primary font-bold'
                  : 'text-secondary hover:bg-surface-container-low hover:text-primary'
              }`}
            >
              <span className={`material-symbols-outlined transition-colors ${isActive ? 'text-primary' : 'group-hover:text-primary'}`}>
                {icon}
              </span>
              <span className="font-prompt uppercase tracking-widest text-[10px]">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 mt-auto pt-6 border-t border-outline-variant/15">
        <Link
          href="/help"
          className="flex items-center gap-3 px-4 py-3 text-secondary hover:bg-surface-container-low transition-all group"
        >
          <span className="material-symbols-outlined group-hover:text-primary">help</span>
          <span className="font-prompt uppercase tracking-widest text-[10px]">Help Center</span>
        </Link>
        <button
          className="w-full flex items-center gap-3 px-4 py-3 text-secondary hover:bg-surface-container-low transition-all group"
        >
          <span className="material-symbols-outlined group-hover:text-primary">logout</span>
          <span className="font-prompt uppercase tracking-widest text-[10px]">Logout</span>
        </button>
      </div>
    </aside>
  );
}
