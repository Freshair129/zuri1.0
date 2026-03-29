'use client';

// Employees — Employee list page
// Manage all school staff: instructors, admin, kitchen crew, and operations.
// Supports search, department filter, and role-based views.

import { useState } from 'react';

const DEPARTMENT_FILTERS = ['All', 'Instructors', 'Kitchen', 'Administration', 'Operations', 'Sales & Marketing'];
const STATUS_FILTERS = ['All', 'Active', 'On Leave', 'Terminated'];

export default function EmployeesPage() {
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');
  const [view, setView] = useState('Grid');

  return (
    <div className="p-6 space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage staff across all departments</p>
        </div>
        <div className="flex gap-2">
          {/* TODO: Invite employee button */}
          <div className="h-9 w-28 bg-white border border-gray-200 rounded-lg" />
          {/* TODO: Add employee button */}
          <div className="h-9 w-32 bg-orange-500 rounded-lg" />
        </div>
      </div>

      {/* TODO: Headcount KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {['Total Staff', 'Instructors', 'On Leave', 'New This Month'].map((label) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <div className="h-7 w-12 bg-gray-100 rounded mt-2 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Search + filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex-1 w-full h-10 bg-white border border-gray-200 rounded-lg flex items-center px-3 gap-2">
          <div className="h-4 w-4 bg-gray-300 rounded-sm flex-shrink-0" />
          <div className="h-4 w-36 bg-gray-100 rounded" />
        </div>
        {/* TODO: role filter */}
        <div className="h-10 w-32 bg-white border border-gray-200 rounded-lg" />
        {/* View toggle */}
        <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
          {['Grid', 'List'].map((m) => (
            <button
              key={m}
              onClick={() => setView(m)}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                view === m ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Department filter pills */}
      <div className="flex gap-2 flex-wrap">
        {DEPARTMENT_FILTERS.map((d) => (
          <button
            key={d}
            onClick={() => setDepartment(d)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              department === d ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Status sub-filter */}
      <div className="flex gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              status === s
                ? 'border-orange-400 bg-orange-50 text-orange-700'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Employee grid */}
      {/* TODO: map over employees fetched from /api/employees */}
      {view === 'Grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <a
              key={i}
              href={`/employees/${i + 1}`}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center hover:shadow-md hover:border-orange-200 transition-all"
            >
              {/* Avatar */}
              <div className="h-16 w-16 rounded-full bg-orange-100 mb-3" />
              {/* Name */}
              <div className="h-4 w-28 bg-gray-200 rounded mb-1" />
              {/* Role */}
              <div className="h-3.5 w-20 bg-gray-100 rounded mb-3" />
              {/* Department badge */}
              <div className="h-5 w-24 bg-orange-50 rounded-full mb-3" />
              {/* Status + actions */}
              <div className="flex items-center gap-2">
                <div className="h-5 w-14 bg-green-100 rounded-full" />
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <div className="col-span-4">Employee</div>
            <div className="col-span-2">Department</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Start Date</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1" />
          </div>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-3 px-4 py-3.5 border-b border-gray-50 hover:bg-orange-50/20 items-center">
              <div className="col-span-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-orange-100 flex-shrink-0" />
                <div className="space-y-0.5">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="col-span-2"><div className="h-5 w-20 bg-orange-50 rounded-full" /></div>
              <div className="col-span-2"><div className="h-4 w-24 bg-gray-100 rounded" /></div>
              <div className="col-span-2"><div className="h-4 w-20 bg-gray-100 rounded" /></div>
              <div className="col-span-1"><div className="h-5 w-14 bg-green-100 rounded-full" /></div>
              <div className="col-span-1 flex justify-end">
                <div className="h-6 w-6 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
