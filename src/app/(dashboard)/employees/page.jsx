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
    <div className="p-8 space-y-8 bg-surface min-h-[calc(100vh-64px)]">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="ornate-lead">
          <span className="font-label uppercase tracking-[0.2em] text-xs text-primary font-bold">Workforce Management</span>
          <h1 className="text-3xl font-extrabold text-on-surface font-headline mt-1">Employees</h1>
          <p className="text-sm text-secondary font-body mt-0.5">Manage staff across all departments</p>
        </div>
        <div className="flex gap-3">
          {/* Invite employee button */}
          <button className="h-10 px-4 bg-surface-container-lowest text-secondary rounded-xl font-label text-xs uppercase font-bold tracking-widest border border-outline-variant/30 hover:bg-surface-container-low transition-all shadow-sm">
            Invite Employee
          </button>
          {/* Add employee button */}
          <button className="h-10 px-6 gold-gradient rounded-xl font-label text-xs uppercase font-bold tracking-widest text-[#0B2D5E] shadow-sm hover:shadow-primary/30 transition-all">
            Add Employee
          </button>
        </div>
      </div>

      {/* Headcount KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {['Total Staff', 'Instructors', 'On Leave', 'New This Month'].map((label) => (
          <div key={label} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-6 shadow-sm hover:shadow-floating transition-shadow">
            <p className="text-[10px] text-secondary font-label uppercase tracking-widest font-bold mb-3">{label}</p>
            <div className="h-8 w-16 bg-surface-container-low rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Search + filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 w-full h-12 bg-surface-container-lowest border border-outline-variant/30 rounded-xl flex items-center px-4 gap-3 focus-within:border-primary transition-colors">
          <span className="material-symbols-outlined text-outline">search</span>
          <div className="h-4 w-40 bg-outline-variant/20 rounded" />
        </div>
        {/* role filter */}
        <div className="h-12 w-32 px-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl flex items-center justify-center text-secondary font-label text-xs uppercase tracking-widest font-bold cursor-pointer hover:bg-surface-container-low transition-colors">
          Role
        </div>
        {/* View toggle */}
        <div className="flex border border-outline-variant/30 rounded-xl overflow-hidden bg-surface-container-lowest shadow-sm h-12">
          {['Grid', 'List'].map((m) => (
            <button
              key={m}
              onClick={() => setView(m)}
              className={`px-4 py-2 font-label text-[10px] uppercase font-bold tracking-widest transition-colors ${
                view === m ? 'bg-primary/10 text-primary' : 'text-secondary hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[1.2rem]">{m === 'Grid' ? 'grid_view' : 'list'}</span>
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
            className={`px-4 py-2 rounded-full text-[10px] font-label uppercase font-bold tracking-widest transition-colors border ${
              department === d ? 'gold-gradient text-[#0B2D5E] border-primary shadow-sm' : 'bg-surface-container-lowest text-secondary border-outline-variant/30 hover:bg-surface-container-low'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Status sub-filter */}
      <div className="flex gap-2 pb-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-label font-bold uppercase tracking-widest border transition-colors ${
              status === s
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-outline-variant/30 text-secondary bg-surface-container-lowest hover:bg-surface-container-low'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Employee grid */}
      {view === 'Grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <a
              key={i}
              href={`/employees/${i + 1}`}
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm p-6 flex flex-col items-center text-center hover:shadow-floating hover:border-primary/50 transition-all cursor-pointer group"
            >
              {/* Avatar */}
              <div className="h-20 w-20 rounded-full bg-surface-container-low flex items-center justify-center text-secondary mb-4 group-hover:bg-primary/5 transition-colors">
                <span className="material-symbols-outlined text-3xl">person</span>
              </div>
              {/* Name */}
              <div className="h-5 w-32 bg-on-surface/10 rounded mb-1.5" />
              {/* Role */}
              <div className="h-4 w-24 bg-secondary/10 rounded mb-4" />
              {/* Department badge */}
              <div className="h-6 w-28 bg-[#0B2D5E]/5 rounded-full mb-4" />
              {/* Status + actions */}
              <div className="flex items-center gap-2">
                <div className="h-5 w-16 bg-green-500/10 rounded-full" />
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-6 py-4 border-b border-outline-variant/15 bg-surface-container-low/50 font-label text-[10px] font-bold text-secondary uppercase tracking-widest">
            <div className="col-span-4">Employee</div>
            <div className="col-span-2">Department</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Start Date</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1" />
          </div>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-3 px-6 py-4 border-b border-surface hover:bg-surface-container-low transition-colors items-center group cursor-pointer">
              <div className="col-span-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-surface-container-high flex items-center justify-center text-secondary group-hover:bg-primary/10 transition-colors flex-shrink-0">
                  <span className="material-symbols-outlined text-[1.2rem]">person</span>
                </div>
                <div className="space-y-1.5">
                  <div className="h-4 w-36 bg-on-surface/10 rounded" />
                  <div className="h-3 w-28 bg-secondary/20 rounded" />
                </div>
              </div>
              <div className="col-span-2"><div className="h-6 w-24 bg-[#0B2D5E]/5 rounded-full" /></div>
              <div className="col-span-2"><div className="h-4 w-24 bg-on-surface/5 rounded" /></div>
              <div className="col-span-2"><div className="h-4 w-20 bg-on-surface/5 rounded" /></div>
              <div className="col-span-1"><div className="h-6 w-16 bg-green-500/10 text-green-700 rounded-full flex items-center justify-center font-label font-bold text-[9px] uppercase tracking-widest">Active</div></div>
              <div className="col-span-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="h-8 w-8 bg-surface-container-highest rounded-lg flex items-center justify-center text-secondary hover:bg-primary/20 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[1rem]">chevron_right</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
