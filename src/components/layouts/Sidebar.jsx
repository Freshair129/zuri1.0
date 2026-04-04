'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const moduleNavs = {
  '/inbox': {
    title: 'Omni-Channel',
    subtitle: 'Unified Inbox',
    icon: 'forum',
    items: [
      { label: 'Conversations', href: '/inbox', icon: 'chat' },
    ],
  },
  '/crm': {
    title: 'Customer 360',
    subtitle: 'Relationship Suite',
    icon: 'person',
    items: [
      { label: 'Directory', href: '/crm', icon: 'groups' },
    ],
  },
  '/pos': {
    title: 'Point of Sale',
    subtitle: 'Storefront Ops',
    icon: 'point_of_sale',
    items: [
      { label: 'Terminal', href: '/pos', icon: 'shopping_cart' },
    ],
  },
  '/courses': {
    title: 'Academy',
    subtitle: 'Course Catalog',
    icon: 'school',
    items: [
      { label: 'All Courses', href: '/courses', icon: 'auto_stories' },
    ],
  },
  '/schedule': {
    title: 'Calendar',
    subtitle: 'Class Schedule',
    icon: 'calendar_month',
    items: [
      { label: 'Calendar View', href: '/schedule', icon: 'event' },
    ],
  },
  '/kitchen': {
    title: 'Kitchen Ops',
    subtitle: 'Operational Suite',
    icon: 'restaurant_menu',
    items: [
      { label: 'Overview', href: '/kitchen', icon: 'kitchen' },
      { label: 'Inventory', href: '/kitchen/stock', icon: 'inventory_2' },
      { label: 'Recipe Book', href: '/kitchen/recipes', icon: 'menu_book' },
      { label: 'Procurement', href: '/kitchen/procurement', icon: 'local_shipping' },
    ],
  },
  '/marketing': {
    title: 'Growth',
    subtitle: 'Marketing & Ads',
    icon: 'campaign',
    items: [
      { label: 'Dashboard', href: '/marketing', icon: 'analytics' },
      { label: 'Campaigns', href: '/marketing/campaigns', icon: 'ads_click' },
      { label: 'Daily Brief', href: '/marketing/daily-brief', icon: 'news' },
    ],
  },
  '/tasks': {
    title: 'Operations',
    subtitle: 'Task Board',
    icon: 'check_circle',
    items: [
      { label: 'All Tasks', href: '/tasks', icon: 'checklist' },
    ],
  },
  '/employees': {
    title: 'HR',
    subtitle: 'Team Directory',
    icon: 'badge',
    items: [
      { label: 'Staff List', href: '/employees', icon: 'groups' },
    ],
  },
  '/settings': {
    title: 'Administration',
    subtitle: 'System Settings',
    icon: 'settings',
    items: [
      { label: 'General', href: '/settings', icon: 'tune' },
      { label: 'Integrations', href: '/settings/integrations', icon: 'extension' },
      { label: 'Accounting', href: '/settings/accounting', icon: 'account_balance' },
      { label: 'AI Assistant', href: '/settings/ai-assistant', icon: 'smart_toy' },
      { label: 'Billing', href: '/settings/billing', icon: 'credit_card' },
      { label: 'Roles', href: '/settings/roles', icon: 'admin_panel_settings' },
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
