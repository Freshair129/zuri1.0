'use client';

// Kitchen — Stock / Ingredient lots page
// Manages ingredient inventory using FEFO (First Expired, First Out) logic.
// Shows lot-level tracking: supplier, received date, expiry date, quantity remaining.

import { useState } from 'react';

const EXPIRY_FILTERS = ['All', 'Expiring Today', 'Expiring in 3 Days', 'Expiring This Week', 'Expired'];
const CATEGORY_FILTERS = ['All', 'Produce', 'Proteins', 'Dairy', 'Dry Goods', 'Spices', 'Beverages'];

export default function StockPage() {
  const [expiryFilter, setExpiryFilter] = useState('All');
  const [category, setCategory] = useState('All');

  return (
    <div className="p-8 space-y-8 bg-surface min-h-[calc(100vh-64px)]">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="ornate-lead">
          <span className="font-label uppercase tracking-[0.2em] text-xs text-primary font-bold">Kitchen Intelligence</span>
          <h1 className="text-3xl font-extrabold text-on-surface font-headline mt-1">Stock Management</h1>
          <p className="text-sm text-secondary font-body mt-0.5">Ingredient lots with FEFO tracking</p>
        </div>
        <div className="flex gap-3">
          {/* Adjust stock (manual entry) button */}
          <button className="h-10 px-4 bg-surface-container-lowest text-secondary rounded-lg font-label text-xs uppercase font-bold tracking-widest border border-outline-variant/30 hover:bg-surface-container-low transition-all">
            Adjust Stock
          </button>
          {/* Receive goods button (links to procurement) */}
          <button className="h-10 px-6 gold-gradient rounded-lg font-label text-xs uppercase font-bold tracking-widest text-[#0B2D5E] shadow-sm hover:shadow-primary/30 transition-all">
            Receive Goods
          </button>
        </div>
      </div>

      {/* Stock summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {[
          { label: 'Total SKUs', bg: 'bg-surface-container-lowest', border: 'border-outline-variant/15', text: 'text-primary' },
          { label: 'Low Stock Items', bg: 'bg-error/5', border: 'border-error/20', text: 'text-error' },
          { label: 'Expiring in 3 Days', bg: 'bg-primary/5', border: 'border-primary/20', text: 'text-primary' },
          { label: 'Expired (unresolved)', bg: 'bg-error/5', border: 'border-error/20', text: 'text-error' },
        ].map(({ label, bg, border, text }) => (
          <div key={label} className={`${bg} rounded-2xl border ${border} p-6 shadow-sm hover:shadow-floating transition-shadow`}>
            <p className="text-[10px] text-secondary font-label uppercase tracking-widest font-bold mb-3">{label}</p>
            <div className={`h-8 w-16 bg-surface-container-low rounded animate-pulse`} />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 h-12 bg-surface-container-lowest border border-outline-variant/30 rounded-xl flex items-center px-4 gap-3 focus-within:border-primary transition-colors">
          <span className="material-symbols-outlined text-outline">search</span>
          <div className="h-4 w-40 bg-outline-variant/20 rounded" />
        </div>
        {/* Category filter */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-12 px-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl font-label text-xs uppercase tracking-widest font-bold text-secondary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer hover:bg-surface-container-low transition-colors"
        >
          {CATEGORY_FILTERS.map((c) => <option key={c}>{c}</option>)}
        </select>
        {/* Supplier filter */}
        <div className="h-12 px-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl flex items-center justify-center text-secondary font-label text-xs uppercase tracking-widest font-bold cursor-pointer hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined mr-2 text-[1rem]">tune</span> Filter
        </div>
      </div>

      {/* Expiry quick filters */}
      <div className="flex gap-2 flex-wrap pb-2">
        {EXPIRY_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setExpiryFilter(f)}
            className={`px-4 py-2 rounded-full text-[10px] font-label uppercase tracking-widest font-bold transition-colors border ${
              expiryFilter === f
                ? 'gold-gradient text-[#0B2D5E] border-primary shadow-sm'
                : f.toLowerCase().includes('expir') || f === 'Expired'
                ? 'bg-error/5 text-error border-error/20 hover:bg-error/10'
                : 'bg-surface-container-lowest text-secondary border-outline-variant/30 hover:bg-surface-container-low'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Stock lots table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-3 px-6 py-4 border-b border-outline-variant/15 bg-surface-container-low/50 font-label text-[10px] font-bold text-secondary uppercase tracking-widest">
          <div className="col-span-3">Ingredient</div>
          <div className="col-span-1">Category</div>
          <div className="col-span-1">Lot #</div>
          <div className="col-span-1">Supplier</div>
          <div className="col-span-1">Received</div>
          <div className="col-span-2">Expiry Date</div>
          <div className="col-span-1">Qty Remaining</div>
          <div className="col-span-1">Unit</div>
          <div className="col-span-1">Status</div>
        </div>

        {/* TODO: map over ingredient lots from /api/kitchen/stock, sort by expiry ASC (FEFO) */}
        {Array.from({ length: 12 }).map((_, i) => {
          const isExpiring = i < 2;
          const isLow = i === 3 || i === 7;
          return (
            <div
              key={i}
              className={`grid grid-cols-12 gap-3 px-6 py-4 border-b border-surface transition-colors items-center group cursor-pointer ${
                isExpiring ? 'bg-error/5 hover:bg-error/10' : 'hover:bg-surface-container-low'
              }`}
            >
              <div className="col-span-3 flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 text-primary/50 group-hover:bg-primary/20 transition-colors"><span className="material-symbols-outlined text-[1.2rem]">inventory_2</span></div>
                <div className="space-y-1.5">
                  <div className="h-4 w-28 bg-on-surface/10 rounded" />
                  <div className="h-3 w-16 bg-secondary/20 rounded" />
                </div>
              </div>
              <div className="col-span-1"><div className="h-5 w-16 bg-on-surface/5 rounded-full" /></div>
              <div className="col-span-1"><div className="h-4 w-14 bg-secondary/10 rounded font-mono" /></div>
              <div className="col-span-1"><div className="h-4 w-16 bg-on-surface/5 rounded" /></div>
              <div className="col-span-1"><div className="h-4 w-16 bg-on-surface/5 rounded" /></div>
              <div className="col-span-2">
                <div className={`h-4 w-20 rounded ${isExpiring ? 'bg-error/30' : 'bg-on-surface/5'}`} />
                {isExpiring && <div className="h-3 w-16 bg-error/20 rounded mt-1.5" />}
              </div>
              <div className="col-span-1">
                <div className={`h-4 w-12 rounded ${isLow ? 'bg-primary/30' : 'bg-on-surface/5'}`} />
              </div>
              <div className="col-span-1"><div className="h-4 w-8 bg-on-surface/5 rounded" /></div>
              <div className="col-span-1">
                <div className={`h-6 w-16 rounded-full flex items-center justify-center ${
                  isExpiring ? 'bg-error text-white shadow-[0_2px_8px_rgba(186,26,26,0.3)]' : isLow ? 'bg-primary/10 text-primary' : 'bg-green-500/10 text-green-700'
                }`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* FEFO info callout */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex items-start gap-4">
        <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 text-primary mt-0.5">
          <span className="material-symbols-outlined text-[1.2rem]">info</span>
        </div>
        <div>
          <p className="font-label text-xs uppercase tracking-widest font-bold text-primary mb-1">FEFO Ordering Active</p>
          <p className="text-sm text-secondary font-body thai-line-height">
            Ingredients are sorted by expiry date (earliest first) to minimize waste. 
            Strictly follow this order for food preparation.
          </p>
        </div>
      </div>
    </div>
  );
}
