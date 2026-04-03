'use client'

import { useState } from 'react'

const stockLevels = [
  { name: 'Organic Jasmine Rice',   level: 12, color: 'bg-error' },
  { name: 'Coconut Cream (Premium)', level: 84, color: 'bg-primary' },
  { name: "Bird's Eye Chili",        level: 45, color: 'bg-secondary' },
  { name: 'Galangal Root',           level: 8,  color: 'bg-error' },
]

const recipes = [
  {
    id: 1,
    name: 'Gaeng Keow Wan Gai',
    category: 'Signature',
    difficulty: 'Spicy',
    badge: 'Signature',
    updatedAt: '1h ago',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCw0Z9ldiyx_HhK4vx9_w_oMvyWTHkNXEUU8-nL7i0nNIgsHD80tEWNPa3J0ivwQhAQcCzFoyIJUDGpbf2JCJz9N8ohRi9GL8rpTS8--ZLS6dZ5i4VvI96xB3-bU8FnFlRh_g3ByBx91KF-hq06f98k3cGPVrKtGEX8ivansSOpzBgT-YVhbpekxB_OIf-_Ql6ACMLrOOtNG6aOXHhL0-2q4CBjDNDoHxZFqpjNWWDlv_PY4we-JIfQWntwogKqR33GxFGed6_E3rM',
  },
  {
    id: 2,
    name: 'Tom Yum Goong',
    category: 'Soup',
    difficulty: 'Med Spice',
    updatedAt: '2h ago',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCowEJX8uXXehyzl-ZiRgQYFa4PafiMvAONGbyMkEbq-PVch2qKCtf6-8L56d-TmkN9UFsiRWmHhE4MUgwcMwatRNherM8Kvdjf8L9reCBpOL2_cPI-Q0pBwXazZkmyYpuEWGFUgMmimV7HJH9pxn0Vumu6Y25F0iUHz0B1AfOH4n2X4l9Lel2JnBLtNujb4ddBFJFNt5lOm9bjEfYyYp9-yJpBsZbVANO_jTYQMh5dhYY-isgsTmvR4IG7Lj1TVXqikRxSwRy4qgw',
  },
  {
    id: 3,
    name: 'Authentic Pad Thai',
    category: 'Stir-fry',
    difficulty: 'Mild',
    updatedAt: '1d ago',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqw2KOLgjUYqZ1E0VAObdy1BlogSIXpxvA5JXSmXj_mts1088Wdx3gFOqDDt7zMTlw5okAw5JOUa2nUiu6rnRHAdezLdlgJRWXpB6CdGPivdQq14ZxPIqjD4Y_Ec2tmrvPPKQQCp8839XpLHg_Ucfi8v-YAPUIx6b12nA13bW9oWiAOBv4MhoIghm32TM-wLVW4O-MfBRGZ1zpWiNpViq91dSgFHXcM3gBI7iVEDj1eR1cwonJVESaeof4mjyY_h_N27vX4tlZf1U',
  },
  {
    id: 4,
    name: 'Beef Massaman',
    category: 'Slow-Cook',
    difficulty: 'Mild',
    updatedAt: '5h ago',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIP1NzsUBbKV-hjtqN7aqzheZMqp_XjmdzHPr1VHmh922_-gKbTJBB4vWPY6sc2eUPUk4TfWVFSfThW80IcCX0eInVD4kRDvzY_h5exYEPQFX5ZZUJN8GsMmzLHaIjSLtAvhPWbsPOcI6-XjxxoquXrAYQRHPtxbTYmoI7sVkCdQ7nwOGgecfn1hIa0GVJKMq4KwI0ATB6VSothb5T2Kwy4bwWTM1loNJD3OsllJAitRH5ggUodLHZJ-O-7-wvgz4sKWDSouT1Qz4',
  },
]

const barHeights = [60, 80, 45, 95, 55, 85, 70]

