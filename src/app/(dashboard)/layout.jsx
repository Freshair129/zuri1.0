import Sidebar from '@/components/layouts/Sidebar';
import Topbar from '@/components/layouts/Topbar';
import { TenantProvider } from '@/context/TenantContext';

export default function DashboardLayout({ children }) {
  // Mock user for Topbar - will be replaced by NextAuth session in Phase 1 polish
  const user = { name: 'Staff User', role: 'Sales' };

  return (
    <TenantProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Core Sidebar (Dynamic Branding) */}
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Core Topbar (Dynamic Title) */}
          <Topbar user={user} />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto custom-scrollbar">
            {children}
          </main>
        </div>
      </div>
    </TenantProvider>
  );
}
