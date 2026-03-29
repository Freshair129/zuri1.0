export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">
      {/* TODO: Sidebar component */}
      <aside className="w-20 flex-shrink-0 bg-gray-900" />
      <main className="flex-1 overflow-auto">
        {/* TODO: Topbar component */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
