'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'Inbox', href: '/inbox' },
  { label: 'CRM', href: '/crm' },
  { label: 'POS', href: '/pos' },
  { label: 'Courses', href: '/courses' },
  { label: 'Schedule', href: '/schedule' },
  { label: 'Kitchen', href: '/kitchen' },
  { label: 'Growth', href: '/marketing' },
];

export default function Topbar({ user = null }) {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 z-50 flex justify-between items-center w-full px-8 h-16 glass-nav font-headline text-sm tracking-tight">
      <div className="flex items-center gap-8 h-full">
        <span className="text-xl font-bold text-on-surface tracking-tighter">Z U R I</span>
        <div className="hidden md:flex gap-6 items-end h-full">
          {navLinks.map(({ label, href }) => {
            const isActive = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`pb-2 transition-all duration-200 ${
                  isActive
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-secondary font-medium hover:text-primary'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-secondary hover:bg-surface-container-low rounded-full transition-all active:scale-95 group">
          <span className="material-symbols-outlined group-hover:text-primary transition-colors">notifications</span>
        </button>
        <button className="p-2 text-secondary hover:bg-surface-container-low rounded-full transition-all active:scale-95 group">
          <span className="material-symbols-outlined group-hover:text-primary transition-colors">settings</span>
        </button>
        <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant/20">
          {user?.image ? (
            <img alt="User profile" src={user.image} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary-fixed text-on-primary-fixed text-xs font-bold uppercase">
              {user?.name?.[0] ?? 'U'}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
