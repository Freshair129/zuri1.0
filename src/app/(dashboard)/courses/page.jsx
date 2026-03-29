'use client';

// Courses — Course list page
// Browse, search, and manage all culinary courses offered by the school.
// Supports draft / published / archived states.

import { useState } from 'react';

const VIEW_MODES = ['Grid', 'List'];
const STATUS_FILTERS = ['All', 'Published', 'Draft', 'Archived'];

export default function CoursesPage() {
  const [view, setView] = useState('Grid');
  const [statusFilter, setStatusFilter] = useState('All');

  return (
    <div className="p-6 space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create and manage your culinary programs</p>
        </div>
        {/* TODO: New course button → opens course builder */}
        <div className="h-9 w-32 bg-orange-500 rounded-lg" />
      </div>

      {/* TODO: Summary stats — Total courses, Active enrollments, Avg completion rate */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Total Courses', 'Active Enrollments', 'Avg Completion', 'Revenue MTD'].map((label) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <div className="h-7 w-16 bg-gray-100 rounded mt-2 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Toolbar: search + filters + view toggle */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-1 w-full">
          {/* TODO: search input */}
          <div className="flex-1 h-10 bg-white border border-gray-200 rounded-lg flex items-center px-3 gap-2">
            <div className="h-4 w-4 bg-gray-300 rounded-sm flex-shrink-0" />
            <div className="h-4 w-32 bg-gray-100 rounded" />
          </div>
          {/* TODO: category filter dropdown */}
          <div className="h-10 w-32 bg-white border border-gray-200 rounded-lg" />
        </div>

        {/* View mode toggle */}
        <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
          {VIEW_MODES.map((m) => (
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

      {/* Status pills */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              statusFilter === f
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Course cards grid */}
      {/* TODO: map over courses fetched from API, render CourseCard component */}
      <div className={view === 'Grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-3'}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Course thumbnail */}
            {view === 'Grid' && (
              <div className="h-40 bg-gradient-to-br from-orange-100 to-amber-50 w-full" />
            )}
            <div className="p-4 space-y-2">
              {/* Status badge */}
              <div className="flex items-center justify-between">
                <div className="h-5 w-16 bg-green-100 rounded-full" />
                {/* TODO: 3-dot menu */}
                <div className="h-5 w-5 bg-gray-100 rounded" />
              </div>
              {/* Course title */}
              <div className="h-5 w-3/4 bg-gray-200 rounded" />
              {/* Course meta: duration, level, seats */}
              <div className="flex gap-3">
                <div className="h-4 w-16 bg-gray-100 rounded" />
                <div className="h-4 w-16 bg-gray-100 rounded" />
                <div className="h-4 w-20 bg-gray-100 rounded" />
              </div>
              {/* Enrollment progress bar */}
              {/* TODO: (enrolled / capacity) */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <div className="h-3 w-20 bg-gray-100 rounded" />
                  <div className="h-3 w-12 bg-gray-100 rounded" />
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div className="h-1.5 bg-orange-400 rounded-full" style={{ width: `${30 + i * 10}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
