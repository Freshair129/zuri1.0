'use client';

// Kitchen — Procurement page
// Manages the full Purchase Order (PO) lifecycle:
// Draft → Sent → Confirmed → Received → Closed / Cancelled

import { useState } from 'react';

const PO_STATUSES = ['All', 'Draft', 'Sent', 'Confirmed', 'Partially Received', 'Received', 'Cancelled'];

const STATUS_COLORS = {
  Draft: 'bg-surface-container-highest text-secondary border border-outline-variant/30',
  Sent: 'bg-[#0B2D5E]/10 text-[#0B2D5E] border border-[#0B2D5E]/20',
  Confirmed: 'bg-primary/10 text-primary border border-primary/20',
  'Partially Received': 'bg-primary/20 text-primary border border-primary/30',
  Received: 'bg-green-500/10 text-green-700 border border-green-500/20',
  Cancelled: 'bg-error/10 text-error border border-error/20',
};

const MOCK_STATUSES = Object.keys(STATUS_COLORS);

export default function ProcurementPage() {
  const [statusFilter, setStatusFilter] = useState('All');

  return (
    <div className="p-8 space-y-8 bg-surface min-h-[calc(100vh-64px)]">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="ornate-lead">
          <span className="font-label uppercase tracking-[0.2em] text-xs text-primary font-bold">Kitchen Intelligence</span>
          <h1 className="text-3xl font-extrabold text-on-surface font-headline mt-1">Procurement</h1>
          <p className="text-sm text-secondary font-body mt-0.5">Purchase order lifecycle management</p>
        </div>
        <div className="flex gap-3">
          {/* Export PO report */}
          <button className="h-10 px-4 bg-surface-container-lowest text-secondary rounded-lg font-label text-xs uppercase font-bold tracking-widest border border-outline-variant/30 hover:bg-surface-container-low transition-all">
            Export Report
          </button>
          {/* New PO button */}
          <button className="h-10 px-6 gold-gradient rounded-lg font-label text-xs uppercase font-bold tracking-widest text-[#0B2D5E] shadow-sm hover:shadow-primary/30 transition-all">
            New Purchase Order
          </button>
        </div>
      </div>

      {/* KPIs — Open POs, Total pending value, Overdue deliveries, This month spend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {[
          { label: 'Open POs', bg: 'bg-[#0B2D5E]/5', border: 'border-[#0B2D5E]/10', text: 'text-[#0B2D5E]' },
          { label: 'Pending Value', bg: 'bg-surface-container-lowest', border: 'border-outline-variant/15', text: 'text-primary' },
          { label: 'Overdue Deliveries', bg: 'bg-error/5', border: 'border-error/20', text: 'text-error' },
          { label: 'Spend This Month', bg: 'bg-surface-container-lowest', border: 'border-outline-variant/15', text: 'text-primary' },
        ].map(({ label, bg, border, text }) => (
          <div key={label} className={`${bg} rounded-2xl border ${border} p-6 shadow-sm hover:shadow-floating transition-shadow`}>
            <p className="text-[10px] text-secondary font-label uppercase tracking-widest font-bold mb-3">{label}</p>
            <div className={`h-8 w-20 bg-surface-container-low rounded animate-pulse`} />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 h-12 bg-surface-container-lowest border border-outline-variant/30 rounded-xl flex items-center px-4 gap-3 focus-within:border-primary transition-colors">
          <span className="material-symbols-outlined text-outline">search</span>
          <div className="h-4 w-36 bg-outline-variant/20 rounded" />
        </div>
        {/* Supplier filter dropdown */}
        <div className="h-12 px-4 w-36 bg-surface-container-lowest border border-outline-variant/30 rounded-xl flex items-center justify-center text-secondary font-label text-xs uppercase tracking-widest font-bold cursor-pointer hover:bg-surface-container-low transition-colors">
          Supplier
        </div>
        {/* Date range picker */}
        <div className="h-12 px-4 w-48 bg-surface-container-lowest border border-outline-variant/30 rounded-xl flex items-center justify-center text-secondary font-label text-xs uppercase tracking-widest font-bold cursor-pointer hover:bg-surface-container-low transition-colors">
          Date Range
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap pb-2">
        {PO_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-full text-[10px] font-label uppercase font-bold tracking-widest transition-colors border ${
              statusFilter === s ? 'gold-gradient text-[#0B2D5E] border-primary shadow-sm' : 'bg-surface-container-lowest text-secondary border-outline-variant/30 hover:bg-surface-container-low'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* PO lifecycle pipeline view (Kanban-style summary) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {MOCK_STATUSES.map((status) => (
          <div key={status} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm p-4 text-center hover:border-primary/50 transition-colors cursor-pointer group">
            <div className={`inline-block px-3 py-1 rounded-full text-[9px] font-label uppercase tracking-[0.2em] font-bold mb-3 ${STATUS_COLORS[status]}`}>
              {status}
            </div>
            <div className="h-6 w-12 bg-on-surface/5 rounded mx-auto group-hover:bg-primary/10 transition-colors" />
            <p className="text-[10px] text-secondary font-label uppercase tracking-widest mt-2 font-bold opacity-50">POs</p>
          </div>
        ))}
      </div>

      {/* PO table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-6 py-4 border-b border-outline-variant/15 bg-surface-container-low/50 font-label text-[10px] font-bold text-secondary uppercase tracking-widest">
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
              className={`grid grid-cols-12 gap-3 px-6 py-4 border-b border-surface transition-colors items-center group cursor-pointer ${
                isOverdue ? 'bg-error/5 hover:bg-error/10' : 'hover:bg-surface-container-low'
              }`}
            >
              <div className="col-span-1">
                <div className="h-4 w-14 bg-secondary/10 rounded font-mono text-xs text-on-surface/60 flex items-center justify-center font-bold" />
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <div className="h-10 w-10 bg-on-surface/5 rounded-lg flex items-center justify-center text-secondary group-hover:text-primary transition-colors flex-shrink-0">
                  <span className="material-symbols-outlined text-[1.2rem]">local_shipping</span>
                </div>
                <div className="h-4 w-20 bg-on-surface/10 rounded" />
              </div>
              <div className="col-span-2">
                <div className="h-4 w-24 bg-on-surface/5 rounded" />
              </div>
              <div className="col-span-1">
                <div className="h-4 w-16 bg-primary/10 rounded text-primary text-xs font-bold flex items-center px-2" />
              </div>
              <div className="col-span-2">
                <div className="h-4 w-20 bg-on-surface/5 rounded" />
              </div>
              <div className="col-span-2">
                <div className={`h-4 w-20 rounded ${isOverdue ? 'bg-error/30' : 'bg-on-surface/5'}`} />
                {isOverdue && <div className="h-3 w-14 bg-error/20 rounded mt-1.5" />}
              </div>
              <div className="col-span-1">
                <div className={`text-[9px] font-label uppercase tracking-wider py-1 px-2 rounded-full font-bold flex items-center justify-center ${STATUS_COLORS[status]}`}>
                  {status}
                </div>
              </div>
              <div className="col-span-1 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="h-8 w-8 bg-surface-container-highest rounded-lg flex items-center justify-center text-secondary hover:bg-primary/20 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[1rem]">edit</span></div>
                <div className="h-8 w-8 bg-surface-container-highest rounded-lg flex items-center justify-center text-secondary hover:bg-primary/20 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[1rem]">more_horiz</span></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
        <div className="h-4 w-32 bg-outline-variant/30 rounded" />
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-surface-container-lowest border border-outline-variant/30 rounded-lg" />
          <div className="h-10 w-24 bg-surface-container-lowest border border-outline-variant/30 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