export default function KitchenPage() {
  const [activeFilter, setActiveFilter] = useState('All Recipes')
  const filters = ['All Recipes', 'Signatures', 'Soups', 'Curries']

  return (
    <div className="px-12 py-8 pb-12">
      {/* Page header */}
      <header className="mb-10 ornate-lead">
        <span className="font-label uppercase tracking-[0.2em] text-xs text-primary font-bold">
          Kitchen Intelligence
        </span>
        <h1 className="text-5xl font-extrabold tracking-tight text-on-surface mt-2 mb-4 font-headline">
          Kitchen Command Center
        </h1>
        <p className="text-secondary max-w-2xl thai-line-height text-lg">
          Manage your culinary heritage with precision. Real-time stock monitoring paired with
          high-end recipe documentation for the Royal Ayutthaya kitchens.
        </p>
      </header>

      {/* Top stats row */}
      <div className="grid grid-cols-12 gap-8 mb-12">
        {/* Live Stock Inventory */}
        <div className="col-span-12 xl:col-span-6">
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10 h-full">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h4 className="font-label font-bold uppercase tracking-widest text-xs text-primary mb-1">
                  Live Stock Inventory
                </h4>
                <p className="text-xs text-secondary">Critical item levels monitoring</p>
              </div>
              <span
                className="material-symbols-outlined text-primary text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                inventory
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {stockLevels.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span>{item.name}</span>
                    <span className={`${item.level < 20 ? 'text-error' : 'text-primary'} font-bold`}>
                      {item.level}% LEFT
                    </span>
                  </div>
                  <div className="h-2 w-full bg-surface-container-low rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${item.level}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-surface-container-low flex justify-end">
              <button className="border-2 border-primary/20 px-6 py-2.5 rounded-md font-label font-bold text-primary text-[10px] uppercase tracking-widest hover:bg-primary/5 transition-colors">
                Generate Reorder List
              </button>
            </div>
          </div>
        </div>

        {/* Kitchen Prep Efficiency */}
        <div className="col-span-12 xl:col-span-6">
          <div className="bg-surface-container-low/50 backdrop-blur-md p-8 rounded-xl border border-outline-variant/10 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="font-label font-bold uppercase tracking-widest text-xs text-primary mb-1">
                  Kitchen Prep Efficiency
                </h4>
                <p className="text-xs text-secondary">Operational throughput analytics</p>
              </div>
              <span className="material-symbols-outlined text-primary text-3xl">speed</span>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center flex-1">
              <div className="flex-1">
                <p className="text-secondary thai-line-height text-sm mb-6">
                  Weekly analysis showing a 15% increase in prep speed following the new workstation layout.
                </p>
                <div className="flex gap-8">
                  <div>
                    <p className="text-2xl font-black text-primary">94%</p>
                    <p className="text-[9px] font-label uppercase tracking-widest text-secondary mt-1">Accuracy Rate</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-on-secondary-container">22m</p>
                    <p className="text-[9px] font-label uppercase tracking-widest text-secondary mt-1">Avg Ticket Time</p>
                  </div>
                </div>
              </div>

              {/* Mini bar chart */}
              <div className="w-full md:w-56 h-32 bg-surface-container-lowest rounded-lg border border-outline-variant/15 flex items-end justify-between p-3 gap-1.5">
                {barHeights.map((h, i) => (
                  <div
                    key={i}
                    className="w-full rounded-t transition-all hover:bg-primary"
                    style={{
                      height: `${h}%`,
                      backgroundColor: `rgba(121,89,0,${0.2 + (i / barHeights.length) * 0.8})`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recipe Repository */}
      <section>
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
          <div className="w-full md:w-auto">
            <h3 className="text-2xl font-bold mb-2 font-headline">Recipe Repository</h3>
            <div className="flex gap-2 flex-wrap">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-label uppercase tracking-widest transition-colors ${
                    activeFilter === f
                      ? 'bg-primary text-white'
                      : 'bg-surface-container-high text-secondary hover:bg-surface-container-highest'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-xl">search</span>
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              placeholder="Search culinary archives..."
              type="text"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-surface-container-lowest rounded-xl overflow-hidden group border border-outline-variant/10 hover:shadow-md transition-shadow"
            >
              <div className="h-40 overflow-hidden relative">
                <img
                  alt={recipe.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  src={recipe.image}
                />
                {recipe.badge && (
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 bg-primary text-[8px] text-white font-label uppercase tracking-widest rounded-sm shadow-sm">
                      {recipe.badge}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h5 className="font-bold text-md mb-1 line-clamp-1">{recipe.name}</h5>
                <p className="text-[10px] text-secondary font-label uppercase tracking-widest mb-3">
                  {recipe.category} &bull; {recipe.difficulty}
                </p>
                <div className="flex justify-between items-center pt-3 border-t border-surface-container-low">
                  <span className="text-[9px] text-secondary">Updated {recipe.updatedAt}</span>
                  <span className="material-symbols-outlined text-secondary text-sm cursor-pointer hover:text-primary transition-colors">
                    open_in_new
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAB */}
      <button className="fixed bottom-10 right-10 w-16 h-16 royal-gradient rounded-full shadow-2xl flex items-center justify-center text-white active:scale-90 transition-all z-50">
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  )
}
