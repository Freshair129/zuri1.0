import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardShell({ children, title, user }) {
  return (
    <div className="min-h-screen bg-surface font-body selection:bg-primary-fixed selection:text-on-primary-fixed">
      <Topbar title={title} user={user} />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 ml-64 p-12 overflow-y-auto min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
