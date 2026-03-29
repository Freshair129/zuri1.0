'use client';

// Kitchen — Procurement page
// Manages the full Purchase Order (PO) lifecycle:
// Draft → Sent → Confirmed → Received → Closed / Cancelled

import { useState } from 'react';

const PO_STATUSES = ['All', 'Draft', 'Sent', 'Confirmed', 'Partially Received', 'Received', 'Cancelled'];

const STATUS_COLORS = {
  Draft: 'bg-gray-100 text-gray-600',
  Sent: 'bg-blue-100 text-blue-700',
  Confirmed: 'bg-purple-100 text-purple-700',
  'Partially Received': 'bg-yellow-100 text-yellow-700',
  Received: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-600',
};

const MOCK_STATUSES = Object.keys(STATUS_COLORS);

export default function ProcurementPage() {
  const [statusFilter, setStatusFilter] = useState('All');

  return (
    <div className="p-6 space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Procurement</h1>
          <p className="text-sm text-gray-500 mt-0.5">Purchase order lifecycle management</p>
        </div>
        <div className="flex gap-2">
          {/* TODO: Export PO report */}
          <div className="h-9 w-28 bg-white border border-gray-200 rounded-lg" />
          {/* TODO: New PO button → PO form (supplier, items, delivery date) */}
          <div className="h-9 w-36 bg-orange-500 rounded-lg" />
        </div>
      </div>

      {/* TODO: KPIs — Open POs, Total pending value, Overdue deliveries, This month spend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Open POs', bg: 'bg-blue-50' },
          { label: 'Pending Value', bg: 'bg-white' },
          { label: 'Overdue Deliveries', bg: 'bg-red-50' },
          { label: 'Spend This Month', bg: 'bg-white' },
        ].map(({ label, bg }) => (
          <div key={label} className={`${bg} rounded-xl border border-gray-100 p-4 shadow-sm`}>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <div className="h-7 w-16 bg-gray-100 rounded mt-2 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 h-10 bg-white border border-gray-200 rounded-lg flex items-center px-3 gap-2">
          <div className="h-4 w-4 bg-gray-300 rounded-sm flex-shrink-0" />
          <div className="h-4 w-36 bg-gray-100 rounded" />
        </div>
        {/* TODO: Supplier filter dropdown */}
        <div className="h-10 w-36 bg-white border border-gray-200 rounded-lg" />
        {/* TODO: Date range picker */}
        <div className="h-10 w-48 bg-white border border-gray-200 rounded-lg" />
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap">
        {PO_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              statusFilter === s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* PO lifecycle pipeline view (Kanban-style summary) */}
      {/* TODO: Optional — toggle between table view and kanban pipeline view */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {MOCK_STATUSES.map((status) => (
          <div key={status} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
            <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${STATUS_COLORS[status]}`}>
              {status}
            </div>
            <div className="h-7 w-8 bg-gray-100 rounded mx-auto" />
            <p className="text-xs text-gray-400 mt-1">POs</p>
          </div>
        ))}
      </div>

      {/* PO table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <div className="col-span-1">PO #</div>
          <div className="col-span-2">Supplier</div>
          <div className="col-span-2">Items</div>
          <div className="col-span-1">Total Value</div>
          <div className="col-span-2">Order Date</div>
          <div className="col-span-2">Expected Delivery</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1" />
        </div>

        {/* TODO: map over fetched purchase orders from /api/kitchen/procurement */}
        {Array.from({ length: 8 }).map((_, i) => {
          const statusIndex = i % MOCK_STATUSES.length;
          const status = MOCK_STATUSES[statusIndex];
          const isOverdue = i === 2;
          return (
            <div
              key={i}
              className={`grid grid-cols-12 gap-3 px-4 py-3.5 border-b border-gray-50 hover:bg-orange-50/20 transition-colors items-center ${
                isOverdue ? 'bg-red-50/20' : ''
              }`}
            >
              <div className="col-span-1">
                <div className="h-4 w-14 bg-gray-200 rounded font-mono text-xs" />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <div className="h-7 w-7 bg-gray-100 rounded-lg flex-shrink-0" />
                <div className="h-4 w-20 bg-gray-200 rounded" />
              </div>
              <div className="col-span-2">
                {/* TODO: item count + expandable item list */}
                <div className="h-4 w-24 bg-gray-100 rounded" />
              </div>
              <div className="col-span-1">
                <div className="h-4 w-16 bg-gray-100 rounded" />
              </div>
              <div className="col-span-2">
                <div className="h-4 w-20 bg-gray-100 rounded" />
              </div>
              <div className="col-span-2">
                <div className={`h-4 w-20 rounded ${isOverdue ? 'bg-red-200' : 'bg-gray-100'}`} />
                {isOverdue && <div className="h-3 w-14 bg-red-100 rounded mt-0.5" />}
              </div>
              <div className="col-span-1">
                <div className={`h-5 w-full rounded-full text-xs px-1 ${STATUS_COLORS[status]}`} />
              </div>
              <div className="col-span-1 flex justify-end gap-1">
                {/* TODO: View / Edit / Receive goods / Cancel actions */}
                <div className="h-6 w-6 bg-gray-100 rounded" />
                <div className="h-6 w-6 bg-gray-100 rounded" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 bg-gray-100 rounded" />
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-gray-100 rounded-lg" />
          <div className="h-8 w-20 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
