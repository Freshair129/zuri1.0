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
    <div className="p-6 space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock</h1>
          <p className="text-sm text-gray-500 mt-0.5">Ingredient lots with FEFO tracking</p>
        </div>
        <div className="flex gap-2">
          {/* TODO: Adjust stock (manual entry) button */}
          <div className="h-9 w-28 bg-white border border-gray-200 rounded-lg" />
          {/* TODO: Receive goods button (links to procurement) */}
          <div className="h-9 w-32 bg-orange-500 rounded-lg" />
        </div>
      </div>

      {/* TODO: Stock summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total SKUs', bg: 'bg-white' },
          { label: 'Low Stock Items', bg: 'bg-red-50' },
          { label: 'Expiring in 3 Days', bg: 'bg-yellow-50' },
          { label: 'Expired (unresolved)', bg: 'bg-red-50' },
        ].map(({ label, bg }) => (
          <div key={label} className={`${bg} rounded-xl border border-gray-100 p-4 shadow-sm`}>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <div className="h-7 w-12 bg-gray-100/70 rounded mt-2 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 h-10 bg-white border border-gray-200 rounded-lg flex items-center px-3 gap-2">
          <div className="h-4 w-4 bg-gray-300 rounded-sm flex-shrink-0" />
          <div className="h-4 w-32 bg-gray-100 rounded" />
        </div>
        {/* Category filter */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-orange-400"
        >
          {CATEGORY_FILTERS.map((c) => <option key={c}>{c}</option>)}
        </select>
        {/* TODO: Supplier filter */}
        <div className="h-10 w-36 bg-white border border-gray-200 rounded-lg" />
      </div>

      {/* Expiry quick filters */}
      <div className="flex gap-2 flex-wrap">
        {EXPIRY_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setExpiryFilter(f)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              expiryFilter === f
                ? 'bg-orange-500 text-white'
                : f.toLowerCase().includes('expir') || f === 'Expired'
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Stock lots table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
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
              className={`grid grid-cols-12 gap-3 px-4 py-3 border-b border-gray-50 hover:bg-orange-50/20 transition-colors items-center ${
                isExpiring ? 'bg-red-50/30' : ''
              }`}
            >
              <div className="col-span-3 flex items-center gap-2">
                <div className="h-8 w-8 bg-gray-100 rounded-lg flex-shrink-0" />
                <div className="space-y-0.5">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-3 w-16 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="col-span-1"><div className="h-5 w-14 bg-gray-100 rounded-full" /></div>
              <div className="col-span-1"><div className="h-4 w-14 bg-gray-100 rounded font-mono" /></div>
              <div className="col-span-1"><div className="h-4 w-16 bg-gray-100 rounded" /></div>
              <div className="col-span-1"><div className="h-4 w-16 bg-gray-100 rounded" /></div>
              <div className="col-span-2">
                <div className={`h-4 w-20 rounded ${isExpiring ? 'bg-red-200' : 'bg-gray-100'}`} />
                {/* TODO: days-until-expiry badge */}
                {isExpiring && <div className="h-3 w-16 bg-red-100 rounded mt-0.5" />}
              </div>
              <div className="col-span-1">
                <div className={`h-4 w-12 rounded ${isLow ? 'bg-orange-200' : 'bg-gray-100'}`} />
              </div>
              <div className="col-span-1"><div className="h-4 w-8 bg-gray-100 rounded" /></div>
              <div className="col-span-1">
                <div className={`h-5 w-16 rounded-full ${
                  isExpiring ? 'bg-red-100' : isLow ? 'bg-orange-100' : 'bg-green-100'
                }`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* FEFO info callout */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <div className="h-5 w-5 bg-blue-200 rounded-full flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">FEFO Ordering Active</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Ingredients are sorted by expiry date (earliest first) to minimize waste.
            {/* TODO: link to FEFO settings */}
          </p>
        </div>
      </div>
    </div>
  );
}
