'use client';

// Kitchen — Overview page
// Dashboard for kitchen operations: active recipes in prep, stock alerts,
// today's mise en place schedule, and low-stock ingredient warnings.

export default function KitchenPage() {
  return (
    <div className="p-6 space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kitchen</h1>
          <p className="text-sm text-gray-500 mt-0.5">Overview of kitchen operations and inventory</p>
        </div>
        {/* TODO: Quick action — New procurement order */}
        <div className="flex gap-2">
          <a href="/kitchen/stock" className="h-9 px-4 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 flex items-center hover:bg-gray-50">
            View Stock
          </a>
          <div className="h-9 w-32 bg-orange-500 rounded-lg" />
        </div>
      </div>

      {/* TODO: KPI summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Recipes', icon: '🍳', bg: 'bg-orange-50' },
          { label: 'Stock Alerts', icon: '⚠️', bg: 'bg-red-50' },
          { label: 'Pending POs', icon: '📦', bg: 'bg-blue-50' },
          { label: 'Expiring Soon', icon: '⏳', bg: 'bg-yellow-50' },
        ].map(({ label, bg }) => (
          <div key={label} className={`${bg} rounded-xl border border-gray-100 p-4 shadow-sm`}>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <div className="h-7 w-12 bg-white/70 rounded mt-2 animate-pulse" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Today's Kitchen Schedule / Mise en Place */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Today&apos;s Schedule</h2>
            <a href="/schedule" className="text-xs text-orange-500 hover:underline">Full calendar</a>
          </div>
          {/* TODO: list of today's cooking sessions/classes and their recipe requirements */}
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                <div className="h-10 w-10 bg-orange-50 rounded-lg flex-shrink-0 flex items-center justify-center">
                  <div className="h-4 w-4 bg-orange-200 rounded" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-48 bg-gray-200 rounded" />
                  <div className="h-3 w-32 bg-gray-100 rounded" />
                </div>
                <div className="text-right space-y-1">
                  <div className="h-4 w-16 bg-gray-100 rounded" />
                  <div className="h-3 w-12 bg-gray-50 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Alerts sidebar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Stock Alerts</h2>
            <a href="/kitchen/stock" className="text-xs text-orange-500 hover:underline">Manage</a>
          </div>
          {/* TODO: ingredients below reorder level + expiring within 3 days (FEFO) */}
          <div className="space-y-2">
            {[
              { label: 'Low Stock', color: 'border-l-red-400', count: 5 },
              { label: 'Expiring Today', color: 'border-l-orange-400', count: 2 },
              { label: 'Expiring in 3 days', color: 'border-l-yellow-400', count: 7 },
            ].map(({ label, color, count }) => (
              <div key={label} className={`flex items-center justify-between p-3 rounded-lg bg-gray-50 border-l-4 ${color}`}>
                <span className="text-sm text-gray-600">{label}</span>
                <span className="text-sm font-bold text-gray-800">{count}</span>
              </div>
            ))}
          </div>

          {/* Low stock items list */}
          <div className="mt-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 bg-red-50 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-0.5">
                  <div className="h-3.5 w-24 bg-gray-200 rounded" />
                  <div className="h-2.5 w-16 bg-gray-100 rounded" />
                </div>
                {/* TODO: Quick order button */}
                <div className="h-6 w-12 bg-orange-100 rounded text-xs" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TODO: Quick links to sub-modules */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { href: '/kitchen/recipes', label: 'Recipes', desc: 'Manage recipe library' },
          { href: '/kitchen/stock', label: 'Stock', desc: 'Ingredient lots & FEFO' },
          { href: '/kitchen/procurement', label: 'Procurement', desc: 'Purchase orders' },
          { href: '/schedule', label: 'Schedule', desc: 'Class & session calendar' },
        ].map(({ href, label, desc }) => (
          <a
            key={href}
            href={href}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:border-orange-200 hover:shadow-md transition-all group"
          >
            <div className="h-8 w-8 bg-orange-50 rounded-lg mb-3 group-hover:bg-orange-100 transition-colors" />
            <p className="text-sm font-semibold text-gray-800">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
