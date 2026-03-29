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
    <div className="p-6 space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage contacts, leads, and alumni</p>
        </div>
        {/* TODO: Import CSV / Add contact button */}
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-gray-100 rounded-lg" />
          <div className="h-9 w-32 bg-orange-500 rounded-lg" />
        </div>
      </div>

      {/* TODO: KPI stat cards — Total contacts, New this month, Active students, Churn rate */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Total Contacts', 'New This Month', 'Active Students', 'Alumni'].map((label) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <div className="h-7 w-16 bg-gray-100 rounded mt-2 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* TODO: wire up real search input */}
        <div className="flex-1 h-10 bg-white border border-gray-200 rounded-lg flex items-center px-3 gap-2">
          <div className="h-4 w-4 bg-gray-300 rounded-full flex-shrink-0" />
          <div className="h-4 w-40 bg-gray-100 rounded" />
        </div>
        {/* TODO: advanced filter drawer (course, date enrolled, tags) */}
        <div className="h-10 w-24 bg-white border border-gray-200 rounded-lg" />
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap">
        {MOCK_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              activeFilter === f
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* TODO: Customer list table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
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
            className="grid grid-cols-12 gap-4 px-4 py-3.5 border-b border-gray-50 hover:bg-orange-50/40 transition-colors items-center"
          >
            <div className="col-span-4 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="space-y-1">
                <div className="h-3.5 w-28 bg-gray-200 rounded" />
                <div className="h-3 w-20 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="col-span-3"><div className="h-3.5 w-36 bg-gray-100 rounded" /></div>
            <div className="col-span-2"><div className="h-5 w-16 bg-green-100 rounded-full" /></div>
            <div className="col-span-2"><div className="h-3.5 w-24 bg-gray-100 rounded" /></div>
            <div className="col-span-1 flex justify-end">
              <div className="h-6 w-6 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* TODO: Pagination controls */}
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
