'use client';

// CRM — Customer list page
// Displays all contacts/students with search, filter, and sorting.
// Supports segmentation by status: Lead, Active, Alumni, Inactive.

import { useState } from 'react';

const MOCK_FILTERS = ['All', 'Lead', 'Active', 'Alumni', 'Inactive'];

export default function CRMPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');

  return (
    <div className="p-8 space-y-8 bg-surface min-h-[calc(100vh-64px)]">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-on-surface font-headline">Customers</h1>
          <p className="text-sm text-secondary font-body mt-1">Manage contacts, leads, and alumni</p>
        </div>
        {/* TODO: Import CSV / Add contact button */}
        <div className="flex gap-3">
          <button className="h-10 px-4 bg-surface-container-low text-secondary rounded-lg font-label text-xs uppercase font-bold tracking-widest border border-outline-variant/30 hover:bg-surface-container transition-all">Import CSV</button>
          <button className="h-10 px-6 gold-gradient rounded-lg font-label text-xs uppercase font-bold tracking-widest text-[#0B2D5E] shadow-sm hover:shadow-primary/30 transition-all">Add Contact</button>
        </div>
      </div>

      {/* TODO: KPI stat cards — Total contacts, New this month, Active students, Churn rate */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {['Total Contacts', 'New This Month', 'Active Students', 'Alumni'].map((label) => (
          <div key={label} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-6 shadow-sm hover:shadow-floating transition-shadow">
            <p className="text-xs text-secondary font-label uppercase tracking-widest font-bold mb-3">{label}</p>
            <div className="h-8 w-20 bg-outline-variant/20 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* TODO: wire up real search input */}
        <div className="flex-1 h-12 bg-surface-container-lowest border border-outline-variant/30 rounded-xl flex items-center px-4 gap-3 focus-within:border-primary transition-colors">
          <span className="material-symbols-outlined text-outline">search</span>
          <div className="h-4 w-40 bg-outline-variant/20 rounded" />
        </div>
        {/* TODO: advanced filter drawer */}
        <div className="h-12 px-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl flex items-center justify-center text-secondary font-label text-xs uppercase tracking-widest font-bold cursor-pointer hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined mr-2 text-[1rem]">tune</span> Filter
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap mb-4">
        {MOCK_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-full font-label text-xs uppercase tracking-widest font-bold transition-colors border ${
              activeFilter === f
                ? 'bg-primary/10 text-primary border-primary/30'
                : 'bg-surface-container-lowest text-secondary border-outline-variant/30 hover:bg-surface-container-low hover:border-outline-variant/50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* TODO: Customer list table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-outline-variant/15 bg-surface-container-low/50 font-label text-xs font-bold text-secondary uppercase tracking-widest">
          <div className="col-span-4">Name</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Enrolled Course</div>
          <div className="col-span-1" />
        </div>

        {/* TODO: map over fetched customers, render CRMRow component */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-surface hover:bg-surface-container-low transition-colors items-center group cursor-pointer"
          >
            <div className="col-span-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary/50 text-xs font-bold flex-shrink-0">US</div>
              <div className="space-y-1.5">
                <div className="h-4 w-32 bg-on-surface/10 rounded" />
                <div className="h-3 w-20 bg-secondary/20 rounded" />
              </div>
            </div>
            <div className="col-span-3"><div className="h-4 w-40 bg-on-surface/5 rounded" /></div>
            <div className="col-span-2"><div className="h-6 w-16 bg-primary/20 rounded-full" /></div>
            <div className="col-span-2"><div className="h-4 w-24 bg-on-surface/5 rounded" /></div>
            <div className="col-span-1 flex justify-end">
              <div className="h-8 w-8 rounded-lg group-hover:bg-surface-container-highest transition-colors flex items-center justify-center text-secondary"><span className="material-symbols-outlined text-[1rem]">chevron_right</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* TODO: Pagination controls */}
      <div className="flex items-center justify-between pt-4">
        <div className="h-4 w-32 bg-outline-variant/30 rounded" />
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-surface-container-low border border-outline-variant/30 rounded-lg" />
          <div className="h-10 w-24 bg-surface-container-low border border-outline-variant/30 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
