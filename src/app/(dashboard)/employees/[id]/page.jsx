'use client';

// Employees — Employee detail page
// Full profile: personal info, role/contract, assigned courses, attendance, and documents.

import { useState } from 'react';

const TABS = ['Profile', 'Schedule', 'Courses', 'Documents', 'Activity'];

export default function EmployeeDetailPage({ params }) {
  const [activeTab, setActiveTab] = useState('Profile');
  // TODO: const { data: employee } = useSWR(`/api/employees/${params.id}`)

  return (
    <div className="p-6 space-y-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <a href="/employees" className="hover:text-orange-500 transition-colors">Employees</a>
        <span>/</span>
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Profile header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="h-20 w-20 rounded-full bg-orange-100 flex-shrink-0" />

          <div className="flex-1 space-y-2">
            {/* Name */}
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
            {/* Role + department */}
            <div className="flex items-center gap-2">
              <div className="h-5 w-20 bg-orange-50 rounded-full" />
              <div className="h-5 w-28 bg-gray-100 rounded-full" />
            </div>
            {/* Contact info */}
            <div className="flex flex-wrap gap-4">
              <div className="h-4 w-36 bg-gray-100 rounded" />
              <div className="h-4 w-32 bg-gray-100 rounded" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-shrink-0">
            {/* TODO: Edit, Reset password, Deactivate */}
            <div className="h-9 w-24 bg-gray-100 rounded-lg" />
            <div className="h-9 w-9 bg-gray-100 rounded-lg" />
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100">
          {['Start Date', 'Employment Type', 'Courses Teaching', 'Attendance Rate'].map((label) => (
            <div key={label}>
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <div className="h-5 w-20 bg-gray-100 rounded mt-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">

        {activeTab === 'Profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">Personal Information</h3>
              {['Full Name', 'Email', 'Phone', 'Date of Birth', 'National ID / Passport', 'Address'].map((f) => (
                <div key={f}>
                  <p className="text-xs text-gray-400 mb-1">{f}</p>
                  <div className="h-9 bg-gray-50 border border-gray-200 rounded-lg" />
                </div>
              ))}
            </div>
            {/* Employment details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">Employment Details</h3>
              {['Employee ID', 'Department', 'Role / Title', 'Employment Type', 'Start Date', 'Salary / Rate'].map((f) => (
                <div key={f}>
                  <p className="text-xs text-gray-400 mb-1">{f}</p>
                  <div className="h-9 bg-gray-50 border border-gray-200 rounded-lg" />
                </div>
              ))}
              {/* TODO: Save changes button */}
              <div className="h-9 w-28 bg-orange-500 rounded-lg mt-2" />
            </div>
          </div>
        )}

        {activeTab === 'Schedule' && (
          // TODO: Weekly schedule / shift assignments
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <div key={d} className="text-center">
                  <p className="text-xs text-gray-400 font-medium mb-2">{d}</p>
                  <div className="space-y-1">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="h-10 bg-orange-50 border border-orange-100 rounded p-1">
                        <div className="h-2.5 w-full bg-orange-200 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Courses' && (
          // TODO: List of courses the employee is assigned to as instructor or assistant
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100">
                <div className="h-10 w-10 bg-orange-50 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-48 bg-gray-200 rounded" />
                  <div className="h-3 w-32 bg-gray-100 rounded" />
                </div>
                <div className="h-5 w-16 bg-green-100 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Documents' && (
          // TODO: Upload and manage employment documents (contract, ID, certificates)
          <div className="space-y-3">
            <div className="h-28 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center">
              <div className="text-center space-y-1">
                <div className="h-8 w-8 bg-gray-100 rounded-full mx-auto" />
                <p className="text-xs text-gray-400">Drop files here or click to upload</p>
              </div>
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                <div className="h-8 w-8 bg-blue-50 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-0.5">
                  <div className="h-4 w-40 bg-gray-200 rounded" />
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                </div>
                <div className="flex gap-1">
                  <div className="h-7 w-7 bg-gray-100 rounded" />
                  <div className="h-7 w-7 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Activity' && (
          // TODO: Audit log — logins, schedule changes, course assignments
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-orange-50 border border-orange-100 flex-shrink-0" />
                  {i < 5 && <div className="w-px flex-1 bg-gray-100 mt-1" />}
                </div>
                <div className="pb-4 space-y-0.5 flex-1">
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
